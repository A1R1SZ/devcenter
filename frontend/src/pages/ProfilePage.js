import './App.css';
import DevContent from '../components/devContent';
import { Avatar, Box, Button, Card, Typography } from '@mui/material';
import TopNavbar from '../components/topNavbar';
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate, useParams } from 'react-router-dom';
import DevContentModal from '../components/devContentModal';
import axios from 'axios';

function ProfilePage() {
    const baseURL = process.env.REACT_APP_API_URL;
    const { userId } = useParams(); // dynamic author ID
    const [contents, setContents] = useState([]);
    const [username, setUsername] = useState('');
    const [selectedPost, setSelectedPost] = useState(null); 
    const [userPosts, setUserPosts] = useState([]);
    const [token, setToken] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
        const [currentUser, setCurrentUser] = useState({ id: null, role: null });


    const updatePostInList = (updatedPost) => {
        setContents(prev =>
            prev.map(post =>
                Number(post.post_id) === Number(updatedPost.post_id) ? { ...post, ...updatedPost } : post
            )
        );
    };

    useEffect(() => {
    const token = localStorage.getItem('token');

    if (userId) {
        // Visiting someone else's profile
        fetch(`${baseURL}/get-user-posts/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => res.json())
        .then((data) => {
            setUsername(data.username || 'Unknown');
            setUserPosts(data.posts || []);
            console.log("data stuff",data)
        })
        .catch((err) => console.error('Failed to fetch profile:', err));
    } else if (token) {
        // Visiting your own profile
        try {
        const decoded = jwtDecode(token);
        setUsername(decoded.username || 'User');
        fetch(`${baseURL}/get-user-posts/${decoded.userId}`, {
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

        // ✅ Fetch user after token is ready
    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;

            try {
                const response = await axios.get(`${baseURL}/get-profile-info`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                console.log("✅ profile data:", response.data);
                setCurrentUser({ id: response.data.id, role: response.data.role });
            } catch (err) {
                console.error("❌ Failed to fetch user", err);
            }
        };

        fetchUser();
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
            userPosts.map((item) => (
                <DevContent
                    onClick={(openForum) => {
                        setSelectedPost({ ...item, openForum });
                    }}
                    key={`${item.post_id}-${refreshTrigger}`}
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
                                : `${baseURL}/uploads/${item.post_graphic}`
                            : null
                    }
                    resource_color={item.resource_color}
                    resource_version={item.resource_version}
                    postAuthorId={item.post_author}
                    resource_tag={item.resource_tag_name}
                    postDate={item.post_created_at}
                    resource_desc={item.resource_desc}
                    post_desc={item.post_desc}
                />
            ))
            )}
             {selectedPost && (
                <DevContentModal
                    post={selectedPost}
                    onClose={async () => {
                        try {
                            const response = await axios.get(`${baseURL}/post`, {
                                headers: { Authorization: `Bearer ${token}` },
                            });

                            const freshData = response.data;

                            setContents([]);
                            setTimeout(() => {
                                setContents(freshData);
                                setRefreshTrigger(prev => prev + 1);
                            }, 50);

                            setSelectedPost(null);
                        } catch (err) {
                            console.error('Failed to refresh after modal close', err);
                            setSelectedPost(null);
                        }
                    }}
                    onPostDelete={(deletedId) =>
                        setContents((prev) => prev.filter((post) => post.post_id !== deletedId))
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

export default ProfilePage;
