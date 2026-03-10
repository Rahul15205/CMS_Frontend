/**
 * Configurations Service
 *
 * Covers all 10 config sections: SLA, Notification, Escalation, API Keys,
 * Encryption, Log Retention, Export, Aadhaar, Purposes, Workflows.
 */

import api from '@/lib/api';
import { FEATURE_FLAGS } from '@/lib/featureFlags';
import * as mockData from '@/data/mockConfigurations';

// Generic CRUD factory for config endpoints
function createConfigService(basePath: string, mockCollection?: any[]) {
  return {
    getAll: async (params?: any) => {
      if (!FEATURE_FLAGS.configurations) {
        return mockCollection || [];
      }
      const res = await api.get(basePath, { params });
      return res.data;
    },
    getById: async (id: string) => {
      if (!FEATURE_FLAGS.configurations) {
        return mockCollection?.find((item: any) => item.id === id) || null;
      }
      const res = await api.get(`${basePath}/${id}`);
      return res.data;
    },
    create: async (data: any) => {
      if (!FEATURE_FLAGS.configurations) {
        const newItem = {
          ...data,
          id: `NEW-${Math.floor(Math.random() * 1000)}`,
        };
        return newItem;
      }
      const res = await api.post(basePath, data);
      return res.data;
    },
    update: async (id: string, data: any) => {
      if (!FEATURE_FLAGS.configurations) {
        return { ...data, id };
      }
      const res = await api.put(`${basePath}/${id}`, data);
      return res.data;
    },
    delete: async (id: string) => {
      if (!FEATURE_FLAGS.configurations) {
        return { success: true, id };
      }
      const res = await api.delete(`${basePath}/${id}`);
      return res.data;
    },
  };
}

// Singleton config services (GET/PUT only)
function createSingletonConfigService(basePath: string, mockItem?: any) {
  return {
    get: async (tenantId?: string) => {
      if (!FEATURE_FLAGS.configurations) {
        return mockItem || null;
      }
      const res = await api.get(basePath, { params: { tenantId } });
      return res.data;
    },
    update: async (data: any) => {
      if (!FEATURE_FLAGS.configurations) {
        return data;
      }
      const res = await api.put(basePath, data);
      return res.data;
    },
  };
}

export const slaRulesService = createConfigService('/api/config/sla-rules', mockData.mockSLARules);
export const notificationRulesService = createConfigService('/api/config/notification-rules', mockData.mockNotificationRules);
export const escalationRulesService = createConfigService('/api/config/escalation-rules', mockData.mockEscalationRules);
export const apiKeysService = createConfigService('/api/config/api-keys', mockData.mockAPIKeys);
export const logRetentionService = createConfigService('/api/config/log-retention', mockData.mockLogRetention);
export const exportConfigsService = createConfigService('/api/config/export', mockData.mockExportConfigs);
export const workflowConfigsService = createConfigService('/api/config/workflows', mockData.mockWorkflowConfigs);
export const purposesService = createConfigService('/api/purposes', mockData.mockPurposes);
export const languagesService = createConfigService('/api/languages', mockData.mockLanguages);

// Singleton configs (single record, not list-based)
export const encryptionConfigService = createSingletonConfigService('/api/config/encryption', mockData.mockEncryptionConfig);
export const aadhaarConfigService = createSingletonConfigService('/api/config/aadhaar', mockData.mockAadhaarConfig);
