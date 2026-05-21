/**
 * User Setup Service
 *
 * Covers users, roles, invitations, sessions, audit logs, and access rules.
 */

import api from '@/lib/api';
import { FEATURE_FLAGS } from '@/lib/featureFlags';

// ─── Users ──────────────────────────────────────────────────

export const usersService = {
  getAll: async (params?: any) => {
    if (!FEATURE_FLAGS.users) return null;
    const res = await api.get('/api/v1/users', { params });
    return res.data;
  },

  getById: async (id: string) => {
    if (!FEATURE_FLAGS.users) return null;
    const res = await api.get(`/api/v1/users/${id}`);
    return res.data;
  },

  create: async (data: any) => {
    if (!FEATURE_FLAGS.users) return null;
    const res = await api.post('/api/v1/users', data);
    return res.data;
  },

  update: async (id: string, data: any) => {
    if (!FEATURE_FLAGS.users) return null;
    const res = await api.put(`/api/v1/users/${id}`, data);
    return res.data;
  },

  updateStatus: async (id: string, status: string) => {
    if (!FEATURE_FLAGS.users) return null;
    const res = await api.put(`/api/v1/users/${id}/status`, { status: status.toUpperCase() });
    return res.data;
  },

  endSessions: async (id: string) => {
    if (!FEATURE_FLAGS.users) return null;
    const res = await api.post(`/api/v1/users/${id}/end-sessions`);
    return res.data;
  },

  resetMfa: async (id: string) => {
    if (!FEATURE_FLAGS.users) return null;
    const res = await api.post(`/api/v1/users/${id}/reset-mfa`);
    return res.data;
  },

  sendPasswordReset: async (id: string) => {
    if (!FEATURE_FLAGS.users) return null;
    const res = await api.post(`/api/v1/users/${id}/send-password-reset`);
    return res.data;
  },
};

// ─── Roles ──────────────────────────────────────────────────

/**
 * Maps backend ModuleName enum values (e.g. "CONSENT_MANAGEMENT")
 * to the frontend's friendly display strings (e.g. "Consent Management").
 */
const backendToFrontendModule: Record<string, string> = {
  DASHBOARD:           'Dashboard',
  CONSENT_MANAGEMENT:  'Consent Management',
  RIGHTS_MANAGEMENT:   'Rights Management',
  GRIEVANCES:          'Grievances',
  COOKIES_MANAGEMENT:  'Cookies Management',
  NOTICES:             'Notices',
  CONFIGURATIONS:      'Configurations',
  INTEGRATIONS:        'Integrations',
  SECURITY:            'Security',
  SETTINGS:            'Settings',
  USER_SETUP:          'User Setup',
  REPORTS:             'Reports',
  LOGS:                'Logs',
};

/**
 * Reverse map: frontend friendly name → backend enum.
 */
const frontendToBackendModule: Record<string, string> = Object.fromEntries(
  Object.entries(backendToFrontendModule).map(([k, v]) => [v, k])
);

/** All recognized frontend module names (mirrors the modules array in RoleManagement.tsx). */
const ALL_FRONTEND_MODULES = Object.values(backendToFrontendModule);

/** Default permission values for a module that is absent in the backend response. */
const defaultPerms = () => ({
  view: false, create: false, edit: false,
  approve: false, export: false, configure: false, admin: false,
});

/**
 * Converts a role returned by the backend into the shape expected by the UI.
 * - status:      uppercase enum  → lowercase string  ('ACTIVE' → 'active')
 * - permissions: Permission[]    → ModulePermissions dict
 * - usersCount:  may be missing, defaults to 0
 */
function mapBackendRoleToFrontend(role: any) {
  // Build a full permissions dict seeded with defaults for every known module
  const permDict: Record<string, ReturnType<typeof defaultPerms>> = {};
  ALL_FRONTEND_MODULES.forEach(m => { permDict[m] = defaultPerms(); });

  // Overlay actual values from the backend permissions array
  const permsArray: any[] = Array.isArray(role.permissions) ? role.permissions : [];
  permsArray.forEach((p: any) => {
    const friendlyName = backendToFrontendModule[p.module];
    if (friendlyName) {
      permDict[friendlyName] = {
        view:      !!p.view,
        create:    !!p.create,
        edit:      !!p.edit,
        approve:   !!p.approve,
        export:    !!p.export,
        configure: !!p.configure,
        admin:     !!p.admin,
      };
    }
  });

  return {
    ...role,
    status:      (role.status as string)?.toLowerCase() ?? 'active',
    permissions: permDict,
    usersCount:  role.usersCount ?? role._count?.users ?? 0,
    createdAt:   role.createdAt ?? new Date().toISOString(),
    description: role.description ?? '',
  };
}

/**
 * Converts a frontend role payload into the shape required by the backend.
 * - status:      lowercase string  → uppercase enum  ('active' → 'ACTIVE')
 * - permissions: ModulePermissions dict → PermissionDto[]
 */
function mapFrontendRoleToBackend(data: any) {
  const { permissions, status, ...rest } = data;

  // Convert status to uppercase
  const mappedStatus = status ? (status as string).toUpperCase() : undefined;

  // Convert permissions dict → array only when permissions are provided
  let mappedPermissions: any[] | undefined;
  if (permissions && typeof permissions === 'object' && !Array.isArray(permissions)) {
    mappedPermissions = Object.entries(permissions)
      .map(([moduleFriendly, perms]: [string, any]) => {
        const backendModule = frontendToBackendModule[moduleFriendly];
        if (!backendModule) return null; // skip unknown modules
        return {
          module:    backendModule,
          view:      !!perms?.view,
          create:    !!perms?.create,
          edit:      !!perms?.edit,
          approve:   !!perms?.approve,
          export:    !!perms?.export,
          configure: !!perms?.configure,
          admin:     !!perms?.admin,
        };
      })
      .filter(Boolean);
  } else if (Array.isArray(permissions)) {
    // Already in array form (e.g. archive-only updates), pass through
    mappedPermissions = permissions;
  }

  return {
    ...rest,
    ...(mappedStatus !== undefined  ? { status: mappedStatus }           : {}),
    ...(mappedPermissions !== undefined ? { permissions: mappedPermissions } : {}),
  };
}

export const rolesService = {
  getAll: async (params?: any) => {
    if (!FEATURE_FLAGS.users) return null;
    const res = await api.get('/api/v1/roles', { params });
    // Backend may return a plain array or a paginated { data: [...] } object
    if (Array.isArray(res.data)) {
      return res.data.map(mapBackendRoleToFrontend);
    }
    if (res.data?.data && Array.isArray(res.data.data)) {
      return { ...res.data, data: res.data.data.map(mapBackendRoleToFrontend) };
    }
    return res.data;
  },

  getById: async (id: string) => {
    if (!FEATURE_FLAGS.users) return null;
    const res = await api.get(`/api/v1/roles/${id}`);
    return mapBackendRoleToFrontend(res.data);
  },

  create: async (data: any) => {
    if (!FEATURE_FLAGS.users) return null;
    const backendPayload = mapFrontendRoleToBackend(data);
    const res = await api.post('/api/v1/roles', backendPayload);
    return mapBackendRoleToFrontend(res.data);
  },

  update: async (id: string, data: any) => {
    if (!FEATURE_FLAGS.users) return null;
    const backendPayload = mapFrontendRoleToBackend(data);
    const res = await api.put(`/api/v1/roles/${id}`, backendPayload);
    return mapBackendRoleToFrontend(res.data);
  },
};

// ─── Invitations ────────────────────────────────────────────

export const invitationsService = {
  getAll: async (params?: any) => {
    if (!FEATURE_FLAGS.users) return null;
    const res = await api.get('/api/v1/invitations', { params });
    return res.data;
  },

  create: async (data: any) => {
    if (!FEATURE_FLAGS.users) return null;
    const res = await api.post('/api/v1/invitations', data);
    return res.data;
  },
};

// ─── Sessions ───────────────────────────────────────────────

export const sessionsService = {
  getAll: async (params?: any) => {
    if (!FEATURE_FLAGS.users) return null;
    const res = await api.get('/api/v1/sessions', { params });
    return res.data;
  },

  delete: async (id: string) => {
    if (!FEATURE_FLAGS.users) return null;
    const res = await api.delete(`/api/v1/sessions/${id}`);
    return res.data;
  },
};

// ─── Audit Logs ─────────────────────────────────────────────

/**
 * Maps backend audit log properties to the frontend AuditLog structure.
 */
function mapBackendAuditLogToFrontend(log: any) {
  if (!log) return log;

  // 1. Get userName: from nested user relation, otherwise fallback to top level or 'System'
  let userName = "System";
  if (log.user && typeof log.user === 'object' && log.user.name) {
    userName = log.user.name;
  } else if (log.userName) {
    userName = log.userName;
  }

  // 2. Format details to a string to ensure no object/json structures break the UI
  let details = "";
  if (log.details !== null && log.details !== undefined) {
    if (typeof log.details === "string") {
      details = log.details;
    } else {
      try {
        details = JSON.stringify(log.details);
      } catch (e) {
        details = String(log.details);
      }
    }
  }

  // 3. Category from uppercase (e.g. "SESSION") to lowercase ("session")
  const category = log.category ? (log.category as string).toLowerCase() : "status";

  // 4. Timestamp from createdAt (backend uses ISO datetime for createdAt)
  let timestamp = "";
  if (log.createdAt) {
    try {
      timestamp = new Date(log.createdAt).toLocaleString();
    } catch (e) {
      timestamp = String(log.createdAt);
    }
  } else if (log.timestamp) {
    timestamp = log.timestamp;
  }

  // 5. Severity from uppercase to lowercase
  const severity = log.severity ? (log.severity as string).toLowerCase() : "info";

  return {
    ...log,
    userName,
    details,
    category,
    timestamp,
    severity,
  };
}

export const auditLogsService = {
  getAll: async (params?: any) => {
    if (!FEATURE_FLAGS.users) return null;
    const res = await api.get('/api/v1/audit-logs', { params });
    if (res.data) {
      if (Array.isArray(res.data.data)) {
        return {
          ...res.data,
          data: res.data.data.map(mapBackendAuditLogToFrontend),
        };
      } else if (Array.isArray(res.data)) {
        return res.data.map(mapBackendAuditLogToFrontend);
      }
    }
    return res.data;
  },
};

// ─── Access Rules ───────────────────────────────────────────

export const accessRulesService = {
  getAll: async (params?: any) => {
    if (!FEATURE_FLAGS.users) return null;
    const res = await api.get('/api/v1/access-rules', { params });
    return res.data;
  },

  getById: async (id: string) => {
    if (!FEATURE_FLAGS.users) return null;
    const res = await api.get(`/api/v1/access-rules/${id}`);
    return res.data;
  },

  create: async (data: any) => {
    if (!FEATURE_FLAGS.users) return null;
    const res = await api.post('/api/v1/access-rules', data);
    return res.data;
  },

  update: async (id: string, data: any) => {
    if (!FEATURE_FLAGS.users) return null;
    const res = await api.put(`/api/v1/access-rules/${id}`, data);
    return res.data;
  },

  delete: async (id: string) => {
    if (!FEATURE_FLAGS.users) return null;
    const res = await api.delete(`/api/v1/access-rules/${id}`);
    return res.data;
  },
};
