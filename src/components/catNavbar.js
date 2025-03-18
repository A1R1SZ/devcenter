import { AppBar, Box, Tab, Tabs } from '@mui/material';
import React, { useState } from 'react';

export default function CatNavbar() {
  const [value, setValue] = useState(0);

  const handleChange = (_, newValue) => {
    setValue(newValue);
  };

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
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        mb: '25px',
      }}
    >
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
          onChange={handleChange}
          variant="fullWidth"
          centered
          TabIndicatorProps={{ style: { display: 'none' } }}
        >
          <Tab label="News" sx={tabStyles(0)} />
          <Tab label="Content Creator" sx={tabStyles(1)} />
        </Tabs>
      </AppBar>
    </Box>
  );
}
