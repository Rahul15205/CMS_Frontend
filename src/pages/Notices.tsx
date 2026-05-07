import { useState, useCallback, useEffect } from "react";
import { DashboardLayout, PageSection, SectionTitle } from "@/components/layout/DashboardLayout";
import { KPICard } from "@/components/dashboard/KPICard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  FileText,
  CheckCircle,
  Clock,
  Eye,
  Plus,
  Edit,
  History,
  Send,
  Users,
  Calendar,
  Globe,
  Settings,
  Languages,
  BookOpen,
  GitBranch,
  ShieldAlert,
  Copy,
  Layout,
  RefreshCw,
  Search,
  Trash2,
  ExternalLink,
  Shield,
  Monitor,
  Smartphone,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { noticesService } from "@/services/noticesService";
import { cookieWebsitesService } from "@/services/cookiesService";
import {
  NoticeRecord,
  NoticeType,
  NoticeLanguage,
  NoticeHistoryRecord,
  CreateNoticeTypeInput,
  CreateNoticeLanguageInput,
} from "@/components/notices/types";

// Helper function for status badges
const getStatusBadge = (status: string) => {
  switch (status) {
    case "NOTICE_ACTIVE":
    case "active":
      return <StatusBadge status="active">Published</StatusBadge>;
    case "NOTICE_DRAFT":
    case "draft":
      return <StatusBadge status="info">Draft</StatusBadge>;
    case "NOTICE_PENDING_REVIEW":
    case "pending_review":
      return <StatusBadge status="warning">Pending Review</StatusBadge>;
    case "NOTICE_ARCHIVED":
    case "archived":
      return <StatusBadge status="info">Archived</StatusBadge>;
    default:
      return <StatusBadge status="info">{status}</StatusBadge>;
  }
};

// User-Agent parser helper
const parseUserAgent = (ua: string) => {
  if (!ua) return { browser: 'Unknown', os: 'Unknown' };
  
  const uaLower = ua.toLowerCase();
  let browser = 'Browser';
  let os = 'OS';

  // Browser detection
  if (uaLower.includes('firefox')) browser = 'Firefox';
  else if (uaLower.includes('edg/')) browser = 'Edge';
  else if (uaLower.includes('chrome')) browser = 'Chrome';
  else if (uaLower.includes('safari')) browser = 'Safari';
  else if (uaLower.includes('opr/') || uaLower.includes('opera')) browser = 'Opera';
  else browser = 'Generic Browser';

  // OS detection
  if (uaLower.includes('win')) os = 'Windows';
  else if (uaLower.includes('android')) os = 'Android';
  else if (uaLower.includes('iphone') || uaLower.includes('ipad') || uaLower.includes('ipod')) os = 'iOS';
  else if (uaLower.includes('mac')) os = 'macOS';
  else if (uaLower.includes('linux')) os = 'Linux';
  else os = 'Unknown OS';

  return { browser, os };
};

import { NoticePreviewDialog } from "@/components/notices/NoticePreviewDialog";
import { NoticeEditorSheet } from "@/components/notices/NoticeEditorSheet";
import { AddNoticeTypeDialog } from "@/components/notices/AddNoticeTypeDialog";
import { AddLanguageDialog } from "@/components/notices/AddLanguageDialog";
import { LanguageSettingsDialog } from "@/components/notices/LanguageSettingsDialog";

export default function Notices() {
  const { toast } = useToast();
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // State for dynamic data
  const [noticesList, setNoticesList] = useState<NoticeRecord[]>([]);
  const [noticeTypes, setNoticeTypes] = useState<NoticeType[]>([]);
  const [languages, setLanguages] = useState<NoticeLanguage[]>([]);
  const [history, setHistory] = useState<NoticeHistoryRecord[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [websites, setWebsites] = useState<any[]>([]);
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<string>("all");

  const [selectedNotice, setSelectedNotice] = useState<any>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<NoticeLanguage | null>(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showEditorSheet, setShowEditorSheet] = useState(false);
  const [showAddNoticeTypeDialog, setShowAddNoticeTypeDialog] = useState(false);
  const [showAddLanguageDialog, setShowAddLanguageDialog] = useState(false);
  const [showLanguageSettingsDialog, setShowLanguageSettingsDialog] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<NoticeHistoryRecord | null>(null);
  const [showHistoryPreview, setShowHistoryPreview] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [noticesRes, historyRes, analyticsRes, typesRes, languagesRes, websitesRes] = await Promise.all([
        noticesService.getAll(),
        noticesService.getGlobalHistory(),
        noticesService.getAnalytics({ limit: 500 }),
        noticesService.getTypes(),
        noticesService.getLanguages(),
        cookieWebsitesService.getAll(),
      ]);

      if (noticesRes) {
        const noticesData = Array.isArray(noticesRes) ? noticesRes : noticesRes.data;
        setNoticesList(noticesData);
      }
      if (historyRes) setHistory(historyRes);
      if (analyticsRes) setAnalyticsData(analyticsRes.data || []);
      if (typesRes) setNoticeTypes(typesRes);
      if (languagesRes) setLanguages(languagesRes);
      if (websitesRes) setWebsites(websitesRes);

      // Fetch global history sample
      const globalHistory = await noticesService.getGlobalHistory();
      if (globalHistory) setHistory(globalHistory);

    } catch (err) {
      console.error("Failed to fetch notices data:", err);
      toast({
        title: "Error",
        description: "Failed to load notices data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateNotice = () => {
    setSelectedNotice(null);
    setShowEditorSheet(true);
  };

  const handleAddNoticeType = async (type: CreateNoticeTypeInput) => {
    try {
      const newType = await noticesService.createType(type);
      setNoticeTypes((prev) => [...prev, newType]);
      toast({
        title: "Success",
        description: "Notice type added successfully.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to add notice type.",
        variant: "destructive",
      });
    }
  };

  const handleViewNotice = (notice: NoticeRecord) => {
    setSelectedNotice(notice);
    setShowPreviewDialog(true);
  };

  const handleEditNotice = (notice: NoticeRecord) => {
    setSelectedNotice(notice);
    setShowEditorSheet(true);
  };

  const handlePublishNotice = async (noticeId: string) => {
    try {
      await noticesService.update(noticeId, { status: 'NOTICE_ACTIVE' as any });
      setNoticesList((prev) => prev.map(n => n.id === noticeId ? { ...n, status: 'NOTICE_ACTIVE' } : n));
      toast({
        title: "Success",
        description: "Privacy notice published successfully.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to publish notice.",
        variant: "destructive",
      });
    }
  };

  const handleSaveNotice = async (updatedNotice: NoticeRecord) => {
    try {
      if (!updatedNotice.id) {
        // Create new notice
        const newNotice = await noticesService.create(updatedNotice);
        setNoticesList((prev) => [...prev, newNotice]);
        toast({
          title: "Success",
          description: "Privacy notice created successfully.",
        });
      } else {
        // Update existing notice
        const res = await noticesService.update(updatedNotice.id, updatedNotice);
        setNoticesList((prev) => prev.map(n => n.id === updatedNotice.id ? res : n));
        toast({
          title: "Success",
          description: "Privacy notice updated successfully.",
        });
      }
      setShowEditorSheet(false);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to save notice.",
        variant: "destructive",
      });
    }
  };

  const handleAddLanguage = async (lang: CreateNoticeLanguageInput) => {
    try {
      const newLang = await noticesService.createLanguage(lang);
      if (lang.isDefault) {
        setLanguages((prev) => prev.map(l => ({ ...l, isDefault: false })).concat({ ...newLang, completion: 0 }));
      } else {
        setLanguages((prev) => [...prev, { ...newLang, completion: 0 }]);
      }
      toast({
        title: "Success",
        description: `${lang.name} added successfully.`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to add language.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateLanguage = async (code: string, data: { isDefault: boolean }) => {
    try {
      await noticesService.updateLanguage(code, data);
      if (data.isDefault) {
        setLanguages((prev) => prev.map(l => ({
          ...l,
          isDefault: l.code === code
        })));
      }
      toast({
        title: "Success",
        description: "Language settings updated.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update language.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteLanguage = async (code: string) => {
    try {
      await noticesService.deleteLanguage(code);
      setLanguages((prev) => prev.filter(l => l.code !== code));
      toast({
        title: "Success",
        description: "Language removed successfully.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to remove language.",
        variant: "destructive",
      });
    }
  };

  const openLanguageSettings = (lang: NoticeLanguage) => {
    setSelectedLanguage(lang);
    setShowLanguageSettingsDialog(true);
  };

  return (
    <DashboardLayout
      title="Notices"
      actions={
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" onClick={handleCreateNotice}>
                <Plus className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Create Notice</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Create Notice</TooltipContent>
          </Tooltip>
        </div>
      }
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger>
              <SelectValue placeholder="Select tab" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Overview</SelectItem>
              <SelectItem value="notices">All Notices</SelectItem>
              <SelectItem value="analytics">Visitor Analytics</SelectItem>
              <SelectItem value="integration">Integration</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Desktop Navigation */}
        <TabsList className="mb-8 p-1 bg-muted/30 rounded-xl border w-full grid grid-cols-4">
          <TabsTrigger value="overview" className="rounded-lg px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">Overview</TabsTrigger>
          <TabsTrigger value="notices" className="rounded-lg px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">All Notices</TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-lg px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">Visitor Analytics</TabsTrigger>
          <TabsTrigger value="integration" className="rounded-lg px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">Integration</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6">
          <PageSection className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {loading ? (
                Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)
              ) : (
                <>
                  <KPICard
                    title="Active Notices"
                    value={noticesList.filter(n => (n.status === 'NOTICE_ACTIVE' || n.status === 'active')).length.toString()}
                    icon={<FileText className="h-6 w-6" />}
                    variant="success"
                  />
                  <KPICard
                    title="Total Acknowledgements"
                    value={noticesList.reduce((acc, n) => acc + (Number(n.acknowledgements ?? n._count?.acknowledgements) || 0), 0).toLocaleString()}
                    icon={<CheckCircle className="h-6 w-6" />}
                    trend={{ value: 8, direction: "up" }}
                  />
                  <KPICard
                    title="Drafts & Under Review"
                    value={noticesList.filter(n => (n.status === 'NOTICE_DRAFT' || n.status === 'draft' || n.status === 'NOTICE_PENDING_REVIEW' || n.status === 'pending_review')).length.toString()}
                    icon={<Edit className="h-6 w-6" />}
                    variant="info"
                  />
                </>
              )}
            </div>
          </PageSection>

          <PageSection>
            <div className="dashboard-card">
              <SectionTitle>Recent Activity</SectionTitle>
              <div className="mt-4 space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                {loading ? (
                  Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)
                ) : history.length > 0 ? (
                  history.slice(0, 10).map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/30 transition-colors">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <History className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold truncate text-foreground">{item.title}</p>
                          <Badge variant="outline" className="text-[10px] shrink-0 font-mono">v{item.version}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{item.changes}</p>
                        <p className="text-[10px] text-muted-foreground/70 mt-1">{item.date}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground italic text-sm">
                    No recent activity
                  </div>
                )}
              </div>
            </div>
          </PageSection>
        </TabsContent>

        {/* ALL NOTICES TAB */}
        <TabsContent value="notices" className="space-y-6">
          <PageSection>
            <div className="dashboard-card">
              <div className="flex items-center justify-between mb-6">
                <SectionTitle>All Notices</SectionTitle>
                <div className="flex items-center gap-2">
                  <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <History className="h-4 w-4 mr-2" />
                        Version History
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
                      <DialogHeader>
                        <DialogTitle>Global Notice Version History</DialogTitle>
                        <DialogDescription>
                          Recent version updates across all privacy notices and policies.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="mt-4 border rounded-lg overflow-hidden">
                        <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
                          <Table>
                            <TableHeader className="sticky top-0 z-20 bg-background border-b">
                              <TableRow>
                                <TableHead className="w-[180px]">Notice Title</TableHead>
                                <TableHead className="w-[80px]">Version</TableHead>
                                <TableHead className="w-[100px]">Date</TableHead>
                                <TableHead className="w-[150px]">Author</TableHead>
                                <TableHead>Changes</TableHead>
                                <TableHead className="text-right w-[80px]">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                  <TableRow key={i}>
                                    <TableCell colSpan={6}><Skeleton className="h-8 w-full" /></TableCell>
                                  </TableRow>
                                ))
                              ) : history.length > 0 ? (
                                history.map((item, idx) => (
                                  <TableRow key={idx} className="hover:bg-muted/30 transition-colors">
                                    <TableCell className="font-medium">{item.title}</TableCell>
                                    <TableCell>
                                      <Badge variant="outline" className="text-xs font-mono">
                                        {item.version}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">{item.date}</TableCell>
                                    <TableCell className="text-xs text-muted-foreground truncate max-w-[150px]" title={item.author}>{item.author}</TableCell>
                                    <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate" title={item.changes}>
                                      {item.changes}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-8 w-8 p-0"
                                        onClick={() => {
                                          setSelectedHistoryItem(item);
                                          setShowHistoryPreview(true);
                                        }}
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))
                              ) : (
                                <TableRow>
                                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No history available</TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                      <div className="flex justify-end mt-4">
                         <Button variant="outline" onClick={() => setShowHistoryDialog(false)}>Close</Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* History Item Preview Sub-Dialog */}
                  <Dialog open={showHistoryPreview} onOpenChange={setShowHistoryPreview}>
                    <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
                      <DialogHeader>
                        <DialogTitle>Version Preview: {selectedHistoryItem?.title}</DialogTitle>
                        <DialogDescription>
                          Viewing version {selectedHistoryItem?.version} created on {selectedHistoryItem?.date}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex-1 overflow-hidden mt-4">
                        <div className="max-h-[60vh] overflow-y-auto border rounded-md p-6 bg-muted/10 custom-scrollbar">
                          <div className="prose prose-sm max-w-none dark:prose-invert">
                            {selectedHistoryItem && (selectedHistoryItem as any).content ? (
                              <div 
                                className="cms-html-render"
                                dangerouslySetInnerHTML={{ __html: (selectedHistoryItem as any).content }} 
                              />
                            ) : (
                              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground italic">
                                <FileText className="h-12 w-12 mb-2 opacity-20" />
                                <p>No content available for this version snapshot.</p>
                                <p className="text-xs mt-2">Historical content might be missing for very old versions.</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end mt-4">
                        <Button variant="outline" onClick={() => setShowHistoryPreview(false)}>Close Preview</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                  Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-[250px] w-full rounded-xl" />)
                ) : noticesList.length > 0 ? (
                  noticesList.map((notice) => (
                    <Card key={notice.id} className="hover:shadow-card-hover transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div>
                              <CardTitle className="text-base">{notice.title}</CardTitle>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Version {notice.version}
                              </p>
                            </div>
                          </div>
                          {getStatusBadge(notice.status)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Last Updated
                            </span>
                            <span className="font-medium">
                              {notice.lastUpdated || (notice.updatedAt ? new Date(notice.updatedAt).toLocaleDateString() : 'N/A')}
                            </span>
                          </div>

                          <>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                Acknowledged
                              </span>
                              <span className="font-medium text-success">
                                {(notice.acknowledgements ?? notice._count?.acknowledgements ?? 0).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Avg. Read Time
                              </span>
                              <span className="font-medium text-primary">
                                {notice.avgReadTime || 0}s
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Total Time Spent
                              </span>
                              <span className="font-medium text-success">
                                {notice.totalReadTime || 0}s
                              </span>
                            </div>
                          </>
                        </div>

                        <div className="flex items-center flex-wrap gap-2 mt-4 pt-4 border-t border-border">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="outline" size="sm" className="flex-1" onClick={() => handleViewNotice(notice)}>
                                <Eye className="h-4 w-4 sm:mr-1" />
                                <span className="hidden sm:inline">View</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>View Notice</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEditNotice(notice)}>
                                <Edit className="h-4 w-4 sm:mr-1" />
                                <span className="hidden sm:inline">Edit</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit Notice</TooltipContent>
                          </Tooltip>
                          {(notice.status === "NOTICE_DRAFT" || notice.status === "draft" || notice.status === "NOTICE_PENDING_REVIEW") && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button size="sm" className="flex-1" onClick={() => handlePublishNotice(notice.id)}>
                                  <Send className="h-4 w-4 sm:mr-1" />
                                  <span className="hidden sm:inline">Publish</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Publish Notice</TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full py-12 text-center text-muted-foreground">
                    No notices found. Get started by creating one.
                  </div>
                )}
              </div>
            </div>
          </PageSection>
        </TabsContent>

        {/* INTEGRATION TAB */}
        <TabsContent value="integration" className="space-y-6">
          <PageSection>
            <div className="dashboard-card">
              <div className="mb-6">
                <SectionTitle>Notice Integration</SectionTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Copy and paste this script into your website's <code className="bg-muted px-1 rounded">&lt;head&gt;</code> or <code className="bg-muted px-1 rounded">&lt;body&gt;</code> section to enable notice modals and widgets.
                </p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>1. Select Website</Label>
                  <Select value={selectedWebsiteId} onValueChange={setSelectedWebsiteId}>
                    <SelectTrigger className="w-full md:w-[400px]">
                      <SelectValue placeholder="Choose a website to get its script" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Select a Website</SelectItem>
                      {websites.map(site => (
                        <SelectItem key={site.id} value={site.id}>{site.name} ({site.url})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedWebsiteId !== "all" ? (
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <Label>2. Copy & Paste Integration Script</Label>
                      <div className="relative">
                        <div className="bg-slate-950 text-slate-50 p-4 rounded-xl font-mono text-sm border shadow-xl overflow-x-auto pr-12">
                          <pre>
                            {`<script src="${window.location.origin}/api/v1/public/notices/script/${selectedWebsiteId}" defer></script>`}
                          </pre>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="absolute top-3 right-3 text-slate-400 hover:text-white hover:bg-white/10"
                          onClick={() => {
                            const script = `<script src="${window.location.origin}/api/v1/public/notices/script/${selectedWebsiteId}" defer></script>`;
                            navigator.clipboard.writeText(script);
                            toast({
                              title: "Script Copied",
                              description: "The notice integration script has been copied to your clipboard.",
                            });
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 space-y-3">
                      <h4 className="text-sm font-semibold flex items-center gap-2">
                        <ShieldAlert className="h-4 w-4 text-primary" />
                        How to use the script?
                      </h4>
                      <div className="text-xs text-muted-foreground space-y-2">
                        <p>Once the script is loaded, you can open any active notice using JavaScript:</p>
                        <div className="bg-muted p-2 rounded font-mono">
                          ProteccioNotice.showByType('Privacy Policy');
                        </div>
                        <p>This allows you to link your "Privacy Policy" footer link directly to the managed content in this dashboard.</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-muted-foreground">
                    <Globe className="h-12 w-12 mb-4 opacity-20" />
                    <p>Select a website above to generate your integration script.</p>
                  </div>
                )}
              </div>
            </div>
          </PageSection>
        </TabsContent>


        {/* VISITOR ANALYTICS TAB */}
        <TabsContent value="analytics" className="space-y-6">
          <PageSection>
            <div className="dashboard-card">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <SectionTitle>Visitor Analytics</SectionTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Track who is visiting your notices and how much time they spend reading.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchData}>
                  <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
                  Refresh
                </Button>
              </div>

              <div className="max-h-[550px] overflow-y-auto border rounded-lg custom-scrollbar">
                <Table>
                  <TableHeader className="sticky top-0 z-20 bg-background border-b shadow-sm">
                    <TableRow>
                      <TableHead className="bg-background">Visitor (Email/IP)</TableHead>
                      <TableHead className="bg-background">Notice</TableHead>
                      <TableHead className="bg-background">Language</TableHead>
                      <TableHead className="bg-background">Time Spent</TableHead>
                      <TableHead className="bg-background">Device/Browser</TableHead>
                      <TableHead className="text-right bg-background">Visit Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analyticsData.length > 0 ? (
                        analyticsData.map((log, idx) => (
                          <TableRow key={idx} className="hover:bg-muted/30 transition-all">
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-semibold text-sm text-primary">
                                  {log.userEmail || log.userId || "Anonymous"}
                                </span>
                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                  <Globe className="h-3 w-3" />
                                  {log.ipAddress || "Unknown IP"}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-xs font-medium">{log.notice?.title || "N/A"}</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="text-[10px] uppercase font-bold">
                                {log.language || "EN"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs">
                              <span className="text-success font-medium flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {log.viewDuration || 0}s
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                  <div className="p-1 rounded bg-primary/10 text-primary">
                                    {(() => {
                                      const { os } = parseUserAgent(log.userAgent);
                                      return (os === 'Android' || os === 'iOS') 
                                        ? <Smartphone className="h-3 w-3" /> 
                                        : <Monitor className="h-3 w-3" />;
                                    })()}
                                  </div>
                                  <span className="text-xs font-semibold text-foreground">
                                    {parseUserAgent(log.userAgent).browser}
                                  </span>
                                </div>
                                <span className="text-[10px] text-muted-foreground font-medium ml-7">
                                  on {parseUserAgent(log.userAgent).os}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right text-[10px] text-muted-foreground font-mono">
                              {log.acknowledgedAt ? new Date(log.acknowledgedAt).toLocaleString() : "N/A"}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-20 text-muted-foreground italic">
                            No visitor data available yet.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </PageSection>
          </TabsContent>
        </Tabs>

      {/* View Notice Dialog */}
      <NoticePreviewDialog
        open={showPreviewDialog}
        onOpenChange={setShowPreviewDialog}
        notice={selectedNotice}
        languages={languages}
        onEdit={(notice) => {
          setShowPreviewDialog(false);
          handleEditNotice(notice);
        }}
      />

      {/* Edit Notice Sheet */}
      <NoticeEditorSheet
        open={showEditorSheet}
        onOpenChange={setShowEditorSheet}
        notice={selectedNotice}
        onSave={handleSaveNotice}
        noticeTypes={noticeTypes}
        languages={languages}
      />

      <AddNoticeTypeDialog
        open={showAddNoticeTypeDialog}
        onOpenChange={setShowAddNoticeTypeDialog}
        onAdd={handleAddNoticeType}
      />

      <AddLanguageDialog
        open={showAddLanguageDialog}
        onOpenChange={setShowAddLanguageDialog}
        onAdd={handleAddLanguage}
        existingCodes={languages.map(l => l.code)}
      />

      <LanguageSettingsDialog
        open={showLanguageSettingsDialog}
        onOpenChange={setShowLanguageSettingsDialog}
        language={selectedLanguage}
        onUpdate={handleUpdateLanguage}
        onDelete={handleDeleteLanguage}
      />
    </DashboardLayout>
  );
}
