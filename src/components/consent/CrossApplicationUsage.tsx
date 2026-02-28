import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import {
  AppWindow,
  Search,
  Filter,
  RefreshCw,
  Download,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Globe,
  Smartphone,
  Server,
  Database,
} from "lucide-react";

interface ApplicationUsage {
  id: string;
  templateName: string;
  templateVersion: string;
  applicationName: string;
  applicationType: "CRM" | "HRMS" | "Website" | "API" | "Mobile" | "ERP" | "Internal";
  systemOwner: string;
  purposeUsed: string;
  lastValidation: string;
  status: "active" | "inactive" | "expired" | "pending";
  usersConsented: number;
  violations: number;
}

const mockApplicationUsage: ApplicationUsage[] = [
  {
    id: "APP-001",
    templateName: "Marketing Communications Consent",
    templateVersion: "v2.4",
    applicationName: "Salesforce CRM",
    applicationType: "CRM",
    systemOwner: "Marketing Team",
    purposeUsed: "Email Marketing",
    lastValidation: "2024-01-22 14:30",
    status: "active",
    usersConsented: 45230,
    violations: 0,
  },
  {
    id: "APP-002",
    templateName: "Employee Data Processing",
    templateVersion: "v1.8",
    applicationName: "SAP SuccessFactors",
    applicationType: "HRMS",
    systemOwner: "HR Department",
    purposeUsed: "HR Processing",
    lastValidation: "2024-01-22 12:15",
    status: "active",
    usersConsented: 2340,
    violations: 0,
  },
  {
    id: "APP-003",
    templateName: "Analytics Tracking Consent",
    templateVersion: "v3.2",
    applicationName: "Corporate Website",
    applicationType: "Website",
    systemOwner: "Digital Team",
    purposeUsed: "Analytics",
    lastValidation: "2024-01-22 10:00",
    status: "active",
    usersConsented: 128900,
    violations: 3,
  },
  {
    id: "APP-004",
    templateName: "Customer Support Consent",
    templateVersion: "v2.1",
    applicationName: "Zendesk API",
    applicationType: "API",
    systemOwner: "Support Team",
    purposeUsed: "Support Processing",
    lastValidation: "2024-01-21 16:45",
    status: "active",
    usersConsented: 8920,
    violations: 0,
  },
  {
    id: "APP-005",
    templateName: "Mobile App Consent",
    templateVersion: "v1.5",
    applicationName: "Customer Mobile App",
    applicationType: "Mobile",
    systemOwner: "Mobile Team",
    purposeUsed: "App Personalization",
    lastValidation: "2024-01-20 09:30",
    status: "pending",
    usersConsented: 67800,
    violations: 1,
  },
  {
    id: "APP-006",
    templateName: "Data Analytics Consent",
    templateVersion: "v2.0",
    applicationName: "Oracle ERP",
    applicationType: "ERP",
    systemOwner: "Finance Team",
    purposeUsed: "Business Analytics",
    lastValidation: "2024-01-19 11:20",
    status: "inactive",
    usersConsented: 450,
    violations: 0,
  },
];

const getAppTypeIcon = (type: string) => {
  switch (type) {
    case "CRM":
    case "HRMS":
    case "ERP":
      return <Database className="h-4 w-4" />;
    case "Website":
      return <Globe className="h-4 w-4" />;
    case "Mobile":
      return <Smartphone className="h-4 w-4" />;
    case "API":
      return <Server className="h-4 w-4" />;
    default:
      return <AppWindow className="h-4 w-4" />;
  }
};

const getStatusStyle = (status: string) => {
  switch (status) {
    case "active":
      return "active";
    case "inactive":
      return "info";
    case "expired":
      return "error";
    case "pending":
      return "warning";
    default:
      return "info";
  }
};

export function CrossApplicationUsage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredData = mockApplicationUsage.filter((item) => {
    const matchesSearch =
      item.templateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.applicationName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || item.applicationType === typeFilter;
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalApps = mockApplicationUsage.length;
  const activeApps = mockApplicationUsage.filter((a) => a.status === "active").length;
  const totalUsers = mockApplicationUsage.reduce((sum, a) => sum + a.usersConsented, 0);
  const totalViolations = mockApplicationUsage.reduce((sum, a) => sum + a.violations, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <AppWindow className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalApps}</p>
                <p className="text-sm text-muted-foreground">Total Applications</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeApps}</p>
                <p className="text-sm text-muted-foreground">Active Integrations</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-info/10">
                <Database className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalUsers.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Consented Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${totalViolations > 0 ? "bg-destructive/10" : "bg-success/10"}`}>
                {totalViolations > 0 ? (
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-success" />
                )}
              </div>
              <div>
                <p className="text-2xl font-bold">{totalViolations}</p>
                <p className="text-sm text-muted-foreground">Consent Violations</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <CardTitle className="text-lg">Cross-Application Consent Mapping</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync All
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by template or application..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Application Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="CRM">CRM</SelectItem>
                <SelectItem value="HRMS">HRMS</SelectItem>
                <SelectItem value="Website">Website</SelectItem>
                <SelectItem value="API">API</SelectItem>
                <SelectItem value="Mobile">Mobile</SelectItem>
                <SelectItem value="ERP">ERP</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Data Table */}
          <div className="border rounded-lg overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Consent Template</TableHead>
                  <TableHead>Application</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>System Owner</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Last Validated</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Violations</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.templateName}</p>
                        <p className="text-xs text-muted-foreground">{item.templateVersion}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getAppTypeIcon(item.applicationType)}
                        <span>{item.applicationName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.applicationType}</Badge>
                    </TableCell>
                    <TableCell>{item.systemOwner}</TableCell>
                    <TableCell>{item.purposeUsed}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {item.lastValidation}
                    </TableCell>
                    <TableCell className="font-medium">
                      {item.usersConsented.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={getStatusStyle(item.status) as any}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>
                      {item.violations > 0 ? (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {item.violations}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-success border-success/30">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          None
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredData.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No applications found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
