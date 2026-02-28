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

const reportTrends = [
  { name: "Jan", consent: 12, rights: 8, grievance: 4, compliance: 2 },
  { name: "Feb", consent: 15, rights: 10, grievance: 5, compliance: 3 },
  { name: "Mar", consent: 18, rights: 12, grievance: 6, compliance: 4 },
  { name: "Apr", consent: 14, rights: 9, grievance: 3, compliance: 2 },
  { name: "May", consent: 20, rights: 15, grievance: 7, compliance: 5 },
  { name: "Jun", consent: 22, rights: 14, grievance: 5, compliance: 4 },
];

const reportTypes = [
  {
    id: "consent",
    title: "Consent Reports",
    description: "Consent collection, status, and lifecycle analytics",
    icon: FileCheck,
    count: 45,
    lastGenerated: "2024-01-19",
  },
  {
    id: "rights",
    title: "Rights Fulfilment Reports",
    description: "Data principal rights request processing metrics",
    icon: Scale,
    count: 32,
    lastGenerated: "2024-01-18",
  },
  {
    id: "grievance",
    title: "Grievance Reports",
    description: "Grievance handling and resolution analytics",
    icon: MessageSquareWarning,
    count: 18,
    lastGenerated: "2024-01-17",
  },
  {
    id: "compliance",
    title: "Compliance Reports",
    description: "Overall DPDP Act compliance status and audit trails",
    icon: Shield,
    count: 12,
    lastGenerated: "2024-01-15",
  },
];

export default function Reports() {
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
          <KPICard
            title="Consent Reports"
            value="45"
            icon={<FileCheck className="h-6 w-6" />}
            trend={{ value: 12, direction: "up" }}
            className="h-full"
          />
          <KPICard
            title="Rights Reports"
            value="32"
            icon={<Scale className="h-6 w-6" />}
            trend={{ value: 8, direction: "up" }}
            className="h-full"
          />
          <KPICard
            title="Grievance Reports"
            value="18"
            icon={<MessageSquareWarning className="h-6 w-6" />}
            className="h-full"
          />
          <KPICard
            title="Compliance Reports"
            value="12"
            icon={<Shield className="h-6 w-6" />}
            variant="success"
            className="h-full"
          />
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
                <Label>Report Type</Label>
                <Select defaultValue="consent">
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
                    <Input type="date" className="pl-9" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="date" className="pl-9" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Format</Label>
                <Select defaultValue="pdf">
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

              <Button className="w-full mt-auto">
                <Download className="h-4 w-4 mr-2" />
                Generate & Download
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

      {/* Report Type Cards */}
      <PageSection>
        <div className="dashboard-card">
          <SectionTitle>Report Categories</SectionTitle>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {reportTypes.map((report) => {
              const Icon = report.icon;
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
                            {report.count} reports generated
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
                      <span className="font-medium text-foreground">{report.lastGenerated}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <FileText className="h-4 w-4 mr-1" />
                        View All
                      </Button>
                      <Button size="sm" className="flex-1">
                        <Download className="h-4 w-4 mr-1" />
                        Generate
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
  );
}
