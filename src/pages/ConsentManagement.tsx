import { useState, useEffect } from "react";
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
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Import new consent components
import { ConsentAnalytics } from "@/components/consent/ConsentAnalytics";
import { ConsentTemplateList } from "@/components/consent/ConsentTemplateList";
import { ConsentDeployment } from "@/components/consent/ConsentDeployment";
import { ConsentTemplateWizard } from "@/components/consent/ConsentTemplateWizard";
import { ConsentTemplate } from "@/components/consent/types";
import { ConsentUsageTraceability } from "@/components/consent/ConsentUsageTraceability";
import { ConsentVersionHistory } from "@/components/consent/ConsentVersionHistory";
import { CrossApplicationUsage } from "@/components/consent/CrossApplicationUsage";

import { mockTemplates } from "@/components/consent/mockData";

const TEMPLATES_STORAGE_KEY = "cms_consent_templates";

const getStoredTemplates = (): ConsentTemplate[] => {
  const stored = localStorage.getItem(TEMPLATES_STORAGE_KEY);
  if (!stored) return mockTemplates;
  try {
    return JSON.parse(stored) as ConsentTemplate[];
  } catch {
    return mockTemplates;
  }
};

export default function ConsentManagement() {
  const [activeTab, setActiveTab] = useState("analytics");
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ConsentTemplate | undefined>(undefined);
  const [templates, setTemplates] = useState<ConsentTemplate[]>(() => getStoredTemplates());
  const { setView } = useDashboard();

  useEffect(() => {
    if (activeTab === "analytics") {
      setView("analytics");
    } else {
      setView("main");
    }
  }, [activeTab, setView]);

  useEffect(() => {
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
  }, [templates]);

  const handleCreateNew = () => {
    setEditingTemplate(undefined);
    setIsWizardOpen(true);
  };

  const handleEdit = (template: ConsentTemplate) => {
    setEditingTemplate(template);
    setIsWizardOpen(true);
  };

  const handleSave = (template: Partial<ConsentTemplate>) => {
    if (template.id && templates.some(t => t.id === template.id)) {
      // Update existing
      setTemplates(templates.map(t => t.id === template.id ? { ...t, ...template } as ConsentTemplate : t));
    } else {
      // Create new
      const newTemplate = {
        ...template,
        id: `tpl-${Date.now()}`, // Simple ID generation
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      } as ConsentTemplate;
      setTemplates([...templates, newTemplate]);
    }

    setIsWizardOpen(false);
    setEditingTemplate(undefined);
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
              onCreateNew={handleCreateNew}
              onEdit={handleEdit}
              onView={handleEdit}
            />
          )}
        </TabsContent>

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
