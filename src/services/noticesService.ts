/**
 * Notices Service
 */

import api from '@/lib/api';
import { FEATURE_FLAGS } from '@/lib/featureFlags';
import { 
  mockNotices, 
  mockNoticeHistory, 
  mockNoticeLanguages, 
  mockNoticeTypes 
} from '@/data/mockNotices';

export const noticesService = {
  getAll: async (params?: { status?: string; typeId?: string; tenantId?: string; search?: string; limit?: number; offset?: number }) => {
    if (!FEATURE_FLAGS.notices) return { data: mockNotices, total: mockNotices.length };
    const res = await api.get('/api/notices', { params });
    return res.data;
  },

  getById: async (id: string) => {
    if (!FEATURE_FLAGS.notices) return mockNotices.find(n => n.id === id) || null;
    const res = await api.get(`/api/notices/${id}`);
    return res.data;
  },

  create: async (data: any) => {
    if (!FEATURE_FLAGS.notices) return { id: `NOT-${Math.random().toString(36).substr(2, 3).toUpperCase()}`, ...data };
    const res = await api.post('/api/notices', data);
    return res.data;
  },

  update: async (id: string, data: any) => {
    if (!FEATURE_FLAGS.notices) return { id, ...data };
    const res = await api.put(`/api/notices/${id}`, data);
    return res.data;
  },

  getHistory: async (id: string) => {
    if (!FEATURE_FLAGS.notices) return mockNoticeHistory.filter(h => h.title === (mockNotices.find(n => n.id === id)?.title));
    const res = await api.get(`/api/notices/${id}/history`);
    return res.data;
  },

  getGlobalHistory: async () => {
    if (!FEATURE_FLAGS.notices) return mockNoticeHistory;
    const res = await api.get('/api/notices/history/global');
    return res.data.map((item: any) => ({
      ...item,
      date: new Date(item.createdAt).toLocaleDateString(),
      version: `${item.version}.0`, // Format as major version
      author: item.author || 'System', // Fallback if no author
    }));
  },

  getLanguages: async (tenantId?: string) => {
    if (!FEATURE_FLAGS.notices) return mockNoticeLanguages;
    const res = await api.get('/api/notices/languages', { params: { tenantId } });
    return res.data;
  },

  createLanguage: async (data: { code: string; name: string; isDefault?: boolean; tenantId?: string }) => {
    if (!FEATURE_FLAGS.notices) return { ...data, completion: 0 };
    const res = await api.post('/api/notices/languages', data);
    return res.data;
  },

  updateLanguage: async (code: string, data: { isDefault?: boolean; tenantId?: string }) => {
    if (!FEATURE_FLAGS.notices) return { code, ...data };
    const res = await api.put(`/api/notices/languages/${code}`, data);
    return res.data;
  },

  deleteLanguage: async (code: string, tenantId?: string) => {
    if (!FEATURE_FLAGS.notices) return { success: true };
    const res = await api.delete(`/api/notices/languages/${code}`, { params: { tenantId } });
    return res.data;
  },

  getTypes: async (tenantId?: string) => {
    if (!FEATURE_FLAGS.notices) return mockNoticeTypes;
    const res = await api.get('/api/notices/types', { params: { tenantId } });
    return res.data;
  },

  createType: async (data: any) => {
    if (!FEATURE_FLAGS.notices) return { id: Math.random().toString(36).substr(2, 5), ...data };
    const res = await api.post('/api/notices/types', data);
    return res.data;
  },
};

