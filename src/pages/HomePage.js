import './App.css';
import NavBar from '../components/devNavbar'
import { Typography } from '@mui/material';
function HomePage(){
    return(
        <>
        <NavBar/>
        <Typography
        sx={{color:'white',textAlign:'center',fontWeight:500,fontSize:30,paddingTop:2,paddingBottom:2}}
        >HOMEPAGE
        </Typography>
        </>
    )
}

export default HomePage;