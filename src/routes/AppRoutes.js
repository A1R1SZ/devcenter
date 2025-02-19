import React from 'react';
import { Routes, Route } from 'react-router-dom';
import App from '../pages/App';
import RegistrationPage from '../pages/RegistrationPage';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/register" element={<RegistrationPage />} />
    </Routes>
  );
}

export default AppRoutes;
