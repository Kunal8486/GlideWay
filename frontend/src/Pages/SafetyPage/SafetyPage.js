import React, { useState } from 'react';
import { Shield, Bell, MapPin, Activity, MessageCircle } from 'lucide-react';
import { 
  faShield, 
  faMobileAlt, 
  faLock, 
  faStar, 
  faMapMarkerAlt, 
  faExclamationTriangle, 
  faMagnifyingGlass, 
  faBell, 
  faUserCheck,
  faShareAlt,
  faEye,
  faCarSide,
  faThumbsUp,
  faComments,
  faHeadset,
  faUserShield,
  faAmbulance,
  faFileAlt,
  faHistory,
  faMicrophone,
  faPhone,
  faExternalLinkAlt,
  faEdit,
  faQuoteLeft,
  faQuoteRight,
  faUser,
  faChevronLeft,
  faChevronRight,
  faQuestionCircle,
  faIdCard,
  faRandom,
  faLightbulb,
  faEnvelope,
  faCheck,
  faTimes,
  faUserFriends,
  faPaw,
  faClock,
  faMicrophoneAlt,
  faShieldAlt,
  faHandshake,
  faCodeBranch,
  faUsers,
  faAward,
  faBinoculars
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './Safety.css';

const Safety = () => {
    const [activeTab, setActiveTab] = useState('personal');
    const [showEmergencyModal, setShowEmergencyModal] = useState(false);
    
    const toggleTab = (tab) => {
        setActiveTab(tab);
    };

    const toggleEmergencyModal = () => {
        setShowEmergencyModal(!showEmergencyModal);
    };

    return (
        <div className="sf-safety-container">
            <section className="sf-safety-hero">
                <div className="sf-hero-content">
                    <h1>Safety First at GlideWay</h1>
                    <p>Your security and peace of mind are our top priorities</p>
                    <button className="sf-emergency-btn" onClick={toggleEmergencyModal}>
                        <FontAwesomeIcon icon={faAmbulance} /> Emergency Assistance
                    </button>
                </div>
                    <img src="https://static.vecteezy.com/system/resources/previews/005/238/734/non_2x/taxi-travelers-rate-the-taxi-service-a-3-star-rating-free-vector.jpg" className='sf-hero-image-final' alt="Safety at GlideWay" />
            </section>

            {showEmergencyModal && (
                <div className="sf-emergency-modal">
                    <div className="sf-modal-content">
                        <h2><FontAwesomeIcon icon={faExclamationTriangle} /> Emergency Services</h2>
                        <p>How can we assist you?</p>
                        <div className="sf-emergency-options">
                            <button className="sf-emergency-option"><FontAwesomeIcon icon={faHeadset} /> Contact Support</button>
                            <button className="sf-emergency-option"><FontAwesomeIcon icon={faAmbulance} /> Call 911</button>
                            <button className="sf-emergency-option"><FontAwesomeIcon icon={faFileAlt} /> Report Incident</button>
                            <button className="sf-emergency-option"><FontAwesomeIcon icon={faShareAlt} /> Share Location</button>
                        </div>
                        <button className="sf-close-modal" onClick={toggleEmergencyModal}>Close</button>
                    </div>
                </div>
            )}

            <section className="sf-safety-overview">
                <h2>How We Prioritize Your Safety</h2>
                <div className="sf-overview-stats">
                    <div className="sf-stat-item">
                        <div className="sf-stat-number">24/7</div>
                        <div className="sf-stat-label">Support Available</div>
                    </div>
                    <div className="sf-stat-item">
                        <div className="sf-stat-number">100%</div>
                        <div className="sf-stat-label">Driver Verification</div>
                    </div>
                    <div className="sf-stat-item">
                        <div className="sf-stat-number">5M+</div>
                        <div className="sf-stat-label">Safe Rides Daily</div>
                    </div>
                </div>
            </section>

            <section className="sf-safety-features">
                <h2>Our Comprehensive Safety System</h2>
                <p className="sf-section-intro">We've built GlideWay with safety at its core. Our multi-layered approach protects you before, during, and after every ride.</p>
                
                <div className="sf-safety-grid">
                    <div className="sf-safety-card">
                        <div className="sf-safety-icon">
                            <FontAwesomeIcon icon={faUserCheck} />
                        </div>
                        <h3>Rider Verification</h3>
                        <p>All GlideWay users undergo thorough identity verification before joining our platform. We use advanced biometric technology to ensure authenticity.</p>
                    </div>

                    <div className="sf-safety-card">
                        <div className="sf-safety-icon">
                            <FontAwesomeIcon icon={faMobileAlt} />
                        </div>
                        <h3>Trip Monitoring</h3>
                        <p>Our system actively monitors all rides and detects unusual activity or route deviations. AI technology flags potential issues in real-time.</p>
                    </div>

                    <div className="sf-safety-card">
                        <div className="sf-safety-icon">
                            <FontAwesomeIcon icon={faLock} />
                        </div>
                        <h3>Data Protection</h3>
                        <p>Your personal information is encrypted and secured with industry-leading protocols. We never share your data with third parties without consent.</p>
                    </div>

                    <div className="sf-safety-card">
                        <div className="sf-safety-icon">
                            <FontAwesomeIcon icon={faStar} />
                        </div>
                        <h3>Rating System</h3>
                        <p>Our transparent rating system ensures only trusted drivers and riders use the platform. Users with consistently low ratings are removed.</p>
                    </div>
                    
                    <div className="sf-safety-card">
                        <div className="sf-safety-icon">
                            <FontAwesomeIcon icon={faMapMarkerAlt} />
                        </div>
                        <h3>Real-time Location Sharing</h3>
                        <p>Share your exact location with trusted contacts for the duration of your ride. They can follow your journey in real-time.</p>
                    </div>
                    
                    <div className="sf-safety-card">
                        <div className="sf-safety-icon">
                            <FontAwesomeIcon icon={faExclamationTriangle} />
                        </div>
                        <h3>One-tap Emergency</h3>
                        <p>Our prominent SOS button connects you instantly with emergency services and our support team when needed.</p>
                    </div>

                    <div className="sf-safety-card">
                        <div className="sf-safety-icon">
                            <FontAwesomeIcon icon={faMagnifyingGlass} />
                        </div>
                        <h3>Incident Investigation</h3>
                        <p>Our dedicated safety team thoroughly investigates all reported incidents within 24 hours to ensure appropriate action.</p>
                    </div>

                    <div className="sf-safety-card">
                        <div className="sf-safety-icon">
                            <FontAwesomeIcon icon={faBell} />
                        </div>
                        <h3>Safety Check Notifications</h3>
                        <p>Receive automatic check-in prompts during longer rides to confirm everything is proceeding safely.</p>
                    </div>
                </div>
            </section>

            <section className="sf-safety-process">
                <h2>Your Safety Journey with GlideWay</h2>
                <div className="sf-process-steps">
                    <div className="sf-process-step">
                        <div className="sf-step-number">1</div>
                        <h3>Before Your Ride</h3>
                        <ul className="sf-process-list">
                            <li><FontAwesomeIcon icon={faUserShield} /> All drivers undergo background checks</li>
                            <li><FontAwesomeIcon icon={faCarSide} /> Vehicle safety inspections required</li>
                            <li><FontAwesomeIcon icon={faUserCheck} /> Driver identity verification with each login</li>
                        </ul>
                    </div>
                    <div className="sf-process-step">
                        <div className="sf-step-number">2</div>
                        <h3>Requesting a Ride</h3>
                        <ul className="sf-process-list">
                            <li><FontAwesomeIcon icon={faUserShield} /> Driver details provided upfront</li>
                            <li><FontAwesomeIcon icon={faComments} /> Anonymous contact system</li>
                            <li><FontAwesomeIcon icon={faShareAlt} /> Ability to share ride details with contacts</li>
                        </ul>
                    </div>
                    <div className="sf-process-step">
                        <div className="sf-step-number">3</div>
                        <h3>During Your Journey</h3>
                        <ul className="sf-process-list">
                            <li><FontAwesomeIcon icon={faMapMarkerAlt} /> Real-time route monitoring</li>
                            <li><FontAwesomeIcon icon={faBell} /> Unexpected stop alerts</li>
                            <li><FontAwesomeIcon icon={faExclamationTriangle} /> In-app emergency assistance</li>
                        </ul>
                    </div>
                    <div className="sf-process-step">
                        <div className="sf-step-number">4</div>
                        <h3>After Your Arrival</h3>
                        <ul className="sf-process-list">
                            <li><FontAwesomeIcon icon={faStar} /> Two-way rating system</li>
                            <li><FontAwesomeIcon icon={faThumbsUp} /> Safety feedback options</li>
                            <li><FontAwesomeIcon icon={faFileAlt} /> Journey history with details</li>
                        </ul>
                    </div>
                </div>
            </section>

            <section className="sf-safety-tabs">
                <h2>Safety For Everyone</h2>
                <div className="sf-tabs-navigation">
                    <button 
                        className={activeTab === 'personal' ? 'sf-tab-btn sf-active' : 'sf-tab-btn'}
                        onClick={() => toggleTab('personal')}
                    >
                        <FontAwesomeIcon icon={faShield} />
                        Personal Safety
                    </button>
                    <button 
                        className={activeTab === 'community' ? 'sf-tab-btn sf-active' : 'sf-tab-btn'}
                        onClick={() => toggleTab('community')}
                    >
                        <FontAwesomeIcon icon={faComments} />
                        Community Safety
                    </button>
                    <button 
                        className={activeTab === 'covid' ? 'sf-tab-btn sf-active' : 'sf-tab-btn'}
                        onClick={() => toggleTab('covid')}
                    >
                        <FontAwesomeIcon icon={faUserShield} />
                        Health Protection
                    </button>
                    <button 
                        className={activeTab === 'accessibility' ? 'sf-tab-btn sf-active' : 'sf-tab-btn'}
                        onClick={() => toggleTab('accessibility')}
                    >
                        <FontAwesomeIcon icon={faBell} />
                        Accessibility Features
                    </button>
                </div>
                
                <div className="sf-tab-content">
                    {activeTab === 'personal' && (
                        <div className="sf-tab-panel">
                            <h3>Your Personal Safety Matters</h3>
                            <p>We've implemented multiple features to ensure your personal safety during every ride.</p>
                            <ul className="sf-safety-list">
                                <li><FontAwesomeIcon icon={faComments} /> Anonymous contact system between riders and drivers</li>
                                <li><FontAwesomeIcon icon={faUserShield} /> Background checks for all drivers</li>
                                <li><FontAwesomeIcon icon={faUserCheck} /> Photo verification before ride acceptance</li>
                                <li><FontAwesomeIcon icon={faMapMarkerAlt} /> Driver route monitoring for unexpected detours</li>
                                <li><FontAwesomeIcon icon={faCarSide} /> Automated speeding and driving behavior detection</li>
                                <li><FontAwesomeIcon icon={faLock} /> PIN verification option for added security</li>
                                <li><FontAwesomeIcon icon={faMobileAlt} /> Audio recording option for trips (with consent)</li>
                            </ul>
                        </div>
                    )}
                    
                    {activeTab === 'community' && (
                        <div className="sf-tab-panel">
                            <h3>Building Safer Communities</h3>
                            <p>GlideWay is committed to making transportation safer for everyone.</p>
                            <ul className="sf-safety-list">
                                <li><FontAwesomeIcon icon={faUserShield} /> Regular driver safety training and certification</li>
                                <li><FontAwesomeIcon icon={faFileAlt} /> Community reporting system for unsafe areas</li>
                                <li><FontAwesomeIcon icon={faShield} /> Partnerships with local law enforcement</li>
                                <li><FontAwesomeIcon icon={faLock} /> Enhanced security in high-risk zones</li>
                                <li><FontAwesomeIcon icon={faFileAlt} /> Annual safety reports and transparency initiatives</li>
                                <li><FontAwesomeIcon icon={faUserShield} /> Safety ambassador program in major cities</li>
                                <li><FontAwesomeIcon icon={faComments} /> Community safety workshops</li>
                            </ul>
                        </div>
                    )}
                    
                    {activeTab === 'covid' && (
                        <div className="sf-tab-panel">
                            <h3>Health Protection Measures</h3>
                            <p>We continue to maintain health safety protocols for all riders and drivers.</p>
                            <ul className="sf-safety-list">
                                <li><FontAwesomeIcon icon={faCarSide} /> Regular vehicle sanitization requirements</li>
                                <li><FontAwesomeIcon icon={faUserShield} /> Optional mask preferences in app settings</li>
                                <li><FontAwesomeIcon icon={faUserCheck} /> Health status verification for drivers</li>
                                <li><FontAwesomeIcon icon={faMobileAlt} /> Contactless payment options</li>
                                <li><FontAwesomeIcon icon={faCarSide} /> Air quality monitoring in vehicles</li>
                                <li><FontAwesomeIcon icon={faCarSide} /> Ventilation recommendations during rides</li>
                                <li><FontAwesomeIcon icon={faUserShield} /> Health supply kits in partner vehicles</li>
                            </ul>
                        </div>
                    )}
                    
                    {activeTab === 'accessibility' && (
                        <div className="sf-tab-panel">
                            <h3>Accessible For Everyone</h3>
                            <p>We're committed to providing safe transportation options for all users, regardless of ability.</p>
                            <ul className="sf-safety-list">
                                <li><FontAwesomeIcon icon={faMobileAlt} /> Voice-activated commands for visual impairments</li>
                                <li><FontAwesomeIcon icon={faUserShield} /> Specialized training for drivers assisting passengers with disabilities</li>
                                <li><FontAwesomeIcon icon={faCarSide} /> Wheelchair-accessible vehicle options</li>
                                <li><FontAwesomeIcon icon={faPaw} /> Service animal-friendly ride policies</li>
                                <li><FontAwesomeIcon icon={faComments} /> Easy communication options for hearing-impaired users</li>
                                <li><FontAwesomeIcon icon={faClock} /> Extra wait time options with no additional fees</li>
                                <li><FontAwesomeIcon icon={faHeadset} /> Dedicated accessibility support team</li>
                            </ul>
                        </div>
                    )}
                </div>
            </section>

            <section className="sf-safety-tips">
                <h2>Safety Tips For Your Journey</h2>
                <div className="sf-tips-container">
                    <div className="sf-tip">
                        <div className="sf-tip-icon"><FontAwesomeIcon icon={faEye} /></div>
                        <h3>Verify Your Ride</h3>
                        <p>Always check the car model, license plate, and driver photo before entering a vehicle. Ask "Who are you here for?" instead of "Are you here for [your name]?"</p>
                    </div>
                    <div className="sf-tip">
                        <div className="sf-tip-icon"><FontAwesomeIcon icon={faShareAlt} /></div>
                        <h3>Share Your Trip Details</h3>
                        <p>Use our "Share Trip" feature to let friends or family know your journey details, including driver information and estimated arrival time.</p>
                    </div>
                    <div className="sf-tip">
                        <div className="sf-tip-icon"><FontAwesomeIcon icon={faEye} /></div>
                        <h3>Stay Alert</h3>
                        <p>Remain aware of your surroundings and trust your instincts during your journey. Avoid sharing personal information with drivers or other riders.</p>
                    </div>
                    <div className="sf-tip">
                        <div className="sf-tip-icon"><FontAwesomeIcon icon={faCarSide} /></div>
                        <h3>Ride in the Back Seat</h3>
                        <p>When traveling alone, sitting in the back seat gives you space and allows you to exit from either side if needed.</p>
                    </div>
                    <div className="sf-tip">
                        <div className="sf-tip-icon"><FontAwesomeIcon icon={faStar} /></div>
                        <h3>Rate Your Experience</h3>
                        <p>Your honest ratings help maintain the quality and safety of our platform for everyone. Report any concerns immediately.</p>
                    </div>
                    <div className="sf-tip">
                        <div className="sf-tip-icon"><FontAwesomeIcon icon={faComments} /></div>
                        <h3>Use In-App Communication</h3>
                        <p>Keep all communication with your driver within the app so there's a record of your conversations.</p>
                    </div>
                </div>
            </section>

            <section className="sf-safety-comparison">
                <h2>The GlideWay Safety Difference</h2>
                <div className="sf-comparison-table">
                    <div className="sf-table-header">
                        <div className="sf-feature-column">Safety Feature</div>
                        <div className="sf-glideway-column">GlideWay</div>
                        <div className="sf-others-column">Other Services</div>
                    </div>
                    <div className="sf-table-row">
                        <div className="sf-feature-column"><FontAwesomeIcon icon={faHeadset} /> 24/7 Support Team</div>
                        <div className="sf-glideway-column"><FontAwesomeIcon icon={faCheck} /></div>
                        <div className="sf-others-column">Limited hours</div>
                    </div>
                    <div className="sf-table-row">
                        <div className="sf-feature-column"><FontAwesomeIcon icon={faMapMarkerAlt} /> Real-time Trip Monitoring</div>
                        <div className="sf-glideway-column"><FontAwesomeIcon icon={faCheck} /></div>
                        <div className="sf-others-column">Basic tracking</div>
                    </div>
                    <div className="sf-table-row">
                        <div className="sf-feature-column"><FontAwesomeIcon icon={faUserShield} /> Driver Background Checks</div>
                        <div className="sf-glideway-column"><FontAwesomeIcon icon={faCheck} /></div>
                        <div className="sf-others-column"><FontAwesomeIcon icon={faCheck} /></div>
                    </div>
                    <div className="sf-table-row">
                        <div className="sf-feature-column"><FontAwesomeIcon icon={faMicrophone} /> Audio Recording Option</div>
                        <div className="sf-glideway-column"><FontAwesomeIcon icon={faCheck} /></div>
                        <div className="sf-others-column"><FontAwesomeIcon icon={faTimes} /></div>
                    </div>
                    <div className="sf-table-row">
                        <div className="sf-feature-column"><FontAwesomeIcon icon={faLock} /> PIN Verification</div>
                        <div className="sf-glideway-column"><FontAwesomeIcon icon={faCheck} /></div>
                        <div className="sf-others-column">Limited availability</div>
                    </div>
                    <div className="sf-table-row">
                        <div className="sf-feature-column"><FontAwesomeIcon icon={faUserFriends} /> Driver Gender Preference</div>
                        <div className="sf-glideway-column"><FontAwesomeIcon icon={faCheck} /></div>
                        <div className="sf-others-column"><FontAwesomeIcon icon={faTimes} /></div>
                    </div>
                </div>
            </section>

            <section className="sf-testimonials">
                <h2>Safety Stories from Our Community</h2>
                <div className="sf-testimonial-slider">
                    <div className="sf-testimonial">
                        <div className="sf-testimonial-quote"><FontAwesomeIcon icon={faQuoteLeft} /> As someone who frequently travels alone at night, GlideWay's safety features give me peace of mind. The location sharing feature lets my partner know I'm safe. <FontAwesomeIcon icon={faQuoteRight} /></div>
                        <div className="sf-testimonial-author">
                            <div className="sf-author-avatar"><FontAwesomeIcon icon={faUser} /></div>
                            <div className="sf-author-info">
                                <p className="sf-author-name">Sarah K.</p>
                                <p className="sf-author-title">Regular Rider</p>
                            </div>
                        </div>
                    </div>
                    <div className="sf-testimonial">
                        <div className="sf-testimonial-quote"><FontAwesomeIcon icon={faQuoteLeft} /> The emergency button came in handy when my driver had a medical emergency. Support responded immediately and sent help within minutes. <FontAwesomeIcon icon={faQuoteRight} /></div>
                        <div className="sf-testimonial-author">
                            <div className="sf-author-avatar"><FontAwesomeIcon icon={faUser} /></div>
                            <div className="sf-author-info">
                                <p className="sf-author-name">James T.</p>
                                <p className="sf-author-title">Weekend User</p>
                            </div>
                        </div>
                    </div>
                    <div className="sf-testimonial">
                        <div className="sf-testimonial-quote"><FontAwesomeIcon icon={faQuoteLeft} /> As a driver, I appreciate the two-way verification system. It ensures I'm picking up the right person and they feel safe getting in my car. <FontAwesomeIcon icon={faQuoteRight} /></div>
                        <div className="sf-testimonial-author">
                            <div className="sf-author-avatar"><FontAwesomeIcon icon={faUser} /></div>
                            <div className="sf-author-info">
                                <p className="sf-author-name">Miguel R.</p>
                                <p className="sf-author-title">GlideWay Driver</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="sf-testimonial-controls">
                    <button className="sf-testimonial-nav sf-prev"><FontAwesomeIcon icon={faChevronLeft} /></button>
                    <div className="sf-testimonial-indicators">
                        <span className="sf-indicator sf-active"></span>
                        <span className="sf-indicator"></span>
                        <span className="sf-indicator"></span>
                    </div>
                    <button className="sf-testimonial-nav sf-next"><FontAwesomeIcon icon={faChevronRight} /></button>
                </div>
            </section>

            <section className="sf-safety-faq">
                <h2>Frequently Asked Safety Questions</h2>
                <div className="sf-faq-container">
                    <details className="sf-faq-item">
                        <summary><FontAwesomeIcon icon={faQuestionCircle} /> How are drivers screened?</summary>
                        <div className="sf-faq-content">
                            <p>All drivers undergo comprehensive background checks, including:</p>
                            <ul>
                                <li><FontAwesomeIcon icon={faUserShield} /> Criminal history checks at national and local levels</li>
                                <li><FontAwesomeIcon icon={faCarSide} /> Driving record verification</li>
                                <li><FontAwesomeIcon icon={faCarSide} /> Regular vehicle inspections</li>
                                <li><FontAwesomeIcon icon={faIdCard} /> Identity verification through document checks and biometrics</li>
                                <li><FontAwesomeIcon icon={faRandom} /> Random safety audits and continuous monitoring</li>
                            </ul>
                            <p>We re-run background checks annually and monitor for new violations.</p>
                        </div>
                    </details>
                    <details className="sf-faq-item">
                        <summary><FontAwesomeIcon icon={faQuestionCircle} /> What happens if I feel unsafe during a ride?</summary>
                        <div className="sf-faq-content">
                            <p>You can use the in-app emergency button to contact our 24/7 support team or local authorities. You can also:</p>
                            <ul>
                                <li><FontAwesomeIcon icon={faShareAlt} /> Share your live location with trusted contacts</li>
                                <li><FontAwesomeIcon icon={faComments} /> Text our support team directly through the app</li>
                                <li><FontAwesomeIcon icon={faMicrophone} /> Activate the audio recording feature</li>
                                <li><FontAwesomeIcon icon={faMapMarkerAlt} /> Request to end the ride at a safe public location</li>
                            </ul>
                            <p>All incidents are investigated thoroughly by our safety team.</p>
                        </div>
                    </details>
                    <details className="sf-faq-item">
                        <summary><FontAwesomeIcon icon={faQuestionCircle} /> How does GlideWay protect my personal information?</summary>
                        <div className="sf-faq-content">
                            <p>We use end-to-end encryption for all personal data and anonymize contact information between riders and drivers. Your payment details are securely processed using industry-standard protocols.</p>
                            <p>We never share your full name, contact information, or exact home address with drivers. Phone numbers are masked when communicating through the app.</p>
                        </div>
                    </details>
                    <details className="sf-faq-item">
                        <summary><FontAwesomeIcon icon={faQuestionCircle} /> Can I request a specific driver gender?</summary>
                        <div className="sf-faq-content">
                            <p>Yes, in settings you can set preferences for driver gender. While we cannot guarantee availability, our system will prioritize matching your preferences when possible.</p>
                            <p>This feature is available in all service areas and can be updated at any time through your profile settings.</p>
                        </div>
                    </details>
                    <details className="sf-faq-item">
                        <summary><FontAwesomeIcon icon={faQuestionCircle} /> What safety features are available for night rides?</summary>
                        <div className="sf-faq-content">
                            <p>For night rides, we offer additional safety features:</p>
                            <ul>
                                <li><FontAwesomeIcon icon={faMapMarkerAlt} /> Enhanced route monitoring with additional check-ins</li>
                                <li><FontAwesomeIcon icon={faShareAlt} /> Automatic trip sharing notifications option</li>
                                <li><FontAwesomeIcon icon={faEye} /> "Follow My Ride" feature for trusted contacts</li>
                                <li><FontAwesomeIcon icon={faLightbulb} /> Well-lit pickup spot recommendations</li>
                                <li><FontAwesomeIcon icon={faHeadset} /> Priority response from our safety team</li>
                            </ul>
                        </div>
                    </details>
                    <details className="sf-faq-item">
                        <summary><FontAwesomeIcon icon={faQuestionCircle} /> How do I report a safety concern after my ride?</summary>
                        <div className="sf-faq-content">
                            <p>You can report safety concerns through multiple channels:</p>
                            <ul>
                                <li><FontAwesomeIcon icon={faExclamationTriangle} /> Through the app's "Report an Issue" feature in your ride history</li>
                                <li><FontAwesomeIcon icon={faHeadset} /> Via our 24/7 support line</li>
                                <li><FontAwesomeIcon icon={faShield} /> Through the Safety Center in your app</li>
                                <li><FontAwesomeIcon icon={faEnvelope} /> By email to safety@glideway.com</li>
                            </ul>
                            <p>All reports are reviewed within 24 hours, and serious concerns are prioritized for immediate review.</p>
                        </div>
                    </details>
                </div>
            </section>

            <section className="sf-emergency-support">
                <h2><FontAwesomeIcon icon={faExclamationTriangle} /> 24/7 Emergency Support</h2>
                <p>In case of emergency, use our SOS button in the app to alert our support team and local authorities. Our response team is available around the clock.</p>
                <div className="sf-emergency-resources">
                    <div className="sf-resource">
                        <h3><FontAwesomeIcon icon={faHeadset} /> Immediate Help</h3>
                        <button className="sf-contact-support-btn sf-primary"><FontAwesomeIcon icon={faPhone} /> Contact Support Team</button>
                    </div>
                    <div className="sf-resource">
                        <h3><FontAwesomeIcon icon={faShield} /> Safety Center</h3>
                        <button className="sf-safety-center-btn sf-secondary"><FontAwesomeIcon icon={faExternalLinkAlt} /> Visit Safety Center</button>
                    </div>
                    <div className="sf-resource">
                        <h3><FontAwesomeIcon icon={faFileAlt} /> Report an Incident</h3>
                        <button className="sf-report-btn sf-secondary"><FontAwesomeIcon icon={faEdit} /> File a Report</button>
                    </div>
                </div>
            </section>

            <section className="sf-safety-updates">
                <h2><FontAwesomeIcon icon={faHistory} /> Continuous Safety Improvements</h2>
                <div className="sf-updates-container">
                    <div className="sf-update-item">
                        <div className="sf-update-date">April 2025</div>
                        <h3><FontAwesomeIcon icon={faMicrophone} /> Enhanced Audio Recording</h3>
                        <p>Introducing encrypted audio recording during rides with automatic transcription. Both drivers and riders can activate this feature for added security.</p>
                    </div>
                    <div className="sf-update-item">
                        <div className="sf-update-date">March 2025</div>
                        <h3><FontAwesomeIcon icon={faShieldAlt} /> Advanced ID Verification</h3>
                        <p>Implemented multi-factor biometric authentication for both riders and drivers to enhance security and prevent account takeovers.</p>
                    </div>
                    <div className="sf-update-item">
                        <div className="sf-update-date">February 2025</div>
                        <h3><FontAwesomeIcon icon={faHandshake} /> Community Watch Program</h3>
                        <p>Launched a new program allowing riders to mark safe pickup zones and flag areas of concern to help all community members.</p>
                    </div>
                    <div className="sf-update-item">
                        <div className="sf-update-date">January 2025</div>
                        <h3><FontAwesomeIcon icon={faCodeBranch} /> Route Optimization AI</h3>
                        <p>Our new AI system analyzes routes for safety factors including well-lit streets, crime statistics, and traffic patterns.</p>
                    </div>
                </div>
            </section>

            <section className="sf-safety-partners">
                <h2><FontAwesomeIcon icon={faUsers} /> Our Safety Partners</h2>
                <p>GlideWay collaborates with leading organizations to continually improve our safety standards.</p>
                <div className="sf-partners-grid">
                    <div className="sf-partner-logo">
                        <div className="sf-logo-placeholder">
                            <span>National Safety Council</span>
                        </div>
                    </div>
                    <div className="sf-partner-logo">
                        <div className="sf-logo-placeholder">
                            <span>Transportation Safety Board</span>
                        </div>
                    </div>
                    <div className="sf-partner-logo">
                        <div className="sf-logo-placeholder">
                            <span>Urban Security Alliance</span>
                        </div>
                    </div>
                    <div className="sf-partner-logo">
                        <div className="sf-logo-placeholder">
                            <span>Digital Privacy Institute</span>
                        </div>
                    </div>
                    <div className="sf-partner-logo">
                        <div className="sf-logo-placeholder">
                            <span>Community Transit Coalition</span>
                        </div>
                    </div>
                    <div className="sf-partner-logo">
                        <div className="sf-logo-placeholder">
                            <span>Road Safety Foundation</span>
                        </div>
                    </div>
                </div>
            </section>

            <section className="sf-safety-certifications">
                <h2><FontAwesomeIcon icon={faAward} /> Safety Certifications</h2>
                <div className="sf-certifications-container">
                    <div className="sf-certification">
                        <div className="sf-certification-icon">
                            <FontAwesomeIcon icon={faShieldAlt} />
                        </div>
                        <h3>5-Star Safety Rating</h3>
                        <p>National Transportation Safety Association</p>
                    </div>
                    <div className="sf-certification">
                        <div className="sf-certification-icon">
                            <FontAwesomeIcon icon={faLock} />
                        </div>
                        <h3>Data Privacy Excellence</h3>
                        <p>Digital Trust Certification Board</p>
                    </div>
                    <div className="sf-certification">
                        <div className="sf-certification-icon">
                            <FontAwesomeIcon icon={faUserShield} />
                        </div>
                        <h3>Driver Screening Gold Standard</h3>
                        <p>Background Check Compliance Institute</p>
                    </div>
                    <div className="sf-certification">
                        <div className="sf-certification-icon">
                            <FontAwesomeIcon icon={faUsers} />
                        </div>
                        <h3>Accessibility Achievement</h3>
                        <p>Universal Access Foundation</p>
                    </div>
                </div>
            </section>

            <section className="sf-safety-download">
                <h2>Download Our Safety Guide</h2>
                <p>Get our comprehensive safety guide with detailed information about all our safety features and best practices for secure ridesharing.</p>
                <div className="sf-download-buttons">
                    <button className="sf-download-btn">
                        <FontAwesomeIcon icon={faFileAlt} /> Download PDF Guide
                    </button>
                    <button className="sf-download-btn sf-secondary">
                        <FontAwesomeIcon icon={faMobileAlt} /> Get Mobile Safety Cards
                    </button>
                </div>
            </section>

            <section className="sf-safety-commitment">
                <div className="sf-commitment-content">
                    <h2>Our Commitment to You</h2>
                    <p className="sf-commitment-statement">
                        At GlideWay, safety isn't just a feature—it's our foundation. We continuously invest in new technologies, partnerships, and processes to make every ride as safe as possible.
                    </p>
                    <p className="sf-commitment-signature">
                        - The GlideWay Safety Team
                    </p>
                </div>
                <div className="sf-commitment-image">
                    <div className="sf-image-placeholder">
                        <FontAwesomeIcon icon={faShieldAlt} size="4x" />
                    </div>
                </div>
            </section>

            <section className="sf-safety-subscribe">
                <h2>Stay Updated on Safety Features</h2>
                <p>Subscribe to our safety newsletter to receive updates on new features and safety tips.</p>
                <form className="sf-subscribe-form">
                    <div className="sf-form-group">
                        <input type="email" placeholder="Your email address" className="sf-input" />
                        <button type="submit" className="sf-subscribe-btn">Subscribe</button>
                    </div>
                    
                </form>
            </section>

            <section className="sf-safety-explore">
                <h2>Explore More Safety Resources</h2>
                <div className="sf-resources-grid">
                    <div className="sf-resource-card">
                        <div className="sf-resource-icon">
                            <FontAwesomeIcon icon={faBinoculars} />
                        </div>
                        <h3>Community Watch</h3>
                        <p>Join our community safety program to help identify and report safety concerns in your area.</p>
                        <a href="#" className="sf-resource-link">Learn More</a>
                    </div>
                    <div className="sf-resource-card">
                        <div className="sf-resource-icon">
                            <FontAwesomeIcon icon={faHeadset} />
                        </div>
                        <h3>Safety Webinars</h3>
                        <p>Attend our monthly safety webinars to learn about new features and get your questions answered.</p>
                        <a href="#" className="sf-resource-link">Register Now</a>
                    </div>
                    <div className="sf-resource-card">
                        <div className="sf-resource-icon">
                            <FontAwesomeIcon icon={faFileAlt} />
                        </div>
                        <h3>Safety Blog</h3>
                        <p>Read our latest articles about transportation safety, security tips, and best practices.</p>
                        <a href="#" className="sf-resource-link">Visit Blog</a>
                    </div>
                    <div className="sf-resource-card">
                        <div className="sf-resource-icon">
                            <FontAwesomeIcon icon={faUserShield} />
                        </div>
                        <h3>Driver Safety Portal</h3>
                        <p>Resources specifically for GlideWay drivers to enhance rider safety and security.</p>
                        <a href="#" className="sf-resource-link">Driver Login</a>
                    </div>
                </div>
            </section>


            
        </div>
    );
};

export default Safety;