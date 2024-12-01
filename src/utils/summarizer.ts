const extractMainContent = async (url: string): Promise<string> => {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    
    // Remove unnecessary elements
    $('header, footer, nav, script, style, iframe, .advertisement').remove();
    
    // Get the main content
    const article = $('article, .article-content, .story-content').text();
    return article.trim();
  } catch (error) {
    console.error('Error extracting content:', error);
    return '';
  }
};

const summarizeText = (text: string): string => {
  // Split text into sentences
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  
  // Score sentences based on their position and length
  const scoredSentences = sentences.map((sentence, index) => ({
    sentence: sentence.trim(),
    score: scoreSentence(sentence, index, sentences.length)
  }));
  
  // Sort sentences by score and take top 5
  const topSentences = scoredSentences
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(item => item.sentence);
  
  return topSentences.join(' ');
};

const scoreSentence = (sentence: string, index: number, totalSentences: number): number => {
  let score = 0;
  
  // Position score (sentences at the beginning are usually more important)
  score += (totalSentences - index) / totalSentences;
  
  // Length score (too short or too long sentences are less likely to be important)
  const words = sentence.split(' ').length;
  if (words > 10 && words < 30) score += 0.3;
  
  // Keyword score
  const keywords = ['important', 'significant', 'research', 'study', 'found', 'according'];
  keywords.forEach(keyword => {
    if (sentence.toLowerCase().includes(keyword)) score += 0.2;
  });
  
  return score;
};

export const generateSummary = async (url: string): Promise<{ title: string; content: string }> => {
  const content = await extractMainContent(url);
  const summary = summarizeText(content);
  
  return {
    title: 'Article Summary',
    content: summary || 'Unable to generate summary. Please read the original article.',
  };
};