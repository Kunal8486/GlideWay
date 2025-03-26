import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    MapPin,
    Calendar,
    Clock,
    Users,
    DollarSign,
    Car,
    Search,
    PlusCircle,
    Navigation
} from 'lucide-react';
import './RidePooling.css';

function RidePooling() {
    // Enhanced state with more robust validation
    const [rideDetails, setRideDetails] = useState({
        origin: '',
        destination: '',
        date: '',
        time: '',
        seats: 1,
        fare: '',
        vehicleType: 'Car',
        notes: ''
    });

    const [rides, setRides] = useState([]);
    const [searchFilters, setSearchFilters] = useState({
        origin: '',
        destination: '',
        minSeats: 1,
        maxFare: '',
        date: ''
    });
    const [routeDetails, setRouteDetails] = useState(null);
    const [loading, setLoading] = useState({
        createRide: false,
        searchRides: false,
        routeCalculation: false
    });
    const [error, setError] = useState(null);

    // Memoized input change handlers with improved validation
    const handleRideInputChange = useCallback((e) => {
        const { name, value, type, min, max } = e.target;
        let processedValue = value;

        // Additional input validation
        if (type === 'number') {
            processedValue = Math.max(
                Number(min || 0),
                Math.min(Number(max || Number.MAX_SAFE_INTEGER), Number(value))
            );
        }

        setRideDetails(prev => ({
            ...prev,
            [name]: processedValue
        }));
    }, []);

    const handleSearchInputChange = useCallback((e) => {
        const { name, value, type, min, max } = e.target;
        let processedValue = value;

        if (type === 'number') {
            processedValue = Math.max(
                Number(min || 0),
                Math.min(Number(max || Number.MAX_SAFE_INTEGER), Number(value))
            );
        }

        setSearchFilters(prev => ({
            ...prev,
            [name]: processedValue
        }));
    }, []);

    // Enhanced submit handlers with more robust error handling
    const handleSubmitRide = async (e) => {
        e.preventDefault();
        setLoading(prev => ({ ...prev, createRide: true }));
        setError(null);

        try {
            // Validation before submission
            if (!rideDetails.origin.trim() || !rideDetails.destination.trim()) {
                throw new Error('Origin and destination are required');
            }

            const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/rides/createpool`, rideDetails);
            setRides(prev => [...prev, response.data]);

            // Reset form with toast-like notification
            setRideDetails({
                origin: '',
                destination: '',
                date: '',
                time: '',
                seats: 1,
                fare: '',
                vehicleType: 'Car',
                notes: ''
            });

            // Simulate success notification
            alert('Ride created successfully!');
        } catch (error) {
            console.error('Error creating ride:', error);
            setError(error.message || 'Failed to create ride');
        } finally {
            setLoading(prev => ({ ...prev, createRide: false }));
        }
    };

    const handleSearchRides = async (e) => {
        e.preventDefault();
        setLoading(prev => ({ ...prev, searchRides: true }));
        setError(null);

        try {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/rides/poolsearch`, {
                params: searchFilters
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
    const calculateRoute = async (origin, destination) => {
        setLoading(prev => ({ ...prev, routeCalculation: true }));
        setError(null);

        try {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/poolroute`, {
                params: { origin, destination }
            });
            setRouteDetails(response.data);
        } catch (error) {
            console.error('Route calculation error:', error);
            setError('Could not calculate route details');
        } finally {
            setLoading(prev => ({ ...prev, routeCalculation: false }));
        }
    };

    // Join Ride with placeholder implementation
    const handleJoinRide = async (rideId) => {
        try {
            // TODO: Implement actual join ride backend logic
            const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/rides/${rideId}/join`);
            alert('Ride joined successfully!');
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

    return (
        <div className="glide-way-container">
            <header className="glide-way-header">
                <h1>Pool the Ride</h1>
                <nav>
                    <a href="#create-ride">Create Ride</a>
                    <a href="#find-ride">Find Ride</a>
                </nav>
            </header>
            {error && (
                <div className="error-banner">
                    {error}
                </div>
            )}

            <main className="glide-way-main">
                <section id="create-ride" className="ride-creation-section">
                    <div className="card ride-form-card">
                        <h2>Create Your Ride</h2>
                        <form onSubmit={handleSubmitRide}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Origin</label>
                                    <input
                                        type="text"
                                        name="origin"
                                        value={rideDetails.origin}
                                        onChange={handleRideInputChange}
                                        placeholder="Where are you starting from?"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Destination</label>
                                    <input
                                        type="text"
                                        name="destination"
                                        value={rideDetails.destination}
                                        onChange={handleRideInputChange}
                                        placeholder="Where are you going?"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Date</label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={rideDetails.date}
                                        onChange={handleRideInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Time</label>
                                    <input
                                        type="time"
                                        name="time"
                                        value={rideDetails.time}
                                        onChange={handleRideInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Available Seats</label>
                                    <input
                                        type="number"
                                        name="seats"
                                        value={rideDetails.seats}
                                        onChange={handleRideInputChange}
                                        min="1"
                                        max="6"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Fare (₹)</label>
                                    <input
                                        type="number"
                                        name="fare"
                                        value={rideDetails.fare}
                                        onChange={handleRideInputChange}
                                        min="0"
                                        step="10"
                                        placeholder="Ride cost per person"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Vehicle Type</label>
                                    <select
                                        name="vehicleType"
                                        value={rideDetails.vehicleType}
                                        onChange={handleRideInputChange}
                                    >
                                        <option value="Car">Car</option>
                                        <option value="SUV">SUV</option>
                                        <option value="Sedan">Sedan</option>
                                        <option value="Hatchback">Hatchback</option>
                                    </select>
                                </div>
                            </div>
                            <button type="submit" className="submit-ride-btn">
                                Create Ride
                            </button>
                        </form>
                    </div>
                </section>

                <section id="find-ride" className="ride-search-section">
                    <div className="card ride-search-card">
                        <h2>Search Rides</h2>
                        <form onSubmit={handleSearchRides} className="search-form">
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>From</label>
                                    <input
                                        type="text"
                                        name="origin"
                                        value={searchFilters.origin}
                                        onChange={handleSearchInputChange}
                                        placeholder="Starting location"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>To</label>
                                    <input
                                        type="text"
                                        name="destination"
                                        value={searchFilters.destination}
                                        onChange={handleSearchInputChange}
                                        placeholder="Destination"
                                    />
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
                            <button type="submit" className="search-rides-btn">
                                Search Rides
                            </button>
                        </form>
                    </div>

                    <div className="card ride-list-card">
                        <h2>Available Rides</h2>
                        {rides.length === 0 ? (
                            <p className="no-rides-message">No rides available yet</p>
                        ) : (
                            <div className="rides-grid">
                                {rides.map(ride => (
                                    <div key={ride.id} className="ride-card">
                                        <div className="ride-details">
                                            <p><strong>From:</strong> {ride.origin}</p>
                                            <p><strong>To:</strong> {ride.destination}</p>
                                            <p><strong>Date:</strong> {ride.date}</p>
                                            <p><strong>Time:</strong> {ride.time}</p>
                                            <p><strong>Seats:</strong> {ride.seats}</p>
                                            <p><strong>Fare:</strong> ₹{ride.fare}</p>
                                            <p><strong>Vehicle:</strong> {ride.vehicleType}</p>
                                        </div>
                                        <button className="join-ride-btn">Join Ride</button>
                                    </div>
                                ))}
                            </div>

                        )}
                        {/* Route Details Display */}
                        {routeDetails && (
                            <div className="route-details-modal">
                                <h3>Route Information</h3>
                                <p>Distance: {routeDetails.routes[0].legs[0].distance.text}</p>
                                <p>Duration: {routeDetails.routes[0].legs[0].duration.text}</p>
                            </div>
                        )}

                    </div>
                </section>
            </main>

            <footer className="glide-way-footer">
                <p>🌐 Connecting Travelers, One Shared Journey at a Time</p>
            </footer>
        </div>
    );
}

export default RidePooling;