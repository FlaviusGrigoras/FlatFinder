import * as React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { addFlat } from "../services/flats";

export default function AddFlatPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState({
    title: "",
    price: "",
    area: "",
    city: "",
    thumbnailUrl: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      const priceNumber = Number(form.price);
      if (!form.title.trim()) throw new Error("Title is required");
      if (!form.area.trim()) throw new Error("Area is required");
      if (!Number.isFinite(priceNumber) || priceNumber <= 0)
        throw new Error("Price must be a positive number");
      if (!form.thumbnailUrl.trim()) throw new Error("Image URL is required");
      if (!/^https?:\/\//i.test(form.thumbnailUrl.trim()))
        throw new Error("Image URL must start with http or https");

      const flatData = {
        title: form.title.trim(),
        area: form.area.trim(),
        city: form.city.trim(),
        price: priceNumber,
        thumbnailUrl: form.thumbnailUrl.trim(),
      };

      await addFlat(flatData, user);
      navigate("/my-flats");
    } catch (e) {
      setError(e?.message || "Failed to add listing. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container sx={{ py: 3 }}>
      <Typography variant="h5" fontWeight={700} mb={2}>
        Add New Listing
      </Typography>

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Stack spacing={2} maxWidth={520}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            name="title"
            label="Title"
            value={form.title}
            onChange={handleChange}
            required
            disabled={submitting}
          />

          <TextField
            name="area"
            label="Area (e.g. 45 m², 2 rooms)"
            value={form.area}
            onChange={handleChange}
            required
            disabled={submitting}
          />

          <TextField
            name="city"
            label="City"
            value={form.city}
            onChange={handleChange}
            disabled={submitting}
          />

          <TextField
            name="price"
            label="Price (€/month)"
            value={form.price}
            onChange={handleChange}
            required
            disabled={submitting}
            inputMode="numeric"
            type="number"
            inputProps={{ min: 1 }}
          />

          <TextField
            name="thumbnailUrl"
            label="Image URL"
            value={form.thumbnailUrl}
            onChange={handleChange}
            required
            disabled={submitting}
          />

          <Button
            type="submit"
            variant="contained"
            disableElevation
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={22} /> : "Publish"}
          </Button>
        </Stack>
      </Box>
    </Container>
  );
}
