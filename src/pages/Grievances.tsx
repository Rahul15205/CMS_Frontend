import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  LayoutDashboard,
  Inbox,
  FileText,
  Shield,
  PieChart,
  Plus,
  Download
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Import Components
import { GrievancesDashboard, initialGrievances } from "@/components/grievances/GrievancesDashboard";
import { CommentDialog } from "@/components/grievances/CommentDialog";
import { RightsRequestInbox } from "@/components/rights/RightsRequestInbox";
import { RightsCaseView } from "@/components/rights/RightsCaseView";
import { RightsEvidence } from "@/components/rights/RightsEvidence";
import { RightsAnalytics } from "@/components/rights/RightsAnalytics";
import { NewRightsRequestDialog } from "@/components/rights/NewRightsRequestDialog";

import { useToast } from "@/hooks/use-toast";

export default function Grievances() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const { toast } = useToast();

  // State for Grievances List (Lifted from Dashboard)
  const [grievancesList, setGrievancesList] = useState(initialGrievances);
  // State for Comment Dialog
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [targetCaseId, setTargetCaseId] = useState<string>("");

  const handleViewCase = (caseId: any) => {
    // Find the case in our state to pass to view
    const foundCase = grievancesList.find(g => g.id === caseId);
    if (foundCase) {
      setSelectedCase(foundCase);
      setActiveTab("case-view");
    } else {
      setActiveTab("grievances");
    }
  };

  const openCommentDialog = (id: string) => {
    setTargetCaseId(id);
    setCommentDialogOpen(true);
  };

  const handleSubmitComment = (comment: string) => {
    toast({
      title: "Comment Added",
      description: `Comment added to case ${targetCaseId}: "${comment}"`,
    });
    // Here we could update the 'lastUpdate' field of the grievance to show activity
    setGrievancesList(prev => prev.map(g =>
      g.id === targetCaseId ? { ...g, lastUpdate: "Just now" } : g
    ));
  };

  const handleEscalate = (id: string) => {
    const grievance = grievancesList.find(g => g.id === id);
    if (!grievance) return;

    // Optimistic UI update
    setGrievancesList(prev => prev.map(g =>
      g.id === id ? { ...g, priority: "high", status: "open", lastUpdate: "Just now" } : g
    ));

    toast({
      title: "Case Escalated",
      description: `Case ${id} has been marked as High Priority.`,
      variant: "destructive",
    });
  };

  return (
    <DashboardLayout
      title="Grievances"
      actions={
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Export Report</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Export Report</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" onClick={() => setIsNewRequestOpen(true)}>
                <Plus className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Log Grievance</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Log New Grievance</TooltipContent>
          </Tooltip>
        </div>
      }
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        {/* Mobile Tab Selector */}
        <div className="sm:hidden mb-4">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dashboard">
                <div className="flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </div>
              </SelectItem>
              <SelectItem value="grievances">
                <div className="flex items-center gap-2">
                  <Inbox className="h-4 w-4" />
                  <span>Grievances</span>
                </div>
              </SelectItem>
              <SelectItem value="case-view">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>Case View</span>
                </div>
              </SelectItem>
              <SelectItem value="evidence">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>Evidence</span>
                </div>
              </SelectItem>
              <SelectItem value="analytics">
                <div className="flex items-center gap-2">
                  <PieChart className="h-4 w-4" />
                  <span>Analytics</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Desktop Tabs List */}
        <TabsList className="hidden sm:grid w-full grid-cols-5 h-auto p-1 bg-muted/50">
          <TabsTrigger value="dashboard" className="flex items-center gap-2 py-2.5">
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="grievances" className="flex items-center gap-2 py-2.5">
            <Inbox className="h-4 w-4" />
            <span className="hidden sm:inline">Grievances</span>
          </TabsTrigger>
          <TabsTrigger value="case-view" className="flex items-center gap-2 py-2.5">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Case View</span>
          </TabsTrigger>
          <TabsTrigger value="evidence" className="flex items-center gap-2 py-2.5">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Evidence</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2 py-2.5">
            <PieChart className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="m-0 focus-visible:ring-0">
          <GrievancesDashboard
            grievances={grievancesList}
            onView={handleViewCase}
            onComment={openCommentDialog}
            onEscalate={handleEscalate}
          />
        </TabsContent>

        <TabsContent value="grievances" className="m-0 focus-visible:ring-0">
          <RightsRequestInbox onSelectRequest={handleViewCase} />
        </TabsContent>

        <TabsContent value="case-view" className="m-0 focus-visible:ring-0">
          {selectedCase ? (
            <RightsCaseView
              request={selectedCase}
              onBack={() => setActiveTab("grievances")}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <p className="text-muted-foreground mb-4">No grievance selected.</p>
              <Button onClick={() => setActiveTab("grievances")}>Go to Grievances</Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="evidence" className="m-0 focus-visible:ring-0">
          <RightsEvidence />
        </TabsContent>

        <TabsContent value="analytics" className="m-0 focus-visible:ring-0">
          <RightsAnalytics />
        </TabsContent>
      </Tabs>

      <NewRightsRequestDialog
        open={isNewRequestOpen}
        onOpenChange={setIsNewRequestOpen}
      />

      <CommentDialog
        open={commentDialogOpen}
        onOpenChange={setCommentDialogOpen}
        onSubmit={handleSubmitComment}
        caseId={targetCaseId}
      />
    </DashboardLayout>
  );
}
