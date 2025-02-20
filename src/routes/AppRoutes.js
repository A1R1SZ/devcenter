import React from 'react';
import { Routes, Route } from 'react-router-dom';
import App from '../pages/App';
import RegistrationPage from '../pages/RegistrationPage';
import HomePage from '../pages/HomePage';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/register" element={<RegistrationPage />} />
      <Route path="/homepage" element={<HomePage/>}/>
    </Routes>
  );
}

export default AppRoutes;
