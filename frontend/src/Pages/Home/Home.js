import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Car, Smartphone, MapPin, DollarSign, ShieldCheck, 
  Users, Briefcase, Clock, UserCheck, Star, PhoneCall, 
  ChevronUp, ChevronDown, Navigation, CreditCard, Calendar
} from 'lucide-react';
import './Home.css';

// Base Components
const FadeInElement = ({ children, className, index, threshold = 0.2 }) => {
  const elementRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [threshold]);

  return (
    <div 
      ref={elementRef} 
      className={`hw-fade-element ${isVisible ? 'hw-visible' : ''} ${className || ''}`}
      style={{ 
        '--element-index': index + 1, 
        animationDelay: `${(index + 1) * 0.15}s`
      }}
    >
      {children}
    </div>
  );
};

// Enhanced Feature Card Component
const FeatureCard = ({ Icon, title, description, index, className }) => (
  <FadeInElement className={`hw-feature-card ${className || ''}`} index={index}>
    <div className="hw-feature-card__icon-container">
      <Icon size={40} className="hw-feature-card__icon" aria-hidden="true" />
    </div>
    <h3 className="hw-feature-card__title">{title}</h3>
    <p className="hw-feature-card__description">{description}</p>
  </FadeInElement>
);

// Enhanced FAQ Accordion Component
const FAQItem = ({ question, answer, isOpen, onClick, index }) => (
  <FadeInElement className={`hw-faq-item ${isOpen ? 'hw-faq-item--active' : ''}`} index={index}>
    <button 
      className="hw-faq-item__question" 
      onClick={onClick}
      aria-expanded={isOpen}
      aria-controls={`faq-answer-${index}`}
    >
      <span>{question}</span>
      <span className="hw-faq-item__icon">
        {isOpen ? <ChevronUp aria-hidden="true" /> : <ChevronDown aria-hidden="true" />}
      </span>
    </button>
    <div 
      id={`faq-answer-${index}`}
      className="hw-faq-item__answer"
      aria-hidden={!isOpen}
      style={{ maxHeight: isOpen ? '500px' : '0' }}
    >
      {answer}
    </div>
  </FadeInElement>
);

// Enhanced Stat Counter Component
const AnimatedStat = ({ value, label, index }) => (
  <FadeInElement className="hw-stat-card" index={index}>
    <h3 className="hw-stat-card__value">{value}</h3>
    <p className="hw-stat-card__label">{label}</p>
  </FadeInElement>
);

// Enhanced Testimonial Component
const Testimonial = ({ quote, author, role, index }) => (
  <FadeInElement className="hw-testimonial-card" index={index}>
    <div className="hw-testimonial-card__quote-mark" aria-hidden="true">"</div>
    <p className="hw-testimonial-card__quote">{quote}</p>
    <div className="hw-testimonial-card__author">
      <p className="hw-testimonial-card__author-name">{author}</p>
      {role && <p className="hw-testimonial-card__author-role">{role}</p>}
    </div>
  </FadeInElement>
);

// Step Component
const StepItem = ({ number, title, description, index }) => (
  <FadeInElement className="hw-step-item" index={index}>
    <div className="hw-step-item__number-container">
      <span className="hw-step-item__number" aria-hidden="true">{number}</span>
    </div>
    <div className="hw-step-item__content">
      <h3 className="hw-step-item__title">{title}</h3>
      <p className="hw-step-item__description">{description}</p>
    </div>
  </FadeInElement>
);

// Enhanced Content
const SAFETY_FEATURES = [
  {
    icon: UserCheck,
    title: "Verified Drivers",
    description: "All drivers undergo comprehensive background checks, vehicle inspections, and safety training."
  },
  {
    icon: Navigation,
    title: "Trip Monitoring",
    description: "AI-powered system monitors routes for safety and sends alerts for unusual activity."
  },
  {
    icon: PhoneCall,
    title: "24/7 Support Center",
    description: "Dedicated emergency response team available around the clock for immediate assistance."
  },
  {
    icon: ShieldCheck,
    title: "In-app Safety Tools",
    description: "One-tap emergency button, ride sharing, and trusted contacts features built into every ride."
  }
];

const STATS = [
  { value: "12M+", label: "Rides Completed" },
  { value: "65K+", label: "Drivers Nationwide" },
  { value: "150+", label: "Cities Covered" },
  { value: "97%", label: "Customer Satisfaction" }
];

const TESTIMONIALS = [
  { 
    quote: "Glide Way has transformed my daily commute. The drivers are professional, the cars are clean, and the app is incredibly easy to use.", 
    author: "Shaurabh",
    role: "Daily Commuter" 
  },
  { 
    quote: "As a driver partner, I appreciate the flexibility and fair compensation. The training provided helped me deliver better service.", 
    author: "Aisha Patel",
    role: "Driver Partner, 2 years" 
  },
  { 
    quote: "I travel frequently for business, and Glide Way's consistency across cities makes transportation one less thing to worry about.", 
    author: "Shaurya",
    role: "Business Traveler" 
  },
  
];

const FAQS = [
  { 
    question: "How does Glide Way ensure passenger safety?", 
    answer: "Glide Way implements a multi-layered safety system including thorough driver background checks, real-time trip monitoring, an in-app emergency button, ride details sharing, and 24/7 customer support. All rides are GPS-tracked and insured for additional peace of mind." 
  },
  { 
    question: "What makes Glide Way different from other ride-sharing services?", 
    answer: "Glide Way distinguishes itself through exceptional reliability, transparent pricing with no surge charges, eco-friendly vehicle options, a loyalty rewards program, and a community-focused approach that prioritizes both riders and drivers." 
  },
  { 
    question: "How can I become a Glide Way driver?", 
    answer: "To become a driver, download our Driver app, complete the registration form, submit required documents (driver's license, vehicle registration, insurance), pass our background check, complete our online safety training, and schedule a vehicle inspection. Most applications are processed within 3-5 business days." 
  },
  { 
    question: "What payment methods do you accept?", 
    answer: "We accept all major credit/debit cards, digital wallets (Apple Pay, Google Pay, PayPal), UPI payments, and our in-app GlideWallet for seamless transactions. Business accounts with monthly invoicing are also available." 
  },
  { 
    question: "Can I schedule rides in advance?", 
    answer: "Yes! You can schedule rides up to 7 days in advance. This feature is perfect for airport transfers, important meetings, or any planned travel. You'll receive reminders and live updates when your scheduled ride is approaching." 
  }
];

const FEATURES = [
  {
    icon: Smartphone,
    title: "Seamless Booking Experience",
    description: "Book, track, and pay for rides with our intuitive app designed for speed and convenience."
  },
  {
    icon: ShieldCheck,
    title: "Industry-Leading Safety",
    description: "Travel with confidence thanks to our comprehensive safety features and verified drivers."
  },
  {
    icon: DollarSign,
    title: "Transparent Pricing",
    description: "No surge pricing or hidden fees. Get clear upfront fares before confirming your ride."
  },
  {
    icon: Clock,
    title: "Punctual Pickups",
    description: "Our intelligent dispatch system ensures drivers arrive on time, respecting your schedule."
  },
  {
    icon: MapPin,
    title: "Extensive Coverage",
    description: "Available in 150+ cities nationwide with consistent service quality wherever you go."
  },
  {
    icon: Users,
    title: "Community-Focused",
    description: "Supporting local economies while building a platform that values both riders and drivers."
  }
];

const RIDE_OPTIONS = [
  {
    icon: Car,
    title: "Glide Standard",
    description: "Comfortable sedans for everyday travel with affordability and reliability."
  },
  {
    icon: Users,
    title: "Glide Share",
    description: "Eco-friendly carpooling option that reduces costs and environmental impact."
  },
  {
    icon: Briefcase,
    title: "Glide Executive",
    description: "Premium vehicles with professional drivers for business travel and special occasions."
  },
  {
    icon: Calendar,
    title: "Glide Reserve",
    description: "Pre-scheduled rides with guaranteed availability for important trips."
  }
];

const DRIVER_BENEFITS = [
  {
    icon: DollarSign,
    title: "Maximized Earnings",
    description: "Competitive base rates, consistent bonuses, and transparent payment systems with weekly deposits."
  },
  {
    icon: Clock,
    title: "Work on Your Terms",
    description: "Set your own schedule, choose your service areas, and maintain full flexibility as an independent contractor."
  },
  
  
];

const HOW_IT_WORKS_STEPS = [
  {
    number: "1",
    title: "Download the App",
    description: "Get the Glide Way app from the App Store or Google Play and create your account in minutes."
  },
  {
    number: "2",
    title: "Enter Your Destination",
    description: "Input your pickup location and destination to see available ride options and prices."
  },
  {
    number: "3",
    title: "Choose Your Ride",
    description: "Select from multiple vehicle types based on your needs, preferences, and group size."
  },
  {
    number: "4",
    title: "Track & Ride",
    description: "Watch your driver arrive in real-time, enjoy your journey, and pay seamlessly through the app."
  }
];

const DRIVER_STEPS = [
  {
    number: "1",
    title: "Sign Up",
    description: "Complete our simple online application and verify your identity and driving credentials."
  },
  {
    number: "2",
    title: "Vehicle Approval",
    description: "Submit your vehicle details for verification or explore our vehicle partner programs."
  },
  {
    number: "3",
    title: "Safety Training",
    description: "Complete our online safety certification course and learn platform best practices."
  },
  {
    number: "4",
    title: "Start Earning",
    description: "Activate the driver app, set your availability, and begin accepting ride requests."
  }
];

// Main Component
const HomePage = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const navigate = useNavigate();
  
  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="hw-home">

      {/* Hero Section */}
      <section className="hw-hero" aria-labelledby="hero-heading">

        <div className="hw-container hw-hero__container">
          <div className="hw-hero__content">
            <h1 id="hero-heading" className="hw-hero__title">Your Journey, Reimagined</h1>
            <h2 className="hw-hero__subtitle">Travel Smarter, Safer, and More Sustainably</h2>
            <p className="hw-hero__description">
              Experience transportation that adapts to your lifestyle. With Glide Way's innovative platform, enjoy hassle-free travel with verified drivers, transparent pricing, and industry-leading safety features.
            </p>
            <div className="hw-hero__buttons">
              <a href="/book-a-ride" className="hw-button hw-button--primary">Book Your Ride</a>
              <a href="/become-driver" className="hw-button hw-button--outline">Partner With Us</a>
            </div>
          </div>
          <div className="hw-hero__image-container">
            <img 
              src="/assets/whitetaxi.png" 
              alt="Modern vehicle ready for ride-sharing" 
              loading="eager" 
              className="hw-hero__image"
              width="600" 
              height="400" 
            />
          </div>
        </div>
        <div className="hw-hero__wave" aria-hidden="true"></div>
      </section>

      {/* Core Benefits Section */}
      <section className="hw-features-section" aria-labelledby="features-heading">
        <div className="hw-container">
          <div className="hw-section-header">
            <h2 id="features-heading" className="hw-section-title">Why Riders Choose Glide Way</h2>
            <p className="hw-section-subtitle">Experience the difference with transportation that puts you first</p>
          </div>
          <div className="hw-features-grid">
            {FEATURES.map((feature, index) => (
              <FeatureCard 
                key={`feature-${index}`}
                Icon={feature.icon}
                title={feature.title} 
                description={feature.description}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="hw-process-section" aria-labelledby="process-heading">
        <div className="hw-container">
          <div className="hw-section-header">
            <h2 id="process-heading" className="hw-section-title">How Glide Way Works</h2>
            <p className="hw-section-subtitle">Four simple steps to your perfect ride</p>
          </div>
          <div className="hw-process-steps">
            {HOW_IT_WORKS_STEPS.map((step, index) => (
              <StepItem
                key={`step-${index}`}
                number={step.number}
                title={step.title}
                description={step.description}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Ride Options Section */}
      <section className="hw-options-section" aria-labelledby="options-heading">
        <div className="hw-container">
          <div className="hw-section-header">
            <h2 id="options-heading" className="hw-section-title">Tailored Options For Every Journey</h2>
            <p className="hw-section-subtitle">Choose the perfect ride for any situation</p>
          </div>
          <div className="hw-options-grid">
            {RIDE_OPTIONS.map((option, index) => (
              <FeatureCard 
                key={`ride-option-${index}`}
                Icon={option.icon}
                title={option.title} 
                description={option.description}
                index={index}
                className="hw-option-card"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Safety Section */}
      <section className="hw-safety-section" aria-labelledby="safety-heading">
        <div className="hw-container">
          <div className="hw-section-header hw-section-header--light">
            <h2 id="safety-heading" className="hw-section-title">Safety By Design</h2>
            <p className="hw-section-subtitle">Your security is built into everything we do</p>
          </div>
          <div className="hw-safety-grid">
            {SAFETY_FEATURES.map((feature, index) => (
              <FeatureCard
                key={`safety-${index}`}
                Icon={feature.icon}
                title={feature.title}
                description={feature.description}
                index={index}
                className="hw-safety-card"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="hw-stats-section" aria-labelledby="stats-heading">
        <div className="hw-container">
          <div className="hw-section-header">
            <h2 id="stats-heading" className="hw-section-title">Our Growing Impact</h2>
            <p className="hw-section-subtitle">Numbers that drive our success story</p>
          </div>
          <div className="hw-stats-grid">
            {STATS.map((stat, index) => (
              <AnimatedStat
                key={`stat-${index}`}
                value={stat.value}
                label={stat.label}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="hw-testimonials-section" aria-labelledby="testimonials-heading">
        <div className="hw-container">
          <div className="hw-section-header">
            <h2 id="testimonials-heading" className="hw-section-title">Voices From Our Community</h2>
            <p className="hw-section-subtitle">Discover what makes the Glide Way experience special</p>
          </div>
          <div className="hw-testimonials-grid">
            {TESTIMONIALS.map((testimonial, index) => (
              <Testimonial
                key={`testimonial-${index}`}
                quote={testimonial.quote}
                author={testimonial.author}
                role={testimonial.role}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Driver Benefits Section */}
      <section className="hw-drivers-section" aria-labelledby="drivers-heading">
        <div className="hw-container">
          <div className="hw-section-header">
            <h2 id="drivers-heading" className="hw-section-title">Drive & Thrive With Glide Way</h2>
            <p className="hw-section-subtitle">Partner with us for flexibility, fair earnings, and growth opportunities</p>
          </div>
          <div className="hw-two-column">
            <div className="hw-drivers-benefits">
              {DRIVER_BENEFITS.map((benefit, index) => (
                <FeatureCard
                  key={`driver-benefit-${index}`}
                  Icon={benefit.icon}
                  title={benefit.title}
                  description={benefit.description}
                  index={index}
                  className="hw-benefit-card"
                />
              ))}
            </div>
            <div className="hw-drivers-steps">
              <h3 className="hw-drivers-steps__title">Getting Started Is Easy</h3>
              {DRIVER_STEPS.map((step, index) => (
                <StepItem
                  key={`driver-step-${index}`}
                  number={step.number}
                  title={step.title}
                  description={step.description}
                  index={index}
                />
              ))}
              <a href="/become-driver" className="hw-button hw-button--primary hw-button--full">Apply Now</a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="hw-faq-section" aria-labelledby="faq-heading">
        <div className="hw-container">
          <div className="hw-section-header">
            <h2 id="faq-heading" className="hw-section-title">Questions Answered</h2>
            <p className="hw-section-subtitle">Find the information you need to get started</p>
          </div>
          <div className="hw-faq-container">
            {FAQS.map((faq, index) => (
              <FAQItem
                key={`faq-${index}`}
                question={faq.question}
                answer={faq.answer}
                isOpen={openIndex === index}
                onClick={() => toggleFAQ(index)}
                index={index}
              />
            ))}
            <div className="hw-faq-more">
              <button 
                className="hw-button hw-button--secondary" 
                onClick={() => navigate('/faq')}
                aria-label="View more frequently asked questions"
              >
                View All FAQs
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="hw-cta-section" aria-labelledby="cta-heading">
        <div className="hw-container">
          <div className="hw-cta-card">
            <div className="hw-cta-content">
              <h2 id="cta-heading" className="hw-cta-title">Ready to Transform Your Travel Experience?</h2>
              <p className="hw-cta-description">Join millions of satisfied users who've made Glide Way their transportation partner of choice.</p>
              <div className="hw-cta-buttons">
                <a 
                  href="/signup" 
                  className="hw-button hw-button--primary hw-button--large"
                >
                  Sign Up Now
                </a>
                <a 
                  href="/become-driver"
                  className="hw-button hw-button--outline hw-button--large"
                >
                  Become A Driver Partner
                </a>
              </div>
            </div>
            <div className="hw-cta-stores">
              <a 
                href="https://play.google.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hw-store-badge"
                aria-label="Download our app from Google Play Store"
              >
                <img src="/assets/playstore.png" alt="Get it on Google Play" width="60" height="60" />
              </a>
              <a 
                href="https://apps.apple.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hw-store-badge"
                aria-label="Download our app from Apple App Store"
              >
                <img src="/assets/app-store.png" alt="Download on the App Store" width="60" height="60" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;