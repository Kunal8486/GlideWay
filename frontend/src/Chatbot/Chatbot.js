import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  MapPin,
  Car,
  Wallet,
  User,
  AlertTriangle,
  Sparkles,
  X,
  Menu,
  ChevronDown,
  Clock,
  MessageSquare,
  Settings
} from 'lucide-react';
import {
  generateAIResponse,
  processMessage,
  moderateContent
} from './gemmaService';
import {
  fetchRideEstimate,
  checkDriverAvailability,
  calculatePoolingOptions
} from './glideWayService';

import './Chatbot.css';

const GlideWayChatbot = ({
  initialContext = [],
  initialMessages = [],
  userLocation = null,
  placeholder = "Ask about rides, booking...",
  headerTitle = "GlideWay Support",
  theme = "light",
  onClose, // Add onClose prop to handle closing the chatbot from launcher
}) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);
  const [messages, setMessages] = useState([
    ...(initialMessages.length > 0
      ? initialMessages
      : [{
        id: 1,
        text: "Welcome to GlideWay! I'm your AI assistant. Need help with rides, booking, or have any questions? I'm here to assist you!",
        sender: 'ai'
      }]
    )
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [conversationStatus, setConversationStatus] = useState('initial');
  const [isExpanded, setIsExpanded] = useState(true); // Default expanded
  const [showOptions, setShowOptions] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Updated toggleChat function to use the onClose prop if provided
  const toggleChat = () => {
    if (onClose) {
      // If onClose is provided, use it to close the chatbot from the launcher
      onClose();
    } else {
      // Fallback to local state toggle if onClose is not provided
      setIsChatOpen(prevState => !prevState);
    }
  };

  // Prevent scroll when chat is open
  useEffect(() => {
    if (isChatOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isChatOpen]);

  const handleSpecialIntents = async (message) => {
    const lowerMessage = message.toLowerCase();

    // Ride fare estimation
    if (lowerMessage.includes('fare') || lowerMessage.includes('price')) {
      try {
        const estimate = await fetchRideEstimate(
          userLocation?.origin,
          userLocation?.destination
        );
        return `Estimated fare details:
                • Price: $${estimate.price}
                • Distance: ${estimate.distance} miles
                • Estimated Time: ${estimate.duration} minutes`;
      } catch (err) {
        return "I can help estimate fares, but couldn't fetch the exact details right now.";
      }
    }

    // Pooling options
    if (lowerMessage.includes('pool') || lowerMessage.includes('sharing')) {
      try {
        const poolingOptions = await calculatePoolingOptions(userLocation);
        return `Ride Pooling Options:
                • Shared Ride Discount: Up to 30% off
                • Current matched riders: ${poolingOptions.matchedRiders}
                • Estimated wait time: ${poolingOptions.waitTime} minutes`;
      } catch (err) {
        return "Pooling information is currently processing. I can still help you explore options.";
      }
    }

    // Driver availability
    if (lowerMessage.includes('driver') || lowerMessage.includes('availability')) {
      try {
        const driverStatus = await checkDriverAvailability(userLocation);
        return `Driver Availability:
                • Nearby drivers: ${driverStatus.nearbyDrivers}
                • Estimated pickup time: ${driverStatus.pickupTime} minutes`;
      } catch (err) {
        return "Driver availability check is momentarily unavailable.";
      }
    }

    return null;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Content moderation
    const isAppropriate = await moderateContent(inputMessage);
    if (!isAppropriate) {
      setError('Message contains inappropriate content');
      return;
    }

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);
    setConversationStatus('processing');

    try {
      // First, check for special ride-sharing intents
      const specialResponse = await handleSpecialIntents(inputMessage);

      let aiResponseText;
      if (specialResponse) {
        // Use special intent response if available
        aiResponseText = specialResponse;
      } else {
        // Process message with context and generate AI response
        const processedMessage = processMessage(
          inputMessage,
          initialContext
        );

        aiResponseText = await generateAIResponse([
          ...messages,
          userMessage
        ]);
      }

      const aiMessage = {
        id: Date.now() + 1,
        text: aiResponseText,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMessage]);
      setConversationStatus('completed');
    } catch (err) {
      setError('Failed to generate response. Please try again.');
      setConversationStatus('error');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    setTimeout(() => {
      scrollToBottom();
      if (isExpanded) {
        inputRef.current?.focus();
      }
    }, 100);
  };

  const clearChat = () => {
    setMessages([{
      id: Date.now(),
      text: "Welcome to GlideWay! I'm your AI assistant. Need help with rides, booking, or have any questions? I'm here to assist you!",
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setShowOptions(false);
  };

  // Quick action buttons for common queries
  const quickActions = [
    { label: "Fare Estimate", icon: <Wallet size={16} />, query: "What's the fare estimate for my ride?" },
    { label: "Drivers Nearby", icon: <Car size={16} />, query: "Are there drivers available near me?" },
    { label: "Ride Pooling", icon: <User size={16} />, query: "Tell me about ride pooling options" }
  ];

  const handleQuickAction = (query) => {
    setInputMessage(query);
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  return (
    <div className={`chb-glideway-chatbot-container ${isExpanded ? 'chb-expanded' : 'chb-collapsed'} ${theme === 'dark' ? 'chb-dark-theme' : 'chb-light-theme'}`}>
      {/* Header */}
      <div className="chb-chatbot-header">
        <div className="chb-header-left">
          <Sparkles size={20} className="chb-header-icon" />
          <h2 className="chb-header-title">{headerTitle}</h2>
        </div>

        <div className="chb-header-actions">
          {isExpanded && (
            <>
              <button
                className="chb-header-action-btn chb-options-btn"
                onClick={() => setShowOptions(!showOptions)}
                aria-label="Chat options"
              >
                <Menu size={18} />
              </button>
              {showOptions && (
                <div className="chb-options-dropdown">
                  <button onClick={clearChat} className="chb-option-item">
                    <X size={16} />
                    <span>Clear chat</span>
                  </button>
                  <button className="chb-option-item">
                    <Settings size={16} />
                    <span>Settings</span>
                  </button>
                </div>
              )}
            </>
          )}
          <button
            className="chb-header-action-btn chb-close-btn"
            onClick={toggleChat}
            aria-label="Close chat"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Chat Interface (only shown when expanded) */}
      {isExpanded && (
        <>
          {/* Messages Area */}
          <div className="chb-glideway-chat-messages">
            <div className="chb-messages-wrapper">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`chb-message-container ${message.sender === 'user'
                      ? 'chb-message-user'
                      : 'chb-message-ai'
                    }`}
                >
                  <div className="chb-message-content-wrapper">
                    {message.sender === 'ai' && (
                      <div className="chb-ai-avatar">
                        <Sparkles size={20} />
                      </div>
                    )}
                    {message.sender === 'user' && (
                      <div className="chb-user-avatar">
                        <User size={20} />
                      </div>
                    )}
                    <div
                      className={`
                        chb-message-content
                        ${message.sender === 'user'
                          ? 'chb-user-message'
                          : 'chb-ai-message'
                        }
                      `}
                    >
                      {message.text}
                      <span className="chb-message-time">
                        {message.timestamp}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="chb-loading-indicator">
                  <div className="chb-typing-animation">
                    <div className="chb-ai-avatar chb-loading-avatar">
                      <Sparkles size={20} />
                    </div>
                    <div className="chb-typing-bubble">
                      <span className="chb-typing-dot"></span>
                      <span className="chb-typing-dot"></span>
                      <span className="chb-typing-dot"></span>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="chb-error-message">
                  <AlertTriangle className="chb-error-icon" />
                  <span>{error}</span>
                  <button
                    className="chb-retry-btn"
                    onClick={() => {
                      setError(null);
                      handleSendMessage();
                    }}
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Quick Action Suggestions */}
              {messages.length <= 2 && !isLoading && (
                <div className="chb-quick-actions-container">
                  <div className="chb-quick-actions-title">
                    <Clock size={16} />
                    <span>Quick Actions</span>
                  </div>
                  <div className="chb-quick-actions-buttons">
                    {quickActions.map((action, index) => (
                      <button
                        key={index}
                        className="chb-quick-action-btn"
                        onClick={() => handleQuickAction(action.query)}
                      >
                        {action.icon}
                        <span>{action.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="chb-chatbot-input-container">
            <div className="chb-input-wrapper">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={placeholder}
                className="chb-chatbot-input"
                disabled={isLoading}
                rows={1}
                autoFocus
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className={`chb-send-message-btn ${inputMessage.trim() ? 'chb-active' : ''}`}
              aria-label="Send message"
            >
              <Send size={20} />
            </button>
          </div>
        </>
      )}

      {/* Collapsed Bubble (only shown when collapsed) */}
      {!isExpanded && (
        <div className="chb-chatbot-bubble" onClick={toggleExpand}>
          <Sparkles size={24} />
        </div>
      )}
    </div>
  );
};

export default GlideWayChatbot;