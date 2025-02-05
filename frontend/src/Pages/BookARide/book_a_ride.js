import React, { useRef, useState, useEffect } from 'react';
import { 
  GoogleMap, 
  Marker, 
  Autocomplete, 
  DirectionsRenderer,
  useJsApiLoader
} from '@react-google-maps/api';
import './book_a_ride.css';

const RIDE_TYPES = {
  Economy: { 
    base: 5, 
    perKm: 2, 
    description: '1-3 passengers, affordable rates',
    eta: '3',
    icon: '🚗'
  },
  Premium: { 
    base: 10, 
    perKm: 3, 
    description: 'Luxury vehicles, top-rated drivers',
    eta: '5',
    icon: '🚙'
  },
  XL: { 
    base: 15, 
    perKm: 4, 
    description: 'SUVs and vans, up to 6 passengers',
    eta: '7',
    icon: '🚐'
  }
};

const LoadingSpinner = () => <div className="loading-spinner"></div>;

const BookARide = () => {
  const pickupRef = useRef(null);
  const dropoffRef = useRef(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [rideType, setRideType] = useState("Economy");
  const [directions, setDirections] = useState(null);
  const [fareEstimate, setFareEstimate] = useState(0);
  const [eta, setEta] = useState("-- min");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isBookingConfirmed, setIsBookingConfirmed] = useState(false);
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [nearbyDrivers, setNearbyDrivers] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('cash');

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyAsbNcuAXnl7UNwO-dpDelhoZlmszXR2U0",
    libraries: ['places'],
  });

  const containerStyle = { width: '100%', height: '100%' };
  const center = currentLocation || { lat: 40.7128, lng: -74.0060 };

  useEffect(() => {
    getCurrentLocation();
    simulateNearbyDrivers();
  }, []);

  const simulateNearbyDrivers = () => {
    // Simulate 5 nearby drivers with random positions
    const drivers = Array(5).fill(null).map((_, i) => ({
      id: i,
      position: {
        lat: center.lat + (Math.random() - 0.5) * 0.01,
        lng: center.lng + (Math.random() - 0.5) * 0.01,
      }
    }));
    setNearbyDrivers(drivers);
  };

  const getCurrentLocation = async () => {
    try {
      setIsLoading(true);
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      
      setCurrentLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
    } catch (error) {
      setError("Unable to fetch your location. Please enter manually.");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateRoute = async () => {
    if (!pickupRef.current.value || !dropoffRef.current.value) {
      setError("Please enter both pickup and dropoff locations");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      if (!isLoaded) {
        throw new Error("Google Maps not loaded");
      }

      const directionsService = new window.google.maps.DirectionsService();
      
      const result = await new Promise((resolve, reject) => {
        directionsService.route(
          {
            origin: pickupRef.current.value,
            destination: dropoffRef.current.value,
            travelMode: window.google.maps.TravelMode.DRIVING,
          },
          (result, status) => {
            if (status === window.google.maps.DirectionsStatus.OK) {
              resolve(result);
            } else {
              reject(new Error("Could not calculate route"));
            }
          }
        );
      });

      setDirections(result);
      const distance = result.routes[0].legs[0].distance.value / 1000;
      const rideDetails = RIDE_TYPES[rideType];
      const calculatedFare = (rideDetails.base + distance * rideDetails.perKm).toFixed(2);
      setFareEstimate(calculatedFare);
      setEta(result.routes[0].legs[0].duration.text);
      setShowLocationInput(false);
    } catch (err) {
      setError("Error calculating route. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!directions || !fareEstimate) {
      setError("Please calculate fare estimate first");
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsBookingConfirmed(true);
    } catch (err) {
      setError("Failed to book ride. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (loadError) {
    return <div className="error-message">Error loading Google Maps</div>;
  }

  if (!isLoaded) {
    return <LoadingSpinner />;
  }

  if (isBookingConfirmed) {
    return (
      <div className="booking-confirmation">
        <div className="confirmation-header">
          <div className="driver-info">
            <div className="driver-avatar">🚘</div>
            <div className="driver-details">
              <h3>Your driver is on the way!</h3>
              <p>John Doe • 4.9 ⭐</p>
              <p>Toyota Camry • ABC 123</p>
            </div>
          </div>
          <div className="trip-info">
            <p><strong>From:</strong> {pickupRef.current.value}</p>
            <p><strong>To:</strong> {dropoffRef.current.value}</p>
            <p><strong>Fare:</strong> ₹{fareEstimate}</p>
            <p><strong>ETA:</strong> {eta}</p>
          </div>
        </div>
        <div className="confirmation-actions">
          <button className="action-btn message">Message Driver</button>
          <button className="action-btn cancel">Cancel Ride</button>
        </div>
      </div>
    );
  }

  return (
    <div className="book-ride-container">
      <div className={`form-container ${showLocationInput ? 'expanded' : ''}`}>
        {!showLocationInput ? (
          <div className="location-summary" onClick={() => setShowLocationInput(true)}>
            <div className="where-to">Where to?</div>
            {directions && (
              <div className="route-preview">
                <div className="location-dot pickup"></div>
                <div className="location-text">{pickupRef.current.value}</div>
                <div className="location-dot dropoff"></div>
                <div className="location-text">{dropoffRef.current.value}</div>
              </div>
            )}
          </div>
        ) : (
          <>
            <h2>Book Your Ride</h2>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="location-inputs">
                <div className="input-group">
                  <div className="location-dot pickup"></div>
                  <Autocomplete>
                    <input 
                      type="text" 
                      ref={pickupRef} 
                      placeholder="Pickup location" 
                      required 
                    />
                  </Autocomplete>
                </div>
                
                <div className="input-group">
                  <div className="location-dot dropoff"></div>
                  <Autocomplete>
                    <input 
                      type="text" 
                      ref={dropoffRef} 
                      placeholder="Where to?" 
                      required 
                    />
                  </Autocomplete>
                </div>
              </div>

              <button 
                type="button" 
                className="calculate-btn" 
                onClick={calculateRoute}
                disabled={isLoading}
              >
                {isLoading ? <LoadingSpinner /> : 'Search'}
              </button>
            </form>
          </>
        )}

        {directions && !showLocationInput && (
          <div className="ride-options">
            <h3>Choose a ride</h3>
            <div className="ride-types-list">
              {Object.entries(RIDE_TYPES).map(([type, details]) => (
                <div 
                  key={type}
                  className={`ride-type-item ${rideType === type ? 'selected' : ''}`}
                  onClick={() => setRideType(type)}
                >
                  <div className="ride-icon">{details.icon}</div>
                  <div className="ride-info">
                    <h4>{type}</h4>
                    <p>{details.description}</p>
                    <p className="ride-eta">{details.eta} min away</p>
                  </div>
                  <div className="ride-price">₹{fareEstimate}</div>
                </div>
              ))}
            </div>

            <div className="payment-method">
              <h4>Payment Method</h4>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option value="cash">Cash</option>
                <option value="card">Credit Card</option>
                <option value="wallet">Digital Wallet</option>
              </select>
            </div>

            <button 
              className="submit-btn" 
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? <LoadingSpinner /> : 'Confirm Ride'}
            </button>
          </div>
        )}
      </div>

      <div className="map-container">
        <GoogleMap 
          mapContainerStyle={containerStyle} 
          center={center} 
          zoom={14}
          options={{
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }]
              }
            ]
          }}
        >
          {currentLocation && <Marker position={currentLocation} />}
          {directions && <DirectionsRenderer directions={directions} />}
          {nearbyDrivers.map(driver => (
            <Marker
              key={driver.id}
              position={driver.position}
              icon={{
                url: "path_to_car_icon.png",
                scaledSize: new window.google.maps.Size(30, 30)
              }}
            />
          ))}
        </GoogleMap>
      </div>
    </div>
  );
};

export default BookARide;