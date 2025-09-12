import { db } from "./firebase";
import {
  doc,
  setDoc,
  serverTimestamp,
  collection,
  addDoc,
  writeBatch,
} from "firebase/firestore";

export function conversationIdFor(userA, userB) {
  const [a, b] = [userA, userB].sort();
  return `dm_${a}_${b}`;
}

export async function sendMessage({ fromUid, toUid, text }) {
  if (!fromUid || !toUid) throw new Error("Both sender and recipient are required");
  const trimmed = (text || "").trim();
  if (!trimmed) throw new Error("Message cannot be empty");

  const convoId = conversationIdFor(fromUid, toUid);
  const convoRef = doc(db, "conversations", convoId);
  const msgCol = collection(convoRef, "messages");

  const batch = writeBatch(db);
  batch.set(
    convoRef,
    {
      participants: [fromUid, toUid],
      createdAt: serverTimestamp(),
      lastMessageText: trimmed,
      lastMessageAt: serverTimestamp(),
      lastSenderId: fromUid,
    },
    { merge: true }
  );
  const newMsgRef = doc(msgCol);
  batch.set(newMsgRef, {
    senderId: fromUid,
    text: trimmed,
    createdAt: serverTimestamp(),
  });

  await batch.commit();

  return convoId;
}
