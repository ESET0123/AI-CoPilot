import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import ProtectedRoute from '../components/common/ProtectedRoute';
import { useAppSelector } from '../app/hooks';

export default function AppRoutes() {
  const user = useAppSelector((s) => s.auth.user);

  return (
    <Routes>
      {/* ROOT DECISION */}
      <Route
        path="/"
        element={<Navigate to={user ? '/dashboard' : '/login'} replace />}
      />

      {/* PUBLIC */}
      <Route path="/login" element={<LoginPage />} />

      {/* PROTECTED */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
