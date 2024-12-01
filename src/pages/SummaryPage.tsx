import React from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, BookOpen, ExternalLink } from 'lucide-react';
import { useArticleSummary } from '../hooks/useArticleSummary';

const categoryColors = {
  top: 'from-blue-500 to-purple-500',
  business: 'from-emerald-500 to-teal-500',
  entertainment: 'from-pink-500 to-rose-500',
  health: 'from-green-500 to-emerald-500',
  sports: 'from-orange-500 to-red-500',
  technology: 'from-indigo-500 to-blue-500',
};

const SummaryPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const { summary, loading, error, article } = useArticleSummary(id!);
  
  const category = location.state?.category || 'top';
  const gradientColor = categoryColors[category as keyof typeof categoryColors];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <Link
          to={`/category/${category}`}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8 group"
        >
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-md mr-2 transform group-hover:-translate-x-1 transition-transform duration-200">
            <ArrowLeft className="h-4 w-4" />
          </span>
          <span className="font-medium">
            Back to {category.charAt(0).toUpperCase() + category.slice(1)} Articles
          </span>
        </Link>

        {loading && (
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <div className="w-16 h-16 relative animate-spin">
              <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
              <div className={`absolute inset-0 rounded-full border-4 border-t-transparent bg-gradient-to-r ${gradientColor} animate-spin`}></div>
            </div>
            <p className="mt-4 text-gray-600">Generating summary...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-red-800 font-medium">Error loading summary</h3>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {summary && (
          <div className="transform transition-all duration-500 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className={`bg-gradient-to-r ${gradientColor} p-8`}>
                <div className="flex items-center">
                  <BookOpen className="h-8 w-8 text-white opacity-75" />
                  <h1 className="ml-3 text-2xl font-bold text-white">{summary.title}</h1>
                </div>
              </div>
              
              <div className="p-6">
                <div className="prose prose-lg max-w-none">
                  {summary && summary.content.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4">{paragraph}</p>
                  ))}
                </div>
                
                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                  {article?.sourceUrl && (
                    <a
                      href={article.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
                    >
                      <ExternalLink className="h-5 w-5 mr-2" />
                      Read Original Article
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SummaryPage;