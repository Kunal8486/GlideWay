import React, { useState } from "react";
import { FaCar, FaMoneyBillWave, FaHistory, FaBell, FaPhone, FaTimes } from "react-icons/fa";
import { dashboardSections } from "./constants";
import "./DriverDashboard.css";

const DriverDashboard = () => {
  const [activePopup, setActivePopup] = useState(null);
  const [isOnline, setIsOnline] = useState(true);

  const openPopup = (section) => {
    setActivePopup(section);
  };

  const closePopup = (e) => {
    e.stopPropagation();
    setActivePopup(null);
  };

  const toggleOnlineStatus = () => {
    setIsOnline(!isOnline);
  };

  const renderPopupContent = () => {
    const content = dashboardSections[activePopup];
    if (!content) return null;

    return (
      <div className="popup-overlay" onClick={closePopup}>
        <div className="popup-content" onClick={(e) => e.stopPropagation()}>
          <button className="close-button" onClick={closePopup}>
            <FaTimes />
          </button>
          <h2>{content.title}</h2>
          {content.details}
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      <section className="profile-section">
        <div className="profile-image">
          <img
            src="/api/placeholder/150/150"
            alt="Driver Profile"
          />
        </div>
        <div className="profile-info">
          <h2>John Doe</h2>
          <div className="status-toggle">
            <button 
              className={`status-button ${isOnline ? 'online' : 'offline'}`}
              onClick={toggleOnlineStatus}
            >
              {isOnline ? 'Online' : 'Offline'}
            </button>
          </div>
          <div className="driver-rating">
            <span className="rating">4.8</span>
            <span className="star">★</span>
          </div>
        </div>
      </section>

      <div className="dashboard-grid">
        {Object.entries(dashboardSections).map(([key, section]) => (
          <section 
            key={key}
            className="dashboard-card"
            onClick={() => openPopup(key)}
          >
            <div className="card-icon">
              {section.icon}
            </div>
            <div className="card-content">
              <h3>{section.title}</h3>
              {section.summary}
            </div>
          </section>
        ))}
      </div>

      {activePopup && renderPopupContent()}
    </div>
  );
};

export default DriverDashboard;