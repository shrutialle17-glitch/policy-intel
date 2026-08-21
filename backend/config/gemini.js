const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey || apiKey === 'your-gemini-api-key') {
  console.warn('⚠️ GEMINI_API_KEY is not configured in .env');
}

const genAI = new GoogleGenerativeAI(apiKey || 'missing-key');

module.exports = genAI;
