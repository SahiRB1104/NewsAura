import React from 'react';
import ArticleCard from './ArticleCard';
import { Article } from '../types';

interface ArticleGridProps {
  articles: Article[];
}

const ArticleGrid: React.FC<ArticleGridProps> = ({ articles }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-6">
      {articles.map((article, index) => (
        <div
          key={article.id}
          className="opacity-0 animate-fade-slide-up"
          style={{
            animationDelay: `${index * 100}ms`,
            animationFillMode: 'forwards'
          }}
        >
          <ArticleCard article={article as any} />
        </div>
      ))}
    </div>
  );
};

export default ArticleGrid;