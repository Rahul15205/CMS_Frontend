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
  History,
  Shield,
  Calendar,
  Timer,
} from "lucide-react";
import { SLARule, Regulation, RightType, LifecycleStatus } from "./types";
import { useToast } from "@/hooks/use-toast";

const mockSLARules: SLARule[] = [
  {
    id: "1",
    name: "GDPR Access Request",
    regulation: "GDPR",
    rightType: "access",
    duration: 30,
    durationUnit: "days",
    dayType: "calendar",
    pauseConditions: ["awaiting_identity_verification", "awaiting_additional_info"],
    autoCloseEnabled: true,
    breachActions: ["notify_dpo", "escalate_l2"],
    status: "active",
    version: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    name: "GDPR Erasure Request",
    regulation: "GDPR",
    rightType: "erasure",
    duration: 30,
    durationUnit: "days",
    dayType: "calendar",
    pauseConditions: ["awaiting_identity_verification"],
    autoCloseEnabled: true,
    breachActions: ["notify_dpo", "notify_legal"],
    status: "active",
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    name: "DPDP Access Request",
    regulation: "DPDP",
    rightType: "access",
    duration: 15,
    durationUnit: "days",
    dayType: "working",
    pauseConditions: ["awaiting_identity_verification"],
    autoCloseEnabled: false,
    breachActions: ["notify_dpo"],
    status: "active",
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "4",
    name: "CCPA Opt-Out",
    regulation: "CCPA",
    rightType: "opt-out",
    duration: 15,
    durationUnit: "days",
    dayType: "working",
    pauseConditions: [],
    autoCloseEnabled: true,
    breachActions: ["notify_admin"],
    status: "active",
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "5",
    name: "LGPD Portability",
    regulation: "LGPD",
    rightType: "portability",
    duration: 15,
    durationUnit: "days",
    dayType: "calendar",
    pauseConditions: ["awaiting_identity_verification"],
    autoCloseEnabled: false,
    breachActions: ["notify_dpo"],
    status: "draft",
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

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
    <Badge variant="outline" className="font-medium">
      {reg?.flag} {reg?.label || regulation}
    </Badge>
  );
};

export function SLARightsRules() {
  const [rules, setRules] = useState<SLARule[]>(mockSLARules);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const { toast } = useToast();

  const activeRules = rules.filter(r => r.status === "active").length;
  const slaCompliance = 94; // Mock percentage

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
            <CardTitle className="text-sm font-medium text-muted-foreground">Regulations Covered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Set(rules.map(r => r.regulation)).size}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">SLA Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-success">{slaCompliance}%</div>
              <Progress value={slaCompliance} className="flex-1 h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Alert */}
      <Card className="border-warning/50 bg-warning/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <div>
              <p className="font-medium">Regulatory Reminder</p>
              <p className="text-sm text-muted-foreground">
                Ensure SLA configurations align with regulatory requirements. GDPR requires response within 30 days, DPDP within 15 working days.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">SLA Rules - Rights Management</h3>
          <p className="text-sm text-muted-foreground">
            Configure legally compliant SLA timelines per regulation and right type
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={(open) => { setIsCreateOpen(open); setWizardStep(1); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create SLA Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create SLA Rule - Step {wizardStep} of 3</DialogTitle>
              <DialogDescription>
                {wizardStep === 1 && "Select regulation and right type"}
                {wizardStep === 2 && "Configure SLA timeline and conditions"}
                {wizardStep === 3 && "Set breach actions and finalize"}
              </DialogDescription>
            </DialogHeader>
            
            {/* Wizard Progress */}
            <div className="flex items-center gap-2 py-2">
              {[1, 2, 3].map(step => (
                <div key={step} className="flex items-center">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= wizardStep ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                    {step}
                  </div>
                  {step < 3 && (
                    <div className={`h-0.5 w-12 ${step < wizardStep ? "bg-primary" : "bg-muted"}`} />
                  )}
                </div>
              ))}
            </div>

            <div className="grid gap-4 py-4">
              {wizardStep === 1 && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="name">Rule Name</Label>
                    <Input id="name" placeholder="e.g., GDPR Access Request SLA" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Regulation</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select regulation" />
                        </SelectTrigger>
                        <SelectContent>
                          {regulations.map(reg => (
                            <SelectItem key={reg.value} value={reg.value}>
                              {reg.flag} {reg.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Right Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select right type" />
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
                </>
              )}

              {wizardStep === 2 && (
                <>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <Label>Duration</Label>
                      <Input type="number" placeholder="30" />
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
                      <Label>Day Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Calendar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="calendar">Calendar Days</SelectItem>
                          <SelectItem value="working">Working Days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Pause Conditions</Label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Switch id="pause1" />
                        <Label htmlFor="pause1" className="font-normal">Awaiting Identity Verification</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch id="pause2" />
                        <Label htmlFor="pause2" className="font-normal">Awaiting Additional Information</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch id="pause3" />
                        <Label htmlFor="pause3" className="font-normal">Third-Party Dependency</Label>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {wizardStep === 3 && (
                <>
                  <div className="grid gap-2">
                    <Label>Breach Actions</Label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Switch id="action1" defaultChecked />
                        <Label htmlFor="action1" className="font-normal">Notify DPO</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch id="action2" />
                        <Label htmlFor="action2" className="font-normal">Escalate to L2</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch id="action3" />
                        <Label htmlFor="action3" className="font-normal">Notify Legal Team</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch id="action4" />
                        <Label htmlFor="action4" className="font-normal">Create Incident Report</Label>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Auto-Close on Expiry</p>
                      <p className="text-sm text-muted-foreground">Automatically close requests after SLA expiry</p>
                    </div>
                    <Switch />
                  </div>
                </>
              )}
            </div>
            
            <DialogFooter>
              {wizardStep > 1 && (
                <Button variant="outline" onClick={() => setWizardStep(wizardStep - 1)}>
                  Previous
                </Button>
              )}
              {wizardStep < 3 ? (
                <Button onClick={() => setWizardStep(wizardStep + 1)}>Next</Button>
              ) : (
                <Button
                  onClick={() => {
                    const newRule: SLARule = {
                      id: `sla-rights-${Date.now()}`,
                      name: `Rights SLA Rule ${rules.length + 1}`,
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
                    setRules((prev) => [newRule, ...prev]);
                    setIsCreateOpen(false);
                    setWizardStep(1);
                    toast({
                      title: "SLA Rule Created",
                      description: `${newRule.name} added to Rights SLA table.`,
                    });
                  }}
                >
                  Create Rule
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* SLA Rules Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rule Name</TableHead>
              <TableHead>Regulation</TableHead>
              <TableHead>Right Type</TableHead>
              <TableHead>SLA Duration</TableHead>
              <TableHead>Day Type</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rules.map(rule => (
              <TableRow key={rule.id}>
                <TableCell className="font-medium">{rule.name}</TableCell>
                <TableCell>{getRegulationBadge(rule.regulation)}</TableCell>
                <TableCell>
                  {rightTypes.find(r => r.value === rule.rightType)?.label}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Timer className="h-4 w-4 text-muted-foreground" />
                    {rule.duration} {rule.durationUnit}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {rule.dayType === "calendar" ? "📅 Calendar" : "💼 Working"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <History className="h-3 w-3 text-muted-foreground" />
                    v{rule.version}
                  </div>
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

      {/* Timeline Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">SLA Timeline Overview</CardTitle>
          <CardDescription>Visual comparison of SLA durations across regulations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rules.filter(r => r.status === "active").map(rule => (
              <div key={rule.id} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{rule.name}</span>
                  <span className="text-muted-foreground">{rule.duration} {rule.durationUnit}</span>
                </div>
                <div className="relative h-6 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="absolute left-0 top-0 h-full bg-primary/20 rounded-full"
                    style={{ width: `${Math.min((rule.duration / 30) * 100, 100)}%` }}
                  />
                  <div 
                    className="absolute left-0 top-0 h-full bg-primary rounded-full transition-all"
                    style={{ width: `${Math.min((rule.duration / 30) * 70, 70)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
