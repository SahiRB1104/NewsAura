import { useState } from 'react';
import { Container, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Header from './components/Header';
import NewsFeed from './components/NewsFeed';
import CategoryTabs from './components/CategoryTabs';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const [category, setCategory] = useState('top');

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Header />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <CategoryTabs category={category} onCategoryChange={handleCategoryChange} />
        <NewsFeed category={category} />
      </Container>
    </ThemeProvider>
  );
}

export default App;
