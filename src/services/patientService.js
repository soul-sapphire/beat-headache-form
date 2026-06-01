import { db } from '../firebase';
import { doc, runTransaction, serverTimestamp, setDoc, collection, addDoc, getDoc, query, where, getDocs, orderBy } from 'firebase/firestore';

export function formatPatientId(firstName, lastName, birthYear, sequence) {
  const cleanStr = (s) => (s || '').replace(/[^a-zA-Z]/g, '').toUpperCase();
  let fn = cleanStr(firstName);
  fn = fn.length >= 2 ? fn.substring(0, 2) : fn.padEnd(2, 'X');
  
  let ln = cleanStr(lastName);
  ln = ln.length >= 2 ? ln.substring(0, 2) : ln.padEnd(2, 'X');
  
  const seqStr = sequence < 1000 ? String(sequence).padStart(3, '0') : String(sequence);
  
  return `${fn}-${ln}-${birthYear}-${seqStr}`;
}

export const addAccessLog = async (patientCode, doctorUid, doctorName, doctorEmail, action) => {
  const logRef = collection(db, 'patients', patientCode, 'accessLogs');
  await addDoc(logRef, {
    doctorUid,
    doctorName,
    doctorEmail,
    action,
    timestamp: serverTimestamp()
  });
};

export const createPatientShell = async (firstName, lastName, birthYear, doctorUid, doctorName, doctorEmail) => {
  const counterRef = doc(db, 'counters', 'patients');
  
  let patientCode = '';
  let sequenceNumber = 0;
  
  await runTransaction(db, async (transaction) => {
    const counterDoc = await transaction.get(counterRef);
    if (!counterDoc.exists()) {
      transaction.set(counterRef, { nextNumber: 2 });
      sequenceNumber = 1;
    } else {
      sequenceNumber = counterDoc.data().nextNumber;
      transaction.update(counterRef, { nextNumber: sequenceNumber + 1 });
    }
    
    patientCode = formatPatientId(firstName, lastName, birthYear, sequenceNumber);
    const patientRef = doc(db, 'patients', patientCode);
    
    const cleanStr = (s) => (s || '').replace(/[^a-zA-Z]/g, '').toUpperCase();
    let fn = cleanStr(firstName);
    fn = fn.length >= 2 ? fn.substring(0, 2) : fn.padEnd(2, 'X');
    let ln = cleanStr(lastName);
    ln = ln.length >= 2 ? ln.substring(0, 2) : ln.padEnd(2, 'X');
    
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

export const getPatientByCode = async (patientCode, doctorUid, doctorName, doctorEmail, isAdmin) => {
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
      message: "This patient exists, but your account is not linked to this patient record. Create a new encounter or request admin access according to clinic policy." 
    };
  }
  
  await addAccessLog(patientCode, doctorUid, doctorName, doctorEmail, 'patient_viewed');
  return { exists: true, data: patientData };
};

export const saveEncounterReport = async (patientCode, doctorUid, doctorName, doctorEmail, encounterData) => {
  // encounterData contains: patientSummaryReport, doctorClinicalReport, redFlagsSummary, diagnosisReviewSummary, fresshScore
  const encounterRef = collection(db, 'patients', patientCode, 'encounters');
  
  // Create encounter
  await addDoc(encounterRef, {
    patientCode,
    doctorUid,
    doctorName,
    doctorEmail,
    visitDate: new Date().toISOString().slice(0, 10),
    ...encounterData,
    reportGeneratedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  // Ensure doctor is linked to patient
  const patientRef = doc(db, 'patients', patientCode);
  const patientDoc = await getDoc(patientRef);
  if (patientDoc.exists()) {
    const pData = patientDoc.data();
    let linked = pData.linkedDoctorUids || [];
    if (!linked.includes(doctorUid)) {
      linked.push(doctorUid);
      await setDoc(patientRef, { linkedDoctorUids: linked, updatedAt: serverTimestamp() }, { merge: true });
    }
  }

  await addAccessLog(patientCode, doctorUid, doctorName, doctorEmail, 'encounter_created');
  await addAccessLog(patientCode, doctorUid, doctorName, doctorEmail, 'report_saved');
};

export const getEncountersForPatient = async (patientCode, doctorUid, doctorName, doctorEmail) => {
  const encsRef = collection(db, 'patients', patientCode, 'encounters');
  const q = query(encsRef, orderBy('createdAt', 'desc'));
  const encsSnap = await getDocs(q);
  
  const encounters = [];
  encsSnap.forEach(doc => {
    encounters.push({ id: doc.id, ...doc.data() });
  });

  if (encounters.length > 0) {
    await addAccessLog(patientCode, doctorUid, doctorName, doctorEmail, 'report_viewed');
  }

  return encounters;
};
