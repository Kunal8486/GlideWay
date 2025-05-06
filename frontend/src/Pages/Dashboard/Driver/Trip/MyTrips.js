import { useState } from 'react';
import { Calendar, Clock, MapPin, Navigation, IndianRupee, Check, X, User, ChevronRight, Filter, Settings, Bell } from 'lucide-react';
import './MyTrips.css';

export default function DriverTripsPage() {
  // Demo data for upcoming and past rides
  const [upcomingRides, setUpcomingRides] = useState([
    {
      id: 1,
      passengerName: "K.J.S",
      passengerRating: 4.8,
      pickupLocation: "Bennett University, Greater Noida",
      destination: "New Delhi, Railway Station",
      date: "April 20, 2025",
      time: "9:30 AM",
      fare: 1850,
      status: "pending",
      estimatedDistance: "3.2 miles",
      estimatedDuration: "15 min"
    },
    {
      id: 2,
      passengerName: "Kunal",
      passengerRating: 4.5,
      pickupLocation: "Bennett University, Greater Noida",
      destination: "New Delhi, Railway Station",
      date: "April 21, 2025",
      time: "2:15 PM",
      fare: 24.75,
      status: "pending",
      estimatedDistance: "5.7 miles",
      estimatedDuration: "22 min"
    },
    {
      id: 3,
      passengerName: "Nirupam",
      passengerRating: 4.9,
      pickupLocation: "Bennett University, Greater Noida",
      destination: "New Delhi, Railway Station",
      date: "April 22, 2025",
      time: "6:45 PM",
      fare: 653,
      status: "pending",
      estimatedDistance: "7.3 miles",
      estimatedDuration: "28 min"
    }
  ]);

  const [pastRides, setPastRides] = useState([
    {
      id: 101,
      passengerName: "James Smith",
      passengerRating: 4.7,
      pickupLocation: "Bennett University, Greater Noida",
      destination: "New Delhi, Railway Station",
      date: "April 18, 2025",
      time: "10:00 AM",
      fare: 434,
      status: "completed",
      estimatedDistance: "2.8 miles",
      estimatedDuration: "12 min",
      actualDuration: "14 min"
    },
    {
      id: 102,
      passengerName: "Lisa Garcia",
      passengerRating: 4.6,
      pickupLocation: "888 Beach Blvd, Southside",
      destination: "999 Mountain Rd, Northside",
      date: "April 17, 2025",
      time: "3:45 PM",
      fare: 543,
      status: "completed",
      estimatedDistance: "6.5 miles",
      estimatedDuration: "25 min",
      actualDuration: "23 min"
    }
  ]);

  // State for active filter
  const [activeTab, setActiveTab] = useState('pending');
  
  // Function to handle ride acceptance or rejection
  const handleRideAction = (id, action) => {
    setUpcomingRides(upcomingRides.map(ride => {
      if (ride.id === id) {
        return { ...ride, status: action };
      }
      return ride;
    }));
  };

  return (
    <div className="dtr-trips-container">
      {/* Header */}
      <header className="dtr-header">
        <div className="dtr-header-content">
          <h1 className="dtr-main-title">My Trips</h1>
          <div className="dtr-header-actions">
            <button className="dtr-icon-button">
              <Filter size={20} />
            </button>
            <button className="dtr-icon-button">
              <Bell size={20} />
            </button>
            <button className="dtr-icon-button">
              <Settings size={20} />
            </button>
          </div>
        </div>
        <p className="dtr-header-subtitle">Manage your upcoming and past rides</p>
        
        {/* Tab Navigation */}
        <div className="dtr-tab-navigation">
          <button 
            className={`dtr-tab-button ${activeTab === 'pending' ? 'dtr-active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Available
            <span className="dtr-tab-badge">
              {upcomingRides.filter(ride => ride.status === 'pending').length}
            </span>
          </button>
          <button 
            className={`dtr-tab-button ${activeTab === 'accepted' ? 'dtr-active' : ''}`}
            onClick={() => setActiveTab('accepted')}
          >
            Accepted
          </button>
          <button 
            className={`dtr-tab-button ${activeTab === 'past' ? 'dtr-active' : ''}`}
            onClick={() => setActiveTab('past')}
          >
            Past
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="dtr-main-content">
        {/* Available Rides Section */}
        {activeTab === 'pending' && (
          <section className="dtr-rides-section">
            <div className="dtr-section-header">
              <h2 className="dtr-section-title">Available Rides</h2>
              <span className="dtr-badge">
                {upcomingRides.filter(ride => ride.status === 'pending').length} Available
              </span>
            </div>

            {upcomingRides.filter(ride => ride.status === 'pending').length === 0 ? (
              <div className="dtr-empty-state">
                <p>No upcoming rides available at the moment.</p>
                <button className="dtr-refresh-button">Refresh</button>
              </div>
            ) : (
              <div className="dtr-rides-list">
                {upcomingRides.filter(ride => ride.status === 'pending').map(ride => (
                  <div key={ride.id} className="dtr-ride-card">
                    <div className="dtr-ride-header">
                      <div className="dtr-passenger-info">
                        <User className="dtr-icon" size={20} />
                        <span className="dtr-passenger-name">{ride.passengerName}</span>
                        <div className="dtr-passenger-rating">★ {ride.passengerRating}</div>
                      </div>
                      <div className="dtr-fare-container">
                        <IndianRupee className="dtr-icon" size={18} />
                        <span className="dtr-fare">{ride.fare.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <div className="dtr-ride-details">
                      <div className="dtr-location-detail">
                        <MapPin className="dtr-icon dtr-pickup-icon" size={18} />
                        <div className="dtr-location-text">
                          <p className="dtr-label">Pickup</p>
                          <p className="dtr-location">{ride.pickupLocation}</p>
                        </div>
                      </div>
                      
                      <div className="dtr-location-detail">
                        <Navigation className="dtr-icon dtr-destination-icon" size={18} />
                        <div className="dtr-location-text">
                          <p className="dtr-label">Destination</p>
                          <p className="dtr-location">{ride.destination}</p>
                        </div>
                      </div>
                      
                      <div className="dtr-trip-info-row">
                        <div className="dtr-time-detail">
                          <div className="dtr-time-item">
                            <Calendar className="dtr-icon" size={18} />
                            <span>{ride.date}</span>
                          </div>
                          <div className="dtr-time-item">
                            <Clock className="dtr-icon" size={18} />
                            <span>{ride.time}</span>
                          </div>
                        </div>
                        
                        <div className="dtr-trip-estimates">
                          <div className="dtr-estimate-item">
                            <span className="dtr-estimate-label">Distance:</span>
                            <span className="dtr-estimate-value">{ride.estimatedDistance}</span>
                          </div>
                          <div className="dtr-estimate-item">
                            <span className="dtr-estimate-label">Est. Time:</span>
                            <span className="dtr-estimate-value">{ride.estimatedDuration}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="dtr-action-buttons">
                      <button 
                        onClick={() => handleRideAction(ride.id, 'rejected')}
                        className="dtr-reject-button"
                      >
                        <X size={16} />
                        Decline
                      </button>
                      <button 
                        onClick={() => handleRideAction(ride.id, 'accepted')}
                        className="dtr-accept-button"
                      >
                        <Check size={16} />
                        Accept
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Accepted Rides Section */}
        {activeTab === 'accepted' && (
          <section className="dtr-rides-section">
            <div className="dtr-section-header">
              <h2 className="dtr-section-title">Accepted Rides</h2>
            </div>

            <div className="dtr-rides-list">
              {upcomingRides.filter(ride => ride.status === 'accepted').map(ride => (
                <div key={ride.id} className="dtr-ride-card dtr-accepted">
                  <div className="dtr-ride-header">
                    <div className="dtr-passenger-info">
                      <User className="dtr-icon" size={20} />
                      <span className="dtr-passenger-name">{ride.passengerName}</span>
                      <div className="dtr-passenger-rating">★ {ride.passengerRating}</div>
                    </div>
                    <div className="dtr-status dtr-status-accepted">Accepted</div>
                  </div>
                  
                  <div className="dtr-ride-details">
                    <div className="dtr-location-detail">
                      <MapPin className="dtr-icon dtr-pickup-icon" size={18} />
                      <div className="dtr-location-text">
                        <p className="dtr-label">Pickup</p>
                        <p className="dtr-location">{ride.pickupLocation}</p>
                      </div>
                    </div>
                    
                    <div className="dtr-location-detail">
                      <Navigation className="dtr-icon dtr-destination-icon" size={18} />
                      <div className="dtr-location-text">
                        <p className="dtr-label">Destination</p>
                        <p className="dtr-location">{ride.destination}</p>
                      </div>
                    </div>
                    
                    <div className="dtr-trip-info-row">
                      <div className="dtr-time-detail">
                        <div className="dtr-time-item">
                          <Calendar className="dtr-icon" size={18} />
                          <span>{ride.date}</span>
                        </div>
                        <div className="dtr-time-item">
                          <Clock className="dtr-icon" size={18} />
                          <span>{ride.time}</span>
                        </div>
                      </div>
                      
                      <div className="dtr-trip-estimates">
                        <div className="dtr-estimate-item">
                          <span className="dtr-estimate-label">Distance:</span>
                          <span className="dtr-estimate-value">{ride.estimatedDistance}</span>
                        </div>
                        <div className="dtr-estimate-item">
                          <span className="dtr-estimate-label">Est. Time:</span>
                          <span className="dtr-estimate-value">{ride.estimatedDuration}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="dtr-fare-detail">
                      <IndianRupee className="dtr-icon" size={18} />
                      <span className="dtr-fare-amount">{ride.fare.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="dtr-action-buttons">
                    <button className="dtr-navigate-button">
                      <Navigation size={16} className="dtr-icon" />
                      Navigate
                    </button>
                    <button className="dtr-contact-button">
                      Contact Passenger
                      <ChevronRight size={16} className="dtr-icon" />
                    </button>
                  </div>
                </div>
              ))}
              
              {upcomingRides.filter(ride => ride.status === 'accepted').length === 0 && (
                <div className="dtr-empty-state">
                  <p>You haven't accepted any rides yet.</p>
                  <button className="dtr-view-available-button" onClick={() => setActiveTab('pending')}>
                    View Available Rides
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Past Rides Section */}
        {activeTab === 'past' && (
          <section className="dtr-rides-section">
            <div className="dtr-section-header">
              <h2 className="dtr-section-title">Past Rides</h2>
              <button className="dtr-filter-button">
                <Filter size={16} className="dtr-icon" />
                Filter
              </button>
            </div>
            
            <div className="dtr-rides-list">
              {pastRides.map(ride => (
                <div key={ride.id} className="dtr-ride-card dtr-past">
                  <div className="dtr-ride-header">
                    <div className="dtr-passenger-info">
                      <User className="dtr-icon" size={20} />
                      <span className="dtr-passenger-name">{ride.passengerName}</span>
                      <div className="dtr-passenger-rating">★ {ride.passengerRating}</div>
                    </div>
                    <div className="dtr-fare-container">
                      <IndianRupee className="dtr-icon" size={18} />
                      <span className="dtr-fare">{ride.fare.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="dtr-ride-details">
                    <div className="dtr-location-detail">
                      <MapPin className="dtr-icon dtr-pickup-icon" size={18} />
                      <div className="dtr-location-text">
                        <p className="dtr-label">Pickup</p>
                        <p className="dtr-location">{ride.pickupLocation}</p>
                      </div>
                    </div>
                    
                    <div className="dtr-location-detail">
                      <Navigation className="dtr-icon dtr-destination-icon" size={18} />
                      <div className="dtr-location-text">
                        <p className="dtr-label">Destination</p>
                        <p className="dtr-location">{ride.destination}</p>
                      </div>
                    </div>
                    
                    <div className="dtr-trip-info-row">
                      <div className="dtr-time-detail">
                        <div className="dtr-time-item">
                          <Calendar className="dtr-icon" size={18} />
                          <span>{ride.date}</span>
                        </div>
                        <div className="dtr-time-item">
                          <Clock className="dtr-icon" size={18} />
                          <span>{ride.time}</span>
                        </div>
                      </div>
                      
                      <div className="dtr-trip-estimates">
                        <div className="dtr-estimate-item">
                          <span className="dtr-estimate-label">Distance:</span>
                          <span className="dtr-estimate-value">{ride.estimatedDistance}</span>
                        </div>
                        <div className="dtr-estimate-item">
                          <span className="dtr-estimate-label">Duration:</span>
                          <span className="dtr-estimate-value">{ride.actualDuration}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="dtr-completed-label">
                    <Check size={16} className="dtr-completed-icon" />
                    Completed
                  </div>
                </div>
              ))}
              
              {pastRides.length === 0 && (
                <div className="dtr-empty-state">
                  <p>No past rides to display.</p>
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      {/* Footer with statistics */}
      <footer className="dtr-footer">
        <div className="dtr-stats-container">
          <div className="dtr-stat-item">
            <span className="dtr-stat-value">
              <IndianRupee/>{pastRides.reduce((total, ride) => total + ride.fare, 0).toFixed(2)}
            </span>
            <span className="dtr-stat-label">Earnings this week</span>
          </div>
          <div className="dtr-stat-item">
            <span className="dtr-stat-value">{pastRides.length}</span>
            <span className="dtr-stat-label">Completed trips</span>
          </div>
          <div className="dtr-stat-item">
            <span className="dtr-stat-value">
              {upcomingRides.filter(ride => ride.status === 'accepted').length}
            </span>
            <span className="dtr-stat-label">Upcoming trips</span>
          </div>
        </div>
      </footer>
    </div>
  );
}