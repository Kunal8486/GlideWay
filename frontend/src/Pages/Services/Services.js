import React from "react";
import "./Services.css";

export default function Services() {
  return (
    <div className="services-container">
      <h1 className="services-title">Our Services</h1>

      <div className="services-grid">
        <div className="service-card">
          <h3>🚖 Ride Sharing</h3>
          <p>Affordable and convenient rides anytime, anywhere.</p>
        </div>
        <div className="service-card">
          <h3>📦 Package Delivery</h3>
          <p>Fast and secure package delivery at your fingertips.</p>
        </div>
        <div className="service-card">
          <h3>💼 Corporate Travel</h3>
          <p>Seamless business travel solutions for professionals.</p>
        </div>
      </div>

      {/* Bottom Call-to-Action Box */}
      <div className="hero-box">
        <h2>🚗 <strong>GlideWay – The Smarter Way to Travel</strong></h2>
        <p>Book your ride now and experience the best of convenience and safety.</p>
        <button className="ride-button">Book a Ride</button>
      </div>
    </div>
  );
}
