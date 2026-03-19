import api from '@/lib/api';
import { FEATURE_FLAGS } from '@/lib/featureFlags';
import { ConsentTemplate, TemplateStatus, ConsentVersion, ConsentDeployment, DeploymentLog, ConsentType, ConsentUsageRecord, ApplicationUsage, ConsentAnalyticsData, SystemConfig } from '@/components/consent/types';
import { mockTemplates } from '@/components/consent/mockData';

// ─── Mappers ──────────────────────────────────────────────────

/**
 * Maps a backend consent template to the frontend format.
 * The backend stores the bulk of the wizard fields in a JSON column called 'wizardFields'.
 */
function mapBackendTemplate(backendTemplate: any): ConsentTemplate {
  const wizardFields = backendTemplate.wizardFields || {};
  
  return {
    ...wizardFields,
    id: backendTemplate.id,
    name: backendTemplate.title || wizardFields.name || '',
    description: backendTemplate.description || wizardFields.description || '',
    status: (backendTemplate.status?.toLowerCase() === 'published' ? 'active' : (backendTemplate.status?.toLowerCase() || 'draft')) as TemplateStatus,
    type: (backendTemplate.type?.toLowerCase() || wizardFields.type || 'explicit') as ConsentType,
    noExpiry: backendTemplate.noExpiry !== undefined ? backendTemplate.noExpiry : wizardFields.noExpiry,
    ageThreshold: backendTemplate.ageThreshold !== undefined ? backendTemplate.ageThreshold : wizardFields.ageThreshold,
    consentGivenBy: (backendTemplate.consentGivenBy?.toLowerCase() || wizardFields.consentGivenBy || 'self') as any,
    mechanism: (backendTemplate.mechanism?.toLowerCase() || wizardFields.mechanism || 'checkbox') as any,
    separateConsents: backendTemplate.separateConsents !== undefined ? backendTemplate.separateConsents : wizardFields.separateConsents,
    withdrawVisible: backendTemplate.withdrawVisible !== undefined ? backendTemplate.withdrawVisible : wizardFields.withdrawVisible,
    dataSharing: backendTemplate.dataSharing !== undefined ? backendTemplate.dataSharing : wizardFields.dataSharing,
    privacyNoticeRef: backendTemplate.privacyNoticeRef || wizardFields.privacyNoticeRef || '',
    auditTrailEnabled: backendTemplate.auditTrailEnabled !== undefined ? backendTemplate.auditTrailEnabled : wizardFields.auditTrailEnabled,
    defaultLanguage: backendTemplate.defaultLanguage || wizardFields.defaultLanguage || 'en',
    supportedLanguages: backendTemplate.supportedLanguages || wizardFields.supportedLanguages || ['en'],
    createdAt: backendTemplate.createdAt,
    updatedAt: backendTemplate.updatedAt,
    latestVersionId: backendTemplate.versions?.[0]?.id,
    createdBy: backendTemplate.creator?.name || backendTemplate.createdBy || 'System',
    // Ensure arrays exist and are mapped to lowercase
    regulations: (backendTemplate.regulations || wizardFields.regulations || []).map((r: string) => r.toLowerCase() as any),
    targetUserCategory: (backendTemplate.targetUserCategory || wizardFields.targetUserCategory || []).map((c: string) => c.toLowerCase()),
    purposes: wizardFields.purposes || [],
    dataCategories: wizardFields.dataCategories || [],
    thirdParties: wizardFields.thirdParties || [],
    subProcessors: wizardFields.subProcessors || [],
  };
}

/**
 * Maps a backend consent version to the frontend format.
 */
function mapBackendVersion(backendVersion: any): ConsentVersion {
  return {
    id: backendVersion.id,
    templateId: backendVersion.templateId,
    templateName: backendVersion.template?.title || 'Unknown Template',
    version: backendVersion.versionNumber?.toString() || '1.0',
    status: (backendVersion.status?.toLowerCase() || 'active') as any,
    changeSummary: backendVersion.changeSummary || '',
    changedFields: backendVersion.changedFields || [],
    changeReason: backendVersion.changeReason || '',
    approvedBy: backendVersion.publishedBy || 'System',
    approvalTimestamp: backendVersion.publishedAt || backendVersion.createdAt,
    effectiveFrom: backendVersion.effectiveFrom || backendVersion.createdAt,
    effectiveTo: backendVersion.effectiveTo || null,
    usersImpacted: backendVersion.usersImpacted || 0,
    reconsentTriggered: backendVersion.reconsentTriggered || false,
    createdAt: backendVersion.createdAt,
    createdBy: backendVersion.publishedBy || 'System',
  };
}

/**
 * Maps a backend consent deployment to the frontend format.
 */
function mapBackendDeployment(backendDeployment: any): ConsentDeployment {
  return {
    id: backendDeployment.id,
    templateId: backendDeployment.version?.templateId || '',
    templateName: backendDeployment.version?.template?.title || 'Unknown Template',
    versionId: backendDeployment.versionId,
    versionNumber: backendDeployment.version?.versionNumber?.toString() || '1.0',
    applicationId: backendDeployment.applicationId,
    applicationName: backendDeployment.application?.name || 'Main App',
    deploymentMode: (backendDeployment.deploymentMode?.toLowerCase() || 'manual') as any,
    status: (backendDeployment.status?.toLowerCase() || 'deployed') as any,
    isActive: backendDeployment.isActive,
    activationDate: backendDeployment.activationDate || backendDeployment.deployedAt,
    region: backendDeployment.region || 'Global',
    platform: Array.isArray(backendDeployment.platform) 
      ? backendDeployment.platform 
      : (backendDeployment.platform ? [backendDeployment.platform] : ['Web']),
    userSegment: backendDeployment.userSegment || 'All Users',
    deployedBy: backendDeployment.deployedBy || 'System',
    deployedAt: backendDeployment.deployedAt,
    affectedUsers: backendDeployment.affectedUsers || 0,
    approvalRequired: backendDeployment.approvalRequired || false,
    approvedBy: backendDeployment.approvedBy || null,
    rollbackAllowed: backendDeployment.rollbackAllowed || false,
    lockAfterActivation: backendDeployment.lockAfterActivation || false,
  };
}

/**
 * Maps a backend usage record to the frontend format.
 */
function mapBackendUsageRecord(record: any): ConsentUsageRecord {
  return {
    id: record.id,
    userIdentifier: record.userIdentifier,
    templateId: record.templateId,
    templateName: record.template?.title || 'Unknown Template',
    version: record.versionCaptured || '1.0',
    purposeMapped: record.purposeMapped || 'General',
    systemApp: record.systemApp || 'Main App',
    consentDateTime: record.consentDateTime,
    consentStatus: (record.consentStatus?.toLowerCase() || 'active') as any,
    lastValidation: record.lastValidation || record.consentDateTime,
  };
}

/**
 * Maps a backend application usage record to the frontend format.
 */
function mapBackendAppUsage(usage: any): ApplicationUsage {
  return {
    id: usage.id,
    templateId: usage.templateId,
    templateName: usage.template?.title || 'Unknown Template',
    templateVersion: usage.templateVersion || 'v1.0',
    applicationName: usage.applicationName || 'Unknown App',
    applicationType: usage.applicationType || 'Internal',
    systemOwner: usage.systemOwner || 'Admin',
    purposeUsed: usage.purposeUsed || 'General',
    lastValidation: usage.lastValidation,
    status: (usage.status?.toLowerCase() || 'active') as any,
    usersConsented: usage.usersConsented || 0,
    violations: usage.violations || 0,
  };
}

// ─── Service ──────────────────────────────────────────────────

export const consentService = {
  /**
   * Fetch all consent templates with optional filters.
   */
  getTemplates: async (params?: {
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
    tenantId?: string;
  }): Promise<{ data: ConsentTemplate[]; total: number }> => {
    if (!FEATURE_FLAGS.consent) {
      // Mock mode
      const filtered = mockTemplates.filter(t => {
        if (params?.status && t.status !== params.status) return false;
        if (params?.search && !t.name.toLowerCase().includes(params.search.toLowerCase())) return false;
        return true;
      });
      return { 
        data: filtered.slice(params?.offset || 0, (params?.offset || 0) + (params?.limit || 10)),
        total: filtered.length
      };
    }

    // Real API call
    const res = await api.get('/api/consent-templates', { params });
    const { data, total } = res.data;
    
    return {
      data: data.map(mapBackendTemplate),
      total
    };
  },

  /**
   * Get a single template by ID.
   */
  getTemplateById: async (id: string): Promise<ConsentTemplate> => {
    if (!FEATURE_FLAGS.consent) {
      const template = mockTemplates.find(t => t.id === id);
      if (!template) throw new Error('Template not found');
      return template;
    }

    const res = await api.get(`/api/consent-templates/${id}`);
    return mapBackendTemplate(res.data);
  },

  /**
   * Publish a new version of a template (creates a snapshot).
   */
  publishVersion: async (templateId: string, wizardFields: any): Promise<ConsentVersion> => {
    if (!FEATURE_FLAGS.consent) {
      return { id: 'mock-v-' + Date.now() } as any;
    }

    const payload = {
      templateId,
      content: JSON.stringify(wizardFields),
      changeSummary: 'Initial version created during publication',
      effectiveFrom: new Date().toISOString(),
    };

    const res = await api.post('/api/consent-versions', payload);
    return res.data;
  },

  /**
   * Save a template (Create or Update).
   */
  saveTemplate: async (template: Partial<ConsentTemplate>): Promise<ConsentTemplate> => {
    if (!FEATURE_FLAGS.consent) {
      return template as ConsentTemplate;
    }

    const status = template.status?.toUpperCase();
    
    // Map enums to UPPERCASE for backend columns
    const payload = {
      title: template.name,
      description: template.description,
      status: status === 'ACTIVE' ? 'PUBLISHED' : status,
      type: template.type?.toUpperCase(),
      regulations: template.regulations?.map(r => r.toUpperCase()),
      noExpiry: template.noExpiry,
      targetUserCategory: template.targetUserCategory?.map(c => c.toUpperCase()),
      ageThreshold: template.ageThreshold,
      consentGivenBy: template.consentGivenBy?.toUpperCase(),
      mechanism: template.mechanism?.toUpperCase(),
      separateConsents: template.separateConsents,
      withdrawVisible: template.withdrawVisible,
      dataSharing: template.dataSharing,
      privacyNoticeRef: template.privacyNoticeRef,
      auditTrailEnabled: template.auditTrailEnabled,
      defaultLanguage: template.defaultLanguage,
      supportedLanguages: template.supportedLanguages,
      wizardFields: template, // Keep everything in wizardFields for backward compatibility
    };

    let result: ConsentTemplate;
    if (template.id && !template.id.startsWith('tpl-')) {
      // Update
      const res = await api.put(`/api/consent-templates/${template.id}`, payload);
      result = mapBackendTemplate(res.data);
    } else {
      // Create
      const res = await api.post('/api/consent-templates', payload);
      result = mapBackendTemplate(res.data);
    }

    // AUTO-PUBLISH: If the user hit "Publish" (status active), also create a version snapshot
    if (status === 'ACTIVE' && result.id) {
       try {
         await consentService.publishVersion(result.id, template);
         // Refetch to get the latestVersionId populated
         const refetched = await consentService.getTemplates({ limit: 1 });
         const updated = refetched.data.find(t => t.id === result.id);
         if (updated) result = updated;
       } catch (err) {
         console.error("Failed to auto-publish version:", err);
       }
    }

    return result;
  },

  /**
   * Delete/Archive a template.
   */
  deleteTemplate: async (id: string): Promise<void> => {
    if (!FEATURE_FLAGS.consent) return;
    await api.delete(`/api/consent-templates/${id}`);
  },

  /**
   * Fetch all consent versions with optional template filter.
   */
  getConsentVersions: async (params?: {
    templateId?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: ConsentVersion[]; total: number }> => {
    if (!FEATURE_FLAGS.consent) {
      // Mock mode fallback logic (simplified)
      return { data: [], total: 0 };
    }

    const res = await api.get('/api/consent-versions', { params });
    const { data, total } = res.data;

    return {
      data: data.map(mapBackendVersion),
      total
    };
  },

  /**
   * Fetch all consent deployments.
   */
  getDeployments: async (params?: {
    applicationId?: string;
    versionId?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: ConsentDeployment[]; total: number }> => {
    if (!FEATURE_FLAGS.consent) {
      return { data: [], total: 0 };
    }

    const res = await api.get('/api/consent-deployments', { params });
    const { data, total } = res.data;

    return {
      data: data.map(mapBackendDeployment),
      total
    };
  },

  /**
   * Fetch deployment logs for a specific deployment.
   */
  getDeploymentLogs: async (id: string): Promise<DeploymentLog[]> => {
    if (!FEATURE_FLAGS.consent) {
      return [];
    }

    const res = await api.get(`/api/consent-deployments/${id}/logs`);
    return res.data; // Logs usually don't need complex mapping
  },

  /**
   * Create a new deployment.
   */
  createDeployment: async (data: any): Promise<ConsentDeployment> => {
    if (!FEATURE_FLAGS.consent) {
      return data as ConsentDeployment;
    }

    const payload = {
      ...data,
      deploymentMode: data.deploymentMode?.toUpperCase(),
      activationDate: data.activationDate || undefined, // Send undefined if empty string
      platform: Array.isArray(data.platform) ? data.platform.map((p: string) => p.trim()) : data.platform,
    };

    const res = await api.post('/api/consent-deployments', payload);
    return mapBackendDeployment(res.data);
  },

  /**
   * Rollback a deployment.
   */
  rollbackDeployment: async (id: string): Promise<ConsentDeployment> => {
    if (!FEATURE_FLAGS.consent) {
      throw new Error('Rollback not supported in mock mode');
    }

    const res = await api.put(`/api/consent-deployments/${id}/rollback`);
    return mapBackendDeployment(res.data);
  },

  /**
   * Fetch aggregate consent analytics.
   */
  getAnalytics: async (): Promise<ConsentAnalyticsData> => {
    if (!FEATURE_FLAGS.consent) {
      // Mock data matching the structure
      return {
        templates: { total: 0, byStatus: {}, byType: {} },
        records: { total: 0, byStatus: {} },
        deployments: { total: 0, byStatus: {} },
        crossAppUsage: { byApplicationType: {} },
        reconsentData: [],
        fatigueIndicators: []
      };
    }

    const res = await api.get('/api/consent/analytics');
    return res.data;
  },

  /**
   * Fetch consent usage records.
   */
  getUsageRecords: async (params?: {
    templateId?: string;
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: ConsentUsageRecord[]; total: number }> => {
    if (!FEATURE_FLAGS.consent) {
      return { data: [], total: 0 };
    }

    const res = await api.get('/api/consent/usage-records', { params });
    const { data, total } = res.data;

    return {
      data: data.map(mapBackendUsageRecord),
      total
    };
  },

  /**
   * Fetch cross-application consent usage.
   */
  getCrossAppUsage: async (params?: {
    templateId?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: ApplicationUsage[]; total: number }> => {
    if (!FEATURE_FLAGS.consent) {
      return { data: [], total: 0 };
    }

    const res = await api.get('/api/consent/cross-app-usage', { params });
    const { data, total } = res.data;

    return {
      data: data.map(mapBackendAppUsage),
      total
    };
  },

  /**
   * Fetch system configs.
   */
  getSystemConfigs: async (tenantId?: string): Promise<SystemConfig[]> => {
    if (!FEATURE_FLAGS.consent) {
      return [];
    }

    const res = await api.get('/api/consent/system-configs', { params: { tenantId } });
    return res.data;
  },

  /**
   * Create a system config.
   */
  createSystemConfig: async (config: SystemConfig): Promise<SystemConfig> => {
    if (!FEATURE_FLAGS.consent) {
      return config;
    }

    const res = await api.post('/api/consent/system-configs', config);
    return res.data;
  },

  /**
   * Fetch all managed applications.
   */
  getApplications: async (params?: { limit?: number; offset?: number }): Promise<{ data: any[]; total: number }> => {
    if (!FEATURE_FLAGS.consent) {
      return { data: [{ id: 'app-default', name: 'Mock Application' }], total: 1 };
    }

    const res = await api.get('/api/applications', { params });
    return res.data;
  },
};
