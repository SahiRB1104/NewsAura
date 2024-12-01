import { useState, useEffect } from 'react';
import { Article, Category } from '../types';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

console.log('Current API URL:', API_BASE_URL); // Debug log

export const useArticles = (category: Category) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const url = `${API_BASE_URL}/news/${category}`;
        console.log('Fetching from:', url); // Debug log
        const response = await axios.get(url, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        setArticles(response.data);
        setError(null);
      } catch (err: any) {
        console.error('Error details:', err); // Debug log
        setError(err.message || 'Failed to fetch articles');
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [category]);

  return { articles, loading, error };
};