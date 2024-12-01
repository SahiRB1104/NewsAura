import express from 'express';
import cors from 'cors';
import axios from 'axios';
import * as cheerio from 'cheerio';
import NodeCache from 'node-cache';
import crypto from 'crypto';
import { generateAdvancedSummary } from './summarizer.js';

const app = express();
const cache = new NodeCache({ stdTTL: 300 }); // Cache for 5 minutes
const articlesCache = new NodeCache({ stdTTL: 3600 }); // Cache articles for 1 hour

app.use(cors());
app.use(express.json());

const newsSources = {
  top: [
    {
      name: 'Times of India',
      url: 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms',
      type: 'rss'
    },
    {
      name: 'NDTV',
      url: 'https://feeds.feedburner.com/ndtvnews-top-stories',
      type: 'rss'
    },
    {
      name: 'Hindustan Times',
      url: 'https://www.hindustantimes.com/feeds/rss/news/rssfeed.xml',
      type: 'rss'
    },
    {
      name: 'Indian Express',
      url: 'https://indianexpress.com/feed/',
      type: 'rss'
    },
    {
      name: 'News18',
      url: 'https://www.news18.com/rss/india.xml',
      type: 'rss'
    },
    {
      name: 'The Hindu',
      url: 'https://www.thehindu.com/news/feeder/default.rss',
      type: 'rss'
    }
  ],
  business: [
    {
      name: 'Economic Times',
      url: 'https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms',
      type: 'rss'
    },
    {
      name: 'Money Control',
      url: 'https://www.moneycontrol.com/rss/marketreports.xml',
      type: 'rss'
    },
    {
      name: 'Business Standard',
      url: 'https://www.business-standard.com/rss/markets-106.rss',
      type: 'rss'
    },
    {
      name: 'Financial Express',
      url: 'https://www.financialexpress.com/market/feed/',
      type: 'rss'
    },
    {
      name: 'Mint Business',
      url: 'https://www.livemint.com/rss/markets',
      type: 'rss'
    },
    {
      name: 'Business Today',
      url: 'https://www.businesstoday.in/markets/feed',
      type: 'rss'
    }
  ],
  technology: [
    {
      name: 'NDTV Gadgets',
      url: 'https://gadgets.ndtv.com/rss/feeds',
      type: 'rss'
    },
    {
      name: 'Tech2',
      url: 'https://www.firstpost.com/tech/feed',
      type: 'rss'
    },
    {
      name: 'BGR India',
      url: 'https://www.bgr.in/feed',
      type: 'rss'
    },
    {
      name: 'Digit',
      url: 'https://www.digit.in/rss/tech-news.xml',
      type: 'rss'
    },
    {
      name: 'India Today Tech',
      url: 'https://www.indiatoday.in/rss/1206578',
      type: 'rss'
    },
    {
      name: 'The Mobile Indian',
      url: 'https://www.themobileindian.com/feed',
      type: 'rss'
    }
  ],
  sports: [
    {
      name: 'ESPN Cricinfo',
      url: 'https://www.espncricinfo.com/rss/content/story/feeds/0.xml',
      type: 'rss'
    },
    {
      name: 'Sports NDTV',
      url: 'https://sports.ndtv.com/rss/all',
      type: 'rss'
    },
    {
      name: 'Sportskeeda Cricket',
      url: 'https://www.sportskeeda.com/feed/cricket',
      type: 'rss'
    },
    {
      name: 'Cricket Next',
      url: 'https://www.news18.com/rss/cricketnext.xml',
      type: 'rss'
    },
    {
      name: 'Times Sports',
      url: 'https://timesofindia.indiatimes.com/rssfeeds/4719148.cms',
      type: 'rss'
    },
    {
      name: 'Indian Express Sports',
      url: 'https://indianexpress.com/section/sports/feed/',
      type: 'rss'
    }
  ],
  entertainment: [
    {
      name: 'Bollywood Hungama',
      url: 'https://www.bollywoodhungama.com/rss/news.xml',
      type: 'rss'
    },
    {
      name: 'Filmfare',
      url: 'https://www.filmfare.com/feeds/news.xml',
      type: 'rss'
    },
    {
      name: 'Pinkvilla',
      url: 'https://www.pinkvilla.com/rss.xml',
      type: 'rss'
    },
    {
      name: 'Bollywood Life',
      url: 'https://www.bollywoodlife.com/feed',
      type: 'rss'
    },
    {
      name: 'TOI Entertainment',
      url: 'https://timesofindia.indiatimes.com/rssfeeds/1081479906.cms',
      type: 'rss'
    },
    {
      name: 'NDTV Movies',
      url: 'https://feeds.feedburner.com/ndtvmovies-latest',
      type: 'rss'
    }
  ],
  health: [
    {
      name: 'Health NDTV',
      url: 'https://doctor.ndtv.com/rss/all',
      type: 'rss'
    },
    {
      name: 'TOI Health',
      url: 'https://timesofindia.indiatimes.com/rssfeeds/3908999.cms',
      type: 'rss'
    },
    {
      name: 'India Today Health',
      url: 'https://www.indiatoday.in/rss/1206585',
      type: 'rss'
    },
    {
      name: 'ET Health',
      url: 'https://health.economictimes.indiatimes.com/rss/topstories',
      type: 'rss'
    },
    {
      name: 'Medical Dialogues',
      url: 'https://medicaldialogues.in/feed',
      type: 'rss'
    },
    {
      name: 'Express Healthcare',
      url: 'https://www.expresshealthcare.in/feed/',
      type: 'rss'
    }
  ]
};

async function parseRSSFeed(source, category) {
  try {
    console.log(`Fetching RSS feed for ${source.name} (${category})`);
    const response = await axios.get(source.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    });
    
    if (!response.data) {
      console.error(`Empty response from ${source.name}`);
      return [];
    }

    const $ = cheerio.load(response.data, { xmlMode: true });
    console.log(`Successfully loaded RSS feed for ${source.name}`);

    return await Promise.all($('item').map(async (_, item) => {
      try {
        const $item = $(item);
        const title = $item.find('title').text().trim();
        const description = $item.find('description').text().trim();
        const sourceUrl = $item.find('link').text().trim();
        const pubDate = $item.find('pubDate').text().trim();
        
        if (!title || !sourceUrl) {
          console.log(`Skipping item from ${source.name} - missing title or link`);
          return null;
        }

        let imageUrl = await findImage($item, sourceUrl, $);
        
        if (!imageUrl) {
          try {
            const articleResponse = await axios.get(sourceUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
              },
              timeout: 5000
            });
            const article$ = cheerio.load(articleResponse.data);
            imageUrl = await extractImageFromArticle(article$, source.name);
          } catch (err) {
            console.log(`Failed to fetch article page for image from ${source.name}: ${err.message}`);
          }
        }

        if (!imageUrl) {
          imageUrl = getSourceDefaultImage(source.name);
        }

        return {
          id: crypto.randomUUID(),
          title,
          description: cleanDescription(description),
          imageUrl,
          sourceUrl,
          source: source.name,
          category,
          pubDate: new Date(pubDate)
        };
      } catch (err) {
        console.error(`Error processing item from ${source.name}:`, err);
        return null;
      }
    }).get()).then(articles => articles.filter(Boolean));
  } catch (error) {
    console.error(`Error fetching RSS feed for ${source.name}:`, error);
    return [];
  }
}

async function findImage($item, sourceUrl, $) {
  let imageUrl = $item.find('media\\:content, content').attr('url');
  
  if (!imageUrl) {
    const enclosure = $item.find('enclosure[type^="image"]').attr('url');
    imageUrl = enclosure;
  }
  
  if (!imageUrl) {
    imageUrl = $item.find('image > url').text();
  }
  
  if (!imageUrl) {
    const desc = $item.find('description').html();
    if (desc) {
      const desc$ = cheerio.load(desc);
      const img = desc$('img').first();
      imageUrl = img.attr('src');
    }
  }

  return imageUrl;
}

async function extractImageFromArticle($, sourceName) {
  let imageUrl;
  
  const selectors = {
    'Times of India': 'figure img, .highlight img, ._3gQ-2, [itemprop="image"] img',
    'NDTV': '.ins_instory_dv_cont img, .story_pic img, .story_featured_image img',
    'Hindustan Times': '.storyParagraphFigure img, .imageContainer img, [itemprop="image"] img',
    'The Hindu': '.lead-img img, .article-pic img, [itemprop="image"] img',
    'Economic Times': '.artImg img, .articleImg img, [itemprop="image"] img',
    'Money Control': '.article_image img, .mc_img img, [itemprop="image"] img',
    'Business Standard': '.article-img img, .featured-image img, [itemprop="image"] img',
    'Financial Express': '.featured-image img, .article-image img, [itemprop="image"] img',
    'NDTV Gadgets': '.story_pic img, .story_featured_image img, .story__thumb img, picture img',
    'Tech2': '.article-image img, .featured-image img, .story-image img, picture img',
    'BGR India': '.entry-image img, .featured-image img, .post-thumbnail img, picture img',
    'Digit': '.article-featured-image img, .story-image img, .main-image img, picture img',
    'India Today Tech': '.story-image img, .featured-image img, .article-image img, picture img',
    'The Mobile Indian': '.post-thumbnail img, .featured-image img, .article-featured img, picture img',
    'default': 'meta[property="og:image"], meta[name="twitter:image"], article img, .article img, .story img, [itemprop="image"] img'
  };
  
  const selector = selectors[sourceName] || selectors.default;
  
  // Try meta tags first with priority for high-res images
  const metaImage = $('meta[property="og:image:large"]').attr('content') ||
                   $('meta[property="og:image"]').attr('content') || 
                   $('meta[name="twitter:image:large"]').attr('content') ||
                   $('meta[name="twitter:image"]').attr('content');
  
  if (metaImage && !metaImage.includes('logo') && !metaImage.includes('icon')) {
    imageUrl = metaImage;
  } else {
    // Try source-specific selectors
    const images = $(selector).filter((i, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src');
      return src && 
             !src.includes('logo') && 
             !src.includes('icon') &&
             !src.includes('avatar') &&
             !src.includes('thumb');
    });
    
    imageUrl = images.first().attr('src') || images.first().attr('data-src');
  }
  
  if (imageUrl) {
    // Ensure URL is absolute
    if (imageUrl.startsWith('//')) {
      imageUrl = 'https:' + imageUrl;
    } else if (imageUrl.startsWith('/')) {
      try {
        const urlObj = new URL(sourceName);
        imageUrl = `${urlObj.protocol}//${urlObj.host}${imageUrl}`;
      } catch (e) {
        // If URL parsing fails, try to extract domain from source name
        const domain = sourceName.toLowerCase().replace(/\s+/g, '');
        imageUrl = `https://www.${domain}.com${imageUrl}`;
      }
    }
    
    // Remove any small thumbnail indicators and query parameters
    imageUrl = imageUrl.replace(/-thumb|-small|-thumbnail|-preview|-100x100|-150x150/g, '')
                      .split('?')[0];
  }
  
  return imageUrl;
}

function getSourceDefaultImage(sourceName) {
  const defaults = {
    'Times of India': 'https://static.toiimg.com/photo/msid-58124960/TOI-logo.jpg',
    'NDTV': 'https://drop.ndtv.com/homepage/ndtv_news_logo.png',
    'Hindustan Times': 'https://www.hindustantimes.com/images/app-images/ht-logo.png',
    'The Hindu': 'https://www.thehindu.com/theme/images/th-online/logo.png',
    'Economic Times': 'https://economictimes.indiatimes.com/photo/47529900.cms',
    'Money Control': 'https://images.moneycontrol.com/static-mcnews/2020/04/moneycontrol-logo-620x435.jpg',
    'Business Standard': 'https://bsmedia.business-standard.com/include/_mod/site/html5/images/business-standard-logo.png',
    'Financial Express': 'https://images.financialexpress.com/2021/07/fe-logo.png',
    'Mint Business': 'https://images.livemint.com/img/static/livemint-logo.svg',
    'NDTV Gadgets': 'https://cdn.gadgets360cdn.com/pricee/assets/gadgets360-logo-final.png',
    'Tech2': 'https://www.firstpost.com/tech/wp-content/uploads/2021/tech-default.jpg',
    'BGR India': 'https://www.bgr.in/wp-content/themes/bgr/images/bgr-logo-new.png',
    'Digit': 'https://www.digit.in/images/digit-logo-2022.png',
    'India Today Tech': 'https://akm-img-a-in.tosshub.com/sites/all/themes/itg/logo.png',
    'The Mobile Indian': 'https://www.themobileindian.com/wp-content/themes/tmi-2022/images/logo.png',
    'default': 'https://images.news18.com/static_news18/pix/ibnhome/news18/news18-logo-sharing.png'
  };
  
  return defaults[sourceName] || defaults.default;
}

function cleanDescription(description) {
  let cleaned = description.replace(/<br\s*\/?>/gi, '\n');
  cleaned = cleaned.replace(/<[^>]+>/g, '');
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  cleaned = cleaned.replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  return cleaned;
}

function calculateSentenceScore(sentence, index, totalSentences, title) {
  let score = 0;
  const words = sentence.split(/\s+/);
  const wordCount = words.length;
  
  // Position score (0-3 points)
  if (index < totalSentences * 0.3) {
    score += 3 - (index / (totalSentences * 0.3)) * 2; // Higher score for earlier sentences
  } else if (index > totalSentences * 0.8) {
    score += 1; // Small boost for concluding sentences
  }
  
  // Length score (0-2 points)
  if (wordCount >= 10 && wordCount <= 25) {
    score += 2;
  } else if (wordCount > 25 && wordCount <= 40) {
    score += 1;
  }
  
  // Title similarity score (0-3 points)
  const titleWords = new Set(title.toLowerCase().match(/\b\w+\b/g) || []);
  const sentenceWords = new Set(sentence.toLowerCase().match(/\b\w+\b/g) || []);
  const commonWords = new Set([...titleWords].filter(word => sentenceWords.has(word)));
  if (commonWords.size > 0) {
    score += Math.min(3, (commonWords.size / titleWords.size) * 3);
  }
  
  // Important phrases score (0-3 points)
  const importantPhrases = [
    'according to',
    'research shows',
    'study finds',
    'experts say',
    'reports indicate',
    'analysis shows',
    'data suggests',
    'evidence indicates',
    'results show',
    'findings reveal',
    'concluded that',
    'demonstrates that',
    'highlights that',
    'confirms that',
    'suggests that',
    'indicates that',
    'reveals that'
  ];
  
  const phrasesFound = importantPhrases.filter(phrase => 
    sentence.toLowerCase().includes(phrase)
  );
  score += Math.min(3, phrasesFound.length);
  
  // Named entity score (0-2 points)
  const namedEntityPatterns = [
    /[A-Z][a-z]+ (?:[A-Z][a-z]+ )*[A-Z][a-z]+/, // Person names
    /(?:Mr\.|Mrs\.|Ms\.|Dr\.) [A-Z][a-z]+/,     // Titles with names
    /\d+(?:\.\d+)?%/,                           // Percentages
    /(?:₹|$|€|£)\s*\d+(?:,\d+)*(?:\.\d+)?/,    // Currency
    /\d{1,2}(?:st|nd|rd|th)? [A-Z][a-z]+ \d{4}/  // Dates
  ];
  
  const entitiesFound = namedEntityPatterns.filter(pattern => 
    pattern.test(sentence)
  );
  score += Math.min(2, entitiesFound.length);
  
  // Quote detection (0-2 points)
  const hasQuotes = /"[^"]*"|'[^']*'/.test(sentence);
  if (hasQuotes) {
    score += 2;
  }
  
  return score;
}

async function generateSummary(article) {
  try {
    console.log(`Fetching article from: ${article.sourceUrl}`);
    const response = await axios.get(article.sourceUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    console.log(`Successfully fetched article. Content length: ${response.data.length}`);
    const $ = cheerio.load(response.data);
    
    // Remove all irrelevant elements first
    $('script, style, noscript, iframe, form, .ad, .ads, .advertisement, .social-share, .related-articles, .comments, .navigation, nav, header, footer, aside').remove();
    $('meta, link, button, input, .caption, .image-caption, .figure-caption, .wp-caption, .social-icons, .share-buttons').remove();
    $('.breadcrumb, .author-info, .timestamp, .date-time, .byline, .tags, .categories').remove();
    $('[class*="advertisement"], [class*="social"], [class*="share"], [class*="related"], [class*="comment"]').remove();
    $('[id*="advertisement"], [id*="social"], [id*="share"], [id*="related"], [id*="comment"]').remove();
    
    // Source-specific content extraction with refined selectors
    const sourceSpecificSelectors = {
      'NDTV': ['.sp-cn', '.content_text', '.story__content', '.story_detail', '.content'],
      'Times of India': ['.ga-article', '._3YYSt', '.articalBody', '.Normal', '.content-body'],
      'Hindustan Times': ['.storyDetails', '.detail', '.story-body', '.article-body', '.article__content'],
      'The Hindu': ['.article-body-content-container', '.article__content', '.article-text'],
      'Economic Times': ['.artText', '.normal', '.article-body', '.content'],
      'NDTV Gadgets': ['.content_text', '.story_details', '.article__content', '.story-content'],
      'Tech2': ['.article-body', '.article__body', '.article-content'],
      'BGR India': ['.entry-content', '.article-content', '.post-content'],
      'Digit': ['.article-content', '.content-body', '.story-content'],
      'India Today Tech': ['.story-right', '.story-details', '.description', '.story-body'],
      'default': [
        'article',
        '.article',
        '.article-content',
        '.story-content',
        '.news-content',
        '.post-content',
        '.entry-content',
        '.content-body',
        '.main-content',
        '.story-body'
      ]
    };
    
    let content = '';
    const selectors = sourceSpecificSelectors[article.source] || sourceSpecificSelectors.default;
    
    // Try each selector until we find content
    for (const selector of selectors) {
      if (!content) {
        const elements = $(selector).find('p, h2, h3, li');
        console.log(`Trying selector "${selector}": found ${elements.length} elements`);
        
        content = elements
          .map((i, el) => $(el).text().trim())
          .get()
          .filter(text => text.length > 20)
          .join(' ');
          
        if (content) {
          console.log(`Found content using selector "${selector}". Length: ${content.length} characters`);
          break;
        }
      }
    }
    
    // If still no content, try a broader approach
    if (!content) {
      console.log('No content found with specific selectors, trying broader approach');
      
      // Try to find the main content container
      const mainContent = $('main, #main, .main, [role="main"]').first();
      if (mainContent.length) {
        console.log('Found main content container');
        content = mainContent
          .find('p, h2, h3, li')
          .map((i, el) => $(el).text().trim())
          .get()
          .filter(text => text.length > 20)
          .join(' ');
        
        if (content) {
          console.log(`Extracted ${content.length} characters from main content`);
        }
      }
      
      // If still no content, try getting all paragraphs from the body
      if (!content) {
        console.log('Trying body-level paragraph extraction');
        const bodyParagraphs = $('body').find('p');
        console.log(`Found ${bodyParagraphs.length} paragraphs in body`);
        
        content = bodyParagraphs
          .map((i, el) => $(el).text().trim())
          .get()
          .filter(text => text.length > 20)
          .join(' ');
        
        if (content) {
          console.log(`Extracted ${content.length} characters from body paragraphs`);
        }
      }
    }
    
    // Clean the content
    if (content) {
      content = content
        .replace(/\s+/g, ' ')  // Normalize whitespace
        .replace(/[^\w\s.,!?'"()-]/g, ' ')  // Remove special characters except basic punctuation
        .replace(/\s+/g, ' ')  // Normalize whitespace again
        .replace(/\b(Advertisement|Follow us|Share this|Subscribe|Newsletter)\b.*?[.!?]/gi, '')  // Remove sentences with common irrelevant phrases
        .replace(/(Written by|Updated:|Published:|Last Updated:).*?[.!?]/g, '')  // Remove metadata sentences
        .replace(/\(\s*PTI\s*\)|\(\s*ANI\s*\)/g, '')  // Remove news agency tags
        .replace(/\s*\([^)]*\)\s*/g, ' ')  // Remove parenthetical content
        .replace(/\s+/g, ' ')  // Final whitespace cleanup
        .trim();
    }
    
    if (!content && article.description) {
      content = article.description;
    }

    if (!content) {
      return {
        title: article.title,
        content: 'Summary not available. Please read the original article.',
      };
    }
    
    // Use the new advanced summarization
    return await generateAdvancedSummary(article, content);
    
  } catch (error) {
    console.error('Error generating summary for article:', {
      title: article.title,
      url: article.sourceUrl,
      error: error.message,
      stack: error.stack
    });
    return {
      title: article.title,
      content: article.description || 'Summary not available due to an error. Please read the original article.',
    };
  }
}

app.get('/api/news/:category', async (req, res) => {
  try {
    const { category } = req.params;
    console.log(`Fetching news for category: ${category}`);
    const cacheKey = `news-${category}`;
    
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      console.log(`Returning cached data for ${category}`);
      cachedData.forEach(article => {
        articlesCache.set(article.id, article);
      });
      return res.json(cachedData);
    }
    
    const sources = newsSources[category] || newsSources.top;
    console.log(`Fetching from sources:`, sources.map(s => s.name));
    
    const articlesPromises = sources.map(source => parseRSSFeed(source, category));
    const articlesArrays = await Promise.all(articlesPromises);
    
    const articles = articlesArrays
      .flat()
      .sort(() => Math.random() - 0.5)
      .slice(0, 20);
    
    console.log(`Final articles count: ${articles.length}`);
    
    cache.set(cacheKey, articles);
    articles.forEach(article => {
      articlesCache.set(article.id, article);
    });
    
    res.json(articles);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch news', details: error.message });
  }
});

app.get('/api/summary/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check cache first
    const cachedResponse = cache.get(`summary_${id}`);
    if (cachedResponse) {
      console.log('Returning cached summary for:', id);
      return res.json(cachedResponse);
    }

    // Get article from cache
    const article = articlesCache.get(id);
    if (!article) {
      console.log('Article not found:', id);
      return res.status(404).json({ error: 'Article not found' });
    }

    try {
      // Generate summary
      const summary = await generateSummary(article);
      
      // Cache the response with both summary and article
      const response = { summary, article };
      cache.set(`summary_${id}`, response, 3600); // Cache for 1 hour
      
      console.log('Generated new summary for:', id);
      res.json(response);
    } catch (error) {
      if (error.message.includes('rate limit')) {
        // If rate limited, use a simpler summary
        console.log('Rate limited, using simpler summary for:', id);
        const simpleSummary = article.description + `\n\nSource: ${article.source}`;
        const response = { summary: simpleSummary, article };
        cache.set(`summary_${id}`, response, 3600);
        res.json(response);
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('Error generating summary:', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
