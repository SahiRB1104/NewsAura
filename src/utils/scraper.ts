import axios from 'axios';
import * as cheerio from 'cheerio';
import { Article } from '../types';
import { newsUrls } from './newsUrls';

const extractImage = ($: cheerio.CheerioAPI, article: cheerio.Element): string => {
  const img = $(article).find('img').first();
  return img.attr('src') || 'https://source.unsplash.com/random/800x600/?news';
};

const extractTitle = ($: cheerio.CheerioAPI, article: cheerio.Element): string => {
  return $(article).find('h3, .title, .headline').first().text().trim();
};

const extractDescription = ($: cheerio.CheerioAPI, article: cheerio.Element): string => {
  return $(article).find('p, .description, .summary').first().text().trim();
};

const extractLink = ($: cheerio.CheerioAPI, article: cheerio.Element, baseUrl: string): string => {
  const link = $(article).find('a').first().attr('href');
  return link?.startsWith('http') ? link : `${baseUrl}${link}`;
};

export const scrapeWebsite = async (url: string, category: string): Promise<Article[]> => {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const articles: Article[] = [];

    $('article, .story, .article').each((_, element) => {
      const title = extractTitle($, element);
      if (!title) return;

      articles.push({
        id: Math.random().toString(36).substr(2, 9),
        title,
        description: extractDescription($, element),
        imageUrl: extractImage($, element),
        sourceUrl: extractLink($, element, url),
        source: new URL(url).hostname,
        category,
        publishedAt: new Date().toISOString(),
      });
    });

    return articles;
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    return [];
  }
};