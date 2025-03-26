import React from "react";
import "./TermsofServices.css";

const TermsOfService = () => {
  return (
    <div className="terms-container">
      <h1>Terms of Service</h1>
      <p>
        Welcome to GlideWay! By using our platform, you agree to comply with the following terms and conditions.
      </p>

      <div className="policy-section">
        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing or using our services, you confirm that you have read, understood, and agreed to these terms.
        </p>
      </div>

      <div className="policy-section">
        <h2>2. User Responsibilities</h2>
        <p>
          Users must provide accurate information and use the platform responsibly. Any misuse may lead to account suspension.
        </p>
      </div>

      <div className="policy-section">
        <h2>3. Payment & Refund Policy</h2>
        <p>
          Payments are securely processed. Refunds are governed by our <a href="/refund-policy">Refund Policy</a>.
        </p>
      </div>

      <div className="policy-section">
        <h2>4. Limitations of Liability</h2>
        <p>
          GlideWay is not responsible for any direct or indirect damages resulting from platform use.
        </p>
      </div>

      <div className="policy-section">
        <h2>5. Termination of Service</h2>
        <p>
          We reserve the right to terminate or restrict access to users who violate our terms.
        </p>
      </div>

      <div className="policy-section">
        <h2>6. Changes to Terms</h2>
        <p>
          These terms may be updated periodically. Continued use signifies acceptance of the new terms.
        </p>
      </div>

      <div className="policy-section">
        <h2>7. Contact Us</h2>
        <p>
          If you have any questions, reach out to our support team via email at <a href="mailto:support@glideway.com">support@glideway.com</a> or call us at +91-9247460578.
        </p>
      </div>
    </div>
  );
};

export default TermsOfService;
