import React, { useState } from 'react';
import {
  Box,
  Card,
  Divider,
  Typography,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CommentIcon from '@mui/icons-material/Comment';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { likePost, bookmarkPost } from '../connection/api/postActions';
import { useRole } from '../data/roleData';

function getYouTubeEmbedUrl(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11
    ? `https://www.youtube.com/embed/${match[2]}`
    : null;
}

export default function DevContent({
  resource_name,
  title,
  category,
  content,
  username,
  currentUser,
  commentCounter,
  postImage,
  resource_color,
  onClick,
  resource_version,
  postId,
  isLiked,
  isBookmarked,
  favouriteCounter,
  bookmarkCounter,
}) {
  const [isCommentActive, setIsCommentActive] = useState(false);
  const [isFavoriteActive, setIsFavoriteActive] = useState(isLiked);
  const [isBookmarkActive, setIsBookmarkActive] = useState(isBookmarked);
  const [likes, setLikes] = useState(Number(favouriteCounter) || 0);
  const [bookmarks, setBookmarks] = useState(Number(bookmarkCounter) || 0);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const { role } = useRole();

  const handleClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (event) => {
    event?.stopPropagation();
    setAnchorEl(null);
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    const token = localStorage.getItem('token');
    try {
      await likePost(postId, token);
      setIsFavoriteActive(!isFavoriteActive);
      setLikes(prev => isFavoriteActive ? prev - 1 : prev + 1);
    } catch (err) {
      console.error("Error liking post", err);
    }
  };


  const handleBookmark = async (e) => {
    e.stopPropagation();
    const token = localStorage.getItem('token');
    try {
      await bookmarkPost(postId, token);
      setIsBookmarkActive(!isBookmarkActive);
      setBookmarks(prev => isBookmarkActive ? prev - 1 : prev + 1);
    } catch (err) {
      console.error("Error bookmarking post", err);
    }
  };

  


  const isOwner = currentUser === username;
  const isModerator = role === 'moderator';

  const SocialActions = () => (
    <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 2, mt: 2 }}>
      <IconButton onClick={handleLike}>
        <Typography color="white" sx={{ marginRight: '5px' }}>{likes}</Typography>
        <FavoriteIcon sx={{ color: isFavoriteActive ? 'red' : 'white' }} />
      </IconButton>
      <IconButton
        onClick={(e) => {
          e.stopPropagation();
          setIsCommentActive(true); // highlight icon
          onClick(true);            // pass signal to open forum
        }}
      >
        <Typography color="white" sx={{ marginRight: '5px' }}>{commentCounter}</Typography>
        <CommentIcon sx={{ color: isCommentActive ? 'lightblue' : 'white' }} />
      </IconButton>
      <IconButton onClick={handleBookmark}>
        <Typography color="white">{bookmarks}</Typography>
        <BookmarkIcon sx={{ color: isBookmarkActive ? 'orange' : 'white' }} />
      </IconButton>
    </Box>
  );

  const hasMedia = !!postImage;

  return (
    <>
      <Card
        
        sx={{
          backgroundColor: resource_color,
          borderRadius: '5px 5px 0 0',
          px: '25px',
          py: '5px',
          width: 'fit-content',
          mt: '12.5px',
          display: 'inline-block'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography sx={{ color: 'black', fontWeight: 600, fontSize: 15 }}>
            {resource_name}
          </Typography>
        <Divider orientation="vertical" flexItem sx={{ mx: 2, backgroundColor: 'black' }} />
          <Typography sx={{ fontWeight: 600, fontSize: 15 }}>
            {resource_version || 'Unknown'}
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
          borderWidth: '5px',
          borderStyle: 'solid',
          borderColor: resource_color,
          borderRadius: '0 0 5px 5px',
          position: 'relative',
          display: hasMedia ? 'flex' : 'block',
          flexDirection: hasMedia ? 'row' : 'column',
          overflow: 'hidden',
          height: hasMedia ? '250px' : 'auto',
          cursor: 'pointer'
        }}
        onClick={() => onClick(false)}
      >
        <IconButton
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            color: 'white',
            zIndex: 1
          }}
          onClick={handleClick}
        >
          <MoreVertIcon sx={{ fontSize: '25px' }} />
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          PaperProps={{
            sx: {
              backgroundColor: '#333',
              color: 'white',
              minWidth: '150px',
              borderRadius: '8px'
            }
          }}
        >
          {isModerator && <MenuItem onClick={handleClose}>Remove Content</MenuItem>}
          {isOwner && (
            <>
              <MenuItem onClick={handleClose}>Edit</MenuItem>
              <MenuItem onClick={handleClose}>Delete</MenuItem>
            </>
          )}
          <MenuItem onClick={handleClose}>Share</MenuItem>
          <MenuItem onClick={handleClose}>Report</MenuItem>
        </Menu>

        {hasMedia && (
          <Box sx={{ width: '300px', height: '100%', flexShrink: 0 }}>
            {postImage.includes('youtube.com') || postImage.includes('youtu.be') ? (
              <iframe
                width="100%"
                height="100%"
                style={{ borderRadius: 0, display: 'block' }}
                src={getYouTubeEmbedUrl(postImage)}
                title="YouTube video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : postImage.match(/\.(mp4|webm)$/i) ? (
              <video
                controls
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block'
                }}
              >
                <source src={postImage} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <img
                src={postImage}
                alt="Post visual"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
            )}
          </Box>
        )}

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: hasMedia ? 'space-between' : 'flex-start',
            padding: '15px',
            flexGrow: 1,
            textAlign: hasMedia ? 'left' : 'left',
            alignItems: hasMedia ? 'stretch' : 'flex-start'
          }}
        >
          <Typography sx={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}>
            {title}
          </Typography>
          <Typography sx={{ color: 'grey', fontSize: '12px', mt: 1 }}>
            {content}
          </Typography>
          <SocialActions />
        </Box>
      </Card>
    </>
  );
}
