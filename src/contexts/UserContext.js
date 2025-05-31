import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [username, setUsername] = useState('');
  const [token, setToken] = useState(null);
  const [userID, setUserID] = useState(null); // Add userID

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      try {
        const decoded = jwtDecode(storedToken);
        if (decoded.userID) setUserID(decoded.userID); // Option 1

        fetch('http://localhost:5000/get-profile-info', {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.username) setUsername(data.username);
            if (data.userID) setUserID(data.userID); // Option 2
          });
      } catch (err) {
        console.error('Invalid token', err);
      }
    }
  }, []);

  return (
    <UserContext.Provider
      value={{ username, setUsername, token, setToken, userID, setUserID }}
    >
      {children}
    </UserContext.Provider>
  );
};
