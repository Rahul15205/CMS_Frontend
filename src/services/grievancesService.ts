/**
 * Grievances Service
 */

import api from '@/lib/api';
import { FEATURE_FLAGS } from '@/lib/featureFlags';
import { mockGrievances } from '@/data/mockGrievances';

export const grievancesService = {
  getAll: async (params?: {
    status?: string; category?: string; priority?: string;
    assignedTo?: string; search?: string; tenantId?: string;
    limit?: number; offset?: number;
  }) => {
    if (!FEATURE_FLAGS.grievances) return mockGrievances;
    const res = await api.get('/api/grievances', { params });
    // Handle paginated response from backend
    if (res.data && res.data.data && Array.isArray(res.data.data)) {
      return res.data.data;
    }
    return res.data;
  },

  getById: async (id: string) => {
    if (!FEATURE_FLAGS.grievances) {
      return mockGrievances.find(g => g.id === id) || null;
    }
    const res = await api.get(`/api/grievances/${id}`);
    return res.data;
  },

  create: async (data: any) => {
    if (!FEATURE_FLAGS.grievances) {
      const newGrievance = {
        ...data,
        id: `GRV-2024-${Math.floor(Math.random() * 9000) + 1000}`,
        status: 'open',
        createdDate: new Date().toISOString().split('T')[0],
        lastUpdate: 'Just now'
      };
      return newGrievance;
    }
    const res = await api.post('/api/grievances', data);
    return res.data;
  },

  update: async (id: string, data: any) => {
    if (!FEATURE_FLAGS.grievances) {
      const grievance = mockGrievances.find(g => g.id === id);
      return grievance ? { ...grievance, ...data } : null;
    }
    const res = await api.put(`/api/grievances/${id}`, data);
    return res.data;
  },

  addComment: async (id: string, data: { content: string; type?: string }) => {
    if (!FEATURE_FLAGS.grievances) {
      return { id: Math.random().toString(), ...data, createdAt: new Date().toISOString() };
    }
    const res = await api.post(`/api/grievances/${id}/comment`, data);
    return res.data;
  },

  escalate: async (id: string) => {
    if (!FEATURE_FLAGS.grievances) {
      const grievance = mockGrievances.find(g => g.id === id);
      return grievance ? { ...grievance, status: 'escalated' } : null;
    }
    const res = await api.post(`/api/grievances/${id}/escalate`);
    return res.data;
  },

  getMetrics: async () => {
    if (!FEATURE_FLAGS.grievances) {
      return {
        total: mockGrievances.length,
        open: mockGrievances.filter(g => g.status === 'open').length,
        inProgress: mockGrievances.filter(g => g.status === 'in-progress' || g.status === 'in_progress').length,
        resolved: mockGrievances.filter(g => g.status === 'resolved').length,
        escalated: mockGrievances.filter(g => g.status === 'escalated').length
      };
    }
    const res = await api.get('/api/grievances/metrics');
    const data = res.data;
    
    // Normalize backend metrics (handle uppercase keys from enum)
    return {
      total: data.total || 0,
      open: (data.byStatus?.OPEN || 0) + (data.byStatus?.open || 0),
      inProgress: (data.byStatus?.IN_PROGRESS || 0) + (data.byStatus?.in_progress || 0),
      resolved: (data.byStatus?.RESOLVED || 0) + (data.byStatus?.resolved || 0),
      escalated: (data.byStatus?.ESCALATED || 0) + (data.byStatus?.escalated || 0)
    };
  },
};
