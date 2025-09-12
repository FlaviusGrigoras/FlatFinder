import * as React from "react";
import { useMemo, useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Avatar,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import { useMessages } from "../hooks/useMessages";
import { useUserProfile } from "../hooks/useUserProfile";
import { sendMessage } from "../services/messages";

export default function ConversationDialog({ open, onClose, convo, currentUid }) {
  const otherUid = useMemo(
    () => (convo?.participants || []).find((p) => p !== currentUid),
    [convo, currentUid]
  );
  const { profile: otherProfile } = useUserProfile(otherUid);
  const { items: messages, loading } = useMessages(convo?.id);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  const otherName =
    otherProfile?.displayName ||
    otherProfile?.name ||
    otherProfile?.email ||
    "Conversation";

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  useEffect(() => {
    // Auto-scroll to bottom on new messages
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages?.length]);

  const handleSend = async () => {
    const value = text.trim();
    if (!value) return;
    try {
      setSending(true);
      await sendMessage({ fromUid: currentUid, toUid: otherUid, text: value });
      setText("");
      inputRef.current?.focus();
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Avatar src={otherProfile?.photoURL} sx={{ width: 28, height: 28 }}>
          {(otherName || "U").charAt(0).toUpperCase()}
        </Avatar>
        <Typography variant="subtitle1" fontWeight={700} sx={{ flex: 1 }}>
          {otherName}
        </Typography>
        <IconButton edge="end" onClick={onClose} aria-label="Close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 1, display: "flex", flexDirection: "column", gap: 1.5 }}>
        <Box
          ref={scrollRef}
          sx={{
            maxHeight: 360,
            overflowY: "auto",
            px: 0.5,
            py: 1,
            display: "flex",
            flexDirection: "column",
            gap: 1,
            bgcolor: "background.default",
            borderRadius: 1,
          }}
        >
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={20} />
            </Box>
          ) : messages?.length ? (
            messages.map((m) => {
              const isMine = m.senderId === currentUid;
              const ts = m?.createdAt?.toMillis
                ? m.createdAt.toMillis()
                : m?.createdAt?.seconds
                ? m.createdAt.seconds * 1000
                : Date.now();
              const time = new Date(ts).toLocaleTimeString('ro-RO', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              });
              return (
                <Box key={m.id} sx={{ display: "flex", justifyContent: isMine ? "flex-end" : "flex-start" }}>
                  <Box
                    sx={{
                      bgcolor: isMine ? "primary.main" : "grey.200",
                      color: isMine ? "primary.contrastText" : "text.primary",
                      px: 1.25,
                      py: 0.75,
                      borderRadius: 1.5,
                      maxWidth: "75%",
                    }}
                  >
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                      {m.text}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                      {time}
                    </Typography>
                  </Box>
                </Box>
              );
            })
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 2 }}>
              No messages yet. Say hi!
            </Typography>
          )}
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField
            inputRef={inputRef}
            placeholder="Write a message"
            fullWidth
            size="small"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={sending}
          />
          <Button
            variant="contained"
            onClick={handleSend}
            disabled={sending || !text.trim()}
            endIcon={<SendIcon />}
          >
            Send
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
