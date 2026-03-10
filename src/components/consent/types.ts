// Consent Module Types - Enterprise CMS

export type ConsentType = "explicit" | "implicit" | "optional" | "mandatory" | "granular" | "parental";

export type Regulation = "DPDP" | "GDPR" | "TAPA" | "PDPL" | "Custom";

export type TemplateStatus = "draft" | "active" | "archived" | "deprecated";

export type DataCategory =
  | "identity"
  | "contact"
  | "financial"
  | "health"
  | "biometric"
  | "behavioral"
  | "location"
  | "location"
  | "custom"
  | (string & {});

export type ConsentMechanism =
  | "checkbox"
  | "toggle"
  | "signature"
  | "click-to-confirm"
  | "audio-video";

export type UserCategory =
  | "customer"
  | "employee"
  | "vendor"
  | "minor"
  | "guardian"
  | (string & {});

export type ThirdPartyRole =
  | "data-processor"
  | "joint-controller"
  | "sub-processor";

export interface Purpose {
  id: string;
  name: string;
  description: string;
  isPrimary: boolean;
  necessity: "essential" | "non-essential";
  automatedProcessing: boolean;
  profilingUsage: boolean;
}

export interface DataCategoryConfig {
  category: DataCategory;
  label: string;
  mandatory: boolean;
  source: "direct" | "third-party";
  description?: string;
  country?: string;
}

export interface ThirdParty {
  id: string;
  name: string;
  role: ThirdPartyRole;
  purpose: string;
  country: string;
  crossBorderTransfer: boolean;
}

export interface SubProcessor {
  id: string;
  name: string;
  purpose: string;
  country: string;
  changeNotification: boolean;
}

export interface DataRetention {
  period: string;
  justification: string;
  autoDelete: boolean;
  postWithdrawalRules: string;
  expireConsentOnRetentionEnd?: boolean;
}

export interface CustomSecurityMeasure {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

export interface SecurityMeasures {
  encryptionAtRest: boolean;
  encryptionInTransit: boolean;
  accessControls: boolean;
  monitoringLogging: boolean;
  incidentResponse: boolean;
  certifications: string[];
  additionalMeasures: CustomSecurityMeasure[];
}

export interface WithdrawalInfo {
  method: string;
  effect: string;
  rightsLink: string;
  processingTimeline: string;
}

export interface ConsentTemplate {
  id: string;
  name: string;
  description: string;
  type: ConsentType;
  // Wizard temporary fields - mapped to purposes[] in real implementation
  purposeTitle?: string;
  purposeDescription?: string;
  lawfulBasis?: string;

  regulations: Regulation[];
  purposes: Purpose[];
  status: TemplateStatus;
  version: string;
  language?: string; // Wizard compatibility
  tags?: string[]; // Wizard compatibility
  validityStart?: string;
  validityEnd?: string;
  validityDuration?: string;
  noExpiry: boolean;

  // Data Principal
  targetUserCategory: UserCategory[];
  ageThreshold: number;
  consentGivenBy: "self" | "guardian" | "representative";

  // Data Categories
  dataCategories: DataCategoryConfig[];

  // Consent Mechanism
  mechanism: ConsentMechanism;
  mechanismType?: string; // Wizard compatibility (can be same as mechanism)
  doubleOptIn?: boolean; // Wizard compatibility
  separateConsents: boolean;
  withdrawVisible: boolean;

  // Data Sharing
  dataSharing: boolean;
  thirdParties: ThirdParty[];
  subProcessors: SubProcessor[];

  // Retention
  retention: DataRetention;

  // Security
  security: SecurityMeasures;

  // Withdrawal
  withdrawal: WithdrawalInfo;

  // Notice
  privacyNoticeRef: string;
  auditTrailEnabled: boolean;

  // Localization
  defaultLanguage: string;
  supportedLanguages: string[];

  // Metadata
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
}

export interface ConsentVersion {
  id: string;
  templateId: string;
  templateName?: string; // Optinal name of the parent template
  version: string;
  status: "active" | "archived" | "locked" | "published";
  changeSummary: string;
  changedFields: string[];
  changeReason: string;
  approvedBy: string;
  approvalTimestamp: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  usersImpacted: number;
  reconsentTriggered: boolean;
  createdAt: string;
  createdBy: string;
}

export interface ConsentDeployment {
  id: string;
  templateId: string;
  templateName?: string;
  versionId: string;
  versionNumber?: string;
  applicationId: string;
  applicationName?: string;
  deploymentMode: "manual" | "scheduled";
  status: "deployed" | "pending" | "failed" | "rolled-back";
  isActive: boolean;
  activationDate: string;
  region: string;
  platform: string;
  userSegment: string;
  deployedBy: string;
  deployedAt: string;
  affectedUsers: number;
  approvalRequired: boolean;
  approvedBy: string | null;
  rollbackAllowed: boolean;
  lockAfterActivation: boolean;
}

export interface DeploymentLog {
  id: string;
  deploymentId: string;
  action: string;
  timestamp: string;
  performedBy: string;
  details: string;
  status: "success" | "failure";
}

export interface ConsentUsageRecord {
  id: string;
  userIdentifier: string;
  templateId: string;
  templateName?: string;
  version: string;
  purposeMapped: string;
  systemApp: string;
  consentDateTime: string;
  consentStatus: "active" | "withdrawn" | "expired";
  lastValidation: string;
}

export interface ApplicationUsage {
  id: string;
  templateId?: string;
  templateName: string;
  templateVersion: string;
  applicationName: string;
  applicationType: string;
  systemOwner: string;
  purposeUsed: string;
  lastValidation: string;
  status: "active" | "inactive" | "expired" | "pending";
  usersConsented: number;
  violations: number;
}

export interface ConsentAnalyticsData {
  templates: {
    total: number;
    byStatus: Record<string, number>;
    byType: Record<string, number>;
  };
  records: {
    total: number;
    byStatus: Record<string, number>;
  };
  deployments: {
    total: number;
    byStatus: Record<string, number>;
  };
  crossAppUsage: {
    byApplicationType: Record<string, number>;
  };
}

export interface SystemConfig {
  id?: string;
  name: string;
  type: string;
  integrationMode: string;
  authMethod: string;
  endpoint: string;
  description?: string;
  tenantId?: string;
  createdAt?: string;
}

// Wizard step configuration
export const WIZARD_STEPS = [
  { id: 1, title: "Basic Information", description: "Template name, type & regulations" },
  { id: 2, title: "Data Principal", description: "Target users & age handling" },
  { id: 3, title: "Purpose Specification", description: "Define processing purposes" },
  { id: 4, title: "Data Attributes", description: "Types of data collected" },
  { id: 5, title: "Consent Mechanism", description: "How consent is captured" },
  { id: 6, title: "Data Sharing", description: "Third-party sharing details" },
  { id: 7, title: "Sub-Processors", description: "Processing chain details" },
  { id: 8, title: "Data Retention", description: "Storage duration & rules" },
  { id: 9, title: "Security Measures", description: "Protection mechanisms" },
  { id: 10, title: "Rights & Withdrawal", description: "User rights information" },
  { id: 11, title: "Notice & Audit", description: "Compliance documentation" },
  { id: 12, title: "Localization", description: "Language & regional settings" },
] as const;

export const REGULATION_INFO: Record<Regulation, { label: string; color: string; description: string }> = {
  DPDP: {
    label: "DPDP Act",
    color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    description: "India Digital Personal Data Protection Act, 2023"
  },
  GDPR: {
    label: "GDPR",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    description: "EU General Data Protection Regulation"
  },
  TAPA: {
    label: "TAPA",
    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    description: "The Australian Privacy Act"
  },
  PDPL: {
    label: "PDPL",
    color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
    description: "Middle East Personal Data Protection Law"
  },
  Custom: {
    label: "Custom",
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    description: "Organization-specific requirements"
  },
};

export const CONSENT_TYPE_INFO: Record<ConsentType, { label: string; description: string; icon: string; color: string }> = {
  explicit: {
    label: "Explicit",
    description: "Requires affirmative action from user",
    icon: "CheckSquare",
    color: "border-emerald-500 bg-emerald-50 text-emerald-900 dark:border-emerald-500/50 dark:bg-emerald-500/10 dark:text-emerald-200"
  },
  implicit: {
    label: "Implicit",
    description: "Implied through user behavior",
    icon: "Eye",
    color: "border-purple-500 bg-purple-50 text-purple-900 dark:border-purple-500/50 dark:bg-purple-500/10 dark:text-purple-200"
  },
  optional: {
    label: "Optional",
    description: "User can choose to opt-in or out",
    icon: "ToggleLeft",
    color: "border-sky-500 bg-sky-50 text-sky-900 dark:border-sky-500/50 dark:bg-sky-500/10 dark:text-sky-200"
  },
  mandatory: {
    label: "Mandatory",
    description: "Required for service delivery",
    icon: "Lock",
    color: "border-amber-500 bg-amber-50 text-amber-900 dark:border-amber-500/50 dark:bg-amber-500/10 dark:text-amber-200"
  },
  granular: {
    label: "Granular",
    description: "Multiple separate consent checkboxes",
    icon: "ListChecks",
    color: "border-indigo-500 bg-indigo-50 text-indigo-900 dark:border-indigo-500/50 dark:bg-indigo-500/10 dark:text-indigo-200"
  },
  parental: {
    label: "Parental",
    description: "Consent provided by parent/guardian",
    icon: "Users",
    color: "border-pink-500 bg-pink-50 text-pink-900 dark:border-pink-500/50 dark:bg-pink-500/10 dark:text-pink-200"
  },
};

export const DATA_CATEGORY_OPTIONS: { value: DataCategory; label: string }[] = [
  { value: "identity", label: "Identity Data" },
  { value: "contact", label: "Contact Data" },
  { value: "financial", label: "Financial Data" },
  { value: "health", label: "Health Data" },
  { value: "biometric", label: "Biometric Data" },
  { value: "behavioral", label: "Behavioral Data" },
  { value: "location", label: "Location Data" },
  { value: "custom", label: "Custom Categories" },
];

export const DEFAULT_TEMPLATE: Partial<ConsentTemplate> = {
  name: "",
  description: "",
  type: "explicit",
  regulations: [],
  purposes: [],
  status: "draft",
  version: "1.0",
  noExpiry: true,
  targetUserCategory: ["customer"],
  ageThreshold: 18,
  consentGivenBy: "self",
  dataCategories: [],
  mechanism: "checkbox",
  separateConsents: true,
  withdrawVisible: true,
  dataSharing: false,
  thirdParties: [],
  subProcessors: [],
  retention: {
    period: "",
    justification: "",
    autoDelete: false,
    postWithdrawalRules: "",
  },
  security: {
    encryptionAtRest: true,
    encryptionInTransit: true,
    accessControls: true,
    monitoringLogging: true,
    incidentResponse: true,
    certifications: [],
    additionalMeasures: [],
  },
  withdrawal: {
    method: "",
    effect: "",
    rightsLink: "",
    processingTimeline: "",
  },
  privacyNoticeRef: "",
  auditTrailEnabled: true,
  defaultLanguage: "en",
  supportedLanguages: ["en"],
};
