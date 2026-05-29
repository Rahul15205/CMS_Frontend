import { useState } from "react"; // PHASE 5 CHANGE
import { Button } from "@/components/ui/button"; // PHASE 5 CHANGE
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // PHASE 5 CHANGE
import { Separator } from "@/components/ui/separator"; // PHASE 5 CHANGE
import { Textarea } from "@/components/ui/textarea"; // PHASE 5 CHANGE
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"; // PHASE 5 CHANGE
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // PHASE 5 CHANGE
import { Progress } from "@/components/ui/progress"; // PHASE 5 CHANGE
import { useToast } from "@/hooks/use-toast"; // PHASE 5 CHANGE
import {
  CheckCircle,
  XCircle,
  MessageSquare,
  Edit,
  Download,
  ArrowUpRight,
  FileText,
  Loader2,
} from "lucide-react"; // PHASE 5 CHANGE
import { rightsService } from "@/services/rightsService"; // PHASE 5 CHANGE
import { handleApiError } from "@/lib/errorHandler"; // PHASE 5 CHANGE
import { RightsRequest } from "@/components/rights/types"; // PHASE 5 CHANGE

// PHASE 5 CHANGE
const VALID_ACTIONS: Record<string, string[]> = {
  RECEIVED:           ["reject"],
  IN_VERIFICATION:    ["reject"],
  IN_REVIEW:          ["approve", "reject", "requestInfo", "partialFulfil", "escalate", "generateExtract"],
  ON_HOLD:            ["reject"],
  ACTION_TAKEN:       ["approve", "partialFulfil"],
  PARTIAL_FULFILMENT: ["approve"],
  ESCALATED:          ["approve", "reject"],
  COMPLETED:          [],
  REJECTED:           [],
};

interface QuickActionsPanelProps {
  request: RightsRequest;
  onStatusUpdate: () => void;
}

export function QuickActionsPanel({ request, onStatusUpdate }: QuickActionsPanelProps) {
  const { toast } = useToast();

  // Loading States
  const [isApproveLoading, setIsApproveLoading] = useState(false);
  const [isRejectLoading, setIsRejectLoading] = useState(false);
  const [isRequestInfoLoading, setIsRequestInfoLoading] = useState(false);
  const [isPartialFulfilLoading, setIsPartialFulfilLoading] = useState(false);
  const [isEscalateLoading, setIsEscalateLoading] = useState(false);
  const [isExtractLoading, setIsExtractLoading] = useState(false);
  const [isAuditLoading, setIsAuditLoading] = useState(false);

  // Modal Visibility States
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showRequestInfoModal, setShowRequestInfoModal] = useState(false);
  const [showPartialFulfilModal, setShowPartialFulfilModal] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);

  // Field Inputs States
  const [rejectReason, setRejectReason] = useState<any>("");
  const [rejectComment, setRejectComment] = useState("");
  const [requestInfoMessage, setRequestInfoMessage] = useState("");
  const [fulfilledData, setFulfilledData] = useState("");
  const [withheldData, setWithheldData] = useState("");
  const [legalJustification, setLegalJustification] = useState("");
  const [escalateTarget, setEscalateTarget] = useState<any>("");
  const [escalateRationale, setEscalateRationale] = useState("");
  const [extractProgress, setExtractProgress] = useState(0);

  // Resolve Valid Actions
  const currentStatus = (request.status || "").toUpperCase();
  const allowed = VALID_ACTIONS[currentStatus] || [];
  const isActionValid = (action: string) => allowed.includes(action);

  // 1. Approve Action
  const handleApprove = async () => {
    try {
      setIsApproveLoading(true);
      await rightsService.approve(request.id);
      toast({
        title: "Request Approved",
        description: `Case ${request.caseNumber} has been successfully approved.`,
      });
      setShowApproveConfirm(false);
      onStatusUpdate();
    } catch (err) {
      handleApiError(err, "Approving Request");
    } finally {
      setIsApproveLoading(false);
    }
  };

  // 2. Reject Action
  const handleReject = async () => {
    if (!rejectReason) {
      toast({ title: "Validation Error", description: "Please select a rejection reason.", variant: "destructive" });
      return;
    }
    try {
      setIsRejectLoading(true);
      await rightsService.reject(request.id, {
        reason: rejectReason,
        comment: rejectComment || undefined,
      });
      toast({
        title: "Request Rejected",
        description: `Case ${request.caseNumber} has been rejected.`,
      });
      setShowRejectModal(false);
      onStatusUpdate();
    } catch (err) {
      handleApiError(err, "Rejecting Request");
    } finally {
      setIsRejectLoading(false);
    }
  };

  // 3. Request More Info Action
  const handleRequestInfo = async () => {
    if (!requestInfoMessage.trim()) {
      toast({ title: "Validation Error", description: "Message is required.", variant: "destructive" });
      return;
    }
    try {
      setIsRequestInfoLoading(true);
      await rightsService.requestMoreInfo(request.id, {
        message: requestInfoMessage,
      });
      toast({
        title: "Request Details Sent",
        description: "Information request has been successfully recorded and emailed.",
      });
      setShowRequestInfoModal(false);
      onStatusUpdate();
    } catch (err) {
      handleApiError(err, "Requesting More Info");
    } finally {
      setIsRequestInfoLoading(false);
    }
  };

  // 4. Partial Fulfilment Action
  const handlePartialFulfil = async () => {
    if (!fulfilledData.trim() || !withheldData.trim() || !legalJustification.trim()) {
      toast({ title: "Validation Error", description: "All fields are required.", variant: "destructive" });
      return;
    }
    try {
      setIsPartialFulfilLoading(true);
      await rightsService.partialFulfil(request.id, {
        fulfilled: fulfilledData,
        withheld: withheldData,
        legalJustification: legalJustification,
      });
      toast({
        title: "Partial Fulfilment Recorded",
        description: `Case ${request.caseNumber} is now marked as partially fulfilled.`,
      });
      setShowPartialFulfilModal(false);
      onStatusUpdate();
    } catch (err) {
      handleApiError(err, "Recording Partial Fulfilment");
    } finally {
      setIsPartialFulfilLoading(false);
    }
  };

  // 5. Generate Data Extract Action
  const handleGenerateExtract = async () => {
    try {
      setIsExtractLoading(true);
      setExtractProgress(15);
      await rightsService.generateExtract(request.id);
      
      const interval = setInterval(() => {
        setExtractProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsExtractLoading(false);
            toast({
              title: "Extraction complete",
              description: `Data extraction completed successfully for Case ${request.caseNumber}.`,
            });
            onStatusUpdate();
            return 100;
          }
          return prev + 17;
        });
      }, 400);
    } catch (err) {
      setIsExtractLoading(false);
      handleApiError(err, "Generating Data Extract");
    }
  };

  // 6. Escalate Action
  const handleEscalate = async () => {
    if (!escalateTarget) {
      toast({ title: "Validation Error", description: "Please select an escalation target.", variant: "destructive" });
      return;
    }
    if (!escalateRationale.trim()) {
      toast({ title: "Validation Error", description: "Escalation rationale is required.", variant: "destructive" });
      return;
    }
    try {
      setIsEscalateLoading(true);
      await rightsService.escalate(request.id, {
        target: escalateTarget,
        rationale: escalateRationale,
      });
      toast({
        title: "Case Escalated",
        description: `Case ${request.caseNumber} has been escalated to ${escalateTarget.replace("_", " ")}.`,
      });
      setShowEscalateModal(false);
      onStatusUpdate();
    } catch (err) {
      handleApiError(err, "Escalating Case");
    } finally {
      setIsEscalateLoading(false);
    }
  };

  // 7. Download Audit Report
  const handleDownloadAudit = async () => {
    try {
      setIsAuditLoading(true);
      const data = await rightsService.getAuditTrail(request.id);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `audit_report_${request.caseNumber}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast({
        title: "Report Downloaded",
        description: "Audit trail report has been generated and downloaded.",
      });
    } catch (err) {
      handleApiError(err, "Downloading Audit Report");
    } finally {
      setIsAuditLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {/* 1. Approve */}
          <Button
            className="w-full justify-start text-sm"
            variant="outline"
            disabled={!isActionValid("approve") || isApproveLoading}
            onClick={() => setShowApproveConfirm(true)}
          >
            {isApproveLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4 mr-2 text-success" />
            )}
            Approve Request
          </Button>

          {/* 2. Reject */}
          <Button
            className="w-full justify-start text-sm"
            variant="outline"
            disabled={!isActionValid("reject") || isRejectLoading}
            onClick={() => setShowRejectModal(true)}
          >
            {isRejectLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <XCircle className="h-4 w-4 mr-2 text-destructive" />
            )}
            Reject Request
          </Button>

          {/* 3. Request More Info */}
          <Button
            className="w-full justify-start text-sm"
            variant="outline"
            disabled={!isActionValid("requestInfo") || isRequestInfoLoading}
            onClick={() => setShowRequestInfoModal(true)}
          >
            {isRequestInfoLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <MessageSquare className="h-4 w-4 mr-2 text-info" />
            )}
            Request More Info
          </Button>

          {/* 4. Partial Fulfilment */}
          <Button
            className="w-full justify-start text-sm"
            variant="outline"
            disabled={!isActionValid("partialFulfil") || isPartialFulfilLoading}
            onClick={() => setShowPartialFulfilModal(true)}
          >
            {isPartialFulfilLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Edit className="h-4 w-4 mr-2 text-warning" />
            )}
            Partial Fulfilment
          </Button>

          <Separator className="my-2" />

          {/* 5. Generate Data Extract */}
          <div className="space-y-1">
            <Button
              className="w-full justify-start text-sm"
              variant="outline"
              disabled={!isActionValid("generateExtract") || isExtractLoading}
              onClick={handleGenerateExtract}
            >
              {isExtractLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2 text-primary" />
              )}
              Generate Data Extract
            </Button>
            {isExtractLoading && (
              <div className="px-2 pt-1">
                <Progress value={extractProgress} className="h-1.5" />
              </div>
            )}
          </div>

          {/* 6. Escalate */}
          <Button
            className="w-full justify-start text-sm"
            variant="outline"
            disabled={!isActionValid("escalate") || isEscalateLoading}
            onClick={() => setShowEscalateModal(true)}
          >
            {isEscalateLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <ArrowUpRight className="h-4 w-4 mr-2 text-destructive" />
            )}
            Escalate Case
          </Button>

          {/* 7. Download Audit Report */}
          <Button
            className="w-full justify-start text-sm"
            variant="outline"
            disabled={isAuditLoading}
            onClick={handleDownloadAudit}
          >
            {isAuditLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
            )}
            Download Audit Report
          </Button>
        </CardContent>
      </Card>

      {/* Approve Confirmation Modal */}
      <Dialog open={showApproveConfirm} onOpenChange={setShowApproveConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this request? This action transitions status to ACTION_TAKEN, generates relevant extracts, and triggers automated workflows.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveConfirm(false)}>Cancel</Button>
            <Button onClick={handleApprove} disabled={isApproveLoading}>
              {isApproveLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Yes, Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Input Modal */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Request</DialogTitle>
            <DialogDescription>
              Specify a valid reason for rejecting this data subject request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Rejection Reason</label>
              <Select onValueChange={setRejectReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select rejection reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INSUFFICIENT_ID">Insufficient Identification</SelectItem>
                  <SelectItem value="DUPLICATE">Duplicate Request</SelectItem>
                  <SelectItem value="OUT_OF_SCOPE">Out of Scope</SelectItem>
                  <SelectItem value="FRAUDULENT">Fraudulent Activity</SelectItem>
                  <SelectItem value="OTHER">Other Reason</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Comment (Optional, Max 1000 characters)</label>
              <Textarea
                placeholder="Details of rejection..."
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                maxLength={1000}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectModal(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={isRejectLoading || !rejectReason}>
              {isRejectLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request More Info Input Modal */}
      <Dialog open={showRequestInfoModal} onOpenChange={setShowRequestInfoModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request More Info</DialogTitle>
            <DialogDescription>
              Draft a request to ask the requester for further documentation or clarification.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Message to Requester (Required, Max 3000 characters)</label>
              <Textarea
                placeholder="Type details of what information is required..."
                value={requestInfoMessage}
                onChange={(e) => setRequestInfoMessage(e.target.value)}
                maxLength={3000}
                rows={5}
              />
              <p className="text-xs text-muted-foreground mt-1.5 font-medium">
                This message will be sent to the requester via email.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRequestInfoModal(false)}>Cancel</Button>
            <Button onClick={handleRequestInfo} disabled={isRequestInfoLoading || !requestInfoMessage.trim()}>
              {isRequestInfoLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Partial Fulfilment Modal */}
      <Dialog open={showPartialFulfilModal} onOpenChange={setShowPartialFulfilModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Partial Fulfilment</DialogTitle>
            <DialogDescription>
              Mark this case as partially fulfilled. Detail what was released versus withheld.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">What was fulfilled (Required)</label>
              <Textarea
                placeholder="Details of personal data elements compiled..."
                value={fulfilledData}
                onChange={(e) => setFulfilledData(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">What was withheld (Required)</label>
              <Textarea
                placeholder="Details of personal data elements redacted or blocked..."
                value={withheldData}
                onChange={(e) => setWithheldData(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Legal Justification (Required)</label>
              <Textarea
                placeholder="Regulatory exemptions cited (e.g. intellectual property)..."
                value={legalJustification}
                onChange={(e) => setLegalJustification(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPartialFulfilModal(false)}>Cancel</Button>
            <Button
              onClick={handlePartialFulfil}
              disabled={isPartialFulfilLoading || !fulfilledData.trim() || !withheldData.trim() || !legalJustification.trim()}
            >
              {isPartialFulfilLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Confirm Partial Fulfilment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Escalation Modal */}
      <Dialog open={showEscalateModal} onOpenChange={setShowEscalateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Escalate Case</DialogTitle>
            <DialogDescription>
              Escalate this request to key privacy governance officers or legal council.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Escalate to</label>
              <Select onValueChange={setEscalateTarget}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SENIOR_OFFICER">Senior Privacy Officer</SelectItem>
                  <SelectItem value="DPO">Data Protection Officer (DPO)</SelectItem>
                  <SelectItem value="LEGAL">Legal Council</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Rationale (Required, Max 2000 characters)</label>
              <Textarea
                placeholder="Reasoning for escalation..."
                value={escalateRationale}
                onChange={(e) => setEscalateRationale(e.target.value)}
                maxLength={2000}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEscalateModal(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleEscalate} disabled={isEscalateLoading || !escalateTarget || !escalateRationale.trim()}>
              {isEscalateLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Escalate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
