import { db } from "../firebase";
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  orderBy, 
  limit, 
  getDocs 
} from "firebase/firestore";

/**
 * Submits a contact form message to Firestore.
 */
export const submitContactMessage = async (data, currentUser = null, userProfile = null) => {
  const payload = {
    name: data.name,
    email: data.email,
    subject: data.subject,
    message: data.message,
    pagePath: window.location.pathname,
    status: "new",
    source: "beat-headache-contact-form",
    createdAt: serverTimestamp(),
    userAgent: navigator.userAgent
  };

  if (currentUser) {
    payload.submittedByUid = currentUser.uid;
    payload.submittedByEmail = currentUser.email;
  }
  
  if (userProfile && userProfile.role) {
    payload.submittedByRole = userProfile.role;
  }

  return await addDoc(collection(db, "contactMessages"), payload);
};

/**
 * Submits a feedback form to Firestore.
 */
export const submitFeedback = async (data, currentUser = null, userProfile = null) => {
  const payload = {
    userType: data.userType || "other",
    workedWell: data.workedWell || "",
    couldImprove: data.couldImprove || "",
    allowAnonymousUse: !!data.allowAnonymousUse,
    pagePath: window.location.pathname,
    status: "new",
    source: "beat-headache-feedback-form",
    createdAt: serverTimestamp()
  };

  if (currentUser) {
    payload.submittedByUid = currentUser.uid;
    payload.submittedByEmail = currentUser.email;
  }
  
  if (userProfile && userProfile.role) {
    payload.submittedByRole = userProfile.role;
  }

  return await addDoc(collection(db, "feedback"), payload);
};

/**
 * Fetches the latest contact messages for admin view.
 */
export const getLatestContactMessages = async (count = 50) => {
  const q = query(
    collection(db, "contactMessages"),
    orderBy("createdAt", "desc"),
    limit(count)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * Fetches the latest feedback for admin view.
 */
export const getLatestFeedback = async (count = 50) => {
  const q = query(
    collection(db, "feedback"),
    orderBy("createdAt", "desc"),
    limit(count)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
