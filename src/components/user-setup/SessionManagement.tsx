import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  Search,
  Monitor,
  Smartphone,
  Laptop,
  LogOut,
  AlertTriangle,
  Lock,
  Globe,
  Clock,
  CheckCircle2,
  RefreshCw,
  FileSpreadsheet,
} from "lucide-react";
import { Session } from "./types";
import { useToast } from "@/hooks/use-toast";

const mockSessions: Session[] = [
  {
    id: "1",
    userId: "1",
    userName: "John Smith",
    device: "Desktop",
    browser: "Chrome 120",
    ipAddress: "192.168.1.100",
    location: "Mumbai, India",
    loginTime: "2024-01-19 10:30",
    lastActivity: "2024-01-19 11:45",
    isCurrentSession: true,
  },
  {
    id: "2",
    userId: "1",
    userName: "John Smith",
    device: "Mobile",
    browser: "Safari 17",
    ipAddress: "192.168.1.101",
    location: "Mumbai, India",
    loginTime: "2024-01-19 08:15",
    lastActivity: "2024-01-19 09:30",
    isCurrentSession: false,
  },
  {
    id: "3",
    userId: "2",
    userName: "Sarah Johnson",
    device: "Laptop",
    browser: "Firefox 121",
    ipAddress: "10.0.0.50",
    location: "Delhi, India",
    loginTime: "2024-01-19 09:00",
    lastActivity: "2024-01-19 11:40",
    isCurrentSession: false,
  },
  {
    id: "4",
    userId: "3",
    userName: "Mike Wilson",
    device: "Desktop",
    browser: "Edge 120",
    ipAddress: "172.16.0.25",
    location: "Bangalore, India",
    loginTime: "2024-01-18 16:00",
    lastActivity: "2024-01-18 18:30",
    isCurrentSession: false,
  },
  {
    id: "5",
    userId: "4",
    userName: "Emily Brown",
    device: "Tablet",
    browser: "Chrome 120",
    ipAddress: "203.0.113.45",
    location: "Unknown",
    loginTime: "2024-01-19 10:00",
    lastActivity: "2024-01-19 10:15",
    isCurrentSession: false,
  },
];

const getDeviceIcon = (device: string) => {
  switch (device.toLowerCase()) {
    case "desktop":
      return <Monitor className="h-4 w-4" />;
    case "mobile":
      return <Smartphone className="h-4 w-4" />;
    case "laptop":
      return <Laptop className="h-4 w-4" />;
    case "tablet":
      return <Smartphone className="h-4 w-4" />;
    default:
      return <Monitor className="h-4 w-4" />;
  }
};

export function SessionManagement() {
  const [sessions, setSessions] = useState<Session[]>(mockSessions);
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmAction, setConfirmAction] = useState<{
    type: "single" | "all" | "lock";
    session?: Session;
    userName?: string;
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { toast } = useToast();

  const filteredSessions = sessions.filter(
    (session) =>
      session.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.ipAddress.includes(searchQuery) ||
      session.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sessions.length]);

  const totalPages = Math.max(1, Math.ceil(filteredSessions.length / itemsPerPage));
  const paginatedSessions = filteredSessions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const activeSessions = filteredSessions.filter(
    (s) => new Date(s.lastActivity) > new Date(Date.now() - 30 * 60 * 1000)
  );
  const idleSessions = filteredSessions.filter(
    (s) => new Date(s.lastActivity) <= new Date(Date.now() - 30 * 60 * 1000)
  );

  const uniqueUsers = new Set(sessions.map((s) => s.userId)).size;
  const suspiciousSessions = sessions.filter((s) => s.location === "Unknown").length;

  const handleEndSession = (session: Session) => {
    setSessions(sessions.filter((s) => s.id !== session.id));
    setConfirmAction(null);
    toast({ title: "Session Ended", description: `${session.userName}'s session was terminated.` });
  };

  const handleEndAllSessions = (userName: string) => {
    setSessions(sessions.filter((s) => s.userName !== userName || s.isCurrentSession));
    setConfirmAction(null);
    toast({ title: "Sessions Ended", description: `All sessions ended for ${userName}.` });
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
              Active Sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-success">{activeSessions.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-warning" />
              Idle Sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-warning">{idleSessions.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              Unique Users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{uniqueUsers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Suspicious
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-destructive">{suspiciousSessions}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Refresh */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by user, IP, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => toast({ title: "Export started", description: "Session report export queued." })}
          >
            <FileSpreadsheet className="h-4 w-4" />
            Export to Excel
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => toast({ title: "Refreshed", description: "Session list refreshed." })}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="border rounded-lg overflow-auto bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="font-semibold">User</TableHead>
              <TableHead className="font-semibold">Device</TableHead>
              <TableHead className="font-semibold">IP Address</TableHead>
              <TableHead className="font-semibold">Location</TableHead>
              <TableHead className="font-semibold">Login Time</TableHead>
              <TableHead className="font-semibold">Last Activity</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="text-right font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedSessions.map((session) => {
              const isActive =
                new Date(session.lastActivity) > new Date(Date.now() - 30 * 60 * 1000);
              const isSuspicious = session.location === "Unknown";

              return (
                <TableRow
                  key={session.id}
                  className={`hover:bg-muted/30 ${isSuspicious ? "bg-destructive/5" : ""}`}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
                        {session.userName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{session.userName}</p>
                        {session.isCurrentSession && (
                          <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/20">
                            Current
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getDeviceIcon(session.device)}
                      <div>
                        <p className="text-sm">{session.device}</p>
                        <p className="text-xs text-muted-foreground">{session.browser}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{session.ipAddress}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {isSuspicious && <AlertTriangle className="h-3 w-3 text-destructive" />}
                      <span className={isSuspicious ? "text-destructive" : ""}>{session.location}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{session.loginTime}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{session.lastActivity}</TableCell>
                  <TableCell>
                    {isActive ? (
                      <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                        Idle
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setConfirmAction({ type: "single", session })}
                        disabled={session.isCurrentSession}
                      >
                        <LogOut className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() =>
                          setConfirmAction({ type: "lock", session, userName: session.userName })
                        }
                      >
                        <Lock className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex-1 text-sm text-muted-foreground">
          {filteredSessions.length > 0 ? (
            <>
              Showing <span className="font-medium text-foreground">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
              <span className="font-medium text-foreground">{Math.min(currentPage * itemsPerPage, filteredSessions.length)}</span> of{" "}
              <span className="font-medium text-foreground">{filteredSessions.length}</span> results
            </>
          ) : (
            "No results found"
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages || filteredSessions.length <= itemsPerPage}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {confirmAction?.type === "lock" ? (
                <>
                  <Lock className="h-5 w-5 text-destructive" />
                  Lock User Account
                </>
              ) : (
                <>
                  <LogOut className="h-5 w-5 text-warning" />
                  End Session
                </>
              )}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.type === "lock"
                ? `This will end all sessions for ${confirmAction.userName} and lock their account. They will not be able to log in until unlocked.`
                : confirmAction?.type === "all"
                  ? `This will end all sessions for ${confirmAction.userName} except the current session.`
                  : `This will end the session for ${confirmAction?.session?.userName} on ${confirmAction?.session?.device}.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={confirmAction?.type === "lock" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
              onClick={() => {
                if (confirmAction?.session) {
                  handleEndSession(confirmAction.session);
                } else if (confirmAction?.userName) {
                  handleEndAllSessions(confirmAction.userName);
                }
              }}
            >
              {confirmAction?.type === "lock" ? "Lock Account" : "End Session"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
