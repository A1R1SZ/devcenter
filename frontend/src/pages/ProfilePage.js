import './App.css';
import DevContent from '../components/devContent';
import { Avatar, Box, Card, Typography } from '@mui/material';
import TopNavbar from '../components/topNavbar';
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useParams } from 'react-router-dom';

function ProfilePage() {
  const { userId } = useParams(); // dynamic author ID
  const [username, setUsername] = useState('');
  const [userPosts, setUserPosts] = useState([]);

    useEffect(() => {
    const token = localStorage.getItem('token');

    if (userId) {
        // Visiting someone else's profile
        fetch(`https://devcenter-kofh.onrender.com/get-user-posts/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => res.json())
        .then((data) => {
            setUsername(data.username || 'Unknown');
            setUserPosts(data.posts || []);
        })
        .catch((err) => console.error('Failed to fetch profile:', err));
    } else if (token) {
        // Visiting your own profile
        try {
        const decoded = jwtDecode(token);
        setUsername(decoded.username || 'User');
        fetch(`https://devcenter-kofh.onrender.com/get-user-posts/${decoded.userId}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => setUserPosts(data.posts || []))
            .catch((err) => console.error('Failed to fetch posts:', err));
        } catch (error) {
        console.error('Error decoding token:', error);
        }
    }
    }, [userId]);

      useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const decoded = jwtDecode(token);
            setUsername(decoded.username || 'User');
          } catch (error) {
            console.error('Error decoding token:', error);
          }
        }
      }, []);

    return (
        <>
            <TopNavbar />
            <Box
                sx={{
                    position: 'fixed',
                    left: '50px',
                    top: '45%',
                    transform: 'translateY(-50%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Avatar sx={{ width: 80, height: 80, mb: 1 }}>N</Avatar> 
                <Typography
                    sx={{
                        color: 'white',
                        fontWeight: 600,
                        fontSize: 30,
                    }}
                >
                    @{username}
                </Typography>
            </Box>
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
                27 February 2025
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
                        }}
                    >
            {userPosts.length === 0 ? (
            <Typography sx={{ color: 'white', mt: 4, textAlign: 'center' }}>
                You haven’t posted anything yet.
            </Typography>
            ) : (
            userPosts.map((post) => (
            <DevContent
                key={post.post_id}
                postId={post.post_id}
                title={post.post_title}
                content={post.post_content}
                username={post.author_username}
                currentUserId={post.post_author}
                postAuthorId={post.post_author}
                currentUserRole={"user"}
                category={post.resource_tag_name}
                resource_name={post.resource_title}
                resource_version={post.resource_version}
                resource_color={post.resource_color || '#8b8b8b'}
                postImage={post.post_image}
                commentCounter={post.post_comment}
                favouriteCounter={post.post_like_count}
                bookmarkCounter={post.post_bookmark_count}
                isLiked={post.is_liked}
                isBookmarked={post.is_bookmarked}
                onClick={() => {}}
                onPostDelete={(id) =>
                setUserPosts((prev) => prev.filter((p) => p.post_id !== id))
                }
                resource_tag={post.resource_tag_name}
                postDate={post.post_created_at}
            />
            ))
            )}
                    </Card>
                </Box>
            </Box>
        </>
    );
}

export default ProfilePage;
