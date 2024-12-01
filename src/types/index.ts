export interface Article {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  sourceUrl: string;
  source: string;
  category: string;
  publishedAt: string;
}

export type Category = 'top' | 'general' | 'business' | 'entertainment' | 'health' | 'sports' | 'technology';