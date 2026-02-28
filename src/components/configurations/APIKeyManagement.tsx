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
} from "lucide-react";
import { APIKey } from "./types";
import { useToast } from "@/hooks/use-toast";

const mockAPIKeys: APIKey[] = [
  {
    id: "1",
    name: "Production API - Main App",
    keyPrefix: "pk_live_****",
    tenant: "Acme Corp",
    application: "Main Portal",
    scopes: ["consent:read", "consent:write", "rights:read"],
    rateLimit: 1000,
    rateLimitPeriod: "minute",
    expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    ipRestrictions: ["10.0.0.0/8"],
    status: "active",
    lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000),
    usageCount: 45230,
    createdAt: new Date(),
    createdBy: "Admin",
  },
  {
    id: "2",
    name: "Mobile App Integration",
    keyPrefix: "pk_live_****",
    tenant: "Acme Corp",
    application: "Mobile App",
    scopes: ["consent:read", "user:read"],
    rateLimit: 500,
    rateLimitPeriod: "minute",
    expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    ipRestrictions: [],
    status: "active",
    lastUsed: new Date(Date.now() - 30 * 60 * 1000),
    usageCount: 12450,
    createdAt: new Date(),
    createdBy: "Admin",
  },
  {
    id: "3",
    name: "Analytics Service",
    keyPrefix: "pk_live_****",
    tenant: "Acme Corp",
    application: "Analytics",
    scopes: ["analytics:read"],
    rateLimit: 100,
    rateLimitPeriod: "hour",
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    ipRestrictions: ["192.168.1.0/24"],
    status: "active",
    lastUsed: new Date(Date.now() - 24 * 60 * 60 * 1000),
    usageCount: 5620,
    createdAt: new Date(),
    createdBy: "Admin",
  },
  {
    id: "4",
    name: "Legacy Integration",
    keyPrefix: "pk_live_****",
    tenant: "Acme Corp",
    application: "Legacy System",
    scopes: ["consent:read"],
    rateLimit: 50,
    rateLimitPeriod: "minute",
    expiryDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    ipRestrictions: [],
    status: "expired",
    usageCount: 890,
    createdAt: new Date(),
    createdBy: "Admin",
  },
];

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
  if (key.expiryDate && key.expiryDate.getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000) {
    return { status: "warning", label: "Expiring Soon" };
  }
  return { status: "healthy", label: "Healthy" };
};

export function APIKeyManagement() {
  const [keys, setKeys] = useState<APIKey[]>(mockAPIKeys);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [showKey, setShowKey] = useState<string | null>(null);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const { toast } = useToast();

  const activeKeys = keys.filter(k => k.status === "active").length;
  const expiredKeys = keys.filter(k => k.status === "expired").length;
  const totalUsage = keys.reduce((acc, k) => acc + k.usageCount, 0);

  const handleCreateKey = () => {
    // Simulate key generation
    const generated = "pk_live_" + Math.random().toString(36).substring(2, 15);
    setGeneratedKey(generated);
    const newKey: APIKey = {
      id: `k-${Date.now()}`,
      name: `New API Key ${keys.length + 1}`,
      keyPrefix: `${generated.slice(0, 10)}****`,
      tenant: "Acme Corp",
      application: "New Integration",
      scopes: ["consent:read"],
      rateLimit: 1000,
      rateLimitPeriod: "minute",
      status: "active",
      usageCount: 0,
      createdAt: new Date(),
      createdBy: "Admin",
    };
    setKeys((prev) => [newKey, ...prev]);
    toast({ title: "API Key Generated", description: `${newKey.name} created.` });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "API key copied to clipboard." });
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total API Keys</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{keys.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Keys</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{activeKeys}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Expired</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{expiredKeys}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total API Calls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsage.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Security Warning */}
      {expiredKeys > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <div>
                <p className="font-medium">Security Alert</p>
                <p className="text-sm text-muted-foreground">
                  {expiredKeys} API key(s) have expired. Please rotate or revoke them to maintain security.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">API Key Management</h3>
          <p className="text-sm text-muted-foreground">
            Securely manage API access for integrations
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={(open) => { setIsCreateOpen(open); setGeneratedKey(null); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Generate New Key
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Generate API Key</DialogTitle>
              <DialogDescription>
                Create a new API key with specific scopes and restrictions
              </DialogDescription>
            </DialogHeader>
            
            {!generatedKey ? (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Key Name</Label>
                  <Input id="name" placeholder="e.g., Production API - Main App" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Tenant</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tenant" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="acme">Acme Corp</SelectItem>
                        <SelectItem value="globaltech">GlobalTech Inc.</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Application</Label>
                    <Input placeholder="e.g., Main Portal" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Scopes / Permissions</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {scopes.map(scope => (
                      <div key={scope.value} className="flex items-center gap-2">
                        <Switch id={scope.value} />
                        <Label htmlFor={scope.value} className="font-normal">{scope.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label>Rate Limit</Label>
                    <Input type="number" placeholder="1000" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Period</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Per minute" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minute">Per Minute</SelectItem>
                        <SelectItem value="hour">Per Hour</SelectItem>
                        <SelectItem value="day">Per Day</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Expiry (days)</Label>
                    <Input type="number" placeholder="90" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>IP Restrictions (optional)</Label>
                  <Input placeholder="e.g., 10.0.0.0/8, 192.168.1.0/24" />
                  <p className="text-xs text-muted-foreground">Comma-separated CIDR blocks</p>
                </div>
              </div>
            ) : (
              <div className="py-6">
                <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg mb-4">
                  <div className="flex items-center gap-2 text-warning mb-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-medium">Save this key now!</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This is the only time you'll see the full API key. Store it securely.
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg font-mono text-sm flex items-center justify-between">
                  <span>{generatedKey}</span>
                  <Button variant="ghost" size="icon" onClick={() => copyToClipboard(generatedKey)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            
            <DialogFooter>
              {!generatedKey ? (
                <>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                  <Button onClick={handleCreateKey}>Generate Key</Button>
                </>
              ) : (
                <Button
                  onClick={() => {
                    setIsCreateOpen(false);
                    toast({ title: "Done", description: "API key dialog closed." });
                  }}
                >
                  Done
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* API Keys Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Key Name</TableHead>
              <TableHead>Application</TableHead>
              <TableHead>Scopes</TableHead>
              <TableHead>Rate Limit</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Health</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {keys.map(key => {
              const health = getHealthStatus(key);
              return (
                <TableRow key={key.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{key.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{key.keyPrefix}</p>
                    </div>
                  </TableCell>
                  <TableCell>{key.application}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {key.scopes.slice(0, 2).map(scope => (
                        <Badge key={scope} variant="secondary" className="text-xs">
                          {scope.split(":")[0]}
                        </Badge>
                      ))}
                      {key.scopes.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{key.scopes.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {key.rateLimit}/{key.rateLimitPeriod}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Activity className="h-3 w-3 text-muted-foreground" />
                      {key.usageCount.toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {health.status === "healthy" && <CheckCircle2 className="h-4 w-4 text-success" />}
                      {health.status === "warning" && <Clock className="h-4 w-4 text-warning" />}
                      {health.status === "critical" && <AlertTriangle className="h-4 w-4 text-destructive" />}
                      <span className="text-xs">{health.label}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(key.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Rotate Key"
                        onClick={() => {
                          setKeys((prev) =>
                            prev.map((item) =>
                              item.id === key.id
                                ? { ...item, status: "rotating" }
                                : item
                            )
                          );
                          toast({ title: "Rotation Started", description: `Key rotation started for ${key.name}.` });
                        }}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" title="Revoke Key">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Revoke API Key?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. Any applications using this key will lose access immediately.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => {
                                setKeys((prev) => prev.map((item) => (item.id === key.id ? { ...item, status: "revoked" } : item)));
                                toast({ title: "Key Revoked", description: `${key.name} has been revoked.` });
                              }}
                            >
                              Revoke Key
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
