import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const client = axios.create({
  baseURL: API_BASE,
  timeout: 25000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const getStockDetails = async (ticker, period = '1y') => {
  const response = await client.get(`/stock/${ticker}`, {
    params: { period }
  });
  return response.data;
};

export const getPrediction = async (ticker) => {
  const response = await client.get(`/predict/${ticker}`);
  return response.data;
};

export const getScreener = async () => {
  const response = await client.get('/screener');
  return response.data;
};

export const sendAiChat = async (ticker, question, context) => {
  const response = await client.post('/ai-chat', {
    ticker,
    question,
    context
  });
  return response.data;
};

export const checkHealth = async () => {
  const response = await client.get('/health');
  return response.data;
};
