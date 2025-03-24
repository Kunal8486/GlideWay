import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./Components/ProtectedRoute/ProtectedRoute";

import Navbar from "./Components/Navbar/Navbar";
import Footer from "./Components/Footer/Footer";

import Home from "./Pages/Home/Home";
import Services from "./Pages/Services/Services";
import Contact from "./Pages/Contact/Contact";
import About from "./Pages/About/About";
import FAQ from "./Pages/FAQ/FAQ";
import BookARide from "./Pages/BookARide/book_a_ride";

import CookiesPolicy from "./Pages/Legal/CookiesPolicy/CookiesPolicy";
import PrivacyPolicy from "./Pages/Legal/PrivacyPolicy/PrivacyPolicy";
import TermsOfService from "./Pages/Legal/TermsofServices/TermsofServices";
import RefundPolicy from "./Pages/Legal/RefundPolicy/RefundPolicy";
import PoolingPolicy from "./Pages/Legal/PoolingPolicy/PoolingPolicy";
import CancellationPolicy from "./Pages/Legal/CancellationPolicy/CancellationPolicy";
import PaymentPolicy from "./Pages/Legal/PaymentPolicy/PaymentPolicy";
import DriverPolicy from "./Pages/Legal/DriversPolicy/DriverPolicy";


import Login from "./Pages/Users/Riders/Login/Login";
import DriverLogin from "./Pages/Users/Drivers/Login/DriverLogin";

import Signup from "./Pages/Users/Riders/Registration/Registration";
import BecomeDriver from "./Pages/Users/Drivers/Registration/BecomeDriver";


import ConfirmLogout from "./Pages/ConfirmLogout/ConfirmLogout";
import ForgetPassword from "./Pages/Users/Riders/ForgetPassword/ForgetPassword";
import ResetPassword from "./Pages/Users/Riders/ForgetPassword/ResetPassword";

import Dashboard from "./Pages/Dashboard/Rider/RiderDashboard";
import Driver from "./Pages/Dashboard/Driver/DriverDashboard";

import RiderProfile from "./Pages/Users/Riders/Profile/Profile";


import ScheduleRide from "./Pages/Rides/ScheduleRide/ScheduleRide";
import RideSharing from "./Pages/Rides/RideSharing/RideSharing";
import RidePooling from "./Pages/Rides/RidePooling/RidePooling";

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
        <Route path="/" element={<Home />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/services" element={<Services />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        <Route path="/cookies-policy" element={<CookiesPolicy />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="/pooling-policy" element={<PoolingPolicy />} />
        <Route path="/cancellation-policy" element={<CancellationPolicy />} />
        <Route path="/payment-policy" element={<PaymentPolicy />} />
        <Route path="/driver-policy" element={<DriverPolicy />} />


        <Route path="/login" element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <Login handleLogin={handleLogin} />} />
        <Route path="/signup" element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <Signup />} />
        <Route path="/forget-password" element={<ForgetPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        <Route path="/driver" element={<Driver />} />
        <Route path="/become-driver" element={<BecomeDriver />} />


        <Route path="/book-a-ride" element={<BookARide />} />
        <Route path="/rider-profile" element={<RiderProfile />} />
        <Route path="/driver-login" element={<DriverLogin />} />


        <Route path="/schedule-ride" element={<ScheduleRide />} />
        <Route path="/ride-sharing" element={<RideSharing />} />
        <Route path="/ride-pooling" element={<RidePooling />} />

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
