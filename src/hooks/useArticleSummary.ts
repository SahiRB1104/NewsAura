import { useState, useEffect } from 'react';
import axios from 'axios';
import { Article } from '../types';

interface ArticleSummary {
  title: string;
  content: string;
}

interface SummaryResponse {
  summary: ArticleSummary;
  article: Article;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const useArticleSummary = (articleId: string) => {
  const [summary, setSummary] = useState<ArticleSummary | null>(null);
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const response = await axios.get<SummaryResponse>(`${API_BASE_URL}/summary/${articleId}`);
        setSummary(response.data.summary);
        setArticle(response.data.article);
        setError(null);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setError('Article not found');
        } else {
          setError('Failed to generate article summary');
        }
        console.error('Error generating summary:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [articleId]);

  return { summary, article, loading, error };
};