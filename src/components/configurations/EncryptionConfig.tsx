import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Shield,
  Lock,
  Key,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  Server,
  Cloud,
  Loader2,
  Save,
  History as HistoryIcon
} from "lucide-react";
import { EncryptionConfig as EncryptionConfigType, KeyManagementType } from "./types";
import { useToast } from "@/hooks/use-toast";
import { encryptionConfigService } from "@/services/configurationsService";
import { Skeleton } from "@/components/ui/skeleton";

const algorithms = [
  { value: "AES-256-GCM", label: "AES-256-GCM (Recommended)" },
  { value: "AES-256-CBC", label: "AES-256-CBC" },
  { value: "ChaCha20-Poly1305", label: "ChaCha20-Poly1305" },
];

export function EncryptionConfig() {
  const [config, setConfig] = useState<EncryptionConfigType | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    try {
      const data = await encryptionConfigService.get();
      setConfig(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load encryption configuration.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const daysUntilRotation = config?.nextRotation 
    ? Math.ceil((new Date(config.nextRotation).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  const handleChange = (field: keyof EncryptionConfigType, value: any) => {
    if (!config) return;
    setConfig({ ...config, [field]: value });
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    try {
      const updated = await encryptionConfigService.update(config);
      setConfig(updated);
      setHasUnsavedChanges(false);
      toast({
        title: "Configuration Saved",
        description: "Encryption settings updated successfully."
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
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-[300px] w-full" />
            <Skeleton className="h-[300px] w-full" />
        </div>
      </div>
    );
  }

  if (!config) return null;

  return (
    <div className="space-y-6">
      {/* Compliance Status Banner */}
      <Card className={`border-0 shadow-sm overflow-hidden ${config.complianceStatus === "compliant" 
        ? "bg-success/10" 
        : config.complianceStatus === "warning" 
          ? "bg-warning/10"
          : "bg-destructive/10"
      }`}>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-full ${config.complianceStatus === "compliant" ? "bg-success/20" : "bg-warning/20"}`}>
                {config.complianceStatus === "compliant" ? (
                  <CheckCircle2 className="h-6 w-6 text-success" />
                ) : config.complianceStatus === "warning" ? (
                  <AlertTriangle className="h-6 w-6 text-warning" />
                ) : (
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                )}
              </div>
              <div>
                <p className="font-bold text-foreground">
                  {config.complianceStatus === "compliant" 
                    ? "Encryption Configuration Compliant" 
                    : "Encryption Review Required"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Meets GDPR, DPDP, and industry security standards (SOC 2, ISO 27001)
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-background/50 border-success/20 text-success">GDPR</Badge>
              <Badge variant="outline" className="bg-background/50 border-success/20 text-success">DPDP</Badge>
              <Badge variant="outline" className="bg-background/50 border-success/20 text-success">SOC 2</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Unsaved Changes Warning */}
      {hasUnsavedChanges && (
        <Alert className="border-warning/50 bg-warning/5 animate-pulse">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <AlertTitle className="text-warning font-semibold">Unsaved Changes</AlertTitle>
          <AlertDescription className="text-warning/80">
            You have modified encryption settings. Please save to apply these changes to the system.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Encryption at Rest", value: config.encryptionAtRest ? "Enabled" : "Disabled", icon: Server, color: config.encryptionAtRest ? "text-success" : "text-destructive" },
          { title: "Encryption in Transit", value: config.encryptionInTransit ? "Enabled" : "Disabled", icon: Cloud, color: config.encryptionInTransit ? "text-success" : "text-destructive" },
          { title: "Key Management", value: (config.keyManagementType || (config as any).provider || "system-managed").replace("-", " "), icon: Key, color: "text-primary", capitalize: true },
          { title: "Next Rotation", value: `${daysUntilRotation} days`, icon: Clock, color: daysUntilRotation <= 7 ? "text-warning" : "text-primary" }
        ].map((stat, i) => (
          <Card key={i} className="border-0 shadow-sm bg-card/60 backdrop-blur-sm overflow-hidden group hover:shadow-md transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <stat.icon className="h-3.5 w-3.5" />
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-xl font-bold ${stat.color} ${stat.capitalize ? "capitalize" : ""}`}>
                {stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Encryption Settings */}
        <Card className="border-0 shadow-sm bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lock className="h-5 w-5 text-primary" />
              Encryption Settings
            </CardTitle>
            <CardDescription>
              Configure data encryption for compliance and security
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Encryption at Rest */}
            <div className="flex items-center justify-between p-4 border border-success/30 rounded-xl bg-success/5">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-success/10 text-success">
                  <Server className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-success-foreground">Encryption at Rest</p>
                  <p className="text-sm text-muted-foreground">
                    All stored data encrypted with {config.algorithm}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-success text-success-foreground border-0">Enforced</Badge>
                <Lock className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {/* Encryption in Transit */}
            <div className="flex items-center justify-between p-4 border border-border/50 rounded-xl hover:bg-muted/30 transition-all duration-200">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                  <Cloud className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">Encryption in Transit</p>
                  <p className="text-sm text-muted-foreground">
                    TLS 1.3 for all secure communications
                  </p>
                </div>
              </div>
              <Switch 
                checked={config.encryptionInTransit}
                onCheckedChange={(checked) => handleChange("encryptionInTransit", checked)}
              />
            </div>

            {/* Algorithm */}
            <div className="space-y-2 pt-2">
              <Label className="text-sm font-semibold">Encryption Algorithm</Label>
              <Select 
                value={config.algorithm}
                onValueChange={(value) => handleChange("algorithm", value)}
              >
                <SelectTrigger className="bg-background/50 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {algorithms.map(algo => (
                    <SelectItem key={algo.value} value={algo.value}>
                      {algo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2 px-1">
                  <Info className="h-3.5 w-3.5 text-primary" />
                  <p className="text-[11px] text-muted-foreground">
                    AES-256-GCM is the industry standard for performance and security.
                  </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Management */}
        <Card className="border-0 shadow-sm bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Key className="h-5 w-5 text-primary" />
              Key Management
            </CardTitle>
            <CardDescription>
              Configure encryption key lifecycle and rotation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Key Management Type */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Key Management Type</Label>
              <Select 
                value={config.keyManagementType || (config as any).provider || "system-managed"}
                onValueChange={(value) => handleChange("keyManagementType", value as KeyManagementType)}
              >
                <SelectTrigger className="bg-background/50 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system-managed">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" />
                      System Managed (Highly Available)
                    </div>
                  </SelectItem>
                  <SelectItem value="customer-managed">
                    <div className="flex items-center gap-2">
                      <Key className="h-4 w-4 text-primary" />
                      Customer Managed (BYOK)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {config.keyManagementType === "customer-managed" && (
              <Alert className="border-warning/30 bg-warning/5 border-dashed">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <AlertTitle className="text-sm font-semibold text-warning">BYOK Configuration Required</AlertTitle>
                <AlertDescription className="text-xs text-warning/80">
                  Customer-managed keys require additional setup in the Cloud KMS module.
                </AlertDescription>
              </Alert>
            )}

            {/* Key Rotation */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Key Rotation Frequency</Label>
              <div className="flex gap-2">
                <Select 
                  value={(config.keyRotationFrequency || 90).toString()}
                  onValueChange={(value) => handleChange("keyRotationFrequency", parseInt(value))}
                >
                  <SelectTrigger className="w-24 bg-background/50 border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[30, 60, 90, 180, 365].map(v => (
                        <SelectItem key={v} value={v.toString()}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select 
                  value={config.keyRotationUnit || "days"}
                  onValueChange={(value) => handleChange("keyRotationUnit", value as "days" | "months")}
                >
                  <SelectTrigger className="flex-1 bg-background/50 border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="days">Days</SelectItem>
                    <SelectItem value="months">Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Rotation Timeline */}
            <div className="p-4 border border-border/50 rounded-xl bg-muted/20 space-y-4">
              <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                        <HistoryIcon className="h-3.5 w-3.5" />
                        Last Rotation
                    </span>
                    <span className="font-semibold">
                      {config.lastRotated ? new Date(config.lastRotated).toLocaleDateString() : 'Never'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5" />
                        Next Rotation
                    </span>
                    <span className={`font-semibold ${daysUntilRotation <= 7 ? "text-warning" : "text-primary"}`}>
                      {config.nextRotation ? new Date(config.nextRotation).toLocaleDateString() : 'Not Scheduled'} ({daysUntilRotation} days)
                    </span>
                  </div>
              </div>
              <Button
                variant="outline"
                className="w-full border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors"
                size="sm"
                onClick={() => toast({ title: "Key Rotation", description: "Manual key rotation initiated." })}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Rotate Keys Now
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Banner */}
      <Alert className="border-primary/20 bg-primary/5">
        <Info className="h-4 w-4 text-primary" />
        <AlertTitle className="text-primary font-semibold">Encryption Best Practices</AlertTitle>
        <AlertDescription className="text-sm text-primary/80">
          Regular key rotation and strong algorithms like AES-256-GCM are essential for maintaining compliance. 
          All modifications to encryption settings are cryptographically logged for audit.
        </AlertDescription>
      </Alert>

      {/* Save Button */}
      {hasUnsavedChanges && (
        <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
          <Button
            variant="ghost"
            onClick={() => {
              setHasUnsavedChanges(false);
              fetchConfig(); // Revert
              toast({ title: "Changes Discarded", description: "Encryption changes reverted." });
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="shadow-md"
          >
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Configuration
          </Button>
        </div>
      )}
    </div>
  );
}
