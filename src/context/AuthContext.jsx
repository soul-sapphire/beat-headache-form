import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Fetch the Firestore user document for a given Firebase user
  const normalizeProfile = (uid, data) => {
    const approved =
      data.approved === true || data.approved === "true"
        ? true
        : data.approved === false || data.approved === "false"
        ? false
        : data.approved;
    return { uid, ...data, approved };
  };

  const fetchUserProfile = useCallback(async (user) => {
    if (!user) {
      setUserProfile(null);
      setAuthError(null);
      return;
    }
    try {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserProfile(normalizeProfile(user.uid, docSnap.data()));
      } else {
        setUserProfile(null);
      }
      setAuthError(null);
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error("[AuthContext] Firestore fetch error:", err.code || err.message);
      }
      setUserProfile(null);

      if (err.code === "permission-denied") {
        setAuthError("Permission denied loading your profile. Contact admin.");
      } else if (err.code === "unavailable" || err.message?.includes("offline")) {
        setAuthError("You appear to be offline. Please check your connection and retry.");
      } else {
        setAuthError("Could not load your account profile. Please try again.");
      }
    }
  }, []);

  // Call from login/register to force a re-read; optional user override right after sign-in
  const refreshUserProfile = useCallback(
    async (userOverride) => {
      const user = userOverride || firebaseUser;
      if (user) {
        await fetchUserProfile(user);
      }
    },
    [firebaseUser, fetchUserProfile]
  );

  const logout = useCallback(async () => {
    await signOut(auth);
    setFirebaseUser(null);
    setUserProfile(null);
    setAuthError(null);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      setLoading(true);
      try {
        await fetchUserProfile(user);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [fetchUserProfile]);

  const value = {
    // Primary names
    firebaseUser,
    userProfile,
    loading,
    authError,
    logout,
    refreshUserProfile,
    // Backward-compat aliases used in existing pages
    currentUser: firebaseUser,
    userData: userProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
