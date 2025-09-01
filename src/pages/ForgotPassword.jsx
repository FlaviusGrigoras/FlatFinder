import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useFormik } from "formik";
import * as yup from "yup";
import { sendPasswordResetEmail } from "firebase/auth";
import { Box, Button, TextField, Typography, Container, Alert } from "@mui/material";

const validationSchema = yup.object({
  email: yup
    .string()
    .email("Email address is not valid")
    .required("Email address is required"),
});

const ForgotPassword = () => {
  const { auth } = useAuth();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: { email: "" },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setMessage("");
      setError("");
      setLoading(true);

      try {
        await sendPasswordResetEmail(auth, values.email);
        setMessage("Check your inbox for password reset instructions.");
      } catch (err) {
        if (err.code === "auth/user-not-found") {
          setError("No account found with this email address.");
        } else {
          setError("Something went wrong. Please try again.");
        }
        console.error("Firebase error:", err.message);
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography component="h1" variant="h5">Reset Password</Typography>
        <Box
          component="form"
          onSubmit={formik.handleSubmit}
          noValidate
          sx={{ mt: 1 }}
        >
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />

          {message && (
            <Alert severity="success" sx={{ mt: 2, width: '100%' }}>
              {message}
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading || !formik.isValid}
          >
            {loading ? "Sending..." : "Send Reset Email"}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default ForgotPassword;
