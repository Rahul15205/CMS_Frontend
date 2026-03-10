import { useEffect } from "react";
import { DashboardLayout, PageSection, SectionTitle, WidgetGrid } from "@/components/layout/DashboardLayout";
import { KPIWidget, KPIGrid } from "@/components/dashboard/widgets/KPIWidget";
import { AlertBanner } from "@/components/dashboard/AlertBanner";
import { ActivityItem } from "@/components/dashboard/ActivityItem";
import { ComplianceScore } from "@/components/dashboard/ComplianceScore";
import { QuickAction } from "@/components/dashboard/QuickAction";
import { BarChartHorizontal } from "@/components/charts/BarChartHorizontal";
import { ConsentDonutChart } from "@/components/charts/ConsentDonutChart";
import { TrendLineChart } from "@/components/charts/TrendLineChart";
import { Button } from "@/components/ui/button";
import { useDashboard, UserRole } from "@/contexts/DashboardContext";
import { useDashboardData } from "@/hooks/useDashboardData";
import {
  FileCheck,
  Clock,
  XCircle,
  Scale,
  MessageSquareWarning,
  AlertTriangle,
  Plus,
  Eye,
  Edit,
  UserCheck,
  FileText,
  Shield,
  RefreshCw,
  Download,
  CheckCircle,
  Users,
  Settings,
  Ban,
  UserCog,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
const consentStatusData = [
  { name: "Active", value: 12450, color: "hsl(142, 76%, 36%)" },
  { name: "Expired", value: 2340, color: "hsl(38, 92%, 50%)" },
  { name: "Withdrawn", value: 890, color: "hsl(0, 72%, 51%)" },
  { name: "Rejected", value: 320, color: "hsl(262, 83%, 58%)" },
  { name: "Pending", value: 560, color: "hsl(199, 89%, 48%)" },
];

const trendData = [
  { name: "Jan", active: 1200, withdrawn: 180, expired: 90, rejected: 45, pending: 120 },
  { name: "Feb", active: 1400, withdrawn: 150, expired: 120, rejected: 50, pending: 140 },
  { name: "Mar", active: 1800, withdrawn: 200, expired: 100, rejected: 60, pending: 110 },
  { name: "Apr", active: 2100, withdrawn: 170, expired: 130, rejected: 55, pending: 130 },
  { name: "May", active: 1900, withdrawn: 220, expired: 110, rejected: 70, pending: 150 },
  { name: "Jun", active: 2400, withdrawn: 190, expired: 140, rejected: 65, pending: 160 },
];

const rightsData = [
  { name: "File Complaint", value: 45, max: 100 },
  { name: "Withdraw", value: 78, max: 100 },
  { name: "Access", value: 234, max: 300 },
  { name: "Correction", value: 156, max: 200 },
  { name: "Erasure", value: 89, max: 150 },
  { name: "Grievance", value: 12, max: 50 },
  { name: "Nominate", value: 23, max: 50 },
];

// Data Principal specific data
const myConsentsData = [
  { name: "Marketing", value: 3, color: "hsl(217, 91%, 50%)" },
  { name: "Analytics", value: 2, color: "hsl(142, 76%, 36%)" },
  { name: "Third Party", value: 1, color: "hsl(38, 92%, 50%)" },
];

const recentActivities = [
  {
    icon: <UserCheck className="h-4 w-4" />,
    title: "New consent granted",
    description: "Marketing communications - User ID: 78234",
    time: "2 min ago",
    variant: "success" as const,
  },
  {
    icon: <XCircle className="h-4 w-4" />,
    title: "Consent withdrawn",
    description: "Data analytics - User ID: 45123",
    time: "15 min ago",
    variant: "error" as const,
  },
  {
    icon: <Scale className="h-4 w-4" />,
    title: "Data access request submitted",
    description: "Request ID: REQ-2024-0892",
    time: "1 hr ago",
    variant: "default" as const,
  },
  {
    icon: <MessageSquareWarning className="h-4 w-4" />,
    title: "Grievance escalated",
    description: "Case ID: GRV-2024-0234",
    time: "3 hrs ago",
    variant: "warning" as const,
  },
  {
    icon: <FileText className="h-4 w-4" />,
    title: "Privacy notice updated",
    description: "Version 2.4 published",
    time: "5 hrs ago",
    variant: "default" as const,
  },
];

import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

// ... existing imports ...

function AdminDashboard() {
  const { config, addRole, setRole, roleLabels, availableRoles } = useDashboard();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { kpis, isLoadingKpis, alerts, recentActivity: liveActivity, consentChart, refetchAll } = useDashboardData();

  const getWidget = (id: string) => config.widgets.find(w => w.id === id);
  const isEnabled = (id: string) => getWidget(id)?.enabled ?? false;

  // Dialog States
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");
  const [baseRole, setBaseRole] = useState<UserRole>("admin");

  // Handlers
  const handleAlertAction = () => {
    toast({
      title: "Navigation",
      description: "Redirecting to Consent Renewal processing...",
    });
    navigate("/consent");
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "Create New Template":
        navigate("/consent"); // Ideally pass state to open wizard
        break;
      case "Create Notice Template":
        navigate("/notices");
        break;
      case "Create Integration":
        navigate("/integrations");
        break;
      case "Create Role":
        setIsRoleDialogOpen(true);
        break;
      default:
        toast({
          title: "Quick Action",
          description: `Initiating: ${action}`,
        });
    }
  };

  const handleCreateRole = () => {
    if (!newRoleName) return;

    addRole(newRoleName, newRoleDesc, baseRole);

    setIsRoleDialogOpen(false);
    toast({
      title: "Role Created",
      description: `New user role '${newRoleName}' created based on ${roleLabels[baseRole] || baseRole}.`,
      variant: "default"
    });

    // Optional: Switch to new role to show it works
    const roleId = newRoleName.toLowerCase().replace(/\s+/g, "_");
    setRole(roleId);
    toast({ title: "Role Switched", description: `Switched view to new role: ${newRoleName}` });
  };

  return (
    <>
      {/* Alert Banner */}
      {alerts?.slaBreachedRequests?.length > 0 ? (
        <AlertBanner
          variant="warning"
          title={`${alerts.slaBreachedRequests.length} rights requests breaching SLA`}
          message="Review and process immediately to avoid compliance issues"
          action={{ label: "Review Now", onClick: () => navigate("/rights") }}
          className="mb-6"
        />
      ) : alerts?.staleSessions > 0 ? (
        <AlertBanner
          variant="info"
          title={`${alerts.staleSessions} stale user sessions detected`}
          message="Review security dashboard to clear idle sessions."
          action={{ label: "Review Now", onClick: () => navigate("/security") }}
          className="mb-6"
        />
      ) : (
        <AlertBanner
          variant="success"
          title="All systems optimal"
          message="No active critical alerts or SLA breaches."
          className="mb-6 bg-success/10 border-success/20 text-success"
        />
      )}

      {/* Global Time Range Selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <Tabs defaultValue="30d" className="w-full sm:w-auto">
          <TabsList className="w-full sm:w-auto grid grid-cols-4 sm:flex">
            <TabsTrigger value="7d" className="text-xs sm:text-sm">7D</TabsTrigger>
            <TabsTrigger value="30d" className="text-xs sm:text-sm">30D</TabsTrigger>
            <TabsTrigger value="90d" className="text-xs sm:text-sm">90D</TabsTrigger>
            <TabsTrigger value="1y" className="text-xs sm:text-sm">1Y</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none"
            onClick={() => toast({ title: "Export queued", description: "Dashboard summary export started." })}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none" onClick={() => { refetchAll(); toast({ title: "Refreshed", description: "Dashboard data refreshed successfully." }); }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <PageSection className="mb-8">
        <KPIGrid>
          {isEnabled("kpi-consents") && (
            <KPIWidget
              id="kpi-consents"
              title="Total Active Consents"
              value={kpis?.totalActiveConsents?.toLocaleString() || "0"}
              icon={<FileCheck className="h-5 w-5" />}
              trend={{ value: 12.5, direction: "up", isPositive: true }}
              variant="success"
              isLoading={isLoadingKpis}
            />
          )}
          {isEnabled("kpi-expired") && (
            <KPIWidget
              id="kpi-expired"
              title="Expired & Withdrawn"
              value={kpis?.expiredWithdrawnConsents?.toLocaleString() || "0"}
              icon={<Clock className="h-5 w-5" />}
              trend={{ value: 3.2, direction: "down", isPositive: true }}
              variant="warning"
              isLoading={isLoadingKpis}
            />
          )}
          {isEnabled("kpi-rights") && (
            <KPIWidget
              id="kpi-rights"
              title="Pending Rights Requests"
              value={kpis?.pendingRights?.toLocaleString() || "0"}
              icon={<Scale className="h-5 w-5" />}
              trend={{ value: 8, direction: "up", isPositive: false }}
              variant="info"
              subtitle={alerts?.slaBreachedRequests?.length ? `${alerts.slaBreachedRequests.length} SLA breaches` : "On track"}
              isLoading={isLoadingKpis}
            />
          )}
          <KPIWidget
            id="kpi-rejected"
            title="Rejected Consents"
            value="0" // Should come from API eventually
            icon={<Ban className="h-5 w-5" />}
            trend={{ value: 5.4, direction: "up", isPositive: false }}
            variant="destructive"
            className="border-l-4 border-l-[#8b5cf6]" // Purple accent
            isLoading={isLoadingKpis}
          />
          {isEnabled("kpi-grievances") && (
            <KPIWidget
              id="kpi-grievances"
              title="Open Grievances"
              value={kpis?.openGrievances?.toLocaleString() || "0"}
              icon={<MessageSquareWarning className="h-5 w-5" />}
              trend={{ value: 15, direction: "down", isPositive: true }}
              variant="destructive"
              isLoading={isLoadingKpis}
            />
          )}
          {isEnabled("kpi-sla") && (
            <KPIWidget
              id="kpi-sla"
              title="SLA Breaches"
              value={kpis?.slaBreaches?.toLocaleString() || "0"}
              icon={<AlertTriangle className="h-5 w-5" />}
              trend={{ value: 50, direction: "down", isPositive: true }}
              variant="destructive"
              subtitle="This month"
              isLoading={isLoadingKpis}
            />
          )}
          {isEnabled("kpi-risk") && (
            <KPIWidget
              id="kpi-risk"
              title="Risk Exposure"
              value={alerts?.slaBreachedRequests?.length > 0 || kpis?.slaBreaches > 0 ? "High" : "Low"}
              icon={<Shield className="h-5 w-5" />}
              variant={alerts?.slaBreachedRequests?.length > 0 || kpis?.slaBreaches > 0 ? "destructive" : "success"}
              subtitle={alerts?.slaBreachedRequests?.length > 0 || kpis?.slaBreaches > 0 ? "Critical items require attention" : "All critical items addressed"}
              isLoading={isLoadingKpis}
            />
          )}
          {isEnabled("kpi-users") && (
            <KPIWidget
              id="kpi-users"
              title="Total Users"
              value={kpis?.totalUsers?.toLocaleString() || "0"}
              icon={<Users className="h-5 w-5" />}
              trend={{ value: 12, direction: "up", isPositive: true }}
              variant="default"
              isLoading={isLoadingKpis}
            />
          )}
          {isEnabled("kpi-roles") && (
            <KPIWidget
              id="kpi-roles"
              title="User Roles"
              value={kpis?.totalRoles?.toLocaleString() || "0"}
              icon={<UserCog className="h-5 w-5" />}
              variant="info"
              subtitle="System Roles"
              isLoading={isLoadingKpis}
            />
          )}
        </KPIGrid>
      </PageSection>

      {/* Charts Row */}
      <PageSection className="mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {isEnabled("chart-donut") && (
            <ConsentDonutChart
              data={consentChart && consentChart.length > 0 ? consentChart.map((c: any) => ({
                name: c.label === "GRANTED" ? "Active" : c.label === "REVOKED" ? "Withdrawn/Expired" : c.label,
                value: c.count,
                color: c.label === "GRANTED" ? "hsl(142, 76%, 36%)" : "hsl(0, 72%, 51%)"
              })) : consentStatusData}
              title="Consent Status Distribution"
            />
          )}
          {isEnabled("chart-trend") && (
            <div>
              <TrendLineChart
                data={trendData}
                lines={[
                  { dataKey: "active", color: "hsl(142, 76%, 36%)", label: "Active" },
                  { dataKey: "withdrawn", color: "hsl(0, 72%, 51%)", label: "Withdrawn" },
                  { dataKey: "expired", color: "hsl(38, 92%, 50%)", label: "Expired" },
                  { dataKey: "rejected", color: "hsl(262, 83%, 58%)", label: "Rejected" },
                  { dataKey: "pending", color: "hsl(199, 89%, 48%)", label: "Pending" },
                ]}
                title="Consent Trends"
              />
            </div>
          )}
        </div>
      </PageSection>

      {/* Bottom Section */}
      <WidgetGrid>
        {/* Compliance Score */}
        {isEnabled("compliance-score") && (
          <div className="dashboard-card flex flex-col items-center justify-center py-8">
            <SectionTitle>Compliance Health</SectionTitle>
            <ComplianceScore score={87} size="lg" className="mt-4" />
            <div className="mt-6 w-full space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Consent Module</span>
                <span className="font-medium text-success">92%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Rights Management</span>
                <span className="font-medium text-success">88%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Grievances</span>
                <span className="font-medium text-warning">76%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Notices</span>
                <span className="font-medium text-success">91%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Cookie Management</span>
                <span className="font-medium text-success">85%</span>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {isEnabled("quick-actions") && (
          <div className="dashboard-card">
            <SectionTitle>Quick Actions</SectionTitle>
            <div className="mt-4 space-y-3">
              <QuickAction
                icon={<Plus className="h-5 w-5" />}
                title="Create New Consent Template"
                description="Record new data principal consent"
                onClick={() => handleQuickAction("Create New Template")}
                variant="primary"
              />
              <QuickAction
                icon={<Eye className="h-5 w-5" />}
                title="Create new notice template"
                description="47 requests awaiting action"
                onClick={() => handleQuickAction("Create Notice Template")}
                variant="warning"
              />
              <QuickAction
                icon={<Edit className="h-5 w-5" />}
                title="Create new integration"
                description="Last updated 14 days ago"
                onClick={() => handleQuickAction("Create Integration")}
              />
              <QuickAction
                icon={<Shield className="h-5 w-5" />}
                title="Create new user role"
                description="Run compliance verification"
                onClick={() => handleQuickAction("Create Role")}
              />
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {isEnabled("recent-activity") && (
          <div className="dashboard-card">
            <div className="flex items-center justify-between mb-4">
              <SectionTitle>Recent Activity</SectionTitle>
              <Button variant="ghost" size="sm" className="text-primary" onClick={() => navigate("/logs")}>
                View All
              </Button>
            </div>
            <div className="space-y-1">
              {liveActivity && liveActivity.length > 0 ? liveActivity.map((activity: any, index: number) => {
                const isWarning = activity.action.includes('failed') || activity.action.includes('deleted');
                const isSuccess = activity.action.includes('created') || activity.action.includes('granted');
                return (
                <ActivityItem
                  key={activity.id || index}
                  icon={isWarning ? <AlertTriangle className="h-4 w-4" /> : isSuccess ? <CheckCircle className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                  title={activity.action}
                  description={activity.details || `User: ${activity.user?.name || activity.userId}`}
                  time={new Date(activity.createdAt).toLocaleDateString()}
                  variant={isWarning ? "error" : isSuccess ? "success" : "default"}
                />
              )}) : (
                <p className="text-sm text-muted-foreground p-4 text-center">No recent activity found.</p>
              )}
            </div>
          </div>
        )}
      </WidgetGrid>

      {/* Quick Action Dialogs */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New User Role</DialogTitle>
            <DialogDescription>Define a new role and assign permissions.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="roleName">Role Name</Label>
              <Input
                id="roleName"
                placeholder="e.g. Compliance Officer"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="baseRole">Base Role (Copy Permissions)</Label>
              <Select value={baseRole as string} onValueChange={(val) => setBaseRole(val as UserRole)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select base role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="dpo">Data Protection Officer</SelectItem>
                  <SelectItem value="data_principal">Data Principal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="roleDesc">Description</Label>
              <Input
                id="roleDesc"
                placeholder="Role description..."
                value={newRoleDesc}
                onChange={(e) => setNewRoleDesc(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateRole}>Create Role</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function DPODashboard() {
  const { config } = useDashboard();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { kpis, isLoadingKpis, alerts, consentChart, refetchAll } = useDashboardData();

  const getWidget = (id: string) => config.widgets.find(w => w.id === id);
  const isEnabled = (id: string) => getWidget(id)?.enabled ?? false;

  const handlePriorityAction = (target: "rights" | "grievances") => {
    navigate(target === "rights" ? "/rights" : "/grievances");
    toast({
      title: "Redirecting",
      description: target === "rights" ? "Opening Rights Requests queue." : "Opening Grievance cases.",
    });
  };

  return (
    <>
      {/* DPO-specific Alert */}
      {alerts?.slaBreachedRequests?.length > 0 ? (
        <AlertBanner
          variant="warning"
          title={`${alerts.slaBreachedRequests.length} rights requests approaching SLA deadline`}
          message="Please review and process before compliance breach"
          action={{ label: "Review Requests", onClick: () => handlePriorityAction("rights") }}
          className="mb-6"
        />
      ) : (
        <AlertBanner
          variant="success"
          title="All SLA targets met"
          message="No rights requests are currently approaching deadline"
          className="mb-6 bg-success/10 border-success/20 text-success"
        />
      )}

      {/* Time Range */}
      <div className="flex items-center justify-between mb-6">
        <Tabs defaultValue="30d" className="w-auto">
          <TabsList>
            <TabsTrigger value="7d">7 Days</TabsTrigger>
            <TabsTrigger value="30d">30 Days</TabsTrigger>
            <TabsTrigger value="90d">90 Days</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button variant="outline" size="sm" onClick={() => { refetchAll(); toast({ title: "Refreshed", description: "DPO dashboard metrics refreshed." }); }}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* DPO-focused KPIs */}
      <PageSection className="mb-8">
        <KPIGrid>
          {isEnabled("kpi-consents") && (
            <KPIWidget
              id="kpi-consents"
              title="Active Consents"
              value={kpis?.totalActiveConsents?.toLocaleString() || "0"}
              icon={<FileCheck className="h-5 w-5" />}
              trend={{ value: 12.5, direction: "up", isPositive: true }}
              variant="success"
              isLoading={isLoadingKpis}
            />
          )}
          {isEnabled("kpi-rights") && (
            <KPIWidget
              id="kpi-rights"
              title="Pending Rights Requests"
              value={kpis?.pendingRights?.toLocaleString() || "0"}
              icon={<Scale className="h-5 w-5" />}
              trend={{ value: 8, direction: "up", isPositive: false }}
              variant="info"
              subtitle={alerts?.slaBreachedRequests?.length ? `${alerts.slaBreachedRequests.length} SLA breaches` : "On track"}
              isLoading={isLoadingKpis}
            />
          )}
          {isEnabled("kpi-grievances") && (
            <KPIWidget
              id="kpi-grievances"
              title="Open Grievances"
              value={kpis?.openGrievances?.toLocaleString() || "0"}
              icon={<MessageSquareWarning className="h-5 w-5" />}
              trend={{ value: 15, direction: "down", isPositive: true }}
              variant="warning"
              isLoading={isLoadingKpis}
            />
          )}
          {isEnabled("kpi-compliance") && (
            <KPIWidget
              id="kpi-compliance"
              title="Compliance Score"
              value="87%" // Should come from a compliance score API
              icon={<Shield className="h-5 w-5" />}
              trend={{ value: 3, direction: "up", isPositive: true }}
              variant="success"
              isLoading={isLoadingKpis}
            />
          )}
        </KPIGrid>
      </PageSection>

      {/* Charts */}
      <PageSection className="mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {isEnabled("chart-donut") && (
            <ConsentDonutChart
              data={consentChart && consentChart.length > 0 ? consentChart.map((c: any) => ({
                name: c.label === "GRANTED" ? "Active" : c.label === "REVOKED" ? "Withdrawn/Expired" : c.label,
                value: c.count,
                color: c.label === "GRANTED" ? "hsl(142, 76%, 36%)" : "hsl(0, 72%, 51%)"
              })) : consentStatusData}
              title="Consent Status"
            />
          )}
          {isEnabled("chart-rights") && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Rights Requests by Type</CardTitle>
                <CardDescription>Distribution of data principal rights requests</CardDescription>
              </CardHeader>
              <CardContent>
                <BarChartHorizontal
                  data={rightsData}
                  title=""
                />
              </CardContent>
            </Card>
          )}
        </div>
      </PageSection>

      {/* Bottom Section */}
      <WidgetGrid>
        {isEnabled("compliance-score") && (
          <div className="dashboard-card flex flex-col items-center justify-center py-8">
            <SectionTitle>Compliance Status</SectionTitle>
            <ComplianceScore score={87} size="lg" className="mt-4" />
            <div className="mt-6 w-full space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Rights Fulfilment</span>
                <span className="font-medium text-success">94%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Grievance Resolution</span>
                <span className="font-medium text-warning">78%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">SLA Compliance</span>
                <span className="font-medium text-success">89%</span>
              </div>
            </div>
          </div>
        )}

        {isEnabled("quick-actions") && (
          <div className="dashboard-card">
            <SectionTitle>Priority Actions</SectionTitle>
            <div className="mt-4 space-y-3">
              <QuickAction
                icon={<AlertTriangle className="h-5 w-5" />}
                title="SLA Breaching Soon"
                description="5 requests need immediate attention"
                onClick={() => handlePriorityAction("rights")}
                variant="warning"
              />
              <QuickAction
                icon={<Scale className="h-5 w-5" />}
                title="Process Rights Requests"
                description="47 pending requests"
                onClick={() => handlePriorityAction("rights")}
                variant="primary"
              />
              <QuickAction
                icon={<MessageSquareWarning className="h-5 w-5" />}
                title="Resolve Grievances"
                description="8 open cases"
                onClick={() => handlePriorityAction("grievances")}
              />
            </div>
          </div>
        )}

        {isEnabled("recent-activity") && (
          <div className="dashboard-card">
            <div className="flex items-center justify-between mb-4">
              <SectionTitle>Recent Activity</SectionTitle>
              <Button variant="ghost" size="sm" className="text-primary" onClick={() => navigate("/logs")}>
                View All
              </Button>
            </div>
            <div className="space-y-1">
              {recentActivities.slice(0, 4).map((activity, index) => (
                <ActivityItem
                  key={index}
                  icon={activity.icon}
                  title={activity.title}
                  description={activity.description}
                  time={activity.time}
                  variant={activity.variant}
                />
              ))}
            </div>
          </div>
        )}
      </WidgetGrid>
    </>
  );
}

function DataPrincipalDashboard() {
  const { config } = useDashboard();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { kpis, isLoadingKpis } = useDashboardData();

  const getWidget = (id: string) => config.widgets.find(w => w.id === id);
  const isEnabled = (id: string) => getWidget(id)?.enabled ?? false;

  const handleDataPrincipalAction = (target: "access" | "correction" | "consent" | "grievance") => {
    const routeMap = {
      access: "/rights",
      correction: "/rights",
      consent: "/consent",
      grievance: "/grievances",
    } as const;
    const labelMap = {
      access: "Opening rights request form for data access.",
      correction: "Opening correction workflow.",
      consent: "Opening consent preferences.",
      grievance: "Opening grievance submission.",
    } as const;
    navigate(routeMap[target]);
    toast({ title: "Redirecting", description: labelMap[target] });
  };

  return (
    <>
      {/* Welcome Banner */}
      <Card className="mb-6 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Welcome back, John Doe</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your privacy preferences and data rights
              </p>
            </div>
            <Button onClick={() => navigate("/settings")}>
              <Settings className="h-4 w-4 mr-2" />
              Manage Preferences
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Principal KPIs */}
      <PageSection className="mb-8">
        <KPIGrid>
          {isEnabled("kpi-my-consents") && (
            <KPIWidget
              id="kpi-my-consents"
              title="My Active Consents"
              value={kpis?.totalActiveConsents?.toLocaleString() || "0"}
              icon={<FileCheck className="h-5 w-5" />}
              variant="success"
              subtitle="Current session"
              isLoading={isLoadingKpis}
            />
          )}
          {isEnabled("kpi-my-requests") && (
            <KPIWidget
              id="kpi-my-requests"
              title="My Pending Requests"
              value={kpis?.pendingRights?.toLocaleString() || "0"}
              icon={<Scale className="h-5 w-5" />}
              variant="info"
              subtitle="Data access requests"
              isLoading={isLoadingKpis}
            />
          )}
          {isEnabled("kpi-my-grievances") && (
            <KPIWidget
              id="kpi-my-grievances"
              title="My Grievances"
              value={kpis?.openGrievances?.toLocaleString() || "0"}
              icon={<MessageSquareWarning className="h-5 w-5" />}
              variant="success"
              subtitle="Open cases"
              isLoading={isLoadingKpis}
            />
          )}
        </KPIGrid>
      </PageSection>

      {/* Charts & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {isEnabled("chart-my-consents") && (
          <ConsentDonutChart
            data={myConsentsData}
            title="My Consents by Purpose"
          />
        )}

        {isEnabled("quick-actions-dp") && (
          <div className="dashboard-card">
            <SectionTitle>What would you like to do?</SectionTitle>
            <div className="mt-4 space-y-3">
              <QuickAction
                icon={<Eye className="h-5 w-5" />}
                title="View My Data"
                description="Request access to your personal data"
                onClick={() => handleDataPrincipalAction("access")}
                variant="primary"
              />
              <QuickAction
                icon={<Edit className="h-5 w-5" />}
                title="Update My Information"
                description="Request correction to your data"
                onClick={() => handleDataPrincipalAction("correction")}
              />
              <QuickAction
                icon={<XCircle className="h-5 w-5" />}
                title="Withdraw Consent"
                description="Manage your consent preferences"
                onClick={() => handleDataPrincipalAction("consent")}
                variant="warning"
              />
              <QuickAction
                icon={<MessageSquareWarning className="h-5 w-5" />}
                title="Raise a Concern"
                description="Submit a grievance or feedback"
                onClick={() => handleDataPrincipalAction("grievance")}
              />
            </div>
          </div>
        )}
      </div>

      {/* My Recent Activity */}
      {isEnabled("my-activity") && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">My Recent Activity</CardTitle>
            <CardDescription>Your privacy-related actions and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <div className="p-2 rounded-full bg-success/10">
                  <CheckCircle className="h-4 w-4 text-success" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Marketing consent granted</p>
                  <p className="text-xs text-muted-foreground">You agreed to receive marketing emails</p>
                </div>
                <span className="text-xs text-muted-foreground">2 days ago</span>
              </div>
              <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <div className="p-2 rounded-full bg-info/10">
                  <Scale className="h-4 w-4 text-info" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Data access request submitted</p>
                  <p className="text-xs text-muted-foreground">Request ID: REQ-2024-1234</p>
                </div>
                <span className="text-xs text-muted-foreground">5 days ago</span>
              </div>
              <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <div className="p-2 rounded-full bg-warning/10">
                  <FileText className="h-4 w-4 text-warning" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Privacy notice acknowledged</p>
                  <p className="text-xs text-muted-foreground">Version 2.3 - Updated terms</p>
                </div>
                <span className="text-xs text-muted-foreground">1 week ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}

export default function Dashboard() {
  const { config, roleLabels } = useDashboard();

  const dashboardTitles: Record<UserRole, { title: string }> = {
    admin: { title: "Admin Dashboard" },
    dpo: { title: "DPO Dashboard" },
    data_principal: { title: "My Privacy Portal" },
  };

  const { title } = dashboardTitles[config.role] || { title: `${roleLabels[config.role] || config.role} Dashboard` };
  const { setView } = useDashboard();

  useEffect(() => {
    setView("main");
  }, [setView]);

  return (
    <DashboardLayout
      title={title}

      showCustomizer={true}
      showUserProfile={true}
    >
      {config.role === "admin" && <AdminDashboard />}
      {config.role === "dpo" && <DPODashboard />}
      {config.role === "data_principal" && <DataPrincipalDashboard />}
    </DashboardLayout >
  );
}
