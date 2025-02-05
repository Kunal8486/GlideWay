import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './Components/ProtectedRoute/ProtectedRoute';
import Navbar from './Components/Navbar/Navbar';
import Footer from './Components/Footer/Footer';
import Home from './Pages/Home/Home';
import Login from './Pages/Login/Login';
import Signup from './Pages/Signup/Signup';
import Dashboard from './Pages/Dashboard/Rider/RiderDashboard';
import Driver from './Pages/Dashboard/Driver/DriverDashboard';
import ConfirmLogout from './Pages/ConfirmLogout/ConfirmLogout';
import Contact from './Pages/Contact/Contact';
import About from './Pages/About/About';
import BecomeDriver from './Pages/BecomeDriver/BecomeDriver';
import BookARide from './Pages/BookARide/book_a_ride';
import './App.css';

const App = () => {
  const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true'; // Check login state from session storage

  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <Login />}
        />
        <Route
          path="/signup"
          element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <Signup />}
        />
        <Route path="/about" element={<About />} />
        < Route path="/contact" element={<Contact />} />
        <Route path="/" element={<Home />} />
        <Route path="/driver" element={<Driver />} />
        <Route path="/become-driver" element={<BecomeDriver />} />
        <Route path="/book-a-ride" element={<BookARide />} />
        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['user', 'admin']}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/confirm-logout"
          element={
            !isLoggedIn ? <Navigate to="/login" replace /> : <ConfirmLogout />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </Router>
  );
};

export default App;
