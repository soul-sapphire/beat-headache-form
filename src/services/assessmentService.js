/**
 * assessmentService.js
 * --------------------
 * Firestore service layer for Beat Headache Public Self-Assessments & Digital Passports.
 * Manages publicAssessments collection, assessment history appending, and clinic linking.
 */

import { db } from "../firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion
} from "firebase/firestore";

// Helper: Generate unique Assessment ID (BH-HA-XXXXXX)
export function generateAssessmentId() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "BH-HA-";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Helper: Calculate Headache Burden & Mini FRESSH Scores
export function calculateAssessmentScores(formData) {
  const painSeverity = Number(formData.painSeverity) || 0; // 0-10
  const frequencyDays = Number(formData.frequencyDays) || 0; // days/month
  const symptomsCount = (formData.symptoms || []).length;
  const triggersCount = (formData.triggers || []).length;

  // Headache Burden Score (0-60 scale)
  const burdenFromPain = painSeverity * 2.5; // max 25
  const burdenFromFreq = Math.min(frequencyDays * 1.2, 20); // max 20
  const burdenFromSym = Math.min(symptomsCount * 2.5, 10); // max 10
  const burdenFromTrig = Math.min(triggersCount * 1.25, 5); // max 5
  
  const headacheScore = Math.min(Math.round(burdenFromPain + burdenFromFreq + burdenFromSym + burdenFromTrig), 60);

  // Mini FRESSH Lifestyle Score (0-60 scale: 6 domains 0-10 each)
  const foodScore = Number(formData.foodScore) || 5;
  const sleepScore = Number(formData.sleepScore) || 5;
  const exerciseScore = Number(formData.exerciseScore) || 5;
  const hydrationScore = Number(formData.hydrationScore) || 5;
  const screenTimeScore = Number(formData.screenTimeScore) || 5;
  const relaxationScore = Number(formData.relaxationScore) || 5;

  const fresshScore = foodScore + sleepScore + exerciseScore + hydrationScore + screenTimeScore + relaxationScore;

  // Red Flags Check
  const redFlags = [];
  if (formData.worstHeadacheEver) redFlags.push("Worst headache ever experienced");
  if (formData.suddenOnset) redFlags.push("Thunderclap / sudden onset (<1 min)");
  if (formData.neurologicalDeficit) redFlags.push("Focal neurological weakness or paralysis");
  if (formData.seizures) redFlags.push("New onset seizures");
  if (formData.visionLoss) redFlags.push("Sudden vision loss or double vision");
  if (formData.persistentVomiting) redFlags.push("Persistent projectile vomiting");
  if (formData.recentHeadInjury) redFlags.push("Recent head trauma or injury");
  if (formData.feverStiffNeck) redFlags.push("High fever with neck stiffness");
  if (formData.cancerHistory) redFlags.push("History of cancer or immunosuppression");

  // Determine Severity Level
  let severity = "Low";
  let color = "Green";

  if (redFlags.length > 0) {
    severity = "Emergency Red Flag";
    color = "Red";
  } else if (headacheScore >= 48) {
    severity = "Very High Burden";
    color = "Red";
  } else if (headacheScore >= 36) {
    severity = "High Burden";
    color = "Orange";
  } else if (headacheScore >= 24) {
    severity = "Moderate Burden";
    color = "Yellow";
  } else {
    severity = "Low Burden";
    color = "Green";
  }

  // Generate Personalized Recommendations
  const recommendations = [];
  if (redFlags.length > 0) {
    recommendations.push("EMERGENCY: Seek immediate medical evaluation at an Emergency Department.");
  } else {
    if (hydrationScore < 6) recommendations.push("Hydration: Increase daily fluid intake to 2.5–3.0L water.");
    if (sleepScore < 6) recommendations.push("Sleep: Maintain a fixed bedtime schedule and limit blue light.");
    if (exerciseScore < 6) recommendations.push("Exercise: Target 30 minutes of low-impact aerobic activity 3x weekly.");
    if (screenTimeScore < 6) recommendations.push("Screen Time: Implement 20-20-20 screen rest breaks.");
    if (headacheScore >= 36) recommendations.push("Clinic Consultation: Book a specialist evaluation at Beat Headache Clinic.");
  }

  return {
    headacheScore,
    fresshScore,
    lifestyleDetails: {
      foodScore,
      sleepScore,
      exerciseScore,
      hydrationScore,
      screenTimeScore,
      relaxationScore,
    },
    redFlags,
    severity,
    color,
    recommendations,
  };
}

// 1. Create Initial Public Assessment Document
export async function createPublicAssessment(formData) {
  const assessmentId = generateAssessmentId();
  const scores = calculateAssessmentScores(formData);
  const timestamp = new Date().toISOString();

  const initialEntry = {
    assessmentDate: timestamp,
    headacheScore: scores.headacheScore,
    fresshScore: scores.fresshScore,
    lifestyleDetails: scores.lifestyleDetails,
    severity: scores.severity,
    color: scores.color,
    redFlags: scores.redFlags,
    recommendations: scores.recommendations,
    painSeverity: formData.painSeverity || 5,
    frequencyDays: formData.frequencyDays || 0,
    durationHours: formData.durationHours || "1-4 hours",
    location: formData.location || "Both sides",
    symptoms: formData.symptoms || [],
    triggers: formData.triggers || [],
  };

  const documentPayload = {
    assessmentId,
    createdAt: timestamp,
    updatedAt: timestamp,
    firstName: formData.firstName || "Anonymous User",
    age: formData.age || "Not specified",
    gender: formData.gender || "Not specified",
    country: formData.country || "Not specified",
    email: formData.email || "",
    wantsEmail: Boolean(formData.wantsEmail),
    consentAgreed: true,
    consentTimestamp: timestamp,
    emailSent: false,
    emailSentAt: null,
    deliveryStatus: formData.email ? "pending" : "none",
    latestHeadacheScore: scores.headacheScore,
    latestFresshScore: scores.fresshScore,
    latestSeverity: scores.severity,
    isLinked: false,
    linkedPatientCode: null,
    assessmentHistory: [initialEntry],
  };

  const docRef = doc(db, "publicAssessments", assessmentId);
  await setDoc(docRef, documentPayload);

  return {
    assessmentId,
    ...documentPayload,
  };
}

// 2. Fetch Public Assessment by Assessment ID
export async function getPublicAssessment(assessmentId) {
  if (!assessmentId) return null;
  const docRef = doc(db, "publicAssessments", assessmentId.toUpperCase().trim());
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  return snap.data();
}

// 3. Append Reassessment Entry to Existing Document
export async function appendReassessment(assessmentId, formData) {
  const docRef = doc(db, "publicAssessments", assessmentId);
  const scores = calculateAssessmentScores(formData);
  const timestamp = new Date().toISOString();

  const newEntry = {
    assessmentDate: timestamp,
    headacheScore: scores.headacheScore,
    fresshScore: scores.fresshScore,
    lifestyleDetails: scores.lifestyleDetails,
    severity: scores.severity,
    color: scores.color,
    redFlags: scores.redFlags,
    recommendations: scores.recommendations,
    painSeverity: formData.painSeverity || 5,
    frequencyDays: formData.frequencyDays || 0,
    durationHours: formData.durationHours || "1-4 hours",
    location: formData.location || "Both sides",
    symptoms: formData.symptoms || [],
    triggers: formData.triggers || [],
  };

  await updateDoc(docRef, {
    updatedAt: timestamp,
    latestHeadacheScore: scores.headacheScore,
    latestFresshScore: scores.fresshScore,
    latestSeverity: scores.severity,
    assessmentHistory: arrayUnion(newEntry),
  });

  return newEntry;
}

// 4. Link Public Assessment to Official Patient EMR
export async function linkAssessmentToPatient(assessmentId, patientCode) {
  const docRef = doc(db, "publicAssessments", assessmentId);
  await updateDoc(docRef, {
    isLinked: true,
    linkedPatientCode: patientCode,
    linkedAt: new Date().toISOString(),
  });
  return true;
}

// 5. Update Email Status in Firestore
export async function updateEmailStatus(assessmentId, status, sentAt = new Date().toISOString()) {
  const docRef = doc(db, "publicAssessments", assessmentId);
  await updateDoc(docRef, {
    emailSent: status === "sent",
    emailSentAt: sentAt,
    deliveryStatus: status,
  });
  return true;
}
