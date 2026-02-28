import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckSquare,
  ToggleLeft,
  Lock,
  ListChecks,
  Eye,
  Info,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ConsentTemplate, ConsentType, Regulation, REGULATION_INFO, CONSENT_TYPE_INFO } from "../types";

interface WizardStepBasicInfoProps {
  data: Partial<ConsentTemplate>;
  onChange: (updates: Partial<ConsentTemplate>) => void;
}

const consentTypes: ConsentType[] = ["explicit", "implicit", "optional", "mandatory", "granular", "parental"];
const regulations: Regulation[] = ["DPDP", "GDPR", "TAPA", "PDPL", "Custom"];

const getConsentTypeIcon = (type: ConsentType) => {
  switch (type) {
    case "explicit": return <CheckSquare className="h-5 w-5" />;
    case "optional": return <ToggleLeft className="h-5 w-5" />;
    case "mandatory": return <Lock className="h-5 w-5" />;
    case "granular": return <ListChecks className="h-5 w-5" />;
    case "parental": return <Users className="h-5 w-5" />;
    case "implicit": return <Eye className="h-5 w-5" />;
    default: return <Eye className="h-5 w-5" />;
  }
};

export function WizardStepBasicInfo({ data, onChange }: WizardStepBasicInfoProps) {
  const toggleRegulation = (reg: Regulation) => {
    const current = data.regulations || [];
    const updated = current.includes(reg)
      ? current.filter((r) => r !== reg)
      : [...current, reg];
    onChange({ regulations: updated });
  };

  return (
    <div className="space-y-8">
      {/* Template Name & Description */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">
            Consent Template Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            placeholder="e.g., Marketing Communications Consent"
            value={data.name || ""}
            onChange={(e) => onChange({ name: e.target.value })}
            className="max-w-xl"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium">
            Description <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="description"
            placeholder="Describe what this consent is for in clear, simple language..."
            value={data.description || ""}
            onChange={(e) => onChange({ description: e.target.value })}
            className="max-w-xl min-h-[100px]"
          />
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Info className="h-3 w-3" />
            Please write briefly why this template is required.
          </p>
        </div>
      </div>

      {/* Consent Type Selection */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">
          Consent Type <span className="text-destructive">*</span>
        </Label>
        <RadioGroup
          value={data.type}
          onValueChange={(value) => onChange({ type: value as ConsentType })}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
        >
          {consentTypes.map((type) => (
            <Label
              key={type}
              className={cn(
                "flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all",
                data.type === type
                  ? cn(CONSENT_TYPE_INFO[type].color)
                  : "border-border hover:border-primary/50"
              )}
            >
              <RadioGroupItem value={type} className="mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {getConsentTypeIcon(type)}
                  <span className="font-medium">{CONSENT_TYPE_INFO[type].label}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {CONSENT_TYPE_INFO[type].description}
                </p>
              </div>
            </Label>
          ))}
        </RadioGroup>
      </div>

      {/* Applicable Regulations */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">
          Applicable Regulations <span className="text-destructive">*</span>
        </Label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {regulations.map((reg) => (
            <Label
              key={reg}
              className={cn(
                "flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all",
                data.regulations?.includes(reg)
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
            >
              <Checkbox
                checked={data.regulations?.includes(reg)}
                onCheckedChange={() => toggleRegulation(reg)}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={REGULATION_INFO[reg].color}>
                    {REGULATION_INFO[reg].label}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {REGULATION_INFO[reg].description}
                </p>
              </div>
            </Label>
          ))}
        </div>
      </div>

      {/* Validity Period */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">Consent Validity Period</Label>
        <div className="flex items-center gap-2 mb-3">
          <Checkbox
            id="noExpiry"
            checked={data.noExpiry}
            onCheckedChange={(checked) => onChange({ noExpiry: !!checked })}
          />
          <Label htmlFor="noExpiry" className="text-sm text-muted-foreground cursor-pointer">
            No expiry (consent remains valid until withdrawn)
          </Label>
        </div>

        {!data.noExpiry && (
          <div className="space-y-4">
            <Label className="text-sm font-medium">
              Validity Period <span className="text-destructive">*</span>
            </Label>
            <div className="flex flex-wrap gap-2">
              {[
                "1 day", "3 days", "5 days", "7 days", "15 days", "30 days",
                "60 days", "90 days", "120 days", "1 year", "3 years", "5 years",
                "7 years", "10 Years", "20 years", "30 years", "40 years",
                "50 years", "end of the human life"
              ].map((duration) => (
                <Button
                  key={duration}
                  variant={data.validityDuration === duration ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "h-8",
                    data.validityDuration === duration
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "hover:bg-accent hover:text-accent-foreground"
                  )}
                  onClick={() => onChange({ validityDuration: duration })}
                >
                  {duration}
                </Button>
              ))}
            </div>
            {!data.validityDuration && (
              <p className="text-xs text-destructive">
                Please select a validity period.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
