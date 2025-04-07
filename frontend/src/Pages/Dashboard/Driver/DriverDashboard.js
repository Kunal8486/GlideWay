import React, { useState, useEffect } from 'react';
import './DriverDashboard.css';

const DriverDashboard = () => {
  // State management
  const [isOnline, setIsOnline] = useState(false);
  const [currentRide, setCurrentRide] = useState(null);
  const [pendingRides, setPendingRides] = useState([]);
  const [earnings, setEarnings] = useState({
    today: 0,
    week: 142.75,
    month: 1245.50
  });
  const [stats, setStats] = useState({
    totalRides: 48,
    acceptanceRate: 92,
    rating: 4.8,
    cancelRate: 3,
    completionRate: 97
  });
  const [currentLocation, setCurrentLocation] = useState('Downtown Area');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'info',
      message: 'Surge pricing active in Downtown area. 1.8x boost!',
      time: '10 mins ago'
    },
    {
      id: 2,
      type: 'promo',
      message: 'Complete 10 rides today to earn a $25 bonus',
      time: '1 hour ago'
    }
  ]);
  const [opportunities, setOpportunities] = useState([
    {
      id: 'opp1',
      type: 'surge',
      location: 'Downtown',
      multiplier: '1.8x',
      distance: '2.3 miles'
    },
    {
      id: 'opp2',
      type: 'event',
      location: 'Convention Center',
      description: 'Tech Conference ending',
      time: '8:00 PM',
      distance: '4.1 miles'
    }
  ]);

  // Mock data for pending rides
  useEffect(() => {
    if (isOnline && !pendingRides.length && !currentRide) {
      const mockRides = [
        {
          id: 'ride-1',
          passenger: 'Alex Miller',
          pickupLocation: '123 Main St',
          dropoffLocation: '456 Elm St',
          distance: '3.2 miles',
          estimatedEarning: '$12.50',
          estimatedTime: '15 mins',
          passengerRating: 4.7,
          rideType: 'Standard'
        },
        {
          id: 'ride-2',
          passenger: 'Jamie Smith',
          pickupLocation: '789 Oak Ave',
          dropoffLocation: '321 Pine Rd',
          distance: '5.7 miles',
          estimatedEarning: '$18.75',
          estimatedTime: '22 mins',
          passengerRating: 4.9,
          rideType: 'Premium'
        }
      ];

      // Simulate incoming ride requests
      const timer = setTimeout(() => {
        setPendingRides(mockRides);
        // Play notification sound
        const audio = new Audio('/notification.mp3');
        audio.play().catch(e => console.log('Audio play failed:', e));
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isOnline, pendingRides.length, currentRide]);

  // Toggle online/offline status
  const toggleOnlineStatus = () => {
    setIsOnline(!isOnline);
    if (!isOnline) {
      // Going online
      console.log('Driver is now online and available for rides');
    } else {
      // Going offline
      setPendingRides([]);
      setCurrentRide(null);
      console.log('Driver is now offline');
    }
  };

  // Accept a ride
  const acceptRide = (ride) => {
    setCurrentRide(ride);
    setPendingRides([]);
    // Update stats
    setStats(prev => ({
      ...prev,
      acceptanceRate: Math.min(100, prev.acceptanceRate + 1)
    }));
    console.log(`Accepted ride to ${ride.dropoffLocation}`);
  };

  // Decline a ride
  const declineRide = (rideId) => {
    setPendingRides(pendingRides.filter(ride => ride.id !== rideId));
    // Update stats
    setStats(prev => ({
      ...prev,
      acceptanceRate: Math.max(0, prev.acceptanceRate - 2)
    }));
    console.log(`Declined ride ${rideId}`);
  };

  // Complete current ride
  const completeRide = () => {
    // Update earnings (mock implementation)
    const rideEarning = parseFloat(currentRide.estimatedEarning.replace('$', ''));
    setEarnings(prev => ({
      today: prev.today + rideEarning,
      week: prev.week + rideEarning,
      month: prev.month + rideEarning
    }));

    // Update stats
    setStats(prev => ({
      ...prev,
      totalRides: prev.totalRides + 1,
      completionRate: ((prev.totalRides + 1) / (prev.totalRides + 1)) * 100
    }));

    setCurrentRide(null);
    console.log('Ride completed');
    
    // Show ride completion notification
    const newNotification = {
      id: Date.now(),
      type: 'success',
      message: `Ride completed! You earned ${currentRide.estimatedEarning}`,
      time: 'Just now'
    };
    setNotifications([newNotification, ...notifications.slice(0, 4)]);
  };

  // Cancel current ride
  const cancelRide = () => {
    // Update stats
    setStats(prev => ({
      ...prev,
      cancelRate: prev.cancelRate + 1,
      completionRate: Math.max(0, prev.completionRate - 1)
    }));

    // Show cancellation notification
    const newNotification = {
      id: Date.now(),
      type: 'warning',
      message: 'Ride cancelled. This may affect your cancellation rate.',
      time: 'Just now'
    };
    setNotifications([newNotification, ...notifications.slice(0, 4)]);

    setCurrentRide(null);
    console.log('Ride cancelled');
  };

  // Navigate to the pickup location
  const navigateToPickup = () => {
    alert(`Navigating to pickup location: ${currentRide.pickupLocation}`);
    // In a real app, this would integrate with maps
  };

  // Contact the passenger
  const contactPassenger = () => {
    alert(`Contacting passenger: ${currentRide.passenger}`);
    // In a real app, this would open messaging or calling interface
  };

  // Dismiss a notification
  const dismissNotification = (id) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `$${amount.toFixed(2)}`;
  };

  // Get notification icon
  const getNotificationIcon = (type) => {
    switch(type) {
      case 'info': return '📢';
      case 'promo': return '🎁';
      case 'success': return '✅';
      case 'warning': return '⚠️';
      default: return '📝';
    }
  };

  // Get surge or opportunity icon
  const getOpportunityIcon = (type) => {
    switch(type) {
      case 'surge': return '💰';
      case 'event': return '🎭';
      default: return '📍';
    }
  };

  return (
    <div className="driver-dashboard">
      <aside className="side-nav">
        <div className="app-logo">
          <h1>GlideWay</h1>
        </div>
        
        <div className="nav-links">
          <button 
            className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <span className="nav-icon">📊</span>
            Dashboard
          </button>
          <button 
            className={`nav-link ${activeTab === 'earnings' ? 'active' : ''}`}
            onClick={() => setActiveTab('earnings')}
          >
            <span className="nav-icon">💵</span>
            Earnings
          </button>
          <button 
            className={`nav-link ${activeTab === 'activity' ? 'active' : ''}`}
            onClick={() => setActiveTab('activity')}
          >
            <span className="nav-icon">📝</span>
            Activity
          </button>
          <button 
            className={`nav-link ${activeTab === 'account' ? 'active' : ''}`}
            onClick={() => setActiveTab('account')}
          >
            <span className="nav-icon">👤</span>
            Account
          </button>
        </div>
        
        <div className="profile-section">
          <div className="driver-avatar"></div>
          <div className="driver-info">
            <h3>John Doe</h3>
            <div className="rating">
              <span className="star">★</span>
              <span>{stats.rating}</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="main-header">
          <div className="location-info">
            <span className="location-icon">📍</span>
            <span>{currentLocation}</span>
          </div>
          
          <div className="status-toggle">
            <span className="status-indicator" style={{backgroundColor: isOnline ? '#4caf50' : '#f44336'}}></span>
            <span className="status-label">{isOnline ? 'Online' : 'Offline'}</span>
            <button 
              className={`toggle-button ${isOnline ? 'online' : 'offline'}`}
              onClick={toggleOnlineStatus}
            >
              {isOnline ? 'Go Offline' : 'Go Online'}
            </button>
          </div>
          
          <div className="header-actions">
            <button className="notification-button">
              <span className="notification-icon">🔔</span>
              <span className="notification-badge">{notifications.length}</span>
            </button>
          </div>
        </header>

        <div className="dashboard-content">
          <div className="quick-stats">
            <div className="quick-stat-item">
              <span className="stat-icon">💰</span>
              <div className="stat-details">
                <span className="stat-label">Today's Earnings</span>
                <span className="stat-value">{formatCurrency(earnings.today)}</span>
              </div>
            </div>
            <div className="quick-stat-item">
              <span className="stat-icon">🚕</span>
              <div className="stat-details">
                <span className="stat-label">Total Rides</span>
                <span className="stat-value">{stats.totalRides}</span>
              </div>
            </div>
            <div className="quick-stat-item">
              <span className="stat-icon">⭐</span>
              <div className="stat-details">
                <span className="stat-label">Rating</span>
                <span className="stat-value">{stats.rating}</span>
              </div>
            </div>
            <div className="quick-stat-item">
              <span className="stat-icon">✓</span>
              <div className="stat-details">
                <span className="stat-label">Acceptance</span>
                <span className="stat-value">{stats.acceptanceRate}%</span>
              </div>
            </div>
          </div>

          {currentRide && (
            <div className="current-ride-section section-card active-card">
              <div className="section-header">
                <h2>Current Trip</h2>
                <span className="ride-type-badge">{currentRide.rideType}</span>
              </div>
              
              <div className="ride-details">
                <div className="ride-passenger">
                  <div className="passenger-avatar"></div>
                  <div>
                    <p className="passenger-name">{currentRide.passenger}</p>
                    <p className="passenger-rating">
                      <span className="star">★</span> {currentRide.passengerRating}
                    </p>
                  </div>
                  <button className="contact-button" onClick={contactPassenger}>
                    <span className="contact-icon">📞</span>
                  </button>
                </div>
                
                <div className="ride-locations">
                  <div className="location pickup">
                    <div className="location-dot"></div>
                    <div className="location-details">
                      <span className="location-label">Pickup</span>
                      <p className="location-address">{currentRide.pickupLocation}</p>
                    </div>
                    <button className="navigate-button" onClick={navigateToPickup}>
                      <span className="navigate-icon">🗺️</span>
                    </button>
                  </div>
                  <div className="location-connector">
                    <div className="connector-progress"></div>
                  </div>
                  <div className="location dropoff">
                    <div className="location-dot"></div>
                    <div className="location-details">
                      <span className="location-label">Dropoff</span>
                      <p className="location-address">{currentRide.dropoffLocation}</p>
                    </div>
                  </div>
                </div>
                
                <div className="ride-meta">
                  <div className="meta-item">
                    <span className="meta-icon">📏</span>
                    <span className="meta-label">Distance</span>
                    <span className="meta-value">{currentRide.distance}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-icon">⏱️</span>
                    <span className="meta-label">Est. Time</span>
                    <span className="meta-value">{currentRide.estimatedTime}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-icon">💵</span>
                    <span className="meta-label">Earning</span>
                    <span className="meta-value">{currentRide.estimatedEarning}</span>
                  </div>
                </div>
                
                <div className="ride-actions">
                  <button 
                    className="cancel-ride-button"
                    onClick={cancelRide}
                  >
                    Cancel
                  </button>
                  <button 
                    className="complete-ride-button"
                    onClick={completeRide}
                  >
                    Complete Trip
                  </button>
                </div>
              </div>
            </div>
          )}

          {!currentRide && pendingRides.length > 0 && (
            <div className="pending-rides-section section-card active-card">
              <div className="section-header">
                <h2>New Ride Request</h2>
                <div className="countdown-timer">15</div>
              </div>
              
              {pendingRides.map(ride => (
                <div className="ride-request" key={ride.id}>
                  <div className="request-header">
                    <div className="ride-passenger">
                      <div className="passenger-avatar"></div>
                      <div>
                        <p className="passenger-name">{ride.passenger}</p>
                        <p className="passenger-rating">
                          <span className="star">★</span> {ride.passengerRating}
                        </p>
                      </div>
                    </div>
                    <span className="ride-type-badge">{ride.rideType}</span>
                  </div>
                  
                  <div className="ride-locations">
                    <div className="location pickup">
                      <div className="location-dot"></div>
                      <div className="location-details">
                        <span className="location-label">Pickup</span>
                        <p className="location-address">{ride.pickupLocation}</p>
                      </div>
                    </div>
                    <div className="location-connector"></div>
                    <div className="location dropoff">
                      <div className="location-dot"></div>
                      <div className="location-details">
                        <span className="location-label">Dropoff</span>
                        <p className="location-address">{ride.dropoffLocation}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ride-meta">
                    <div className="meta-item">
                      <span className="meta-icon">📏</span>
                      <span className="meta-label">Distance</span>
                      <span className="meta-value">{ride.distance}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-icon">⏱️</span>
                      <span className="meta-label">Est. Time</span>
                      <span className="meta-value">{ride.estimatedTime}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-icon">💵</span>
                      <span className="meta-label">Earning</span>
                      <span className="meta-value">{ride.estimatedEarning}</span>
                    </div>
                  </div>
                  
                  <div className="request-actions">
                    <button 
                      className="decline-button"
                      onClick={() => declineRide(ride.id)}
                    >
                      Decline
                    </button>
                    <button 
                      className="accept-button"
                      onClick={() => acceptRide(ride)}
                    >
                      Accept
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!currentRide && !pendingRides.length && (
            <div className={`dashboard-grid ${isOnline ? '' : 'offline-mode'}`}>
              <div className="earnings-section section-card">
                <h2>Earnings Overview</h2>
                <div className="earnings-grid">
                  <div className="earning-item">
                    <span className="earning-label">Today</span>
                    <span className="earning-value">{formatCurrency(earnings.today)}</span>
                  </div>
                  <div className="earning-item">
                    <span className="earning-label">This Week</span>
                    <span className="earning-value">{formatCurrency(earnings.week)}</span>
                  </div>
                  <div className="earning-item">
                    <span className="earning-label">This Month</span>
                    <span className="earning-value">{formatCurrency(earnings.month)}</span>
                  </div>
                </div>
                
                <div className="earnings-chart">
                  <div className="chart-legend">
                    <span className="day">M</span>
                    <span className="day">T</span>
                    <span className="day">W</span>
                    <span className="day">T</span>
                    <span className="day">F</span>
                    <span className="day">S</span>
                    <span className="day">S</span>
                  </div>
                  <div className="chart-bars">
                    <div className="chart-bar" style={{height: '30%'}}></div>
                    <div className="chart-bar" style={{height: '50%'}}></div>
                    <div className="chart-bar" style={{height: '70%'}}></div>
                    <div className="chart-bar" style={{height: '45%'}}></div>
                    <div className="chart-bar" style={{height: '85%'}}></div>
                    <div className="chart-bar" style={{height: '60%'}}></div>
                    <div className="chart-bar active" style={{height: '20%'}}></div>
                  </div>
                </div>
              </div>

              <div className="stats-section section-card">
                <h2>Performance</h2>
                <div className="performance-stats">
                  <div className="performance-item">
                    <div className="performance-header">
                      <span className="performance-label">Acceptance Rate</span>
                      <span className="performance-value">{stats.acceptanceRate}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress" style={{width: `${stats.acceptanceRate}%`}}></div>
                    </div>
                  </div>
                  
                  <div className="performance-item">
                    <div className="performance-header">
                      <span className="performance-label">Completion Rate</span>
                      <span className="performance-value">{stats.completionRate}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress" style={{width: `${stats.completionRate}%`}}></div>
                    </div>
                  </div>
                  
                  <div className="performance-item">
                    <div className="performance-header">
                      <span className="performance-label">Cancellation Rate</span>
                      <span className="performance-value">{stats.cancelRate}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress red" style={{width: `${stats.cancelRate * 3}%`}}></div>
                    </div>
                  </div>
                </div>
                
                <div className="rating-breakdown">
                  <h3>Rating Breakdown</h3>
                  <div className="rating-stars">
                    <div className="rating-row">
                      <span className="rating-label">5 ★</span>
                      <div className="rating-bar-container">
                        <div className="rating-bar" style={{width: '75%'}}></div>
                      </div>
                      <span className="rating-percent">75%</span>
                    </div>
                    <div className="rating-row">
                      <span className="rating-label">4 ★</span>
                      <div className="rating-bar-container">
                        <div className="rating-bar" style={{width: '20%'}}></div>
                      </div>
                      <span className="rating-percent">20%</span>
                    </div>
                    <div className="rating-row">
                      <span className="rating-label">3 ★</span>
                      <div className="rating-bar-container">
                        <div className="rating-bar" style={{width: '5%'}}></div>
                      </div>
                      <span className="rating-percent">5%</span>
                    </div>
                    <div className="rating-row">
                      <span className="rating-label">2 ★</span>
                      <div className="rating-bar-container">
                        <div className="rating-bar" style={{width: '0%'}}></div>
                      </div>
                      <span className="rating-percent">0%</span>
                    </div>
                    <div className="rating-row">
                      <span className="rating-label">1 ★</span>
                      <div className="rating-bar-container">
                        <div className="rating-bar" style={{width: '0%'}}></div>
                      </div>
                      <span className="rating-percent">0%</span>
                    </div>
                  </div>
                </div>
              </div>

              {isOnline && (
                <div className="opportunities-section section-card">
                  <h2>Opportunities</h2>
                  {opportunities.length > 0 ? (
                    <div className="opportunities-list">
                      {opportunities.map(opportunity => (
                        <div className="opportunity-item" key={opportunity.id}>
                          <span className="opportunity-icon">{getOpportunityIcon(opportunity.type)}</span>
                          <div className="opportunity-details">
                            <span className="opportunity-title">
                              {opportunity.type === 'surge' 
                                ? `${opportunity.multiplier} Surge Pricing` 
                                : `${opportunity.description}`}
                            </span>
                            <span className="opportunity-location">{opportunity.location}</span>
                            {opportunity.time && (
                              <span className="opportunity-time">{opportunity.time}</span>
                            )}
                          </div>
                          <span className="opportunity-distance">{opportunity.distance}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-opportunities">No current opportunities in your area</p>
                  )}
                </div>
              )}

              <div className="notifications-section section-card">
                <h2>Notifications</h2>
                {notifications.length > 0 ? (
                  <div className="notifications-list">
                    {notifications.map(notification => (
                      <div className="notification-item" key={notification.id}>
                        <span className="notification-icon">{getNotificationIcon(notification.type)}</span>
                        <div className="notification-content">
                          <p className="notification-message">{notification.message}</p>
                          <span className="notification-time">{notification.time}</span>
                        </div>
                        <button 
                          className="dismiss-button"
                          onClick={() => dismissNotification(notification.id)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-notifications">No new notifications</p>
                )}
              </div>

              {isOnline && !pendingRides.length && !currentRide && (
                <div className="waiting-section section-card">
                  <div className="waiting-animation">
                    <div className="pulsating-circle"></div>
                    <div className="car-icon">🚗</div>
                  </div>
                  <h2>Looking for Trips</h2>
                  <p>You'll be notified when a new request arrives</p>
                </div>
              )}

              {!isOnline && (
                <div className="offline-section section-card">
                  <div className="offline-illustration">🌙</div>
                  <h2>You're Offline</h2>
                  <p>Go online to start accepting trips and earning</p>
                  <button 
                    className="go-online-button"
                    onClick={toggleOnlineStatus}
                  >
                    Go Online Now
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DriverDashboard;