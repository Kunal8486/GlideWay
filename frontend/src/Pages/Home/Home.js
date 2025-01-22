import React from 'react';
import './Home.css';

const Home = () => {
    return (
        <div className="home-container">
            <header className="home-header">
                <h1>Welcome to Glideway</h1>
                <p>Your reliable ride-sharing app</p>
            </header>
            <section className="home-content">
                <div className="home-card">
                    <h2>Book a Ride</h2>
                    <p>Get a ride in minutes with just a few taps.</p>
                    <button>Book Now</button>
                </div>
                <div className="home-card">
                    <h2>Become a Driver</h2>
                    <p>Earn money by driving with Glideway.</p>
                    <button>Sign Up</button>
                </div>
            </section>
        </div>
    );
};

export default Home;