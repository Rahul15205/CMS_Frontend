/**
 * Reports, Security & System Logs Services
 */

import api from '@/lib/api';
import { FEATURE_FLAGS } from '@/lib/featureFlags';

// ─── Reports ────────────────────────────────────────────────

export const reportsService = {
  getAll: async (params?: { tenantId?: string; reportType?: string; limit?: number; offset?: number }) => {
    if (!FEATURE_FLAGS.reports) return null;
    const res = await api.get('/api/v1/reports', { params });
    return res.data;
  },

  create: async (data: any) => {
    if (!FEATURE_FLAGS.reports) return null;
    const res = await api.post('/api/v1/reports', data);
    return res.data;
  },

  download: async (id: string) => {
    if (!FEATURE_FLAGS.reports) return null;
    const res = await api.get(`/api/v1/reports/${id}/download`);
    return res.data;
  },

  delete: async (id: string) => {
    if (!FEATURE_FLAGS.reports) return null;
    const res = await api.delete(`/api/v1/reports/${id}`);
    return res.data;
  },
};

// ─── Security ───────────────────────────────────────────────

export const securityService = {
  getEvents: async (params?: { tenantId?: string; limit?: number; offset?: number }) => {
    if (!FEATURE_FLAGS.security) return null;
    const res = await api.get('/api/v1/security/events', { params });
    return res.data;
  },

  getLoginActivity: async (tenantId?: string, days?: number) => {
    if (!FEATURE_FLAGS.security) return null;
    const res = await api.get('/api/v1/security/login-activity', { params: { tenantId, days } });
    return res.data;
  },

  getActiveSessions: async (tenantId?: string, limit?: number) => {
    if (!FEATURE_FLAGS.security) return null;
    const res = await api.get('/api/v1/security/sessions', { params: { tenantId, limit } });
    return res.data;
  },
};

// ─── System Logs ────────────────────────────────────────────

export const systemLogsService = {
  getAll: async (params?: {
    category?: string; search?: string; tenantId?: string;
    startDate?: string; endDate?: string;
    limit?: number; offset?: number;
  }) => {
    if (!FEATURE_FLAGS.logs) return null;
    const res = await api.get('/api/v1/logs', { params });
    return res.data;
  },

  export: async (params?: { category?: string; tenantId?: string; startDate?: string; endDate?: string }) => {
    if (!FEATURE_FLAGS.logs) return null;
    const res = await api.get('/api/v1/logs/export', { params });
    return res.data;
  },
};
