import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Stack,
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
  Alert,
  CircularProgress,
} from "@mui/material";
import * as yup from "yup";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useForm } from "../hooks/useForm";

const loginSchema = yup.object().shape({
  email: yup
    .string()
    .required("Campul email este obligatoriu")
    .email("Please insert an valid email"),
  password: yup
    .string()
    .min(6, "Password must contain at least 6 characters")
    .required("You must enter your password"),
});

function LoginPage() {
  const { formData, handleChange } = useForm({
    email: "",
    password: "",
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
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      console.log("Autentificare reusita");
      navigate("/");
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        setError(err.errors[0]);
      } else {
        if (
          err.code === "auth/user-not-found" ||
          err.code === "auth/wrong-password" ||
          err.code === "auth/invalid-credential"
        ) {
          setError("Emailul sau parola incorecte");
        } else {
          setError("A aparut o eroare");
          console.error("Eroare Firebase: ", err);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleFormSubmit}>
      <Stack spacing={2} sx={{ width: 400, margin: "auto" }}>
        <h1>Login</h1>
        {error && <Alert severity="error">{error}</Alert>}
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
          name="password"
          type="password"
          id="login-password"
          value={formData.password}
          onChange={handleChange}
          disabled={loading}
        />
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <FormControlLabel control={<Checkbox />} label="Remember me" />
          <Link to="/forgotpassword">Forgot Your Password?</Link>
        </Stack>
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : "Login"}
        </Button>
        <Link to="/register">Don't have an account? Register</Link>
      </Stack>
    </form>
  );
}

export default LoginPage;
