import React from "react";
import "./PrivacyPolicy.css";

const PrivacyPolicy = () => {
  const policyContent = [
    {
      title: "Introduction",
      content:
        "At GlideWay, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your personal information.",
    },
    {
      title: "Information We Collect",
      content:
        "We collect user information to enhance your experience and ensure smooth operations.",
      listItems: [
        "Personal details (name, contact, email, etc.)",
        "Ride history and preferences",
        "Payment and transaction details",
      ],
    },
    {
      title: "How We Use Your Information",
      content:
        "Your data is used to improve services, provide support, and ensure security.",
      listItems: [
        "Enhancing ride experience and safety",
        "Processing payments securely",
        "Preventing fraud and ensuring compliance",
      ],
    },
    {
      title: "Data Security & Protection",
      content:
        "GlideWay prioritizes data protection with strict security measures in place.",
      listItems: [
        "End-to-end encryption for sensitive data",
        "Regular security audits and updates",
        "Strict access controls to protect personal information",
      ],
    },
    {
      title: "Sharing of Information",
      content:
        "We do not sell your personal data. Limited sharing occurs under necessary conditions.",
      listItems: [
        "With trusted service providers for operational purposes",
        "For legal compliance and safety regulations",
        "With your consent for personalized offers",
      ],
    },
    {
      title: "Your Rights & Control",
      content:
        "You have full control over your data, with the ability to review and request modifications.",
      listItems: [
        "Access and update your personal details",
        "Request data deletion under applicable laws",
        "Control marketing and notification preferences",
      ],
    },
    {
      title: "Policy Updates",
      content:
        "This policy may be updated periodically. Please check this page for the latest updates.",
    },
    {
      title: "Contact & Support",
      content:
        "For any privacy concerns, reach out to our support team via the GlideWay app or at +91 9247460578.",
    },
  ];

  return (
    <div className="privacy-wrapper">
      <div className="privacy-container">
        <header className="privacy-header">
          <h1>Privacy Policy</h1>
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

        <footer className="privacy-footer">
          <p>Last updated: February 2025 | Version: 1.0</p>
          <p>For more details, visit our website or contact support.</p>
        </footer>
      </div>
    </div>
  );
};

export default PrivacyPolicy;