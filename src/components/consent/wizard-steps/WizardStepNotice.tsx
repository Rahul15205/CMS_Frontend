import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, History, Shield, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConsentTemplate } from "../types";

interface WizardStepNoticeProps {
  data: Partial<ConsentTemplate>;
  onChange: (updates: Partial<ConsentTemplate>) => void;
}

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock Active Notices - eventually this will come from an API
const activeNotices = [
  { id: "pn-001", name: "General Privacy Policy", version: "v2.0", reference: "PN-2024-001" },
  { id: "pn-002", name: "Cookie Policy", version: "v1.5", reference: "CP-2024-002" },
  { id: "pn-003", name: "Employee Privacy Notice", version: "v1.0", reference: "EPN-2024-003" },
  { id: "pn-004", name: "Mobile App Privacy Policy", version: "v3.1", reference: "MAP-2024-004" },
  { id: "pn-005", name: "Terms of Service", version: "2024", reference: "TOS-2024-005" },
];

export function WizardStepNotice({ data, onChange }: WizardStepNoticeProps) {
  return (
    <div className="space-y-8">
      {/* Info Banner */}
      <div className="p-4 rounded-lg bg-info/10 border border-info/20">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-info mt-0.5" />
          <div>
            <h4 className="font-medium text-info">Accountability & Compliance</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Maintain comprehensive records of consent collection for regulatory
              compliance and audit purposes. This includes timestamps, versions,
              and proof of consent.
            </p>
          </div>
        </div>
      </div>

      {/* Privacy Notice Reference */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="privacyNotice" className="text-sm font-medium">
            Privacy Notice Reference
          </Label>
          <p className="text-xs text-muted-foreground mt-1">
            Link this consent to a specific privacy notice version
          </p>
        </div>
        <div className="flex items-center gap-3 max-w-md">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <Select
            value={data.privacyNoticeRef}
            onValueChange={(value) => onChange({ privacyNoticeRef: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a privacy notice" />
            </SelectTrigger>
            <SelectContent>
              {activeNotices.map((notice) => (
                <SelectItem key={notice.id} value={notice.reference}>
                  <span className="font-medium">{notice.name}</span>
                  <span className="ml-2 text-muted-foreground text-xs">({notice.version})</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Audit Trail */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">Audit & Compliance Controls</Label>

        <div className={cn(
          "flex items-start justify-between p-4 rounded-lg border transition-colors",
          data.auditTrailEnabled ? "bg-success/5 border-success/20" : "bg-card"
        )}>
          <div className="flex items-start gap-3">
            <div className={cn(
              "p-2 rounded-lg",
              data.auditTrailEnabled ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
            )}>
              <History className="h-5 w-5" />
            </div>
            <div>
              <Label htmlFor="auditTrail" className="font-medium cursor-pointer">
                Enable Audit Trail
              </Label>
              <p className="text-sm text-muted-foreground mt-0.5">
                Record all consent-related events with immutable timestamps
              </p>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  DPDP Required
                </Badge>
                <Badge variant="outline" className="text-xs">
                  GDPR Required
                </Badge>
              </div>
            </div>
          </div>
          <Switch
            id="auditTrail"
            checked={data.auditTrailEnabled ?? true}
            onCheckedChange={(checked) => onChange({ auditTrailEnabled: checked })}
          />
        </div>
      </div>

      {/* What gets recorded */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">Audit Trail Records</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { icon: <Clock className="h-4 w-4" />, label: "Consent Timestamp", desc: "Exact date and time of consent" },
            { icon: <FileText className="h-4 w-4" />, label: "Notice Version", desc: "Privacy notice shown at consent" },
            { icon: <Shield className="h-4 w-4" />, label: "Proof Storage", desc: "Cryptographic proof of consent" },
            { icon: <History className="h-4 w-4" />, label: "Change History", desc: "All modifications tracked" },
          ].map((item) => (
            <div key={item.label} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <div className="p-1.5 rounded-md bg-background">{item.icon}</div>
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compliance Summary */}
      <div className="p-4 rounded-lg bg-card border">
        <Label className="text-sm font-medium mb-3 block">Compliance Checklist</Label>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Badge className={cn(
              "h-5 w-5 p-0 flex items-center justify-center",
              data.privacyNoticeRef ? "bg-success/10 text-success border-success/20" : "bg-muted"
            )}>
              {data.privacyNoticeRef ? "✓" : "–"}
            </Badge>
            <span className={cn(!data.privacyNoticeRef && "text-muted-foreground")}>
              Privacy notice linked
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Badge className={cn(
              "h-5 w-5 p-0 flex items-center justify-center",
              data.auditTrailEnabled ? "bg-success/10 text-success border-success/20" : "bg-muted"
            )}>
              {data.auditTrailEnabled ? "✓" : "–"}
            </Badge>
            <span className={cn(!data.auditTrailEnabled && "text-muted-foreground")}>
              Audit trail enabled
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Badge className="h-5 w-5 p-0 flex items-center justify-center bg-success/10 text-success border-success/20">
              ✓
            </Badge>
            <span>Timestamp capture (automatic)</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Badge className="h-5 w-5 p-0 flex items-center justify-center bg-success/10 text-success border-success/20">
              ✓
            </Badge>
            <span>Version control (automatic)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
