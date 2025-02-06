import React, { useState } from "react";
import { FaCar, FaMoneyBillWave, FaHistory, FaBell, FaPhone } from "react-icons/fa";
import { motion } from "framer-motion";
import "./DriverDashboard.css"; // Ensure CSS is linked

const DriverDashboard = () => {
  const [activePopup, setActivePopup] = useState(null);

  // Function to open a popup
  const openPopup = (section) => {
    setActivePopup(section);
  };

  // Function to close the popup
  const closePopup = () => {
    setActivePopup(null);
  };

  return (
    <div className="dashboard-container">
      {/* Profile Section */}
      <div className="profile-section">
        <img
          src="https://via.placeholder.com/150" // Replace with actual profile image URL
          alt="Driver Profile"
          className="profile-photo"
        />
        <h2>John Doe</h2>
        <p>Status: <span className="status-active">Online</span></p>
      </div>

      {/* Earnings Section */}
      <motion.div className="dashboard-section" onClick={() => openPopup("earnings")} whileHover={{ scale: 1.05 }}>
        <h3><FaMoneyBillWave /> Earnings</h3>
        <p>Total: ₹50,000</p>
        <p>Weekly: ₹12,500</p>
        <p>Today's Earnings: ₹2,000</p>
      </motion.div>

      {/* Ride History */}
      <div className="dashboard-section" onClick={() => openPopup("history")}>
        <h3><FaHistory /> Ride History</h3>
        <p>Completed: 120 Rides</p>
        <p>Upcoming: 5 Rides</p>
        <p>Cancelled: 8 Rides</p>
      </div>

      {/* Vehicle Details */}
      <div className="dashboard-section" onClick={() => openPopup("vehicle")}>
        <h3><FaCar /> Vehicle Details</h3>
        <p>Car: Toyota Innova</p>
        <p>Plate No: XYZ 1234</p>
        <p>Condition: Excellent</p>
      </div>

      {/* Notifications & Support */}
      <div className="dashboard-section" onClick={() => openPopup("notifications")}>
        <h3><FaBell /> Notifications</h3>
        <p>No new alerts</p>
      </div>

      <div className="dashboard-section" onClick={() => openPopup("support")}>
        <h3><FaPhone /> Support</h3>
        <p>Call: 1800-123-456</p>
      </div>

      {/* POPUP MODAL */}
      {activePopup && (
        <div className="popup-overlay" onClick={closePopup}>
          <motion.div className="popup-content" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
            <span className="close-button" onClick={closePopup}>&times;</span>

            {activePopup === "earnings" && (
              <>
                <h2>Earnings Breakdown</h2>
                <p>Total Earnings: ₹50,000</p>
                <p>Last 7 Days: ₹12,500</p>
                <p>Today's Earnings: ₹2,000</p>
                <ul>
                  <li>Ride #1234 - ₹500</li>
                  <li>Ride #1235 - ₹700</li>
                  <li>Ride #1236 - ₹800</li>
                </ul>
              </>
            )}

            {activePopup === "history" && (
              <>
                <h2>Ride History</h2>
                <p>Completed Rides: 120</p>
                <p>Upcoming Rides: 5</p>
                <p>Cancelled Rides: 8</p>
              </>
            )}

            {activePopup === "vehicle" && (
              <>
                <h2>Vehicle Details</h2>
                <p>Car Model: Toyota Innova</p>
                <p>License Plate: XYZ-1234</p>
                <p>Insurance: Active</p>
                <p>Condition: Excellent</p>
              </>
            )}

            {activePopup === "notifications" && (
              <>
                <h2>Notifications</h2>
                <p>📢 No new alerts</p>
                <p>📩 Message from support: "Your vehicle inspection is due."</p>
              </>
            )}

            {activePopup === "support" && (
              <>
                <h2>Support</h2>
                <p>📞 Call: 1800-123-456</p>
                <p>📧 Email: support@glideway.com</p>
              </>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default DriverDashboard;
