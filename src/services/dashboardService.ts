/**
 * Dashboard Service
 *
 * Handles KPIs, charts, recent activity, alerts, and widget config.
 */

import api from '@/lib/api';
import { FEATURE_FLAGS } from '@/lib/featureFlags';

export const dashboardService = {
  getKpis: async (tenantId?: string) => {
    if (!FEATURE_FLAGS.dashboard) return null;
    const res = await api.get('/api/v1/dashboard/kpis', { params: { tenantId } });
    return res.data;
  },

  getChartData: async (type: string, tenantId?: string) => {
    if (!FEATURE_FLAGS.dashboard) return null;
    const res = await api.get(`/api/v1/dashboard/charts/${type}`, { params: { tenantId } });
    return res.data;
  },

  getRecentActivity: async (tenantId?: string, limit = 20) => {
    if (!FEATURE_FLAGS.dashboard) return null;
    const res = await api.get('/api/v1/dashboard/recent-activity', { params: { tenantId, limit } });
    return res.data;
  },

  getAlerts: async (tenantId?: string) => {
    if (!FEATURE_FLAGS.dashboard) return null;
    const res = await api.get('/api/v1/dashboard/alerts', { params: { tenantId } });
    return res.data;
  },

  getSecurityKpis: async (tenantId?: string) => {
    if (!FEATURE_FLAGS.dashboard) return null;
    const res = await api.get('/api/v1/dashboard/security', { params: { tenantId } });
    return res.data;
  },

  getWidgetConfig: async () => {
    if (!FEATURE_FLAGS.dashboard) return null;
    const res = await api.get('/api/v1/dashboard/widget-config');
    return res.data;
  },

  updateWidgetConfig: async (widgets: any) => {
    if (!FEATURE_FLAGS.dashboard) return null;
    const res = await api.put('/api/v1/dashboard/widget-config', { widgets });
    return res.data;
  },
};
