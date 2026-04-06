import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  FileText,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Copy,
  Archive,
  CheckSquare,
  ToggleLeft,
  Lock,
  ListChecks,
  Globe,
  Clock,
  User,
  Users,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ConsentTemplate,
  ConsentType,
  Regulation,
  TemplateStatus,
  REGULATION_INFO,
  CONSENT_TYPE_INFO
} from "./types";

// Templates are loaded from the live consent service

const getConsentTypeIcon = (type: ConsentType) => {
  switch (type) {
    case "explicit": return <CheckSquare className="h-4 w-4" />;
    case "optional": return <ToggleLeft className="h-4 w-4" />;
    case "mandatory": return <Lock className="h-4 w-4" />;
    case "granular": return <ListChecks className="h-4 w-4" />;
    case "parental": return <Users className="h-4 w-4" />;
    default: return <Eye className="h-4 w-4" />;
  }
};

const getStatusBadge = (status: TemplateStatus) => {
  switch (status) {
    case "active":
      return <Badge className="bg-success/10 text-success border-success/20">Active</Badge>;
    case "draft":
      return <Badge className="bg-warning/10 text-warning border-warning/20">Draft</Badge>;
    case "archived":
      return <Badge variant="secondary">Archived</Badge>;
  }
};

interface ConsentTemplateListProps {
  templates: ConsentTemplate[];
  isLoading?: boolean;
  onCreateNew: () => void;
  onEdit: (template: ConsentTemplate) => void;
  onView: (template: ConsentTemplate) => void;
  onClone: (template: ConsentTemplate) => void;
  onArchive: (template: ConsentTemplate) => void;
  onRefresh?: () => void;
}

export function ConsentTemplateList({ 
  templates, 
  isLoading, 
  onCreateNew, 
  onEdit, 
  onView,
  onClone,
  onArchive,
  onRefresh
}: ConsentTemplateListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [regulationFilter, setRegulationFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || template.type === typeFilter;
    const matchesRegulation = regulationFilter === "all" || template.regulations.includes(regulationFilter as Regulation);
    const matchesStatus = statusFilter === "all" || template.status === statusFilter;
    return matchesSearch && matchesType && matchesRegulation && matchesStatus;
  });

  const totalPages = Math.ceil(filteredTemplates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTemplates = filteredTemplates.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="explicit">Explicit</SelectItem>
              <SelectItem value="implicit">Implicit</SelectItem>
              <SelectItem value="optional">Optional</SelectItem>
              <SelectItem value="mandatory">Mandatory</SelectItem>
              <SelectItem value="granular">Granular</SelectItem>
              <SelectItem value="parental">Parental</SelectItem>
            </SelectContent>
          </Select>
          <Select value={regulationFilter} onValueChange={setRegulationFilter}>
            <SelectTrigger className="w-[180px]">
              <Globe className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Regulation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regulations</SelectItem>
              <SelectItem value="DPDP">DPDP Act</SelectItem>
              <SelectItem value="GDPR">GDPR</SelectItem>
              <SelectItem value="TAPA">TAPA</SelectItem>
              <SelectItem value="PDPL">PDPL</SelectItem>
              <SelectItem value="Custom">Custom</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          {onRefresh && (
            <Button variant="outline" size="icon" onClick={onRefresh} disabled={isLoading}>
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            </Button>
          )}
        </div>
        <Button onClick={onCreateNew} className="shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Templates Table */}
      <div className="border rounded-lg overflow-auto bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[280px]">Template Name</TableHead>
              <TableHead>Consent Type</TableHead>
              <TableHead>Regulations</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-16 float-right" /></TableCell>
                </TableRow>
              ))
            ) : paginatedTemplates.length > 0 ? (
              paginatedTemplates.map((template) => (
                <TableRow key={template.id} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{template.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
                          {template.description}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                       {getConsentTypeIcon(template.type)}
                       <span className="text-sm">
                         {CONSENT_TYPE_INFO[template.type as keyof typeof CONSENT_TYPE_INFO]?.label || template.type}
                       </span>
                     </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {template.regulations.map((reg) => (
                        <Badge 
                          key={reg} 
                          variant="outline" 
                          className={REGULATION_INFO[reg.toUpperCase() as keyof typeof REGULATION_INFO]?.color || ""}
                        >
                          {reg.toUpperCase()}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(template.status)}</TableCell>
                  <TableCell>
                    <span className="text-sm font-mono">v{template.version}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {template.updatedAt}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <User className="h-3 w-3" />
                      {template.createdBy}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          Actions
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => onView(template)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(template)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Template
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onClone(template)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Clone Template
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-warning" onClick={() => onArchive(template)}>
                          <Archive className="h-4 w-4 mr-2" />
                          Archive
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No templates found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Results summary & Pagination */}
      <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-4">
        <p>
          Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredTemplates.length)} of {filteredTemplates.length} templates
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                className="w-8 h-8 p-0"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
