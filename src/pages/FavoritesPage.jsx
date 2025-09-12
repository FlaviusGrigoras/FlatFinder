import * as React from "react";
import { useEffect, useState } from "react";
import { Container, Grid, Typography, Skeleton, Box, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import FlatCard from "../components/FlatCard";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../hooks/useFavorites";
import { getFlatById } from "../services/flats";

export default function FavoritesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { favorites, toggleFavorite } = useFavorites(user);

  const [flats, setFlats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setError("");
      setLoading(true);
      try {
        const ids = Array.from(favorites);
        if (ids.length === 0) {
          if (!cancelled) setFlats([]);
        } else {
          const results = await Promise.all(
            ids.map(async (id) => {
              try {
                return await getFlatById(id);
              } catch (e) {
                console.warn("Favorite flat missing:", id, e?.message || e);
                return null;
              }
            })
          );
          if (!cancelled) setFlats(results.filter(Boolean));
        }
      } catch (e) {
        console.error("Error loading favorites:", e);
        if (!cancelled) setError("We couldn't load your favorites.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [favorites]);

  const onOpen = (id) => navigate(`/flat/${id}`);

  const onToggle = (id) => {
    if (!user) {
      navigate("/login");
      return;
    }
    toggleFavorite(id);
  };

  return (
    <Container sx={{ py: 3 }}>
      <Typography variant="h5" fontWeight={700} mb={2}>
        Favorites
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2}>
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                <Skeleton
                  variant="rectangular"
                  height={220}
                  sx={{ borderRadius: 2, mb: 1 }}
                />
                <Skeleton width="80%" />
                <Skeleton width="60%" />
              </Grid>
            ))
          : flats.map((flat) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={flat.id}>
                <FlatCard
                  flat={flat}
                  isFavorite={favorites.has(flat.id)}
                  onToggle={onToggle}
                  onOpen={onOpen}
                />
              </Grid>
            ))}
      </Grid>

      {!loading && !error && flats.length === 0 && (
        <Box sx={{ textAlign: "center", color: "text.secondary", mt: 3 }}>
          <Typography variant="body1">You have no favorites yet.</Typography>
        </Box>
      )}
    </Container>
  );
}

