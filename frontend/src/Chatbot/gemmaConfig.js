// src/services/gemmaConfig.js
export const GEMMA_CONFIG = {
  API_URL: process.env.REACT_APP_GEMMA_API_URL || 'https://api.gemma.ai/v1/chat/completions',
  API_KEY: process.env.REACT_APP_GEMMA_API_KEY || '',
  MODEL: process.env.REACT_APP_GEMMA_MODEL || 'gemma-7b-it',
  MAX_TOKENS: 150,
  TEMPERATURE: 0.7
};