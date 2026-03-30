/**
 * Grievances Service
 */

import api from '@/lib/api';

const unwrapList = <T>(payload: any): T[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export const grievancesService = {
  getAll: async (params?: Record<string, unknown>) => {
    const res = await api.get('/api/v1/grievances', { params });
    return unwrapList(res.data);
  },

  getById: async (id: string) => {
    const res = await api.get(`/api/v1/grievances/${id}`);
    return res.data;
  },

  create: async (data: any) => {
    const res = await api.post('/api/v1/grievances', data);
    return res.data;
  },

  update: async (id: string, data: any) => {
    const res = await api.put(`/api/v1/grievances/${id}`, data);
    return res.data;
  },

  addComment: async (id: string, data: { content: string }) => {
    const res = await api.post(`/api/v1/grievances/${id}/comment`, data);
    return res.data;
  },

  escalate: async (id: string) => {
    const res = await api.post(`/api/v1/grievances/${id}/escalate`);
    return res.data;
  },

  getMetrics: async () => {
    const res = await api.get('/api/v1/grievances/metrics');
    const data = res.data ?? {};

    return {
      total: data.total || 0,
      open: (data.byStatus?.OPEN || 0) + (data.byStatus?.open || 0) + (data.open || 0),
      inProgress: (data.byStatus?.IN_PROGRESS || 0) + (data.byStatus?.in_progress || 0) + (data.inProgress || 0),
      resolved: (data.byStatus?.RESOLVED || 0) + (data.byStatus?.resolved || 0) + (data.resolved || 0),
      escalated: (data.byStatus?.ESCALATED || 0) + (data.byStatus?.escalated || 0) + (data.escalated || 0),
      avgResolutionDays: data.avgResolutionDays || 0,
      trendData: Array.isArray(data.trendData) ? data.trendData : [],
      resolutionTimeDistribution: Array.isArray(data.resolutionTimeDistribution) ? data.resolutionTimeDistribution : [],
      byCategory: data.byCategory || {},
      byPriority: data.byPriority || {},
    };
  },
};
