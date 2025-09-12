import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import { collection, onSnapshot, orderBy, query, limit as fbLimit } from "firebase/firestore";

export function useMessages(conversationId, { limit = 200 } = {}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(!!conversationId);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!conversationId) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const col = collection(db, "conversations", conversationId, "messages");
    const q = query(col, orderBy("createdAt", "asc"), fbLimit(limit));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [conversationId, limit]);

  return { items, loading, error };
}

