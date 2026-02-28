import { useState } from "react";
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
import {
  mockNoticeHistory as mockHistory,
  mockNoticeLanguages as mockLanguages,
  mockNotices as notices,
  mockNoticeTypes,
} from "@/data/mockNotices";

const getStatusBadge = (status: string) => {
  switch (status) {
    case "active":
      return <StatusBadge status="active">Published</StatusBadge>;
    case "draft":
      return <StatusBadge status="info">Draft</StatusBadge>;
    case "pending_review":
      return <StatusBadge status="warning">Pending Review</StatusBadge>;
    case "archived":
      return <StatusBadge status="info">Archived</StatusBadge>;
    default:
      return <StatusBadge status="info">{status}</StatusBadge>;
  }
};

import { NoticePreviewDialog } from "@/components/notices/NoticePreviewDialog";
import { NoticeEditorSheet } from "@/components/notices/NoticeEditorSheet";
import { AddNoticeTypeDialog } from "@/components/notices/AddNoticeTypeDialog";

export default function Notices() {
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // New State for View/Edit
  const [noticesList, setNoticesList] = useState(notices);
  const [selectedNotice, setSelectedNotice] = useState<any>(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showEditorSheet, setShowEditorSheet] = useState(false);
  const [showAddNoticeTypeDialog, setShowAddNoticeTypeDialog] = useState(false);
  const [noticeTypes, setNoticeTypes] = useState(mockNoticeTypes);

  const handleCreateNotice = () => {
    setSelectedNotice(null);
    setShowEditorSheet(true);
  };

  const handleAddNoticeType = (type: any) => {
    setNoticeTypes((prev) => [...prev, type]);
  };

  const handleViewNotice = (notice: any) => {
    setSelectedNotice(notice);
    setShowPreviewDialog(true);
  };

  const handleEditNotice = (notice: any) => {
    setSelectedNotice(notice);
    setShowEditorSheet(true);
  };

  const handleSaveNotice = (updatedNotice: any) => {
    if (!updatedNotice.id) {
      // Create new notice
      const newNotice = {
        ...updatedNotice,
        id: `NOT-${String(noticesList.length + 1).padStart(3, '0')}`,
      };
      setNoticesList([...noticesList, newNotice]);
    } else {
      // Update existing notice
      setNoticesList(noticesList.map(n => n.id === updatedNotice.id ? updatedNotice : n));
    }
    setShowEditorSheet(false);
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
              <SelectItem value="localization">Localization</SelectItem>
              <SelectItem value="settings">Settings</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Desktop Navigation */}
        <TabsList className="hidden md:grid w-full grid-cols-4 lg:w-auto bg-muted/50 p-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="notices">All Notices</TabsTrigger>
          <TabsTrigger value="localization">Localization</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6">
          <PageSection className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard
                title="Active Notices"
                value="4"
                icon={<FileText className="h-6 w-6" />}
                variant="success"
              />
              <KPICard
                title="Total Acknowledgements"
                value="25,640"
                icon={<CheckCircle className="h-6 w-6" />}
                trend={{ value: 8, direction: "up" }}
              />
              <KPICard
                title="Pending Acknowledgements"
                value="663"
                icon={<Clock className="h-6 w-6" />}
                variant="warning"
              />
              <KPICard
                title="Drafts & Under Review"
                value="2"
                icon={<Edit className="h-6 w-6" />}
                variant="info"
              />
            </div>
          </PageSection>

          <PageSection>
            <div className="dashboard-card">
              <SectionTitle>Recent Activity</SectionTitle>
              <div className="mt-4 space-y-4">
                {mockHistory.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      <History className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.changes}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="mb-1">{item.version}</Badge>
                      <p className="text-xs text-muted-foreground">{item.date}</p>
                    </div>
                  </div>
                ))}
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
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Global Notice Version History</DialogTitle>
                        <DialogDescription>
                          Recent version updates across all privacy notices and policies.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="border rounded-lg overflow-hidden mt-4">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/50">
                              <TableHead>Notice Title</TableHead>
                              <TableHead>Version</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead>Author</TableHead>
                              <TableHead>Changes</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {mockHistory.map((item, idx) => (
                              <TableRow key={idx}>
                                <TableCell className="font-medium">{item.title}</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="text-xs font-mono">
                                    {item.version}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground">{item.date}</TableCell>
                                <TableCell className="text-xs text-muted-foreground">{item.author}</TableCell>
                                <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate" title={item.changes}>
                                  {item.changes}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {noticesList.map((notice) => (
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
                          <span className="font-medium">{notice.lastUpdated}</span>
                        </div>

                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              Acknowledged
                            </span>
                            <span className="font-medium text-success">
                              {notice.acknowledgements.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Pending</span>
                            <span className="font-medium text-warning">
                              {notice.pendingAck}
                            </span>
                          </div>

                          {/* Acknowledgement Progress */}
                          <div className="pt-2">
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-success rounded-full"
                                style={{
                                  width: `${(notice.acknowledgements / ((notice.acknowledgements + notice.pendingAck) || 1)) * 100}%`,
                                }}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 text-right">
                              {((notice.acknowledgements / ((notice.acknowledgements + notice.pendingAck) || 1)) * 100).toFixed(1)}% acknowledged
                            </p>
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
                        {notice.status === "draft" && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button size="sm" className="flex-1">
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
                ))}
              </div>
            </div>
          </PageSection>
        </TabsContent>

        {/* LOCALIZATION TAB */}
        <TabsContent value="localization" className="space-y-6">
          <PageSection>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="dashboard-card lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <SectionTitle>Supported Languages</SectionTitle>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Language
                  </Button>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Language</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Default</TableHead>
                        <TableHead>Translation Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockLanguages.map((lang) => (
                        <TableRow key={lang.code}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4 text-muted-foreground" />
                              {lang.name}
                            </div>
                          </TableCell>
                          <TableCell><Badge variant="outline" className="font-mono text-xs">{lang.code}</Badge></TableCell>
                          <TableCell>
                            {lang.isDefault && <Badge variant="secondary">Default</Badge>}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden w-20">
                                <div className="h-full bg-primary" style={{ width: `${lang.completion}%` }} />
                              </div>
                              <span className="text-xs text-muted-foreground">{lang.completion}%</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
              <div className="dashboard-card">
                <SectionTitle>Summary</SectionTitle>
                <div className="space-y-4 mt-4">
                  <div className="p-4 bg-muted/30 rounded-lg border border-border">
                    <h4 className="font-semibold text-2xl">4</h4>
                    <p className="text-sm text-muted-foreground">Active Languages</p>
                  </div>
                  <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
                    <h4 className="font-semibold text-2xl text-warning">12</h4>
                    <p className="text-sm text-warning-foreground">Missing Translations</p>
                  </div>
                </div>
              </div>
            </div>
          </PageSection>
        </TabsContent>

        {/* SETTINGS TAB */}
        <TabsContent value="settings" className="space-y-6">
          <PageSection>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="dashboard-card">
                <div className="flex items-center justify-between mb-4">
                  <SectionTitle>Notice Configuration</SectionTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowAddNoticeTypeDialog(true)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-4">
                  {noticeTypes.map((type) => (
                    <div key={type.id} className="flex items-start justify-between p-3 border rounded-lg bg-card">
                      <div className="flex gap-3">
                        <div className="p-2 bg-muted rounded-md">
                          <BookOpen className="h-4 w-4 text-foreground" />
                        </div>
                        <div>
                          <h5 className="font-medium text-sm">{type.name}</h5>
                          <p className="text-xs text-muted-foreground">{type.description}</p>
                        </div>
                      </div>
                      {type.required && <Badge variant="outline" className="text-[10px]">Required</Badge>}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="dashboard-card">
                  <SectionTitle className="mb-4">Versioning & Archival</SectionTitle>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Auto-Archive Old Versions</Label>
                        <div className="text-sm text-muted-foreground">Automatically archive versions when a new one is published</div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Require Major Version Review</Label>
                        <div className="text-sm text-muted-foreground">Force manual approval for major version increments (e.g., 1.x to 2.0)</div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>

                <div className="dashboard-card">
                  <SectionTitle className="mb-4">Notice Settings</SectionTitle>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Default Language</Label>
                      <Select defaultValue="en">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <div className="space-y-0.5">
                        <Label>Enforce Acknowledgement</Label>
                        <div className="text-sm text-muted-foreground">Block app access until critical notices are accepted</div>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>
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
      />

      <AddNoticeTypeDialog
        open={showAddNoticeTypeDialog}
        onOpenChange={setShowAddNoticeTypeDialog}
        onAdd={handleAddNoticeType}
      />
    </DashboardLayout >
  );
}
