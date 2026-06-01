import { db } from '../firebase';
import {
  doc, runTransaction, serverTimestamp, setDoc, collection,
  addDoc, getDoc, query, orderBy, getDocs, limit, where,
} from 'firebase/firestore';

const PATIENT_SUGGESTION_LIMIT = 10;
const LINKED_PATIENTS_FETCH_LIMIT = 150;
const ADMIN_PATIENTS_FETCH_LIMIT = 100;

// ---------------------------------------------------------------------------
// Firestore payload sanitization (no undefined values)
// ---------------------------------------------------------------------------

export function removeUndefinedDeep(value) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (Array.isArray(value)) {
    return value
      .map((item) => removeUndefinedDeep(item))
      .filter((item) => item !== undefined);
  }
  if (typeof value === 'object' && value.constructor === Object) {
    const out = {};
    for (const [key, val] of Object.entries(value)) {
      if (val === undefined) continue;
      const cleaned = removeUndefinedDeep(val);
      if (cleaned !== undefined) out[key] = cleaned;
    }
    return out;
  }
  return value;
}

export function sanitizeForFirestore(data) {
  return removeUndefinedDeep(data) ?? {};
}

// ---------------------------------------------------------------------------
// Patient ID formatting
// ---------------------------------------------------------------------------

export function formatPatientId(firstName, lastName, birthYear, sequence) {
  const cleanStr = (s) => (s || '').replace(/[^a-zA-Z]/g, '').toUpperCase();

  let fn = cleanStr(firstName);
  fn = fn.length >= 2 ? fn.substring(0, 2) : fn.padEnd(2, 'X');

  let ln = cleanStr(lastName);
  ln = ln.length >= 2 ? ln.substring(0, 2) : ln.padEnd(2, 'X');

  const seqStr = sequence < 1000 ? String(sequence).padStart(3, '0') : String(sequence);

  return `${fn}-${ln}-${birthYear}-${seqStr}`;
}

// ---------------------------------------------------------------------------
// Access logs
// ---------------------------------------------------------------------------

export const addAccessLog = async (patientCode, doctorUid, doctorName, doctorEmail, action) => {
  try {
    const logRef = collection(db, 'patients', patientCode, 'accessLogs');
    await addDoc(logRef, {
      doctorUid,
      doctorName,
      doctorEmail,
      action,
      timestamp: serverTimestamp(),
    });
  } catch (err) {
    // Non-critical — log but don't throw
    console.error('[patientService] addAccessLog error:', err.code || err.message);
  }
};

// ---------------------------------------------------------------------------
// Patient shell creation (with Firestore transaction for safe counter)
// ---------------------------------------------------------------------------

export const createPatientShell = async (
  firstName, lastName, birthYear,
  doctorUid, doctorName, doctorEmail
) => {
  const counterRef = doc(db, 'counters', 'patients');

  let patientCode = '';
  let sequenceNumber = 0;

  await runTransaction(db, async (transaction) => {
    const counterDoc = await transaction.get(counterRef);

    if (!counterDoc.exists()) {
      // First ever patient — initialise counter
      transaction.set(counterRef, { nextNumber: 2 });
      sequenceNumber = 1;
    } else {
      sequenceNumber = counterDoc.data().nextNumber;
      transaction.update(counterRef, { nextNumber: sequenceNumber + 1 });
    }

    patientCode = formatPatientId(firstName, lastName, birthYear, sequenceNumber);

    const cleanStr = (s) => (s || '').replace(/[^a-zA-Z]/g, '').toUpperCase();
    let fn = cleanStr(firstName);
    fn = fn.length >= 2 ? fn.substring(0, 2) : fn.padEnd(2, 'X');
    let ln = cleanStr(lastName);
    ln = ln.length >= 2 ? ln.substring(0, 2) : ln.padEnd(2, 'X');

    const patientRef = doc(db, 'patients', patientCode);
    transaction.set(patientRef, {
      patientCode,
      firstName,
      lastName,
      initialFirstPart: fn,
      initialLastPart: ln,
      birthYear,
      sequenceNumber,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdByDoctorUid: doctorUid,
      createdByDoctorName: doctorName,
      linkedDoctorUids: [doctorUid],
      lastVisitAt: null,
    });
  });

  await addAccessLog(patientCode, doctorUid, doctorName, doctorEmail, 'patient_created');
  return patientCode;
};

// ---------------------------------------------------------------------------
// Fetch patient by code with access control
// ---------------------------------------------------------------------------

export const getPatientByCode = async (
  patientCode, doctorUid, doctorName, doctorEmail, isAdmin
) => {
  const patientRef = doc(db, 'patients', patientCode);
  const patientDoc = await getDoc(patientRef);

  if (!patientDoc.exists()) {
    return null; // Not found
  }

  const patientData = patientDoc.data();
  const isLinked = (patientData.linkedDoctorUids || []).includes(doctorUid);

  if (!isLinked && !isAdmin) {
    return {
      exists: true,
      accessDenied: true,
      message:
        'This patient exists, but your account is not linked to this patient record. ' +
        'Create a new encounter or request admin access according to clinic policy.',
    };
  }

  await addAccessLog(patientCode, doctorUid, doctorName, doctorEmail, 'patient_viewed');
  return { exists: true, data: { ...patientData, patientCode: patientData.patientCode || patientCode } };
};

// ---------------------------------------------------------------------------
// Patient ID autocomplete suggestions
// ---------------------------------------------------------------------------

export function normalizePatientCodeInput(input) {
  return (input || '').trim().toUpperCase();
}

export function isApprovedPortalUser(userProfile) {
  return (
    userProfile?.approved === true &&
    userProfile?.status === 'approved' &&
    (userProfile?.role === 'doctor' || userProfile?.role === 'admin')
  );
}

export function isPatientSearchPermissionError(err) {
  return err?.code === 'permission-denied';
}

function toPatientSuggestion(docSnap) {
  const data = docSnap.data();
  const code = data.patientCode || docSnap.id;
  return {
    patientCode: code,
    birthYear: data.birthYear ?? null,
    lastVisitAt: data.lastVisitAt ?? null,
    createdAt: data.createdAt ?? null,
    sequenceNumber: data.sequenceNumber ?? null,
  };
}

/**
 * Match patient codes by prefix, segment, sequence, or compact substring.
 * Examples: RU, NE, 2004, 003, 2004-003, RU-NE-2004-003
 */
export function patientCodeMatches(patientCode, input) {
  const code = String(patientCode || '').toUpperCase();
  const term = String(input || '').trim().toUpperCase();

  if (!term) return false;

  const compactCode = code.replace(/-/g, '');
  const compactTerm = term.replace(/-/g, '');
  const segments = code.split('-');

  return (
    code.startsWith(term) ||
    code.includes(term) ||
    compactCode.includes(compactTerm) ||
    code.endsWith(`-${term}`) ||
    segments.includes(term)
  );
}

function filterAndSortByMatch(suggestions, normalizedInput) {
  return suggestions
    .filter((s) => patientCodeMatches(s.patientCode, normalizedInput))
    .sort((a, b) => {
      const aCode = a.patientCode.toUpperCase();
      const bCode = b.patientCode.toUpperCase();
      const aStarts = aCode.startsWith(normalizedInput) ? 0 : 1;
      const bStarts = bCode.startsWith(normalizedInput) ? 0 : 1;
      if (aStarts !== bStarts) return aStarts - bStarts;
      return a.patientCode.localeCompare(b.patientCode);
    })
    .slice(0, PATIENT_SUGGESTION_LIMIT);
}

/** Firestore range query works for start-of-code prefixes (RU, RU-NE-2004). */
function shouldUsePrefixRangeQuery(term) {
  if (!term || /^\d/.test(term)) return false;
  if (term.length === 1) return /^[A-Z]$/.test(term);
  if (term.includes('-')) return true;
  if (/^[A-Z]{2}$/.test(term)) return true;
  return false;
}

async function fetchPatientsByPrefix(patientsRef, normalized) {
  const q = query(
    patientsRef,
    where('patientCode', '>=', normalized),
    where('patientCode', '<=', `${normalized}\uf8ff`),
    limit(ADMIN_PATIENTS_FETCH_LIMIT)
  );
  return getDocs(q);
}

async function fetchPatientsBatch(patientsRef) {
  const q = query(patientsRef, orderBy('patientCode'), limit(ADMIN_PATIENTS_FETCH_LIMIT));
  return getDocs(q);
}

function mergeSuggestionsIntoMap(map, snap) {
  snap.forEach((d) => {
    const suggestion = toPatientSuggestion(d);
    map.set(suggestion.patientCode, suggestion);
  });
}

/**
 * Prefix search for patient IDs. Admins use range query on patientCode;
 * doctors query linked patients then filter client-side.
 */
export async function searchPatientSuggestions(searchTerm, doctorUid, userProfile) {
  const normalized = normalizePatientCodeInput(searchTerm);
  if (!normalized || !doctorUid) return [];

  if (!isApprovedPortalUser(userProfile)) {
    return [];
  }

  const isAdmin =
    userProfile?.role === 'admin' &&
    userProfile?.approved === true &&
    userProfile?.status === 'approved';

  if (isAdmin) {
    const patientsRef = collection(db, 'patients');
    const merged = new Map();

    if (shouldUsePrefixRangeQuery(normalized)) {
      mergeSuggestionsIntoMap(merged, await fetchPatientsByPrefix(patientsRef, normalized));
    }

    // Numeric / middle-segment / 2-letter LN (e.g. NE, 003, 2004) — prefix range misses these
    if (!shouldUsePrefixRangeQuery(normalized) || /^[A-Z]{2}$/.test(normalized) || /^\d/.test(normalized)) {
      mergeSuggestionsIntoMap(merged, await fetchPatientsBatch(patientsRef));
    }

    return filterAndSortByMatch([...merged.values()], normalized);
  }

  const patientsRef = collection(db, 'patients');
  const q = query(
    patientsRef,
    where('linkedDoctorUids', 'array-contains', doctorUid),
    limit(LINKED_PATIENTS_FETCH_LIMIT)
  );
  const snap = await getDocs(q);
  const all = [];
  snap.forEach((d) => all.push(toPatientSuggestion(d)));
  return filterAndSortByMatch(all, normalized);
}

// ---------------------------------------------------------------------------
// Research row creation (behind the scenes — called from saveEncounterReport)
// ---------------------------------------------------------------------------

// researchDataset/data/rows/{rowId} — anonymised research rows (admin export only)
const RESEARCH_ROWS_COL = () => collection(db, 'researchDataset', 'data', 'rows');

const saveResearchRow = async (
  patientCode, encounterId, birthYear,
  doctorUid, doctorName,
  encounterData
) => {
  try {
    const rowDocRef = doc(RESEARCH_ROWS_COL());

    const row = sanitizeForFirestore({
      rowId: rowDocRef.id,
      patientCode,
      researchPatientRef: patientCode,
      encounterId,
      doctorUid,
      doctorName,
      birthYear: birthYear ?? null,
      redFlagsPresent: !!(encounterData.redFlagsSummary && encounterData.redFlagsSummary !== 'None'),
      redFlagsSummary: encounterData.redFlagsSummary || 'None',
      fresshScore: encounterData.fresshScore ?? 0,
      diagnosisSupportSummary: encounterData.diagnosisReviewSummary || '',
      headacheFrequencySummary: encounterData.headacheFrequencySummary || '',
      medicineUseSummary: encounterData.medicineUseSummary || '',
      reportGeneratedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    });

    await setDoc(rowDocRef, row);
    return rowDocRef.id;
  } catch (err) {
    if (import.meta.env.DEV) {
      console.error('[patientService] saveResearchRow error:', err.code || err.message);
    }
    return null;
  }
};

// ---------------------------------------------------------------------------
// Save encounter report
// ---------------------------------------------------------------------------

export const saveEncounterReport = async (
  patientCode, doctorUid, doctorName, doctorEmail, encounterData
) => {
  // 1. Save encounter document
  const encounterRef = collection(db, 'patients', patientCode, 'encounters');
  const encounterPayload = sanitizeForFirestore({
    patientCode,
    doctorUid,
    doctorName,
    doctorEmail,
    visitDate: new Date().toISOString().slice(0, 10),
    patientSummaryReport: encounterData.patientSummaryReport || '',
    doctorClinicalReport: encounterData.doctorClinicalReport || '',
    redFlagsSummary: encounterData.redFlagsSummary || 'None',
    diagnosisReviewSummary: encounterData.diagnosisReviewSummary || '',
    fresshScore: encounterData.fresshScore ?? 0,
    reportGeneratedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const newDoc = await addDoc(encounterRef, encounterPayload);

  // 2. Ensure doctor is linked to patient
  const patientRef = doc(db, 'patients', patientCode);
  const patientDoc = await getDoc(patientRef);
  if (patientDoc.exists()) {
    const pData = patientDoc.data();
    const linked = pData.linkedDoctorUids || [];
    if (!linked.includes(doctorUid)) {
      await setDoc(
        patientRef,
        { linkedDoctorUids: [...linked, doctorUid], updatedAt: serverTimestamp() },
        { merge: true }
      );
    }
    // 3. Save research row (uses patient birthYear)
    await saveResearchRow(
      patientCode,
      newDoc.id,
      pData.birthYear,
      doctorUid,
      doctorName,
      encounterData
    );
  }

  // 4. Access log entries
  await addAccessLog(patientCode, doctorUid, doctorName, doctorEmail, 'encounter_created');
  await addAccessLog(patientCode, doctorUid, doctorName, doctorEmail, 'report_saved');
  await addAccessLog(patientCode, doctorUid, doctorName, doctorEmail, 'research_row_created');

  return newDoc.id;
};

// ---------------------------------------------------------------------------
// Fetch encounters for a patient
// ---------------------------------------------------------------------------

export const getEncountersForPatient = async (
  patientCode, doctorUid, doctorName, doctorEmail, isAdmin = false
) => {
  const patientRef = doc(db, 'patients', patientCode);
  const patientDoc = await getDoc(patientRef);

  if (!patientDoc.exists()) {
    return [];
  }

  const patientData = patientDoc.data();
  const isLinked = (patientData.linkedDoctorUids || []).includes(doctorUid);
  if (!isLinked && !isAdmin) {
    return [];
  }

  const encsRef = collection(db, 'patients', patientCode, 'encounters');
  const q = query(encsRef, orderBy('createdAt', 'desc'));
  const encsSnap = await getDocs(q);

  const encounters = [];
  encsSnap.forEach((d) => encounters.push({ id: d.id, ...d.data() }));

  if (encounters.length > 0) {
    await addAccessLog(patientCode, doctorUid, doctorName, doctorEmail, 'report_viewed');
  }

  return encounters;
};

// ---------------------------------------------------------------------------
// Admin research dataset
// ---------------------------------------------------------------------------

export const getResearchRows = async (maxRows = 200, startDate = null) => {
  const rowsRef = RESEARCH_ROWS_COL();
  const q = query(rowsRef, orderBy('createdAt', 'desc'), limit(maxRows));
  const snap = await getDocs(q);
  const rows = [];
  snap.forEach((d) => rows.push({ id: d.id, ...d.data() }));

  if (!startDate) return rows;

  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const startMs = start.getTime();

  return rows.filter((row) => {
    const ms = row.createdAt?.seconds
      ? row.createdAt.seconds * 1000
      : row.createdAt
      ? new Date(row.createdAt).getTime()
      : 0;
    return ms >= startMs;
  });
};

export const logAdminAuditAction = async (adminUid, adminName, adminEmail, action) => {
  try {
    await addDoc(collection(db, 'auditLogs'), {
      adminUid,
      adminName,
      adminEmail,
      action,
      timestamp: serverTimestamp(),
    });
  } catch (err) {
    if (import.meta.env.DEV) {
      console.error('[patientService] logAdminAuditAction error:', err.code || err.message);
    }
  }
};

const RESEARCH_CSV_COLUMNS = [
  'rowId',
  'patientCode',
  'encounterId',
  'doctorUid',
  'doctorName',
  'birthYear',
  'redFlagsPresent',
  'redFlagsSummary',
  'fresshScore',
  'headacheFrequencySummary',
  'medicineUseSummary',
  'diagnosisSupportSummary',
  'reportGeneratedAt',
  'createdAt',
];

const escapeCsv = (val) => {
  const s = val == null ? '' : String(val);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
};

const formatTs = (val) => {
  if (!val) return '';
  if (val?.seconds) return new Date(val.seconds * 1000).toISOString();
  try {
    return new Date(val).toISOString();
  } catch {
    return String(val);
  }
};

export const buildResearchCsv = (rows) => {
  const header = RESEARCH_CSV_COLUMNS.join(',');
  const lines = rows.map((row) =>
    RESEARCH_CSV_COLUMNS.map((col) => {
      if (col === 'reportGeneratedAt' || col === 'createdAt') {
        return escapeCsv(formatTs(row[col]));
      }
      return escapeCsv(row[col]);
    }).join(',')
  );
  return [header, ...lines].join('\n');
};

export const downloadResearchCsv = (csvContent, filename) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
