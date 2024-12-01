import natural from 'natural';
import nlp from 'compromise';
import keywordExtractor from 'keyword-extractor';
import { SummarizerManager } from 'node-summarizer';
import Tokenizer from 'sentence-tokenizer';

// Initialize NLP tools
const tokenizer = new natural.WordTokenizer();
const TfIdf = natural.TfIdf;
const tfidf = new TfIdf();
const sentenceTokenizer = new Tokenizer('Article');

// Utility function to calculate sentence similarity using word embeddings
function calculateSentenceSimilarity(sentence1, sentence2) {
    const words1 = new Set(tokenizer.tokenize(sentence1.toLowerCase()));
    const words2 = new Set(tokenizer.tokenize(sentence2.toLowerCase()));
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    return intersection.size / union.size;
}

// Extract key phrases and entities from text
function extractKeyPhrases(text) {
    const doc = nlp(text);
    
    // Extract keywords using keyword-extractor
    const keywords = keywordExtractor.extract(text, {
        language: "english",
        remove_digits: true,
        return_changed_case: true,
        remove_duplicates: true
    });

    // Use compromise for entity extraction
    const people = doc.match('#Person+').out('array');
    const places = doc.match('#Place+').out('array');
    const organizations = doc.match('#Organization+').out('array');
    
    // Extract dates and numbers using regex
    const datePattern = /\b(?:\d{1,2}[-/]\d{1,2}[-/]\d{2,4}|\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{2,4})\b/gi;
    const dates = text.match(datePattern) || [];

    // Extract numerical values and statistics
    const numberPattern = /\b\d+(?:\.\d+)?%|\$\d+(?:,\d{3})*(?:\.\d+)?|\d+(?:,\d{3})*(?:\.\d+)?\s*(?:million|billion|trillion)?\b/gi;
    const numbers = text.match(numberPattern) || [];

    return {
        people: Array.from(new Set(people)),
        places: Array.from(new Set(places)),
        organizations: Array.from(new Set(organizations)),
        dates: Array.from(new Set(dates)),
        numbers: Array.from(new Set(numbers)),
        keywords: keywords.slice(0, 10)
    };
}

// Calculate sentence importance based on multiple factors
function calculateSentenceImportance(sentence, allSentences, title, keyPhrases) {
    let score = 0;
    
    // Position score (0-2 points)
    const position = allSentences.indexOf(sentence);
    if (position === 0) score += 2;
    else if (position < allSentences.length * 0.2) score += 1.5;
    else if (position < allSentences.length * 0.5) score += 1;
    
    // Length score (0-1 points)
    const words = sentence.split(/\s+/).length;
    if (words >= 10 && words <= 30) score += 1;
    
    // Title similarity score (0-2 points)
    const titleSimilarity = calculateSentenceSimilarity(sentence, title);
    score += titleSimilarity * 2;
    
    // Key phrase presence score (0-3 points)
    Object.values(keyPhrases).forEach(phrases => {
        if (Array.isArray(phrases)) {
            phrases.forEach(phrase => {
                if (phrase && sentence.toLowerCase().includes(phrase.toLowerCase())) {
                    score += 0.5;
                }
            });
        }
    });
    
    // Quotation score (0-1 points)
    if (/"[^"]*"|'[^']*'/.test(sentence)) score += 1;
    
    // Numeric/statistical information score (0-1 points)
    if (/\d+(?:\.\d+)?%|\d+(?:,\d{3})*(?:\.\d+)?/.test(sentence)) score += 1;
    
    return Math.min(10, score); // Cap at 10 points
}

// Generate coherent paragraphs from selected sentences
function generateParagraphs(sentences, maxSentencesPerParagraph = 4) {
    const paragraphs = [];
    let currentParagraph = [];
    
    sentences.forEach((sentence, index) => {
        currentParagraph.push(sentence);
        
        // Start new paragraph on topic change or max length
        if (currentParagraph.length >= maxSentencesPerParagraph || 
            index === sentences.length - 1 ||
            calculateSentenceSimilarity(sentence, sentences[index + 1]) < 0.2) {
            paragraphs.push(currentParagraph.join(' '));
            currentParagraph = [];
        }
    });
    
    return paragraphs;
}

// Main summarization function
export async function generateAdvancedSummary(article, content) {
    try {
        // Tokenize content into sentences
        sentenceTokenizer.setEntry(content);
        const sentences = sentenceTokenizer.getSentences();
        
        // Extract key phrases and entities
        const keyPhrases = extractKeyPhrases(content);
        
        // Calculate importance scores for each sentence
        const scoredSentences = sentences.map(sentence => ({
            sentence,
            score: calculateSentenceImportance(sentence, sentences, article.title, keyPhrases)
        }));
        
        // Sort by score and select top sentences
        const minSentences = 12;
        const maxSentences = 18;
        const targetSentences = Math.min(
            maxSentences,
            Math.max(minSentences, Math.ceil(sentences.length * 0.3))
        );
        
        // Select sentences maintaining their original order
        const selectedSentences = scoredSentences
            .sort((a, b) => b.score - a.score)
            .slice(0, targetSentences)
            .sort((a, b) => sentences.indexOf(a.sentence) - sentences.indexOf(b.sentence))
            .map(item => item.sentence);
        
        // Generate coherent paragraphs
        const paragraphs = generateParagraphs(selectedSentences);
        
        // Use node-summarizer as a fallback for very long articles
        let fallbackSummary = '';
        if (content.length > 10000) {
            try {
                const Summarizer = new SummarizerManager(content, 5);
                fallbackSummary = await Summarizer.getSummaryByRank();
            } catch (error) {
                console.log('Fallback summarization failed:', error);
            }
        }
        
        // Generate introduction paragraph
        const keyEntities = [
            ...keyPhrases.people.slice(0, 2),
            ...keyPhrases.organizations.slice(0, 2),
            ...keyPhrases.places.slice(0, 2)
        ].filter(Boolean);

        let introduction = '';
        if (keyEntities.length > 0) {
            introduction = `This article discusses ${keyEntities.join(', ')}. `;
        }
        
        // Add key statistics if available
        if (keyPhrases.numbers.length > 0) {
            introduction += `Key figures mentioned include ${keyPhrases.numbers.slice(0, 2).join(' and ')}. `;
        }
        
        // Combine everything into a final summary
        const finalSummary = [
            introduction,
            ...paragraphs,
            fallbackSummary
        ].filter(Boolean).join('\n\n');
        
        return {
            title: article.title,
            content: finalSummary || 'Unable to generate summary. Please read the original article.',
            keyPhrases: {
                people: keyPhrases.people,
                organizations: keyPhrases.organizations,
                places: keyPhrases.places,
                dates: keyPhrases.dates,
                numbers: keyPhrases.numbers,
                keywords: keyPhrases.keywords
            }
        };
    } catch (error) {
        console.error('Error in advanced summarization:', error);
        throw error;
    }
}
