import React, { useState } from 'react';
import { Box, Card, Container, Divider, Typography, IconButton, Menu, MenuItem } from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CommentIcon from '@mui/icons-material/Comment';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useRole } from '../data/roleData';


export default function DevContent({ title, category, content, username, currentUser}) {
  const [isFavoriteActive, setIsFavoriteActive] = useState(false);
  const [isCommentActive, setIsCommentActive] = useState(false);
  const [isBookmarkActive, setIsBookmarkActive] = useState(false);

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const { role } = useRole(); // This will be either 'user' or 'moderator'


  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const isOwner = currentUser === username;
  const isModerator = role === 'moderator';

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
          position: 'relative',
        }}
      >
        {/* More Icon */}
        <IconButton
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            color: 'white',
          }}
          onClick={handleClick}
        >
          <MoreVertIcon sx={{ fontSize: '25px' }} />
        </IconButton>

        {/* Dropdown Menu */}
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          PaperProps={{
            sx: {
              backgroundColor: '#333',
              color: 'white',
              minWidth: '150px',
              borderRadius: '8px',
            },
          }}
        >
          {isModerator && (
            <MenuItem onClick={handleClose}>Remove Content</MenuItem>
          )}
          {isOwner && (
            <>
              <MenuItem onClick={handleClose}>Edit</MenuItem>
              <MenuItem onClick={handleClose}>Delete</MenuItem>
            </>
          )}
          <MenuItem onClick={handleClose}>Share</MenuItem>
          <MenuItem onClick={handleClose}>Report</MenuItem>
        </Menu>

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