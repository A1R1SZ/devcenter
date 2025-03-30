import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AppBar, Box, Toolbar, IconButton, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';
import SideNavbar from './sideNavbar';
import Searchbar from './searchbar';
import CreateContentButton from './createContentButton';
import CreateDocumentationButton from './createDocumentButton';
import { useRole } from '../data/roleData';
import CreateTagsButton from './createTagsButton';

export default function TopNavbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const toggleSideNavbar = () => setOpen((prev) => !prev);

  // This will check if the user is on the homepage "/"
  const {role} = useRole();
  const isHomePage = location.pathname === '/homepage';
  const isDocumenationPage = location.pathname === '/documentation';
  const isTagsPage = location.pathname ==='/tags';
  const isProfilePage = location.pathname === '/profile';

  const isModerator = role === 'moderator';

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

            {/* Only show CreateContentButton on homepage */}
            {(isHomePage || isProfilePage) && <CreateContentButton />}
            {isDocumenationPage && isModerator && <CreateDocumentationButton/>}
            {isTagsPage && isModerator && <CreateTagsButton/>}

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
