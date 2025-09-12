import React, { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Avatar,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import ApartmentIcon from "@mui/icons-material/Apartment";
import AccountCircle from "@mui/icons-material/AccountCircle";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const isMenuOpen = Boolean(anchorEl);

  const handleProfileMenuOpen = (event) => {
    // Blur the trigger to avoid focused element remaining inside a subtree
    // that may be temporarily aria-hidden by MUI's Modal/Popover.
    try { event.currentTarget?.blur?.(); } catch {}
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    setLogoutOpen(false);
    await logout();
    navigate("/login");
  };

  const handleNavigate = (path) => {
    handleMenuClose();
    navigate(path);
  };

  const renderUserMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
      MenuListProps={{ autoFocusItem: true }}
    >
      <MenuItem onClick={() => handleNavigate("/favorites")}>My Favorites</MenuItem>
      <MenuItem onClick={() => handleNavigate("/my-flats")}>My Listings</MenuItem>
      <MenuItem
        onClick={() => {
          handleMenuClose();
          setLogoutOpen(true);
        }}
      >
        Logout
      </MenuItem>
    </Menu>
  );

  // Prefer any available photoURL on the user; fallback to Google provider photo if present
  const googleProvider = Array.isArray(user?.providerData)
    ? user.providerData.find((p) => p?.providerId === "google.com")
    : null;
  const googlePhoto = googleProvider?.photoURL || null;
  const isGoogle = !!googleProvider;
  const avatarUrl = user?.photoURL || user?.photoUrl || (isGoogle ? (googlePhoto || "") : "");

  return (
    <>
      <AppBar
        position="static"
        color="default"
        elevation={1}
        sx={{ bgcolor: "background.paper" }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            <Box
              component={RouterLink}
              to="/"
              sx={{
                display: "flex",
                alignItems: "center",
                flexGrow: 1,
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <ApartmentIcon sx={{ mr: 1, color: "primary.main" }} />
              <Typography variant="h6" noWrap>
                FlatFinder
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {user ? (
                <>
                  <Button
                    variant="contained"
                    size="small"
                    disableElevation
                    startIcon={<AddCircleOutlineIcon />}
                    onClick={() => navigate("/add-flat")}
                    sx={{
                      textTransform: "none",
                      borderRadius: 999,
                      px: 1.5,
                    }}
                  >
                    Add Flat
                  </Button>
                  <Tooltip title="My profile">
                    <IconButton
                      size="large"
                      edge="end"
                      onClick={handleProfileMenuOpen}
                      color="inherit"
                    >
                      <Avatar
                        src={avatarUrl}
                        alt={user?.displayName || user?.email || "User"}
                        sx={{ width: 32, height: 32 }}
                      >
                        {(user?.displayName || user?.email || "U").charAt(0).toUpperCase()}
                      </Avatar>
                    </IconButton>
                  </Tooltip>
                </>
              ) : (
                <>
                  <Button
                    component={RouterLink}
                    to="/login"
                    variant="outlined"
                    size="small"
                  >
                    Login
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/register"
                    variant="contained"
                    size="small"
                    disableElevation
                  >
                    Register
                  </Button>
                </>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      {renderUserMenu}
      <Dialog open={logoutOpen} onClose={() => setLogoutOpen(false)}>
        <DialogTitle>Log out</DialogTitle>
        <DialogContent>
          Are you sure you want to log out?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogoutOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleLogout} autoFocus>
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
