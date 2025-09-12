import * as React from "react";
import {
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Typography,
  IconButton,
  Tooltip,
  Box,
  Avatar,
  Button,
  Skeleton,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { useUserProfile } from "../hooks/useUserProfile";
import { useAuth } from "../context/AuthContext";
import { sendMessage } from "../services/messages";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import TextField from "@mui/material/TextField";

export default function FlatCard({ flat, isFavorite, onToggle, onOpen, onMessage, children }) {
  // Support legacy records that might use `ownerID` instead of `ownerId`
  const ownerUid = flat?.ownerId || flat?.ownerID;
  const { profile, loading: authorLoading } = useUserProfile(ownerUid);
  const { user } = useAuth();
  const [composeOpen, setComposeOpen] = React.useState(false);
  const [composeText, setComposeText] = React.useState("");
  const [composeLoading, setComposeLoading] = React.useState(false);
  const [composeError, setComposeError] = React.useState("");
  const isOwner = user?.uid && ownerUid && user.uid === ownerUid;

  const authorName =
    profile?.displayName ||
    profile?.name ||
    profile?.email ||
    flat?.ownerDisplayName ||
    flat?.ownerEmail ||
    "Unknown";
  const authorInitial = (authorName || "U").charAt(0).toUpperCase();
  const authorPhoto = profile?.photoURL || flat?.ownerPhotoURL || "";
  const mailtoHref = profile?.email ? `mailto:${profile.email}` : undefined;

  return (
    <Card sx={{ borderRadius: 2, overflow: "hidden", position: "relative" }}>
      {onToggle && (
        <Box sx={{ position: "absolute", top: 8, right: 8, zIndex: 1 }}>
          <Tooltip title={isFavorite ? "Remove from favorites" : "Add to favorites"}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onToggle(flat.id);
              }}
              sx={{
                bgcolor: "rgba(255,255,255,0.9)",
                "&:hover": { bgcolor: "rgba(255,255,255,1)" },
              }}
              aria-label={isFavorite ? "Remove favorite" : "Add favorite"}
            >
              {isFavorite ? (
                <FavoriteIcon color="error" fontSize="small" />
              ) : (
                <FavoriteBorderIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
        </Box>
      )}

      <CardActionArea component="div" onClick={() => onOpen(flat.id)}>
        <CardMedia
          component="img"
          height="180"
          image={flat.thumbnailUrl}
          alt={flat.title}
          sx={{ objectFit: "cover" }}
        />

        <CardContent>
          <Typography variant="subtitle1" fontWeight={600} noWrap>
            {flat.title}
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: 1,
              alignItems: "center",
              color: "text.secondary",
              mt: 0.5,
            }}
          >
            <Typography variant="body2" noWrap>
              {flat.area}
            </Typography>
            <Typography variant="body2">•</Typography>
            <Typography variant="body2" fontWeight={600}>
              {flat.price} € / month
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>

      {children}

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          borderTop: 1,
          borderColor: "divider",
          px: 1.5,
          py: 1,
          bgcolor: "background.paper",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {authorLoading ? (
            <>
              <Skeleton variant="circular" width={28} height={28} />
              <Skeleton variant="text" width={120} height={20} />
            </>
          ) : (
            <>
              <Avatar src={authorPhoto} sx={{ width: 28, height: 28 }}>
                {authorInitial}
              </Avatar>
              <Typography variant="body2" noWrap fontWeight={600}>
                {authorName}
              </Typography>
            </>
          )}
        </Box>

        {!isOwner && (
        <Button
          size="small"
          variant="outlined"
          startIcon={<ChatBubbleOutlineIcon />}
          onClick={(e) => {
            e.stopPropagation();
            // Blur the trigger to prevent focus remaining in a subtree that
            // may be set aria-hidden when opening the dialog.
            try { e.currentTarget?.blur?.(); } catch {}
            if (onMessage) {
              onMessage(flat);
              return;
            }
            setComposeOpen(true);
          }}
          sx={{ textTransform: "none" }}
        >
          Send message
        </Button>
        )}
      </Box>

      <Dialog open={composeOpen} onClose={() => setComposeOpen(false)} onClick={(e) => e.stopPropagation()}>
        <DialogTitle>Send message</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            To: {authorName}
          </Typography>
          <TextField
            autoFocus
            multiline
            minRows={3}
            placeholder="Write your message..."
            fullWidth
            value={composeText}
            onChange={(e) => setComposeText(e.target.value)}
            disabled={composeLoading}
          />
          {composeError && (
            <Typography variant="caption" color="error">{composeError}</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setComposeOpen(false)} disabled={composeLoading}>Cancel</Button>
          <Button
            variant="contained"
            onClick={async () => {
              setComposeError("");
              if (!user) {
                setComposeError("Please log in to send messages.");
                return;
              }
              try {
                setComposeLoading(true);
                await sendMessage({ fromUid: user.uid, toUid: ownerUid, text: composeText });
                setComposeOpen(false);
                setComposeText("");
              } catch (err) {
                setComposeError(err?.message || "Failed to send message");
              } finally {
                setComposeLoading(false);
              }
            }}
            disabled={composeLoading || !composeText.trim()}
          >
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
