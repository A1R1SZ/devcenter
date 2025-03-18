import React, { useState } from 'react';
import { Box, Card, Container, Divider, Typography, IconButton } from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CommentIcon from '@mui/icons-material/Comment';
import BookmarkIcon from '@mui/icons-material/Bookmark';

export default function DevContent({ title, category, content, username }) {
  const [isFavoriteActive, setIsFavoriteActive] = useState(false);
  const [isCommentActive, setIsCommentActive] = useState(false);
  const [isBookmarkActive, setIsBookmarkActive] = useState(false);

  return (
    <>
      <Card
        sx={{
          backgroundColor: 'orange',
          borderRadius: '5px 5px 0 0',
          px: '25px',
          py: '5px',
          width: '45%',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography sx={{ color: 'black', fontWeight: 600, fontSize: 15 }}>
            {title}
          </Typography>

          <Divider orientation="vertical" flexItem sx={{ mx: 2, backgroundColor: 'black' }} />

          <Typography sx={{ fontWeight: 600, fontSize: 15 }}>
            {category}
          </Typography>

          <Divider orientation="vertical" flexItem sx={{ mx: 2, backgroundColor: 'black' }} />

          <Typography sx={{ fontWeight: 600, fontSize: 15 }}>
            @{username || 'Unknown'}
          </Typography>
        </Box>
      </Card>

      <Card
        sx={{
          backgroundColor: '#2A2828',
          border: '5px solid orange',
          borderRadius: '0 0 5px 5px',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', p: '15px' }}>
          <ImageIcon sx={{ color: 'white', fontSize: '100px' }} />
          <Container>
            <Typography sx={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}>
              {title}
            </Typography>
            <Typography sx={{ color: 'grey', fontSize: '12px' }}>
              {content}
            </Typography>
          </Container>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', p: '10px' }}>
          <IconButton onClick={() => setIsFavoriteActive(!isFavoriteActive)}>
            <FavoriteIcon sx={{ color: isFavoriteActive ? 'red' : 'white' }} />
          </IconButton>
          <IconButton onClick={() => setIsCommentActive(!isCommentActive)}>
            <CommentIcon sx={{ color: isCommentActive ? 'lightblue' : 'white' }} />
          </IconButton>
          <IconButton onClick={() => setIsBookmarkActive(!isBookmarkActive)}>
            <BookmarkIcon sx={{ color: isBookmarkActive ? 'orange' : 'white' }} />
          </IconButton>
        </Box>
      </Card>
    </>
  );
}
