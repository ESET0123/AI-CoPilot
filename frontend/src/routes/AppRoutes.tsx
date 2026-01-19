import { Routes, Route, Navigate } from 'react-router-dom';
import { LoadingOverlay, Box } from '@mantine/core';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import RoleProtectedRoute from '../components/auth/RoleProtectedRoute';
import TheftDetectionPage from '../pages/TheftDetectionPage';
import LoadForecastingPage from '../pages/LoadForecastingPage';
import SmartTariffPage from '../pages/SmartTariffPage';
import DefaulterAnalysisPage from '../pages/DefaulterAnalysisPage';
import { useAppSelector } from '../app/hooks';

export default function AppRoutes() {
  const { user, isInitialLoading } = useAppSelector((s) => s.auth);

  if (isInitialLoading) {
    return (
      <Box h="100vh" pos="relative">
        <LoadingOverlay visible={true} />
      </Box>
    );
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

      <Route
        path="/theft-detection"
        element={
          <RoleProtectedRoute roles={['Executive', 'ROLE_FIELD_OFFICER']}>
            <TheftDetectionPage />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/load-forecasting"
        element={
          <RoleProtectedRoute roles={['Executive']}>
            <LoadForecastingPage />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/smart-tariff"
        element={
          <RoleProtectedRoute roles={['customer', 'Executive']}>
            <SmartTariffPage />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/defaulter-analysis"
        element={
          <RoleProtectedRoute roles={['Executive', 'ROLE_FIELD_OFFICER']}>
            <DefaulterAnalysisPage />
          </RoleProtectedRoute>
        }
      />

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
