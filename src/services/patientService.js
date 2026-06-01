import { db } from '../firebase';
import {
  doc, runTransaction, serverTimestamp, setDoc, collection,
  addDoc, getDoc, query, orderBy, getDocs, limit,
} from 'firebase/firestore';

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
  return { exists: true, data: patientData };
};

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

    const row = {
      rowId: rowDocRef.id,
      patientCode,
      researchPatientRef: patientCode,
      encounterId,
      doctorUid,
      doctorName,
      birthYear: birthYear || null,
      redFlagsPresent: !!(encounterData.redFlagsSummary && encounterData.redFlagsSummary !== 'None'),
      redFlagsSummary: encounterData.redFlagsSummary || 'None',
      fresshScore: encounterData.fresshScore || 0,
      diagnosisSupportSummary: encounterData.diagnosisReviewSummary || '',
      headacheFrequencySummary: encounterData.headacheFrequencySummary || '',
      medicineUseSummary: encounterData.medicineUseSummary || '',
      reportGeneratedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    };

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
  const newDoc = await addDoc(encounterRef, {
    patientCode,
    doctorUid,
    doctorName,
    doctorEmail,
    visitDate: new Date().toISOString().slice(0, 10),
    // Clinical summaries — no raw personal data
    patientSummaryReport: encounterData.patientSummaryReport || '',
    doctorClinicalReport: encounterData.doctorClinicalReport || '',
    redFlagsSummary: encounterData.redFlagsSummary || 'None',
    diagnosisReviewSummary: encounterData.diagnosisReviewSummary || '',
    fresshScore: encounterData.fresshScore || 0,
    reportGeneratedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

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
