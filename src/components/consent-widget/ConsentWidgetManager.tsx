import { useState, useEffect } from "react";
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
  Palette, Layout, Globe, Shield, BarChart3, ExternalLink, Zap,
} from "lucide-react";
import {
  Tooltip, TooltipContent, TooltipTrigger,
} from "@/components/ui/tooltip";

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

  const { data: appsData } = useQuery({
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
    const payload = { ...form, status: status || form.status || "WIDGET_DRAFT" };
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
    const script = `<script src="${window.location.origin}/api/v1/public/consent/widget-script/${embedAppId}" defer></script>`;
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
                </div>
                <div>
                  <Label>Consent Template *</Label>
                  <Select value={form.templateId || ""} onValueChange={(v) => updateForm("templateId", v)}>
                    <SelectTrigger><SelectValue placeholder="Select a consent template" /></SelectTrigger>
                    <SelectContent>
                      {templates.map((t: any) => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Display Settings */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2"><Layout className="h-4 w-4" />Display Settings</h3>
              <div className="grid grid-cols-2 gap-3">
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
                  <Label>Trigger</Label>
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
            </div>

            {/* Branding */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2"><Palette className="h-4 w-4" />Branding</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Theme Color</Label>
                  <div className="flex gap-2">
                    <input type="color" value={form.themeColor || "#10b981"} onChange={(e) => updateForm("themeColor", e.target.value)} className="h-9 w-12 rounded border cursor-pointer" />
                    <Input value={form.themeColor || ""} onChange={(e) => updateForm("themeColor", e.target.value)} className="flex-1" />
                  </div>
                </div>
                <div>
                  <Label>Background</Label>
                  <div className="flex gap-2">
                    <input type="color" value={form.backgroundColor || "#ffffff"} onChange={(e) => updateForm("backgroundColor", e.target.value)} className="h-9 w-12 rounded border cursor-pointer" />
                    <Input value={form.backgroundColor || ""} onChange={(e) => updateForm("backgroundColor", e.target.value)} className="flex-1" />
                  </div>
                </div>
                <div>
                  <Label>Text Color</Label>
                  <div className="flex gap-2">
                    <input type="color" value={form.textColor || "#111827"} onChange={(e) => updateForm("textColor", e.target.value)} className="h-9 w-12 rounded border cursor-pointer" />
                    <Input value={form.textColor || ""} onChange={(e) => updateForm("textColor", e.target.value)} className="flex-1" />
                  </div>
                </div>
                <div>
                  <Label>Button Text</Label>
                  <div className="flex gap-2">
                    <input type="color" value={form.buttonTextColor || "#ffffff"} onChange={(e) => updateForm("buttonTextColor", e.target.value)} className="h-9 w-12 rounded border cursor-pointer" />
                    <Input value={form.buttonTextColor || ""} onChange={(e) => updateForm("buttonTextColor", e.target.value)} className="flex-1" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Border Radius (px)</Label>
                  <Input type="number" value={form.borderRadius || 12} onChange={(e) => updateForm("borderRadius", parseInt(e.target.value) || 0)} />
                </div>
                <div>
                  <Label>Font Size (px)</Label>
                  <Input type="number" value={form.fontSize || 14} onChange={(e) => updateForm("fontSize", parseInt(e.target.value) || 14)} />
                </div>
              </div>
              <div>
                <Label>Logo URL (optional)</Label>
                <Input value={form.logoUrl || ""} onChange={(e) => updateForm("logoUrl", e.target.value)} placeholder="https://example.com/logo.png" />
              </div>
            </div>

            {/* Content */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2"><Globe className="h-4 w-4" />Content</h3>
              <div>
                <Label>Heading</Label>
                <Input value={form.heading || ""} onChange={(e) => updateForm("heading", e.target.value)} />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={form.description || ""} onChange={(e) => updateForm("description", e.target.value)} rows={3} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Accept Button</Label>
                  <Input value={form.acceptAllText || ""} onChange={(e) => updateForm("acceptAllText", e.target.value)} />
                </div>
                <div>
                  <Label>Reject Button</Label>
                  <Input value={form.rejectAllText || ""} onChange={(e) => updateForm("rejectAllText", e.target.value)} />
                </div>
                <div>
                  <Label>Save Button</Label>
                  <Input value={form.savePrefsText || ""} onChange={(e) => updateForm("savePrefsText", e.target.value)} />
                </div>
              </div>
            </div>

            {/* Data Collection */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2"><Shield className="h-4 w-4" />Data Collection</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div><Label className="mb-0">Collect Name</Label><p className="text-xs text-muted-foreground">Ask for user's name</p></div>
                  <Switch checked={form.collectName || false} onCheckedChange={(v) => updateForm("collectName", v)} />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div><Label className="mb-0">Collect Email</Label><p className="text-xs text-muted-foreground">Ask for email address</p></div>
                  <Switch checked={form.collectEmail !== false} onCheckedChange={(v) => updateForm("collectEmail", v)} />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div><Label className="mb-0">Collect Phone</Label><p className="text-xs text-muted-foreground">Ask for phone number</p></div>
                  <Switch checked={form.collectPhone || false} onCheckedChange={(v) => updateForm("collectPhone", v)} />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div><Label className="mb-0">Require All Purposes</Label><p className="text-xs text-muted-foreground">Make all purposes mandatory</p></div>
                  <Switch checked={form.requireAllPurposes || false} onCheckedChange={(v) => updateForm("requireAllPurposes", v)} />
                </div>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div><Label className="mb-0">Show Privacy Link</Label><p className="text-xs text-muted-foreground">Display privacy policy link</p></div>
                <Switch checked={form.showPrivacyLink !== false} onCheckedChange={(v) => updateForm("showPrivacyLink", v)} />
              </div>
              {form.showPrivacyLink && (
                <div>
                  <Label>Privacy Policy URL</Label>
                  <Input value={form.privacyPolicyUrl || ""} onChange={(e) => updateForm("privacyPolicyUrl", e.target.value)} placeholder="https://example.com/privacy" />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t sticky bottom-0 bg-background pb-4">
              <Button variant="outline" onClick={closeBuilder} className="flex-1">Cancel</Button>
              <Button variant="secondary" onClick={() => handleSave("WIDGET_DRAFT")} className="flex-1" disabled={createMutation.isPending || updateMutation.isPending}>
                Save Draft
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
                  <pre className="whitespace-pre-wrap break-all">{`<script src="${window.location.origin}/api/v1/public/consent/widget-script/${embedAppId}" defer></script>`}</pre>
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
    </div>
  );
}
