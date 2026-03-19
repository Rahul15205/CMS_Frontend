import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Role, ModulePermissions } from '@/components/user-setup/types';
import { mockRoles } from '@/data/mockRoles';
import { authService } from '@/services/authService';
import { FEATURE_FLAGS } from '@/lib/featureFlags';
import { handleApiError } from '@/lib/errorHandler';

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: { username: string; name?: string; roleId: string; tenantName?: string; lastLogin?: string } | null;
    currentRole: Role | null;
    roles: Role[];
    setRoles: (roles: Role[]) => void;
    login: (usernameOrEmail: string, password: string, roleId?: string) => Promise<void>;
    logout: () => void;
    canAccess: (module: string, permission: keyof ModulePermissions[string]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<{ username: string; name?: string; roleId: string; tenantName?: string; lastLogin?: string } | null>(null);
    const [currentRole, setCurrentRole] = useState<Role | null>(null);

    // Initialize roles from localStorage or fallback to mockRoles
    const [roles, setRoles] = useState<Role[]>(() => {
        const storedRoles = localStorage.getItem('cms_roles');
        return storedRoles ? JSON.parse(storedRoles) : mockRoles;
    });

    // Persist roles to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('cms_roles', JSON.stringify(roles));
    }, [roles]);

    // ─── Initialization: restore auth state on mount ──────────
    useEffect(() => {
        const initAuth = async () => {
            try {
                if (FEATURE_FLAGS.auth) {
                    // Real API mode: try to restore session from stored tokens
                    const profile = await authService.getProfile();
                    if (profile) {
                        setUser(profile.user);
                        setRoles(profile.roles);
                        const role = profile.roles.find(r => r.id === profile.user.roleId) || profile.roles[0];
                        setCurrentRole(role || null);
                        setIsAuthenticated(true);
                    }
                } else {
                    // Mock mode: restore from localStorage (existing behavior)
                    const storedAuth = localStorage.getItem('cms_auth_data');
                    if (storedAuth) {
                        const { username, name, roleId, tenantName, lastLogin } = JSON.parse(storedAuth);
                        const role = roles.find(r => r.id === roleId) || roles[0];
                        setUser({ username, name, roleId, tenantName, lastLogin });
                        setCurrentRole(role);
                        setIsAuthenticated(true);
                    }
                }
            } catch {
                // Failed to restore — user must log in again
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ─── Login ────────────────────────────────────────────────
    const login = useCallback(async (usernameOrEmail: string, password: string, roleId?: string) => {
        try {
            if (FEATURE_FLAGS.auth) {
                // Real API login
                const result = await authService.login(usernameOrEmail, password);

                // Use the provided roleId or default to first role
                const selectedRoleId = roleId || result.user.roleId;
                setRoles(result.roles);
                setUser(result.user);
                const role = result.roles.find(r => r.id === selectedRoleId) || result.roles[0];
                setCurrentRole(role || null);
                setIsAuthenticated(true);

                // Store for backward compatibility with other components reading this
                localStorage.setItem('cms_auth_data', JSON.stringify(result.user));
            } else {
                // Mock login (existing behavior)
                if ((usernameOrEmail === 'admin' || usernameOrEmail === 'admin@cms.local') && password === 'Consent@2024') {
                    const selectedRoleId = roleId || roles[0].id;
                    const role = roles.find(r => r.id === selectedRoleId);
                    if (role) {
                        const userData = { 
                            username: usernameOrEmail, 
                            name: 'System Administrator',
                            roleId: selectedRoleId,
                            tenantName: 'Proteccio AI',
                            lastLogin: new Date().toISOString()
                        };
                        localStorage.setItem('cms_auth_data', JSON.stringify(userData));
                        setUser(userData);
                        setCurrentRole(role);
                        setIsAuthenticated(true);
                    }
                } else {
                    throw new Error('Invalid credentials');
                }
            }
        } catch (error) {
            handleApiError(error, 'Login');
            throw error; // Re-throw so the login form can display the error
        }
    }, [roles]);

    // ─── Logout ───────────────────────────────────────────────
    const logout = useCallback(() => {
        // Fire-and-forget backend logout
        authService.logout().catch(() => {});

        localStorage.removeItem('cms_auth_data');
        localStorage.removeItem('cms_auth_tokens');
        setUser(null);
        setCurrentRole(null);
        setIsAuthenticated(false);
    }, []);

    // ─── RBAC Check ───────────────────────────────────────────
    const canAccess = useCallback((module: string, permission: keyof ModulePermissions[string] = 'view') => {
        if (!currentRole) return false;
        if (!currentRole.permissions[module]) return false;
        return currentRole.permissions[module][permission];
    }, [currentRole]);

    return (
        <AuthContext.Provider value={{ isAuthenticated, isLoading, user, currentRole, roles, setRoles, login, logout, canAccess }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
