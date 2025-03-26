import React from "react";
import "./PoolingPolicy.css";

const PoolingPolicy = () => {
  const policyContent = [
    {
      title: "Introduction",
      content:
        "At GlideWay, we offer ride pooling services to make transportation affordable, eco-friendly, and efficient. This Pooling Policy explains the rules and guidelines for using our pooling feature.",
    },
    {
      title: "Pooling Eligibility",
      content:
        "Pooling is available to riders who agree to share a ride with others going in a similar direction.",
      listItems: [
        "Only available for short-to-medium distance trips.",
        "Limited to a maximum of 3 passengers per ride.",
        "Drivers can accept or decline pooling requests based on availability.",
      ],
    },
    {
      title: "Pooling Fare Structure",
      content:
        "Pool rides are more affordable than private rides. The fare is dynamically calculated based on distance, demand, and number of co-passengers.",
      listItems: [
        "Up to 40% cheaper than private rides.",
        "Fare is split among riders based on distance traveled.",
        "No extra charges for slight route deviations.",
      ],
    },
    {
      title: "Pickup & Drop-Off Guidelines",
      content:
        "To ensure smooth ride pooling, all riders must adhere to pickup and drop-off policies.",
      listItems: [
        "Riders must be at the pickup point on time.",
        "Small route deviations are allowed to accommodate co-passengers.",
        "Drop-off locations cannot be changed once the ride has started.",
      ],
    },
    {
      title: "Pooling Etiquette",
      content:
        "All riders must follow pooling etiquette to maintain a pleasant experience.",
      listItems: [
        "No loud conversations or phone calls.",
        "Maintain cleanliness and avoid eating inside the car.",
        "Respect co-passengers' personal space and belongings.",
      ],
    },
    {
      title: "Cancellations & No-Shows",
      content:
        "Cancellations affect other riders and drivers. Please follow the cancellation guidelines.",
      listItems: [
        "Cancellations within 5 minutes of booking are free.",
        "Late cancellations may result in penalties.",
        "No-shows without cancellation may affect future pooling eligibility.",
      ],
    },
    {
      title: "Safety Measures",
      content:
        "GlideWay ensures safety during pooling rides with strict safety measures.",
      listItems: [
        "Verified drivers with background checks.",
        "Real-time tracking of pooled rides.",
        "Emergency contact and support features available.",
      ],
    },
    {
      title: "Policy Updates",
      content:
        "We may update this Pooling Policy periodically. Please check this page for the latest updates.",
    },
    {
      title: "Contact & Support",
      content:
        "For pooling-related queries, contact our support team through the GlideWay app or at +91 9247460578.",
    },
  ];

  return (
    <div className="pooling-wrapper">
      <div className="pooling-container">
        <header className="pooling-header">
          <h1>Pooling Policy</h1>
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

        <footer className="pooling-footer">
          <p>Last updated: February 2025 | Version: 1.0</p>
          <p>For more details, visit our website or contact support.</p>
        </footer>
      </div>
    </div>
  );
};

export default PoolingPolicy;