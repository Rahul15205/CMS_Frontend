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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Key,
  Plus,
  Eye,
  EyeOff,
  RefreshCw,
  Trash2,
  Copy,
  Shield,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
  Lock,
  History
} from "lucide-react";
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { APIKey } from "./types";
import { useToast } from "@/hooks/use-toast";
import { apiKeysService } from "@/services/configurationsService";
import { Skeleton } from "@/components/ui/skeleton";

const scopes = [
  { value: "consent:read", label: "Consent Read" },
  { value: "consent:write", label: "Consent Write" },
  { value: "rights:read", label: "Rights Read" },
  { value: "rights:write", label: "Rights Write" },
  { value: "user:read", label: "User Read" },
  { value: "analytics:read", label: "Analytics Read" },
  { value: "admin:full", label: "Admin Full Access" },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "active":
      return <Badge className="bg-success/10 text-success border-success/20">Active</Badge>;
    case "expired":
      return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Expired</Badge>;
    case "revoked":
      return <Badge variant="secondary">Revoked</Badge>;
    case "rotating":
      return <Badge className="bg-warning/10 text-warning border-warning/20">Rotating</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getHealthStatus = (key: APIKey) => {
  if (key.status === "expired") return { status: "critical", label: "Expired" };
  const expiry = key.expiryDate ? new Date(key.expiryDate) : null;
  if (expiry && expiry.getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000) {
    return { status: "warning", label: "Expiring Soon" };
  }
  return { status: "healthy", label: "Healthy" };
};

export function APIKeyManagement() {
  const [keys, setKeys] = useState<APIKey[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [showKey, setShowKey] = useState<string | null>(null);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  const fetchKeys = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiKeysService.getAll();
      setKeys(Array.isArray(data) ? data : []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load API keys.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const activeKeys = keys.filter(k => k.status === "active").length;
  const expiredKeys = keys.filter(k => k.status === "expired").length;
  const totalUsage = keys.reduce((acc, k) => acc + k.usageCount, 0);

  const handleCreateKey = async () => {
    setCreating(true);
    try {
      const newKeyData: Partial<APIKey> = {
        name: `Prod Key ${keys.length + 1}`,
        application: "System Integration",
        tenant: "Acme Corp",
        scopes: ["consent:read", "rights:read"],
        rateLimit: 1000,
        rateLimitPeriod: "minute",
        status: "active",
        usageCount: 0,
        createdAt: new Date(),
        createdBy: "Super Admin",
      };
      
      const created = await apiKeysService.create(newKeyData as APIKey);
      // Simulate real key return for display
      const fullKey = "pk_live_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      setGeneratedKey(fullKey);
      setKeys(prev => [created, ...prev]);
      toast({ title: "API Key Generated", description: "Your new API key is ready." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to generate API key.", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      const key = keys.find(k => k.id === id);
      if (!key) return;
      
      const updated = await apiKeysService.update(id, { ...key, status: "revoked" });
      setKeys(prev => prev.map(k => k.id === id ? updated : k));
      toast({ title: "Key Revoked", description: "API key has been permanently revoked." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to revoke key.", variant: "destructive" });
    }
  };

  const handleRotate = async (id: string) => {
    try {
      const key = keys.find(k => k.id === id);
      if (!key) return;
      
      const updated = await apiKeysService.update(id, { ...key, status: "rotating" });
      setKeys(prev => prev.map(k => k.id === id ? updated : k));
      toast({ title: "Rotation Initiated", description: "Key rotation process started." });
      
      // Simulate completion
      setTimeout(async () => {
          const final = await apiKeysService.update(id, { ...key, status: "active", lastUsed: new Date() });
          setKeys(prev => prev.map(k => k.id === id ? final : k));
      }, 2000);
    } catch (error) {
      toast({ title: "Error", description: "Failed to rotate key.", variant: "destructive" });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "API key copied to clipboard." });
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
            { title: "Total API Keys", value: loading ? "..." : keys.length, icon: Key, color: "text-foreground" },
            { title: "Active Keys", value: loading ? "..." : activeKeys, icon: CheckCircle2, color: "text-success" },
            { title: "Expired", value: loading ? "..." : expiredKeys, icon: AlertTriangle, color: "text-destructive" },
            { title: "Total API Calls", value: loading ? "..." : totalUsage.toLocaleString(), icon: Activity, color: "text-primary" }
        ].map((stat, i) => (
            <Card key={i} className="border-0 shadow-sm bg-card/60 backdrop-blur-sm overflow-hidden group hover:shadow-md transition-all duration-300">
                <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <stat.icon className="h-3.5 w-3.5" />
                        {stat.title}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                </CardContent>
            </Card>
        ))}
      </div>

      {/* Security Warning */}
      {!loading && expiredKeys > 0 && (
        <Card className="border-destructive/30 bg-destructive/10 border-dashed animate-in fade-in slide-in-from-top-2 duration-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-full bg-destructive/20 text-destructive">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-destructive">Security Overdue</p>
                <p className="text-sm text-destructive/80">
                  {expiredKeys} API key(s) have expired. This presents a service continuity risk. Please rotate or revoke them immediately.
                </p>
              </div>
              <Button variant="outline" size="sm" className="border-destructive/30 text-destructive hover:bg-destructive/10" onClick={() => toast({ title: "Audit Report", description: "Generating security audit report..." })}>
                Review Keys
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-foreground">API Key Registry</h3>
          <p className="text-sm text-muted-foreground">
            Manage authentication credentials for external applications and integrations.
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={(open) => { setIsCreateOpen(open); setGeneratedKey(null); }}>
          <DialogTrigger asChild>
            <Button className="shadow-lg shadow-primary/20">
              <Plus className="h-4 w-4 mr-2" />
              Generate New Key
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-card border-border/50">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                  <Lock className="h-6 w-6 text-primary" />
                  Key Generation Wizard
              </DialogTitle>
              <DialogDescription>
                Configure specific permissions and network restrictions for this key.
              </DialogDescription>
            </DialogHeader>
            
            {!generatedKey ? (
              <div className="grid gap-6 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-sm font-semibold">Key Name</Label>
                  <Input id="name" placeholder="e.g., Mobile App - Prod" className="bg-background/50 border-border/50" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="text-sm font-semibold">Tenant Ownership</Label>
                    <Select defaultValue="acme">
                      <SelectTrigger className="bg-background/50 border-border/50">
                        <SelectValue placeholder="Select tenant" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="acme">Acme Corp</SelectItem>
                        <SelectItem value="globaltech">GlobalTech Inc.</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-sm font-semibold">Associated Application</Label>
                    <Input placeholder="e.g., Main Portal" className="bg-background/50 border-border/50" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label className="text-sm font-semibold">Scoped Permissions</Label>
                  <div className="grid grid-cols-2 gap-3 p-4 border border-border/50 rounded-xl bg-muted/20">
                    {scopes.map(scope => (
                      <div key={scope.value} className="flex items-center gap-3">
                        <Switch id={`wizard-${scope.value}`} defaultChecked={scope.value.includes('read')} />
                        <Label htmlFor={`wizard-${scope.value}`} className="text-xs font-medium cursor-pointer">{scope.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label className="text-sm font-semibold">Rate Limit</Label>
                    <Input type="number" defaultValue="1000" className="bg-background/50 border-border/50" />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-sm font-semibold">Period</Label>
                    <Select defaultValue="minute">
                      <SelectTrigger className="bg-background/50 border-border/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minute">Minute</SelectItem>
                        <SelectItem value="hour">Hour</SelectItem>
                        <SelectItem value="day">Day</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-sm font-semibold">Life Span (Days)</Label>
                    <Input type="number" defaultValue="90" className="bg-background/50 border-border/50" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 space-y-6">
                <Alert className="bg-warning/10 border-warning/20 border-dashed">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  <AlertTitle className="text-warning font-bold">CRITICAL: Save Secret Key</AlertTitle>
                  <AlertDescription className="text-warning/80">
                    This secret key will never be shown again. Ensure you store it in a secure vault.
                  </AlertDescription>
                </Alert>
                <div className="group relative">
                    <div className="p-5 bg-muted rounded-xl font-mono text-sm break-all border border-border/50 shadow-inner">
                      {generatedKey}
                    </div>
                    <Button 
                        variant="secondary" 
                        size="sm" 
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                        onClick={() => copyToClipboard(generatedKey)}
                    >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                    </Button>
                </div>
              </div>
            )}
            
            <DialogFooter className="gap-2 pt-4">
              {!generatedKey ? (
                <>
                  <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                  <Button onClick={handleCreateKey} disabled={creating}>
                    {creating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                    Generate Production Key
                  </Button>
                </>
              ) : (
                <Button
                  className="w-full"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Confirm & Close
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* API Keys Table */}
      <Card className="border-0 shadow-sm bg-card/60 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
            <Table>
            <TableHeader className="bg-muted/30">
                <TableRow>
                <TableHead className="font-bold">Key Identity</TableHead>
                <TableHead className="font-bold">App Context</TableHead>
                <TableHead className="font-bold">Access Scopes</TableHead>
                <TableHead className="font-bold">Limits</TableHead>
                <TableHead className="font-bold">Traffic</TableHead>
                <TableHead className="font-bold">Health</TableHead>
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
                    keys.map(key => {
                    const health = getHealthStatus(key);
                    return (
                        <TableRow key={key.id} className="group hover:bg-muted/20 transition-colors">
                        <TableCell>
                            <div>
                            <p className="font-semibold text-foreground">{key.name}</p>
                            <p className="text-[10px] text-muted-foreground font-mono bg-muted py-0.5 px-1.5 rounded w-fit mt-1">{key.keyPrefix}</p>
                            </div>
                        </TableCell>
                        <TableCell className="text-sm font-medium">{key.application}</TableCell>
                        <TableCell>
                            <div className="flex flex-wrap gap-1">
                            {key.scopes.slice(0, 2).map(scope => (
                                <Badge key={scope} variant="outline" className="text-[9px] uppercase tracking-tighter bg-primary/5 text-primary border-primary/20">
                                {scope.includes(':') ? scope.split(":")[0] : scope}
                                </Badge>
                            ))}
                            {key.scopes.length > 2 && (
                                <Badge variant="secondary" className="text-[9px] font-bold">
                                +{key.scopes.length - 2}
                                </Badge>
                            )}
                            </div>
                        </TableCell>
                        <TableCell className="text-xs font-mono">
                            {key.rateLimit}/{key.rateLimitPeriod[0]}
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                            <Activity className="h-3 w-3 text-primary animate-pulse" />
                            <span className="text-xs font-bold">{key.usageCount.toLocaleString()}</span>
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                            {health.status === "healthy" && <CheckCircle2 className="h-3.5 w-3.5 text-success" />}
                            {health.status === "warning" && <Clock className="h-3.5 w-3.5 text-warning" />}
                            {health.status === "critical" && <AlertTriangle className="h-3.5 w-3.5 text-destructive" />}
                            <span className="text-[10px] font-semibold uppercase tracking-widest">{health.label}</span>
                            </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(key.status)}</TableCell>
                        <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 hover:text-primary"
                                        onClick={() => handleRotate(key.id)}
                                        disabled={key.status === "revoked" || key.status === "rotating"}
                                    >
                                        <RefreshCw className={`h-4 w-4 ${key.status === "rotating" ? "animate-spin" : ""}`} />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Rotate Key</TooltipContent>
                            </Tooltip>
                            
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" disabled={key.status === "revoked"}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-card border-border/50">
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                                        <AlertTriangle className="h-5 w-5" />
                                        Revoke Access Key?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action is irreversible. All clients using <span className="font-bold text-foreground">"{key.name}"</span> will be disconnected instantly.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel className="bg-muted hover:bg-muted/80">Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        onClick={() => handleRevoke(key.id)}
                                    >
                                        Permanently Revoke
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                            </div>
                        </TableCell>
                        </TableRow>
                    );
                    })
                )}
            </TableBody>
            </Table>
        </div>
      </Card>
    </div>
  );
}
