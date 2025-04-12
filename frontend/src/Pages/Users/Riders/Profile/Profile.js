import { useState, useEffect } from 'react';
import axios from 'axios';
import './Profile.css';

// Component for displaying loading state
const LoadingState = () => (
  <div className="ridp-loading-container">
    <div className="ridp-spinner"></div>
    <p>Loading profile data...</p>
  </div>
);

// Component for displaying error state
const ErrorState = ({ error, onRetry }) => (
  <div className="ridp-error-container">
    <h2>Error Loading Profile</h2>
    <p>{error}</p>
    <button onClick={onRetry}>Try Again</button>
  </div>
);

// Component for the profile header
const ProfileHeader = ({ rider }) => (
  <div className="ridp-profile-header">
    <div className="ridp-header-content">
      <div className="ridp-profile-image-container">
        <img 
          src={rider.profile_picture_url } 
          alt={`${rider.name}'s profile`} 
          className="ridp-profile-image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/api/placeholder/150/150";
          }}
        />
        {rider.is_verified && (
          <span className="ridp-verification-badge">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </span>
        )}
      </div>
      
      <div className="ridp-profile-basic-info">
        <h1>{rider.name}</h1>
        <div className="ridp-contact-info">
          <div className="ridp-contact-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            <span>{rider.email}</span>
          </div>
          <div className="ridp-contact-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
            <span>{rider.phone_number || "Not provided"}</span>
          </div>
        </div>
      </div>
      
      <div className="ridp-wallet-info">
        <div className="ridp-wallet-balance">
          <div className="ridp-balance-display">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path>
              <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path>
              <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path>
            </svg>
            <span>${(rider.wallet_balance || 0).toFixed(2)}</span>
          </div>
          <div className="ridp-balance-label">Wallet Balance</div>
        </div>
        
        <div className="ridp-payment-preference">
          {rider.preferred_payment === "wallet" ? "Wallet" : 
          rider.preferred_payment === "card" ? "Credit Card" : "Cash"}
        </div>
      </div>
    </div>
  </div>
);

// Component for navigation tabs
const ProfileTabs = ({ activeTab, setActiveTab }) => (
  <div className="ridp-profile-tabs">
    <nav>
      <button 
        onClick={() => setActiveTab('profile')}
        className={activeTab === 'profile' ? 'ridp-active' : ''}
      >
        Personal Info
      </button>
      <button 
        onClick={() => setActiveTab('rides')}
        className={activeTab === 'rides' ? 'ridp-active' : ''}
      >
        Ride History
      </button>
      <button 
        onClick={() => setActiveTab('locations')}
        className={activeTab === 'locations' ? 'ridp-active' : ''}
      >
        Saved Locations
      </button>
    </nav>
  </div>
);

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return "Not provided";
  
  try {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  } catch (error) {
    console.error("Date formatting error:", error);
    return "Invalid date";
  }
};

// Helper function to format date and time
const formatDateTime = (dateString) => {
  if (!dateString) return "Not provided";
  
  try {
    return new Date(dateString).toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error("DateTime formatting error:", error);
    return "Invalid date";
  }
};

// Helper function to calculate age
const calculateAge = (dob) => {
  if (!dob) return null;
  
  try {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  } catch (error) {
    console.error("Age calculation error:", error);
    return null;
  }
};

// Modal component for edit profile
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  
  return (
    <div className="ridp-modal-overlay">
      <div className="ridp-modal-container">
        <div className="ridp-modal-header">
          <h2>{title}</h2>
          <button className="ridp-close-button" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div className="ridp-modal-content">
          {children}
        </div>
      </div>
    </div>
  );
};

// Edit Profile Form Component
const EditProfileForm = ({ rider, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: rider.name || '',
    email: rider.email || '',
    phone_number: rider.phone_number || '',
    gender: rider.gender || '',
    dob: rider.dob ? new Date(rider.dob).toISOString().substr(0, 10) : '',
    preferred_payment: rider.preferred_payment || 'cash'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authorization token not found');
      }
      
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      const baseUrl = process.env.REACT_APP_API_BASE_URL || '';
      await axios.put(`${baseUrl}/api/profile`, formData, config);
      
      setSuccess(true);
      setTimeout(() => {
        onSave(formData);
      }, 1500);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="ridp-edit-profile-form">
      {error && <div className="ridp-form-error">{error}</div>}
      {success && <div className="ridp-form-success">Profile updated successfully!</div>}
      
      <div className="ridp-form-group">
        <label htmlFor="name">Full Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="ridp-form-group">
        <label htmlFor="email">Email Address</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="ridp-form-group">
        <label htmlFor="phone_number">Phone Number</label>
        <input
          type="tel"
          id="phone_number"
          name="phone_number"
          value={formData.phone_number}
          onChange={handleChange}
        />
      </div>
      
      <div className="ridp-form-group">
        <label htmlFor="gender">Gender</label>
        <select
          id="gender"
          name="gender"
          value={formData.gender}
          onChange={handleChange}
        >
          <option value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
          <option value="prefer_not_to_say">Prefer not to say</option>
        </select>
      </div>
      
      <div className="ridp-form-group">
        <label htmlFor="dob">Date of Birth</label>
        <input
          type="date"
          id="dob"
          name="dob"
          value={formData.dob}
          onChange={handleChange}
        />
      </div>
      
      <div className="ridp-form-group">
        <label htmlFor="preferred_payment">Preferred Payment Method</label>
        <select
          id="preferred_payment"
          name="preferred_payment"
          value={formData.preferred_payment}
          onChange={handleChange}
        >
          <option value="wallet">Wallet</option>
          <option value="card">Credit Card</option>
          <option value="cash">Cash</option>
        </select>
      </div>
      
      <div className="ridp-form-actions">
        <button 
          type="button" 
          className="ridp-secondary-button" 
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className="ridp-primary-button"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

// Component for Personal Info tab
const PersonalInfoTab = ({ rider, onEditProfile }) => (
  <div className="ridp-profile-section">
    <h2>Personal Information</h2>
    
    <div className="ridp-info-grid">
      <div className="ridp-info-card">
        <h3>Gender</h3>
        <p>{rider.gender || "Not specified"}</p>
      </div>
      
      <div className="ridp-info-card">
        <h3>Date of Birth</h3>
        <p>{formatDate(rider.dob)}</p>
      </div>
      
      <div className="ridp-info-card">
        <h3>Age</h3>
        <p>{rider.age || (rider.dob ? calculateAge(rider.dob) : "Not provided")}</p>
      </div>
      
      <div className="ridp-info-card">
        <h3>Account Status</h3>
        <div>
          {rider.is_verified ? (
            <span className="ridp-status-badge ridp-verified">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Verified
            </span>
          ) : (
            <span className="ridp-status-badge ridp-not-verified">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
              Not Verified
            </span>
          )}
        </div>
      </div>

      <div className="ridp-info-card">
        <h3>Payment Preference</h3>
        <div className="ridp-icon-text">
          {rider.preferred_payment === "wallet" && (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path>
              <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path>
              <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path>
            </svg>
          )}
          {rider.preferred_payment === "card" && (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
              <line x1="1" y1="10" x2="23" y2="10"></line>
            </svg>
          )}
          {rider.preferred_payment === "cash" && (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="6" width="20" height="12" rx="2"></rect>
              <circle cx="12" cy="12" r="2"></circle>
              <path d="M6 12h.01M18 12h.01"></path>
            </svg>
          )}
          <span className="ridp-capitalize">{rider.preferred_payment || "Not set"}</span>
        </div>
      </div>
      
      <div className="ridp-info-card">
        <h3>Member Since</h3>
        <p>{formatDate(rider.createdAt)}</p>
      </div>
    </div>
    
    <div className="ridp-action-buttons">
      <button className="ridp-primary-button" onClick={onEditProfile}>Edit Profile</button>
    </div>
  </div>
);

// Component for Rides tab
const RidesTab = ({ rider }) => {
  // Check if ride_history exists and is an array
  const hasRideHistory = rider.ride_history && Array.isArray(rider.ride_history) && rider.ride_history.length > 0;
  
  // If ride_history is not properly populated (due to the Mongoose error), it might be ObjectIds instead of full objects
  const isRideHistoryPopulated = hasRideHistory && typeof rider.ride_history[0] !== 'string';
  
  return (
    <div className="ridp-rides-section">
      <div className="ridp-section-header">
        <h2>Recent Rides</h2>
        <button className="ridp-text-link">View All</button>
      </div>
      
      <div className="ridp-rides-list">
        {isRideHistoryPopulated ? (
          rider.ride_history.map(ride => (
            <div key={ride._id} className="ridp-ride-card">
              <div className="ridp-ride-info">
                <h3>{ride.destination}</h3>
                <div className="ridp-ride-time">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  {formatDateTime(ride.createdAt)}
                </div>
              </div>
              <div className="ridp-ride-price">
                <div className="ridp-price">${ride.amount ? ride.amount.toFixed(2) : "0.00"}</div>
                <div className="ridp-receipt-link">Receipt</div>
              </div>
            </div>
          ))
        ) : (
          <div className="ridp-empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <p>No ride history found</p>
            <p className="ridp-empty-state-subtitle">Your completed trips will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Component for Locations tab
const LocationsTab = ({ rider }) => {
  const hasHomeLocation = rider.home_location && (rider.home_location.latitude || rider.home_location.longitude);
  const hasWorkLocation = rider.work_location && (rider.work_location.latitude || rider.work_location.longitude);
  
  return (
    <div className="ridp-locations-section">
      <h2>Saved Locations</h2>
      
      <div className="ridp-locations-list">
        {hasHomeLocation ? (
          <div className="ridp-location-card">
            <div className="ridp-location-content">
              <div className="ridp-location-icon ridp-home">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
              </div>
              <div className="ridp-location-details">
                <h3>Home</h3>
                <p className="ridp-coordinates">
                  Lat: {rider.home_location.latitude ? rider.home_location.latitude.toFixed(4) : "N/A"}, 
                  Long: {rider.home_location.longitude ? rider.home_location.longitude.toFixed(4) : "N/A"}
                </p>
                <button className="ridp-text-link">Edit Location</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="ridp-empty-location-card">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <p>No home location saved</p>
            <button className="ridp-text-link">Add Home Location</button>
          </div>
        )}
        
        {hasWorkLocation ? (
          <div className="ridp-location-card">
            <div className="ridp-location-content">
              <div className="ridp-location-icon ridp-work">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
              </div>
              <div className="ridp-location-details">
                <h3>Work</h3>
                <p className="ridp-coordinates">
                  Lat: {rider.work_location.latitude ? rider.work_location.latitude.toFixed(4) : "N/A"}, 
                  Long: {rider.work_location.longitude ? rider.work_location.longitude.toFixed(4) : "N/A"}
                </p>
                <button className="ridp-text-link">Edit Location</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="ridp-empty-location-card">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
            <p>No work location saved</p>
            <button className="ridp-text-link">Add Work Location</button>
          </div>
        )}
        
        <button className="ridp-add-location-button">Add New Location</button>
      </div>
    </div>
  );
};

// Main component
export default function RiderProfile() {
  const [rider, setRider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  
  const fetchRiderData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authorization token not found');
      }
      
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      
      const baseUrl = process.env.REACT_APP_API_BASE_URL || '';
      const response = await axios.get(`${baseUrl}/api/profile`, config);
      
      setRider(response.data);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchRiderData();
  }, []);
  
  const handleEditProfileSave = (updatedData) => {
    setRider(prevState => ({
      ...prevState,
      ...updatedData
    }));
    setIsEditProfileModalOpen(false);
  };
  
  // Render loading state
  if (loading) {
    return <LoadingState />;
  }
  
  // Render error state
  if (error) {
    return <ErrorState error={error} onRetry={fetchRiderData} />;
  }
  
  // Render main content when data is loaded
  return (
    <div className="ridp-rider-profile">
      <ProfileHeader rider={rider} />
      
      <div className="ridp-profile-container">
        <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <div className="ridp-tab-content">
          {activeTab === 'profile' && (
            <PersonalInfoTab 
              rider={rider} 
              onEditProfile={() => setIsEditProfileModalOpen(true)}
            />
          )}
          
          {activeTab === 'rides' && (
            <RidesTab rider={rider} />
          )}
          
          {activeTab === 'locations' && (
            <LocationsTab rider={rider} />
          )}
        </div>
      </div>
      
      {/* Edit Profile Modal */}
      <Modal 
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
        title="Edit Profile"
      >
        <EditProfileForm 
          rider={rider}
          onSave={handleEditProfileSave}
          onCancel={() => setIsEditProfileModalOpen(false)}
        />
      </Modal>
    </div>
  );
}