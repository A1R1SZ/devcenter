import { AppBar, Box, Tab, Tabs } from '@mui/material';
import * as React from 'react';

export default function CatNavbar() {
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <AppBar
        position="static"
        sx={{
          backgroundColor: '#393636',
          padding: '10px',
          width: '50%',
          alignSelf: 'center',
          borderRadius: '20px',
        }}
      >
        <Tabs 
          value={value} 
          onChange={handleChange} 
          variant="fullWidth" 
          centered
          TabIndicatorProps={{
            style: { display: 'none' } // Hide the default underline indicator
          }}
        >
          <Tab 
            label="News" 
            sx={{
                margin:'2.5px',
                backgroundColor: value === 0 ? '#ffffff' : 'transparent',
                color: value === 0 ? '#000000' : '#ffffff',
                borderRadius: '10px',
                transition: '0.3s',
                '&:hover': {
                    backgroundColor: value === 0 ? '#f0f0f0' : '#555555',
                },
            }}
          />
          <Tab 
            label="Content Creator" 
            sx={{
                margin:'2.5px',
                backgroundColor: value === 1 ? '#ffffff' : 'transparent',
                color: value === 1 ? '#000000' : '#ffffff',
                borderRadius: '10px',
                transition: '0.3s',
                '&:hover': {
                    backgroundColor: value === 1 ? '#f0f0f0' : '#555555',
                },
            }}
          />
        </Tabs>
      </AppBar>
    </Box>
  );
}
