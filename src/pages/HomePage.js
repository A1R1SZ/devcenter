// HomePage.js
import './App.css';
import CatNavbar from '../components/catNavbar';
import DevContent from '../components/devContent';
import { Box, Card, Typography } from '@mui/material';
import TopNavbar from '../components/topNavbar';
import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DevContentModal from '../components/devContentModal';

function HomePage() {
    const [contents, setContents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPost, setSelectedPost] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [selectedTab, setSelectedTab] = useState(0);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    

    const updatePostInList = (updatedPost) => {
    setContents(prev =>
        prev.map(post =>
        Number(post.post_id) === Number(updatedPost.post_id)? { ...post, ...updatedPost } : post
        )
    );
    };


    const handleTabChange = ( _, newValue) =>{
        setSelectedTab(newValue);
    }

    const filteredContents = useMemo(() => {
    return contents.filter(item =>
        selectedTab === 0 ? item.post_type === 'Official' : item.post_type === 'Unofficial'
    );
    }, [contents, selectedTab]);

    const today = new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });

    const navigate = useNavigate();

            const fetchContents = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;

            try {
                const response = await axios.get('http://localhost:5000/post', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setContents(response.data);
            } catch (err) {
                console.error('Failed to fetch contents', err);
            } finally {
                setLoading(false);
            }
        };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/"); // Redirect to login if not logged in
        }
    }, [navigate]);

    useEffect(() => {
        fetchContents();
    }, []);

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;

            try {
                const response = await axios.get("http://localhost:5000/api/user/profile", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setCurrentUser(response.data.username);
            } catch (err) {
                console.error("Failed to fetch user", err);
            }
        };

        fetchUser();
    }, []);

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
                HOMEPAGE
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
                        <CatNavbar  value={selectedTab} onChange={handleTabChange}/>

                        {loading ? (
                            <Typography color="white" sx={{ textAlign: 'center', marginTop: '50px' }}>
                                Loading...
                            </Typography>
                        ) : contents.length === 0 ? (
                            <Typography color="white" sx={{ textAlign: 'center', marginTop: '50px' }}>
                                No content available.
                            </Typography>
                        ) : (
                            filteredContents.map((item) => (
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
                                    currentUser={currentUser}
                                    commentCounter={item.post_comment}
                                    postImage={
                                    item.post_graphic
                                        ? item.post_graphic.startsWith("http")
                                        ? item.post_graphic // online image
                                        : `http://localhost:5000/uploads/${item.post_graphic}` // local image
                                        : null
                                    }
                                    resource_color={item.resource_color}
                                    resource_version={item.resource_version}
                                />
                            ))
                        )}
                        {selectedPost && (
                            <DevContentModal
                                post={selectedPost}
                                onClose={async () => {
                                try {
                                    const token = localStorage.getItem('token');
                                    const response = await axios.get('http://localhost:5000/post', {
                                    headers: { Authorization: `Bearer ${token}` },
                                    });

                                    const freshData = response.data;

                                    // 💣 Nuclear soft refresh: clear first, then reset
                                    setContents([]); 
                                    setTimeout(() => {
                                    setContents(freshData); 
                                    setRefreshTrigger(prev => prev + 1); // 🔄 trigger re-render via new key
                                    }, 50);

                                    setSelectedPost(null); // Close modal
                                } catch (err) {
                                    console.error('Failed to refresh after modal close', err);
                                    setSelectedPost(null);
                                }
                                }}
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

export default HomePage;
