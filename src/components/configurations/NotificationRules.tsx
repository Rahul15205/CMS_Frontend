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
  Bell,
  Plus,
  Mail,
  MessageSquare,
  Smartphone,
  Webhook,
  Play,
  Eye,
  Settings2,
  Archive,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Radio,
  Zap
} from "lucide-react";
import { NotificationRule, NotificationChannel, RecipientType, LifecycleStatus } from "./types";
import { useToast } from "@/hooks/use-toast";
import { notificationRulesService } from "@/services/configurationsService";
import { Skeleton } from "@/components/ui/skeleton";

const triggerEvents = [
  { value: "rights_request_created", label: "Rights Request Created" },
  { value: "rights_request_completed", label: "Rights Request Completed" },
  { value: "sla_breach_imminent", label: "SLA Breach Imminent" },
  { value: "sla_breach", label: "SLA Breach Occurred" },
  { value: "consent_collected", label: "Consent Collected" },
  { value: "consent_expiry_approaching", label: "Consent Expiry Approaching" },
  { value: "grievance_submitted", label: "Grievance Submitted" },
  { value: "grievance_escalated", label: "Grievance Escalated" },
  { value: "security_incident", label: "Security Incident" },
  { value: "data_breach", label: "Data Breach Detected" },
];

const getChannelIcon = (channel: NotificationChannel) => {
  switch (channel) {
    case "email": return <Mail className="h-4 w-4" />;
    case "sms": return <Smartphone className="h-4 w-4" />;
    case "in-app": return <MessageSquare className="h-4 w-4" />;
    case "webhook": return <Webhook className="h-4 w-4" />;
  }
};

const getStatusBadge = (status: LifecycleStatus) => {
  switch (status) {
    case "active":
      return <Badge className="bg-success/10 text-success border-success/20">Active</Badge>;
    case "draft":
      return <Badge variant="secondary">Draft</Badge>;
    case "disabled":
      return <Badge variant="outline" className="text-muted-foreground">Disabled</Badge>;
    case "archived":
      return <Badge variant="outline" className="text-muted-foreground">Archived</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export function NotificationRules() {
  const [rules, setRules] = useState<NotificationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  const fetchRules = useCallback(async () => {
    setLoading(true);
    try {
      const data = await notificationRulesService.getAll();
      setRules(Array.isArray(data) ? data : []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load notification rules.",
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
      const updated = await notificationRulesService.update(ruleId, { ...rule, status: newStatus });
      setRules(prev => prev.map(r => r.id === ruleId ? updated : r));
      toast({
        title: `Protocol ${newStatus === "active" ? "Online" : "Offline"}`,
        description: `${rule.name} status updated.`
      });
    } catch (error) {
       toast({ title: "Error", description: "Failed to toggle status.", variant: "destructive" });
    }
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      const newRule: Partial<NotificationRule> = {
        name: `Alert Protocol ${rules.length + 1}`,
        triggerEvent: "rights_request_created",
        channel: "email",
        recipientType: "admin",
        template: "standard-notify",
        language: "en",
        frequency: "immediate",
        retryEnabled: true,
        maxRetries: 3,
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: "DPO-ALPHA",
      };
      const created = await notificationRulesService.create(newRule as NotificationRule);
      setRules(prev => [created, ...prev]);
      setIsCreateOpen(false);
      toast({ title: "Protocol Established", description: "Notification rule live across all nodes." });
    } catch (error) {
        toast({ title: "Error", description: "Failed to create protocol.", variant: "destructive" });
    } finally {
        setCreating(false);
    }
  };

  const activeRules = rules.filter(r => r.status === "active").length;
  const draftRules = rules.filter(r => r.status === "draft").length;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
            { title: "Total Protocols", value: loading ? "..." : rules.length, icon: Radio, color: "text-foreground" },
            { title: "Active Links", value: loading ? "..." : activeRules, icon: Zap, color: "text-primary" },
            { title: "Draft State", value: loading ? "..." : draftRules, icon: Archive, color: "text-warning" },
            { title: "Active Channels", value: "4/4", icon: Webhook, color: "text-success" }
        ].map((stat, i) => (
            <Card key={i} className="border-0 shadow-sm bg-card/60 backdrop-blur-sm group hover:shadow-md transition-all duration-300">
                <CardHeader className="pb-1.5 pt-4 px-4">
                    <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-wider flex items-center gap-2">
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
          <h3 className="text-xl font-black text-foreground">Notification Terminal</h3>
          <p className="text-sm text-muted-foreground">
            Orchestrate cross-channel alerts and stakeholder synchronization.
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-lg shadow-primary/20">
              <Plus className="h-4 w-4 mr-2" />
              New Alert Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-card">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black">Alert Protocol Definition</DialogTitle>
              <DialogDescription>
                Map system events to communication channels and escalation patterns.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest">Protocol Identifier</Label>
                <Input id="name" placeholder="e.g., GDPR Breach Level 1" className="bg-background/50 border-border/50" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest">Trigger Source</Label>
                  <Select defaultValue="rights_request_created">
                    <SelectTrigger className="bg-background/50 border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {triggerEvents.map(event => (
                        <SelectItem key={event.value} value={event.value}>
                          {event.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest">Media Channel</Label>
                  <Select defaultValue="email">
                    <SelectTrigger className="bg-background/50 border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">SMTP Service (Email)</SelectItem>
                      <SelectItem value="sms">SMS Gateway</SelectItem>
                      <SelectItem value="in-app">Real-time Dashboard</SelectItem>
                      <SelectItem value="webhook">External Endpoint (JSON)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest">Target Stakeholder</Label>
                  <Select defaultValue="admin">
                    <SelectTrigger className="bg-background/50 border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Consent Owner</SelectItem>
                      <SelectItem value="role">Internal Processing Team</SelectItem>
                      <SelectItem value="admin">DPO / Compliance Root</SelectItem>
                      <SelectItem value="external">Third-party SOC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest">Burst Frequency</Label>
                  <Select defaultValue="immediate">
                    <SelectTrigger className="bg-background/50 border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Real-time Propagation</SelectItem>
                      <SelectItem value="batched">Batched Hourly</SelectItem>
                      <SelectItem value="scheduled">Daily Summary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 border border-border/40 rounded-2xl bg-muted/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary shadow-sm">
                      <Zap className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">Autonomous Retry Logic</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Exponential backoff on delivery failure (Max 5 attempts).</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button
                onClick={handleCreate}
                disabled={creating}
                className="min-w-[140px]"
              >
                {creating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
                Init Protocol
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Rule Cards */}
      <div className="grid gap-4">
        {loading ? (
            Array(3).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))
        ) : (
            rules.map(rule => (
            <Card key={rule.id} className={`border-border/40 shadow-sm bg-card/40 backdrop-blur-sm overflow-hidden group hover:border-primary/40 transition-all ${rule.status === "disabled" ? "opacity-50 grayscale" : ""}`}>
                <CardContent className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-5">
                    <div className="p-3 rounded-2xl bg-primary/10 text-primary shadow-sm group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                        {getChannelIcon(rule.channel)}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-base">{rule.name}</h4>
                            {getStatusBadge(rule.status)}
                        </div>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-tighter">
                            {triggerEvents.find(e => e.value === rule.triggerEvent)?.label} <span className="mx-1 opacity-50">/</span> {rule.recipientType} <span className="mx-1 opacity-50">/</span> {rule.channel}
                        </p>
                    </div>
                    </div>
                    <div className="flex items-center md:justify-end gap-1.5">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-muted-foreground hover:text-primary"
                        onClick={() => toast({ title: "Template Engine", description: `Loading preview for '${rule.template}'...` })}
                    >
                        <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-muted-foreground hover:text-success"
                        onClick={() => toast({ title: "Debug Mode", description: `Dry-run triggered for protocol ${rule.id}.` })}
                    >
                        <Play className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-muted-foreground hover:text-foreground"
                    >
                        <Settings2 className="h-4 w-4" />
                    </Button>
                    <div className="ml-2 pl-4 border-l border-border flex items-center h-8">
                        <Switch
                            checked={rule.status === "active"}
                            onCheckedChange={() => toggleRuleStatus(rule.id)}
                            className="scale-90"
                        />
                    </div>
                    </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-border/40 pt-4">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/40 text-[10px] font-bold text-muted-foreground uppercase">
                        <Bell className="h-3 w-3" />
                        {rule.frequency} delivery
                    </div>
                    {rule.retryEnabled && (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 text-[10px] font-bold text-success uppercase">
                        <CheckCircle2 className="h-3 w-3" />
                        Retries ({rule.maxRetries})
                    </div>
                    )}
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-[10px] font-bold text-primary uppercase">
                        <MessageSquare className="h-3 w-3" />
                        {rule.language} localized
                    </div>
                    <span className="ml-auto text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">ID: {rule.id.toUpperCase()}</span>
                </div>
                </CardContent>
            </Card>
            ))
        )}
      </div>
    </div>
  );
}
