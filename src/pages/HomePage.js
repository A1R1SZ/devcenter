// HomePage.js
import './App.css';
import CatNavbar from '../components/catNavbar';
import DevContent from '../components/devContent';
import { Box, Card, Typography } from '@mui/material';
import TopNavbar from '../components/topNavbar';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DevContentModal from '../components/devContentModal';

function HomePage() {
    const [contents, setContents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPost, setSelectedPost] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    const today = new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });

    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/"); // Redirect to login if not logged in
        }
    }, [navigate]);

    useEffect(() => {
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
                        <CatNavbar />

                        {loading ? (
                            <Typography color="white" sx={{ textAlign: 'center', marginTop: '50px' }}>
                                Loading...
                            </Typography>
                        ) : contents.length === 0 ? (
                            <Typography color="white" sx={{ textAlign: 'center', marginTop: '50px' }}>
                                No content available.
                            </Typography>
                        ) : (
                            contents.map((item) => (
                                <DevContent
                                    onClick={() => {setSelectedPost(item);console.log("Selected item",item)}}
                                    key={item.post_id}
                                    resource_name={item.resource_title}
                                    title={item.post_title}
                                    category={item.post_type}
                                    content={item.post_content}
                                    username={item.author_username}
                                    currentUser={currentUser}
                                    favouriteCounter={item.post_like}
                                    commentCounter={item.post_comment}
                                    bookmarkCounter={item.post_bookmark}
                                    postImage={item.post_graphic}
                                    resource_color={item.resource_color}
                                    resource_version={item.resource_version}
                                />
                            ))
                        )}
                        {selectedPost && (
                            <DevContentModal
                                post={selectedPost}
                                onClose={() => setSelectedPost(null)}
                            />
                        )}
                    </Card>
                </Box>
            </Box>
        </>
    );
}

export default HomePage;
