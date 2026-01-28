import { Routes, Route, Navigate } from 'react-router-dom';
import { LoadingOverlay, Box } from '@mantine/core';
import LoginPage from '../pages/LoginPage';
import CoPilotPage from '../pages/CoPilotPage';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import RoleProtectedRoute from '../components/auth/RoleProtectedRoute';
import TheftDetectionPage from '../pages/TheftDetectionPage';
import LoadForecastingPage from '../pages/LoadForecastingPage';
import SmartTariffPage from '../pages/SmartTariffPage';
import DefaulterAnalysisPage from '../pages/DefaulterAnalysisPage';
import AssetHealthPage from '../pages/AssetHealthPage';
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
        element={<Navigate to={user ? '/copilot' : '/login'} replace />}
      />

      {/* PUBLIC */}
      <Route path="/login" element={<LoginPage />} />

      {/* PROTECTED */}
      <Route
        path="/copilot"
        element={
          <ProtectedRoute>
            <CoPilotPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/theft-detection"
        element={
          <RoleProtectedRoute roles={['ROLE_ADMINISTRATOR', 'ROLE_FIELD_OFFICER']}>
            <TheftDetectionPage />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/load-forecasting"
        element={
          <RoleProtectedRoute roles={['ROLE_FIELD_OFFICER', 'ROLE_ADMINISTRATOR']}>
            <LoadForecastingPage />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/smart-tariff"
        element={
          <RoleProtectedRoute roles={['ROLE_CUSTOMER', 'ROLE_ADMINISTRATOR']}>
            <SmartTariffPage />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/defaulter-analysis"
        element={
          <RoleProtectedRoute roles={['ROLE_ADMINISTRATOR', 'ROLE_FIELD_OFFICER']}>
            <DefaulterAnalysisPage />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/asset-health"
        element={
          <RoleProtectedRoute roles={['ROLE_ADMINISTRATOR', 'ROLE_FIELD_OFFICER']}>
            <AssetHealthPage />
          </RoleProtectedRoute>
        }
      />

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
