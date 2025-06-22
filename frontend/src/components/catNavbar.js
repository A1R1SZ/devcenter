// CatNavbar.js
import { AppBar, Box, Tab, Tabs } from '@mui/material';
import React from 'react';

export default function CatNavbar({ value, onChange }) {
  const tabStyles = (index) => ({
    margin: '2.5px',
    backgroundColor: value === index ? '#ffffff' : 'transparent',
    color: value === index ? '#000000' : '#ffffff',
    borderRadius: '10px',
    transition: '0.3s',
    '&:hover': {
      backgroundColor: value === index ? '#f0f0f0' : '#555555',
    },
  });

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: '25px' }}>
      <AppBar
        position="static"
        sx={{
          backgroundColor: '#393636',
          p: '10px',
          width: '50%',
          alignSelf: 'center',
          borderRadius: '20px',
          mt: '25px',
        }}
      >
        <Tabs
          value={value}
          onChange={onChange}
          variant="fullWidth"
          centered
          TabIndicatorProps={{ style: { display: 'none' } }}
        >
          <Tab label="Official Update" sx={tabStyles(0)} />
          <Tab label="Following" sx={tabStyles(1)}/>
          <Tab label="Community Post" sx={tabStyles(2)} />
        </Tabs>
      </AppBar>
    </Box>
  );
}
