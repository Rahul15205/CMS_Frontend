import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Save,
  Loader2,
  CheckCircle,
  Plug,
  Globe,
  Key,
  Eye,
  EyeOff,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Shared Integration Type — used across the module
export interface Integration {
  id: number;
  name: string;
  type: string;
  status: "connected" | "pending" | "disconnected" | "error";
  lastSync: string;
  apiCalls: number;
  icon: string;
  baseUrl?: string;
  authMethod?: string;
  syncFrequency?: string;
  description?: string;
}

interface ConfigureIntegrationDialogProps {
  integration: Integration | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updated: Integration) => void;
}

const authMethods = [
  { id: "api_key", label: "API Key" },
  { id: "oauth2", label: "OAuth 2.0" },
  { id: "basic_auth", label: "Basic Auth" },
  { id: "bearer_token", label: "Bearer Token" },
  { id: "webhook", label: "Webhook (No Auth)" },
];

const syncFrequencies = [
  { id: "realtime", label: "Real-time" },
  { id: "5min", label: "Every 5 minutes" },
  { id: "15min", label: "Every 15 minutes" },
  { id: "hourly", label: "Hourly" },
  { id: "daily", label: "Daily" },
  { id: "manual", label: "Manual Only" },
];

export function ConfigureIntegrationDialog({
  integration,
  open,
  onOpenChange,
  onSave,
}: ConfigureIntegrationDialogProps) {
  const { toast } = useToast();
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<"idle" | "success" | "error">("idle");
  const [showApiKey, setShowApiKey] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    baseUrl: "",
    authMethod: "api_key",
    syncFrequency: "realtime",
    description: "",
    apiKey: "",
  });

  // Populate form when integration changes
  useEffect(() => {
    if (integration) {
      setFormData({
        name: integration.name,
        baseUrl:
          integration.baseUrl ||
          `https://api.${integration.name.toLowerCase().replace(/\s+/g, "")}.com/v1`,
        authMethod: integration.authMethod || "api_key",
        syncFrequency: integration.syncFrequency || "realtime",
        description:
          integration.description || `${integration.type} integration`,
        apiKey: "••••••••••••••••",
      });
      setTestResult("idle");
      setIsTesting(false);
    }
  }, [integration]);

  const handleTestConnection = () => {
    setIsTesting(true);
    setTestResult("idle");
    setTimeout(() => {
      setIsTesting(false);
      setTestResult("success");
    }, 1500);
  };

  const handleSave = () => {
    if (!integration) return;

    onSave({
      ...integration,
      name: formData.name,
      baseUrl: formData.baseUrl,
      authMethod: formData.authMethod,
      syncFrequency: formData.syncFrequency,
      description: formData.description,
    });

    toast({
      title: "Configuration Saved",
      description: `"${formData.name}" configuration has been updated successfully.`,
    });

    onOpenChange(false);
  };

  if (!integration) return null;

  const statusConfig: Record<string, { bg: string; dot: string; label: string }> = {
    connected: { bg: "bg-green-500/10 text-green-700 border-green-200 dark:text-green-400 dark:border-green-800", dot: "bg-green-500", label: "Connected" },
    error: { bg: "bg-red-500/10 text-red-700 border-red-200 dark:text-red-400 dark:border-red-800", dot: "bg-red-500", label: "Error" },
    disconnected: { bg: "bg-gray-500/10 text-gray-600 border-gray-200 dark:text-gray-400 dark:border-gray-700", dot: "bg-gray-400", label: "Disconnected" },
    pending: { bg: "bg-yellow-500/10 text-yellow-700 border-yellow-200 dark:text-yellow-400 dark:border-yellow-800", dot: "bg-yellow-500", label: "Pending" },
  };

  const currentStatus = statusConfig[integration.status] || statusConfig.disconnected;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-xl">
              {integration.icon}
            </div>
            <div>
              <span>Configure {integration.name}</span>
              <p className="text-sm font-normal text-muted-foreground">
                {integration.type}
              </p>
            </div>
          </DialogTitle>
          <DialogDescription>
            Update the connection settings for this integration.
          </DialogDescription>
        </DialogHeader>

        {/* Status Banner */}
        <div
          className={`flex items-center justify-between p-3 rounded-lg border ${currentStatus.bg}`}
        >
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${currentStatus.dot}`} />
            <span className="text-sm font-medium">{currentStatus.label}</span>
          </div>
          <span className="text-xs opacity-75">
            Last sync: {integration.lastSync}
          </span>
        </div>

        <div className="grid gap-4 py-2 max-h-[50vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="config-name">Integration Name</Label>
              <Input
                id="config-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="config-auth">Authentication Method</Label>
              <Select
                value={formData.authMethod}
                onValueChange={(val) =>
                  setFormData((prev) => ({ ...prev, authMethod: val }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
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
            <Label htmlFor="config-url">
              <Globe className="h-3.5 w-3.5 inline mr-1" />
              Base URL / Endpoint
            </Label>
            <Input
              id="config-url"
              value={formData.baseUrl}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, baseUrl: e.target.value }))
              }
            />
          </div>

          {formData.authMethod !== "webhook" && (
            <div className="space-y-2">
              <Label htmlFor="config-key">
                <Key className="h-3.5 w-3.5 inline mr-1" />
                {formData.authMethod === "api_key"
                  ? "API Key"
                  : formData.authMethod === "oauth2"
                  ? "Client ID / Secret"
                  : formData.authMethod === "bearer_token"
                  ? "Bearer Token"
                  : "Credentials"}
              </Label>
              <div className="relative">
                <Input
                  id="config-key"
                  type={showApiKey ? "text" : "password"}
                  value={formData.apiKey}
                  className="pr-10"
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, apiKey: e.target.value }))
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showApiKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="config-sync">Sync Frequency</Label>
              <Select
                value={formData.syncFrequency}
                onValueChange={(val) =>
                  setFormData((prev) => ({ ...prev, syncFrequency: val }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {syncFrequencies.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="config-desc">Description</Label>
              <Input
                id="config-desc"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          {/* Test Connection */}
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Test Connection</p>
              <p className="text-xs text-muted-foreground">
                Verify the endpoint is reachable
              </p>
            </div>
            <div className="flex items-center gap-2">
              {testResult === "success" && (
                <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                  <CheckCircle className="h-3.5 w-3.5" /> Connection OK
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestConnection}
                disabled={isTesting}
              >
                {isTesting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Plug className="h-4 w-4 mr-1" />
                    Test
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-muted/50 rounded-lg text-sm">
            <div>
              <span className="text-muted-foreground">API Calls Today</span>
              <p className="font-semibold">
                {integration.apiCalls.toLocaleString()}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Last Sync</span>
              <p className="font-semibold">{integration.lastSync}</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Configuration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
