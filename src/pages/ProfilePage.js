import './App.css';
import DevContent from '../components/devContent';
import { Avatar, Box, Card, Typography } from '@mui/material';
import TopNavbar from '../components/topNavbar';

function ProfilePage() {
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
                    @USERPROFILE
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
                    mt: 2,
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                    <Card
                        sx={{
                            backgroundColor: '#393636',
                            padding: '25px',
                            marginTop: '15px',
                            width: '50%',
                            borderTopLeftRadius: '15px',
                            borderTopRightRadius: '15px',
                        }}
                    >
                        <DevContent />
                    </Card>
                </Box>
            </Box>
        </>
    );
}

export default ProfilePage;
