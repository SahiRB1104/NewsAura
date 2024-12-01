import { useEffect, useState } from 'react';
import { Grid, Card, CardContent, Typography, CardMedia, Box, CircularProgress, Alert } from '@mui/material';
import { fetchNews } from '../api';

function NewsFeed({ category }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadNews = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchNews(category);
        setNews(data);
      } catch (err) {
        setError('Failed to load news. Please try again later.');
        console.error('Error loading news:', err);
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, [category]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Grid container spacing={3}>
      {news.map((item) => (
        <Grid item xs={12} sm={6} md={4} key={item.id}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {item.imageUrl && (
              <CardMedia
                component="img"
                height="140"
                image={item.imageUrl}
                alt={item.title}
                sx={{ objectFit: 'cover' }}
              />
            )}
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography gutterBottom variant="h6" component="h2">
                {item.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {item.summary}
              </Typography>
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                Source: {item.source}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

export default NewsFeed;
