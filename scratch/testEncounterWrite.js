import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDoc, getDocs, doc, serverTimestamp } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";
import dotenv from "dotenv";

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "beat-headache",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

console.log("Initializing Firebase App for Project:", firebaseConfig.projectId);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function testEncounterCreation() {
  const patientCode = "DS-TS-2000-062";
  const collectionPath = `patients/${patientCode}/encounters`;
  
  console.log("\n====================================================");
  console.log("PROVE ENCOUNTER CREATION TEST");
  console.log("Firebase Project ID:", db.app.options.projectId);
  console.log("Patient Code:", patientCode);
  console.log("Target Subcollection Path:", collectionPath);
  console.log("====================================================\n");

  // Attempt anonymous authentication to get a valid request.auth context if needed
  try {
    console.log("Attempting Firebase Auth sign in...");
    const userCred = await signInAnonymously(auth);
    console.log("Auth sign-in successful. UID =", userCred.user.uid);
  } catch (authErr) {
    console.log("Auth sign-in note:", authErr.message);
  }

  const encounterPayload = {
    patientCode,
    doctorUid: auth.currentUser?.uid || "test-doctor-uid",
    doctorName: "Dr. Test Doctor",
    doctorEmail: "testdoctor@beatheadache.local",
    visitDate: new Date().toISOString().slice(0, 10),
    visitType: "Follow-up Visit",
    encounterType: "followup",
    patientSummaryReport: "Follow-up assessment for headache progression.",
    doctorClinicalReport: "Diagnosis: Tension-type headache features. Plan: Continue lifestyle advice.",
    redFlagsSummary: "None",
    diagnosisReviewSummary: "Tension-type headache features",
    fresshScore: 48,
    fresshDetails: { Food: 8, Relaxation: 8, Exercise: 8, Sleep: 8, ScreenTime: 8, Hydration: 8 },
    diagnosis: "Tension-type headache features",
    doctor: "Dr. Test Doctor",
    date: new Date().toISOString().slice(0, 10),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  let newDocRef;
  try {
    console.log("1. Executing addDoc to", collectionPath, "...");
    const encountersColRef = collection(db, "patients", patientCode, "encounters");
    newDocRef = await addDoc(encountersColRef, encounterPayload);

    console.log("SUCCESS: Document Created!");
    console.log("   - Document ID:", newDocRef.id);
    console.log("   - Full Firestore path:", newDocRef.path);
  } catch (err) {
    console.error("FAILURE: addDoc threw an exception!");
    console.error("   - Code:", err.code);
    console.error("   - Message:", err.message);
    console.error("   - Full Error:", err);
    process.exit(1);
  }

  // 2. Perform getDoc(newDocRef)
  try {
    console.log("\n2. Immediately performing getDoc(newDocRef)...");
    const docSnap = await getDoc(newDocRef);
    console.log("   - exists():", docSnap.exists());
    console.log("   - path:", docSnap.ref.path);
    if (docSnap.exists()) {
      console.log("   - document data:", JSON.stringify(docSnap.data(), null, 2));
    } else {
      console.error("EXPLANATION: getDoc returned false. Document was not found immediately after creation.");
    }
  } catch (err) {
    console.error("ERROR performing getDoc:", err.message);
  }

  // 3. Query patients/{patientCode}/encounters
  try {
    console.log("\n3. Immediately querying subcollection:", collectionPath, "...");
    const qSnap = await getDocs(collection(db, "patients", patientCode, "encounters"));
    console.log("   - Number of documents after save:", qSnap.size);
    console.log("   - Every document ID:", qSnap.docs.map((d) => d.id));

    if (qSnap.size === 0) {
      console.error("EXPLANATION: Query returned 0 documents.");
    }
  } catch (err) {
    console.error("ERROR querying subcollection:", err.message);
  }

  console.log("\n====================================================");
  console.log("TEST COMPLETED");
  console.log("====================================================\n");
}

testEncounterCreation();
