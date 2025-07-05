import './App.css';
import { useEffect, useState } from 'react';
import { Button, Card, CardContent, Link, TextField, Typography } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

function RegistrationPage() {
  const baseURL = process.env.REACT_APP_API_URL;
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(()=>{
    console.log("Username:",username)
  },[username])

  const handleRegister = async () => {
    setError('');
    
    try {
      const response = await fetch(`${baseURL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Registration successful!");
        navigate("/");
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError("Server error. Please try again later.");
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <Card sx={{ maxWidth: 500, textAlign: 'center', padding: '25px', paddingTop: '50px', paddingBottom: '50px', borderRadius: '16px' }}>
        <CardContent>
          <Typography variant='h1'>DevCenter</Typography>
          <Typography variant='subtitle1'>Welcome New User</Typography>

          {error && <Typography color="error">{error}</Typography>}

          <TextField label='Username' required fullWidth margin='normal' value={username} onChange={(e) => setUsername(e.target.value)} />
          <TextField label='Email' required fullWidth margin='normal' value={email} onChange={(e) => setEmail(e.target.value)} />
          <TextField label='Password' required type='password' fullWidth margin='normal' value={password} onChange={(e) => setPassword(e.target.value)} />

          <Button sx={{ backgroundColor: 'darkgreen', color: 'white', marginTop: '10px', marginBottom: '10px', padding: '10px', width: 150 }} onClick={handleRegister}>
            Create New Account
          </Button>

          <Typography>
            Instead? <Link component={RouterLink} to="/">Sign In</Link>
          </Typography>
        </CardContent>
      </Card>
    </div>
  );
}

export default RegistrationPage;
