import React from 'react';
import { Routes, Route } from 'react-router-dom';
import App from '../pages/App';
import RegistrationPage from '../pages/RegistrationPage';
import HomePage from '../pages/HomePage';
import ProfilePage from '../pages/ProfilePage';
import DocumentationPage from '../pages/DocumentationPage';
import TagsPage from '../pages/TagsPage';
import AnalyticsPage from '../pages/AnalyticsPage';
import SettingsPage from '../pages/SettingsPage';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/register" element={<RegistrationPage />} />
      <Route path="/homepage" element={<HomePage/>}/>
      <Route path="/tags" element={<TagsPage/>}/>
      <Route path="/profile" element={<ProfilePage/>}/>
      <Route path='/analytics' element={<AnalyticsPage/>}/>
      <Route path='/settings' element={<SettingsPage/>}/>
      <Route path='/documentation' element={<DocumentationPage/>}/>
    </Routes>
  );
}

export default AppRoutes;
