import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import { isAuthenticated } from './lib/auth';

import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import OAuthSuccess from './pages/Auth/OAuthSuccess';
import OAuthRegister from './pages/Auth/OAuthRegister';
import Dashboard from './pages/Dashboard/Dashboard';
import Agenda from './pages/Agenda/Agenda';
import Pacientes from './pages/Pacientes/Pacientes';
import Logs from './pages/Logs/Logs';
import Settings from './pages/Settings/Settings';
import Pricing from './pages/Billing/Pricing';
import DowngradeFlow from './pages/Billing/DowngradeFlow';

function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function PublicRoute({ children }) {
  if (isAuthenticated()) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function App() {
  return (
    <>
      <Toaster richColors position="top-center" expand={true} />
      <BrowserRouter>
        <Routes>
        <Route element={<PublicRoute><AuthLayout /></PublicRoute>}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/oauth/success" element={<OAuthSuccess />} />
          <Route path="/oauth/register" element={<OAuthRegister />} />
        </Route>

        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/pacientes" element={<Pacientes />} />
          <Route path="/logs" element={<Logs />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/downgrade" element={<DowngradeFlow />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </>
  );
}

export default App;
