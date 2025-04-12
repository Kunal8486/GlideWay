import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './EditPooling.css';

const EditRide = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [rideData, setRideData] = useState({
    origin: '',
    destination: '',
    date: '',
    time: '',
    seats: 0,
    fare: 0,
    vehicleType: '',
    notes: '',
    isRecurringRide: false,
    recurringDays: [],
    allowDetour: false,
    maxDetourDistance: 2,
    maxWaitTime: 10,
    isFlexiblePickup: false,
    pickupRadius: 1
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [acceptedPassengers, setAcceptedPassengers] = useState(0);
  
  // Create axios instance with auth header
  const authAxios = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  useEffect(() => {
    // Fetch ride data
    const fetchRide = async () => {
      try {
        setLoading(true);
        const response = await authAxios.get(`/api/rides/pool/my-rides`);
        const rides = response.data;
        
        // Find the specific ride by ID
        const ride = rides.find(r => r._id === id);
        
        if (!ride) {
          setError('Ride not found');
          setLoading(false);
          return;
        }
        
        // Count accepted passengers
        const acceptedCount = ride.passengers.filter(p => p.status === 'accepted').length;
        setAcceptedPassengers(acceptedCount);
        
        // Map the ride data to form state
        setRideData({
          origin: ride.origin,
          destination: ride.destination,
          date: ride.date,
          time: ride.time,
          seats: ride.seats,
          fare: ride.fare,
          vehicleType: ride.vehicleType,
          notes: ride.notes || '',
          isRecurringRide: ride.isRecurringRide || false,
          recurringDays: ride.recurringDays || [],
          allowDetour: ride.allowDetour || false,
          maxDetourDistance: ride.maxDetourDistance || 2,
          maxWaitTime: ride.maxWaitTime || 10,
          isFlexiblePickup: ride.isFlexiblePickup || false,
          pickupRadius: ride.pickupRadius || 1
        });
        
        setLoading(false);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          setError('Your session has expired. Please log in again.');
          setTimeout(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            window.location.href = '/login';
          }, 2000);
        } else {
          setError('Failed to fetch ride data');
        }
        setLoading(false);
        console.error(err);
      }
    };
    
    fetchRide();
  }, [id]);
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle different input types
    if (type === 'checkbox') {
      setRideData({ ...rideData, [name]: checked });
    } else if (type === 'number') {
      setRideData({ ...rideData, [name]: parseInt(value, 10) });
    } else {
      setRideData({ ...rideData, [name]: value });
    }
  };
  
  const handleRecurringDayToggle = (day) => {
    const days = [...rideData.recurringDays];
    
    if (days.includes(day)) {
      // Remove day if already selected
      const index = days.indexOf(day);
      days.splice(index, 1);
    } else {
      // Add day if not selected
      days.push(day);
    }
    
    setRideData({ ...rideData, recurringDays: days });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    
    // Validate seat count against accepted passengers
    if (rideData.seats < acceptedPassengers) {
      setSubmitError(`Cannot reduce seats below number of accepted passengers (${acceptedPassengers})`);
      return;
    }
    
    try {
      await authAxios.put(`/api/rides/pool/${id}/update`, rideData);
      
      // Redirect back to rides dashboard
      navigate('/my-rides');
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setSubmitError('Your session has expired. Please log in again.');
        setTimeout(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          window.location.href = '/login';
        }, 2000);
      } else if (err.response && err.response.data.msg) {
        setSubmitError(err.response.data.msg);
      } else {
        setSubmitError('Failed to update ride');
      }
      console.error(err);
    }
  };
  
  const handleCancel = () => {
    navigate('/my-rides');
  };
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading ride data...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="error-container">
        <div className="error">
          <i className="icon-error"></i>
          <h3>Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="edit-ride-container">
      <div className="page-header">
        <h1>Edit Ride</h1>
      </div>
      
      <form onSubmit={handleSubmit} className="ride-form">
        {submitError && (
          <div className="error-banner">
            <p>{submitError}</p>
          </div>
        )}
        
        <div className="form-section">
          <h2>Ride Details</h2>
          
          <div className="form-group">
            <label htmlFor="origin">Origin</label>
            <input
              type="text"
              id="origin"
              name="origin"
              value={rideData.origin}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="destination">Destination</label>
            <input
              type="text"
              id="destination"
              name="destination"
              value={rideData.destination}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">Date</label>
              <input
                type="date"
                id="date"
                name="date"
                value={rideData.date}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="time">Time</label>
              <input
                type="time"
                id="time"
                name="time"
                value={rideData.time}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="seats">
                Available Seats
                {acceptedPassengers > 0 && (
                  <span className="hint">
                    (min: {acceptedPassengers} - passengers already accepted)
                  </span>
                )}
              </label>
              <input
                type="number"
                id="seats"
                name="seats"
                min={acceptedPassengers}
                value={rideData.seats}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="fare">Fare per Seat ($)</label>
              <input
                type="number"
                id="fare"
                name="fare"
                min="0"
                step="0.01"
                value={rideData.fare}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="vehicleType">Vehicle Type</label>
            <select
              id="vehicleType"
              name="vehicleType"
              value={rideData.vehicleType}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Vehicle Type</option>
              <option value="Sedan">Sedan</option>
              <option value="SUV">SUV</option>
              <option value="Hatchback">Hatchback</option>
              <option value="Van">Van</option>
              <option value="Minivan">Minivan</option>
              <option value="Truck">Truck</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="notes">Additional Notes (Optional)</label>
            <textarea
              id="notes"
              name="notes"
              value={rideData.notes}
              onChange={handleInputChange}
              rows="3"
              placeholder="Add any special instructions or information for passengers..."
            />
          </div>
        </div>
        
        <div className="form-section">
          <h2>Advanced Options</h2>
          
          <div className="form-group checkbox-group">
            <input
              type="checkbox"
              id="isRecurringRide"
              name="isRecurringRide"
              checked={rideData.isRecurringRide}
              onChange={handleInputChange}
            />
            <label htmlFor="isRecurringRide">
              This is a recurring ride
            </label>
          </div>
          
          {rideData.isRecurringRide && (
            <div className="recurring-days">
              <label>Repeat on:</label>
              <div className="days-selector">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                  <div key={day} className="day-option">
                    <input
                      type="checkbox"
                      id={`day-${day}`}
                      checked={rideData.recurringDays.includes(day)}
                      onChange={() => handleRecurringDayToggle(day)}
                    />
                    <label htmlFor={`day-${day}`}>{day.substring(0, 3)}</label>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="form-group checkbox-group">
            <input
              type="checkbox"
              id="allowDetour"
              name="allowDetour"
              checked={rideData.allowDetour}
              onChange={handleInputChange}
            />
            <label htmlFor="allowDetour">
              Allow detours for pickups
            </label>
          </div>
          
          {rideData.allowDetour && (
            <div className="detour-options">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="maxDetourDistance">Max Detour Distance (miles)</label>
                  <input
                    type="number"
                    id="maxDetourDistance"
                    name="maxDetourDistance"
                    min="0.5"
                    step="0.5"
                    value={rideData.maxDetourDistance}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="maxWaitTime">Max Wait Time (minutes)</label>
                  <input
                    type="number"
                    id="maxWaitTime"
                    name="maxWaitTime"
                    min="1"
                    value={rideData.maxWaitTime}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          )}
          
          <div className="form-group checkbox-group">
            <input
              type="checkbox"
              id="isFlexiblePickup"
              name="isFlexiblePickup"
              checked={rideData.isFlexiblePickup}
              onChange={handleInputChange}
            />
            <label htmlFor="isFlexiblePickup">
              Flexible pickup location
            </label>
          </div>
          
          {rideData.isFlexiblePickup && (
            <div className="form-group">
              <label htmlFor="pickupRadius">Pickup Radius (miles)</label>
              <input
                type="number"
                id="pickupRadius"
                name="pickupRadius"
                min="0.1"
                step="0.1"
                value={rideData.pickupRadius}
                onChange={handleInputChange}
              />
            </div>
          )}
        </div>
        
        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={handleCancel}>
            Cancel
          </button>
          <button type="submit" className="save-btn">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditRide;