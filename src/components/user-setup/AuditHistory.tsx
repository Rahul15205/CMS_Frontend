import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import {
  Search,
  Download,
  Calendar as CalendarIcon,
  User,
  Shield,
  Settings,
  LogIn,
  LogOut,
  AlertTriangle,
  Filter,
  FileDown,
} from "lucide-react";
import { format } from "date-fns";
import { AuditLog } from "./types";
import { auditLogsService } from "@/services/userSetupService";

const mockAuditLogs: AuditLog[] = [
  {
    id: "1",
    userId: "1",
    userName: "John Smith",
    action: "User Login",
    category: "session",
    details: "Successful login from Chrome on Windows",
    ipAddress: "192.168.1.100",
    timestamp: "2024-01-19 10:30:15",
  },
  {
    id: "2",
    userId: "1",
    userName: "John Smith",
    action: "Role Changed",
    category: "role",
    details: "Role changed from Operator to Admin by System Admin",
    ipAddress: "192.168.1.100",
    timestamp: "2024-01-19 10:25:00",
  },
  {
    id: "3",
    userId: "2",
    userName: "Sarah Johnson",
    action: "Profile Updated",
    category: "profile",
    details: "Phone number updated",
    ipAddress: "10.0.0.50",
    timestamp: "2024-01-19 09:45:30",
  },
  {
    id: "4",
    userId: "3",
    userName: "Mike Wilson",
    action: "MFA Enabled",
    category: "security",
    details: "Multi-factor authentication enabled",
    ipAddress: "172.16.0.25",
    timestamp: "2024-01-18 16:30:00",
  },
  {
    id: "5",
    userId: "4",
    userName: "Emily Brown",
    action: "Account Locked",
    category: "status",
    details: "Account locked after 5 failed login attempts",
    ipAddress: "203.0.113.45",
    timestamp: "2024-01-18 14:20:00",
  },
  {
    id: "6",
    userId: "5",
    userName: "David Lee",
    action: "User Logout",
    category: "session",
    details: "User logged out",
    ipAddress: "192.168.1.105",
    timestamp: "2024-01-18 12:00:00",
  },
  {
    id: "7",
    userId: "6",
    userName: "Anna Martinez",
    action: "Password Reset",
    category: "security",
    details: "Password reset link sent by admin",
    ipAddress: "10.0.0.55",
    timestamp: "2024-01-17 11:30:00",
  },
  {
    id: "8",
    userId: "2",
    userName: "Sarah Johnson",
    action: "Role Assigned",
    category: "role",
    details: "DPO role assigned by System Admin",
    ipAddress: "10.0.0.50",
    timestamp: "2024-01-17 10:00:00",
  },
  {
    id: "9",
    userId: "1",
    userName: "John Smith",
    action: "Session Terminated",
    category: "session",
    details: "All sessions terminated by admin",
    ipAddress: "192.168.1.100",
    timestamp: "2024-01-16 15:45:00",
  },
  {
    id: "10",
    userId: "3",
    userName: "Mike Wilson",
    action: "Account Enabled",
    category: "status",
    details: "Account re-enabled by admin after suspension",
    ipAddress: "172.16.0.25",
    timestamp: "2024-01-16 09:00:00",
  },
];

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "profile":
      return <User className="h-4 w-4" />;
    case "role":
      return <Shield className="h-4 w-4" />;
    case "status":
      return <Settings className="h-4 w-4" />;
    case "session":
      return <LogIn className="h-4 w-4" />;
    case "security":
      return <AlertTriangle className="h-4 w-4" />;
    default:
      return <Settings className="h-4 w-4" />;
  }
};

const getCategoryBadge = (category: string) => {
  const colors: Record<string, string> = {
    profile: "bg-primary/10 text-primary border-primary/20",
    role: "bg-warning/10 text-warning border-warning/20",
    status: "bg-info/10 text-info border-info/20",
    session: "bg-success/10 text-success border-success/20",
    security: "bg-destructive/10 text-destructive border-destructive/20",
  };
  return (
    <Badge variant="outline" className={`${colors[category]} capitalize flex items-center gap-1.5 font-medium`}>
      {getCategoryIcon(category)}
      {category}
    </Badge>
  );
};

export function AuditHistory() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [showFilters, setShowFilters] = useState(false);
  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const resp = await auditLogsService.getAll();
        if (resp && resp.data) {
          setLogs(resp.data);
        }
      } catch (error) {
        console.error("Failed to fetch logs", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || log.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const profileChanges = logs.filter((l) => l.category === "profile").length;
  const roleChanges = logs.filter((l) => l.category === "role").length;
  const securityEvents = logs.filter((l) => l.category === "security").length;
  const sessionEvents = logs.filter((l) => l.category === "session").length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setCategoryFilter("profile")}>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Profile Changes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{profileChanges}</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setCategoryFilter("role")}>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-warning" />
              Role Changes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-warning">{roleChanges}</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setCategoryFilter("security")}>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Security Events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-destructive">{securityEvents}</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setCategoryFilter("session")}>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <LogIn className="h-4 w-4 text-success" />
              Session Events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-success">{sessionEvents}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <FileDown className="h-4 w-4" />
              CSV
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              PDF
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="flex flex-wrap items-end gap-4 p-4 bg-muted/30 rounded-lg border border-border animate-fade-in">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-muted-foreground">Category</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="profile">Profile</SelectItem>
                  <SelectItem value="role">Role</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="session">Session</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-muted-foreground">Date Range</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd")} - {format(dateRange.to, "LLL dd")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange.from}
                    selected={{ from: dateRange.from, to: dateRange.to }}
                    onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                    numberOfMonths={2}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex items-end pb-0.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCategoryFilter("all");
                  setDateRange({});
                  setSearchQuery("");
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Info Banner */}
      <div className="flex items-center gap-3 p-3 bg-info/10 border border-info/20 rounded-lg text-sm">
        <Shield className="h-4 w-4 text-info" />
        <span className="text-muted-foreground">
          Audit logs are <strong className="text-foreground">immutable</strong> and retained for{" "}
          <strong className="text-foreground">7 years</strong> as per compliance requirements.
        </span>
      </div>

      {/* Logs Table */}
      <div className="border rounded-lg overflow-auto bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="font-semibold">Timestamp</TableHead>
              <TableHead className="font-semibold">User</TableHead>
              <TableHead className="font-semibold">Action</TableHead>
              <TableHead className="font-semibold">Category</TableHead>
              <TableHead className="font-semibold">Details</TableHead>
              <TableHead className="font-semibold">IP Address</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.map((log) => (
              <TableRow key={log.id} className="hover:bg-muted/30">
                <TableCell className="text-sm text-muted-foreground font-mono">
                  {log.timestamp}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
                      {log.userName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <span className="font-medium text-sm">{log.userName}</span>
                  </div>
                </TableCell>
                <TableCell className="font-medium">{log.action}</TableCell>
                <TableCell>{getCategoryBadge(log.category)}</TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                  {log.details}
                </TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">
                  {log.ipAddress}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">{filteredLogs.length}</span> of{" "}
          <span className="font-medium text-foreground">{logs.length}</span> entries
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
