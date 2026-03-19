/**
 * Authentication Service
 * 
 * Handles login, logout, profile retrieval, and token management.
 * When FEATURE_FLAGS.auth is false, falls back to mock authentication.
 */

import api from '@/lib/api';
import { FEATURE_FLAGS } from '@/lib/featureFlags';
import { Role, ModulePermissions } from '@/components/user-setup/types';
import { mockRoles } from '@/data/mockRoles';

// ─── Types ────────────────────────────────────────────────────

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: BackendUser;
}

export interface BackendUser {
  id: string;
  name: string;
  email: string;
  status: string;
  roles: string[];
  permissions: Record<string, Record<string, boolean>>;
  tenantId?: string;
  tenantName?: string;
  tenant?: string | { id: string; name: string };
  mfaEnabled?: boolean;
  lastLogin?: string;
}

export interface BackendRole {
  id: string;
  name: string;
  description: string;
  isSystemRole: boolean;
  status: string;
  permissions: Record<string, Record<string, boolean>>;
  // Additional fields from backend
  tenantScoped?: boolean;
  applicationScoped?: boolean;
  workflowPermissions?: any;
  integrationPermissions?: any;
}

// ─── Mappers ──────────────────────────────────────────────────

/**
 * Map backend role response to the frontend Role interface.
 * The backend uses ModuleName enum keys (e.g., CONSENT_MANAGEMENT),
 * while the frontend uses display names (e.g., "Consent Management").
 */
const MODULE_NAME_MAP: Record<string, string> = {
  DASHBOARD: 'Dashboard',
  CONSENT_MANAGEMENT: 'Consent Management',
  RIGHTS_MANAGEMENT: 'Rights Management',
  GRIEVANCES: 'Grievances',
  COOKIES_MANAGEMENT: 'Cookies Management',
  NOTICES: 'Notices',
  CONFIGURATIONS: 'Configurations',
  INTEGRATIONS: 'Integrations',
  SECURITY: 'Security',
  SETTINGS: 'Settings',
  USER_SETUP: 'User Setup',
  REPORTS: 'Reports',
  LOGS: 'Logs',
};

function mapBackendPermissions(backendPerms: Record<string, Record<string, boolean>>): ModulePermissions {
  const mapped: ModulePermissions = {};
  for (const [backendKey, perms] of Object.entries(backendPerms)) {
    const frontendKey = MODULE_NAME_MAP[backendKey] || backendKey;
    mapped[frontendKey] = {
      view: perms.view ?? false,
      create: perms.create ?? false,
      edit: perms.edit ?? false,
      approve: perms.approve ?? false,
      export: perms.export ?? false,
      configure: perms.configure ?? false,
      admin: perms.admin ?? false,
    };
  }
  return mapped;
}

function mapBackendRole(backendRole: BackendRole): Role {
  return {
    id: backendRole.id,
    name: backendRole.name,
    description: backendRole.description,
    isSystemRole: backendRole.isSystemRole,
    status: (backendRole.status === 'ACTIVE' ? 'active' : 'archived') as 'active' | 'archived',
    usersCount: 0, // Computed on backend, not stored
    permissions: mapBackendPermissions(backendRole.permissions),
    createdAt: new Date().toISOString(),
    tenantScoped: backendRole.tenantScoped,
    applicationScoped: backendRole.applicationScoped,
    workflowPermissions: backendRole.workflowPermissions,
    integrationPermissions: backendRole.integrationPermissions,
  };
}

// ─── Service ──────────────────────────────────────────────────

export const authService = {
  /**
   * Login with email and password.
   * Returns tokens + user with mapped roles.
   */
  login: async (email: string, password: string): Promise<{
    user: { username: string; name?: string; roleId: string; tenantName?: string; lastLogin?: string };
    roles: Role[];
    accessToken: string;
    refreshToken: string;
  }> => {
    if (!FEATURE_FLAGS.auth) {
      // Mock login — existing behavior
      if ((email === 'admin' || email === 'admin@cms.local') && password === 'Consent@2024') {
        return {
          user: { username: 'admin', roleId: mockRoles[0].id },
          roles: mockRoles,
          accessToken: '',
          refreshToken: '',
        };
      }
      throw new Error('Invalid credentials');
    }

    // Real API login
    const res = await api.post<LoginResponse>('/api/auth/login', { email, password });
    const { accessToken, refreshToken, user } = res.data;

    // Store tokens separately for the API client interceptor
    localStorage.setItem('cms_auth_tokens', JSON.stringify({ accessToken, refreshToken }));

    // Synthesize frontend Role object from the backend's aggregated roles and permissions
    const mappedRoles: Role[] = [{
      id: user.roles.length > 0 ? user.roles[0] : 'role-1',
      name: user.roles.length > 0 ? user.roles.join(', ') : 'User',
      description: 'Role assigned from backend',
      isSystemRole: false,
      status: 'active',
      usersCount: 1,
      permissions: mapBackendPermissions(user.permissions || {}),
      createdAt: new Date().toISOString()
    }];

    return {
      user: {
        username: user.email,
        name: user.name,
        roleId: mappedRoles.length > 0 ? mappedRoles[0].id : '',
        tenantName: typeof user.tenant === 'object' ? user.tenant.name : user.tenant || user.tenantName,
        lastLogin: user.lastLogin,
      },
      roles: mappedRoles,
      accessToken,
      refreshToken,
    };
  },

  /**
   * Logout — invalidate session on backend.
   */
  logout: async (): Promise<void> => {
    if (FEATURE_FLAGS.auth) {
      try {
        await api.post('/api/auth/logout');
      } catch {
        // Ignore logout errors — we clear local state anyway
      }
    }
    localStorage.removeItem('cms_auth_tokens');
  },

  /**
   * Get current user profile.
   * Called on app initialization to restore auth state.
   */
  getProfile: async (): Promise<{
    user: { username: string; name?: string; roleId: string; tenantName?: string; lastLogin?: string };
    roles: Role[];
  } | null> => {
    if (!FEATURE_FLAGS.auth) {
      return null; // Mock mode uses localStorage directly
    }

    // Check if we have tokens
    const tokensStr = localStorage.getItem('cms_auth_tokens');
    if (!tokensStr) return null;

    try {
      const res = await api.get<BackendUser>('/api/auth/me');
      const user = res.data;
      
      // Synthesize frontend Role object from aggregated data
      const mappedRoles: Role[] = [{
        id: user.roles && user.roles.length > 0 ? user.roles[0] : 'role-1',
        name: user.roles && user.roles.length > 0 ? user.roles.join(', ') : 'User',
        description: 'Role assigned from backend',
        isSystemRole: false,
        status: 'active',
        usersCount: 1,
        permissions: mapBackendPermissions(user.permissions || {}),
        createdAt: new Date().toISOString()
      }];

      return {
        user: {
          username: user.email,
          name: user.name,
          roleId: mappedRoles.length > 0 ? mappedRoles[0].id : '',
          tenantName: typeof user.tenant === 'object' ? user.tenant.name : user.tenant || user.tenantName,
          lastLogin: user.lastLogin,
        },
        roles: mappedRoles,
      };
    } catch {
      // Token invalid/expired — clear and return null
      localStorage.removeItem('cms_auth_tokens');
      return null;
    }
  },

  /**
   * Fetch all roles from backend.
   * Used by User Setup and Auth for role selection.
   */
  getRoles: async (): Promise<Role[]> => {
    if (!FEATURE_FLAGS.auth) {
      return mockRoles;
    }

    const res = await api.get('/api/roles');
    const roles = res.data.data || res.data;
    return Array.isArray(roles) ? roles.map(mapBackendRole) : mockRoles;
  },
};
