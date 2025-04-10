import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';
import SearchRides from './SearchPool';
import RideResults from './PoolResult';
import './FindPool.css';

function FindPool() {
    // State for storing search results and user notifications
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [searchParams, setSearchParams] = useState(null);
    const [searchPerformed, setSearchPerformed] = useState(false);

    // Handle search completion
    const handleSearchComplete = (results, params) => {
        setRides(results);
        setSearchParams(params);
        setSearchPerformed(true);
        setLoading(false);
    };

    // Handle errors
    const handleError = (errorMessage) => {
        setError(errorMessage);
        // Auto-dismiss error after 5 seconds
        setTimeout(() => setError(null), 5000);
    };

    // Handle success messages
    const handleSuccess = (successMessage) => {
        setSuccess(successMessage);
        // Auto-dismiss success after 5 seconds
        setTimeout(() => setSuccess(null), 5000);
    };

    // Reset search
    const resetSearch = () => {
        setSearchPerformed(false);
        setRides([]);
    };

    return (
        <div className="fp-find-pool-page">
            <div className="fp-page-container">
                {/* Notification Area */}
                {error && (
                    <div className="fp-error-message">
                        <AlertTriangle className="fp-icon" />
                        <span>{error}</span>
                        <button onClick={() => setError(null)}><X size={16} /></button>
                    </div>
                )}
                {success && (
                    <div className="fp-success-message">
                        <CheckCircle className="fp-icon" />
                        <span>{success}</span>
                        <button onClick={() => setSuccess(null)}><X size={16} /></button>
                    </div>
                )}

                {/* Main Content Area with vertical layout */}
                <div className="fp-content-area">

                    <div className="fp-vertical-layout">
                        <div className="fp-search-section">
                            <SearchRides 
                                onSearchComplete={(results, params) => {
                                    setLoading(true);
                                    // Simulate API delay
                                    setTimeout(() => handleSearchComplete(results, params), 1000);
                                }} 
                                onError={handleError}
                                onSuccess={handleSuccess}
                            />
                        </div>

                        {/* Results Section - Below Search Form */}
                        <div className="fp-results-section">
                            <div className="fp-results-header">
                                <h2>Available Rides</h2>
                                {searchPerformed && (
                                    <button 
                                        className="fp-reset-search-button"
                                        onClick={resetSearch}
                                    >
                                        Reset Search
                                    </button>
                                )}
                            </div>

                            {/* Show search results or a placeholder message */}
                            {!searchPerformed ? (
                                <div className="fp-no-results-message">
                                    <p>Search for carpools to see available rides</p>
                                </div>
                            ) : (
                                <RideResults 
                                    rides={rides}
                                    loading={loading}
                                    onError={handleError}
                                    onSuccess={handleSuccess}
                                    searchParams={searchParams}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FindPool;