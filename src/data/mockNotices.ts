export interface NoticeRecord {
  id: string;
  title: string;
  version: string;
  status: "active" | "draft" | "pending_review" | "archived" | "NOTICE_ACTIVE" | "NOTICE_DRAFT" | "NOTICE_PENDING_REVIEW" | "NOTICE_ARCHIVED";
  lastUpdated: string;
  acknowledgements: number;
  pendingAck: number;
  _count?: {
    acknowledgements: number;
    versions: number;
  };
  updatedAt?: string;
}

export interface NoticeHistoryRecord {
  version: string;
  title: string;
  date: string;
  author: string;
  changes: string;
}

export interface NoticeLanguage {
  code: string;
  name: string;
  isDefault: boolean;
  completion: number;
}

export interface NoticeType {
  id: string;
  name: string;
  description: string;
  required: boolean;
}

export const mockNotices: NoticeRecord[] = [
  { id: "NOT-001", title: "Privacy Policy", version: "2.4", status: "active", lastUpdated: "2024-01-15", acknowledgements: 12450, pendingAck: 234 },
  { id: "NOT-002", title: "Terms of Service", version: "3.1", status: "active", lastUpdated: "2024-01-10", acknowledgements: 12300, pendingAck: 384 },
  { id: "NOT-003", title: "Cookie Policy", version: "1.8", status: "draft", lastUpdated: "2024-01-18", acknowledgements: 0, pendingAck: 0 },
  { id: "NOT-004", title: "Data Processing Agreement", version: "2.0", status: "active", lastUpdated: "2023-12-20", acknowledgements: 890, pendingAck: 45 },
  { id: "NOT-005", title: "Children's Privacy Notice", version: "1.2", status: "pending_review", lastUpdated: "2024-01-17", acknowledgements: 0, pendingAck: 0 },
  { id: "NOT-006", title: "Cross-Border Transfer Notice", version: "1.1", status: "active", lastUpdated: "2024-01-22", acknowledgements: 7130, pendingAck: 612 },
  { id: "NOT-007", title: "Biometric Data Notice", version: "1.0", status: "pending_review", lastUpdated: "2024-01-24", acknowledgements: 0, pendingAck: 0 },
  { id: "NOT-008", title: "Employee Monitoring Notice", version: "2.2", status: "archived", lastUpdated: "2023-10-01", acknowledgements: 481, pendingAck: 0 },
];

export const mockNoticeHistory: NoticeHistoryRecord[] = [
  { version: "v2.4", title: "Privacy Policy", date: "2024-01-15", author: "DPO Team", changes: "Updated data retention policy per DPDP Act" },
  { version: "v2.3", title: "Privacy Policy", date: "2023-11-20", author: "Legal Dept", changes: "Added cookie tracking clause" },
  { version: "v3.1", title: "Terms of Service", date: "2024-01-10", author: "Legal Dept", changes: "Refined dispute resolution section" },
  { version: "v2.0", title: "Data Processing Agreement", date: "2023-12-20", author: "Admin", changes: "Annual review update" },
  { version: "v1.7", title: "Cookie Policy", date: "2023-09-05", author: "Tech Team", changes: "Added new analytics partners" },
  { version: "v1.1", title: "Cross-Border Transfer Notice", date: "2024-01-22", author: "Privacy Ops", changes: "Included list of new subprocessors in EU and UAE" },
  { version: "v1.0", title: "Biometric Data Notice", date: "2024-01-24", author: "Security Team", changes: "Initial notice drafted for facial login feature" },
];

export const mockNoticeLanguages: NoticeLanguage[] = [
  { code: "en", name: "English", isDefault: true, completion: 100 },
  { code: "es", name: "Spanish", isDefault: false, completion: 85 },
  { code: "fr", name: "French", isDefault: false, completion: 60 },
  { code: "de", name: "German", isDefault: false, completion: 40 },
  { code: "hi", name: "Hindi", isDefault: false, completion: 95 },
  { code: "ar", name: "Arabic", isDefault: false, completion: 72 },
];

export const mockNoticeTypes: NoticeType[] = [
  { id: "privacy", name: "Privacy Policy", description: "General privacy statement for users", required: true },
  { id: "terms", name: "Terms of Service", description: "Legal agreement for service usage", required: true },
  { id: "cookie", name: "Cookie Policy", description: "Details about tracking technologies", required: true },
  { id: "eula", name: "EULA", description: "End User License Agreement", required: false },
  { id: "children", name: "Children's Notice", description: "Special notice for users below age threshold", required: true },
  { id: "biometric", name: "Biometric Notice", description: "Usage and retention of biometric identifiers", required: false },
];
