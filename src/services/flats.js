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
  serverTimestamp,
  addDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

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
    console.warn(
      "getFlats primary query failed, applying fallback:",
      e?.message || e
    );
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

export async function addFlat(flatData, userId) {
  try {
    await addDoc(collection(db, "flats"), {
      ...flatData,
      ownerId: userId,
      isActive: true,
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    console.error("Error adding property: ", e);
    throw e;
  }
}

export async function getFlatsByOwner(userId) {
  try {
    const q = query(
      collection(db, "flats"),
      where("ownerId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (e) {
    // If a composite index is missing, fall back to a simpler query and client-side sort
    if (e?.code === "failed-precondition") {
      console.warn(
        "getFlatsByOwner requires a composite index (ownerId + createdAt). Using fallback query without orderBy.",
        e?.message || e
      );
      const q = query(collection(db, "flats"), where("ownerId", "==", userId));
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
      // Best-effort sort by createdAt if present
      items.sort((a, b) => {
        const am = a?.createdAt?.toMillis ? a.createdAt.toMillis() : a?.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0;
        const bm = b?.createdAt?.toMillis ? b.createdAt.toMillis() : b?.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0;
        return bm - am;
      });
      return items;
    }
    console.error("Error loading properties:", e);
    throw e;
  }
}

export async function updateFlat(flatId, updatedData) {
  const docRef = doc(db, "flats", flatId);
  await updateDoc(docRef, updatedData);
}

export async function deleteFlat(flatId) {
  const docRef = doc(db, "flats", flatId);
  await deleteDoc(docRef);
}
