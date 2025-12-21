import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import type { ReactNode } from 'react';

export default function ProtectedRoute({
  children,
}: {
  children: ReactNode;
}) {
  const user = useAppSelector((s) => s.auth.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
