import React, { useState, useRef } from 'react';
import {
  Box,
  Card,
  Divider,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Popover
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CommentIcon from '@mui/icons-material/Comment';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { likePost, bookmarkPost, deletePost } from '../connection/api/postActions';
import { useNavigate } from 'react-router-dom';

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
  currentUserId,
  currentUserRole,
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
  onPostDelete,
  postAuthorId,
  resource_tag,
  postDate,
}) {
  const [isCommentActive, setIsCommentActive] = useState(false);
  const [isFavoriteActive, setIsFavoriteActive] = useState(isLiked);
  const [isBookmarkActive, setIsBookmarkActive] = useState(isBookmarked);
  const [likes, setLikes] = useState(Number(favouriteCounter) || 0);
  const [bookmarks, setBookmarks] = useState(Number(bookmarkCounter) || 0);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const [infoAnchorEl, setInfoAnchorEl] = useState(null);

  const navigate = useNavigate();
  
  const handleAuthorClick = (e) => {
    e.stopPropagation();
    navigate(`/profile/${postAuthorId}`);
  };

    const formattedDate = postDate
    ? new Date(postDate).toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '';


  
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

  


  const isOwner = currentUserId === postAuthorId;
  const isAdmin = currentUserRole === 'moderator';
  console.log("currentUser ID:", currentUserId, "postAuthor ID:", postAuthorId);
  console.log("role:", currentUserRole, "isAdmin:", isAdmin);
  // console.log('currentUser:', currentUser, 'postAuthor:', username, 'isOwner:', isOwner);
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

  const hasMedia = postImage && postImage !== 'null' && postImage.trim() !== '';

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
        <Box onClick={(e) => setInfoAnchorEl(e.currentTarget)}>
          <Typography sx={{ color: 'black', fontWeight: 600, fontSize: 15 }}>
            {resource_name}
          </Typography>
        </Box>

          <Divider orientation="vertical" flexItem sx={{ mx: 2, backgroundColor: 'black' }} />

        <Box onClick={(e) => setInfoAnchorEl(e.currentTarget)}>
          <Typography sx={{ fontWeight: 600, fontSize: 15 }}>
            {resource_version || 'Unknown'}
          </Typography>
        </Box>
          <Divider orientation="vertical" flexItem sx={{ mx: 2, backgroundColor: 'black' }} />
          <Box onClick={(e) => setInfoAnchorEl(e.currentTarget)}>
            <Typography sx={{ fontWeight: 600, fontSize: 15 }}>
              {resource_tag || 'No Tag'}
            </Typography>
          </Box>
          <Divider orientation="vertical" flexItem sx={{ mx: 2, backgroundColor: 'black' }} />
          <Typography
            sx={{ fontWeight: 600, fontSize: 15, cursor: 'pointer' }}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/profile/${postAuthorId}`);
            }}
          >
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
          display: 'flex',
          flexDirection: hasMedia ? 'row' : 'column',
          alignItems: hasMedia ? 'stretch' : 'flex-start',
          height: 'auto',
          minHeight: hasMedia ? '250px' : 'unset',
          overflow: 'hidden',
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
          {isAdmin && <MenuItem onClick={handleClose}>Remove Content</MenuItem>}
          {isOwner && [
            <MenuItem key="edit" onClick={handleClose}>Edit</MenuItem>,
            <MenuItem
              key="delete"
              onClick={async (e) => {
                e.stopPropagation();
                handleClose();
                const token = localStorage.getItem('token');
                try {
                  await deletePost(postId, token);
                  if (typeof onPostDelete === 'function') {
                    onPostDelete(postId);
                  }
                } catch (err) {
                  console.error("Error deleting post", err);
                }
              }}
            >
              Delete
            </MenuItem>
          ]}
          <MenuItem onClick={handleClose}>Share</MenuItem>
          <MenuItem onClick={handleClose}>Report</MenuItem>
        </Menu>

        {hasMedia && (
          <Box sx={{ width: hasMedia ? '300px' : '0px', height: '100%', flexShrink: 0, display: hasMedia ? 'block' : 'none' }}>
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
          {/* ✅ Display date at bottom right */}
          {formattedDate && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 8,
                right: 16,
              }}
            >
              <Typography
                sx={{
                  color: 'grey',
                  fontSize: '11px',
                }}
              >
                {formattedDate}
              </Typography>
            </Box>
          )}
        </Box>
      </Card>

      <Popover
        open={Boolean(infoAnchorEl)}
        anchorEl={infoAnchorEl}
        onClose={() => setInfoAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: {
              p: 2,
              maxWidth: 300,
              backgroundColor: '#333',
              color: 'white',
              borderRadius: 2,
            },
          },
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
          Resource Details
        </Typography>
        <Typography variant="body2">
          <strong>Name:</strong> {resource_name}<br />
          <strong>Version:</strong> {resource_version || 'Unknown'}
        </Typography>
      </Popover>
    </>
  );
}
