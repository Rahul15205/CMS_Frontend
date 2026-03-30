import api from '@/lib/api';

const unwrapList = <T>(payload: any): T[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export const consentTemplatesService = {
  getAll: async (params?: Record<string, unknown>) => {
    const res = await api.get('/api/v1/consent-templates', { params });
    return res.data;
  },
  create: async (data: any) => {
    const res = await api.post('/api/v1/consent-templates', data);
    return res.data;
  },
};

export const purposesService = {
  getAll: async () => {
    const res = await api.get('/api/v1/purposes');
    return unwrapList(res.data);
  },
  create: async (data: any) => {
    const res = await api.post('/api/v1/purposes', data);
    return res.data;
  },
  update: async (id: string, data: any) => {
    const res = await api.put(`/api/v1/purposes/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await api.delete(`/api/v1/purposes/${id}`);
    return res.data;
  },
};

export const languagesService = {
  getAll: async () => {
    const res = await api.get('/api/v1/languages');
    return unwrapList(res.data);
  },
  create: async (data: any) => {
    const res = await api.post('/api/v1/languages', data);
    return res.data;
  },
  update: async (id: string, data: any) => {
    const res = await api.put(`/api/v1/languages/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await api.delete(`/api/v1/languages/${id}`);
    return res.data;
  },
};

export const slaRulesService = {
  getAll: async (params?: Record<string, unknown>) => {
    const res = await api.get('/api/v1/config/sla-rules', { params });
    return unwrapList(res.data);
  },
  create: async (data: any) => {
    const res = await api.post('/api/v1/config/sla-rules', data);
    return res.data;
  },
  update: async (id: string, data: any) => {
    const res = await api.put(`/api/v1/config/sla-rules/${id}`, data);
    return res.data;
  },
};

export const notificationRulesService = {
  getAll: async (params?: Record<string, unknown>) => {
    const res = await api.get('/api/v1/config/notification-rules', { params });
    return unwrapList(res.data);
  },
  create: async (data: any) => {
    const res = await api.post('/api/v1/config/notification-rules', data);
    return res.data;
  },
  update: async (id: string, data: any) => {
    const res = await api.put(`/api/v1/config/notification-rules/${id}`, data);
    return res.data;
  },
};

export const escalationRulesService = {
  getAll: async (params?: Record<string, unknown>) => {
    const res = await api.get('/api/v1/config/escalation-rules', { params });
    return unwrapList(res.data);
  },
  create: async (data: any) => {
    const res = await api.post('/api/v1/config/escalation-rules', data);
    return res.data;
  },
  update: async (id: string, data: any) => {
    const res = await api.put(`/api/v1/config/escalation-rules/${id}`, data);
    return res.data;
  },
};

export const apiKeysService = {
  getAll: async (tenantId?: string) => {
    const res = await api.get('/api/v1/config/api-keys', { params: { tenantId } });
    return unwrapList(res.data);
  },
  create: async (data: any) => {
    const res = await api.post('/api/v1/config/api-keys', data);
    return res.data;
  },
  update: async (id: string, data: any) => {
    if (data?.status === 'revoked') {
      await api.delete(`/api/v1/config/api-keys/${id}`);
      return { ...data, id };
    }
    return { ...data, id };
  },
};

export const logRetentionService = {
  getAll: async (tenantId?: string) => {
    const res = await api.get('/api/v1/config/log-retention', { params: { tenantId } });
    return unwrapList(res.data);
  },
  create: async (data: any) => {
    const res = await api.post('/api/v1/config/log-retention', data);
    return res.data;
  },
  update: async (id: string, data: any) => {
    const res = await api.put(`/api/v1/config/log-retention/${id}`, data);
    return res.data;
  },
};

export const exportConfigsService = {
  getAll: async (tenantId?: string) => {
    const res = await api.get('/api/v1/config/export', { params: { tenantId } });
    return unwrapList(res.data);
  },
  create: async (data: any) => {
    const res = await api.post('/api/v1/config/export', data);
    return res.data;
  },
  update: async (id: string, data: any) => {
    const res = await api.put(`/api/v1/config/export/${id}`, data);
    return res.data;
  },
};

export const workflowConfigsService = {
  getAll: async (params?: Record<string, unknown>) => {
    const res = await api.get('/api/v1/config/workflows', { params });
    return unwrapList(res.data);
  },
  create: async (data: any) => {
    const res = await api.post('/api/v1/config/workflows', data);
    return res.data;
  },
  update: async (id: string, data: any) => {
    const res = await api.put(`/api/v1/config/workflows/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await api.delete(`/api/v1/config/workflows/${id}`);
    return res.data;
  },
};

export const encryptionConfigService = {
  get: async (tenantId?: string) => {
    const res = await api.get('/api/v1/config/encryption', { params: { tenantId } });
    return res.data;
  },
  update: async (data: any, tenantId?: string) => {
    const res = await api.put('/api/v1/config/encryption', data, { params: { tenantId } });
    return res.data;
  },
  rotate: async (tenantId?: string) => {
    const res = await api.post('/api/v1/config/encryption/rotate', undefined, { params: { tenantId } });
    return res.data;
  },
};

export const aadhaarConfigService = {
  get: async (tenantId?: string) => {
    const res = await api.get('/api/v1/config/aadhaar', { params: { tenantId } });
    return res.data;
  },
  update: async (data: any, tenantId?: string) => {
    const res = await api.put('/api/v1/config/aadhaar', data, { params: { tenantId } });
    return res.data;
  },
};
