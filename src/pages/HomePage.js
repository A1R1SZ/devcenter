import './App.css';
import NavBar from '../components/devNavbar'
import CatNavbar from '../components/catNavbar';
import DevContent from '../components/devContent';
import { Box, Card, Typography } from '@mui/material';
function HomePage(){
    return(
        <>
        <NavBar/>
        <Typography
            sx={{color:'white',textAlign:'center',fontWeight:500,fontSize:30,paddingTop:2,paddingBottom:2}}
            >HOMEPAGE
        </Typography>
        <CatNavbar/>
        <Box
            sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            }}
        >
            <Card sx={{ backgroundColor: '#393636' ,padding:'25px',marginTop:'15px',width:'50%'}}>
                <DevContent/>
            </Card>
        </Box>
        </>
    )
}

export default HomePage;