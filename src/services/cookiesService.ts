/**
 * Cookies Management Service
 *
 * Covers categories, inventory, websites/scanner, banners, consent logs, compliance.
 */

import api from '@/lib/api';
import { FEATURE_FLAGS } from '@/lib/featureFlags';
import { 
  mockCookieCategories, 
  mockCookieInventory, 
  mockWebsites, 
  mockBanners, 
  mockConsentLogs, 
  mockCookieComplianceMetrics 
} from '@/data/mockCookies';

// ─── Categories ───────────────────────────────────────────────

export const cookieCategoriesService = {
  getAll: async () => {
    if (!FEATURE_FLAGS.cookies) return mockCookieCategories;
    const res = await api.get('/api/cookies/categories');
    return res.data;
  },
  create: async (data: any) => {
    if (!FEATURE_FLAGS.cookies) {
      return { id: Math.random().toString(), ...data };
    }
    const res = await api.post('/api/cookies/categories', data);
    return res.data;
  },
  update: async (id: string, data: any) => {
    if (!FEATURE_FLAGS.cookies) {
      return { id, ...data };
    }
    const res = await api.put(`/api/cookies/categories/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    if (!FEATURE_FLAGS.cookies) return { success: true };
    const res = await api.delete(`/api/cookies/categories/${id}`);
    return res.data;
  },
};

// ─── Inventory ────────────────────────────────────────────────

export const cookieInventoryService = {
  getAll: async () => {
    if (!FEATURE_FLAGS.cookies) return mockCookieInventory;
    const res = await api.get('/api/cookies/inventory');
    return res.data;
  },
  create: async (data: any) => {
    if (!FEATURE_FLAGS.cookies) {
      return { id: Math.random().toString(), ...data };
    }
    const res = await api.post('/api/cookies/inventory', data);
    return res.data;
  },
  update: async (id: string, data: any) => {
    if (!FEATURE_FLAGS.cookies) {
      return { id, ...data };
    }
    const res = await api.put(`/api/cookies/inventory/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    if (!FEATURE_FLAGS.cookies) return { success: true };
    const res = await api.delete(`/api/cookies/inventory/${id}`);
    return res.data;
  },
};

// ─── Websites (Scanner) ──────────────────────────────────────

export const cookieWebsitesService = {
  getAll: async () => {
    if (!FEATURE_FLAGS.cookies) return mockWebsites;
    const res = await api.get('/api/cookies/websites');
    return res.data;
  },
  create: async (data: any) => {
    if (!FEATURE_FLAGS.cookies) {
      return { id: Math.random().toString(), ...data, status: 'Active', lastScan: 'Never' };
    }
    const res = await api.post('/api/cookies/websites', data);
    return res.data;
  },
  update: async (id: string, data: any) => {
    if (!FEATURE_FLAGS.cookies) {
      return { id, ...data };
    }
    const res = await api.put(`/api/cookies/websites/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    if (!FEATURE_FLAGS.cookies) return { success: true };
    const res = await api.delete(`/api/cookies/websites/${id}`);
    return res.data;
  },
  startScan: async (id: string) => {
    if (!FEATURE_FLAGS.cookies) return { success: true };
    const res = await api.post(`/api/cookies/scan/${id}`);
    return res.data;
  },
};

// ─── Banners ──────────────────────────────────────────────────

export const cookieBannersService = {
  getAll: async () => {
    if (!FEATURE_FLAGS.cookies) return mockBanners;
    const res = await api.get('/api/cookies/banners');
    return res.data;
  },
  create: async (data: any) => {
    if (!FEATURE_FLAGS.cookies) {
      return { id: Math.random().toString(), ...data, lastModified: 'Just now', status: 'Draft' };
    }
    const res = await api.post('/api/cookies/banners', data);
    return res.data;
  },
  update: async (id: string, data: any) => {
    if (!FEATURE_FLAGS.cookies) {
      return { id, ...data, lastModified: 'Just now' };
    }
    const res = await api.put(`/api/cookies/banners/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    if (!FEATURE_FLAGS.cookies) return { success: true };
    const res = await api.delete(`/api/cookies/banners/${id}`);
    return res.data;
  },
};

// ─── Consent Logs & Compliance ────────────────────────────────

export const cookieConsentLogsService = {
  getAll: async () => {
    if (!FEATURE_FLAGS.cookies) return mockConsentLogs;
    const res = await api.get('/api/cookies/consent-logs');
    return res.data;
  },
  record: async (data: any) => {
    if (!FEATURE_FLAGS.cookies) {
      return { id: Math.random().toString(), ...data, date: new Date().toISOString(), status: 'Active' };
    }
    const res = await api.post('/api/cookies/consent-logs', data);
    return res.data;
  },
};

export const cookieComplianceService = {
  getMetrics: async () => {
    if (!FEATURE_FLAGS.cookies) return mockCookieComplianceMetrics;
    const res = await api.get('/api/cookies/compliance');
    return res.data;
  },
};

