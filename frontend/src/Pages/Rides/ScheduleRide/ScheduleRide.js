import React, { useState, useEffect } from 'react';
import './ScheduleRide.css';

const RideScheduling = () => {
  const [formData, setFormData] = useState({
    pickupLocation: '',
    destination: '',
    date: '',
    time: '',
    passengers: 1,
    rideType: 'standard',
    specialInstructions: '',
    savePreference: false
  });
  
  const [savedLocations, setSavedLocations] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [estimatedPrice, setEstimatedPrice] = useState(null);
  
  // Load saved locations from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('savedLocations');
    if (savedData) {
      setSavedLocations(JSON.parse(savedData));
    }
  }, []);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData({
      ...formData,
      [name]: newValue
    });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
    
    // Calculate estimated price when relevant fields change
    if (['pickupLocation', 'destination', 'rideType', 'passengers'].includes(name)) {
      if (formData.pickupLocation && formData.destination) {
        calculateEstimatedPrice();
      }
    }
  };
  
  const calculateEstimatedPrice = () => {
    // This would typically involve an API call to get a price estimate
    // For now, we'll use a simple calculation
    setIsLoading(true);
    
    setTimeout(() => {
      const basePrice = {
        'standard': 15,
        'premium': 25,
        'shared': 10
      }[formData.rideType];
      
      const passengerMultiplier = formData.rideType === 'shared' ? 1 : formData.passengers;
      const randomFactor = 0.8 + (Math.random() * 0.4); // Random factor between 0.8 and 1.2
      
      const price = (basePrice * passengerMultiplier * randomFactor).toFixed(2);
      setEstimatedPrice(price);
      setIsLoading(false);
    }, 1000);
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.pickupLocation.trim()) {
      newErrors.pickupLocation = 'Pickup location is required';
    }
    
    if (!formData.destination.trim()) {
      newErrors.destination = 'Destination is required';
    }
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.date = 'Date cannot be in the past';
      }
    }
    
    if (!formData.time) {
      newErrors.time = 'Time is required';
    } else if (formData.date === getCurrentDate()) {
      // Check if time is at least 30 minutes from now for same-day bookings
      const now = new Date();
      const selectedDateTime = new Date(formData.date + 'T' + formData.time);
      
      if ((selectedDateTime - now) < 30 * 60 * 1000) {
        newErrors.time = 'Time must be at least 30 minutes from now';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Save as frequent route if checkbox is checked
      if (formData.savePreference) {
        const newSavedLocation = {
          id: Date.now(),
          pickupLocation: formData.pickupLocation,
          destination: formData.destination
        };
        
        const updatedLocations = [...savedLocations, newSavedLocation];
        setSavedLocations(updatedLocations);
        localStorage.setItem('savedLocations', JSON.stringify(updatedLocations));
      }
      
      console.log('Ride scheduled:', formData);
      setIsLoading(false);
      setIsSubmitted(true);
      
      // Reset form after submission
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({
          pickupLocation: '',
          destination: '',
          date: '',
          time: '',
          passengers: 1,
          rideType: 'standard',
          specialInstructions: '',
          savePreference: false
        });
        setEstimatedPrice(null);
      }, 5000);
    }, 1500);
  };
  
  const handleSavedLocationSelect = (location) => {
    setFormData({
      ...formData,
      pickupLocation: location.pickupLocation,
      destination: location.destination
    });
    
    // Calculate price when selecting saved location
    setTimeout(() => calculateEstimatedPrice(), 100);
  };
  
  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    let month = today.getMonth() + 1;
    let day = today.getDate();
    
    month = month < 10 ? `0${month}` : month;
    day = day < 10 ? `0${day}` : day;
    
    return `${year}-${month}-${day}`;
  };
  
  const getRideTypeIcon = (type) => {
    switch (type) {
      case 'standard':
        return '🚗';
      case 'premium':
        return '🏎️';
      case 'shared':
        return '👥🚗';
      default:
        return '🚗';
    }
  };
  
  return (
    <div className="ride-scheduling-container">
      <div className="top">
        <h1>GlideWay</h1>
        <p>Schedule Your Ride</p>
      </div>
      
      {isSubmitted ? (
        <div className="success-message">
          <div className="checkmark">✓</div>
          <h2>Ride Scheduled!</h2>
          <p>Your ride has been successfully scheduled. Check your email for confirmation.</p>
          <div className="ride-details">
            <p><strong>From:</strong> {formData.pickupLocation}</p>
            <p><strong>To:</strong> {formData.destination}</p>
            <p><strong>When:</strong> {new Date(formData.date).toLocaleDateString()} at {formData.time}</p>
            <p><strong>Ride Type:</strong> {formData.rideType.charAt(0).toUpperCase() + formData.rideType.slice(1)}</p>
            <p><strong>Passengers:</strong> {formData.passengers}</p>
            {estimatedPrice && <p><strong>Estimated Price:</strong> ${estimatedPrice}</p>}
          </div>
        </div>
      ) : (
        <>
          {savedLocations.length > 0 && (
            <div className="saved-locations">
              <h3>Frequent Routes</h3>
              <div className="saved-locations-list">
                {savedLocations.map((location) => (
                  <div 
                    key={location.id} 
                    className="saved-location-item"
                    onClick={() => handleSavedLocationSelect(location)}
                  >
                    <div>
                      <strong>{location.pickupLocation}</strong> →
                      <strong>{location.destination}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <form className="ride-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="pickupLocation">Pickup Location</label>
              <input 
                type="text" 
                id="pickupLocation" 
                name="pickupLocation" 
                value={formData.pickupLocation} 
                onChange={handleChange} 
                placeholder="Enter pickup address"
                className={errors.pickupLocation ? 'error' : ''}
              />
              {errors.pickupLocation && <div className="error-message">{errors.pickupLocation}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="destination">Destination</label>
              <input 
                type="text" 
                id="destination" 
                name="destination" 
                value={formData.destination} 
                onChange={handleChange} 
                placeholder="Enter destination address"
                className={errors.destination ? 'error' : ''}
              />
              {errors.destination && <div className="error-message">{errors.destination}</div>}
            </div>
            
            <div className="form-row">
              <div className="form-group half">
                <label htmlFor="date">Date</label>
                <input 
                  type="date" 
                  id="date" 
                  name="date" 
                  value={formData.date} 
                  onChange={handleChange} 
                  min={getCurrentDate()}
                  className={errors.date ? 'error' : ''}
                />
                {errors.date && <div className="error-message">{errors.date}</div>}
              </div>
              
              <div className="form-group half">
                <label htmlFor="time">Time</label>
                <input 
                  type="time" 
                  id="time" 
                  name="time" 
                  value={formData.time} 
                  onChange={handleChange} 
                  className={errors.time ? 'error' : ''}
                />
                {errors.time && <div className="error-message">{errors.time}</div>}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group half">
                <label htmlFor="passengers">Passengers</label>
                <select 
                  id="passengers" 
                  name="passengers" 
                  value={formData.passengers} 
                  onChange={handleChange}
                >
                  {[1, 2, 3, 4].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group half">
                <label htmlFor="rideType">Ride Type</label>
                <select 
                  id="rideType" 
                  name="rideType" 
                  value={formData.rideType} 
                  onChange={handleChange}
                >
              
                  <option value="standard">Standard {getRideTypeIcon('standard')}</option>
                  <option value="premium">Premium {getRideTypeIcon('premium')}</option>
                  <option value="shared">Shared {getRideTypeIcon('shared')}</option>
                </select>
              </div>

              <div className="form-group half">
                <label htmlFor="rideType">Vechle Type</label>
                <select 
                  id="rideType" 
                  name="rideType" 
                  value={formData.rideType} 
                  onChange={handleChange}
                >
              
                  <option value="standard">Standard {getRideTypeIcon('standard')}</option>
                  <option value="premium">Premium {getRideTypeIcon('premium')}</option>
                  <option value="shared">Shared {getRideTypeIcon('shared')}</option>
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="specialInstructions">Special Instructions (Optional)</label>
              <textarea
                id="specialInstructions"
                name="specialInstructions"
                value={formData.specialInstructions}
                onChange={handleChange}
                placeholder="Any special instructions for the driver?"
                rows="3"
              />
            </div>
            
            {estimatedPrice && (
              <div className="estimated-price">
                <h3>Estimated Price: ${estimatedPrice}</h3>
                <p className="price-note">Final price may vary based on traffic and actual distance.</p>
              </div>
            )}
            
            <div className="save-preference">
              <input 
                type="checkbox" 
                id="savePreference" 
                name="savePreference"
                checked={formData.savePreference}
                onChange={handleChange}
              />
              <label htmlFor="savePreference">Save this as a frequent route</label>
            </div>
            
            <div className="form-group">
              <button 
                type="submit" 
                className={`schedule-button ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Schedule Ride'}
              </button>
            </div>
          </form>
        </>
      )}
      
    
    </div>
  );
};

export default RideScheduling;