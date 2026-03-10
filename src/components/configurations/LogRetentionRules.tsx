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
  FileText,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Settings2,
  Archive,
  Trash2,
  Shield,
  Clock,
  Database,
  Lock,
  Loader2,
  Vault,
  HardDrive
} from "lucide-react";
import { LogRetentionRule, LogType, LifecycleStatus } from "./types";
import { useToast } from "@/hooks/use-toast";
import { logRetentionService } from "@/services/configurationsService";
import { Skeleton } from "@/components/ui/skeleton";

const logTypes: { value: LogType; label: string; icon: React.ReactNode }[] = [
  { value: "audit", label: "Audit Logs", icon: <Shield className="h-4 w-4" /> },
  { value: "consent", label: "Consent Logs", icon: <CheckCircle2 className="h-4 w-4" /> },
  { value: "rights", label: "Rights Logs", icon: <FileText className="h-4 w-4" /> },
  { value: "grievance", label: "Grievance Logs", icon: <AlertTriangle className="h-4 w-4" /> },
  { value: "security", label: "Security Logs", icon: <Lock className="h-4 w-4" /> },
  { value: "system", label: "System Logs", icon: <Database className="h-4 w-4" /> },
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

const getRetentionDisplay = (period: number, unit: string) => {
  return `${period} ${unit}`;
};

// Mock storage usage data
const storageData = [
  { type: "Audit Logs", size: 45.2, color: "bg-primary" },
  { type: "Consent Logs", size: 32.8, color: "bg-success" },
  { type: "Rights Logs", size: 12.5, color: "bg-warning" },
  { type: "Security Logs", size: 8.3, color: "bg-destructive" },
  { type: "System Logs", size: 1.2, color: "bg-muted-foreground" },
];

const totalStorage = storageData.reduce((acc, item) => acc + item.size, 0);

export function LogRetentionRules() {
  const [rules, setRules] = useState<LogRetentionRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  const fetchRules = useCallback(async () => {
    setLoading(true);
    try {
      const data = await logRetentionService.getAll();
      setRules(Array.isArray(data) ? data : []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load retention rules.",
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
      const newRule: Partial<LogRetentionRule> = {
        logType: "audit",
        retentionPeriod: 7,
        retentionUnit: "years",
        regulation: "GDPR",
        autoArchive: true,
        autoDelete: false,
        legalHoldOverride: false,
        maskingEnabled: true,
        maskingFields: ["email", "ip_address"],
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const created = await logRetentionService.create(newRule as LogRetentionRule);
      setRules(prev => [created, ...prev]);
      setIsCreateOpen(false);
      toast({ title: "Retention Policy Published", description: "Vault lifecycle rule established." });
    } catch (error) {
        toast({ title: "Error", description: "Storage rule failed.", variant: "destructive" });
    } finally {
        setCreating(false);
    }
  };

  const complianceIssues = rules.filter(r => 
    r.regulation && r.retentionPeriod < 3 && r.retentionUnit === "years"
  ).length;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
            { title: "Lifecycle Rules", value: loading ? "..." : rules.length, icon: Vault, color: "text-foreground" },
            { title: "Storage Index", value: `${totalStorage.toFixed(1)}GB`, icon: HardDrive, color: "text-primary" },
            { title: "Legal Hold", value: loading ? "..." : rules.filter(r => r.legalHoldOverride).length, icon: Lock, color: "text-warning" },
            { title: "System Health", value: complianceIssues === 0 ? "Normal" : "Warning", icon: Shield, color: complianceIssues === 0 ? "text-success" : "text-destructive" }
        ].map((stat, i) => (
            <Card key={i} className="border-0 shadow-sm bg-card/60 backdrop-blur-sm group hover:shadow-md transition-all duration-300">
                <CardHeader className="pb-1.5 pt-4 px-4">
                    <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.12em] flex items-center gap-2">
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

      {/* Storage Visualization */}
      <Card className="border-0 shadow-sm bg-card/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Archive Volume Distribution
          </CardTitle>
          <CardDescription>Cold vs Warm storage utilization by data class</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center gap-1.5 h-3 w-full rounded-full overflow-hidden bg-muted/40">
                {storageData.map((item, i) => (
                    <div 
                        key={i} 
                        className={`${item.color} h-full transition-all hover:brightness-110`} 
                        style={{ width: `${(item.size / totalStorage) * 100}%` }}
                        title={`${item.type}: ${item.size}GB`}
                    />
                ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {storageData.map(item => (
                <div key={item.type} className="p-3 border border-border/40 rounded-xl bg-background/30">
                    <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${item.color}`} />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">{item.type}</span>
                    </div>
                    </div>
                    <div className="text-lg font-black">{item.size}GB</div>
                    <Progress 
                    value={(item.size / totalStorage) * 100} 
                    className={`h-1 mt-2 bg-muted/30 [&>div]:${item.color}`}
                    />
                </div>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-foreground">Storage Matrix</h3>
          <p className="text-sm text-muted-foreground">
            Manage data purging cycles, legal holds, and regulatory masking.
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-lg shadow-primary/20 font-black">
              <Plus className="h-4 w-4 mr-2" />
              New Policy
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-card">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black">Retention Policy Configuration</DialogTitle>
              <DialogDescription>
                Define data persistence durations and autonomous purging triggers.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid gap-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest">Log Class</Label>
                <Select defaultValue="audit">
                  <SelectTrigger className="bg-background/50 border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {logTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          {type.icon}
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest">Persistence Horizon</Label>
                  <Input type="number" placeholder="7" className="bg-background/50 border-border/50" />
                </div>
                <div className="grid gap-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest">Temporal Unit</Label>
                  <Select defaultValue="years">
                    <SelectTrigger className="bg-background/50 border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="days">Earth Days</SelectItem>
                      <SelectItem value="months">Lunar Months</SelectItem>
                      <SelectItem value="years">Fiscal Years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest">Regulatory Framework</Label>
                <Select defaultValue="GDPR">
                  <SelectTrigger className="bg-background/50 border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GDPR">GDPR (European Union)</SelectItem>
                    <SelectItem value="DPDP">DPDP (Republic of India)</SelectItem>
                    <SelectItem value="CCPA">CCPA (State of California)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 border border-border/40 rounded-2xl bg-muted/20">
                  <div>
                    <p className="text-xs font-bold text-foreground">Auto-Archive</p>
                    <p className="text-[9px] text-muted-foreground">Move to cold vault.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 border border-border/40 rounded-2xl bg-destructive/5">
                  <div>
                    <p className="text-xs font-bold text-destructive">Auto-Purge</p>
                    <p className="text-[9px] text-muted-foreground font-medium">Permanent deletion.</p>
                  </div>
                  <Switch />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 border border-border/40 rounded-2xl bg-primary/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Shield className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">Enable PII Masking</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Scrub sensitive fields in archived indexes.</p>
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
                {creating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Archive className="h-4 w-4 mr-2" />}
                Init Policy
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Retention Grid */}
      <Card className="border-0 shadow-sm bg-card/60 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
            <Table>
            <TableHeader className="bg-muted/30">
                <TableRow className="border-border/40">
                <TableHead className="text-[10px] font-black uppercase tracking-widest py-4">Data Source</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Horizon</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Framework</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">Lifecycle</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">PII Mask</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">Hold</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Status</TableHead>
                <TableHead className="text-right text-[10px] font-black uppercase tracking-widest">Actions</TableHead>
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
                    rules.map(rule => {
                    const logType = logTypes.find(t => t.value === rule.logType);
                    return (
                        <TableRow key={rule.id} className="group hover:bg-muted/10 transition-colors border-border/40">
                        <TableCell className="py-4">
                            <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-background border border-border/50 text-muted-foreground group-hover:text-primary transition-colors">
                                {logType?.icon}
                            </div>
                            <span className="font-bold text-foreground">{logType?.label}</span>
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-primary" />
                            <span className="text-xs font-bold">{getRetentionDisplay(rule.retentionPeriod, rule.retentionUnit)}</span>
                            </div>
                        </TableCell>
                        <TableCell>
                            {rule.regulation ? (
                            <Badge variant="outline" className="text-[9px] font-black bg-background/50 border-border/50">
                                {rule.regulation}
                            </Badge>
                            ) : (
                            <span className="text-muted-foreground opacity-30 text-xs font-black">—</span>
                            )}
                        </TableCell>
                        <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-3">
                                <Archive className={`h-4 w-4 ${rule.autoArchive ? "text-success opacity-100" : "text-muted-foreground opacity-20"}`} />
                                <Trash2 className={`h-4 w-4 ${rule.autoDelete ? "text-destructive opacity-100" : "text-muted-foreground opacity-20"}`} />
                            </div>
                        </TableCell>
                        <TableCell className="text-center">
                            {rule.maskingEnabled ? (
                                <Badge variant="secondary" className="text-[9px] font-bold px-1.5 h-4">
                                {rule.maskingFields.length}f
                                </Badge>
                            ) : (
                                <span className="text-muted-foreground opacity-30 text-xs font-black">—</span>
                            )}
                        </TableCell>
                        <TableCell className="text-center">
                            {rule.legalHoldOverride ? (
                                <div className="flex justify-center">
                                    <Lock className="h-3.5 w-3.5 text-warning" />
                                </div>
                            ) : (
                                <span className="text-muted-foreground opacity-30 text-xs font-black">—</span>
                            )}
                        </TableCell>
                        <TableCell>{getStatusBadge(rule.status)}</TableCell>
                        <TableCell className="text-right">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Settings2 className="h-4 w-4" />
                        </Button>
                        </TableCell>
                        </TableRow>
                    );
                    })
                )}
            </TableBody>
            </Table>
        </div>
      </Card>

      {/* Compliance Warning */}
      <Card className="border-0 shadow-lg shadow-primary/5 bg-gradient-to-r from-primary/10 via-background to-background backdrop-blur-md">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-primary/20 text-primary">
                <Shield className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-black text-foreground mb-1">Global Audit Compliance Advisory</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Vault policies are strictly enforced at the data plane. **GDPR Section 17 (Right to Erasure)** and **Article 30 (Records of Processing Activities)** 
                require precise audit trails of data pruning. Automated archival ensures data sovereignty while reducing the attack surface.
                Legal holds automatically override any scheduled purging to ensure forensic integrity during active investigations.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
