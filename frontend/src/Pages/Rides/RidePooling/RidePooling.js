import React from 'react';
import { useNavigate } from 'react-router-dom';
import './RidePooling.css';
import CreateRide from './CreatePool/CreatePool.js';
import FindPool from './FindPool/FindPool.js';

function RidePooling() {
    const navigate = useNavigate();
    
    const handleNavigation = (e, path) => {
        e.preventDefault();
        navigate(path);
    };

    return (
        <div className="glide-way-container">
            <header className="glide-way-header">
                <h1>Pool the Ride</h1>
                <nav>
                    <a href="/pooling/create" onClick={e => handleNavigation(e, '/pooling/create')}>Create Ride</a>
                    <a href="/pooling/find" onClick={e => handleNavigation(e, '/pooling/find')}>Find Ride</a>
                </nav>
            </header>

            <main className="glide-way-main">
                <section id="create-ride" className="ride-creation-section">
                    <CreateRide />
                </section>
                <section id="find-ride" className="find-pool-section">
                    <FindPool />
                </section>
            </main>
        </div>
    );
}

export default RidePooling;