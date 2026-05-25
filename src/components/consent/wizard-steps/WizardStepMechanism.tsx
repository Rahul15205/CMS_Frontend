import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import {
  CheckSquare,
  ToggleLeft,
  PenTool,
  MousePointerClick,
  Video,
  Info,
  AlertTriangle,
  Undo2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ConsentTemplate, ConsentMechanism } from "../types";

interface WizardStepMechanismProps {
  data: Partial<ConsentTemplate>;
  onChange: (updates: Partial<ConsentTemplate>) => void;
}

const mechanisms: { value: ConsentMechanism; label: string; icon: React.ReactNode; description: string; recommended: boolean }[] = [
  {
    value: "checkbox",
    label: "Checkbox",
    icon: <CheckSquare className="h-5 w-5" />,
    description: "Traditional unchecked checkbox - user must tick to consent",
    recommended: true
  },
  {
    value: "toggle",
    label: "Toggle Switch",
    icon: <ToggleLeft className="h-5 w-5" />,
    description: "On/off toggle switch defaulted to off",
    recommended: false
  },
  {
    value: "signature",
    label: "Digital Signature",
    icon: <PenTool className="h-5 w-5" />,
    description: "OTP verification or digital signature capture",
    recommended: true
  },
  {
    value: "click-to-confirm",
    label: "Click to Confirm",
    icon: <MousePointerClick className="h-5 w-5" />,
    description: "Explicit button click confirming consent",
    recommended: false
  },
  {
    value: "audio-video",
    label: "Audio/Video Consent",
    icon: <Video className="h-5 w-5" />,
    description: "Recorded verbal or video consent",
    recommended: false
  },
];

export function WizardStepMechanism({ data, onChange }: WizardStepMechanismProps) {
  const isExplicitType = data.type === "explicit" || data.type === "granular";

  return (
    <div className="space-y-8">
      {/* Explicitness Warning */}
      <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
          <div>
            <h4 className="font-medium text-warning">No Pre-Ticked Boxes</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Consent must be given through clear affirmative action.
            </p>
          </div>
        </div>
      </div>

      {/* Consent Mechanism Selection */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">
          Consent Capture Method <span className="text-destructive">*</span>
        </Label>
        <RadioGroup
          value={data.mechanism}
          onValueChange={(value) => onChange({ mechanism: value as ConsentMechanism })}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {mechanisms.map((mechanism) => (
            <Label
              key={mechanism.value}
              className={cn(
                "flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all relative",
                data.mechanism === mechanism.value
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
            >
              <RadioGroupItem value={mechanism.value} className="mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-muted">{mechanism.icon}</div>
                  <span className="font-medium">{mechanism.label}</span>
                  {mechanism.recommended && isExplicitType && (
                    <Badge className="bg-success/10 text-success border-success/20 text-xs">
                      Recommended
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {mechanism.description}
                </p>
              </div>
            </Label>
          ))}
        </RadioGroup>

        {data.mechanism === "signature" && (
          <div className="p-3 rounded-lg bg-info/10 border border-info/20">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-info mt-0.5" />
              <p className="text-xs text-info">
                Digital signature consent provides the highest level of proof and is recommended
                for sensitive data processing and cross-border transfers.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Additional Controls */}
      <div className="space-y-6">
        <Label className="text-sm font-medium">Additional Consent Controls</Label>

        {/* Separate Consents */}
        <div className="flex items-start justify-between p-4 rounded-lg border">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-primary" />
              <Label htmlFor="separateConsents" className="font-medium cursor-pointer">
                Separate Consent for Each Purpose
              </Label>
            </div>
            <p className="text-xs text-muted-foreground mt-1 ml-6">
              When enabled, each purpose will have its own consent checkbox (granular consent)
            </p>
            {data.regulations?.includes("GDPR") && (
              <Badge variant="outline" className="mt-2 ml-6 text-xs border-blue-500/50 text-blue-600">
                GDPR Recommended
              </Badge>
            )}
          </div>
          <Switch
            id="separateConsents"
            checked={data.separateConsents}
            onCheckedChange={(checked) => onChange({ separateConsents: checked })}
          />
        </div>

        {/* Aadhaar eKYC */}
        <div className="flex items-start justify-between p-4 rounded-lg border">
          <div className="flex-1">
            <Label htmlFor="requiresAadhaarVerification" className="font-medium cursor-pointer">
              Require Aadhaar eKYC (OTP)
            </Label>
            <p className="text-xs text-muted-foreground mt-1">
              End user must verify with Aadhaar-linked mobile OTP before consent is saved
            </p>
          </div>
          <Switch
            id="requiresAadhaarVerification"
            checked={!!data.requiresAadhaarVerification}
            onCheckedChange={(checked) => onChange({ requiresAadhaarVerification: checked })}
          />
        </div>

        {/* OTP Verification */}
        <div className="flex items-start justify-between p-4 rounded-lg border">
          <div className="flex-1">
            <Label htmlFor="requiresOtpVerification" className="font-medium cursor-pointer">
              Require OTP Verification
            </Label>
            <p className="text-xs text-muted-foreground mt-1">
              User must verify email or phone OTP before consent is saved (also enabled for Digital Signature mechanism)
            </p>
          </div>
          <Switch
            id="requiresOtpVerification"
            checked={!!data.requiresOtpVerification || data.mechanism === "signature"}
            disabled={data.mechanism === "signature"}
            onCheckedChange={(checked) => onChange({ requiresOtpVerification: checked })}
          />
        </div>

        {/* Withdrawal Visibility */}
        <div className="flex items-start justify-between p-4 rounded-lg border">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Undo2 className="h-4 w-4 text-primary" />
              <Label htmlFor="withdrawVisible" className="font-medium cursor-pointer">
                Withdrawal Option Visibility
              </Label>
            </div>
            <p className="text-xs text-muted-foreground mt-1 ml-6">
              Show clear instructions on how to withdraw consent alongside the consent form
            </p>
            {data.regulations?.includes("DPDP") && (
              <Badge variant="outline" className="mt-2 ml-6 text-xs border-orange-500/50 text-orange-600">
                DPDP Act Required
              </Badge>
            )}
          </div>
          <Switch
            id="withdrawVisible"
            checked={data.withdrawVisible}
            onCheckedChange={(checked) => onChange({ withdrawVisible: checked })}
          />
        </div>
      </div>

      {/* Preview of Consent UI */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">Consent UI Preview</Label>
        <div className="p-6 rounded-lg border bg-card">
          <div className="space-y-4 max-w-md">
            <p className="text-sm text-foreground">
              {data.description || "Your consent description will appear here..."}
            </p>

            {data.mechanism === "checkbox" && (
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" className="mt-1 h-4 w-4 rounded border-gray-300" disabled />
                <span className="text-sm">
                  I agree to the processing of my personal data for the purposes described above
                </span>
              </label>
            )}

            {data.mechanism === "toggle" && (
              <div className="flex items-center justify-between">
                <span className="text-sm">I consent to data processing</span>
                <div className="w-11 h-6 rounded-full bg-muted relative">
                  <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-background shadow" />
                </div>
              </div>
            )}

            {data.mechanism === "click-to-confirm" && (
              <button className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm" disabled>
                I Confirm and Agree
              </button>
            )}

            {data.mechanism === "signature" && (
              <div className="border-2 border-dashed rounded-lg p-4 text-center text-sm text-muted-foreground">
                Digital signature / OTP verification required
              </div>
            )}

            {data.withdrawVisible && (
              <p className="text-xs text-muted-foreground border-t pt-3">
                You can withdraw your consent at any time by contacting us or visiting your privacy settings.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
