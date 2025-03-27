import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, AlertTriangle, Sparkles, User, RefreshCw } from 'lucide-react';
import { 
  generateAIResponse, 
  processMessage, 
  moderateContent 
} from './gemmaService';
import './Chatbot.css';

const AIChatbot = ({ 
  initialContext = [], 
  initialMessages = [],
  placeholder = "Type your message...",
  headerTitle = "GlideWay AI Assistant"
}) => {
  const [messages, setMessages] = useState([
    ...(initialMessages.length > 0 
      ? initialMessages 
      : [{ 
          id: 1, 
          text: "Hello! I'm an AI assistant. How can I help you today?", 
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
      // Process message with context
      const processedMessage = processMessage(
        inputMessage, 
        initialContext
      );

      const aiResponseText = await generateAIResponse([
        ...messages, 
        userMessage
      ]);

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

  const handleResetConversation = () => {
    setMessages([{ 
      id: 1, 
      text: "Hello! I'm an AI assistant. How can I help you today?", 
      sender: 'ai' 
    }]);
    setInputMessage('');
    setError(null);
    setConversationStatus('initial');
  };

  return (
    <div className="glideways-chatbot-container">
      {/* Enhanced Header */}
      <div className="chatbot-header">
      <Sparkles size={16} />

        <div className="header-content">
          <h2 className="header-title">{headerTitle}</h2>
        </div>
        <div></div><div></div>

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
              <span className="typing-text">AI is typing</span>
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

export default AIChatbot;