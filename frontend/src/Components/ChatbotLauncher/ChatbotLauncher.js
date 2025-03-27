import React, { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import AIChatbot from "../../Chatbot/Chatbot.js";
import './ChatbotLauncher.css';

const ChatbotLauncher = ({ 
  logoSrc, 
  companyName = 'GlideWay',
  initialContext = ['GlideWay', 'AI Assistant']
}) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);

  // Prevent scroll when chat is open
  useEffect(() => {
    if (isChatOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isChatOpen]);

  // Add periodic pulsing effect
  useEffect(() => {
    const pulseInterval = setInterval(() => {
      setIsPulsing(true);
      setTimeout(() => setIsPulsing(false), 1500);
    }, 10000); // Pulse every 10 seconds

    return () => clearInterval(pulseInterval);
  }, []);

  const toggleChat = () => {
    setIsChatOpen(prevState => !prevState);
  };

  return (
    <div className="chatbot-launcher-container">
      {/* Launcher Icon */}
      <div 
        className={`chatbot-launcher-icon ${isPulsing ? 'pulse' : ''}`}
        onClick={toggleChat}
        aria-label="Open Chatbot"
        role="button"
        tabIndex={0}
      >
        {logoSrc ? (
          <img 
            src={logoSrc} 
            alt={`${companyName} Logo`} 
          />
        ) : (
          <MessageCircle color="white" size={30} />
        )}
      </div>

      {/* Modal Overlay */}
      {isChatOpen && (
        <div 
          className="chatbot-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) toggleChat();
          }}
        >
          <div 
            className="chatbot-container" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              className="chatbot-close-button"
              onClick={toggleChat}
              aria-label="Close Chatbot"
            >
              <X size={24} />
            </button>

            {/* Chatbot Component */}
            <AIChatbot 
              initialContext={initialContext}
              onClose={toggleChat}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotLauncher;