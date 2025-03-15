import { Avatar, Box, Card, Container, Divider, TextField, Typography } from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import * as React from 'react';

export default function DevContent() {
    return (
        <>
            <Card sx={{backgroundColor:'orange',borderRadius:0,padding:'5px',paddingLeft:'25px',width:'45%',borderTopRightRadius:'5px',borderTopLeftRadius:'5px'}}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>  
                <Typography sx={{ color: 'black', fontWeight: 600, fontSize: 15 }}>
                    Java
                </Typography>
                
                <Divider
                    orientation="vertical"
                    flexItem
                    sx={{
                        backgroundColor: 'black',
                        width: '1px',
                        height: '40px',
                        marginX: 2,
                    }}
                />

                <Typography sx={{ fontWeight: 600, fontSize: 15 }}>
                    Bugs
                </Typography>

                <Divider
                    orientation="vertical"
                    flexItem
                    sx={{
                        backgroundColor: 'black',
                        width: '1px',
                        height: '40px',
                        marginX: 2,
                    }}
                />
                
                <Typography sx={{ fontWeight: 600, fontSize: 15 }}>
                    @JavaDeveloper
                </Typography>
            </Box>
            </Card>
            <Card sx={{ backgroundColor: '#2A2828', borderWidth: '5px', borderStyle: 'solid', borderColor: 'orange' ,borderRadius:0}}>
                {/* <Card sx={{ backgroundColor: 'orange',padding:'15px',width:'30%',borderRadius:'0px',borderBottomRightRadius:'15px'}}>
                    <b>@JAVA DEVELOPER TEAM</b>
                </Card> */}
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%',padding:'15px' }}>
                    <ImageIcon sx={{color:'white',fontSize:'100px'}}/>
                    <Container>
                    <Typography sx={{ color: 'white',fontSize:'24px' }}>
                            <b>Java Test Update 1.2</b>
                    </Typography>
                    <Typography sx={{ color: 'grey',fontSize:'12px' }}>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                    </Typography>
                    </Container>
                </Box>
            </Card>
            {/* <Card sx={{ backgroundColor: 'orange', borderRadius: '0', padding: '25px' ,borderBottomRightRadius:'15px',borderBottomLeftRadius:'15px' }}>
                <TextField
                    placeholder='Type your comment here...'
                    multiline
                    maxRows={4}
                    variant='filled'
                    fullWidth
                    sx={{
                        backgroundColor: '#2A2828',
                        input: { color: 'white' },
                        '& .MuiInputBase-input': { color: 'white' },
                        padding: '2.5px',
                        borderRadius: '10px'
                    }}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', marginTop: '10px' }}>
                    <Avatar>H</Avatar>
                    <Card sx={{ backgroundColor: '#2A2828', padding: '15px', borderRadius: '10px', marginLeft: '10px', flexGrow: 1 }}>
                        <Typography sx={{ color: 'white' }}>
                            <b>@USER2</b>
                        </Typography>
                        <Typography sx={{ color: 'grey' }}>
                            <b>This acts as an example of the preset's comment</b>
                        </Typography>
                    </Card>
                </Box>
            </Card> */}
        </>
    );
}
