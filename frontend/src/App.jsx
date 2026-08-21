import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { getThemeConfig } from './theme/themeConfig';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AppLayout from './layouts/AppLayout';

// Pages (Public)
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

import Dashboard from './pages/Dashboard';
import PolicyLibrary from './pages/PolicyLibrary';
import PolicyDetail from './pages/PolicyDetail';
import Documents from './pages/Documents';
import AskPolicy from './pages/AskPolicy';
import Compliance from './pages/Compliance';
import Settings from './pages/Settings';
import MyTenders from './pages/MyTenders';
import TenderDetail from './pages/TenderDetail';
import AskTender from './pages/AskTender';
import ComplianceReports from './pages/ComplianceReports';
import ComplianceReport from './pages/ComplianceReport';
import AdminDashboard from './pages/AdminDashboard';
import AdminPolicyManagement from './pages/AdminPolicyManagement';
import AdminDocumentProcessing from './pages/AdminDocumentProcessing';
import AdminUsers from './pages/AdminUsers';
import ProtectedRoute from './components/ProtectedRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute';

function DashboardOrAdmin() {
  const { user } = useAuth();
  if (user?.role === 'ADMIN') {
    return <Navigate to="/app/admin" replace />;
  }
  return <Dashboard />;
}

function AppContent() {
  const { isDark } = useTheme();
  return (
    <ConfigProvider theme={getThemeConfig(isDark)}>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Route>

          {/* Protected App Routes */}
          <Route path="/app" element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route index element={<DashboardOrAdmin />} />
            <Route path="policies" element={<PolicyLibrary />} />
            <Route path="policies/:id" element={<PolicyDetail />} />
            <Route path="ask-policy" element={<AskPolicy />} />
            <Route path="my-tenders" element={<MyTenders />} />
            <Route path="my-tenders/:id" element={<TenderDetail />} />
            <Route path="my-tenders/:id/ask" element={<AskTender />} />
            <Route path="ask-tender" element={<AskTender />} />
            <Route path="my-tenders/:tenderId/compliance-analysis/:id" element={<ComplianceReport />} />
            <Route path="compliance" element={<Compliance />} />
            <Route path="compliance-reports" element={<ComplianceReports />} />
            <Route path="settings" element={<Settings />} />
            
            {/* Admin Only Route */}
            <Route path="admin" element={
              <RoleProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </RoleProtectedRoute>
            } />
            <Route path="admin/policies" element={
              <RoleProtectedRoute allowedRoles={['ADMIN']}>
                <AdminPolicyManagement />
              </RoleProtectedRoute>
            } />
            <Route path="admin/processing" element={
              <RoleProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDocumentProcessing />
              </RoleProtectedRoute>
            } />
            <Route path="admin/users" element={
              <RoleProtectedRoute allowedRoles={['ADMIN']}>
                <AdminUsers />
              </RoleProtectedRoute>
            } />
          </Route>
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
