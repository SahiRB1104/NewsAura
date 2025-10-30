import { useEffect, useState } from "react";
import { Article, Category } from "../types";

export const useArticles = (category: Category, refreshTrigger = 0) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/news/${category}${refreshTrigger > 0 ? "?refresh=true" : ""}`
        );
        const data = await response.json();

const formatted: Article[] = data.map((a: any) => {
  const rawDate = a.pubDate || a.publishedAt;
  const parsedDate = new Date(rawDate);
  const validDate = !isNaN(parsedDate.getTime())
    ? parsedDate.toISOString()
    : new Date().toISOString();

  return {
    id: a.id,
    title: a.title,
    description: a.description,
    imageUrl: a.imageUrl,
    sourceUrl: a.sourceUrl,
    source: a.source,
    category: a.category,
    pubDate: validDate, // ✅ Match ArticleCard.tsx
  };
});


        // 📰 Optional: newest first
        setArticles(
          formatted.sort(
            (a, b) =>
              new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
          )
        );
      } catch (err) {
        console.error("Error fetching articles:", err);
        setError("Failed to fetch articles");
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [category, refreshTrigger]);

  return { articles, loading, error };
};
