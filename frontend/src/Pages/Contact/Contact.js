// ContactPage.js
import React, { useState, useEffect, useRef } from 'react';
import './Contact.css';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    phone: '',
    preferredContact: 'email'
  });
  const [submitStatus, setSubmitStatus] = useState(null);
  const [errors, setErrors] = useState({});
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  const [activeAccordion, setActiveAccordion] = useState(null);

  // FAQ data
  const faqData = [
    {
      question: "What are your business hours?",
      answer: "Our customer support team is available Monday through Friday from 9AM to 6PM IST. During weekends, we offer limited support via email."
    },
    {
      question: "How quickly will I receive a response?",
      answer: "We aim to respond to all inquiries within 24 hours. For urgent matters, we recommend calling our support line directly."
    },
    {
      question: "Do you offer on-site consultations?",
      answer: "Yes, we offer on-site consultations for enterprise clients. Please contact us via the form with your requirements, and our team will schedule a meeting."
    },
    {
      question: "Is there a customer portal for existing clients?",
      answer: "Yes, existing clients can access our customer portal at portal.glideway.com using their registered credentials."
    }
  ];

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
        window.gm_authFailure = () => {
          console.error('Google Maps authentication error');
          // Handle API key failures gracefully
          document.getElementById('cn-map-error-message').style.display = 'flex';
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
    try {
      // GlideWay HQ coordinates
      const glideWayLocation = { lat: 28.4506, lng: 77.5842 };
      
      // Create map
      const mapOptions = {
        center: glideWayLocation,
        zoom: 15,
        mapId: 'DEMO_MAP_ID',
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
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
          },
          // Added more detailed styling for business areas
          {
            "featureType": "poi.business",
            "elementType": "labels",
            "stylers": [
              { "visibility": "on" }
            ]
          }
        ]
      };
      
      // Create new map
      const map = new window.google.maps.Map(mapRef.current, mapOptions);
      googleMapRef.current = map;
      
      // Add marker with enhanced styling
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
      
      // Enhanced info window with more details
      const infoContent = `
        <div class="cn-custom-info-window">
          <h3>GlideWay Headquarters</h3>
          <p>Bennett University, Uttar Pradesh, BU 822116</p>
          <div class="cn-info-window-details">
            <p><strong>Hours:</strong> Mon-Fri: 9AM-6PM IST</p>
            <p><strong>Phone:</strong> +91 80926-68486</p>
          </div>
        </div>
      `;
      
      const infoWindow = new window.google.maps.InfoWindow({
        content: infoContent,
        maxWidth: 300
      });
      
      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });
      
      // Open info window by default
      infoWindow.open(map, marker);

      // Add nearby landmarks for better orientation
      const landmarks = [
        {
          position: { lat: 28.4538, lng: 77.5872 },
          title: 'Tech Park'
        },
        {
          position: { lat: 28.4476, lng: 77.5812 },
          title: 'Bennett Plaza'
        }
      ];

      landmarks.forEach(landmark => {
        new window.google.maps.Marker({
          position: landmark.position,
          map: map,
          title: landmark.title,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: '#6b7280',
            fillOpacity: 0.7,
            strokeColor: '#4b5563',
            strokeWeight: 1,
            scale: 6
          }
        });
      });
    } catch (error) {
      console.error('Map initialization error:', error);
      document.getElementById('cn-map-error-message').style.display = 'flex';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email address is invalid';
    }
    
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    
    if (formData.phone && !/^[\d\s\+\-\(\)]{10,15}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Simulate form submission with loading state
      setSubmitStatus('sending');
      
      // Simulate API call
      setTimeout(() => {
        setSubmitStatus('success');
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
          phone: '',
          preferredContact: 'email'
        });
      }, 1500);
    } else {
      // Scroll to first error
      const firstErrorField = document.querySelector('.cn-error-message');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const toggleAccordion = (index) => {
    setActiveAccordion(activeAccordion === index ? null : index);
  };

  return (
    <div className="cn-contact-page">
      <div className="cn-contact-hero">
        <div className="cn-contact-hero-content">
          <h1 className="cn-page-title">Let's Connect</h1>
          <p className="cn-hero-subtitle">We're here to help with any questions or inquiries</p>
        </div>
      </div>
      
      <div className="cn-contact-container">
        <div className="cn-contact-info-section">
          <h2 className="cn-section-title">Get in Touch</h2>
          <p className="cn-tagline">Whether you have a question about our services, pricing, or anything else, our team is ready to answer all your questions.</p>
          
          <div className="cn-info-blocks">
            <div className="cn-info-block cn-location-block">
              <div className="cn-icon">📍</div>
              <div className="cn-details">
                <h3 className="cn-info-title">Visit Us</h3>
                <p>GlideWay Co. Ltd.<br />Bennett University, Uttar Pradesh BU 822116</p>
                <small className="cn-info-note">Visitor hours: Monday-Friday, 10AM-5PM IST</small>
              </div>
            </div>
            
            <div className="cn-info-block cn-phone-block">
              <div className="cn-icon">📞</div>
              <div className="cn-details">
                <h3 className="cn-info-title">Call Us</h3>
                <p className="cn-phone-number">+91 80926-68486</p>
                <p className="cn-business-hours">Mon-Fri: 9AM-6PM IST</p>
                <small className="cn-info-note">For urgent inquiries outside business hours, please email us</small>
              </div>
            </div>
            
            <div className="cn-info-block cn-email-block">
              <div className="cn-icon">✉️</div>
              <div className="cn-details">
                <h3 className="cn-info-title">Email Us</h3>
                <p className="cn-email-address">support@glideway.com</p>
                <p className="cn-email-address">sales@glideway.com</p>
                <small className="cn-info-note">We respond within 24 hours</small>
              </div>
            </div>
          </div>
          
          <div className="cn-social-links">
            <h3 className="cn-social-title">Connect With Us</h3>
            <div className="cn-social-icons">
              <a href="https://twitter.com/glideway" className="cn-social-icon cn-twitter" aria-label="Twitter">
                <span className="cn-icon-symbol">𝕏</span>
              </a>
              <a href="https://www.facebook.com/glideway" className="cn-social-icon cn-facebook" aria-label="Facebook">
                <span className="cn-icon-symbol">ƒ</span>
              </a>
              <a href="https://www.linkedin.com/in/glideway/" className="cn-social-icon cn-linkedin" aria-label="LinkedIn">
                <span className="cn-icon-symbol">in</span>
              </a>
              <a href="https://www.instagram.com/glideway" className="cn-social-icon cn-instagram" aria-label="Instagram">
                <span className="cn-icon-symbol">ig</span>
              </a>
            </div>
          </div>
        </div>
        
        <div className="cn-contact-form-section">
          <div className="cn-form-container">
            <h2 className="cn-section-title">Send Us a Message</h2>
            <p className="cn-form-intro">Fill out the form below, and we'll get back to you as soon as possible.</p>
            
            {submitStatus === 'success' ? (
              <div className="cn-success-message">
                <div className="cn-success-icon">✓</div>
                <h3 className="cn-success-title">Message Sent!</h3>
                <p className="cn-success-text">Thank you for reaching out. We'll get back to you shortly.</p>
                <button onClick={() => setSubmitStatus(null)} className="cn-send-another-btn">
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="cn-contact-form">
                <div className="cn-form-row">
                  <div className={`cn-form-group ${errors.name ? 'cn-has-error' : ''}`}>
                    <label htmlFor="name" className="cn-form-label">Full Name <span className="cn-required">*</span></label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      className="cn-form-input"
                      aria-required="true"
                      aria-invalid={errors.name ? "true" : "false"}
                    />
                    {errors.name && <div className="cn-error-message">{errors.name}</div>}
                  </div>
                  
                  <div className={`cn-form-group ${errors.email ? 'cn-has-error' : ''}`}>
                    <label htmlFor="email" className="cn-form-label">Email Address <span className="cn-required">*</span></label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your.email@example.com"
                      className="cn-form-input"
                      aria-required="true"
                      aria-invalid={errors.email ? "true" : "false"}
                    />
                    {errors.email && <div className="cn-error-message">{errors.email}</div>}
                  </div>
                </div>
                
                <div className="cn-form-row">
                  <div className={`cn-form-group ${errors.phone ? 'cn-has-error' : ''}`}>
                    <label htmlFor="phone" className="cn-form-label">Phone Number (Optional)</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      className="cn-form-input"
                      aria-invalid={errors.phone ? "true" : "false"}
                    />
                    {errors.phone && <div className="cn-error-message">{errors.phone}</div>}
                  </div>
                  
                  <div className="cn-form-group">
                    <label htmlFor="preferredContact" className="cn-form-label">Preferred Contact Method</label>
                    <select
                      id="preferredContact"
                      name="preferredContact"
                      value={formData.preferredContact}
                      onChange={handleChange}
                      className="cn-form-select"
                    >
                      <option value="email">Email</option>
                      <option value="phone">Phone</option>
                    </select>
                  </div>
                </div>
                
                <div className={`cn-form-group ${errors.subject ? 'cn-has-error' : ''}`}>
                  <label htmlFor="subject" className="cn-form-label">Subject <span className="cn-required">*</span></label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="How can we help you?"
                    className="cn-form-input"
                    aria-required="true"
                    aria-invalid={errors.subject ? "true" : "false"}
                  />
                  {errors.subject && <div className="cn-error-message">{errors.subject}</div>}
                </div>
                
                <div className={`cn-form-group ${errors.message ? 'cn-has-error' : ''}`}>
                  <label htmlFor="message" className="cn-form-label">Message <span className="cn-required">*</span></label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us more about your inquiry..."
                    rows="5"
                    className="cn-form-textarea"
                    aria-required="true"
                    aria-invalid={errors.message ? "true" : "false"}
                  ></textarea>
                  {errors.message && <div className="cn-error-message">{errors.message}</div>}
                </div>
                
                <div className="cn-form-group cn-checkbox-group">
                  <label className="cn-checkbox-container">
                    <input type="checkbox" name="newsletter" className="cn-checkbox-input" />
                    <span className="cn-checkmark"></span>
                    <span className="cn-checkbox-text">Subscribe to our newsletter for updates and special offers</span>
                  </label>
                </div>
                
                <div className="cn-form-footer">
                  <p className="cn-privacy-notice">By submitting this form, you agree to our <a href="/privacy-policy" className="cn-privacy-link">Privacy Policy</a>.</p>
                  <button 
                    type="submit" 
                    className={`cn-submit-btn ${submitStatus === 'sending' ? 'cn-sending' : ''}`}
                    disabled={submitStatus === 'sending'}
                  >
                    {submitStatus === 'sending' ? (
                      <>
                        <span className="cn-spinner"></span>
                        <span>Sending...</span>
                      </>
                    ) : (
                      'Send Message'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
      
      <div className="cn-map-section">
        <h2 className="cn-section-title">Find Us</h2>
        <div className="cn-map-container">
          <div ref={mapRef} className="cn-google-map"></div>
          <div id="cn-map-error-message" className="cn-map-error">
            <p>Unable to load the map. Please try again later.</p>
          </div>
          <div className="cn-directions-overlay">
            <div className="cn-directions-buttons">
              <a 
                href="https://maps.app.goo.gl/zTMzuhBwHdG7Pv4Y8" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="cn-directions-btn cn-primary-btn"
                aria-label="Get directions to GlideWay Headquarters"
              >
                Get Directions
              </a>
              <button 
                className="cn-directions-btn cn-secondary-btn"
                onClick={() => {
                  if (googleMapRef.current) {
                    googleMapRef.current.setZoom(googleMapRef.current.getZoom() + 1);
                  }
                }}
                aria-label="Zoom in on map"
              >
                Zoom In
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;