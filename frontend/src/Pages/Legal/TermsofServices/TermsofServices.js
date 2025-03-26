import React from "react";
import "./TermsofServices.css";

const TermsOfService = () => {
  return (
    <div className="terms-wrapper">
      <div className="terms-container">
        <header className="terms-header">
          <h1>Terms of Service</h1>
          <p className="header-subtitle">Effective from March 2025</p>
        </header>

        <div className="policy-sections">
          <div className="policy-section">
            <h2>1. Acceptance of Terms</h2>
            <div className="section-content">
              <p>
                By accessing or using our services, you confirm that you have read, understood, and agreed to these terms.
              </p>
            </div>
          </div>

          <div className="policy-section">
            <h2>2. User Responsibilities</h2>
            <div className="section-content">
              <p>
                Users must provide accurate information and use the platform responsibly. Any misuse may lead to account suspension.
              </p>
            </div>
          </div>

          <div className="policy-section">
            <h2>3. Payment & Refund Policy</h2>
            <div className="section-content">
              <p>
                Payments are securely processed. Refunds are governed by our <a href="/refund-policy">Refund Policy</a>.
              </p>
            </div>
          </div>

          <div className="policy-section">
            <h2>4. Limitations of Liability</h2>
            <div className="section-content">
              <p>
                GlideWay is not responsible for any direct or indirect damages resulting from platform use.
              </p>
            </div>
          </div>

          <div className="policy-section">
            <h2>5. Termination of Service</h2>
            <div className="section-content">
              <p>
                We reserve the right to terminate or restrict access to users who violate our terms.
              </p>
            </div>
          </div>

          <div className="policy-section">
            <h2>6. Changes to Terms</h2>
            <div className="section-content">
              <p>
                These terms may be updated periodically. Continued use signifies acceptance of the new terms.
              </p>
            </div>
          </div>

          <div className="policy-section">
            <h2>7. Contact Us</h2>
            <div className="section-content">
              <p>
                If you have any questions, reach out to our support team via email at <a href="mailto:support@glideway.com">support@glideway.com</a> or call us at +91-9247460578.
              </p>
            </div>
          </div>
        </div>

        <footer className="terms-footer">
          <p>Last updated: February 2025 | Version: 1.0</p>
          <p>For more details, visit our website or contact support.</p>
        </footer>
      </div>
    </div>
  );
};

export default TermsOfService;