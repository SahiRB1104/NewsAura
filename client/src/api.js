import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

export const fetchNews = async (category) => {
  try {
    const response = await axios.get(`${API_URL}/.netlify/functions/news/${category}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching news:', error);
    throw error;
  }
};
