import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import type { ReactNode } from 'react';

export default function ProtectedRoute({
  children,
}: {
  children: ReactNode;
}) {
  const token = useAppSelector((s) => s.auth.token);

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
