// ContactPage.js
import React, { useState, useEffect, useRef } from 'react';
import './Contact.css';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitStatus, setSubmitStatus] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);

  // Load Google Maps script
  useEffect(() => {
    const loadGoogleMapsScript = () => {
      if (!window.google || !window.google.maps) {
        const googleMapScript = document.createElement('script');
        googleMapScript.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAsbNcuAXnl7UNwO-dpDelhoZlmszXR2U0&libraries=places`;
        googleMapScript.async = true;
        googleMapScript.defer = true;
        googleMapScript.onload = () => {
          setMapLoaded(true);
        };
        document.body.appendChild(googleMapScript);
        return () => {
          document.body.removeChild(googleMapScript);
        };
      } else {
        setMapLoaded(true);
      }
    };

    loadGoogleMapsScript();
  }, []);

  // Initialize map when script is loaded
  useEffect(() => {
    if (mapLoaded && mapRef.current) {
      initMap();
    }
  }, [mapLoaded]);

  const initMap = () => {
    // GlideWay HQ coordinates (example - San Francisco)
    const glideWayLocation = { lat: 28.4506, lng: 77.5842 };
    
    // Create map
    const mapOptions = {
      center: glideWayLocation,
      zoom: 15,
      mapId: 'DEMO_MAP_ID', // Optional - for styled maps
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      styles: [
        {
          "featureType": "all",
          "elementType": "geometry.fill",
          "stylers": [
            { "color": "#f9f4ef" }
          ]
        },
        {
          "featureType": "road",
          "elementType": "geometry.fill",
          "stylers": [
            { "color": "#e8ddcb" }
          ]
        },
        {
          "featureType": "road",
          "elementType": "geometry.stroke",
          "stylers": [
            { "color": "#d9c7b8" }
          ]
        },
        {
          "featureType": "water",
          "elementType": "geometry.fill",
          "stylers": [
            { "color": "#d1c0a8" }
          ]
        },
        {
          "featureType": "poi",
          "elementType": "geometry.fill",
          "stylers": [
            { "color": "#e0d3c1" }
          ]
        }
      ]
    };
    
    // Create new map
    const map = new window.google.maps.Map(mapRef.current, mapOptions);
    googleMapRef.current = map;
    
    // Add marker
    const marker = new window.google.maps.Marker({
      position: glideWayLocation,
      map: map,
      title: 'GlideWay HQ',
      animation: window.google.maps.Animation.DROP,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        fillColor: '#8B4513',
        fillOpacity: 1,
        strokeColor: '#c29b7f',
        strokeWeight: 2,
        scale: 8
      }
    });
    
    // Add info window
    const infoContent = `
      <div class="custom-info-window">
        <h3>GlideWay Headquarters</h3>
        <p>Bennett Unniversity, Uttar Pradesh, BU 822116</p>
      </div>
    `;
    
    const infoWindow = new window.google.maps.InfoWindow({
      content: infoContent
    });
    
    marker.addListener('click', () => {
      infoWindow.open(map, marker);
    });
    
    // Open info window by default
    infoWindow.open(map, marker);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate form submission
    setSubmitStatus('sending');
    setTimeout(() => {
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    }, 1500);
  };

  return (
    <div className="contact-page">
      <div className="contact-container">
        <div className="contact-info-section">
          <h1>Get in Touch</h1>
          <p className="tagline">We're here to help you glide through your journey.</p>
          
          <div className="info-blocks">
            <div className="info-block">
              <div className="icon">📍</div>
              <div className="details">
                <h3>Visit Us</h3>
                <p>123 GlideWay Avenue<br />Tech District, CA 94103</p>
              </div>
            </div>
            
            <div className="info-block">
              <div className="icon">📞</div>
              <div className="details">
                <h3>Call Us</h3>
                <p>+1 (555) 123-4567</p>
                <p>Mon-Fri: 9AM-6PM PST</p>
              </div>
            </div>
            
            <div className="info-block">
              <div className="icon">✉️</div>
              <div className="details">
                <h3>Email Us</h3>
                <p>support@glideway.com</p>
                <p>We respond within 24 hours</p>
              </div>
            </div>
          </div>
          
          <div className="social-links">
            <h3>Connect With Us</h3>
            <div className="social-icons">
              <a href="#" className="social-icon">
                <span className="icon">𝕏</span>
              </a>
              <a href="#" className="social-icon">
                <span className="icon">ƒ</span>
              </a>
              <a href="#" className="social-icon">
                <span className="icon">in</span>
              </a>
              <a href="#" className="social-icon">
                <span className="icon">ig</span>
              </a>
            </div>
          </div>
        </div>
        
        <div className="contact-form-section">
          <div className="form-container">
            <h2>Send Us a Message</h2>
            {submitStatus === 'success' ? (
              <div className="success-message">
                <div className="success-icon">✓</div>
                <h3>Message Sent!</h3>
                <p>Thank you for reaching out. We'll get back to you shortly.</p>
                <button onClick={() => setSubmitStatus(null)} className="send-another-btn">
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Your name"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="your.email@example.com"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="subject">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="How can we help you?"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    placeholder="Tell us more about your inquiry..."
                    rows="5"
                  ></textarea>
                </div>
                
                <button 
                  type="submit" 
                  className={`submit-btn ${submitStatus === 'sending' ? 'sending' : ''}`}
                  disabled={submitStatus === 'sending'}
                >
                  {submitStatus === 'sending' ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
      
      <div className="map-section">
        <h2>Find Us</h2>
        <div className="map-container">
          <div ref={mapRef} className="google-map"></div>
          <div className="directions-overlay">
            <a 
              href="https://maps.app.goo.gl/zTMzuhBwHdG7Pv4Y8" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="directions-btn"
            >
              Get Directions
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;