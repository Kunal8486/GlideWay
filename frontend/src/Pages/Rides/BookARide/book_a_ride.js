import React, { useRef, useState, useEffect, useCallback } from 'react';
import { 
  GoogleMap, 
  Marker, 
  Autocomplete, 
  DirectionsRenderer,
  useJsApiLoader
} from '@react-google-maps/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faLocationDot, 
  faCarSide, 
  faCar, 
  faVanShuttle, 
  faCreditCard, 
  faMoneyBill, 
  faWallet,
  faMessage,
  faTimes,
  faMapMarkerAlt,
  faEdit,
  faSearch,
  faCheckCircle,
  faHistory,
  faStar,
  faShield,
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import './book_a_ride.css';

// API config
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY ;

const RIDE_TYPES = {
  Economy: { 
    base: 50, 
    perKm: 12, 
    description: '1-3 passengers, affordable rates',
    eta: '3-5',
    icon: faCar,
    capacity: 3
  },
  Premium: { 
    base: 50, 
    perKm: 20, 
    description: 'Luxury vehicles, top-rated drivers',
    eta: '5-7',
    icon: faCarSide,
    capacity: 4
  },
  XL: { 
    base: 50, 
    perKm: 24, 
    description: 'SUVs and vans, up to 6 passengers',
    eta: '7-10',
    icon: faVanShuttle,
    capacity: 6
  }
};

const PAYMENT_METHODS = {
  cash: { 
    label: 'Cash', 
    icon: faMoneyBill 
  },
  card: { 
    label: 'Credit Card', 
    icon: faCreditCard 
  },
  wallet: { 
    label: 'Digital Wallet', 
    icon: faWallet 
  }
};

const LoadingSpinner = () => <div className="loading-spinner"></div>;

const BookARide = () => {
  const pickupRef = useRef(null);
  const dropoffRef = useRef(null);
  const mapRef = useRef(null);
  const geocoderRef = useRef(null);
  const autocompletePickupRef = useRef(null);
  const autocompleteDropoffRef = useRef(null);
  
  // Core states
  const [currentLocation, setCurrentLocation] = useState(null);
  const [pickupLocation, setPickupLocation] = useState(null);
  const [dropoffLocation, setDropoffLocation] = useState(null);
  const [rideType, setRideType] = useState("Economy");
  const [directions, setDirections] = useState(null);
  const [fareEstimate, setFareEstimate] = useState(0);
  const [eta, setEta] = useState("-- min");
  const [paymentMethod, setPaymentMethod] = useState('cash');
  
  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [error, setError] = useState("");
  const [isBookingConfirmed, setIsBookingConfirmed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showRideOptions, setShowRideOptions] = useState(false);
  const [isEditingLocation, setIsEditingLocation] = useState(null); // 'pickup' or 'dropoff' or null
  const [showMapTooltip, setShowMapTooltip] = useState(false);
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  
  // Ride details
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [nearbyDrivers, setNearbyDrivers] = useState([]);
  const [bookingId, setBookingId] = useState(null);
  const [driverInfo, setDriverInfo] = useState(null);
  const [passengerCount, setPassengerCount] = useState(1);
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Libraries for Google Maps
  const libraries = ['places', 'geometry', 'drawing'];
  
  // Map Options
  const mapOptions = {
    styles: [
      {
        featureType: "poi",
        elementType: "labels",
        stylers: [{ visibility: "off" }]
      },
      {
        featureType: "transit",
        elementType: "labels",
        stylers: [{ visibility: "off" }]
      }
    ],
    zoomControl: !isMobile,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    gestureHandling: "greedy"
  };

  // Check if we're on mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const containerStyle = { width: '100%', height: '100%' };
  const center = currentLocation || { lat: 37.7749, lng: -122.4194 }; // Default to San Francisco

  // Initialize app and load saved locations
  useEffect(() => {
    if (isLoaded) {
      getCurrentLocation();
      
      // Simulate nearby drivers
      simulateNearbyDrivers();
      
      // Update driver positions
      const interval = setInterval(() => {
        if (nearbyDrivers.length > 0) {
          setNearbyDrivers(prev => prev.map(driver => ({
            ...driver,
            position: {
              lat: driver.position.lat + (Math.random() - 0.5) * 0.0005,
              lng: driver.position.lng + (Math.random() - 0.5) * 0.0005,
            },
            rotation: Math.random() * 360
          })));
        }
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [isLoaded]);

  // Set up geocoder when map is loaded
  useEffect(() => {
    if (isLoaded && window.google) {
      geocoderRef.current = new window.google.maps.Geocoder();
    }
  }, [isLoaded]);


  // Simulate nearby drivers
  const simulateNearbyDrivers = () => {
    const drivers = Array(8).fill(null).map((_, i) => ({
      id: i,
      position: {
        lat: center.lat + (Math.random() - 0.5) * 0.01,
        lng: center.lng + (Math.random() - 0.5) * 0.01,
      },
      rotation: Math.random() * 360,
      type: Object.keys(RIDE_TYPES)[Math.floor(Math.random() * Object.keys(RIDE_TYPES).length)]
    }));
    setNearbyDrivers(drivers);
  };

  // Get user's current location
  const getCurrentLocation = async () => {
    try {
      setIsFetchingLocation(true);
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
      });
      
      const coords = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      
      setCurrentLocation(coords);
      
      // Set pickup location to current location by default
      setPickupLocation(coords);
      
      // Update the input field with the address
      if (geocoderRef.current) {
        try {
          const { results } = await new Promise((resolve, reject) => {
            geocoderRef.current.geocode({ location: coords }, (results, status) => {
              if (status === "OK") {
                resolve({ results, status });
              } else {
                reject(new Error(`Geocoding failed: ${status}`));
              }
            });
          });
          
          if (results[0] && pickupRef.current) {
            pickupRef.current.value = results[0].formatted_address;
          }
        } catch (error) {
          console.error('Error getting address from coordinates:', error);
          if (pickupRef.current) {
            pickupRef.current.value = "Current Location";
          }
        }
      }
      
      // Center map on user's location
      if (mapRef.current) {
        mapRef.current.panTo(coords);
        mapRef.current.setZoom(15);
      }
    } catch (error) {
      setError("Unable to fetch your location. Please enter manually.");
      console.error('Geolocation error:', error);
    } finally {
      setIsFetchingLocation(false);
    }
  };

  // Handle map click to set location
  const handleMapClick = async (event) => {
    if (!isEditingLocation) return;
    
    const clickedPosition = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng()
    };
    
    // Update the location state
    if (isEditingLocation === 'pickup') {
      setPickupLocation(clickedPosition);
    } else if (isEditingLocation === 'dropoff') {
      setDropoffLocation(clickedPosition);
    }
    
    // Update the input field with the address
    if (geocoderRef.current) {
      try {
        const { results } = await new Promise((resolve, reject) => {
          geocoderRef.current.geocode({ location: clickedPosition }, (results, status) => {
            if (status === "OK") {
              resolve({ results, status });
            } else {
              reject(new Error(`Geocoding failed: ${status}`));
            }
          });
        });
        
        if (results[0]) {
          const address = results[0].formatted_address;
          if (isEditingLocation === 'pickup' && pickupRef.current) {
            pickupRef.current.value = address;
          } else if (isEditingLocation === 'dropoff' && dropoffRef.current) {
            dropoffRef.current.value = address;
          }
        }
      } catch (error) {
        console.error('Error getting address from coordinates:', error);
      }
    }
    
    // Exit editing mode
    setIsEditingLocation(null);
    setShowMapTooltip(false);
  };

  // Handle when user selects a place from autocomplete
  const onPlaceChanged = (type) => {
    const autocomplete = type === 'pickup' ? autocompletePickupRef.current : autocompleteDropoffRef.current;
    
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      
      if (place && place.geometry && place.geometry.location) {
        const location = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };
        
        if (type === 'pickup') {
          setPickupLocation(location);
        } else {
          setDropoffLocation(location);
        }
        
        // Center map on the selected location
        if (mapRef.current) {
          mapRef.current.panTo(location);
          mapRef.current.setZoom(15);
        }
      }
    }
  };

  // Calculate route between pickup and dropoff
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
            origin: pickupLocation || pickupRef.current.value,
            destination: dropoffLocation || dropoffRef.current.value,
            travelMode: window.google.maps.TravelMode.DRIVING,
          },
          (result, status) => {
            if (status === window.google.maps.DirectionsStatus.OK) {
              resolve(result);
            } else {
              reject(new Error(`Route calculation failed: ${status}`));
            }
          }
        );
      });

      setDirections(result);
      
      // Update marker positions based on the calculated route
      if (result.routes[0] && result.routes[0].legs[0]) {
        const leg = result.routes[0].legs[0];
        
        setPickupLocation({
          lat: leg.start_location.lat(),
          lng: leg.start_location.lng()
        });
        
        setDropoffLocation({
          lat: leg.end_location.lat(),
          lng: leg.end_location.lng()
        });
        
        // Update distance and duration
        const distanceInKm = leg.distance.value / 1000;
        const durationInMin = Math.ceil(leg.duration.value / 60);
        
        setDistance(distanceInKm);
        setDuration(durationInMin);
        
        // Calculate fare
        const rideDetails = RIDE_TYPES[rideType];
        const baseFare = rideDetails.base;
        const distanceFare = distanceInKm * rideDetails.perKm;
        const calculatedFare = (baseFare + distanceFare).toFixed(2);
        
        setFareEstimate(calculatedFare);
        setEta(`${leg.duration.text}`);
        setShowRideOptions(true);
        
        // Send route data to backend
        try {
          /*
          await axios.post(`${API_BASE_URL}/routes/estimate`, {
            pickupLocation: {
              address: leg.start_address,
              coordinates: {
                lat: leg.start_location.lat(),
                lng: leg.start_location.lng()
              }
            },
            dropoffLocation: {
              address: leg.end_address,
              coordinates: {
                lat: leg.end_location.lat(),
                lng: leg.end_location.lng()
              }
            },
            distance: distanceInKm,
            duration: durationInMin,
            rideType,
            estimatedFare: calculatedFare
          });
          */
        } catch (error) {
          console.error('Error saving route estimate:', error);
        }
        
        // Adjust view to show the whole route
        if (mapRef.current && result.routes[0].bounds) {
          mapRef.current.fitBounds(result.routes[0].bounds);
        }
      }
    } catch (err) {
      setError("Error calculating route. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle booking submission
  const handleBookRide = async () => {
    if (!directions || !fareEstimate) {
      setError("Please calculate fare estimate first");
      return;
    }

    setIsLoading(true);
    try {
      // Prepare booking data
      const bookingData = {
        pickupLocation: {
          address: pickupRef.current.value,
          coordinates: pickupLocation
        },
        dropoffLocation: {
          address: dropoffRef.current.value,
          coordinates: dropoffLocation
        },
        rideType,
        fare: fareEstimate,
        distance,
        duration,
        paymentMethod,
        passengerCount,
        notes: additionalNotes,
        promoCode: promoCode || null
      };
      
      // This would be an API call to your backend
      /* 
      const response = await axios.post(`${API_BASE_URL}/bookings`, bookingData);
      setBookingId(response.data.bookingId);
      setDriverInfo(response.data.driver);
      */
      
      // For now, let's simulate a successful booking
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock driver data
      setDriverInfo({
        id: 'driver-123',
        name: 'Alex Johnson',
        rating: 4.9,
        vehicle: {
          make: 'Toyota',
          model: 'Camry',
          color: 'Silver',
          plateNumber: 'ABC 123'
        },
        photo: 'https://randomuser.me/api/portraits/men/32.jpg',
        phone: '+1 (555) 123-4567'
      });
      
      setBookingId('RIDE' + Math.floor(100000 + Math.random() * 900000));
      setIsBookingConfirmed(true);
    } catch (err) {
      setError("Failed to book ride. Please try again.");
      console.error('Booking error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle canceling a booked ride
  const handleCancelRide = async () => {
    setIsLoading(true);
    try {
      // This would be an API call to your backend
      // await axios.post(`${API_BASE_URL}/bookings/${bookingId}/cancel`);
      
      // For now, let's simulate cancellation
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Reset states
      setIsBookingConfirmed(false);
      setShowRideOptions(false);
      setDirections(null);
      setDriverInfo(null);
      setBookingId(null);
    } catch (error) {
      setError("Failed to cancel ride. Please try again.");
      console.error('Cancellation error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle map load
  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  // Start location editing
  const startLocationEditing = (locationType) => {
    setIsEditingLocation(locationType);
    setShowMapTooltip(true);
    
    // Center map on current location
    if (mapRef.current) {
      if (locationType === 'pickup' && pickupLocation) {
        mapRef.current.panTo(pickupLocation);
      } else if (locationType === 'dropoff' && dropoffLocation) {
        mapRef.current.panTo(dropoffLocation);
      } else if (currentLocation) {
        mapRef.current.panTo(currentLocation);
      }
      mapRef.current.setZoom(16);
    }
    
    // Clear selection after 10 seconds if user doesn't click
    setTimeout(() => {
      if (isEditingLocation === locationType) {
        setIsEditingLocation(null);
        setShowMapTooltip(false);
      }
    }, 10000);
  };



  // Create payment method icon
  const renderPaymentIcon = (method) => {
    const paymentInfo = PAYMENT_METHODS[method];
    return <FontAwesomeIcon icon={paymentInfo.icon} />;
  };

  // Loading state
  if (loadError) {
    return <div className="error-message">Error loading Google Maps</div>;
  }

  if (!isLoaded) {
    return (
      <div className="loading-container">
        <LoadingSpinner />
        <p>Loading map...</p>
      </div>
    );
  }

  // Ride confirmation screen
  if (isBookingConfirmed && driverInfo) {
    return (
      <div className="booking-confirmation">
        <div className="confirmation-header">
          <div className="driver-info">
            <div className="driver-avatar">
              <img src={driverInfo.photo} alt={driverInfo.name} />
            </div>
            <div className="driver-details">
              <h3>Your driver is on the way!</h3>
              <p>{driverInfo.name} • {driverInfo.rating} ⭐</p>
              <p>{driverInfo.vehicle.color} {driverInfo.vehicle.make} {driverInfo.vehicle.model} • {driverInfo.vehicle.plateNumber}</p>
            </div>
          </div>
          <div className="trip-info">
            <div className="booking-id">Booking ID: {bookingId}</div>
            <div className="ride-route">
              <p><strong>From:</strong> {pickupRef.current.value}</p>
              <p><strong>To:</strong> {dropoffRef.current.value}</p>
            </div>
            <div className="ride-details">
              <p><strong>Fare:</strong> ₹{fareEstimate}</p>
              <p><strong>ETA:</strong> {eta}</p>
              <p><strong>Payment:</strong> {PAYMENT_METHODS[paymentMethod].label}</p>
            </div>
          </div>
        </div>
        
        <div className="map-view-book">
          <GoogleMap 
            mapContainerStyle={{ width: '100%', height: '300px' }} 
            center={pickupLocation} 
            zoom={14}
            options={mapOptions}
          >
            {directions && <DirectionsRenderer directions={directions} />}
            
            {nearbyDrivers
              .filter(driver => driver.type === rideType)
              .slice(0, 3)
              .map(driver => (
                <Marker
                  key={driver.id}
                  position={driver.position}
                  icon={{
                    path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                    scale: 5,
                    fillColor: "#000000",
                    fillOpacity: 1,
                    strokeWeight: 1,
                    rotation: driver.rotation,
                  }}
                />
              ))}
          </GoogleMap>
        </div>
        
        <div className="driver-eta">
          <FontAwesomeIcon icon={faCarSide} /> Driver arrives in approximately {eta}
        </div>
        
        <div className="confirmation-actions">
          <button className="action-btn message">
            <FontAwesomeIcon icon={faMessage} /> Contact Driver
          </button>
          <button className="action-btn share">
            <FontAwesomeIcon icon={faShield} /> Share Ride Status
          </button>
          <button className="action-btn cancel" onClick={handleCancelRide}>
            <FontAwesomeIcon icon={faTimes} /> Cancel Ride
          </button>
        </div>
      </div>
    );
  }

  // Main booking interface
  return (
    <div className="book-ride-container">
      <div className={`form-container ${showRideOptions ? 'ride-options-open' : ''}`}>
        <h2>Book Your Ride</h2>
        {error && <div className="error-message">{error}</div>}
        
        {/* Location form */}
        {!showRideOptions ? (
          <form onSubmit={(e) => { e.preventDefault(); calculateRoute(); }}>
            <div className="location-inputs">
              {/* Pickup location */}
              <div className="input-group">
                <div className="location-dot pickup">
                  <FontAwesomeIcon icon={faLocationDot} className="location-icon" />
                </div>
                <div className="autocomplete-wrapper">
                  <Autocomplete
                    onLoad={(autocomplete) => {
                      autocompletePickupRef.current = autocomplete;
                    }}
                    onPlaceChanged={() => onPlaceChanged('pickup')}
                    restrictions={{ country: 'in' }}
                  >
                    <input 
                      type="text" 
                      ref={pickupRef} 
                      placeholder="Pickup location" 
                      required 
                      className="location-input"
                    />
                  </Autocomplete>
                  
                  
                </div>
                <div className="location-actions">
                  <button 
                    type="button" 
                    className="map-location-btn" 
                    onClick={() => startLocationEditing('pickup')}
                    title="Set on map"
                  >
                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                  </button>
                  <button 
                    type="button" 
                    className="current-location-btn" 
                    onClick={getCurrentLocation}
                    disabled={isFetchingLocation}
                    title="Use current location"
                  >
                    {isFetchingLocation ? <LoadingSpinner /> : <FontAwesomeIcon icon={faLocationDot} />}
                  </button>
                </div>
              </div>
              
              {/* Dropoff location */}
              <div className="input-group">
                <div className="location-dot dropoff">
                  <FontAwesomeIcon icon={faLocationDot} className="location-icon" />
                </div>
                <div className="autocomplete-wrapper">
                  <Autocomplete
                    onLoad={(autocomplete) => {
                      autocompleteDropoffRef.current = autocomplete;
                    }}
                    onPlaceChanged={() => onPlaceChanged('dropoff')}
                    restrictions={{ country: 'in' }}
                  >
                    <input 
                      type="text" 
                      ref={dropoffRef} 
                      placeholder="Where to?" 
                      required 
                      className="location-input"
                    />
                  </Autocomplete>
                  
                  
                </div>
                <div className="location-actions">
                  <button 
                    type="button" 
                    className="map-location-btn" 
                    onClick={() => startLocationEditing('dropoff')}
                    title="Set on map"
                  >
                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                  </button>
                </div>
              </div>
            </div>

            {/* Additional options */}
            <div className="additional-options">
              <div className="passenger-count">
                <label>Passengers:</label>
                <select 
                  value={passengerCount} 
                  onChange={(e) => setPassengerCount(parseInt(e.target.value))}
                >
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
            </div>

            <button 
              type="submit" 
              className="calculate-btn" 
              disabled={isLoading}
            >
              {isLoading ? <LoadingSpinner /> : (
                <>
                  <FontAwesomeIcon icon={faSearch} /> Find a Ride
                </>
              )}
            </button>
          </form>
        ) : (
          // Ride options view
          <div className="ride-options">
            {/* Route summary */}
            <div className="route-summary">
              <div className="route-preview">
                <div className="location-dot pickup">
                  <FontAwesomeIcon icon={faLocationDot} className="location-icon" />
                </div>
                <div className="location-text truncate-text">{pickupRef.current.value}</div>
                <div className="location-dot dropoff">
                  <FontAwesomeIcon icon={faLocationDot} className="location-icon" />
                </div>
                <div className="location-text truncate-text">{dropoffRef.current.value}</div>
              </div>
              <button 
                className="edit-route-btn" 
                onClick={() => setShowRideOptions(false)}
              >
                <FontAwesomeIcon icon={faEdit} /> Edit
              </button>
            </div>
            
            {/* Trip summary */}
{/* Trip summary */}
<div className="trip-summary">
              <div className="trip-detail">
                <span className="detail-label">Distance:</span>
                <span className="detail-value">{distance.toFixed(1)} km</span>
              </div>
              <div className="trip-detail">
                <span className="detail-label">Duration:</span>
                <span className="detail-value">{eta}</span>
              </div>
            </div>
            
            <h3>Choose a ride</h3>
            <div className="ride-types-list">
              {Object.entries(RIDE_TYPES).map(([type, details]) => (
                <div 
                  key={type}
                  className={`ride-type-item ${rideType === type ? 'selected' : ''} ${passengerCount > details.capacity ? 'disabled' : ''}`}
                  onClick={() => {
                    if (passengerCount <= details.capacity) {
                      setRideType(type);
                      
                      // Recalculate fare when ride type changes
                      const newFare = (details.base + distance * details.perKm).toFixed(2);
                      setFareEstimate(newFare);
                    }
                  }}
                >
                  <div className="ride-icon">
                    <FontAwesomeIcon icon={details.icon} size="lg" />
                  </div>
                  <div className="ride-info">
                    <h4>{type}</h4>
                    <p>{details.description}</p>
                    <p className="ride-eta">{details.eta} min away</p>
                    {passengerCount > details.capacity && (
                      <p className="capacity-warning">Not enough capacity</p>
                    )}
                  </div>
                  <div className="ride-price">₹{(details.base + distance * details.perKm).toFixed(2)}</div>
                </div>
              ))}
            </div>

            {/* Payment section */}
            <div className="booking-details">
              <div className="payment-section">
                <div className="payment-header" onClick={() => setShowPaymentDetails(!showPaymentDetails)}>
                  <h4>Payment Method</h4>
                  <FontAwesomeIcon icon={showPaymentDetails ? 'angle-up' : 'angle-down'} />
                </div>
                
                <div className={`payment-selector ${showPaymentDetails ? 'expanded' : ''}`}>
                  {Object.entries(PAYMENT_METHODS).map(([method, info]) => (
                    <div
                      key={method}
                      className={`payment-option ${paymentMethod === method ? 'selected' : ''}`}
                      onClick={() => setPaymentMethod(method)}
                    >
                      <FontAwesomeIcon icon={info.icon} />
                      <span>{info.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Promo code section */}
              <div className="promo-section">
                {showPromoInput ? (
                  <div className="promo-input-group">
                    <input
                      type="text"
                      placeholder="Enter promo code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                    />
                    <button
                      className="apply-promo-btn"
                      onClick={() => {
                        // Apply promo code logic here
                        setShowPromoInput(false);
                      }}
                    >
                      Apply
                    </button>
                  </div>
                ) : (
                  <button
                    className="show-promo-btn"
                    onClick={() => setShowPromoInput(true)}
                  >
                    <FontAwesomeIcon icon={faCheckCircle} /> Add promo code
                  </button>
                )}
              </div>

              {/* Additional notes */}
              <div className="notes-section">
                <textarea
                  placeholder="Additional notes for driver (optional)"
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  rows={2}
                  maxLength={100}
                />
              </div>
            </div>

            {/* Book button */}
            <button 
              className="submit-btn" 
              onClick={handleBookRide}
              disabled={isLoading || passengerCount > RIDE_TYPES[rideType].capacity}
            >
              {isLoading ? <LoadingSpinner /> : (
                <>
                  <FontAwesomeIcon icon={faCheckCircle} /> Book {rideType} Ride • ₹{fareEstimate}
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Map container */}
      <div className="map-container-book">
        <GoogleMap 
          mapContainerStyle={containerStyle} 
          center={center} 
          zoom={14}
          onLoad={onMapLoad}
          onClick={handleMapClick}
          options={mapOptions}
        >
          {/* Current location marker */}
          {currentLocation && !pickupLocation && !dropoffLocation && (
            <Marker 
              position={currentLocation}
              icon={{
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: "#4285F4",
                fillOpacity: 1,
                strokeColor: "#ffffff",
                strokeWeight: 2,
              }}
            />
          )}
          
          {/* Pickup location marker */}
          {pickupLocation && !directions && (
            <Marker 
              position={pickupLocation}
              icon={{
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: "#4CAF50",
                fillOpacity: 1,
                strokeColor: "#ffffff",
                strokeWeight: 2,
              }}
              title="Pickup Location"
            />
          )}
          
          {/* Dropoff location marker */}
          {dropoffLocation && !directions && (
            <Marker 
              position={dropoffLocation}
              icon={{
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: "#F44336",
                fillOpacity: 1,
                strokeColor: "#ffffff",
                strokeWeight: 2,
              }}
              title="Dropoff Location"
            />
          )}
          
          {/* Route directions */}
          {directions && (
            <DirectionsRenderer 
              directions={directions}
              options={{
                polylineOptions: {
                  strokeColor: "#4285F4",
                  strokeWeight: 5,
                  strokeOpacity: 0.8
                },
                suppressMarkers: true
              }}
            />
          )}
          
          {/* Route markers when directions are shown */}
          {directions && pickupLocation && (
            <Marker 
              position={pickupLocation}
              icon={{
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: "#4CAF50",
                fillOpacity: 1,
                strokeColor: "#ffffff",
                strokeWeight: 2,
              }}
              title="Pickup Location"
            />
          )}
          
          {directions && dropoffLocation && (
            <Marker 
              position={dropoffLocation}
              icon={{
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: "#F44336",
                fillOpacity: 1,
                strokeColor: "#ffffff",
                strokeWeight: 2,
              }}
              title="Dropoff Location"
            />
          )}
          
          {/* Nearby drivers */}
          {nearbyDrivers.map(driver => (
            <Marker
              key={driver.id}
              position={driver.position}
              icon={{
                path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                scale: 5,
                fillColor: "#000000",
                fillOpacity: 1,
                strokeWeight: 1,
                rotation: driver.rotation,
              }}
            />
          ))}
          
          {/* Map tooltip when editing location */}
          {showMapTooltip && (
            <div className="map-tooltip-book">
              Click on the map to set your {isEditingLocation} location
            </div>
          )}
        </GoogleMap>
        
        {/* Mobile-friendly current location button */}
        <button 
          onClick={getCurrentLocation}
          className="current-location-map-btn"
          disabled={isFetchingLocation}
        >
          {isFetchingLocation ? <LoadingSpinner /> : <FontAwesomeIcon icon={faLocationDot} />}
        </button>
        
        {/* Cancel map location selection button */}
        {isEditingLocation && (
          <button 
            onClick={() => {
              setIsEditingLocation(null);
              setShowMapTooltip(false);
            }}
            className="cancel-selection-btn"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        )}
      </div>
    </div>
  );
};

export default BookARide;