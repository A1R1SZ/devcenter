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
import PrivateRoute from '../connection/privateRouter';
import SearchResultsPage from '../pages/SearchResultsPage';
import BookmarkPage from '../pages/BookmarkPage';

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<App />} />
      <Route path="/register" element={<RegistrationPage />} />

      {/* Protected routes */}
      <Route
        path="/homepage"
        element={
          <PrivateRoute>
            <HomePage />
          </PrivateRoute>
        }
      />
      <Route 
        path="/search" 
        element={
          <PrivateRoute>
            <SearchResultsPage/>
            </PrivateRoute>
          } 
      />
      <Route path="/bookmark" element={
        <PrivateRoute>
          <BookmarkPage />
        </PrivateRoute>
        }
        />
      <Route
        path="/tags"
        element={
          <PrivateRoute>
            <TagsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <ProfilePage />
          </PrivateRoute>
        }
      />
      <Route 
        path="/profile/:userId" 
        element={
          <PrivateRoute>
            <ProfilePage />
          </PrivateRoute>
        } 
      />
      <Route
        path="/analytics"
        element={
          <PrivateRoute>
            <AnalyticsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <PrivateRoute>
            <SettingsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/documentation"
        element={
          <PrivateRoute>
            <DocumentationPage />
          </PrivateRoute>
        }
      />
    </Routes>
    
  );
}

export default AppRoutes;
