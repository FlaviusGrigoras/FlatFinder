import React from "react";
import * as yup from "yup";
import { useForm } from "../hooks/useForm";
import {
  createUserWithEmailAndPassword,
  getAuth,
  updateProfile,
} from "firebase/auth";
import {
  Alert,
  Button,
  CircularProgress,
  Stack,
  TextField,
} from "@mui/material";
import { useState } from "react";
import { getFirestore, collection, query, where, getDocs, setDoc, doc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";

const loginSchema = yup.object().shape({
  name: yup
    .string()
    .required("Username is required")
    .min(4, "Username must be at least 4 characters long")
    .matches(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),
  email: yup
    .string()
    .required("Email is required")
    .email("Please enter a valid email address"),
  password1: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters long"),
  password2: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("password1"), null], "Passwords must match"),
});

const RegisterPage = () => {
  const { formData, handleChange } = useForm({
    name: "",
    email: "",
    password1: "",
    password2: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await loginSchema.validate(formData, { abortEarly: false });

      const auth = getAuth();
      const db = getFirestore();

      const usersRef = collection(db, "users");
      const q = query(usersRef, where("name", "==", formData.name));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setError("This username is already taken. Please choose another one.");
        setLoading(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password1
      );

      const user = userCredential.user;

      await updateProfile(user, { displayName: formData.name });

      await setDoc(doc(db, "users", user.uid), {
        name: formData.name,
        email: formData.email,
      });

      navigate("/login");
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        setError(err.errors[0]);
      } else {
        switch (err.code) {
          case "auth/email-already-in-use":
            setError("This email address is already in use.");
            break;
          case "auth/weak-password":
            setError(
              "The password is too weak. It must be at least 6 characters long."
            );
            break;
          case "auth/invalid-email":
            setError("The email address is invalid.");
            break;
          default:
            setError("An unexpected error occurred. Please try again.");
            console.error(err);
            break;
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleFormSubmit}>
        <Stack spacing={2} sx={{ width: 400, margin: "auto" }}>
          <h1>Register</h1>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            required
            id="register-name"
            name="name"
            label="Username"
            value={formData.name}
            onChange={handleChange}
            disabled={loading}
          />
          <TextField
            required
            id="login-email"
            name="email"
            label="Email"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
          />
          <TextField
            required
            label="Password"
            name="password1"
            type="password"
            id="login-password-1"
            value={formData.password1}
            onChange={handleChange}
            disabled={loading}
          />
          <TextField
            required
            label="Confirm Password"
            name="password2"
            type="password"
            id="login-password-2"
            value={formData.password2}
            onChange={handleChange}
            disabled={loading}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : "Register"}
          </Button>
          <Link to="/login">Already a user? Login</Link>
        </Stack>
      </form>
    </>
  );
};
export default RegisterPage;
