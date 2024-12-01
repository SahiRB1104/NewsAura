import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const fetchNews = async (category) => {
  try {
    const response = await axios.get(`${API_URL}/api/news/${category}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching news:', error);
    throw error;
  }
};
