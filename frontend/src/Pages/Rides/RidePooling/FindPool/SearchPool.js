// SearchRides.js
import React, { useState, useEffect, useRef } from 'react';
import { MapIcon, Calendar, Search, Filter, MapPin, RotateCw, X } from 'lucide-react';
import './SearchPool.css'; // Import your CSS file for styling
import axios from 'axios';

function SearchRides({ onSearchComplete, onError, onSuccess }) {
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
        maxDistance: 10, // km from preferred pickup/dropoff
        includeRecurring: true,
        flexibleTiming: false,
        timeFlexibility: 60, // minutes
        
    });

    // UI state
    const [loading, setLoading] = useState(false);
    const [filtersVisible, setFiltersVisible] = useState(false);
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
        onError(null);

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

                                onSuccess('Current location set as pickup point');
                            } else {
                                onError('Could not get address for your location');
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

                    onError(errorMessage);
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
            onError('Geolocation is not supported by your browser');
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
        onError(null);
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
            } else {
                // Try to get user's current location if no coordinates are available
                getUserLocation();
            }
        }

        // Cleanup function
        return () => {
            if (!mapVisible) {
                // Clean up the marker
                if (markerRef.current) {
                    markerRef.current.setMap(null);
                    markerRef.current = null;
                }
            }
        };
    }, [mapVisible, activeLocationField]);

    // Function to get user's current location
    const getUserLocation = () => {
        setLoadingLocation(true);
        onError(null);

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

                    onError(errorMessage);
                    setLoadingLocation(false);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        } else {
            onError('Geolocation is not supported by your browser');
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
                onError('Failed to get address for selected location');
            }
        });
    };

    // Confirm the location selected on the map
    const confirmMapLocation = () => {
        if (!markerRef.current) {
            onError('Please select a location on the map first');
            return;
        }

        setMapVisible(false);
        onSuccess(`${activeLocationField === 'origin' ? 'Origin' : 'Destination'} location confirmed`);
    };

    // Close map modal
    const closeMapModal = () => {
        setMapVisible(false);
    };

    // Toggle advanced filters visibility
    const toggleFilters = () => {
        setFiltersVisible(!filtersVisible);
    };

    // Handle search form submission
    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        onError(null);

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

            // Pass results to parent component
            const rides = response.data.rides || [];
            onSearchComplete(rides);

            // Show message based on results
            if (rides.length === 0) {
                onSuccess('No matching rides found. Try adjusting your search criteria.');
            } else {
                onSuccess(`Found ${rides.length} matching rides!`);
            }

        } catch (error) {
            console.error('Error searching for rides:', error);

            // Extract error message
            const errorMessage =
                error.response?.data?.message ||
                error.response?.data?.errors?.[0]?.msg ||
                error.message ||
                'Failed to search for rides';

            onError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="sp-search-section-inside">
            <h2 className="sp-section-title">Find Carpooling Rides</h2>

            <form onSubmit={handleSearch} className="sp-search-form">
                <div className="sp-search-basic-inputs">
                    <div className="sp-form-group">
                        <label htmlFor="search-origin">From</label>
                        <div className="sp-location-input-container">
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
                                className="sp-map-button"
                                onClick={() => openMapForSelection('origin')}
                            >
                                <MapIcon size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="sp-form-group">
                        <label htmlFor="search-destination">To</label>
                        <div className="sp-location-input-container">
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
                                className="sp-map-button"
                                onClick={() => openMapForSelection('destination')}
                            >
                                <MapIcon size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="sp-form-group">
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

                    <div className="sp-form-group">
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
                        className="sp-filter-toggle-button"
                        onClick={toggleFilters}
                    >
                        <Filter size={16} />
                        {filtersVisible ? 'Hide Filters' : 'More Filters'}
                    </button>
                </div>

                {filtersVisible && (
                    <div className="sp-advanced-filters">
                        <div className="sp-form-row">
                            <div className="sp-form-group">
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

                            <div className="sp-form-group">
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

                        <div className="sp-form-row">
                            <div className="sp-form-group">
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
                                <span className="sp-range-value">{searchParams.maxDistance} km</span>
                            </div>
                        </div>

                        <div className="sp-form-row sp-checkbox-row">
                            <div className="sp-form-group sp-checkbox-group">
                                <input
                                    type="checkbox"
                                    id="search-include-recurring"
                                    name="includeRecurring"
                                    checked={searchParams.includeRecurring}
                                    onChange={handleInputChange}
                                />
                                <label htmlFor="search-include-recurring">Include recurring rides</label>
                            </div>

                            <div className="sp-form-group sp-checkbox-group">
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
                            <div className="sp-form-row">
                                <div className="sp-form-group">
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
                                    <span className="sp-range-value">{searchParams.timeFlexibility} minutes</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="sp-search-actions">
                    <button
                        type="submit"
                        className="sp-search-button"
                        disabled={loading}
                    >
                        {loading ? <RotateCw className="sp-icon-spin" size={16} /> : <Search size={16} />}
                        {loading ? 'Searching...' : 'Search Rides'}
                    </button>
                </div>
            </form>

            {/* Map Modal */}
            {mapVisible && (
                <div className="sp-map-modal-search">
                    <div className="sp-map-container-search">
                        <div className="sp-map-heade-search">
                            <h3>
                                {activeLocationField === 'origin' && 'Select Pickup Location'}
                                {activeLocationField === 'destination' && 'Select Drop-off Location'}
                            </h3>
                            <button className="sp-close-button" onClick={closeMapModal}>
                                <X size={18} />
                            </button>
                        </div>

                        <div className="sp-map-content-search">
                            <div
                                id="map"
                                ref={mapRef}
                                className="sp-map-element-search"
                            ></div>
                        </div>

                        <div className="sp-map-footer-search">
                            {loadingLocation && (
                                <span className="sp-loading-location">
                                    <RotateCw className="sp-icon-spin" size={16} />
                                    Getting location...
                                </span>
                            )}

                            <button
                                className="sp-user-location-button"
                                onClick={getUserLocation}
                                disabled={loadingLocation}
                            >
                                <MapPin size={16} />
                                Use Current Location
                            </button>

                            <button
                                className="sp-confirm-location-button"
                                onClick={confirmMapLocation}
                            >
                                Confirm Location
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SearchRides;