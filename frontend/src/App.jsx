import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import { isAuthenticated } from './lib/auth';
import { ClinicProvider, useClinic } from './contexts/ClinicContext';

import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import OAuthSuccess from './pages/Auth/OAuthSuccess';
import OAuthRegister from './pages/Auth/OAuthRegister';
import ConfirmAppointment from './pages/Public/ConfirmAppointment';
import Landing from './pages/Landing/Landing';

import Dashboard from './pages/Dashboard/Dashboard';
import Agenda from './pages/Agenda/Agenda';
import Pacientes from './pages/Pacientes/Pacientes';
import Logs from './pages/Logs/Logs';
import Settings from './pages/Settings/Settings';

function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function PublicRoute({ children }) {
  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function LandingOrLogin() {
  const { subdomain } = useClinic();
  
  // Se estiver num subdomínio de clínica (ou 'app'), mostre o login.
  if (subdomain) {
    return <Navigate to="/login" replace />;
  }
  
  // Se for raiz limpa (ex: toothify.com), mostre a Landing Page.
  return <Landing />;
}

function App() {
  return (
    <ClinicProvider>
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
        
        <Route path="/" element={<PublicRoute><LandingOrLogin /></PublicRoute>} />

        <Route path="/confirmar/:id" element={<ConfirmAppointment />} />

        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/pacientes" element={<Pacientes />} />
          <Route path="/logs" element={<Logs />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </ClinicProvider>
  );
}

export default App;
