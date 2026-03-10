import { useState, useEffect, useCallback } from "react";
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
  Loader2,
  BarChart3,
  ChevronRight
} from "lucide-react";
import { ExportConfig, ExportFormat, ScheduleFrequency, LifecycleStatus } from "./types";
import { useToast } from "@/hooks/use-toast";
import { exportConfigsService } from "@/services/configurationsService";
import { Skeleton } from "@/components/ui/skeleton";

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
  return <Badge className={`${colors[frequency]} capitalize`}>{frequency}</Badge>;
};

export function ExportReportConfig() {
  const [configs, setConfigs] = useState<ExportConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  const fetchConfigs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await exportConfigsService.getAll();
      setConfigs(Array.isArray(data) ? data : []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load export configurations.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  const handleToggleStatus = async (id: string) => {
    try {
      const config = configs.find(c => c.id === id);
      if (!config) return;
      const newStatus: LifecycleStatus = config.status === "active" ? "disabled" : "active";
      const updated = await exportConfigsService.update(id, { ...config, status: newStatus });
      setConfigs(prev => prev.map(c => c.id === id ? updated : c));
      toast({
        title: `Configuration ${newStatus === "active" ? "Resumed" : "Paused"}`,
        description: `${config.name} has been updated.`
      });
    } catch (error) {
      toast({ title: "Error", description: "Operation failed.", variant: "destructive" });
    }
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      const newConfig: Partial<ExportConfig> = {
        name: `Export Schedule ${configs.length + 1}`,
        reportType: "consent-summary",
        format: "pdf",
        scheduleFrequency: "weekly",
        scheduledTime: "09:00",
        recipients: ["compliance@company.com"],
        dataMaskingEnabled: true,
        brandingEnabled: true,
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
        nextExecution: new Date(Date.now() + 24 * 60 * 60 * 1000),
      };
      const created = await exportConfigsService.create(newConfig as ExportConfig);
      setConfigs(prev => [created, ...prev]);
      setIsCreateOpen(false);
      toast({ title: "Configuration Created", description: "Report schedule added successfully." });
    } catch (error) {
        toast({ title: "Error", description: "Failed to create configuration.", variant: "destructive" });
    } finally {
        setCreating(false);
    }
  };

  const activeConfigs = configs.filter(c => c.status === "active").length;
  const scheduledToday = configs.filter(c => {
    if (!c.nextExecution) return false;
    const today = new Date();
    return new Date(c.nextExecution).toDateString() === today.toDateString();
  }).length;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
            { title: "Configurations", value: loading ? "..." : configs.length, icon: FileText, color: "text-foreground" },
            { title: "Active Schedules", value: loading ? "..." : activeConfigs, icon: CheckCircle2, color: "text-success" },
            { title: "Scheduled Today", value: loading ? "..." : scheduledToday, icon: Clock, color: "text-primary" },
            { title: "Report Templates", value: reportTypes.length, icon: BarChart3, color: "text-warning" }
        ].map((stat, i) => (
            <Card key={i} className="border-0 shadow-sm bg-card/60 backdrop-blur-sm overflow-hidden group hover:shadow-md transition-all duration-300">
                <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <stat.icon className="h-3.5 w-3.5" />
                        {stat.title}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                </CardContent>
            </Card>
        ))}
      </div>

      {/* Report Templates Gallery */}
      <Card className="border-0 shadow-sm bg-card/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Reporting Templates
          </CardTitle>
          <CardDescription>Industry-standard templates for compliance reporting</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {reportTypes.slice(0, 4).map(report => (
              <div 
                key={report.value}
                className="group p-4 border border-border/50 rounded-xl bg-background/40 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 cursor-pointer relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="h-4 w-4 text-primary" />
                </div>
                <div className="p-2 rounded-lg bg-primary/10 text-primary w-fit mb-3">
                    <FileText className="h-5 w-5" />
                </div>
                <p className="font-bold text-sm text-foreground">{report.label}</p>
                <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-tight">Standard Compliance</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-foreground">Export Schedules</h3>
          <p className="text-sm text-muted-foreground">
            Automate data delivery to DPOs and Compliance Officers.
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-lg shadow-primary/20">
              <Plus className="h-4 w-4 mr-2" />
              Configure New Export
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-card">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">New Export Protocol</DialogTitle>
              <DialogDescription>
                Define report parameters, output format, and delivery schedule.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-sm font-semibold">Configuration Name</Label>
                <Input id="name" placeholder="e.g., Weekly Consent Summary" className="bg-background/50 border-border/50" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="text-sm font-semibold">Report Type</Label>
                  <Select>
                    <SelectTrigger className="bg-background/50 border-border/50">
                      <SelectValue placeholder="Select type" />
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
                  <Label className="text-sm font-semibold">Output Format</Label>
                  <Select defaultValue="pdf">
                    <SelectTrigger className="bg-background/50 border-border/50">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">Professional PDF</SelectItem>
                      <SelectItem value="xlsx">Excel Spreadsheet (XLSX)</SelectItem>
                      <SelectItem value="csv">Standard CSV</SelectItem>
                      <SelectItem value="json">Raw JSON</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="text-sm font-semibold">Frequency</Label>
                  <Select defaultValue="weekly">
                    <SelectTrigger className="bg-background/50 border-border/50">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily Execution</SelectItem>
                      <SelectItem value="weekly">Weekly Compilation</SelectItem>
                      <SelectItem value="monthly">Monthly Audit</SelectItem>
                      <SelectItem value="quarterly">Quarterly Review</SelectItem>
                      <SelectItem value="on-demand">Manual Run Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label className="text-sm font-semibold">Execution Time (UTC)</Label>
                  <Input type="time" className="bg-background/50 border-border/50" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label className="text-sm font-semibold">Recipient Emails</Label>
                <Input placeholder="dpo@company.com, legal@company.com" className="bg-background/50 border-border/50" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 border border-border/50 rounded-xl bg-muted/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-primary">Data Masking</p>
                    <p className="text-[10px] text-muted-foreground mt-1 text-wrap pr-4">Anonymize PII for non-DPO recipients.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-primary">Branding</p>
                    <p className="text-[10px] text-muted-foreground mt-1 text-wrap pr-4">Apply corporate header/footer logo.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button
                onClick={handleCreate}
                disabled={creating}
              >
                {creating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Settings2 className="h-4 w-4 mr-2" />}
                Save & Schedule
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Configurations Table */}
      <Card className="border-0 shadow-sm bg-card/60 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
            <Table>
            <TableHeader className="bg-muted/30">
                <TableRow>
                <TableHead className="font-bold">Protocol Name</TableHead>
                <TableHead className="font-bold">Report Category</TableHead>
                <TableHead className="font-bold">Format</TableHead>
                <TableHead className="font-bold">Schedule</TableHead>
                <TableHead className="font-bold">Recipients</TableHead>
                <TableHead className="font-bold">Next Run</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="text-right font-bold">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {loading ? (
                    Array(3).fill(0).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell colSpan={8} className="p-0">
                                <Skeleton className="h-16 w-full rounded-none" />
                            </TableCell>
                        </TableRow>
                    ))
                ) : (
                    configs.map(config => (
                    <TableRow key={config.id} className="group hover:bg-muted/20 transition-colors">
                        <TableCell className="font-bold text-foreground">{config.name}</TableCell>
                        <TableCell>
                        <Badge variant="outline" className="text-[10px] uppercase font-bold bg-background/50 border-border/50">
                            {reportTypes.find(r => r.value === config.reportType)?.label}
                        </Badge>
                        </TableCell>
                        <TableCell>
                        <div className="flex items-center gap-2">
                            {getFormatIcon(config.format)}
                            <span className="uppercase text-[10px] font-bold tracking-widest">{config.format}</span>
                        </div>
                        </TableCell>
                        <TableCell>{getFrequencyBadge(config.scheduleFrequency)}</TableCell>
                        <TableCell>
                        <div className="flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs font-semibold">{config.recipients.length}</span>
                        </div>
                        </TableCell>
                        <TableCell>
                        {config.nextExecution && (
                            <div className="flex items-center gap-1.5 text-xs font-medium">
                            <Clock className="h-3.5 w-3.5 text-primary" />
                            {new Date(config.nextExecution).toLocaleDateString()}
                            </div>
                        )}
                        </TableCell>
                        <TableCell>{getStatusBadge(config.status)}</TableCell>
                        <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:text-primary"
                            onClick={() => toast({ title: "Protocol Preview", description: "Generating immediate report preview..." })}
                            >
                            <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:text-success"
                            onClick={() => toast({ title: "Manual Execution", description: `Report generation for '${config.name}' queued.` })}
                            >
                            <Play className="h-4 w-4" />
                            </Button>
                            <Button
                            variant="ghost"
                            size="icon"
                            className={`h-8 w-8 ${config.status === 'active' ? 'hover:text-warning' : 'hover:text-success'}`}
                            onClick={() => handleToggleStatus(config.id)}
                            >
                            {config.status === "active" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                            </Button>
                        </div>
                        </TableCell>
                    </TableRow>
                    ))
                )}
            </TableBody>
            </Table>
        </div>
      </Card>

      {/* Execution Tracker */}
      <Card className="border-0 shadow-sm bg-card/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Execution Ledger
          </CardTitle>
          <CardDescription>Recent automated and manual report generations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {!loading && configs.filter(c => c.lastExecuted).slice(0, 3).map(config => (
              <div key={config.id} className="flex items-center justify-between p-4 border border-border/50 rounded-xl bg-background/40 hover:bg-muted/30 transition-all duration-200 group">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    {getFormatIcon(config.format)}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{config.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Last generated: {new Date(config.lastExecuted!).toLocaleDateString()} at {new Date(config.lastExecuted!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-success uppercase tracking-widest">
                        <CheckCircle2 className="h-3 w-3" />
                        Success
                      </div>
                      <p className="text-[9px] text-muted-foreground mr-4">ID: RX-{config.id.slice(-4).toUpperCase()}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 border-primary/20 hover:bg-primary/5 hover:text-primary transition-all"
                    onClick={() => toast({ title: "Accessing Archive", description: `Downloading encrypted report package...` })}
                  >
                    <Download className="h-3.5 w-3.5 mr-2" />
                    Archive
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
