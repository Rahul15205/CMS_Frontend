import { useState } from "react";
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
} from "lucide-react";
import { EncryptionConfig as EncryptionConfigType, KeyManagementType } from "./types";
import { useToast } from "@/hooks/use-toast";

const mockConfig: EncryptionConfigType = {
  id: "1",
  encryptionAtRest: true,
  encryptionInTransit: true,
  keyManagementType: "system-managed",
  keyRotationFrequency: 90,
  keyRotationUnit: "days",
  algorithm: "AES-256-GCM",
  lastRotated: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
  nextRotation: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
  complianceStatus: "compliant",
};

const algorithms = [
  { value: "AES-256-GCM", label: "AES-256-GCM (Recommended)" },
  { value: "AES-256-CBC", label: "AES-256-CBC" },
  { value: "ChaCha20-Poly1305", label: "ChaCha20-Poly1305" },
];

export function EncryptionConfig() {
  const [config, setConfig] = useState<EncryptionConfigType>(mockConfig);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { toast } = useToast();

  const daysUntilRotation = config.nextRotation 
    ? Math.ceil((config.nextRotation.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  const handleChange = (field: keyof EncryptionConfigType, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  return (
    <div className="space-y-6">
      {/* Compliance Status Banner */}
      <Card className={config.complianceStatus === "compliant" 
        ? "border-success/50 bg-success/5" 
        : config.complianceStatus === "warning" 
          ? "border-warning/50 bg-warning/5"
          : "border-destructive/50 bg-destructive/5"
      }>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {config.complianceStatus === "compliant" ? (
                <CheckCircle2 className="h-6 w-6 text-success" />
              ) : config.complianceStatus === "warning" ? (
                <AlertTriangle className="h-6 w-6 text-warning" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-destructive" />
              )}
              <div>
                <p className="font-semibold">
                  {config.complianceStatus === "compliant" 
                    ? "Encryption Configuration Compliant" 
                    : "Encryption Review Required"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Meets GDPR, DPDP, and industry security standards
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge className="bg-success/10 text-success border-success/20">GDPR</Badge>
              <Badge className="bg-success/10 text-success border-success/20">DPDP</Badge>
              <Badge className="bg-success/10 text-success border-success/20">SOC 2</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Unsaved Changes Warning */}
      {hasUnsavedChanges && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Unsaved Changes</AlertTitle>
          <AlertDescription>
            You have unsaved encryption configuration changes. Save to apply them.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Server className="h-4 w-4" />
              Encryption at Rest
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {config.encryptionAtRest ? (
                <CheckCircle2 className="h-5 w-5 text-success" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-destructive" />
              )}
              <span className="font-semibold">{config.encryptionAtRest ? "Enabled" : "Disabled"}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Cloud className="h-4 w-4" />
              Encryption in Transit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {config.encryptionInTransit ? (
                <CheckCircle2 className="h-5 w-5 text-success" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-destructive" />
              )}
              <span className="font-semibold">{config.encryptionInTransit ? "Enabled" : "Disabled"}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Key className="h-4 w-4" />
              Key Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="font-semibold capitalize">
              {config.keyManagementType.replace("-", " ")}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Next Rotation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <RefreshCw className={`h-4 w-4 ${daysUntilRotation <= 7 ? "text-warning" : "text-muted-foreground"}`} />
              <span className="font-semibold">{daysUntilRotation} days</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Encryption Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Encryption Settings
            </CardTitle>
            <CardDescription>
              Configure data encryption for compliance and security
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Encryption at Rest */}
            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <Server className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Encryption at Rest</p>
                  <p className="text-sm text-muted-foreground">
                    All stored data is encrypted using {config.algorithm}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">Enforced</Badge>
                <Lock className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {/* Encryption in Transit */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Cloud className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Encryption in Transit</p>
                  <p className="text-sm text-muted-foreground">
                    TLS 1.3 for all API communications
                  </p>
                </div>
              </div>
              <Switch 
                checked={config.encryptionInTransit}
                onCheckedChange={(checked) => handleChange("encryptionInTransit", checked)}
              />
            </div>

            {/* Algorithm */}
            <div className="space-y-2">
              <Label>Encryption Algorithm</Label>
              <Select 
                value={config.algorithm}
                onValueChange={(value) => handleChange("algorithm", value)}
              >
                <SelectTrigger>
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
              <p className="text-xs text-muted-foreground">
                AES-256-GCM is recommended for optimal security and performance
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Key Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Key Management
            </CardTitle>
            <CardDescription>
              Configure encryption key lifecycle and rotation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Key Management Type */}
            <div className="space-y-2">
              <Label>Key Management Type</Label>
              <Select 
                value={config.keyManagementType}
                onValueChange={(value) => handleChange("keyManagementType", value as KeyManagementType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system-managed">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      System Managed
                    </div>
                  </SelectItem>
                  <SelectItem value="customer-managed">
                    <div className="flex items-center gap-2">
                      <Key className="h-4 w-4" />
                      Customer Managed (BYOK)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {config.keyManagementType === "customer-managed" && (
              <Alert className="border-warning/50 bg-warning/5">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <AlertTitle>BYOK Configuration Required</AlertTitle>
                <AlertDescription>
                  Customer-managed keys require additional setup. Contact your security administrator.
                </AlertDescription>
              </Alert>
            )}

            {/* Key Rotation */}
            <div className="space-y-2">
              <Label>Key Rotation Frequency</Label>
              <div className="flex gap-2">
                <Select 
                  value={config.keyRotationFrequency.toString()}
                  onValueChange={(value) => handleChange("keyRotationFrequency", parseInt(value))}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30</SelectItem>
                    <SelectItem value="60">60</SelectItem>
                    <SelectItem value="90">90</SelectItem>
                    <SelectItem value="180">180</SelectItem>
                    <SelectItem value="365">365</SelectItem>
                  </SelectContent>
                </Select>
                <Select 
                  value={config.keyRotationUnit}
                  onValueChange={(value) => handleChange("keyRotationUnit", value as "days" | "months")}
                >
                  <SelectTrigger className="flex-1">
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
            <div className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Last Rotation</span>
                <span className="font-medium">
                  {config.lastRotated?.toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Next Rotation</span>
                <span className={`font-medium ${daysUntilRotation <= 7 ? "text-warning" : ""}`}>
                  {config.nextRotation?.toLocaleDateString()} ({daysUntilRotation} days)
                </span>
              </div>
              <Button
                variant="outline"
                className="w-full"
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
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Encryption Best Practices</AlertTitle>
        <AlertDescription>
          Regular key rotation and strong encryption algorithms are essential for maintaining compliance 
          with GDPR, DPDP, and other privacy regulations. Changes to encryption settings are logged 
          for audit purposes.
        </AlertDescription>
      </Alert>

      {/* Save Button */}
      {hasUnsavedChanges && (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setHasUnsavedChanges(false);
              toast({ title: "Changes Discarded", description: "Encryption changes reverted." });
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              setHasUnsavedChanges(false);
              toast({ title: "Configuration Saved", description: "Encryption settings updated successfully." });
            }}
          >
            Save Configuration
          </Button>
        </div>
      )}
    </div>
  );
}
