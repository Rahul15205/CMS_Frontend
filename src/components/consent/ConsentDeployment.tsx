import { useEffect, useState } from "react";
import {
  Rocket,
  Search,
  Filter,
  Calendar,
  Clock,
  Globe,
  Users,
  Server,
  CheckCircle,
  XCircle,
  AlertCircle,
  RotateCcw,
  Lock,
  User,
  Play,
  Pause,
  History,
  Settings,
  FileText,
  Pencil,
  Archive,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ConsentTemplate } from "./types";

interface DeploymentRecord {
  id: string;
  templateName: string;
  version: string;
  deploymentMode: "manual" | "scheduled";
  status: "deployed" | "pending" | "failed" | "rolled-back";
  activationDate: string;
  region: string;
  platform: string;
  userSegment: string;
  deployedBy: string;
  affectedUsers: number;
  approvalRequired: boolean;
  approvedBy: string | null;
  rollbackAllowed: boolean;
  lockedAfterActivation: boolean;
}

interface DeploymentLog {
  id: string;
  deploymentId: string;
  action: string;
  timestamp: string;
  performedBy: string;
  details: string;
  status: "success" | "failure";
}

// Mock deployment records
const mockDeployments: DeploymentRecord[] = [
  {
    id: "dep-001",
    templateName: "Marketing Communications Consent",
    version: "2.1",
    deploymentMode: "manual",
    status: "deployed",
    activationDate: "2024-01-21T00:00:00Z",
    region: "India",
    platform: "Web, Mobile",
    userSegment: "All Customers",
    deployedBy: "Admin User",
    affectedUsers: 12500,
    approvalRequired: true,
    approvedBy: "DPO",
    rollbackAllowed: true,
    lockedAfterActivation: true,
  },
  {
    id: "dep-002",
    templateName: "Data Analytics Processing",
    version: "1.0",
    deploymentMode: "scheduled",
    status: "pending",
    activationDate: "2024-02-01T00:00:00Z",
    region: "Global",
    platform: "Web",
    userSegment: "Premium Users",
    deployedBy: "DPO",
    affectedUsers: 3200,
    approvalRequired: true,
    approvedBy: null,
    rollbackAllowed: true,
    lockedAfterActivation: false,
  },
  {
    id: "dep-003",
    templateName: "Essential Service Consent",
    version: "3.0",
    deploymentMode: "manual",
    status: "deployed",
    activationDate: "2024-01-10T00:00:00Z",
    region: "India, UAE",
    platform: "Web, Mobile, API",
    userSegment: "All Users",
    deployedBy: "Admin User",
    affectedUsers: 45000,
    approvalRequired: true,
    approvedBy: "Legal Team Lead",
    rollbackAllowed: false,
    lockedAfterActivation: true,
  },
  {
    id: "dep-004",
    templateName: "Third-Party Data Sharing",
    version: "0.5",
    deploymentMode: "manual",
    status: "rolled-back",
    activationDate: "2024-01-05T00:00:00Z",
    region: "EU",
    platform: "Web",
    userSegment: "Enterprise",
    deployedBy: "Legal Team",
    affectedUsers: 800,
    approvalRequired: true,
    approvedBy: "DPO",
    rollbackAllowed: true,
    lockedAfterActivation: false,
  },
];

// Mock deployment logs
const mockLogs: DeploymentLog[] = [
  {
    id: "log-001",
    deploymentId: "dep-001",
    action: "Deployment Initiated",
    timestamp: "2024-01-20T10:00:00Z",
    performedBy: "Admin User",
    details: "Manual deployment initiated for Marketing Communications Consent v2.1",
    status: "success",
  },
  {
    id: "log-002",
    deploymentId: "dep-001",
    action: "Approval Granted",
    timestamp: "2024-01-20T11:30:00Z",
    performedBy: "DPO",
    details: "Deployment approved after compliance review",
    status: "success",
  },
  {
    id: "log-003",
    deploymentId: "dep-001",
    action: "Deployment Activated",
    timestamp: "2024-01-21T00:00:00Z",
    performedBy: "System",
    details: "Consent template activated for 12,500 users",
    status: "success",
  },
  {
    id: "log-004",
    deploymentId: "dep-004",
    action: "Rollback Executed",
    timestamp: "2024-01-06T14:00:00Z",
    performedBy: "DPO",
    details: "Deployment rolled back due to compliance issue",
    status: "success",
  },
];

const getStatusBadge = (status: DeploymentRecord["status"]) => {
  switch (status) {
    case "deployed":
      return <Badge className="bg-success/10 text-success border-success/20">Deployed</Badge>;
    case "pending":
      return <Badge className="bg-warning/10 text-warning border-warning/20">Pending</Badge>;
    case "failed":
      return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Failed</Badge>;
    case "rolled-back":
      return <Badge variant="secondary">Rolled Back</Badge>;
  }
};

interface DeploymentConfigFormProps {
  initialData?: DeploymentConfig;
  templates: ConsentTemplate[];
  onDeploy: (config: DeploymentConfig) => void;
  onCancel: () => void;
}

interface DeploymentConfig {
  templateId: string;
  deploymentMode: "manual" | "scheduled";
  activationDate: string;
  region: string;
  platform: string[];
  userSegment: string;
  approvalRequired: boolean;
  rollbackAllowed: boolean;
  rollbackConditions: string;
  lockAfterActivation: boolean;
}

function DeploymentConfigForm({ initialData, templates, onDeploy, onCancel }: DeploymentConfigFormProps) {
  const [config, setConfig] = useState<DeploymentConfig>(initialData || {
    templateId: templates[0]?.id || "",
    deploymentMode: "manual",
    activationDate: "",
    region: "India",
    platform: ["Web"],
    userSegment: "All Users",
    approvalRequired: true,
    rollbackAllowed: true,
    rollbackConditions: "",
    lockAfterActivation: false,
  });
  const selectedTemplate = templates.find((template) => template.id === config.templateId);

  useEffect(() => {
    if (!config.templateId && templates.length > 0) {
      setConfig((prev) => ({ ...prev, templateId: templates[0].id }));
    }
  }, [config.templateId, templates]);

  return (
    <div className="space-y-6 py-2">
      <div className="grid gap-6">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold tracking-tight text-foreground/90 flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Consent Template
          </h3>
          <div className="space-y-2">
            <Label htmlFor="templateId" className="text-sm">Select Template</Label>
            <Select
              value={config.templateId}
              onValueChange={(value) => setConfig({ ...config, templateId: value })}
            >
              <SelectTrigger id="templateId">
                <SelectValue placeholder="Select consent template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name} (v{template.version})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedTemplate && (
              <p className="text-xs text-muted-foreground">
                Status: {selectedTemplate.status} | Regulation: {selectedTemplate.regulations.join(", ")}
              </p>
            )}
          </div>
        </div>

        {/* Section: Deployment Strategy */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold tracking-tight text-foreground/90 flex items-center gap-2">
            <Rocket className="h-4 w-4 text-primary" />
            Deployment Strategy
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div
              onClick={() => setConfig({ ...config, deploymentMode: "manual" })}
              className={`cursor-pointer relative flex flex-col gap-2 rounded-xl border-2 p-4 transition-all hover:bg-muted/50 ${config.deploymentMode === "manual"
                ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                : "border-muted-foreground/20 hover:border-primary/50"
                }`}
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-primary/10 text-primary w-fit">
                  <Play className="h-4 w-4" />
                </div>
                {config.deploymentMode === "manual" && (
                  <div className="h-4 w-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    <CheckCircle className="h-3 w-3" />
                  </div>
                )}
              </div>
              <div>
                <span className="font-semibold block mb-0.5">Manual Activation</span>
                <span className="text-xs text-muted-foreground leading-tight block">
                  Deploy immediately upon approval. Best for hotfixes or immediate rollouts.
                </span>
              </div>
            </div>

            <div
              onClick={() => setConfig({ ...config, deploymentMode: "scheduled" })}
              className={`cursor-pointer relative flex flex-col gap-2 rounded-xl border-2 p-4 transition-all hover:bg-muted/50 ${config.deploymentMode === "scheduled"
                ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                : "border-muted-foreground/20 hover:border-primary/50"
                }`}
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-info/10 text-info w-fit">
                  <Calendar className="h-4 w-4" />
                </div>
                {config.deploymentMode === "scheduled" && (
                  <div className="h-4 w-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    <CheckCircle className="h-3 w-3" />
                  </div>
                )}
              </div>
              <div>
                <span className="font-semibold block mb-0.5">Scheduled Release</span>
                <span className="text-xs text-muted-foreground leading-tight block">
                  Automatically activate at a specific date & time window.
                </span>
              </div>
            </div>
          </div>

          {config.deploymentMode === "scheduled" && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <Label htmlFor="activationDate" className="text-xs font-medium text-muted-foreground">
                Activation Date & Time
              </Label>
              <div className="relative">
                <Input
                  id="activationDate"
                  type="datetime-local"
                  value={config.activationDate}
                  onChange={(e) => setConfig({ ...config, activationDate: e.target.value })}
                  className="pl-10 w-full sm:w-64"
                />
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          )}
        </div>

        <div className="h-px bg-border/50" />

        {/* Section: Deployment Scope */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold tracking-tight text-foreground/90 flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            Target Scope
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Region / Jurisdiction</Label>
              <Select
                value={config.region}
                onValueChange={(v) => setConfig({ ...config, region: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <SelectItem value="All Regions">All Regions</SelectItem>
                  <SelectItem value="India">India</SelectItem>
                  <SelectItem value="United States">United States</SelectItem>
                  <SelectItem value="European Union">European Union</SelectItem>
                  <SelectItem value="Australia">Australia</SelectItem>
                  <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                  <SelectItem value="Canada">Canada</SelectItem>
                  <SelectItem value="Singapore">Singapore</SelectItem>
                  <SelectItem value="United Arab Emirates">United Arab Emirates</SelectItem>
                  <SelectItem value="Saudi Arabia">Saudi Arabia</SelectItem>
                  <SelectItem value="China">China</SelectItem>
                  <SelectItem value="Japan">Japan</SelectItem>
                  <SelectItem value="South Korea">South Korea</SelectItem>
                  <SelectItem value="Brazil">Brazil</SelectItem>
                  <SelectItem value="Mexico">Mexico</SelectItem>
                  <SelectItem value="South Africa">South Africa</SelectItem>
                  <SelectItem value="Germany">Germany</SelectItem>
                  <SelectItem value="France">France</SelectItem>
                  <SelectItem value="Italy">Italy</SelectItem>
                  <SelectItem value="Spain">Spain</SelectItem>
                  <SelectItem value="Netherlands">Netherlands</SelectItem>
                  <SelectItem value="Sweden">Sweden</SelectItem>
                  <SelectItem value="Switzerland">Switzerland</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Application Platform</Label>
              <Select
                value={config.platform.join(", ")}
                onValueChange={(v) => setConfig({ ...config, platform: [v] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Web">Web Only</SelectItem>
                  <SelectItem value="Mobile">Mobile Only</SelectItem>
                  <SelectItem value="Web, Mobile">Web & Mobile</SelectItem>
                  <SelectItem value="Web, Mobile, API">All Platforms</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="h-px bg-border/50" />

        {/* Section: Enterprise Controls */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold tracking-tight text-foreground/90 flex items-center gap-2">
            <Settings className="h-4 w-4 text-primary" />
            Governance Controls
          </h3>
          <div className="grid grid-cols-1 gap-3 rounded-lg border bg-muted/20 p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="approvalRequired" className="text-sm font-medium">Require Approval</Label>
                <p className="text-xs text-muted-foreground">Force compliance review before activation</p>
              </div>
              <Switch
                id="approvalRequired"
                checked={config.approvalRequired}
                onCheckedChange={(checked) => setConfig({ ...config, approvalRequired: checked })}
              />
            </div>

            <div className="h-px bg-border/50" />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="rollbackAllowed" className="text-sm font-medium">Enable Rollback</Label>
                <p className="text-xs text-muted-foreground">Allow reverting to previous version</p>
              </div>
              <Switch
                id="rollbackAllowed"
                checked={config.rollbackAllowed}
                onCheckedChange={(checked) => setConfig({ ...config, rollbackAllowed: checked })}
              />
            </div>

            {config.rollbackAllowed && (
              <div className="mt-2 pl-4 border-l-2 border-muted">
                <Label htmlFor="rollbackConditions" className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Rollback Conditions (Optional)
                </Label>
                <Textarea
                  id="rollbackConditions"
                  placeholder="e.g., If error rate > 1%..."
                  value={config.rollbackConditions}
                  onChange={(e) => setConfig({ ...config, rollbackConditions: e.target.value })}
                  className="min-h-[60px] text-xs resize-none bg-background"
                />
              </div>
            )}

            <div className="h-px bg-border/50" />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="lockAfterActivation" className="text-sm font-medium">Lock on Activation</Label>
                <p className="text-xs text-muted-foreground">Prevent any changes once live</p>
              </div>
              <Switch
                id="lockAfterActivation"
                checked={config.lockAfterActivation}
                onCheckedChange={(checked) => setConfig({ ...config, lockAfterActivation: checked })}
              />
            </div>
          </div>
        </div>
      </div>

      <DialogFooter className="pt-2">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button
          onClick={() => onDeploy(config)}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          disabled={!config.templateId}
        >
          <Rocket className="h-4 w-4 mr-2" />
          {initialData ? "Update Deployment" : "Create Deployment"}
        </Button>
      </DialogFooter>
    </div>
  );
}

interface ConsentDeploymentProps {
  templates: ConsentTemplate[];
}

const DEPLOYMENTS_STORAGE_KEY = "cms_consent_deployments";

const getStoredDeployments = (): DeploymentRecord[] => {
  const stored = localStorage.getItem(DEPLOYMENTS_STORAGE_KEY);
  if (!stored) return mockDeployments;
  try {
    return JSON.parse(stored) as DeploymentRecord[];
  } catch {
    return mockDeployments;
  }
};

export function ConsentDeployment({ templates }: ConsentDeploymentProps) {
  const [activeTab, setActiveTab] = useState("deployments");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [showRollbackDialog, setShowRollbackDialog] = useState<string | null>(null);
  const [showArchiveDialog, setShowArchiveDialog] = useState<string | null>(null);
  const { toast } = useToast();

  const [deployments, setDeployments] = useState<DeploymentRecord[]>(() => getStoredDeployments());
  const [editingDeployment, setEditingDeployment] = useState<DeploymentRecord | null>(null);

  useEffect(() => {
    localStorage.setItem(DEPLOYMENTS_STORAGE_KEY, JSON.stringify(deployments));
  }, [deployments]);

  const filteredDeployments = deployments.filter((deployment) => {
    const matchesSearch =
      deployment.templateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deployment.region.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || deployment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDeploy = (config: DeploymentConfig) => {
    const selectedTemplate = templates.find((template) => template.id === config.templateId);
    if (!selectedTemplate) {
      toast({
        title: "Template Required",
        description: "Please select a valid consent template before deployment.",
        variant: "destructive",
      });
      return;
    }

    if (editingDeployment) {
      // Update existing
      setDeployments(deployments.map(d => d.id === editingDeployment.id ? {
        ...d,
        templateName: selectedTemplate.name,
        version: selectedTemplate.version,
        deploymentMode: config.deploymentMode,
        activationDate: config.activationDate || new Date().toISOString(), // Fallback if empty
        region: config.region,
        platform: config.platform.join(", "),
        userSegment: config.userSegment,
        approvalRequired: config.approvalRequired,
        rollbackAllowed: config.rollbackAllowed,
        lockedAfterActivation: config.lockAfterActivation,
      } as DeploymentRecord : d));

      toast({
        title: "Deployment Updated",
        description: "Deployment configuration has been updated successfully.",
      });
      setEditingDeployment(null);
    } else {
      // Create new (mock)
      const newDeployment: DeploymentRecord = {
        id: `dep-${Date.now()}`,
        templateName: selectedTemplate.name,
        version: selectedTemplate.version,
        deploymentMode: config.deploymentMode,
        status: "pending",
        activationDate: config.activationDate || new Date().toISOString(),
        region: config.region,
        platform: config.platform.join(", "),
        userSegment: config.userSegment,
        deployedBy: "Current User",
        affectedUsers: 0,
        approvalRequired: config.approvalRequired,
        approvedBy: null,
        rollbackAllowed: config.rollbackAllowed,
        lockedAfterActivation: config.lockAfterActivation,
      };
      setDeployments([newDeployment, ...deployments]);

      toast({
        title: "Deployment Created",
        description: "Your consent deployment has been queued for activation.",
      });
    }
    setShowConfigDialog(false);
  };

  const handleRollback = (deploymentId: string) => {
    toast({
      title: "Rollback Initiated",
      description: "The deployment is being rolled back to the previous version.",
    });
    // In a real app, we would update status here
    setDeployments(deployments.map(d => d.id === deploymentId ? { ...d, status: "rolled-back" as const } : d));
    setShowRollbackDialog(null);
  };

  const handleArchive = (id: string) => {
    // Determine new status or remove. For now, let's just remove from the list as "archived" usually implies moving to a different view.
    // Or we can just filter them out from the main list if we want to keep them.
    // The previous implementation used `archivedIds` to filter. Let's effectively "delete" them from this view.
    setDeployments(deployments.filter(d => d.id !== id));

    toast({
      title: "Deployment Archived",
      description: "The deployment has been moved to the archive.",
    });
    setShowArchiveDialog(null);
  };

  const handleEdit = (deployment: DeploymentRecord) => {
    setEditingDeployment(deployment);
    setShowConfigDialog(true);
  };

  const handleCreateNew = () => {
    if (!templates.length) {
      toast({
        title: "No Templates Available",
        description: "Create a consent template first, then create deployment.",
        variant: "destructive",
      });
      return;
    }
    setEditingDeployment(null);
    setShowConfigDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10 text-success">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {deployments.filter((d) => d.status === "deployed").length}
                </p>
                <p className="text-xs text-muted-foreground">Active Deployments</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10 text-warning">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {deployments.filter((d) => d.status === "pending").length}
                </p>
                <p className="text-xs text-muted-foreground">Pending Approval</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-info/10 text-info">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {deployments
                    .filter((d) => d.status === "deployed")
                    .reduce((acc, d) => acc + d.affectedUsers, 0)
                    .toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Users Covered</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
                <RotateCcw className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {deployments.filter((d) => d.status === "rolled-back").length}
                </p>
                <p className="text-xs text-muted-foreground">Rollbacks</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="deployments">Deployments</TabsTrigger>
          <TabsTrigger value="logs">Deployment Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="deployments" className="space-y-4 mt-4">
          {/* Filters */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex flex-1 items-center gap-3 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search deployments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="deployed">Deployed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="rolled-back">Rolled Back</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleCreateNew}>
              <Rocket className="h-4 w-4 mr-2" />
              New Deployment
            </Button>
          </div>

          {/* Deployments Table */}
          <div className="border rounded-lg overflow-auto bg-card">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Template</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Deployed By</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDeployments.map((deployment) => (
                  <TableRow key={deployment.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="font-medium">{deployment.templateName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">v{deployment.version}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {deployment.deploymentMode}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(deployment.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Globe className="h-3 w-3 text-muted-foreground" />
                        {deployment.region}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{deployment.platform}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{deployment.affectedUsers.toLocaleString()}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <User className="h-3 w-3 text-muted-foreground" />
                        {deployment.deployedBy}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            toast({ title: "Redeployment Initiated", description: "Process restarted." });
                          }}
                          title="Redeploy"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowArchiveDialog(deployment.id)}
                          title="Archive"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Archive className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          title="Edit"
                          onClick={() => handleEdit(deployment)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4 mt-4">
          {/* Deployment Logs */}
          <div className="border rounded-lg overflow-auto bg-card">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Performed By</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockLogs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{log.action}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <User className="h-3 w-3 text-muted-foreground" />
                        {log.performedBy}
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-muted-foreground max-w-[300px] truncate">
                        {log.details}
                      </p>
                    </TableCell>
                    <TableCell>
                      {log.status === "success" ? (
                        <Badge className="bg-success/10 text-success border-success/20">
                          Success
                        </Badge>
                      ) : (
                        <Badge className="bg-destructive/10 text-destructive border-destructive/20">
                          Failure
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* New/Edit Deployment Dialog */}
      <Dialog open={showConfigDialog} onOpenChange={(open) => {
        setShowConfigDialog(open);
        if (!open) setEditingDeployment(null);
      }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5" />
              {editingDeployment ? "Edit Deployment" : "Configure New Deployment"}
            </DialogTitle>
            <DialogDescription>
              {editingDeployment ? "Modify deployment parameters" : "Set up deployment parameters for consent template activation"}
            </DialogDescription>
          </DialogHeader>
          <DeploymentConfigForm
            key={editingDeployment ? editingDeployment.id : "new"} // Force re-render on switch
            initialData={editingDeployment ? {
              templateId: templates.find((template) => template.name === editingDeployment.templateName)?.id || templates[0]?.id || "",
              deploymentMode: editingDeployment.deploymentMode,
              activationDate: editingDeployment.activationDate,
              region: editingDeployment.region,
              platform: editingDeployment.platform.split(", "),
              userSegment: editingDeployment.userSegment,
              approvalRequired: editingDeployment.approvalRequired,
              rollbackAllowed: editingDeployment.rollbackAllowed,
              rollbackConditions: "", // Not in mock record
              lockAfterActivation: editingDeployment.lockedAfterActivation,
            } : undefined}
            templates={templates}
            onDeploy={handleDeploy}
            onCancel={() => setShowConfigDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Rollback Confirmation */}
      <AlertDialog open={!!showRollbackDialog} onOpenChange={() => setShowRollbackDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-warning" />
              Rollback Deployment?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will revert the consent template to the previous version. All affected users
              will see the previous version. This action will be logged for audit purposes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => showRollbackDialog && handleRollback(showRollbackDialog)}
              className="bg-warning text-warning-foreground hover:bg-warning/90"
            >
              Confirm Rollback
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Archive Confirmation */}
      <AlertDialog open={!!showArchiveDialog} onOpenChange={() => setShowArchiveDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Archive className="h-5 w-5 text-destructive" />
              Archive Deployment?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to archive this deployment? This action usually moves the deployment to an archived state and it will no longer be visible in the active list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => showArchiveDialog && handleArchive(showArchiveDialog)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
