import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Box, Divider, Drawer, List, ListItem, ListItemButton, ListItemText, ListItemIcon, Typography } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import LabelIcon from '@mui/icons-material/Label';
import BarChartIcon from '@mui/icons-material/BarChart';
import DescriptionIcon from '@mui/icons-material/Description';
import SettingsIcon from '@mui/icons-material/Settings';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { AccountBox } from '@mui/icons-material';

const menuItems = [
  { text: 'HOMEPAGE', icon: <HomeIcon />, link: '/homepage' },
  { text: 'TAGS', icon: <LabelIcon />, link: '/tags' },
  { text: 'ANALYTICS', icon: <BarChartIcon />, link: '/analytics' },
  { text: 'DOCUMENTATION', icon: <DescriptionIcon />, link: '/documentation' },
  { text: 'PROFILE', icon: <AccountBox/>, link: '/profile' },
  { text: 'SETTINGS', icon: <SettingsIcon />, link: '/settings' },
  { text: 'LOGOUT', icon: <ExitToAppIcon />, link: '/' },
];

export default function SideNavbar({ open, toggleSideNavbar }) {
  const location = useLocation(); // Get the current URL path

  return (
    <Drawer open={open} onClose={toggleSideNavbar}>
      <Box
        sx={{ width: 300, height: '100%', backgroundColor: '#393636', color: 'white' }}
        role="presentation"
        onClick={toggleSideNavbar}
      >
        <List sx={{ textAlign: 'center' }}>
          <Typography sx={{ padding: '10px' }}>
            <b>MENU</b>
          </Typography>
          <Divider sx={{ marginTop: '10px' }} />
          {menuItems.map(({ text, icon, link }) => (
            <ListItem key={text} disablePadding>
              <ListItemButton
                component={Link}
                to={link}
                sx={{
                  padding: '15px',
                  backgroundColor: location.pathname === link ? '#2A2828' : 'transparent', // Highlight active item
                  '&:hover': {
                    backgroundColor: '#575454',
                    transition: '0.3s ease-in-out',
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'white' }}>{icon}</ListItemIcon>
                <ListItemText primary={text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
}
