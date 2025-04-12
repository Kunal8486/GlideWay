import React, { useState, useEffect, useRef } from 'react';
import { MapIcon, Calendar, Clock, Users, ChevronsRight, RotateCw, X, IndianRupee, Car, MapPin } from 'lucide-react';
import axios from 'axios';
import './PoolResult.css';

function RideResults({ rides, loading, onError, onSuccess, searchParams = {} }) {
    const [selectedRide, setSelectedRide] = useState(null);
    const [selectedRideRoute, setSelectedRideRoute] = useState(null);
    const [mapVisible, setMapVisible] = useState(false);
    const [loadingAction, setLoadingAction] = useState(false);
    const [loadingMap, setLoadingMap] = useState(false);
    const [bookingStatus, setBookingStatus] = useState({});

    // Refs for Google Maps
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const directionsRendererRef = useRef(null);

    // Initialize Google Maps when component mounts
    useEffect(() => {
        const loadGoogleMapsScript = () => {
            if (window.google && window.google.maps) return;
            
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places`;
            script.async = true;
            script.defer = true;
            document.head.appendChild(script);
        };

        loadGoogleMapsScript();
    }, []);

    // Initialize map when showing the map modal
    useEffect(() => {
        if (!mapVisible || !mapRef.current || !selectedRide) return;
        
        const initMap = () => {
            if (!window.google || !window.google.maps) {
                // Wait for Google Maps to load
                setTimeout(initMap, 100);
                return;
            }
            
            setLoadingMap(true);
            
            try {
                // Create a new map instance
                mapInstance.current = new window.google.maps.Map(mapRef.current, {
                    center: { lat: 20.5937, lng: 78.9629 }, // Default center (India)
                    zoom: 8,
                    mapTypeControl: true,
                    streetViewControl: false,
                    fullscreenControl: true,
                    zoomControl: true
                });
                
                // Get coordinates
                const originCoords = parseCoordinates(selectedRide.originCoords);
                const destinationCoords = parseCoordinates(selectedRide.destinationCoords);
                
                if (originCoords && destinationCoords) {
                    showRoute(originCoords, destinationCoords);
                } else {
                    // Fallback to geocoding if coordinates aren't available
                    geocodeAndShowRoute(selectedRide.origin, selectedRide.destination);
                }
            } catch (error) {
                console.error('Error initializing map:', error);
                onError('Could not display the map. Please try again.');
                setLoadingMap(false);
            }
        };
        
        initMap();
        
        return () => {
            if (directionsRendererRef.current) {
                directionsRendererRef.current.setMap(null);
                directionsRendererRef.current = null;
            }
        };
    }, [mapVisible, selectedRide]);

    // Parse coordinates from string or object
    const parseCoordinates = (coordsString) => {
        if (!coordsString) return null;
        
        try {
            // Handle string format "lat,lng"
            if (typeof coordsString === 'string') {
                const [lat, lng] = coordsString.split(',').map(Number);
                if (!isNaN(lat) && !isNaN(lng)) {
                    return { lat, lng };
                }
            } 
            // Handle MongoDB GeoJSON Point format
            else if (typeof coordsString === 'object' && coordsString !== null) {
                // Check if it's GeoJSON format
                if (coordsString.type === 'Point' && Array.isArray(coordsString.coordinates)) {
                    // GeoJSON coordinates are [longitude, latitude]
                    const [lng, lat] = coordsString.coordinates;
                    return { lat, lng };
                }
                // Handle regular lat/lng object
                else if ('lat' in coordsString && 'lng' in coordsString) {
                    const { lat, lng } = coordsString;
                    if (typeof lat === 'number' && typeof lng === 'number') {
                        return { lat, lng };
                    }
                }
            }
            
            return null;
        } catch (error) {
            console.error('Error parsing coordinates:', error);
            return null;
        }
    };

    // Geocode addresses and show route
    const geocodeAndShowRoute = (originAddress, destinationAddress) => {
        if (!window.google || !mapInstance.current) return;
        
        const geocoder = new window.google.maps.Geocoder();
        
        // First geocode origin
        geocoder.geocode({ address: originAddress }, (originResults, originStatus) => {
            if (originStatus !== 'OK') {
                onError(`Couldn't find location: ${originAddress}`);
                setLoadingMap(false);
                return;
            }
            
            // Then geocode destination
            geocoder.geocode({ address: destinationAddress }, (destResults, destStatus) => {
                if (destStatus !== 'OK') {
                    onError(`Couldn't find location: ${destinationAddress}`);
                    setLoadingMap(false);
                    return;
                }
                
                const originLocation = originResults[0].geometry.location;
                const destLocation = destResults[0].geometry.location;
                
                showRoute(
                    { lat: originLocation.lat(), lng: originLocation.lng() },
                    { lat: destLocation.lat(), lng: destLocation.lng() }
                );
            });
        });
    };

    // Display route on map
    const showRoute = (originCoords, destinationCoords) => {
        if (!window.google || !mapInstance.current) return;

        // Clear existing directions renderer
        if (directionsRendererRef.current) {
            directionsRendererRef.current.setMap(null);
        }

        // Create new directions renderer
        directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
            map: mapInstance.current,
            suppressMarkers: false,
            polylineOptions: {
                strokeColor: '#4285F4',
                strokeWeight: 5
            }
        });

        // Calculate route
        const directionsService = new window.google.maps.DirectionsService();
        directionsService.route(
            {
                origin: originCoords,
                destination: destinationCoords,
                travelMode: window.google.maps.TravelMode.DRIVING
            },
            (result, status) => {
                if (status === 'OK') {
                    directionsRendererRef.current.setDirections(result);

                    // Fit map to route bounds
                    const bounds = new window.google.maps.LatLngBounds();
                    bounds.extend(originCoords);
                    bounds.extend(destinationCoords);
                    mapInstance.current.fitBounds(bounds);

                    // Store route details
                    if (result.routes[0] && result.routes[0].legs[0]) {
                        setSelectedRideRoute({
                            distance: result.routes[0].legs[0].distance.text,
                            duration: result.routes[0].legs[0].duration.text
                        });
                    }
                } else {
                    onError(`Could not calculate route: ${status}`);
                }
                
                setLoadingMap(false);
            }
        );
    };

    // View ride route
    const viewRideRoute = (ride) => {
        setSelectedRide(ride);
        setMapVisible(true);
    };

    // Close map modal
    const closeMapModal = () => {
        setMapVisible(false);
        setSelectedRideRoute(null);
        
        // Clean up map resources
        if (directionsRendererRef.current) {
            directionsRendererRef.current.setMap(null);
            directionsRendererRef.current = null;
        }
        mapInstance.current = null;
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return 'Date not available';
        const options = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-IN', options);
    };

    // Format time for display
    const formatTime = (dateTime) => {
        if (!dateTime) return 'Time not available';
        if (typeof dateTime === 'string') {
            const date = new Date(dateTime);
            return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        }
        return dateTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    };

    // Get the number of seats
    const getSeatsCount = () => {
        return (searchParams && searchParams.seats) || 1;
    };

    // Get user's pickup and dropoff locations from search params
    const getUserLocations = () => {
        return {
            pickupLocation: {
                address: searchParams.origin || '',
                coordinates: searchParams.originCoords || null
            },
            dropoffLocation: {
                address: searchParams.destination || '',
                coordinates: searchParams.destinationCoords || null
            }
        };
    };

    // Book a ride
    const bookRide = async (rideId) => {
        // Set loading state for this specific ride
        setBookingStatus(prev => ({ ...prev, [rideId]: 'loading' }));
        onError(null);

        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (!token) {
                throw new Error('User is not authenticated. Please log in first.');
            }

            // Get user's location data from search params
            const userLocations = getUserLocations();
            
            // Calculate the total fare based on seat count
            const ride = rides.find(r => r.id === rideId);
            const totalFare = ride ? ride.farePerSeat * getSeatsCount() : 0;

            // Call API to book the ride with passenger details
            const response = await axios.post(
                `${process.env.REACT_APP_API_BASE_URL}/api/rides/pool/${rideId}/join`,
                {
                    seats: getSeatsCount(),
                    pickupLocation: userLocations.pickupLocation,
                    dropoffLocation: userLocations.dropoffLocation,
                    fare: totalFare
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Update status for this ride to 'success'
            setBookingStatus(prev => ({ ...prev, [rideId]: 'success' }));
            
            // Show success message
            onSuccess('Ride booked successfully! Check your rides for details.');
            
            // Optionally, you could redirect the user to their bookings page
            // history.push('/my-rides');
        } catch (error) {
            console.error('Error booking ride:', error);
            
            // Set status to 'error'
            setBookingStatus(prev => ({ ...prev, [rideId]: 'error' }));
            
            // Handle different types of errors
            const errorMessage = 
                error.response?.data?.message ||
                error.response?.data?.error ||
                error.response?.data?.errors?.[0]?.msg ||
                error.message ||
                'Failed to book ride';

            onError(errorMessage);
        } finally {
            // Clear loading status after 3 seconds to reset button state
            setTimeout(() => {
                setBookingStatus(prev => {
                    const newStatus = { ...prev };
                    delete newStatus[rideId];
                    return newStatus;
                });
            }, 3000);
        }
    };

    // Get button text based on booking status
    const getBookButtonText = (rideId) => {
        const status = bookingStatus[rideId];
        if (!status) return 'Book Now';
        if (status === 'loading') return 'Booking...';
        if (status === 'success') return 'Booked!';
        if (status === 'error') return 'Try Again';
        return 'Book Now';
    };

    // Check if button should be disabled
    const isBookButtonDisabled = (rideId) => {
        return bookingStatus[rideId] === 'loading' || bookingStatus[rideId] === 'success';
    };

    // Get button class based on booking status
    const getBookButtonClass = (rideId) => {
        const status = bookingStatus[rideId];
        if (status === 'success') return 'pr-book-button pr-book-success';
        if (status === 'error') return 'pr-book-button pr-book-error';
        return 'pr-book-button';
    };

    return (
        <div className="pr-search-results">
            {loading ? (
                <div className="pr-loading-container">
                    <RotateCw className="pr-icon-spin" size={24} />
                    <p>Searching for rides...</p>
                </div>
            ) : rides.length > 0 ? (
                <div className="pr-rides-list">
                    <h3>Available Rides</h3>
                    {rides.map(ride => (
                        <div key={ride.id} className="pr-ride-card">
                            <div className="pr-ride-header">
                                <div className="pr-ride-info-main">
                                    <h4>
                                        <Car size={16} className="pr-icon" />
                                        {ride.vehicleType || 'Vehicle not specified'} • {ride.seatsAvailable} seats available
                                    </h4>
                                    <div className="pr-ride-fare">
                                        <IndianRupee size={16} className="pr-icon" />
                                        <span>{ride.fare / ride.seats} per seat</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="pr-ride-details">
                                <div className="pr-ride-locations">
                                    <div className="pr-origin">
                                        <MapPin size={16} className="pr-icon" />
                                        <span>{ride.origin}</span>
                                    </div>
                                    <div className="pr-route-line">
                                        <ChevronsRight size={16} className="pr-icon" />
                                    </div>
                                    <div className="pr-destination">
                                        <MapPin size={16} className="pr-icon" />
                                        <span>{ride.destination}</span>
                                    </div>
                                </div>
                                
                                <div className="pr-ride-schedule">
                                    <div className="pr-ride-date">
                                        <Calendar size={16} className="pr-icon" />
                                        <span>{formatDate(ride.dateTime || ride.date)}</span>
                                    </div>
                                    <div className="pr-ride-time">
                                        <Clock size={16} className="pr-icon" />
                                        <span>{formatTime(ride.dateTime || ride.time)}</span>
                                    </div>
                                </div>
                                
                                <div className="pr-ride-driver">
                                    <div className="pr-driver-info">
                                        <Users size={16} className="pr-icon" />
                                        <span>Driver: {ride.driver?.name || 'Unknown Driver'}</span>
                                    </div>
                                    <div className="pr-driver-rating">
                                        <span>★ {ride.driver?.rating || '4.5'}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="pr-ride-actions">
                                <button 
                                    className="pr-view-route-button" 
                                    onClick={() => viewRideRoute(ride)}
                                >
                                    <MapIcon size={16} className="pr-icon" />
                                    View Route
                                </button>
                                <button 
                                    className={getBookButtonClass(ride.id)} 
                                    onClick={() => bookRide(ride.id)}
                                    disabled={isBookButtonDisabled(ride.id)}
                                >
                                    {bookingStatus[ride.id] === 'loading' ? (
                                        <>
                                            <RotateCw className="pr-icon-spin" size={16} />
                                            Booking...
                                        </>
                                    ) : (
                                        getBookButtonText(ride.id)
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="pr-no-results">
                    <h3>No rides available</h3>
                    <p>Try adjusting your search criteria or check back later.</p>
                </div>
            )}
            
            {/* Map Modal for Route View */}
            {mapVisible && selectedRide && (
                <div className="pr-map-modal-result">
                    <div className="pr-map-container-result">
                        <div className="pr-map-header-result">
                            <h3>Route Details</h3>
                            <button className="pr-close-button" onClick={closeMapModal}>
                                <X size={18} />
                            </button>
                        </div>
                        
                        <div className="pr-map-content-result">
                            {/* Map element - This is the main container where Google Map will render */}
                            <div 
                                ref={mapRef} 
                                className="pr-map-element-result"
                            ></div>
                            
                            {loadingMap && (
                                <div className="pr-map-loading">
                                    <RotateCw className="pr-icon-spin" size={24} />
                                    <p>Loading map...</p>
                                </div>
                            )}
                            
                            {selectedRideRoute && (
                                <div className="pr-route-info">
                                    <div className="pr-route-distance">
                                        <span>Distance: {selectedRideRoute.distance}</span>
                                    </div>
                                    <div className="pr-route-duration">
                                        <span>Estimated Travel Time: {selectedRideRoute.duration}</span>
                                    </div>
                                </div>
                            )}
                            
                            <div className="pr-ride-locations-detail">
                                <div className="pr-origin-detail">
                                    <h4>Pickup</h4>
                                    <p>{selectedRide.origin}</p>
                                </div>
                                <div className="pr-destination-detail">
                                    <h4>Drop-off</h4>
                                    <p>{selectedRide.destination}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="pr-map-footer-result">
                            <div className="pr-ride-summary">
                                <p>
                                    <Calendar size={16} className="pr-icon" />
                                    {formatDate(selectedRide.dateTime || selectedRide.date)} at {formatTime(selectedRide.dateTime || selectedRide.time)}
                                </p>
                                <p>
                                    <Users size={16} className="pr-icon" />
                                    Driver: {selectedRide.driver?.name || 'Unknown Driver'}
                                </p>
                                <p>
                                    <IndianRupee size={16} className="pr-icon" />
                                    {(selectedRide.fare / selectedRide.seats || 0) * getSeatsCount()} for {getSeatsCount()} seat(s)
                                </p>
                            </div>
                            
                            <button 
                                className={getBookButtonClass(selectedRide.id)} 
                                onClick={() => {
                                    bookRide(selectedRide.id);
                                    closeMapModal();
                                }}
                                disabled={isBookButtonDisabled(selectedRide.id)}
                            >
                                {bookingStatus[selectedRide.id] === 'loading' ? (
                                    <>
                                        <RotateCw className="pr-icon-spin" size={16} />
                                        Booking...
                                    </>
                                ) : (
                                    getBookButtonText(selectedRide.id)
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default RideResults;