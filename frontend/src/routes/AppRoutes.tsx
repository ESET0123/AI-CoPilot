import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import ProtectedRoute from '../components/common/ProtectedRoute';
import { useAppSelector } from '../app/hooks';
import { useSearchParams } from 'react-router-dom';

export default function AppRoutes() {
  const user = useAppSelector((s) => s.auth.user);
  const [searchParams] = useSearchParams();
  // Check both query string and hash fragment for code
  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  const hasAuthCode = searchParams.has('code') || hashParams.has('code');

  // console.log('[AppRoutes] URL:', window.location.href);
  // console.log('[AppRoutes] hasAuthCode:', hasAuthCode);
  // console.log('[AppRoutes] code value:', code);
  // console.log('[AppRoutes] user:', user);

  // If we have a code but no user, stay on the current route and render LoginPage 
  // to handle the callback without being redirected by ProtectedRoute.
  if (hasAuthCode && !user) {
    // console.log('[AppRoutes] Rendering LoginPage for callback handling');
    return <LoginPage />;
  }

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
