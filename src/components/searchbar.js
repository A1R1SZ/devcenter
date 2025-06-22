import { useState, useEffect } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import { styled, alpha } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import { Box, Paper, List, ListItem, ListItemText } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': { backgroundColor: alpha(theme.palette.common.white, 0.25) },
  width: '100%',
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'white',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    width: '35ch',
  },
}));

export default function Searchbar() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  // 🧹 Hide suggestions on route change
  useEffect(() => {
    setSuggestions([]);
  }, [location.pathname]);

  // 🔍 Fetch suggestions
  useEffect(() => {
    if (query.trim().length > 1) {
      const token = localStorage.getItem('token');
      axios
        .get(`http://localhost:5000/search?q=${query}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setSuggestions(res.data.slice(0, 5)))
        .catch(() => setSuggestions([]));
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (text) => {
    navigate(`/search?q=${encodeURIComponent(text)}`);
    setSuggestions([]);
    setQuery('');
  };

  return (
    <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
      <Search>
        <SearchIconWrapper>
          <SearchIcon />
        </SearchIconWrapper>
        <StyledInputBase
          placeholder="Search…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        {suggestions.length > 0 && (
          <Paper
            sx={{
              position: 'absolute',
              top: '100%',
              left: 0,
              width: '100%',
              zIndex: 10,
              mt: 1,
            }}
          >
            <List dense>
              {suggestions.map((item) => (
                <ListItem
                  key={item.post_id}
                  button
                  onClick={() =>
                    handleSuggestionClick(item.post_title || item.resource_name)
                  }
                >
                  <ListItemText
                    primary={item.post_title || item.resource_name}
                    secondary={
                      <>
                        {`by @${item.author_username}`}<br />
                        {item.resource_name && item.resource_version
                          ? `Resource: ${item.resource_name} v${item.resource_version}`
                          : ''}
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        )}
      </Search>
    </Box>
  );
}
