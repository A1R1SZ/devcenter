import './App.css';
import { Button, Card, CardContent, Link, TextField, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

function RegistrationPage() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <Card sx={{ maxWidth: 500, textAlign: 'center', padding: '25px', paddingTop: '50px', paddingBottom: '50px', borderRadius: '16px' }}>
        <CardContent>
          <Typography variant='h1'>DevCenter</Typography>
          <Typography variant='subtitle1'>Welcome New User</Typography>

          <TextField label='Username' required fullWidth margin='normal' />
          <TextField label='Email' required fullWidth margin='normal' />
          <TextField label='Password' required type='password' fullWidth margin='normal' />

          <Button sx={{ backgroundColor: 'darkgreen', color: 'white', marginTop: '10px', marginBottom: '10px', padding: '10px', width: 150 }}>Create New Account</Button>

          <Typography>
            Instead? <Link component={RouterLink} to="/">Sign In</Link>
          </Typography>
        </CardContent>
      </Card>
    </div>
  );
}

export default RegistrationPage;
