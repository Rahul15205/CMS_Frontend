import { useState, useEffect } from "react";
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

// Custom Validity Period Input component (Bug Fix 2.1, 2.2, 2.3)
function CustomValidityInput({ value, onChange, disabled }: { value: string; onChange: (val: string) => void; disabled: boolean }) {
  const predefinedValues = [
    "1 day", "3 days", "5 days", "7 days", "15 days", "30 days",
    "60 days", "90 days", "120 days", "1 year", "3 years", "5 years",
    "7 years", "10 Years", "20 years", "30 years", "40 years",
    "50 years", "end of the human life"
  ];

  const isCustomActive = value && !predefinedValues.includes(value);

  const [years, setYears] = useState("");
  const [months, setMonths] = useState("");
  const [days, setDays] = useState("");

  // Sync internal state with external value
  useEffect(() => {
    if (isCustomActive && value) {
      const yMatch = value.match(/(\d+)\s*year/i);
      const mMatch = value.match(/(\d+)\s*month/i);
      const dMatch = value.match(/(\d+)\s*day/i);
      
      setYears(yMatch ? yMatch[1] : "");
      setMonths(mMatch ? mMatch[1] : "");
      setDays(dMatch ? dMatch[1] : "");
    } else if (!isCustomActive) {
      setYears("");
      setMonths("");
      setDays("");
    }
  }, [value, isCustomActive]);

  const handleChange = (type: "years" | "months" | "days", val: string) => {
    // Only allow digits
    const numericStr = val.replace(/\D/g, "");
    let numVal = parseInt(numericStr || "0", 10);
    
    // Apply common sense limits
    if (type === "years" && numVal > 99) numVal = 99;
    if (type === "months" && numVal > 11) numVal = 11;
    if (type === "days" && numVal > 30) numVal = 30;

    const finalVal = numericStr === "" ? "" : numVal.toString();

    const newYears = type === "years" ? finalVal : years;
    const newMonths = type === "months" ? finalVal : months;
    const newDays = type === "days" ? finalVal : days;

    setYears(type === "years" ? finalVal : years);
    setMonths(type === "months" ? finalVal : months);
    setDays(type === "days" ? finalVal : days);

    const parts = [];
    if (newYears) parts.push(`${newYears} ${parseInt(newYears, 10) === 1 ? "year" : "years"}`);
    if (newMonths) parts.push(`${newMonths} ${parseInt(newMonths, 10) === 1 ? "month" : "months"}`);
    if (newDays) parts.push(`${newDays} ${parseInt(newDays, 10) === 1 ? "day" : "days"}`);

    onChange(parts.join(" "));
  };

  return (
    <div className="mt-3 p-4 rounded-lg border bg-muted/30">
      <Label className="text-xs font-semibold text-muted-foreground mb-3 block">Or enter a custom combined duration:</Label>
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="0"
            value={years}
            onChange={(e) => handleChange("years", e.target.value)}
            disabled={disabled}
            className="w-16 h-8 text-center"
          />
          <span className="text-sm font-medium">Years</span>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="0"
            value={months}
            onChange={(e) => handleChange("months", e.target.value)}
            disabled={disabled}
            className="w-16 h-8 text-center"
          />
          <span className="text-sm font-medium">Months</span>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="0"
            value={days}
            onChange={(e) => handleChange("days", e.target.value)}
            disabled={disabled}
            className="w-16 h-8 text-center"
          />
          <span className="text-sm font-medium">Days</span>
        </div>
      </div>
    </div>
  );
}

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
          <Label htmlFor="description" className={cn("text-sm font-medium", !data.name && "text-muted-foreground/50")}>
            Description <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="description"
            placeholder={data.name ? "Describe what this consent is for in clear, simple language..." : "Please enter a template name first"}
            value={data.description || ""}
            onChange={(e) => onChange({ description: e.target.value })}
            disabled={!data.name}
            className="max-w-xl min-h-[100px]"
          />
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Info className="h-3 w-3" />
            Please write briefly why this template is required.
          </p>
        </div>
      </div>

      {/* Consent Type Selection */}
      <div className={cn("space-y-4", !data.description && "opacity-50 pointer-events-none")}>
        <Label className="text-sm font-medium">
          Consent Type <span className="text-destructive">*</span>
        </Label>
        <RadioGroup
          value={data.type}
          onValueChange={(value) => onChange({ type: value as ConsentType })}
          disabled={!data.description}
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
        {!data.description && (
          <p className="text-xs text-muted-foreground">Fill in the description to select consent type.</p>
        )}
      </div>

      {/* Applicable Regulations */}
      <div className={cn("space-y-4", !data.type && "opacity-50 pointer-events-none")}>
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
                disabled={!data.type}
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
        {/* Custom Regulation Input - Bug Fix 4 */}
        {data.regulations?.includes("Custom") && (
          <div className="mt-3 max-w-xl">
            <Label htmlFor="customRegulationName" className="text-sm font-medium">
              Custom Regulation Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="customRegulationName"
              placeholder="e.g., LGPD, POPIA, CCPA, or your organization-specific regulation"
              value={data.customRegulationName || ""}
              onChange={(e) => onChange({ customRegulationName: e.target.value })}
              className="mt-1.5"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Enter the name of your custom or organization-specific regulation.
            </p>
          </div>
        )}
        {!data.type && (
          <p className="text-xs text-muted-foreground">Select a consent type to see regulations.</p>
        )}
      </div>

      {/* Validity Period */}
      <div className={cn("space-y-4", (!data.regulations || data.regulations.length === 0) && "opacity-50 pointer-events-none")}>
        <Label className="text-sm font-medium">Consent Validity Period</Label>
        <div className="flex items-center gap-2 mb-3">
          <Checkbox
            id="noExpiry"
            checked={data.noExpiry}
            onCheckedChange={(checked) => onChange({ noExpiry: !!checked })}
            disabled={!data.regulations || data.regulations.length === 0}
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
                  disabled={!data.regulations || data.regulations.length === 0}
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

            {/* Custom Validity Period Input - Bug Fix 5 */}
            <CustomValidityInput
              value={data.validityDuration || ""}
              onChange={(val) => onChange({ validityDuration: val })}
              disabled={!data.regulations || data.regulations.length === 0}
            />

            {!data.validityDuration && (
              <p className="text-xs text-destructive">
                Please select a validity period or enter a custom duration.
              </p>
            )}
          </div>
        )}
        {(!data.regulations || data.regulations.length === 0) && (
          <p className="text-xs text-muted-foreground">Select at least one regulation to configure validity.</p>
        )}
      </div>
    </div>
  );
}
