import React, { createContext, useContext, useState, useEffect } from 'react';
import { Role, ModulePermissions } from '@/components/user-setup/types';
import { mockRoles } from '@/data/mockRoles';

interface AuthContextType {
    isAuthenticated: boolean;
    user: { username: string; roleId: string } | null;
    currentRole: Role | null;
    roles: Role[];
    setRoles: (roles: Role[]) => void;
    login: (username: string, roleId: string) => void;
    logout: () => void;
    canAccess: (module: string, permission: keyof ModulePermissions[string]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<{ username: string; roleId: string } | null>(null);
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

    useEffect(() => {
        const storedAuth = localStorage.getItem('cms_auth_data');
        if (storedAuth) {
            const { username, roleId } = JSON.parse(storedAuth);
            // Find role from current roles state
            const role = roles.find(r => r.id === roleId) || roles[0];
            setUser({ username, roleId });
            setCurrentRole(role);
            setIsAuthenticated(true);
        }
    }, [roles]); // Re-evaluate if roles change

    const login = (username: string, roleId: string) => {
        const role = roles.find(r => r.id === roleId);
        if (role) {
            const userData = { username, roleId };
            localStorage.setItem('cms_auth_data', JSON.stringify(userData));
            setUser(userData);
            setCurrentRole(role);
            setIsAuthenticated(true);
        }
    };

    const logout = () => {
        localStorage.removeItem('cms_auth_data');
        setUser(null);
        setCurrentRole(null);
        setIsAuthenticated(false);
    };

    const canAccess = (module: string, permission: keyof ModulePermissions[string] = 'view') => {
        if (!currentRole) return false;

        // Check if module exists in permissions
        if (!currentRole.permissions[module]) return false;

        return currentRole.permissions[module][permission];
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, currentRole, roles, setRoles, login, logout, canAccess }}>
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
