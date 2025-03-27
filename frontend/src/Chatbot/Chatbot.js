import React, { useState, useEffect, useRef } from 'react';
import { Send, MapPin, Car, Wallet, User, AlertTriangle, Sparkles } from 'lucide-react';
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
  placeholder = "Ask about rides, booking, or services...",
  headerTitle = "GlideWay Support"
}) => {
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
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      sender: 'user'
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
        sender: 'ai'
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

  return (
    <div className="glideways-chatbot-container">
      {/* Header */}
      <div className="chatbot-header">
        <Sparkles size={16} />
        <div className="header-content">
          <h2 className="header-title">{headerTitle}</h2>
        </div>
        <div className="header-actions">
          <MapPin size={16} />
          <Car size={16} />
        </div>
      </div>

      {/* Messages Area */}
      <div className="glideways-chat-messages">
        <div className="messages-wrapper">
          {messages.map(message => (
            <div 
              key={message.id} 
              className={`message-container ${
                message.sender === 'user' 
                  ? 'message-user' 
                  : 'message-ai'
              }`}
            >
              <div className="message-content-wrapper">
                {message.sender === 'ai' && (
                  <div className="ai-avatar">
                    <Sparkles size={20} />
                  </div>
                )}
                {message.sender === 'user' && (
                  <div className="user-avatar">
                    <User size={20} />
                  </div>
                )}
                <div 
                  className={`
                    message-content
                    ${
                      message.sender === 'user'
                        ? 'user-message' 
                        : 'ai-message'
                    }
                  `}
                >
                  {message.text}
                </div>
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="loading-indicator">
              <div className="typing-animation">
                <span className="typing-text">AI is processing</span>
                <span className="typing-dot">.</span>
                <span className="typing-dot delayed-dot">.</span>
                <span className="typing-dot more-delayed-dot">.</span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="error-message">
              <AlertTriangle className="error-icon" />
              {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="chatbot-input-container">
        <div className="input-wrapper">
          <input 
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={placeholder}
            className="chatbot-input"
            disabled={isLoading}
          />
        </div>
        <button 
          onClick={handleSendMessage}
          disabled={isLoading}
          className="send-message-btn"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default GlideWayChatbot;