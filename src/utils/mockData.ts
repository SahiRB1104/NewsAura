import { Article } from '../types';

export const mockArticles: Record<string, Article[]> = {
  top: [
    {
      id: '1',
      title: 'Global Climate Summit Reaches Historic Agreement',
      description: 'World leaders have reached a landmark decision on climate change targets, pledging to reduce emissions significantly by 2030.',
      imageUrl: 'https://source.unsplash.com/random/800x600/?climate',
      sourceUrl: 'https://example.com/climate-summit',
      source: 'Global News',
      category: 'top',
      publishedAt: new Date().toISOString(),
    },
    // Add more mock articles for each category
  ],
  business: [
    {
      id: '2',
      title: 'Tech Giants Report Record Profits',
      description: 'Major technology companies exceed market expectations with unprecedented quarterly earnings.',
      imageUrl: 'https://source.unsplash.com/random/800x600/?business',
      sourceUrl: 'https://example.com/tech-profits',
      source: 'Business Daily',
      category: 'business',
      publishedAt: new Date().toISOString(),
    },
  ],
  technology: [
    {
      id: '3',
      title: 'Revolutionary AI Breakthrough Announced',
      description: 'Scientists develop new AI model that shows unprecedented capabilities in natural language understanding.',
      imageUrl: 'https://source.unsplash.com/random/800x600/?technology',
      sourceUrl: 'https://example.com/ai-breakthrough',
      source: 'Tech Review',
      category: 'technology',
      publishedAt: new Date().toISOString(),
    },
  ],
  // Add more categories with mock data
};