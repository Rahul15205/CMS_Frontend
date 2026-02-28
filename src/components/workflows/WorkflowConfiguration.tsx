import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Workflow,
  Plus,
  Settings,
  Copy,
  Trash2,
  Play,
  Pause,
  ArrowRight,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle,
  Bell,
  GitBranch,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WorkflowStep {
  id: string;
  name: string;
  type: "action" | "approval" | "notification" | "condition";
  assignee?: string;
  slaHours?: number;
  escalationEnabled?: boolean;
  autoApprove?: boolean;
}

interface WorkflowConfig {
  id: string;
  name: string;
  description: string;
  type: "rights" | "grievance" | "consent" | "cookies" | "notice";
  enabled: boolean;
  isDefault: boolean;
  steps: WorkflowStep[];
  slaHours: number;
  escalationRules: string[];
  createdAt: string;
}

const defaultWorkflows: WorkflowConfig[] = [
  {
    id: "WF-001",
    name: "Standard Rights Request",
    description: "Default workflow for processing data principal rights requests",
    type: "rights",
    enabled: true,
    isDefault: true,
    steps: [
      { id: "1", name: "Request Received", type: "action" },
      { id: "2", name: "Acknowledged", type: "notification", slaHours: 24 },
      { id: "3", name: "Under Review", type: "action", assignee: "DPO Team", slaHours: 48 },
      { id: "4", name: "Action Taken", type: "approval", slaHours: 72 },
      { id: "5", name: "Closed", type: "notification" },
    ],
    slaHours: 720,
    escalationRules: ["Escalate to DPO after 24h", "Notify Legal after 48h"],
    createdAt: "2024-01-01",
  },
  {
    id: "WF-002",
    name: "Standard Grievance Workflow",
    description: "Default workflow for handling user grievances",
    type: "grievance",
    enabled: true,
    isDefault: true,
    steps: [
      { id: "1", name: "Grievance Submitted", type: "action" },
      { id: "2", name: "Assigned", type: "action", assignee: "Support Team" },
      { id: "3", name: "In Progress", type: "action", slaHours: 48 },
      { id: "4", name: "Awaiting Response", type: "notification" },
      { id: "5", name: "Resolved / Closed", type: "approval" },
    ],
    slaHours: 168,
    escalationRules: ["Escalate to Manager after 48h"],
    createdAt: "2024-01-01",
  },
  {
    id: "WF-003",
    name: "Fast-Track Deletion",
    description: "Expedited workflow for simple erasure requests",
    type: "rights",
    enabled: true,
    isDefault: false,
    steps: [
      { id: "1", name: "Request Received", type: "action" },
      { id: "2", name: "Auto-Verification", type: "condition", autoApprove: true },
      { id: "3", name: "Execute Deletion", type: "action", slaHours: 24 },
      { id: "4", name: "Confirmation Sent", type: "notification" },
    ],
    slaHours: 48,
    escalationRules: [],
    createdAt: "2024-01-10",
  },
  {
    id: "WF-004",
    name: "Multi-Level Escalation",
    description: "Complex grievance workflow with multiple approval gates",
    type: "grievance",
    enabled: false,
    isDefault: false,
    steps: [
      { id: "1", name: "Submitted", type: "action" },
      { id: "2", name: "L1 Review", type: "approval", assignee: "Support", slaHours: 24 },
      { id: "3", name: "L2 Review", type: "approval", assignee: "Manager", slaHours: 48 },
      { id: "4", name: "L3 Escalation", type: "approval", assignee: "DPO", slaHours: 72 },
      { id: "5", name: "Resolution", type: "action" },
      { id: "6", name: "Closed", type: "notification" },
    ],
    slaHours: 336,
    escalationRules: ["Auto-escalate between levels", "Notify regulator after L3"],
    createdAt: "2024-01-15",
  },
];

const getStepTypeColor = (type: string) => {
  switch (type) {
    case "action":
      return "bg-primary text-primary-foreground";
    case "approval":
      return "bg-warning text-warning-foreground";
    case "notification":
      return "bg-info text-info-foreground";
    case "condition":
      return "bg-secondary text-secondary-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export function WorkflowConfiguration({ isDialog = false }: { isDialog?: boolean }) {
  const [workflows, setWorkflows] = useState<WorkflowConfig[]>(defaultWorkflows);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { toast } = useToast();

  const toggleWorkflow = (id: string) => {
    setWorkflows((prev) =>
      prev.map((wf) => (wf.id === id ? { ...wf, enabled: !wf.enabled } : wf))
    );
  };

  const filteredWorkflows =
    selectedType === "all"
      ? workflows
      : workflows.filter((wf) => wf.type === selectedType);

  const handleCreateWorkflow = () => {
    const newWorkflow: WorkflowConfig = {
      id: `WF-${Date.now()}`,
      name: `Custom Workflow ${workflows.length + 1}`,
      description: "Custom workflow created from configuration dialog",
      type: "rights",
      enabled: true,
      isDefault: false,
      steps: [
        { id: "1", name: "Request Received", type: "action" },
        { id: "2", name: "Under Review", type: "approval", assignee: "DPO Team", slaHours: 48 },
        { id: "3", name: "Closure Notification", type: "notification" },
      ],
      slaHours: 720,
      escalationRules: ["Escalate after 24h"],
      createdAt: new Date().toISOString().split("T")[0],
    };
    setWorkflows((prev) => [newWorkflow, ...prev]);
    setShowCreateDialog(false);
    toast({
      title: "Workflow Created",
      description: `${newWorkflow.name} added successfully.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      {/* Header */}
      {!isDialog && (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Workflow Configuration</h2>
            <p className="text-sm text-muted-foreground">
              Configure custom workflows for Rights Management and Grievances
            </p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Workflow
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Custom Workflow</DialogTitle>
                <DialogDescription>
                  Define a new workflow with custom steps, approvals, and SLA rules
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Workflow Name</Label>
                    <Input placeholder="Enter workflow name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Workflow Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rights">Rights Management</SelectItem>
                        <SelectItem value="grievance">Grievance</SelectItem>
                        <SelectItem value="consent">Consent</SelectItem>
                        <SelectItem value="cookies">Cookies</SelectItem>
                        <SelectItem value="notice">Notice</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input placeholder="Brief description of the workflow" />
                </div>
                <div className="space-y-2">
                  <Label>Overall SLA (Hours)</Label>
                  <Input type="number" placeholder="720" />
                </div>
                <div className="border rounded-lg p-4 bg-muted/30">
                  <p className="text-sm text-muted-foreground text-center">
                    Workflow step builder will be available after creation
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateWorkflow}>Create Workflow</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Dialog Mode Action Button */}
      {isDialog && (
        <div className="flex justify-end mb-4">
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Create Workflow
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Custom Workflow</DialogTitle>
                <DialogDescription>
                  Define a new workflow with custom steps, approvals, and SLA rules
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Workflow Name</Label>
                    <Input placeholder="Enter workflow name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Workflow Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rights">Rights Management</SelectItem>
                        <SelectItem value="grievance">Grievance</SelectItem>
                        <SelectItem value="consent">Consent</SelectItem>
                        <SelectItem value="cookies">Cookies</SelectItem>
                        <SelectItem value="notice">Notice</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input placeholder="Brief description of the workflow" />
                </div>
                <div className="space-y-2">
                  <Label>Overall SLA (Hours)</Label>
                  <Input type="number" placeholder="720" />
                </div>
                <div className="border rounded-lg p-4 bg-muted/30">
                  <p className="text-sm text-muted-foreground text-center">
                    Workflow step builder will be available after creation
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateWorkflow}>Create Workflow</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Filter Tabs */}
      <Tabs value={selectedType} onValueChange={setSelectedType}>
        {/* Mobile Tab Selector */}
        <div className="sm:hidden mb-4">
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter workflows" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Workflows</SelectItem>
              <SelectItem value="rights">Rights Management</SelectItem>
              <SelectItem value="grievance">Grievances</SelectItem>
              <SelectItem value="consent">Consent</SelectItem>
              <SelectItem value="cookies">Cookies</SelectItem>
              <SelectItem value="notice">Notice</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsList className="hidden sm:grid w-full grid-cols-6 h-auto p-1 bg-muted/50">
          <TabsTrigger value="all">All Workflows</TabsTrigger>
          <TabsTrigger value="rights">Rights Management</TabsTrigger>
          <TabsTrigger value="grievance">Grievances</TabsTrigger>
          <TabsTrigger value="consent">Consent</TabsTrigger>
          <TabsTrigger value="cookies">Cookies</TabsTrigger>
          <TabsTrigger value="notice">Notice</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedType} className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredWorkflows.map((workflow) => (
              <Card
                key={workflow.id}
                className={`${workflow.enabled ? "border-success/30" : "border-muted"}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${workflow.enabled ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                          }`}
                      >
                        <Workflow className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base">{workflow.name}</CardTitle>
                          {workflow.isDefault && (
                            <Badge variant="secondary" className="text-xs">
                              Default
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="text-xs mt-0.5">
                          {workflow.description}
                        </CardDescription>
                      </div>
                    </div>
                    <Switch
                      checked={workflow.enabled}
                      onCheckedChange={() => toggleWorkflow(workflow.id)}
                      disabled={workflow.isDefault}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Workflow Steps Visual */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-4">
                    {workflow.steps.map((step, index) => (
                      <div key={step.id} className="flex items-center">
                        <div
                          className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${getStepTypeColor(
                            step.type
                          )}`}
                        >
                          {step.name}
                        </div>
                        {index < workflow.steps.length - 1 && (
                          <ArrowRight className="h-3 w-3 text-muted-foreground mx-1 flex-shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Workflow Stats */}
                  <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">SLA:</span>
                      <span className="font-medium">{workflow.slaHours}h</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <GitBranch className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Steps:</span>
                      <span className="font-medium">{workflow.steps.length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Escalations:</span>
                      <span className="font-medium">{workflow.escalationRules.length}</span>
                    </div>
                  </div>

                  {/* Type Badge */}
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="capitalize">
                      {workflow.type}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const cloned = {
                            ...workflow,
                            id: `WF-${Date.now()}`,
                            name: `${workflow.name} (Copy)`,
                            isDefault: false,
                            createdAt: new Date().toISOString().split("T")[0],
                          };
                          setWorkflows((prev) => [cloned, ...prev]);
                          toast({ title: "Workflow Cloned", description: `${workflow.name} duplicated.` });
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toast({ title: "Workflow Settings", description: `Open settings for ${workflow.name}.` })}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      {!workflow.isDefault && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => {
                            setWorkflows((prev) => prev.filter((item) => item.id !== workflow.id));
                            toast({ title: "Workflow Deleted", description: `${workflow.name} removed.` });
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredWorkflows.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Workflow className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No workflows found for this category.</p>
              <Button variant="outline" className="mt-4" onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Workflow
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
