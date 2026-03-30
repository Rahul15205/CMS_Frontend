import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  Settings2,
  Lock,
  Eye,
  EyeOff,
  Key,
  Clock,
  History,
  Play,
  Info,
  Smartphone,
  FileText,
  Users,
  Activity,
  RefreshCw,
  Loader2,
  Save
} from "lucide-react";
import { AadhaarConfig, VerificationMode, UsageScope, LifecycleStatus } from "./types";
import { useToast } from "@/hooks/use-toast";
import { aadhaarConfigService } from "@/services/configurationsService";
import { Skeleton } from "@/components/ui/skeleton";

const getStatusBadge = (status: LifecycleStatus) => {
  switch (status) {
    case "active":
      return <Badge className="bg-success/10 text-success border-success/20">Active</Badge>;
    case "draft":
      return <Badge variant="secondary">Draft</Badge>;
    case "disabled":
      return <Badge variant="outline">Disabled</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export function AadhaarKYCConfig() {
  const [config, setConfig] = useState<AadhaarConfig | null>(null);
  const [activeTab, setActiveTab] = useState("configuration");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingChange, setPendingChange] = useState<{ field: string; value: any } | null>(null);
  const [showApiCredentials, setShowApiCredentials] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    try {
      const data = await aadhaarConfigService.get();
      setConfig(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load Aadhaar configuration.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const handleSensitiveChange = (field: string, value: any) => {
    setPendingChange({ field, value });
    setShowConfirmDialog(true);
  };

  const confirmChange = () => {
    if (pendingChange && config) {
      setConfig({ ...config, [pendingChange.field]: pendingChange.value });
    }
    setShowConfirmDialog(false);
    setPendingChange(null);
  };

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    try {
      const updated = await aadhaarConfigService.update(config);
      setConfig(updated);
      toast({
        title: "Configuration Saved",
        description: "Aadhaar KYC settings have been updated successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save configuration.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <div className="flex justify-between items-center">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!config) return null;

  const monitoringStats = [
    { title: "Allowed Scopes", value: config.usageScopes.length, color: "text-foreground" },
    { title: "Retention Days", value: config.consentRetentionDays, color: "text-success" },
    { title: "Session Timeout", value: `${config.timeoutSeconds}s`, color: "text-destructive" },
    { title: "Verification Mode", value: config.verificationMode, color: "text-primary" },
  ];

  return (
    <div className="space-y-6">
      {/* Critical Warning Banner */}
      <Alert className="border-warning/50 bg-warning/5">
        <AlertTriangle className="h-5 w-5 text-warning" />
        <AlertTitle className="text-warning">Aadhaar eKYC - Regulatory Critical Configuration</AlertTitle>
        <AlertDescription>
          This configuration is governed by UIDAI guidelines and DPDP Act, 2023. All changes are 
          audited. Unauthorized modifications may result in regulatory non-compliance. Only Super 
          Admins can modify production settings.
        </AlertDescription>
      </Alert>

      {/* Status and Version */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Status:</span>
            {getStatusBadge(config.status)}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Environment:</span>
            <Badge variant={config.environment === "production" ? "default" : "secondary"}>
              {config.environment}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Version {config.version}</span>
          </div>
        </div>
        <div className="flex gap-2">
          {config.environment === "sandbox" && (
            <Button
              variant="outline"
              onClick={() => toast({ title: "Verification Test", description: "Sandbox verification request sent." })}
            >
              <Play className="h-4 w-4 mr-2" />
              Test Verification
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => toast({ title: "Audit Log", description: "Aadhaar audit trail opened." })}
          >
            <History className="h-4 w-4 mr-2" />
            View Audit Log
          </Button>
          <Button 
            variant="default" 
            onClick={handleSave}
            disabled={saving}
            className="bg-primary hover:bg-primary/90 shadow-sm"
          >
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 bg-muted/50 p-1">
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="security">Security & Privacy</TabsTrigger>
          <TabsTrigger value="integration">Integration</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        {/* Configuration Tab */}
        <TabsContent value="configuration" className="space-y-6 mt-6">
          {/* Enable/Disable */}
          <Card className="border-0 shadow-sm bg-card/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5 text-primary" />
                Aadhaar eKYC Enablement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-border/50 rounded-xl bg-muted/20">
                <div>
                  <p className="font-semibold">Enable Aadhaar eKYC</p>
                  <p className="text-sm text-muted-foreground">
                    Master switch for Aadhaar-based identity verification
                  </p>
                </div>
                <Switch 
                  checked={config.enabled}
                  onCheckedChange={(checked) => handleSensitiveChange("enabled", checked)}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Environment</Label>
                  <Select 
                    value={config.environment}
                    onValueChange={(value) => handleSensitiveChange("environment", value)}
                  >
                    <SelectTrigger className="bg-background/50 border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sandbox">Sandbox (Testing)</SelectItem>
                      <SelectItem value="production">Production</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Verification Mode</Label>
                  <Select 
                    value={config.verificationMode}
                    onValueChange={(value) => setConfig(prev => prev ? ({ ...prev, verificationMode: value as VerificationMode }) : null)}
                  >
                    <SelectTrigger className="bg-background/50 border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="otp">OTP-based eKYC</SelectItem>
                      <SelectItem value="offline-xml">Offline Aadhaar XML</SelectItem>
                      <SelectItem value="masked-only">Masked Aadhaar Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Usage Scope */}
          <Card className="border-0 shadow-sm bg-card/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Usage Scope</CardTitle>
              <CardDescription>Select where Aadhaar verification is permitted</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { id: "rights-verification", icon: FileText, title: "Rights Requests Identity Verification", desc: "Verify identity for data access, erasure requests" },
                { id: "grievance-verification", icon: Users, title: "Grievance Verification", desc: "Verify identity for grievance submissions" },
                { id: "consent-verification", icon: CheckCircle2, title: "Consent Verification (Explicit Only)", desc: "Verify identity for high-value consent collection" }
              ].map((scope) => (
                <div key={scope.id} className="flex items-center justify-between p-4 border border-border/50 rounded-xl hover:bg-muted/30 transition-all duration-200">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <scope.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold">{scope.title}</p>
                      <p className="text-sm text-muted-foreground">{scope.desc}</p>
                    </div>
                  </div>
                  <Switch 
                    checked={config.usageScopes.includes(scope.id as UsageScope)}
                    onCheckedChange={(checked) => {
                      const newScopes = checked 
                        ? [...config.usageScopes, scope.id as UsageScope]
                        : config.usageScopes.filter(s => s !== scope.id);
                      setConfig(prev => prev ? ({ ...prev, usageScopes: newScopes }) : null);
                    }}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Consent Controls */}
          <Card className="border-0 shadow-sm bg-card/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Consent & Purpose Controls</CardTitle>
              <CardDescription>Configure consent requirements for Aadhaar verification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-success/20 rounded-xl bg-success/5">
                <div>
                  <p className="font-semibold text-success-foreground">Mandatory Explicit Consent</p>
                  <p className="text-sm text-muted-foreground">Require explicit consent before initiating eKYC</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-success text-success-foreground border-0">Enforced</Badge>
                  <Lock className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Consent Text (shown to user)</Label>
                <Textarea 
                  value={config.consentText || ""}
                  onChange={(e) => setConfig(prev => prev ? ({ ...prev, consentText: e.target.value }) : null)}
                  rows={3}
                  className="bg-background/50 border-border/50 resize-none focus:ring-primary/20"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Consent Retention (days)</Label>
                  <Input 
                    type="number" 
                    value={config.consentRetentionDays}
                    onChange={(e) => setConfig(prev => prev ? ({ ...prev, consentRetentionDays: parseInt(e.target.value) }) : null)}
                    className="bg-background/50 border-border/50"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security & Privacy Tab */}
        <TabsContent value="security" className="space-y-6 mt-6">
          <Card className="border-0 shadow-sm bg-card/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Lock className="h-5 w-5 text-primary" />
                Security & Privacy Controls
              </CardTitle>
              <CardDescription>
                Critical settings to ensure UIDAI and DPDP compliance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-success/30 bg-success/5 mb-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <AlertTitle className="text-success font-semibold">Privacy-First Configuration</AlertTitle>
                <AlertDescription className="text-success/80">
                  All security controls are enabled to ensure no Aadhaar number is stored and all 
                  verification artifacts are automatically purged.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border border-success/20 rounded-xl bg-success/5">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-success/10 text-success">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-success-foreground">No Aadhaar Storage</p>
                      <p className="text-sm text-muted-foreground">Aadhaar numbers are never stored in the system</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-success text-success-foreground border-0">Enforced</Badge>
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border border-border/50 rounded-xl hover:bg-muted/30 transition-all duration-200">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                      <EyeOff className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold">Masked Display Only</p>
                      <p className="text-sm text-muted-foreground">Show only last 4 digits (XXXX-XXXX-1234)</p>
                    </div>
                  </div>
                  <Switch 
                    checked={config.maskedDisplayOnly}
                    onCheckedChange={(checked) => setConfig(prev => prev ? ({ ...prev, maskedDisplayOnly: checked }) : null)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border border-border/50 rounded-xl hover:bg-muted/30 transition-all duration-200">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                      <Key className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold">Tokenized Verification Reference</p>
                      <p className="text-sm text-muted-foreground">Use tokens instead of Aadhaar for internal references</p>
                    </div>
                  </div>
                  <Switch 
                    checked={config.tokenizedReference}
                    onCheckedChange={(checked) => setConfig(prev => prev ? ({ ...prev, tokenizedReference: checked }) : null)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border border-border/50 rounded-xl hover:bg-muted/30 transition-all duration-200">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                      <Lock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold">Encryption in Transit & At Rest</p>
                      <p className="text-sm text-muted-foreground">AES-256 encryption for all verification data</p>
                    </div>
                  </div>
                  <Switch 
                    checked={config.encryptionEnabled}
                    onCheckedChange={(checked) => handleSensitiveChange("encryptionEnabled", checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border border-border/50 rounded-xl hover:bg-muted/30 transition-all duration-200">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                      <RefreshCw className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold">Auto-Purge Verification Artifacts</p>
                      <p className="text-sm text-muted-foreground">
                        Automatically delete temporary verification data after {config.autoPurgeDays} days
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number" 
                      value={config.autoPurgeDays}
                      onChange={(e) => setConfig(prev => prev ? ({ ...prev, autoPurgeDays: parseInt(e.target.value) }) : null)}
                      className="w-24 bg-background/50"
                    />
                    <span className="text-sm text-muted-foreground font-medium">days</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integration Tab */}
        <TabsContent value="integration" className="space-y-6 mt-6">
          <Card className="border-0 shadow-sm bg-card/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">UIDAI Service Provider Configuration</CardTitle>
              <CardDescription>Configure connection to UIDAI Authentication Service</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Service Provider Name</Label>
                <Input 
                  value={config.serviceProviderName}
                  onChange={(e) => setConfig(prev => prev ? ({ ...prev, serviceProviderName: e.target.value }) : null)}
                  className="bg-background/50"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-semibold">API Credentials</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                      <Input 
                        type={showApiCredentials ? "text" : "password"}
                        value="••••••••••••••••••••••••"
                        readOnly
                        className="font-mono bg-background/50 pr-10"
                      />
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="absolute right-0 top-0 h-full hover:bg-transparent"
                        onClick={() => setShowApiCredentials(!showApiCredentials)}
                      >
                        {showApiCredentials ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                      </Button>
                  </div>
                  <Button
                    variant="outline"
                    className="border-dashed"
                    onClick={() => toast({ title: "Credentials Update", description: "Credential update workflow opened." })}
                  >
                    <Settings2 className="h-4 w-4 mr-2" />
                    Update
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Rate Limit (requests/hour)</Label>
                  <Input 
                    type="number" 
                    value={config.rateLimit}
                    onChange={(e) => setConfig(prev => prev ? ({ ...prev, rateLimit: parseInt(e.target.value) }) : null)}
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Timeout (seconds)</Label>
                  <Input 
                    type="number" 
                    value={config.timeoutSeconds}
                    onChange={(e) => setConfig(prev => prev ? ({ ...prev, timeoutSeconds: parseInt(e.target.value) }) : null)}
                    className="bg-background/50"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monitoring Tab */}
        <TabsContent value="monitoring" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {monitoringStats.map((stat, i) => (
                <Card key={i} className="border-0 shadow-sm bg-card/60 backdrop-blur-sm overflow-hidden">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{stat.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                    </CardContent>
                </Card>
            ))}
          </div>

          <Card className="border-0 shadow-sm bg-card/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="h-5 w-5 text-primary" />
                Verification Scope
              </CardTitle>
            </CardHeader>
            <CardContent>
              {config.usageScopes.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border/50 bg-background/20 p-6 text-sm text-muted-foreground">
                  No Aadhaar verification scopes are enabled.
                </div>
              ) : (
                <div className="space-y-3">
                  {config.usageScopes.map(scope => (
                    <div key={scope} className="flex items-center justify-between rounded-xl border border-border/50 bg-background/30 p-4 text-sm">
                      <span className="font-semibold">{scope}</span>
                      <Badge variant="outline">Enabled</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="h-5 w-5" />
              Confirm Sensitive Change
            </DialogTitle>
            <DialogDescription>
              You are about to modify a critical Aadhaar eKYC configuration. This change will be 
              logged and may require additional approval for production environments.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Alert className="bg-muted border-border/50">
              <Info className="h-4 w-4 text-primary" />
              <AlertTitle className="text-sm font-semibold">Audit Trail Notice</AlertTitle>
              <AlertDescription className="text-xs text-muted-foreground">
                All changes to Aadhaar configuration are logged with your user ID, timestamp, 
                and IP address for regulatory compliance.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmChange} className="bg-warning hover:bg-warning/90 text-warning-foreground">
              Confirm Change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
