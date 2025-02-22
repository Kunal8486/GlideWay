import React from "react";
import "./Services.css";

const servicesData = [
  {
    icon: "🚖",
    title: "Ride Sharing",
    description: "Affordable and convenient rides anytime, anywhere.",
    features: ["Real-time tracking", "Flexible payment options", "Rated drivers"]
  },
  {
    icon: "👥",
    title: "Car Pooling",
    description: "Share rides, reduce costs, and help the environment.",
    features: ["Match with travelers", "Split costs easily", "Eco-friendly option"]
  },
  {
    icon: "👑",
    title: "Premium Rides",
    description: "Luxury vehicles for those special moments.",
    features: ["High-end vehicles", "Professional chauffeurs", "Extra comfort"]
  },
  {
    icon: "📦",
    title: "Package Delivery",
    description: "Fast and secure package delivery at your fingertips.",
    features: ["Real-time tracking", "Insurance coverage", "Express delivery"]
  },
  {
    icon: "💼",
    title: "Corporate Travel",
    description: "Seamless business travel solutions for professionals.",
    features: ["Business accounts", "Priority service", "Travel reports"]
  },
  {
    icon: "🚐",
    title: "Group Transit",
    description: "Perfect for events and large group transportation.",
    features: ["Multiple vehicle sizes", "Event planning", "Group discounts"]
  }
];

export default function Services() {
  return (
    <div className="services-container">
      {/* Header Section */}
      <div className="services-header">
        <h1 className="services-title">Our Services</h1>
        <p className="services-subtitle">
          Experience the future of transportation with our comprehensive range of services
        </p>
      </div>

      {/* Services Grid */}
      <div className="services-grid">
        {servicesData.map((service, index) => (
          <div key={index} className="service-card">
            <div className="service-icon">{service.icon}</div>
            <h3 className="service-title">{service.title}</h3>
            <p className="service-description">{service.description}</p>
            <ul className="feature-list">
              {service.features.map((feature, idx) => (
                <li key={idx} className="feature-item">
                  <span className="feature-dot"></span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Call to Action Box */}
      <div className="hero-box">
        <h2>🚗 <strong>GlideWay – The Smarter Way to Travel</strong></h2>
        <p>Book your ride now and experience the best of convenience and safety.
          Download our app to access all services instantly!</p>
        <div className="button-group">
        <a href="/book-a-ride">  <button className="primary-button" >Book a Ride</button></a>
        <a href="https://play.google.com" target="_blank">  <button className="secondary-button">Download App</button></a>
        </div>
      </div>

      {/* Features Banner */}
      <div className="features-banner">
        <div className="feature-banner-item">
          <div className="banner-icon">⭐</div>
          <h3>Trusted Service</h3>
          <p>Over 1 million satisfied customers</p>
        </div>
        <div className="feature-banner-item">
          <div className="banner-icon">🛡️</div>
          <h3>Safe & Secure</h3>
          <p>Verified drivers and secure payments</p>
        </div>
        <div className="feature-banner-item">
          <div className="banner-icon">⚡</div>
          <h3>24/7 Support</h3>
          <p>Always here when you need us</p>
        </div>
      </div>
    </div>
  );
}