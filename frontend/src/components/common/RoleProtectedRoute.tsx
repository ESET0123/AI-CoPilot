import { Navigate } from "react-router-dom";
import { useAppSelector } from "../../app/hooks";
import { Box, Title, Button, Stack } from "@mantine/core";
import { Link } from "react-router-dom";

interface RoleProtectedRouteProps {
    roles: string[];
    children: React.ReactNode;
}

export default function RoleProtectedRoute({ roles, children }: RoleProtectedRouteProps) {
    const { isAuthenticated, roles: userRoles } = useAppSelector((s) => s.auth);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    const hasAccess = roles.some((r) => userRoles.includes(r));

    if (!hasAccess) {
        return (
            <Box style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Stack align="center">
                    <Title order={2}>403 - Forbidden</Title>
                    <p>You do not have permission to access this page.</p>
                    <Button component={Link} to="/dashboard">Back to Dashboard</Button>
                </Stack>
            </Box>
        );
    }

    return children;
}
