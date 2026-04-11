import { useState } from "react";
import { Check, ChevronLeft, ChevronRight, Save, AlertCircle, Info, ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { WIZARD_STEPS, ConsentTemplate, DEFAULT_TEMPLATE } from "./types";
import { WizardStepBasicInfo } from "./wizard-steps/WizardStepBasicInfo";
import { WizardStepDataPrincipal } from "./wizard-steps/WizardStepDataPrincipal";
import { WizardStepPurpose } from "./wizard-steps/WizardStepPurpose";
import { WizardStepDataCategories } from "./wizard-steps/WizardStepDataCategories";
import { WizardStepMechanism } from "./wizard-steps/WizardStepMechanism";
import { WizardStepDataSharing } from "./wizard-steps/WizardStepDataSharing";
import { WizardStepSubProcessors } from "./wizard-steps/WizardStepSubProcessors";
import { WizardStepRetention } from "./wizard-steps/WizardStepRetention";
import { WizardStepSecurity } from "./wizard-steps/WizardStepSecurity";
import { WizardStepWithdrawal } from "./wizard-steps/WizardStepWithdrawal";
import { WizardStepNotice } from "./wizard-steps/WizardStepNotice";
import { WizardStepLocalization } from "./wizard-steps/WizardStepLocalization";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface ConsentTemplateWizardProps {
  template?: ConsentTemplate;
  onSave: (template: Partial<ConsentTemplate>) => void;
  onCancel: () => void;
}

export function ConsentTemplateWizard({ template, onSave, onCancel }: ConsentTemplateWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<ConsentTemplate>>(template || DEFAULT_TEMPLATE);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const { toast } = useToast();

  const progress = (currentStep / WIZARD_STEPS.length) * 100;

  const updateFormData = (updates: Partial<ConsentTemplate>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        const hasBasicInfo = !!(formData.name && formData.description && formData.type && formData.regulations?.length);
        const hasValidity = formData.noExpiry || !!formData.validityDuration;
        if (!hasBasicInfo || !hasValidity) {
          toast({
            title: "Required Fields Missing",
            description: "Please fill in all fields marked with * before proceeding.",
            variant: "destructive",
          });
          return false;
        }
        return true;
      case 2:
        if (!formData.targetUserCategory || formData.targetUserCategory.length === 0) {
          toast({
            title: "Required Fields Missing",
            description: "Please select at least one Target User Category before proceeding.",
            variant: "destructive",
          });
          return false;
        }
        return true;
      case 3:
        if (!formData.purposes || formData.purposes.length === 0) {
          toast({
            title: "Purpose Required",
            description: "Please add at least one purpose for data collection.",
            variant: "destructive",
          });
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!isStepValid(currentStep)) return;
    
    if (currentStep < WIZARD_STEPS.length) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleStepClick = (stepId: number) => {
    // If moving backward, allow it
    if (stepId < currentStep) {
      setCurrentStep(stepId);
      return;
    }
    
    // If moving forward, must validate current step first
    if (stepId > currentStep) {
      // If jumping more than 1 step forward, we still only validate the current one
      // but the logic ensures you can't skip ahead without clearing the immediate hurdle
      if (!isStepValid(currentStep)) return;
      setCurrentStep(stepId);
    }
  };

  const handleSaveDraft = () => {
    onSave({ ...formData, status: "draft" });
    toast({
      title: "Draft Saved",
      description: "Your consent template has been saved as a draft.",
    });
  };

  const handlePublish = () => {
    // Validate Step 1 and 3 one last time before publishing
    if (!isStepValid(1) || !isStepValid(3)) {
      setShowPreviewDialog(false);
      return;
    }

    onSave({ ...formData, status: "active" });
    toast({
      title: "Template Published",
      description: "Your consent template is now active.",
    });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <WizardStepBasicInfo data={formData} onChange={updateFormData} />;
      case 2:
        return <WizardStepDataPrincipal data={formData} onChange={updateFormData} />;
      case 3:
        return <WizardStepPurpose data={formData} onChange={updateFormData} />;
      case 4:
        return <WizardStepDataCategories data={formData} onChange={updateFormData} />;
      case 5:
        return <WizardStepMechanism data={formData} onChange={updateFormData} />;
      case 6:
        return <WizardStepDataSharing data={formData} onChange={updateFormData} />;
      case 7:
        return <WizardStepSubProcessors data={formData} onChange={updateFormData} />;
      case 8:
        return <WizardStepRetention data={formData} onChange={updateFormData} />;
      case 9:
        return <WizardStepSecurity data={formData} onChange={updateFormData} />;
      case 10:
        return <WizardStepWithdrawal data={formData} onChange={updateFormData} />;
      case 11:
        return <WizardStepNotice data={formData} onChange={updateFormData} />;
      case 12:
        return <WizardStepLocalization data={formData} onChange={updateFormData} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b bg-card px-6 py-4">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="icon" onClick={() => setShowCancelDialog(true)} className="-ml-3 h-10 w-10 rounded-full hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {template ? "Edit Consent Template" : "Create New Consent Template"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {WIZARD_STEPS[currentStep - 1].description}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">
              Step {currentStep} of {WIZARD_STEPS.length}: {WIZARD_STEPS[currentStep - 1].title}
            </span>
            <span className="text-muted-foreground">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Step Navigation Pills */}
      <div className="border-b bg-muted/30 px-6 py-3 overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          {WIZARD_STEPS.map((step) => (
            <button
              key={step.id}
              onClick={() => handleStepClick(step.id)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                currentStep === step.id
                  ? "bg-primary text-primary-foreground"
                  : step.id < currentStep
                    ? "bg-success/10 text-success"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {step.id < currentStep ? (
                <Check className="h-3 w-3" />
              ) : (
                <span className="w-4 h-4 rounded-full bg-current/20 flex items-center justify-center text-[10px]">
                  {step.id}
                </span>
              )}
              {step.title}
            </button>
          ))}
        </div>
      </div>

      {/* Regulation Hints */}
      {formData.regulations && formData.regulations.length > 0 && (
        <div className="border-b bg-info/5 px-6 py-2">
          <div className="flex items-center gap-2 text-xs text-info">
            <Info className="h-4 w-4" />
            <span>
              Showing requirements for: {formData.regulations.join(", ")}
            </span>
          </div>
        </div>
      )}

      {/* Step Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-4xl mx-auto">{renderStep()}</div>
      </div>

      {/* Footer */}
      <div className="border-t bg-card px-6 py-4">
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 max-w-4xl mx-auto">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="w-full sm:w-auto"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <Button variant="outline" onClick={handleSaveDraft} className="w-full sm:w-auto">
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>

            {currentStep === WIZARD_STEPS.length ? (
              <Button onClick={() => setShowPreviewDialog(true)} className="w-full sm:w-auto">
                <FileText className="h-4 w-4 mr-2" />
                Preview Template
              </Button>
            ) : (
              <Button onClick={handleNext} className="w-full sm:w-auto">
                Next Step
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-warning" />
              Discard Changes?
            </AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to leave? All changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Editing</AlertDialogCancel>
            <AlertDialogAction onClick={onCancel} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Preview & Publish Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Review Consent Template</DialogTitle>
            <DialogDescription>
              Please review all details before publishing. This template will be active immediately.
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
                    <p className="font-medium">{formData.name || "Untitled"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Version:</span>
                    <p className="font-medium">{formData.version || "1.0"}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Description:</span>
                    <p>{formData.description || "-"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Language:</span>
                    <p className="font-medium">{formData.language || "English"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tags:</span>
                    <div className="flex gap-1 mt-1">
                      {formData.tags?.map(tag => (
                        <span key={tag} className="px-1.5 py-0.5 bg-secondary text-secondary-foreground rounded text-xs">{tag}</span>
                      ))}
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
                  <p><span className="text-muted-foreground">Type:</span> {formData.targetUserCategory?.join(", ") || "-"}</p>
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
                  <p className="font-medium">{formData.purposeTitle}</p>
                  <p className="text-muted-foreground">{formData.purposeDescription}</p>
                  {formData.lawfulBasis && (
                    <p className="text-xs bg-muted inline-block px-2 py-1 rounded">Basis: {formData.lawfulBasis}</p>
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
                  {formData.dataCategories?.map((cat: any, i: number) => (
                    <li key={i}>{cat.label || cat}</li>
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
                  <p><span className="text-muted-foreground">Type:</span> {formData.mechanismType || "-"}</p>
                  <p><span className="text-muted-foreground">Double Opt-in:</span> {formData.doubleOptIn ? "Yes" : "No"}</p>
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
                  <p className="mb-2"><span className="text-muted-foreground">Data Sharing Enabled:</span> {formData.dataSharing ? "Yes" : "No"}</p>
                  {formData.dataSharing && formData.thirdParties && formData.thirdParties.length > 0 && (
                    <div className="space-y-1">
                      <p className="font-medium text-xs uppercase text-muted-foreground">Third Parties:</p>
                      <ul className="list-disc list-inside">
                        {formData.thirdParties.map((tp, i) => (
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
                  {formData.subProcessors && formData.subProcessors.length > 0 ? (
                    <ul className="list-disc list-inside">
                      {formData.subProcessors.map((sp, i) => (
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
                    <span className="text-muted-foreground">Period:</span> <span className="font-medium">{formData.retention?.period || "-"}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Justification:</span>
                    <p className="mt-1">{formData.retention?.justification || "-"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Auto-Delete:</span> {formData.retention?.autoDelete ? "Yes" : "No"}
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
                    {formData.security?.encryptionAtRest && <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs dark:bg-green-900/30 dark:text-green-400">Encryption At Rest</span>}
                    {formData.security?.encryptionInTransit && <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs dark:bg-green-900/30 dark:text-green-400">Encryption In Transit</span>}
                    {formData.security?.accessControls && <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs dark:bg-green-900/30 dark:text-green-400">Access Controls</span>}
                    {formData.security?.monitoringLogging && <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs dark:bg-green-900/30 dark:text-green-400">Monitoring & Logging</span>}
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
                  <p><span className="text-muted-foreground">Withdrawal Visible:</span> {formData.withdrawVisible ? "Yes" : "No"}</p>
                  <p><span className="text-muted-foreground">Method:</span> {formData.withdrawal?.method || "-"}</p>
                  <p><span className="text-muted-foreground">Rights Link:</span> {formData.withdrawal?.rightsLink || "-"}</p>
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
                  <p><span className="text-muted-foreground">Privacy Notice Ref:</span> {formData.privacyNoticeRef || "-"}</p>
                  <p><span className="text-muted-foreground">Audit Trail Enabled:</span> {formData.auditTrailEnabled ? "Yes" : "No"}</p>
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
                  <p><span className="text-muted-foreground">Default Language:</span> {formData.defaultLanguage || "English"}</p>
                  <p><span className="text-muted-foreground">Supported Languages:</span> {formData.supportedLanguages?.join(", ") || "-"}</p>
                </div>
              </div>

            </div>
          </div>

          <DialogFooter className="mt-4 border-t pt-4">
            <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>
              Back to Edit
            </Button>
            <Button onClick={() => {
              setShowPreviewDialog(false);
              handlePublish();
            }}>
              <Check className="h-4 w-4 mr-2" />
              Publish Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
