import { AppBar, Toolbar, Typography } from '@mui/material';
import NewspaperIcon from '@mui/icons-material/Newspaper';

function Header() {
  return (
    <AppBar position="static">
      <Toolbar>
        <NewspaperIcon sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          News Aggregator
        </Typography>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
