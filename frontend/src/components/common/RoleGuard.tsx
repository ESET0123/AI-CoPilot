import { useAppSelector } from "../../app/hooks";

interface RoleGuardProps {
    roles: string[];
    children: React.ReactNode;
}

/**
 * A component that only renders its children if the current user
 * has at least one of the specified roles extracted from Keycloak.
 */
export default function RoleGuard({ roles, children }: RoleGuardProps) {
    const userRoles = useAppSelector((s) => s.auth.roles || []);

    if (!userRoles || userRoles.length === 0) {
        return null;
    }

    // Check if user has at least one of the required roles
    const hasAccess = roles.some((r: string) => userRoles.includes(r));

    return hasAccess ? <>{children}</> : null;
}
