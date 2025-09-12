import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";

export function useConversations(uid) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(!!uid);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!uid) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", uid)
    );
    const unsub = onSnapshot(
      q,
      { includeMetadataChanges: true },
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        // Client-side sort by lastMessageAt desc if present
        list.sort((a, b) => {
          const am = a?.lastMessageAt?.toMillis
            ? a.lastMessageAt.toMillis()
            : a?.lastMessageAt?.seconds
            ? a.lastMessageAt.seconds * 1000
            : 0;
          const bm = b?.lastMessageAt?.toMillis
            ? b.lastMessageAt.toMillis()
            : b?.lastMessageAt?.seconds
            ? b.lastMessageAt.seconds * 1000
            : 0;
          return bm - am;
        });
        setItems(list);
        setLoading(false);
      },
      (err) => {
        if (import.meta.env.DEV) console.warn("conversations onSnapshot error:", err);
        setError(err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [uid]);

  return { items, loading, error };
}
