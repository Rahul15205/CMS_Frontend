import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Clock, Trash2, Info, AlertTriangle, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ConsentTemplate } from "../types";

interface WizardStepRetentionProps {
  data: Partial<ConsentTemplate>;
  onChange: (updates: Partial<ConsentTemplate>) => void;
}

const retentionPeriods = [
  "6 months",
  "1 year",
  "1.5 years",
  "2 years",
  "3 years",
  "4 years",
  "5 years",
  "6 years",
  "7 years",
  "10 years",
  "Duration of service",
  "As required by law"
];

// Custom Retention Period Input component (Bug Fix 7)
function CustomRetentionInput({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  const [customNumber, setCustomNumber] = useState("");
  const [customUnit, setCustomUnit] = useState("years");

  const isCustomActive = value && !retentionPeriods.includes(value);

  const handleCustomChange = (num: string, unit: string) => {
    setCustomNumber(num);
    setCustomUnit(unit);
    if (num && Number(num) > 0) {
      const label = Number(num) === 1 ? unit.replace(/s$/, "") : unit;
      onChange(`${num} ${label}`);
    } else {
      onChange("");
    }
  };

  const handleUnitChange = (newUnit: string) => {
    if (newUnit !== customUnit) {
      // Bug 4.1: Reset number when unit changes
      setCustomNumber("");
      setCustomUnit(newUnit);
      onChange("");
    }
  };

  return (
    <div className="mt-3 p-3 rounded-lg border bg-muted/30">
      <Label className="text-xs text-muted-foreground mb-2 block">Or enter a custom retention duration:</Label>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min="0.5"
          step="0.5"
          placeholder="e.g., 1.5"
          value={isCustomActive ? (customNumber || value.split(" ")[0]) : customNumber}
          onChange={(e) => handleCustomChange(e.target.value, customUnit)}
          className="w-28 h-8"
        />
        <select
          value={isCustomActive ? (customUnit || value.split(" ").slice(1).join(" ")) : customUnit}
          onChange={(e) => handleUnitChange(e.target.value)}
          className="h-8 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="months">Months</option>
          <option value="years">Years</option>
        </select>
      </div>
    </div>
  );
}

export function WizardStepRetention({ data, onChange }: WizardStepRetentionProps) {
  const retention = data.retention || {
    period: "",
    justification: "",
    autoDelete: false,
    postWithdrawalRules: "",
    expireConsentOnRetentionEnd: false
  };

  const updateRetention = (updates: Partial<typeof retention>) => {
    onChange({ retention: { ...retention, ...updates } });
  };

  return (
    <div className="space-y-8">
      {/* Info Banner */}
      <div className="p-4 rounded-lg bg-info/10 border border-info/20">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-info mt-0.5" />
          <div>
            <h4 className="font-medium text-info">Storage Limitation Principle</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Personal data should be kept only for as long as necessary for the stated purposes.
              Define clear retention periods and deletion criteria.
            </p>
          </div>
        </div>
      </div>

      {/* Retention Period - Duration Pills */}
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium">
            Retention Period <span className="text-destructive">*</span>
          </Label>
          <p className="text-xs text-muted-foreground mt-1">
            Specify how long data will be retained
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {retentionPeriods.map((period) => (
            <Badge
              key={period}
              variant={retention.period === period ? "default" : "outline"}
              className={cn(
                "cursor-pointer px-3 py-1.5 text-sm transition-colors",
                retention.period === period
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "hover:bg-primary/10"
              )}
              onClick={() => updateRetention({ period })}
            >
              {period}
            </Badge>
          ))}
        </div>
        {!retention.period && (
          <p className="text-xs text-destructive">
            Please select a retention period or enter a custom duration.
          </p>
        )}

        {/* Custom Retention Period Input - Bug Fix 7 */}
        <CustomRetentionInput
          value={retention.period}
          onChange={(val) => updateRetention({ period: val })}
        />
      </div>

      {/* Consent Expiry on Retention End */}
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium">Consent Expiry on Retention End</Label>
          <p className="text-xs text-muted-foreground mt-1">
            Should the consent automatically expire when the data retention period ends?
          </p>
        </div>

        <RadioGroup
          value={retention.expireConsentOnRetentionEnd ? "expire" : "keep"}
          onValueChange={(val) => updateRetention({ expireConsentOnRetentionEnd: val === "expire" })}
          className="flex flex-col space-y-3"
        >
          <div className={cn(
            "flex items-start space-x-3 p-3 rounded-lg border-2 transition-all cursor-pointer",
            retention.expireConsentOnRetentionEnd ? "border-primary bg-primary/5" : "border-muted hover:border-primary/50"
          )}>
            <RadioGroupItem value="expire" id="expire" className="mt-1" />
            <Label htmlFor="expire" className="cursor-pointer flex-1">
              <div className="font-medium">Automatically expire consent</div>
              <p className="text-xs text-muted-foreground mt-1">
                Consent status will be set to 'Expired' and re-consent will be required for future processing.
              </p>
            </Label>
          </div>

          <div className={cn(
            "flex items-start space-x-3 p-3 rounded-lg border-2 transition-all cursor-pointer",
            !retention.expireConsentOnRetentionEnd ? "border-primary bg-primary/5" : "border-muted hover:border-primary/50"
          )}>
            <RadioGroupItem value="keep" id="keep" className="mt-1" />
            <Label htmlFor="keep" className="cursor-pointer flex-1">
              <div className="font-medium">Keep consent active</div>
              <p className="text-xs text-muted-foreground mt-1">
                Consent remains active even after retention period (e.g., if data is anonymized or retained for legal reasons).
              </p>
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Retention Justification */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="justification" className="text-sm font-medium">
            Retention Justification <span className="text-destructive">*</span>
          </Label>
          <p className="text-xs text-muted-foreground mt-1">
            Explain why this retention period is necessary
          </p>
        </div>
        <Textarea
          id="justification"
          placeholder="e.g., Required for service delivery, Statutory compliance requirements, Business operations..."
          value={retention.justification}
          onChange={(e) => updateRetention({ justification: e.target.value })}
          className="min-h-[100px]"
        />
      </div>

      {/* Auto-Deletion */}
      <div className="flex items-start justify-between p-4 rounded-lg border bg-card">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-primary" />
            <Label htmlFor="autoDelete" className="font-medium cursor-pointer">
              Automatic Data Deletion
            </Label>
          </div>
          <p className="text-sm text-muted-foreground mt-1 ml-7">
            Automatically delete personal data after retention period expires
          </p>
          {data.regulations?.includes("GDPR") && (
            <Badge variant="outline" className="mt-2 ml-7 text-xs border-blue-500/50 text-blue-600">
              GDPR Best Practice
            </Badge>
          )}
        </div>
        <Switch
          id="autoDelete"
          checked={retention.autoDelete}
          onCheckedChange={(checked) => updateRetention({ autoDelete: checked })}
        />
      </div>

      {/* Post-Withdrawal Rules */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="postWithdrawal" className="text-sm font-medium">
            Post-Withdrawal Retention Rules
          </Label>
          <p className="text-xs text-muted-foreground mt-1">
            What happens to data after consent is withdrawn?
          </p>
        </div>
        <Textarea
          id="postWithdrawal"
          placeholder="e.g., Data will be deleted within 30 days, Data will be anonymized, Certain data retained for legal compliance..."
          value={retention.postWithdrawalRules}
          onChange={(e) => updateRetention({ postWithdrawalRules: e.target.value })}
          className="min-h-[80px]"
        />

        {data.regulations?.includes("DPDP") && (
          <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5" />
              <div className="text-xs text-orange-800 dark:text-orange-300">
                <strong>DPDP Act:</strong> Upon withdrawal of consent, the Data Fiduciary must cease
                processing within a reasonable time and delete the personal data unless retention
                is required by law.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Summary Card */}
      <div className="p-4 rounded-lg bg-muted/50 border">
        <Label className="text-sm font-medium mb-3 block">Retention Summary</Label>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Retention Period:</span>
            <span className="font-medium">{retention.period || "Not set"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Consent Expiry:</span>
            <Badge variant={retention.expireConsentOnRetentionEnd ? "destructive" : "outline"}>
              {retention.expireConsentOnRetentionEnd ? "Auto-Expire" : "Manual"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Auto-Deletion:</span>
            <Badge variant={retention.autoDelete ? "default" : "secondary"}>
              {retention.autoDelete ? "Enabled" : "Manual"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Post-Withdrawal:</span>
            <span className="font-medium text-right max-w-[200px] truncate">
              {retention.postWithdrawalRules || "Not defined"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
