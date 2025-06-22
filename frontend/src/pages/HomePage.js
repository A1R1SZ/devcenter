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
    const [currentUser, setCurrentUser] = useState({ id: null, role: null });
    const [token, setToken] = useState(null);
    const [selectedTab, setSelectedTab] = useState(0);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const navigate = useNavigate();

    const updatePostInList = (updatedPost) => {
        setContents(prev =>
            prev.map(post =>
                Number(post.post_id) === Number(updatedPost.post_id) ? { ...post, ...updatedPost } : post
            )
        );
    };

    const handleTabChange = (_, newValue) => {
        setSelectedTab(newValue);
    };

    const filteredContents = useMemo(() => {
        if (selectedTab === 0) {
            return contents.filter(item => item.post_type === 'Official');
        } else if (selectedTab === 1) {
            return contents; // Already filtered by backend
        } else {
            return contents.filter(item => item.post_type === 'Unofficial');
        }
    }, [contents, selectedTab]);


    const today = new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });

    // ✅ Set token once and redirect if missing
    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (!storedToken) {
            navigate("/");
        } else {
            setToken(storedToken);
        }
    }, [navigate]);

    useEffect(() => {
    if (!token) return;

    const fetchContents = async () => {
        try {
            const endpoint =
                selectedTab === 1
                    ? 'https://devcenter-kofh.onrender.com/following-resources-posts'
                    : 'https://devcenter-kofh.onrender.com/post';

            const response = await axios.get(endpoint, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setContents(response.data);
        } catch (err) {
            console.error('❌ Failed to fetch contents', err);
        } finally {
            setLoading(false);
        }
    };

    fetchContents();
}, [token, selectedTab, refreshTrigger]);


    // ✅ Fetch user after token is ready
    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;

            try {
                const response = await axios.get("https://devcenter-kofh.onrender.com/get-profile-info", {
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

    // ✅ Fetch post contents after token is ready
    useEffect(() => {
        if (!token) return;

        const fetchContents = async () => {
            try {
                const response = await axios.get('https://devcenter-kofh.onrender.com/post', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setContents(response.data);
            } catch (err) {
                console.error('❌ Failed to fetch contents', err);
            } finally {
                setLoading(false);
            }
        };

        fetchContents();
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
                        <CatNavbar value={selectedTab} onChange={handleTabChange} />

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
                                    post_desc={item.post_desc}
                                />
                            ))
                        )}
                        {selectedPost && (
                            <DevContentModal
                                post={selectedPost}
                                onClose={async () => {
                                    try {
                                        const response = await axios.get('https://devcenter-kofh.onrender.com/post', {
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

export default HomePage;
