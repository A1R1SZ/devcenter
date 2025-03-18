import React, { useState } from 'react';
import { AppBar, Box, Toolbar, IconButton, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';
import SideNavbar from './sideNavbar';
import Searchbar from './searchbar';
import CreateContentButton from './createContentButton';

export default function TopNavbar() {
  const [open, setOpen] = useState(false);

  const toggleSideNavbar = () => setOpen((prev) => !prev);

  return (
    <>
      <SideNavbar open={open} toggleSideNavbar={toggleSideNavbar} />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static" sx={{ backgroundColor: '#393636', p: '7.5px' }}>
          <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={toggleSideNavbar}
              sx={{
                mr: 2,
                backgroundColor: '#555',
                borderRadius: '8px',
                transition: '0.3s',
                '&:hover': { backgroundColor: '#777' },
                '&:active': { backgroundColor: '#333' },
              }}
            >
              <MenuIcon />
            </IconButton>

            <Typography variant="h6" noWrap sx={{ color: 'white', fontWeight: 600 }}>
              DEVCENTER
            </Typography>

            <Searchbar />
            <CreateContentButton />

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton size="large" color="inherit" sx={{ ml: 2 }}>
                <NotificationsIcon />
              </IconButton>
              <Typography variant="h6" noWrap sx={{ color: 'white', mx: 1 }}>
                USER
              </Typography>
              <IconButton size="large" color="inherit" sx={{ ml: 1 }}>
                <PersonIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>
      </Box>
    </>
  );
}
