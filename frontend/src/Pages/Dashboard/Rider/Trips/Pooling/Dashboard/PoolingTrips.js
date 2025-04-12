import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSync, 
  faPlus, 
  faSearch, 
  faTimes,
  faCheckCircle,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';

import PendingRequests from './PendingRequests';
import MyRides from './MyRides';
import './PoolingTrips.css';

const PoolRidesDashboard = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('booked');
  const [selectedRide, setSelectedRide] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filtering, setFiltering] = useState({
    status: 'all',
    date: '',
  });
  const [notification, setNotification] = useState({
    show: false,
    type: '',
    message: '',
  });
  const [actionInProgress, setActionInProgress] = useState('');
  
  // Create axios instance with auth header
  const authAxios = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  useEffect(() => {
    fetchRides();
  }, []);

  // Auto-hide notification after 5 seconds
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ show: false, type: '', message: '' });
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [notification.show]);
  
  const fetchRides = async () => {
    try {
      setLoading(true);
      // Use the authAxios instance that includes the token
      const response = await authAxios.get('/api/rides/pool/my-rides');
      console.log('Fetched rides:', response.data); // Debug log
      setRides(response.data);
      setLoading(false);
    } catch (err) {
      handleApiError(err, 'Failed to fetch rides');
      setLoading(false);
    }
  };
  
  // Handle API errors consistently
  const handleApiError = (err, defaultMessage) => {
    console.error(err);
    
    if (err.response) {
      if (err.response.status === 401) {
        setError('Your session has expired. Please log in again.');
      } else if (err.response.data && err.response.data.message) {
        setNotification({
          show: true,
          type: 'error',
          message: err.response.data.message
        });
      } else {
        setNotification({
          show: true,
          type: 'error',
          message: defaultMessage || 'An error occurred. Please try again.'
        });
      }
    } else if (err.request) {
      setNotification({
        show: true,
        type: 'error',
        message: 'Network error. Please check your connection.'
      });
    } else {
      setNotification({
        show: true,
        type: 'error',
        message: defaultMessage || 'An error occurred. Please try again.'
      });
    }
  };
  
  // Filter rides for booked and pending tabs
  const bookedRides = rides.filter(ride => 
    (filtering.status === 'all' || ride.status === filtering.status) &&
    (ride.origin.toLowerCase().includes(searchTerm.toLowerCase()) || 
     ride.destination.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (!filtering.date || ride.date === filtering.date)
  );
  
  const pendingRequests = rides.filter(ride => 
    ride.status === 'active' && 
    ride.passengers.some(passenger => passenger.status === 'pending') &&
    (ride.origin.toLowerCase().includes(searchTerm.toLowerCase()) || 
     ride.destination.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (!filtering.date || ride.date === filtering.date)
  );
  
  const handleRideClick = (ride) => {
    setSelectedRide(ride);
  };
  
  const handleRequestAction = async (rideId, passengerId, action) => {
    try {
      setActionInProgress(`${passengerId}-${action}`);
      
      // Use the authAxios instance for authenticated requests
      const response = await authAxios.put(`/api/rides/pool/${rideId}/passenger-request`, {
        passengerId,
        status: action
      });
      
      // Update state locally to reflect changes
      setRides(rides.map(ride => {
        if (ride._id === rideId) {
          // Find the passenger that we're updating
          const updatedPassengers = ride.passengers.map(passenger => {
            if (passenger.user === passengerId) {
              // Update passenger status
              return { ...passenger, status: action };
            }
            return passenger;
          });
          
          // Find the passenger to check previous status
          const targetPassenger = ride.passengers.find(p => p.user === passengerId);

          // Calculate new seats available
          let newSeatsAvailable = ride.seatsAvailable;
          
          if (action === 'accepted' && targetPassenger.status !== 'accepted') {
            // If accepting a new passenger, decrease available seats
            newSeatsAvailable = Math.max(0, ride.seatsAvailable - 1);
          } else if (action === 'rejected' && targetPassenger.status === 'accepted') {
            // If rejecting a previously accepted passenger, increase available seats
            newSeatsAvailable = ride.seatsAvailable + 1;
          }
          
          return {
            ...ride,
            passengers: updatedPassengers,
            seatsAvailable: newSeatsAvailable
          };
        }
        return ride;
      }));
      
      // Update the selected ride if it's open in the modal
      if (selectedRide && selectedRide._id === rideId) {
        const updatedPassengers = selectedRide.passengers.map(passenger => {
          if (passenger.user === passengerId) {
            return { ...passenger, status: action };
          }
          return passenger;
        });
        
        // Find the passenger to check previous status
        const targetPassenger = selectedRide.passengers.find(p => p.user === passengerId);
        
        // Calculate new seats available
        let newSeatsAvailable = selectedRide.seatsAvailable;
        
        if (action === 'accepted' && targetPassenger.status !== 'accepted') {
          newSeatsAvailable = Math.max(0, selectedRide.seatsAvailable - 1);
        } else if (action === 'rejected' && targetPassenger.status === 'accepted') {
          newSeatsAvailable = selectedRide.seatsAvailable + 1;
        }
        
        setSelectedRide({
          ...selectedRide,
          passengers: updatedPassengers,
          seatsAvailable: newSeatsAvailable
        });
      }
      
      // Show success message based on the action
      const passengerName = rides
        .find(r => r._id === rideId)?.passengers
        .find(p => p.user === passengerId)?.name || 'Passenger';
      
      setNotification({
        show: true,
        type: 'success',
        message: action === 'accepted' 
          ? `${passengerName}'s request has been approved` 
          : `${passengerName}'s request has been rejected`
      });
      
      // Close the request modal if no more pending requests
      const remainingPendingPassengers = rides
        .find(r => r._id === rideId)?.passengers
        .filter(p => p.user !== passengerId && p.status === 'pending');
      
      if (!remainingPendingPassengers || remainingPendingPassengers.length === 0) {
        setShowRequestModal(false);
      }
      
    } catch (err) {
      handleApiError(err, `Failed to ${action === 'accepted' ? 'approve' : 'reject'} request`);
    } finally {
      setActionInProgress('');
    }
  };
  
  const handleCancelRide = async (rideId) => {
    try {
      setActionInProgress('cancel');
      
      const response = await authAxios.put(`/api/rides/pool/${rideId}/cancel`, {
        reason: cancelReason
      });
      
      // Update ride status locally
      setRides(rides.map(ride => 
        ride._id === rideId 
          ? { ...ride, status: 'cancelled' } 
          : ride
      ));
      
      setSelectedRide(prev => prev ? {...prev, status: 'cancelled'} : null);
      setShowCancelConfirm(false);
      setCancelReason('');
      
      setNotification({
        show: true,
        type: 'success',
        message: 'Ride successfully cancelled'
      });
      
    } catch (err) {
      handleApiError(err, 'Failed to cancel ride');
    } finally {
      setActionInProgress('');
    }
  };
  
  // Handle token expiration or invalid token
  const handleAuthError = () => {
    // Clear token and redirect to login page
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    window.location.href = '/login';
  };
  
  const handleRefresh = () => {
    fetchRides();
    setNotification({
      show: true,
      type: 'info',
      message: 'Refreshing rides data...'
    });
  };
  
  const formatDate = (dateString) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  if (loading) {
    return (
      <div className="ptf-loading-container">
        <div className="ptf-loading-spinner"></div>
        <p>Loading rides...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="ptf-error-container">
        <div className="ptf-error">
          <FontAwesomeIcon icon={faTimes} className="ptf-error-icon" />
          <h3>Error</h3>
          <p>{error}</p>
          {error.includes('session has expired') && (
            <button onClick={handleAuthError} className="ptf-login-again-btn">
              Log in again
            </button>
          )}
        </div>
      </div>
    );
  }

  
  return (
    <div className="ptf-pool-rides-container">
      {notification.show && (
        <div className={`ptf-notification ptf-${notification.type}`}>
          <FontAwesomeIcon 
            icon={notification.type === 'success' ? faCheckCircle : faExclamationTriangle} 
            className="ptf-notification-icon" 
          />
          <p>{notification.message}</p>
          <button 
            className="ptf-close-notification"
            onClick={() => setNotification({ show: false, type: '', message: '' })}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      )}
      
      <div className="ptf-dashboard-header">
        <h1>My Pool Rides</h1>
        <div className="ptf-header-actions">
          <button 
            className="ptf-refresh-btn" 
            onClick={handleRefresh}
            disabled={loading}
          >
            <FontAwesomeIcon icon={faSync} spin={loading} /> Refresh
          </button>
          <button className="ptf-create-ride-btn" onClick={() => window.location.href = '/pooling/create'}>
            <FontAwesomeIcon icon={faPlus} /> Create Ride
          </button>
        </div>
      </div>
      
      <div className="ptf-search-filter-container">
        <div className="ptf-search-box">
          <FontAwesomeIcon icon={faSearch} />
          <input 
            type="text" 
            placeholder="Search by origin or destination" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="ptf-clear-search" onClick={() => setSearchTerm('')}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          )}
        </div>
        
        <div className="ptf-filter-options">
          <select 
            value={filtering.status} 
            onChange={(e) => setFiltering({...filtering, status: e.target.value})}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          
          <input 
            type="date" 
            value={filtering.date}
            onChange={(e) => setFiltering({...filtering, date: e.target.value})}
          />
          
          {(filtering.status !== 'all' || filtering.date) && (
            <button 
              className="ptf-clear-filters"
              onClick={() => setFiltering({status: 'all', date: ''})}
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>
      
      <div className="ptf-tabs">
        <button 
          className={activeTab === 'booked' ? 'ptf-tab ptf-active' : 'ptf-tab'}
          onClick={() => setActiveTab('booked')}
        >
          My Rides ({bookedRides.length})
        </button>
        <button 
          className={activeTab === 'pending' ? 'ptf-tab ptf-active' : 'ptf-tab'}
          onClick={() => setActiveTab('pending')}
        >
          Pending Requests 
          {pendingRequests.length > 0 && <span className="ptf-badge">{pendingRequests.length}</span>}
        </button>
      </div>
      
      {activeTab === 'booked' ? (
        <MyRides 
          rides={bookedRides}
          handleRideClick={handleRideClick}
          selectedRide={selectedRide}
          setSelectedRide={setSelectedRide}
          showCancelConfirm={showCancelConfirm}
          setShowCancelConfirm={setShowCancelConfirm}
          cancelReason={cancelReason}
          setCancelReason={setCancelReason}
          handleCancelRide={handleCancelRide}
          handleRequestAction={handleRequestAction}
          actionInProgress={actionInProgress}
          formatDate={formatDate}
        />
      ) : (
        <PendingRequests 
          pendingRequests={pendingRequests}
          selectedRide={selectedRide}
          setSelectedRide={setSelectedRide}
          showRequestModal={showRequestModal}
          setShowRequestModal={setShowRequestModal}
          handleRequestAction={handleRequestAction}
          actionInProgress={actionInProgress}
          formatDate={formatDate}
        />
      )}
    </div>
  );
};

export default PoolRidesDashboard;