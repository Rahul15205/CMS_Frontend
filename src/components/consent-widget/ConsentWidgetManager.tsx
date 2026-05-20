import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { consentWidgetService } from "@/services/consentWidgetService";
import { consentService } from "@/services/consentService";
import { useToast } from "@/hooks/use-toast";
import { ConsentWidgetConfig, DEFAULT_WIDGET_CONFIG, DISPLAY_MODES, TRIGGER_MODES } from "./types";
import { PageSection, SectionTitle } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import {
  Plus, Code, Eye, Edit, Trash2, Copy, CheckCircle, Settings,
  Palette, Layout, Globe, Shield, BarChart3, ExternalLink, Zap, AlertTriangle,
} from "lucide-react";
import {
  Tooltip, TooltipContent, TooltipTrigger,
} from "@/components/ui/tooltip";
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

// ─── Status Badge Helper ──────────────────────────────────
function getWidgetStatusBadge(status: string) {
  switch (status) {
    case "WIDGET_ACTIVE": return <StatusBadge status="active">Active</StatusBadge>;
    case "WIDGET_DRAFT": return <StatusBadge status="info">Draft</StatusBadge>;
    case "WIDGET_ARCHIVED": return <StatusBadge status="warning">Archived</StatusBadge>;
    default: return <StatusBadge status="info">{status}</StatusBadge>;
  }
}

// ─── Main Component ───────────────────────────────────────
export function ConsentWidgetManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [showBuilder, setShowBuilder] = useState(false);
  const [editingWidget, setEditingWidget] = useState<ConsentWidgetConfig | null>(null);
  const [showEmbedDialog, setShowEmbedDialog] = useState(false);
  const [embedWidgetId, setEmbedWidgetId] = useState<string>("");
  const [embedAppId, setEmbedAppId] = useState<string>("");
  const [showCreateApp, setShowCreateApp] = useState(false);
  const [newAppName, setNewAppName] = useState("");
  const [newAppDesc, setNewAppDesc] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState<Partial<ConsentWidgetConfig>>(DEFAULT_WIDGET_CONFIG);

  // Queries
  const { data: widgets = [], isLoading } = useQuery({
    queryKey: ["consent-widgets"],
    queryFn: () => consentWidgetService.getWidgets(),
  });

  const { data: templatesData } = useQuery({
    queryKey: ["consent-templates"],
    queryFn: () => consentService.getTemplates(),
  });

  const { data: appsData, refetch: refetchApps } = useQuery({
    queryKey: ["applications"],
    queryFn: () => consentService.getApplications(),
  });

  const templates = templatesData?.data || [];
  const applications = appsData?.data || [];

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: Partial<ConsentWidgetConfig>) => consentWidgetService.createWidget(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consent-widgets"] });
      toast({ title: "Widget Created", description: "Your consent widget has been created." });
      closeBuilder();
    },
    onError: (err: any) => toast({ title: "Error", description: err?.response?.data?.message || "Failed to create widget", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ConsentWidgetConfig> }) =>
      consentWidgetService.updateWidget(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consent-widgets"] });
      toast({ title: "Widget Updated", description: "Changes saved successfully." });
      closeBuilder();
    },
    onError: (err: any) => toast({ title: "Error", description: err?.response?.data?.message || "Failed to update widget", variant: "destructive" }),
  });

  const createAppMutation = useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      const res = await (await import("@/lib/api")).default.post("/api/v1/applications", data);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      refetchApps();
      updateForm("applicationId", data.id);
      setShowCreateApp(false);
      setNewAppName("");
      setNewAppDesc("");
      toast({ title: "Application Created", description: `"${data.name}" created and selected.` });
    },
    onError: (err: any) => toast({ title: "Error", description: err?.response?.data?.message || "Failed to create application", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => consentWidgetService.deleteWidget(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consent-widgets"] });
      toast({ title: "Widget Archived", description: "The widget has been archived." });
    },
  });

  // Handlers
  const openBuilder = (widget?: ConsentWidgetConfig) => {
    if (widget) {
      setEditingWidget(widget);
      setForm({ ...widget });
    } else {
      setEditingWidget(null);
      setForm({ ...DEFAULT_WIDGET_CONFIG });
    }
    setShowBuilder(true);
  };

  const closeBuilder = () => {
    setShowBuilder(false);
    setEditingWidget(null);
    setForm({ ...DEFAULT_WIDGET_CONFIG });
  };

  const handleSave = (status?: string) => {
    if (!form.name || !form.applicationId || !form.templateId) {
      toast({ title: "Validation Error", description: "Name, Application, and Template are required.", variant: "destructive" });
      return;
    }
    const payload = { ...form, status: (status || form.status || "WIDGET_DRAFT") as ConsentWidgetConfig["status"] };
    if (editingWidget?.id) {
      updateMutation.mutate({ id: editingWidget.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const openEmbed = (widget: ConsentWidgetConfig) => {
    setEmbedWidgetId(widget.id);
    setEmbedAppId(widget.applicationId);
    setShowEmbedDialog(true);
  };

  const copyScript = () => {
    const script = `<script src="${window.location.origin}/api/v1/public/consent/widget-script/${embedWidgetId}" defer></script>`;
    navigator.clipboard.writeText(script);
    toast({ title: "Copied!", description: "Embed script copied to clipboard." });
  };

  const updateForm = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const activeWidgets = widgets.filter((w) => w.status !== "WIDGET_ARCHIVED");

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageSection>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <SectionTitle>Embeddable Consent Widgets</SectionTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Create and manage consent collection widgets that can be embedded on any website.
            </p>
          </div>
          <Button onClick={() => openBuilder()} className="gap-2">
            <Plus className="h-4 w-4" /> Create Widget
          </Button>
        </div>
      </PageSection>

      {/* KPI Cards */}
      <PageSection>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="pt-5 pb-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10"><Layout className="h-5 w-5 text-primary" /></div>
              <div>
                <p className="text-2xl font-bold">{activeWidgets.length}</p>
                <p className="text-xs text-muted-foreground">Total Widgets</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent">
            <CardContent className="pt-5 pb-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-500/10"><CheckCircle className="h-5 w-5 text-emerald-500" /></div>
              <div>
                <p className="text-2xl font-bold">{widgets.filter((w) => w.status === "WIDGET_ACTIVE").length}</p>
                <p className="text-xs text-muted-foreground">Active Widgets</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent">
            <CardContent className="pt-5 pb-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-amber-500/10"><Zap className="h-5 w-5 text-amber-500" /></div>
              <div>
                <p className="text-2xl font-bold">{widgets.filter((w) => w.status === "WIDGET_DRAFT").length}</p>
                <p className="text-xs text-muted-foreground">Drafts</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageSection>

      {/* Widget List */}
      <PageSection>
        <div className="dashboard-card">
          <SectionTitle>All Widgets</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-[220px] w-full rounded-xl" />)
            ) : activeWidgets.length > 0 ? (
              activeWidgets.map((widget) => (
                <Card key={widget.id} className="hover:shadow-card-hover transition-all group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl" style={{ background: `${widget.themeColor}15` }}>
                          <Shield className="h-5 w-5" style={{ color: widget.themeColor }} />
                        </div>
                        <div>
                          <CardTitle className="text-base">{widget.name}</CardTitle>
                          <p className="text-xs text-muted-foreground mt-0.5">{widget.applicationName}</p>
                        </div>
                      </div>
                      {getWidgetStatusBadge(widget.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Template</span>
                        <span className="font-medium truncate max-w-[160px]">{widget.templateName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Display</span>
                        <Badge variant="outline" className="text-xs">{DISPLAY_MODES.find(m => m.value === widget.displayMode)?.label || widget.displayMode}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Trigger</span>
                        <Badge variant="outline" className="text-xs">{TRIGGER_MODES.find(t => t.value === widget.trigger)?.label || widget.trigger}</Badge>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-3 border-t">
                      <Tooltip><TooltipTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => openBuilder(widget)}><Edit className="h-3.5 w-3.5 mr-1" />Edit</Button>
                      </TooltipTrigger><TooltipContent>Edit widget</TooltipContent></Tooltip>

                      <Tooltip><TooltipTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => openEmbed(widget)}><Code className="h-3.5 w-3.5 mr-1" />Embed</Button>
                      </TooltipTrigger><TooltipContent>Get embed code</TooltipContent></Tooltip>

                      {widget.status === "WIDGET_DRAFT" && (
                        <Tooltip><TooltipTrigger asChild>
                          <Button size="sm" className="flex-1" onClick={() => {
                            updateMutation.mutate({ id: widget.id, data: { status: "WIDGET_ACTIVE" as any } });
                          }}><Zap className="h-3.5 w-3.5 mr-1" />Activate</Button>
                        </TooltipTrigger><TooltipContent>Activate widget</TooltipContent></Tooltip>
                      )}

                      <Tooltip><TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteConfirmId(widget.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger><TooltipContent>Archive widget</TooltipContent></Tooltip>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full py-16 text-center">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-15" />
                <p className="text-muted-foreground">No widgets created yet. Click "Create Widget" to get started.</p>
              </div>
            )}
          </div>
        </div>
      </PageSection>

      {/* ─── Builder Sheet ─────────────────────────────── */}
      <Sheet open={showBuilder} onOpenChange={(open) => !open && closeBuilder()}>
        <SheetContent className="sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingWidget ? "Edit Widget" : "Create Consent Widget"}</SheetTitle>
            <SheetDescription>Configure your embeddable consent collection widget.</SheetDescription>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2"><Settings className="h-4 w-4" />Basic Configuration</h3>
              <div className="space-y-3">
                <div>
                  <Label>Widget Name *</Label>
                  <Input value={form.name || ""} onChange={(e) => updateForm("name", e.target.value)} placeholder="e.g. Registration Consent Form" />
                </div>
                <div>
                  <Label>Application *</Label>
                  <Select value={form.applicationId || ""} onValueChange={(v) => updateForm("applicationId", v)}>
                    <SelectTrigger><SelectValue placeholder="Select an application" /></SelectTrigger>
                    <SelectContent>
                      {applications.map((app: any) => (
                        <SelectItem key={app.id} value={app.id}>{app.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!showCreateApp ? (
                    <Button variant="link" size="sm" className="px-0 h-auto mt-1 text-xs" onClick={() => setShowCreateApp(true)}>
                      <Plus className="h-3 w-3 mr-1" />Create New Application
                    </Button>
                  ) : (
                    <div className="mt-2 p-3 border rounded-lg bg-muted/30 space-y-2">
                      <Input placeholder="Application Name *" value={newAppName} onChange={(e) => setNewAppName(e.target.value)} />
                      <Input placeholder="Description (optional)" value={newAppDesc} onChange={(e) => setNewAppDesc(e.target.value)} />
                      <div className="flex gap-2">
                        <Button size="sm" disabled={!newAppName.trim() || createAppMutation.isPending} onClick={() => createAppMutation.mutate({ name: newAppName.trim(), description: newAppDesc.trim() || undefined })}>
                          {createAppMutation.isPending ? "Creating..." : "Create"}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => { setShowCreateApp(false); setNewAppName(""); setNewAppDesc(""); }}>Cancel</Button>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <Label>Consent Template *</Label>
                  <Select value={form.templateId || ""} onValueChange={(v) => updateForm("templateId", v)}>
                    <SelectTrigger><SelectValue placeholder="Select a consent template" /></SelectTrigger>
                    <SelectContent>
                      {templates.filter((t: any) => t.status !== "archived").map((t: any) => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            {/* Display Settings */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-sm font-semibold flex items-center gap-2"><Layout className="h-4 w-4" />Display & Design</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Display Mode</Label>
                  <Select value={form.displayMode || "POPUP"} onValueChange={(v) => updateForm("displayMode", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DISPLAY_MODES.map((m) => (
                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Trigger Mode</Label>
                  <Select value={form.trigger || "MANUAL"} onValueChange={(v) => updateForm("trigger", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TRIGGER_MODES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Theme Color</Label>
                  <div className="flex gap-2">
                    <Input type="color" value={form.themeColor || "#000000"} onChange={(e) => updateForm("themeColor", e.target.value)} className="w-12 h-10 p-1" />
                    <Input value={form.themeColor || ""} onChange={(e) => updateForm("themeColor", e.target.value)} placeholder="#000000" className="flex-1 text-xs" />
                  </div>
                </div>
                <div>
                  <Label>Background</Label>
                  <div className="flex gap-2">
                    <Input type="color" value={form.backgroundColor || "#ffffff"} onChange={(e) => updateForm("backgroundColor", e.target.value)} className="w-12 h-10 p-1" />
                    <Input value={form.backgroundColor || ""} onChange={(e) => updateForm("backgroundColor", e.target.value)} placeholder="#ffffff" className="flex-1 text-xs" />
                  </div>
                </div>
                <div>
                  <Label>Text Color</Label>
                  <div className="flex gap-2">
                    <Input type="color" value={form.textColor || "#000000"} onChange={(e) => updateForm("textColor", e.target.value)} className="w-12 h-10 p-1" />
                    <Input value={form.textColor || ""} onChange={(e) => updateForm("textColor", e.target.value)} placeholder="#000000" className="flex-1 text-xs" />
                  </div>
                </div>
              </div>
            </div>
            {/* Content Customization */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-sm font-semibold flex items-center gap-2"><Palette className="h-4 w-4" />Content & Texts</h3>
              <div className="space-y-3">
                <div>
                  <Label>Heading</Label>
                  <Input value={form.heading || ""} onChange={(e) => updateForm("heading", e.target.value)} placeholder="e.g. We value your privacy" />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea value={form.description || ""} onChange={(e) => updateForm("description", e.target.value)} placeholder="Explain why consent is being collected" rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Accept Button Text</Label>
                    <Input value={form.acceptAllText || ""} onChange={(e) => updateForm("acceptAllText", e.target.value)} placeholder="e.g. Accept All" />
                  </div>
                  <div>
                    <Label>Reject Button Text</Label>
                    <Input value={form.rejectAllText || ""} onChange={(e) => updateForm("rejectAllText", e.target.value)} placeholder="e.g. Reject All" />
                  </div>
                </div>
              </div>
            </div>
            {/* Fields Collection */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-sm font-semibold flex items-center gap-2"><Shield className="h-4 w-4" />Fields & Behaviors</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center justify-between border p-3 rounded-lg bg-muted/20">
                  <Label className="cursor-pointer" htmlFor="w-name">Collect Name</Label>
                  <Switch id="w-name" checked={form.collectName || false} onCheckedChange={(v) => updateForm("collectName", v)} />
                </div>
                <div className="flex items-center justify-between border p-3 rounded-lg bg-muted/20">
                  <Label className="cursor-pointer" htmlFor="w-email">Collect Email</Label>
                  <Switch id="w-email" checked={form.collectEmail !== false} onCheckedChange={(v) => updateForm("collectEmail", v)} />
                </div>
                <div className="flex items-center justify-between border p-3 rounded-lg bg-muted/20">
                  <Label className="cursor-pointer" htmlFor="w-phone">Collect Phone</Label>
                  <Switch id="w-phone" checked={form.collectPhone || false} onCheckedChange={(v) => updateForm("collectPhone", v)} />
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-6 border-t">
              <Button variant="outline" onClick={closeBuilder} className="flex-1">Cancel</Button>
              <Button onClick={() => handleSave("WIDGET_DRAFT")} variant="secondary" className="flex-1" disabled={createMutation.isPending || updateMutation.isPending}>
                Save as Draft
              </Button>
              <Button onClick={() => handleSave("WIDGET_ACTIVE")} className="flex-1" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingWidget ? "Update & Activate" : "Create & Activate"}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* ─── Embed Code Dialog ─────────────────────────── */}
      <Dialog open={showEmbedDialog} onOpenChange={setShowEmbedDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Embed Consent Widget</DialogTitle>
            <DialogDescription>Copy and paste this script into your website to show the consent widget.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label className="mb-2 block">1. Add this script to your HTML</Label>
              <div className="relative">
                <div className="bg-slate-950 text-emerald-400 p-4 rounded-xl font-mono text-sm border shadow-xl overflow-x-auto pr-12">
                  <pre className="whitespace-pre-wrap break-all">{`<script src="${window.location.origin}/api/v1/public/consent/widget-script/${embedWidgetId}" defer></script>`}</pre>
                </div>
                <Button size="icon" variant="ghost" className="absolute top-3 right-3 text-slate-400 hover:text-white hover:bg-white/10" onClick={copyScript}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2"><Code className="h-4 w-4 text-primary" />JavaScript API</h4>
              <div className="text-xs text-muted-foreground space-y-2 font-mono">
                <p className="text-foreground font-semibold">// Show consent popup</p>
                <div className="bg-muted p-2 rounded">ProteccioConsent.show();</div>
                <p className="text-foreground font-semibold mt-3">// Intercept form submission</p>
                <div className="bg-muted p-2 rounded">ProteccioConsent.onFormSubmit('#signup-form');</div>
                <p className="text-foreground font-semibold mt-3">// Render inline</p>
                <div className="bg-muted p-2 rounded">ProteccioConsent.renderInline('#consent-div');</div>
                <p className="text-foreground font-semibold mt-3">// On consent callback</p>
                <div className="bg-muted p-2 rounded">{"ProteccioConsent.onConsent(function(data) {\n  console.log(data.purposes);\n});"}</div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Confirmation Dialog ─────────────────── */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Archive Widget?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to archive this consent widget? It will no longer serve public consent requests.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteConfirmId) {
                  deleteMutation.mutate(deleteConfirmId);
                  setDeleteConfirmId(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
