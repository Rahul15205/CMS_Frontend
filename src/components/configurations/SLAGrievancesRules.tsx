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
  Clock,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Settings2,
  Timer,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { SLARule, LifecycleStatus } from "./types";
import { useToast } from "@/hooks/use-toast";

interface GrievanceSLARule extends Omit<SLARule, 'regulation' | 'rightType'> {
  category: string;
  escalationThreshold: number;
  reminderFrequency: number;
  closureCriteria: string[];
}

const mockGrievanceSLARules: GrievanceSLARule[] = [
  {
    id: "1",
    name: "Data Privacy Complaint",
    category: "data-privacy",
    priority: "high",
    duration: 15,
    durationUnit: "days",
    dayType: "working",
    escalationThreshold: 10,
    reminderFrequency: 3,
    closureCriteria: ["resolution_provided", "acknowledgment_received"],
    pauseConditions: ["awaiting_response"],
    autoCloseEnabled: false,
    breachActions: ["notify_dpo", "escalate"],
    status: "active",
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    name: "Service Quality Issue",
    category: "service-quality",
    priority: "medium",
    duration: 7,
    durationUnit: "days",
    dayType: "working",
    escalationThreshold: 5,
    reminderFrequency: 2,
    closureCriteria: ["resolution_provided"],
    pauseConditions: [],
    autoCloseEnabled: true,
    breachActions: ["notify_manager"],
    status: "active",
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    name: "Consent Dispute",
    category: "consent",
    priority: "critical",
    duration: 5,
    durationUnit: "days",
    dayType: "calendar",
    escalationThreshold: 3,
    reminderFrequency: 1,
    closureCriteria: ["resolution_provided", "legal_review", "acknowledgment_received"],
    pauseConditions: ["legal_hold"],
    autoCloseEnabled: false,
    breachActions: ["notify_dpo", "notify_legal", "escalate"],
    status: "active",
    version: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "4",
    name: "General Inquiry",
    category: "general",
    priority: "low",
    duration: 14,
    durationUnit: "days",
    dayType: "working",
    escalationThreshold: 10,
    reminderFrequency: 5,
    closureCriteria: ["response_sent"],
    pauseConditions: [],
    autoCloseEnabled: true,
    breachActions: ["notify_admin"],
    status: "active",
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const categories = [
  { value: "data-privacy", label: "Data Privacy" },
  { value: "consent", label: "Consent Related" },
  { value: "service-quality", label: "Service Quality" },
  { value: "access-denial", label: "Access Denial" },
  { value: "data-breach", label: "Data Breach" },
  { value: "general", label: "General Inquiry" },
];

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case "critical":
      return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Critical</Badge>;
    case "high":
      return <Badge className="bg-warning/10 text-warning border-warning/20">High</Badge>;
    case "medium":
      return <Badge className="bg-primary/10 text-primary border-primary/20">Medium</Badge>;
    case "low":
      return <Badge variant="secondary">Low</Badge>;
    default:
      return <Badge variant="outline">{priority}</Badge>;
  }
};

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

export function SLAGrievancesRules() {
  const [rules, setRules] = useState<GrievanceSLARule[]>(mockGrievanceSLARules);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { toast } = useToast();

  const activeRules = rules.filter(r => r.status === "active").length;
  const criticalRules = rules.filter(r => r.priority === "critical").length;

  // Mock health metrics
  const healthMetrics = [
    { category: "Data Privacy", compliance: 96, breaches: 2 },
    { category: "Consent Related", compliance: 100, breaches: 0 },
    { category: "Service Quality", compliance: 89, breaches: 5 },
    { category: "General Inquiry", compliance: 94, breaches: 3 },
  ];

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total SLA Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rules.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{activeRules}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Critical Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{criticalRules}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg SLA Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(rules.reduce((acc, r) => acc + r.duration, 0) / rules.length)} days
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SLA Health Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            SLA Health Dashboard
          </CardTitle>
          <CardDescription>Real-time compliance monitoring by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {healthMetrics.map(metric => (
              <div key={metric.category} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{metric.category}</span>
                  <span className={`text-sm font-bold ${metric.compliance >= 95 ? "text-success" : metric.compliance >= 90 ? "text-warning" : "text-destructive"}`}>
                    {metric.compliance}%
                  </span>
                </div>
                <Progress 
                  value={metric.compliance} 
                  className={`h-2 ${metric.compliance >= 95 ? "[&>div]:bg-success" : metric.compliance >= 90 ? "[&>div]:bg-warning" : "[&>div]:bg-destructive"}`}
                />
                <div className="mt-2 text-xs text-muted-foreground">
                  {metric.breaches} breaches this month
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">SLA Rules - Grievances</h3>
          <p className="text-sm text-muted-foreground">
            Standardize and customize grievance resolution timelines
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create SLA Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Grievance SLA Rule</DialogTitle>
              <DialogDescription>
                Configure SLA timelines for grievance resolution
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Rule Name</Label>
                <Input id="name" placeholder="e.g., Data Privacy Complaint SLA" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Priority Level</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label>SLA Duration</Label>
                  <Input type="number" placeholder="15" />
                </div>
                <div className="grid gap-2">
                  <Label>Unit</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Days" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hours">Hours</SelectItem>
                      <SelectItem value="days">Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Escalation After</Label>
                  <Input type="number" placeholder="10" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Reminder Frequency (days)</Label>
                  <Input type="number" placeholder="3" />
                </div>
                <div className="grid gap-2">
                  <Label>Day Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Working Days" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="working">Working Days</SelectItem>
                      <SelectItem value="calendar">Calendar Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Auto-Close on Expiry</p>
                  <p className="text-sm text-muted-foreground">Automatically close if no activity after SLA</p>
                </div>
                <Switch />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button
                onClick={() => {
                  const newRule: GrievanceSLARule = {
                    id: `sla-grv-${Date.now()}`,
                    name: `Grievance SLA ${rules.length + 1}`,
                    category: "general",
                    priority: "medium",
                    duration: 10,
                    durationUnit: "days",
                    dayType: "working",
                    escalationThreshold: 7,
                    reminderFrequency: 2,
                    closureCriteria: ["resolution_provided"],
                    pauseConditions: [],
                    autoCloseEnabled: false,
                    breachActions: ["notify_manager"],
                    status: "active",
                    version: 1,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                  };
                  setRules((prev) => [newRule, ...prev]);
                  setIsCreateOpen(false);
                  toast({
                    title: "Grievance SLA Created",
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

      {/* SLA Matrix Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rule Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>SLA Duration</TableHead>
              <TableHead>Escalation</TableHead>
              <TableHead>Reminder</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rules.map(rule => (
              <TableRow key={rule.id}>
                <TableCell className="font-medium">{rule.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {categories.find(c => c.value === rule.category)?.label}
                  </Badge>
                </TableCell>
                <TableCell>{getPriorityBadge(rule.priority || "medium")}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Timer className="h-4 w-4 text-muted-foreground" />
                    {rule.duration} {rule.durationUnit}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">After {rule.escalationThreshold} days</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">Every {rule.reminderFrequency} days</span>
                </TableCell>
                <TableCell>{getStatusBadge(rule.status)}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toast({ title: "Rule Settings", description: `Opening settings for ${rule.name}.` })}
                  >
                    <Settings2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
