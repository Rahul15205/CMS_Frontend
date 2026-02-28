// Configuration Module Types

export type LifecycleStatus = 'draft' | 'validated' | 'active' | 'monitoring' | 'modified' | 'disabled' | 'archived';

export type NotificationChannel = 'email' | 'sms' | 'in-app' | 'webhook';
export type RecipientType = 'user' | 'role' | 'admin' | 'external';
export type Frequency = 'immediate' | 'batched' | 'scheduled';

export interface NotificationRule {
  id: string;
  name: string;
  triggerEvent: string;
  channel: NotificationChannel;
  recipientType: RecipientType;
  template: string;
  language: string;
  frequency: Frequency;
  retryEnabled: boolean;
  maxRetries: number;
  status: LifecycleStatus;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export type Regulation = 'GDPR' | 'DPDP' | 'CCPA' | 'LGPD' | 'PDPL' | 'PIPL' | 'Custom';
export type RightType = 'access' | 'erasure' | 'rectification' | 'restriction' | 'portability' | 'objection' | 'withdraw-consent' | 'opt-out';
export type DayType = 'working' | 'calendar';

export interface SLARule {
  id: string;
  name: string;
  regulation: Regulation;
  rightType?: RightType;
  category?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  duration: number;
  durationUnit: 'hours' | 'days';
  dayType: DayType;
  pauseConditions: string[];
  autoCloseEnabled: boolean;
  breachActions: string[];
  status: LifecycleStatus;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export type EscalationTrigger = 'sla-breach' | 'manual-flag' | 'risk-score' | 'priority-change';
export type EscalationAction = 'notify' | 'reassign' | 'lock-case' | 'escalate-external';

export interface EscalationRule {
  id: string;
  name: string;
  triggerCondition: EscalationTrigger;
  triggerThreshold?: number;
  escalationLevel: 'L1' | 'L2' | 'L3';
  recipientRole: string;
  recipientUser?: string;
  action: EscalationAction;
  maxLevels: number;
  autoCloseOnResolution: boolean;
  status: LifecycleStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface APIKey {
  id: string;
  name: string;
  keyPrefix: string;
  tenant: string;
  application: string;
  scopes: string[];
  rateLimit: number;
  rateLimitPeriod: 'minute' | 'hour' | 'day';
  expiryDate?: Date;
  ipRestrictions: string[];
  status: 'active' | 'revoked' | 'expired' | 'rotating';
  lastUsed?: Date;
  usageCount: number;
  createdAt: Date;
  createdBy: string;
}

export type KeyManagementType = 'system-managed' | 'customer-managed';

export interface EncryptionConfig {
  id: string;
  encryptionAtRest: boolean;
  encryptionInTransit: boolean;
  keyManagementType: KeyManagementType;
  keyRotationFrequency: number;
  keyRotationUnit: 'days' | 'months';
  algorithm: string;
  lastRotated?: Date;
  nextRotation?: Date;
  complianceStatus: 'compliant' | 'warning' | 'non-compliant';
}

export type LogType = 'audit' | 'consent' | 'rights' | 'grievance' | 'security' | 'system';

export interface LogRetentionRule {
  id: string;
  logType: LogType;
  retentionPeriod: number;
  retentionUnit: 'days' | 'months' | 'years';
  regulation?: Regulation;
  autoArchive: boolean;
  autoDelete: boolean;
  legalHoldOverride: boolean;
  maskingEnabled: boolean;
  maskingFields: string[];
  status: LifecycleStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type ExportFormat = 'pdf' | 'csv' | 'json' | 'xlsx';
export type ScheduleFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'on-demand';

export interface ExportConfig {
  id: string;
  name: string;
  reportType: string;
  format: ExportFormat;
  scheduleFrequency: ScheduleFrequency;
  scheduledTime?: string;
  recipients: string[];
  dataMaskingEnabled: boolean;
  brandingEnabled: boolean;
  status: LifecycleStatus;
  lastExecuted?: Date;
  nextExecution?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type VerificationMode = 'otp' | 'offline-xml' | 'masked-only';
export type UsageScope = 'rights-verification' | 'grievance-verification' | 'consent-verification';

export interface AadhaarConfig {
  id: string;
  enabled: boolean;
  tenantId: string;
  environment: 'sandbox' | 'production';
  verificationMode: VerificationMode;
  usageScopes: UsageScope[];
  consentRequired: boolean;
  consentText: string;
  consentRetentionDays: number;
  noStorageEnforced: boolean;
  maskedDisplayOnly: boolean;
  tokenizedReference: boolean;
  encryptionEnabled: boolean;
  autoPurgeEnabled: boolean;
  autoPurgeDays: number;
  serviceProviderName: string;
  rateLimit: number;
  timeoutSeconds: number;
  status: LifecycleStatus;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface AuditEntry {
  id: string;
  configType: string;
  configId: string;
  action: 'created' | 'updated' | 'activated' | 'disabled' | 'archived' | 'deleted';
  performedBy: string;
  timestamp: Date;
  previousValue?: string;
  newValue?: string;
  ipAddress?: string;
}
