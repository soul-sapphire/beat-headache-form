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
        const profile = normalizeProfile(user.uid, docSnap.data());
        setUserProfile(profile);

        if (profile.approved !== true || profile.status !== "approved") {
          setAuthError("Your doctor account is pending administrator approval.");
        } else {
          setAuthError(null);
        }
      } else {
        setUserProfile(null);
        setAuthError("No doctor profile document found for this user account.");
      }
    } catch (err) {
      console.error("[AuthContext] User profile fetch error:", err.code || err.message);
      setUserProfile(null);
      if (err.code === "permission-denied") {
        setAuthError("Permission denied loading account profile. Contact administration.");
      } else {
        setAuthError("Could not load account profile. Please check your connection.");
      }
    }
  }, []);

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
      if (user) {
        await fetchUserProfile(user);
      } else {
        setUserProfile(null);
        setAuthError(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [fetchUserProfile]);

  const value = {
    firebaseUser,
    userProfile,
    loading,
    authError,
    logout,
    refreshUserProfile,
    // Standard aliases
    currentUser: firebaseUser,
    userData: userProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
