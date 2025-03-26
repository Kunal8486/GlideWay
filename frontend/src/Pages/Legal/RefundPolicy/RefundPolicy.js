import React from "react";
import "./RefundPolicy.css";

const RefundPolicy = () => {
  const policyContent = [
    {
      title: "Eligibility for Refunds",
      content: "Refunds are considered only in cases where:",
      listItems: [
        "The ride was canceled due to driver unavailability.",
        "You were charged incorrectly for a ride.",
        "Payment errors resulted in double charges.",
      ],
    },
    {
      title: "Refund Process",
      content: "To request a refund, contact our support team within 7 days of the issue. Provide details such as the ride ID, date, and reason for the refund request.",
    },
    {
      title: "Processing Time",
      content: "Once approved, refunds will be processed within 5-7 business days. The amount will be credited to your original payment method.",
    },
    {
      title: "Non-Refundable Cases",
      content: "Refunds will not be issued in cases such as:",
      listItems: [
        "Rider no-shows without prior cancellation.",
        "Delays due to traffic or unavoidable circumstances.",
        "Disputes regarding fares after trip completion.",
      ],
    },
    {
      title: "Contact Support",
      content: "If you have any questions, reach out to our support team via email at support@glideway.com or call us at +91-9247460578.",
    },
  ];

  return (
    <div className="refund-wrapper">
      <div className="refund-container">
        <header className="refund-header">
          <h1>Refund Policy</h1>
          <p className="header-subtitle">Effective from March 2025</p>
        </header>

        <div className="policy-sections">
          {policyContent.map((section, index) => (
            <div key={index} className="policy-section">
              <h2>{section.title}</h2>
              <div className="section-content">
                <p>{section.content}</p>
                {section.listItems && (
                  <ul>
                    {section.listItems.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>

        <footer className="refund-footer">
          <p>Last updated: February 2025 | Version: 1.0</p>
          <p>For more details, visit our website or contact support.</p>
        </footer>
      </div>
    </div>
  );
};

export default RefundPolicy;