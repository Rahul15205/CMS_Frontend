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
  ArrowUpRight,
  Plus,
  AlertTriangle,
  Settings2,
  Play,
  Zap,
  Users,
  Lock,
  Bell,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { EscalationRule, EscalationTrigger, EscalationAction, LifecycleStatus } from "./types";
import { useToast } from "@/hooks/use-toast";

const mockEscalationRules: EscalationRule[] = [
  {
    id: "1",
    name: "SLA Breach - Rights Request",
    triggerCondition: "sla-breach",
    triggerThreshold: 0,
    escalationLevel: "L1",
    recipientRole: "DPO",
    action: "notify",
    maxLevels: 3,
    autoCloseOnResolution: true,
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    name: "High Risk Score Escalation",
    triggerCondition: "risk-score",
    triggerThreshold: 80,
    escalationLevel: "L2",
    recipientRole: "Security Team",
    action: "reassign",
    maxLevels: 2,
    autoCloseOnResolution: true,
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    name: "Manual Escalation - Grievance",
    triggerCondition: "manual-flag",
    escalationLevel: "L1",
    recipientRole: "Manager",
    action: "notify",
    maxLevels: 3,
    autoCloseOnResolution: false,
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "4",
    name: "Critical Priority Auto-Lock",
    triggerCondition: "sla-breach",
    triggerThreshold: 0,
    escalationLevel: "L3",
    recipientRole: "Legal",
    action: "lock-case",
    maxLevels: 1,
    autoCloseOnResolution: false,
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const triggers: { value: EscalationTrigger; label: string; icon: React.ReactNode }[] = [
  { value: "sla-breach", label: "SLA Breach", icon: <AlertTriangle className="h-4 w-4" /> },
  { value: "manual-flag", label: "Manual Flag", icon: <Bell className="h-4 w-4" /> },
  { value: "risk-score", label: "Risk Score Threshold", icon: <Zap className="h-4 w-4" /> },
  { value: "priority-change", label: "Priority Change", icon: <ArrowUpRight className="h-4 w-4" /> },
];

const actions: { value: EscalationAction; label: string; icon: React.ReactNode }[] = [
  { value: "notify", label: "Notify", icon: <Bell className="h-4 w-4" /> },
  { value: "reassign", label: "Reassign", icon: <Users className="h-4 w-4" /> },
  { value: "lock-case", label: "Lock Case", icon: <Lock className="h-4 w-4" /> },
  { value: "escalate-external", label: "Escalate External", icon: <ArrowUpRight className="h-4 w-4" /> },
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

const getLevelBadge = (level: string) => {
  switch (level) {
    case "L1":
      return <Badge variant="outline" className="bg-primary/5">L1</Badge>;
    case "L2":
      return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">L2</Badge>;
    case "L3":
      return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">L3</Badge>;
    default:
      return <Badge variant="outline">{level}</Badge>;
  }
};

export function EscalationRules() {
  const [rules, setRules] = useState<EscalationRule[]>(mockEscalationRules);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { toast } = useToast();

  const activeRules = rules.filter(r => r.status === "active").length;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rules.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{activeRules}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Triggers Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">12</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Auto-Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Escalation Rules</h3>
          <p className="text-sm text-muted-foreground">
            Configure automated and manual escalation for Rights and Grievances
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast({ title: "Simulation Started", description: "Escalation simulation triggered for active rules." })}>
            <Play className="h-4 w-4 mr-2" />
            Simulate Escalation
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Rule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Escalation Rule</DialogTitle>
                <DialogDescription>
                  Define triggers, actions, and recipients for automated escalation
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Rule Name</Label>
                  <Input id="name" placeholder="e.g., SLA Breach - Rights Request" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Trigger Condition</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select trigger" />
                      </SelectTrigger>
                      <SelectContent>
                        {triggers.map(trigger => (
                          <SelectItem key={trigger.value} value={trigger.value}>
                            <div className="flex items-center gap-2">
                              {trigger.icon}
                              {trigger.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Threshold (if applicable)</Label>
                    <Input type="number" placeholder="e.g., 80 for risk score" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Escalation Level</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="L1">L1 - First Level</SelectItem>
                        <SelectItem value="L2">L2 - Second Level</SelectItem>
                        <SelectItem value="L3">L3 - Executive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Recipient Role</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dpo">DPO</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="security">Security Team</SelectItem>
                        <SelectItem value="legal">Legal</SelectItem>
                        <SelectItem value="executive">Executive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Escalation Action</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select action" />
                    </SelectTrigger>
                    <SelectContent>
                      {actions.map(action => (
                        <SelectItem key={action.value} value={action.value}>
                          <div className="flex items-center gap-2">
                            {action.icon}
                            {action.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Max Escalation Levels</Label>
                    <Input type="number" placeholder="3" />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Auto-Close on Resolution</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button
                  onClick={() => {
                    const newRule: EscalationRule = {
                      id: `esc-${Date.now()}`,
                      name: `Escalation Rule ${rules.length + 1}`,
                      triggerCondition: "sla-breach",
                      triggerThreshold: 0,
                      escalationLevel: "L1",
                      recipientRole: "DPO",
                      action: "notify",
                      maxLevels: 3,
                      autoCloseOnResolution: true,
                      status: "active",
                      createdAt: new Date(),
                      updatedAt: new Date(),
                    };
                    setRules((prev) => [newRule, ...prev]);
                    setIsCreateOpen(false);
                    toast({
                      title: "Escalation Rule Created",
                      description: `${newRule.name} is now active.`,
                    });
                  }}
                >
                  Create Rule
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Flow Chart Style Rules */}
      <div className="grid gap-4">
        {rules.map(rule => (
          <Card key={rule.id} className={rule.status === "disabled" ? "opacity-60" : ""}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h4 className="font-semibold">{rule.name}</h4>
                  {getStatusBadge(rule.status)}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Configure"
                    onClick={() => toast({ title: "Configure Rule", description: `Opening ${rule.name} configuration.` })}
                  >
                    <Settings2 className="h-4 w-4" />
                  </Button>
                  <Switch
                    checked={rule.status === "active"}
                    onCheckedChange={() => {
                      setRules((prev) =>
                        prev.map((item) =>
                          item.id === rule.id
                            ? { ...item, status: item.status === "active" ? "disabled" : "active", updatedAt: new Date() }
                            : item
                        )
                      );
                    }}
                  />
                </div>
              </div>
              
              {/* Flow Visualization */}
              <div className="flex items-center gap-2 p-4 bg-muted/30 rounded-lg overflow-x-auto">
                {/* Trigger */}
                <div className="flex items-center gap-2 px-3 py-2 bg-background border rounded-lg min-w-fit">
                  {triggers.find(t => t.value === rule.triggerCondition)?.icon}
                  <span className="text-sm font-medium">
                    {triggers.find(t => t.value === rule.triggerCondition)?.label}
                  </span>
                  {rule.triggerThreshold !== undefined && rule.triggerThreshold > 0 && (
                    <Badge variant="secondary" className="ml-1">≥{rule.triggerThreshold}</Badge>
                  )}
                </div>
                
                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                
                {/* Level */}
                <div className="flex items-center gap-2 px-3 py-2 bg-background border rounded-lg min-w-fit">
                  <ArrowUpRight className="h-4 w-4" />
                  {getLevelBadge(rule.escalationLevel)}
                </div>
                
                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                
                {/* Recipient */}
                <div className="flex items-center gap-2 px-3 py-2 bg-background border rounded-lg min-w-fit">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">{rule.recipientRole}</span>
                </div>
                
                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                
                {/* Action */}
                <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 border border-primary/20 rounded-lg min-w-fit">
                  {actions.find(a => a.value === rule.action)?.icon}
                  <span className="text-sm font-medium text-primary">
                    {actions.find(a => a.value === rule.action)?.label}
                  </span>
                </div>
              </div>
              
              <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                <span>Max levels: {rule.maxLevels}</span>
                {rule.autoCloseOnResolution && (
                  <span className="flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    Auto-close enabled
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
