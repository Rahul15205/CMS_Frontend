import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Undo2, Link, Clock, FileText, Info, AlertTriangle } from "lucide-react";
import { ConsentTemplate, WithdrawalInfo } from "../types";

interface WizardStepWithdrawalProps {
  data: Partial<ConsentTemplate>;
  onChange: (updates: Partial<ConsentTemplate>) => void;
}

export function WizardStepWithdrawal({ data, onChange }: WizardStepWithdrawalProps) {
  const withdrawal = data.withdrawal || {
    method: "",
    effect: "",
    rightsLink: "",
    processingTimeline: "",
  };

  const updateWithdrawal = (updates: Partial<WithdrawalInfo>) => {
    onChange({ withdrawal: { ...withdrawal, ...updates } });
  };

  return (
    <div className="space-y-8">
      {/* DPDP Act Requirement */}
      <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
          <div>
            <h4 className="font-medium text-warning">Right to Withdraw Consent</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Under DPDP Act Section 6(6), the Data Principal has the right to withdraw consent
              at any time with the ease of doing so being comparable to the ease with which
              consent was given.
            </p>
          </div>
        </div>
      </div>

      {/* Withdrawal Method */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="method" className="text-sm font-medium">
            How to Withdraw Consent <span className="text-destructive">*</span>
          </Label>
          <p className="text-xs text-muted-foreground mt-1">
            Clear instructions on how users can withdraw their consent
          </p>
        </div>
        <div className="flex items-start gap-3">
          <Undo2 className="h-5 w-5 text-muted-foreground mt-2" />
          <Textarea
            id="method"
            placeholder="e.g., Visit your account settings, click 'Privacy', then 'Manage Consents'. Or email privacy@company.com with your request."
            value={withdrawal.method}
            onChange={(e) => updateWithdrawal({ method: e.target.value })}
            className="min-h-[80px]"
          />
        </div>

        {/* Quick suggestions */}
        <div className="flex flex-wrap gap-2">
          {[
            "Account Settings → Privacy",
            "Email to privacy@company.com",
            "Contact Support",
            "Self-service portal"
          ].map((method) => (
            <Badge
              key={method}
              variant="outline"
              className="cursor-pointer hover:bg-primary/10"
              onClick={() => updateWithdrawal({ method })}
            >
              {method}
            </Badge>
          ))}
        </div>
      </div>

      {/* Effect of Withdrawal */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="effect" className="text-sm font-medium">
            Effect of Withdrawal <span className="text-destructive">*</span>
          </Label>
          <p className="text-xs text-muted-foreground mt-1">
            What will happen when consent is withdrawn
          </p>
        </div>
        <div className="flex items-start gap-3">
          <FileText className="h-5 w-5 text-muted-foreground mt-2" />
          <Textarea
            id="effect"
            placeholder="e.g., We will stop sending marketing emails within 48 hours. Historical data may be retained for legal compliance but won't be used for marketing."
            value={withdrawal.effect}
            onChange={(e) => updateWithdrawal({ effect: e.target.value })}
            className="min-h-[80px]"
          />
        </div>
      </div>

      {/* Rights Request Link */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="rightsLink" className="text-sm font-medium">
            Link to Rights Request Page
          </Label>
          <p className="text-xs text-muted-foreground mt-1">
            URL where users can submit data subject rights requests
          </p>
        </div>
        <div className="flex items-center gap-3 max-w-xl">
          <Link className="h-5 w-5 text-muted-foreground" />
          <Input
            id="rightsLink"
            type="url"
            placeholder="e.g., /privacy/rights or https://company.com/privacy/rights"
            value={withdrawal.rightsLink}
            onChange={(e) => updateWithdrawal({ rightsLink: e.target.value })}
          />
        </div>
      </div>

      {/* Processing Timeline */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="timeline" className="text-sm font-medium">
            Processing Timeline <span className="text-destructive">*</span>
          </Label>
          <p className="text-xs text-muted-foreground mt-1">
            How long it takes to process a withdrawal request
          </p>
        </div>
        <div className="flex items-center gap-3 max-w-md">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <Input
            id="timeline"
            placeholder="e.g., Within 7 business days"
            value={withdrawal.processingTimeline}
            onChange={(e) => updateWithdrawal({ processingTimeline: e.target.value })}
          />
        </div>

        {/* Quick timeline suggestions */}
        <div className="flex flex-wrap gap-2">
          {["24 hours", "48 hours", "7 days", "14 days", "30 days"].map((timeline) => (
            <Badge
              key={timeline}
              variant="outline"
              className="cursor-pointer hover:bg-primary/10"
              onClick={() => updateWithdrawal({ processingTimeline: timeline })}
            >
              {timeline}
            </Badge>
          ))}
        </div>
      </div>

      {/* Info about lawful basis */}
      <div className="p-4 rounded-lg bg-info/10 border border-info/20">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-info mt-0.5" />
          <div>
            <h4 className="font-medium text-info">Important Note</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Withdrawal of consent does not affect the lawfulness of processing based on
              consent before its withdrawal. Some data may still be retained if there's a
              legal basis (e.g., legal obligation, vital interest) for continued processing.
            </p>
          </div>
        </div>
      </div>

      {/* Preview Card */}
      <div className="p-4 rounded-lg bg-card border">
        <Label className="text-sm font-medium mb-3 block">Withdrawal Information Preview</Label>
        <div className="prose prose-sm max-w-none text-muted-foreground">
          <p><strong>To withdraw consent:</strong> {withdrawal.method || "[Not specified]"}</p>
          <p><strong>What happens:</strong> {withdrawal.effect || "[Not specified]"}</p>
          <p><strong>Processing time:</strong> {withdrawal.processingTimeline || "[Not specified]"}</p>
          {withdrawal.rightsLink && (
            <p><strong>More info:</strong> <a href={withdrawal.rightsLink} className="text-primary">{withdrawal.rightsLink}</a></p>
          )}
        </div>
      </div>
    </div>
  );
}
