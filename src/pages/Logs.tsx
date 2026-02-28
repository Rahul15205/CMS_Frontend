import { useState } from "react";
import { DashboardLayout, PageSection, SectionTitle } from "@/components/layout/DashboardLayout";
import { KPICard } from "@/components/dashboard/KPICard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ScrollText,
  FileCheck,
  Scale,
  Activity,
  Shield,
  Search,
  Filter,
  Download,
  Calendar,
  Clock,
  User,
} from "lucide-react";

const logs = [
  {
    id: 1,
    timestamp: "2024-01-19 10:45:32",
    action: "Consent granted",
    category: "consent",
    user: "system@auto",
    target: "USR-78234",
    ip: "203.192.xxx.xxx",
    details: "Marketing communications consent granted",
  },
  {
    id: 2,
    timestamp: "2024-01-19 10:42:15",
    action: "Rights request submitted",
    category: "rights",
    user: "portal@self",
    target: "REQ-2024-0892",
    ip: "182.156.xxx.xxx",
    details: "Data access request submitted by data principal",
  },
  {
    id: 3,
    timestamp: "2024-01-19 10:38:45",
    action: "Login successful",
    category: "security",
    user: "admin@company.com",
    target: "Session-4521",
    ip: "203.192.xxx.xxx",
    details: "Admin login from Chrome on Windows",
  },
  {
    id: 4,
    timestamp: "2024-01-19 10:35:20",
    action: "Consent withdrawn",
    category: "consent",
    user: "portal@self",
    target: "USR-45123",
    ip: "49.207.xxx.xxx",
    details: "Analytics consent withdrawn by user",
  },
  {
    id: 5,
    timestamp: "2024-01-19 10:30:00",
    action: "Configuration updated",
    category: "system",
    user: "admin@company.com",
    target: "Purpose-003",
    ip: "203.192.xxx.xxx",
    details: "New purpose 'Research' added to configuration",
  },
  {
    id: 6,
    timestamp: "2024-01-19 10:25:10",
    action: "Failed login attempt",
    category: "security",
    user: "unknown@domain.com",
    target: "N/A",
    ip: "Unknown",
    details: "Invalid credentials - 3rd attempt",
  },
];

const getCategoryBadge = (category: string) => {
  switch (category) {
    case "consent":
      return <StatusBadge status="active" dot={false}>Consent</StatusBadge>;
    case "rights":
      return <StatusBadge status="info" dot={false}>Rights</StatusBadge>;
    case "security":
      return <StatusBadge status="warning" dot={false}>Security</StatusBadge>;
    case "system":
      return <StatusBadge status="info" dot={false}>System</StatusBadge>;
    default:
      return <StatusBadge status="info" dot={false}>{category}</StatusBadge>;
  }
};

export default function Logs() {
  const [activeTab, setActiveTab] = useState("all");

  const filteredLogs = activeTab === "all"
    ? logs
    : logs.filter(log => log.category === activeTab);

  return (
    <DashboardLayout
      title="Logs"

      actions={
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Export Logs</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Export Logs</TooltipContent>
        </Tooltip>
      }
    >
      {/* KPI Cards */}
      <PageSection className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Consent Logs"
            value="12,450"
            icon={<FileCheck className="h-6 w-6" />}
          />
          <KPICard
            title="Rights Logs"
            value="580"
            icon={<Scale className="h-6 w-6" />}
          />
          <KPICard
            title="System Logs"
            value="3,200"
            icon={<Activity className="h-6 w-6" />}
          />
          <KPICard
            title="Security Logs"
            value="1,890"
            icon={<Shield className="h-6 w-6" />}
          />
        </div>
      </PageSection>

      {/* Logs Table */}
      <PageSection>
        <div className="dashboard-card">
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <SectionTitle>Audit Logs</SectionTitle>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search logs..." className="pl-9 w-full" />
                </div>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input type="date" className="pl-9 w-full sm:w-40" />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="inline-flex w-max">
                  <TabsTrigger value="all">All Logs</TabsTrigger>
                  <TabsTrigger value="consent">Consent</TabsTrigger>
                  <TabsTrigger value="rights">Rights</TabsTrigger>
                  <TabsTrigger value="system">System</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          <div className="border rounded-lg overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-40">Timestamp</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-muted/30">
                    <TableCell className="text-muted-foreground text-sm font-mono">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {log.timestamp}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{log.action}</p>
                        <p className="text-xs text-muted-foreground">{log.details}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getCategoryBadge(log.category)}</TableCell>
                    <TableCell className="text-sm">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3 text-muted-foreground" />
                        {log.user}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-mono text-muted-foreground">
                      {log.target}
                    </TableCell>
                    <TableCell className="text-sm font-mono text-muted-foreground">
                      {log.ip}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Showing 1-6 of 18,120 logs
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          </div>

          {/* Immutability Notice */}
          <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-success mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Immutable Audit Trail</p>
                <p className="text-sm text-muted-foreground mt-1">
                  All logs are cryptographically signed and stored in an immutable ledger.
                  These records cannot be modified or deleted and are retained for the legally mandated period.
                </p>
              </div>
            </div>
          </div>
        </div>
      </PageSection>
    </DashboardLayout>
  );
}
