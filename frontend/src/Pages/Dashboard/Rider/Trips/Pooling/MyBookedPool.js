import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MyBookedPool.css'; // Assuming you have this CSS file

const MyPassengerRides = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({
    show: false,
    type: '',
    message: ''
  });

  // Custom axios instance with authentication token
  const authAxios = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });

  useEffect(() => {
    fetchRides();
  }, []);

  // Debug effect to log ride and passenger data
  useEffect(() => {
    if (rides.length > 0) {
      console.log("Retrieved rides:", rides);
      
      // Check passenger data structure
      rides.forEach((ride, index) => {
        console.log(`Ride ${index} (${ride._id}) passengers:`, ride.passengers);
        
        if (ride.passengers && ride.passengers.length > 0) {
          ride.passengers.forEach((passenger, pIdx) => {
            console.log(`Passenger ${pIdx} user:`, passenger.user, "status:", passenger.status);
          });
        }
      });
    }
  }, [rides]);

  const fetchRides = async () => {
    try {
      setLoading(true);
      // Call the endpoint that gets rides where user is a passenger
      const response = await authAxios.get('/api/rides/pool/get/passenger');
      
      console.log('Passenger rides API response:', response.data);
      
      if (Array.isArray(response.data)) {
        setRides(response.data);
      } else {
        console.error('API response is not in expected format:', response.data);
        setRides([]);
        setError('Received invalid data format from server');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching rides:', err);
      setError('Failed to load your rides. Please try again later.');
      setRides([]);
      setLoading(false);
    }
  };

  const handleCancelRide = async (rideId) => {
    try {
      // Clean up the ID if it's an object
      const cleanId = typeof rideId === 'object' && rideId.$oid 
        ? rideId.$oid 
        : String(rideId);
        
      await authAxios.post(`/api/rides/pool/${cleanId}/cancel`);
      
      // Update the rides list by refreshing data
      fetchRides();

      setNotification({
        show: true,
        type: 'success',
        message: 'Ride request successfully cancelled'
      });
    } catch (err) {
      console.error('Error cancelling ride:', err);
      setNotification({
        show: true,
        type: 'error',
        message: 'Failed to cancel ride. Please try again.'
      });
    }
  };

  const handleRefresh = () => {
    fetchRides();
    setNotification({
      show: true,
      type: 'info',
      message: 'Refreshing rides data...'
    });
  };

  // Improved helper function to get passenger status
  const getUserPassengerStatus = (ride) => {
    if (!ride || !ride.passengers || !Array.isArray(ride.passengers)) {
      console.log("Ride or passengers data is invalid:", ride);
      return 'unknown';
    }
    
    const userId = localStorage.getItem('userId');
    if (!userId) {
      console.error('User ID not found in localStorage');
      return 'unknown';
    }
    
    console.log("Looking for user ID:", userId, "in passengers array of ride:", ride._id);
    
    // Find the passenger entry for the current user
    const currentUserPassenger = ride.passengers.find(passenger => {
      if (!passenger || !passenger.user) return false;
      
      // Handle different formats of user ID
      let passengerId;
      
      if (typeof passenger.user === 'object') {
        passengerId = passenger.user.$oid || 
                    (passenger.user._id ? (typeof passenger.user._id === 'object' ? passenger.user._id.$oid : passenger.user._id) : null) || 
                    passenger.user.id || 
                    String(passenger.user);
      } else {
        passengerId = String(passenger.user);
      }
      
      console.log("Comparing passenger ID:", passengerId, "with user ID:", userId);
      return passengerId === userId;
    });
    
    if (!currentUserPassenger) {
      console.log("No matching passenger found for user ID:", userId);
      return 'unknown';
    }
    
    console.log("Found passenger status:", currentUserPassenger.status);
    return currentUserPassenger.status || 'unknown';
  };

  const formatDate = (dateTime) => {
    if (!dateTime) return 'Not specified';
    const date = new Date(dateTime);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateTime) => {
    if (!dateTime) return '';
    const date = new Date(dateTime);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper function to get ride ID in a consistent format
  const getRideId = (ride) => {
    if (!ride || !ride._id) return 'N/A';
    
    if (typeof ride._id === 'string') {
      return ride._id;
    } else if (ride._id.$oid) {
      return ride._id.$oid;
    }
    
    return String(ride._id);
  };

  const RideCard = ({ ride }) => {
    if (!ride) return null;
    
    const passengerStatus = getUserPassengerStatus(ride);
    const isPending = passengerStatus === 'pending';
    const isAccepted = passengerStatus === 'accepted';
    const isRejected = passengerStatus === 'rejected';
    const isCancelled = passengerStatus === 'cancelled' || ride.status === 'cancelled';
    const isPast = ride.dateTime ? new Date(ride.dateTime) < new Date() : false;
    const rideId = getRideId(ride);

    const getStatusClass = () => {
      if (isPending) return 'mbp-status-pending';
      if (isAccepted) return 'mbp-status-active';
      if (isRejected) return 'mbp-status-rejected';
      if (isCancelled) return 'mbp-status-cancelled';
      if (isPast) return 'mbp-status-completed';
      if (passengerStatus === 'unknown') return 'mbp-status-unknown';
      return '';
    };

    const getStatusLabel = () => {
      if (isPending) return 'Pending';
      if (isAccepted) return 'Accepted';
      if (isRejected) return 'Rejected';
      if (isCancelled) return 'Cancelled';
      if (isPast && isAccepted) return 'Completed';
      if (passengerStatus === 'unknown') return 'Status Unavailable';
      return passengerStatus || 'Unknown';
    };

    return (
      <div className="mbp-ride-card">
        <div className="mbp-ride-header">
          <div className="mbp-trip-details">
            <div className="mbp-trip-title">
              Trip #{rideId ? rideId.substring(0, 6) : 'N/A'}
            </div>
            <div className="mbp-trip-date">
              {formatDate(ride.dateTime)} • {formatTime(ride.dateTime)}
            </div>
          </div>
          <div className={`mbp-status-badge ${getStatusClass()}`}>
            {getStatusLabel()}
          </div>
        </div>

        <div className="mbp-ride-body">
          <div className="mbp-location-section">
            <div className="mbp-location-title">FROM</div>
            <div className="mbp-location-value">{ride.origin || 'Not specified'}</div>
          </div>

          <div className="mbp-location-section">
            <div className="mbp-location-title">TO</div>
            <div className="mbp-location-value">{ride.destination || 'Not specified'}</div>
          </div>

          <div className="mbp-details-grid">
            <div className="mbp-detail-item">
              <div className="mbp-detail-label">FARE</div>
              <div className="mbp-detail-value">₹{ride.fare || '0'}</div>
            </div>

            <div className="mbp-detail-item">
              <div className="mbp-detail-label">SEATS</div>
              <div className="mbp-detail-value">{ride.seats || '1'}</div>
            </div>

            <div className="mbp-detail-item">
              <div className="mbp-detail-label">VEHICLE</div>
              <div className="mbp-detail-value">{ride.vehicleType || 'Not specified'}</div>
            </div>
          </div>

          {ride.notes && (
            <div className="mbp-detail-item">
              <div className="mbp-detail-label">NOTES</div>
              <div className="mbp-detail-value">{ride.notes}</div>
            </div>
          )}

          {isAccepted && ride.driver && (
            <div className="mbp-driver-section">
              <img 
                src={ride.driver.profilePicture || "https://www.iconpacks.net/icons/2/free-user-icon-3296-thumb.png"} 
                alt="Driver" 
                className="mbp-driver-avatar" 
              />
              <div className="mbp-driver-info">
                <div className="mbp-driver-name">{ride.driver.name || 'Driver'}</div>
                <div>Vehicle: {ride.vehicleType || 'Not specified'}</div>
              </div>
            </div>
          )}
        </div>

        <div className="mbp-ride-actions">
          {isAccepted && !isPast && !isCancelled && (
            <>
              <button 
                className="mbp-action-button mbp-primary-button"
                onClick={() => alert('Contact feature coming soon!')}
              >
                Contact Driver
              </button>
              <button 
                className="mbp-action-button mbp-danger-button"
                onClick={() => handleCancelRide(rideId)}
              >
                Cancel Ride
              </button>
            </>
          )}

          {isPending && !isPast && !isCancelled && (
            <button 
              className="mbp-action-button mbp-danger-button"
              onClick={() => handleCancelRide(rideId)}
            >
              Cancel Request
            </button>
          )}

          {isRejected && (
            <div className="mbp-rejection-message">
              Your ride request was rejected by the driver
            </div>
          )}

          {isCancelled && (
            <div className="mbp-cancel-reason">
              {ride.cancelReason || 'This ride was cancelled'}
            </div>
          )}
            
          {passengerStatus === 'unknown' && (
            <div className="mbp-unknown-status">
              Unable to determine your request status. Please contact support.
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="mbp-loading-container">
        <div className="mbp-loading-spinner"></div>
        <p>Loading rides...</p>
      </div>
    );
  }

  return (
    <div className="mbp-container">
      {notification.show && (
        <div className={`mbp-notification mbp-${notification.type}`}>
          <span className="mbp-notification-icon">
            {notification.type === 'success' ? '✓' : '⚠'}
          </span>
          <p>{notification.message}</p>
          <button 
            className="mbp-close-notification"
            onClick={() => setNotification({ show: false, type: '', message: '' })}
          >
            ×
          </button>
        </div>
      )}

      <div className="mbp-dashboard-header">
        <h1>My Booked Rides</h1>
        <div className="mbp-header-actions">
          <button 
            className="mbp-refresh-btn" 
            onClick={handleRefresh}
            disabled={loading}
          >
            ↻ Refresh
          </button>
          <button 
            className="mbp-new-ride-btn"
            onClick={() => window.location.href = '/search-ride'}
          >
            + Book New Ride
          </button>
        </div>
      </div>

      {error && (
        <div className="mbp-error">
          <p>{error}</p>
          <button 
            className="mbp-retry-button"
            onClick={handleRefresh}
          >
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && rides.length === 0 && (
        <div className="mbp-no-rides">
          <h3>No booked rides found</h3>
          <p>Book a ride to get started</p>
          <button 
            className="mbp-action-button mbp-primary-button"
            onClick={() => window.location.href = '/search-ride'}
            style={{ marginTop: '20px' }}
          >
            Search for Rides
          </button>
        </div>
      )}

      {!loading && !error && rides.length > 0 && (
        <div className="mbp-ride-list">
          {rides.map((ride, index) => (
            <RideCard key={getRideId(ride) || index} ride={ride} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPassengerRides;