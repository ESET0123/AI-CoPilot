import { useAppSelector } from '../app/hooks';

export interface AccessControlConfig {
    allowedRoles?: string[];
    allowedGroups?: string[];
    requireAll?: boolean; // true = AND logic (must match role AND group), false = OR logic (default)
}

/**
 * Custom hook for role and group-based access control
 * 
 * @returns {object} Object containing hasAccess function and user's roles/groups
 * 
 * @example
 * const { hasAccess } = useAccessControl();
 * 
 * // Check if user has Executive role OR belongs to goa group
 * const canView = hasAccess({ 
 *   allowedRoles: ['Executive'], 
 *   allowedGroups: ['goa'] 
 * });
 * 
 * // Check if user has Executive role AND belongs to goa group
 * const canView = hasAccess({ 
 *   allowedRoles: ['Executive'], 
 *   allowedGroups: ['goa'],
 *   requireAll: true 
 * });
 */
export function useAccessControl() {
    const userRoles = useAppSelector((state) => state.auth.roles || []);
    const userGroups = useAppSelector((state) => state.auth.groups || []);

    /**
     * Check if user has access based on configuration
     * @param config - Access control configuration
     * @returns true if user has access, false otherwise
     */
    const hasAccess = (config: AccessControlConfig): boolean => {
        const { allowedRoles = [], allowedGroups = [], requireAll = false } = config;

        // If no restrictions defined, allow access
        if (allowedRoles.length === 0 && allowedGroups.length === 0) {
            return true;
        }

        // Normalize groups to lowercase for case-insensitive comparison
        const normalizedUserGroups = userGroups.map(g => g.toLowerCase());
        const normalizedAllowedGroups = allowedGroups.map(g => g.toLowerCase());

        // Check if user has any of the allowed roles
        const hasRole = allowedRoles.length === 0 ||
            allowedRoles.some(role => userRoles.includes(role));

        // Check if user belongs to any of the allowed groups
        // Support hierarchical matching: a user in '/zones/ZONE_SOUTH/circles/BETA' 
        // matches a requirement for '/zones/ZONE_SOUTH'
        const hasGroup = allowedGroups.length === 0 ||
            normalizedAllowedGroups.some(allowedGroup =>
                normalizedUserGroups.some(userGroup => userGroup === allowedGroup || userGroup.startsWith(allowedGroup + '/'))
            );

        // Return based on requireAll flag
        if (requireAll) {
            // AND logic: must satisfy both role and group requirements
            const roleCheck = allowedRoles.length === 0 || hasRole;
            const groupCheck = allowedGroups.length === 0 || hasGroup;
            return roleCheck && groupCheck;
        } else {
            // OR logic: satisfy either role or group requirement
            return hasRole || hasGroup;
        }
    };

    return {
        hasAccess,
        userRoles,
        userGroups
    };
}
