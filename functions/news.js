const { fetchNews } = require('../server/server');
const { summarizeArticle } = require('../server/summarizer');

exports.handler = async (event) => {
  try {
    const category = event.path.split('/').pop();
    const news = await fetchNews(category);
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      },
      body: JSON.stringify(news)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch news' })
    };
  }
};
