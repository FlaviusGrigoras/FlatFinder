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
    console.error("Error loading properties: ", e);
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
