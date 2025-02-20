import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Smartphone, MapPin, DollarSign, ShieldCheck, Users, Briefcase, Clock, UserCheck, Star, PhoneCall } from 'lucide-react';
import './Home.css';

const faqs = [
  { question: "How does Glide Way work?", answer: "Glide Way is a ride-sharing platform that connects riders with drivers for convenient travel." },
  { question: "How can I book a ride?", answer: "Simply enter your pickup and drop-off locations, select a ride option, and confirm your booking." },
  { question: "Is Glide Way available in my city?", answer: "We are expanding rapidly! Check our app to see if we operate in your area." },
  { question: "What payment methods do you accept?", answer: "We accept credit/debit cards, UPI, and in-app wallet payments." },
  { question: "Can I schedule a ride in advance?", answer: "Yes! Glide Way allows you to schedule rides up to 7 days in advance." }
];


const HomePage = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const navigate = useNavigate();

  const toggleFAQ = (index) => {
      setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="homepage">
      <section className="hero">
        <div className="hero-content">
          <h1>Your Ride, Anytime, Anywhere</h1>
          <h2>Safe, Reliable, and Affordable Transport at Your Fingertips</h2>
          <p>With Glide Way, you can book a ride instantly, track your driver in real-time, and travel worry-free with our trusted network of professional drivers.</p>
          <div className="cta-buttons">
            <a href="/book-a-ride" className="cta-button primary">Book a Ride</a>
            <a href="/become-driver" className="cta-button secondary">Become a Driver</a>
          </div>
        </div>
        <div className="hero-image">
          <img src="/assets/pngwing.com (2).png" alt="Car view" />
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

      <section className="features">
        <h2>Ride Options for Every Need</h2>
        <div className="feature-list">
          <div className="feature">
            <Car size={40} />
            <h3>Standard</h3>
            <p>Affordable rides for everyday travel.</p>
          </div>
          <div className="feature">
            <Users size={40} />
            <h3>Pool</h3>
            <p>Share rides and save on costs.</p>
          </div>
          <div className="feature">
            <Briefcase size={40} />
            <h3>Business</h3>
            <p>Luxury rides for professionals.</p>
          </div>
          <div className="feature">
            <Clock size={40} />
            <h3>Hourly</h3>
            <p>Rent a car with a driver for multiple stops.</p>
          </div>
        </div>
      </section>

      <section className="stats">
        <h2>Your Safety is Our Priority</h2>
        <div className="stats-grid">
          <div className="stat">
            <UserCheck size={40} />
            <h3>Verified Drivers</h3>
            <p>All drivers go through a strict background check.</p>
          </div>
          <div className="stat">
            <PhoneCall size={40} />
            <h3>24/7 Support</h3>
            <p>Dedicated customer support at any time.</p>
          </div>
          <div className="stat">
            <ShieldCheck size={40} />
            <h3>Emergency Button</h3>
            <p>Instant SOS feature for security.</p>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step"><span className="step-number">1</span><p>Download the app and sign up.</p></div>
          <div className="step"><span className="step-number">2</span><p>Enter your pickup and drop-off location.</p></div>
          <div className="step"><span className="step-number">3</span><p>Choose your ride and confirm your booking.</p></div>
          <div className="step"><span className="step-number">4</span><p>Sit back, relax, and enjoy the ride!</p></div>
        </div>
      </section>

      <section className="how-it-works">
        <h2>Drive with Glide Way</h2>
        <div><br /></div>
        <div className="steps">
          <div className="step">
            <DollarSign size={40} />
            <h3>Competitive Earnings</h3>
            <p>Get paid weekly and earn extra through incentives.</p>
          </div>
          <div className="step">
            <Clock size={40} />
            <h3>Flexible Hours</h3>
            <p>Drive when and where you want.</p>
          </div>
          <div className="step">
            <Star size={40} />
            <h3>Incentives & Rewards</h3>
            <p>Earn bonuses for high ratings and peak-hour driving.</p>
          </div>
        </div>
      </section>

      <section className="stats">
        <h2>Our Impact</h2>
        <div className="stats-grid">
          <div className="stat"><h3>10M+</h3><p>Rides Completed</p></div>
          <div className="stat"><h3>50K+</h3><p>Drivers Registered</p></div>
          <div className="stat"><h3>100+</h3><p>Cities Covered</p></div>
          <div className="stat"><h3>95%</h3><p>Customer Satisfaction</p></div>
        </div>
      </section>

      <section className="testimonials">
        <h2>What Our Users Say</h2>
        <div className="testimonial-list">
          <div className="testimonial"><p>"The service was amazing. My driver was punctual and courteous!"</p><span>- Sarah K.</span></div>
          <div className="testimonial"><p>"As a driver, I love the flexibility Glide Way offers."</p><span>- John D.</span></div>
          <div className="testimonial"><p>"Glide Way makes commuting so much easier and stress-free!"</p><span>- Emma R.</span></div>
        </div>
      </section>

      <div className="faq-section2">
            <h2>Frequently Asked Questions</h2>
            <div className="faq-list">
                {faqs.slice(0, 3).map((faq, index) => (
                    <div key={index} className="faq-item" onClick={() => toggleFAQ(index)}>
                        <h3>{faq.question} <span>{openIndex === index ? '▲' : '▼'}</span></h3>
                        {openIndex === index && <p className="faq-answer">{faq.answer}</p>}
                    </div>
                ))}
            </div>
            <button className="view-more-button" onClick={() => navigate('/faq')}>View More</button>
        </div>


      <div className="ctacontaner">
        <section className="cta">
          <h2>Ready to Glide?</h2>
          <p>Download the app today or sign up as a driver to join the Glide Way family.</p>
          <div className="cta-buttons">
            <button className="cta-button primary">Download the App</button>
            <button className="cta-button secondary">Sign Up to Drive</button>
          </div>
        </section>
      </div>

      <footer className="footer">
        <p>© 2025 Glide Way. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;
