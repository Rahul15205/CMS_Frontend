import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Plug,
  Key,
  Globe,
  Settings,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddIntegrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd?: (data: {
    name: string;
    type: string;
    icon: string;
    baseUrl: string;
    authMethod: string;
    syncFrequency: string;
    description: string;
  }) => void;
}

const integrationTypes = [
  {
    id: "crm",
    name: "CRM",
    icon: "🔷",
    description: "Customer Relationship Management",
    examples: "Salesforce, HubSpot, Zoho CRM",
  },
  {
    id: "analytics",
    name: "Analytics",
    icon: "📊",
    description: "Data Analytics & Tracking",
    examples: "Google Analytics, Mixpanel, Amplitude",
  },
  {
    id: "marketing",
    name: "Marketing",
    icon: "📧",
    description: "Marketing Automation & Email",
    examples: "Mailchimp, SendGrid, Marketo",
  },
  {
    id: "support",
    name: "Support",
    icon: "🎫",
    description: "Customer Support & Helpdesk",
    examples: "Zendesk, Freshdesk, Intercom",
  },
  {
    id: "data_platform",
    name: "Data Platform",
    icon: "🟢",
    description: "Data Infrastructure & CDP",
    examples: "Segment, Snowflake, BigQuery",
  },
  {
    id: "identity",
    name: "Identity",
    icon: "🆔",
    description: "Identity Verification & KYC",
    examples: "Aadhaar eKYC, DigiLocker",
  },
  {
    id: "communication",
    name: "Communication",
    icon: "📨",
    description: "SMS, Email & Notification Gateways",
    examples: "Twilio, AWS SES, Firebase",
  },
  {
    id: "custom",
    name: "Custom / API",
    icon: "⚙️",
    description: "Custom REST or Webhook Integration",
    examples: "Any REST API, Webhook endpoint",
  },
];

const authMethods = [
  { id: "api_key", label: "API Key" },
  { id: "oauth2", label: "OAuth 2.0" },
  { id: "basic_auth", label: "Basic Auth" },
  { id: "bearer_token", label: "Bearer Token" },
  { id: "webhook", label: "Webhook (No Auth)" },
];

export function AddIntegrationDialog({ open, onOpenChange, onAdd }: AddIntegrationDialogProps) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isConnecting, setIsConnecting] = useState(false);

  const [formData, setFormData] = useState({
    type: "",
    name: "",
    description: "",
    baseUrl: "",
    authMethod: "",
    apiKey: "",
    syncFrequency: "realtime",
  });

  const resetForm = () => {
    setStep(1);
    setFormData({
      type: "",
      name: "",
      description: "",
      baseUrl: "",
      authMethod: "",
      apiKey: "",
      syncFrequency: "realtime",
    });
    setIsConnecting(false);
  };

  const handleClose = (open: boolean) => {
    if (!open) resetForm();
    onOpenChange(open);
  };

  const selectedType = integrationTypes.find((t) => t.id === formData.type);

  const canProceedStep1 = formData.type !== "";
  const canProceedStep2 = formData.name.trim() !== "" && formData.baseUrl.trim() !== "" && formData.authMethod !== "";

  const handleConnect = () => {
    setIsConnecting(true);
    // Simulate connection test
    setTimeout(() => {
      setIsConnecting(false);
      setStep(3);
    }, 1500);
  };

  const handleFinish = () => {
    // Pass the new integration data to the parent
    onAdd?.({
      name: formData.name,
      type: selectedType?.name || formData.type,
      icon: selectedType?.icon || "⚙️",
      baseUrl: formData.baseUrl,
      authMethod: formData.authMethod,
      syncFrequency: formData.syncFrequency,
      description: formData.description,
    });
    toast({
      title: "Integration Added",
      description: `"${formData.name}" has been configured and is now connecting.`,
    });
    handleClose(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plug className="h-5 w-5" />
            {step === 1 && "Add New Integration"}
            {step === 2 && "Configure Connection"}
            {step === 3 && "Connection Successful"}
          </DialogTitle>
          <DialogDescription>
            {step === 1 && "Select the type of integration you want to connect."}
            {step === 2 && "Enter the connection details for your integration."}
            {step === 3 && "Your integration has been configured successfully."}
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 py-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  s < step
                    ? "bg-green-500 text-white"
                    : s === step
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {s < step ? <CheckCircle className="h-4 w-4" /> : s}
              </div>
              {s < 3 && (
                <div className={`flex-1 h-0.5 ${s < step ? "bg-green-500" : "bg-muted"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Select Type */}
        {step === 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2 max-h-[400px] overflow-y-auto">
            {integrationTypes.map((type) => (
              <div
                key={type.id}
                className={`flex flex-col p-4 border rounded-xl cursor-pointer transition-all group ${
                  formData.type === type.id
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "hover:bg-muted/50 hover:border-primary/30"
                }`}
                onClick={() => setFormData((prev) => ({ ...prev, type: type.id }))}
              >
                <div className="flex items-center gap-3 mb-1.5">
                  <span className="text-2xl">{type.icon}</span>
                  <div>
                    <h3 className="font-semibold text-sm">{type.name}</h3>
                    <p className="text-xs text-muted-foreground">{type.description}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground/70 mt-1">e.g. {type.examples}</p>
              </div>
            ))}
          </div>
        )}

        {/* Step 2: Configure */}
        {step === 2 && (
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
              <span className="text-2xl">{selectedType?.icon}</span>
              <div>
                <p className="font-medium text-sm">{selectedType?.name} Integration</p>
                <p className="text-xs text-muted-foreground">{selectedType?.description}</p>
              </div>
              <Badge variant="outline" className="ml-auto">
                {selectedType?.name}
              </Badge>
            </div>

            <div className="grid gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Integration Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g. Salesforce Production"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="authMethod">
                    Authentication Method <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.authMethod}
                    onValueChange={(val) => setFormData((prev) => ({ ...prev, authMethod: val }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select auth method" />
                    </SelectTrigger>
                    <SelectContent>
                      {authMethods.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="baseUrl">
                  Base URL / Endpoint <span className="text-destructive">*</span>
                </Label>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <Input
                    id="baseUrl"
                    placeholder="https://api.example.com/v1"
                    value={formData.baseUrl}
                    onChange={(e) => setFormData((prev) => ({ ...prev, baseUrl: e.target.value }))}
                  />
                </div>
              </div>

              {formData.authMethod && formData.authMethod !== "webhook" && (
                <div className="space-y-2">
                  <Label htmlFor="apiKey">
                    <Key className="h-3.5 w-3.5 inline mr-1" />
                    {formData.authMethod === "api_key"
                      ? "API Key"
                      : formData.authMethod === "oauth2"
                      ? "Client ID / Secret"
                      : formData.authMethod === "bearer_token"
                      ? "Bearer Token"
                      : "Username:Password"}
                  </Label>
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder="Enter credentials..."
                    value={formData.apiKey}
                    onChange={(e) => setFormData((prev) => ({ ...prev, apiKey: e.target.value }))}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="syncFrequency">Sync Frequency</Label>
                  <Select
                    value={formData.syncFrequency}
                    onValueChange={(val) => setFormData((prev) => ({ ...prev, syncFrequency: val }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realtime">Real-time</SelectItem>
                      <SelectItem value="5min">Every 5 minutes</SelectItem>
                      <SelectItem value="15min">Every 15 minutes</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="manual">Manual Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Optional description..."
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <div className="flex flex-col items-center text-center py-8">
            <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Connection Verified!</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              <strong>{formData.name}</strong> has been successfully configured and connected. Data
              sync will begin based on your selected frequency.
            </p>
            <div className="w-full max-w-sm space-y-2 text-sm">
              <div className="flex justify-between p-2 rounded bg-muted/50">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium">{selectedType?.name}</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-muted/50">
                <span className="text-muted-foreground">Endpoint</span>
                <span className="font-medium truncate ml-4">{formData.baseUrl}</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-muted/50">
                <span className="text-muted-foreground">Auth</span>
                <span className="font-medium">
                  {authMethods.find((m) => m.id === formData.authMethod)?.label}
                </span>
              </div>
              <div className="flex justify-between p-2 rounded bg-muted/50">
                <span className="text-muted-foreground">Sync</span>
                <span className="font-medium capitalize">{formData.syncFrequency.replace("min", " min")}</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <DialogFooter className="flex flex-row justify-between sm:justify-between gap-2">
          <div>
            {step > 1 && step < 3 && (
              <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleClose(false)}>
              {step === 3 ? "Close" : "Cancel"}
            </Button>
            {step === 1 && (
              <Button disabled={!canProceedStep1} onClick={() => setStep(2)}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
            {step === 2 && (
              <Button disabled={!canProceedStep2 || isConnecting} onClick={handleConnect}>
                {isConnecting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Testing Connection...
                  </>
                ) : (
                  <>
                    <Settings className="h-4 w-4 mr-2" />
                    Test & Connect
                  </>
                )}
              </Button>
            )}
            {step === 3 && (
              <Button onClick={handleFinish}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Done
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
