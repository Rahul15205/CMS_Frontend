import { PageSection, SectionTitle } from "@/components/layout/DashboardLayout";
import { KPICard } from "@/components/dashboard/KPICard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { BarChartHorizontal } from "@/components/charts/BarChartHorizontal";
import { TrendLineChart } from "@/components/charts/TrendLineChart";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    MessageSquareWarning,
    Clock,
    CheckCircle,
    AlertTriangle,
    Eye,
    MessageSquare,
    ArrowUpRight,
    Timer,
    User,
} from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { mockGrievances } from "@/data/mockGrievances";

const trendData = [
    { name: "Aug", cases: 24 },
    { name: "Sep", cases: 18 },
    { name: "Oct", cases: 32 },
    { name: "Nov", cases: 28 },
    { name: "Dec", cases: 35 },
    { name: "Jan", cases: 45 },
];

const resolutionTimeData = [
    { name: "< 24 hours", value: 45, color: "hsl(142, 76%, 36%)" },
    { name: "1-3 days", value: 38, color: "hsl(199, 89%, 48%)" },
    { name: "3-7 days", value: 22, color: "hsl(38, 92%, 50%)" },
    { name: "> 7 days", value: 8, color: "hsl(0, 72%, 51%)" },
];

const initialGrievances = mockGrievances;

export { initialGrievances };

interface GrievancesDashboardProps {
    grievances: typeof initialGrievances;
    onView: (id: string) => void;
    onComment: (id: string) => void;
    onEscalate: (id: string) => void;
}

export function GrievancesDashboard({ grievances, onView, onComment, onEscalate }: GrievancesDashboardProps) {


    const getStatusStyle = (status: string) => {
        switch (status) {
            case "resolved":
                return "active";
            case "in_progress":
                return "info";
            case "open":
                return "warning";
            case "escalated":
                return "error";
            default:
                return "info";
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case "low":
                return <StatusBadge status="info" dot={false}>Low</StatusBadge>;
            case "medium":
                return <StatusBadge status="warning" dot={false}>Medium</StatusBadge>;
            case "high":
                return <StatusBadge status="warning" dot={false}>High</StatusBadge>;
            case "critical":
                return <StatusBadge status="error" dot={false}>Critical</StatusBadge>;
            default:
                return <StatusBadge status="info" dot={false}>{priority}</StatusBadge>;
        }
    };


    return (
        <div className="space-y-6 animate-fade-in">
            {/* KPI Cards */}
            <PageSection className="mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <KPICard
                        title="Open Grievances"
                        value="8"
                        icon={<MessageSquareWarning className="h-6 w-6" />}
                        variant="warning"
                    />
                    <KPICard
                        title="In Progress"
                        value="12"
                        icon={<Clock className="h-6 w-6" />}
                        variant="info"
                    />
                    <KPICard
                        title="Resolved (This Month)"
                        value="45"
                        icon={<CheckCircle className="h-6 w-6" />}
                        trend={{ value: 23, direction: "up" }}
                        variant="success"
                    />
                    <KPICard
                        title="Escalated"
                        value="3"
                        icon={<AlertTriangle className="h-6 w-6" />}
                        variant="destructive"
                    />
                    <KPICard
                        title="Avg. Resolution Time"
                        value="2.4 days"
                        icon={<Timer className="h-6 w-6" />}
                        trend={{ value: 15, direction: "down", label: "faster" }}
                    />
                </div>
            </PageSection>

            {/* Charts Row */}
            <PageSection className="mb-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <BarChartHorizontal
                        data={resolutionTimeData}
                        title="Resolution Time Distribution"
                    />

                    {/* Status Overview replaced by Trend Chart */}
                    <TrendLineChart
                        data={trendData}
                        title="Grievance Cases Trend"
                        lines={[
                            { dataKey: "cases", color: "hsl(217, 91%, 50%)", label: "Number of Cases" },
                        ]}
                    />
                </div>
            </PageSection>

            {/* Grievance Cases */}
            <PageSection>
                <div className="dashboard-card">
                    <div className="flex items-center justify-between mb-6">
                        <SectionTitle>Active Cases</SectionTitle>
                        <Button variant="outline" size="sm">
                            View All Cases
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {grievances.map((grievance) => (
                            <Card key={grievance.id} className="hover:shadow-card-hover transition-shadow">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <CardTitle className="text-base font-semibold">
                                                    {grievance.id}
                                                </CardTitle>
                                                {getPriorityBadge(grievance.priority)}
                                            </div>
                                            <p className="text-sm font-medium text-foreground">
                                                {grievance.subject}
                                            </p>
                                        </div>
                                        <StatusBadge status={getStatusStyle(grievance.status) as any}>
                                            {grievance.status === "in_progress" ? "In Progress" :
                                                grievance.status.charAt(0).toUpperCase() + grievance.status.slice(1)}
                                        </StatusBadge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground mb-4">
                                        <span className="flex items-center gap-1">
                                            <User className="h-4 w-4" />
                                            {grievance.userId}
                                        </span>
                                        <span>Category: {grievance.category}</span>
                                        <span>Created: {grievance.createdDate}</span>
                                        <span>Updated: {grievance.lastUpdate}</span>
                                        <span>Assigned: {grievance.assignedTo}</span>
                                    </div>
                                    <div className="flex items-center flex-wrap gap-2">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1 group"
                                                    onClick={() => onView(grievance.id)}
                                                >
                                                    <Eye className="h-4 w-4 sm:mr-1" />
                                                    <span className="hidden sm:inline">View Details</span>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>View Details</TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1 group"
                                                    onClick={() => onComment(grievance.id)}
                                                >
                                                    <MessageSquare className="h-4 w-4 sm:mr-1" />
                                                    <span className="hidden sm:inline">Add Comment</span>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Add Comment</TooltipContent>
                                        </Tooltip>
                                        {grievance.status !== "escalated" && (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="flex-1 text-destructive hover:text-destructive group"
                                                        onClick={() => onEscalate(grievance.id)}
                                                    >
                                                        <ArrowUpRight className="h-4 w-4 sm:mr-1" />
                                                        <span className="hidden sm:inline">Escalate</span>
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Escalate Case</TooltipContent>
                                            </Tooltip>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </PageSection>
        </div>
    );
}
