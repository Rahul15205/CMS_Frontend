/**
 * Integrations Service
 */

import api from '@/lib/api';
import { FEATURE_FLAGS } from '@/lib/featureFlags';

export const integrationsService = {
  getAll: async (params?: { type?: string; status?: string; tenantId?: string; limit?: number; offset?: number }) => {
    if (!FEATURE_FLAGS.integrations) return null;
    const res = await api.get('/api/v1/integrations', { params });
    return res.data;
  },

  getMetrics: async () => {
    if (!FEATURE_FLAGS.integrations) return null;
    const res = await api.get('/api/v1/integrations/metrics');
    return res.data;
  },

  getById: async (id: string) => {
    if (!FEATURE_FLAGS.integrations) return null;
    const res = await api.get(`/api/v1/integrations/${id}`);
    return res.data;
  },

  create: async (data: any) => {
    if (!FEATURE_FLAGS.integrations) return null;
    const res = await api.post('/api/v1/integrations', data);
    return res.data;
  },

  update: async (id: string, data: any) => {
    if (!FEATURE_FLAGS.integrations) return null;
    const res = await api.put(`/api/v1/integrations/${id}`, data);
    return res.data;
  },

  connect: async (id: string) => {
    if (!FEATURE_FLAGS.integrations) return null;
    const res = await api.post(`/api/v1/integrations/${id}/connect`);
    return res.data;
  },

  disconnect: async (id: string) => {
    if (!FEATURE_FLAGS.integrations) return null;
    const res = await api.post(`/api/v1/integrations/${id}/disconnect`);
    return res.data;
  },

  sync: async (id: string) => {
    if (!FEATURE_FLAGS.integrations) return null;
    const res = await api.post(`/api/v1/integrations/${id}/sync`);
    return res.data;
  },

  getSyncLogs: async (id: string, limit = 20) => {
    if (!FEATURE_FLAGS.integrations) return null;
    const res = await api.get(`/api/v1/integrations/${id}/logs`, { params: { limit } });
    return res.data;
  },

  delete: async (id: string) => {
    if (!FEATURE_FLAGS.integrations) return null;
    const res = await api.delete(`/api/v1/integrations/${id}`);
    return res.data;
  },
};
