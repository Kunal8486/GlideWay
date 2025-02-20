import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./Components/ProtectedRoute/ProtectedRoute";
import Navbar from "./Components/Navbar/Navbar";
import Footer from "./Components/Footer/Footer";
import Home from "./Pages/Home/Home";
import Login from "./Pages/Users/Riders/Login/Login";
import Signup from "./Pages/Users/Riders/Registration/Registration";
import Dashboard from "./Pages/Dashboard/Rider/RiderDashboard";
import Driver from "./Pages/Dashboard/Driver/DriverDashboard";
import ConfirmLogout from "./Pages/ConfirmLogout/ConfirmLogout";
import Services from "./Pages/Services/Services";
import Contact from "./Pages/Contact/Contact";
import About from "./Pages/About/About";
import BecomeDriver from "./Pages/BecomeDriver/BecomeDriver";
import FAQ from "./Pages/FAQ/FAQ";
import BookARide from "./Pages/BookARide/book_a_ride";
import RiderProfile from "./Pages/Users/Riders/Profile/Profile";
import "./App.css";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token) {
      setIsLoggedIn(true);
      setUserRole(role);
    }
  }, []);

  const handleLogin = (token, role) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    setIsLoggedIn(true);
    setUserRole(role);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setIsLoggedIn(false);
    setUserRole(null);
  };

  return (
    <Router>
      <Navbar isLoggedIn={isLoggedIn} handleLogout={handleLogout} />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <Login handleLogin={handleLogin} />} />
        <Route path="/signup" element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <Signup />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/" element={<Home />} />
        <Route path="/driver" element={<Driver />} />
        <Route path="/become-driver" element={<BecomeDriver />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/services" element={<Services />} />
        <Route path="/book-a-ride" element={<BookARide />} />
        <Route path="/rider-profile" element={<RiderProfile />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn} allowedRoles={["user", "admin"]} userRole={userRole}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Confirmation and Logout Routes */}
        <Route path="/confirm-logout" element={isLoggedIn ? <ConfirmLogout handleLogout={handleLogout} /> : <Navigate to="/login" replace />} />

        {/* Redirect unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </Router>
  );
};

export default App;
