import { useState, useEffect } from "react";
import { rightsService } from "@/services/rightsService";
import { handleApiError } from "@/lib/errorHandler";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Filter,
  Download,
  Eye,
  FileText,
  Image,
  File,
  Shield,
  Trash2,
  Mail,
  MoreHorizontal,
  Upload,
  History,
  CheckCircle,
  AlertTriangle,
  Clock,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface EvidenceItem {
  id: string;
  caseNumber: string;
  fileName: string;
  fileType: string;
  category: string;
  uploadedBy: string;
  uploadedAt: string;
  size: string;
  verified: boolean;
}

interface AuditRecord {
  id: string;
  caseNumber: string;
  action: string;
  performedBy: string;
  performedAt: string;
  details: string;
  system: string;
  consentVersion?: string;
  severity: "info" | "warning" | "critical";
}

const getFileIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "pdf":
      return <FileText className="h-4 w-4 text-destructive" />;
    case "xlsx":
    case "csv":
      return <File className="h-4 w-4 text-success" />;
    case "json":
    case "txt":
      return <File className="h-4 w-4 text-warning" />;
    case "jpg":
    case "png":
    case "jpeg":
    case "gif":
      return <Image className="h-4 w-4 text-info" />;
    default:
      return <File className="h-4 w-4" />;
  }
};

const getSeverityBadge = (severity: string) => {
  switch (severity.toLowerCase()) {
    case "critical":
      return <Badge variant="destructive">Critical</Badge>;
    case "warning":
      return <Badge className="bg-warning text-warning-foreground">Warning</Badge>;
    default:
      return <Badge variant="secondary">Info</Badge>;
  }
};

export function RightsEvidence() {
  const [evidenceData, setEvidenceData] = useState<EvidenceItem[]>([]);
  const [auditData, setAuditData] = useState<AuditRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"evidence" | "audit">("evidence");
  const [viewingEvidence, setViewingEvidence] = useState<EvidenceItem | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [evidence, audit] = await Promise.all([
          rightsService.getEvidence(),
          rightsService.getAuditTrail()
        ]);
        setEvidenceData(evidence || []);
        setAuditData(audit || []);
      } catch (error) {
        handleApiError(error, 'Rights Evidence');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredEvidence = evidenceData.filter((item) => {
    const matchesSearch =
      (item.caseNumber || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.fileName || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredAudit = auditData.filter((item) =>
    (item.caseNumber || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.action || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading && evidenceData.length === 0 && auditData.length === 0) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading evidence repository...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{evidenceData.length}</p>
                <p className="text-sm text-muted-foreground">Total Evidence</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{evidenceData.filter(e => e.verified).length}</p>
                <p className="text-sm text-muted-foreground">Verified</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-warning/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{evidenceData.filter(e => !e.verified).length}</p>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-info/10 flex items-center justify-center">
                <History className="h-6 w-6 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">{auditData.length}</p>
                <p className="text-sm text-muted-foreground">Audit Entries</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Toggle */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === "evidence" ? "default" : "outline"}
          onClick={() => setActiveTab("evidence")}
        >
          <FileText className="h-4 w-4 mr-2" />
          Evidence Repository
        </Button>
        <Button
          variant={activeTab === "audit" ? "default" : "outline"}
          onClick={() => setActiveTab("audit")}
        >
          <History className="h-4 w-4 mr-2" />
          Audit Trail
        </Button>
      </div>

      {/* Filters */}
      <div className="dashboard-card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by case number or file name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          {activeTab === "evidence" && (
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Identity Proof">Identity Proof</SelectItem>
                <SelectItem value="Data Extract">Data Extract</SelectItem>
                <SelectItem value="Deletion Confirmation">Deletion Confirmation</SelectItem>
                <SelectItem value="Communication">Communication</SelectItem>
              </SelectContent>
            </Select>
          )}
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          {activeTab === "evidence" && (
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          )}
        </div>
      </div>

      {/* Evidence Table */}
      {activeTab === "evidence" && (
        <div className="dashboard-card p-0 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File</TableHead>
                <TableHead>Case #</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Uploaded By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvidence.length > 0 ? (
                filteredEvidence.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getFileIcon(item.fileType)}
                        <span className="font-medium">{item.fileName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.caseNumber}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{item.category}</Badge>
                    </TableCell>
                    <TableCell>{item.uploadedBy}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(item.uploadedAt)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{item.size}</TableCell>
                    <TableCell>
                      {item.verified ? (
                        <Badge className="bg-success/10 text-success">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setViewingEvidence(item)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Shield className="h-4 w-4 mr-2" />
                            Verify
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    No evidence items found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Audit Table */}
      {activeTab === "audit" && (
        <div className="dashboard-card p-0 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Case #</TableHead>
                <TableHead>Performed By</TableHead>
                <TableHead>System</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAudit.length > 0 ? (
                filteredAudit.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.action}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{record.caseNumber}</Badge>
                    </TableCell>
                    <TableCell>{record.performedBy}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{record.system}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(record.performedAt)}
                    </TableCell>
                    <TableCell>{getSeverityBadge(record.severity)}</TableCell>
                    <TableCell className="max-w-[300px] truncate text-muted-foreground">
                      {record.details}
                      {record.consentVersion && (
                        <Badge variant="outline" className="ml-2">
                          {record.consentVersion}
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No audit records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Evidence View Dialog */}
      <Dialog open={!!viewingEvidence} onOpenChange={(open) => !open && setViewingEvidence(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {viewingEvidence && getFileIcon(viewingEvidence.fileType)}
              Evidence Details
            </DialogTitle>
            <DialogDescription>
              Viewing evidence file for Case {viewingEvidence?.caseNumber}
            </DialogDescription>
          </DialogHeader>

          {viewingEvidence && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <span className="text-muted-foreground">File Name</span>
                  <p className="font-medium">{viewingEvidence.fileName}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">Category</span>
                  <p className="font-medium">{viewingEvidence.category}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">Uploaded By</span>
                  <p className="font-medium">{viewingEvidence.uploadedBy}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">Upload Date</span>
                  <p className="font-medium">{formatDate(viewingEvidence.uploadedAt)}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">File Size</span>
                  <p className="font-medium">{viewingEvidence.size}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">Verification Status</span>
                  <div>
                    {viewingEvidence.verified ? (
                      <Badge className="bg-success/10 text-success">Verified</Badge>
                    ) : (
                      <Badge variant="secondary">Pending Review</Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-8 bg-muted/20 flex flex-col items-center justify-center text-center gap-4 min-h-[300px]">
                <FileText className="h-16 w-16 text-muted-foreground/50" />
                <div className="space-y-1">
                  <p className="font-medium">Preview Unavailable</p>
                  <p className="text-sm text-muted-foreground">
                    This file type ({viewingEvidence.fileType}) cannot be previewed directly.
                  </p>
                </div>
                <Button variant="outline" className="mt-2">
                  <Download className="h-4 w-4 mr-2" />
                  Download to View
                </Button>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingEvidence(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
