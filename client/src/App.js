import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ServerAuthProvider } from './context/ServerAuthContext';
import { DataProvider } from './context/DataContext';
import { AIProvider } from './context/AIContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import AIPopupManager from './components/AIPopupManager';
import AIControls from './components/AIControls';
import ChatBot from './components/ChatBot';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import TasksPage from './pages/TasksPage';
import TimeTrackerPage from './pages/TimeTrackerPage';
import HealthPage from './pages/HealthPage';
import WaterIntakePage from './pages/WaterIntakePage';
import SleepDurationPage from './pages/SleepDurationPage';
import PhysicalActivityPage from './pages/PhysicalActivityPage';
import MoodPage from './pages/MoodPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProfilePage from './pages/ProfilePage';
import HoroscopePage from './pages/HoroscopePage';
import VibePage from './pages/VibePage';
import CommunityPage from './pages/CommunityPage';
import WomensWellnessHubPage from './pages/WomensWellnessHubPage';

function App() {
  return (
    <ServerAuthProvider>
      <DataProvider>
        <AIProvider>
          <Router>
            <div className="App overflow-x-hidden min-h-screen">
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#fff',
                    color: '#374151',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.75rem',
                  },
                  success: {
                    iconTheme: {
                      primary: '#10b981',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />
              
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                
                {/* Protected routes */}
                <Route path="/app" element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Navigate to="/app/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="tasks" element={<TasksPage />} />
                  <Route path="time-tracker" element={<TimeTrackerPage />} />
                  <Route path="health" element={<HealthPage />} />
                  <Route path="water-intake" element={<WaterIntakePage />} />
                  <Route path="sleep-duration" element={<SleepDurationPage />} />
                  <Route path="physical-activity" element={<PhysicalActivityPage />} />
                  <Route path="mood" element={<MoodPage />} />
                  <Route path="wellness-hub" element={<WomensWellnessHubPage />} />
                  <Route path="analytics" element={<AnalyticsPage />} />
                  <Route path="horoscope" element={<HoroscopePage />} />
                  <Route path="vibes" element={<VibePage />} />
                  <Route path="community" element={<CommunityPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                </Route>
                
                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>

              {/* AI Components - Only show in protected routes */}
              <AIPopupManager />
              <AIControls />
              <ChatBot />
            </div>
          </Router>
        </AIProvider>
      </DataProvider>
    </ServerAuthProvider>
  );
}

export default App;