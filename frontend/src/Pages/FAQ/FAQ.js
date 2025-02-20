import React, { useState, useMemo } from 'react';
import { ChevronDown, Search, Phone, Mail, MessageCircle, ExternalLink } from 'lucide-react';

const faqData = {
  booking: {
    title: "Booking & Rides",
    questions: [
      {
        question: "How do I book a ride?",
        answer: "You can book a ride in 3 simple steps: 1) Open the Glideway app and enter your pickup location 2) Enter your destination 3) Choose your preferred ride type and confirm the booking. You'll see your driver's details and estimated arrival time immediately after confirmation."
      },
      {
        question: "Can I schedule a ride in advance?",
        answer: "Yes! You can schedule rides up to 7 days in advance. Use the 'Schedule' option after entering your destination. You'll receive a confirmation and reminder notifications. We recommend scheduling at least 2 hours ahead for the best experience."
      },
      {
        question: "What ride types are available?",
        answer: "We offer multiple ride types: Economy (standard 4-seater), Comfort (premium 4-seater), XL (6-seater), Electric (eco-friendly vehicles), and Luxury (high-end vehicles). Available options may vary by location."
      },
      {
        question: "How many stops can I add to my ride?",
        answer: "You can add up to 3 stops in a single ride. Add stops by tapping the '+' icon next to the destination field. Each stop has a 3-minute waiting time included in the fare."
      }
    ]
  },
  payment: {
    title: "Payments & Pricing",
    questions: [
      {
        question: "What payment methods do you accept?",
        answer: "We accept multiple payment methods including credit/debit cards, digital wallets (Apple Pay, Google Pay), UPI, and Glideway Credit. For corporate accounts, we also support invoicing and corporate card payments."
      },
      {
        question: "How are fares calculated?",
        answer: "Fares are calculated based on distance, estimated time, current demand, and selected ride type. The fare includes base fare, per-kilometer charge, time charge, and any applicable taxes or fees. You'll always see the exact or estimated fare before confirming your ride."
      },
      {
        question: "How do I apply a promo code?",
        answer: "Tap the 'Promotions' option before confirming your ride, enter your code, and tap 'Apply'. Valid promo codes will be automatically applied to your fare. You can also access saved promo codes in your account settings."
      },
      {
        question: "Is there a cancellation fee?",
        answer: "Cancellation fees vary based on timing: Free within 1 minute of booking, ₹25 if cancelled before driver arrival, and ₹50-100 if cancelled after driver arrival. No fees apply if the driver is significantly delayed."
      }
    ]
  },
  service: {
    title: "Service & Support",
    questions: [
      {
        question: "How do I contact customer support?",
        answer: "Contact our 24/7 support team through: 1) In-app help section 2) Email at support@glideway.com 3) Phone at 1800-123-4567. For ride-specific issues, use the help section in your ride details for fastest resolution."
      },
      {
        question: "What if my driver cancels the ride?",
        answer: "If your driver cancels, you'll be automatically matched with a new driver. You'll receive priority matching and may get ride credits as compensation. If no drivers are available, we'll help you book at a different time or provide a full refund."
      },
      {
        question: "Lost an item in your ride?",
        answer: "Report lost items immediately through the 'Lost & Found' section in your ride history. We'll connect you with your driver. If found, you can arrange a return pickup. Note: A small fee applies for item returns to cover driver costs."
      },
      {
        question: "How do I report a safety concern?",
        answer: "For immediate safety concerns during a ride, use the emergency button in the app. For non-emergency issues, report through the ride feedback section or contact support. All reports are investigated thoroughly and kept confidential."
      }
    ]
  },
  account: {
    title: "Account & Profile",
    questions: [
      {
        question: "How do I create a business profile?",
        answer: "To create a business profile: 1) Go to Settings > Switch to Business 2) Enter your company details and billing preferences 3) Add team members if needed. Business profiles offer detailed receipts, expense management, and team billing options."
      },
      {
        question: "Can I share my ride details?",
        answer: "Yes! Use the 'Share Ride' button during any ride to share live location and ride details. You can share via SMS, WhatsApp, or email. Recipients can track your ride in real-time through a secure link."
      },
      {
        question: "How do I update my payment information?",
        answer: "Go to Settings > Payment Methods to add, remove, or update payment methods. For security, you'll need to verify any new payment method. Corporate cards require admin approval."
      }
    ]
  }
};

const supportChannels = [
  {
    icon: <Phone size={24} />,
    title: "24/7 Phone Support",
    description: "Call us anytime at 1800-123-4567",
    action: "Call Now",
    link: "tel:18001234567"
  },
  {
    icon: <Mail size={24} />,
    title: "Email Support",
    description: "Get help at support@glideway.com",
    action: "Send Email",
    link: "mailto:support@glideway.com"
  },
  {
    icon: <MessageCircle size={24} />,
    title: "Live Chat",
    description: "Chat with our support team",
    action: "Start Chat",
    link: "#chat"
  }
];

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);

  const toggleQuestion = (category, index) => {
    setOpenIndex(prev => ({
      ...prev,
      [`${category}-${index}`]: !prev[`${category}-${index}`]
    }));
  };

  const filteredQuestions = useMemo(() => {
    if (!searchQuery && !activeCategory) return faqData;

    const filtered = {};
    Object.entries(faqData).forEach(([category, data]) => {
      if (activeCategory && category !== activeCategory) return;

      const questions = data.questions.filter(q =>
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchQuery.toLowerCase())
      );

      if (questions.length > 0) {
        filtered[category] = {
          ...data,
          questions
        };
      }
    });
    return filtered;
  }, [searchQuery, activeCategory]);

  return (
    <div className="faq-container">
      <div className="faq-content">
        <h1 className="faq-title">How can we help you?</h1>
        
        <div className="search-container">
          <div className="search-box">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="category-tabs">
          <button
            className={`category-tab ${!activeCategory ? 'active' : ''}`}
            onClick={() => setActiveCategory(null)}
          >
            All
          </button>
          {Object.entries(faqData).map(([key, data]) => (
            <button
              key={key}
              className={`category-tab ${activeCategory === key ? 'active' : ''}`}
              onClick={() => setActiveCategory(key)}
            >
              {data.title}
            </button>
          ))}
        </div>

        <div className="faq-sections">
          {Object.entries(filteredQuestions).map(([category, data]) => (
            <div key={category} className="faq-section">
              <h2 className="section-title">{data.title}</h2>
              <div className="faq-list">
                {data.questions.map((faq, index) => (
                  <div
                    key={index}
                    className={`faq-item ${openIndex[`${category}-${index}`] ? 'active' : ''}`}
                  >
                    <button
                      onClick={() => toggleQuestion(category, index)}
                      className="faq-question"
                      aria-expanded={openIndex[`${category}-${index}`]}
                      aria-controls={`faq-answer-${category}-${index}`}
                    >
                      <span>{faq.question}</span>
                      <ChevronDown className={`faq-icon ${openIndex[`${category}-${index}`] ? 'rotated' : ''}`} />
                    </button>
                    <div
                      id={`faq-answer-${category}-${index}`}
                      className="faq-answer"
                      role="region"
                      aria-hidden={!openIndex[`${category}-${index}`]}
                    >
                      {faq.answer}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="support-section">
          <h2 className="section-title">Still need help?</h2>
          <div className="support-channels">
            {supportChannels.map((channel, index) => (
              <a
                key={index}
                href={channel.link}
                className="support-card"
                target={channel.link.startsWith('#') ? '_self' : '_blank'}
                rel="noopener noreferrer"
              >
                <div className="support-icon">{channel.icon}</div>
                <h3 className="support-title">{channel.title}</h3>
                <p className="support-description">{channel.description}</p>
                <span className="support-action">
                  {channel.action}
                  <ExternalLink size={16} className="external-link-icon" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .faq-container {
          min-height: 100vh;
          padding: 3rem 1rem;
          font-family: system-ui, -apple-system, sans-serif;
        }

        .faq-content {
          max-width: 1000px;
          margin: 0 auto;
          padding: 2rem;
        }

        .faq-title {
          font-size: 2.5rem;
          text-align: center;
          margin-bottom: 2rem;
          color: #8b5e3c;
          font-weight: bold;
        }

        .search-container {
          margin-bottom: 2rem;
        }

        .search-box {
          position: relative;
          max-width: 600px;
          margin: 0 auto;
        }

        .search-input {
          width: 100%;
          padding: 1rem 1rem 1rem 3rem;
          border: 2px solid #f0d5b8;
          border-radius: 2rem;
          font-size: 1.1rem;
          background: white;
          transition: all 0.3s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: #8b5e3c;
          box-shadow: 0 0 0 3px rgba(139, 94, 60, 0.1);
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          margin-top: -10px;
          top: 50%;
          transform: translateY(-50%);
          color: #8b5e3c;
        }

        .category-tabs {
          display: flex;
          gap: 1rem;
          overflow-x: auto;
          padding-bottom: 1rem;
          margin-bottom: 2rem;
        }

        .category-tab {
          padding: 0.75rem 1.5rem;
          background: white;
          border: 1px solid #f0d5b8;
          border-radius: 1.5rem;
          color: #8b5e3c;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.3s ease;
        }

        .category-tab:hover {
          background: #fff8ec;
        }

        .category-tab.active {
          background: #8b5e3c;
          color: white;
          border-color: #8b5e3c;
        }

        .faq-sections {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .section-title {
          font-size: 1.5rem;
          color: #6b4423;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #f0d5b8;
        }

        .faq-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .faq-item {
          background: white;
          border-radius: 0.5rem;
          overflow: hidden;
          border: 1px solid #f0d5b8;
          transition: all 0.3s ease;
        }

        .faq-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .faq-question {
          width: 100%;
          padding: 1.25rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: none;
          border: none;
          cursor: pointer;
          color: #6b4423;
          font-size: 1.1rem;
          font-weight: 500;
          text-align: left;
        }
        .faq-question:hover {
      
          background-color:#fff8ec !important;
          
        }
        .faq-icon {
          width: 20px;
          height: 20px;
          transition: transform 0.3s ease;
          flex-shrink: 0;
        }

        .faq-icon.rotated {
          transform: rotate(180deg);
        }

        .faq-answer {
          max-height: 0;
          overflow: hidden;
          padding: 0 1.25rem;
          color: #6b4423;
          transition: all 0.3s ease-in-out;
          opacity: 0;
          line-height: 1.6;
        }

        .faq-item.active .faq-answer {
          max-height: 500px;
          padding: 0 1.25rem 1.25rem;
          opacity: 1;
        }

        .support-section {
          margin-top: 3rem;
          padding-top: 2rem;
          border-top: 2px solid #f0d5b8;
        }

        .support-channels {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-top: 1.5rem;
        }
        .support-card {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 2rem;
            background: white;
            border-radius: 1rem;
            border: 1px solid #f0d5b8;
            text-decoration: none;
            transition: all 0.3s ease;
            text-align: center;
          }

          .support-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
            border-color: #8b5e3c;
          }

          .support-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 48px;
            height: 48px;
            background: #fff8ec;
            border-radius: 50%;
            margin-bottom: 1rem;
            color: #8b5e3c;
          }

          .support-title {
            font-size: 1.2rem;
            color: #6b4423;
            margin-bottom: 0.5rem;
            font-weight: 600;
          }

          .support-description {
            color: #8d7355;
            margin-bottom: 1rem;
            font-size: 0.95rem;
          }

          .support-action {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: #8b5e3c;
            font-weight: 500;
            font-size: 0.95rem;
          }

          .external-link-icon {
            opacity: 0;
            transform: translateX(-4px);
            transition: all 0.3s ease;
          }

          .support-card:hover .external-link-icon {
            opacity: 1;
            transform: translateX(0);
          }

          @media (max-width: 768px) {
            .faq-container {
              padding: 1rem;
            }

            .faq-content {
              padding: 1rem;
            }

            .faq-title {
              font-size: 2rem;
              margin-bottom: 1.5rem;
            }

            .search-input {
              font-size: 1rem;
              padding: 0.75rem 0.75rem 0.75rem 2.5rem;
            }

            .category-tabs {
              padding-bottom: 0.5rem;
              margin-bottom: 1.5rem;
              gap: 0.5rem;
            }

            .category-tab {
              padding: 0.5rem 1rem;
              font-size: 0.9rem;
            }

            .section-title {
              font-size: 1.25rem;
            }

            .faq-question {
              padding: 1rem;
              font-size: 1rem;
            }

            .faq-item.active .faq-answer {
              padding: 0 1rem 1rem;
            }

            .support-channels {
              grid-template-columns: 1fr;
            }

            .support-card {
              padding: 1.5rem;
            }
          }

          @media (max-width: 480px) {
            .faq-title {
              font-size: 1.75rem;
            }

            .search-input {
              padding: 0.75rem 0.75rem 0.75rem 2.25rem;
            }

            .category-tab {
              padding: 0.5rem 0.75rem;
              font-size: 0.85rem;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .faq-item,
            .faq-icon,
            .faq-answer,
            .support-card,
            .external-link-icon {
              transition: none;
            }
          }

          /* High Contrast Mode */
          @media (prefers-contrast: high) {
            .faq-container {
              background: white;
            }

            .category-tab.active {
              background: black;
              border-color: black;
            }

            .faq-item {
              border: 2px solid black;
            }

            .support-card {
              border: 2px solid black;
            }
          }

          /* Dark Mode */
          @media (prefers-color-scheme: dark) {
            .faq-container {
              background: #1a1a1a;
            }

            .faq-title,
            .section-title {
              color: #f0d5b8;
            }

            .search-input {
              background: #2a2a2a;
              border-color: #3a3a3a;
              color: white;
            }

            .category-tab {
              background: #2a2a2a;
              border-color: #3a3a3a;
              color: #f0d5b8;
            }

            .category-tab.active {
              background: #f0d5b8;
              color: #1a1a1a;
            }

            .faq-item {
              background: #2a2a2a;
              border-color: #3a3a3a;
            }

            .faq-question {
              color: #f0d5b8;
            }

            .faq-answer {
              color: #e0c5a8;
            }

            .support-card {
              background: #2a2a2a;
              border-color: #3a3a3a;
            }

            .support-title {
              color: #f0d5b8;
            }

            .support-description {
              color: #e0c5a8;
            }

            .support-action {
              color: #f0d5b8;
            }
          }
        `}</style>
    </div>
  );
};

export default FAQPage;
