import api from '@/lib/api';

export const rightsService = {
  getAll: async (params?: Record<string, unknown>) => {
    const res = await api.get('/api/v1/rights/requests', { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await api.get(`/api/v1/rights/requests/${id}`);
    return res.data;
  },
  create: async (data: any) => {
    const res = await api.post('/api/v1/rights/requests', data);
    return res.data;
  },
  update: async (id: string, data: any) => {
    const res = await api.put(`/api/v1/rights/requests/${id}`, data);
    return res.data;
  },
  updateStatus: async (id: string, data: any) => {
    const res = await api.put(`/api/v1/rights/requests/${id}/status`, data);
    return res.data;
  },
  assign: async (id: string, data: any) => {
    const res = await api.put(`/api/v1/rights/requests/${id}/assign`, data);
    return res.data;
  },
  getWorkflow: async (id: string) => {
    const res = await api.get(`/api/v1/rights/requests/${id}/workflow`);
    return res.data;
  },
  getNotes: async (id: string) => {
    const res = await api.get(`/api/v1/rights/requests/${id}/notes`);
    return res.data;
  },
  addNote: async (id: string, data: any) => {
    const res = await api.post(`/api/v1/rights/requests/${id}/notes`, data);
    return res.data;
  },
  getAttachments: async (id: string) => {
    const res = await api.get(`/api/v1/rights/requests/${id}/attachments`);
    return res.data;
  },
  addAttachment: async (id: string, data: any) => {
    const res = await api.post(`/api/v1/rights/requests/${id}/attachments`, data);
    return res.data;
  },
  getEvidence: async (id?: string) => {
    const res = await api.get(id ? `/api/v1/rights/requests/${id}/evidence` : '/api/v1/rights/evidence');
    return res.data;
  },
  addEvidence: async (id: string, data: FormData) => {
    const res = await api.post(`/api/v1/rights/requests/${id}/evidence`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  verifyEvidence: async (requestId: string, evidenceId: string, verified: boolean) => {
    const res = await api.put(`/api/v1/rights/requests/${requestId}/evidence/${evidenceId}/verify`, { verified });
    return res.data;
  },
  getAuditTrail: async (id?: string) => {
    const res = await api.get(id ? `/api/v1/rights/requests/${id}/audit` : '/api/v1/rights/audit');
    return res.data;
  },
  getMetrics: async () => {
    const res = await api.get('/api/v1/rights/metrics');
    return res.data;
  },
  getAnalytics: async () => {
    const res = await api.get('/api/v1/rights/analytics');
    return res.data;
  },
};
