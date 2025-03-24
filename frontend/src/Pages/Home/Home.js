import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Car, Smartphone, MapPin, DollarSign, ShieldCheck, 
  Users, Briefcase, Clock, UserCheck, Star, PhoneCall, ChevronUp, ChevronDown 
} from 'lucide-react';
import './Home.css';

// Component for reusable feature cards
const FeatureCard = ({ Icon, title, description }) => (
  <div className="feature">
    <Icon size={40} aria-hidden="true" />
    <h3>{title}</h3>
    <p>{description}</p>
  </div>
);

// FAQ Accordion component
const FAQItem = ({ question, answer, isOpen, onClick }) => (
  <div className={`faq-item ${isOpen ? 'active' : ''}`} onClick={onClick}>
    <h3>
      {question}
      <span>{isOpen ? <ChevronUp aria-hidden="true" /> : <ChevronDown aria-hidden="true" />}</span>
    </h3>
    {isOpen && <div className="faq-answer">{answer}</div>}
  </div>
);

// Stat counter component with animation
const AnimatedStat = ({ value, label, index }) => {
  const statRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.2 }
    );

    if (statRef.current) {
      observer.observe(statRef.current);
    }

    return () => {
      if (statRef.current) {
        observer.unobserve(statRef.current);
      }
    };
  }, []);

  // For numeric stats, animate counting up
  const animateValue = () => {
    // If the value is not a percentage or has a "+" symbol
    if (value.includes('+') || value.includes('%')) {
      return value;
    }
    
    const numValue = parseInt(value.replace(/[^0-9]/g, ''));
    return isVisible ? numValue : 0;
  };

  return (
    <div 
      ref={statRef} 
      className={`stat ${isVisible ? 'in-view' : ''}`}
      style={{ 
        '--stat-index': index + 1, 
        animationDelay: `${(index + 1) * 0.15}s`
      }}
    >
      <h3>{value}</h3>
      <p>{label}</p>
    </div>
  );
};

// Testimonial component with animation
const Testimonial = ({ quote, author, index }) => {
  const testimonialRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.2 }
    );

    if (testimonialRef.current) {
      observer.observe(testimonialRef.current);
    }

    return () => {
      if (testimonialRef.current) {
        observer.unobserve(testimonialRef.current);
      }
    };
  }, []);

  return (
    <div 
      ref={testimonialRef} 
      className={`testimonial ${isVisible ? 'in-view' : ''}`}
      style={{ 
        '--testimonial-index': index + 1, 
        animationDelay: `${(index + 1) * 0.2}s`
      }}
    >
      <p>"{quote}"</p>
      <span>- {author}</span>
    </div>
  );
};

// Safety feature component with animation
const SafetyFeature = ({ Icon, title, description, index }) => {
  const featureRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.2 }
    );

    if (featureRef.current) {
      observer.observe(featureRef.current);
    }

    return () => {
      if (featureRef.current) {
        observer.unobserve(featureRef.current);
      }
    };
  }, []);

  return (
    <div 
      ref={featureRef} 
      className={`safety-feature ${isVisible ? 'in-view' : ''}`}
      style={{ 
        '--feature-index': index + 1, 
        animationDelay: `${(index + 1) * 0.15}s`
      }}
    >
      <Icon size={40} aria-hidden="true" />
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
};

// Data constants
const SAFETY_FEATURES = [
  {
    icon: UserCheck,
    title: "Verified Drivers",
    description: "All drivers go through a strict background check."
  },
  {
    icon: PhoneCall,
    title: "24/7 Support",
    description: "Dedicated customer support at any time."
  },
  {
    icon: ShieldCheck,
    title: "Emergency Button",
    description: "Instant SOS feature for security."
  }
];

const STATS = [
  { value: "10M+", label: "Rides Completed" },
  { value: "50K+", label: "Drivers Registered" },
  { value: "100+", label: "Cities Covered" },
  { value: "95%", label: "Customer Satisfaction" }
];

const TESTIMONIALS = [
  { 
    quote: "The service was amazing. My driver was punctual and courteous!", 
    author: "Sarah K." 
  },
  { 
    quote: "As a driver, I love the flexibility Glide Way offers.", 
    author: "John D." 
  },
  { 
    quote: "Glide Way makes commuting so much easier and stress-free!", 
    author: "Emma R." 
  }
];

const FAQS = [
  { 
    question: "How does Glide Way work?", 
    answer: "Glide Way is a ride-sharing platform that connects riders with drivers for convenient travel." 
  },
  { 
    question: "How can I book a ride?", 
    answer: "Simply enter your pickup and drop-off locations, select a ride option, and confirm your booking." 
  },
  { 
    question: "Is Glide Way available in my city?", 
    answer: "We are expanding rapidly! Check our app to see if we operate in your area." 
  },
  { 
    question: "What payment methods do you accept?", 
    answer: "We accept credit/debit cards, UPI, and in-app wallet payments." 
  },
  { 
    question: "Can I schedule a ride in advance?", 
    answer: "Yes! Glide Way allows you to schedule rides up to 7 days in advance." 
  }
];

const FEATURES = [
  {
    icon: Car,
    title: "Quick Ride Booking",
    description: "Book a ride instantly with just a few taps on your phone."
  },
  {
    icon: ShieldCheck,
    title: "Reliable Drivers",
    description: "All our drivers are verified and experienced professionals."
  },
  {
    icon: DollarSign,
    title: "Affordable Pricing",
    description: "Transparent and budget-friendly fares for every ride."
  },
  {
    icon: Smartphone,
    title: "Multiple Ride Options",
    description: "Choose from sedans, SUVs, bikes, and more based on your needs."
  },
  {
    icon: MapPin,
    title: "Real-Time Tracking",
    description: "Track your ride from pickup to drop-off with live updates."
  }
];

const RIDE_OPTIONS = [
  {
    icon: Car,
    title: "Standard",
    description: "Affordable rides for everyday travel."
  },
  {
    icon: Users,
    title: "Pool",
    description: "Share rides and save on costs."
  },
  {
    icon: Briefcase,
    title: "Business",
    description: "Luxury rides for professionals."
  },
  {
    icon: Clock,
    title: "Hourly",
    description: "Rent a car with a driver for multiple stops."
  }
];

const DRIVER_BENEFITS = [
  {
    icon: DollarSign,
    title: "Competitive Earnings",
    description: "Get paid weekly and earn extra through incentives."
  },
  {
    icon: Clock,
    title: "Flexible Hours",
    description: "Drive when and where you want."
  },
  {
    icon: Star,
    title: "Incentives & Rewards",
    description: "Earn bonuses for high ratings and peak-hour driving."
  }
];

const HomePage = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const navigate = useNavigate();
  
  // Initialize scroll animations for elements that don't have individual refs
  useEffect(() => {
    const featureElements = document.querySelectorAll('.feature:not(.safety-feature)');
    const stepElements = document.querySelectorAll('.step');
    
    // Create a single IntersectionObserver
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    
    // Observe feature elements
    featureElements.forEach((el, index) => {
      el.style.setProperty('--card-index', index + 1);
      observer.observe(el);
    });
    
    // Observe step elements
    stepElements.forEach((el, index) => {
      el.style.setProperty('--step-index', index + 1);
      observer.observe(el);
    });
    
    // Cleanup function to unobserve elements
    return () => {
      featureElements.forEach(el => observer.unobserve(el));
      stepElements.forEach(el => observer.unobserve(el));
    };
  }, []);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="homepage">
      <main>
        <section className="hero" aria-labelledby="hero-heading">
          <div className="hero-content">
            <h1 id="hero-heading">Your Ride, Anytime, Anywhere</h1>
            <h2>Safe, Reliable, and Affordable Transport at Your Fingertips</h2>
            <p>With Glide Way, you can book a ride instantly, track your driver in real-time, and travel worry-free with our trusted network of professional drivers.</p>
            <div className="cta-buttons">
              <a href="/book-a-ride" className="cta-button primary">Book a Ride</a>
              <a href="/become-driver" className="cta-button secondary">Become a Driver</a>
            </div>
          </div>
          <div className="hero-image">
            <img 
              src="/assets/pngwing.com (2).png" 
              alt="A car ready for ride-sharing" 
              loading="eager" 
              width="500" 
              height="300" 
            />
          </div>
        </section>

        <section className="features" aria-labelledby="features-heading">
          <h2 id="features-heading">Why Choose Glide Way?</h2>
          <div className="feature-list">
            {FEATURES.map((feature, index) => (
              <FeatureCard 
                key={`feature-${index}`}
                Icon={feature.icon}
                title={feature.title} 
                description={feature.description}
              />
            ))}
          </div>
        </section>

        <section className="ride-options" aria-labelledby="ride-options-heading">
          <h2 id="ride-options-heading">Ride Options for Every Need</h2>
          <div className="feature-list">
            {RIDE_OPTIONS.map((option, index) => (
              <FeatureCard 
                key={`ride-option-${index}`}
                Icon={option.icon}
                title={option.title} 
                description={option.description}
              />
            ))}
          </div>
        </section>

        {/* FIXED: Your Safety is Our Priority Section */}
        <section className="safety-section" aria-labelledby="safety-heading">
          <h2 id="safety-heading">Your Safety is Our Priority</h2>
          <div className="safety-features-grid">
            {SAFETY_FEATURES.map((feature, index) => (
              <SafetyFeature
                key={`safety-${index}`}
                Icon={feature.icon}
                title={feature.title}
                description={feature.description}
                index={index}
              />
            ))}
          </div>
        </section>

        <section className="how-it-works" aria-labelledby="how-it-works-heading">
          <h2 id="how-it-works-heading">How It Works</h2>
          <div className="steps">
            <div className="step">
              <span className="step-number" aria-hidden="true">1</span>
              <p>Download the app and sign up.</p>
            </div>
            <div className="step">
              <span className="step-number" aria-hidden="true">2</span>
              <p>Enter your pickup and drop-off location.</p>
            </div>
            <div className="step">
              <span className="step-number" aria-hidden="true">3</span>
              <p>Choose your ride and confirm your booking.</p>
            </div>
            <div className="step">
              <span className="step-number" aria-hidden="true">4</span>
              <p>Sit back, relax, and enjoy the ride!</p>
            </div>
          </div>
        </section>

        <section className="driver-benefits" aria-labelledby="driver-benefits-heading">
          <h2 id="driver-benefits-heading">Drive with Glide Way</h2>
          <div className="steps">
            {DRIVER_BENEFITS.map((benefit, index) => (
              <div className="step" key={`driver-benefit-${index}`}>
                <benefit.icon size={40} aria-hidden="true" />
                <h3>{benefit.title}</h3>
                <p>{benefit.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FIXED: Our Impact Section */}
        <section className="impact-section" aria-labelledby="impact-heading">
          <h2 id="impact-heading">Our Impact</h2>
          <div className="stats-grid">
            {STATS.map((stat, index) => (
              <AnimatedStat
                key={`stat-${index}`}
                value={stat.value}
                label={stat.label}
                index={index}
              />
            ))}
          </div>
        </section>

        {/* FIXED: What Our Users Say Section */}
        <section className="testimonials-section" aria-labelledby="testimonials-heading">
          <h2 id="testimonials-heading">What Our Users Say</h2>
          <div className="testimonial-list">
            {TESTIMONIALS.map((testimonial, index) => (
              <Testimonial
                key={`testimonial-${index}`}
                quote={testimonial.quote}
                author={testimonial.author}
                index={index}
              />
            ))}
          </div>
        </section>

        {/* FIXED: FAQ Section */}
        <section className="faq-section" aria-labelledby="faq-heading">
          <h2 id="faq-heading">Frequently Asked Questions</h2>
          <div className="faq-list" role="tablist">
            {FAQS.slice(0, 3).map((faq, index) => (
              <FAQItem
                key={`faq-${index}`}
                question={faq.question}
                answer={faq.answer}
                isOpen={openIndex === index}
                onClick={() => toggleFAQ(index)}
              />
            ))}
          </div>
          <button 
            className="view-more-button" 
            onClick={() => navigate('/faq')}
            aria-label="View more frequently asked questions"
          >
            View More
          </button>
        </section>

        <section className="cta-container" aria-labelledby="cta-heading">
          <div className="cta">
            <h2 id="cta-heading">Ready to Glide?</h2>
            <p>Download the app today or sign up as a driver to join the Glide Way family.</p>
            <div className="cta-buttons">
              <a 
                href="https://play.google.com" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Download our app from Google Play Store"
                className="cta-button primary"
              >
                Download the App
              </a>
              <a 
                href="/become-driver"
                className="cta-button secondary"
              >
                Sign Up to Drive
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;