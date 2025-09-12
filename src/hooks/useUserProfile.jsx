import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import { doc, onSnapshot } from "firebase/firestore";

export function useUserProfile(uid) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(!!uid);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!uid) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const ref = doc(db, "users", uid);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() || {};
          // Normalize potential legacy field casing for photo URL
          const normalized = {
            id: snap.id,
            ...data,
            photoURL: data.photoURL || data.photoUrl || "",
          };
          setProfile(normalized);
        } else {
          setProfile(null);
        }
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [uid]);

  return { profile, loading, error };
}
