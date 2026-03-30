/**
 * Settings Service
 */

import api from '@/lib/api';
import { FEATURE_FLAGS } from '@/lib/featureFlags';

export const settingsService = {
  get: async (tenantId?: string) => {
    if (!FEATURE_FLAGS.settings) return null;
    const res = await api.get('/api/v1/settings', { params: { tenantId } });
    return res.data;
  },

  update: async (data: any) => {
    if (!FEATURE_FLAGS.settings) return null;
    const res = await api.put('/api/v1/settings', data);
    return res.data;
  },
};
