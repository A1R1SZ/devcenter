import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [username, setUsername] = useState('');
  const [token, setToken] = useState(null);
  const [userID, setUserID] = useState(null);
  const [role, setRole] = useState(''); // ✅ Add role

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      try {
        const decoded = jwtDecode(storedToken);
        if (decoded.userID) setUserID(decoded.userID);

        fetch('http://localhost:5000/get-profile-info', {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        })
          .then((res) => res.json())
          .then((data) => {
            console.log("✅ Profile Info Received:", data); // 🔍 DEBUG
            if (data.username) setUsername(data.username);
            if (data.id) setUserID(data.id);
            if (data.role) {
              console.log("✅ Setting Role:", data.role);  // 🔍 DEBUG
              setRole(data.role);
            } else {
              console.warn("⚠️ No role found in profile info");
            }
          });
      } catch (err) {
        console.error('Invalid token', err);
      }
    }
  }, []);

  return (
    <UserContext.Provider
      value={{
        username,
        setUsername,
        token,
        setToken,
        userID,
        setUserID,
        role,  
        setRole
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
