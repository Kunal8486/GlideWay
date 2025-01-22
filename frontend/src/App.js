import React from 'react';
import './App.css'
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Navbar from './Components/Navbar/Navbar';
import Home from './Pages/Home/Home'; 

<Navbar />


const BookRide = () => (
  <div>
    <h1>Book Your Ride</h1>
    <Link to="/confirmation">
      <button>Confirm Booking</button>
    </Link>
  </div>
);

const RideConfirmation = () => (
  <div>
    <h1>Your Ride is Confirmed!</h1>
    <Link to="/">Go Back to Home</Link>
  </div>
);

const Profile = () => (
  <div>
    <h1>User Profile</h1>
    <p>Manage your account details here.</p>
  </div>
);

const Settings = () => (
  <div>
    <h1>App Settings</h1>
    <p>Update app preferences here.</p>
  </div>
);



// App Component
const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/book-ride" element={<BookRide />} />
        <Route path="/confirmation" element={<RideConfirmation />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  );
};

export default App;
