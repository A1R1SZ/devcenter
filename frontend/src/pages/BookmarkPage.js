// BookmarkPage.js
import './App.css';
import TopNavbar from '../components/topNavbar';
import DevContent from '../components/devContent';
import { Box, Card, Typography } from '@mui/material';
import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DevContentModal from '../components/devContentModal';

function BookmarkPage() {
  const [bookmarkedContents, setBookmarkedContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [currentUser, setCurrentUser] = useState({ id: null, role: null });
  const [token, setToken] = useState(null);

  const navigate = useNavigate();

  const today = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      navigate("/");
    } else {
      setToken(storedToken);
    }
  }, [navigate]);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await axios.get("https://devcenter-kofh.onrender.com/get-profile-info", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCurrentUser({ id: response.data.id, role: response.data.role });
      } catch (err) {
        console.error("❌ Failed to fetch user", err);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (!token) return;

    const fetchBookmarked = async () => {
      try {
        const response = await axios.get('https://devcenter-kofh.onrender.com/bookmarks', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBookmarkedContents(response.data);
      } catch (err) {
        console.error('❌ Failed to fetch bookmarked posts', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarked();
  }, [token]);

  return (
    <>
      <TopNavbar />
      <Typography
        sx={{
          position: 'fixed',
          left: '20px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'white',
          fontWeight: 600,
          fontSize: 30,
        }}
      >
        BOOKMARKS
      </Typography>

      <Typography
        sx={{
          position: 'fixed',
          right: '20px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'white',
          fontWeight: 600,
          fontSize: 30,
        }}
      >
        {today}
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <Card
            sx={{
              backgroundColor: '#181818',
              padding: '20px',
              width: '55%',
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
            }}
          >
            {loading ? (
              <Typography color="white" sx={{ textAlign: 'center', marginTop: '50px' }}>
                Loading...
              </Typography>
            ) : bookmarkedContents.length === 0 ? (
              <Typography color="white" sx={{ textAlign: 'center', marginTop: '50px' }}>
                You have no bookmarked content.
              </Typography>
            ) : (
              bookmarkedContents.map((item) => (
                <DevContent
                  onClick={(openForum) => {
                    setSelectedPost({ ...item, openForum });
                  }}
                  key={item.post_id}
                  postId={item.post_id}
                  favouriteCounter={item.post_like_count}
                  bookmarkCounter={item.post_bookmark_count}
                  isLiked={item.is_liked}
                  isBookmarked={item.is_bookmarked}
                  resource_name={item.resource_title}
                  title={item.post_title}
                  category={item.post_type}
                  content={item.post_content}
                  username={item.author_username}
                  currentUserId={currentUser.id}
                  currentUserRole={currentUser.role}
                  commentCounter={item.post_comment}
                    postImage={
                        item.post_graphic
                        ? item.post_graphic.startsWith("http")
                            ? item.post_graphic
                            : `https://devcenter-kofh.onrender.com/uploads/${item.post_graphic}`
                        : null
                    }
                  resource_color={item.resource_color}
                  resource_version={item.resource_version}
                  postAuthorId={item.post_author}
                  resource_tag={item.resource_tag_name}
                  postDate={item.post_created_at}
                  resource_desc={item.resource_desc}
                />
              ))
            )}
            {selectedPost && (
              <DevContentModal
                post={selectedPost}
                onClose={() => setSelectedPost(null)}
                onPostDelete={(deletedId) =>
                  setBookmarkedContents((prev) =>
                    prev.filter((post) => post.post_id !== deletedId)
                  )
                }
                openForumInitially={selectedPost.openForum}
                favouriteCounter={selectedPost.post_like_count}
                bookmarkCounter={selectedPost.post_bookmark_count}
                commentCounter={selectedPost.post_comment}
                isLiked={selectedPost.is_liked}
                isBookmarked={selectedPost.is_bookmarked}
              />
            )}
          </Card>
        </Box>
      </Box>
    </>
  );
}

export default BookmarkPage;
