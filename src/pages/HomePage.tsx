import React from 'react';
import { useParams } from 'react-router-dom';
import ArticleGrid from '../components/ArticleGrid';
import { useArticles, Category } from '../hooks/useArticles';

const HomePage = () => {
  // Assert that category is of type Category
  const { category = 'top' } = useParams<{ category?: Category }>();
  const { articles, loading, error } = useArticles(category);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
        <p className="text-red-600">Error loading articles: {error}</p>
      </div>
    );
  }

  return <ArticleGrid articles={articles} />;
};

export default HomePage;