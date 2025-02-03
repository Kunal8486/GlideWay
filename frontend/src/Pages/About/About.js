import React from "react";
import "./About.css";

const AboutPage = () => {
  return (
    <div className="about-container">
      <h1>About Glide Way</h1>

      <section className="section mission">
        <h2>Mission Statement</h2>
        <p>
          "We aim to make commuting fast, easy, and accessible for everyone by bridging the gap between riders and drivers. At Glide Way, we believe that transportation should be a seamless experience, connecting people to their destinations with ease and reliability."
        </p>
      </section>

      <section className="section story">
        <h2>Story/Background</h2>
        <p>
          "Founded in 2025, Glide Way was created to solve the daily transportation challenges faced by millions. Our journey began with a simple idea: to revolutionize how people move by offering affordable, reliable, and efficient rides. Today, we are proud to serve communities across the globe, making transportation smarter and more sustainable."
        </p>
        <p>
          "Our founders, John Doe and Jane Smith, were inspired by their own struggles with urban mobility. They envisioned a platform that not only connects riders and drivers but also empowers individuals to take control of their daily commutes. With cutting-edge technology and a customer-first approach, Glide Way has become a trusted name in the transportation industry."
        </p>
      </section>

      <section className="section what-we-do">
        <h2>What We Do</h2>
        <ul>
          <li>We connect riders with reliable drivers to make transportation seamless and stress-free.</li>
          <li>Our platform empowers drivers to earn flexibly while providing top-notch service to riders.</li>
          <li>We offer a range of ride options, from solo trips to carpooling, ensuring there's something for everyone.</li>
          <li>Our app is designed with user convenience in mind, featuring real-time tracking, fare estimates, and easy payment options.</li>
        </ul>
      </section>

      <section className="section why-choose">
        <h2>Why Choose Us?</h2>
        <ul>
          <li><strong>Safety first:</strong> Verified drivers, 24/7 support, and in-app safety features like emergency buttons and ride sharing with trusted contacts.</li>
          <li><strong>Affordable pricing:</strong> Transparent fares with no hidden charges. We believe in fair pricing for both riders and drivers.</li>
          <li><strong>Ride variety:</strong> Choose from a variety of ride options, including eco-friendly electric vehicles (EVs) and luxury cars.</li>
          <li><strong>Eco-conscious:</strong> We are committed to reducing our carbon footprint through initiatives like carpooling and promoting the use of electric vehicles.</li>
          <li><strong>Customer satisfaction:</strong> Our dedicated support team is always ready to assist you, ensuring a smooth and enjoyable experience.</li>
        </ul>
      </section>

      <section className="section team">
        <h2>Meet the Team</h2>
        <p className="team-description">
          We are a group of passionate students from Bennett University, driven by innovation and a shared vision to revolutionize transportation with Glide Way. Meet the minds behind the mission!
        </p>
        <div className="team-members">
          <div className="team-member">
            <img src="kunal_kumar.jpg" alt="Kunal Kumar - Visionary Leader" />
            <h3>Kunal Kumar</h3>
            <p className="role">Visionary Leader & Co-Founder</p>
            <p>
              Kunal is the driving force behind Glide Way's innovative solutions. With a knack for strategic planning and a passion for technology, he ensures that Glide Way stays ahead of the curve in urban mobility.
            </p>
          </div>
          <div className="team-member">
            <img src="nirupam_kashyam.jpg" alt="Nirupam Kashyam - Tech Innovator" />
            <h3>Nirupam Kashyam</h3>
            <p className="role">Tech Innovator & Co-Founder</p>
            <p>
              Nirupam is the brains behind Glide Way's cutting-edge technology. His expertise in software development and problem-solving has been instrumental in building a seamless and user-friendly platform.
            </p>
          </div>
          <div className="team-member">
            <img src="satwik_kjs.jpg" alt="K.J.S Satwik - Creative Strategist" />
            <h3>K.J.S Satwik</h3>
            <p className="role">Creative Strategist & Co-Founder</p>
            <p>
              Satwik brings creativity and innovation to Glide Way. From designing intuitive user experiences to crafting impactful marketing strategies, he ensures that Glide Way stands out in the competitive market.
            </p>
          </div>
        </div>
      </section>

      <section className="section achievements">
        <h2>Achievements/Milestones</h2>
        <div className="milestones">
          <div className="milestone">
            <h3>1000+</h3>
            <p>Rides Completed</p>
          </div>
          <div className="milestone">
            <h3>5+</h3>
            <p>Active Cities</p>
          </div>
          <div className="milestone">
            <h3>5000+</h3>
            <p>Satisfied Riders & Drivers</p>
          </div>
          <div className="milestone">
            <h3>3+</h3>
            <p>Team Members</p>
          </div>
          <div className="milestone">
            <h3>2+</h3>
            <p>Industry Awards</p>
          </div>
        </div>
      </section>

      <section className="section contact">
        <h2>Contact Information</h2>
        <p>Email: support@glideway.com</p>
        <p>Phone: +91 8092668486 </p>
        <p>Office Address: Bennett University, India</p>
        <div className="quick-links">
          <a href="/">Home</a> | <a href="/services">Services</a> | <a href="/faq">FAQ</a> | <a href="/privacy">Privacy Policy</a>
        </div>
        <div className="social-links">
          <a href="https://facebook.com">Facebook</a> | <a href="https://twitter.com">Twitter</a> | <a href="https://linkedin.com">LinkedIn</a> | <a href="https://instagram.com">Instagram</a>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;