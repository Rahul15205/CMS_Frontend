import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Role, ModulePermissions } from '@/components/user-setup/types';
import { authService } from '@/services/authService';
import { handleApiError } from '@/lib/errorHandler';

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: { 
        id?: string;
        username: string; 
        name?: string; 
        roleId: string; 
        tenantName?: string; 
        lastLogin?: string;
        aadhaarVerified?: boolean;
        mustResetPassword?: boolean;
    } | null;
    currentRole: Role | null;
    roles: Role[];
    setRoles: (roles: Role[]) => void;
    login: (usernameOrEmail: string, password: string, roleId?: string) => Promise<void>;
    logout: () => void;
    canAccess: (module: string, permission: keyof ModulePermissions[string]) => boolean;
    setMustResetPassword: (val: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<{ 
        id?: string;
        username: string; 
        name?: string; 
        roleId: string; 
        tenantName?: string; 
        lastLogin?: string;
        aadhaarVerified?: boolean;
        mustResetPassword?: boolean;
    } | null>(null);
    const [currentRole, setCurrentRole] = useState<Role | null>(null);

    // Initialize roles from localStorage, otherwise start empty
    const [roles, setRoles] = useState<Role[]>(() => {
        const storedRoles = localStorage.getItem('cms_roles');
        return storedRoles ? JSON.parse(storedRoles) : [];
    });

    // Persist roles to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('cms_roles', JSON.stringify(roles));
    }, [roles]);

    // ─── Initialization: restore auth state on mount ──────────
    useEffect(() => {
        const initAuth = async () => {
            try {
                const profile = await authService.getProfile();
                if (profile) {
                    setUser(profile.user);
                    setRoles(profile.roles);
                    const role = profile.roles.find(r => r.id === profile.user.roleId) || profile.roles[0];
                    setCurrentRole(role || null);
                    setIsAuthenticated(true);
                } else {
                    setUser(null);
                    setCurrentRole(null);
                    setIsAuthenticated(false);
                }
            } catch {
                // Failed to restore — user must log in again
                localStorage.removeItem('cms_auth_data');
                localStorage.removeItem('cms_auth_tokens');
                setUser(null);
                setCurrentRole(null);
                setIsAuthenticated(false);
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
            const result = await authService.login(usernameOrEmail, password);

            const selectedRoleId = roleId || result.user.roleId;
            setRoles(result.roles);
            setUser(result.user);
            const role = result.roles.find(r => r.id === selectedRoleId) || result.roles[0];
            setCurrentRole(role || null);
            setIsAuthenticated(true);

            localStorage.setItem('cms_auth_data', JSON.stringify(result.user));
        } catch (error) {
            handleApiError(error, 'Login');
            throw error; // Re-throw so the login form can display the error
        }
    }, []);

    // ─── Logout ───────────────────────────────────────────────
    const logout = useCallback(async () => {
        try {
            // Wait for backend logout before clearing tokens
            await authService.logout();
        } catch (error) {
            console.error('Logout failed', error);
        } finally {
            // Always clear state even if API call fails
            localStorage.removeItem('cms_auth_data');
            localStorage.removeItem('cms_auth_tokens');
            localStorage.removeItem('cms_roles');
            setUser(null);
            setCurrentRole(null);
            setIsAuthenticated(false);
        }
    }, []);

    // ─── RBAC Check ───────────────────────────────────────────
    const canAccess = useCallback((module: string, permission: keyof ModulePermissions[string] = 'view') => {
        if (!currentRole) return false;
        if (!currentRole.permissions || !currentRole.permissions[module]) return false;
        return currentRole.permissions[module][permission];
    }, [currentRole]);

    const setMustResetPassword = useCallback((val: boolean) => {
        setUser(prev => prev ? { ...prev, mustResetPassword: val } : null);
        // Also update stored auth data
        const stored = localStorage.getItem('cms_auth_data');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                parsed.mustResetPassword = val;
                localStorage.setItem('cms_auth_data', JSON.stringify(parsed));
            } catch (e) {
                console.error(e);
            }
        }
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, isLoading, user, currentRole, roles, setRoles, login, logout, canAccess, setMustResetPassword }}>
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
