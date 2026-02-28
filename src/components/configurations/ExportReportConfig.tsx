import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  Plus,
  CheckCircle2,
  Settings2,
  Clock,
  Calendar,
  Download,
  Mail,
  FileSpreadsheet,
  FileJson,
  Play,
  Pause,
  Eye,
} from "lucide-react";
import { ExportConfig, ExportFormat, ScheduleFrequency, LifecycleStatus } from "./types";
import { useToast } from "@/hooks/use-toast";

const mockExportConfigs: ExportConfig[] = [
  {
    id: "1",
    name: "Weekly Consent Summary",
    reportType: "consent-summary",
    format: "pdf",
    scheduleFrequency: "weekly",
    scheduledTime: "Monday 09:00",
    recipients: ["dpo@company.com", "compliance@company.com"],
    dataMaskingEnabled: true,
    brandingEnabled: true,
    status: "active",
    lastExecuted: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    nextExecution: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    name: "Monthly Rights Report",
    reportType: "rights-analytics",
    format: "xlsx",
    scheduleFrequency: "monthly",
    scheduledTime: "1st of month 08:00",
    recipients: ["legal@company.com"],
    dataMaskingEnabled: true,
    brandingEnabled: true,
    status: "active",
    lastExecuted: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    nextExecution: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    name: "Daily Audit Log Export",
    reportType: "audit-log",
    format: "json",
    scheduleFrequency: "daily",
    scheduledTime: "02:00",
    recipients: ["security@company.com"],
    dataMaskingEnabled: false,
    brandingEnabled: false,
    status: "active",
    lastExecuted: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    nextExecution: new Date(Date.now() + 12 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "4",
    name: "Quarterly Compliance Report",
    reportType: "compliance-summary",
    format: "pdf",
    scheduleFrequency: "quarterly",
    scheduledTime: "First Monday of quarter",
    recipients: ["board@company.com", "ciso@company.com"],
    dataMaskingEnabled: true,
    brandingEnabled: true,
    status: "active",
    lastExecuted: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    nextExecution: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const reportTypes = [
  { value: "consent-summary", label: "Consent Summary" },
  { value: "rights-analytics", label: "Rights Analytics" },
  { value: "grievance-report", label: "Grievance Report" },
  { value: "audit-log", label: "Audit Log Export" },
  { value: "compliance-summary", label: "Compliance Summary" },
  { value: "sla-performance", label: "SLA Performance" },
  { value: "cookie-analytics", label: "Cookie Analytics" },
];

const getFormatIcon = (format: ExportFormat) => {
  switch (format) {
    case "pdf":
      return <FileText className="h-4 w-4 text-destructive" />;
    case "xlsx":
    case "csv":
      return <FileSpreadsheet className="h-4 w-4 text-success" />;
    case "json":
      return <FileJson className="h-4 w-4 text-warning" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

const getStatusBadge = (status: LifecycleStatus) => {
  switch (status) {
    case "active":
      return <Badge className="bg-success/10 text-success border-success/20">Active</Badge>;
    case "draft":
      return <Badge variant="secondary">Draft</Badge>;
    case "disabled":
      return <Badge variant="outline">Paused</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getFrequencyBadge = (frequency: ScheduleFrequency) => {
  const colors: Record<ScheduleFrequency, string> = {
    "daily": "bg-primary/10 text-primary border-primary/20",
    "weekly": "bg-success/10 text-success border-success/20",
    "monthly": "bg-warning/10 text-warning border-warning/20",
    "quarterly": "bg-destructive/10 text-destructive border-destructive/20",
    "on-demand": "bg-muted text-muted-foreground",
  };
  return <Badge className={colors[frequency]}>{frequency}</Badge>;
};

export function ExportReportConfig() {
  const [configs, setConfigs] = useState<ExportConfig[]>(mockExportConfigs);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { toast } = useToast();

  const activeConfigs = configs.filter(c => c.status === "active").length;
  const scheduledToday = configs.filter(c => {
    if (!c.nextExecution) return false;
    const today = new Date();
    return c.nextExecution.toDateString() === today.toDateString();
  }).length;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Configurations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{configs.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Schedules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{activeConfigs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Scheduled Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{scheduledToday}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Report Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportTypes.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Report Templates Gallery */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Report Templates</CardTitle>
          <CardDescription>Quick access to common report configurations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {reportTypes.slice(0, 4).map(report => (
              <div 
                key={report.value}
                className="p-4 border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer"
              >
                <FileText className="h-8 w-8 text-primary mb-2" />
                <p className="font-medium text-sm">{report.label}</p>
                <p className="text-xs text-muted-foreground mt-1">Click to configure</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Export & Reporting Configurations</h3>
          <p className="text-sm text-muted-foreground">
            Define how reports and exports are generated and delivered
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Configuration
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Export Configuration</DialogTitle>
              <DialogDescription>
                Set up automated report generation and delivery
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Configuration Name</Label>
                <Input id="name" placeholder="e.g., Weekly Consent Summary" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Report Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      {reportTypes.map(report => (
                        <SelectItem key={report.value} value={report.value}>
                          {report.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Export Format</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Schedule Frequency</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="on-demand">On-Demand Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Scheduled Time</Label>
                  <Input type="time" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Recipients (comma-separated emails)</Label>
                <Input placeholder="e.g., dpo@company.com, compliance@company.com" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Enable Data Masking</p>
                    <p className="text-sm text-muted-foreground">Mask PII in exported reports</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Apply Branding</p>
                    <p className="text-sm text-muted-foreground">Use white-label settings in reports</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button
                onClick={() => {
                  const newConfig: ExportConfig = {
                    id: `exp-${Date.now()}`,
                    name: `Export Config ${configs.length + 1}`,
                    reportType: "consent-summary",
                    format: "pdf",
                    scheduleFrequency: "weekly",
                    scheduledTime: "09:00",
                    recipients: ["dpo@company.com"],
                    dataMaskingEnabled: true,
                    brandingEnabled: true,
                    status: "active",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    nextExecution: new Date(Date.now() + 24 * 60 * 60 * 1000),
                  };
                  setConfigs((prev) => [newConfig, ...prev]);
                  setIsCreateOpen(false);
                  toast({
                    title: "Export Configuration Created",
                    description: `${newConfig.name} scheduled successfully.`,
                  });
                }}
              >
                Create Configuration
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Configurations Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Configuration Name</TableHead>
              <TableHead>Report Type</TableHead>
              <TableHead>Format</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Recipients</TableHead>
              <TableHead>Next Execution</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {configs.map(config => (
              <TableRow key={config.id}>
                <TableCell className="font-medium">{config.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {reportTypes.find(r => r.value === config.reportType)?.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getFormatIcon(config.format)}
                    <span className="uppercase text-xs">{config.format}</span>
                  </div>
                </TableCell>
                <TableCell>{getFrequencyBadge(config.scheduleFrequency)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">{config.recipients.length}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {config.nextExecution && (
                    <div className="flex items-center gap-1 text-sm">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      {config.nextExecution.toLocaleDateString()}
                    </div>
                  )}
                </TableCell>
                <TableCell>{getStatusBadge(config.status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Preview"
                      onClick={() => toast({ title: "Preview", description: `Preview opened for ${config.name}.` })}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Run Now"
                      onClick={() => toast({ title: "Execution Started", description: `Manual run started for ${config.name}.` })}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Configure"
                      onClick={() => toast({ title: "Configure", description: `Opening ${config.name} settings.` })}
                    >
                      <Settings2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Execution Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Recent Executions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {configs.slice(0, 3).map(config => (
              <div key={config.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getFormatIcon(config.format)}
                  <div>
                    <p className="font-medium text-sm">{config.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Last run: {config.lastExecuted?.toLocaleDateString()} at {config.lastExecuted?.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span className="text-sm text-success">Completed</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toast({ title: "Download Ready", description: `Downloaded latest output for ${config.name}.` })}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
