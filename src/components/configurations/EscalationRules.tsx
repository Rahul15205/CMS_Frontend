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
  Loader2,
  Workflow,
  ShieldAlert,
  CheckCircle2
} from "lucide-react";
import { EscalationRule, EscalationTrigger, EscalationAction, LifecycleStatus } from "./types";
import { useToast } from "@/hooks/use-toast";
import { escalationRulesService } from "@/services/configurationsService";
import { Skeleton } from "@/components/ui/skeleton";

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
      return <Badge className="bg-success/10 text-success border-success/20 font-bold px-2 py-0.5 text-[10px] uppercase">Active</Badge>;
    case "draft":
      return <Badge variant="secondary" className="font-bold px-2 py-0.5 text-[10px] uppercase">Draft</Badge>;
    default:
      return <Badge variant="outline" className="font-bold px-2 py-0.5 text-[10px] uppercase">{status}</Badge>;
  }
};

const getLevelBadge = (level: string) => {
  switch (level) {
    case "L1":
      return <Badge variant="outline" className="bg-primary/5 font-black">L1</Badge>;
    case "L2":
      return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 font-black">L2</Badge>;
    case "L3":
      return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 font-black">L3</Badge>;
    default:
      return <Badge variant="outline" className="font-black">{level}</Badge>;
  }
};

export function EscalationRules() {
  const [rules, setRules] = useState<EscalationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  const fetchRules = useCallback(async () => {
    setLoading(true);
    try {
      const data = await escalationRulesService.getAll();
      setRules(Array.isArray(data) ? data : []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load escalation rules.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const toggleRuleStatus = async (ruleId: string) => {
    try {
      const rule = rules.find(r => r.id === ruleId);
      if (!rule) return;
      const newStatus: LifecycleStatus = rule.status === "active" ? "disabled" : "active";
      const updated = await escalationRulesService.update(ruleId, { ...rule, status: newStatus });
      setRules(prev => prev.map(r => r.id === ruleId ? updated : r));
      toast({
        title: `Protocol ${newStatus === "active" ? "Activated" : "Deactivated"}`,
        description: `${rule.name} state changed.`
      });
    } catch (error) {
       toast({ title: "Error", description: "Operation failed.", variant: "destructive" });
    }
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      const newRule: Partial<EscalationRule> = {
        name: `Escalation Logic ${rules.length + 1}`,
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
      const created = await escalationRulesService.create(newRule as EscalationRule);
      setRules(prev => [created, ...prev]);
      setIsCreateOpen(false);
      toast({ title: "Escalation Established", description: "Rule integrated into routing engine." });
    } catch (error) {
        toast({ title: "Error", description: "Failed to publish rule.", variant: "destructive" });
    } finally {
        setCreating(false);
    }
  };

  const activeRules = rules.filter(r => r.status === "active").length;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
            { title: "Escalation Rules", value: loading ? "..." : rules.length, icon: Workflow, color: "text-foreground" },
            { title: "Live Protocols", value: loading ? "..." : activeRules, icon: ShieldAlert, color: "text-success" },
            { title: "Escalations Today", value: "14", icon: ArrowUpRight, color: "text-warning" },
            { title: "Avg Level", value: "L2.1", icon: Users, color: "text-primary" }
        ].map((stat, i) => (
            <Card key={i} className="border-0 shadow-sm bg-card/60 backdrop-blur-sm group hover:shadow-md transition-all duration-300">
                <CardHeader className="pb-1.5 pt-4 px-4">
                    <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] flex items-center gap-2">
                        <stat.icon className="h-3 w-3" />
                        {stat.title}
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                    <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
                </CardContent>
            </Card>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-foreground">Escalation Engine</h3>
          <p className="text-sm text-muted-foreground">
            Orchestrate automated case routing and prioritization thresholds.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" className="hover:bg-primary/5 text-primary font-bold text-xs uppercase tracking-widest" onClick={() => toast({ title: "Router Simulation", description: "Executing trace on active escalation nodes..." })}>
            <Play className="h-3 w-3 mr-2" />
            Dry Run
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="shadow-lg shadow-primary/20 bg-primary font-bold">
                <Plus className="h-4 w-4 mr-2" />
                Define Rule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-card">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black">Escalation Protocol Builder</DialogTitle>
                <DialogDescription>
                  Configure triggers, thresholds, and cross-functional routing levels.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest">Logic Identifier</Label>
                  <Input id="name" placeholder="e.g., High-Risk Consent Breach" className="bg-background/50 border-border/50" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest">Detection Trigger</Label>
                    <Select defaultValue="sla-breach">
                      <SelectTrigger className="bg-background/50 border-border/50">
                        <SelectValue />
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
                    <Label className="text-[10px] font-bold uppercase tracking-widest">Signal Threshold</Label>
                    <Input type="number" placeholder="e.g., 80 for risk index" className="bg-background/50 border-border/50" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest">Escalation Depth</Label>
                    <Select defaultValue="L1">
                      <SelectTrigger className="bg-background/50 border-border/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="L1">L1 - Departmental Supervisor</SelectItem>
                        <SelectItem value="L2">L2 - Data Protection Officer</SelectItem>
                        <SelectItem value="L3">L3 - Executive Compliance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest">Target Authority</Label>
                    <Select defaultValue="dpo">
                      <SelectTrigger className="bg-background/50 border-border/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dpo">Office of DPO</SelectItem>
                        <SelectItem value="manager">Ops Manager</SelectItem>
                        <SelectItem value="security">SOC / Security</SelectItem>
                        <SelectItem value="legal">General Counsel</SelectItem>
                        <SelectItem value="executive">Board / CEO</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest">Response Protocol</Label>
                  <Select defaultValue="notify">
                    <SelectTrigger className="bg-background/50 border-border/50">
                      <SelectValue />
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest">Max Propagation</Label>
                    <Input type="number" defaultValue="3" className="bg-background/50 border-border/50" />
                  </div>
                  <div className="flex items-center justify-between p-4 border border-border/40 rounded-2xl bg-muted/20">
                    <div>
                      <p className="text-xs font-bold text-foreground">Auto-Heal</p>
                      <p className="text-[9px] text-muted-foreground mt-0.5">Close escalation on resolution.</p>
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
                  className="min-w-[140px]"
                >
                  {creating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ShieldAlert className="h-4 w-4 mr-2" />}
                  Deploy Engine
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Flow-Visual Rules */}
      <div className="grid gap-5">
        {loading ? (
            Array(3).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-40 w-full rounded-3xl" />
            ))
        ) : (
            rules.map(rule => (
            <Card key={rule.id} className={`border-border/40 shadow-sm bg-card/60 backdrop-blur-sm overflow-hidden group hover:border-primary/40 transition-all ${rule.status === "disabled" ? "opacity-40 grayscale" : ""}`}>
                <CardContent className="p-0">
                <div className="p-4 md:p-6 pb-2">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                                <Workflow className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="font-black text-base text-foreground group-hover:text-primary transition-colors">{rule.name}</h4>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Protocol Node {rule.id.toUpperCase()}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {getStatusBadge(rule.status)}
                            <Switch
                                checked={rule.status === "active"}
                                onCheckedChange={() => toggleRuleStatus(rule.id)}
                                className="scale-90"
                            />
                        </div>
                    </div>
                    
                    {/* Routing Visualization */}
                    <div className="relative flex items-center justify-between gap-2 p-5 bg-background/40 border border-border/40 rounded-2xl mb-6 shadow-inner overflow-x-auto no-scrollbar">
                        {/* Phase 1: Signal */}
                        <div className="flex flex-col items-center gap-2 min-w-[100px]">
                            <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                                {triggers.find(t => t.value === rule.triggerCondition)?.icon || <Zap className="h-4 w-4" />}
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-tight text-center">
                                {triggers.find(t => t.value === rule.triggerCondition)?.label}
                            </span>
                            {rule.triggerThreshold !== undefined && rule.triggerThreshold > 0 && (
                                <Badge variant="outline" className="text-[8px] h-4 py-0 border-primary/30 text-primary">≥{rule.triggerThreshold}</Badge>
                            )}
                        </div>
                        
                        <div className="flex-1 flex justify-center">
                            <ArrowRight className="h-4 w-4 text-muted-foreground/30" />
                        </div>
                        
                        {/* Phase 2: Tier */}
                        <div className="flex flex-col items-center gap-2 min-w-[100px]">
                            <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                                <ArrowUpRight className="h-4 w-4" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-tight">Audit Level</span>
                            {getLevelBadge(rule.escalationLevel)}
                        </div>
                        
                        <div className="flex-1 flex justify-center">
                            <ArrowRight className="h-4 w-4 text-muted-foreground/30" />
                        </div>
                        
                        {/* Phase 3: Authority */}
                        <div className="flex flex-col items-center gap-2 min-w-[100px]">
                            <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                                <Users className="h-4 w-4" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-tight">Recipient</span>
                            <span className="text-[11px] font-bold text-foreground">{rule.recipientRole}</span>
                        </div>
                        
                        <div className="flex-1 flex justify-center">
                            <ArrowRight className="h-4 w-4 text-muted-foreground/30" />
                        </div>
                        
                        {/* Phase 4: Resolution */}
                        <div className="flex flex-col items-center gap-2 min-w-[100px]">
                            <div className="p-2 rounded-lg bg-primary/20 text-primary">
                                {actions.find(a => a.value === rule.action)?.icon || <Bell className="h-4 w-4" />}
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-tight text-primary">Action</span>
                            <span className="text-[11px] font-black text-primary">
                                {actions.find(a => a.value === rule.action)?.label}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-3 bg-muted/20 border-t border-border/40 flex items-center gap-6">
                    <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                        Max Steps: <span className="text-foreground">{rule.maxLevels}</span>
                    </div>
                    {rule.autoCloseOnResolution && (
                        <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-success">
                            <CheckCircle2 className="h-3 w-3" />
                            Self-Closing
                        </div>
                    )}
                    <div className="ml-auto flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary">
                            <Settings2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary">
                            <Play className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>
                </CardContent>
            </Card>
            ))
        )}
      </div>
    </div>
  );
}
