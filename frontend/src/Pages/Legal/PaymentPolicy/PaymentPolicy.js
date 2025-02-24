import React from "react";
import "./PaymentPolicy.css";

const PaymentPolicy = () => {
  const policyContent = [
    {
      title: "Introduction",
      content:
        "At GlideWay, we ensure a seamless and secure payment process for our drivers and riders. This Payment Policy outlines the guidelines for earnings, payments, and transactions.",
    },
    {
      title: "Earnings & Payments",
      content:
        "Drivers earn based on completed rides and incentives. Payments are processed weekly and transferred directly to the registered bank account.",
      listItems: [
        "Transparent commission structure.",
        "Bonus incentives for high performance.",
        "Payment withdrawals every Monday.",
      ],
    },
    {
      title: "Payment Methods",
      content:
        "GlideWay supports multiple payment methods for both drivers and riders, ensuring a smooth transaction experience.",
      listItems: [
        "Credit/Debit Cards",
        "UPI & Digital Wallets",
        "Net Banking",
        "Cash Payments (for eligible rides)",
      ],
    },
    {
      title: "Transaction Fees",
      content:
        "Transaction fees may apply based on the selected payment method. Any additional fees will be communicated transparently.",
      listItems: [
        "Zero fees for direct bank transfers.",
        "Standard fees for card and wallet payments.",
      ],
    },
    {
      title: "Refund & Dispute Resolution",
      content:
        "If there are any payment discrepancies, GlideWay ensures a structured dispute resolution process.",
      listItems: [
        "Refunds processed within 5-7 business days.",
        "Drivers can raise disputes through the support section.",
        "Immediate action on unauthorized transactions.",
      ],
    },
    {
      title: "Security & Fraud Prevention",
      content:
        "GlideWay prioritizes secure transactions with robust security protocols.",
      listItems: [
        "End-to-end encryption for payments.",
        "Fraud detection and AI-based risk assessment.",
        "Regular audits to ensure secure transactions.",
      ],
    },
    {
      title: "Policy Updates",
      content:
        "We may update this Payment Policy periodically. Please review this page for the latest changes.",
    },
    {
      title: "Contact & Support",
      content:
        "For payment-related queries, contact our support team through the GlideWay app or at +91 9247460578.",
    },
  ];

  return (
    <div className="payment-wrapper">
      <div className="payment-container">
        <header className="payment-header">
          <h1>Payment Policy</h1>
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

        <footer className="payment-footer">
          <p>Last updated: February 2025 | Version: 1.0</p>
          <p>For more details, visit our website or contact support.</p>
        </footer>
      </div>
    </div>
  );
};

export default PaymentPolicy;
