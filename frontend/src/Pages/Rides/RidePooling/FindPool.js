import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import {
    Navigation,
    Crosshair,
    Map as MapIcon,
    Calendar,
    Clock,
    Users,
    Car,
    CircleDot,
    Repeat,
    AlertCircle,
    Clock4
} from 'lucide-react';

function FindPool() {
    const [rides, setRides] = useState([]);
    const [searchFilters, setSearchFilters] = useState({
        origin: '',
        destination: '',
        originCoords: null,
        destinationCoords: null,
        minSeats: 1,
        maxFare: '',
        date: '',
        allowDetour: false,
        isFlexiblePickup: false,
        vehicleType: '',
        isRecurringRide: false
    });
    const [routeDetails, setRouteDetails] = useState(null);
    const [loading, setLoading] = useState({
        searchRides: false,
        routeCalculation: false,
        geolocation: false
    });
    const [error, setError] = useState(null);
    const [mapVisible, setMapVisible] = useState(false);
    const [activeLocationField, setActiveLocationField] = useState(null);
    const [advancedFiltersVisible, setAdvancedFiltersVisible] = useState(false);
    const [selectedRide, setSelectedRide] = useState(null);
    const [pickupLocation, setPickupLocation] = useState({
        address: '',
        coordinates: null
    });
    const [dropoffLocation, setDropoffLocation] = useState({
        address: '',
        coordinates: null
    });
    
    // Refs for Google Maps
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const markerRef = useRef(null);
    
    // Initialize map when showing the map modal
    useEffect(() => {
        if (mapVisible && mapRef.current && window.google && !mapInstance.current) {
            const defaultLocation = { lat: 20.5937, lng: 78.9629 }; // Default to center of India
            
            mapInstance.current = new window.google.maps.Map(mapRef.current, {
                center: defaultLocation,
                zoom: 8,
                mapTypeControl: true,
                streetViewControl: false
            });
            
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
            
            // If we have coordinates for the active field, center on them
            if (activeLocationField === 'searchOrigin' && searchFilters.originCoords) {
                mapInstance.current.setCenter(searchFilters.originCoords);
                markerRef.current.setPosition(searchFilters.originCoords);
            } else if (activeLocationField === 'searchDestination' && searchFilters.destinationCoords) {
                mapInstance.current.setCenter(searchFilters.destinationCoords);
                markerRef.current.setPosition(searchFilters.destinationCoords);
            } else if (activeLocationField === 'customPickup' && pickupLocation.coordinates) {
                mapInstance.current.setCenter(pickupLocation.coordinates);
                markerRef.current.setPosition(pickupLocation.coordinates);
            } else if (activeLocationField === 'customDropoff' && dropoffLocation.coordinates) {
                mapInstance.current.setCenter(dropoffLocation.coordinates);
                markerRef.current.setPosition(dropoffLocation.coordinates);
            } else if (activeLocationField === 'viewRoute' && selectedRide) {
                // Display both origin and destination with a route for viewRoute mode
                displayRouteOnMap(selectedRide);
            } else {
                // Try to get user's current location if no coordinates are available
                getUserLocation();
            }
        }
    }, [mapVisible, activeLocationField, selectedRide]);
    
    // Function to get user's current location
    const getUserLocation = () => {
        setLoading(prev => ({ ...prev, geolocation: true }));
        
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    
                    if (mapInstance.current) {
                        mapInstance.current.setCenter(userLocation);
                        markerRef.current.setPosition(userLocation);
                        reverseGeocode(userLocation.lat, userLocation.lng);
                    }
                    
                    setLoading(prev => ({ ...prev, geolocation: false }));
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    setError('Unable to access your location');
                    setLoading(prev => ({ ...prev, geolocation: false }));
                }
            );
        } else {
            setError('Geolocation is not supported by your browser');
            setLoading(prev => ({ ...prev, geolocation: false }));
        }
    };
    
    // Display route on map with origin and destination markers
    const displayRouteOnMap = (ride) => {
        if (!window.google || !mapInstance.current) return;
        
        // Create origin and destination points from ride data
        let originPoint, destinationPoint;
        
        if (ride.originCoords && ride.originCoords.coordinates) {
            // Handle GeoJSON Point format from MongoDB
            originPoint = { 
                lat: ride.originCoords.coordinates[1], 
                lng: ride.originCoords.coordinates[0] 
            };
        } else if (ride.originCoords && typeof ride.originCoords === 'object') {
            originPoint = ride.originCoords;
        } else if (typeof ride.originCoords === 'string') {
            const coords = ride.originCoords.split(',').map(Number);
            originPoint = { lat: coords[0], lng: coords[1] };
        }
        
        if (ride.destinationCoords && ride.destinationCoords.coordinates) {
            destinationPoint = { 
                lat: ride.destinationCoords.coordinates[1], 
                lng: ride.destinationCoords.coordinates[0] 
            };
        } else if (ride.destinationCoords && typeof ride.destinationCoords === 'object') {
            destinationPoint = ride.destinationCoords;
        } else if (typeof ride.destinationCoords === 'string') {
            const coords = ride.destinationCoords.split(',').map(Number);
            destinationPoint = { lat: coords[0], lng: coords[1] };
        }
        
        // If we couldn't extract coordinates, use addresses
        const origin = originPoint || ride.origin;
        const destination = destinationPoint || ride.destination;
        
        // Clear previous markers and routes
        if (mapInstance.current) {
            mapInstance.current.setCenter(originPoint || { lat: 20.5937, lng: 78.9629 });
            
            const directionsService = new window.google.maps.DirectionsService();
            const directionsRenderer = new window.google.maps.DirectionsRenderer({
                map: mapInstance.current,
                suppressMarkers: false
            });
            
            const request = {
                origin: origin,
                destination: destination,
                travelMode: 'DRIVING'
            };
            
            directionsService.route(request, (result, status) => {
                if (status === 'OK') {
                    directionsRenderer.setDirections(result);
                    
                    // If the ride has suggested pickup points, display them
                    if (ride.suggestedPickupPoints && ride.suggestedPickupPoints.length > 0) {
                        ride.suggestedPickupPoints.forEach(point => {
                            new window.google.maps.Marker({
                                position: { lat: point.coords.lat, lng: point.coords.lng },
                                map: mapInstance.current,
                                icon: {
                                    path: window.google.maps.SymbolPath.CIRCLE,
                                    scale: 7,
                                    fillColor: "#4CAF50",
                                    fillOpacity: 1,
                                    strokeWeight: 2,
                                    strokeColor: "#FFFFFF"
                                },
                                title: `Pickup: ${point.name}`
                            });
                        });
                    }
                    
                    // If the ride has suggested dropoff points, display them
                    if (ride.suggestedDropoffPoints && ride.suggestedDropoffPoints.length > 0) {
                        ride.suggestedDropoffPoints.forEach(point => {
                            new window.google.maps.Marker({
                                position: { lat: point.coords.lat, lng: point.coords.lng },
                                map: mapInstance.current,
                                icon: {
                                    path: window.google.maps.SymbolPath.CIRCLE,
                                    scale: 7,
                                    fillColor: "#F44336",
                                    fillOpacity: 1,
                                    strokeWeight: 2,
                                    strokeColor: "#FFFFFF"
                                },
                                title: `Dropoff: ${point.name}`
                            });
                        });
                    }
                }
            });
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
                if (activeLocationField === 'searchOrigin') {
                    setSearchFilters(prev => ({
                        ...prev,
                        origin: address,
                        originCoords: { lat, lng }
                    }));
                } else if (activeLocationField === 'searchDestination') {
                    setSearchFilters(prev => ({
                        ...prev,
                        destination: address,
                        destinationCoords: { lat, lng }
                    }));
                } else if (activeLocationField === 'customPickup') {
                    setPickupLocation({
                        address,
                        coordinates: { lat, lng }
                    });
                } else if (activeLocationField === 'customDropoff') {
                    setDropoffLocation({
                        address,
                        coordinates: { lat, lng }
                    });
                }
            } else {
                console.error('Geocoder failed:', status);
            }
        });
    };
    
    // Open map modal for location selection
    const openMapForSelection = (field) => {
        setActiveLocationField(field);
        setMapVisible(true);
        
        // Reset the map instance so it reinitializes with the proper center
        mapInstance.current = null;
    };
    
    // Confirm the location selected on the map
    const confirmMapLocation = () => {
        setMapVisible(false);
    };
    
    // Memoized input change handler with improved validation
    const handleSearchInputChange = useCallback((e) => {
        const { name, value, type, min, max, checked } = e.target;
        let processedValue = value;

        if (type === 'number') {
            processedValue = Math.max(
                Number(min || 0),
                Math.min(Number(max || Number.MAX_SAFE_INTEGER), Number(value))
            );
        } else if (type === 'checkbox') {
            processedValue = checked;
        }

        setSearchFilters(prev => ({
            ...prev,
            [name]: processedValue
        }));
    }, []);

    const handleSearchRides = async (e) => {
        e.preventDefault();
        setLoading(prev => ({ ...prev, searchRides: true }));
        setError(null);

        try {
            // Format coordinates for API request
            const originCoordsFormatted = searchFilters.originCoords ? {
                type: 'Point',
                coordinates: [searchFilters.originCoords.lng, searchFilters.originCoords.lat]
            } : null;
            
            const destinationCoordsFormatted = searchFilters.destinationCoords ? {
                type: 'Point',
                coordinates: [searchFilters.destinationCoords.lng, searchFilters.destinationCoords.lat]
            } : null;
            
            // Prepare search parameters
            const searchParams = {
                ...searchFilters,
                originCoords: originCoordsFormatted,
                destinationCoords: destinationCoordsFormatted
            };

            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/rides/poolsearch`, {
                params: searchParams
            });
            setRides(response.data);
        } catch (error) {
            console.error('Error searching rides:', error);
            setError('Failed to search rides');
        } finally {
            setLoading(prev => ({ ...prev, searchRides: false }));
        }
    };

    // Enhanced route calculation with more detailed error handling
    const calculateRoute = async (ride) => {
        setLoading(prev => ({ ...prev, routeCalculation: true }));
        setError(null);
        setSelectedRide(ride);

        try {
            // Extract origin and destination coordinates
            let originCoords, destinationCoords;
            
            if (ride.originCoords && ride.originCoords.coordinates) {
                // Handle GeoJSON Point format from MongoDB
                originCoords = {
                    lat: ride.originCoords.coordinates[1],
                    lng: ride.originCoords.coordinates[0]
                };
            } else if (ride.originCoords && typeof ride.originCoords === 'object') {
                originCoords = ride.originCoords;
            }
            
            if (ride.destinationCoords && ride.destinationCoords.coordinates) {
                destinationCoords = {
                    lat: ride.destinationCoords.coordinates[1],
                    lng: ride.destinationCoords.coordinates[0]
                };
            } else if (ride.destinationCoords && typeof ride.destinationCoords === 'object') {
                destinationCoords = ride.destinationCoords;
            }
            
            // Use coordinates if available, otherwise use addresses
            const params = originCoords && destinationCoords ? 
                { 
                    originCoords: `${originCoords.lat},${originCoords.lng}`, 
                    destinationCoords: `${destinationCoords.lat},${destinationCoords.lng}` 
                } : 
                { origin: ride.origin, destination: ride.destination };

            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/poolroute`, {
                params
            });
            
            setRouteDetails(response.data);
            openMapForSelection('viewRoute');
        } catch (error) {
            console.error('Route calculation error:', error);
            setError('Could not calculate route details');
        } finally {
            setLoading(prev => ({ ...prev, routeCalculation: false }));
        }
    };

    // View ride details and route
    const viewRideDetails = (ride) => {
        setSelectedRide(ride);
        calculateRoute(ride);
    };

    // Join Ride with enhanced implementation for custom pickup/dropoff points
    const handleJoinRide = async (ride) => {
        try {
            if (!pickupLocation.address && !dropoffLocation.address) {
                // If no custom locations are set, use the ride's origin and destination
                const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/rides/${ride._id}/join`);
                alert('Ride joined successfully!');
                return;
            }
            
            // Format pickup and dropoff coordinates for MongoDB
            const pickupCoords = pickupLocation.coordinates ? {
                type: 'Point',
                coordinates: [pickupLocation.coordinates.lng, pickupLocation.coordinates.lat]
            } : null;
            
            const dropoffCoords = dropoffLocation.coordinates ? {
                type: 'Point',
                coordinates: [dropoffLocation.coordinates.lng, dropoffLocation.coordinates.lat]
            } : null;
            
            // Join with custom pickup/dropoff
            const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/rides/${ride._id}/join`, {
                pickupLocation: {
                    address: pickupLocation.address || ride.origin,
                    coordinates: pickupCoords
                },
                dropoffLocation: {
                    address: dropoffLocation.address || ride.destination,
                    coordinates: dropoffCoords
                }
            });
            
            alert('Ride joined successfully!');
            setPickupLocation({ address: '', coordinates: null });
            setDropoffLocation({ address: '', coordinates: null });
            setSelectedRide(null);
        } catch (error) {
            console.error('Error joining ride:', error);
            alert('Failed to join ride. Please try again.');
        }
    };

    // Initial rides fetch with more robust error handling
    useEffect(() => {
        const fetchRides = async () => {
            setLoading(prev => ({ ...prev, searchRides: true }));
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/rides/poolsearch`);
                setRides(response.data);
            } catch (error) {
                console.error('Error fetching rides:', error);
                setError('Could not fetch available rides');
            } finally {
                setLoading(prev => ({ ...prev, searchRides: false }));
            }
        };
        fetchRides();
    }, []);

    // Initialize Google Maps places autocomplete for search inputs
    useEffect(() => {
        if (window.google && window.google.maps) {
            const searchOriginInput = document.getElementById('search-origin');
            const searchDestinationInput = document.getElementById('search-destination');
            const customPickupInput = document.getElementById('custom-pickup');
            const customDropoffInput = document.getElementById('custom-dropoff');
            
            if (searchOriginInput) {
                const autocompleteSearchOrigin = new window.google.maps.places.Autocomplete(searchOriginInput);
                autocompleteSearchOrigin.addListener('place_changed', () => {
                    const place = autocompleteSearchOrigin.getPlace();
                    if (place.geometry) {
                        setSearchFilters(prev => ({
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
            
            if (searchDestinationInput) {
                const autocompleteSearchDestination = new window.google.maps.places.Autocomplete(searchDestinationInput);
                autocompleteSearchDestination.addListener('place_changed', () => {
                    const place = autocompleteSearchDestination.getPlace();
                    if (place.geometry) {
                        setSearchFilters(prev => ({
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
            
            if (customPickupInput) {
                const autocompleteCustomPickup = new window.google.maps.places.Autocomplete(customPickupInput);
                autocompleteCustomPickup.addListener('place_changed', () => {
                    const place = autocompleteCustomPickup.getPlace();
                    if (place.geometry) {
                        setPickupLocation({
                            address: place.formatted_address || place.name,
                            coordinates: {
                                lat: place.geometry.location.lat(),
                                lng: place.geometry.location.lng()
                            }
                        });
                    }
                });
            }
            
            if (customDropoffInput) {
                const autocompleteCustomDropoff = new window.google.maps.places.Autocomplete(customDropoffInput);
                autocompleteCustomDropoff.addListener('place_changed', () => {
                    const place = autocompleteCustomDropoff.getPlace();
                    if (place.geometry) {
                        setDropoffLocation({
                            address: place.formatted_address || place.name,
                            coordinates: {
                                lat: place.geometry.location.lat(),
                                lng: place.geometry.location.lng()
                            }
                        });
                    }
                });
            }
        }
    }, [selectedRide]);

    return (
        <>
            {error && (
                <div className="error-banner">
                    {error}
                </div>
            )}

            <section id="find-ride" className="ride-search-section">
                <div className="card ride-search-card">
                    <h2>Search Rides</h2>
                    <form onSubmit={handleSearchRides} className="search-form">
                        <div className="form-grid">
                            <div className="form-group location-input-group">
                                <label>From</label>
                                <div className="input-with-icon">
                                    <input
                                        id="search-origin"
                                        type="text"
                                        name="origin"
                                        value={searchFilters.origin}
                                        onChange={handleSearchInputChange}
                                        placeholder="Starting location"
                                    />
                                    <button 
                                        type="button" 
                                        className="location-picker-btn"
                                        onClick={() => openMapForSelection('searchOrigin')}
                                        title="Pick location on map"
                                    >
                                        <MapIcon size={16} />
                                    </button>
                                    <button 
                                        type="button" 
                                        className="current-location-btn"
                                        onClick={getUserLocation}
                                        title="Use current location"
                                    >
                                        <Crosshair size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="form-group location-input-group">
                                <label>To</label>
                                <div className="input-with-icon">
                                    <input
                                        id="search-destination"
                                        type="text"
                                        name="destination"
                                        value={searchFilters.destination}
                                        onChange={handleSearchInputChange}
                                        placeholder="Destination"
                                    />
                                    <button 
                                        type="button" 
                                        className="location-picker-btn"
                                        onClick={() => openMapForSelection('searchDestination')}
                                        title="Pick location on map"
                                    >
                                        <MapIcon size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Date</label>
                                <div className="input-with-icon">
                                    <input
                                        type="date"
                                        name="date"
                                        value={searchFilters.date}
                                        onChange={handleSearchInputChange}
                                    />
                                    <Calendar size={16} className="input-icon" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Min Seats</label>
                                <input
                                    type="number"
                                    name="minSeats"
                                    value={searchFilters.minSeats}
                                    onChange={handleSearchInputChange}
                                    min="1"
                                    max="6"
                                />
                            </div>
                            <div className="form-group">
                                <label>Max Fare (₹)</label>
                                <input
                                    type="number"
                                    name="maxFare"
                                    value={searchFilters.maxFare}
                                    onChange={handleSearchInputChange}
                                    min="0"
                                    step="10"
                                    placeholder="Maximum fare"
                                />
                            </div>
                        </div>
                        
                        <div className="advanced-filters-toggle">
                            <button 
                                type="button" 
                                className="toggle-filters-btn"
                                onClick={() => setAdvancedFiltersVisible(!advancedFiltersVisible)}
                            >
                                {advancedFiltersVisible ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
                            </button>
                        </div>
                        
                        {advancedFiltersVisible && (
                            <div className="advanced-filters">
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Vehicle Type</label>
                                        <select 
                                            name="vehicleType"
                                            value={searchFilters.vehicleType}
                                            onChange={handleSearchInputChange}
                                        >
                                            <option value="">Any</option>
                                            <option value="Car">Car</option>
                                            <option value="SUV">SUV</option>
                                            <option value="VAN">Van</option>
                                            <option value="BIKE">Bike</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div className="form-group checkbox-group">
                                        <input
                                            type="checkbox"
                                            id="allow-detour"
                                            name="allowDetour"
                                            checked={searchFilters.allowDetour}
                                            onChange={handleSearchInputChange}
                                        />
                                        <label htmlFor="allow-detour">Allow Detour</label>
                                    </div>
                                    <div className="form-group checkbox-group">
                                        <input
                                            type="checkbox"
                                            id="flexible-pickup"
                                            name="isFlexiblePickup"
                                            checked={searchFilters.isFlexiblePickup}
                                            onChange={handleSearchInputChange}
                                        />
                                        <label htmlFor="flexible-pickup">Flexible Pickup</label>
                                    </div>
                                    <div className="form-group checkbox-group">
                                        <input
                                            type="checkbox"
                                            id="recurring-ride"
                                            name="isRecurringRide"
                                            checked={searchFilters.isRecurringRide}
                                            onChange={handleSearchInputChange}
                                        />
                                        <label htmlFor="recurring-ride">Recurring Rides</label>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <button type="submit" className="search-rides-btn" disabled={loading.searchRides}>
                            {loading.searchRides ? 'Searching...' : 'Search Rides'}
                        </button>
                    </form>
                </div>

                <div className="card ride-list-card">
                    <h2>Available Rides</h2>
                    {rides.length === 0 ? (
                        <p className="no-rides-message">No rides available with your search criteria</p>
                    ) : (
                        <div className="rides-grid">
                            {rides.map(ride => (
                                <div key={ride._id} className="ride-card">
                                    <div className="ride-details">
                                        <div className="ride-route">
                                            <div className="route-points">
                                                <p><strong>From:</strong> {ride.origin}</p>
                                                <p><strong>To:</strong> {ride.destination}</p>
                                            </div>
                                            <button 
                                                className="view-route-btn-small"
                                                onClick={() => viewRideDetails(ride)}
                                            >
                                                <Navigation size={16} /> View Route
                                            </button>
                                        </div>
                                        
                                        <div className="ride-info-grid">
                                            <div className="ride-info-item">
                                                <Calendar size={16} />
                                                <p>{ride.date}</p>
                                            </div>
                                            <div className="ride-info-item">
                                                <Clock size={16} />
                                                <p>{ride.time}</p>
                                            </div>
                                            <div className="ride-info-item">
                                                <Users size={16} />
                                                <p>{ride.seatsAvailable || ride.seats} seats</p>
                                            </div>
                                            <div className="ride-info-item">
                                                <span className="fare-badge">₹{ride.fare}</span>
                                            </div>
                                            <div className="ride-info-item">
                                                <Car size={16} />
                                                <p>{ride.vehicleType}</p>
                                            </div>
                                        </div>
                                        
                                        {/* Show additional pool-specific features */}
                                        {(ride.isFlexiblePickup || ride.allowDetour || ride.isRecurringRide) && (
                                            <div className="ride-features">
                                                {ride.isFlexiblePickup && (
                                                    <div className="feature-badge">
                                                        <CircleDot size={14} />
                                                        <span>Flexible Pickup ({ride.pickupRadius}km)</span>
                                                    </div>
                                                )}
                                                {ride.allowDetour && (
                                                    <div className="feature-badge">
                                                        <AlertCircle size={14} />
                                                        <span>Detour Allowed ({ride.maxDetourDistance}km)</span>
                                                    </div>
                                                )}
                                                {ride.isRecurringRide && (
                                                    <div className="feature-badge">
                                                        <Repeat size={14} />
                                                        <span>Recurring</span>
                                                    </div>
                                                )}
                                                {ride.maxWaitTime > 0 && (
                                                    <div className="feature-badge">
                                                        <Clock4 size={14} />
                                                        <span>Wait: {ride.maxWaitTime}min</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        
                                        {/* Display suggested pickup/dropoff points if available */}
                                        {(ride.suggestedPickupPoints && ride.suggestedPickupPoints.length > 0) && (
                                            <div className="suggested-points">
                                                <p><strong>Suggested Pickup Points:</strong></p>
                                                <ul className="points-list">
                                                    {ride.suggestedPickupPoints.map((point, idx) => (
                                                        <li key={`pickup-${idx}`}>{point.name}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                    <button 
                                        className="join-ride-btn"
                                        onClick={() => viewRideDetails(ride)}
                                    >
                                        View Details & Join
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Map Modal for Location Selection */}
            {mapVisible && (
                <div className="map-modal">
                    <div className="map-modal-content">
                        <div className="map-header">
                            <h3>
                                {activeLocationField === 'searchOrigin' 
                                    ? 'Select Origin Location' 
                                    : activeLocationField === 'searchDestination'
                                    ? 'Select Destination Location'
                                    : activeLocationField === 'customPickup'
                                    ? 'Select Your Pickup Location'
                                    : activeLocationField === 'customDropoff'
                                    ? 'Select Your Dropoff Location'
                                    : 'View Route'}
                            </h3>
                            <button className="close-map-btn" onClick={() => setMapVisible(false)}>✕</button>
                        </div>
                        <div className="map-container" ref={mapRef}></div>
                        <div className="map-controls">
                            {loading.geolocation ? (
                                <p>Getting your location...</p>
                            ) : (
                                <>
                                    <button 
                                        className="get-location-btn"
                                        onClick={getUserLocation}
                                    >
                                        <Crosshair size={16} /> Use My Location
                                    </button>
                                    {activeLocationField !== 'viewRoute' && (
                                        <button 
                                            className="confirm-location-btn"
                                            onClick={confirmMapLocation}
                                        >
                                            Confirm Location
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Ride Details Modal */}
            {selectedRide && (
                <div className="ride-details-modal">
                    <div className="ride-details-content">
                        <div className="ride-details-header">
                            <h3>Ride Details</h3>
                            <button className="close-details-btn" onClick={() => setSelectedRide(null)}>✕</button>
                        </div>
                        
                        <div className="ride-details-body">
                            <div className="ride-route-details">
                                <h4>Route Information</h4>
                                <p><strong>From:</strong> {selectedRide.origin}</p>
                                <p><strong>To:</strong> {selectedRide.destination}</p>
                                
                                {routeDetails && (
                                    <div className="route-stats">
                                        <p><strong>Distance:</strong> {routeDetails.routes[0].legs[0].distance.text}</p>
                                        <p><strong>Duration:</strong> {routeDetails.routes[0].legs[0].duration.text}</p>
                                    </div>
                                )}
                                
                                <button 
                                    className="view-on-map-btn"
                                    onClick={() => setMapVisible(true)}
                                >
                                    <MapIcon size={16} /> View on Map
                                </button>
                            </div>
                            
                            <div className="ride-features-details">
                                <h4>Ride Features</h4>
                                <ul className="features-list">
                                    <li><strong>Date:</strong> {selectedRide.date}</li>
                                    <li><strong>Time:</strong> {selectedRide.time}</li>
                                    <li><strong>Vehicle:</strong> {selectedRide.vehicleType}</li>
                                    <li><strong>Seats Available:</strong> {selectedRide.seatsAvailable || selectedRide.seats}</li>
                                    <li><strong>Fare:</strong> ₹{selectedRide.fare}</li>
                                    
                                    {selectedRide.isFlexiblePickup && (
                                        <li><strong>Flexible Pickup:</strong> Yes (within {selectedRide.pickupRadius}km)</li>
                                    )}
                                    
                                    {selectedRide.allowDetour && (
                                        <li><strong>Detour Allowed:</strong> Yes (up to {selectedRide.maxDetourDistance}km)</li>
                                    )}
                                    
                                    {selectedRide.maxWaitTime > 0 && (
                                        <li><strong>Max Wait Time:</strong> {selectedRide.maxWaitTime} minutes</li>
                                    )}
                                    
                                    {selectedRide.isRecurringRide && (
                                        <li>
                                            <strong>Recurring Ride:</strong> Yes
                                            {selectedRide.recurringDays && selectedRide.recurringDays.length > 0 && (
                                                <span> ({selectedRide.recurringDays.join(', ')})</span>
                                            )}
                                        </li>
                                    )}
                                </ul>
                                
                                {selectedRide.notes && (
                                    <div className="ride-notes">
                                        <h4>Notes</h4>
                                        <p>{selectedRide.notes}</p>
                                    </div>
                                )}
                            </div>
                            
                            {/* Custom Pickup/Dropoff Section */}
                            {(selectedRide.isFlexiblePickup || selectedRide.allowDetour) && (
                                <div className="custom-locations">
                                    <h4>Set Your Locations</h4>
                                    
                                    <div className="form-group">
                                        <label>Your Pickup Location</label>
                                        <div className="input-with-icon">
                                            <input
                                                id="custom-pickup"
                                                type="text"
                                                value={pickupLocation.address}
                                                onChange={(e) => setPickupLocation({
                                                    ...pickupLocation,
                                                    address: e.target.value
                                                })}
                                                placeholder={selectedRide.isFlexiblePickup ? "Custom pickup location" : selectedRide.origin}
                                                disabled={!selectedRide.isFlexiblePickup}
                                            />
                                            {selectedRide.isFlexiblePickup && (
                                                <button 
                                                    type="button" 
                                                    className="location-picker-btn"
                                                    onClick={() => openMapForSelection('customPickup')}
                                                    title="Pick location on map"
                                                >
                                                    <MapIcon size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="form-group">
                                        <label>Your Dropoff Location</label>
                                        <div className="input-with-icon">
                                            <input
                                                id="custom-dropoff"
                                                type="text"
                                                value={dropoffLocation.address}
                                                onChange={(e) => setDropoffLocation({
                                                    ...dropoffLocation,
                                                    address: e.target.value
                                                })}
                                                placeholder={selectedRide.allowDetour ? "Custom dropoff location" : selectedRide.destination}
                                                disabled={!selectedRide.allowDetour}
                                            />
                                            {selectedRide.allowDetour && (
                                                <button 
                                                    type="button" 
                                                    className="location-picker-btn"
                                                    onClick={() => openMapForSelection('customDropoff')}
                                                    title="Pick location on map"
                                                >
                                                    <MapIcon size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Suggested Pickup Points */}
                                    {selectedRide.suggestedPickupPoints && selectedRide.suggestedPickupPoints.length > 0 && (
                                        <div className="suggested-points-section">
                                            <h5>Suggested Pickup Points</h5>
                                            <div className="suggested-points-grid">
                                                {selectedRide.suggestedPickupPoints.map((point, idx) => (
                                                    <div 
                                                        key={`pickup-point-${idx}`}
                                                        className="suggested-point-card"
                                                        onClick={() => setPickupLocation({
                                                            address: point.address || point.name,
                                                            coordinates: point.coords
                                                        })}
                                                    >
                                                        <CircleDot size={16} className="point-icon" />
                                                        <div className="point-info">
                                                            <p className="point-name">{point.name}</p>
                                                            <p className="point-address">{point.address}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Suggested Dropoff Points */}
                                    {selectedRide.suggestedDropoffPoints && selectedRide.suggestedDropoffPoints.length > 0 && (
                                        <div className="suggested-points-section">
                                            <h5>Suggested Dropoff Points</h5>
                                            <div className="suggested-points-grid">
                                                {selectedRide.suggestedDropoffPoints.map((point, idx) => (
                                                    <div 
                                                        key={`dropoff-point-${idx}`}
                                                        className="suggested-point-card"
                                                        onClick={() => setDropoffLocation({
                                                            address: point.address || point.name,
                                                            coordinates: point.coords
                                                        })}
                                                    >
                                                        <CircleDot size={16} className="point-icon" />
                                                        <div className="point-info">
                                                            <p className="point-name">{point.name}</p>
                                                            <p className="point-address">{point.address}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            <div className="join-ride-section">
                                <button 
                                    className="join-ride-btn-large"
                                    onClick={() => handleJoinRide(selectedRide)}
                                >
                                    Join This Ride
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default FindPool;