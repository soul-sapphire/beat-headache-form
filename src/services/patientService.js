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

  const getLetters = (str) => {
    const s = cleanStr(str);
    if (s.length >= 3) return s[0] + s[2];
    if (s.length >= 2) return s[0] + s[1];
    if (s.length === 1) return s[0] + 'X';
    return 'XX';
  };

  const fn = getLetters(firstName);
  const ln = getLetters(lastName);

  const seqStr = sequence < 1000 ? String(sequence).padStart(3, '0') : String(sequence);

  return `${fn}-${ln}-${birthYear}-${seqStr}`;
}

// ---------------------------------------------------------------------------
// Access logs
// ---------------------------------------------------------------------------

export const addAccessLog = async (patientCode, doctorUid, doctorName, doctorEmail, action) => {
  try {
    console.log(`[patientService] addAccessLog START - action: ${action}, patientCode: ${patientCode}`);
    const logRef = collection(db, 'patients', patientCode, 'accessLogs');
    await addDoc(logRef, {
      doctorUid,
      doctorName,
      doctorEmail,
      action,
      timestamp: serverTimestamp(),
    });
    console.log(`[patientService] addAccessLog SUCCESS - action: ${action}`);
  } catch (err) {
    // Non-critical — log but don't throw
    console.error('[patientService] addAccessLog error:', err.code || err.message);
  }
};

// ---------------------------------------------------------------------------
// Patient shell creation (with Firestore transaction for safe counter)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Secure QR Token generation
// ---------------------------------------------------------------------------

export function generateQrToken() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `pt_${hex}`;
}

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
  let qrToken = generateQrToken();

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
    const getLetters = (str) => {
      const s = cleanStr(str);
      if (s.length >= 3) return s[0] + s[2];
      if (s.length >= 2) return s[0] + s[1];
      if (s.length === 1) return s[0] + 'X';
      return 'XX';
    };
    const fn = getLetters(firstName);
    const ln = getLetters(lastName);

    const patientRef = doc(db, 'patients', patientCode);
    transaction.set(patientRef, {
      patientCode,
      qrToken,
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
  return { patientCode, qrToken };
};

// ---------------------------------------------------------------------------
// Fetch patient by code with access control
// ---------------------------------------------------------------------------

export const getPatientByCode = async (
  patientCode, doctorUid, doctorName, doctorEmail, isAdmin
) => {
  console.log(`[patientService] getPatientByCode START for code: ${patientCode}, doctorUid: ${doctorUid}`);
  const patientRef = doc(db, 'patients', patientCode);
  console.log(`[patientService] getPatientByCode calling getDoc(patientRef)...`);
  const patientDoc = await getDoc(patientRef);
  console.log(`[patientService] getPatientByCode getDoc finished. exists = ${patientDoc.exists()}`);

  if (!patientDoc.exists()) {
    console.log(`[patientService] getPatientByCode patientDoc does NOT exist.`);
    return null; // Not found
  }

  const patientData = patientDoc.data();
  const isLinked = (patientData.linkedDoctorUids || []).includes(doctorUid);
  console.log(`[patientService] getPatientByCode isLinked = ${isLinked}, isAdmin = ${isAdmin}`);

  if (!isLinked && !isAdmin) {
    console.log(`[patientService] getPatientByCode ACCESS DENIED.`);
    return {
      exists: true,
      accessDenied: true,
      message:
        'This patient exists, but your account is not linked to this patient record. ' +
        'Create a new encounter or request admin access according to clinic policy.',
    };
  }

  // Auto-backfill qrToken if missing on existing patient record
  let activeQrToken = patientData.qrToken;
  if (!activeQrToken) {
    activeQrToken = generateQrToken();
    try {
      console.log(`[patientService] getPatientByCode backfilling qrToken...`);
      await setDoc(patientRef, { qrToken: activeQrToken, updatedAt: serverTimestamp() }, { merge: true });
      console.log(`[patientService] getPatientByCode backfilled qrToken success.`);
    } catch (e) {
      console.error('[patientService] Backfill error:', e);
    }
  }

  // Non-blocking access log — do NOT await so patient load is never blocked
  addAccessLog(patientCode, doctorUid, doctorName, doctorEmail, 'patient_viewed').catch((err) => {
    console.error('[patientService] Non-blocking addAccessLog error (patient_viewed):', err?.message || err);
  });
  console.log(`[patientService] getPatientByCode returning patient data immediately.`);
  return {
    exists: true,
    data: {
      ...patientData,
      patientCode: patientData.patientCode || patientCode,
      qrToken: activeQrToken,
    },
  };
};

// ---------------------------------------------------------------------------
// Fetch patient by secure QR token with access control
// ---------------------------------------------------------------------------

export const getPatientByQrToken = async (
  qrToken, doctorUid, doctorName, doctorEmail, isAdmin = false
) => {
  if (!qrToken) return null;

  const patientsRef = collection(db, 'patients');
  const q = query(patientsRef, where('qrToken', '==', qrToken), limit(1));
  const snap = await getDocs(q);

  if (snap.empty) {
    return null; // Not found
  }

  const docSnap = snap.docs[0];
  const patientData = docSnap.data();
  const patientCode = patientData.patientCode || docSnap.id;
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

  // Non-blocking access log — do NOT await so QR navigation is never blocked
  addAccessLog(patientCode, doctorUid, doctorName, doctorEmail, 'qr_scanned').catch((err) => {
    console.error('[patientService] Non-blocking addAccessLog error (qr_scanned):', err?.message || err);
  });
  console.log(`[patientService] getPatientByQrToken returning patient data immediately.`);
  return {
    exists: true,
    data: {
      ...patientData,
      patientCode,
      qrToken: patientData.qrToken || qrToken,
    },
  };
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
    visitDate: encounterData.visitDate || new Date().toISOString().slice(0, 10),
    visitType: encounterData.visitType || 'Follow-up',
    patientSummaryReport: encounterData.patientSummaryReport || '',
    doctorClinicalReport: encounterData.doctorClinicalReport || '',
    redFlagsSummary: encounterData.redFlagsSummary || 'None',
    diagnosisReviewSummary: encounterData.diagnosisReviewSummary || '',
    fresshScore: encounterData.fresshScore ?? 0,
    fresshDetails: encounterData.fresshDetails || {},
    symptomsSummary: encounterData.symptomsSummary || '',
    managementPlan: encounterData.managementPlan || '',
    doctorNotes: encounterData.doctorNotes || '',
    reportGeneratedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const newDoc = await addDoc(encounterRef, encounterPayload);

  // 2. Ensure doctor is linked to patient & update latest stats
  const patientRef = doc(db, 'patients', patientCode);
  const patientDoc = await getDoc(patientRef);
  if (patientDoc.exists()) {
    const pData = patientDoc.data();
    const linked = pData.linkedDoctorUids || [];
    const updatePayload = {
      updatedAt: serverTimestamp(),
      lastVisitAt: serverTimestamp(),
      latestDiagnosis: encounterData.diagnosisReviewSummary || pData.latestDiagnosis || '',
      latestFresshScore: encounterData.fresshScore ?? pData.latestFresshScore ?? 0,
    };

    if (!linked.includes(doctorUid)) {
      updatePayload.linkedDoctorUids = [...linked, doctorUid];
    }

    await setDoc(patientRef, updatePayload, { merge: true });

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
  console.log(`[patientService] getEncountersForPatient START for code: ${patientCode}`);
  const patientRef = doc(db, 'patients', patientCode);
  console.log(`[patientService] getEncountersForPatient fetching patientDoc...`);
  const patientDoc = await getDoc(patientRef);
  console.log(`[patientService] getEncountersForPatient patientDoc fetched. exists = ${patientDoc.exists()}`);

  if (!patientDoc.exists()) {
    console.log(`[patientService] getEncountersForPatient patientDoc does NOT exist. Returning empty array.`);
    return [];
  }

  const patientData = patientDoc.data();
  const isLinked = (patientData.linkedDoctorUids || []).includes(doctorUid);
  console.log(`[patientService] getEncountersForPatient isLinked = ${isLinked}, isAdmin = ${isAdmin}`);
  if (!isLinked && !isAdmin) {
    console.log(`[patientService] getEncountersForPatient not linked & not admin. Returning empty array.`);
    return [];
  }

  const encsRef = collection(db, 'patients', patientCode, 'encounters');
  console.log(`[patientService] getEncountersForPatient building query...`);
  const q = query(encsRef, orderBy('createdAt', 'desc'));
  console.log(`[patientService] getEncountersForPatient calling getDocs(q)...`);
  const encsSnap = await getDocs(q);
  console.log(`[patientService] getEncountersForPatient getDocs(q) returned. size = ${encsSnap.size}`);

  const encounters = [];
  encsSnap.forEach((d) => encounters.push({ id: d.id, ...d.data() }));

  if (encounters.length > 0) {
    // Non-blocking access log — do NOT await so encounters load is never blocked
    addAccessLog(patientCode, doctorUid, doctorName, doctorEmail, 'report_viewed').catch((err) => {
      console.error('[patientService] Non-blocking addAccessLog error (report_viewed):', err?.message || err);
    });
  }

  console.log(`[patientService] getEncountersForPatient returning ${encounters.length} encounters.`);
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
