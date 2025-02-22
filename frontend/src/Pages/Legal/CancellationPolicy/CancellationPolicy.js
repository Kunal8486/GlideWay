import React, { useState, useEffect } from 'react';
import './CancellationPolicy.css';

const cancellationTypes = [
  {
    id: 1,
    title: "Pre-Ride Cancellation",
    icon: "🕒",
    timeframe: "Before driver arrives",
    fee: "₹50",
    conditions: [
      "Cancelled within 5 minutes of booking - No charge",
      "Cancelled after 5 minutes - Flat fee applies",
      "Multiple cancellations may affect user rating"
    ]
  },
  {
    id: 2,
    title: "Driver Wait Time",
    icon: "⏳",
    timeframe: "After driver arrives",
    fee: "₹100",
    conditions: [
      "5 minutes free wait time",
      "Additional wait time charged per minute",
      "Automatic cancellation after 10 minutes"
    ]
  },
  {
    id: 3,
    title: "Mid-Ride Cancellation",
    icon: "🚫",
    timeframe: "During the ride",
    fee: "Full fare",
    conditions: [
      "Full fare for distance covered",
      "Additional cancellation penalty",
      "Rating impact for both parties"
    ]
  }
];

const specialCases = [
  {
    icon: "🌧️",
    title: "Severe Weather",
    description: "Reduced or waived fees during extreme weather conditions"
  },
  {
    icon: "🏥",
    title: "Medical Emergency",
    description: "No cancellation fees for verified medical emergencies"
  },
  {
    icon: "⚡",
    title: "Technical Issues",
    description: "Fee waiver for app or system-related problems"
  }
];

export default function CancellationPolicy() {
  const [selectedFee, setSelectedFee] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleFeeClick = (id) => {
    setSelectedFee(selectedFee === id ? null : id);
  };

  return (
    <div className="cancellation-container">
      {/* Header Section */}
      <div className={`cancellation-header ${isVisible ? 'visible' : ''}`}>
        <h1 className="cancellation-title">Cancellation Policy</h1>
        <p className="cancellation-subtitle">
          We understand plans change. Here's everything you need to know about our fair and transparent cancellation process.
        </p>
      </div>

      {/* Policy Types Grid */}
      <div className="cancellation-grid">
        {cancellationTypes.map((type) => (
          <div
            key={type.id}
            className={`policy-card ${selectedFee === type.id ? 'active' : ''}`}
            onClick={() => handleFeeClick(type.id)}
          >
            <div className="card-content">
              <div className="policy-icon">{type.icon}</div>
              <h3 className="policy-title">{type.title}</h3>
              <div className="policy-timeframe">{type.timeframe}</div>
              <div className="policy-fee">{type.fee}</div>
              
              <div className={`policy-details ${selectedFee === type.id ? 'visible' : ''}`}>
                <ul className="conditions-list">
                  {type.conditions.map((condition, idx) => (
                    <li key={idx} className="condition-item">
                      <span className="condition-dot"></span>
                      {condition}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Special Cases Box */}
      <div className="special-cases-box">
        <div className="special-cases-content">
          <h2>Special Circumstances</h2>
          <div className="special-cases-grid">
            {specialCases.map((item, index) => (
              <div key={index} className="special-case-item">
                <div className="special-case-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="help-section">
        <div className="help-content">
          <h2>Need Help?</h2>
          <p>Our support team is available 24/7 to assist you with any questions about cancellations.</p>
          <div className="button-group">
            <button className="primary-button">Contact Support</button>
            <button className="secondary-button">View FAQs</button>
          </div>
        </div>
      </div>
    </div>
  );
}