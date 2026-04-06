import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { consentService } from "@/services/consentService";
import { useToast } from "@/hooks/use-toast";
import { useDashboard } from "@/contexts/DashboardContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PieChart,
  FileText,
  Send,
  Activity,
  History,
  Layers,
  AlertCircle,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Import new consent components
import { ConsentAnalytics } from "@/components/consent/ConsentAnalytics";
import { ConsentTemplateList } from "@/components/consent/ConsentTemplateList";
import { ConsentDeployment } from "@/components/consent/ConsentDeployment";
import { ConsentTemplateWizard } from "@/components/consent/ConsentTemplateWizard";
import { TemplatePreviewDialog } from "@/components/consent/TemplatePreviewDialog";
import { ConsentTemplate, DEFAULT_TEMPLATE } from "@/components/consent/types";
import { ConsentUsageTraceability } from "@/components/consent/ConsentUsageTraceability";
import { ConsentVersionHistory } from "@/components/consent/ConsentVersionHistory";
import { CrossApplicationUsage } from "@/components/consent/CrossApplicationUsage";

// Consent templates are loaded through the real consent service

// Legacy localStorage constants removed as we move to persistent backend storage

export default function ConsentManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("analytics");
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ConsentTemplate | undefined>(undefined);
  const [viewingTemplate, setViewingTemplate] = useState<ConsentTemplate | undefined>(undefined);
  const [archiveTarget, setArchiveTarget] = useState<ConsentTemplate | undefined>(undefined);
  
  const { setView } = useDashboard();

  // Fetch templates data
  const { data: templatesData, isLoading, refetch } = useQuery({
    queryKey: ['consent-templates'],
    queryFn: () => consentService.getTemplates(),
  });

  const templates = templatesData?.data || [];

  // Mutation for saving (Create/Update)
  const saveMutation = useMutation({
    mutationFn: (template: Partial<ConsentTemplate>) => consentService.saveTemplate(template),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consent-templates'] });
      toast({
        title: "Success",
        description: editingTemplate ? "Template updated successfully" : "Template created successfully",
      });
      setIsWizardOpen(false);
      setEditingTemplate(undefined);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save template",
        variant: "destructive",
      });
    },
  });

  // Mutation for archiving
  const archiveMutation = useMutation({
    mutationFn: (id: string) => consentService.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consent-templates'] });
      toast({
        title: "Template Archived",
        description: "The template has been archived successfully.",
      });
      setArchiveTarget(undefined);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to archive template",
        variant: "destructive",
      });
      setArchiveTarget(undefined);
    },
  });

  useEffect(() => {
    if (activeTab === "analytics") {
      setView("analytics");
    } else {
      setView("main");
    }
  }, [activeTab, setView]);

  const handleCreateNew = () => {
    setEditingTemplate(undefined);
    setIsWizardOpen(true);
  };

  const handleEdit = (template: ConsentTemplate) => {
    setEditingTemplate(template);
    setIsWizardOpen(true);
  };

  // Bug Fix 1: View Details opens as read-only preview dialog
  const handleView = (template: ConsentTemplate) => {
    setViewingTemplate(template);
  };

  // Bug Fix 2: Clone template
  const handleClone = (template: ConsentTemplate) => {
    const cloned: Partial<ConsentTemplate> = {
      ...template,
      id: undefined as any, // Remove id to create a new template
      name: `Copy of ${template.name}`,
      status: "draft",
      version: "1.0",
      createdAt: undefined as any,
      updatedAt: undefined as any,
      createdBy: undefined as any,
      updatedBy: undefined as any,
      latestVersionId: undefined,
    };
    setEditingTemplate(cloned as ConsentTemplate);
    setIsWizardOpen(true);
    toast({
      title: "Template Cloned",
      description: `Editing cloned copy of "${template.name}". Save to create the new template.`,
    });
  };

  // Bug Fix 3: Archive template
  const handleArchive = (template: ConsentTemplate) => {
    setArchiveTarget(template);
  };

  const confirmArchive = () => {
    if (archiveTarget?.id) {
      archiveMutation.mutate(archiveTarget.id);
    }
  };

  const handleSave = (template: Partial<ConsentTemplate>) => {
    saveMutation.mutate(template);
  };

  const handleCancel = () => {
    setIsWizardOpen(false);
    setEditingTemplate(undefined);
  };

  return (
    <DashboardLayout title="Consent Management">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        {/* Mobile Tab Selector */}
        <div className="sm:hidden mb-4">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="analytics">
                <div className="flex items-center gap-2">
                  <PieChart className="h-4 w-4" />
                  <span>Analytics</span>
                </div>
              </SelectItem>
              <SelectItem value="templates">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>Templates</span>
                </div>
              </SelectItem>
              <SelectItem value="deployment">
                <div className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  <span>Deployment</span>
                </div>
              </SelectItem>
              <SelectItem value="usage">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  <span>Usage</span>
                </div>
              </SelectItem>
              <SelectItem value="history">
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  <span>History</span>
                </div>
              </SelectItem>
              <SelectItem value="crossapp">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  <span>Cross-App</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Desktop Tabs List */}
        <TabsList className="hidden sm:grid w-full grid-cols-6 h-auto p-1 bg-muted/50">
          <TabsTrigger value="analytics" className="flex items-center gap-2 py-2.5">
            <PieChart className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2 py-2.5">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Templates</span>
          </TabsTrigger>
          <TabsTrigger value="deployment" className="flex items-center gap-2 py-2.5">
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">Deployment</span>
          </TabsTrigger>
          <TabsTrigger value="usage" className="flex items-center gap-2 py-2.5">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Usage</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2 py-2.5">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">History</span>
          </TabsTrigger>
          <TabsTrigger value="crossapp" className="flex items-center gap-2 py-2.5">
            <Layers className="h-4 w-4" />
            <span className="hidden sm:inline">Cross-App</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="m-0 focus-visible:ring-0">
          <ConsentAnalytics />
        </TabsContent>

        <TabsContent value="templates" className="m-0 focus-visible:ring-0">
          {isWizardOpen ? (
            <ConsentTemplateWizard
              template={editingTemplate}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          ) : (
            <ConsentTemplateList
              templates={templates}
              isLoading={isLoading}
              onCreateNew={handleCreateNew}
              onEdit={handleEdit}
              onView={handleView}
              onClone={handleClone}
              onArchive={handleArchive}
              onRefresh={refetch}
            />
          )}
        </TabsContent>

        {/* View Details Read-Only Preview Dialog */}
        <TemplatePreviewDialog
          template={viewingTemplate}
          open={!!viewingTemplate}
          onClose={() => setViewingTemplate(undefined)}
        />

        {/* Archive Confirmation Dialog */}
        <AlertDialog open={!!archiveTarget} onOpenChange={(open) => !open && setArchiveTarget(undefined)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-warning" />
                Archive Template?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to archive <strong>"{archiveTarget?.name}"</strong>? Archived templates will no longer be active but can be restored later.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmArchive}
                className="bg-warning text-warning-foreground hover:bg-warning/90"
              >
                Archive
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <TabsContent value="deployment" className="m-0 focus-visible:ring-0">
          <ConsentDeployment templates={templates} />
        </TabsContent>

        <TabsContent value="usage" className="m-0 focus-visible:ring-0">
          <ConsentUsageTraceability />
        </TabsContent>

        <TabsContent value="history" className="m-0 focus-visible:ring-0">
          <ConsentVersionHistory />
        </TabsContent>

        <TabsContent value="crossapp" className="m-0 focus-visible:ring-0">
          <CrossApplicationUsage />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
