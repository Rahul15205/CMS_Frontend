import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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
  AlertTriangle,
  CheckCircle2,
  Settings2,
  Archive,
  Trash2,
  Shield,
  Clock,
  Database,
  Lock,
} from "lucide-react";
import { LogRetentionRule, LogType, Regulation, LifecycleStatus } from "./types";
import { useToast } from "@/hooks/use-toast";

const mockRetentionRules: LogRetentionRule[] = [
  {
    id: "1",
    logType: "audit",
    retentionPeriod: 7,
    retentionUnit: "years",
    regulation: "GDPR",
    autoArchive: true,
    autoDelete: false,
    legalHoldOverride: false,
    maskingEnabled: true,
    maskingFields: ["email", "ip_address"],
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    logType: "consent",
    retentionPeriod: 5,
    retentionUnit: "years",
    regulation: "DPDP",
    autoArchive: true,
    autoDelete: false,
    legalHoldOverride: true,
    maskingEnabled: false,
    maskingFields: [],
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    logType: "rights",
    retentionPeriod: 3,
    retentionUnit: "years",
    regulation: "GDPR",
    autoArchive: true,
    autoDelete: true,
    legalHoldOverride: false,
    maskingEnabled: true,
    maskingFields: ["name", "email", "phone"],
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "4",
    logType: "security",
    retentionPeriod: 2,
    retentionUnit: "years",
    autoArchive: false,
    autoDelete: true,
    legalHoldOverride: false,
    maskingEnabled: true,
    maskingFields: ["ip_address"],
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "5",
    logType: "system",
    retentionPeriod: 90,
    retentionUnit: "days",
    autoArchive: false,
    autoDelete: true,
    legalHoldOverride: false,
    maskingEnabled: false,
    maskingFields: [],
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const logTypes: { value: LogType; label: string; icon: React.ReactNode }[] = [
  { value: "audit", label: "Audit Logs", icon: <Shield className="h-4 w-4" /> },
  { value: "consent", label: "Consent Logs", icon: <CheckCircle2 className="h-4 w-4" /> },
  { value: "rights", label: "Rights Logs", icon: <FileText className="h-4 w-4" /> },
  { value: "grievance", label: "Grievance Logs", icon: <AlertTriangle className="h-4 w-4" /> },
  { value: "security", label: "Security Logs", icon: <Lock className="h-4 w-4" /> },
  { value: "system", label: "System Logs", icon: <Database className="h-4 w-4" /> },
];

const getStatusBadge = (status: LifecycleStatus) => {
  switch (status) {
    case "active":
      return <Badge className="bg-success/10 text-success border-success/20">Active</Badge>;
    case "draft":
      return <Badge variant="secondary">Draft</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getRetentionDisplay = (period: number, unit: string) => {
  return `${period} ${unit}`;
};

// Mock storage usage data
const storageData = [
  { type: "Audit Logs", size: 45.2, color: "bg-primary" },
  { type: "Consent Logs", size: 32.8, color: "bg-success" },
  { type: "Rights Logs", size: 12.5, color: "bg-warning" },
  { type: "Security Logs", size: 8.3, color: "bg-destructive" },
  { type: "System Logs", size: 1.2, color: "bg-muted-foreground" },
];

const totalStorage = storageData.reduce((acc, item) => acc + item.size, 0);

export function LogRetentionRules() {
  const [rules, setRules] = useState<LogRetentionRule[]>(mockRetentionRules);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { toast } = useToast();

  const complianceIssues = rules.filter(r => 
    r.regulation && r.retentionPeriod < 3 && r.retentionUnit === "years"
  ).length;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Retention Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rules.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Log Storage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStorage.toFixed(1)} GB</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Legal Holds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {rules.filter(r => r.legalHoldOverride).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Compliance Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {complianceIssues === 0 ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <span className="font-semibold text-success">Compliant</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  <span className="font-semibold text-warning">{complianceIssues} Issues</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Storage Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="h-4 w-4" />
            Log Storage Distribution
          </CardTitle>
          <CardDescription>Current storage usage by log type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {storageData.map(item => (
              <div key={item.type} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.type}</span>
                  <span className="text-muted-foreground">{item.size} GB ({((item.size / totalStorage) * 100).toFixed(1)}%)</span>
                </div>
                <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`absolute left-0 top-0 h-full ${item.color} rounded-full`}
                    style={{ width: `${(item.size / totalStorage) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Log Retention Rules</h3>
          <p className="text-sm text-muted-foreground">
            Control retention periods for audit, consent, rights, and security logs
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Log Retention Rule</DialogTitle>
              <DialogDescription>
                Define retention periods and archival policies for log types
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Log Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select log type" />
                  </SelectTrigger>
                  <SelectContent>
                    {logTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          {type.icon}
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Retention Period</Label>
                  <Input type="number" placeholder="7" />
                </div>
                <div className="grid gap-2">
                  <Label>Unit</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Years" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="days">Days</SelectItem>
                      <SelectItem value="months">Months</SelectItem>
                      <SelectItem value="years">Years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Regulation Mapping (optional)</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select regulation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GDPR">GDPR (EU)</SelectItem>
                    <SelectItem value="DPDP">DPDP (India)</SelectItem>
                    <SelectItem value="CCPA">CCPA (California)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Auto-Archive</p>
                    <p className="text-sm text-muted-foreground">Move to cold storage after retention period</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Auto-Delete</p>
                    <p className="text-sm text-muted-foreground">Permanently delete after retention period</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Enable Data Masking</p>
                    <p className="text-sm text-muted-foreground">Mask PII fields in archived logs</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button
                onClick={() => {
                  const newRule: LogRetentionRule = {
                    id: `ret-${Date.now()}`,
                    logType: "audit",
                    retentionPeriod: 5,
                    retentionUnit: "years",
                    regulation: "GDPR",
                    autoArchive: true,
                    autoDelete: false,
                    legalHoldOverride: false,
                    maskingEnabled: true,
                    maskingFields: ["email"],
                    status: "active",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                  };
                  setRules((prev) => [newRule, ...prev]);
                  setIsCreateOpen(false);
                  toast({
                    title: "Retention Rule Created",
                    description: "New log retention policy added.",
                  });
                }}
              >
                Create Rule
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Retention Rules Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Log Type</TableHead>
              <TableHead>Retention</TableHead>
              <TableHead>Regulation</TableHead>
              <TableHead>Archive</TableHead>
              <TableHead>Delete</TableHead>
              <TableHead>Masking</TableHead>
              <TableHead>Legal Hold</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rules.map(rule => {
              const logType = logTypes.find(t => t.value === rule.logType);
              return (
                <TableRow key={rule.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {logType?.icon}
                      <span className="font-medium">{logType?.label}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {getRetentionDisplay(rule.retentionPeriod, rule.retentionUnit)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {rule.regulation ? (
                      <Badge variant="outline">{rule.regulation}</Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {rule.autoArchive ? (
                      <Archive className="h-4 w-4 text-success" />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {rule.autoDelete ? (
                      <Trash2 className="h-4 w-4 text-destructive" />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {rule.maskingEnabled ? (
                      <Badge variant="secondary" className="text-xs">
                        {rule.maskingFields.length} fields
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {rule.legalHoldOverride ? (
                      <Badge className="bg-warning/10 text-warning border-warning/20">Active</Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(rule.status)}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toast({ title: "Rule Settings", description: `Opening retention settings for ${logType?.label}.` })}
                  >
                    <Settings2 className="h-4 w-4" />
                  </Button>
                </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {/* Compliance Note */}
      <Card className="border-primary/50 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium">Regulatory Compliance</p>
              <p className="text-sm text-muted-foreground">
                GDPR requires retention of consent records for the duration of consent validity plus potential dispute period. 
                DPDP requires retention of personal data only for the purpose it was collected. Review your retention 
                policies regularly to ensure compliance.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
