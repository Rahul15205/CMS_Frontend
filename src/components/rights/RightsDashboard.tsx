import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { KPICard } from "@/components/dashboard/KPICard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { ConsentDonutChart } from "@/components/charts/ConsentDonutChart";
import { TrendLineChart } from "@/components/charts/TrendLineChart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; // PHASE 5 CHANGE
import {
  Scale,
  Clock,
  CheckCircle,
  AlertTriangle,
  Timer,
  TrendingUp,
  TrendingDown,
  Eye,
  Edit,
  Trash2,
  Download,
  Hand,
  Ban,
  XCircle,
  ShieldOff,
  Bot,
  FileText,
  ArrowRight,
  RefreshCw,
  Building,
  Users,
  Shield,
  Globe,
  Activity,
  BarChart3,
} from "lucide-react"; // PHASE 5 CHANGE
import { RIGHTS_TYPE_INFO, REGULATION_INFO } from "./types";
import { rightsService } from "@/services/rightsService";
import { handleApiError } from "@/lib/errorHandler";

const regulationBreakdown = [
  { name: "GDPR", value: 523, color: REGULATION_INFO.gdpr.color },
  { name: "DPDP", value: 412, color: REGULATION_INFO.dpdp.color },
  { name: "CCPA", value: 189, color: REGULATION_INFO.ccpa.color },
  { name: "LGPD", value: 78, color: REGULATION_INFO.lgpd.color },
  { name: "Other", value: 45, color: REGULATION_INFO.custom.color },
];

const trendData = [
  { name: "Week 1", access: 45, correction: 23, erasure: 18, file_complaint: 12, withdraw_consent: 8, grievance_redressal: 5, nominate: 2 },
  { name: "Week 2", access: 52, correction: 28, erasure: 22, file_complaint: 15, withdraw_consent: 12, grievance_redressal: 8, nominate: 4 },
  { name: "Week 3", access: 48, correction: 25, erasure: 25, file_complaint: 18, withdraw_consent: 15, grievance_redressal: 12, nominate: 6 },
  { name: "Week 4", access: 61, correction: 32, erasure: 28, file_complaint: 22, withdraw_consent: 18, grievance_redressal: 15, nominate: 9 },
];

const workflowStatus = [
  { stage: "Received", count: 89, color: "bg-muted-foreground" },
  { stage: "Verified", count: 67, color: "bg-info" },
  { stage: "In Review", count: 45, color: "bg-warning" },
  { stage: "Action Taken", count: 23, color: "bg-primary" },
  { stage: "Completed", count: 1089, color: "bg-success" },
];

const slaBySeverity = [
  { level: "Critical", count: 3, breached: 2, percentage: 33 },
  { level: "Urgent", count: 12, breached: 4, percentage: 67 },
  { level: "Normal", count: 74, breached: 2, percentage: 97 },
];

// PHASE 5 CHANGE
const SectionDivider = ({ label, action }: { label: string; action: React.ReactNode }) => {
  return (
    <div className="relative my-8">
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <hr className="w-full border-t border-muted" />
      </div>
      <div className="relative flex justify-between items-center bg-transparent">
        <span className="bg-background pr-3 text-lg font-semibold text-foreground z-10">
          {label}
        </span>
        <div className="bg-background pl-3 z-10">
          {action}
        </div>
      </div>
    </div>
  );
};

// PHASE 5 CHANGE
const AnalyticsSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardContent className="h-24 bg-muted/30 rounded" />
        </Card>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="h-80 bg-muted/10" />
      <Card className="h-80 bg-muted/10" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="h-96 bg-muted/10" />
      <Card className="h-96 bg-muted/10" />
    </div>
  </div>
);

export function RightsDashboard() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [metricsData, setMetricsData] = useState<any>(null);

  // PHASE 5 CHANGE
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);
  const [isRefreshingAnalytics, setIsRefreshingAnalytics] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const data = await rightsService.getMetrics();
      setMetricsData(data);
    } catch (error) {
      handleApiError(error, 'Rights Dashboard');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // PHASE 5 CHANGE
  const fetchAnalytics = async () => {
    try {
      setIsLoadingAnalytics(true);
      const data = await rightsService.getAnalytics();
      setAnalyticsData(data);
    } catch (error) {
      handleApiError(error, 'Rights Analytics');
    } finally {
      setIsLoadingAnalytics(false);
      setIsRefreshingAnalytics(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchAnalytics(); // PHASE 5 CHANGE
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  // PHASE 5 CHANGE
  const handleRefreshAnalytics = () => {
    setIsRefreshingAnalytics(true);
    fetchAnalytics();
  };

  if (isLoading && !metricsData) {
    return <div className="h-48 flex items-center justify-center">Loading dashboard...</div>;
  }

  const { metrics = {}, breakdown = {}, breakdownChart = [] } = metricsData || {};

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Refresh Button */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Primary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          title="Total Requests"
          value={metrics.total?.toLocaleString() || "0"}
          icon={<Scale className="h-6 w-6" />}
          trend={{ value: 12, direction: "up", label: "vs last month" }}
        />
        <KPICard
          title="New This Week"
          value={metrics.newThisWeek || 0}
          icon={<TrendingUp className="h-6 w-6" />}
          trend={{ value: 8, direction: "up" }}
          variant="info"
        />
        <KPICard
          title="Pending"
          value={metrics.pending || 0}
          icon={<Clock className="h-6 w-6" />}
          variant="warning"
        />
        <KPICard
          title="Completed"
          value={metrics.completed?.toLocaleString() || "0"}
          icon={<CheckCircle className="h-6 w-6" />}
          variant="success"
          trend={{ value: 15, direction: "up" }}
        />
        <KPICard
          title="SLA Breaches"
          value={metrics.slaBreaches || 0}
          icon={<AlertTriangle className="h-6 w-6" />}
          variant="destructive"
          trend={{ value: 25, direction: "down", label: "improvement" }}
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="SLA Compliance"
          value={`${metrics.slaCompliance || 0}%`}
          icon={<CheckCircle className="h-6 w-6" />}
          variant="success"
        />
        <KPICard
          title="Avg Resolution"
          value={`${metrics.avgResolutionDays || 0} days`}
          icon={<Timer className="h-6 w-6" />}
          trend={{ value: 10, direction: "down", label: "faster" }}
          variant="info"
        />
        <KPICard
          title="Rejected"
          value={metrics.rejected || 0}
          icon={<XCircle className="h-6 w-6" />}
        />
        <KPICard
          title="New Today"
          value={metrics.newToday || 0}
          icon={<FileText className="h-6 w-6" />}
          variant="info"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConsentDonutChart
          data={breakdownChart}
          title="Rights Requests Type Distribution"
        />
        <ConsentDonutChart
          data={metricsData?.regulationBreakdown && metricsData.regulationBreakdown.length > 0 ? metricsData.regulationBreakdown : regulationBreakdown}
          title="By Regulation"
        />
      </div>

      {/* Trend & Workflow */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrendLineChart
          data={metricsData?.trendData && metricsData.trendData.length > 0 ? metricsData.trendData : trendData}
          title="Rights Requests Trend (Last 4 Weeks)"
          lines={[
            { dataKey: "file_complaint", color: "hsl(12, 76%, 61%)", label: "Complaint" },
            { dataKey: "withdraw_consent", color: "hsl(38, 92%, 50%)", label: "Withdraw" },
            { dataKey: "access", color: "hsl(217, 91%, 50%)", label: "Access" },
            { dataKey: "correction", color: "hsl(142, 76%, 36%)", label: "Correction" },
            { dataKey: "erasure", color: "hsl(0, 72%, 51%)", label: "Erasure" },
            { dataKey: "grievance_redressal", color: "hsl(262, 83%, 58%)", label: "Grievance" },
            { dataKey: "nominate", color: "hsl(199, 89%, 48%)", label: "Nominate" },
          ]}
        />

        <div className="dashboard-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">Workflow Pipeline</h3>
          <div className="space-y-4">
            {(metricsData?.workflowStatus && metricsData.workflowStatus.length > 0 ? metricsData.workflowStatus : workflowStatus).map((item: any, index: number, arr: any[]) => (
              <div key={item.stage} className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-full ${item.color} flex items-center justify-center text-white font-semibold text-sm`}>
                  {item.count}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{item.stage}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.count} requests
                  </p>
                </div>
                {index < arr.length - 1 && (
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SLA by Priority */}
      <div className="dashboard-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">SLA Compliance by Priority</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(metricsData?.slaByPriority && metricsData.slaByPriority.length > 0 ? metricsData.slaByPriority : slaBySeverity).map((item: any) => (
            <Card key={item.level} className="border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  <span>{item.level} Priority</span>
                  <Badge variant={item.percentage >= 90 ? "default" : item.percentage >= 70 ? "secondary" : "destructive"}>
                    {item.percentage}% On Track
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Requests</span>
                    <span className="font-medium">{item.count}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">SLA Breached</span>
                    <span className="font-medium text-destructive">{item.breached}</span>
                  </div>
                  <Progress
                    value={item.percentage}
                    className={`h-2 mt-2 ${item.percentage >= 90 ? "[&>div]:bg-success" :
                      item.percentage >= 70 ? "[&>div]:bg-warning" :
                        "[&>div]:bg-destructive"
                      }`}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Rights Type Breakdown Grid */}
      <div className="dashboard-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">Detailed Rights Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(breakdown).map(([key, value]) => {
            const info = RIGHTS_TYPE_INFO[key as keyof typeof RIGHTS_TYPE_INFO];
            return (
              <div key={key} className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  {key === 'file_complaint' && <FileText className="h-4 w-4 text-warning" />}
                  {key === 'withdraw_consent' && <XCircle className="h-4 w-4 text-warning" />}
                  {key === 'access' && <Eye className="h-4 w-4 text-primary" />}
                  {key === 'correction' && <Edit className="h-4 w-4 text-success" />}
                  {key === 'erasure' && <Trash2 className="h-4 w-4 text-destructive" />}
                  {key === 'grievance_redressal' && <AlertTriangle className="h-4 w-4 text-info" />}
                  {key === 'nominate' && <CheckCircle className="h-4 w-4 text-primary" />}
                  <span className="text-xs text-muted-foreground truncate">{info?.label || key}</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{value as React.ReactNode}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Visual Divider with own refresh button */}
      {/* // PHASE 5 CHANGE */}
      <SectionDivider
        label="Analytics & Insights"
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshAnalytics}
            disabled={isRefreshingAnalytics || isLoadingAnalytics}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshingAnalytics ? "animate-spin" : ""}`} />
            Refresh Analytics
          </Button>
        }
      />

      {/* Analytics Section Wrapper with id="analytics" */}
      {/* // PHASE 5 CHANGE */}
      <div id="analytics" className="space-y-6 scroll-mt-6">
        {isLoadingAnalytics && !analyticsData ? (
          <AnalyticsSkeleton />
        ) : (() => {
          const {
            summary = {},
            monthlyTrend = [],
            applicationRisks = [],
            repeatRequesters = [],
            fulfilmentByType = [],
            abuseIndicators = [],
            typeDistribution = [],
          } = analyticsData || {};

          return (
            <>
              {/* Section F — Analytics KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Overall Fulfilment Rate</p>
                        <p className="text-3xl font-bold text-success">{summary.fulfilmentRate || 0}%</p>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                        <CheckCircle className="h-6 w-6 text-success" />
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-sm text-success">
                      <TrendingUp className="h-4 w-4" />
                      <span>+2.1% vs last month</span>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Avg Resolution Time</p>
                        <p className="text-3xl font-bold text-primary">{summary.avgResolutionDays || 0} days</p>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Clock className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-sm text-success">
                      <TrendingDown className="h-4 w-4" />
                      <span>-0.8 days vs last month</span>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total SLA Breaches</p>
                        <p className="text-3xl font-bold text-destructive">{summary.totalSlaBreaches || 0}</p>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                        <AlertTriangle className="h-6 w-6 text-destructive" />
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-sm text-success">
                      <TrendingDown className="h-4 w-4" />
                      <span>-35% vs last month</span>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Repeat Requests</p>
                        <p className="text-3xl font-bold text-warning">{summary.repeatRequests || 0}</p>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center">
                        <RefreshCw className="h-6 w-6 text-warning" />
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                      <Activity className="h-4 w-4" />
                      <span>3.8% of total</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Section G — Charts Row 2 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TrendLineChart
                  data={monthlyTrend}
                  title="Rights Requests by Regulation (6 Months)"
                  lines={[
                    { dataKey: "gdpr", color: REGULATION_INFO.gdpr.color, label: "GDPR" },
                    { dataKey: "dpdp", color: REGULATION_INFO.dpdp.color, label: "DPDP" },
                    { dataKey: "ccpa", color: REGULATION_INFO.ccpa.color, label: "CCPA" },
                    { dataKey: "lgpd", color: REGULATION_INFO.lgpd.color, label: "LGPD" },
                  ]}
                />
                <ConsentDonutChart
                  data={typeDistribution}
                  title="Request Type Distribution"
                />
              </div>

              {/* Section H — Risk Panels */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2 font-semibold">
                      <Building className="h-5 w-5 text-primary" />
                      High-Risk Applications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {applicationRisks
                        ?.slice()
                        .sort((a: any, b: any) => b.riskScore - a.riskScore)
                        .slice(0, 5)
                        .map((app: any) => (
                          <div key={app.name} className="flex items-center gap-4">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1 text-sm">
                                <span className="font-medium">{app.name}</span>
                                <Badge variant={app.riskScore > 30 ? "destructive" : app.riskScore > 15 ? "secondary" : "outline"}>
                                  Risk: {app.riskScore}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>{app.requests} requests</span>
                                <span className="text-destructive font-medium">{app.slaBreaches} SLA breaches</span>
                              </div>
                              <Progress
                                value={app.riskScore}
                                className={`h-1.5 mt-2 ${app.riskScore > 30 ? "[&>div]:bg-destructive" :
                                  app.riskScore > 15 ? "[&>div]:bg-warning" :
                                    "[&>div]:bg-success"
                                  }`}
                              />
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2 font-semibold">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      Fulfilment Rate by Type
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {fulfilmentByType.map((item: any) => (
                        <div key={item.name} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{item.name}</span>
                            <span className={`font-semibold ${item.value >= 96 ? "text-success" :
                              item.value >= 90 ? "text-warning" :
                                "text-destructive"
                              }`}>
                              {item.value}%
                            </span>
                          </div>
                          <Progress
                            value={item.value}
                            className={`h-1.5 ${item.value >= 96 ? "[&>div]:bg-success" :
                              item.value >= 90 ? "[&>div]:bg-warning" :
                                "[&>div]:bg-destructive"
                              }`}
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Section I — Abuse + Repeat */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2 font-semibold">
                      <Shield className="h-5 w-5 text-primary" />
                      Abuse Detection Indicators
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {abuseIndicators.map((item: any) => (
                        <div key={item.indicator} className="flex items-center justify-between p-3 rounded-lg border text-sm">
                          <div className="flex items-center gap-3">
                            <AlertTriangle className={`h-5 w-5 ${item.trend === "up" ? "text-destructive" :
                              item.trend === "down" ? "text-success" :
                                "text-warning"
                              }`} />
                            <span>{item.indicator}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{item.count}</span>
                            {item.trend === "up" ? (
                              <TrendingUp className="h-4 w-4 text-destructive animate-pulse" />
                            ) : item.trend === "down" ? (
                              <TrendingDown className="h-4 w-4 text-success" />
                            ) : (
                              <Activity className="h-4 w-4 text-warning" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2 font-semibold">
                      <Users className="h-5 w-5 text-primary" />
                      Repeat Requesters
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto text-sm">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead className="text-right">Requests</TableHead>
                            <TableHead>Last Request</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {repeatRequesters.map((user: any) => (
                            <TableRow key={user.id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium text-foreground">{user.name}</p>
                                  <p className="text-xs text-muted-foreground">{user.id}</p>
                                </div>
                              </TableCell>
                              <TableCell className="text-right font-semibold">{user.requests}</TableCell>
                              <TableCell className="text-muted-foreground text-xs">{user.lastRequest}</TableCell>
                              <TableCell>
                                <Badge variant={
                                  user.status === "Flag" ? "destructive" :
                                    user.status === "Monitor" ? "secondary" :
                                      "outline"
                                }>
                                  {user.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
}
