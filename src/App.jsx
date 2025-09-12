import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPassword from "./pages/ForgotPassword";
import FlatDetailPage from "./pages/FlatDetailPage";
import MyFlatsPage from "./pages/MyFlatsPage";
import AddFlatPage from "./pages/AddFlatPage";
import FavoritesPage from "./pages/FavoritesPage";
import Navbar from "./components/Navbar";
import { useAuth } from "./context/AuthContext";
import { useLocation } from "react-router-dom";
import MessagesWidget from "./components/MessagesWidget";

function App() {
  const { user } = useAuth();
  const location = useLocation();
  const hideMessagesOn = new Set(["/login", "/register", "/forgotpassword"]);
  const showMessages = !!user && !hideMessagesOn.has(location.pathname);
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/flat/:id" element={<FlatDetailPage />} />
        <Route path="/my-flats" element={<MyFlatsPage />} />
        <Route path="/add-flat" element={<AddFlatPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
      </Routes>
      {showMessages && <MessagesWidget />}
    </>
  );
}

export default App;
