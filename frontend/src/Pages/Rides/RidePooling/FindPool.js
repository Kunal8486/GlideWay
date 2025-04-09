import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MapIcon, Calendar, Search, Filter, MapPin, Clock, Users, ChevronsRight, RotateCw, X, DollarSign, Car } from 'lucide-react';
import './FindPool.css';

function FindRide() {
    // Search parameters state
    const [searchParams, setSearchParams] = useState({
        origin: '',
        destination: '',
        originCoords: null,
        destinationCoords: null,
        date: '',
        time: '',
        seats: 1,
        maxFare: '',
        maxDistance: 5, // km from preferred pickup/dropoff
        includeRecurring: true,
        flexibleTiming: false,
        timeFlexibility: 60, // minutes
    });

    // Results and UI state
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [filtersVisible, setFiltersVisible] = useState(false);
    const [selectedRide, setSelectedRide] = useState(null);
    const [selectedRideRoute, setSelectedRideRoute] = useState(null);
    const [mapVisible, setMapVisible] = useState(false);
    const [activeLocationField, setActiveLocationField] = useState(null);
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [initialLocationFetched, setInitialLocationFetched] = useState(false);

    // Refs for Google Maps
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const autocompleteOriginRef = useRef(null);
    const autocompleteDestinationRef = useRef(null);
    const markerRef = useRef(null);
    const directionsRendererRef = useRef(null);

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

    // Function to automatically fetch the user's current location when the page loads
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

    const initializeMapsServices = () => {
        // Initialize autocomplete for origin and destination inputs
        const originInput = document.getElementById('search-origin');
        const destinationInput = document.getElementById('search-destination');

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
                }
            });
        }
    };

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        // Handle different input types
        const updatedValue = type === 'checkbox' ? checked : value;

        setSearchParams(prev => ({
            ...prev,
            [name]: updatedValue
        }));
    };

    // Open map for location selection
    const openMapForSelection = (field) => {
        setActiveLocationField(field);
        setMapVisible(true);
        setError(null);
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

            // Handle different map views based on the active field
            if (activeLocationField === 'origin' && searchParams.originCoords) {
                mapInstance.current.setCenter(searchParams.originCoords);
                markerRef.current.setPosition(searchParams.originCoords);
            } else if (activeLocationField === 'destination' && searchParams.destinationCoords) {
                mapInstance.current.setCenter(searchParams.destinationCoords);
                markerRef.current.setPosition(searchParams.destinationCoords);
            } else if (activeLocationField === 'viewRoute' && selectedRide) {
                // Hide the marker when viewing route
                markerRef.current.setMap(null);

                // Show the selected ride's route instead
                const originCoords = parseCoordinates(selectedRide.originCoords);
                const destinationCoords = parseCoordinates(selectedRide.destinationCoords);

                if (originCoords && destinationCoords) {
                    showRoute(originCoords, destinationCoords);
                }
            } else {
                // Try to get user's current location if no coordinates are available
                getUserLocation();
            }
        }

        // Cleanup function
        return () => {
            if (!mapVisible) {
                // Clean up the directions renderer
                if (directionsRendererRef.current) {
                    directionsRendererRef.current.setMap(null);
                    directionsRendererRef.current = null;
                }

                // Clean up the marker
                if (markerRef.current) {
                    markerRef.current.setMap(null);
                    markerRef.current = null;
                }
            }
        };
    }, [mapVisible, activeLocationField, selectedRide]);

    // Function to get user's current location
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
                } else if (activeLocationField === 'destination') {
                    setSearchParams(prev => ({
                        ...prev,
                        destination: address,
                        destinationCoords: { lat, lng }
                    }));
                }
            } else {
                console.error('Geocoder failed:', status);
                setError('Failed to get address for selected location');
            }
        });
    };

    // Helper to parse coordinates from string
    const parseCoordinates = (coordsString) => {
        if (!coordsString) return null;

        // Handle both string format "lat,lng" and object format {lat, lng}
        if (typeof coordsString === 'string') {
            const [lat, lng] = coordsString.split(',').map(Number);
            return { lat, lng };
        } else if (typeof coordsString === 'object' && coordsString !== null) {
            return coordsString;
        }
        return null;
    };

    // Function to display the route on the map
    const showRoute = (originCoords, destinationCoords) => {
        if (!window.google || !mapInstance.current) return;

        const directionsService = new window.google.maps.DirectionsService();

        // If we already have a directions renderer, clear it
        if (directionsRendererRef.current) {
            directionsRendererRef.current.setMap(null);
            directionsRendererRef.current = null;
        }

        // Create a new directions renderer
        directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
            map: mapInstance.current,
            suppressMarkers: false,
            polylineOptions: {
                strokeColor: '#4285F4',
                strokeWeight: 5
            }
        });

        const request = {
            origin: originCoords,
            destination: destinationCoords,
            travelMode: 'DRIVING'
        };

        directionsService.route(request, (result, status) => {
            if (status === 'OK') {
                directionsRendererRef.current.setDirections(result);

                // Fit the map to the route bounds
                const bounds = new window.google.maps.LatLngBounds();
                bounds.extend(originCoords);
                bounds.extend(destinationCoords);
                mapInstance.current.fitBounds(bounds);

                // Extract route details
                const route = result.routes[0];
                if (route && route.legs[0]) {
                    setSelectedRideRoute({
                        distance: route.legs[0].distance.text,
                        duration: route.legs[0].duration.text
                    });
                }
            } else {
                setError('Could not calculate route. Please try again.');
            }
        });
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

    // Close map modal
    const closeMapModal = () => {
        setMapVisible(false);
    };

    // Format date for display
    const formatDate = (dateString) => {
        const options = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-IN', options);
    };

    // Format time for display
    const formatTime = (timeString) => {
        return timeString;
    };

    // Handle search form submission
    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setRides([]);

        try {
            // Validation
            if (!searchParams.origin.trim()) {
                throw new Error('Origin location is required');
            }
            if (!searchParams.destination.trim()) {
                throw new Error('Destination location is required');
            }

            // Format coordinates correctly for API request
            const formattedParams = {
                ...searchParams,
                originCoords: searchParams.originCoords
                    ? `${searchParams.originCoords.lat},${searchParams.originCoords.lng}`
                    : null,
                destinationCoords: searchParams.destinationCoords
                    ? `${searchParams.destinationCoords.lat},${searchParams.destinationCoords.lng}`
                    : null,
                seats: parseInt(searchParams.seats) || 1,
                maxFare: searchParams.maxFare ? parseFloat(searchParams.maxFare) : null,
                maxDistance: parseFloat(searchParams.maxDistance) || 5,
                timeFlexibility: parseInt(searchParams.timeFlexibility) || 60
            };

            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (!token) {
                throw new Error('User is not authenticated. Please log in first.');
            }

            // Call the API to get matching rides
            const response = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/api/rides/pool/search`,
                {
                    params: formattedParams,
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            // Update rides state with results
            setRides(response.data.rides || []);

            // Show message if no rides found
            if (response.data.rides.length === 0) {
                setSuccess('No matching rides found. Try adjusting your search criteria.');
                setTimeout(() => setSuccess(null), 5000);
            } else {
                setSuccess(`Found ${response.data.rides.length} matching rides!`);
                setTimeout(() => setSuccess(null), 3000);
            }

        } catch (error) {
            console.error('Error searching for rides:', error);

            // Extract error message
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

    // View ride details and route
    const viewRideRoute = (ride) => {
        setSelectedRide(ride);
        setActiveLocationField('viewRoute');
        setMapVisible(true);
    };

    // Book a ride
    const bookRide = async (rideId) => {
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (!token) {
                throw new Error('User is not authenticated. Please log in first.');
            }

            // Call API to book the ride
            const response = await axios.post(
                `${process.env.REACT_APP_API_BASE_URL}/api/rides/pool/book`,
                { rideId, seats: searchParams.seats },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Show success message
            setSuccess('Ride booked successfully! Check your rides for details.');

            // Update the ride status in the list
            setRides(prevRides =>
                prevRides.map(ride =>
                    ride.id === rideId
                        ? { ...ride, isBooked: true, availableSeats: ride.availableSeats - searchParams.seats }
                        : ride
                )
            );

            setTimeout(() => setSuccess(null), 5000);
        } catch (error) {
            console.error('Error booking ride:', error);

            // Extract error message
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

    // Toggle advanced filters visibility
    const toggleFilters = () => {
        setFiltersVisible(!filtersVisible);
    };

    // Mock data for testing UI (Comment out when connecting to real API)
    /*
    useEffect(() => {
        const mockRides = [
            {
                id: '1',
                origin: 'Andheri, Mumbai',
                destination: 'BKC, Mumbai',
                originCoords: '19.1136,72.8697',
                destinationCoords: '19.0596,72.8619',
                date: '2025-04-12',
                time: '09:00',
                seats: 3,
                availableSeats: 2,
                fare: 150,
                vehicleType: 'Car',
                driverName: 'Rahul S.',
                driverRating: 4.8,
                isRecurring: true,
                recurringDays: ['Mon', 'Wed', 'Fri'],
                isFlexiblePickup: true,
                pickupRadius: 2,
                notes: 'Office commute, can pick up from nearby metro stations too.'
            },
            {
                id: '2',
                origin: 'Powai, Mumbai',
                destination: 'Lower Parel, Mumbai',
                originCoords: '19.1176,72.9060',
                destinationCoords: '18.9982,72.8311',
                date: '2025-04-14',
                time: '08:30',
                seats: 4,
                availableSeats: 3,
                fare: 200,
                vehicleType: 'SUV',
                driverName: 'Priya M.',
                driverRating: 4.7,
                isRecurring: false,
                isFlexiblePickup: true,
                pickupRadius: 1,
                notes: 'AC vehicle, please be on time.'
            },
            {
                id: '3',
                origin: 'Thane, Mumbai',
                destination: 'Fort, Mumbai',
                originCoords: '19.2183,72.9781',
                destinationCoords: '18.9345,72.8371',
                date: '2025-04-15',
                time: '10:00',
                seats: 2,
                availableSeats: 2,
                fare: 250,
                vehicleType: 'Car',
                driverName: 'Amar K.',
                driverRating: 4.9,
                isRecurring: true,
                recurringDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
                isFlexiblePickup: false,
                notes: 'Office commute, runs every weekday.'
            }
        ];

        setTimeout(() => {
            setRides(mockRides);
        }, 1000);
    }, []);
    */

    return (
        <div className="find-ride-page">
            <div className="find-ride-container">
                {error && (
                    <div className="error-message">
                        <span>{error}</span>
                        <button onClick={() => setError(null)}>×</button>
                    </div>
                )}
                {success && (
                    <div className="success-message">
                        <span>{success}</span>
                        <button onClick={() => setSuccess(null)}>×</button>
                    </div>
                )}

                <h2 className="page-title">Find Carpooling Rides</h2>

                <form onSubmit={handleSearch} className="search-form">
                    <div className="search-basic-inputs">
                        <div className="form-group">
                            <label htmlFor="search-origin">From</label>
                            <div className="location-input-container">
                                <input
                                    type="text"
                                    id="search-origin"
                                    name="origin"
                                    value={searchParams.origin}
                                    onChange={handleInputChange}
                                    placeholder="Enter pickup location"
                                    required
                                />
                                <button
                                    type="button"
                                    className="map-button"
                                    onClick={() => openMapForSelection('origin')}
                                >
                                    <MapIcon size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="search-destination">To</label>
                            <div className="location-input-container">
                                <input
                                    type="text"
                                    id="search-destination"
                                    name="destination"
                                    value={searchParams.destination}
                                    onChange={handleInputChange}
                                    placeholder="Enter drop-off location"
                                    required
                                />
                                <button
                                    type="button"
                                    className="map-button"
                                    onClick={() => openMapForSelection('destination')}
                                >
                                    <MapIcon size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="search-date">Date</label>
                            <input
                                type="date"
                                id="search-date"
                                name="date"
                                min={today}
                                value={searchParams.date}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="search-seats">Seats</label>
                            <input
                                type="number"
                                id="search-seats"
                                name="seats"
                                min="1"
                                max="6"
                                value={searchParams.seats}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <button
                            type="button"
                            className="filter-toggle-button"
                            onClick={toggleFilters}
                        >
                            <Filter size={16} />
                            {filtersVisible ? 'Hide Filters' : 'More Filters'}
                        </button>
                    </div>

                    {filtersVisible && (
                        <div className="advanced-filters">
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="search-max-fare">Maximum Fare (₹)</label>
                                    <input
                                        type="number"
                                        id="search-max-fare"
                                        name="maxFare"
                                        min="0"
                                        value={searchParams.maxFare}
                                        onChange={handleInputChange}
                                        placeholder="Any price"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="search-time">Preferred Time</label>
                                    <input
                                        type="time"
                                        id="search-time"
                                        name="time"
                                        value={searchParams.time}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="search-max-distance">Maximum Distance from Route (km)</label>
                                    <input
                                        type="range"
                                        id="search-max-distance"
                                        name="maxDistance"
                                        min="1"
                                        max="10"
                                        step="1"
                                        value={searchParams.maxDistance}
                                        onChange={handleInputChange}
                                    />
                                    <span className="range-value">{searchParams.maxDistance} km</span>
                                </div>
                            </div>

                            <div className="form-row checkbox-row">
                                <div className="form-group checkbox-group">
                                    <input
                                        type="checkbox"
                                        id="search-include-recurring"
                                        name="includeRecurring"
                                        checked={searchParams.includeRecurring}
                                        onChange={handleInputChange}
                                    />
                                    <label htmlFor="search-include-recurring">Include recurring rides</label>
                                </div>

                                <div className="form-group checkbox-group">
                                    <input
                                        type="checkbox"
                                        id="search-flexible-timing"
                                        name="flexibleTiming"
                                        checked={searchParams.flexibleTiming}
                                        onChange={handleInputChange}
                                    />
                                    <label htmlFor="search-flexible-timing">Flexible timing</label>
                                </div>
                            </div>

                            {searchParams.flexibleTiming && (
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="search-time-flexibility">Time Flexibility (minutes)</label>
                                        <input
                                            type="range"
                                            id="search-time-flexibility"
                                            name="timeFlexibility"
                                            min="15"
                                            max="180"
                                            step="15"
                                            value={searchParams.timeFlexibility}
                                            onChange={handleInputChange}
                                        />
                                        <span className="range-value">{searchParams.timeFlexibility} minutes</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="search-actions">
                        <button
                            type="submit"
                            className="search-button"
                            disabled={loading}
                        >
                            {loading ? <RotateCw className="icon-spin" size={16} /> : <Search size={16} />}
                            {loading ? 'Searching...' : 'Search Rides'}
                        </button>
                    </div>
                </form>

                <div className="search-results">
                    {loading ? (
                        <div className="loading-container">
                            <RotateCw className="icon-spin" size={24} />
                            <p>Searching for rides...</p>
                        </div>
                    ) : rides.length > 0 ? (
                        <div className="rides-list">
                            <h3>Available Rides</h3>
                            {rides.map(ride => (
                                <div key={ride.id} className="ride-card">
                                    <div className="ride-header">
                                        <div className="ride-info-main">
                                            <h4>
                                                <Car size={16} className="icon" />
                                                {ride.vehicleType || 'Car'} • {ride.availableSeats} seats available
                                            </h4>
                                            <div className="ride-fare">
                                                <DollarSign size={16} className="icon" />
                                                <span>₹{ride.fare} per seat</span>
                                            </div>
                                        </div>
                                        <div className="driver-info">
                                            <span>Driver: {ride.driverName}</span>
                                            <span className="rating">★ {ride.driverRating}</span>
                                        </div>
                                    </div>

                                    <div className="ride-details">
                                        <div className="route-info">
                                            <div className="location origin">
                                                <MapPin size={16} className="icon" />
                                                <span>{ride.origin}</span>
                                            </div>
                                            <div className="route-line">
                                                <span className="dot"></span>
                                                <span className="line"></span>
                                                <span className="dot"></span>
                                            </div>
                                            <div className="location destination">
                                                <MapPin size={16} className="icon" />
                                                <span>{ride.destination}</span>
                                            </div>
                                        </div>

                                        <div className="ride-timing">
                                            <div className="ride-date">
                                                <Calendar size={16} className="icon" />
                                                <span>{formatDate(ride.date)}</span>
                                            </div>
                                            <div className="ride-time">
                                                <Clock size={16} className="icon" />
                                                <span>{formatTime(ride.time)}</span>
                                            </div>
                                        </div>

                                        {ride.isRecurring && (
                                            <div className="recurring-info">
                                                <span className="recurring-label">Recurring:</span>
                                                <span className="recurring-days">
                                                    {ride.recurringDays?.join(', ') || 'Weekly'}
                                                </span>
                                            </div>
                                        )}

                                        {ride.notes && (
                                            <div className="ride-notes">
                                                <p>{ride.notes}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="ride-actions">
                                        <button
                                            type="button"
                                            className="action-button view-route"
                                            onClick={() => viewRideRoute(ride)}
                                        >
                                            <MapIcon size={16} className="icon" />
                                            View Route
                                        </button>
                                        <button
                                            type="button"
                                            className="action-button book-ride"
                                            onClick={() => bookRide(ride.id)}
                                            disabled={ride.isBooked || ride.availableSeats < searchParams.seats || loading}
                                        >
                                            {ride.isBooked ? 'Booked' : 'Book Ride'}
                                            <ChevronsRight size={16} className="icon" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="no-results">
                            <p>No rides found. Adjust your search criteria and try again.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Map Modal */}
            {mapVisible && (
                <div className="map-modal">
                    <div className="map-container">
                        <div className="map-header">
                            <h3>
                                {activeLocationField === 'origin' && 'Select Pickup Location'}
                                {activeLocationField === 'destination' && 'Select Drop-off Location'}
                                {activeLocationField === 'viewRoute' && 'View Ride Route'}
                            </h3>
                            <button className="close-button" onClick={closeMapModal}>
                                <X size={18} />
                            </button>
                        </div>

                        <div className="map-content">
                            <div
                                id="map"
                                ref={mapRef}
                                className="map-element"
                            ></div>

                            {activeLocationField === 'viewRoute' && selectedRideRoute && (
                                <div className="route-details">
                                    <div className="route-info-item">
                                        <strong>Distance:</strong> {selectedRideRoute.distance}
                                    </div>
                                    <div className="route-info-item">
                                        <strong>Estimated Travel Time:</strong> {selectedRideRoute.duration}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="map-footer">
                            {loadingLocation && (
                                <span className="loading-location">
                                    <RotateCw className="icon-spin" size={16} />
                                    Getting location...
                                </span>
                            )}

                            {activeLocationField !== 'viewRoute' && (
                                <button
                                    className="user-location-button"
                                    onClick={getUserLocation}
                                    disabled={loadingLocation}
                                >
                                    <MapPin size={16} />
                                    Use Current Location
                                </button>
                            )}

                            {activeLocationField !== 'viewRoute' ? (
                                <button
                                    className="confirm-location-button"
                                    onClick={confirmMapLocation}
                                >
                                    Confirm Location
                                </button>
                            ) : (
                                <button
                                    className="close-view-button"
                                    onClick={closeMapModal}
                                >
                                    Close View
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default FindRide;