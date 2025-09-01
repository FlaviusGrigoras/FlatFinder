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
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

export default function FlatCard({
  flat, // {id, title, area, price, thumbnailUrl}
  isFavorite, // boolean
  onToggle, // (id) => void
  onOpen, // (id) => void
}) {
  return (
    <Card sx={{ borderRadius: 2, overflow: "hidden", position: "relative" }}>
      {/* Overlay favorite button OUTSIDE CardActionArea to avoid button nesting */}
      <Box sx={{ position: "absolute", top: 8, right: 8, zIndex: 1 }}>
        <Tooltip title={isFavorite ? "Elimină din favorite" : "Adaugă la favorite"}>
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
              {flat.price} € / luna
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
