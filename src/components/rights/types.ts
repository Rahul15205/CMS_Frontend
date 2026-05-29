// Rights Management Types - Enterprise CMS

export type RightsType =
  | 'file_complaint'
  | 'withdraw_consent'
  | 'access'
  | 'correction'
  | 'erasure'
  | 'grievance_redressal'
  | 'nominate';

export type Regulation = 'gdpr' | 'dpdp' | 'ccpa' | 'lgpd' | 'pdpl' | 'pipl' | 'custom';

export type RequestStatus =
  | 'received'
  | 'identity_verified'
  | 'acknowledged'
  | 'in_review'
  | 'action_taken'
  | 'response_sent'
  | 'closed'
  | 'rejected'
  | 'escalated'
  | 'on_hold';

export type VerificationMethod =
  | 'otp'
  | 'email'
  | 'aadhaar_ekyc'
  | 'digilocker'
  | 'knowledge_based'
  | 'authorized_rep'
  | 'manual';

export type SubmissionChannel = 'web' | 'api' | 'email' | 'phone' | 'in_person';

export type Priority = 'low' | 'normal' | 'urgent' | 'critical';

export interface RightsRequest {
  id: string;
  caseNumber: string;
  type: RightsType;
  regulation: Regulation;
  status: RequestStatus;
  priority: Priority;

  // Requester Info
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  requesterPhone?: string;
  aadhaarNumber?: string;
  isAuthorizedRep: boolean;
  authorizedRepDetails?: {
    name: string;
    relationship: string;
    proofDocument?: string;
  };

  // Verification
  verificationStatus: 'pending' | 'verified' | 'failed' | 'expired';
  verificationMethod?: VerificationMethod;
  verifiedAt?: string;
  reVerificationRequired: boolean;
  fraudFlag: boolean;

  // Request Details
  dataCategories: string[];
  description: string;
  relatedConsents: string[];
  relatedApplications: string[];
  submissionChannel: SubmissionChannel;

  // Dates & SLA
  submittedAt: string;
  acknowledgedAt?: string;
  dueDate: string;
  closedAt?: string;
  slaBreached: boolean;
  daysRemaining: number;

  // Assignment
  assignedTo?: string;
  assignedTeam?: string;

  // Tracking
  currentStep: string;
  workflowId?: string;

  // Metadata
  tenantId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowStep {
  id: string;
  name: string;
  order: number;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  assignedRole?: string;
  slaHours?: number;
  completedAt?: string;
  completedBy?: string;
  notes?: string;
}

export interface CaseNote {
  id: string;
  caseId: string;
  type: 'internal' | 'external';
  content: string;
  createdBy: string;
  createdAt: string;
  attachments?: string[];
}

export interface CaseAttachment {
  id: string;
  caseId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  category: 'identity_proof' | 'data_extract' | 'deletion_confirmation' | 'communication' | 'other';
  uploadedBy: string;
  uploadedAt: string;
  url: string;
}

export interface AuditEntry {
  id: string;
  caseId: string;
  action: string;
  performedBy: string;
  performedAt: string;
  details: string;
  systemApplication?: string;
  ipAddress?: string;
  consentVersion?: string;
}

export interface RightsMetrics {
  total: number;
  newToday: number;
  newThisWeek: number;
  pending: number;
  completed: number;
  rejected: number;
  slaCompliance: number;
  slaBreaches: number;
  avgResolutionDays: number;
}

export interface RightsBreakdown {
  file_complaint: number;
  withdraw_consent: number;
  access: number;
  correction: number;
  erasure: number;
  grievance_redressal: number;
  nominate: number;
}

export const RIGHTS_TYPE_INFO: Record<RightsType, { label: string; description: string; icon: string; regulations: Regulation[] }> = {
  file_complaint: {
    label: 'File a Complaint',
    description: 'File a formal complaint',
    icon: 'FileText',
    regulations: ['dpdp', 'gdpr'],
  },
  withdraw_consent: {
    label: 'Withdraw Consent',
    description: 'Withdraw previously given consent',
    icon: 'XCircle',
    regulations: ['gdpr', 'dpdp', 'ccpa', 'lgpd', 'pdpl', 'pipl'],
  },
  access: {
    label: 'Right to Access',
    description: 'Request access to personal data',
    icon: 'Eye',
    regulations: ['gdpr', 'dpdp', 'ccpa', 'lgpd', 'pdpl', 'pipl'],
  },
  correction: {
    label: 'Right to Correction',
    description: 'Request correction/rectification of inaccurate data',
    icon: 'Edit',
    regulations: ['gdpr', 'dpdp', 'lgpd', 'pdpl', 'pipl'],
  },
  erasure: {
    label: 'Right to Erasure',
    description: 'Request deletion of personal data',
    icon: 'Trash2',
    regulations: ['gdpr', 'dpdp', 'ccpa', 'lgpd', 'pdpl', 'pipl'],
  },
  grievance_redressal: {
    label: 'Grievance Redressal',
    description: 'Redressal of grievances',
    icon: 'AlertTriangle',
    regulations: ['dpdp'],
  },
  nominate: {
    label: 'Nominate',
    description: 'Nominate a representative',
    icon: 'CheckCircle',
    regulations: ['dpdp'],
  },
};

export const REGULATION_INFO: Record<Regulation, { label: string; color: string; sladays: number }> = {
  gdpr: { label: 'GDPR', color: 'hsl(217, 91%, 50%)', sladays: 30 },
  dpdp: { label: 'DPDP Act', color: 'hsl(142, 76%, 36%)', sladays: 30 },
  ccpa: { label: 'CCPA/CPRA', color: 'hsl(262, 83%, 58%)', sladays: 45 },
  lgpd: { label: 'LGPD', color: 'hsl(38, 92%, 50%)', sladays: 15 },
  pdpl: { label: 'PDPL', color: 'hsl(199, 89%, 48%)', sladays: 30 },
  pipl: { label: 'PIPL', color: 'hsl(0, 72%, 51%)', sladays: 30 },
  custom: { label: 'Custom', color: 'hsl(215, 16%, 47%)', sladays: 30 },
};

export const STATUS_INFO: Record<RequestStatus, { label: string; color: string; order: number }> = {
  received: { label: 'Received', color: 'hsl(215, 16%, 47%)', order: 1 },
  identity_verified: { label: 'Identity Verified', color: 'hsl(199, 89%, 48%)', order: 2 },
  acknowledged: { label: 'Acknowledged', color: 'hsl(217, 91%, 50%)', order: 3 },
  in_review: { label: 'In Review', color: 'hsl(38, 92%, 50%)', order: 4 },
  action_taken: { label: 'Action Taken', color: 'hsl(262, 83%, 58%)', order: 5 },
  response_sent: { label: 'Response Sent', color: 'hsl(142, 76%, 45%)', order: 6 },
  closed: { label: 'Closed', color: 'hsl(142, 76%, 36%)', order: 7 },
  rejected: { label: 'Rejected', color: 'hsl(0, 72%, 51%)', order: 0 },
  escalated: { label: 'Escalated', color: 'hsl(0, 72%, 51%)', order: 0 },
  on_hold: { label: 'On Hold', color: 'hsl(215, 16%, 47%)', order: 0 },
};

export const DEFAULT_WORKFLOW_STEPS: WorkflowStep[] = [
  { id: '1', name: 'Request Received', order: 1, status: 'completed' },
  { id: '2', name: 'Identity Verified', order: 2, status: 'pending' },
  { id: '3', name: 'Acknowledged', order: 3, status: 'pending' },
  { id: '4', name: 'In Review', order: 4, status: 'pending' },
  { id: '5', name: 'Action Taken', order: 5, status: 'pending' },
  { id: '6', name: 'Response Sent', order: 6, status: 'pending' },
  { id: '7', name: 'Closed', order: 7, status: 'pending' },
];

// PHASE 5 CHANGE
export interface RejectPayload {
  reason: 'INSUFFICIENT_ID' | 'DUPLICATE' | 'OUT_OF_SCOPE' | 'FRAUDULENT' | 'OTHER';
  comment?: string;
}

// PHASE 5 CHANGE
export interface EscalatePayload {
  target: 'SENIOR_OFFICER' | 'DPO' | 'LEGAL';
  rationale: string;
}

// PHASE 5 CHANGE
export interface RequestInfoPayload {
  message: string;
}

// PHASE 5 CHANGE
export interface PartialFulfilPayload {
  fulfilled: string;
  withheld: string;
  legalJustification: string;
}

