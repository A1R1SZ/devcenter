import React, { useState } from "react";
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

const DevContentModal = ({ post, onClose,   favouriteCounter,commentCounter,bookmarkCounter,}) => {
  const [openForum, setOpenForum] = useState(false);
  const [comments, setComments] = useState([]);
  const [input, setInput] = useState("");

  const [isFavoriteActive, setIsFavoriteActive] = useState(false);
  const [isCommentActive, setIsCommentActive] = useState(false);
  const [isBookmarkActive, setIsBookmarkActive] = useState(false);

    const SocialActions = () => (
    <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 2, mt: 1 }}>
      <IconButton onClick={(e) => { e.stopPropagation(); setIsFavoriteActive(!isFavoriteActive); }}>
        <Typography color="white" sx={{ marginRight: '5px' }}>{post.post_like}</Typography>
        <FavoriteIcon sx={{ color: isFavoriteActive ? 'red' : 'white' }} />
      </IconButton>
      <IconButton onClick={(e) => { e.stopPropagation(); setIsBookmarkActive(!isBookmarkActive); }}>
        <Typography color="white">{post.post_bookmark}</Typography>
        <BookmarkIcon sx={{ color: isBookmarkActive ? 'orange' : 'white' }} />
      </IconButton>
    </Box>
  );

  if (!post) return null;

  const handleAddComment = () => {
    if (input.trim()) {
      setComments([...comments, input]);
      setInput("");
    }
  };

  const renderMedia = () => {
    if (!post.post_graphic) return null;

    const isExternalUrl = post.post_graphic.startsWith("http");
    const imageSrc = isExternalUrl
      ? post.post_graphic
      : `http://localhost:5000/uploads/${post.post_graphic}`;

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


  return (
    <Modal open={Boolean(post)} onClose={onClose}>
      <Box>
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
              <Typography>
                <b>Forum</b>
              </Typography>
            </AccordionSummary>
            <AccordionDetails
              sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
            >
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
                      key={index}
                      sx={{
                        mb: 1.5,
                        p: 1.5,
                        bgcolor: "#3A3838",
                        borderRadius: 2,
                        boxShadow: "0 0 4px rgba(0,0,0,0.2)",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mb: 1,
                        }}
                      >
                        <Avatar sx={{ width: 30, height: 30, fontSize: 14 }}>
                          U
                        </Avatar>
                        <Box sx={{ ml: 1 }}>
                          <Typography
                            variant="subtitle2"
                            sx={{ fontSize: 13 }}
                          >
                            Username
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ fontSize: 11, color: "gray" }}
                          >
                            Just now
                          </Typography>
                        </Box>
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{ fontSize: 14, color: "#ddd" }}
                      >
                        {comment}
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
          <Box sx={{ p: 3,flexGrow:1 }}>
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
            <Box  display="flex" justifyContent="space-between" alignItems="center">
              <SocialActions/>
              <IconButton onClick={() => setOpenForum((prev) => !prev)} sx={{color:"white"}}>
                <Typography  sx={{ marginRight: '5px' }}>{post.post_comment}</Typography>
                <ForumIcon />
              </IconButton>
            </Box>
            <Divider sx={{ my: 2, backgroundColor: "white", }} />

            <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", mb: 3,flexGrow:1}}>
              {post.post_content}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default DevContentModal;
