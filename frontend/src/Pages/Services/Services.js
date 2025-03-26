import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { 
  Car, 
  Users, 
  Crown, 
  Package, 
  Briefcase, 
  Bus,
  Star, 
  Shield, 
  Leaf,
  Zap,
  ChevronRight,
  Map,
  Clock,
  Phone,
  Award,
  Download
} from "lucide-react";
import "./Services.css";

// Professional light brown color palette
const theme = {
  primary: "#a67c52",
  primaryLight: "#d4b595",
  primaryDark: "#7d5b3c",
  secondary: "#8c6e4a",
  accent: "#c9aa7c",
  light: "#f5efe6",
  neutral: "#e8dcc9",
  text: "#4a3b2a",
  textLight: "#7d684a"
};

// Services data with consistent theming
const servicesData = [
  {
    id: "ride-sharing",
    icon: <Car size={32} strokeWidth={1.5} />,
    title: "Ride Sharing",
    description: "Affordable and convenient rides anytime, anywhere.",
    features: ["Real-time tracking", "Flexible payment options", "Rated drivers", "ETA predictions"],
  },
  {
    id: "car-pooling",
    icon: <Users size={32} strokeWidth={1.5} />,
    title: "Car Pooling",
    description: "Share rides, reduce costs, and help the environment.",
    features: ["Match with travelers", "Split costs easily", "Eco-friendly option", "Commute scheduling"],
  },
 
  {
    id: "corporate-travel",
    icon: <Briefcase size={32} strokeWidth={1.5} />,
    title: "Corporate Travel",
    description: "Seamless business travel solutions for professionals.",
    features: ["Business accounts", "Priority service", "Travel reports", "Expense integration"],
  },
  {
    id: "group-transit",
    icon: <Bus size={32} strokeWidth={1.5} />,
    title: "Group Transit",
    description: "Perfect for events and large group transportation.",
    features: ["Multiple vehicle sizes", "Event planning", "Group discounts", "Customized routes"],
  },
  {
    id: "ride-hailing",
    icon: <Package size={32} strokeWidth={1.5} />,
    title: "Ride Hailing",
    description: "Quick and reliable rides at your fingertips.",
    features: ["Instant booking", "Affordable fares", "Multiple ride options", "Real-time tracking"],
  },
  {
    id: "eco-friendly-rides",
    icon: <Leaf size={32} strokeWidth={1.5} />,
    title: "Eco-Friendly Rides",
    description: "Sustainable travel with electric and hybrid vehicles.",
    features: ["Electric & hybrid cars", "Carbon offset options", "Green rewards", "Lower emissions"],
  }
  
];

// Service Card Component with professional styling
const ServiceCard = ({ service, index, setSelectedService }) => {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
        }
      },
      { threshold: 0.2, rootMargin: '0px 0px -100px 0px' }
    );
    
    if (cardRef.current) {
      observer.observe(cardRef.current);
    }
    
    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  return (
    <div 
      ref={cardRef}
      className="service-card-services" 
      data-service-id={service.id}
      style={{ 
        animationDelay: `${index * 0.1}s`,
        borderTop: `5px solid ${theme.primary}`,
        backgroundColor: theme.light,
        boxShadow: "0 4px 20px rgba(166, 124, 82, 0.1)"
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      tabIndex={0}
      role="button"
      aria-label={`Learn more about ${service.title}`}
      onClick={() => setSelectedService(service)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          setSelectedService(service);
        }
      }}
    >
      <div className="service-card-services-content">
        <div className="service-icon" style={{ backgroundColor: `${theme.neutral}` }}>
          <div className="icon-inner" style={{ color: theme.primary }}>
            {service.icon}
          </div>
        </div>
        <h3 className="service-title" style={{ color: theme.primary }}>{service.title}</h3>
        <p className="service-description" style={{ color: theme.text }}>{service.description}</p>
        <ul className="feature-list">
          {service.features.map((feature, idx) => (
            <li key={`feature-${idx}`} className="feature-item" style={{ color: theme.textLight }}>
              <span className="feature-dot" style={{ backgroundColor: theme.primary }}></span>
              {feature}
            </li>
          ))}
        </ul>
      </div>
      <div 
        className={`service-card-services-overlay ${isHovered ? 'active' : ''}`} 
        style={{ backgroundColor: `${theme.primaryDark}F0` }}
        aria-hidden={!isHovered}
      >
        <div className="overlay-content">
          <h3 style={{ color: theme.light }}>{service.title}</h3>
          <p style={{ color: theme.neutral }}>Learn more about our {service.title.toLowerCase()} service</p>
          {/* <button className="overlay-button" style={{ 
            backgroundColor: theme.light, 
            color: theme.primaryDark,
            border: `1px solid ${theme.light}`
          }}>
            {service.cta} <ChevronRight size={16} />
          </button> */}
        </div>
      </div>
    </div>
  );
};

ServiceCard.propTypes = {
  service: PropTypes.shape({
    id: PropTypes.string.isRequired,
    icon: PropTypes.node.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    features: PropTypes.arrayOf(PropTypes.string).isRequired,
    cta: PropTypes.string.isRequired
  }).isRequired,
  index: PropTypes.number.isRequired,
  setSelectedService: PropTypes.func.isRequired
};

// Call to Action with professional styling
const CallToAction = () => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const ctaRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      const position = window.scrollY;
      setScrollPosition(position);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );
    
    if (ctaRef.current) {
      observer.observe(ctaRef.current);
    }
    
    return () => {
      if (ctaRef.current) {
        observer.unobserve(ctaRef.current);
      }
    };
  }, []);

  const parallaxOffset = scrollPosition * 0.1;
  
  return (
    <div 
      ref={ctaRef} 
      className={`hero-box-container ${isVisible ? 'visible' : ''}`}
    >
      <div 
        className="hero-box" 
        style={{ 
          backgroundPosition: `${50 + parallaxOffset}% ${50 + parallaxOffset}%`,
          backgroundColor: theme.light,
          backgroundImage: "linear-gradient(135deg, rgba(245,239,230,0.9) 0%, rgba(232,220,201,0.8) 100%)"
        }}
      >
        <div className="hero-box-content">
          <div className="hero-shapes">
            <div className="hero-shape shape1" style={{ backgroundColor: theme.primaryLight }}></div>
            <div className="hero-shape shape2" style={{ backgroundColor: theme.neutral }}></div>
            <div className="hero-shape shape3" style={{ backgroundColor: theme.accent }}></div>
          </div>
          <h2 style={{ color: theme.text }}><Car size={28} className="inline-icon" style={{ color: theme.primary }} /> <strong>GlideWay – The Smarter Way to Travel</strong></h2>
          <p style={{ color: theme.textLight }}>
            Book your ride now and experience the best of convenience and safety.
            Download our app to access all services instantly!
          </p>
          <div className="button-group">
            <a href="/book-a-ride" aria-label="Book a Ride">
              <button className="primary-button" style={{ 
                backgroundColor: theme.primary,
                color: theme.light
              }}>
                <span>Book a Ride</span>
                <Car size={16} className="button-icon" />
                <div className="button-overlay" style={{ backgroundColor: theme.primaryDark }}></div>
              </button>
            </a>
            <a href="https://play.google.com" target="_blank" rel="noopener noreferrer" aria-label="Download App">
              <button className="secondary-button" style={{ 
                backgroundColor: "transparent",
                color: theme.primary,
                border: `1px solid ${theme.primary}`
              }}>
                <span>Download App</span>
                <Download size={16} className="button-icon" />
                <div className="button-overlay" style={{ backgroundColor: theme.primaryLight }}></div>
              </button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// Features Banner with light brown theme
const FeaturesBanner = () => {
  const bannerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );
    
    if (bannerRef.current) {
      observer.observe(bannerRef.current);
    }
    
    return () => {
      if (bannerRef.current) {
        observer.unobserve(bannerRef.current);
      }
    };
  }, []);

  const features = [
    {
      icon: <Star size={28} strokeWidth={1.5} />,
      title: "Trusted Service",
      description: "Over 1 million satisfied customers"
    },
    {
      icon: <Shield size={28} strokeWidth={1.5} />,
      title: "Safe & Secure",
      description: "Verified drivers and secure payments"
    },
    {
      icon: <Zap size={28} strokeWidth={1.5} />,
      title: "24/7 Support",
      description: "Always here when you need us"
    }
  ];

  return (
    <div 
      ref={bannerRef} 
      className={`features-banner ${isVisible ? 'visible' : ''}`}
      style={{ backgroundColor: theme.light }}
    >
      {features.map((feature, index) => (
        <div 
          key={`banner-item-${index}`} 
          className="feature-banner-item"
          style={{ animationDelay: `${index * 0.15}s` }}
        >
          <div className="banner-icon-container">
            <div className="banner-icon-outer" style={{ borderColor: theme.primary }}>
              <div className="banner-icon" style={{ color: theme.primary }}>
                {feature.icon}
              </div>
            </div>
            <div className="banner-decoration" style={{ backgroundColor: theme.primary }}></div>
          </div>
          <h3 style={{ color: theme.primary }}>{feature.title}</h3>
          <p style={{ color: theme.textLight }}>{feature.description}</p>
        </div>
      ))}
    </div>
  );
};

// Service Detail Modal Component
const ServiceDetailModal = ({ service, onClose }) => {
  if (!service) return null;
  
  return (
    <div 
      className="service-modal-overlay" 
      onClick={onClose}
      style={{ backgroundColor: "rgba(74, 59, 42, 0.8)" }}
    >
      <div 
        className="service-modal-content" 
        onClick={e => e.stopPropagation()}
        style={{ 
          backgroundColor: theme.light,
          boxShadow: "0 10px 40px rgba(74, 59, 42, 0.2)",
          border: `1px solid ${theme.neutral}`
        }}
      >
        <button 
          className="modal-close-button" 
          onClick={onClose}
          style={{ color: theme.light }}
        >×</button>
        <div 
          className="modal-header" 
          style={{ backgroundColor: theme.primary }}
        >
          <div className="modal-icon" style={{ color: theme.light }}>{service.icon}</div>
          <h2 style={{ color: theme.light }}>{service.title}</h2>
        </div>
        <div className="modal-body">
          <p className="modal-description" style={{ color: theme.text }}>{service.description}</p>
          
          <h3 style={{ color: theme.primary }}>Key Features</h3>
          <ul className="modal-features">
            {service.features.map((feature, idx) => (
              <li key={`modal-feature-${idx}`} style={{ color: theme.textLight }}>
                <span className="feature-bullet" style={{ backgroundColor: theme.primary }}></span>
                {feature}
              </li>
            ))}
          </ul>
          
          <div className="modal-info-grid">
            <div className="modal-info-item">
              <Map size={24} style={{ color: theme.primary }} />
              <h4 style={{ color: theme.primaryDark }}>Coverage Area</h4>
              <p style={{ color: theme.textLight }}>Available in 200+ cities nationwide</p>
            </div>
            <div className="modal-info-item">
              <Clock size={24} style={{ color: theme.primary }} />
              <h4 style={{ color: theme.primaryDark }}>Availability</h4>
              <p style={{ color: theme.textLight }}>24/7 service, 365 days a year</p>
            </div>
            <div className="modal-info-item">
              <Phone size={24} style={{ color: theme.primary }} />
              <h4 style={{ color: theme.primaryDark }}>Booking</h4>
              <p style={{ color: theme.textLight }}>Via app, website or phone call</p>
            </div>
            <div className="modal-info-item">
              <Star size={24} style={{ color: theme.primary }} />
              <h4 style={{ color: theme.primaryDark }}>Satisfaction</h4>
              <p style={{ color: theme.textLight }}>98% customer satisfaction rate</p>
            </div>
          </div>
          
          <div className="modal-cta">
            <button 
              className="modal-cta-button" 
              style={{ 
                backgroundColor: theme.primary,
                color: theme.light
              }}
            >
              {service.cta} <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

ServiceDetailModal.propTypes = {
  service: PropTypes.shape({
    id: PropTypes.string.isRequired,
    icon: PropTypes.node.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    features: PropTypes.arrayOf(PropTypes.string).isRequired,
    cta: PropTypes.string.isRequired
  }),
  onClose: PropTypes.func.isRequired
};

// Stats Counter with professional styling
const StatsCounter = () => {
  const [counts, setCounts] = useState({
    rides: 0,
    cities: 0,
    drivers: 0,
    satisfaction: 0
  });
  
  const statsRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          animateCounts();
          setHasAnimated(true);
        }
      },
      { threshold: 0.5 }
    );
    
    if (statsRef.current) {
      observer.observe(statsRef.current);
    }
    
    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current);
      }
    };
  }, [hasAnimated]);
  
  const animateCounts = () => {
    const targets = {
      rides: 10000000,
      cities: 200,
      drivers: 55000,
      satisfaction: 98
    };
    
    const duration = 2000; // 2 seconds animation
    const frameRate = 50; // Update 50 times per second
    const totalFrames = duration / (1000 / frameRate);
    let frame = 0;
    
    const timer = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      
      setCounts({
        rides: Math.floor(easeOutQuart(progress) * targets.rides),
        cities: Math.floor(easeOutQuart(progress) * targets.cities),
        drivers: Math.floor(easeOutQuart(progress) * targets.drivers),
        satisfaction: Math.floor(easeOutQuart(progress) * targets.satisfaction)
      });
      
      if (frame === totalFrames) {
        clearInterval(timer);
      }
    }, 1000 / frameRate);
  };
  
  // Easing function for smoother animation
  const easeOutQuart = x => 1 - Math.pow(1 - x, 4);
  
  // Format large numbers with commas
  const formatNumber = num => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  return (
    <div 
      ref={statsRef} 
      className="stats-counter" 
      style={{ 
        backgroundColor: theme.neutral,
        boxShadow: "0 4px 20px rgba(166, 124, 82, 0.1)"
      }}
    >
      <div className="stats-item">
        <div className="stats-icon" style={{ backgroundColor: `${theme.light}` }}>
          <Car size={32} color={theme.primary} />
        </div>
        <div className="stats-value" style={{ color: theme.primary }}>{formatNumber(counts.rides)}+</div>
        <div className="stats-label" style={{ color: theme.text }}>Rides Completed</div>
      </div>
      
      <div className="stats-item">
        <div className="stats-icon" style={{ backgroundColor: `${theme.light}` }}>
          <Map size={32} color={theme.primary} />
        </div>
        <div className="stats-value" style={{ color: theme.primary }}>{counts.cities}+</div>
        <div className="stats-label" style={{ color: theme.text }}>Cities Covered</div>
      </div>
      
      <div className="stats-item">
        <div className="stats-icon" style={{ backgroundColor: `${theme.light}` }}>
          <Users size={32} color={theme.primary} />
        </div>
        <div className="stats-value" style={{ color: theme.primary }}>{formatNumber(counts.drivers)}+</div>
        <div className="stats-label" style={{ color: theme.text }}>Verified Drivers</div>
      </div>
      
      <div className="stats-item">
        <div className="stats-icon" style={{ backgroundColor: `${theme.light}` }}>
          <Award size={32} color={theme.primary} />
        </div>
        <div className="stats-value" style={{ color: theme.primary }}>{counts.satisfaction}%</div>
        <div className="stats-label" style={{ color: theme.text }}>Satisfaction Rate</div>
      </div>
    </div>
  );
};

// Main Services Component
const Services = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const servicesRef = useRef(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );
    
    if (servicesRef.current) {
      observer.observe(servicesRef.current);
    }
    
    return () => {
      if (servicesRef.current) {
        observer.unobserve(servicesRef.current);
      }
    };
  }, []);

  return (
    <section 
      ref={servicesRef} 
      className={`services-container ${isVisible ? 'visible' : ''}`}
      style={{ backgroundColor: "#faf7f2" }}
    >
      <div className="services-header">
        <div className="title-decoration">
          <div className="title-line" style={{ backgroundColor: theme.primary }}></div>
          <div className="title-dot" style={{ backgroundColor: theme.primary }}></div>
          <div className="title-line" style={{ backgroundColor: theme.primary }}></div>
        </div>
        <h1 className="services-title" style={{ color: theme.primary }}>Our Services</h1>
        <p className="services-subtitle" style={{ color: theme.textLight }}>
          Experience the future of transportation with our comprehensive range of services
        </p>
      </div>

      <div className="services-grid">
        {servicesData.map((service, index) => (
          <ServiceCard 
            key={service.id} 
            service={service} 
            index={index}
            setSelectedService={setSelectedService}
          />
        ))}
      </div>

      <StatsCounter />
      <CallToAction />
      <FeaturesBanner />
      
      {selectedService && (
        <ServiceDetailModal 
          service={selectedService}
          onClose={() => setSelectedService(null)}
        />
      )}
      
      <div className="services-background">
        <div className="bg-circle circle1" style={{ backgroundColor: `${theme.primaryLight}30` }}></div>
        <div className="bg-circle circle2" style={{ backgroundColor: `${theme.primary}20` }}></div>
        <div className="bg-circle circle3" style={{ backgroundColor: `${theme.neutral}40` }}></div>
      </div>
    </section>
  );
};

export default Services;