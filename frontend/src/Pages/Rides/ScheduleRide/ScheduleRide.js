import React, { useState } from 'react';
import './ScheduleRide.css';

const RideScheduling = () => {
  const [formData, setFormData] = useState({
    pickupLocation: '',
    destination: '',
    date: '',
    time: '',
    passengers: 1,
    rideType: 'standard'
  });
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    console.log('Ride scheduled:', formData);
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
        rideType: 'standard'
      });
    }, 3000);
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
  
  return (
    <div className="ride-scheduling-container">
      <div className="header">
        <h1>GlideWay</h1>
        <p>Schedule Your Ride</p>
      </div>
      
      {isSubmitted ? (
        <div className="success-message">
          <div className="checkmark">✓</div>
          <h2>Ride Scheduled!</h2>
          <p>Your ride has been successfully scheduled. Check your email for confirmation.</p>
        </div>
      ) : (
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
              required 
            />
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
              required 
            />
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
                required 
              />
            </div>
            
            <div className="form-group half">
              <label htmlFor="time">Time</label>
              <input 
                type="time" 
                id="time" 
                name="time" 
                value={formData.time} 
                onChange={handleChange} 
                required 
              />
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
                required
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
                required
              >
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
                <option value="shared">Shared</option>
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <button type="submit" className="schedule-button">Schedule Ride</button>
          </div>
          
          <div className="save-preference">
            <input 
              type="checkbox" 
              id="savePreference" 
              name="savePreference" 
            />
            <label htmlFor="savePreference">Save this as a frequent route</label>
          </div>
        </form>
      )}
      
      <div className="footer">
        <p>Need help? Contact support at support@glideway.com</p>
      </div>
    </div>
  );
};

export default RideScheduling;