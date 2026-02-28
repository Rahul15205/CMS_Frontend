import { useState } from "react";
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

// Mock data for versions
const mockVersions: ConsentVersion[] = [
  {
    id: "v-001",
    templateId: "tpl-001",
    templateName: "Marketing Communications Consent",
    version: "2.1",
    status: "active",
    changeSummary: "Updated data retention period from 1 year to 2 years",
    changedFields: ["retention.period", "retention.justification"],
    changeReason: "Legal compliance update for extended marketing campaigns",
    approvedBy: "Legal Team Lead",
    approvalTimestamp: "2024-01-20T10:30:00Z",
    effectiveFrom: "2024-01-21",
    effectiveTo: null,
    usersImpacted: 12500,
    reconsentTriggered: false,
    createdAt: "2024-01-20",
    createdBy: "Admin User",
  },
  {
    id: "v-002",
    templateId: "tpl-001",
    templateName: "Marketing Communications Consent",
    version: "2.0",
    status: "archived",
    changeSummary: "Added GDPR compliance fields and withdrawal mechanism",
    changedFields: ["regulations", "withdrawal.method", "withdrawal.effect"],
    changeReason: "EU market expansion requires GDPR compliance",
    approvedBy: "DPO",
    approvalTimestamp: "2024-01-01T09:00:00Z",
    effectiveFrom: "2024-01-01",
    effectiveTo: "2024-01-20",
    usersImpacted: 8000,
    reconsentTriggered: true,
    createdAt: "2023-12-28",
    createdBy: "DPO",
  },
  {
    id: "v-003",
    templateId: "tpl-001",
    templateName: "Marketing Communications Consent",
    version: "1.0",
    status: "locked",
    changeSummary: "Initial version - Marketing consent template",
    changedFields: [],
    changeReason: "Initial release",
    approvedBy: "Admin User",
    approvalTimestamp: "2023-06-01T08:00:00Z",
    effectiveFrom: "2023-06-01",
    effectiveTo: "2023-12-31",
    usersImpacted: 5000,
    reconsentTriggered: false,
    createdAt: "2023-06-01",
    createdBy: "Admin User",
  },
  {
    id: "v-004",
    templateId: "tpl-002",
    templateName: "Data Analytics Processing",
    version: "1.0",
    status: "active",
    changeSummary: "Initial version - Analytics consent template",
    changedFields: [],
    changeReason: "Initial release for analytics feature",
    approvedBy: "DPO",
    approvalTimestamp: "2024-02-01T11:00:00Z",
    effectiveFrom: "2024-02-01",
    effectiveTo: null,
    usersImpacted: 3200,
    reconsentTriggered: false,
    createdAt: "2024-02-01",
    createdBy: "DPO",
  },
];

const getStatusBadge = (status: ConsentVersion["status"]) => {
  switch (status) {
    case "active":
      return <Badge className="bg-success/10 text-success border-success/20">Active</Badge>;
    case "archived":
      return <Badge variant="secondary">Archived</Badge>;
    case "locked":
      return <Badge className="bg-warning/10 text-warning border-warning/20">Locked</Badge>;
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

  const templates = [...new Set(mockVersions.map((v) => v.templateName))];

  const filteredVersions = mockVersions.filter((version) => {
    const matchesSearch =
      version.templateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      version.changeSummary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || version.status === statusFilter;
    const matchesTemplate = templateFilter === "all" || version.templateName === templateFilter;
    return matchesSearch && matchesStatus && matchesTemplate;
  });

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
    mockVersions.find((v) => v.id === id)
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
                <p className="text-2xl font-bold">{mockVersions.length}</p>
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
                  {mockVersions.filter((v) => v.status === "active").length}
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
                  {mockVersions.filter((v) => v.reconsentTriggered).length}
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
                  {mockVersions.reduce((acc, v) => acc + v.usersImpacted, 0).toLocaleString()}
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
                <SelectItem key={template} value={template}>
                  {template}
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
            {filteredVersions.map((version) => (
              <>
                <TableRow
                  key={version.id}
                  className={`hover:bg-muted/30 cursor-pointer ${selectedVersions.includes(version.id) ? "bg-primary/5" : ""
                    }`}
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
                      {version.changeSummary}
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
                      {version.effectiveFrom}
                      {version.effectiveTo && ` - ${version.effectiveTo}`}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{version.usersImpacted.toLocaleString()}</span>
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
                      {version.status === "active" && (
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
                            {version.changeSummary}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            <strong>Reason:</strong> {version.changeReason}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-2">Changed Fields</h4>
                          <div className="flex flex-wrap gap-1">
                            {version.changedFields.length > 0 ? (
                              version.changedFields.map((field) => (
                                <Badge key={field} variant="outline" className="text-xs">
                                  {field}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                Initial version - no changes
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
            ))}
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
