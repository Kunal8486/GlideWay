import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { MapIcon, Crosshair, Calendar, Users, MapPin, RotateCw } from 'lucide-react';
import './RideCreationForm.css';

function CreateRide() {
    // State for ride details
    const [rideDetails, setRideDetails] = useState({
        origin: '',
        destination: '',
        originCoords: null,
        destinationCoords: null,
        date: '',
        time: '',
        seats: 1,
        fare: '',
        vehicleType: 'Car',
        notes: '',
        // New fields for pooling enhancement
        isFlexiblePickup: false,
        pickupRadius: 1, // in kilometers
        frequentLocations: [],
        isRecurringRide: false,
        recurringDays: [],
        allowDetour: false,
        maxDetourDistance: 2, // in kilometers
        maxWaitTime: 10 // in minutes
    });

    // State for UI handling
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [mapVisible, setMapVisible] = useState(false);
    const [activeLocationField, setActiveLocationField] = useState(null);
    const [routeDetails, setRouteDetails] = useState(null);
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [suggestedPickupPoints, setSuggestedPickupPoints] = useState([]);
    const [suggestedDropoffPoints, setSuggestedDropoffPoints] = useState([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [userFrequentLocations, setUserFrequentLocations] = useState([]);
    const [initialLocationFetched, setInitialLocationFetched] = useState(false);

    // Refs for Google Maps
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const autocompleteOriginRef = useRef(null);
    const autocompleteDestinationRef = useRef(null);
    const markerRef = useRef(null);
    const directionsRendererRef = useRef(null);
    const pickupMarkersRef = useRef([]);
    const dropoffMarkersRef = useRef([]);

    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];

    // Fetch user's frequent locations on component mount
    useEffect(() => {
        const fetchFrequentLocations = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/rides/pool/book/frequent-locations`);
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
                                setRideDetails(prev => ({
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
                    setRideDetails(prev => ({
                        ...prev,
                        origin: place.formatted_address || place.name,
                        originCoords: {
                            lat: place.geometry.location.lat(),
                            lng: place.geometry.location.lng()
                        }
                    }));

                    // Fetch nearby popular pickup points
                    fetchNearbyPickupPoints(place.geometry.location.lat(), place.geometry.location.lng());

                    // If destination is also set, enable route calculation
                    if (rideDetails.destinationCoords) {
                        updateRouteEligibility();
                    }
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
                    setRideDetails(prev => ({
                        ...prev,
                        destination: place.formatted_address || place.name,
                        destinationCoords: {
                            lat: place.geometry.location.lat(),
                            lng: place.geometry.location.lng()
                        }
                    }));

                    // Fetch nearby popular dropoff points
                    fetchNearbyDropoffPoints(place.geometry.location.lat(), place.geometry.location.lng());

                    // If origin is also set, enable route calculation
                    if (rideDetails.originCoords) {
                        updateRouteEligibility();
                    }
                }
            });
        }
    };

    // Fetch nearby popular pickup points
    const fetchNearbyPickupPoints = async (lat, lng) => {
        try {
            setLoadingSuggestions(true);
            // Fetch from backend or using Google Places API
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/rides/pool/book/nearby-pickup-points`, {
                params: { lat, lng, radius: rideDetails.pickupRadius * 1000 }
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
                    radius: rideDetails.pickupRadius * 1000,
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

    // Fetch nearby popular dropoff points
    const fetchNearbyDropoffPoints = async (lat, lng) => {
        try {
            setLoadingSuggestions(true);
            // Fetch from backend or using Google Places API
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/rides/pool/book/nearby-dropoff-points`, {
                params: { lat, lng, radius: rideDetails.pickupRadius * 1000 }
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
                    radius: rideDetails.pickupRadius * 1000,
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

    // Helper function to update route eligibility
    const updateRouteEligibility = () => {
        // This triggers a re-render that will update the visibility of the View Route button
        setRideDetails(prev => ({ ...prev }));
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
            clearPickupDropoffMarkers();

            // Handle different map views based on the active field
            if (activeLocationField === 'origin' && rideDetails.originCoords) {
                mapInstance.current.setCenter(rideDetails.originCoords);
                markerRef.current.setPosition(rideDetails.originCoords);

                // Show suggested pickup points
                if (suggestedPickupPoints.length > 0) {
                    displaySuggestedPickupPoints();
                }
            } else if (activeLocationField === 'destination' && rideDetails.destinationCoords) {
                mapInstance.current.setCenter(rideDetails.destinationCoords);
                markerRef.current.setPosition(rideDetails.destinationCoords);

                // Show suggested dropoff points
                if (suggestedDropoffPoints.length > 0) {
                    displaySuggestedDropoffPoints();
                }
            } else if (activeLocationField === 'viewRoute' && rideDetails.originCoords && rideDetails.destinationCoords) {
                // Hide the marker when viewing route
                markerRef.current.setMap(null);

                // Show route instead
                showRoute(rideDetails.originCoords, rideDetails.destinationCoords);
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

                // Clean up pickup/dropoff markers
                clearPickupDropoffMarkers();
            }
        };
    }, [mapVisible, activeLocationField, suggestedPickupPoints, suggestedDropoffPoints]);

    // Function to display suggested pickup points on the map
    const displaySuggestedPickupPoints = () => {
        if (!mapInstance.current || !window.google) return;

        // Clear existing markers
        clearPickupDropoffMarkers();

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
                setRideDetails(prev => ({
                    ...prev,
                    origin: `${point.name}, ${point.address}`,
                    originCoords: point.coords
                }));

                // Update main marker position
                markerRef.current.setPosition(point.coords);
            });

            // Store marker reference for cleanup
            pickupMarkersRef.current.push(marker);

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
            bounds.extend(rideDetails.originCoords);
            suggestedPickupPoints.forEach(point => bounds.extend(point.coords));
            mapInstance.current.fitBounds(bounds);
        }
    };

    // Function to display suggested dropoff points on the map
    const displaySuggestedDropoffPoints = () => {
        if (!mapInstance.current || !window.google) return;

        // Clear existing markers
        clearPickupDropoffMarkers();

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
                setRideDetails(prev => ({
                    ...prev,
                    destination: `${point.name}, ${point.address}`,
                    destinationCoords: point.coords
                }));

                // Update main marker position
                markerRef.current.setPosition(point.coords);
            });

            // Store marker reference for cleanup
            dropoffMarkersRef.current.push(marker);

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
            bounds.extend(rideDetails.destinationCoords);
            suggestedDropoffPoints.forEach(point => bounds.extend(point.coords));
            mapInstance.current.fitBounds(bounds);
        }
    };

    // Function to clear pickup/dropoff markers
    const clearPickupDropoffMarkers = () => {
        // Clear pickup markers
        pickupMarkersRef.current.forEach(marker => {
            if (marker) marker.setMap(null);
        });
        pickupMarkersRef.current = [];

        // Clear dropoff markers
        dropoffMarkersRef.current.forEach(marker => {
            if (marker) marker.setMap(null);
        });
        dropoffMarkersRef.current = [];
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
                    setRouteDetails({
                        routes: [route]
                    });

                    // Set suggested fare based on distance
                    const distanceInKm = route.legs[0].distance.value / 1000;
                    const suggestedFare = Math.ceil(distanceInKm * 5); // ₹5 per km

                    if (!rideDetails.fare) {
                        setRideDetails(prev => ({
                            ...prev,
                            fare: suggestedFare.toString()
                        }));
                    }
                }
            } else {
                setError('Could not calculate route. Please try again.');
            }
        });
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
                    setRideDetails(prev => ({
                        ...prev,
                        origin: address,
                        originCoords: { lat, lng }
                    }));

                    // Fetch nearby pickup points
                    fetchNearbyPickupPoints(lat, lng);
                } else if (activeLocationField === 'destination') {
                    setRideDetails(prev => ({
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

    // Open map modal for location selection
    const openMapForSelection = (field) => {
        setActiveLocationField(field);
        setMapVisible(true);
        setError(null);
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

    // Input change handler with improved validation
    const handleRideInputChange = useCallback((e) => {
        const { name, value, type, min, max, checked } = e.target;
        let processedValue = value;

        // Handle checkbox inputs
        if (type === 'checkbox') {
            processedValue = checked;
        }
        // Handle number inputs
        else if (type === 'number') {
            if (value === '') {
                processedValue = '';
            } else {
                processedValue = Math.max(
                    Number(min || 0),
                    Math.min(Number(max || Number.MAX_SAFE_INTEGER), Number(value))
                );
            }
        }

        setRideDetails(prev => ({
            ...prev,
            [name]: processedValue
        }));

        // Special handling for pickupRadius changes
        if (name === 'pickupRadius' && rideDetails.originCoords) {
            fetchNearbyPickupPoints(rideDetails.originCoords.lat, rideDetails.originCoords.lng);
        }
    }, [rideDetails.originCoords]);

    // Handle text area changes
    const handleNotesChange = (e) => {
        const { value } = e.target;
        setRideDetails(prev => ({
            ...prev,
            notes: value
        }));
    };

    // Handle recurring days selection
    const handleRecurringDayToggle = (day) => {
        setRideDetails(prev => {
            const updatedDays = [...prev.recurringDays];
            const dayIndex = updatedDays.indexOf(day);

            if (dayIndex === -1) {
                updatedDays.push(day);
            } else {
                updatedDays.splice(dayIndex, 1);
            }

            return {
                ...prev,
                recurringDays: updatedDays
            };
        });
    };

    // Select a frequent location
    const selectFrequentLocation = (location, type) => {
        if (type === 'origin') {
            setRideDetails(prev => ({
                ...prev,
                origin: location.name,
                originCoords: location.coords
            }));

            // If destination is also set, enable route calculation
            if (rideDetails.destinationCoords) {
                updateRouteEligibility();
            }

            // Fetch nearby pickup points
            fetchNearbyPickupPoints(location.coords.lat, location.coords.lng);
        } else {
            setRideDetails(prev => ({
                ...prev,
                destination: location.name,
                destinationCoords: location.coords
            }));

            // If origin is also set, enable route calculation
            if (rideDetails.originCoords) {
                updateRouteEligibility();
            }

            // Fetch nearby dropoff points
            fetchNearbyDropoffPoints(location.coords.lat, location.coords.lng);
        }
    };



    // Select a suggested location
    const selectSuggestedLocation = (location, type) => {
        if (type === 'origin') {
            setRideDetails(prev => ({
                ...prev,
                origin: `${location.name}, ${location.address}`,
                originCoords: location.coords
            }));

            // If destination is also set, enable route calculation
            if (rideDetails.destinationCoords) {
                updateRouteEligibility();
            }
        } else {
            setRideDetails(prev => ({
                ...prev,
                destination: `${location.name}, ${location.address}`,
                destinationCoords: location.coords
            }));

            // If origin is also set, enable route calculation
            if (rideDetails.originCoords) {
                updateRouteEligibility();
            }
        }

        // Close map if it's open
        if (mapVisible) {
            setMapVisible(false);
        }
    };
    // Submit handler with robust error handling
    const handleSubmitRide = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Validation before submission
            if (!rideDetails.origin.trim()) {
                throw new Error('Origin is required');
            }
            if (!rideDetails.destination.trim()) {
                throw new Error('Destination is required');
            }
            if (!rideDetails.date) {
                throw new Error('Date is required');
            }
            if (!rideDetails.time) {
                throw new Error('Time is required');
            }

            // Check if the date is not in the past
            const selectedDate = new Date(`${rideDetails.date}T${rideDetails.time}`);
            const currentDate = new Date();
            if (selectedDate < currentDate) {
                throw new Error('Cannot create a ride in the past');
            }

            // Format coordinates correctly to match backend expectations
            const rideDataWithCoords = {
                ...rideDetails,
                originCoords: rideDetails.originCoords
                    ? `${rideDetails.originCoords.lat},${rideDetails.originCoords.lng}`
                    : null,
                destinationCoords: rideDetails.destinationCoords
                    ? `${rideDetails.destinationCoords.lat},${rideDetails.destinationCoords.lng}`
                    : null,
                // Ensure these are properly formatted as the backend expects
                seats: parseInt(rideDetails.seats),
                fare: parseFloat(rideDetails.fare),
                // Include these fields explicitly to match backend validation
                isFlexiblePickup: Boolean(rideDetails.isFlexiblePickup),
                pickupRadius: rideDetails.isFlexiblePickup ? parseFloat(rideDetails.pickupRadius) : 0,
                isRecurringRide: Boolean(rideDetails.isRecurringRide),
                recurringDays: rideDetails.isRecurringRide ? rideDetails.recurringDays : [],
                allowDetour: Boolean(rideDetails.allowDetour),
                maxDetourDistance: rideDetails.allowDetour ? parseFloat(rideDetails.maxDetourDistance) : 0,
                maxWaitTime: rideDetails.allowDetour ? parseInt(rideDetails.maxWaitTime) : 0
            };

            const token = localStorage.getItem('token') ||  sessionStorage.getItem('token');
            if (!token) {
                throw new Error('User is not authenticated. Please log in again.');
            }
            

            // Send data to backend
            const response = await axios.post(
                `${process.env.REACT_APP_API_BASE_URL}/api/rides/pool/book/createpool`,
                rideDataWithCoords,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` // Updated to match middleware's expected format
                    }
                }
            );

            // Reset form on success
            setRideDetails({
                origin: '',
                destination: '',
                originCoords: null,
                destinationCoords: null,
                date: '',
                time: '',
                seats: 1,
                fare: '',
                vehicleType: 'Car',
                notes: '',
                isFlexiblePickup: false,
                pickupRadius: 1,
                frequentLocations: [],
                isRecurringRide: false,
                recurringDays: [],
                allowDetour: false,
                maxDetourDistance: 2,
                maxWaitTime: 10
            });

            // Show success message
            setSuccess('Ride created successfully!');

            // Navigate to rides page or show confirmation
            if (response.data.ride && response.data.ride.id) {
                // Optional: navigate to the created ride
                // navigate(`/rides/${response.data.ride.id}`);
            }

            // Clear success message after 5 seconds
            setTimeout(() => {
                setSuccess(null);
            }, 5000);

        } catch (error) {
            console.error('Error creating ride:', error);

            // Better error handling to extract message from various error formats
            const errorMessage =
                error.response?.data?.message ||
                error.response?.data?.errors?.[0]?.msg || // Express-validator errors format
                error.message ||
                'Failed to create ride';

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Calculate route for visualization
    const calculateRoute = () => {
        if (!rideDetails.originCoords || !rideDetails.destinationCoords) {
            setError('Both origin and destination must have valid coordinates to view route');
            return;
        }

        setActiveLocationField('viewRoute');
        setMapVisible(true);
    };

    // Close map modal and properly clean up resources
    const closeMapModal = () => {
        setMapVisible(false);
        // The cleanup in useEffect will handle the rest
    };

    return (
        <div className='pooling-create-page'>
            <div className="create-ride-container">
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

                <h2 className="form-title">Create a Carpooling Ride</h2>

                <form onSubmit={handleSubmitRide} className="ride-form">
                    <div className="form-section">
                        <h3 className="section-title">
                            <MapPin className="section-icon" />
                            Ride Locations
                        </h3>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="ride-origin">Pickup Location</label>
                                <div className="location-input-container">
                                    <input
                                        type="text"
                                        id="ride-origin"
                                        name="origin"
                                        value={rideDetails.origin}
                                        onChange={handleRideInputChange}
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

                                {userFrequentLocations.length > 0 && (
                                    <div className="frequent-locations">
                                        <span>Frequent locations:</span>
                                        <div className="frequent-location-chips">
                                            {userFrequentLocations.slice(0, 3).map((location, index) => (
                                                <button
                                                    key={index}
                                                    type="button"
                                                    className="location-chip"
                                                    onClick={() => selectFrequentLocation(location, 'origin')}
                                                >
                                                    {location.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="ride-destination">Drop-off Location</label>
                                <div className="location-input-container">
                                    <input
                                        type="text"
                                        id="ride-destination"
                                        name="destination"
                                        value={rideDetails.destination}
                                        onChange={handleRideInputChange}
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

                                {userFrequentLocations.length > 0 && (
                                    <div className="frequent-locations">
                                        <span>Frequent locations:</span>
                                        <div className="frequent-location-chips">
                                            {userFrequentLocations.slice(0, 3).map((location, index) => (
                                                <button
                                                    key={index}
                                                    type="button"
                                                    className="location-chip"
                                                    onClick={() => selectFrequentLocation(location, 'destination')}
                                                >
                                                    {location.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {rideDetails.originCoords && rideDetails.destinationCoords && (
                            <div className="form-row view-route-container">
                                <button
                                    type="button"
                                    className="view-route-button"
                                    onClick={calculateRoute}
                                >
                                    <MapIcon size={18} />
                                    View Route
                                </button>
                            </div>
                        )}

                        {/* Flexible pickup options */}
                        <div className="form-row">
                            <div className="form-group checkbox-group">
                                <input
                                    type="checkbox"
                                    id="flexible-pickup"
                                    style={{ marginLeft: '-5px' }}
                                    name="isFlexiblePickup"
                                    checked={rideDetails.isFlexiblePickup}
                                    onChange={handleRideInputChange}
                                />
                                <label htmlFor="flexible-pickup">Allow flexible pickup within a radius</label>
                            </div>
                        </div>


                        {rideDetails.isFlexiblePickup && (
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="pickup-radius">Pickup Radius (km)</label>
                                    <input
                                        type="range"
                                        id="pickup-radius"
                                        name="pickupRadius"
                                        min="0.5"
                                        max="5"
                                        step="0.5"
                                        value={rideDetails.pickupRadius}
                                        onChange={handleRideInputChange}
                                    />
                                    <span className="range-value">{rideDetails.pickupRadius} km</span>
                                </div>
                            </div>
                        )}

                        {/* Detour options */}
                        <div className="form-row">
                            <div className="form-group checkbox-group">
                                <input
                                    type="checkbox"
                                    id="allow-detour"
                                    name="allowDetour"
                                    checked={rideDetails.allowDetour}
                                    onChange={handleRideInputChange}
                                />
                                <label htmlFor="allow-detour">Allow detours for pickups along the route</label>
                            </div>
                        </div>

                        {rideDetails.allowDetour && (
                            <>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="max-detour-distance">Maximum Detour Distance (km)</label>
                                        <input
                                            type="range"
                                            id="max-detour-distance"
                                            name="maxDetourDistance"
                                            min="1"
                                            max="10"
                                            step="1"
                                            value={rideDetails.maxDetourDistance}
                                            onChange={handleRideInputChange}
                                        />
                                        <span className="range-value">{rideDetails.maxDetourDistance} km</span>
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="max-wait-time">Maximum Wait Time (minutes)</label>
                                        <input
                                            type="range"
                                            id="max-wait-time"
                                            name="maxWaitTime"
                                            min="5"
                                            max="30"
                                            step="5"
                                            value={rideDetails.maxWaitTime}
                                            onChange={handleRideInputChange}
                                        />
                                        <span className="range-value">{rideDetails.maxWaitTime} minutes</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="form-section">
                        <h3 className="section-title">
                            <Calendar className="section-icon" />
                            Ride Schedule
                        </h3>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="ride-date">Date</label>
                                <input
                                    type="date"
                                    id="ride-date"
                                    name="date"
                                    min={today}
                                    value={rideDetails.date}
                                    onChange={handleRideInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="ride-time">Time</label>
                                <input
                                    type="time"
                                    id="ride-time"
                                    name="time"
                                    value={rideDetails.time}
                                    onChange={handleRideInputChange}
                                    required
                                />
                            </div>
                        </div>

                        {/* Recurring ride options */}
                        <div className="form-row">
                            <div className="form-group checkbox-group">
                                <input
                                    type="checkbox"
                                    id="recurring-ride"
                                    name="isRecurringRide"
                                    checked={rideDetails.isRecurringRide}
                                    onChange={handleRideInputChange}
                                />
                                <label htmlFor="recurring-ride">This is a recurring ride</label>
                            </div>
                        </div>

                        {rideDetails.isRecurringRide && (
                            <div className="form-row">
                                <div className="form-group recurring-days">
                                    <label>Select days that repeat:</label>
                                    <div className="day-buttons">
                                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                                            <button
                                                key={day}
                                                type="button"
                                                className={`day-button ${rideDetails.recurringDays.includes(day) ? 'active' : ''}`}
                                                onClick={() => handleRecurringDayToggle(day)}
                                            >
                                                {day}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="form-section">
                        <h3 className="section-title">
                            <Users className="section-icon" />
                            Ride Details
                        </h3>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="ride-seats">Available Seats</label>
                                <input
                                    type="number"
                                    id="ride-seats"
                                    name="seats"
                                    min="1"
                                    max="8"
                                    value={rideDetails.seats}
                                    onChange={handleRideInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="ride-fare">Fare (₹ per person)</label>
                                <input
                                    type="number"
                                    id="ride-fare"
                                    name="fare"
                                    min="0"
                                    value={rideDetails.fare}
                                    onChange={handleRideInputChange}
                                    placeholder="Enter fare amount"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="vehicle-type">Vehicle Type</label>
                                <select
                                    id="vehicle-type"
                                    name="vehicleType"
                                    value={rideDetails.vehicleType}
                                    onChange={handleRideInputChange}
                                    required
                                >
                                    <option value="Car">Car</option>
                                    <option value="SUV">SUV</option>
                                    <option value="VAN">VAN</option>
                                    <option value="BIKE">BIKE</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="ride-notes">Additional Notes</label>
                                <textarea
                                    id="ride-notes"
                                    name="notes"
                                    value={rideDetails.notes}
                                    onChange={handleNotesChange}
                                    placeholder="Any special instructions or details for riders..."
                                    rows="3"
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button
                            type="submit"
                            className="submit-button"
                            disabled={loading}
                        >
                            {loading ? (
                                <><RotateCw className="spinner" size={18} /> Creating Ride...</>
                            ) : (
                                'Create Ride'
                            )}
                        </button>
                    </div>
                </form>

                {/* Map Modal */}
                {mapVisible && (
                    <div className="map-modal">
                        <div className="map-modal-content">
                            <h3 className="map-title">
                                {activeLocationField === 'origin'
                                    ? 'Select Pickup Location'
                                    : activeLocationField === 'destination'
                                        ? 'Select Drop-off Location'
                                        : 'View Route'}
                            </h3>

                            {loadingLocation && (
                                <div className="loading-location">
                                    <RotateCw className="spinner" size={20} />
                                    Getting your location...
                                </div>
                            )}

                            <div className="map-container" ref={mapRef}></div>

                            {activeLocationField !== 'viewRoute' && (
                                <div className="suggested-locations">
                                    <h4>
                                        {loadingSuggestions ? (
                                            <><RotateCw className="spinner" size={16} /> Loading suggestions...</>
                                        ) : activeLocationField === 'origin' && suggestedPickupPoints.length > 0 ? (
                                            'Suggested Pickup Points'
                                        ) : activeLocationField === 'destination' && suggestedDropoffPoints.length > 0 ? (
                                            'Suggested Drop-off Points'
                                        ) : null}
                                    </h4>

                                    {activeLocationField === 'origin' && !loadingSuggestions && suggestedPickupPoints.length > 0 && (
                                        <div className="location-suggestions">
                                            {suggestedPickupPoints.map((point, index) => (
                                                <button
                                                    key={index}
                                                    type="button"
                                                    className="suggestion-item"
                                                    onClick={() => selectSuggestedLocation(point, 'origin')}
                                                >
                                                    <strong>{point.name}</strong>
                                                    <span>{point.address}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {activeLocationField === 'destination' && !loadingSuggestions && suggestedDropoffPoints.length > 0 && (
                                        <div className="location-suggestions">
                                            {suggestedDropoffPoints.map((point, index) => (
                                                <button
                                                    key={index}
                                                    type="button"
                                                    className="suggestion-item"
                                                    onClick={() => selectSuggestedLocation(point, 'destination')}
                                                >
                                                    <strong>{point.name}</strong>
                                                    <span>{point.address}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeLocationField === 'viewRoute' && routeDetails && routeDetails.routes && routeDetails.routes[0] && (
                                <div className="route-details">
                                    <div className="detail-item">
                                        <strong>Distance:</strong>
                                        <span>{routeDetails.routes[0].legs[0].distance.text}</span>
                                    </div>
                                    <div className="detail-item">
                                        <strong>Duration:</strong>
                                        <span>{routeDetails.routes[0].legs[0].duration.text}</span>
                                    </div>
                                    {rideDetails.fare && (
                                        <div className="detail-item">
                                            <strong>Fare:</strong>
                                            <span>₹{rideDetails.fare} per person</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="map-modal-actions">
                                <button
                                    type="button"
                                    className="locate-me-button"
                                    onClick={getUserLocation}
                                    disabled={loadingLocation || activeLocationField === 'viewRoute'}
                                >
                                    <Crosshair size={18} />
                                    {loadingLocation ? 'Locating...' : 'My Location'}
                                </button>

                                {activeLocationField !== 'viewRoute' && (
                                    <button
                                        type="button"
                                        className="confirm-location-button"
                                        onClick={confirmMapLocation}
                                    >
                                        Confirm Location
                                    </button>
                                )}

                                <button
                                    type="button"
                                    className="close-map-button"
                                    onClick={closeMapModal}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CreateRide;

