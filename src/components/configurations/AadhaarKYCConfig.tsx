import { useState } from "react";
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
} from "lucide-react";
import { AadhaarConfig, VerificationMode, UsageScope, LifecycleStatus } from "./types";
import { useToast } from "@/hooks/use-toast";

const mockConfig: AadhaarConfig = {
  id: "1",
  enabled: true,
  tenantId: "acme-corp",
  environment: "production",
  verificationMode: "otp",
  usageScopes: ["rights-verification", "grievance-verification"],
  consentRequired: true,
  consentText: "I consent to verification of my identity using Aadhaar eKYC for the purpose of processing my data rights request. My Aadhaar number will not be stored.",
  consentRetentionDays: 30,
  noStorageEnforced: true,
  maskedDisplayOnly: true,
  tokenizedReference: true,
  encryptionEnabled: true,
  autoPurgeEnabled: true,
  autoPurgeDays: 7,
  serviceProviderName: "UIDAI Licensed ASA",
  rateLimit: 100,
  timeoutSeconds: 30,
  status: "active",
  version: 2,
  createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
  updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  createdBy: "Super Admin",
};

// Mock usage statistics
const usageStats = {
  totalVerifications: 1245,
  successRate: 97.2,
  failureRate: 2.8,
  monthlyUsage: [
    { month: "Jan", count: 320 },
    { month: "Feb", count: 285 },
    { month: "Mar", count: 410 },
    { month: "Apr", count: 230 },
  ],
  byPurpose: [
    { purpose: "Rights Verification", count: 892, percentage: 71.6 },
    { purpose: "Grievance Verification", count: 353, percentage: 28.4 },
  ],
};

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
  const [config, setConfig] = useState<AadhaarConfig>(mockConfig);
  const [activeTab, setActiveTab] = useState("configuration");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingChange, setPendingChange] = useState<{ field: string; value: any } | null>(null);
  const [showApiCredentials, setShowApiCredentials] = useState(false);
  const { toast } = useToast();

  const handleSensitiveChange = (field: string, value: any) => {
    setPendingChange({ field, value });
    setShowConfirmDialog(true);
  };

  const confirmChange = () => {
    if (pendingChange) {
      setConfig(prev => ({ ...prev, [pendingChange.field]: pendingChange.value }));
    }
    setShowConfirmDialog(false);
    setPendingChange(null);
  };

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
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="security">Security & Privacy</TabsTrigger>
          <TabsTrigger value="integration">Integration</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        {/* Configuration Tab */}
        <TabsContent value="configuration" className="space-y-6">
          {/* Enable/Disable */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Aadhaar eKYC Enablement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Enable Aadhaar eKYC</p>
                  <p className="text-sm text-muted-foreground">
                    Master switch for Aadhaar-based identity verification
                  </p>
                </div>
                <Switch 
                  checked={config.enabled}
                  onCheckedChange={(checked) => handleSensitiveChange("enabled", checked)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Environment</Label>
                  <Select 
                    value={config.environment}
                    onValueChange={(value) => handleSensitiveChange("environment", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sandbox">Sandbox (Testing)</SelectItem>
                      <SelectItem value="production">Production</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Verification Mode</Label>
                  <Select 
                    value={config.verificationMode}
                    onValueChange={(value) => setConfig(prev => ({ ...prev, verificationMode: value as VerificationMode }))}
                  >
                    <SelectTrigger>
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
          <Card>
            <CardHeader>
              <CardTitle>Usage Scope</CardTitle>
              <CardDescription>Select where Aadhaar verification is permitted</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Rights Requests Identity Verification</p>
                    <p className="text-sm text-muted-foreground">Verify identity for data access, erasure requests</p>
                  </div>
                </div>
                <Switch 
                  checked={config.usageScopes.includes("rights-verification")}
                  onCheckedChange={(checked) => {
                    const newScopes = checked 
                      ? [...config.usageScopes, "rights-verification" as UsageScope]
                      : config.usageScopes.filter(s => s !== "rights-verification");
                    setConfig(prev => ({ ...prev, usageScopes: newScopes }));
                  }}
                />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Grievance Verification</p>
                    <p className="text-sm text-muted-foreground">Verify identity for grievance submissions</p>
                  </div>
                </div>
                <Switch 
                  checked={config.usageScopes.includes("grievance-verification")}
                  onCheckedChange={(checked) => {
                    const newScopes = checked 
                      ? [...config.usageScopes, "grievance-verification" as UsageScope]
                      : config.usageScopes.filter(s => s !== "grievance-verification");
                    setConfig(prev => ({ ...prev, usageScopes: newScopes }));
                  }}
                />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Consent Verification (Explicit Only)</p>
                    <p className="text-sm text-muted-foreground">Verify identity for high-value consent collection</p>
                  </div>
                </div>
                <Switch 
                  checked={config.usageScopes.includes("consent-verification")}
                  onCheckedChange={(checked) => {
                    const newScopes = checked 
                      ? [...config.usageScopes, "consent-verification" as UsageScope]
                      : config.usageScopes.filter(s => s !== "consent-verification");
                    setConfig(prev => ({ ...prev, usageScopes: newScopes }));
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Consent Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Consent & Purpose Controls</CardTitle>
              <CardDescription>Configure consent requirements for Aadhaar verification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg bg-success/5 border-success/20">
                <div>
                  <p className="font-medium">Mandatory Explicit Consent</p>
                  <p className="text-sm text-muted-foreground">Require explicit consent before initiating eKYC</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-success/10 text-success border-success/20">Enforced</Badge>
                  <Lock className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Consent Text (shown to user)</Label>
                <Textarea 
                  value={config.consentText}
                  onChange={(e) => setConfig(prev => ({ ...prev, consentText: e.target.value }))}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Consent Retention (days)</Label>
                  <Input 
                    type="number" 
                    value={config.consentRetentionDays}
                    onChange={(e) => setConfig(prev => ({ ...prev, consentRetentionDays: parseInt(e.target.value) }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security & Privacy Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Security & Privacy Controls
              </CardTitle>
              <CardDescription>
                Critical settings to ensure UIDAI and DPDP compliance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-success/50 bg-success/5">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <AlertTitle className="text-success">Privacy-First Configuration</AlertTitle>
                <AlertDescription>
                  All security controls are enabled to ensure no Aadhaar number is stored and all 
                  verification artifacts are automatically purged.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-success/5 border-success/20">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-success" />
                    <div>
                      <p className="font-medium">No Aadhaar Storage</p>
                      <p className="text-sm text-muted-foreground">Aadhaar numbers are never stored in the system</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-success/10 text-success border-success/20">Enforced</Badge>
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <EyeOff className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Masked Display Only</p>
                      <p className="text-sm text-muted-foreground">Show only last 4 digits (XXXX-XXXX-1234)</p>
                    </div>
                  </div>
                  <Switch 
                    checked={config.maskedDisplayOnly}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, maskedDisplayOnly: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Key className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Tokenized Verification Reference</p>
                      <p className="text-sm text-muted-foreground">Use tokens instead of Aadhaar for internal references</p>
                    </div>
                  </div>
                  <Switch 
                    checked={config.tokenizedReference}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, tokenizedReference: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Encryption in Transit & At Rest</p>
                      <p className="text-sm text-muted-foreground">AES-256 encryption for all verification data</p>
                    </div>
                  </div>
                  <Switch 
                    checked={config.encryptionEnabled}
                    onCheckedChange={(checked) => handleSensitiveChange("encryptionEnabled", checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <RefreshCw className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Auto-Purge Verification Artifacts</p>
                      <p className="text-sm text-muted-foreground">
                        Automatically delete temporary verification data after {config.autoPurgeDays} days
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number" 
                      value={config.autoPurgeDays}
                      onChange={(e) => setConfig(prev => ({ ...prev, autoPurgeDays: parseInt(e.target.value) }))}
                      className="w-20"
                    />
                    <span className="text-sm text-muted-foreground">days</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integration Tab */}
        <TabsContent value="integration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>UIDAI Service Provider Configuration</CardTitle>
              <CardDescription>Configure connection to UIDAI Authentication Service</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Service Provider Name</Label>
                <Input 
                  value={config.serviceProviderName}
                  onChange={(e) => setConfig(prev => ({ ...prev, serviceProviderName: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label>API Credentials</Label>
                <div className="flex gap-2">
                  <Input 
                    type={showApiCredentials ? "text" : "password"}
                    value="••••••••••••••••••••••••"
                    readOnly
                    className="font-mono"
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => setShowApiCredentials(!showApiCredentials)}
                  >
                    {showApiCredentials ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => toast({ title: "Credentials Update", description: "Credential update workflow opened." })}
                  >
                    <Settings2 className="h-4 w-4 mr-2" />
                    Update
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Rate Limit (requests/hour)</Label>
                  <Input 
                    type="number" 
                    value={config.rateLimit}
                    onChange={(e) => setConfig(prev => ({ ...prev, rateLimit: parseInt(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Timeout (seconds)</Label>
                  <Input 
                    type="number" 
                    value={config.timeoutSeconds}
                    onChange={(e) => setConfig(prev => ({ ...prev, timeoutSeconds: parseInt(e.target.value) }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monitoring Tab */}
        <TabsContent value="monitoring" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Verifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{usageStats.totalVerifications.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">{usageStats.successRate}%</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Failure Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{usageStats.failureRate}%</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {usageStats.monthlyUsage[usageStats.monthlyUsage.length - 1].count}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Usage by Purpose
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {usageStats.byPurpose.map(item => (
                  <div key={item.purpose} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{item.purpose}</span>
                      <span className="text-muted-foreground">{item.count} ({item.percentage}%)</span>
                    </div>
                    <Progress value={item.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Confirm Configuration Change
            </DialogTitle>
            <DialogDescription>
              You are about to modify a sensitive Aadhaar eKYC configuration. This change will be 
              logged and may require additional approval for production environments.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Audit Notice</AlertTitle>
              <AlertDescription>
                All changes to Aadhaar configuration are logged with your user ID, timestamp, 
                and IP address for regulatory compliance.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmChange}>
              Confirm Change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
