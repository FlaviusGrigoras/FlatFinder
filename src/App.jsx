import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPassword from "./pages/ForgotPassword";
import FlatDetailPage from "./pages/FlatDetailPage";
import MyFlatsPage from "./pages/MyFlatsPage";
import Navbar from "./components/Navbar";

function App() {
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
      </Routes>
    </>
  );
}

export default App;
