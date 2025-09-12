import * as React from "react";
import { useMemo, useState } from "react";
import {
  Paper,
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Skeleton,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { useConversations } from "../hooks/useConversations";
import { useUserProfile } from "../hooks/useUserProfile";
import ConversationDialog from "./ConversationDialog";

function ConversationItem({ convo, currentUid, onClick }) {
  const otherUid = useMemo(
    () => (convo?.participants || []).find((p) => p !== currentUid),
    [convo, currentUid]
  );
  const { profile, loading } = useUserProfile(otherUid);
  const name = profile?.displayName || profile?.name || profile?.email || "Unknown";
  const photo = profile?.photoURL || "";
  const initial = (name || "U").charAt(0).toUpperCase();

  const isMine = convo?.lastSenderId === currentUid;
  const preview = convo?.lastMessageText || "No messages yet";
  const subtitle = isMine && preview ? `You: ${preview}` : preview;

  return (
    <ListItem disableGutters sx={{ px: 1 }}>
      <ListItemButton
        onClick={(e) => {
          try { e.currentTarget?.blur?.(); } catch {}
          onClick && onClick(e);
        }}
        sx={{ borderRadius: 1 }}
      >
        <ListItemAvatar>
          {loading ? (
            <Skeleton variant="circular" width={40} height={40} />
          ) : (
            <Avatar src={photo}>{initial}</Avatar>
          )}
        </ListItemAvatar>
        <ListItemText
          primary={
            loading ? <Skeleton variant="text" width={160} /> : (
              <Typography variant="body2" fontWeight={600} noWrap>
                {name}
              </Typography>
            )
          }
          secondary={
            loading ? (
              <Skeleton variant="text" width={220} />
            ) : (
              <Typography variant="caption" color="text.secondary" noWrap>
                {subtitle}
              </Typography>
            )
          }
        />
      </ListItemButton>
    </ListItem>
  );
}

export default function MessagesWidget() {
  const { user } = useAuth();
  const { items, loading, error } = useConversations(user?.uid);
  const [selected, setSelected] = useState(null);

  return (
    <Paper
      elevation={6}
      sx={{
        position: "fixed",
        right: 16,
        bottom: 16,
        width: 320,
        maxHeight: 360,
        display: "flex",
        flexDirection: "column",
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      <Box sx={{ px: 1.5, py: 1, borderBottom: 1, borderColor: "divider", bgcolor: "background.default" }}>
        <Typography variant="subtitle2" fontWeight={700}>
          Messages
        </Typography>
      </Box>

      <Box sx={{ overflowY: "auto", p: 1 }}>
        {(() => {
          if (!user) {
            return (
              <Typography variant="body2" color="text.secondary" sx={{ px: 1 }}>
                Please log in to see your messages.
              </Typography>
            );
          }
          if (loading) {
            return (
              <>
                {Array.from({ length: 3 }).map((_, i) => (
                  <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1 }}>
                    <Skeleton variant="circular" width={40} height={40} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" width={160} />
                      <Skeleton variant="text" width={220} />
                    </Box>
                  </Box>
                ))}
              </>
            );
          }
          if (error || items.length === 0) {
            return (
              <Typography variant="body2" color="text.secondary" sx={{ px: 1 }}>
                You have no messages yet.
              </Typography>
            );
          }
          return (
            <List dense disablePadding>
              {items.map((c) => (
                <ConversationItem
                  key={c.id}
                  convo={c}
                  currentUid={user.uid}
                  onClick={() => setSelected(c)}
                />
              ))}
            </List>
          );
        })()}
      </Box>
      {selected && (
        <ConversationDialog
          open={!!selected}
          onClose={() => setSelected(null)}
          convo={selected}
          currentUid={user?.uid}
        />
      )}
    </Paper>
  );
}
