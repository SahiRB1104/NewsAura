import { Tabs, Tab, Box } from '@mui/material';

function CategoryTabs({ category, onCategoryChange }) {
  const handleChange = (event, newValue) => {
    onCategoryChange(newValue);
  };

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
      <Tabs
        value={category}
        onChange={handleChange}
        variant="scrollable"
        scrollButtons="auto"
        aria-label="news categories"
      >
        <Tab label="Top News" value="top" />
        <Tab label="Business" value="business" />
        <Tab label="Technology" value="technology" />
        <Tab label="Sports" value="sports" />
        <Tab label="Entertainment" value="entertainment" />
        <Tab label="Health" value="health" />
      </Tabs>
    </Box>
  );
}

export default CategoryTabs;
