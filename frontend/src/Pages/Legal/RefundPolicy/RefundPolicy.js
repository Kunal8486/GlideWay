import React from "react";
import "./RefundPolicy.css";

const RefundPolicy = () => {
  return (
    <div className="refund-policy-container">
      <h1>Refund Policy</h1>
      <p>
        At GlideWay, we strive to provide the best ride-sharing experience. However, we understand that unforeseen situations may arise, requiring refunds.
      </p>

      <div className="policy-section">
        <h2>Eligibility for Refunds</h2>
        <p>
          Refunds are considered only in cases where:
        </p>
        <ul>
          <li>The ride was canceled due to driver unavailability.</li>
          <li>You were charged incorrectly for a ride.</li>
          <li>Payment errors resulted in double charges.</li>
        </ul>
      </div>

      <div className="policy-section">
        <h2>Refund Process</h2>
        <p>
          To request a refund, contact our support team within 7 days of the issue. Provide details such as the ride ID, date, and reason for the refund request.
        </p>
      </div>

      <div className="policy-section">
        <h2>Processing Time</h2>
        <p>
          Once approved, refunds will be processed within 5-7 business days. The amount will be credited to your original payment method.
        </p>
      </div>

      <div className="policy-section">
        <h2>Non-Refundable Cases</h2>
        <p>
          Refunds will not be issued in cases such as:
        </p>
        <ul>
          <li>Rider no-shows without prior cancellation.</li>
          <li>Delays due to traffic or unavoidable circumstances.</li>
          <li>Disputes regarding fares after trip completion.</li>
        </ul>
      </div>

      <div className="policy-section">
        <h2>Contact Support</h2>
        <p>
          If you have any questions, reach out to our support team via email at <a href="mailto:support@glideway.com">support@glideway.com</a> or call us at +91-9247460578.
        </p>
      </div>
    </div>
  );
};

export default RefundPolicy;
