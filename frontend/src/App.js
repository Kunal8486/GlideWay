import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./Components/ProtectedRoute/ProtectedRoute";
import '@fortawesome/fontawesome-free/css/all.min.css';

import Navbar from "./Components/Navbar/Navbar";
import Footer from "./Components/Footer/Footer";

import Home from "./Pages/Home/Home";
import Services from "./Pages/Services/Services";
import Contact from "./Pages/Contact/Contact";
import About from "./Pages/About/About";
import FAQ from "./Pages/FAQ/FAQ";
import Safety from "./Pages/SafetyPage/SafetyPage";
import BookARide from "./Pages/Rides/BookARide/book_a_ride";
import Community from "./Pages/Community/Community";

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
import DriverSignup from "./Pages/Users/Drivers/Registration/BecomeDriver";

import ConfirmLogout from "./Pages/ConfirmLogout/ConfirmLogout";
import RiderForgetPassword from "./Pages/Users/Riders/ForgetPassword/ForgetPassword";
import RiderResetPassword from "./Pages/Users/Riders/ForgetPassword/ResetPassword";
import DriverForgetPassword from "./Pages/Users/Drivers/ForgetPassword/ForgetPassword";
import DriverResetPassword from "./Pages/Users/Drivers/ForgetPassword/ResetPassword";

import RiderDashboard from "./Pages/Dashboard/Rider/RiderDashboard";
import DriverDashboard from "./Pages/Dashboard/Driver/DriverDashboard";

import RiderProfile from "./Pages/Users/Riders/Profile/Profile";
import DriverProfile from "./Pages/Users/Drivers/Profile/Profile";

import ScheduleRide from "./Pages/Rides/ScheduleRide/ScheduleRide";
import RideSharing from "./Pages/Rides/RideSharing/RideSharing";
import RidePooling from "./Pages/Rides/RidePooling/RidePooling";
import CreatePool from "./Pages/Rides/RidePooling/CreatePool/CreatePool";
import FindPool from "./Pages/Rides/RidePooling/FindPool/FindPool"; 
import MyTrips from "./Pages/Dashboard/Rider/Trips/MyTrip";
import DriverTrips from "./Pages/Dashboard/Driver/Trip/MyTrips";
import EditRide from './Pages/Dashboard/Rider/Trips/Pooling/EditPooling';


import "./App.css";

// Create an AuthContext for robust state management
const AuthContext = React.createContext({
  isLoggedIn: false,
  userRole: null,
  login: () => {},
  logout: () => {}
});

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token && role) {
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

  // Authentication context value
  const authContextValue = {
    isLoggedIn,
    userRole,
    login: handleLogin,
    logout: handleLogout
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      <Router>
        <Navbar isLoggedIn={isLoggedIn} handleLogout={handleLogout} userRole={userRole} />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/services" element={<Services />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />

          {/* Legal Routes */}
          <Route path="/cookies-policy" element={<CookiesPolicy />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/pooling-policy" element={<PoolingPolicy />} />
          <Route path="/cancellation-policy" element={<CancellationPolicy />} />
          <Route path="/payment-policy" element={<PaymentPolicy />} />
          <Route path="/driver-policy" element={<DriverPolicy />} />
          <Route path="/safety" element={<Safety />} />
          {/* Authentication Routes */}
          {/* Rider Routes */}
          <Route 
            path="/login" 
            element={
              isLoggedIn && userRole === 'rider' ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Login handleLogin={handleLogin} role="rider" />
              )
            } 
          />
          <Route 
            path="/signup" 
            element={
              isLoggedIn && userRole === 'rider' ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Signup />
              )
            } 
          />

          {/* Driver Routes */}
          <Route 
            path="/driver/login" 
            element={
              isLoggedIn && userRole === 'driver' ? (
                <Navigate to="/driver/dashboard" replace />
              ) : (
                <DriverLogin handleLogin={handleLogin} role="driver" />
              )
            } 
          />
          <Route 
            path="/become-driver" 
            element={
              isLoggedIn && userRole === 'driver' ? (
                <Navigate to="/driver/dashboard" replace />
              ) : (
                <DriverSignup />
              )
            } 
          />

          {/* Common Authentication Routes */}
          <Route path="/forgot-password" element={<RiderForgetPassword />} />
          <Route path="/reset-password/:token" element={<RiderResetPassword />} />
          <Route path="/driver/forgot-password" element={<DriverForgetPassword />} />
          <Route path="/driver/reset-password/:token" element={<DriverResetPassword />} />

          {/* Ride-related Routes */}
          <Route path="/book-a-ride" element={<BookARide />} />
          <Route path="/schedule-ride" element={<ScheduleRide />} />
          <Route path="/ride-sharing" element={<RideSharing />} />
          <Route path="/pooling/dashboard" element={<RidePooling />} />


          {/* Protected Routes */}
          {/* Rider Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute 
                isLoggedIn={isLoggedIn} 
                allowedRoles={["rider"]} 
                userRole={userRole}
              >
                <RiderDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute 
                isLoggedIn={isLoggedIn} 
                allowedRoles={["rider"]} 
                userRole={userRole}
              >
                <RiderProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-trips"
            element={
              <ProtectedRoute 
                isLoggedIn={isLoggedIn} 
                allowedRoles={["rider"]} 
                userRole={userRole}
              >
                <MyTrips />
              </ProtectedRoute>
            }
          />

          <Route
            path="/pooling/create"
            element={
              <ProtectedRoute

                isLoggedIn={isLoggedIn}
                allowedRoles={["rider"]}
                userRole={userRole}
              >
                <CreatePool />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pooling/find"
            element={
              <ProtectedRoute

                isLoggedIn={isLoggedIn}
                allowedRoles={["rider"]}  
                userRole={userRole}
              >
                <FindPool />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pooling/edit-ride/:id"
            element={
              <ProtectedRoute
                isLoggedIn={isLoggedIn}
                allowedRoles={["rider"]}
                userRole={userRole}
              >
                <EditRide />
              </ProtectedRoute>
            }
          />


          {/* Driver Protected Routes */}
          <Route
            path="/driver/dashboard"
            element={
              <ProtectedRoute 
                isLoggedIn={isLoggedIn} 
                allowedRoles={["driver"]} 
                userRole={userRole}
              >
                <DriverDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/driver/my-trips"
            element={
              <ProtectedRoute 
                isLoggedIn={isLoggedIn} 
                allowedRoles={["driver"]} 
                userRole={userRole}
              >
                <DriverTrips />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/driver/profile"
            element={
              <ProtectedRoute 
                isLoggedIn={isLoggedIn} 
                allowedRoles={["driver"]} 
                userRole={userRole}
              >
                <DriverProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/community"
            element={
              <ProtectedRoute 
                isLoggedIn={isLoggedIn} 
                allowedRoles={["rider", "driver"]} 
                userRole={userRole}
              >
                <Community />
              </ProtectedRoute>
            }
          />
          

          {/* Logout Route */}
          <Route 
            path="/confirm-logout" 
            element={
              isLoggedIn ? (
                <ConfirmLogout handleLogout={handleLogout} />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />


          {/* Redirect unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Footer />
      </Router>
    </AuthContext.Provider>
  );
};

export default App;
export { AuthContext };