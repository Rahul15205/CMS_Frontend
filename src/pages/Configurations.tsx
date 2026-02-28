import { useState } from "react";
import { DashboardLayout, PageSection, SectionTitle } from "@/components/layout/DashboardLayout";
import { KPICard } from "@/components/dashboard/KPICard";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
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
    Network
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
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";

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
import { useToast } from "@/hooks/use-toast";

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

export default function Configurations() {
    const [showWorkflowConfig, setShowWorkflowConfig] = useState(false);
    const [activeTab, setActiveTab] = useState("general");
    const [purposeItems, setPurposeItems] = useState(purposes);
    const [templateItems, setTemplateItems] = useState(templates);
    const [workflowItems, setWorkflowItems] = useState(workflows);
    const [languageItems, setLanguageItems] = useState(languages);
    const { toast } = useToast();

    return (
        <DashboardLayout
            title="Configurations"
            actions={
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            size="sm"
                            onClick={() => {
                                setActiveTab("general");
                                toast({ title: "New Configuration", description: "Use Add buttons in each section to create configuration items." });
                            }}
                        >
                            <Plus className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">New Configuration</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>New Configuration</TooltipContent>
                </Tooltip>
            }
        >
            {/* KPI Cards */}
            <PageSection className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <KPICard
                        title="Active Purposes"
                        value="4"
                        icon={<Target className="h-6 w-6" />}
                        variant="success"
                    />
                    <KPICard
                        title="Consent Templates"
                        value="4"
                        icon={<FileText className="h-6 w-6" />}
                    />
                    <KPICard
                        title="Security Controls"
                        value="Enabled"
                        icon={<Lock className="h-6 w-6" />}
                        variant="success"
                    />
                    <KPICard
                        title="Compliance Score"
                        value="98%"
                        icon={<Shield className="h-6 w-6" />}
                        variant="success"
                    />
                </div>
            </PageSection>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="bg-muted/50 p-1 grid grid-cols-2 md:grid-cols-5 w-full h-auto">
                    <TabsTrigger value="general" className="gap-2 py-2">
                        <Settings className="h-4 w-4" />
                        General
                    </TabsTrigger>
                    <TabsTrigger value="security" className="gap-2 py-2">
                        <Shield className="h-4 w-4" />
                        Security
                    </TabsTrigger>
                    <TabsTrigger value="compliance" className="gap-2 py-2">
                        <Scale className="h-4 w-4" />
                        Compliance
                    </TabsTrigger>
                    <TabsTrigger value="rules" className="gap-2 py-2">
                        <Network className="h-4 w-4" />
                        Rules & SLAs
                    </TabsTrigger>
                    <TabsTrigger value="system" className="gap-2 py-2">
                        <HardDrive className="h-4 w-4" />
                        System
                    </TabsTrigger>
                </TabsList>

                {/* GENERAL TAB */}
                <TabsContent value="general" className="mt-6 space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Purposes */}
                        <div className="dashboard-card">
                            <div className="flex items-center justify-between mb-4">
                                <SectionTitle>Data Processing Purposes</SectionTitle>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const nextId = Math.max(...purposeItems.map((item) => item.id), 0) + 1;
                                        setPurposeItems((prev) => [
                                            ...prev,
                                            { id: nextId, name: `New Purpose ${nextId}`, active: true, consents: 0 },
                                        ]);
                                        toast({ title: "Purpose Added", description: `New Purpose ${nextId} created.` });
                                    }}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Purpose
                                </Button>
                            </div>
                            <div className="space-y-3">
                                {purposeItems.map((purpose) => (
                                    <div
                                        key={purpose.id}
                                        className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`h-2 w-2 rounded-full ${purpose.active ? "bg-success" : "bg-muted"}`} />
                                            <div>
                                                <p className="font-medium text-foreground">{purpose.name}</p>
                                                {purpose.consents > 0 && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {purpose.consents.toLocaleString()} active consents
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <Switch
                                            checked={purpose.active}
                                            onCheckedChange={() =>
                                                setPurposeItems((prev) =>
                                                    prev.map((item) =>
                                                        item.id === purpose.id ? { ...item, active: !item.active } : item
                                                    )
                                                )
                                            }
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Templates */}
                        <div className="dashboard-card">
                            <div className="flex items-center justify-between mb-4">
                                <SectionTitle>Consent Templates</SectionTitle>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const nextId = Math.max(...templateItems.map((item) => item.id), 0) + 1;
                                        const newTemplate = {
                                            id: nextId,
                                            name: `Custom Template ${nextId}`,
                                            type: "Consent Collection",
                                            active: true,
                                        };
                                        setTemplateItems((prev) => [newTemplate, ...prev]);
                                        toast({ title: "Template Added", description: `${newTemplate.name} created.` });
                                    }}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Template
                                </Button>
                            </div>
                            <div className="space-y-3">
                                {templateItems.map((template) => (
                                    <div
                                        key={template.id}
                                        className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors cursor-pointer group"
                                        onClick={() => toast({ title: "Template Selected", description: `${template.name} opened for configuration.` })}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                                <FileText className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-foreground">{template.name}</p>
                                                <p className="text-xs text-muted-foreground">{template.type}</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Workflows */}
                        <div className="dashboard-card">
                            <div className="flex items-center justify-between mb-4">
                                <SectionTitle>Workflows</SectionTitle>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowWorkflowConfig(true)}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Configure
                                </Button>
                            </div>
                            <div className="space-y-3">
                                {workflowItems.map((workflow) => (
                                    <Card key={workflow.id} className={workflow.enabled ? "border-success/30" : ""}>
                                        <CardHeader className="p-4 pb-2">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-sm font-medium">{workflow.name}</CardTitle>
                                                <Switch
                                                    checked={workflow.enabled}
                                                    onCheckedChange={() =>
                                                        setWorkflowItems((prev) =>
                                                            prev.map((item) =>
                                                                item.id === workflow.id ? { ...item, enabled: !item.enabled } : item
                                                            )
                                                        )
                                                    }
                                                />
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-4 pt-0">
                                            <div className="flex items-center gap-2">
                                                {Array.from({ length: workflow.steps }).map((_, i) => (
                                                    <div key={i} className="flex items-center">
                                                        <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${workflow.enabled ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                                            }`}>
                                                            {i + 1}
                                                        </div>
                                                        {i < workflow.steps - 1 && (
                                                            <div className={`h-0.5 w-4 ${workflow.enabled ? "bg-primary" : "bg-muted"}`} />
                                                        )}
                                                    </div>
                                                ))}
                                                <span className="text-xs text-muted-foreground ml-2">
                                                    {workflow.steps} steps
                                                </span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        {/* Languages */}
                        <div className="dashboard-card">
                            <div className="flex items-center justify-between mb-4">
                                <SectionTitle>Supported Languages</SectionTitle>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const code = `l${languageItems.length + 1}`;
                                        setLanguageItems((prev) => [
                                            ...prev,
                                            { code, name: `Language ${languageItems.length + 1}`, enabled: false, primary: false },
                                        ]);
                                        toast({ title: "Language Added", description: `Language ${languageItems.length + 1} added.` });
                                    }}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Language
                                </Button>
                            </div>
                            <div className="space-y-3">
                                {languageItems.map((lang) => (
                                    <div
                                        key={lang.code}
                                        className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center font-medium text-sm uppercase">
                                                {lang.code}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-foreground">{lang.name}</p>
                                                    {lang.primary && (
                                                        <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                                                            Primary
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <Switch
                                            checked={lang.enabled}
                                            onCheckedChange={() =>
                                                setLanguageItems((prev) =>
                                                    prev.map((item) =>
                                                        item.code === lang.code ? { ...item, enabled: !item.enabled } : item
                                                    )
                                                )
                                            }
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* SECURITY TAB */}
                <TabsContent value="security" className="mt-6 space-y-8">
                    <EncryptionConfig />
                    <div className="border-t pt-8">
                        <h3 className="text-lg font-semibold mb-4">API Key Management</h3>
                        <APIKeyManagement />
                    </div>
                </TabsContent>

                {/* COMPLIANCE TAB */}
                <TabsContent value="compliance" className="mt-6 space-y-6">
                    <AadhaarKYCConfig />
                </TabsContent>

                {/* RULES & SLAs TAB */}
                <TabsContent value="rules" className="mt-6">
                    <Tabs defaultValue="sla-rights" className="w-full">
                        <div className="flex gap-6">
                            <TabsList className="bg-muted/30 flex-col h-auto w-48 justify-start gap-1 p-2">
                                <TabsTrigger value="sla-rights" className="w-full justify-start">SLA: Rights</TabsTrigger>
                                <TabsTrigger value="sla-grievances" className="w-full justify-start">SLA: Grievances</TabsTrigger>
                                <TabsTrigger value="notifications" className="w-full justify-start">Notifications</TabsTrigger>
                                <TabsTrigger value="escalation" className="w-full justify-start">Escalation Rules</TabsTrigger>
                                <TabsTrigger value="retention" className="w-full justify-start">Log Retention</TabsTrigger>
                            </TabsList>

                            <div className="flex-1">
                                <TabsContent value="sla-rights" className="mt-0">
                                    <SLARightsRules />
                                </TabsContent>
                                <TabsContent value="sla-grievances" className="mt-0">
                                    <SLAGrievancesRules />
                                </TabsContent>
                                <TabsContent value="notifications" className="mt-0">
                                    <NotificationRules />
                                </TabsContent>
                                <TabsContent value="escalation" className="mt-0">
                                    <EscalationRules />
                                </TabsContent>
                                <TabsContent value="retention" className="mt-0">
                                    <LogRetentionRules />
                                </TabsContent>
                            </div>
                        </div>
                    </Tabs>
                </TabsContent>

                {/* SYSTEM TAB */}
                <TabsContent value="system" className="mt-6 space-y-6">
                    <div className="max-w-4xl">
                        <ExportReportConfig />
                    </div>
                </TabsContent>

            </Tabs>

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
