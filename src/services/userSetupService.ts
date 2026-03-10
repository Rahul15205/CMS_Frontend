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
    const res = await api.get('/api/users', { params });
    return res.data;
  },

  getById: async (id: string) => {
    if (!FEATURE_FLAGS.users) return null;
    const res = await api.get(`/api/users/${id}`);
    return res.data;
  },

  create: async (data: any) => {
    if (!FEATURE_FLAGS.users) return null;
    const res = await api.post('/api/users', data);
    return res.data;
  },

  update: async (id: string, data: any) => {
    if (!FEATURE_FLAGS.users) return null;
    const res = await api.put(`/api/users/${id}`, data);
    return res.data;
  },

  updateStatus: async (id: string, status: string) => {
    if (!FEATURE_FLAGS.users) return null;
    const res = await api.put(`/api/users/${id}/status`, { status });
    return res.data;
  },
};

// ─── Roles ──────────────────────────────────────────────────

export const rolesService = {
  getAll: async (params?: any) => {
    if (!FEATURE_FLAGS.users) return null;
    const res = await api.get('/api/roles', { params });
    return res.data;
  },

  getById: async (id: string) => {
    if (!FEATURE_FLAGS.users) return null;
    const res = await api.get(`/api/roles/${id}`);
    return res.data;
  },

  create: async (data: any) => {
    if (!FEATURE_FLAGS.users) return null;
    const res = await api.post('/api/roles', data);
    return res.data;
  },

  update: async (id: string, data: any) => {
    if (!FEATURE_FLAGS.users) return null;
    const res = await api.put(`/api/roles/${id}`, data);
    return res.data;
  },
};

// ─── Invitations ────────────────────────────────────────────

export const invitationsService = {
  getAll: async (params?: any) => {
    if (!FEATURE_FLAGS.users) return null;
    const res = await api.get('/api/invitations', { params });
    return res.data;
  },

  create: async (data: any) => {
    if (!FEATURE_FLAGS.users) return null;
    const res = await api.post('/api/invitations', data);
    return res.data;
  },
};

// ─── Sessions ───────────────────────────────────────────────

export const sessionsService = {
  getAll: async (params?: any) => {
    if (!FEATURE_FLAGS.users) return null;
    const res = await api.get('/api/sessions', { params });
    return res.data;
  },

  delete: async (id: string) => {
    if (!FEATURE_FLAGS.users) return null;
    const res = await api.delete(`/api/sessions/${id}`);
    return res.data;
  },
};

// ─── Audit Logs ─────────────────────────────────────────────

export const auditLogsService = {
  getAll: async (params?: any) => {
    if (!FEATURE_FLAGS.users) return null;
    const res = await api.get('/api/audit-logs', { params });
    return res.data;
  },
};

// ─── Access Rules ───────────────────────────────────────────

export const accessRulesService = {
  getAll: async (params?: any) => {
    if (!FEATURE_FLAGS.users) return null;
    const res = await api.get('/api/access-rules', { params });
    return res.data;
  },

  getById: async (id: string) => {
    if (!FEATURE_FLAGS.users) return null;
    const res = await api.get(`/api/access-rules/${id}`);
    return res.data;
  },

  create: async (data: any) => {
    if (!FEATURE_FLAGS.users) return null;
    const res = await api.post('/api/access-rules', data);
    return res.data;
  },

  update: async (id: string, data: any) => {
    if (!FEATURE_FLAGS.users) return null;
    const res = await api.put(`/api/access-rules/${id}`, data);
    return res.data;
  },

  delete: async (id: string) => {
    if (!FEATURE_FLAGS.users) return null;
    const res = await api.delete(`/api/access-rules/${id}`);
    return res.data;
  },
};
