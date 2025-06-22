import React, { useEffect, useState } from "react";
import {
  Modal,
  Box,
  Typography,
  Divider,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputBase,
  Paper,
  Avatar,
} from "@mui/material";
import ForumIcon from "@mui/icons-material/Forum";
import SendIcon from "@mui/icons-material/Send";
import FavoriteIcon from '@mui/icons-material/Favorite';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import { likePost, bookmarkPost } from '../connection/api/postActions';
import axios from "axios";
import AnalyticForm from './analyticForm';


function getYouTubeEmbedUrl(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11
    ? `https://www.youtube.com/embed/${match[2]}`
    : null;
}

const modalStyle = {
  position: "absolute",
  top: "2.5%",
  left: "50%",
  transform: "translate(-50%, 0%)",
  width: "90%",
  maxWidth: 700,
  bgcolor: "#2A2828",
  boxShadow: 24,
  borderRadius: 2,
  overflow: "hidden",
  color: "white",
};

const DevContentModal = ({
  post,
  onClose,
  favouriteCounter,
  commentCounter,
  bookmarkCounter,
  isLiked,
  isBookmarked,
  onPostUpdate,
  openForumInitially,
}) => {

const [openForum, setOpenForum] = useState(openForumInitially || false);
  const [comments, setComments] = useState([]);
  const [input, setInput] = useState("");
  const [isFavoriteActive, setIsFavoriteActive] = useState(isLiked);
  const [isBookmarkActive, setIsBookmarkActive] = useState(isBookmarked);
  const [likes, setLikes] = useState(Number(favouriteCounter) || 0);
  const [bookmarks, setBookmarks] = useState(Number(bookmarkCounter) || 0);
  const [hasSubmittedAnalytics, setHasSubmittedAnalytics] = useState(false);
  


  const [analyticFormData, setAnalyticFormData] = useState({
    summary: '',
    difficulty: '',
    readTime: '',
    usefulness: 3,
    recommendation: 3,
    clarity:3,
  });


  const handleAnalyticSubmit = async () => {
    const token = localStorage.getItem('token');

    try {
      await axios.post(`https://devcenter-kofh.onrender.com/post/${post.post_id}/analytics`, analyticFormData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Analytics submitted successfully");
      setHasSubmittedAnalytics(true); // Disable the form
    } catch (err) {
      if (err.response?.status === 409) {
        alert("You have already submitted analytics for this documentation.");
        setHasSubmittedAnalytics(true);
      } else {
        console.error("Error submitting analytics:", err);
        alert("Failed to submit analytics.");
      }
    }
  };

  const checkAnalyticsStatus = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`https://devcenter-kofh.onrender.com/post/${post.post_id}/analytics/check`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHasSubmittedAnalytics(response.data.hasSubmitted);
    } catch (err) {
      console.error("Error checking analytics submission:", err);
    }
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    const token = localStorage.getItem('token');
    try {
      await likePost(post.post_id, token);
      await fetchSinglePost();
    } catch (err) {
      console.error("Error liking post from modal:", err);
    }
  };

  const handleBookmark = async (e) => {
    e.stopPropagation();
    const token = localStorage.getItem('token');
    try {
      await bookmarkPost(post.post_id, token);
      await fetchSinglePost();
    } catch (err) {
      console.error("Error bookmarking post from modal:", err);
    }
  };

  const fetchSinglePost = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`https://devcenter-kofh.onrender.com/post/${post.post_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const updatedPost = response.data;
      setIsFavoriteActive(updatedPost.is_liked);
      setIsBookmarkActive(updatedPost.is_bookmarked);
      setLikes(updatedPost.post_like_count);
      setBookmarks(updatedPost.post_bookmark_count);
      setComments(updatedPost.comments || []);

      
    } catch (error) {
      console.error("Failed to refresh modal content", error);
    }
  };

  useEffect(() => {
    if (post?.post_id) {
      fetchSinglePost();
      checkAnalyticsStatus();  // 👈 call this as well
    }
  }, [post?.post_id]);

  const SocialActions = () => (
    <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 2, mt: 1 }}>
      <IconButton onClick={handleLike}>
        <Typography color="white" sx={{ marginRight: '5px' }}>{likes}</Typography>
        <FavoriteIcon sx={{ color: isFavoriteActive ? 'red' : 'white' }} />
      </IconButton>
      <IconButton onClick={handleBookmark}>
        <Typography color="white">{bookmarks}</Typography>
        <BookmarkIcon sx={{ color: isBookmarkActive ? 'orange' : 'white' }} />
      </IconButton>
    </Box>
  );

  const handleAddComment = async () => {
    if (input.trim()) {
      const token = localStorage.getItem('token');
      try {
        await axios.post(`https://devcenter-kofh.onrender.com/post/${post.post_id}/comment`, {
          comment: input,
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setInput("");
        fetchSinglePost(); // Refresh all comments from DB
      } catch (err) {
        console.error("Failed to add comment:", err);
      }
    }
  };

  const renderMedia = () => {
    if (!post.post_graphic) return null;

    const isExternalUrl = post.post_graphic.startsWith("http");
    const imageSrc = isExternalUrl
      ? post.post_graphic
      : `https://devcenter-kofh.onrender.com/uploads/${post.post_graphic}`;

    if (imageSrc.includes("youtube.com") || imageSrc.includes("youtu.be")) {
      const embedUrl = getYouTubeEmbedUrl(imageSrc);
      return (
        <iframe
          width="100%"
          height="400px"
          src={embedUrl}
          title="YouTube video"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ borderTopLeftRadius: 8, borderTopRightRadius: 8 }}
        />
      );
    } else if (imageSrc.match(/\.(mp4|webm)$/i)) {
      return (
        <video
          controls
          style={{
            width: "100%",
            height: "400px",
            objectFit: "cover",
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
          }}
        >
          <source src={imageSrc} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      );
    } else {
      return (
        <img
          src={imageSrc}
          alt="Post visual"
          style={{
            width: "100%",
            height: "400px",
            objectFit: "contain",
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
          }}
        />
      );
    }
  };

  if (!post) return null;

  return (
    <Modal open={Boolean(post)} onClose={onClose}>
      <Box>
      {!hasSubmittedAnalytics && (
        <AnalyticForm
          formData={analyticFormData}
          setFormData={setAnalyticFormData}
          handleSubmit={handleAnalyticSubmit}
          disabled={hasSubmittedAnalytics}
        />
        )}
        {openForum && (
          <Accordion
            sx={{
              width: "25%",
              left: "74%",
              position: "absolute",
              top: "2.5%",
              height: "90%",
              bgcolor: "#2A2828",
              color: "white",
              borderRadius: 2,
              display: "flex",
              flexDirection: "column",
            }}
            defaultExpanded
          >
            <AccordionSummary>
              <Typography><b>Forum</b></Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
              <Paper
                component="form"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddComment();
                }}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  bgcolor: "#3A3838",
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 2,
                  boxShadow: "0 0 4px rgba(0,0,0,0.3)",
                  mb: 2,
                }}
              >
                <InputBase
                  placeholder="Add a comment..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  sx={{ ml: 1, flex: 1, color: "white" }}
                />
                <IconButton
                  type="submit"
                  sx={{ p: 1, color: input.trim() ? "#fff" : "gray" }}
                  disabled={!input.trim()}
                >
                  <SendIcon />
                </IconButton>
              </Paper>

              <Box sx={{ flexGrow: 1, overflowY: "auto", pr: 1 }}>
                {comments.length === 0 ? (
                  <Typography variant="body2" color="gray">
                    No comments yet.
                  </Typography>
                ) : (
                  comments.map((comment, index) => (
                    <Box
                      key={comment.comment_id || index}
                      sx={{
                        mb: 1.5,
                        p: 1.5,
                        bgcolor: "#3A3838",
                        borderRadius: 2,
                        boxShadow: "0 0 4px rgba(0,0,0,0.2)",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                        <Avatar sx={{ width: 30, height: 30, fontSize: 14 }}>U</Avatar>
                        <Box sx={{ ml: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontSize: 13 }}>
                            {comment.username || "Anonymous"}
                          </Typography>
                          <Typography variant="caption" sx={{ fontSize: 11, color: "gray" }}>
                            {comment.created_at ? new Date(comment.created_at).toLocaleString() : "Just now"}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="body2" sx={{ fontSize: 14, color: "#ddd" }}>
                        {comment.user_comment}
                      </Typography>
                    </Box>
                  ))
                )}
              </Box>
            </AccordionDetails>
          </Accordion>
        )}

        <Box sx={modalStyle}>
          {renderMedia()}
          <Box sx={{ p: 3, flexGrow: 1 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: "28px",
                  color: post.resource_color,
                }}
              >
                {post.post_title}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <SocialActions />
              <IconButton onClick={() => setOpenForum((prev) => !prev)} sx={{ color: "white" }}>
                <Typography sx={{ marginRight: '5px' }}>{comments.length}</Typography>
                <ForumIcon />
              </IconButton>
            </Box>
            <Divider sx={{ my: 2, backgroundColor: "white" }} />

            <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", mb: 3, flexGrow: 1 }}>
              {post.post_content}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default DevContentModal;
