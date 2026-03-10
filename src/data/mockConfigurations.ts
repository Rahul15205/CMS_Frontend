export interface SLARule {
  id: string;
  name: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  responseTime: number; // minutes
  resolutionTime: number; // minutes
  active: boolean;
}

export interface NotificationRule {
  id: string;
  name: string;
  event: string;
  channels: ("email" | "sms" | "push" | "webhook")[];
  recipients: string[];
  enabled: boolean;
}

export interface EscalationRule {
  id: string;
  name: string;
  trigger: string;
  threshold: number; // hours
  escalateTo: string;
  action: string;
  active: boolean;
}

export interface APIKey {
  id: string;
  name: string;
  key: string;
  created: string;
  expires: string;
  status: "active" | "revoked" | "expired";
  lastUsed: string;
}

export interface LogRetentionConfig {
  id: string;
  logType: string;
  retentionDays: number;
  autoArchive: boolean;
  archiveDestination: string;
}

export interface ExportConfig {
  id: string;
  name: string;
  format: "csv" | "xlsx" | "pdf" | "json";
  frequency: "daily" | "weekly" | "monthly" | "on-demand";
  destination: "email" | "s3" | "ftp";
  lastRun: string;
}

export interface EncryptionConfig {
  algorithm: string;
  keySize: number;
  rotationPeriod: number; // days
  lastRotation: string;
  status: "active" | "rotating";
}

export interface AadhaarConfig {
  enabled: boolean;
  environment: "sandbox" | "production";
  clientSecret: string;
  clientId: string;
  authLevel: 1 | 2;
}

export interface Purpose {
  id: number;
  name: string;
  active: boolean;
  consents: number;
}

export interface WorkflowConfig {
  id: number;
  name: string;
  enabled: boolean;
  steps: number;
}

export interface Language {
  code: string;
  name: string;
  enabled: boolean;
  primary: boolean;
}

export const mockSLARules: SLARule[] = [
  { id: "SLA-001", name: "Critical Rights Request", description: "Rights requests from VIP customers", priority: "critical", responseTime: 60, resolutionTime: 1440, active: true },
  { id: "SLA-002", name: "Standard Rights Request", description: "Default SLA for all users", priority: "medium", responseTime: 480, resolutionTime: 10080, active: true },
  { id: "SLA-003", name: "Standard Grievance", description: "Default SLA for complaints", priority: "medium", responseTime: 1440, resolutionTime: 20160, active: true },
];

export const mockNotificationRules: NotificationRule[] = [
  { id: "NOTIF-001", name: "New Grievance Alert", event: "grievance.created", channels: ["email", "push"], recipients: ["dpo@company.com", "support-lead@company.com"], enabled: true },
  { id: "NOTIF-002", name: "SLA Breach Warning", event: "sla.breach.warning", channels: ["email", "sms"], recipients: ["compliance-manager@company.com"], enabled: true },
];

export const mockEscalationRules: EscalationRule[] = [
  { id: "ESC-001", name: "Level 1 Escalation", trigger: "Resolution delay > 24h", threshold: 24, escalateTo: "team-lead@company.com", action: "Reassign to Senior Analyst", active: true },
  { id: "ESC-002", name: "Critical Escalation", trigger: "Response delay > 2h (Critical)", threshold: 2, escalateTo: "dpo@company.com", action: "Notify Legal Dept", active: true },
];

export const mockAPIKeys: APIKey[] = [
  { id: "KEY-001", name: "Main Frontend App", key: "cms_live_********************", created: "2023-11-01", expires: "2024-11-01", status: "active", lastUsed: "2 hours ago" },
  { id: "KEY-002", name: "Mobile App (iOS)", key: "cms_live_********************", created: "2023-12-15", expires: "2024-12-15", status: "active", lastUsed: "15 mins ago" },
];

export const mockLogRetention: LogRetentionConfig[] = [
  { id: "LOG-001", logType: "Access Logs", retentionDays: 90, autoArchive: true, archiveDestination: "S3-Archive-Bucket" },
  { id: "LOG-002", logType: "Change Logs", retentionDays: 365, autoArchive: true, archiveDestination: "Glacier-Deep-Archive" },
];

export const mockExportConfigs: ExportConfig[] = [
  { id: "EXP-001", name: "Monthly Compliance Report", format: "pdf", frequency: "monthly", destination: "email", lastRun: "2024-02-01" },
  { id: "EXP-002", name: "Weekly Audit Trail", format: "csv", frequency: "weekly", destination: "s3", lastRun: "2024-02-05" },
];

export const mockEncryptionConfig: EncryptionConfig = {
  algorithm: "AES-256-GCM",
  keySize: 256,
  rotationPeriod: 90,
  lastRotation: "2023-12-15",
  status: "active",
};

export const mockAadhaarConfig: AadhaarConfig = {
  enabled: true,
  environment: "sandbox",
  clientSecret: "********************",
  clientId: "CMS_FRONTEND_001",
  authLevel: 2,
};

export const mockPurposes: Purpose[] = [
  { id: 1, name: "Marketing Communications", active: true, consents: 4520 },
  { id: 2, name: "Analytics & Performance", active: true, consents: 3890 },
  { id: 3, name: "Personalization", active: true, consents: 2340 },
  { id: 4, name: "Third-Party Data Sharing", active: true, consents: 1200 },
  { id: 5, name: "Research & Development", active: false, consents: 0 },
];

export const mockWorkflowConfigs: WorkflowConfig[] = [
  { id: 1, name: "Consent Collection", enabled: true, steps: 4 },
  { id: 2, name: "Rights Request Processing", enabled: true, steps: 6 },
  { id: 3, name: "Grievance Handling", enabled: true, steps: 5 },
  { id: 4, name: "Consent Renewal", enabled: false, steps: 3 },
];

export const mockLanguages: Language[] = [
  { code: "en", name: "English", enabled: true, primary: true },
  { code: "hi", name: "Hindi", enabled: true, primary: false },
  { code: "ta", name: "Tamil", enabled: true, primary: false },
  { code: "bn", name: "Bengali", enabled: false, primary: false },
  { code: "te", name: "Telugu", enabled: false, primary: false },
];
