import api from '@/lib/api';
import { ConsentTemplate, TemplateStatus, ConsentVersion, ConsentDeployment, DeploymentLog, ConsentType, ConsentUsageRecord, ApplicationUsage, ConsentAnalyticsData, SystemConfig } from '@/components/consent/types';

// ─── Mappers ──────────────────────────────────────────────────

/**
 * Maps a backend consent template to the frontend format.
 * The backend stores the bulk of the wizard fields in a JSON column called 'wizardFields'.
 */
function mapBackendTemplate(backendTemplate: any): ConsentTemplate {
  const wizardFields = backendTemplate.wizardFields || {};

  // Default structures to ensure nested fields always exist
  const defaultRetention = { period: '', justification: '', autoDelete: false, postWithdrawalRules: '' };
  const defaultSecurity = {
    encryptionAtRest: true, encryptionInTransit: true, accessControls: true,
    monitoringLogging: true, incidentResponse: true, certifications: [], additionalMeasures: []
  };
  const defaultWithdrawal = { method: '', effect: '', rightsLink: '', processingTimeline: '' };

  return {
    // --- Core Backend Fields (top-level columns) ---
    id: backendTemplate.id,
    name: backendTemplate.title || wizardFields.name || '',
    description: backendTemplate.description || wizardFields.description || '',
    status: (backendTemplate.status?.toLowerCase() === 'published' ? 'active' : (backendTemplate.status?.toLowerCase() || 'draft')) as TemplateStatus,
    type: (backendTemplate.type?.toLowerCase() || wizardFields.type || 'explicit') as ConsentType,
    version: backendTemplate.versions?.[0]?.versionNumber 
      ? `${backendTemplate.versions[0].versionNumber}.0` 
      : (wizardFields.version || '1.0'),
    noExpiry: backendTemplate.noExpiry !== undefined ? backendTemplate.noExpiry : (wizardFields.noExpiry ?? true),
    validityStart: wizardFields.validityStart || backendTemplate.validityStart || undefined,
    validityEnd: wizardFields.validityEnd || backendTemplate.validityEnd || undefined,
    validityDuration: wizardFields.validityDuration || backendTemplate.validityDuration || undefined,
    ageThreshold: backendTemplate.ageThreshold !== undefined ? backendTemplate.ageThreshold : (wizardFields.ageThreshold ?? 18),
    consentGivenBy: (backendTemplate.consentGivenBy?.toLowerCase() || wizardFields.consentGivenBy || 'self') as any,
    mechanism: (backendTemplate.mechanism?.toLowerCase() || wizardFields.mechanism || 'checkbox') as any,
    mechanismType: wizardFields.mechanismType || wizardFields.mechanism || backendTemplate.mechanism?.toLowerCase() || 'checkbox',
    doubleOptIn: wizardFields.doubleOptIn ?? false,
    separateConsents: backendTemplate.separateConsents !== undefined ? backendTemplate.separateConsents : (wizardFields.separateConsents ?? true),
    requiresOtpVerification:
      backendTemplate.requiresOtpVerification !== undefined
        ? backendTemplate.requiresOtpVerification
        : (wizardFields.requiresOtpVerification ??
          (backendTemplate.mechanism?.toUpperCase() === 'SIGNATURE' ||
            wizardFields.mechanism === 'signature')),
    requiresAadhaarVerification:
      backendTemplate.requiresAadhaarVerification !== undefined
        ? backendTemplate.requiresAadhaarVerification
        : (wizardFields.requiresAadhaarVerification ??
          wizardFields.verificationMethod === 'aadhaar_ekyc'),
    withdrawVisible: backendTemplate.withdrawVisible !== undefined ? backendTemplate.withdrawVisible : (wizardFields.withdrawVisible ?? true),
    dataSharing: backendTemplate.dataSharing !== undefined ? backendTemplate.dataSharing : (wizardFields.dataSharing ?? false),
    privacyNoticeRef: backendTemplate.privacyNoticeRef || wizardFields.privacyNoticeRef || '',
    auditTrailEnabled: backendTemplate.auditTrailEnabled !== undefined ? backendTemplate.auditTrailEnabled : (wizardFields.auditTrailEnabled ?? true),
    defaultLanguage: backendTemplate.defaultLanguage || wizardFields.defaultLanguage || 'en',
    supportedLanguages: backendTemplate.supportedLanguages || wizardFields.supportedLanguages || ['en'],
    language: wizardFields.language || backendTemplate.defaultLanguage || 'en',
    tags: wizardFields.tags || [],
    customRegulationName: wizardFields.customRegulationName || '',
    purposeTitle: wizardFields.purposeTitle || '',
    purposeDescription: wizardFields.purposeDescription || '',
    lawfulBasis: wizardFields.lawfulBasis || '',
    // --- Enums (normalized to uppercase for consistency) ---
    regulations: (backendTemplate.regulations || wizardFields.regulations || []).map((r: string) => r.toUpperCase() as any),
    targetUserCategory: (backendTemplate.targetUserCategory || wizardFields.targetUserCategory || []).map((c: string) => c.toUpperCase()),
    // --- Nested Complex Objects (from wizardFields, with safe fallbacks) ---
    purposes: wizardFields.purposes || [],
    dataCategories: wizardFields.dataCategories || [],
    thirdParties: wizardFields.thirdParties || [],
    subProcessors: wizardFields.subProcessors || [],
    retention: { ...defaultRetention, ...(wizardFields.retention || {}) },
    security: { ...defaultSecurity, ...(wizardFields.security || {}) },
    withdrawal: { ...defaultWithdrawal, ...(wizardFields.withdrawal || {}) },
    // --- Metadata ---
    createdAt: backendTemplate.createdAt,
    updatedAt: backendTemplate.updatedAt,
    createdBy: backendTemplate.creator?.name || backendTemplate.createdBy || 'System',
    updatedBy: wizardFields.updatedBy || backendTemplate.creator?.name || 'System',
    latestVersionId: backendTemplate.versions?.[0]?.id,
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
    ipAddress: record.ipAddress || undefined,
    templateId: record.templateId,
    templateName: record.template?.title || 'Unknown Template',
    version: record.versionCaptured || record.version || '1.0',
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
    const res = await api.get('/api/v1/consent-templates', { params });
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
    const res = await api.get(`/api/v1/consent-templates/${id}`);
    return mapBackendTemplate(res.data);
  },

  /**
   * Publish a new version of a template (creates a snapshot).
   */
  publishVersion: async (templateId: string, wizardFields: any): Promise<ConsentVersion> => {
    const payload = {
      templateId,
      content: JSON.stringify(wizardFields),
      changeSummary: 'Initial version created during publication',
      effectiveFrom: new Date().toISOString(),
    };

    const res = await api.post('/api/v1/consent-versions', payload);
    return res.data;
  },

  /**
   * Save a template (Create or Update).
   */
  saveTemplate: async (template: Partial<ConsentTemplate>): Promise<ConsentTemplate> => {
    const status = template.status?.toUpperCase();

    // Extract only wizard-specific data for the wizardFields JSON column
    // Exclude backend-managed metadata fields to avoid data pollution
    const {
      id: _id, createdAt: _ca, updatedAt: _ua, createdBy: _cb, updatedBy: _ub,
      latestVersionId: _lvi, version: _version,
      ...wizardData
    } = template as any;

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
      requiresOtpVerification:
        template.requiresOtpVerification ?? template.mechanism === 'signature',
      requiresAadhaarVerification: template.requiresAadhaarVerification ?? false,
      withdrawVisible: template.withdrawVisible,
      dataSharing: template.dataSharing,
      privacyNoticeRef: template.privacyNoticeRef,
      auditTrailEnabled: template.auditTrailEnabled,
      defaultLanguage: template.defaultLanguage,
      supportedLanguages: template.supportedLanguages,
      // Store full wizard data (without metadata) for complex nested fields
      wizardFields: wizardData,
    };

    let result: ConsentTemplate;
    if (template.id && !template.id.startsWith('tpl-')) {
      // Update
      const res = await api.put(`/api/v1/consent-templates/${template.id}`, payload);
      result = mapBackendTemplate(res.data);
    } else {
      // Create
      const res = await api.post('/api/v1/consent-templates', payload);
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
    await api.delete(`/api/v1/consent-templates/${id}`);
  },

  /**
   * Fetch all consent versions with optional template filter.
   */
  getConsentVersions: async (params?: {
    templateId?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: ConsentVersion[]; total: number }> => {
    const res = await api.get('/api/v1/consent-versions', { params });
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
    const res = await api.get('/api/v1/consent-deployments', { params });
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
    const res = await api.get(`/api/v1/consent-deployments/${id}/logs`);
    return res.data; // Logs usually don't need complex mapping
  },

  /**
   * Create a new deployment.
   */
  createDeployment: async (data: any): Promise<ConsentDeployment> => {
    const payload = {
      ...data,
      deploymentMode: data.deploymentMode?.toUpperCase(),
      activationDate: data.activationDate || undefined, // Send undefined if empty string
      platform: Array.isArray(data.platform) ? data.platform.map((p: string) => p.trim()) : data.platform,
    };

    const res = await api.post('/api/v1/consent-deployments', payload);
    return mapBackendDeployment(res.data);
  },

  /**
   * Rollback a deployment.
   */
  rollbackDeployment: async (id: string): Promise<ConsentDeployment> => {
    const res = await api.put(`/api/v1/consent-deployments/${id}/rollback`);
    return mapBackendDeployment(res.data);
  },

  /**
   * Update an existing deployment (status, region, platform, etc.).
   */
  updateDeployment: async (id: string, data: any): Promise<ConsentDeployment> => {
    const payload = {
      ...data,
      deploymentMode: data.deploymentMode?.toUpperCase(),
      activationDate: data.activationDate || undefined,
      platform: Array.isArray(data.platform) ? data.platform.map((p: string) => p.trim()) : data.platform,
      // Map frontend lowercase status to backend uppercase enum
      status: data.status?.toUpperCase().replace('-', '_'),
    };
    const res = await api.put(`/api/v1/consent-deployments/${id}`, payload);
    return mapBackendDeployment(res.data);
  },

  /**
   * Fetch aggregate consent analytics.
   */
  getAnalytics: async (): Promise<ConsentAnalyticsData> => {
    const res = await api.get('/api/v1/consent/analytics');
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
    const apiParams = {
      ...params,
      limit: params?.limit ?? 500,
      status: params?.status
        ? params.status.toUpperCase()
        : undefined,
    };
    const res = await api.get('/api/v1/consent/usage-records', { params: apiParams });
    const payload = res.data;
    const rows = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.data)
        ? payload.data
        : [];

    const total =
      payload?.meta?.total ??
      payload?.total ??
      rows.length;

    return {
      data: rows.map(mapBackendUsageRecord),
      total,
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
    const res = await api.get('/api/v1/consent/cross-app-usage', { params });
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
    const res = await api.get('/api/v1/consent/system-configs', { params: { tenantId } });
    return res.data;
  },

  /**
   * Create a system config.
   */
  createSystemConfig: async (config: SystemConfig): Promise<SystemConfig> => {
    const res = await api.post('/api/v1/consent/system-configs', config);
    return res.data;
  },

  /**
   * Fetch all managed applications.
   */
  getApplications: async (params?: { limit?: number; offset?: number }): Promise<{ data: any[]; total: number }> => {
    const res = await api.get('/api/v1/applications', { params });
    return res.data;
  },
};
