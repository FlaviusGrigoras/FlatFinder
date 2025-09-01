import * as React from "react";
import { useEffect, useState } from "react";
import {
  Container,
  Grid,
  Typography,
  Skeleton,
  Box,
  Alert,
  Button,
  CardActions,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getFlatsByOwner, deleteFlat } from "../services/flats";
import FlatCard from "../components/FlatCard";
import { useAuth } from "../context/AuthContext";

export default function MyFlatsPage() {
  const [flats, setFlats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    (async () => {
      setError("");
      try {
        const data = await getFlatsByOwner(user.uid);
        setFlats(data);
      } catch (e) {
        console.error("Error loading your properties:", e);
        setError("We couldn't load your properties.");
      } finally {
        setLoading(false);
      }
    })();
  }, [user, navigate]);

  const onOpen = (id) => navigate(`/flat/${id}`);

  const onRemove = async (id) => {
    if (!window.confirm("Ești sigur că vrei să ștergi acest anunț?")) {
      return;
    }
    try {
      await deleteFlat(id);
      setFlats((prevFlats) => prevFlats.filter((flat) => flat.id !== id));
    } catch (e) {
      console.error("Error deleting listing:", e);
      setError("We couldn't delete the listing. Please try again.");
    }
  };

  return (
    <Container sx={{ py: 3 }}>
      <Typography variant="h5" fontWeight={700} mb={2}>
        Proprietățile Mele
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
                  isFavorite={false}
                  onOpen={onOpen}
                  onToggle={() => {}}
                >
                  <CardActions>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => onRemove(flat.id)}
                    >
                      Șterge anunț
                    </Button>
                  </CardActions>
                </FlatCard>
              </Grid>
            ))}
      </Grid>

      {!loading && !error && flats.length === 0 && (
        <Box sx={{ textAlign: "center", color: "text.secondary", mt: 3 }}>
          <Typography variant="body1">
            Nu ai publicat niciun anunț momentan.
          </Typography>
        </Box>
      )}
    </Container>
  );
}
