import React, { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import { CircularProgress, Box } from "@mui/material";
import { AuthContext } from "../context/AuthContext";

async function ensureUserProfile(user) {
  const userDocRef = doc(db, "users", user.uid);
  // Attempt to create/update without requiring a prior read (rules-friendly)
  try {
    await setDoc(
      userDocRef,
      {
        uid: user.uid,
        email: user.email ?? null,
        displayName: user.displayName ?? "",
        photoURL: user.photoURL ?? "",
        isAdmin: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (e) {
    console.warn("ensureUserProfile setDoc:", e);
  }
}

const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          try { await ensureUserProfile(user); } catch (e) { console.warn("ensureUserProfile:", e); }

          let profileData = null;
          try {
            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) profileData = userDocSnap.data();
          } catch (e) {
            console.warn("Profile read failed:", e);
          }
          setCurrentUser(profileData ? { ...user, ...profileData } : user);
        } else {
          setCurrentUser(null);
        }
      } finally {
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  const logout = () => signOut(auth);

  const value = { currentUser, user: currentUser, logout, auth };

  if (loading) {
    return (
      <Box sx={{ display:"flex", justifyContent:"center", alignItems:"center", height:"100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
