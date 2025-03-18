import './App.css';
import CatNavbar from '../components/catNavbar';
import DevContent from '../components/devContent';
import { Box, Card, Typography } from '@mui/material';
import TopNavbar from '../components/topNavbar';
import axios from 'axios';
import { useEffect, useState } from 'react';

function HomePage() {
    const [contents, setContents] = useState([]);
    const [loading, setLoading] = useState(true);

    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

    useEffect(() => {
        const fetchContents = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/contents');
                setContents(response.data);
            } catch (err) {
                console.error('Failed to fetch contents', err);
            } finally {
                setLoading(false);
            }
        };

        fetchContents();
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

                        {/* Static Example Preview */}
                        <DevContent
                            title="🚀 Sample Post"
                            category="Example"
                            content="This is an example preview of how your DevContent post will look like."
                            username="sample_user"
                        />

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
                                    key={item.id}
                                    title={item.title}
                                    category={item.category}
                                    content={item.content}
                                    username={item.username}
                                />
                            ))
                        )}
                    </Card>
                </Box>
            </Box>
        </>
    );
}

export default HomePage;
