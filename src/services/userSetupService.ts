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
    const res = await api.put(`/api/v1/users/${id}/status`, { status });
    return res.data;
  },
};

// ─── Roles ──────────────────────────────────────────────────

export const rolesService = {
  getAll: async (params?: any) => {
    if (!FEATURE_FLAGS.users) return null;
    const res = await api.get('/api/v1/roles', { params });
    return res.data;
  },

  getById: async (id: string) => {
    if (!FEATURE_FLAGS.users) return null;
    const res = await api.get(`/api/v1/roles/${id}`);
    return res.data;
  },

  create: async (data: any) => {
    if (!FEATURE_FLAGS.users) return null;
    const res = await api.post('/api/v1/roles', data);
    return res.data;
  },

  update: async (id: string, data: any) => {
    if (!FEATURE_FLAGS.users) return null;
    const res = await api.put(`/api/v1/roles/${id}`, data);
    return res.data;
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

export const auditLogsService = {
  getAll: async (params?: any) => {
    if (!FEATURE_FLAGS.users) return null;
    const res = await api.get('/api/v1/audit-logs', { params });
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
