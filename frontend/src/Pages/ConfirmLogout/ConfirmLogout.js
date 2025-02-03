import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ConfirmLogout.css';

const ConfirmLogout = () => {
  const navigate = useNavigate();

  const confirmLogoutHandler = () => {
    localStorage.removeItem('authToken'); // Clear the login token
    navigate('/home'); // Redirect to login page
  };

  const cancelLogoutHandler = () => {
    navigate('/'); // Redirect to home page if user cancels
  };

  return (
    <div className="confirm-logout">
      <h2>Are you sure you want to log out?</h2>
      <div className="actions">
        <button onClick={confirmLogoutHandler} className="btn-confirm">
          Yes, Log Out
        </button>
        <button onClick={cancelLogoutHandler} className="btn-cancel">
          No, Stay Logged In
        </button>
      </div>
    </div>
  );
};

export default ConfirmLogout;
