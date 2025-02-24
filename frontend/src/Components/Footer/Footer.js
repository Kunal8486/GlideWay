import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="wave-decoration">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="#F5EBE0" fillOpacity="1" d="M0,128L60,138.7C120,149,240,171,360,176C480,181,600,171,720,144C840,117,960,75,1080,64C1200,53,1320,75,1380,85.3L1440,96L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
        </svg>
      </div>
      
      <div className="footer-content">
        {/* Logo and Main Content */}
        <div className="footer-main">
          <div className="brand-container">
          <img src='/assets/Logo.png' width={220} height="auto" alt="Logo" />
          {/* <h2 className="footer-logo">GlideWay</h2> */}
            <div className="tagline-container">
              <p className="footer-tagline">Elevating the future of transportation</p>
              <div className="tagline-underline"></div>
            </div>
          </div>
          
          <div className="footer-nav-wrapper">
            <div className="footer-nav-group">
              <h3 className="nav-heading">Explore</h3>
              <ul className="diagonal-nav">
                <li><a href="#">Home</a></li>
                <li><a href="#">About Us</a></li>
                <li><a href="#">Solutions</a></li>
                <li><a href="#">Projects</a></li>
                <li><a href="#">News</a></li>
              </ul>
            </div>
            
            <div className="footer-nav-group">
              <h3 className="nav-heading">Services</h3>
              <ul className="diagonal-nav">
                <li><a href="#">Urban Planning</a></li>
                <li><a href="#">System Design</a></li>
                <li><a href="#">Implementation</a></li>
                <li><a href="#">Maintenance</a></li>
                <li><a href="#">Consulting</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="contact-social-container">
          <div className="contact-wrapper">
            <h3 className="contact-heading">Get in touch</h3>
            <div className="contact-info">
              <div className="contact-item">
                <i className="icon-map-pin"></i>
                <span>123 Transit Way, Innovation District, CA 90210</span>
              </div>
              <div className="contact-item">
                <i className="icon-phone"></i>
                <a href="tel:+918092668486">+91 80926-68486</a>
              </div>
              <div className="contact-item">
                <i className="icon-mail"></i>
                <a href="mailto:info@glideway.com">info@glideway.com</a>
              </div>
            </div>
          </div>
          
          <div className="newsletter-subscribe">
            <h3>Stay Connected</h3>
            <p>Subscribe to our newsletter for updates</p>
            <form className="newsletter-form">
              <input type="email" placeholder="Your email address" required />
              <button type="submit">Subscribe</button>
            </form>
          </div>
          
          <div className="social-container">
            <div className="social-links">
              <a href="https://facebook.com/glideway" target='_blank' className="social-link" aria-label="Facebook">
                <i className="icon-facebook"></i>
              </a>
              <a href="http://x.com/glideway" target='_blank' className="social-link" aria-label="Twitter">
                <i className="icon-twitter"></i>
              </a>
              <a href="https://instagram.com/glideway" target='_blank' className="social-link" aria-label="Instagram">
                <i className="icon-instagram"></i>
              </a>
              <a href="https://linkedin.com/in/glideway" target='_blank' className="social-link" aria-label="LinkedIn">
                <i className="icon-linkedin"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="copyright">
          <p>© {new Date().getFullYear()} GlideWay. All rights reserved.</p>
        </div>
        <div className="legal-links">
          <a href="/privacy-policy">Privacy Policy</a>
          <span className="divider">•</span>
          <a href="terms-of-service">Terms of Service</a>
          <span className="divider">•</span>
          <a href="cookies-policy">Cookie Policy</a>
          <span className="divider">•</span>
          <a href="payment-policy">Payment Policy</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;