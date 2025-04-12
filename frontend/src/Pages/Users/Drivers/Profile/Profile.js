import { useState, useEffect } from 'react';
import { Calendar, MapPin, Phone, Mail, Star, Award, Clock, Activity, User, Truck, FileText, DollarSign } from 'lucide-react';
import './Profile.css'; // Import the CSS file

export default function DriverProfile({ driverId }) {
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  useEffect(() => {
    // Fetch driver data from your API
    const fetchDriverData = async () => {
      try {
        setLoading(true);
        
        // Get the auth token from localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error("Authentication token not found. Please log in.");
        }
        
        // Extract the user ID from the JWT token since it's not stored separately
        let userId = null;
        try {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          
          const decoded = JSON.parse(jsonPayload);
          userId = decoded.id; // The user ID should be in the token payload
          
          // Store it for future use (this is optional)
          if (userId) localStorage.setItem('userId', userId);
        } catch (tokenErr) {
          console.error('Error decoding token:', tokenErr);
        }
        
        // Use provided driverId, or fall back to extracting ID from token
        // If both fail, use 'profile' endpoint to get current user's profile
        const effectiveDriverId = driverId || userId || 'me';
        
        console.log(`Fetching driver data for ID: ${effectiveDriverId}`);
        
        // Determine which endpoint to use based on if we're fetching the current user's profile or a specific driver
        const isCurrentUserProfile = effectiveDriverId === 'me' || (!driverId && !userId);
        const endpoint = isCurrentUserProfile ? 'profile' : effectiveDriverId;
        
        const apiUrl = `${process.env.REACT_APP_API_BASE_URL || ''}/api/driver/${endpoint}`;
        console.log(`Full request URL: ${apiUrl}`);
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => null) || await response.text();
          console.error('Error response:', errorData);
          throw new Error(
            typeof errorData === 'object' && errorData.msg 
              ? errorData.msg 
              : `Failed to fetch driver data: ${response.status}`
          );
        }
        
        const data = await response.json();
        console.log('Driver data received:', data);
        
        // Store the user ID from the response if we didn't have it before
        if (data._id && !localStorage.getItem('userId')) {
          localStorage.setItem('userId', data._id);
        }
        
        setDriver(data);
      } catch (err) {
        console.error('Error fetching driver:', err);
        setError(`${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchDriverData();
  }, [driverId]);

  // Display loading state with more details
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading">Loading driver profile...</div>
        <div className="loading-details">Driver ID: {driverId || 'Current user'}</div>
      </div>
    );
  }

  // Display error state with more informative message
  if (error) {
    return (
      <div className="error-container">
        <div className="error">Error: {error}</div>
        <div className="error-details">
          <p>Please check:</p>
          <ul>
            <li>Your network connection</li>
            <li>That you are logged in (authentication)</li>
            <li>That the driver ID is correct</li>
          </ul>
          <button 
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Display message if no driver found
  if (!driver) {
    return <div className="no-data">No driver data available. Please check the driver ID and try again.</div>;
  }

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'Invalid date';
    }
  };

  // Calculate years active based on account creation date
  const calculateYearsActive = () => {
    if (!driver.createdAt) return 0;
    try {
      const createdDate = new Date(driver.createdAt);
      const currentDate = new Date();
      const diffInYears = (currentDate - createdDate) / (1000 * 60 * 60 * 24 * 365);
      return Math.max(0, Math.floor(diffInYears));
    } catch (err) {
      console.error('Error calculating years active:', err);
      return 0;
    }
  };

  // Format license expiry date
  const formatLicenseExpiry = () => {
    return formatDate(driver.license_expiry);
  };

  // Generate stats for the driver
  const generateStats = () => {
    // Default values in case properties are undefined
    const completionRate = driver.completed_rides > 0 ? "98%" : "N/A";
    const availability = driver.availability ? "Active" : "Inactive";
    const rating = driver.rating > 0 ? `${driver.rating.toFixed(1)}/5` : "N/A";
    const walletBalance = driver.wallet_balance !== undefined ? 
      `$${driver.wallet_balance.toFixed(2)}` : "$0.00";
    
    return [
      { label: "Completion Rate", value: completionRate },
      { label: "Availability", value: availability },
      { label: "Avg. Rating", value: rating },
      { label: "Wallet Balance", value: walletBalance }
    ];
  };

  // Get recent trips - use ride_history if available or mock data
  const getRecentTrips = () => {
    if (!driver.ride_history || driver.ride_history.length === 0) {
      return [
        { date: "No recent trips available", from: "-", to: "-", amount: "-", status: "-" }
      ];
    }
    
    // In a real application, you would map through the ride_history
    // This is just placeholder data
    return [
      { date: "Apr 8, 2025", from: "Downtown", to: "Airport", amount: "$45.30", status: "Completed" },
      { date: "Apr 6, 2025", from: "Uptown", to: "Downtown", amount: "$32.50", status: "Completed" },
      { date: "Apr 4, 2025", from: "Airport", to: "Suburbs", amount: "$55.75", status: "Completed" }
    ];
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="tab-content">
            <div className="stats-container">
              <div className="stats-card">
                <h3>Driver Stats</h3>
                <div className="stats-grid">
                  {generateStats().map((stat, index) => (
                    <div key={index} className="stat-item">
                      <p className="stat-label">{stat.label}</p>
                      <p className="stat-value">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="stats-card">
                <h3>License Information</h3>
                <div className="license-info">
                  <div className="license-item">
                    <p className="license-label">License Number</p>
                    <p className="license-value">{driver.license_number || 'Not available'}</p>
                  </div>
                  <div className="license-item">
                    <p className="license-label">State</p>
                    <p className="license-value">{driver.license_state || 'Not available'}</p>
                  </div>
                  <div className="license-item">
                    <p className="license-label">Expiry Date</p>
                    <p className="license-value">{formatLicenseExpiry()}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="additional-info-card">
              <h3>Personal Information</h3>
              <div className="info-item">
                <User className="info-icon" />
                <span>Age: {driver.age || 'Not available'}</span>
              </div>
              <div className="info-item">
                <User className="info-icon" />
                <span>Gender: {driver.gender ? driver.gender.charAt(0).toUpperCase() + driver.gender.slice(1) : 'Not specified'}</span>
              </div>
              {driver.referral_code && (
                <div className="info-item">
                  <FileText className="info-icon" />
                  <span>Referral Code: {driver.referral_code}</span>
                </div>
              )}
              <div className="info-item">
                <Activity className="info-icon" />
                <span>Account Status: {driver.status ? driver.status.charAt(0).toUpperCase() + driver.status.slice(1) : 'Unknown'}</span>
              </div>
            </div>
          </div>
        );
      case 'vehicles':
        return (
          <div className="vehicle-card">
            <h3>Registered Vehicle</h3>
            {driver.vehicle_details ? (
              <div className="vehicle-list">
                <div className="vehicle-item">
                  <div className="vehicle-icon">
                    <span>{driver.vehicle_details.year || 'N/A'}</span>
                  </div>
                  <div className="vehicle-details">
                    <p className="vehicle-model">
                      {driver.vehicle_details.make || 'N/A'} {driver.vehicle_details.model || 'N/A'}
                    </p>
                    <p className="vehicle-info">
                      Registration: {driver.vehicle_details.registration_number || 'N/A'} • 
                      Color: {driver.vehicle_details.color || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="no-vehicle-data">No vehicle information available</div>
            )}
            <div className="vehicle-documents mt-4">
              <h4>Vehicle Documents</h4>
              <div className="document-links">
                {driver.vehicle_insurance_url ? (
                  <a href={driver.vehicle_insurance_url} target="_blank" rel="noopener noreferrer" className="document-link">
                    <FileText className="document-icon" />
                    <span>View Insurance Document</span>
                  </a>
                ) : (
                  <div className="document-link disabled">
                    <FileText className="document-icon" />
                    <span>Insurance Document Not Available</span>
                  </div>
                )}
                
                {driver.license_front_url ? (
                  <a href={driver.license_front_url} target="_blank" rel="noopener noreferrer" className="document-link">
                    <FileText className="document-icon" />
                    <span>View License (Front)</span>
                  </a>
                ) : (
                  <div className="document-link disabled">
                    <FileText className="document-icon" />
                    <span>License Front Not Available</span>
                  </div>
                )}
                
                {driver.license_back_url ? (
                  <a href={driver.license_back_url} target="_blank" rel="noopener noreferrer" className="document-link">
                    <FileText className="document-icon" />
                    <span>View License (Back)</span>
                  </a>
                ) : (
                  <div className="document-link disabled">
                    <FileText className="document-icon" />
                    <span>License Back Not Available</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case 'trips':
        return (
          <div className="trips-card">
            <h3>Recent Trips</h3>
            <div className="trips-table-container">
              <table className="trips-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Route</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {getRecentTrips().map((trip, index) => (
                    <tr key={index}>
                      <td>{trip.date}</td>
                      <td>
                        <span>{trip.from}</span> <span className="route-arrow">→</span> <span>{trip.to}</span>
                      </td>
                      <td className="trip-amount">{trip.amount}</td>
                      <td>
                        <span className="trip-status">{trip.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="trip-summary">
              <h4>Trip Summary</h4>
              <div className="trip-stats">
                <div className="trip-stat">
                  <span className="trip-stat-label">Total Trips:</span>
                  <span className="trip-stat-value">{driver.completed_rides || 0}</span>
                </div>
                <div className="trip-stat">
                  <span className="trip-stat-label">Earnings:</span>
                  <span className="trip-stat-value">${driver.wallet_balance !== undefined ? driver.wallet_balance.toFixed(2) : '0.00'}</span>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Safely get the rating
  const getFormattedRating = () => {
    return driver.rating !== undefined ? driver.rating.toFixed(1) : "N/A";
  };

  // Determine if current user is an admin
  const isAdmin = () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;
      
      // Decode JWT token (simple approach - in production use a proper JWT library)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const decoded = JSON.parse(jsonPayload);
      return decoded.role === 'admin';
    } catch (err) {
      console.error('Error determining admin status:', err);
      return false;
    }
  };

  // Update driver status function
  const updateDriverStatus = async (status) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      if (!driver._id) {
        throw new Error('Driver ID is missing');
      }
      
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || ''}/api/driver/${driver._id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.msg || `Failed to update driver status: ${response.status}`);
      }
      
      const updatedDriver = await response.json();
      setDriver(updatedDriver);
      alert(`Driver status updated to: ${status}`);
    } catch (err) {
      console.error('Error updating driver status:', err);
      alert(`Failed to update driver status: ${err.message}`);
    }
  };

  return (
    <div className="driver-profile">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-header-content">
            <div className="profile-image-container">
              <img 
                src={driver.profile_picture_url} 
                alt={driver.name || "Driver"} 
                className="profile-image"
                onError={(e) => {
                  console.error("Error loading image, falling back to placeholder");
                  e.target.src = "https://www.iconpacks.net/icons/2/free-user-icon-3296-thumb.png";
                }}
              />
            </div>
            <div className="profile-info">
              <h1>{driver.name || "Unknown Driver"}</h1>
              <p className="driver-id">Driver ID: {driver._id || "Not available"}</p>
              <div className="driver-stats">
                <Star className="star-icon" />
                <span className="rating">{getFormattedRating()}</span>
                <span className="separator">•</span>
                <span>{driver.completed_rides || 0} rides</span>
                <span className="separator">•</span>
                <span>{calculateYearsActive()} years</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="contact-info">
          <div className="contact-item">
            <MapPin className="contact-icon" />
            <span>{driver.location?.latitude && driver.location?.longitude ? 
              `${driver.location.latitude.toFixed(4)}, ${driver.location.longitude.toFixed(4)}` : 
              "Location not available"}</span>
          </div>
          <div className="contact-item">
            <Phone className="contact-icon" />
            <span>{driver.phone_number || "Phone not available"}</span>
          </div>
          <div className="contact-item">
            <Mail className="contact-icon" />
            <span>{driver.email || "Email not available"}</span>
          </div>
        </div>
        
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`tab ${activeTab === 'vehicles' ? 'active' : ''}`}
            onClick={() => setActiveTab('vehicles')}
          >
            Vehicle
          </button>
          <button
            className={`tab ${activeTab === 'trips' ? 'active' : ''}`}
            onClick={() => setActiveTab('trips')}
          >
            Trip History
          </button>
        </div>
        
        <div className="tab-content-container">
          {renderTabContent()}
        </div>
      </div>
      
      <div className="action-buttons">
        <button className="primary-button">Message Driver</button>
        <button className="secondary-button">Export Data</button>
        {driver.is_verified === false && isAdmin() && (
          <button 
            className="warning-button"
            onClick={() => updateDriverStatus('approved')}
          >
            Verify Account
          </button>
        )}
        {driver.status === 'pending' && isAdmin() && (
          <button 
            className="success-button"
            onClick={() => updateDriverStatus('approved')}
          >
            Approve Driver
          </button>
        )}
        {driver.status === 'approved' && isAdmin() && (
          <button 
            className="danger-button"
            onClick={() => updateDriverStatus('rejected')}
          >
            Reject Driver
          </button>
        )}
      </div>
    </div>
  );
}