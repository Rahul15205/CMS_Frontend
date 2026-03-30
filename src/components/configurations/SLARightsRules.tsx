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
  History,
  Shield,
  Calendar,
  Timer,
  Loader2,
  ChevronRight
} from "lucide-react";
import { SLARule, Regulation, RightType, LifecycleStatus } from "./types";
import { useToast } from "@/hooks/use-toast";
import { slaRulesService } from "@/services/configurationsService";
import { Skeleton } from "@/components/ui/skeleton";

const regulations: { value: Regulation; label: string; flag: string }[] = [
  { value: "GDPR", label: "GDPR (EU)", flag: "🇪🇺" },
  { value: "DPDP", label: "DPDP (India)", flag: "🇮🇳" },
  { value: "CCPA", label: "CCPA (California)", flag: "🇺🇸" },
  { value: "LGPD", label: "LGPD (Brazil)", flag: "🇧🇷" },
  { value: "PDPL", label: "PDPL (Middle East)", flag: "🌍" },
  { value: "PIPL", label: "PIPL (China)", flag: "🇨🇳" },
];

const rightTypes: { value: RightType; label: string }[] = [
  { value: "access", label: "Right to Access" },
  { value: "erasure", label: "Right to Erasure" },
  { value: "rectification", label: "Right to Rectification" },
  { value: "restriction", label: "Right to Restriction" },
  { value: "portability", label: "Right to Portability" },
  { value: "objection", label: "Right to Object" },
  { value: "withdraw-consent", label: "Withdraw Consent" },
  { value: "opt-out", label: "Opt-Out" },
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

const getRegulationBadge = (regulation: Regulation) => {
  const reg = regulations.find(r => r.value === regulation);
  return (
    <Badge variant="outline" className="font-semibold bg-background/50 border-border/50 px-2 py-0.5 text-[10px] uppercase">
      {reg?.flag} {reg?.value || regulation}
    </Badge>
  );
};

export function SLARightsRules() {
  const [rules, setRules] = useState<SLARule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
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
        description: "Failed to load Rights SLA rules.",
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
      const newRule: Partial<SLARule> = {
        name: `SLA Protocol ${rules.length + 1}`,
        regulation: "GDPR",
        rightType: "access",
        duration: 30,
        durationUnit: "days",
        dayType: "calendar",
        pauseConditions: [],
        autoCloseEnabled: false,
        breachActions: ["notify_dpo"],
        status: "active",
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const created = await slaRulesService.create(newRule as SLARule);
      setRules(prev => [created, ...prev]);
      setIsCreateOpen(false);
      setWizardStep(1);
      toast({ title: "SLA Rule Created", description: "Rights management SLA rule added successfully." });
    } catch (error) {
        toast({ title: "Error", description: "Failed to create rule.", variant: "destructive" });
    } finally {
        setCreating(false);
    }
  };

  const activeRules = rules.filter(r => r.status === "active").length;
  const slaCompliance = rules.length > 0 ? Math.round((activeRules / rules.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
            { title: "SLA Rules", value: loading ? "..." : rules.length, icon: Timer, color: "text-foreground" },
            { title: "Active Protocols", value: loading ? "..." : activeRules, icon: CheckCircle2, color: "text-success" },
            { title: "Regulations", value: loading ? "..." : new Set(rules.map(r => r.regulation)).size, icon: Shield, color: "text-primary" },
            { title: "SLA Efficiency", value: `${slaCompliance}%`, icon: Clock, color: "text-primary", progress: slaCompliance }
        ].map((stat, i) => (
            <Card key={i} className="border-0 shadow-sm bg-card/60 backdrop-blur-sm overflow-hidden group hover:shadow-md transition-all duration-300">
                <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <stat.icon className="h-3.5 w-3.5" />
                        {stat.title}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                        {stat.progress && <Progress value={stat.progress} className="w-16 h-1.5" />}
                    </div>
                </CardContent>
            </Card>
        ))}
      </div>

      {/* Compliance Alert */}
      <Card className="border-0 shadow-sm bg-warning/10 border-warning/20 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-1 h-full bg-warning"></div>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-full bg-warning/20 text-warning">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-warning-foreground">Mandatory Slaughtering Timelines</p>
              <p className="text-sm text-muted-foreground">
                GDPR enforcement requires <span className="font-bold text-foreground">30 days</span>. 
                DPDP Act (India) mandates <span className="font-bold text-foreground">15 working days</span>.
              </p>
            </div>
            <Button variant="outline" size="sm" className="border-warning/30 hover:bg-warning/10">Regulatory Guide</Button>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-foreground">Rights Compliance SLAs</h3>
          <p className="text-sm text-muted-foreground">
            Configure legally mandated processing timelines per territory.
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={(open) => { setIsCreateOpen(open); setWizardStep(1); }}>
          <DialogTrigger asChild>
            <Button className="shadow-lg shadow-primary/20">
              <Plus className="h-4 w-4 mr-2" />
              Define SLA Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-card">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                  <Timer className="h-6 w-6 text-primary" />
                  SLA Configuration Wizard
              </DialogTitle>
              <DialogDescription>
                Step {wizardStep} of 3: {
                    wizardStep === 1 ? "Jurisdiction" : 
                    wizardStep === 2 ? "Timeline" : "Enforcement"
                }
              </DialogDescription>
            </DialogHeader>
            
            {/* Wizard Progress */}
            <div className="flex items-center justify-center gap-3 py-6">
              {[1, 2, 3].map(step => (
                <div key={step} className="flex items-center">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm transition-all duration-300 ${
                    step === wizardStep ? "bg-primary text-primary-foreground scale-110" : 
                    step < wizardStep ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"
                  }`}>
                    {step < wizardStep ? <CheckCircle2 className="h-5 w-5" /> : step}
                  </div>
                  {step < 3 && (
                    <div className={`h-0.5 w-12 mx-1 rounded-full ${step < wizardStep ? "bg-success/50" : "bg-muted"}`} />
                  )}
                </div>
              ))}
            </div>

            <div className="grid gap-6 py-4">
              {wizardStep === 1 && (
                <div className="space-y-6">
                  <div className="grid gap-2">
                    <Label className="text-sm font-semibold">Rule Identifier</Label>
                    <Input placeholder="e.g., GDPR Access Request Standard" className="bg-background/50 border-border/50" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="grid gap-2">
                      <Label className="text-sm font-semibold">Regulation</Label>
                      <Select defaultValue="GDPR">
                        <SelectTrigger className="bg-background/50 border-border/50 h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {regulations.map(reg => (
                            <SelectItem key={reg.value} value={reg.value}>
                              <span className="flex items-center gap-2">{reg.flag} {reg.label}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-sm font-semibold">Right Exercise Type</Label>
                      <Select defaultValue="access">
                        <SelectTrigger className="bg-background/50 border-border/50 h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {rightTypes.map(right => (
                            <SelectItem key={right.value} value={right.value}>
                              {right.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {wizardStep === 2 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="grid gap-2">
                      <Label className="text-sm font-semibold">Allowed Duration</Label>
                      <Input type="number" defaultValue="30" className="bg-background/50 border-border/50" />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-sm font-semibold">Unit</Label>
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
                      <Label className="text-sm font-semibold">Calculation Basis</Label>
                      <Select defaultValue="calendar">
                        <SelectTrigger className="bg-background/50 border-border/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="calendar">Calendar Days</SelectItem>
                          <SelectItem value="working">Business Days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-sm font-semibold">Pause Provisions</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {["Awaiting Identity", "Additional Info Needeed", "Security Validation", "Third-Party Delay"].map(p => (
                        <div key={p} className="flex items-center gap-3 p-3 border border-border/30 rounded-xl bg-muted/10">
                          <Switch id={`pause-${p}`} />
                          <Label htmlFor={`pause-${p}`} className="text-xs cursor-pointer">{p}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {wizardStep === 3 && (
                <div className="space-y-6">
                  <div className="grid gap-2">
                    <Label className="text-sm font-semibold">Breach Escalation Protocols</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { title: "Notify DPO", icon: Shield },
                        { title: "Escalate to Legal", icon: CheckCircle2 },
                        { title: "Priority Bump", icon: AlertTriangle },
                        { title: "Incident Log", icon: History }
                      ].map(action => (
                        <div key={action.title} className="flex items-center justify-between p-3 border border-border/30 rounded-xl bg-muted/10">
                          <div className="flex items-center gap-2">
                              <action.icon className="h-4 w-4 text-primary" />
                              <span className="text-xs font-medium">{action.title}</span>
                          </div>
                          <Switch defaultChecked={action.title === "Notify DPO"} />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-primary/20 rounded-xl bg-primary/5">
                    <div>
                      <p className="text-sm font-bold text-primary">Self-Healing Termination</p>
                      <p className="text-xs text-muted-foreground mt-1">Automatically expire request if SLA is breached by {">"}10 days.</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter className="gap-2">
              {wizardStep > 1 && (
                <Button variant="ghost" onClick={() => setWizardStep(wizardStep - 1)}>
                  Back
                </Button>
              )}
              {wizardStep < 3 ? (
                <Button onClick={() => setWizardStep(wizardStep + 1)} className="min-w-[100px]">Next Progress</Button>
              ) : (
                <Button
                  onClick={handleCreate}
                  disabled={creating}
                  className="min-w-[120px]"
                >
                  {creating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Timer className="h-4 w-4 mr-2" />}
                  Finalize Protocol
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* SLA Rules Table */}
      <Card className="border-0 shadow-sm bg-card/60 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
            <Table>
            <TableHeader className="bg-muted/30 text-[11px] uppercase tracking-wider">
                <TableRow>
                <TableHead className="font-bold">Rule Identity</TableHead>
                <TableHead className="font-bold">Jurisdiction</TableHead>
                <TableHead className="font-bold">Right Category</TableHead>
                <TableHead className="font-bold">Execution SLA</TableHead>
                <TableHead className="font-bold">Basis</TableHead>
                <TableHead className="font-bold">Version</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="text-right font-bold">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {loading ? (
                    Array(5).fill(0).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell colSpan={8} className="p-0">
                                <Skeleton className="h-16 w-full rounded-none" />
                            </TableCell>
                        </TableRow>
                    ))
                ) : (
                    rules.map(rule => (
                    <TableRow key={rule.id} className="group hover:bg-muted/20 transition-all border-border/40">
                        <TableCell className="font-bold text-foreground">{rule.name}</TableCell>
                        <TableCell>{getRegulationBadge(rule.regulation)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-[9px] font-bold bg-muted/50 border-border/50">
                            {rightTypes.find(r => r.value === rule.rightType)?.label || rule.rightType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Timer className="h-3.5 w-3.5 text-primary" />
                            <span className="text-xs font-mono font-bold">{rule.duration} {rule.durationUnit}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                            {rule.dayType}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-xs">
                            <History className="h-3 w-3 text-muted-foreground" />
                            v{rule.version}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(rule.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:text-primary"
                            onClick={() => toast({ title: "Visual Editor", description: `Opening timeline editor for ${rule.name}.` })}
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

      {/* Timeline Visualization */}
      <Card className="border-0 shadow-sm bg-card/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Comparative Timeline Metrics
          </CardTitle>
          <CardDescription>Legal durations benchmarked against longest allow-cycle (30 days)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-2">
            {!loading && rules.filter(r => r.status === "active").slice(0, 4).map(rule => (
              <div key={rule.id} className="space-y-3 group cursor-default">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-tight">
                  <span className="group-hover:text-primary transition-colors">{rule.name}</span>
                  <span className="text-muted-foreground">{rule.duration} {rule.durationUnit}</span>
                </div>
                <div className="relative h-2.5 bg-muted rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="absolute left-0 top-0 h-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.3)] rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${Math.min((rule.duration / 30) * 100, 100)}%` }}
                  />
                  <div className="absolute right-0 top-0 h-full w-px bg-destructive/30 border-r border-dashed border-destructive/20" title="Safety Margin" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
