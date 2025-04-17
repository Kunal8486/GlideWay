// client/src/components/Community.js
import React, { useState, useEffect, useRef } from 'react';
import './Community.css';

function Community() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState('all');
  const [sorting, setSorting] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // API URL (should be in environment variables in a real app)
  const API_URL = `${REACT_APP_API_BASE_URL}/api`;

  useEffect(() => {
    // Fetch messages when component mounts or filters change
    fetchMessages();
  }, [category, sorting]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_URL}/community?category=${category}&sort=${sorting}&search=${encodeURIComponent(searchQuery)}`
      );
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      setMessages(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load messages. Please try again later.');
      setLoading(false);
      console.error('Fetch error:', err);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchMessages();
    setIsRefreshing(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMessages();
  };

  const handleSendMessage = async (username, content, messageCategory) => {
    try {
      const response = await fetch(`${API_URL}/community`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username || 'Anonymous', 
          content,
          category: messageCategory || 'general'
        }),
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const newMessage = await response.json();
      
      // Add the new message to the list
      setMessages([newMessage, ...messages]);
      return true;
    } catch (err) {
      setError('Failed to send message. Please try again.');
      console.error('Send message error:', err);
      return false;
    }
  };

  const handleLikeMessage = async (messageId) => {
    try {
      const response = await fetch(`${API_URL}/community/${messageId}/like`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const updatedMessage = await response.json();
      
      // Update the message in the list
      setMessages(messages.map(message => 
        message._id === messageId ? updatedMessage : message
      ));
    } catch (err) {
      setError('Failed to like message. Please try again.');
      console.error('Like message error:', err);
    }
  };

  const handleAddComment = async (messageId, username, content) => {
    try {
      const response = await fetch(`${API_URL}/community/${messageId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username || 'Anonymous',
          content
        }),
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const updatedMessage = await response.json();
      
      // Update the message in the list
      setMessages(messages.map(message => 
        message._id === messageId ? updatedMessage : message
      ));

      return true;
    } catch (err) {
      setError('Failed to add comment. Please try again.');
      console.error('Add comment error:', err);
      return false;
    }
  };

  const handleEditMessage = async (messageId, content) => {
    try {
      const response = await fetch(`${API_URL}/community/${messageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content
        }),
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const updatedMessage = await response.json();
      
      // Update the message in the list
      setMessages(messages.map(message => 
        message._id === messageId ? updatedMessage : message
      ));

      return true;
    } catch (err) {
      setError('Failed to edit message. Please try again.');
      console.error('Edit message error:', err);
      return false;
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return false;
    }

    try {
      const response = await fetch(`${API_URL}/community/${messageId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      // Remove the message from the list
      setMessages(messages.filter(message => message._id !== messageId));
      return true;
    } catch (err) {
      setError('Failed to delete message. Please try again.');
      console.error('Delete message error:', err);
      return false;
    }
  };

  return (
    <div className="comm-container">
      <main className="comm-content">
        <h1 className="comm-title">Community Discussion Board</h1>
        
        <div className="comm-controls">
          <div className="comm-filters">
            <div className="comm-filter-group">
              <label>Category:</label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                className="comm-select"
              >
                <option value="all">All Categories</option>
                <option value="general">General</option>
                <option value="question">Questions</option>
                <option value="suggestion">Suggestions</option>
                <option value="feedback">Feedback</option>
              </select>
            </div>
            
            <div className="comm-filter-group">
              <label>Sort by:</label>
              <select 
                value={sorting} 
                onChange={(e) => setSorting(e.target.value)}
                className="comm-select"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="popular">Most Liked</option>
                <option value="active">Most Active</option>
              </select>
            </div>
          </div>
          
          <form className="comm-search-form" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="comm-search-input"
            />
            <button type="submit" className="comm-search-button">Search</button>
          </form>
          
          <button 
            className={`comm-refresh-button ${isRefreshing ? 'comm-refreshing' : ''}`}
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        
        {error && (
          <div className="comm-error">
            <p>{error}</p>
            <button className="comm-error-close" onClick={() => setError(null)}>×</button>
          </div>
        )}
        
        {loading ? (
          <div className="comm-loading">
            <div className="comm-loading-spinner"></div>
            <p>Loading messages...</p>
          </div>
        ) : (
          <MessageList 
            messages={messages} 
            onLikeMessage={handleLikeMessage}
            onAddComment={handleAddComment}
            onEditMessage={handleEditMessage}
            onDeleteMessage={handleDeleteMessage}
          />
        )}
        
        <MessageForm onSendMessage={handleSendMessage} />
      </main>
    </div>
  );
}

// MessageList Component
function MessageList({ messages, onLikeMessage, onAddComment, onEditMessage, onDeleteMessage }) {
  if (messages.length === 0) {
    return (
      <div className="comm-empty">
        <p>No messages yet. Be the first to share your thoughts!</p>
      </div>
    );
  }
  
  return (
    <div className="comm-message-list">
      {messages.map(message => (
        <Message 
          key={message._id}
          message={message}
          onLike={() => onLikeMessage(message._id)}
          onAddComment={onAddComment}
          onEditMessage={(content) => onEditMessage(message._id, content)}
          onDeleteMessage={() => onDeleteMessage(message._id)}
        />
      ))}
    </div>
  );
}

// Message Component
function Message({ message, onLike, onAddComment, onEditMessage, onDeleteMessage }) {
  const [showComments, setShowComments] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const commentSectionRef = useRef(null);

  // Scroll to comments when opened
  useEffect(() => {
    if (showComments && commentSectionRef.current) {
      commentSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showComments]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    if (!editContent.trim()) return;
    
    const success = await onEditMessage(editContent);
    if (success) {
      setIsEditing(false);
    }
  };

  const getCategoryBadge = (category) => {
    const categories = {
      general: { name: 'General', color: '#607d8b' },
      question: { name: 'Question', color: '#2196f3' },
      suggestion: { name: 'Suggestion', color: '#4caf50' },
      feedback: { name: 'Feedback', color: '#ff9800' }
    };
    
    const defaultCategory = { name: 'General', color: '#607d8b' };
    const categoryData = categories[category] || defaultCategory;
    
    return (
      <span 
        className="comm-category-badge" 
        style={{ backgroundColor: categoryData.color }}
      >
        {categoryData.name}
      </span>
    );
  };

  return (
    <div className="comm-message">
      <div className="comm-message-header">
        <div className="comm-message-user-info">
          <span className={`comm-username ${message.username === 'Anonymous' ? 'comm-anonymous' : ''}`}>
            {message.username}
          </span>
          {message.category && getCategoryBadge(message.category)}
        </div>
        <span className="comm-timestamp">{formatDate(message.timestamp)}</span>
      </div>
      
      {isEditing ? (
        <form className="comm-edit-form" onSubmit={handleSubmitEdit}>
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="comm-edit-textarea"
            rows="3"
            required
          />
          <div className="comm-edit-buttons">
            <button type="button" className="comm-cancel-button" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
            <button type="submit" className="comm-save-button">
              Save
            </button>
          </div>
        </form>
      ) : (
        <div className="comm-message-body">{message.content}</div>
      )}
      
      <div className="comm-message-actions">
        <button className="comm-like-button" onClick={onLike}>
          👍 {message.likes || 0}
        </button>
        <button 
          className="comm-reply-button" 
          onClick={() => setShowReplyForm(!showReplyForm)}
        >
          💬 Reply
        </button>
        <button 
          className="comm-comments-button" 
          onClick={() => setShowComments(!showComments)}
        >
          {showComments ? 'Hide Comments' : `View Comments (${message.comments?.length || 0})`}
        </button>
        <div className="comm-message-admin-actions">
          {/* <button 
            className="comm-edit-button" 
            onClick={() => {
              setEditContent(message.content);
              setIsEditing(true);
            }}
          >
            Edit
          </button>
          <button 
            className="comm-delete-button" 
            onClick={onDeleteMessage}
          >
            Delete
          </button> */}
        </div>
      </div>
      
      {showReplyForm && (
        <CommentForm 
          messageId={message._id}
          onAddComment={onAddComment}
          onCancel={() => setShowReplyForm(false)}
        />
      )}
      
      {showComments && message.comments && message.comments.length > 0 && (
        <div className="comm-comments-section" ref={commentSectionRef}>
          {message.comments.map(comment => (
            <Comment key={comment._id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  );
}

// Comment Component
function Comment({ comment }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="comm-comment">
      <div className="comm-comment-header">
        <span className={`comm-comment-username ${comment.username === 'Anonymous' ? 'comm-anonymous' : ''}`}>
          {comment.username}
        </span>
        <span className="comm-comment-timestamp">{formatDate(comment.timestamp)}</span>
      </div>
      <div className="comm-comment-content">{comment.content}</div>
    </div>
  );
}

// CommentForm Component
function CommentForm({ messageId, onAddComment, onCancel }) {
  const [username, setUsername] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Please enter a comment');
      return;
    }
    
    setError('');
    
    const success = await onAddComment(messageId, username, content);
    
    if (success) {
      setContent('');
      onCancel(); // Hide the form after successful submission
    }
  };

  return (
    <div className="comm-comment-form-container">
      {error && <div className="comm-form-error">{error}</div>}
      <form className="comm-comment-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Your name (optional)"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="comm-comment-input-name"
        />
        <textarea
          placeholder="Write your comment..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="comm-comment-input"
          rows="2"
          required
        />
        <div className="comm-comment-form-buttons">
          <button type="button" className="comm-comment-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="comm-comment-submit">
            Comment
          </button>
        </div>
      </form>
    </div>
  );
}

// MessageForm Component
function MessageForm({ onSendMessage }) {
  const [username, setUsername] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');
  const [error, setError] = useState('');
  const [charCount, setCharCount] = useState(0);
  const MAX_CHARS = 1000;

  const handleContentChange = (e) => {
    const text = e.target.value;
    if (text.length <= MAX_CHARS) {
      setContent(text);
      setCharCount(text.length);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Please enter a message');
      return;
    }
    
    setError('');
    
    const success = await onSendMessage(username, content, category);
    
    if (success) {
      setContent('');
      setCharCount(0);
      // Keep the username and category for convenience
    }
  };

  return (
    <div className="comm-form-container">
      <h3 className="comm-form-title">Share Your Thoughts</h3>
      {error && <div className="comm-form-error">{error}</div>}
      <form className="comm-form" onSubmit={handleSubmit}>
        <div className="comm-form-row">
          <div className="comm-input-group comm-input-name-group">
            <label htmlFor="username">Your Name (optional)</label>
            <input
              id="username"
              type="text"
              placeholder="Anonymous"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="comm-input-name"
            />
          </div>
          
          <div className="comm-input-group comm-input-category-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="comm-input-category"
            >
              <option value="general">General</option>
              <option value="question">Question</option>
              <option value="suggestion">Suggestion</option>
              <option value="feedback">Feedback</option>
            </select>
          </div>
        </div>
        
        <div className="comm-input-group">
          <label htmlFor="content">Message</label>
          <textarea
            id="content"
            placeholder="Type your message..."
            value={content}
            onChange={handleContentChange}
            className="comm-input-message"
            rows="4"
            required
          />
          <div className="comm-char-counter">
            {charCount}/{MAX_CHARS} characters
          </div>
        </div>
        
        <button type="submit" className="comm-submit-button">Post Message</button>
      </form>
    </div>
  );
}

export default Community;