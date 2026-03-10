import { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertTriangle,
  Calendar,
  Download,
  Filter,
  PieChart,
  Activity,
} from "lucide-react";
import { useDashboard } from "@/contexts/DashboardContext";
import { useQuery } from "@tanstack/react-query";
import { consentService } from "@/services/consentService";
import type { ConsentAnalyticsData } from "./types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// Mock analytics data
const consentTrendData = [
  { month: "Jan", active: 4500, rejected: 450, withdrawn: 120, expired: 200, pending: 300 },
  { month: "Feb", active: 5200, rejected: 380, withdrawn: 150, expired: 180, pending: 320 },
  { month: "Mar", active: 6100, rejected: 420, withdrawn: 180, expired: 150, pending: 280 },
  { month: "Apr", active: 5800, rejected: 510, withdrawn: 210, expired: 220, pending: 350 },
  { month: "May", active: 7200, rejected: 390, withdrawn: 170, expired: 160, pending: 310 },
  { month: "Jun", active: 8100, rejected: 450, withdrawn: 200, expired: 190, pending: 290 },
  { month: "Jul", active: 8500, rejected: 480, withdrawn: 230, expired: 210, pending: 330 },
  { month: "Aug", active: 9200, rejected: 520, withdrawn: 250, expired: 240, pending: 360 },
  { month: "Sep", active: 9800, rejected: 490, withdrawn: 220, expired: 230, pending: 340 },
  { month: "Oct", active: 10500, rejected: 550, withdrawn: 280, expired: 260, pending: 380 },
  { month: "Nov", active: 11200, rejected: 580, withdrawn: 300, expired: 280, pending: 400 },
  { month: "Dec", active: 12450, rejected: 620, withdrawn: 320, expired: 310, pending: 420 },
];

const reconsentData = [
  { template: "Marketing Consent", sent: 5000, completed: 4200, rate: 84 },
  { template: "Analytics Consent", sent: 3200, completed: 2800, rate: 87.5 },
  { template: "Third-Party Sharing", sent: 1500, completed: 1100, rate: 73.3 },
  { template: "Essential Service", sent: 8000, completed: 7800, rate: 97.5 },
];

const consentByTypeData = [
  { name: "Explicit Consent", value: 35, color: "hsl(var(--primary))" },
  { name: "Implicit Consent", value: 10, color: "hsl(280, 65%, 60%)" }, // Purple-ish
  { name: "Optional Consent", value: 20, color: "hsl(var(--success))" },
  { name: "Granular Consent", value: 10, color: "hsl(var(--info))" },
  { name: "Mandatory Consent", value: 15, color: "hsl(var(--warning))" },
  { name: "Parental Consent", value: 10, color: "hsl(340, 75%, 55%)" }, // Pink
];

const fatigueIndicators = [
  {
    metric: "Multiple Consent Requests",
    value: 23,
    threshold: 30,
    status: "healthy",
    description: "Users receiving 3+ consent requests in 30 days",
  },
  {
    metric: "Rapid Decline Rate",
    value: 12,
    threshold: 15,
    status: "healthy",
    description: "Users declining within 2 seconds",
  },
  {
    metric: "Re-consent Abandonment",
    value: 28,
    threshold: 25,
    status: "warning",
    description: "Incomplete re-consent flows",
  },
  {
    metric: "Immediate Withdrawal",
    value: 5,
    threshold: 10,
    status: "healthy",
    description: "Withdrawals within 24 hours of consent",
  },
];

export function ConsentAnalytics() {
  const [dateRange, setDateRange] = useState("6months");
  const [templateFilter, setTemplateFilter] = useState("all");
  const { config } = useDashboard();
  
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["consent-analytics"],
    queryFn: () => consentService.getAnalytics(),
  });

  const getWidget = (id: string) => config.widgets.find(w => w.id === id);
  const isEnabled = (id: string) => getWidget(id)?.enabled ?? false;

  const handleExportPDF = async () => {
    const element = document.getElementById("consent-dashboard");
    if (!element) return;

    const canvas = await html2canvas(element, {
      scale: 2, // Higher resolution
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth - 20; // 10mm margin each side
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Add Metadata
    const requestorName = "Admin User";
    const requestDate = new Date().toLocaleString();
    const ipAddress = "192.168.1.101"; // Mock IP

    pdf.setFontSize(10);
    pdf.setTextColor(100);
    pdf.text(`Requestor: ${requestorName}`, 10, 10);
    pdf.text(`Date & Time: ${requestDate}`, 10, 15);
    pdf.text(`IP Address: ${ipAddress}`, 10, 20);

    // Add Image
    pdf.addImage(imgData, "PNG", 10, 25, imgWidth, imgHeight);
    pdf.save(`consent-report-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const handleExportCSV = () => {
    const requestorName = "Admin User";
    const requestDate = new Date().toLocaleString();
    const ipAddress = "192.168.1.101";

    const csvRows = [];

    // Metadata
    csvRows.push(["Report Type", "Consent Management Export"]);
    csvRows.push(["Requestor", requestorName]);
    csvRows.push(["Date & Time", requestDate]);
    csvRows.push(["IP Address", ipAddress]);
    csvRows.push([]); // Empty line

    // Consent Trend Data
    csvRows.push(["Consent Trends"]);
    csvRows.push(["Month", "Active", "Rejected", "Withdrawn", "Expired", "Pending"]);
    consentTrendData.forEach(row => {
      csvRows.push([row.month, row.active, row.rejected, row.withdrawn, row.expired, row.pending]);
    });
    csvRows.push([]);

    // Re-consent Data
    csvRows.push(["Re-consent Success Rates"]);
    csvRows.push(["Template", "Sent", "Completed", "Success Rate (%)"]);
    reconsentData.forEach(row => {
      csvRows.push([row.template, row.sent, row.completed, row.rate]);
    });
    csvRows.push([]);

    // Fatigue Indicators
    csvRows.push(["Consent Fatigue Indicators"]);
    csvRows.push(["Metric", "Value (%)", "Threshold (%)", "Status", "Description"]);
    fatigueIndicators.forEach(row => {
      csvRows.push([row.metric, row.value, row.threshold, row.status, row.description]);
    });

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `consent_report_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate summary metrics from live analytics
  const totalActive = analytics?.records.byStatus["ACTIVE"] || 0;
  const totalRejected = analytics?.records.byStatus["REJECTED"] || 0;
  const totalWithdrawn = analytics?.records.byStatus["WITHDRAWN"] || 0;
  const totalRecords = analytics?.records.total || 0;
  const acceptanceRate = totalRecords > 0 ? Math.round((totalActive / totalRecords) * 100) : 0;
  const withdrawalRate = totalActive > 0 ? Math.round((totalWithdrawn / totalActive) * 100) : 0;

  // Map backend types to pie chart format
  const consentByTypeData = analytics ? Object.entries(analytics.templates.byType).map(([name, value], index) => ({
    name: name.charAt(0) + name.slice(1).toLowerCase(),
    value: Math.round((value / analytics.templates.total) * 100),
    color: index === 0 ? "hsl(var(--primary))" : 
           index === 1 ? "hsl(280, 65%, 60%)" :
           index === 2 ? "hsl(var(--success))" :
           index === 3 ? "hsl(var(--info))" :
           index === 4 ? "hsl(var(--warning))" :
           "hsl(340, 75%, 55%)"
  })) : [];

  return (
    <div id="consent-dashboard" className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={templateFilter} onValueChange={setTemplateFilter}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Template" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Templates</SelectItem>
              <SelectItem value="marketing">Marketing Consent</SelectItem>
              <SelectItem value="analytics">Analytics Consent</SelectItem>
              <SelectItem value="sharing">Third-Party Sharing</SelectItem>
              <SelectItem value="essential">Essential Service</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleExportPDF}>
              Export as PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportCSV}>
              Export as CSV
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isEnabled("ca-kpi-active") && (
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-success/10 text-success">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalActive.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Total Active</p>
                  </div>
                </div>
                <Badge className="bg-success/10 text-success border-success/20">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12%
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}
        {isEnabled("ca-kpi-rejected") && (
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
                    <XCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalRejected.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Total Rejected</p>
                  </div>
                </div>
                <Badge className="bg-success/10 text-success border-success/20">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  -5%
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}
        {isEnabled("ca-kpi-withdrawn") && (
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-warning/10 text-warning">
                    <RefreshCw className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalWithdrawn.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Total Withdrawn</p>
                  </div>
                </div>
                <Badge className="bg-warning/10 text-warning border-warning/20">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +8%
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}
        {isEnabled("ca-kpi-rate") && (
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{acceptanceRate}%</p>
                    <p className="text-xs text-muted-foreground">Acceptance Rate</p>
                  </div>
                </div>
                <Badge className="bg-success/10 text-success border-success/20">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +3%
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Consent Trend Chart */}
        {isEnabled("ca-chart-trend") && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Consent Trend Over Time
              </CardTitle>
              <CardDescription>Agreement, decline, and withdrawal trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={consentTrendData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="active"
                      stackId="1"
                      stroke="hsl(142, 76%, 36%)"
                      fill="hsl(142, 76%, 36%)"
                      fillOpacity={0.3}
                      name="Active"
                    />
                    <Area
                      type="monotone"
                      dataKey="expired"
                      stackId="1"
                      stroke="hsl(38, 92%, 50%)"
                      fill="hsl(38, 92%, 50%)"
                      fillOpacity={0.3}
                      name="Expired"
                    />
                    <Area
                      type="monotone"
                      dataKey="withdrawn"
                      stackId="1"
                      stroke="hsl(0, 72%, 51%)"
                      fill="hsl(0, 72%, 51%)"
                      fillOpacity={0.3}
                      name="Withdrawn"
                    />
                    <Area
                      type="monotone"
                      dataKey="rejected"
                      stackId="1"
                      stroke="hsl(262, 83%, 58%)"
                      fill="hsl(262, 83%, 58%)"
                      fillOpacity={0.3}
                      name="Rejected"
                    />
                    <Area
                      type="monotone"
                      dataKey="pending"
                      stackId="1"
                      stroke="hsl(199, 89%, 48%)"
                      fill="hsl(199, 89%, 48%)"
                      fillOpacity={0.3}
                      name="Pending"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Consent by Type Pie Chart */}
        {isEnabled("ca-chart-type") && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <PieChart className="h-4 w-4" />
                Consent by Type
              </CardTitle>
              <CardDescription>Distribution across consent types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={consentByTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {consentByTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                      formatter={(value: number) => [`${value}%`, ""]}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value) => <span className="text-sm text-muted-foreground">{value}</span>}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-12">
                  <p className="text-3xl font-bold text-foreground">100%</p>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Re-consent Success Rate */}
      {isEnabled("ca-list-reconsent") && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Re-consent Success Rate
            </CardTitle>
            <CardDescription>
              Completion rates for re-consent requests by template
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reconsentData.map((item) => (
                <div key={item.template} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.template}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground">
                        {item.completed.toLocaleString()} / {item.sent.toLocaleString()}
                      </span>
                      <Badge
                        className={
                          item.rate >= 90
                            ? "bg-success/10 text-success border-success/20"
                            : item.rate >= 75
                              ? "bg-warning/10 text-warning border-warning/20"
                              : "bg-destructive/10 text-destructive border-destructive/20"
                        }
                      >
                        {item.rate}%
                      </Badge>
                    </div>
                  </div>
                  <Progress value={item.rate} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Consent Fatigue Indicators */}
      {isEnabled("ca-list-fatigue") && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Consent Fatigue Indicators
            </CardTitle>
            <CardDescription>
              Early warning signals that may indicate user consent fatigue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {fatigueIndicators.map((indicator) => (
                <div
                  key={indicator.metric}
                  className={`p-4 rounded-lg border ${indicator.status === "warning"
                    ? "bg-warning/5 border-warning/20"
                    : "bg-success/5 border-success/20"
                    }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold">{indicator.value}%</span>
                    {indicator.status === "warning" ? (
                      <Badge className="bg-warning/10 text-warning border-warning/20">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Warning
                      </Badge>
                    ) : (
                      <Badge className="bg-success/10 text-success border-success/20">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Healthy
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm font-medium">{indicator.metric}</p>
                  <p className="text-xs text-muted-foreground mt-1">{indicator.description}</p>
                  <div className="mt-2">
                    <Progress
                      value={(indicator.value / indicator.threshold) * 100}
                      className={`h-1 ${indicator.status === "warning" ? "[&>div]:bg-warning" : ""}`}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Threshold: {indicator.threshold}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Withdrawal Trend Analysis */}
      {isEnabled("ca-chart-withdrawal") && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Withdrawal Trend Analysis
            </CardTitle>
            <CardDescription>
              Monthly withdrawal patterns across consent templates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={consentTrendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar
                    dataKey="withdrawn"
                    fill="hsl(0, 72%, 51%)"
                    radius={[4, 4, 0, 0]}
                    name="Withdrawals"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
