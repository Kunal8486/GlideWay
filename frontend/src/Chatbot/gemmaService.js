import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize GenAI with API key from environment variable
const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMMA_API_KEY);

export const generateAIResponse = async (messages) => {
  try {
    // Convert messages to a conversation context
    const conversationContext = messages
      .map(msg => `${msg.sender === 'user' ? 'Human:' : 'AI:'} ${msg.text}`)
      .join('\n');

    // Use the generative model
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash" 
    });

    // Generate content
    const result = await model.generateContent(conversationContext);
    
    // Return the text response
    return result.response.text().trim();
  } catch (error) {
    console.error('Google GenAI API Error:', error);
    throw error;
  }
};

// Content moderation function
export const moderateContent = async (text) => {
  // Basic content moderation
  const inappropriateWords = ['bad', 'harmful', 'offensive'];
  const containsInappropriate = inappropriateWords.some(word => 
    text.toLowerCase().includes(word)
  );

  return !containsInappropriate;
};

// Message processing function
export const processMessage = (message, context = []) => {
  // Optional: Add context-aware message processing
  const contextualMessage = context.length > 0 
    ? `Context: ${context.join(' ')}. User message: ${message}` 
    : message;
  
  return contextualMessage;
};