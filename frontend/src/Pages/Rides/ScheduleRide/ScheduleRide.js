import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MapIcon, Calendar, Clock, Users, Search, MapPin, RotateCw, List, ChevronDown, ChevronUp } from 'lucide-react';
import './ScheduleRide.css';

function ScheduleRide() {
  // State for ride search parameters
  const [searchParams, setSearchParams] = useState({
    origin: '',
    destination: '',
    originCoords: null,
    destinationCoords: null,
    date: '',
    time: '',
    passengers: 1,
    radius: 2, // in kilometers
    sortBy: 'departure',
    priceRange: [0, 1000]
  });

  // State for UI handling
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [availableRides, setAvailableRides] = useState([]);
  const [mapVisible, setMapVisible] = useState(false);
  const [activeLocationField, setActiveLocationField] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [userFrequentLocations, setUserFrequentLocations] = useState([]);
  const [suggestedPickupPoints, setSuggestedPickupPoints] = useState([]);
  const [suggestedDropoffPoints, setSuggestedDropoffPoints] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [initialLocationFetched, setInitialLocationFetched] = useState(false);
  const [selectedRide, setSelectedRide] = useState(null);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [expandedRideId, setExpandedRideId] = useState(null);

  // Refs for Google Maps
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const autocompleteOriginRef = useRef(null);
  const autocompleteDestinationRef = useRef(null);
  const markerRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const locationMarkersRef = useRef([]);

  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0];

  // Fetch user's frequent locations on component mount
  useEffect(() => {
    const fetchFrequentLocations = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/rides/pool/frequent-locations`);
        if (response.data && response.data.locations) {
          setUserFrequentLocations(response.data.locations);
        }
      } catch (error) {
        console.error('Error fetching frequent locations:', error);
      }
    };

    fetchFrequentLocations();
  }, []);

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
          setSearchParams(prev => ({
            ...prev,
            origin: place.formatted_address || place.name,
            originCoords: {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng()
            }
          }));

          // Fetch nearby pickup points
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
          setSearchParams(prev => ({
            ...prev,
            destination: place.formatted_address || place.name,
            destinationCoords: {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng()
            }
          }));

          // Fetch nearby dropoff points
          fetchNearbyDropoffPoints(place.geometry.location.lat(), place.geometry.location.lng());
        }
      });
    }
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
                setSearchParams(prev => ({
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
    const { name, value, type, min, max } = e.target;
    let processedValue = value;

    // Handle number inputs
    if (type === 'number') {
      if (value === '') {
        processedValue = '';
      } else {
        processedValue = Math.max(
          Number(min || 0),
          Math.min(Number(max || Number.MAX_SAFE_INTEGER), Number(value))
        );
      }
    }

    setSearchParams(prev => ({
      ...prev,
      [name]: processedValue
    }));

    // Special handling for radius changes
    if (name === 'radius' && searchParams.originCoords) {
      fetchNearbyPickupPoints(searchParams.originCoords.lat, searchParams.originCoords.lng);
    }
  };

  // Price range change handler
  const handlePriceRangeChange = (e, index) => {
    const value = parseInt(e.target.value);
    setSearchParams(prev => {
      const newPriceRange = [...prev.priceRange];
      newPriceRange[index] = value;
      return {
        ...prev,
        priceRange: newPriceRange
      };
    });
  };

  // Fetch nearby pickup points
  const fetchNearbyPickupPoints = async (lat, lng) => {
    try {
      setLoadingSuggestions(true);
      // Fetch from backend or using Google Places API
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/rides/pool/nearby-pickup-points`, {
        params: { lat, lng, radius: searchParams.radius * 1000 }
      });

      setSuggestedPickupPoints(response.data.places || []);
      setLoadingSuggestions(false);
    } catch (error) {
      console.error('Error fetching pickup points:', error);
      setLoadingSuggestions(false);

      // Fallback to Google Places API directly if backend fails
      if (window.google) {
        const service = new window.google.maps.places.PlacesService(document.createElement('div'));
        const request = {
          location: { lat, lng },
          radius: searchParams.radius * 1000,
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
    }
  };

  // Fetch nearby dropoff points
  const fetchNearbyDropoffPoints = async (lat, lng) => {
    try {
      setLoadingSuggestions(true);
      // Fetch from backend or using Google Places API
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/rides/pool/nearby-dropoff-points`, {
        params: { lat, lng, radius: searchParams.radius * 1000 }
      });

      setSuggestedDropoffPoints(response.data.places || []);
      setLoadingSuggestions(false);
    } catch (error) {
      console.error('Error fetching dropoff points:', error);
      setLoadingSuggestions(false);

      // Fallback to Google Places API directly if backend fails
      if (window.google) {
        const service = new window.google.maps.places.PlacesService(document.createElement('div'));
        const request = {
          location: { lat, lng },
          radius: searchParams.radius * 1000,
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
          setSearchParams(prev => ({
            ...prev,
            origin: address,
            originCoords: { lat, lng }
          }));

          // Fetch nearby pickup points
          fetchNearbyPickupPoints(lat, lng);
        } else if (activeLocationField === 'destination') {
          setSearchParams(prev => ({
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

  // Select a frequent location
  const selectFrequentLocation = (location, type) => {
    if (type === 'origin') {
      setSearchParams(prev => ({
        ...prev,
        origin: location.name,
        originCoords: location.coords
      }));

      // Fetch nearby pickup points
      fetchNearbyPickupPoints(location.coords.lat, location.coords.lng);
    } else {
      setSearchParams(prev => ({
        ...prev,
        destination: location.name,
        destinationCoords: location.coords
      }));

      // Fetch nearby dropoff points
      fetchNearbyDropoffPoints(location.coords.lat, location.coords.lng);
    }
  };

  // Select a suggested location
  const selectSuggestedLocation = (location, type) => {
    if (type === 'origin') {
      setSearchParams(prev => ({
        ...prev,
        origin: `${location.name}, ${location.address}`,
        originCoords: location.coords
      }));
    } else {
      setSearchParams(prev => ({
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
    setSuccess(`${activeLocationField === 'origin' ? 'Origin' : 'Destination'} location confirmed`);

    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccess(null);
    }, 3000);
  };

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
      if (activeLocationField === 'origin' && searchParams.originCoords) {
        mapInstance.current.setCenter(searchParams.originCoords);
        markerRef.current.setPosition(searchParams.originCoords);

        // Show suggested pickup points
        if (suggestedPickupPoints.length > 0) {
          displaySuggestedPickupPoints();
        }
      } else if (activeLocationField === 'destination' && searchParams.destinationCoords) {
        mapInstance.current.setCenter(searchParams.destinationCoords);
        markerRef.current.setPosition(searchParams.destinationCoords);

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
        if (directionsRendererRef.current) {
          directionsRendererRef.current.setMap(null);
          directionsRendererRef.current = null;
        }
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
        setSearchParams(prev => ({
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
      bounds.extend(searchParams.originCoords);
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
        setSearchParams(prev => ({
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
      bounds.extend(searchParams.destinationCoords);
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

  // View route details for a specific ride
  const viewRideRoute = (ride) => {
    if (expandedRideId === ride.id) {
      setExpandedRideId(null);
      return;
    }
    setExpandedRideId(ride.id);
  };

  // Book a ride
  const bookRide = (ride) => {
    setSelectedRide(ride);
    setBookingModalVisible(true);
  };

  // Close booking modal
  const closeBookingModal = () => {
    setBookingModalVisible(false);
    setSelectedRide(null);
  };

  // Submit booking request
  const confirmBooking = async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        throw new Error('User is not authenticated. Please log in again.');
      }

      // Send booking request to backend
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/rides/pool/book/${selectedRide.id}`,
        {
          passengers: searchParams.passengers,
          pickupLocation: searchParams.origin,
          dropoffLocation: searchParams.destination,
          pickupCoords: searchParams.originCoords ?
            `${searchParams.originCoords.lat},${searchParams.originCoords.lng}` : null,
          dropoffCoords: searchParams.destinationCoords ?
            `${searchParams.destinationCoords.lat},${searchParams.destinationCoords.lng}` : null
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setSuccess('Ride booked successfully!');
      closeBookingModal();

      // Update available rides by removing or updating the booked ride
      setAvailableRides(prevRides =>
        prevRides.map(ride =>
          ride.id === selectedRide.id
            ? { ...ride, availableSeats: ride.availableSeats - searchParams.passengers }
            : ride
        ).filter(ride => ride.availableSeats > 0)
      );

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 5000);

    } catch (error) {
      console.error('Error booking ride:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.msg ||
        error.message ||
        'Failed to book ride';

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Search for available rides
  const searchRides = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setAvailableRides([]);

    try {
      // Validation before search
      if (!searchParams.origin.trim()) {
        throw new Error('Origin is required');
      }
      if (!searchParams.destination.trim()) {
        throw new Error('Destination is required');
      }

      // Format search parameters
      const searchData = {
        origin: searchParams.origin,
        destination: searchParams.destination,
        originCoords: searchParams.originCoords ?
          `${searchParams.originCoords.lat},${searchParams.originCoords.lng}` : null,
        destinationCoords: searchParams.destinationCoords ?
          `${searchParams.destinationCoords.lat},${searchParams.destinationCoords.lng}` : null,
        date: searchParams.date,
        time: searchParams.time,
        passengers: parseInt(searchParams.passengers),
        radius: parseFloat(searchParams.radius),
        priceRange: searchParams.priceRange,
        sortBy: searchParams.sortBy
      };

      // Send search request to backend
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/rides/pool/search`,
        searchData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      // Set available rides from response
      setAvailableRides(response.data.rides || []);

      if (response.data.rides?.length === 0) {
        setSuccess('No rides found matching your criteria. Try adjusting your search parameters.');
        setTimeout(() => setSuccess(null), 5000);
      }

    } catch (error) {
      console.error('Error searching rides:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.msg ||
        error.message ||
        'Failed to search for rides';

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Calculate ride cost per passenger
  const calculateCostPerPassenger = (ride) => {
    return Math.round(ride.price / ride.availableSeats);
  };

  // Format date and time for display
  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // // Format duration for display
  // const formatDuration = (minutes) => {
  //   if (minutes < 60) {
  //     return `${minutes} min`;
  //   }
  //   const hours = Math.floor(minutes / a60);
  //   const remainingMinutes = minutes % 60;
  //   return `${hours} hr ${remainingMinutes} min`;
  // };

  // Format distance for display
  const formatDistance = (kilometers) => {
    return `${kilometers.toFixed(1)} km`;
  };


  // Toggle expanded view for a ride
  const toggleRideExpansion = (rideId) => {
    if (expandedRideId === rideId) {
      setExpandedRideId(null);
    } else {
      setExpandedRideId(rideId);
    }
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

  // Render frequent location items
  const renderFrequentLocationItems = (locations, type) => {
    return locations.map((location, index) => (
      <div
        key={index}
        className="sr-frequent-location-item"
        onClick={() => selectFrequentLocation(location, type)}
      >
        <MapPin size={16} className="sr-location-icon" />
        <div className="sr-location-info">
          <p className="sr-location-name">{location.name}</p>
        </div>
      </div>
    ));
  };

  // Render the form section
  const renderForm = () => {
    return (
      <form onSubmit={searchRides} className="sr-search-form">
        <div className="sr-form-group">
          <label htmlFor="ride-origin" className="sr-form-label">
            Origin
          </label>
          <div className="sr-input-container">
            <input
              type="text"
              id="ride-origin"
              name="origin"
              value={searchParams.origin}
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
          {searchParams.origin && suggestedPickupPoints.length > 0 && (
            <div className="sr-location-suggestions">
              <h4 className="sr-suggestions-title">Suggested Pickup Points</h4>
              {renderSuggestedLocationItems(suggestedPickupPoints, 'origin')}
            </div>
          )}
          
          {/* Frequent locations */}
          {searchParams.origin === '' && userFrequentLocations.length > 0 && (
            <div className="sr-frequent-locations">
              <h4 className="sr-suggestions-title">Frequent Locations</h4>
              {renderFrequentLocationItems(userFrequentLocations, 'origin')}
            </div>
          )}
        </div>

        <div className="sr-form-group">
          <label htmlFor="ride-destination" className="sr-form-label">
            Destination
          </label>
          <div className="sr-input-container">
            <input
              type="text"
              id="ride-destination"
              name="destination"
              value={searchParams.destination}
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
          {searchParams.destination && suggestedDropoffPoints.length > 0 && (
            <div className="sr-location-suggestions">
              <h4 className="sr-suggestions-title">Suggested Dropoff Points</h4>
              {renderSuggestedLocationItems(suggestedDropoffPoints, 'destination')}
            </div>
          )}
          
          {/* Frequent locations */}
          {searchParams.destination === '' && userFrequentLocations.length > 0 && (
            <div className="sr-frequent-locations">
              <h4 className="sr-suggestions-title">Frequent Locations</h4>
              {renderFrequentLocationItems(userFrequentLocations, 'destination')}
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
              value={searchParams.date}
              onChange={handleInputChange}
              min={today}
              className="sr-form-input"
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
              value={searchParams.time}
              onChange={handleInputChange}
              className="sr-form-input"
            />
          </div>
        </div>

        <div className="sr-form-row">
          <div className="sr-form-group">
            <label htmlFor="ride-passengers" className="sr-form-label">
              <Users size={16} className="sr-icon" />
              Passengers
            </label>
            <input
              type="number"
              id="ride-passengers"
              name="passengers"
              value={searchParams.passengers}
              onChange={handleInputChange}
              min="1"
              max="8"
              className="sr-form-input"
              required
            />
          </div>

          <div className="sr-form-group">
            <label htmlFor="ride-radius" className="sr-form-label">
              <MapIcon size={16} className="sr-icon" />
              Search Radius (km)
            </label>
            <input
              type="number"
              id="ride-radius"
              name="radius"
              value={searchParams.radius}
              onChange={handleInputChange}
              min="0.5"
              max="10"
              step="0.5"
              className="sr-form-input"
            />
          </div>
        </div>

        <div className="sr-form-group">
          <label className="sr-form-label">Price Range (₹)</label>
          <div className="sr-price-range-container">
            <input
              type="number"
              value={searchParams.priceRange[0]}
              onChange={(e) => handlePriceRangeChange(e, 0)}
              min="0"
              max={searchParams.priceRange[1]}
              className="sr-form-input sr-price-input"
            />
            <span className="sr-price-separator">to</span>
            <input
              type="number"
              value={searchParams.priceRange[1]}
              onChange={(e) => handlePriceRangeChange(e, 1)}
              min={searchParams.priceRange[0]}
              max="5000"
              className="sr-form-input sr-price-input"
            />
          </div>
        </div>

        <div className="sr-form-group">
          <label htmlFor="ride-sort" className="sr-form-label">
            Sort By
          </label>
          <select
            id="ride-sort"
            name="sortBy"
            value={searchParams.sortBy}
            onChange={handleInputChange}
            className="sr-form-input"
          >
            <option value="departure">Departure Time</option>
            <option value="price">Price (Low to High)</option>
            <option value="duration">Duration (Shortest)</option>
            <option value="distance">Distance (Shortest)</option>
          </select>
        </div>

        <div className="sr-form-actions">
          <button
            type="submit"
            className="sr-search-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <RotateCw size={16} className="sr-icon sr-spin" /> Searching...
              </>
            ) : (
              <>
                <Search size={16} className="sr-icon" /> Search Rides
              </>
            )}
          </button>
        </div>
      </form>
    );
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

  // Render booking modal
  const renderBookingModal = () => {
    if (!bookingModalVisible || !selectedRide) return null;

    return (
      <div className="sr-booking-modal">
        <div className="sr-booking-modal-content">
          <div className="sr-booking-modal-header">
            <h3>Confirm Booking</h3>
            <button
              className="sr-close-button"
              onClick={closeBookingModal}
            >
              &times;
            </button>
          </div>
          <div className="sr-booking-details">
            <div className="sr-booking-info">
              <p><strong>From:</strong> {searchParams.origin}</p>
              <p><strong>To:</strong> {searchParams.destination}</p>
              <p><strong>Date:</strong> {selectedRide.departureDate}</p>
              <p><strong>Time:</strong> {formatDateTime(selectedRide.departureTime)}</p>
              <p><strong>Passengers:</strong> {searchParams.passengers}</p>
              <p><strong>Total Price:</strong> ₹{calculateCostPerPassenger(selectedRide) * searchParams.passengers}</p>
            </div>
            <div className="sr-driver-info">
              <h4>Driver Information</h4>
              <p><strong>Name:</strong> {selectedRide.driver.name}</p>
              <p><strong>Vehicle:</strong> {selectedRide.vehicle.make} {selectedRide.vehicle.model} ({selectedRide.vehicle.color})</p>
              <p><strong>Plate:</strong> {selectedRide.vehicle.licensePlate}</p>
              <p><strong>Rating:</strong> {selectedRide.driver.rating.toFixed(1)} ⭐</p>
            </div>
          </div>
          <div className="sr-booking-modal-footer">
            <button
              className="sr-secondary-button"
              onClick={closeBookingModal}
            >
              Cancel
            </button>
            <button
              className="sr-confirm-button"
              onClick={confirmBooking}
              disabled={loading}
            >
              {loading ? (
                <>
                  <RotateCw size={16} className="sr-icon sr-spin" /> Processing...
                </>
              ) : (
                'Confirm Booking'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render ride cards
  const renderRideCards = () => {
    if (availableRides.length === 0) {
      return loading ? null : (
        <div className="sr-no-rides">
          <p>No rides found matching your criteria.</p>
        </div>
      );
    }

    return (
      <div className="sr-rides-list">
        {availableRides.map(ride => (
          <div key={ride.id} className="sr-ride-card">
            <div className="sr-ride-header">
              <div className="sr-ride-time">
                <div className="sr-departure-time">
                  {formatDateTime(ride.departureTime)}
                </div>
                <div className="sr-duration">
                  {formatDuration(ride.durationMinutes)}
                </div>
                <div className="sr-arrival-time">
                  {formatDateTime(ride.arrivalTime)}
                </div>
              </div>
              <div className="sr-ride-price">
                <span className="sr-price-amount">₹{calculateCostPerPassenger(ride)}</span>
                <span className="sr-per-person">per person</span>
              </div>
            </div>
            
            <div className="sr-ride-details">
              <div className="sr-ride-route">
                <div className="sr-origin-point">
                  <div className="sr-point-marker sr-origin-marker"></div>
                  <div className="sr-point-name">{ride.origin}</div>
                </div>
                <div className="sr-route-line"></div>
                <div className="sr-destination-point">
                  <div className="sr-point-marker sr-destination-marker"></div>
                  <div className="sr-point-name">{ride.destination}</div>
                </div>
              </div>
              
              <div className="sr-ride-info">
                <div className="sr-info-item">
                  <span className="sr-info-label">Distance:</span>
                  <span className="sr-info-value">{formatDistance(ride.distanceKm)}</span>
                </div>
                <div className="sr-info-item">
                  <span className="sr-info-label">Available seats:</span>
                  <span className="sr-info-value">{ride.availableSeats}</span>
                </div>
              </div>
              
              <div className="sr-driver-preview">
                <div className="sr-driver-avatar">
                  {ride.driver.avatar ? (
                    <img src={ride.driver.avatar} alt={ride.driver.name} />
                  ) : (
                    <div className="sr-avatar-placeholder">
                      {ride.driver.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="sr-driver-brief">
                  <span className="sr-driver-name">{ride.driver.name}</span>
                  <span className="sr-driver-rating">{ride.driver.rating.toFixed(1)} ⭐</span>
                </div>
              </div>
            </div>
            
            <div className="sr-ride-actions">
              <button
                className="sr-route-button"
                onClick={() => viewRideRoute(ride)}
              >
                {expandedRideId === ride.id ? (
                  <>
                    <ChevronUp size={16} className="sr-icon" /> Hide Details
                  </>
                ) : (
                  <>
                    <ChevronDown size={16} className="sr-icon" /> View Details
                  </>
                )}
              </button>
              <button
                className="sr-book-button"
                onClick={() => bookRide(ride)}
              >
                Book Ride
              </button>
            </div>
            
            {expandedRideId === ride.id && (
              <div className="sr-expanded-details">
                <div className="sr-expanded-map">
                  {/* Map would be rendered here */}
                  <div className="sr-map-placeholder">
                    Route map will be displayed here
                  </div>
                </div>
                <div className="sr-expanded-info">
                  <h4>Vehicle Information</h4>
                  <p>
                    <strong>Vehicle:</strong> {ride.vehicle.make} {ride.vehicle.model}
                  </p>
                  <p>
                    <strong>Color:</strong> {ride.vehicle.color}
                  </p>
                  <p>
                    <strong>License Plate:</strong> {ride.vehicle.licensePlate}
                  </p>
                </div>
                <div className="sr-ride-notes">
                  <h4>Notes from Driver</h4>
                  <p>{ride.notes || "No additional notes from the driver."}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Fix typo in the formatDuration function (a60 should be 60)
  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} hr ${remainingMinutes} min`;
  };

  return (
    <div className="sr-schedule-ride-container">
      <h1 className="sr-page-title">Find a Ride</h1>
      
      {/* Error and Success messages */}
      {error && <div className="sr-error-message">{error}</div>}
      {success && <div className="sr-success-message">{success}</div>}
      
      {/* Form section */}
      <div className="sr-search-section">
        {renderForm()}
      </div>
      
      {/* Results section */}
      <div className="sr-results-section">
        <h2 className="sr-section-title">Available Rides</h2>
        {loading ? (
          <div className="sr-loading-indicator">
            <RotateCw size={24} className="sr-icon sr-spin" />
            <p>Searching for rides...</p>
          </div>
        ) : (
          renderRideCards()
        )}
      </div>
      
      {/* Map Modal */}
      {renderMapModal()}
      
      {/* Booking Modal */}
      {renderBookingModal()}
    </div>
  );
}

export default ScheduleRide;