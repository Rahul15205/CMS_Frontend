import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConsentTemplate, REGULATION_INFO, CONSENT_TYPE_INFO } from "./types";

interface TemplatePreviewDialogProps {
  template?: ConsentTemplate;
  open: boolean;
  onClose: () => void;
}

export function TemplatePreviewDialog({ template, open, onClose }: TemplatePreviewDialogProps) {
  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>View Template Details</DialogTitle>
          <DialogDescription>
            Read-only view of the consent template configuration.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-4 -mr-4 pl-4">
          <div className="space-y-6 pr-4">
            {/* Basic Info */}
            <div className="space-y-2">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                Basic Information
              </h3>
              <div className="grid grid-cols-2 gap-4 pl-8 text-sm">
                <div>
                  <span className="text-muted-foreground">Name:</span>
                  <p className="font-medium">{template.name || "Untitled"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Version:</span>
                  <p className="font-medium">{template.version || "1.0"}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Description:</span>
                  <p>{template.description || "-"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <p className="font-medium capitalize">{template.status}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Type:</span>
                  <p className="font-medium">{CONSENT_TYPE_INFO[template.type as keyof typeof CONSENT_TYPE_INFO]?.label || template.type}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Regulations:</span>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {template.regulations?.map(reg => (
                      <Badge key={reg} variant="outline" className={REGULATION_INFO[reg.toUpperCase() as keyof typeof REGULATION_INFO]?.color || ""}>
                        {reg.toUpperCase()}
                      </Badge>
                    ))}
                    {template.customRegulationName && (
                      <Badge variant="outline" className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                        {template.customRegulationName}
                      </Badge>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Validity:</span>
                  <p className="font-medium">{template.noExpiry ? "No expiry" : (template.validityDuration || "-")}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Language:</span>
                  <p className="font-medium">{template.language || template.defaultLanguage || "English"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Tags:</span>
                  <div className="flex gap-1 mt-1">
                    {template.tags?.map(tag => (
                      <span key={tag} className="px-1.5 py-0.5 bg-secondary text-secondary-foreground rounded text-xs">{tag}</span>
                    ))}
                    {(!template.tags || template.tags.length === 0) && <span className="text-muted-foreground">-</span>}
                  </div>
                </div>
              </div>
            </div>
            <Separator />

            {/* Data Principal */}
            <div className="space-y-2">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                Data Principal
              </h3>
              <div className="pl-8 text-sm">
                <p><span className="text-muted-foreground">Type:</span> {template.targetUserCategory?.join(", ") || "-"}</p>
                <p><span className="text-muted-foreground">Age Threshold:</span> {template.ageThreshold || "-"}</p>
                <p><span className="text-muted-foreground">Consent Given By:</span> {template.consentGivenBy || "-"}</p>
              </div>
            </div>
            <Separator />

            {/* Purpose */}
            <div className="space-y-2">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                Purpose of Collection
              </h3>
              <div className="pl-8 text-sm space-y-2">
                {template.purposes && template.purposes.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1">
                    {template.purposes.map((p, i) => (
                      <li key={i}><strong>{p.name}</strong>: {p.description}</li>
                    ))}
                  </ul>
                ) : (
                  <>
                    <p className="font-medium">{template.purposeTitle || "-"}</p>
                    <p className="text-muted-foreground">{template.purposeDescription || "-"}</p>
                  </>
                )}
                {template.lawfulBasis && (
                  <p className="text-xs bg-muted inline-block px-2 py-1 rounded">Basis: {template.lawfulBasis}</p>
                )}
              </div>
            </div>
            <Separator />

            {/* Data Attributes */}
            <div className="space-y-2">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs">4</span>
                Data Attributes
              </h3>
              <ul className="pl-8 text-sm list-disc list-inside">
                {template.dataCategories?.map((cat: any, i: number) => (
                  <li key={i}>{cat.label || cat} {cat.mandatory ? "(Required)" : "(Optional)"} — {cat.source || "direct"}{cat.country ? ` [${cat.country}]` : ""}</li>
                )) || <li className="text-muted-foreground">No categories selected</li>}
              </ul>
            </div>
            <Separator />

            {/* Mechanism */}
            <div className="space-y-2">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs">5</span>
                Consent Mechanism
              </h3>
              <div className="pl-8 text-sm grid grid-cols-2 gap-4">
                <p><span className="text-muted-foreground">Type:</span> {template.mechanismType || template.mechanism || "-"}</p>
                <p><span className="text-muted-foreground">Double Opt-in:</span> {template.doubleOptIn ? "Yes" : "No"}</p>
              </div>
            </div>
            <Separator />

            {/* Data Sharing */}
            <div className="space-y-2">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs">6</span>
                Data Sharing
              </h3>
              <div className="pl-8 text-sm">
                <p className="mb-2"><span className="text-muted-foreground">Data Sharing Enabled:</span> {template.dataSharing ? "Yes" : "No"}</p>
                {template.dataSharing && template.thirdParties && template.thirdParties.length > 0 && (
                  <div className="space-y-1">
                    <p className="font-medium text-xs uppercase text-muted-foreground">Third Parties:</p>
                    <ul className="list-disc list-inside">
                      {template.thirdParties.map((tp, i) => (
                        <li key={i}>{tp.name} ({tp.role}) - {tp.country}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            <Separator />

            {/* Sub-Processors */}
            <div className="space-y-2">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs">7</span>
                Sub-Processors
              </h3>
              <div className="pl-8 text-sm">
                {template.subProcessors && template.subProcessors.length > 0 ? (
                  <ul className="list-disc list-inside">
                    {template.subProcessors.map((sp, i) => (
                      <li key={i}>{sp.name} - {sp.purpose} ({sp.country})</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">No sub-processors listed</p>
                )}
              </div>
            </div>
            <Separator />

            {/* Data Retention */}
            <div className="space-y-2">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs">8</span>
                Data Retention
              </h3>
              <div className="pl-8 text-sm grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <span className="text-muted-foreground">Period:</span> <span className="font-medium">{template.retention?.period || "-"}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Justification:</span>
                  <p className="mt-1">{template.retention?.justification || "-"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Auto-Delete:</span> {template.retention?.autoDelete ? "Yes" : "No"}
                </div>
              </div>
            </div>
            <Separator />

            {/* Security Measures */}
            <div className="space-y-2">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs">9</span>
                Security Measures
              </h3>
              <div className="pl-8 text-sm">
                <div className="flex flex-wrap gap-2">
                  {template.security?.encryptionAtRest && <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs dark:bg-green-900/30 dark:text-green-400">Encryption At Rest</span>}
                  {template.security?.encryptionInTransit && <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs dark:bg-green-900/30 dark:text-green-400">Encryption In Transit</span>}
                  {template.security?.accessControls && <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs dark:bg-green-900/30 dark:text-green-400">Access Controls</span>}
                  {template.security?.monitoringLogging && <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs dark:bg-green-900/30 dark:text-green-400">Monitoring & Logging</span>}
                </div>
              </div>
            </div>
            <Separator />

            {/* Rights & Withdrawal */}
            <div className="space-y-2">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs">10</span>
                Rights & Withdrawal
              </h3>
              <div className="pl-8 text-sm space-y-2">
                <p><span className="text-muted-foreground">Withdrawal Visible:</span> {template.withdrawVisible ? "Yes" : "No"}</p>
                <p><span className="text-muted-foreground">Method:</span> {template.withdrawal?.method || "-"}</p>
                <p><span className="text-muted-foreground">Rights Link:</span> {template.withdrawal?.rightsLink || "-"}</p>
              </div>
            </div>
            <Separator />

            {/* Notice & Audit */}
            <div className="space-y-2">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs">11</span>
                Notice & Audit
              </h3>
              <div className="pl-8 text-sm">
                <p><span className="text-muted-foreground">Privacy Notice Ref:</span> {template.privacyNoticeRef || "-"}</p>
                <p><span className="text-muted-foreground">Audit Trail Enabled:</span> {template.auditTrailEnabled ? "Yes" : "No"}</p>
              </div>
            </div>
            <Separator />

            {/* Localization */}
            <div className="space-y-2">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs">12</span>
                Localization
              </h3>
              <div className="pl-8 text-sm">
                <p><span className="text-muted-foreground">Default Language:</span> {template.defaultLanguage || "English"}</p>
                <p><span className="text-muted-foreground">Supported Languages:</span> {template.supportedLanguages?.join(", ") || "-"}</p>
              </div>
            </div>

          </div>
        </div>

        <DialogFooter className="mt-4 border-t pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
