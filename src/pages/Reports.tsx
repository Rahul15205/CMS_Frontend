import { useState } from "react";
import { DashboardLayout, PageSection, SectionTitle } from "@/components/layout/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import { KPICard } from "@/components/dashboard/KPICard";
import { TrendLineChart } from "@/components/charts/TrendLineChart";
import { generateReport, getEstimatedSize } from "@/lib/reportGenerator";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
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
  Loader2,
  Clock,
  X,
} from "lucide-react";

// ─── Chart data (kept as-is) ────────────────────────────────────
const reportTrends = [
  { name: "Jan", consent: 12, rights: 8, grievance: 4, compliance: 2 },
  { name: "Feb", consent: 15, rights: 10, grievance: 5, compliance: 3 },
  { name: "Mar", consent: 18, rights: 12, grievance: 6, compliance: 4 },
  { name: "Apr", consent: 14, rights: 9, grievance: 3, compliance: 2 },
  { name: "May", consent: 20, rights: 15, grievance: 7, compliance: 5 },
  { name: "Jun", consent: 22, rights: 14, grievance: 5, compliance: 4 },
];

// ─── Report category definitions ────────────────────────────────
const reportCategories = [
  {
    id: "consent",
    title: "Consent Reports",
    description: "Consent collection, status, and lifecycle analytics",
    icon: FileCheck,
  },
  {
    id: "rights",
    title: "Rights Fulfilment Reports",
    description: "Data principal rights request processing metrics",
    icon: Scale,
  },
  {
    id: "grievance",
    title: "Grievance Reports",
    description: "Grievance handling and resolution analytics",
    icon: MessageSquareWarning,
  },
  {
    id: "compliance",
    title: "Compliance Reports",
    description: "Overall DPDP Act compliance status and audit trails",
    icon: Shield,
  },
];

// ─── Generated report type ──────────────────────────────────────
interface GeneratedReport {
  id: string;
  category: string;
  title: string;
  format: string;
  generatedAt: Date;
  dateRange: string;
  size: string;
}

// ─── Initial mock report history ────────────────────────────────
const initialReports: GeneratedReport[] = [
  {
    id: "r1",
    category: "consent",
    title: "Consent Summary - Q4 2023",
    format: "pdf",
    generatedAt: new Date("2024-01-19"),
    dateRange: "Oct 2023 – Dec 2023",
    size: "124 KB",
  },
  {
    id: "r2",
    category: "consent",
    title: "Consent Analytics - Dec 2023",
    format: "csv",
    generatedAt: new Date("2024-01-05"),
    dateRange: "Dec 2023",
    size: "8 KB",
  },
  {
    id: "r3",
    category: "rights",
    title: "Rights Fulfilment - Q4 2023",
    format: "pdf",
    generatedAt: new Date("2024-01-18"),
    dateRange: "Oct 2023 – Dec 2023",
    size: "118 KB",
  },
  {
    id: "r4",
    category: "rights",
    title: "Rights Processing - Nov 2023",
    format: "excel",
    generatedAt: new Date("2023-12-01"),
    dateRange: "Nov 2023",
    size: "12 KB",
  },
  {
    id: "r5",
    category: "grievance",
    title: "Grievance Report - Q4 2023",
    format: "pdf",
    generatedAt: new Date("2024-01-17"),
    dateRange: "Oct 2023 – Dec 2023",
    size: "95 KB",
  },
  {
    id: "r6",
    category: "compliance",
    title: "DPDP Compliance Audit",
    format: "pdf",
    generatedAt: new Date("2024-01-15"),
    dateRange: "Full Year 2023",
    size: "210 KB",
  },
  {
    id: "r7",
    category: "compliance",
    title: "GDPR Compliance Status",
    format: "csv",
    generatedAt: new Date("2024-01-10"),
    dateRange: "Q4 2023",
    size: "6 KB",
  },
];

// ─── Format icon helper ─────────────────────────────────────────
const getFormatBadge = (format: string) => {
  switch (format) {
    case "pdf":
      return (
        <Badge variant="outline" className="text-destructive border-destructive/30 text-xs">
          PDF
        </Badge>
      );
    case "csv":
      return (
        <Badge variant="outline" className="text-success border-success/30 text-xs">
          CSV
        </Badge>
      );
    case "excel":
      return (
        <Badge variant="outline" className="text-success border-success/30 text-xs">
          Excel
        </Badge>
      );
    default:
      return <Badge variant="outline" className="text-xs">{format.toUpperCase()}</Badge>;
  }
};

// ─── Category title mapping ─────────────────────────────────────
const categoryTitleMap: Record<string, string> = {
  consent: "Consent",
  rights: "Rights Fulfilment",
  grievance: "Grievance",
  compliance: "Compliance",
};

// ═══════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function Reports() {
  const { toast } = useToast();

  // ─── Form State (Quick Generate) ───────────────────────────
  const [reportType, setReportType] = useState("consent");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [format, setFormat] = useState("pdf");

  // ─── UI State ──────────────────────────────────────────────
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingCards, setGeneratingCards] = useState<Set<string>>(new Set());
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [historyCategory, setHistoryCategory] = useState<string | null>(null);

  // ─── Dialog Form State ─────────────────────────────────────
  const [dialogReportType, setDialogReportType] = useState("consent");
  const [dialogStartDate, setDialogStartDate] = useState("");
  const [dialogEndDate, setDialogEndDate] = useState("");
  const [dialogFormat, setDialogFormat] = useState("pdf");
  const [isDialogGenerating, setIsDialogGenerating] = useState(false);

  // ─── Data State ────────────────────────────────────────────
  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>(initialReports);
  const [reportCounts, setReportCounts] = useState<Record<string, number>>({
    consent: 45,
    rights: 32,
    grievance: 18,
    compliance: 12,
  });
  const [lastGenerated, setLastGenerated] = useState<Record<string, string>>({
    consent: "2024-01-19",
    rights: "2024-01-18",
    grievance: "2024-01-17",
    compliance: "2024-01-15",
  });

  // ─── Total count ───────────────────────────────────────────
  const totalReports = Object.values(reportCounts).reduce((a, b) => a + b, 0);

  // ─── Generate & record report ──────────────────────────────
  const doGenerate = (
    category: string,
    fmt: string,
    start: string,
    end: string
  ) => {
    // Trigger actual file download
    generateReport(category, fmt, start || undefined, end || undefined);

    // Record the generated report
    const today = new Date().toISOString().slice(0, 10);
    const newReport: GeneratedReport = {
      id: `r-${Date.now()}`,
      category,
      title: `${categoryTitleMap[category] || category} Report - ${today}`,
      format: fmt,
      generatedAt: new Date(),
      dateRange:
        start && end ? `${start} to ${end}` : "Current Period",
      size: getEstimatedSize(fmt),
    };

    setGeneratedReports((prev) => [newReport, ...prev]);
    setReportCounts((prev) => ({
      ...prev,
      [category]: (prev[category] || 0) + 1,
    }));
    setLastGenerated((prev) => ({ ...prev, [category]: today }));
  };

  // ─── Quick Generate handler ────────────────────────────────
  const handleQuickGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      doGenerate(reportType, format, startDate, endDate);
      setIsGenerating(false);
      toast({
        title: "Report Generated & Downloaded",
        description: `${categoryTitleMap[reportType]} report downloaded as ${format.toUpperCase()}.`,
      });
    }, 1500);
  };

  // ─── Dialog Generate handler ───────────────────────────────
  const handleDialogGenerate = () => {
    setIsDialogGenerating(true);
    setTimeout(() => {
      doGenerate(dialogReportType, dialogFormat, dialogStartDate, dialogEndDate);
      setIsDialogGenerating(false);
      setShowGenerateDialog(false);
      toast({
        title: "Report Generated & Downloaded",
        description: `${categoryTitleMap[dialogReportType]} report downloaded as ${dialogFormat.toUpperCase()}.`,
      });
    }, 1500);
  };

  // ─── Card Generate handler ─────────────────────────────────
  const handleCardGenerate = (category: string) => {
    setGeneratingCards((prev) => new Set(prev).add(category));
    setTimeout(() => {
      doGenerate(category, "pdf", "", "");
      setGeneratingCards((prev) => {
        const next = new Set(prev);
        next.delete(category);
        return next;
      });
      toast({
        title: "Report Downloaded",
        description: `${categoryTitleMap[category]} report downloaded as PDF.`,
      });
    }, 1500);
  };

  // ─── View All handler ──────────────────────────────────────
  const handleViewAll = (category: string) => {
    setHistoryCategory(category);
  };

  // ─── Re-download a historical report ───────────────────────
  const handleRedownload = (report: GeneratedReport) => {
    generateReport(report.category, report.format);
    toast({
      title: "Report Re-downloaded",
      description: `"${report.title}" downloaded as ${report.format.toUpperCase()}.`,
    });
  };

  // ─── Filtered reports for history dialog ───────────────────
  const historyReports = historyCategory
    ? generatedReports.filter((r) => r.category === historyCategory)
    : [];

  // ═════════════════════════════════════════════════════════════
  //  JSX
  // ═════════════════════════════════════════════════════════════
  return (
    <>
      <DashboardLayout
        title="Reports"
        actions={
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" onClick={() => setShowGenerateDialog(true)}>
                <Plus className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Generate Report</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Generate Report</TooltipContent>
          </Tooltip>
        }
      >
        {/* ─── KPI Cards ───────────────────────────────────── */}
        <PageSection className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="Consent Reports"
              value={reportCounts.consent.toString()}
              icon={<FileCheck className="h-6 w-6" />}
              trend={{ value: 12, direction: "up" }}
              className="h-full"
            />
            <KPICard
              title="Rights Reports"
              value={reportCounts.rights.toString()}
              icon={<Scale className="h-6 w-6" />}
              trend={{ value: 8, direction: "up" }}
              className="h-full"
            />
            <KPICard
              title="Grievance Reports"
              value={reportCounts.grievance.toString()}
              icon={<MessageSquareWarning className="h-6 w-6" />}
              className="h-full"
            />
            <KPICard
              title="Compliance Reports"
              value={reportCounts.compliance.toString()}
              icon={<Shield className="h-6 w-6" />}
              variant="success"
              className="h-full"
            />
          </div>
        </PageSection>

        {/* ─── Quick Generate & Trends Chart ────────────────── */}
        <PageSection className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Quick Generate Panel */}
            <div className="dashboard-card lg:h-full flex flex-col">
              <SectionTitle>Quick Generate</SectionTitle>
              <div className="mt-4 space-y-4 flex-grow">
                <div className="space-y-2">
                  <Label>Report Type</Label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consent">Consent Report</SelectItem>
                      <SelectItem value="rights">Rights Fulfilment Report</SelectItem>
                      <SelectItem value="grievance">Grievance Report</SelectItem>
                      <SelectItem value="compliance">Compliance Report</SelectItem>
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
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
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
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Format</Label>
                  <Select value={format} onValueChange={setFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  className="w-full mt-auto"
                  onClick={handleQuickGenerate}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Generate & Download
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Trends Chart */}
            <div className="lg:col-span-3 lg:h-full">
              <TrendLineChart
                data={reportTrends}
                lines={[
                  { dataKey: "consent", color: "hsl(217, 91%, 50%)", label: "Consent" },
                  { dataKey: "rights", color: "hsl(142, 76%, 36%)", label: "Rights" },
                  { dataKey: "grievance", color: "hsl(38, 92%, 50%)", label: "Grievance" },
                  { dataKey: "compliance", color: "hsl(262, 83%, 58%)", label: "Compliance" },
                ]}
                title="Reports Generated (Last 6 Months)"
                className="lg:h-full"
              />
            </div>
          </div>
        </PageSection>

        {/* ─── Report Category Cards ─────────────────────────── */}
        <PageSection>
          <div className="dashboard-card">
            <SectionTitle>Report Categories</SectionTitle>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {reportCategories.map((report) => {
                const Icon = report.icon;
                const isCardGenerating = generatingCards.has(report.id);
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
                              {reportCounts[report.id] || 0} reports generated
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
                        <span className="font-medium text-foreground">
                          {lastGenerated[report.id] || "Never"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleViewAll(report.id)}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          View All
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handleCardGenerate(report.id)}
                          disabled={isCardGenerating}
                        >
                          {isCardGenerating ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Download className="h-4 w-4 mr-1" />
                              Generate
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </PageSection>
      </DashboardLayout>

      {/* ═══════════════════════════════════════════════════════
           GENERATE REPORT DIALOG (Header Button)
         ═══════════════════════════════════════════════════════ */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Generate New Report
            </DialogTitle>
            <DialogDescription>
              Select the report type, date range, and format to generate.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select value={dialogReportType} onValueChange={setDialogReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consent">Consent Report</SelectItem>
                  <SelectItem value="rights">Rights Fulfilment Report</SelectItem>
                  <SelectItem value="grievance">Grievance Report</SelectItem>
                  <SelectItem value="compliance">Compliance Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={dialogStartDate}
                  onChange={(e) => setDialogStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={dialogEndDate}
                  onChange={(e) => setDialogEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Format</Label>
              <Select value={dialogFormat} onValueChange={setDialogFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="excel">Excel (CSV format)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Preview info */}
            <div className="p-3 rounded-lg bg-muted/50 border text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Report</span>
                <span className="font-medium">{categoryTitleMap[dialogReportType]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Format</span>
                <span className="font-medium">{dialogFormat.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Est. Size</span>
                <span className="font-medium">{getEstimatedSize(dialogFormat)}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGenerateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleDialogGenerate} disabled={isDialogGenerating}>
              {isDialogGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Generate & Download
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════
           REPORT HISTORY DIALOG (View All Button)
         ═══════════════════════════════════════════════════════ */}
      <Dialog
        open={historyCategory !== null}
        onOpenChange={(open) => {
          if (!open) setHistoryCategory(null);
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {historyCategory
                ? `${categoryTitleMap[historyCategory]} Reports History`
                : "Report History"}
            </DialogTitle>
            <DialogDescription>
              {historyReports.length} report{historyReports.length !== 1 ? "s" : ""}{" "}
              generated for this category.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[400px] overflow-y-auto">
            {historyReports.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No reports generated yet for this category.</p>
                <Button
                  variant="link"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    setHistoryCategory(null);
                    if (historyCategory) {
                      handleCardGenerate(historyCategory);
                    }
                  }}
                >
                  Generate your first report
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {historyReports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary flex-shrink-0">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">
                          {report.title}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {report.generatedAt.toLocaleDateString()}
                          </span>
                          <span>{report.dateRange}</span>
                          <span>{report.size}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                      {getFormatBadge(report.format)}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRedownload(report)}
                      >
                        <Download className="h-3.5 w-3.5 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setHistoryCategory(null)}>
              Close
            </Button>
            {historyCategory && (
              <Button
                onClick={() => {
                  setHistoryCategory(null);
                  handleCardGenerate(historyCategory);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Generate New
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
