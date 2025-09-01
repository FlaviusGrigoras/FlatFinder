import { db } from "./firebase";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";

// -> Read all active flats
export async function getFlats() {
  try {
    const q = query(
      collection(db, "flats"),
      where("isActive", "==", true),
      orderBy("createdAt", "desc"),
      limit(12)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (e) {
    // Fallback fără filtru/ordonare (util când lipsesc indexuri sau sunt reguli restrictive)
    console.warn("getFlats primary query failed, applying fallback:", e?.message || e);
    const fallback = query(collection(db, "flats"), limit(12));
    const snapshot = await getDocs(fallback);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }
}

export async function getFlatById(id) {
  const docRef = doc(db, "flats", id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) throw new Error("Flat not found");
  return { id: snapshot.id, ...snapshot.data() };
}
