import React from "react";
import "./About.css";

const AboutPage = () => {
  return (
    <div className="about-container">
      <div className="about-header">
        <div className="header-design">
          <span className="circle"></span>
          <span className="line"></span>
          <span className="square"></span>
        </div>
        <h1>About Us</h1>
        <p className="tagline">Revolutionizing urban mobility, one ride at a time</p>
        <div className="header-design reversed">
          <span className="square"></span>
          <span className="line"></span>
          <span className="circle"></span>
        </div>
      </div>

      <section className="section mission">
        <div className="section-design">
          <span className="dot dot1"></span>
          <span className="dot dot2"></span>
          <span className="dot dot3"></span>
        </div>
        <div className="section-content">
          <h2>Our Mission</h2>
          <p>
            We aim to make commuting fast, easy, and accessible for everyone by bridging the gap between riders and drivers. At Glide Way, we believe that transportation should be a seamless experience, connecting people to their destinations with ease and reliability.
          </p>
        </div>
      </section>

      <section className="section story">
        <div className="section-design">
          <span className="dot dot1"></span>
          <span className="dot dot2"></span>
          <span className="dot dot3"></span>
        </div>
        <div className="section-content">
          <h2>Our Story</h2>
          <p>
            Founded in 2025, Glide Way was created to solve the daily transportation challenges faced by millions. Our journey began with a simple idea: to revolutionize how people move by offering affordable, reliable, and efficient rides. Today, we are proud to serve communities across the globe, making transportation smarter and more sustainable.
          </p>
          <p>
            Our founders, from Bennett University, were inspired by their own struggles with urban mobility. They envisioned a platform that not only connects riders and drivers but also empowers individuals to take control of their daily commutes. With cutting-edge technology and a customer-first approach, Glide Way has become a trusted name in the transportation industry.
          </p>
        </div>
      </section>

      <section className="section what-we-do">
        <div className="section-design">
          <span className="dot dot1"></span>
          <span className="dot dot2"></span>
          <span className="dot dot3"></span>
        </div>
        <div className="section-content">
          <h2>What We Do</h2>
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">
                <i className="material-icons">people</i>
              </div>
              <h3>Connect</h3>
              <p>We connect riders with reliable drivers to make transportation seamless and stress-free.</p>
            </div>
            <div className="service-card">
              <div className="service-icon">
                <i className="material-icons">trending_up</i>
              </div>
              <h3>Empower</h3>
              <p>Our platform empowers drivers to earn flexibly while providing top-notch service to riders.</p>
            </div>
            <div className="service-card">
              <div className="service-icon">
                <i className="material-icons">select_all</i>
              </div>
              <h3>Diversify</h3>
              <p>We offer a range of ride options, from solo trips to carpooling, ensuring there's something for everyone.</p>
            </div>
            <div className="service-card">
              <div className="service-icon">
                <i className="material-icons">lightbulb</i>
              </div>
              <h3>Innovate</h3>
              <p>Our app is designed with user convenience in mind, featuring real-time tracking, fare estimates, and easy payment options.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section why-choose">
        <div className="section-design">
          <span className="dot dot1"></span>
          <span className="dot dot2"></span>
          <span className="dot dot3"></span>
        </div>
        <div className="section-content">
          <h2>Why Choose Glide Way?</h2>
          <div className="features-container">
            <div className="feature_about">
              <div className="feature_about-icon">
                <i className="material-icons">security</i>
              </div>
              <div className="feature_about-text">
                <h3>Safety First</h3>
                <p>Verified drivers, 24/7 support, and in-app safety features like emergency buttons and ride sharing with trusted contacts.</p>
              </div>
            </div>
            <div className="feature_about">
              <div className="feature_about-icon">
                <i className="material-icons">payments</i>
              </div>
              <div className="feature_about-text">
                <h3>Affordable Pricing</h3>
                <p>Transparent fares with no hidden charges. We believe in fair pricing for both riders and drivers.</p>
              </div>
            </div>
            <div className="feature_about">
              <div className="feature_about-icon">
                <i className="material-icons">grid_view</i>
              </div>
              <div className="feature_about-text">
                <h3>Ride Variety</h3>
                <p>Choose from a variety of ride options, including eco-friendly electric vehicles (EVs) and luxury cars.</p>
              </div>
            </div>
            <div className="feature_about">
              <div className="feature_about-icon">
                <i className="material-icons">eco</i>
              </div>
              <div className="feature_about-text">
                <h3>Eco-Conscious</h3>
                <p>We are committed to reducing our carbon footprint through initiatives like carpooling and promoting the use of electric vehicles.</p>
              </div>
            </div>
            <div className="feature_about">
              <div className="feature_about-icon">
                <i className="material-icons">support_agent</i>
              </div>
              <div className="feature_about-text">
                <h3>Customer Satisfaction</h3>
                <p>Our dedicated support team is always ready to assist you, ensuring a smooth and enjoyable experience.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section team">
        <div className="section-design">
          <span className="dot dot1"></span>
          <span className="dot dot2"></span>
          <span className="dot dot3"></span>
        </div>
        <div className="section-content">
          <h2>Meet Our Team</h2>
          <p className="team-description">
            We are a group of passionate students from Bennett University, driven by innovation and a shared vision to revolutionize transportation with Glide Way. Meet the minds behind the mission!
          </p>
          <div className="team-members">
            <div className="team-member">
              <div className="member-photo">
                <img src="/assets/Inovators/Kunal.png" alt="Kunal Kumar - Visionary Leader" />
                <div className="photo-overlay">
                  <div className="social-links">
                    <a href="https://wa.link/w37l5q" target="_blank" className="social"><i className="fa-brands fa-whatsapp"></i></a>
                    <a href="https://kunalkumar.co.in/" target="_blank" className="social"><i className="material-icons">language</i></a>
                    <a href="https://www.linkedin.com/in/kunalkumar8486/" target="_blank" className="social"><i className="fa-brands fa-linkedin"></i></a>
                  </div>
                </div>
              </div>
              <div className="member-info">
                <h3>Kunal Kumar</h3>
                <p className="role">Visionary Leader & Co-Founder</p>
                <p className="bio">
                  Kunal is the driving force behind Glide Way's innovative solutions. With a knack for strategic planning and a passion for technology, he ensures that Glide Way stays ahead of the curve in urban mobility.
                </p>
              </div>
            </div>

            <div className="team-member">
              <div className="member-photo">
                <img src="/assets/Inovators/Nirupam.jpeg" alt="Nirupam Kashyam - Tech Innovator" />
                <div className="photo-overlay">
                  <div className="social-links">
                    <a href="https://wa.link/2u09fh" target="_blank" className="social"><i className="fa-brands fa-whatsapp"></i></a>
                    <a href="https://discordapp.com/users/657624711009665032" target="_blank" className="social"><i className="fa-brands fa-discord"></i></a>
                    <a href="https://www.linkedin.com/in/nirupam-kashyap-742321301/" target="_blank" className="social"><i className="fa-brands fa-linkedin"></i></a>

                  </div>
                </div>
              </div>
              <div className="member-info">
                <h3>Nirupam Kashyam</h3>
                <p className="role">Tech Innovator & Co-Founder</p>
                <p className="bio">
                  Nirupam is the brains behind Glide Way's cutting-edge technology. His expertise in software development and problem-solving has been instrumental in building a seamless and user-friendly platform.
                </p>
              </div>
            </div>

            <div className="team-member">
              <div className="member-photo">
                <img src="/assets/Inovators/Satwik.jpg" alt="K.J.S Satwik - Creative Strategist" />
                <div className="photo-overlay">
                  <div className="social-links">
                    <a href="https://wa.link/bjkd6a" target="_blank" className="social"><i className="fa-brands fa-whatsapp"></i></a>
                    <a href="https://www.instagram.com/kjs_sathwik/" target="_blank" className="social"><i className="fa-brands fa-instagram"></i></a>
                    <a href="https://www.linkedin.com/in/sathwik-konakalla-1b6bbb326/" target="_blank" className="social"><i className="fa-brands fa-linkedin"></i></a>
                  </div>
                </div>
              </div>
              <div className="member-info">
                <h3>K.J.S Satwik</h3>
                <p className="role">Creative Strategist & Co-Founder</p>
                <p className="bio">
                  Satwik brings creativity and innovation to Glide Way. From designing intuitive user experiences to crafting impactful marketing strategies, he ensures that Glide Way stands out in the competitive market.
                </p>
              </div>
            </div>

            <div className="team-member">
              <div className="member-photo">
                <img src="/assets/Inovators/Aaryan.jpg" alt="Aaryan Goyal - Business Developer" />
                <div className="photo-overlay">
                <div className="social-links">
                    <a href="https://wa.link/ppelbn" target="_blank" className="social"><i className="fa-brands fa-whatsapp"></i></a>
                    <a href="https://www.instagram.com/_.aaryan25/" target="_blank" className="social"><i className="fa-brands fa-instagram"></i></a>
                    <a href="https://www.linkedin.com/in/aaryan-goyal-8722312bb/" target="_blank" className="social"><i className="fa-brands fa-linkedin"></i></a>
                  </div>
                </div>
              </div>
              <div className="member-info">
                <h3>Aaryan Goyal</h3>
                <p className="role">Business Developer & Co-Founder</p>
                <p className="bio">
                  Aaryan drives Glide Way's business strategy and growth initiatives. With a strong understanding of market dynamics and customer needs, he helps shape the company's direction and forge valuable partnerships for sustainable expansion.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section achievements">
        <div className="section-design">
          <span className="dot dot1"></span>
          <span className="dot dot2"></span>
          <span className="dot dot3"></span>
        </div>
        <div className="section-content">
          <h2>Our Achievements</h2>
          <div className="milestones">
            <div className="milestone">
              <div className="milestone-number">
                <span>1000</span>
                <sup>+</sup>
              </div>
              <div className="milestone-label">Rides Completed</div>
            </div>
            <div className="milestone">
              <div className="milestone-number">
                <span>5</span>
                <sup>+</sup>
              </div>
              <div className="milestone-label">Active Cities</div>
            </div>
            <div className="milestone">
              <div className="milestone-number">
                <span>5000</span>
                <sup>+</sup>
              </div>
              <div className="milestone-label">Satisfied Users</div>
            </div>
            <div className="milestone">
              <div className="milestone-number">
                <span>4</span>
                <sup>+</sup>
              </div>
              <div className="milestone-label">Team Members</div>
            </div>
            <div className="milestone">
              <div className="milestone-number">
                <span>2</span>
                <sup>+</sup>
              </div>
              <div className="milestone-label">Industry Awards</div>
            </div>
          </div>
        </div>
      </section>

      <section className="join-us">
        <div className="join-content">
          <h2>Join the Glide Way Journey</h2>
          <p>Whether you're looking for a ride or wanting to earn as a driver, Glide Way is here for you.</p>
          <div className="cta-buttons">
            <a href="/signup" className="cta-button rider">Become a Rider</a>
            <a href="/become-driver" className="cta-button driver">Become a Driver</a>
          </div>
        </div>
        <div className="join-design">
          <div className="wave-top"></div>
          <div className="wave-bottom"></div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;