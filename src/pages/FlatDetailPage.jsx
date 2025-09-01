import * as React from "react";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Grid,
  Typography,
  IconButton,
  Box,
  Skeleton,
  Paper,
  Tooltip,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { getFlatById } from "../services/flats";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../hooks/useFavorites";

export default function FlatDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { favorites, toggleFavorite } = useFavorites(user);

  const [flat, setFlat] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getFlatById(id);
        setFlat(data);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <Container sx={{ py: 3 }}>
        <Skeleton variant="text" width={220} height={40} />
        <Skeleton
          variant="rectangular"
          height={320}
          sx={{ borderRadius: 2, my: 2 }}
        />
        <Skeleton width="60%" />
      </Container>
    );
  }
  const fav = favorites?.has ? favorites.has(flat.id) : false;

  const onToggleFav = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    toggleFavorite(flat.id);
  };

  return (
    <Container sx={{ py: 3 }}>
      <Typography variant="h5" fontWeight={700} mb={2}>
        {flat.title}
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper sx={{ overflow: "hidden", borderRadius: 2 }}>
            <img
              src={flat.thumbnailUrl}
              alt={flat.title}
              style={{ width: "100%", display: "block" }}
            />
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography variant="h6" fontWeight={700}>
                {flat.price} € / lună
              </Typography>
              <Tooltip
                title={fav ? "Elimină din favorite" : "Adaugă la favorite"}
              >
                <IconButton onClick={onToggleFav} aria-label="favorite">
                  {fav ? (
                    <FavoriteIcon color="error" />
                  ) : (
                    <FavoriteBorderIcon />
                  )}
                </IconButton>
              </Tooltip>
            </Box>

            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              {flat.area}
              {flat.city ? ` • ${flat.city}` : ""}
            </Typography>

            {/* placeholder info */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Descriere
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Placeholder… Vei adăuga descriere, facilități, hartă etc.
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
