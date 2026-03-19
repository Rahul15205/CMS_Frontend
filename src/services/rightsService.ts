/**
 * Rights Management Service
 *
 * Covers requests CRUD, workflow, notes, attachments, evidence, audit, metrics.
 * Falls back to mock data when FEATURE_FLAGS.rights is false.
 */

import api from '@/lib/api';
import { FEATURE_FLAGS } from '@/lib/featureFlags';
import {
  mockRightsRequests,
  mockRightsMetrics,
  mockRightsBreakdown,
  mockRightsBreakdownChart,
} from '@/data/mockRights';

// ─── Inline mock data for sub-resources ─────────────────────
const mockWorkflowSteps = [
  { id: '1', name: 'Request Received', order: 1, status: 'completed', completedAt: '2024-01-18T10:30:00Z', completedBy: 'System' },
  { id: '2', name: 'Identity Verified', order: 2, status: 'completed', completedAt: '2024-01-18T14:00:00Z', completedBy: 'Jane Doe' },
  { id: '3', name: 'Acknowledged', order: 3, status: 'completed', completedAt: '2024-01-19T09:00:00Z', completedBy: 'Jane Doe' },
  { id: '4', name: 'In Review', order: 4, status: 'in_progress', assignedRole: 'Data Analyst' },
  { id: '5', name: 'Action Taken', order: 5, status: 'pending' },
  { id: '6', name: 'Response Sent', order: 6, status: 'pending' },
  { id: '7', name: 'Closed', order: 7, status: 'pending' },
];

const mockNotes = [
  { id: '1', caseId: '1', type: 'internal', content: 'Verified identity using email confirmation. All documents look correct.', createdBy: 'Jane Doe', createdAt: '2024-01-18T14:00:00Z' },
  { id: '2', caseId: '1', type: 'external', content: 'Dear John, we have received your request and are currently processing it. You will receive a response within 30 days.', createdBy: 'Jane Doe', createdAt: '2024-01-19T09:00:00Z' },
  { id: '3', caseId: '1', type: 'internal', content: 'Pulling data from CRM and Marketing systems. Need to coordinate with IT team for database exports.', createdBy: 'Raj Kumar', createdAt: '2024-01-19T11:30:00Z' },
];

const mockAuditLog = [
  { id: '1', caseId: '1', action: 'Request Created', performedBy: 'System', performedAt: '2024-01-18T10:30:00Z', details: 'Request submitted via web form', systemApplication: 'Website' },
  { id: '2', caseId: '1', action: 'Identity Verification Started', performedBy: 'Jane Doe', performedAt: '2024-01-18T11:00:00Z', details: 'Initiated email verification', ipAddress: '192.168.1.100' },
  { id: '3', caseId: '1', action: 'Identity Verified', performedBy: 'Jane Doe', performedAt: '2024-01-18T14:00:00Z', details: 'Email verified successfully', ipAddress: '192.168.1.100' },
  { id: '4', caseId: '1', action: 'Acknowledgement Sent', performedBy: 'Jane Doe', performedAt: '2024-01-19T09:00:00Z', details: 'Email acknowledgement sent to requester', ipAddress: '192.168.1.100' },
  { id: '5', caseId: '1', action: 'Status Changed', performedBy: 'Jane Doe', performedAt: '2024-01-19T09:05:00Z', details: "Status changed from 'Acknowledged' to 'In Review'", ipAddress: '192.168.1.100' },
  { id: '6', caseId: '1', action: 'Assigned', performedBy: 'Jane Doe', performedAt: '2024-01-19T09:10:00Z', details: 'Case assigned to Raj Kumar', ipAddress: '192.168.1.100' },
];

const mockEvidence = [
  { id: '1', caseNumber: 'RR-2024-001234', fileName: 'identity_verification_email.pdf', fileType: 'pdf', category: 'Identity Proof', uploadedBy: 'Jane Doe', uploadedAt: '2024-01-18T14:00:00Z', size: '245 KB', verified: true },
  { id: '2', caseNumber: 'RR-2024-001234', fileName: 'data_extract_personal.xlsx', fileType: 'xlsx', category: 'Data Extract', uploadedBy: 'System', uploadedAt: '2024-01-19T10:30:00Z', size: '1.2 MB', verified: true },
  { id: '3', caseNumber: 'RR-2024-001233', fileName: 'aadhaar_ekyc_response.json', fileType: 'json', category: 'Identity Proof', uploadedBy: 'System', uploadedAt: '2024-01-15T15:00:00Z', size: '12 KB', verified: true },
  { id: '4', caseNumber: 'RR-2024-001233', fileName: 'deletion_confirmation.pdf', fileType: 'pdf', category: 'Deletion Confirmation', uploadedBy: 'Raj Kumar', uploadedAt: '2024-01-20T09:00:00Z', size: '156 KB', verified: false },
  { id: '5', caseNumber: 'RR-2024-001232', fileName: 'communication_log.pdf', fileType: 'pdf', category: 'Communication', uploadedBy: 'Jane Doe', uploadedAt: '2024-01-12T11:00:00Z', size: '89 KB', verified: true },
];

const mockAuditRecords = [
  { id: '1', caseNumber: 'RR-2024-001234', action: 'Data Access Request Initiated', performedBy: 'System', performedAt: '2024-01-18T10:30:00Z', details: 'Request submitted via web portal', system: 'Website', severity: 'info' },
  { id: '2', caseNumber: 'RR-2024-001234', action: 'Identity Verified', performedBy: 'Jane Doe', performedAt: '2024-01-18T14:00:00Z', details: 'Email verification completed successfully', system: 'CMS', severity: 'info' },
  { id: '3', caseNumber: 'RR-2024-001233', action: 'Data Deletion Executed', performedBy: 'System', performedAt: '2024-01-19T16:00:00Z', details: 'Data deleted from CRM, HRMS, Marketing systems', system: 'Multi-System', consentVersion: 'v2.3', severity: 'critical' },
  { id: '4', caseNumber: 'RR-2024-001232', action: 'SLA Breach Detected', performedBy: 'System', performedAt: '2024-01-19T00:00:00Z', details: 'Request exceeded 45-day CCPA deadline', system: 'SLA Monitor', severity: 'warning' },
  { id: '5', caseNumber: 'RR-2024-001234', action: 'Data Extract Generated', performedBy: 'System', performedAt: '2024-01-19T10:30:00Z', details: 'Personal data extracted from 3 systems', system: 'Data Export Service', severity: 'info' },
];

const mockAnalyticsData = {
  regulationMetrics: [
    { regulation: 'GDPR', total: 523, fulfilled: 498, rejected: 15, pending: 10, avgDays: 4.2, slaCompliance: 96 },
    { regulation: 'DPDP', total: 412, fulfilled: 389, rejected: 12, pending: 11, avgDays: 3.8, slaCompliance: 97 },
    { regulation: 'CCPA', total: 189, fulfilled: 172, rejected: 8, pending: 9, avgDays: 5.1, slaCompliance: 93 },
    { regulation: 'LGPD', total: 78, fulfilled: 72, rejected: 3, pending: 3, avgDays: 2.9, slaCompliance: 98 },
    { regulation: 'PDPL', total: 45, fulfilled: 41, rejected: 2, pending: 2, avgDays: 4.5, slaCompliance: 95 },
  ],
  monthlyTrend: [
    { name: 'Aug', gdpr: 45, dpdp: 38, ccpa: 15, lgpd: 6 },
    { name: 'Sep', gdpr: 52, dpdp: 42, ccpa: 18, lgpd: 8 },
    { name: 'Oct', gdpr: 48, dpdp: 45, ccpa: 16, lgpd: 7 },
    { name: 'Nov', gdpr: 61, dpdp: 51, ccpa: 22, lgpd: 9 },
    { name: 'Dec', gdpr: 55, dpdp: 48, ccpa: 19, lgpd: 8 },
    { name: 'Jan', gdpr: 58, dpdp: 52, ccpa: 21, lgpd: 10 },
  ],
  applicationRisks: [
    { name: 'CRM System', requests: 234, slaBreaches: 3, riskScore: 12 },
    { name: 'HRMS', requests: 189, slaBreaches: 5, riskScore: 26 },
    { name: 'Marketing Platform', requests: 156, slaBreaches: 8, riskScore: 51 },
    { name: 'Mobile App', requests: 145, slaBreaches: 2, riskScore: 14 },
    { name: 'Website', requests: 312, slaBreaches: 4, riskScore: 13 },
    { name: 'ERP', requests: 78, slaBreaches: 1, riskScore: 13 },
  ],
  repeatRequesters: [
    { id: 'USR-12345', name: 'John Smith', requests: 5, lastRequest: '2024-01-15', status: 'Monitor' },
    { id: 'USR-23456', name: 'Emily Davis', requests: 4, lastRequest: '2024-01-18', status: 'Normal' },
    { id: 'USR-34567', name: 'Michael Brown', requests: 8, lastRequest: '2024-01-20', status: 'Flag' },
    { id: 'USR-45678', name: 'Sarah Wilson', requests: 3, lastRequest: '2024-01-12', status: 'Normal' },
  ],
  fulfilmentByType: [
    { name: 'Access', value: 96, color: 'hsl(217, 91%, 50%)' },
    { name: 'Correction', value: 98, color: 'hsl(142, 76%, 36%)' },
    { name: 'Erasure', value: 94, color: 'hsl(0, 72%, 51%)' },
    { name: 'Portability', value: 97, color: 'hsl(262, 83%, 58%)' },
    { name: 'Objection', value: 95, color: 'hsl(38, 92%, 50%)' },
  ],
  abuseIndicators: [
    { indicator: 'Excessive requests (>5/month)', count: 12, trend: 'up' },
    { indicator: 'Same IP, different identities', count: 3, trend: 'down' },
    { indicator: 'Failed verifications', count: 8, trend: 'neutral' },
    { indicator: 'Suspicious patterns', count: 2, trend: 'down' },
    { indicator: 'Rapid sequential requests', count: 5, trend: 'up' },
  ],
  typeDistribution: [
    { name: 'Access', value: 456, color: 'hsl(217, 91%, 50%)' },
    { name: 'Correction', value: 234, color: 'hsl(142, 76%, 36%)' },
    { name: 'Erasure', value: 189, color: 'hsl(0, 72%, 51%)' },
    { name: 'Portability', value: 123, color: 'hsl(262, 83%, 58%)' },
    { name: 'Other', value: 245, color: 'hsl(38, 92%, 50%)' },
  ],
  summary: {
    fulfilmentRate: 96.2,
    avgResolutionDays: 4.2,
    totalSlaBreaches: 23,
    repeatRequests: 47,
  },
};

export const rightsService = {
  // ─── Core CRUD ────────────────────────────────────────────

  getAll: async (params?: {
    status?: string; type?: string; priority?: string;
    assignedTo?: string; search?: string; tenantId?: string;
    limit?: number; offset?: number;
  }) => {
    if (!FEATURE_FLAGS.rights) return mockRightsRequests;
    const res = await api.get('/api/rights/requests', { params });
    return res.data;
  },

  getById: async (id: string) => {
    if (!FEATURE_FLAGS.rights) {
      return mockRightsRequests.find(r => r.id === id) || null;
    }
    const res = await api.get(`/api/rights/requests/${id}`);
    return res.data;
  },

  create: async (data: any) => {
    if (!FEATURE_FLAGS.rights) return { id: `mock-${Date.now()}`, ...data };
    const res = await api.post('/api/rights/requests', data);
    return res.data;
  },

  update: async (id: string, data: any) => {
    if (!FEATURE_FLAGS.rights) return { id, ...data };
    const res = await api.put(`/api/rights/requests/${id}`, data);
    return res.data;
  },

  // ─── Workflow ─────────────────────────────────────────────

  updateStatus: async (id: string, data: { status: string; notes?: string }) => {
    if (!FEATURE_FLAGS.rights) return { id, ...data };
    const res = await api.put(`/api/rights/requests/${id}/status`, data);
    return res.data;
  },

  assign: async (id: string, data: { assignedTo?: string; assignedTeam?: string }) => {
    if (!FEATURE_FLAGS.rights) return { id, ...data };
    const res = await api.put(`/api/rights/requests/${id}/assign`, data);
    return res.data;
  },

  getWorkflow: async (id: string) => {
    if (!FEATURE_FLAGS.rights) return mockWorkflowSteps;
    const res = await api.get(`/api/rights/requests/${id}/workflow`);
    return res.data;
  },

  // ─── Sub-resources ────────────────────────────────────────

  getNotes: async (id: string) => {
    if (!FEATURE_FLAGS.rights) return mockNotes.filter(n => n.caseId === id || true);
    const res = await api.get(`/api/rights/requests/${id}/notes`);
    return res.data;
  },

  addNote: async (id: string, data: { type: string; content: string }) => {
    if (!FEATURE_FLAGS.rights) {
      return { id: `note-${Date.now()}`, caseId: id, ...data, createdBy: 'Current User', createdAt: new Date().toISOString() };
    }
    const res = await api.post(`/api/rights/requests/${id}/notes`, data);
    return res.data;
  },

  getAttachments: async (id: string) => {
    if (!FEATURE_FLAGS.rights) return [];
    const res = await api.get(`/api/rights/requests/${id}/attachments`);
    return res.data;
  },

  addAttachment: async (id: string, data: any) => {
    if (!FEATURE_FLAGS.rights) return { id: `att-${Date.now()}`, ...data };
    const res = await api.post(`/api/rights/requests/${id}/attachments`, data);
    return res.data;
  },

  getEvidence: async (id?: string) => {
    if (!FEATURE_FLAGS.rights) return mockEvidence;
    const url = id ? `/api/rights/requests/${id}/evidence` : '/api/rights/evidence';
    const res = await api.get(url);
    return res.data;
  },

  addEvidence: async (id: string, data: any) => {
    if (!FEATURE_FLAGS.rights) return { id: `evi-${Date.now()}`, ...data };
    const isFormData = data instanceof FormData;
    const res = await api.post(`/api/rights/requests/${id}/evidence`, data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });
    return res.data;
  },

  verifyEvidence: async (requestId: string, id: string, verified: boolean) => {
    if (!FEATURE_FLAGS.rights) return { id, verified };
    const res = await api.put(`/api/rights/requests/${requestId}/evidence/${id}/verify`, { verified });
    return res.data;
  },

  getAuditTrail: async (id?: string) => {
    if (!FEATURE_FLAGS.rights) return id ? mockAuditLog : mockAuditRecords;
    const url = id ? `/api/rights/requests/${id}/audit` : '/api/rights/audit';
    const res = await api.get(url);
    return res.data;
  },

  // ─── Metrics & Analytics ──────────────────────────────────

  getMetrics: async () => {
    if (!FEATURE_FLAGS.rights) {
      return {
        metrics: mockRightsMetrics,
        breakdown: mockRightsBreakdown,
        breakdownChart: mockRightsBreakdownChart,
      };
    }
    const res = await api.get('/api/rights/metrics');
    return res.data;
  },

  getAnalytics: async () => {
    if (!FEATURE_FLAGS.rights) return mockAnalyticsData;
    const res = await api.get('/api/rights/analytics');
    return res.data;
  },
};
