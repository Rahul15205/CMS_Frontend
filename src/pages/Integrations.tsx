import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout, PageSection, SectionTitle } from "@/components/layout/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import { AddIntegrationDialog } from "@/components/integrations/AddIntegrationDialog";
import {
  ConfigureIntegrationDialog,
  Integration,
} from "@/components/integrations/ConfigureIntegrationDialog";
import { KPICard } from "@/components/dashboard/KPICard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { TrendLineChart } from "@/components/charts/TrendLineChart";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Plug,
  CheckCircle,
  XCircle,
  Activity,
  Clock,
  Plus,
  Settings,
  RefreshCw,
  Link2,
  Link2Off,
  Key,
  Webhook,
  Loader2,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ─── Static chart data ───────────────────────────────────────────
const apiUsageData = [
  { name: "Mon", calls: 1200 },
  { name: "Tue", calls: 1800 },
  { name: "Wed", calls: 2200 },
  { name: "Thu", calls: 1900 },
  { name: "Fri", calls: 2400 },
  { name: "Sat", calls: 800 },
  { name: "Sun", calls: 600 },
];

// ─── Initial mock integrations ──────────────────────────────────
const initialIntegrations: Integration[] = [
  {
    id: 1,
    name: "Salesforce CRM",
    type: "CRM",
    status: "connected",
    lastSync: "5 min ago",
    apiCalls: 12450,
    icon: "🔷",
  },
  {
    id: 2,
    name: "Google Analytics",
    type: "Analytics",
    status: "connected",
    lastSync: "2 min ago",
    apiCalls: 45230,
    icon: "📊",
  },
  {
    id: 3,
    name: "Mailchimp",
    type: "Marketing",
    status: "error",
    lastSync: "2 hrs ago",
    apiCalls: 8900,
    icon: "📧",
  },
  {
    id: 4,
    name: "Zendesk",
    type: "Support",
    status: "connected",
    lastSync: "10 min ago",
    apiCalls: 3200,
    icon: "🎫",
  },
  {
    id: 5,
    name: "HubSpot",
    type: "Marketing",
    status: "disconnected",
    lastSync: "Never",
    apiCalls: 0,
    icon: "🟠",
  },
  {
    id: 6,
    name: "Segment",
    type: "Data Platform",
    status: "connected",
    lastSync: "1 min ago",
    apiCalls: 78500,
    icon: "🟢",
  },
  {
    id: 7,
    name: "Aadhar eKYC",
    type: "Identity",
    status: "disconnected",
    lastSync: "Never",
    apiCalls: 0,
    icon: "🆔",
  },
  {
    id: 8,
    name: "DigiLocker",
    type: "Document Verification",
    status: "disconnected",
    lastSync: "Never",
    apiCalls: 0,
    icon: "📂",
  },
  {
    id: 9,
    name: "SMS/Email Gateway",
    type: "Communication",
    status: "disconnected",
    lastSync: "Never",
    apiCalls: 0,
    icon: "📨",
  },
];

// ─── Status badge helper ────────────────────────────────────────
const getStatusBadge = (status: string) => {
  switch (status) {
    case "connected":
      return <StatusBadge status="active">Connected</StatusBadge>;
    case "error":
      return <StatusBadge status="error">Error</StatusBadge>;
    case "disconnected":
      return <StatusBadge status="info">Disconnected</StatusBadge>;
    default:
      return <StatusBadge status="info">{status}</StatusBadge>;
  }
};

// ─── Filter options ─────────────────────────────────────────────
type FilterStatus = "all" | "connected" | "disconnected" | "error";

const filterOptions: { key: FilterStatus; label: string }[] = [
  { key: "all", label: "All" },
  { key: "connected", label: "Connected" },
  { key: "error", label: "Error" },
  { key: "disconnected", label: "Disconnected" },
];

// ═══════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function Integrations() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // ─── State ──────────────────────────────────────────────────
  const [integrationsList, setIntegrationsList] = useState<Integration[]>(initialIntegrations);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [configureTarget, setConfigureTarget] = useState<Integration | null>(null);
  const [disconnectTarget, setDisconnectTarget] = useState<Integration | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");

  // ─── Computed values ────────────────────────────────────────
  const connectedCount = integrationsList.filter((i) => i.status === "connected").length;
  const failedCount = integrationsList.filter((i) => i.status === "error").length;
  const disconnectedCount = integrationsList.filter((i) => i.status === "disconnected").length;
  const totalApiCalls = integrationsList.reduce((sum, i) => sum + i.apiCalls, 0);

  const filteredIntegrations =
    filterStatus === "all"
      ? integrationsList
      : integrationsList.filter((i) => i.status === filterStatus);

  const filterCounts: Record<FilterStatus, number> = {
    all: integrationsList.length,
    connected: connectedCount,
    error: failedCount,
    disconnected: disconnectedCount,
  };

  // ─── Quick Access handlers ─────────────────────────────────
  const handleManageAPIKeys = () => {
    navigate("/configurations");
    toast({
      title: "API Key Management",
      description: "Navigating to Configurations → API Keys section.",
    });
  };

  const handleConfigureWebhooks = () => {
    navigate("/configurations");
    toast({
      title: "Webhook Configuration",
      description: "Navigating to Configurations → Notification Rules section.",
    });
  };

  const handleSyncAll = () => {
    if (isSyncing) return;
    setIsSyncing(true);

    setTimeout(() => {
      setIntegrationsList((prev) =>
        prev.map((i) =>
          i.status === "connected" ? { ...i, lastSync: "Just now" } : i
        )
      );
      setIsSyncing(false);
      toast({
        title: "Sync Complete",
        description: `Successfully synced ${connectedCount} connected integration${connectedCount !== 1 ? "s" : ""}.`,
      });
    }, 2000);
  };

  // ─── Card action handlers ──────────────────────────────────
  const handleConfigure = (integration: Integration) => {
    setConfigureTarget(integration);
  };

  const handleSaveConfig = (updated: Integration) => {
    setIntegrationsList((prev) =>
      prev.map((i) => (i.id === updated.id ? updated : i))
    );
  };

  const handleConnect = (integration: Integration) => {
    setIntegrationsList((prev) =>
      prev.map((i) =>
        i.id === integration.id
          ? { ...i, status: "connected" as const, lastSync: "Just now" }
          : i
      )
    );
    toast({
      title: "Connected Successfully",
      description: `"${integration.name}" is now connected and syncing.`,
    });
  };

  const handleRequestDisconnect = (integration: Integration) => {
    setDisconnectTarget(integration);
  };

  const handleConfirmDisconnect = () => {
    if (!disconnectTarget) return;
    setIntegrationsList((prev) =>
      prev.map((i) =>
        i.id === disconnectTarget.id
          ? { ...i, status: "disconnected" as const, apiCalls: 0 }
          : i
      )
    );
    toast({
      title: "Disconnected",
      description: `"${disconnectTarget.name}" has been disconnected.`,
    });
    setDisconnectTarget(null);
  };

  // ─── Add new integration handler ───────────────────────────
  const handleAddIntegration = (data: {
    name: string;
    type: string;
    icon: string;
    baseUrl: string;
    authMethod: string;
    syncFrequency: string;
    description: string;
  }) => {
    const newIntegration: Integration = {
      id: Date.now(), // unique ID
      name: data.name,
      type: data.type,
      status: "connected",
      lastSync: "Just now",
      apiCalls: 0,
      icon: data.icon,
      baseUrl: data.baseUrl,
      authMethod: data.authMethod,
      syncFrequency: data.syncFrequency,
      description: data.description,
    };
    setIntegrationsList((prev) => [...prev, newIntegration]);
  };

  // ═════════════════════════════════════════════════════════════
  //  JSX
  // ═════════════════════════════════════════════════════════════
  return (
    <>
      <DashboardLayout
        title="Integrations"
        actions={
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Add Integration</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Add Integration</TooltipContent>
          </Tooltip>
        }
      >
        {/* ─── KPI Cards ─────────────────────────────────────── */}
        <PageSection className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="Active Integrations"
              value={connectedCount.toString()}
              icon={<Plug className="h-6 w-6" />}
              variant="success"
            />
            <KPICard
              title="Failed Connections"
              value={failedCount.toString()}
              icon={<XCircle className="h-6 w-6" />}
              variant={failedCount > 0 ? "destructive" : "default"}
            />
            <KPICard
              title="API Calls (Today)"
              value={totalApiCalls.toLocaleString()}
              icon={<Activity className="h-6 w-6" />}
              trend={{ value: 12, direction: "up" }}
            />
            <KPICard
              title="Last Sync"
              value="1 min ago"
              icon={<Clock className="h-6 w-6" />}
              valueClassName="whitespace-nowrap text-2xl"
            />
          </div>
        </PageSection>

        {/* ─── API Usage Chart & Quick Access ────────────────── */}
        <PageSection className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 lg:h-full">
              <TrendLineChart
                data={apiUsageData}
                lines={[
                  {
                    dataKey: "calls",
                    color: "hsl(217, 91%, 50%)",
                    label: "API Calls",
                  },
                ]}
                title="API Usage (Last 7 Days)"
                className="lg:h-full"
              />
            </div>

            {/* Quick Access Panel */}
            <div className="dashboard-card lg:h-full flex flex-col">
              <SectionTitle>Quick Access</SectionTitle>
              <div className="mt-4 space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleManageAPIKeys}
                >
                  <Key className="h-4 w-4 mr-3" />
                  Manage API Keys
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleConfigureWebhooks}
                >
                  <Webhook className="h-4 w-4 mr-3" />
                  Configure Webhooks
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleSyncAll}
                  disabled={isSyncing}
                >
                  {isSyncing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-3 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-3" />
                      Sync All Integrations
                    </>
                  )}
                </Button>
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <h4 className="text-sm font-semibold text-foreground mb-3">
                  Webhook Activity
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sent (24h)</span>
                    <span className="font-medium text-success">1,234</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Failed (24h)</span>
                    <span className="font-medium text-destructive">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pending</span>
                    <span className="font-medium text-warning">5</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PageSection>

        {/* ─── Integration Cards ─────────────────────────────── */}
        <PageSection>
          <div className="dashboard-card">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <SectionTitle>Connected Systems</SectionTitle>
              <div className="flex items-center gap-2 flex-wrap">
                {/* Filter pills */}
                {filterOptions.map((f) => (
                  <Button
                    key={f.key}
                    variant={filterStatus === f.key ? "default" : "outline"}
                    size="sm"
                    className="text-xs h-7 px-3"
                    onClick={() => setFilterStatus(f.key)}
                  >
                    {f.label} ({filterCounts[f.key]})
                  </Button>
                ))}
              </div>
            </div>

            {filteredIntegrations.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Plug className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">
                  No integrations match the selected filter.
                </p>
                <Button
                  variant="link"
                  size="sm"
                  className="mt-2"
                  onClick={() => setFilterStatus("all")}
                >
                  View All Integrations
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredIntegrations.map((integration) => (
                  <Card
                    key={integration.id}
                    className={`hover:shadow-card-hover transition-shadow ${
                      integration.status === "error"
                        ? "border-destructive/50"
                        : ""
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-xl">
                            {integration.icon}
                          </div>
                          <div>
                            <CardTitle className="text-base">
                              {integration.name}
                            </CardTitle>
                            <CardDescription>
                              {integration.type}
                            </CardDescription>
                          </div>
                        </div>
                        {getStatusBadge(integration.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Last Sync
                          </span>
                          <span className="font-medium">
                            {integration.lastSync}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            API Calls (Today)
                          </span>
                          <span className="font-medium">
                            {integration.apiCalls.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleConfigure(integration)}
                        >
                          <Settings className="h-4 w-4 mr-1" />
                          Configure
                        </Button>
                        {integration.status === "connected" ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() =>
                                  handleRequestDisconnect(integration)
                                }
                              >
                                <Link2Off className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Disconnect</TooltipContent>
                          </Tooltip>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleConnect(integration)}
                          >
                            <Link2 className="h-4 w-4 mr-1" />
                            Connect
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </PageSection>
      </DashboardLayout>

      {/* ─── Add Integration Dialog ──────────────────────────── */}
      <AddIntegrationDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdd={handleAddIntegration}
      />

      {/* ─── Configure Integration Dialog ────────────────────── */}
      <ConfigureIntegrationDialog
        integration={configureTarget}
        open={configureTarget !== null}
        onOpenChange={(open) => {
          if (!open) setConfigureTarget(null);
        }}
        onSave={handleSaveConfig}
      />

      {/* ─── Disconnect Confirmation Dialog ──────────────────── */}
      <AlertDialog
        open={disconnectTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDisconnectTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <Link2Off className="h-5 w-5 text-destructive" />
              </div>
              Disconnect {disconnectTarget?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will disconnect the{" "}
              <strong>{disconnectTarget?.name}</strong> integration. Data sync
              will stop and API calls will be disabled. You can reconnect at any
              time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDisconnect}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
