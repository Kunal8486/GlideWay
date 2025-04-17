import React, { useState, useEffect, useRef } from 'react';
import { MapIcon, Calendar, Clock, PlusCircle, MapPin, RotateCw, CheckCircle } from 'lucide-react';
import axios from 'axios'; // Make sure to install axios: npm install axios
import './ScheduleRide.css';

function ScheduleRide() {
  // State for ride scheduling parameters
  const [rideParams, setRideParams] = useState({
    origin: '',
    destination: '',
    originCoords: null,
    destinationCoords: null,
    date: '',
    time: ''
  });

  // State for UI handling
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [mapVisible, setMapVisible] = useState(false);
  const [activeLocationField, setActiveLocationField] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [suggestedPickupPoints, setSuggestedPickupPoints] = useState([]);
  const [suggestedDropoffPoints, setSuggestedDropoffPoints] = useState([]);
  const [initialLocationFetched, setInitialLocationFetched] = useState(false);
  const [rideScheduled, setRideScheduled] = useState(false);
  const [scheduledRide, setScheduledRide] = useState(null);
  const [estimatedPrice, setEstimatedPrice] = useState(null);


  // Refs for Google Maps
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const autocompleteOriginRef = useRef(null);
  const autocompleteDestinationRef = useRef(null);
  const markerRef = useRef(null);
  const locationMarkersRef = useRef([]);

  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0];

  // Initialize Google Maps & Places Autocomplete
  useEffect(() => {
    const loadGoogleMapsScript = () => {
      // Check if the script is already loaded
      if (window.google && window.google.maps) {
        initializeMapsServices();
        // Auto-fetch current location after maps are initialized
        if (!initialLocationFetched) {
          autoFetchCurrentLocation();
        }
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        initializeMapsServices();
        // Auto-fetch current location after maps are loaded
        if (!initialLocationFetched) {
          autoFetchCurrentLocation();
        }
      };
      document.head.appendChild(script);
    };

    loadGoogleMapsScript();

    // Clean up function
    return () => {
      // Clean up any map instances or listeners
      if (mapInstance.current) {
        // Remove any event listeners if needed
      }
    };
  }, [initialLocationFetched]);

  const initializeMapsServices = () => {
    // Initialize autocomplete for origin and destination inputs
    const originInput = document.getElementById('ride-origin');
    const destinationInput = document.getElementById('ride-destination');

    if (originInput && window.google) {
      autocompleteOriginRef.current = new window.google.maps.places.Autocomplete(originInput, {
        fields: ['formatted_address', 'geometry', 'name', 'place_id']
      });
      autocompleteOriginRef.current.addListener('place_changed', () => {
        const place = autocompleteOriginRef.current.getPlace();
        if (place.geometry) {
          setRideParams(prev => ({
            ...prev,
            origin: place.formatted_address || place.name,
            originCoords: {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng()
            }
          }));

          // Fetch nearby pickup points using Google Places API
          fetchNearbyPickupPoints(place.geometry.location.lat(), place.geometry.location.lng());
        }
      });
    }

    if (destinationInput && window.google) {
      autocompleteDestinationRef.current = new window.google.maps.places.Autocomplete(destinationInput, {
        fields: ['formatted_address', 'geometry', 'name', 'place_id']
      });
      autocompleteDestinationRef.current.addListener('place_changed', () => {
        const place = autocompleteDestinationRef.current.getPlace();
        if (place.geometry) {
          setRideParams(prev => ({
            ...prev,
            destination: place.formatted_address || place.name,
            destinationCoords: {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng()
            }
          }));

          // Fetch nearby dropoff points using Google Places API
          fetchNearbyDropoffPoints(place.geometry.location.lat(), place.geometry.location.lng());
        }
      });
    }
  };
  // Add this function with your other functions
  const calculateEstimatedPrice = () => {
    if (rideParams.originCoords && rideParams.destinationCoords) {
      // Calculate distance between points
      const distance = calculateDistance(
        rideParams.originCoords.lat,
        rideParams.originCoords.lng,
        rideParams.destinationCoords.lat,
        rideParams.destinationCoords.lng
      );

      // Base price + price per km
      const basePrice = 50;
      const pricePerKm = 10;
      const price = basePrice + (distance * pricePerKm);

      setEstimatedPrice(Math.round(price));
    } else {
      setEstimatedPrice(null);
    }
  };

  // Helper function to calculate distance
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };
  // Function to automatically fetch the user's current location when the form loads
  const autoFetchCurrentLocation = () => {
    setLoadingLocation(true);
    setError(null);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };

          // Reverse geocode to get address
          if (window.google) {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: userLocation }, (results, status) => {
              if (status === 'OK' && results[0]) {
                const address = results[0].formatted_address;

                // Set as origin
                setRideParams(prev => ({
                  ...prev,
                  origin: address,
                  originCoords: userLocation
                }));

                // Fetch nearby pickup points
                fetchNearbyPickupPoints(userLocation.lat, userLocation.lng);

                setSuccess('Current location set as pickup point');
                setTimeout(() => setSuccess(null), 3000);
              } else {
                setError('Could not get address for your location');
              }
              setLoadingLocation(false);
              setInitialLocationFetched(true);
            });
          } else {
            setLoadingLocation(false);
            setInitialLocationFetched(true);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          let errorMessage = 'Unable to access your location. ';

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += 'Please allow location access in your browser settings.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage += 'Location request timed out.';
              break;
            default:
              errorMessage += 'An unknown error occurred.';
          }

          setError(errorMessage);
          setLoadingLocation(false);
          setInitialLocationFetched(true);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
      setLoadingLocation(false);
      setInitialLocationFetched(true);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRideParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Fetch nearby pickup points using Google Places API
  const fetchNearbyPickupPoints = async (lat, lng) => {
    if (window.google) {
      const service = new window.google.maps.places.PlacesService(document.createElement('div'));
      const request = {
        location: { lat, lng },
        radius: 2000,
        type: ['transit_station', 'bus_station', 'train_station', 'subway_station', 'point_of_interest']
      };

      service.nearbySearch(request, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          const places = results.slice(0, 5).map(place => ({
            name: place.name,
            address: place.vicinity,
            coords: {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng()
            }
          }));
          setSuggestedPickupPoints(places);
        }
      });
    }
  };

  // Fetch nearby dropoff points using Google Places API
  const fetchNearbyDropoffPoints = async (lat, lng) => {
    if (window.google) {
      const service = new window.google.maps.places.PlacesService(document.createElement('div'));
      const request = {
        location: { lat, lng },
        radius: 2000,
        type: ['transit_station', 'bus_station', 'train_station', 'subway_station', 'point_of_interest']
      };

      service.nearbySearch(request, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          const places = results.slice(0, 5).map(place => ({
            name: place.name,
            address: place.vicinity,
            coords: {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng()
            }
          }));
          setSuggestedDropoffPoints(places);
        }
      });
    }
  };

  // Open map modal for location selection
  const openMapForSelection = (field) => {
    setActiveLocationField(field);
    setMapVisible(true);
    setError(null);
  };

  // Function to get user's current location with improved error handling
  const getUserLocation = () => {
    setLoadingLocation(true);
    setError(null);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };

          if (mapInstance.current) {
            mapInstance.current.setCenter(userLocation);
            mapInstance.current.setZoom(15); // Zoom in closer

            if (markerRef.current) {
              markerRef.current.setPosition(userLocation);
            } else {
              markerRef.current = new window.google.maps.Marker({
                position: userLocation,
                map: mapInstance.current,
                draggable: true,
                animation: window.google.maps.Animation.DROP
              });

              // Add event listener for marker position changes
              markerRef.current.addListener('dragend', () => {
                const position = markerRef.current.getPosition();
                reverseGeocode(position.lat(), position.lng());
              });
            }

            reverseGeocode(userLocation.lat, userLocation.lng);
          }

          setLoadingLocation(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          let errorMessage = 'Unable to access your location. ';

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += 'Please allow location access in your browser settings.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage += 'Location request timed out.';
              break;
            default:
              errorMessage += 'An unknown error occurred.';
          }

          setError(errorMessage);
          setLoadingLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
      setLoadingLocation(false);
    }
  };

  // Reverse geocode to get address from coordinates
  const reverseGeocode = (lat, lng) => {
    if (!window.google) return;

    const geocoder = new window.google.maps.Geocoder();
    const latlng = { lat, lng };

    geocoder.geocode({ location: latlng }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const address = results[0].formatted_address;

        // Update the appropriate field based on what's active
        if (activeLocationField === 'origin') {
          setRideParams(prev => ({
            ...prev,
            origin: address,
            originCoords: { lat, lng }
          }));

          // Fetch nearby pickup points
          fetchNearbyPickupPoints(lat, lng);
        } else if (activeLocationField === 'destination') {
          setRideParams(prev => ({
            ...prev,
            destination: address,
            destinationCoords: { lat, lng }
          }));

          // Fetch nearby dropoff points
          fetchNearbyDropoffPoints(lat, lng);
        }
      } else {
        console.error('Geocoder failed:', status);
        setError('Failed to get address for selected location');
      }
    });
  };

  // Select a suggested location
  const selectSuggestedLocation = (location, type) => {
    if (type === 'origin') {
      setRideParams(prev => ({
        ...prev,
        origin: `${location.name}, ${location.address}`,
        originCoords: location.coords
      }));
    } else {
      setRideParams(prev => ({
        ...prev,
        destination: `${location.name}, ${location.address}`,
        destinationCoords: location.coords
      }));
    }

    // Close map if it's open
    if (mapVisible) {
      setMapVisible(false);
    }
  };

  // Close map modal
  const closeMapModal = () => {
    setMapVisible(false);
  };

  // Confirm the location selected on the map
  const confirmMapLocation = () => {
    if (!markerRef.current) {
      setError('Please select a location on the map first');
      return;
    }

    setMapVisible(false);
    setSuccess(`${activeLocationField === 'origin' ? 'Pickup' : 'Dropoff'} location confirmed`);

    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccess(null);
    }, 3000);
  };

  // Add this useEffect hook
  useEffect(() => {
    calculateEstimatedPrice();
  }, [rideParams.originCoords, rideParams.destinationCoords]);

  // Initialize map when showing the map modal
  useEffect(() => {
    if (mapVisible && mapRef.current && window.google) {
      const defaultLocation = { lat: 20.5937, lng: 78.9629 }; // Default to center of India

      // Create a new map instance each time the modal is opened
      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        center: defaultLocation,
        zoom: 12,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true
      });

      // Create a new marker instance
      markerRef.current = new window.google.maps.Marker({
        position: defaultLocation,
        map: mapInstance.current,
        draggable: true,
        animation: window.google.maps.Animation.DROP
      });

      // Add event listener for marker position changes
      markerRef.current.addListener('dragend', () => {
        const position = markerRef.current.getPosition();
        reverseGeocode(position.lat(), position.lng());
      });

      // Clear previous markers
      clearLocationMarkers();

      // Handle different map views based on the active field
      if (activeLocationField === 'origin' && rideParams.originCoords) {
        mapInstance.current.setCenter(rideParams.originCoords);
        markerRef.current.setPosition(rideParams.originCoords);

        // Show suggested pickup points
        if (suggestedPickupPoints.length > 0) {
          displaySuggestedPickupPoints();
        }
      } else if (activeLocationField === 'destination' && rideParams.destinationCoords) {
        mapInstance.current.setCenter(rideParams.destinationCoords);
        markerRef.current.setPosition(rideParams.destinationCoords);

        // Show suggested dropoff points
        if (suggestedDropoffPoints.length > 0) {
          displaySuggestedDropoffPoints();
        }
      } else {
        // Try to get user's current location if no coordinates are available
        getUserLocation();
      }
    }

    // Cleanup function
    return () => {
      if (!mapVisible) {
        // Clean up markers and renderers
        clearLocationMarkers();
        if (markerRef.current) {
          markerRef.current.setMap(null);
          markerRef.current = null;
        }
      }
    };
  }, [mapVisible, activeLocationField, suggestedPickupPoints, suggestedDropoffPoints]);

  // Function to display suggested pickup points on the map
  const displaySuggestedPickupPoints = () => {
    if (!mapInstance.current || !window.google) return;

    // Clear existing markers
    clearLocationMarkers();

    // Add markers for each suggested pickup point
    suggestedPickupPoints.forEach(point => {
      const marker = new window.google.maps.Marker({
        position: point.coords,
        map: mapInstance.current,
        title: point.name,
        icon: {
          url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
          scaledSize: new window.google.maps.Size(30, 30)
        }
      });

      // Add click event to select this location
      marker.addListener('click', () => {
        setRideParams(prev => ({
          ...prev,
          origin: `${point.name}, ${point.address}`,
          originCoords: point.coords
        }));

        // Update main marker position
        markerRef.current.setPosition(point.coords);
      });

      // Store marker reference for cleanup
      locationMarkersRef.current.push(marker);

      // Add info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `<div><strong>${point.name}</strong><br>${point.address}</div>`
      });

      marker.addListener('mouseover', () => {
        infoWindow.open(mapInstance.current, marker);
      });

      marker.addListener('mouseout', () => {
        infoWindow.close();
      });
    });

    // Adjust map bounds to show all markers
    if (suggestedPickupPoints.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(rideParams.originCoords);
      suggestedPickupPoints.forEach(point => bounds.extend(point.coords));
      mapInstance.current.fitBounds(bounds);
    }
  };

  // Function to display suggested dropoff points on the map
  const displaySuggestedDropoffPoints = () => {
    if (!mapInstance.current || !window.google) return;

    // Clear existing markers
    clearLocationMarkers();

    // Add markers for each suggested dropoff point
    suggestedDropoffPoints.forEach(point => {
      const marker = new window.google.maps.Marker({
        position: point.coords,
        map: mapInstance.current,
        title: point.name,
        icon: {
          url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
          scaledSize: new window.google.maps.Size(30, 30)
        }
      });

      // Add click event to select this location
      marker.addListener('click', () => {
        setRideParams(prev => ({
          ...prev,
          destination: `${point.name}, ${point.address}`,
          destinationCoords: point.coords
        }));

        // Update main marker position
        markerRef.current.setPosition(point.coords);
      });

      // Store marker reference for cleanup
      locationMarkersRef.current.push(marker);

      // Add info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `<div><strong>${point.name}</strong><br>${point.address}</div>`
      });

      marker.addListener('mouseover', () => {
        infoWindow.open(mapInstance.current, marker);
      });

      marker.addListener('mouseout', () => {
        infoWindow.close();
      });
    });

    // Adjust map bounds to show all markers
    if (suggestedDropoffPoints.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(rideParams.destinationCoords);
      suggestedDropoffPoints.forEach(point => bounds.extend(point.coords));
      mapInstance.current.fitBounds(bounds);
    }
  };

  // Function to clear location markers
  const clearLocationMarkers = () => {
    locationMarkersRef.current.forEach(marker => {
      if (marker) marker.setMap(null);
    });
    locationMarkersRef.current = [];
  };

  // Schedule a ride
  const scheduleRide = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validation before scheduling
      if (!rideParams.origin.trim()) {
        throw new Error('Pickup location is required');
      }
      if (!rideParams.destination.trim()) {
        throw new Error('Dropoff location is required');
      }
      if (!rideParams.date) {
        throw new Error('Date is required');
      }
      if (!rideParams.time) {
        throw new Error('Time is required');
      }

      // Make API call to backend to save the scheduled ride
      const response = await axios.post( `${REACT_APP_API_BASE_URL}/api/rides/schedule`, rideParams);

      setScheduledRide(response.data.ride);
      setRideScheduled(true);
      setSuccess('Your ride has been successfully scheduled!');

      // Reset form after successful scheduling
      setRideParams({
        origin: '',
        destination: '',
        originCoords: null,
        destinationCoords: null,
        date: '',
        time: ''
      });

      setLoading(false);
    } catch (error) {
      console.error('Error scheduling ride:', error);
      setError(error.response?.data?.message || error.message || 'Failed to schedule ride');
      setLoading(false);
    }
  };

  // Reset form to schedule another ride
  const scheduleAnotherRide = () => {
    setRideScheduled(false);
    setScheduledRide(null);
    setSuccess(null);
  };

  // Render suggested location items
  const renderSuggestedLocationItems = (locations, type) => {
    return locations.map((location, index) => (
      <div
        key={index}
        className="sr-suggested-location-item"
        onClick={() => selectSuggestedLocation(location, type)}
      >
        <MapPin size={16} className="sr-location-icon" />
        <div className="sr-location-info">
          <p className="sr-location-name">{location.name}</p>
          <p className="sr-location-address">{location.address}</p>
        </div>
      </div>
    ));
  };

  // Render map modal
  const renderMapModal = () => {
    if (!mapVisible) return null;

    return (
      <div className="sr-map-modal">
        <div className="sr-map-modal-content">
          <div className="sr-map-modal-header">
            <h3>
              Select {activeLocationField === 'origin' ? 'Pickup' : 'Dropoff'} Location
            </h3>
            <button
              className="sr-close-button"
              onClick={closeMapModal}
            >
              &times;
            </button>
          </div>
          <div className="sr-map-actions">
            <button
              className="sr-location-button"
              onClick={getUserLocation}
              disabled={loadingLocation}
            >
              {loadingLocation ? (
                <>
                  <RotateCw size={16} className="sr-icon sr-spin" /> Getting Location...
                </>
              ) : (
                <>
                  <MapPin size={16} className="sr-icon" /> Use My Location
                </>
              )}
            </button>
          </div>
          <div className="sr-map-container" ref={mapRef}></div>
          <div className="sr-map-modal-footer">
            <button
              className="sr-confirm-button"
              onClick={confirmMapLocation}
            >
              Confirm Location
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render success confirmation
  const renderSuccessConfirmation = () => {
    if (!rideScheduled || !scheduledRide) return null;

    return (
      <div className="sr-success-confirmation">
        <div className="sr-success-icon">
          <CheckCircle size={48} color="#4CAF50" />
        </div>
        <h2>Ride Successfully Scheduled!</h2>
        <div className="sr-ride-details">
          <div className="sr-detail-item">
            <strong>From:</strong> {scheduledRide.origin}
          </div>
          <div className="sr-detail-item">
            <strong>To:</strong> {scheduledRide.destination}
          </div>
          <div className="sr-detail-item">
            <strong>Date:</strong> {scheduledRide.date}
          </div>
          <div className="sr-detail-item">
            <strong>Time:</strong> {scheduledRide.time}
          </div>
          <div className="sr-detail-item">
            <strong>Status:</strong> <span className="sr-status-scheduled">Scheduled</span>
          </div>
          <div className="sr-detail-item">
            <strong>Estimated Price:</strong> ₹{scheduledRide.estimatedPrice || estimatedPrice}
          </div>
        </div>
        <button
          className="sr-schedule-another-button"
          onClick={scheduleAnotherRide}
        >
          <PlusCircle size={16} className="sr-icon" /> Schedule Another Ride
        </button>
      </div>
    );
  };

  return (
    <div className="sr-schedule-ride-container">
      <h1 className="sr-page-title">Schedule a Ride</h1>

      {/* Error message */}
      {error && <div className="sr-error-message">{error}</div>}

      {/* Success message */}
      {success && !rideScheduled && <div className="sr-success-message">{success}</div>}

      {/* Success Confirmation Screen */}
      {rideScheduled ? renderSuccessConfirmation() : (
        /* Form section */
        /* Form section */
        <div className="sr-schedule-section">
          <form onSubmit={scheduleRide} className="sr-schedule-form">
            <div className="sr-form-group">
              <label htmlFor="ride-origin" className="sr-form-label">
                Pickup Location
              </label>
              <div className="sr-input-container">
                <input
                  type="text"
                  id="ride-origin"
                  name="origin"
                  value={rideParams.origin}
                  onChange={handleInputChange}
                  placeholder="Enter pickup location"
                  className="sr-form-input"
                  required
                />
                <button
                  type="button"
                  className="sr-map-button"
                  onClick={() => openMapForSelection('origin')}
                  title="Select on map"
                >
                  <MapIcon size={20} />
                </button>
              </div>

              {/* Origin suggestions */}
              {rideParams.origin && suggestedPickupPoints.length > 0 && (
                <div className="sr-location-suggestions">
                  <h4 className="sr-suggestions-title">Suggested Pickup Points</h4>
                  {renderSuggestedLocationItems(suggestedPickupPoints, 'origin')}
                </div>
              )}
            </div>

            <div className="sr-form-group">
              <label htmlFor="ride-destination" className="sr-form-label">
                Dropoff Location
              </label>
              <div className="sr-input-container">
                <input
                  type="text"
                  id="ride-destination"
                  name="destination"
                  value={rideParams.destination}
                  onChange={handleInputChange}
                  placeholder="Enter destination"
                  className="sr-form-input"
                  required
                />
                <button
                  type="button"
                  className="sr-map-button"
                  onClick={() => openMapForSelection('destination')}
                  title="Select on map"
                >
                  <MapIcon size={20} />
                </button>
              </div>

              {/* Destination suggestions */}
              {rideParams.destination && suggestedDropoffPoints.length > 0 && (
                <div className="sr-location-suggestions">
                  <h4 className="sr-suggestions-title">Suggested Dropoff Points</h4>
                  {renderSuggestedLocationItems(suggestedDropoffPoints, 'destination')}
                </div>
              )}
            </div>

            <div className="sr-form-row">
              <div className="sr-form-group">
                <label htmlFor="ride-date" className="sr-form-label">
                  <Calendar size={16} className="sr-icon" />
                  Date
                </label>
                <input
                  type="date"
                  id="ride-date"
                  name="date"
                  value={rideParams.date}
                  onChange={handleInputChange}
                  min={today}
                  className="sr-form-input"
                  required
                />
              </div>

              <div className="sr-form-group">
                <label htmlFor="ride-time" className="sr-form-label">
                  <Clock size={16} className="sr-icon" />
                  Time
                </label>
                <input
                  type="time"
                  id="ride-time"
                  name="time"
                  value={rideParams.time}
                  onChange={handleInputChange}
                  className="sr-form-input"
                  required
                />
              </div>
            </div>
            {/* Add this before the form-actions div */}
            {estimatedPrice && (
              <div className="sr-price-estimation">
                <div className="sr-price-card">
                  <h3>Estimated Price</h3>
                  <div className="sr-price-amount">₹{estimatedPrice}</div>
                  <p className="sr-price-note">Final price may vary based on traffic and other factors</p>
                </div>
              </div>
            )}
            <div className="sr-form-actions">
              <button
                type="submit"
                className="sr-schedule-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <RotateCw size={16} className="sr-icon sr-spin" /> Scheduling...
                  </>
                ) : (
                  <>
                    <Calendar size={16} className="sr-icon" /> Schedule Ride
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Map Modal */}
      {renderMapModal()}
    </div>
  );
}

export default ScheduleRide;