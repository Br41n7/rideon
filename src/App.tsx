import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RiderPage from './pages/RiderPage';
import DriverPage from './pages/DriverPage';
import AdminPage from './pages/AdminPage';
import LandingPage from './pages/LandingPage';
import { Layout } from './components/Layout';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen bg-[#050505] text-neutral-500 font-bold uppercase tracking-widest text-xs">Initializing...</div>;
  return user ? <>{children}</> : <Navigate to="/login" />;
}

function RoleRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen bg-[#050505] text-neutral-500 font-bold uppercase tracking-widest text-xs">Verifying role...</div>;
  if (!user || !allowedRoles.includes(user.role)) return <Navigate to="/app" />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/app" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="rider" element={<RoleRoute allowedRoles={['rider', 'admin']}><RiderPage /></RoleRoute>} />
            <Route path="driver" element={<RoleRoute allowedRoles={['driver', 'admin']}><DriverPage /></RoleRoute>} />
            <Route path="admin" element={<RoleRoute allowedRoles={['admin']}><AdminPage /></RoleRoute>} />
          </Route>
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
