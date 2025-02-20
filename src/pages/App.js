import './App.css';
import { Button, Card, CardContent, Link, TextField, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

function App() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <Card sx={{ maxWidth: 500, textAlign: 'center', padding: '25px', paddingTop: '50px', paddingBottom: '50px', borderRadius: '16px' }}>
        <CardContent>
          <Typography variant='h1'>DevCenter</Typography>

          <TextField label='Username' required fullWidth margin='normal' />
          <TextField label='Password' required type='password' fullWidth margin='normal' />

          <Typography>
            Forget Password? <Link href='#'>Click here</Link>
          </Typography>

          <Typography>
            Sign in as <Link component={RouterLink} to='/homepage'>Guest</Link>
          </Typography>

          <Button sx={{ backgroundColor: 'darkgreen', color: 'white', marginTop: '10px', marginBottom: '10px', padding: '10px', width: 150 }}>Sign In</Button>

          <Typography>
            Don't have an account? <Link component={RouterLink} to="/register">Register Here</Link>
          </Typography>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
