import { useState, useEffect } from 'react';
import { Article, Category } from '../types';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

export const useArticles = (category: Category) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/news/${category}`);
        setArticles(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch articles');
        console.error('Error fetching articles:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [category]);

  return { articles, loading, error };
};