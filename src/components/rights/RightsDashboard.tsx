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
  Scale,
  Clock,
  CheckCircle,
  AlertTriangle,
  Timer,
  TrendingUp,
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
} from "lucide-react";
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

export function RightsDashboard() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [metricsData, setMetricsData] = useState<any>(null);

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

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData();
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
    </div>
  );
}
