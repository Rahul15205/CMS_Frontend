export type UserStatus = 'active' | 'disabled' | 'locked' | 'pending' | 'suspended';
export type AccountType = 'internal' | 'external';
export type InviteStatus = 'pending' | 'accepted' | 'expired' | 'failed';
export type WorkflowRole = 'reviewer' | 'approver' | 'escalation' | 'backup';
export type DataAccessScope = 'consent' | 'rights' | 'grievances' | 'reports' | 'cookies' | 'notices' | 'all';

export interface ApplicationAccess {
  id: string;
  name: string;
  type: 'salesforce' | 'hrms' | 'crm' | 'erp' | 'website' | 'mobile' | 'api' | 'internal';
  enabled: boolean;
}

export interface WorkflowParticipation {
  rightsWorkflow: boolean;
  grievanceWorkflow: boolean;
  role?: WorkflowRole;
  isEscalationContact: boolean;
  isBackupApprover: boolean;
}

export interface APIAccessConfig {
  enabled: boolean;
  tokenId?: string;
  scopes: string[];
  expiresAt?: string;
  lastUsed?: string;
  rateLimit?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  roles: string[];
  status: UserStatus;
  accountType: AccountType;
  department?: string;
  mfaEnabled: boolean;
  lastLogin: string | null;
  createdAt: string;
  validFrom?: string;
  validUntil?: string;
  ipRestrictions?: string[];
  timeRestrictions?: {
    enabled: boolean;
    startHour: number;
    endHour: number;
    timezone: string;
  };
  // Enterprise fields
  tenantId?: string;
  tenantName?: string;
  applications?: ApplicationAccess[];
  workflowParticipation?: WorkflowParticipation;
  apiAccess?: APIAccessConfig;
  dataAccessScope?: DataAccessScope[];
  lastConsentAction?: string;
  geoRestrictions?: string[];
  deviceRestrictions?: {
    enabled: boolean;
    registeredDevices: string[];
  };
  riskScore?: number;
  isDormant?: boolean;
  isHighRisk?: boolean;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  isSystemRole: boolean;
  status: 'active' | 'archived';
  usersCount: number;
  permissions: ModulePermissions;
  createdAt: string;
  expiresAt?: string;
  // Enterprise fields
  tenantId?: string;
  tenantScoped?: boolean;
  applicationScoped?: boolean;
  applicationIds?: string[];
  workflowPermissions?: WorkflowPermissions;
  integrationPermissions?: IntegrationPermissions;
  isTemporary?: boolean;
  clonedFrom?: string;
}

export interface WorkflowPermissions {
  rightsWorkflow: {
    canView: boolean;
    canProcess: boolean;
    canApprove: boolean;
    canEscalate: boolean;
  };
  grievanceWorkflow: {
    canView: boolean;
    canProcess: boolean;
    canApprove: boolean;
    canEscalate: boolean;
  };
}

export interface IntegrationPermissions {
  canConfigureIntegrations: boolean;
  canManageCookies: boolean;
  canPublishNotices: boolean;
  canManageBranding: boolean;
  canAccessAPI: boolean;
}

export interface ModulePermissions {
  [module: string]: {
    view: boolean;
    create: boolean;
    edit: boolean;
    approve: boolean;
    export: boolean;
    configure: boolean;
    admin: boolean;
  };
}

export interface Invitation {
  id: string;
  email: string;
  role: string;
  status: InviteStatus;
  invitedBy: string;
  invitedAt: string;
  expiresAt: string;
  acceptedAt?: string;
  // Enterprise fields
  tenantId?: string;
  tenantName?: string;
  applications?: string[];
  customBranding?: boolean;
  reminderSent?: boolean;
  reminderCount?: number;
}

export interface Session {
  id: string;
  userId: string;
  userName: string;
  device: string;
  browser: string;
  ipAddress: string;
  location: string;
  loginTime: string;
  lastActivity: string;
  isCurrentSession: boolean;
  // Enterprise fields
  tenantId?: string;
  applicationName?: string;
  sessionType?: 'web' | 'mobile' | 'api';
  riskLevel?: 'low' | 'medium' | 'high';
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  category: 'profile' | 'role' | 'status' | 'session' | 'security' | 'tenant' | 'workflow' | 'api' | 'branding' | 'application';
  details: string;
  ipAddress: string;
  timestamp: string;
  // Enterprise fields
  tenantId?: string;
  tenantName?: string;
  applicationId?: string;
  applicationName?: string;
  severity?: 'info' | 'warning' | 'critical';
}

export interface AccessRule {
  id: string;
  name: string;
  type: 'ip' | 'geo' | 'time' | 'device' | 'custom' | 'risk';
  status: 'active' | 'inactive';
  description: string;
  conditions: Record<string, unknown>;
  // Enterprise fields
  tenantId?: string;
  priority?: number;
  affectedUsers?: number;
}

export interface EnterpriseUserFilters {
  tenantId?: string;
  applicationId?: string;
  workflowRole?: WorkflowRole;
  apiAccessEnabled?: boolean;
  riskLevel?: 'low' | 'medium' | 'high';
  isDormant?: boolean;
}
