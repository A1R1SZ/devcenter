import './App.css';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DevContent from '../components/devContent';
import DevContentModal from '../components/devContentModal';
import TopNavbar from '../components/topNavbar';
import { Box, Card, Typography } from '@mui/material';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function SearchResultsPage() {
  const baseURL = process.env.REACT_APP_API_URL;
  const query = useQuery().get('q');
  const [results, setResults] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [currentUser, setCurrentUser] = useState({ id: null, role: null });
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const navigate = useNavigate();

  const updatePostInList = (updatedPost) => {
    const baseURL = process.env.REACT_APP_API_URL;
    setResults((prev) =>
      prev.map((post) =>
        Number(post.post_id) === Number(updatedPost.post_id)
          ? { ...post, ...updatedPost }
          : post
      )
    );
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      navigate('/');
    } else {
      setToken(storedToken);
    }
  }, [navigate]);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await axios.get(`${baseURL}/get-profile-info`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCurrentUser({ id: response.data.id, role: response.data.role });
      } catch (err) {
        console.error('❌ Failed to fetch user', err);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (!token || !query) return;

    const fetchResults = async () => {
      try {
        const res = await axios.get(`${baseURL}/search?q=${query}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setResults(res.data);
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [token, query]);

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
        SEARCH
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
        {new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        })}
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
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
            <Typography variant="h5" sx={{ color: 'white', mb: 2 }}>
              Search Results for: "{query}"
            </Typography>

            {loading ? (
              <Typography color="white" sx={{ textAlign: 'center', marginTop: '50px' }}>
                Loading...
              </Typography>
            ) : results.length === 0 ? (
              <Typography color="white" sx={{ textAlign: 'center', marginTop: '50px' }}>
                No results found.
              </Typography>
            ) : (
              results.map((post) => (
                <DevContent
                  onClick={(openForum) => setSelectedPost({ ...post, openForum })}
                  key={`${post.post_id}-${refreshTrigger}`}
                  postId={post.post_id}
                  favouriteCounter={post.post_like_count}
                  bookmarkCounter={post.post_bookmark_count}
                  isLiked={post.is_liked}
                  isBookmarked={post.is_bookmarked}
                  resource_name={post.resource_name}
                  title={post.post_title}
                  category={post.resource_tag_name}
                  content={post.post_content}
                  username={post.author_username}
                  currentUserId={currentUser.id}
                  currentUserRole={currentUser.role}
                  commentCounter={post.post_comment}
                  postImage={
                    post.post_graphic
                      ? post.post_graphic.startsWith('http')
                        ? post.post_graphic
                        : `${baseURL}/uploads/${post.post_graphic}`
                      : null
                  }
                  resource_color={post.resource_color}
                  resource_version={post.resource_version}
                  postAuthorId={post.post_author}
                  resource_tag={post.resource_tag_name} 
                  postDate={post.post_created_at}
                />
              ))
            )}

            {selectedPost && (
              <DevContentModal
                post={selectedPost}
                onClose={async () => {
                  try {
                    const res = await axios.get(`${baseURL}/search?q=${query}`, {
                      headers: { Authorization: `Bearer ${token}` },
                    });

                    const freshData = res.data;

                    setResults([]);
                    setTimeout(() => {
                      setResults(freshData);
                      setRefreshTrigger((prev) => prev + 1);
                    }, 50);

                    setSelectedPost(null);
                  } catch (err) {
                    console.error('❌ Failed to refresh after modal close', err);
                    setSelectedPost(null);
                  }
                }}
                onPostDelete={(deletedId) =>
                  setResults((prev) => prev.filter((post) => post.post_id !== deletedId))
                }
                openForumInitially={selectedPost.openForum}
                favouriteCounter={selectedPost.post_like_count}
                bookmarkCounter={selectedPost.post_bookmark_count}
                commentCounter={selectedPost.post_comment}
                isLiked={selectedPost.is_liked}
                isBookmarked={selectedPost.is_bookmarked}
                onPostUpdate={updatePostInList}
                
              />
            )}
          </Card>
        </Box>
      </Box>
    </>
  );
}
