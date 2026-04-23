/**
 * Cookies Management Service
 *
 * Covers categories, inventory, websites/scanner, banners, consent logs, compliance.
 */

import api from '@/lib/api';

const unwrapList = <T>(payload: any): T[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export const cookieCategoriesService = {
  getAll: async () => {
    const res = await api.get('/api/v1/cookies/categories');
    return unwrapList(res.data);
  },
  create: async (data: any) => {
    const res = await api.post('/api/v1/cookies/categories', data);
    return res.data;
  },
  update: async (id: string, data: any) => {
    const res = await api.put(`/api/v1/cookies/categories/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await api.delete(`/api/v1/cookies/categories/${id}`);
    return res.data;
  },
};

export const cookieInventoryService = {
  getAll: async () => {
    const res = await api.get('/api/v1/cookies/inventory');
    return unwrapList(res.data);
  },
  create: async (data: any) => {
    const res = await api.post('/api/v1/cookies/inventory', data);
    return res.data;
  },
  update: async (id: string, data: any) => {
    const res = await api.put(`/api/v1/cookies/inventory/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await api.delete(`/api/v1/cookies/inventory/${id}`);
    return res.data;
  },
};

export const cookieWebsitesService = {
  getAll: async () => {
    const res = await api.get('/api/v1/cookies/websites');
    return unwrapList(res.data);
  },
  create: async (data: any) => {
    const res = await api.post('/api/v1/cookies/websites', data);
    return res.data;
  },
  update: async (id: string, data: any) => {
    const res = await api.put(`/api/v1/cookies/websites/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await api.delete(`/api/v1/cookies/websites/${id}`);
    return res.data;
  },
  startScan: async (id: string) => {
    const res = await api.post(`/api/v1/cookies/scan/${id}`);
    return res.data;
  },
};

export const cookieBannersService = {
  getAll: async () => {
    const res = await api.get('/api/v1/cookies/banners');
    return unwrapList(res.data);
  },
  create: async (data: any) => {
    const res = await api.post('/api/v1/cookies/banners', data);
    return res.data;
  },
  update: async (id: string, data: any) => {
    const res = await api.put(`/api/v1/cookies/banners/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await api.delete(`/api/v1/cookies/banners/${id}`);
    return res.data;
  },
};

export const cookieConsentLogsService = {
  getAll: async () => {
    const res = await api.get('/api/v1/cookies/consent-logs');
    return unwrapList(res.data);
  },
  record: async (data: any) => {
    const res = await api.post('/api/v1/cookies/consent-logs', data);
    return res.data;
  },
};

export const cookieComplianceService = {
  getMetrics: async (websiteId?: string) => {
    const res = await api.get('/api/v1/cookies/compliance', {
      params: { websiteId }
    });
    return res.data;
  },
};
