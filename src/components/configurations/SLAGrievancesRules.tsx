import { useState, useEffect, useCallback } from "react";
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
  Loader2,
  Activity,
  ShieldCheck
} from "lucide-react";
import { LifecycleStatus } from "./types";
import { useToast } from "@/hooks/use-toast";
import { slaRulesService } from "@/services/configurationsService";
import { Skeleton } from "@/components/ui/skeleton";

interface GrievanceSLARule {
  id: string;
  name: string;
  category: string;
  priority: string;
  duration: number;
  durationUnit: "hours" | "days";
  dayType: "working" | "calendar";
  escalationThreshold: number;
  reminderFrequency: number;
  closureCriteria: string[];
  pauseConditions: string[];
  autoCloseEnabled: boolean;
  breachActions: string[];
  status: LifecycleStatus;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

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
      return <Badge className="bg-destructive/10 text-destructive border-destructive/20 font-bold px-2 py-0.5 text-[10px] uppercase">Critical</Badge>;
    case "high":
      return <Badge className="bg-warning/10 text-warning border-warning/20 font-bold px-2 py-0.5 text-[10px] uppercase">High</Badge>;
    case "medium":
      return <Badge className="bg-primary/10 text-primary border-primary/20 font-bold px-2 py-0.5 text-[10px] uppercase">Medium</Badge>;
    case "low":
      return <Badge variant="secondary" className="font-bold px-2 py-0.5 text-[10px] uppercase">Low</Badge>;
    default:
      return <Badge variant="outline" className="font-bold px-2 py-0.5 text-[10px] uppercase">{priority}</Badge>;
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
  const [rules, setRules] = useState<GrievanceSLARule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  const fetchRules = useCallback(async () => {
    setLoading(true);
    try {
      const data = await slaRulesService.getAll();
      setRules(Array.isArray(data) ? data : []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load Grievance SLA rules.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const newRule: Partial<GrievanceSLARule> = {
        name: `Grievance Policy ${rules.length + 1}`,
        category: "data-privacy",
        priority: "high",
        duration: 15,
        durationUnit: "days",
        dayType: "working",
        escalationThreshold: 10,
        reminderFrequency: 3,
        closureCriteria: ["resolution_provided"],
        pauseConditions: [],
        autoCloseEnabled: false,
        breachActions: ["notify_dpo"],
        status: "active",
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const created = await slaRulesService.create(newRule as GrievanceSLARule);
      setRules(prev => [created, ...prev]);
      setIsCreateOpen(false);
      toast({ title: "Grievance Policy Created", description: "SLA threshold defined successfully." });
    } catch (error) {
        toast({ title: "Error", description: "Failed to create policy.", variant: "destructive" });
    } finally {
        setCreating(false);
    }
  };

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
            { title: "Grievance Rules", value: loading ? "..." : rules.length, icon: Activity, color: "text-foreground" },
            { title: "Active Protocols", value: loading ? "..." : activeRules, icon: ShieldCheck, color: "text-success" },
            { title: "Critical SLAs", value: loading ? "..." : criticalRules, icon: AlertCircle, color: "text-destructive" },
            { title: "Avg Resolution", value: loading ? "..." : `${Math.round(rules.reduce((acc, r) => acc + r.duration, 0) / (rules.length || 1))}d`, icon: Clock, color: "text-primary" }
        ].map((stat, i) => (
            <Card key={i} className="border-0 shadow-sm bg-card/60 backdrop-blur-sm group hover:shadow-md transition-all duration-300">
                <CardHeader className="pb-2">
                    <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.1em] flex items-center gap-2">
                        <stat.icon className="h-3 w-3" />
                        {stat.title}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
                </CardContent>
            </Card>
        ))}
      </div>

      {/* SLA Health Dashboard */}
      <Card className="border-0 shadow-sm bg-card/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Compliance Heatmap
          </CardTitle>
          <CardDescription>Real-time SLA performance audit by grievance category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {healthMetrics.map(metric => (
              <div key={metric.category} className="p-4 border border-border/40 rounded-xl bg-background/30 hover:bg-muted/30 transition-all group">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-tight">{metric.category}</span>
                  <Badge variant="outline" className={`text-[10px] border-0 px-0 ${metric.compliance >= 95 ? "text-success" : "text-warning"}`}>
                    {metric.compliance}%
                  </Badge>
                </div>
                <Progress 
                  value={metric.compliance} 
                  className={`h-1.5 bg-muted/50 ${metric.compliance >= 95 ? "[&>div]:bg-success" : metric.compliance >= 90 ? "[&>div]:bg-warning" : "[&>div]:bg-destructive"}`}
                />
                <div className="mt-3 flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground">Monthly Breaches</span>
                  <span className={`font-bold ${metric.breaches > 0 ? "text-destructive" : "text-success"}`}>{metric.breaches}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-foreground">Grievance Resolution SLAs</h3>
          <p className="text-sm text-muted-foreground">
            Establish legal resolution frameworks for cross-functional complaints.
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-lg shadow-primary/20">
              <Plus className="h-4 w-4 mr-2" />
              New SLA Policy
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-card">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black">Resolution Protocol Configuration</DialogTitle>
              <DialogDescription>
                Define escalation triggers, reminder frequencies, and closure criteria.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest">Policy Name</Label>
                <Input id="name" placeholder="e.g., Critical Data Privacy SLA" className="bg-background/50 border-border/50" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="text-xs font-bold uppercase tracking-widest">Grievance Category</Label>
                  <Select defaultValue="data-privacy">
                    <SelectTrigger className="bg-background/50 border-border/50">
                      <SelectValue />
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
                  <Label className="text-xs font-bold uppercase tracking-widest">Priority Index</Label>
                  <Select defaultValue="high">
                    <SelectTrigger className="bg-background/50 border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Critical / Executive</SelectItem>
                      <SelectItem value="high">High Corporate</SelectItem>
                      <SelectItem value="medium">Standard / Tier 1</SelectItem>
                      <SelectItem value="low">Informational</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label className="text-xs font-bold uppercase tracking-widest">Base Duration</Label>
                  <Input type="number" defaultValue="15" className="bg-background/50 border-border/50" />
                </div>
                <div className="grid gap-2">
                  <Label className="text-xs font-bold uppercase tracking-widest">Unit</Label>
                  <Select defaultValue="days">
                    <SelectTrigger className="bg-background/50 border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hours">Hours</SelectItem>
                      <SelectItem value="days">Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label className="text-xs font-bold uppercase tracking-widest">L2 Escalation (D)</Label>
                  <Input type="number" defaultValue="10" className="bg-background/50 border-border/50" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="text-xs font-bold uppercase tracking-widest">Internal Reminders</Label>
                  <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground">Every</span>
                      <Input type="number" defaultValue="3" className="w-16 bg-background/50 border-border/50" />
                      <span className="text-[10px] text-muted-foreground">working days</span>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label className="text-xs font-bold uppercase tracking-widest">Day Logic</Label>
                  <Select defaultValue="working">
                    <SelectTrigger className="bg-background/50 border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="working">Mon-Fri (Business)</SelectItem>
                      <SelectItem value="calendar">Sun-Sat (Full)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 border border-border/40 rounded-2xl bg-muted/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">Enforce Closure Criteria</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Require resolution evidence before status update.</p>
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
                {creating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Activity className="h-4 w-4 mr-2" />}
                Publish Policy
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* SLA Matrix Table */}
      <Card className="border-0 shadow-sm bg-card/60 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
            <Table>
            <TableHeader className="bg-muted/30">
                <TableRow className="border-border/40">
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Rule Identity</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Classification</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Priority</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Target SLA</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">L2 Escalation</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Heartbeat</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Status</TableHead>
                <TableHead className="text-right text-[10px] font-black uppercase tracking-widest">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {loading ? (
                    Array(4).fill(0).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell colSpan={8} className="p-0">
                                <Skeleton className="h-16 w-full rounded-none" />
                            </TableCell>
                        </TableRow>
                    ))
                ) : (
                    rules.map(rule => (
                    <TableRow key={rule.id} className="group hover:bg-muted/10 transition-colors border-border/40">
                        <TableCell className="font-bold text-foreground py-4">{rule.name}</TableCell>
                        <TableCell>
                        <Badge variant="outline" className="text-[9px] font-bold bg-background/50 border-border/50">
                            {categories.find(c => c.value === rule.category)?.label || rule.category}
                        </Badge>
                        </TableCell>
                        <TableCell>{getPriorityBadge(rule.priority || "medium")}</TableCell>
                        <TableCell>
                        <div className="flex items-center gap-2">
                            <Timer className="h-3.5 w-3.5 text-primary" />
                            <span className="text-xs font-bold">{rule.duration}{rule.durationUnit[0]}</span>
                        </div>
                        </TableCell>
                        <TableCell>
                        <span className="text-[10px] font-semibold text-muted-foreground">T+{rule.escalationThreshold}d</span>
                        </TableCell>
                        <TableCell>
                        <span className="text-[10px] font-semibold text-muted-foreground">{rule.reminderFrequency}d Cycle</span>
                        </TableCell>
                        <TableCell>{getStatusBadge(rule.status)}</TableCell>
                        <TableCell className="text-right">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:text-primary"
                        >
                            <Settings2 className="h-4 w-4" />
                        </Button>
                        </TableCell>
                    </TableRow>
                    ))
                )}
            </TableBody>
            </Table>
        </div>
      </Card>
    </div>
  );
}
