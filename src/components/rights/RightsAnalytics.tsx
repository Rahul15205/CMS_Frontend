import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ConsentDonutChart } from "@/components/charts/ConsentDonutChart";
import { TrendLineChart } from "@/components/charts/TrendLineChart";
import { BarChartHorizontal } from "@/components/charts/BarChartHorizontal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  Activity,
  Shield,
  Globe,
  Building,
  Users,
  RefreshCw,
} from "lucide-react";
import { REGULATION_INFO } from "./types";
import { useState, useEffect } from "react";
import { rightsService } from "@/services/rightsService";
import { handleApiError } from "@/lib/errorHandler";

export function RightsAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const data = await rightsService.getAnalytics();
      setAnalyticsData(data);
    } catch (error) {
      handleApiError(error, 'Rights Analytics');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchAnalytics();
  };

  if (isLoading && !analyticsData) {
    return <div className="h-64 flex items-center justify-center">Loading analytics...</div>;
  }

  const {
    summary = {},
    regulationMetrics = [],
    monthlyTrend = [],
    applicationRisks = [],
    repeatRequesters = [],
    fulfilmentByType = [],
    abuseIndicators = [],
    typeDistribution = [],
  } = analyticsData || {};

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-end mb-4">
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing || isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh Analytics
        </Button>
      </div>
      {/* Summary Cards */}
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

      {/* Charts Row 1 */}
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



      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Application Risk Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              High-Risk Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {applicationRisks.sort((a, b) => b.riskScore - a.riskScore).slice(0, 5).map((app) => (
                <div key={app.name} className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{app.name}</span>
                      <Badge variant={app.riskScore > 30 ? "destructive" : app.riskScore > 15 ? "secondary" : "outline"}>
                        Risk: {app.riskScore}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{app.requests} requests</span>
                      <span className="text-destructive">{app.slaBreaches} SLA breaches</span>
                    </div>
                    <Progress
                      value={app.riskScore}
                      className={`h-2 mt-2 ${app.riskScore > 30 ? "[&>div]:bg-destructive" :
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

        {/* Fulfilment Rate by Type */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Fulfilment Rate by Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {fulfilmentByType.map((item) => (
                <div key={item.name} className="space-y-2">
                  <div className="flex items-center justify-between">
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
                    className={`h-2 ${item.value >= 96 ? "[&>div]:bg-success" :
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

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Abuse Detection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Abuse Detection Indicators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {abuseIndicators.map((item) => (
                <div key={item.indicator} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className={`h-5 w-5 ${item.trend === "up" ? "text-destructive" :
                      item.trend === "down" ? "text-success" :
                        "text-warning"
                      }`} />
                    <span className="text-sm">{item.indicator}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{item.count}</span>
                    {item.trend === "up" ? (
                      <TrendingUp className="h-4 w-4 text-destructive" />
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

        {/* Repeat Requesters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Repeat Requesters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
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
                  {repeatRequesters.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.id}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold">{user.requests}</TableCell>
                      <TableCell className="text-muted-foreground">{user.lastRequest}</TableCell>
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
    </div>
  );
}
