import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import UserManagement from './pages/UserManagement';
import RoleManagement from './pages/RoleManagement';
import RouteManagement from './pages/RouteManagement';
import AllowancePage from './pages/AllowancePage';
import ProfilePage from './pages/ProfilePage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import MiscellaneousPage from './pages/MiscellaneousPage';
import AdminMiscellaneousPage from './pages/AdminMiscellaneousPage';
import NotFound from './pages/NotFound';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import Layout from './components/Layout/Layout';

const ProtectedRoute = ({ children, role }) => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" />;
  if (role && user.roleLevel !== role) return <Navigate to="/dashboard" />;
  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={
          <ProtectedRoute role={1}>
            <Layout>
              <AdminDashboard />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={<ProtectedRoute role={1}><Layout><UserManagement /></Layout></ProtectedRoute>} />
        <Route path="/admin/roles" element={<ProtectedRoute role={1}><Layout><RoleManagement /></Layout></ProtectedRoute>} />
        <Route path="/admin/routes" element={<ProtectedRoute role={1}><Layout><RouteManagement /></Layout></ProtectedRoute>} />
        <Route path="/admin/analytics" element={<ProtectedRoute role={1}><Layout><AnalyticsPage /></Layout></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute role={1}><Layout><SettingsPage /></Layout></ProtectedRoute>} />
        <Route path="/admin/miscellaneous" element={<ProtectedRoute role={1}><Layout><AdminMiscellaneousPage /></Layout></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Layout><UserDashboard /></Layout></ProtectedRoute>} />
        <Route path="/allowances" element={<ProtectedRoute><Layout><AllowancePage /></Layout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Layout><ProfilePage /></Layout></ProtectedRoute>} />
        <Route path="/miscellaneous" element={<ProtectedRoute><Layout><MiscellaneousPage /></Layout></ProtectedRoute>} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App; 