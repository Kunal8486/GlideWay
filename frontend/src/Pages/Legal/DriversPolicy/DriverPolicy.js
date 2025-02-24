import React from "react";
import "./DriverPolicy.css";

const DriverPolicy = () => {
  const policyContent = [
    {
      title: "Introduction",
      content:
        "At GlideWay, we value our drivers and aim to provide a seamless experience. This Driver Policy outlines the terms, responsibilities, and expectations for all drivers on our platform.",
    },
    {
      title: "Driver Eligibility",
      content:
        "To become a GlideWay driver, you must meet the following criteria:",
      listItems: [
        "Be at least 21 years old.",
        "Hold a valid driving license and necessary permits.",
        "Own or have access to a registered and insured vehicle.",
        "Pass a background check and verification process.",
      ],
    },
    {
      title: "Code of Conduct",
      content: "All drivers are expected to follow these guidelines:",
      listItems: [
        "Provide a safe and respectful ride experience.",
        "Follow traffic laws and safety regulations.",
        "Maintain cleanliness and hygiene of the vehicle.",
        "Avoid any form of discrimination or harassment.",
      ],
    },
    {
      title: "Earnings & Payments",
      content:
        "Drivers earn money based on completed rides. Payments are processed weekly and can be withdrawn to the registered bank account.",
      listItems: [
        "Transparent commission structure.",
        "Bonus incentives for high ratings and ride completion.",
        "24/7 support for payment-related issues.",
      ],
    },
    {
      title: "Safety & Security",
      content:
        "GlideWay prioritizes driver and passenger safety. We implement strict safety measures, including:",
      listItems: [
        "Real-time GPS tracking for all rides.",
        "Emergency SOS button for drivers.",
        "Passenger identity verification.",
      ],
    },
    {
      title: "Policy Violations",
      content:
        "Failure to comply with our policies may result in warnings, temporary suspension, or permanent deactivation. Major violations include:",
      listItems: [
        "Repeated passenger complaints.",
        "Engaging in fraudulent activities.",
        "Driving under the influence of drugs or alcohol.",
      ],
    },
    {
      title: "Updates to This Policy",
      content:
        "We may update our Driver Policy periodically. Please check this page for any changes.",
    },
    {
      title: "Contact & Support",
      content:
        "If you have any questions regarding this policy, please contact us through the GlideWay app or at +91 9247460578.",
    },
  ];

  return (
    <div className="driver-wrapper">
      <div className="driver-container">
        <header className="driver-header">
          <h1>Driver Policy</h1>
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

        <footer className="driver-footer">
          <p>Last updated: February 2025 | Version: 1.0</p>
          <p>For more details, visit our website or contact support.</p>
        </footer>
      </div>
    </div>
  );
};

export default DriverPolicy;
