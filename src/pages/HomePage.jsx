import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router";
import { Button, Container, Stack, Typography } from "@mui/material";

const HomePage = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Failed to logout", error);
    }
  };
  return (
    <Container>
      <Stack spacing={4} sx={{ mt: 5, alignItems: "center" }}>
        <Typography variant="h2">Flat finder</Typography>
        {currentUser ? (
          <>
            <Typography variant="h5">
              Hello, {currentUser.name || currentUser.email}!
            </Typography>
            <Button variant="contained" color="error" onClick={handleLogout}>
              Log out
            </Button>
          </>
        ) : (
          <>
            <Typography variant="h5">Please login</Typography>
            <Button variant="contained" onClick={() => navigate("/login")}>
              Go to Login
            </Button>
          </>
        )}
      </Stack>
    </Container>
  );
};

export default HomePage;
