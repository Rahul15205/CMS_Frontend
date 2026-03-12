import { DashboardLayout, PageSection, SectionTitle } from "@/components/layout/DashboardLayout";
import { KPICard } from "@/components/dashboard/KPICard";
import { TrendLineChart } from "@/components/charts/TrendLineChart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  BarChart3,
  FileCheck,
  Scale,
  MessageSquareWarning,
  Shield,
  Download,
  Calendar,
  Plus,
  FileText,
  TrendingUp,
} from "lucide-react";
import { useState, useEffect } from "react";
import { reportsService } from "@/services/reportsLogsSecurityService";
import { dashboardService } from "@/services/dashboardService";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";

const reportTrends = [
  { name: "Jan", consent: 12, rights: 8, grievance: 4, compliance: 2 },
  { name: "Feb", consent: 15, rights: 10, grievance: 5, compliance: 3 },
  { name: "Mar", consent: 18, rights: 12, grievance: 6, compliance: 4 },
  { name: "Apr", consent: 14, rights: 9, grievance: 3, compliance: 2 },
  { name: "May", consent: 20, rights: 15, grievance: 7, compliance: 5 },
  { name: "Jun", consent: 22, rights: 14, grievance: 5, compliance: 4 },
];

const reportTypeMapping = [
  {
    id: "CONSENT",
    title: "Consent Reports",
    description: "Consent collection, status, and lifecycle analytics",
    icon: FileCheck,
  },
  {
    id: "RIGHTS",
    title: "Rights Fulfilment Reports",
    description: "Data principal rights request processing metrics",
    icon: Scale,
  },
  {
    id: "AUDIT",
    title: "Audit Reports",
    description: "Detailed system audit and log analytics",
    icon: MessageSquareWarning,
  },
  {
    id: "COMPLIANCE",
    title: "Compliance Reports",
    description: "Overall DPDP Act compliance status and audit trails",
    icon: Shield,
  },
];

export default function Reports() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  
  const { data: trendsData } = useQuery({
    queryKey: ["dashboard-trends"],
    queryFn: () => dashboardService.getChartData("trends"),
  });

  const liveTrends = trendsData?.data || [];

  const [generateForm, setGenerateForm] = useState({
    name: "",
    reportType: "CONSENT",
    startDate: "",
    endDate: "",
    format: "PDF"
  });

  const fetchReports = async () => {
    setLoading(true);
    try {
      const result = await reportsService.getAll();
      if (result && result.data) {
        setReports(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch reports", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleGenerate = async () => {
    if (!generateForm.name) {
      toast({
        title: "Validation Error",
        description: "Please provide a name for the report.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      await reportsService.create({
        name: generateForm.name,
        reportType: generateForm.reportType,
        format: generateForm.format,
        parameters: {
          startDate: generateForm.startDate,
          endDate: generateForm.endDate
        }
      });
      toast({
        title: "Success",
        description: "Report generation started successfully."
      });
      fetchReports();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate report.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Compute metrics
  const getCountByType = (type: string) => reports.filter(r => r.reportType === type).length;
  const getLastGeneratedByType = (type: string) => {
    const typeReports = reports.filter(r => r.reportType === type);
    if (typeReports.length === 0) return "Never";
    const latest = typeReports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    return format(new Date(latest.createdAt), "yyyy-MM-dd");
  };
  return (
    <DashboardLayout
      title="Reports"

      actions={
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Generate Report</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Generate Report</TooltipContent>
        </Tooltip>
      }
    >
      {/* KPI Cards */}
      <PageSection className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <KPICard key={i} title="Loading..." value="..." icon={<Skeleton className="h-6 w-6" />} />
            ))
          ) : (
            <>
              <KPICard
                title="Consent Reports"
                value={getCountByType("CONSENT").toString()}
                icon={<FileCheck className="h-6 w-6" />}
                className="h-full"
              />
              <KPICard
                title="Rights Reports"
                value={getCountByType("RIGHTS").toString()}
                icon={<Scale className="h-6 w-6" />}
                className="h-full"
              />
              <KPICard
                title="Audit Reports"
                value={getCountByType("AUDIT").toString()}
                icon={<MessageSquareWarning className="h-6 w-6" />}
                className="h-full"
              />
              <KPICard
                title="Compliance Reports"
                value={getCountByType("COMPLIANCE").toString()}
                icon={<Shield className="h-6 w-6" />}
                variant="success"
                className="h-full"
              />
            </>
          )}
        </div>
      </PageSection>

      {/* Report Generation & Trends */}
      <PageSection className="mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Quick Generate */}
          <div className="dashboard-card lg:h-full flex flex-col">
            <SectionTitle>Quick Generate</SectionTitle>
            <div className="mt-4 space-y-4 flex-grow">
              <div className="space-y-2">
                <Label>Report Name</Label>
                <Input 
                  placeholder="Monthly Compliance" 
                  value={generateForm.name}
                  onChange={(e) => setGenerateForm({ ...generateForm, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Report Type</Label>
                <Select 
                  value={generateForm.reportType}
                  onValueChange={(val) => setGenerateForm({ ...generateForm, reportType: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CONSENT">Consent Report</SelectItem>
                    <SelectItem value="RIGHTS">Rights Fulfilment Report</SelectItem>
                    <SelectItem value="AUDIT">Audit Report</SelectItem>
                    <SelectItem value="COMPLIANCE">Compliance Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      type="date" 
                      className="pl-9" 
                      value={generateForm.startDate}
                      onChange={(e) => setGenerateForm({ ...generateForm, startDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      type="date" 
                      className="pl-9" 
                      value={generateForm.endDate}
                      onChange={(e) => setGenerateForm({ ...generateForm, endDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Format</Label>
                <Select 
                  value={generateForm.format}
                  onValueChange={(val) => setGenerateForm({ ...generateForm, format: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PDF">PDF</SelectItem>
                    <SelectItem value="CSV">CSV</SelectItem>
                    <SelectItem value="XLSX">Excel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                className="w-full mt-auto" 
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? "Generating..." : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Generate & Download
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Trends Chart */}
          <div className="lg:col-span-2 lg:h-full">
            <TrendLineChart
              data={liveTrends.length > 0 ? liveTrends : reportTrends}
              lines={[
                { dataKey: "active", color: "hsl(142, 76%, 36%)", label: "Consents" },
                { dataKey: "rights", color: "hsl(199, 89%, 48%)", label: "Rights" },
                { dataKey: "grievances", color: "hsl(262, 83%, 58%)", label: "Grievances" },
              ]}
              title="Global Activity Trends"
            />
          </div>
        </div>
      </PageSection>

      {/* Report Type Cards */}
      <PageSection>
        <div className="dashboard-card">
          <SectionTitle>Report Categories</SectionTitle>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <Card key={i} className="hover:shadow-card-hover transition-shadow">
                  <CardHeader className="pb-3">
                    <Skeleton className="h-10 w-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))
            ) : (
              reportTypeMapping.map((report) => {
                const Icon = report.icon;
                const count = getCountByType(report.id);
                const lastGenerated = getLastGeneratedByType(report.id);
                
                return (
                  <Card key={report.id} className="hover:shadow-card-hover transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{report.title}</CardTitle>
                            <CardDescription className="text-xs mt-0.5">
                              {count} reports generated
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {report.description}
                      </p>
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                        <span>Last generated</span>
                        <span className="font-medium text-foreground">{lastGenerated}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <FileText className="h-4 w-4 mr-1" />
                          View All
                        </Button>
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => {
                            setGenerateForm({ ...generateForm, reportType: report.id });
                            toast({ title: "Quick Generate", description: `Selected ${report.title} for generation.` });
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Select
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </PageSection>
    </DashboardLayout>
  );
}
