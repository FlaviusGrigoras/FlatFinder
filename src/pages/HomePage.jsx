import * as React from "react";
import { useEffect, useState } from "react";
import { Container, Grid, Typography, Skeleton, Box, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getFlats } from "../services/flats";
import FlatCard from "../components/FlatCard";
import { useFavorites } from "../hooks/useFavorites";
import { useAuth } from "../context/AuthContext";

export default function HomePage() {
  const [flats, setFlats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();
  const { favorites, toggleFavorite } = useFavorites(user);

  useEffect(() => {
    (async () => {
      setError("");
      try {
        const data = await getFlats();
        setFlats(data);
      } catch (e) {
        console.error("Error loading properties:", e);
        setError(
          "We couldn't load properties. Please check your connection or Firestore configuration (indexes/permissions)."
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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
        Available Properties
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2}>
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
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
          <Typography variant="body1">
            No available properties right now.
          </Typography>
        </Box>
      )}

      <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}></Box>
    </Container>
  );
}
