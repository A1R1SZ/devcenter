import React from 'react';
import { Routes, Route } from 'react-router-dom';
import App from '../pages/App';
import RegistrationPage from '../pages/RegistrationPage';
import HomePage from '../pages/HomePage';
import ProfilePage from '../pages/ProfilePage';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/register" element={<RegistrationPage />} />
      <Route path="/homepage" element={<HomePage/>}/>
      <Route path="/profile" element={<ProfilePage/>}/>
    </Routes>
  );
}

export default AppRoutes;
