import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
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
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  UserCheck,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  Plus,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Shield,
  Globe,
} from "lucide-react";
import { RightsRequest, RIGHTS_TYPE_INFO, REGULATION_INFO, STATUS_INFO } from "./types";
import { rightsService } from "@/services/rightsService";
import { handleApiError } from "@/lib/errorHandler";

const getStatusVariant = (status: string): "active" | "warning" | "error" | "info" | "pending" => {
  switch (status) {
    case "closed":
    case "action_taken":
    case "response_sent":
      return "active";
    case "in_review":
    case "acknowledged":
      return "info";
    case "received":
    case "identity_verified":
      return "pending";
    case "rejected":
    case "escalated":
      return "error";
    default:
      return "warning";
  }
};

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case "critical":
      return <Badge variant="destructive">Critical</Badge>;
    case "urgent":
      return <Badge className="bg-warning text-warning-foreground">Urgent</Badge>;
    case "normal":
      return <Badge variant="secondary">Normal</Badge>;
    default:
      return <Badge variant="outline">Low</Badge>;
  }
};

export function RightsRequestInbox({ onSelectRequest }: { onSelectRequest?: (request: RightsRequest) => void }) {
  const [requests, setRequests] = useState<RightsRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [regulationFilter, setRegulationFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setIsLoading(true);
        const result = await rightsService.getAll();
        // Handle both array and paginated API responses
        const data = Array.isArray(result) ? result : (result?.data || []);
        setRequests(data);
      } catch (error) {
        handleApiError(error, 'Rights Requests');
      } finally {
        setIsLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      (request.caseNumber || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (request.requesterName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (request.requesterEmail || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    const matchesType = typeFilter === "all" || request.type === typeFilter;
    const matchesRegulation = regulationFilter === "all" || request.regulation === regulationFilter;
    return matchesSearch && matchesStatus && matchesType && matchesRegulation;
  });

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (isLoading && requests.length === 0) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading requests...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Filters */}
      <div className="dashboard-card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by case number, name, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.entries(STATUS_INFO).map(([key, info]) => (
                <SelectItem key={key} value={key}>{info.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Rights Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {Object.entries(RIGHTS_TYPE_INFO).map(([key, info]) => (
                <SelectItem key={key} value={key}>{info.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={regulationFilter} onValueChange={setRegulationFilter}>
            <SelectTrigger className="w-full md:w-[160px]">
              <SelectValue placeholder="Regulation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regulations</SelectItem>
              {Object.entries(REGULATION_INFO).map(([key, info]) => (
                <SelectItem key={key} value={key}>{info.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Requests Table */}
      <div className="dashboard-card p-0 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[140px]">Case #</TableHead>
              <TableHead>Requester</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Regulation</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>SLA</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedRequests.length > 0 ? (
              paginatedRequests.map((request) => (
                <TableRow
                  key={request.id}
                  className={`cursor-pointer hover:bg-muted/50 ${request.slaBreached ? "bg-destructive/5" : ""}`}
                  onClick={() => onSelectRequest?.(request)}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {request.fraudFlag && (
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                      )}
                      {request.caseNumber}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{request.requesterName}</p>
                      <p className="text-sm text-muted-foreground">{request.requesterEmail}</p>
                      {request.isAuthorizedRep && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          <UserCheck className="h-3 w-3 mr-1" />
                          Rep
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {RIGHTS_TYPE_INFO[request.type]?.label || request.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      style={{ backgroundColor: `${REGULATION_INFO[request.regulation]?.color}20`, color: REGULATION_INFO[request.regulation]?.color }}
                    >
                      <Globe className="h-3 w-3 mr-1" />
                      {REGULATION_INFO[request.regulation]?.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={getStatusVariant(request.status)}>
                      {STATUS_INFO[request.status]?.label}
                    </StatusBadge>
                  </TableCell>
                  <TableCell>{getPriorityBadge(request.priority)}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        {request.slaBreached ? (
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                        ) : request.daysRemaining <= 3 ? (
                          <Clock className="h-4 w-4 text-warning" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-success" />
                        )}
                        <span className={`text-sm font-medium ${request.slaBreached ? "text-destructive" :
                          request.daysRemaining <= 3 ? "text-warning" :
                            "text-success"
                          }`}>
                          {request.slaBreached
                            ? `${Math.abs(request.daysRemaining)}d overdue`
                            : request.status === "closed"
                              ? "Completed"
                              : `${request.daysRemaining}d left`}
                        </span>
                      </div>
                      {request.status !== "closed" && (
                        <Progress
                          value={request.slaBreached ? 100 : Math.max(0, 100 - (request.daysRemaining / 30) * 100)}
                          className={`h-1.5 ${request.slaBreached ? "[&>div]:bg-destructive" :
                            request.daysRemaining <= 3 ? "[&>div]:bg-warning" :
                              "[&>div]:bg-success"
                            }`}
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{request.assignedTo || "Unassigned"}</span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <UserCheck className="h-4 w-4 mr-2" />
                          Assign
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Add Note
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <ArrowUpRight className="h-4 w-4 mr-2" />
                          Escalate
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                  No requests found matching your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-4 border-t">
          <p className="text-sm text-muted-foreground">
            Showing {filteredRequests.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredRequests.length)} of {filteredRequests.length} requests
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
