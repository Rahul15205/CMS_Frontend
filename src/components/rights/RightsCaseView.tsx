import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Shield,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  Paperclip,
  Send,
  UserCheck,
  ArrowUpRight,
  XCircle,
  FileText,
  Download,
  History,
  Globe,
  Building,
  Edit,
  Save,
  RotateCcw,
  Fingerprint,
} from "lucide-react";
import { RightsRequest, RIGHTS_TYPE_INFO, REGULATION_INFO, STATUS_INFO, DEFAULT_WORKFLOW_STEPS, WorkflowStep, CaseNote, AuditEntry } from "./types";
import { rightsService } from "@/services/rightsService";
import { handleApiError } from "@/lib/errorHandler";

interface RightsCaseViewProps {
  request: RightsRequest;
  onBack: () => void;
}

const getStepStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-success text-success-foreground";
    case "in_progress":
      return "bg-primary text-primary-foreground animate-pulse";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export function RightsCaseView({ request, onBack }: RightsCaseViewProps) {
  const [newNote, setNewNote] = useState("");
  const [assignee, setAssignee] = useState(request.assignedTo || "");
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [notes, setNotes] = useState<CaseNote[]>([]);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [noteType, setNoteType] = useState<"internal" | "external">("internal");
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showEscalateDialog, setShowEscalateDialog] = useState(false);

  useEffect(() => {
    const fetchCaseData = async () => {
      try {
        setIsLoadingData(true);
        const [wf, nt, al] = await Promise.all([
          rightsService.getWorkflow(request.id),
          rightsService.getNotes(request.id),
          rightsService.getAuditTrail(request.id)
        ]);
        setWorkflowSteps(wf);
        setNotes(nt);
        setAuditLog(al);
      } catch (error) {
        handleApiError(error, 'Rights Case Details');
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchCaseData();
  }, [request.id]);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    try {
      setIsAddingNote(true);
      const res = await rightsService.addNote(request.id, { type: noteType, content: newNote });
      setNotes(prev => [...prev, res]);
      setNewNote("");
    } catch (error) {
      handleApiError(error, 'Adding Note');
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleAssign = async (userId: string) => {
    try {
      await rightsService.assign(request.id, { assignedTo: userId });
      setAssignee(userId);
      setShowAssignDialog(false);
    } catch (error) {
      handleApiError(error, 'Assigning Request');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const currentStepIndex = workflowSteps.findIndex((s) => s.status === "in_progress");
  const progressPercentage = workflowSteps.length > 0 ? ((currentStepIndex > -1 ? currentStepIndex + 1 : workflowSteps.length) / workflowSteps.length) * 100 : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-foreground">{request.caseNumber}</h2>
              <StatusBadge status={request.slaBreached ? "error" : "info"}>
                {STATUS_INFO[request.status]?.label}
              </StatusBadge>
              {request.fraudFlag && (
                <Badge variant="destructive">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Fraud Flag
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1">
              {RIGHTS_TYPE_INFO[request.type]?.label} • {REGULATION_INFO[request.regulation]?.label}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <UserCheck className="h-4 w-4 mr-2" />
                Assign
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign Case</DialogTitle>
                <DialogDescription>
                  Select a team member to assign this case to.
                </DialogDescription>
              </DialogHeader>
              <Select onValueChange={handleAssign}>
                <SelectTrigger>
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jane">Jane Doe</SelectItem>
                  <SelectItem value="raj">Raj Kumar</SelectItem>
                  <SelectItem value="maria">Maria Santos</SelectItem>
                  <SelectItem value="team">Privacy Team</SelectItem>
                </SelectContent>
              </Select>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAssignDialog(false)}>Cancel</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={showEscalateDialog} onOpenChange={setShowEscalateDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <ArrowUpRight className="h-4 w-4 mr-2" />
                Escalate
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Escalate Case</DialogTitle>
                <DialogDescription>
                  This will escalate the case to the next level of authority.
                </DialogDescription>
              </DialogHeader>
              <Textarea placeholder="Reason for escalation..." />
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowEscalateDialog(false)}>Cancel</Button>
                <Button variant="destructive" onClick={() => setShowEscalateDialog(false)}>Escalate</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button size="sm">
            <CheckCircle className="h-4 w-4 mr-2" />
            Complete Step
          </Button>
        </div>
      </div>

      {/* SLA & Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">SLA Status</p>
              <div className="flex items-center gap-2 mt-1">
                {request.slaBreached ? (
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                ) : request.daysRemaining <= 3 ? (
                  <Clock className="h-5 w-5 text-warning" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-success" />
                )}
                <span className={`text-lg font-semibold ${request.slaBreached ? "text-destructive" :
                    request.daysRemaining <= 3 ? "text-warning" :
                      "text-success"
                  }`}>
                  {request.slaBreached
                    ? `${Math.abs(request.daysRemaining)} days overdue`
                    : `${request.daysRemaining} days remaining`}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Due Date</p>
              <p className="text-lg font-semibold">{request.dueDate}</p>
            </div>
          </div>
          <Progress
            value={request.slaBreached ? 100 : Math.max(0, 100 - (request.daysRemaining / 30) * 100)}
            className={`h-3 ${request.slaBreached ? "[&>div]:bg-destructive" :
                request.daysRemaining <= 3 ? "[&>div]:bg-warning" :
                  "[&>div]:bg-success"
              }`}
          />
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="workflow">Workflow</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="attachments">Files</TabsTrigger>
              <TabsTrigger value="audit">Audit Log</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Requester Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{request.requesterName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{request.requesterEmail}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Requester ID</p>
                    <p className="font-medium">{request.requesterId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Submission Channel</p>
                    <Badge variant="outline" className="capitalize">{request.submissionChannel}</Badge>
                  </div>
                  
                  {request.aadhaarNumber && (
                    <div className="col-span-2">
                       <p className="text-sm text-muted-foreground">Aadhaar Number (PII)</p>
                       <div className="flex items-center gap-2 mt-1">
                         <Fingerprint className="h-4 w-4 text-primary" />
                         <p className="font-medium">{request.aadhaarNumber}</p>
                       </div>
                    </div>
                  )}

                  {request.isAuthorizedRep && request.authorizedRepDetails && (
                    <>
                      <Separator className="col-span-2" />
                      <div className="col-span-2">
                        <p className="text-sm text-muted-foreground mb-2">Authorized Representative</p>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Rep Name</p>
                            <p className="font-medium">{request.authorizedRepDetails.name}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Relationship</p>
                            <p className="font-medium">{request.authorizedRepDetails.relationship}</p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Verification Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant={request.verificationStatus === "verified" ? "default" : "secondary"} className="capitalize">
                      {request.verificationStatus}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Method</p>
                    <p className="font-medium capitalize">{request.verificationMethod?.replace("_", " ") || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Re-verification Required</p>
                    <p className="font-medium">{request.reVerificationRequired ? "Yes" : "No"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fraud Flag</p>
                    <Badge variant={request.fraudFlag ? "destructive" : "outline"}>
                      {request.fraudFlag ? "Flagged" : "Clear"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Request Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p className="font-medium mt-1">{request.description}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Data Categories</p>
                    <div className="flex flex-wrap gap-2">
                      {(request.dataCategories || []).map((cat) => (
                        <Badge key={cat} variant="outline">{cat}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Related Applications</p>
                    <div className="flex flex-wrap gap-2">
                      {(request.relatedApplications || []).map((app) => (
                        <Badge key={app} variant="secondary">
                          <Building className="h-3 w-3 mr-1" />
                          {app}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Related Consents</p>
                    <div className="flex flex-wrap gap-2">
                      {(request.relatedConsents || []).map((con) => (
                        <Badge key={con} variant="outline">{con}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="workflow" className="mt-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Workflow Progress</CardTitle>
                    <Badge variant="outline">{Math.round(progressPercentage)}% Complete</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {isLoadingData ? (
                  <div className="text-center py-8 text-muted-foreground">Loading workflow...</div>
                ) : (
                  workflowSteps.map((step, index) => (
                      <div key={step.id} className="flex items-start gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium ${getStepStatusColor(step.status)}`}>
                            {step.status === "completed" ? (
                              <CheckCircle className="h-5 w-5" />
                            ) : (
                              index + 1
                            )}
                          </div>
                          {index < workflowSteps.length - 1 && (
                            <div className={`w-0.5 h-12 ${step.status === "completed" ? "bg-success" : "bg-muted"}`} />
                          )}
                        </div>
                        <div className="flex-1 pb-8">
                          <p className="font-medium">{step.name}</p>
                          {step.assignedRole && (
                            <p className="text-sm text-muted-foreground">Assigned to: {step.assignedRole}</p>
                          )}
                          {step.completedAt && (
                            <p className="text-sm text-muted-foreground">
                              Completed by {step.completedBy} on {formatDate(step.completedAt)}
                            </p>
                          )}
                          {step.status === "in_progress" && (
                            <Badge className="mt-2" variant="secondary">Current Step</Badge>
                          )}
                        </div>
                      </div>
                    )))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Add Note</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Button
                      variant={noteType === "internal" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNoteType("internal")}
                    >
                      Internal
                    </Button>
                    <Button
                      variant={noteType === "external" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNoteType("external")}
                    >
                      External (To Requester)
                    </Button>
                  </div>
                  <Textarea
                    placeholder={noteType === "internal" ? "Add internal note..." : "Message to requester..."}
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    rows={3}
                  />
                  <div className="flex justify-between">
                    <Button variant="outline" size="sm">
                      <Paperclip className="h-4 w-4 mr-2" />
                      Attach File
                    </Button>
                    <Button size="sm" onClick={handleAddNote} disabled={isAddingNote}>
                      <Send className="h-4 w-4 mr-2" />
                      {noteType === "external" ? "Send" : "Add Note"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                {notes.slice().reverse().map((note) => (
                  <Card key={note.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={note.type === "internal" ? "secondary" : "default"}>
                            {note.type === "internal" ? "Internal" : "External"}
                          </Badge>
                          <span className="text-sm font-medium">{note.createdBy}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{formatDate(note.createdAt)}</span>
                      </div>
                      <p className="text-sm">{note.content}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="attachments" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8 text-muted-foreground">
                    <Paperclip className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No attachments yet</p>
                    <Button variant="outline" size="sm" className="mt-4">
                      Upload File
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="audit" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <History className="h-4 w-4" />
                    Audit Trail
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {auditLog.slice().reverse().map((entry) => (
                      <div key={entry.id} className="flex items-start gap-4 pb-4 border-b last:border-0">
                        <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{entry.action}</p>
                            <span className="text-sm text-muted-foreground">{formatDate(entry.performedAt)}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{entry.details}</p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            <span>By: {entry.performedBy}</span>
                            {entry.ipAddress && <span>IP: {entry.ipAddress}</span>}
                            {entry.systemApplication && <span>System: {entry.systemApplication}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Quick Actions & Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" variant="outline">
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve Request
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <XCircle className="h-4 w-4 mr-2" />
                Reject Request
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <MessageSquare className="h-4 w-4 mr-2" />
                Request More Info
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Partial Fulfilment
              </Button>
              <Separator />
              <Button className="w-full justify-start" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Generate Data Extract
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Download Audit Report
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Case Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Case ID</span>
                <span className="text-sm font-medium">{request.caseNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Created</span>
                <span className="text-sm font-medium">{formatDate(request.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Last Updated</span>
                <span className="text-sm font-medium">{formatDate(request.updatedAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Assigned To</span>
                <span className="text-sm font-medium">{request.assignedTo || "Unassigned"}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Regulation</span>
                <Badge style={{ backgroundColor: `${REGULATION_INFO[request.regulation]?.color}20`, color: REGULATION_INFO[request.regulation]?.color }}>
                  {REGULATION_INFO[request.regulation]?.label}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Rights Type</span>
                <Badge variant="outline">{RIGHTS_TYPE_INFO[request.type]?.label}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
