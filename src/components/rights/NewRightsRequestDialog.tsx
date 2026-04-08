import { useState } from "react";
import { rightsService } from "@/services/rightsService";
import { handleApiError } from "@/lib/errorHandler";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Mail,
  Phone,
  Globe,
  FileText,
  Shield,
  Building,
  AlertCircle,
  Fingerprint,
} from "lucide-react";
import { RIGHTS_TYPE_INFO, REGULATION_INFO, RightsType, Regulation, SubmissionChannel } from "./types";

interface NewRightsRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: any) => void;
  title?: string;
  description?: string;
}

const DATA_CATEGORIES = [
  { id: "personal", label: "Personal Information" },
  { id: "financial", label: "Financial Data" },
  { id: "health", label: "Health Information" },
  { id: "biometric", label: "Biometric Data" },
  { id: "location", label: "Location Data" },
  { id: "marketing", label: "Marketing Preferences" },
  { id: "behavioral", label: "Behavioral Data" },
  { id: "employment", label: "Employment Records" },
];

const APPLICATIONS = [
  { id: "website", label: "Website" },
  { id: "mobile", label: "Mobile App" },
  { id: "crm", label: "CRM System" },
  { id: "hrms", label: "HRMS" },
  { id: "erp", label: "ERP" },
  { id: "marketing", label: "Marketing Platform" },
];

export function NewRightsRequestDialog({ 
  open, 
  onOpenChange, 
  onSubmit,
  title = "Log New Rights Request",
  description = "Manually log a rights request received via email, phone, or in-person."
}: NewRightsRequestDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTab, setCurrentTab] = useState("requester");
  const [formData, setFormData] = useState({
    requesterName: "",
    requesterEmail: "",
    requesterPhone: "",
    requesterId: "",
    isAuthorizedRep: false,
    repName: "",
    repRelationship: "",
    rightsType: "" as RightsType | "",
    regulation: "" as Regulation | "",
    submissionChannel: "web" as SubmissionChannel,
    description: "",
    dataCategories: [] as string[],
    applications: [] as string[],
    priority: "normal",
    aadhaarNumber: "",
  });

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const res = await rightsService.create(formData);
      onSubmit?.(res);
      onOpenChange(false);
      // Reset form
      setFormData({
        requesterName: "",
        requesterEmail: "",
        requesterPhone: "",
        requesterId: "",
        isAuthorizedRep: false,
        repName: "",
        repRelationship: "",
        rightsType: "",
        regulation: "",
        submissionChannel: "web",
        description: "",
        dataCategories: [],
        applications: [],
        priority: "normal",
        aadhaarNumber: "",
      });
      setCurrentTab("requester");
    } catch (error) {
      handleApiError(error, "Creating Request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setFormData((prev) => ({
      ...prev,
      dataCategories: prev.dataCategories.includes(categoryId)
        ? prev.dataCategories.filter((c) => c !== categoryId)
        : [...prev.dataCategories, categoryId],
    }));
  };

  const toggleApplication = (appId: string) => {
    setFormData((prev) => ({
      ...prev,
      applications: prev.applications.includes(appId)
        ? prev.applications.filter((a) => a !== appId)
        : [...prev.applications, appId],
    }));
  };

  const isStepValid = (step: string) => {
    switch (step) {
      case "requester":
        return formData.requesterName && formData.requesterEmail;
      case "request":
        return formData.rightsType && formData.regulation;
      case "details":
        return formData.description && formData.dataCategories.length > 0;
      default:
        return true;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="requester" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Requester
            </TabsTrigger>
            <TabsTrigger value="request" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Request
            </TabsTrigger>
            <TabsTrigger value="details" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Details
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requester" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="John Smith"
                    className="pl-10"
                    value={formData.requesterName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, requesterName: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    className="pl-10"
                    value={formData.requesterEmail}
                    onChange={(e) => setFormData((prev) => ({ ...prev, requesterEmail: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    placeholder="+91 98765 43210"
                    className="pl-10"
                    value={formData.requesterPhone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, requesterPhone: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="aadhaar">Aadhaar Number (PII)</Label>
                <div className="relative">
                  <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="aadhaar"
                    placeholder="1234-5678-9012"
                    className="pl-10"
                    value={formData.aadhaarNumber}
                    onChange={(e) => setFormData((prev) => ({ ...prev, aadhaarNumber: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="userId">User/Customer ID</Label>
                <Input
                  id="userId"
                  placeholder="USR-12345"
                  value={formData.requesterId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, requesterId: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="authorized"
                  checked={formData.isAuthorizedRep}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isAuthorizedRep: checked as boolean }))}
                />
                <Label htmlFor="authorized">Request made by authorized representative</Label>
              </div>

              {formData.isAuthorizedRep && (
                <div className="grid grid-cols-2 gap-4 pl-6">
                  <div className="space-y-2">
                    <Label htmlFor="repName">Representative Name</Label>
                    <Input
                      id="repName"
                      placeholder="Representative's name"
                      value={formData.repName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, repName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="repRelation">Relationship</Label>
                    <Select
                      value={formData.repRelationship}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, repRelationship: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="legal_guardian">Legal Guardian</SelectItem>
                        <SelectItem value="parent">Parent</SelectItem>
                        <SelectItem value="attorney">Attorney</SelectItem>
                        <SelectItem value="authorized_agent">Authorized Agent</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="request" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Rights Type *</Label>
                <Select
                  value={formData.rightsType}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, rightsType: value as RightsType }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select rights type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(RIGHTS_TYPE_INFO).map(([key, info]) => (
                      <SelectItem key={key} value={key}>
                        {info.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Applicable Regulation *</Label>
                <Select
                  value={formData.regulation}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, regulation: value as Regulation }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select regulation" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(REGULATION_INFO).map(([key, info]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          {info.label} ({info.sladays} days SLA)
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Submission Channel</Label>
                <Select
                  value={formData.submissionChannel}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, submissionChannel: value as SubmissionChannel }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="web">Web Portal</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="in_person">In Person</SelectItem>
                    <SelectItem value="api">API</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.rightsType && formData.regulation && (
              <div className="p-4 rounded-lg bg-info/10 border border-info/20">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-info mt-0.5" />
                  <div>
                    <p className="font-medium text-info">SLA Information</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Under {REGULATION_INFO[formData.regulation]?.label}, this request must be fulfilled within{" "}
                      <strong>{REGULATION_INFO[formData.regulation]?.sladays} days</strong>.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Request Description *</Label>
              <Textarea
                placeholder="Describe the request in detail..."
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Data Categories *</Label>
              <div className="grid grid-cols-2 gap-2">
                {DATA_CATEGORIES.map((category) => (
                  <div
                    key={category.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      formData.dataCategories.includes(category.id)
                        ? "bg-primary/10 border-primary"
                        : "hover:bg-muted"
                    }`}
                    onClick={() => toggleCategory(category.id)}
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox checked={formData.dataCategories.includes(category.id)} />
                      <span className="text-sm">{category.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Related Applications</Label>
              <div className="flex flex-wrap gap-2">
                {APPLICATIONS.map((app) => (
                  <Badge
                    key={app.id}
                    variant={formData.applications.includes(app.id) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleApplication(app.id)}
                  >
                    <Building className="h-3 w-3 mr-1" />
                    {app.label}
                  </Badge>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <div className="flex gap-2">
            {currentTab !== "requester" && (
              <Button
                variant="outline"
                onClick={() => setCurrentTab(currentTab === "details" ? "request" : "requester")}
              >
                Previous
              </Button>
            )}
            {currentTab !== "details" ? (
              <Button
                onClick={() => setCurrentTab(currentTab === "requester" ? "request" : "details")}
                disabled={!isStepValid(currentTab)}
              >
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={!isStepValid("details")}>
                Create Request
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
