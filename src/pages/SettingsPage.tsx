import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { NewSettingDialog } from "@/components/settings/NewSettingDialog";
import { DashboardLayout, PageSection, SectionTitle } from "@/components/layout/DashboardLayout";
import { KPICard } from "@/components/dashboard/KPICard";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import {
  Target,
  FileText,
  Workflow,
  Languages,
  Plus,
  ChevronRight,
  Shield,
  Lock,
  Settings,
  Scale,
  Bell,
  HardDrive,
  FileBarChart,
  Network,
  Key,
  Database
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

import { WorkflowConfiguration } from "@/components/workflows/WorkflowConfiguration";

// New Configurations
import { AadhaarKYCConfig } from "@/components/configurations/AadhaarKYCConfig";
import { EncryptionConfig } from "@/components/configurations/EncryptionConfig";
import { APIKeyManagement } from "@/components/configurations/APIKeyManagement";
import { ExportReportConfig } from "@/components/configurations/ExportReportConfig";
import { SLARightsRules } from "@/components/configurations/SLARightsRules";
import { SLAGrievancesRules } from "@/components/configurations/SLAGrievancesRules";
import { NotificationRules } from "@/components/configurations/NotificationRules";
import { EscalationRules } from "@/components/configurations/EscalationRules";
import { LogRetentionRules } from "@/components/configurations/LogRetentionRules";
import { cn } from "@/lib/utils";

const purposes = [
  { id: 1, name: "Marketing Communications", active: true, consents: 4520 },
  { id: 2, name: "Analytics & Performance", active: true, consents: 3890 },
  { id: 3, name: "Personalization", active: true, consents: 2340 },
  { id: 4, name: "Third-Party Data Sharing", active: true, consents: 1200 },
  { id: 5, name: "Research & Development", active: false, consents: 0 },
];

const templates = [
  { id: 1, name: "Standard Consent", type: "Consent Collection", active: true },
  { id: 2, name: "Marketing Opt-In", type: "Consent Collection", active: true },
  { id: 3, name: "Data Access Request", type: "Rights Request", active: true },
  { id: 4, name: "Data Deletion Request", type: "Rights Request", active: true },
];

const workflows = [
  { id: 1, name: "Consent Collection", enabled: true, steps: 4 },
  { id: 2, name: "Rights Request Processing", enabled: true, steps: 6 },
  { id: 3, name: "Grievance Handling", enabled: true, steps: 5 },
  { id: 4, name: "Consent Renewal", enabled: false, steps: 3 },
];

const languages = [
  { code: "en", name: "English", enabled: true, primary: true },
  { code: "hi", name: "Hindi", enabled: true, primary: false },
  { code: "ta", name: "Tamil", enabled: true, primary: false },
  { code: "bn", name: "Bengali", enabled: false, primary: false },
  { code: "te", name: "Telugu", enabled: false, primary: false },
];

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string;
    title: string;
    icon: React.ReactNode;
  }[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

function SidebarNav({ className, items, activeTab, onTabChange, ...props }: SidebarNavProps) {
  return (
    <nav
      className={cn(
        "flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1",
        className
      )}
      {...props}
    >
      {items.map((item) => (
        <Button
          key={item.href}
          variant={activeTab === item.href ? "secondary" : "ghost"}
          className={cn(
            "justify-start",
            activeTab === item.href ? "bg-muted hover:bg-muted" : "hover:bg-transparent hover:underline",
            "justify-start"
          )}
          onClick={() => onTabChange(item.href)}
        >
          {item.icon}
          <span className="ml-2">{item.title}</span>
        </Button>
      ))}
    </nav>
  );
}

export default function SettingsPage() {
  const [showWorkflowConfig, setShowWorkflowConfig] = useState(false);
  const [showNewSettingDialog, setShowNewSettingDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [purposeItems, setPurposeItems] = useState(purposes);
  const [languageItems, setLanguageItems] = useState(languages);
  const { toast } = useToast();

  const handleNewSettingAction = (action: string) => {
    switch (action) {
      case "add_purpose":
      case "add_language":
        setActiveTab("general");
        toast({
          title: "Navigate to General Settings",
          description: "Please use the specific 'Add' button in the General tab.",
        });
        break;
      case "create_workflow":
        setActiveTab("system");
        setShowWorkflowConfig(true);
        break;
      case "create_template":
        setActiveTab("general");
        toast({
          title: "Navigate to Templates",
          description: "Please use the 'Create Template' button in the General tab.",
        });
        break;
      case "generate_api_key":
        setActiveTab("security");
        toast({
          title: "Navigate to Security",
          description: "Please use the API Key Management section.",
        });
        break;
      case "add_retention_rule":
        setActiveTab("system");
        toast({
          title: "Navigate to System",
          description: "Please use the Log Retention Rules section.",
        });
        break;
      default:
        toast({
          title: "Action Selected",
          description: `Action: ${action}`,
        });
    }
  };

  const handlePurposeToggle = (id: number) => {
    setPurposeItems((prev) =>
      prev.map((purpose) =>
        purpose.id === id ? { ...purpose, active: !purpose.active } : purpose
      )
    );
  };

  const handleLanguageToggle = (code: string) => {
    setLanguageItems((prev) =>
      prev.map((language) =>
        language.code === code ? { ...language, enabled: !language.enabled } : language
      )
    );
  };

  const handleAddPurpose = () => {
    const nextId = Math.max(...purposeItems.map((p) => p.id), 0) + 1;
    setPurposeItems((prev) => [
      ...prev,
      { id: nextId, name: `New Purpose ${nextId}`, active: true, consents: 0 },
    ]);
    toast({
      title: "Purpose Added",
      description: `New Purpose ${nextId} created.`,
    });
  };

  const handleAddLanguage = () => {
    const draftCode = `lg${languageItems.length + 1}`;
    setLanguageItems((prev) => [
      ...prev,
      { code: draftCode, name: `Language ${languageItems.length + 1}`, enabled: false, primary: false },
    ]);
    toast({
      title: "Language Added",
      description: `Language ${languageItems.length + 1} added as draft.`,
    });
  };

  const sidebarNavItems = [
    {
      title: "General",
      href: "general",
      icon: <Settings className="h-4 w-4" />,
    },
    {
      title: "Security & Access",
      href: "security",
      icon: <Shield className="h-4 w-4" />,
    },
    {
      title: "Compliance & Rules",
      href: "compliance",
      icon: <Scale className="h-4 w-4" />,
    },
    {
      title: "System & Logs",
      href: "system",
      icon: <HardDrive className="h-4 w-4" />,
    },
  ];

  return (
    <DashboardLayout
      title="Platform Settings"
      actions={
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="sm" onClick={() => setShowNewSettingDialog(true)}>
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">New Setting</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add New Setting</TooltipContent>
        </Tooltip>
      }
    >
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="lg:w-1/5">
          <SidebarNav
            items={sidebarNavItems}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </aside>
        <div className="flex-1 lg:max-w-4xl">
          {/* GENERAL TAB CONTENT */}
          {activeTab === "general" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">General Settings</h3>
                <p className="text-sm text-muted-foreground">
                  Manage core platform settings, languages, and purposes.
                </p>
              </div>
              <Separator />

              {/* Purposes Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Data Purposes</h4>
                    <p className="text-sm text-muted-foreground">Define purposes for data collection.</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleAddPurpose}>Add Purpose</Button>
                </div>
                <div className="grid gap-4">
                  {purposeItems.map((purpose) => (
                    <div key={purpose.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`h-2 w-2 rounded-full ${purpose.active ? "bg-success" : "bg-muted"}`} />
                        <div>
                          <p className="font-medium text-sm">{purpose.name}</p>
                          <p className="text-xs text-muted-foreground">{purpose.consents} consents</p>
                        </div>
                      </div>
                      <Switch checked={purpose.active} onCheckedChange={() => handlePurposeToggle(purpose.id)} />
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Languages Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Supported Languages</h4>
                    <p className="text-sm text-muted-foreground">Manage languages available on the platform.</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleAddLanguage}>Add Language</Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {languageItems.map((lang) => (
                    <div key={lang.code} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold uppercase bg-muted px-2 py-1 rounded">{lang.code}</span>
                        <div>
                          <p className="font-medium text-sm">{lang.name}</p>
                          {lang.primary && <span className="text-[10px] bg-primary/10 text-primary px-1 rounded">Primary</span>}
                        </div>
                      </div>
                      <Switch checked={lang.enabled} onCheckedChange={() => handleLanguageToggle(lang.code)} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SECURITY TAB CONTENT */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Security & Access</h3>
                <p className="text-sm text-muted-foreground">
                  Configure encryption, API keys, and security constraints.
                </p>
              </div>
              <Separator />
              <EncryptionConfig />
              <div className="pt-6">
                <h4 className="text-sm font-medium mb-4">API Key Management</h4>
                <APIKeyManagement />
              </div>
            </div>
          )}

          {/* COMPLIANCE TAB CONTENT */}
          {activeTab === "compliance" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Compliance & Rules</h3>
                <p className="text-sm text-muted-foreground">
                  Set up SLAs, notifications, and escalation policies.
                </p>
              </div>
              <Separator />
              <AadhaarKYCConfig />

              <div className="mt-8">
                <h4 className="text-sm font-medium mb-4">Service Level Agreements (SLAs)</h4>
                <div className="space-y-8">
                  <SLARightsRules />
                  <SLAGrievancesRules />
                </div>
              </div>

              <div className="mt-8">
                <h4 className="text-sm font-medium mb-4">Escalation & Notifications</h4>
                <div className="space-y-8">
                  <NotificationRules />
                  <EscalationRules />
                </div>
              </div>
            </div>
          )}

          {/* SYSTEM TAB CONTENT */}
          {activeTab === "system" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">System & Logs</h3>
                <p className="text-sm text-muted-foreground">
                  Configure data retention, exports, and system logs.
                </p>
              </div>
              <Separator />
              <LogRetentionRules />
              <div className="pt-6">
                <h4 className="text-sm font-medium mb-4">Data Export Configuration</h4>
                <ExportReportConfig />
              </div>

              <div className="pt-6">
                <h4 className="text-sm font-medium mb-4">Workflow Management</h4>
                <Card>
                  <CardHeader>
                    <CardTitle>Approval Workflows</CardTitle>
                    <CardDescription>Configure automation workflows for requests.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {workflows.map((wf) => (
                        <div key={wf.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium text-sm">{wf.name}</p>
                            <p className="text-xs text-muted-foreground">{wf.steps} steps configured</p>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => setShowWorkflowConfig(true)}>Configure</Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>

      <NewSettingDialog
        open={showNewSettingDialog}
        onOpenChange={setShowNewSettingDialog}
        onSelectAction={handleNewSettingAction}
      />
      {/* Workflow Configuration Dialog */}
      <Dialog open={showWorkflowConfig} onOpenChange={setShowWorkflowConfig}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Workflow Configuration</DialogTitle>
            <DialogDescription>
              Manage and customize approval workflows
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <WorkflowConfiguration isDialog={true} />
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
