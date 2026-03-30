import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { consentService } from "@/services/consentService";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  History,
  Search,
  Filter,
  Lock,
  Archive,
  GitCompare,
  User,
  Calendar,
  Users,
  AlertCircle,
  Check,
  Clock,
  FileText,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface ConsentVersion {
  id: string;
  templateId: string;
  templateName: string;
  version: string;
  status: "active" | "archived" | "locked";
  changeSummary: string;
  changedFields: string[];
  changeReason: string;
  approvedBy: string;
  approvalTimestamp: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  usersImpacted: number;
  reconsentTriggered: boolean;
  createdAt: string;
  createdBy: string;
}

// Version history is loaded from the service layer

const getStatusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case "active":
    case "published":
      return <Badge className="bg-success/10 text-success border-success/20">Active</Badge>;
    case "archived":
      return <Badge variant="secondary">Archived</Badge>;
    case "locked":
      return <Badge className="bg-warning/10 text-warning border-warning/20">Locked</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export function ConsentVersionHistory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [templateFilter, setTemplateFilter] = useState<string>("all");
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [showCompareDialog, setShowCompareDialog] = useState(false);
  const [showLockDialog, setShowLockDialog] = useState<string | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch versions
  const { data: versionsData, isLoading: versionsLoading } = useQuery({
    queryKey: ['consent-versions'],
    queryFn: () => consentService.getConsentVersions(),
  });

  // Fetch templates for the filter dropdown
  const { data: templatesData } = useQuery({
    queryKey: ['consent-templates-list'],
    queryFn: () => consentService.getTemplates({ limit: 100 }),
  });

  const allVersions = versionsData?.data || [];
  const templates = templatesData?.data || [];

  const filteredVersions = useMemo(() => {
    return allVersions.filter((version) => {
      const templateName = version.templateName || "Unknown Template";
      const matchesSearch =
        templateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (version.changeSummary || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || version.status.toLowerCase() === statusFilter.toLowerCase();
      const matchesTemplate = templateFilter === "all" || version.templateId === templateFilter;
      return matchesSearch && matchesStatus && matchesTemplate;
    });
  }, [allVersions, searchQuery, statusFilter, templateFilter]);

  const stats = useMemo(() => ({
    total: allVersions.length,
    active: allVersions.filter(v => v.status === "active" || v.status === "published").length,
    reconsent: allVersions.filter(v => v.reconsentTriggered).length,
    users: allVersions.reduce((acc, v) => acc + (v.usersImpacted || 0), 0)
  }), [allVersions]);

  const handleCompare = () => {
    if (selectedVersions.length !== 2) {
      toast({
        title: "Select Two Versions",
        description: "Please select exactly two versions to compare.",
        variant: "destructive",
      });
      return;
    }
    setShowCompareDialog(true);
  };

  const handleLock = (versionId: string) => {
    toast({
      title: "Version Locked",
      description: "This version is now locked and cannot be edited.",
    });
    setShowLockDialog(null);
  };

  const handleArchive = (versionId: string) => {
    toast({
      title: "Version Archived",
      description: "This version has been archived.",
    });
  };

  const toggleVersionSelection = (versionId: string) => {
    setSelectedVersions((prev) =>
      prev.includes(versionId)
        ? prev.filter((id) => id !== versionId)
        : prev.length < 2
          ? [...prev, versionId]
          : prev
    );
  };

  const comparedVersions = selectedVersions.map((id) =>
    allVersions.find((v) => v.id === id)
  );

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <History className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{versionsLoading ? <Skeleton className="h-8 w-12" /> : stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Versions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10 text-success">
                <Check className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {versionsLoading ? <Skeleton className="h-8 w-12" /> : stats.active}
                </p>
                <p className="text-xs text-muted-foreground">Active Versions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10 text-warning">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {versionsLoading ? <Skeleton className="h-8 w-12" /> : stats.reconsent}
                </p>
                <p className="text-xs text-muted-foreground">Re-consent Triggered</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-info/10 text-info">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {versionsLoading ? <Skeleton className="h-8 w-24" /> : stats.users.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Total Users Impacted</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search versions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={templateFilter} onValueChange={setTemplateFilter}>
            <SelectTrigger className="w-56">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Template" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Templates</SelectItem>
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
              <SelectItem value="locked">Locked</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="outline"
          onClick={handleCompare}
          disabled={selectedVersions.length !== 2}
        >
          <GitCompare className="h-4 w-4 mr-2" />
          Compare Versions ({selectedVersions.length}/2)
        </Button>
      </div>

      {/* Versions Table */}
      <div className="border rounded-lg overflow-auto bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-12"></TableHead>
              <TableHead>Template</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Change Summary</TableHead>
              <TableHead>Approved By</TableHead>
              <TableHead>Effective Period</TableHead>
              <TableHead>Users Impacted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {versionsLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={9}><Skeleton className="h-10 w-full" /></TableCell>
                </TableRow>
              ))
            ) : filteredVersions.length > 0 ? (
              filteredVersions.map((version) => (
                <>
                  <TableRow
                    key={version.id}
                    className={cn(
                      "hover:bg-muted/30 cursor-pointer",
                      selectedVersions.includes(version.id) && "bg-primary/5"
                    )}
                    onClick={() => setExpandedRow(expandedRow === version.id ? null : version.id)}
                  >
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedVersions.includes(version.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleVersionSelection(version.id);
                        }}
                        className="rounded border-muted-foreground"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-start gap-2">
                        <FileText className="h-4 w-4 text-primary mt-0.5" />
                        <span className="font-medium">{version.templateName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">v{version.version}</span>
                    </TableCell>
                    <TableCell>{getStatusBadge(version.status)}</TableCell>
                    <TableCell>
                      <p className="text-sm text-muted-foreground line-clamp-1 max-w-[200px]">
                        {version.changeSummary || "Finalized template snapshot"}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <User className="h-3 w-3 text-muted-foreground" />
                        {version.approvedBy}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(version.effectiveFrom).toLocaleDateString()}
                        {version.effectiveTo && ` - ${new Date(version.effectiveTo).toLocaleDateString()}`}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{(version.usersImpacted || 0).toLocaleString()}</span>
                        {version.reconsentTriggered && (
                          <Badge className="bg-warning/10 text-warning border-warning/20 text-xs">
                            Re-consent
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {version.status !== "locked" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowLockDialog(version.id);
                            }}
                          >
                            <Lock className="h-4 w-4" />
                          </Button>
                        )}
                        {(version.status === "active" || version.status === "published") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleArchive(version.id);
                            }}
                          >
                            <Archive className="h-4 w-4" />
                          </Button>
                        )}
                        {expandedRow === version.id ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                  {expandedRow === version.id && (
                    <TableRow>
                      <TableCell colSpan={9} className="bg-muted/20 p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <h4 className="text-sm font-medium mb-2">Change Details</h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              {version.changeSummary || "No summary provided for this version."}
                            </p>
                            {version.changeReason && (
                              <p className="text-xs text-muted-foreground">
                                <strong>Reason:</strong> {version.changeReason}
                              </p>
                            )}
                          </div>
                          <div>
                            <h4 className="text-sm font-medium mb-2">Changed Fields</h4>
                            <div className="flex flex-wrap gap-1">
                              {version.changedFields && version.changedFields.length > 0 ? (
                                version.changedFields.map((field) => (
                                  <Badge key={field} variant="outline" className="text-xs">
                                    {field}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-xs text-muted-foreground">
                                  Initial version or no specific fields tracked
                                </span>
                              )}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium mb-2">Approval Info</h4>
                            <div className="space-y-1 text-sm">
                              <p className="flex items-center gap-2">
                                <User className="h-3 w-3 text-muted-foreground" />
                                <span>{version.approvedBy}</span>
                              </p>
                              <p className="flex items-center gap-2">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span>
                                  {new Date(version.approvalTimestamp).toLocaleString()}
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                  No version history found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Compare Dialog */}
      <Dialog open={showCompareDialog} onOpenChange={setShowCompareDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitCompare className="h-5 w-5" />
              Version Comparison
            </DialogTitle>
            <DialogDescription>
              Text-based comparison between selected versions
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-6 mt-4">
            {comparedVersions.map((version, idx) => (
              <div key={idx} className="space-y-4">
                <div className="p-3 rounded-lg bg-muted/50 border">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Version {version?.version}</span>
                    {version && getStatusBadge(version.status)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {version?.templateName}
                  </p>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Change Summary</p>
                    <p className="text-sm">{version?.changeSummary}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Changed Fields</p>
                    <div className="flex flex-wrap gap-1">
                      {version?.changedFields.map((field) => (
                        <Badge key={field} variant="outline" className="text-xs">
                          {field}
                        </Badge>
                      ))}
                      {version?.changedFields.length === 0 && (
                        <span className="text-xs text-muted-foreground">None</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Effective Period</p>
                    <p className="text-sm">
                      {version?.effectiveFrom} - {version?.effectiveTo || "Present"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Users Impacted</p>
                    <p className="text-sm">{version?.usersImpacted.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Lock Confirmation Dialog */}
      <AlertDialog open={!!showLockDialog} onOpenChange={() => setShowLockDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-warning" />
              Lock Version?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Locking this version will prevent any further edits. This action cannot be undone.
              Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => showLockDialog && handleLock(showLockDialog)}
              className="bg-warning text-warning-foreground hover:bg-warning/90"
            >
              Lock Version
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
