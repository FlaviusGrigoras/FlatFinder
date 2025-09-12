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
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useForm } from "../hooks/useForm";

const loginSchema = yup.object().shape({
  email: yup
    .string()
    .required("Email is required")
    .email("Please enter a valid email"),
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

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      await signInWithPopup(auth, provider);
      navigate("/");
    } catch (err) {
      if (
        err.code === "auth/popup-closed-by-user" ||
        err.code === "auth/cancelled-popup-request"
      ) {
        // user dismissed; no error toast
      } else if (err.code === "auth/popup-blocked") {
        setError("Popup blocked by browser. Please allow popups and retry.");
      } else {
        setError("Google sign-in failed. Please try again.");
        console.error("Google sign-in error:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const GoogleIcon = (props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 48 48"
      {...props}
    >
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303C33.62 31.658 29.197 35 24 35c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.153 7.961 3.039l5.657-5.657C34.869 5.144 29.699 3 24 3 12.955 3 4 11.955 4 23s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.651-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.818C14.297 16.108 18.789 13 24 13c3.059 0 5.842 1.153 7.961 3.039l5.657-5.657C34.869 5.144 29.699 3 24 3 16.318 3 9.656 7.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 43c5.138 0 9.8-1.975 13.292-5.196l-6.143-5.184C29.109 34.884 26.671 36 24 36c-5.176 0-9.584-3.312-11.186-7.946l-6.54 5.04C8.588 39.556 15.74 43 24 43z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303c-1.089 3.158-3.446 5.64-6.151 7.024l.001-.001 6.143 5.184C33.02 41.205 38 38 41.091 33.5 43.009 30.705 44 27 44 23c0-1.341-.138-2.651-.389-3.917z"
      />
    </svg>
  );

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await loginSchema.validate(formData, { abortEarly: false });

      const auth = getAuth();
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
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
          setError("Incorrect email or password");
        } else {
          setError("Something went wrong");
          console.error("Firebase error:", err);
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
        <Button
          onClick={handleGoogleSignIn}
          variant="outlined"
          fullWidth
          disabled={loading}
          startIcon={<GoogleIcon />}
          aria-label="Sign in with Google"
          sx={{
            textTransform: "none",
            bgcolor: "#fff",
            color: "rgba(0,0,0,0.87)",
            borderColor: "divider",
            '&:hover': { bgcolor: '#fff' },
          }}
        >
          Sign in with Google
        </Button>
        <Link to="/register">Don't have an account? Register</Link>
      </Stack>
    </form>
  );
}

export default LoginPage;
