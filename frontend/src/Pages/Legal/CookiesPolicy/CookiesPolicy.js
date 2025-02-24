import React from "react";
import "./CookiesPolicy.css";

const CookiesPolicy = () => {
  const policyContent = [
    {
      title: "Introduction",
      content:
        "At GlideWay, we use cookies to enhance your experience, improve security, and personalize content. This policy explains how we use cookies and your choices regarding them.",
    },
    {
      title: "What Are Cookies?",
      content:
        "Cookies are small text files stored on your device when you visit a website. They help us remember your preferences, analyze traffic, and provide a secure and customized experience.",
    },
    {
      title: "Types of Cookies We Use",
      content: "We use different types of cookies to improve your experience:",
      listItems: [
        "Essential Cookies: Required for the core functionality of our app and website.",
        "Performance Cookies: Help us understand how users interact with our platform to optimize performance.",
        "Functional Cookies: Store user preferences to enhance your experience.",
        "Targeting & Advertising Cookies: Used to deliver relevant advertisements and measure their effectiveness.",
      ],
    },
    {
      title: "How We Use Cookies",
      content:
        "Cookies help us provide a seamless user experience by allowing us to:",
      listItems: [
        "Keep you logged in and remember your preferences.",
        "Analyze traffic patterns and improve service quality.",
        "Enhance security and prevent fraudulent activities.",
        "Show relevant advertisements based on your interests.",
      ],
    },
    {
      title: "Managing Cookies",
      content:
        "You can control or disable cookies through your browser settings. However, restricting cookies may affect your user experience on our platform.",
    },
    {
      title: "Third-Party Cookies",
      content:
        "We may allow third-party services like Google Analytics and advertising partners to place cookies for analytics and targeted ads. These third parties have their own privacy policies.",
    },
    {
      title: "Updates to This Policy",
      content:
        "We may update our Cookies Policy from time to time. Please check this page periodically for any changes.",
    },
    {
      title: "Contact & Support",
      content:
        "If you have any questions regarding our Cookies Policy, please contact us through the GlideWay app or at +91 9247460578.",
    },
  ];

  return (
    <div className="cookies-wrapper">
      <div className="cookies-container">
        <header className="cookies-header">
          <h1>Cookies Policy</h1>
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

        <footer className="cookies-footer">
          <p>Last updated: February 2025 | Version: 1.0</p>
          <p>For more details, visit our website or contact support.</p>
        </footer>
      </div>
    </div>
  );
};

export default CookiesPolicy;
