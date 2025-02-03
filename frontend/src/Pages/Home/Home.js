import React from 'react';
import { Car, Smartphone, MapPin, DollarSign, ShieldCheck } from 'lucide-react';
import './Home.css';

const HomePage = () => {
  return (
    <div className="homepage">
      <section className="hero">
        <div className="hero-content">
          <h1>Your Ride, Anytime, Anywhere</h1>
          <p>Fast, Safe, and Affordable Rides. Wherever you go, we’ll get you there.</p>
          <div className="cta-buttons">
            <button className="cta-button primary">Book a Ride</button>
            <button className="cta-button secondary">Become a Driver</button>
          </div>
        </div>
        <div className="hero-image">
          <img src="/assets/pngwing.com (2).png" alt="Cityscape" />
        </div>
      </section>

      <section className="features">
        <h2>Why Choose Glide Way?</h2>
        <div className="feature-list">
          <div className="feature">
            <Car size={40} />
            <h3>Quick Ride Booking</h3>
            <p>Book a ride instantly with just a few taps on your phone.</p>
          </div>
          <div className="feature">
            <ShieldCheck size={40} />
            <h3>Reliable Drivers</h3>
            <p>All our drivers are verified and experienced professionals.</p>
          </div>
          <div className="feature">
            <DollarSign size={40} />
            <h3>Affordable Pricing</h3>
            <p>Transparent and budget-friendly fares for every ride.</p>
          </div>
          <div className="feature">
            <Smartphone size={40} />
            <h3>Multiple Ride Options</h3>
            <p>Choose from sedans, SUVs, bikes, and more based on your needs.</p>
          </div>
          <div className="feature">
            <MapPin size={40} />
            <h3>Real-Time Tracking</h3>
            <p>Track your ride from pickup to drop-off with live updates.</p>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <span className="step-number">1</span>
            <p>Download the app and sign up.</p>
          </div>
          <div className="step">
            <span className="step-number">2</span>
            <p>Enter your pickup and drop-off location.</p>
          </div>
          <div className="step">
            <span className="step-number">3</span>
            <p>Choose your ride and confirm your booking.</p>
          </div>
          <div className="step">
            <span className="step-number">4</span>
            <p>Sit back, relax, and enjoy the ride!</p>
          </div>
        </div>
      </section>
      <section className="about">
        <h2>About Glide Way</h2>
        <p>
          Glide Way is committed to revolutionizing the way people commute. With a focus on safety, affordability, and convenience, we strive to provide a seamless ride-sharing experience for everyone, everywhere.
        </p>
        <button className="cta-button primary">About Us</button>

      </section>

      <section className="stats">
        <h2>Our Impact</h2>
        <div className="stats-grid">
          <div className="stat">
            <h3>10M+</h3>
            <p>Rides Completed</p>
          </div>
          <div className="stat">
            <h3>50K+</h3>
            <p>Drivers Registered</p>
          </div>
          <div className="stat">
            <h3>100+</h3>
            <p>Cities Covered</p>
          </div>
          <div className="stat">
            <h3>95%</h3>
            <p>Customer Satisfaction</p>
          </div>
        </div>
      </section>

      <section className="partner">
        <h2>Partner with Us</h2>
        <p>Looking to provide rides for your employees or clients? Collaborate with Glide Way for reliable and affordable corporate solutions.</p>
        <button className="cta-button primary">Contact Us</button>
      </section>


      <section className="testimonials">
        <h2>What Our Users Say</h2>
        <div className="testimonial-list">
          <div className="testimonial">
            <p>"The service was amazing. My driver was punctual and courteous!"</p>
            <span>- Sarah K.</span>
          </div>
          <div className="testimonial">
            <p>"As a driver, I love the flexibility Glide Way offers."</p>
            <span>- John D.</span>
          </div>
          <div className="testimonial">
            <p>"Glide Way makes commuting so much easier and stress-free!"</p>
            <span>- Emma R.</span>
          </div>
        </div>
      </section>

      <section className="cta">
        <h2>Ready to Glide?</h2>
        <p>Download the app today or sign up as a driver to join the Glide Way family.</p>
        <div className="cta-buttons">
          <button className="cta-button primary">Download the App</button>
          <button className="cta-button secondary">Sign Up to Drive</button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
