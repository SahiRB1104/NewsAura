import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Tag, ExternalLink, FileText } from 'lucide-react';

const categoryColors = {
  top: 'bg-gradient-to-r from-blue-500 to-purple-500',
  business: 'bg-gradient-to-r from-emerald-500 to-teal-500',
  entertainment: 'bg-gradient-to-r from-pink-500 to-rose-500',
  health: 'bg-gradient-to-r from-green-500 to-emerald-500',
  sports: 'bg-gradient-to-r from-orange-500 to-red-500',
  technology: 'bg-gradient-to-r from-indigo-500 to-blue-500',
};

interface ArticleCardProps {
  article: {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    sourceUrl: string;
    source: string;
    category: string;
    pubDate: string;
  };
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  const navigate = useNavigate();
  const formattedDate = new Date(article.pubDate).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="group relative bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl h-[450px] flex flex-col">
      <div className="relative">
        <div className="aspect-w-16 aspect-h-9 h-[180px] overflow-hidden">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
          />
        </div>
        
        <div className="absolute top-3 left-3 right-3 flex justify-between items-center">
          <div className="flex items-center space-x-2 bg-black/50 rounded-full px-2 py-1 backdrop-blur-sm">
            <Calendar className="h-3 w-3 text-white" />
            <span className="text-xs text-white">{formattedDate}</span>
          </div>
          <div className={`${categoryColors[article.category as keyof typeof categoryColors]} rounded-full px-2 py-1 backdrop-blur-sm`}>
            <span className="text-xs font-medium text-white capitalize">{article.category}</span>
          </div>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <h2 className="text-lg font-bold mb-2 line-clamp-2 flex-none">
          {article.title}
        </h2>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-3 flex-1">
          {article.description}
        </p>

        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span className="inline-flex items-center">
            <Tag className="h-3 w-3 mr-1" />
            {article.source}
          </span>
        </div>

        <div className="flex justify-between items-center gap-2">
          <a
            href={article.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1.5 rounded-lg hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 text-sm"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Read More
          </a>
          <button
            onClick={() => navigate(`/summary/${article.id}`, { 
              state: { category: article.category }
            })}
            className="flex-1 flex items-center justify-center bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1.5 rounded-lg hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-200 text-sm"
          >
            <FileText className="h-3 w-3 mr-1" />
            Summarize
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;