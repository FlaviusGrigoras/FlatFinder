import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import {
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  collection,
  serverTimestamp,
} from "firebase/firestore";

export function useFavorites(user) {
  const [favorites, setFavorites] = useState(new Set());

  useEffect(() => {
    if (!user) {
      setFavorites(new Set());
      return;
    }

    const favRef = collection(db, "users", user.uid, "favorites");
    const unsub = onSnapshot(
      favRef,
      (snapshot) => {
        const favSet = new Set(snapshot.docs.map((doc) => doc.id));
        setFavorites(favSet);
      },
      (err) => {
        if (import.meta.env.DEV) console.warn("favorites onSnapshot error:", err);
        setFavorites(new Set());
      }
    );

    return () => unsub();
  }, [user]);

  const toggleFavorite = async (flatId) => {
    if (!user) return;
    const favDocRef = doc(db, "users", user.uid, "favorites", flatId);

    if (favorites.has(flatId)) {
      await deleteDoc(favDocRef);
    } else {
      await setDoc(favDocRef, { flatId, createdAt: serverTimestamp() });
    }
  };
  return { favorites, toggleFavorite };
}
