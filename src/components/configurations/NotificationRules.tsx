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
} from "lucide-react";
import { NotificationRule, NotificationChannel, RecipientType, Frequency, LifecycleStatus } from "./types";
import { useToast } from "@/hooks/use-toast";

const mockRules: NotificationRule[] = [
  {
    id: "1",
    name: "Rights Request Created",
    triggerEvent: "rights_request_created",
    channel: "email",
    recipientType: "admin",
    template: "rights-request-notification",
    language: "en",
    frequency: "immediate",
    retryEnabled: true,
    maxRetries: 3,
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: "Admin",
  },
  {
    id: "2",
    name: "SLA Breach Warning",
    triggerEvent: "sla_breach_imminent",
    channel: "sms",
    recipientType: "role",
    template: "sla-warning",
    language: "en",
    frequency: "immediate",
    retryEnabled: true,
    maxRetries: 2,
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: "Admin",
  },
  {
    id: "3",
    name: "Consent Renewal Reminder",
    triggerEvent: "consent_expiry_approaching",
    channel: "email",
    recipientType: "user",
    template: "consent-renewal",
    language: "en",
    frequency: "scheduled",
    retryEnabled: false,
    maxRetries: 0,
    status: "draft",
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: "Admin",
  },
  {
    id: "4",
    name: "Security Alert",
    triggerEvent: "security_incident",
    channel: "webhook",
    recipientType: "external",
    template: "security-alert",
    language: "en",
    frequency: "immediate",
    retryEnabled: true,
    maxRetries: 5,
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: "Admin",
  },
];

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
  const [rules, setRules] = useState<NotificationRule[]>(mockRules);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<NotificationRule | null>(null);
  const { toast } = useToast();

  const toggleRuleStatus = (ruleId: string) => {
    setRules(rules.map(rule => {
      if (rule.id === ruleId) {
        return {
          ...rule,
          status: rule.status === "active" ? "disabled" : "active" as LifecycleStatus,
          updatedAt: new Date(),
        };
      }
      return rule;
    }));
  };

  const activeRules = rules.filter(r => r.status === "active").length;
  const draftRules = rules.filter(r => r.status === "draft").length;

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
            <CardTitle className="text-sm font-medium text-muted-foreground">Draft</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{draftRules}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Channels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Mail className="h-5 w-5 text-primary" />
              <Smartphone className="h-5 w-5 text-primary" />
              <MessageSquare className="h-5 w-5 text-primary" />
              <Webhook className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Notification Rules</h3>
          <p className="text-sm text-muted-foreground">
            Configure automated notifications for system events
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
              <DialogTitle>Create Notification Rule</DialogTitle>
              <DialogDescription>
                Configure a new notification rule with trigger events, channels, and recipients.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Rule Name</Label>
                <Input id="name" placeholder="Enter rule name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Trigger Event</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select event" />
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
                  <Label>Channel</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select channel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="in-app">In-App</SelectItem>
                      <SelectItem value="webhook">Webhook</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Recipient Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select recipient" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="role">Role</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="external">External</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Frequency</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="batched">Batched</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Enable Retry Logic</p>
                  <p className="text-sm text-muted-foreground">Automatically retry failed notifications</p>
                </div>
                <Switch />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button
                onClick={() => {
                  const newRule: NotificationRule = {
                    id: `notif-${Date.now()}`,
                    name: `Notification Rule ${rules.length + 1}`,
                    triggerEvent: "rights_request_created",
                    channel: "email",
                    recipientType: "role",
                    template: "default_template",
                    language: "en",
                    frequency: "immediate",
                    retryEnabled: true,
                    maxRetries: 3,
                    status: "active",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    createdBy: "Admin User",
                  };
                  setRules((prev) => [newRule, ...prev]);
                  setIsCreateOpen(false);
                  toast({
                    title: "Notification Rule Created",
                    description: `${newRule.name} added successfully.`,
                  });
                }}
              >
                Create Rule
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Rule Cards */}
      <div className="grid gap-4">
        {rules.map(rule => (
          <Card key={rule.id} className={rule.status === "disabled" ? "opacity-60" : ""}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {getChannelIcon(rule.channel)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{rule.name}</h4>
                      {getStatusBadge(rule.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {triggerEvents.find(e => e.value === rule.triggerEvent)?.label} → {rule.recipientType} via {rule.channel}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Preview"
                    onClick={() => toast({ title: "Preview", description: `Preview opened for ${rule.name}.` })}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Test"
                    onClick={() => toast({ title: "Test Triggered", description: `Test notification sent for ${rule.name}.` })}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Configure"
                    onClick={() => toast({ title: "Configure", description: `Open configuration for ${rule.name}.` })}
                  >
                    <Settings2 className="h-4 w-4" />
                  </Button>
                  <Switch
                    checked={rule.status === "active"}
                    onCheckedChange={() => toggleRuleStatus(rule.id)}
                  />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Bell className="h-3 w-3" />
                  {rule.frequency}
                </span>
                {rule.retryEnabled && (
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Retry enabled ({rule.maxRetries} max)
                  </span>
                )}
                <span>Language: {rule.language.toUpperCase()}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
