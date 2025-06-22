import React, { useState, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { AppBar, Box, Toolbar, IconButton, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';
import SideNavbar from './sideNavbar';
import Searchbar from './searchbar';
import CreateContentButton from './createContentButton';
import CreateDocumentationButton from './createDocumentButton';
import CreateTagsButton from './createTagsButton';
import { UserContext } from '../contexts/UserContext';

export default function TopNavbar() {
  const { username, role } = useContext(UserContext);
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const toggleSideNavbar = () => setOpen((prev) => !prev);

  const isHomePage = location.pathname === '/homepage';
  const isDocumenationPage = location.pathname === '/documentation';
  const isTagsPage = location.pathname === '/tags';
  const isProfilePage = location.pathname === '/profile';
  const isAdmin = role === 'moderator';

  return (
    <>
      <SideNavbar open={open} toggleSideNavbar={toggleSideNavbar} />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static" sx={{ backgroundColor: '#393636', px: 2, py: 1 }}>
          <Toolbar sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              onClick={toggleSideNavbar}
              sx={{
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

            {isHomePage || isProfilePage ? <CreateContentButton /> : null}
            {isDocumenationPage && isAdmin && <CreateDocumentationButton />}
            {isTagsPage && isAdmin && <CreateTagsButton />}

            <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto', gap: 1 }}>
              <IconButton size="large" color="inherit">
                <NotificationsIcon />
              </IconButton>
              <Typography variant="subtitle1" sx={{ color: 'white' }}>
                {username}
              </Typography>
              <IconButton size="large" color="inherit">
                <PersonIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>
      </Box>
    </>
  );
}
