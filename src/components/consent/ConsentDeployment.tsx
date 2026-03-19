import { useEffect, useState, useMemo } from "react";
import {
  Rocket,
  Search,
  Filter,
  Calendar,
  Clock,
  Globe,
  Users,
  CheckCircle,
  RotateCcw,
  User,
  Play,
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { consentService } from "@/services/consentService";
import type { 
  ConsentTemplate, 
  ConsentDeployment as ConsentDeploymentType, 
  DeploymentLog 
} from "@/components/consent/types";

// --- Constants and Helpers ---
const getStatusBadge = (status: ConsentDeploymentType["status"]) => {
  switch (status) {
    case "deployed":
      return <Badge className="bg-success/10 text-success border-success/20">Deployed</Badge>;
    case "pending":
      return <Badge className="bg-warning/10 text-warning border-warning/20">Pending</Badge>;
    case "failed":
      return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Failed</Badge>;
    case "rolled-back":
      return <Badge variant="secondary">Rolled Back</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

interface DeploymentConfigFormProps {
  initialData?: Partial<ConsentDeploymentType>;
  templates: ConsentTemplate[];
  applications: any[];
  onDeploy: (config: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

function DeploymentConfigForm({ initialData, templates, applications, onDeploy, onCancel, isLoading }: DeploymentConfigFormProps) {
  const [config, setConfig] = useState({
    templateId: initialData?.templateId || templates[0]?.id || "",
    applicationId: initialData?.applicationId || applications[0]?.id || "",
    deploymentMode: initialData?.deploymentMode || "manual",
    activationDate: initialData?.activationDate || "",
    region: initialData?.region || "India",
    platform: Array.isArray(initialData?.platform) 
      ? initialData?.platform 
      : (initialData?.platform as any)?.split?.(", ") || ["Web"],
    userSegment: initialData?.userSegment || "All Users",
    approvalRequired: initialData?.approvalRequired ?? true,
    rollbackAllowed: initialData?.rollbackAllowed ?? true,
    lockAfterActivation: initialData?.lockAfterActivation ?? false,
  });

  const selectedTemplate = templates.find((template) => template.id === config.templateId);

  return (
    <div className="space-y-6 py-2">
      <div className="grid gap-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <Label htmlFor="templateId" className="text-sm font-semibold">Consent Template</Label>
            <Select
              value={config.templateId}
              onValueChange={(value) => setConfig({ ...config, templateId: value })}
            >
              <SelectTrigger id="templateId">
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name} (v{template.version})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label htmlFor="applicationId" className="text-sm font-semibold">Target Application</Label>
            <Select
              value={config.applicationId}
              onValueChange={(value) => setConfig({ ...config, applicationId: value })}
            >
              <SelectTrigger id="applicationId">
                <SelectValue placeholder="Select application" />
              </SelectTrigger>
              <SelectContent>
                {applications.map((app) => (
                  <SelectItem key={app.id} value={app.id}>
                    {app.name}
                  </SelectItem>
                ))}
                {applications.length === 0 && (
                  <SelectItem value="none" disabled>No applications found</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <Label className="text-sm font-semibold">Deployment Strategy</Label>
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant={config.deploymentMode === "manual" ? "default" : "outline"}
              className="h-auto p-4 flex flex-col items-start gap-1"
              onClick={() => setConfig({ ...config, deploymentMode: "manual" })}
            >
              <div className="flex items-center gap-2">
                <Play className="h-4 w-4" />
                <span className="font-semibold">Manual</span>
              </div>
              <span className="text-xs opacity-70">Deploy immediately</span>
            </Button>
            <Button
              variant={config.deploymentMode === "scheduled" ? "default" : "outline"}
              className="h-auto p-4 flex flex-col items-start gap-1"
              onClick={() => setConfig({ ...config, deploymentMode: "scheduled" })}
            >
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="font-semibold">Scheduled</span>
              </div>
              <span className="text-xs opacity-70">Set activation time</span>
            </Button>
          </div>
          {config.deploymentMode === "scheduled" && (
            <div className="space-y-2">
              <Label htmlFor="activationDate" className="text-xs">Activation Date</Label>
              <Input
                id="activationDate"
                type="datetime-local"
                value={config.activationDate}
                onChange={(e) => setConfig({ ...config, activationDate: e.target.value })}
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs font-medium">Region</Label>
            <Select
              value={config.region}
              onValueChange={(v) => setConfig({ ...config, region: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Regions">All Regions</SelectItem>
                <SelectItem value="India">India</SelectItem>
                <SelectItem value="United States">United States</SelectItem>
                <SelectItem value="European Union">European Union</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium">Platform</Label>
            <Select
              value={config.platform.join(", ")}
              onValueChange={(v) => setConfig({ ...config, platform: v.split(", ") })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Web">Web</SelectItem>
                <SelectItem value="Mobile">Mobile</SelectItem>
                <SelectItem value="Web, Mobile">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3 p-4 border rounded-lg bg-muted/20">
          <div className="flex items-center justify-between">
            <Label htmlFor="approvalRequired" className="text-sm">Require Approval</Label>
            <Switch
              id="approvalRequired"
              checked={config.approvalRequired}
              onCheckedChange={(v) => setConfig({ ...config, approvalRequired: v })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="rollbackAllowed" className="text-sm">Enable Rollback</Label>
            <Switch
              id="rollbackAllowed"
              checked={config.rollbackAllowed}
              onCheckedChange={(v) => setConfig({ ...config, rollbackAllowed: v })}
            />
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>Cancel</Button>
        <Button
          onClick={() => onDeploy(config)}
          disabled={!config.templateId || isLoading}
        >
          {isLoading && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? "Update" : "Deploy"}
        </Button>
      </DialogFooter>
    </div>
  );
}

interface ConsentDeploymentProps {
  templates: ConsentTemplate[];
}

export function ConsentDeployment({ templates }: ConsentDeploymentProps) {
  const [activeTab, setActiveTab] = useState("deployments");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [showRollbackDialog, setShowRollbackDialog] = useState<string | null>(null);
  const [showArchiveDialog, setShowArchiveDialog] = useState<string | null>(null);
  const [editingDeployment, setEditingDeployment] = useState<ConsentDeploymentType | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Queries
  const { data: deploymentsData, isLoading: isDeploymentsLoading } = useQuery({
    queryKey: ['consent-deployments'],
    queryFn: () => consentService.getDeployments(),
  });

  const { data: appsData } = useQuery({
    queryKey: ['applications-list'],
    queryFn: () => consentService.getApplications({ limit: 100 }),
  });

  const { data: logsData, isLoading: isLogsLoading } = useQuery({
    queryKey: ['deployment-logs'],
    queryFn: async () => {
      // For demo, we might not have a specific ID, so we fetch logs for recent activity
      const allDeploys = deploymentsData?.data || [];
      if (allDeploys.length > 0) {
        const first = allDeploys[0];
        const res = await consentService.getDeploymentLogs(first.id);
        return res;
      }
      return [];
    },
    enabled: activeTab === 'logs' && !!deploymentsData
  });

  const deployments = deploymentsData?.data || [];

  // Mutations
  const deployMutation = useMutation({
    mutationFn: (config: any) => {
      const selected = templates.find(t => t.id === config.templateId);
      
      if (!selected?.latestVersionId) {
        throw new Error("This template has no published versions. Please publish a version before deploying.");
      }

      const payload = {
        ...config,
        templateName: selected.name,
        versionId: selected.latestVersionId,
        isActive: true,
      };
      
      if (editingDeployment) {
        // ... update logic
      }
      return consentService.createDeployment(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consent-deployments'] });
      toast({ title: "Success", description: "Deployment rollout successful." });
      setShowConfigDialog(false);
      setEditingDeployment(null);
    },
    onError: (err: any) => {
      toast({ 
        title: "Deployment Failed", 
        description: err.response?.data?.message?.[0] || err.message || "An unexpected error occurred.", 
        variant: "destructive" 
      });
    }
  });

  const rollbackMutation = useMutation({
    mutationFn: (id: string) => consentService.rollbackDeployment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consent-deployments'] });
      toast({ title: "Rollback Complete" });
      setShowRollbackDialog(null);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });

  const filteredDeployments = useMemo(() => {
    return deployments.filter((d) => {
      const matchesSearch = d.templateName?.toLowerCase().includes(searchQuery.toLowerCase()) || d.region?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || d.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [deployments, searchQuery, statusFilter]);

  if (isDeploymentsLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading deployments...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Active", value: deployments.filter(d => d.status === "deployed").length, icon: CheckCircle, color: "text-success" },
          { label: "Pending", value: deployments.filter(d => d.status === "pending").length, icon: Clock, color: "text-warning" },
          { label: "Users", value: deployments.reduce((acc, d) => acc + (d.affectedUsers || 0), 0), icon: Users, color: "text-info" },
          { label: "Rollbacks", value: deployments.filter(d => d.status === "rolled-back").length, icon: RotateCcw, color: "text-destructive" },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="pt-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-muted/50 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="deployments">Deployments</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>
          <Button onClick={() => setShowConfigDialog(true)}>
            <Rocket className="h-4 w-4 mr-2" /> New Deployment
          </Button>
        </div>

        <TabsContent value="deployments">
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="deployed">Deployed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rolled-back">Rolled Back</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-lg bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Template</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDeployments.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No deployments found</TableCell></TableRow>
                ) : (
                  filteredDeployments.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">{d.templateName}</TableCell>
                      <TableCell>v{d.versionNumber || '1.0'}</TableCell>
                      <TableCell>{getStatusBadge(d.status)}</TableCell>
                      <TableCell>{d.region}</TableCell>
                      <TableCell>{d.affectedUsers?.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => setShowRollbackDialog(d.id)}><RotateCcw className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => { setEditingDeployment(d); setShowConfigDialog(true); }}><Pencil className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="logs">
          <div className="border rounded-lg bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Performed By</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLogsLoading ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8">Loading logs...</TableCell></TableRow>
                ) : (logsData || []).map((log: DeploymentLog) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</TableCell>
                    <TableCell className="font-medium">{log.action}</TableCell>
                    <TableCell>{log.performedBy}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{log.details}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingDeployment ? "Edit Deployment" : "New Deployment"}</DialogTitle>
            <DialogDescription>Configure parameters for your consent rollout.</DialogDescription>
          </DialogHeader>
          <DeploymentConfigForm
            templates={templates}
            applications={appsData?.data || []}
            initialData={editingDeployment || undefined}
            onDeploy={deployMutation.mutate}
            onCancel={() => setShowConfigDialog(false)}
            isLoading={deployMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!showRollbackDialog} onOpenChange={() => setShowRollbackDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Rollback</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to revert this deployment?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => showRollbackDialog && rollbackMutation.mutate(showRollbackDialog)}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
