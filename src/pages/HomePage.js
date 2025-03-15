import './App.css';
import CatNavbar from '../components/catNavbar';
import DevContent from '../components/devContent';
import { Box, Card, Typography } from '@mui/material';
import TopNavbar from '../components/topNavbar';

function HomePage() {
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
                    <CatNavbar />
                    <DevContent />
                </Card>
                </Box>
            </Box>
        </>
    );
}

export default HomePage;
