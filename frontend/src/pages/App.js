import './App.css';
import { useContext, useState } from 'react';
import { Button, Card, CardContent, Link, TextField, Typography } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';

function App() {
  const { refreshUser } = useContext(UserContext);
  const baseURL = process.env.REACT_APP_API_URL;
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError('');
    try {
      const response = await fetch(`${baseURL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token); // Store JWT token
        localStorage.setItem("username", username);
        refreshUser();
        navigate("/homepage"); // Redirect to homepage after login
      } else {
        setError(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Server error. Please try again later.");
    }
  };
  
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <Card sx={{ maxWidth: 500, textAlign: 'center', padding: '25px', paddingTop: '50px', paddingBottom: '50px', borderRadius: '16px' }}>
        <CardContent>
          <Typography variant='h1'>DevCenter</Typography>

          {error && <Typography color="error">{error}</Typography>}

          <TextField 
            label='Username' 
            required 
            fullWidth 
            margin='normal' 
            value={username} 
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField 
            label='Password' 
            required 
            type='password' 
            fullWidth 
            margin='normal' 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* <Typography>
            Forget Password? <Link href='#'>Click here</Link>
          </Typography>

          <Typography>
            Sign in as <Link component={RouterLink} to='/homepage'>Guest</Link>
          </Typography> */}

          <Button 
            sx={{ backgroundColor: 'darkgreen', color: 'white', marginTop: '10px', marginBottom: '10px', padding: '10px', width: 150 }} 
            onClick={handleLogin}
          >
            Sign In
          </Button>

          <Typography>
            Don't have an account? <Link component={RouterLink} to="/register">Register Here</Link>
          </Typography>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;