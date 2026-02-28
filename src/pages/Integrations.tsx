import { useState } from "react";
import { DashboardLayout, PageSection, SectionTitle } from "@/components/layout/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import { AddIntegrationDialog } from "@/components/integrations/AddIntegrationDialog";
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
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const apiUsageData = [
  { name: "Mon", calls: 1200 },
  { name: "Tue", calls: 1800 },
  { name: "Wed", calls: 2200 },
  { name: "Thu", calls: 1900 },
  { name: "Fri", calls: 2400 },
  { name: "Sat", calls: 800 },
  { name: "Sun", calls: 600 },
];

const integrations = [
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

export default function Integrations() {
  const connectedCount = integrations.filter(i => i.status === "connected").length;
  const failedCount = integrations.filter(i => i.status === "error").length;
  const totalApiCalls = integrations.reduce((sum, i) => sum + i.apiCalls, 0);
  const { toast } = useToast();
  const [showAddDialog, setShowAddDialog] = useState(false);

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
      {/* KPI Cards */}
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

      {/* API Usage Chart & Webhooks */}
      <PageSection className="mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 lg:h-full">
            <TrendLineChart
              data={apiUsageData}
              lines={[
                { dataKey: "calls", color: "hsl(217, 91%, 50%)", label: "API Calls" },
              ]}
              title="API Usage (Last 7 Days)"
              className="lg:h-full"
            />
          </div>

          {/* API Keys & Webhooks */}
          <div className="dashboard-card lg:h-full flex flex-col">
            <SectionTitle>Quick Access</SectionTitle>
            <div className="mt-4 space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Key className="h-4 w-4 mr-3" />
                Manage API Keys
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Webhook className="h-4 w-4 mr-3" />
                Configure Webhooks
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <RefreshCw className="h-4 w-4 mr-3" />
                Sync All Integrations
              </Button>
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <h4 className="text-sm font-semibold text-foreground mb-3">Webhook Activity</h4>
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

      {/* Integration Cards */}
      <PageSection>
        <div className="dashboard-card">
          <div className="flex items-center justify-between mb-6">
            <SectionTitle>Connected Systems</SectionTitle>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations.map((integration) => (
              <Card key={integration.id} className={`hover:shadow-card-hover transition-shadow ${integration.status === "error" ? "border-destructive/50" : ""
                }`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-xl">
                        {integration.icon}
                      </div>
                      <div>
                        <CardTitle className="text-base">{integration.name}</CardTitle>
                        <CardDescription>{integration.type}</CardDescription>
                      </div>
                    </div>
                    {getStatusBadge(integration.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Sync</span>
                      <span className="font-medium">{integration.lastSync}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">API Calls (Today)</span>
                      <span className="font-medium">{integration.apiCalls.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Settings className="h-4 w-4 mr-1" />
                      Configure
                    </Button>
                    {integration.status === "connected" ? (
                      <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                        <Link2Off className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button size="sm">
                        <Link2 className="h-4 w-4 mr-1" />
                        Connect
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </PageSection>
    </DashboardLayout>

    <AddIntegrationDialog
      open={showAddDialog}
      onOpenChange={setShowAddDialog}
    />
    </>
  );
}
