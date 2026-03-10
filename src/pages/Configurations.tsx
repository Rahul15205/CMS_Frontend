import { useState, useEffect, useCallback } from "react";
import { DashboardLayout, PageSection, SectionTitle } from "@/components/layout/DashboardLayout";
import { KPICard } from "@/components/dashboard/KPICard";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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
    Network,
    Loader2
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
import { 
    purposesService, 
    workflowConfigsService, 
    languagesService 
} from "@/services/configurationsService";
import { Skeleton } from "@/components/ui/skeleton";

export default function Configurations() {
    const [showWorkflowConfig, setShowWorkflowConfig] = useState(false);
    const [activeTab, setActiveTab] = useState("general");
    const [purposeItems, setPurposeItems] = useState<any[]>([]);
    const [templateItems, setTemplateItems] = useState<any[]>([]);
    const [workflowItems, setWorkflowItems] = useState<any[]>([]);
    const [languageItems, setLanguageItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [purposes, workflows, languages] = await Promise.all([
                purposesService.getAll(),
                workflowConfigsService.getAll(),
                languagesService.getAll()
            ]);
            
            setPurposeItems(purposes || []);
            setWorkflowItems(workflows || []);
            setLanguageItems(languages || []);
            
            // Templates are still mock for now in the UI
            setTemplateItems([
                { id: 1, name: "Standard Consent", type: "Consent Collection", active: true },
                { id: 2, name: "Marketing Opt-In", type: "Consent Collection", active: true },
                { id: 3, name: "Data Access Request", type: "Rights Request", active: true },
                { id: 4, name: "Data Deletion Request", type: "Rights Request", active: true },
            ]);
        } catch (error) {
            console.error("Error fetching configurations:", error);
            toast({
                title: "Error",
                description: "Failed to load configurations.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const activePurposes = purposeItems.filter(p => p.active).length;

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
                        value={loading ? "..." : activePurposes.toString()}
                        icon={<Target className="h-6 w-6" />}
                        variant="success"
                    />
                    <KPICard
                        title="Consent Templates"
                        value={loading ? "..." : templateItems.length.toString()}
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
                        <div className="dashboard-card shadow-sm border-0 bg-card/60 backdrop-blur-sm">
                            <div className="flex items-center justify-between mb-4">
                                <SectionTitle>Data Processing Purposes</SectionTitle>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={loading}
                                    onClick={async () => {
                                        const nextId = Math.max(...purposeItems.map((item) => item.id), 0) + 1;
                                        const newPurpose = { id: nextId, name: `New Purpose ${nextId}`, active: true, consents: 0 };
                                        try {
                                            const created = await purposesService.create(newPurpose);
                                            setPurposeItems((prev) => [...prev, created]);
                                            toast({ title: "Purpose Added", description: `New Purpose ${nextId} created.` });
                                        } catch (e) {
                                            toast({ title: "Error", description: "Failed to create purpose.", variant: "destructive" });
                                        }
                                    }}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Purpose
                                </Button>
                            </div>
                            <div className="space-y-3">
                                {loading ? (
                                    Array(3).fill(0).map((_, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                                            <div className="flex items-center gap-3 w-full">
                                                <Skeleton className="h-8 w-8 rounded-full" />
                                                <div className="space-y-2 flex-1">
                                                    <Skeleton className="h-4 w-[60%]" />
                                                    <Skeleton className="h-3 w-[40%]" />
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    purposeItems.map((purpose) => (
                                        <div
                                            key={purpose.id}
                                            className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-all duration-200 group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`h-2.5 w-2.5 rounded-full ${purpose.active ? "bg-success shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-muted"}`} />
                                                <div>
                                                    <p className="font-medium text-foreground group-hover:text-primary transition-colors">{purpose.name}</p>
                                                    {purpose.consents > 0 && (
                                                        <p className="text-xs text-muted-foreground">
                                                            {purpose.consents.toLocaleString()} active consents
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <Switch
                                                checked={purpose.active}
                                                onCheckedChange={async () => {
                                                    try {
                                                        const updated = await purposesService.update(purpose.id.toString(), { ...purpose, active: !purpose.active });
                                                        setPurposeItems((prev) =>
                                                            prev.map((item) => item.id === purpose.id ? updated : item
                                                        ));
                                                    } catch (e) {
                                                        toast({ title: "Error", description: "Failed to update purpose.", variant: "destructive" });
                                                    }
                                                }}
                                            />
                                        </div>
                                    ))
                                )}
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
                                {loading ? (
                                    Array(2).fill(0).map((_, i) => (
                                        <Skeleton key={i} className="h-24 w-full rounded-lg" />
                                    ))
                                ) : (
                                    workflowItems.map((workflow) => (
                                        <Card key={workflow.id} className={workflow.enabled ? "border-success/30" : ""}>
                                            <CardHeader className="p-4 pb-2">
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="text-sm font-medium">{workflow.name}</CardTitle>
                                                    <Switch
                                                        checked={workflow.enabled}
                                                        onCheckedChange={async () => {
                                                            try {
                                                                const updated = await workflowConfigsService.update(workflow.id.toString(), { ...workflow, enabled: !workflow.enabled });
                                                                setWorkflowItems((prev) =>
                                                                    prev.map((item) => item.id === workflow.id ? updated : item
                                                                ));
                                                            } catch (e) {
                                                                toast({ title: "Error", description: "Failed to update workflow.", variant: "destructive" });
                                                            }
                                                        }}
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
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Languages */}
                        <div className="dashboard-card shadow-sm border-0 bg-card/60 backdrop-blur-sm">
                            <div className="flex items-center justify-between mb-4">
                                <SectionTitle>Supported Languages</SectionTitle>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={loading}
                                    onClick={async () => {
                                        const code = `l${languageItems.length + 1}`;
                                        const newLang = { code, name: `Language ${languageItems.length + 1}`, enabled: false, primary: false };
                                        try {
                                            const created = await languagesService.create(newLang);
                                            setLanguageItems((prev) => [...prev, created]);
                                            toast({ title: "Language Added", description: `Language ${languageItems.length + 1} added.` });
                                        } catch (e) {
                                            toast({ title: "Error", description: "Failed to add language.", variant: "destructive" });
                                        }
                                    }}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Language
                                </Button>
                            </div>
                            <div className="space-y-3">
                                {loading ? (
                                    Array(3).fill(0).map((_, i) => (
                                        <Skeleton key={i} className="h-16 w-full rounded-lg" />
                                    ))
                                ) : (
                                    languageItems.map((lang) => (
                                        <div
                                            key={lang.code}
                                            className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-all duration-200 group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm uppercase group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                                    {lang.code}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-medium text-foreground">{lang.name}</p>
                                                        {lang.primary && (
                                                            <Badge variant="outline" className="text-[10px] h-4 bg-primary/5 text-primary border-primary/20">
                                                                Primary
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <Switch
                                                checked={lang.enabled}
                                                onCheckedChange={async () => {
                                                    try {
                                                        const updated = await languagesService.update(lang.code, { ...lang, enabled: !lang.enabled });
                                                        setLanguageItems((prev) =>
                                                            prev.map((item) => item.code === lang.code ? updated : item
                                                        ));
                                                    } catch (e) {
                                                        toast({ title: "Error", description: "Failed to update language.", variant: "destructive" });
                                                    }
                                                }}
                                            />
                                        </div>
                                    ))
                                )}
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
