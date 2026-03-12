/**
 * Integrations Service
 */

import api from '@/lib/api';
import { FEATURE_FLAGS } from '@/lib/featureFlags';

export const integrationsService = {
  getAll: async (params?: { type?: string; status?: string; tenantId?: string; limit?: number; offset?: number }) => {
    if (!FEATURE_FLAGS.integrations) return null;
    const res = await api.get('/api/integrations', { params });
    return res.data;
  },

  getMetrics: async () => {
    if (!FEATURE_FLAGS.integrations) return null;
    const res = await api.get('/api/integrations/metrics');
    return res.data;
  },

  getById: async (id: string) => {
    if (!FEATURE_FLAGS.integrations) return null;
    const res = await api.get(`/api/integrations/${id}`);
    return res.data;
  },

  create: async (data: any) => {
    if (!FEATURE_FLAGS.integrations) return null;
    const res = await api.post('/api/integrations', data);
    return res.data;
  },

  update: async (id: string, data: any) => {
    if (!FEATURE_FLAGS.integrations) return null;
    const res = await api.put(`/api/integrations/${id}`, data);
    return res.data;
  },

  connect: async (id: string) => {
    if (!FEATURE_FLAGS.integrations) return null;
    const res = await api.post(`/api/integrations/${id}/connect`);
    return res.data;
  },

  disconnect: async (id: string) => {
    if (!FEATURE_FLAGS.integrations) return null;
    const res = await api.post(`/api/integrations/${id}/disconnect`);
    return res.data;
  },

  sync: async (id: string) => {
    if (!FEATURE_FLAGS.integrations) return null;
    const res = await api.post(`/api/integrations/${id}/sync`);
    return res.data;
  },

  getSyncLogs: async (id: string, limit = 20) => {
    if (!FEATURE_FLAGS.integrations) return null;
    const res = await api.get(`/api/integrations/${id}/logs`, { params: { limit } });
    return res.data;
  },

  delete: async (id: string) => {
    if (!FEATURE_FLAGS.integrations) return null;
    const res = await api.delete(`/api/integrations/${id}`);
    return res.data;
  },
};
