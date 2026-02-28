export interface GrievanceRecord {
  id: string;
  subject: string;
  userId: string;
  category: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "open" | "in-progress" | "in_progress" | "resolved" | "escalated";
  createdDate: string;
  lastUpdate: string;
  assignedTo: string;
}

export const mockGrievances = [
  {
    id: "GRV-2024-0234",
    subject: "Unable to access personal data",
    userId: "USR-78234",
    category: "Data Access",
    priority: "high",
    status: "open",
    createdDate: "2024-01-18",
    lastUpdate: "2 hours ago",
    assignedTo: "John Smith",
  },
  {
    id: "GRV-2024-0233",
    subject: "Consent withdrawal not processed",
    userId: "USR-55921",
    category: "Consent",
    priority: "medium",
    status: "in-progress",
    createdDate: "2024-01-17",
    lastUpdate: "1 day ago",
    assignedTo: "Sarah Johnson",
  },
  {
    id: "GRV-2024-0232",
    subject: "Incorrect data retention",
    userId: "USR-11239",
    category: "Privacy",
    priority: "low",
    status: "resolved",
    createdDate: "2024-01-15",
    lastUpdate: "3 days ago",
    assignedTo: "Mike Williams",
  },
  {
    id: "GRV-2024-0231",
    subject: "Right to be forgotten request",
    userId: "USR-99882",
    category: "Data Erasure",
    priority: "high",
    status: "open",
    createdDate: "2024-01-14",
    lastUpdate: "4 days ago",
    assignedTo: "John Smith",
  },
  {
    id: "GRV-2024-0230",
    subject: "Data portability export missing metadata",
    userId: "USR-67342",
    category: "Data Portability",
    priority: "medium",
    status: "in_progress",
    createdDate: "2024-01-13",
    lastUpdate: "6 hours ago",
    assignedTo: "Neha Kapoor",
  },
  {
    id: "GRV-2024-0229",
    subject: "Minor account consent recorded without guardian",
    userId: "USR-44821",
    category: "Minor Consent",
    priority: "critical",
    status: "escalated",
    createdDate: "2024-01-12",
    lastUpdate: "1 hour ago",
    assignedTo: "DPO Escalation Desk",
  },
  {
    id: "GRV-2024-0228",
    subject: "Privacy notice language mismatch",
    userId: "USR-30118",
    category: "Notice",
    priority: "low",
    status: "open",
    createdDate: "2024-01-11",
    lastUpdate: "2 days ago",
    assignedTo: "Localization Team",
  },
  {
    id: "GRV-2024-0227",
    subject: "Delayed response from grievance officer",
    userId: "USR-22009",
    category: "SLA",
    priority: "high",
    status: "in_progress",
    createdDate: "2024-01-10",
    lastUpdate: "8 hours ago",
    assignedTo: "Ankit Jain",
  },
] satisfies GrievanceRecord[];
