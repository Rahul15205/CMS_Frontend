import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Shield,
  Lock,
  Eye,
  AlertTriangle,
  Award,
  Plus,
  X,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ConsentTemplate, SecurityMeasures, CustomSecurityMeasure } from "../types";

interface WizardStepSecurityProps {
  data: Partial<ConsentTemplate>;
  onChange: (updates: Partial<ConsentTemplate>) => void;
}

const commonCertifications = [
  "ISO 27001",
  "SOC 2 Type II",
  "HIPAA",
  "PCI DSS",
  "ISO 27701",
  "GDPR Certified",
];

export function WizardStepSecurity({ data, onChange }: WizardStepSecurityProps) {
  const [newCertification, setNewCertification] = useState("");
  const [isAddMeasureOpen, setIsAddMeasureOpen] = useState(false);
  const [newMeasureName, setNewMeasureName] = useState("");
  const [newMeasureDesc, setNewMeasureDesc] = useState("");

  const security = data.security || {
    encryptionAtRest: true,
    encryptionInTransit: true,
    accessControls: true,
    monitoringLogging: true,
    incidentResponse: true,
    certifications: [],
    additionalMeasures: []
  };

  const updateSecurity = (updates: Partial<SecurityMeasures>) => {
    onChange({ security: { ...security, ...updates } });
  };

  const addCertification = (cert: string) => {
    if (!cert || security.certifications.includes(cert)) return;
    updateSecurity({ certifications: [...security.certifications, cert] });
    setNewCertification("");
  };

  const removeCertification = (cert: string) => {
    updateSecurity({ certifications: security.certifications.filter((c) => c !== cert) });
  };

  const handleAddMeasure = () => {
    if (!newMeasureName.trim()) return;

    const newMeasure: CustomSecurityMeasure = {
      id: `custom-${Date.now()}`,
      name: newMeasureName,
      description: newMeasureDesc,
      enabled: true
    };

    updateSecurity({
      additionalMeasures: [...(security.additionalMeasures || []), newMeasure]
    });

    setNewMeasureName("");
    setNewMeasureDesc("");
    setIsAddMeasureOpen(false);
  };

  const toggleCustomMeasure = (id: string, checked: boolean) => {
    const updatedMeasures = (security.additionalMeasures || []).map(m =>
      m.id === id ? { ...m, enabled: checked } : m
    );
    updateSecurity({ additionalMeasures: updatedMeasures });
  };

  const removeCustomMeasure = (id: string) => {
    const updatedMeasures = (security.additionalMeasures || []).filter(m => m.id !== id);
    updateSecurity({ additionalMeasures: updatedMeasures });
  };

  const securityMeasures = [
    {
      id: "encryptionAtRest",
      label: "Encryption at Rest",
      description: "Data is encrypted when stored in databases and storage systems",
      icon: <Lock className="h-5 w-5" />,
      checked: security.encryptionAtRest,
    },
    {
      id: "encryptionInTransit",
      label: "Encryption in Transit",
      description: "Data is encrypted during transmission (TLS/SSL)",
      icon: <Shield className="h-5 w-5" />,
      checked: security.encryptionInTransit,
    },
    {
      id: "accessControls",
      label: "Access Controls",
      description: "Role-based access and authentication mechanisms",
      icon: <Eye className="h-5 w-5" />,
      checked: security.accessControls,
    },
    {
      id: "monitoringLogging",
      label: "Monitoring & Logging",
      description: "Continuous monitoring and audit logging of data access",
      icon: <Eye className="h-5 w-5" />,
      checked: security.monitoringLogging,
    },
    {
      id: "incidentResponse",
      label: "Incident Response",
      description: "Documented procedures for security incident handling",
      icon: <AlertTriangle className="h-5 w-5" />,
      checked: security.incidentResponse,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Info Banner */}
      <div className="p-4 rounded-lg bg-info/10 border border-info/20">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-info mt-0.5" />
          <div>
            <h4 className="font-medium text-info">Security Transparency</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Inform data principals about the security measures protecting their personal data.
              This builds trust and demonstrates compliance with security requirements.
            </p>
          </div>
        </div>
      </div>

      {/* Security Measures */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Data Protection Measures</Label>
          <Button variant="outline" size="sm" onClick={() => setIsAddMeasureOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Protection Measure
          </Button>
        </div>

        <div className="space-y-3">
          {/* Standard Measures */}
          {securityMeasures.map((measure) => (
            <div
              key={measure.id}
              className={cn(
                "flex items-start justify-between p-4 rounded-lg border transition-colors",
                measure.checked ? "bg-success/5 border-success/20" : "bg-card"
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  measure.checked ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                )}>
                  {measure.icon}
                </div>
                <div>
                  <Label htmlFor={measure.id} className="font-medium cursor-pointer">
                    {measure.label}
                  </Label>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {measure.description}
                  </p>
                </div>
              </div>
              <Switch
                id={measure.id}
                checked={measure.checked}
                onCheckedChange={(checked) => updateSecurity({ [measure.id as keyof SecurityMeasures]: checked })}
              />
            </div>
          ))}

          {/* Custom Measures */}
          {(security.additionalMeasures || []).map((measure) => (
            <div
              key={measure.id}
              className={cn(
                "flex items-start justify-between p-4 rounded-lg border transition-colors group",
                measure.enabled ? "bg-success/5 border-success/20" : "bg-card"
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  measure.enabled ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                )}>
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={measure.id} className="font-medium cursor-pointer">
                      {measure.name}
                    </Label>
                    <button
                      onClick={() => removeCustomMeasure(measure.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                      title="Remove measure"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {measure.description}
                  </p>
                </div>
              </div>
              <Switch
                id={measure.id}
                checked={measure.enabled}
                onCheckedChange={(checked) => toggleCustomMeasure(measure.id, checked)}
              />
            </div>
          ))}

          {/* New Measure Sheet */}
          <Sheet open={isAddMeasureOpen} onOpenChange={setIsAddMeasureOpen}>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>New Protection Measure</SheetTitle>
                <SheetDescription>
                  Add a custom data protection measure to your security configuration.
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-6 py-6">
                <div className="space-y-2">
                  <Label htmlFor="measureName">
                    Name of the Data Protection Measure <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="measureName"
                    placeholder="e.g. Data Masking, Tokenization"
                    value={newMeasureName}
                    onChange={(e) => setNewMeasureName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="measureDesc">
                    Short Description <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="measureDesc"
                    placeholder="Briefly describe this protection measure"
                    value={newMeasureDesc}
                    onChange={(e) => setNewMeasureDesc(e.target.value)}
                  />
                </div>
              </div>
              <SheetFooter>
                <SheetClose asChild>
                  <Button variant="outline">Close</Button>
                </SheetClose>
                <Button onClick={handleAddMeasure} disabled={!newMeasureName || !newMeasureDesc}>
                  Save
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Certifications */}
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium">Security Certifications</Label>
          <p className="text-xs text-muted-foreground mt-1">
            List any security certifications or compliance standards
          </p>
        </div>

        {/* Quick Add Certifications */}
        <div className="flex flex-wrap gap-2">
          {commonCertifications.map((cert) => (
            <Badge
              key={cert}
              variant={security.certifications.includes(cert) ? "default" : "outline"}
              className={cn(
                "cursor-pointer transition-colors",
                security.certifications.includes(cert)
                  ? "bg-primary"
                  : "hover:bg-primary/10"
              )}
              onClick={() =>
                security.certifications.includes(cert)
                  ? removeCertification(cert)
                  : addCertification(cert)
              }
            >
              <Award className="h-3 w-3 mr-1" />
              {cert}
            </Badge>
          ))}
        </div>

        {/* Custom Certification Input */}
        <div className="flex gap-2">
          <Input
            placeholder="Add custom certification..."
            value={newCertification}
            onChange={(e) => setNewCertification(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCertification(newCertification);
              }
            }}
            className="max-w-xs"
          />
          <Button
            variant="outline"
            onClick={() => addCertification(newCertification)}
            disabled={!newCertification}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Selected Certifications */}
        {security.certifications.length > 0 && (
          <div className="p-4 rounded-lg bg-muted/50 border">
            <Label className="text-xs text-muted-foreground mb-2 block">Selected Certifications</Label>
            <div className="flex flex-wrap gap-2">
              {security.certifications.map((cert) => (
                <Badge key={cert} variant="secondary" className="flex items-center gap-1">
                  <Award className="h-3 w-3" />
                  {cert}
                  <button
                    onClick={() => removeCertification(cert)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Security Summary */}
      <div className="p-4 rounded-lg bg-card border">
        <Label className="text-sm font-medium mb-3 block">Security Posture Summary</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {securityMeasures.map((measure) => (
            <div key={measure.id} className="flex items-center gap-2 text-sm">
              {measure.checked ? (
                <Badge className="bg-success/10 text-success border-success/20 h-5 w-5 p-0 flex items-center justify-center">
                  ✓
                </Badge>
              ) : (
                <Badge variant="secondary" className="h-5 w-5 p-0 flex items-center justify-center">
                  –
                </Badge>
              )}
              <span className={cn(!measure.checked && "text-muted-foreground")}>
                {measure.label}
              </span>
            </div>
          ))}
          {/* Custom Measures in Summary */}
          {(security.additionalMeasures || []).map((measure) => (
            <div key={measure.id} className="flex items-center gap-2 text-sm">
              {measure.enabled ? (
                <Badge className="bg-success/10 text-success border-success/20 h-5 w-5 p-0 flex items-center justify-center">
                  ✓
                </Badge>
              ) : (
                <Badge variant="secondary" className="h-5 w-5 p-0 flex items-center justify-center">
                  –
                </Badge>
              )}
              <span className={cn(!measure.enabled && "text-muted-foreground")}>
                {measure.name} (Custom)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
