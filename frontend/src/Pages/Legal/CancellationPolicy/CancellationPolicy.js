import React from "react";
import "./CancellationPolicy.css";

const CancellationPolicy = () => {
  const policyContent = [
    {
      title: "Introduction",
      content:
        "At GlideWay, we value your time and commitment. Our cancellation policy is designed to balance flexibility and fairness for both riders and drivers. Please review this policy carefully before canceling a ride.",
    },
    {
      title: "Free Cancellation Window",
      content:
        "To ensure a smooth experience, we allow a short window for free cancellation after booking:",
      listItems: [
        "Within 1 minute: No cancellation fee.",
        "Between 1-3 minutes:A cancellation charge of 3% of the total fare will apply.",
        "After 3 minutes:A cancellation charge of 5% of the total fare will apply.",
      ],
    },
    {
      title: "Cancellation After Driver Assignment",
      content:
        "Once a driver is assigned and on the way, cancellation charges will apply based on the driver's proximity:",
      listItems: [
        "Driver within 2 km: A cancellation charge of 8% of the total fare will apply.",
        "Driver at pickup location: A cancellation charge of 50% of the total fare will apply.",
        "Peak hours (6 AM - 10 AM & 5 PM - 9 PM): Additional surge fee applies.",
      ],
    },
    {
      title: "No-Show Policy",
      content:
        "If you fail to arrive at the pickup location within 5 minutes of the driver’s arrival, the ride may be canceled, and a no-show fee will be charged to compensate the driver’s time and effort.",
    },
    {
      title: "Special Circumstances",
      content:
        "If cancellation is due to app issues, medical emergencies, or extreme weather conditions, you may be eligible for a fee waiver. Please contact customer support for assistance.",
    },
    {
      title: "Refund Process",
      content:
        "If you believe you were unfairly charged a cancellation fee, you can request a refund. Refunds are typically processed within 5-7 business days.",
    },
    {
      title: "Driver-Initiated Cancellations",
      content:
        "If the assigned driver cancels the ride, you will not be charged. In such cases, a new driver will be assigned automatically, or you may rebook the ride.",
    },
    {
      title: "Contact & Support",
      content:
        "For any questions or concerns, reach out to our 24/7 customer support via the GlideWay app or call us at +91 9247460578",
    },
  ];

  return (
    <div className="cancellation-wrapper">
      <div className="cancellation-container">
        <header className="cancellation-header">
          <h1>Cancellation Policy</h1>
          <p className="header-subtitle">Effective from March 2025</p>
        </header>

        <div className="policy-sections">
          {policyContent.map((section, index) => (
            <section key={index} className="policy-section">
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
            </section>
          ))}
        </div>

        <footer className="cancellation-footer">
          <p>Last updated: February 2025 | Version: 2.2</p>
          <p>For the latest updates, visit our website or contact support.</p>
        </footer>
      </div>
    </div>
  );
};

export default CancellationPolicy;
