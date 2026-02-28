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

// Import Rights Components
import { RightsDashboard } from "@/components/rights/RightsDashboard";
import { RightsRequestInbox } from "@/components/rights/RightsRequestInbox";
import { RightsCaseView } from "@/components/rights/RightsCaseView";
import { RightsEvidence } from "@/components/rights/RightsEvidence";
import { RightsAnalytics } from "@/components/rights/RightsAnalytics";
import { NewRightsRequestDialog } from "@/components/rights/NewRightsRequestDialog";

export default function RightsManagement() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null); // Use proper type if available or infer

  const handleViewRequest = (request: any) => {
    setSelectedRequest(request);
    setActiveTab("case-view");
  };

  return (
    <DashboardLayout
      title="Rights Management"
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
                <span className="hidden sm:inline">Log Request</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Log New Request</TooltipContent>
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
              <SelectItem value="requests">
                <div className="flex items-center gap-2">
                  <Inbox className="h-4 w-4" />
                  <span>Requests</span>
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
          <TabsTrigger value="requests" className="flex items-center gap-2 py-2.5">
            <Inbox className="h-4 w-4" />
            <span className="hidden sm:inline">Requests</span>
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
          <RightsDashboard />
        </TabsContent>

        <TabsContent value="requests" className="m-0 focus-visible:ring-0">
          <RightsRequestInbox onSelectRequest={handleViewRequest} />
        </TabsContent>

        <TabsContent value="case-view" className="m-0 focus-visible:ring-0">
          {selectedRequest ? (
            <RightsCaseView
              request={selectedRequest}
              onBack={() => setActiveTab("requests")}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <p className="text-muted-foreground mb-4">No request selected.</p>
              <Button onClick={() => setActiveTab("requests")}>Go to Requests</Button>
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
    </DashboardLayout>
  );
}
