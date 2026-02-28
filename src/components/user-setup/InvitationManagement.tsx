import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Mail,
  Plus,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Users,
  Send,
  UserPlus,
} from "lucide-react";
import { Invitation, InviteStatus } from "./types";
import { useToast } from "@/hooks/use-toast";

const mockInvitations: Invitation[] = [
  {
    id: "1",
    email: "new.user@company.com",
    role: "Operator",
    status: "pending",
    invitedBy: "John Smith",
    invitedAt: "2024-01-18 10:00",
    expiresAt: "2024-01-25 10:00",
  },
  {
    id: "2",
    email: "partner@external.com",
    role: "Viewer",
    status: "pending",
    invitedBy: "Sarah Johnson",
    invitedAt: "2024-01-17 14:30",
    expiresAt: "2024-01-24 14:30",
  },
  {
    id: "3",
    email: "emily.brown@company.com",
    role: "Viewer",
    status: "accepted",
    invitedBy: "John Smith",
    invitedAt: "2024-01-15 09:00",
    expiresAt: "2024-01-22 09:00",
    acceptedAt: "2024-01-15 11:30",
  },
  {
    id: "4",
    email: "old.invite@company.com",
    role: "Operator",
    status: "expired",
    invitedBy: "Mike Wilson",
    invitedAt: "2024-01-01 10:00",
    expiresAt: "2024-01-08 10:00",
  },
  {
    id: "5",
    email: "failed@invalid.com",
    role: "Viewer",
    status: "failed",
    invitedBy: "Sarah Johnson",
    invitedAt: "2024-01-10 15:00",
    expiresAt: "2024-01-17 15:00",
  },
];

const availableRoles = ["Admin", "DPO", "Operator", "Viewer", "Compliance", "Auditor"];

const getStatusIcon = (status: InviteStatus) => {
  switch (status) {
    case "pending":
      return <Clock className="h-4 w-4 text-warning" />;
    case "accepted":
      return <CheckCircle2 className="h-4 w-4 text-success" />;
    case "expired":
      return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    case "failed":
      return <XCircle className="h-4 w-4 text-destructive" />;
  }
};

const getStatusBadge = (status: InviteStatus) => {
  const variants: Record<InviteStatus, string> = {
    pending: "bg-warning/10 text-warning border-warning/20",
    accepted: "bg-success/10 text-success border-success/20",
    expired: "bg-muted text-muted-foreground",
    failed: "bg-destructive/10 text-destructive border-destructive/20",
  };
  return (
    <Badge variant="outline" className={`${variants[status]} capitalize flex items-center gap-1.5 font-medium`}>
      {getStatusIcon(status)}
      {status}
    </Badge>
  );
};

export function InvitationManagement() {
  const [invitations, setInvitations] = useState<Invitation[]>(mockInvitations);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteMode, setInviteMode] = useState<"single" | "bulk">("single");
  const [inviteData, setInviteData] = useState({
    email: "",
    emails: "",
    role: "",
    customExpiry: false,
    expiryDays: 7,
    requireApproval: false,
    customMessage: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { toast } = useToast();

  const filteredInvitations = invitations.filter((inv) => {
    const matchesSearch = inv.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, invitations.length]);

  const totalPages = Math.max(1, Math.ceil(filteredInvitations.length / itemsPerPage));
  const paginatedInvitations = filteredInvitations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const pendingCount = invitations.filter((i) => i.status === "pending").length;
  const acceptedCount = invitations.filter((i) => i.status === "accepted").length;
  const expiredCount = invitations.filter((i) => i.status === "expired").length;
  const failedCount = invitations.filter((i) => i.status === "failed").length;

  const handleResend = (invitationId: string) => {
    setInvitations((prev) =>
      prev.map((inv) =>
        inv.id === invitationId
          ? { ...inv, invitedAt: new Date().toISOString().slice(0, 16).replace("T", " ") }
          : inv
      )
    );
    toast({ title: "Invitation Sent", description: "Invitation email has been re-sent." });
  };

  const handleSendInvitation = () => {
    const entries =
      inviteMode === "single"
        ? [inviteData.email]
        : inviteData.emails.split("\n").map((email) => email.trim()).filter(Boolean);

    if (!entries.length || !inviteData.role) {
      toast({
        title: "Missing Fields",
        description: "Please provide email and role before sending.",
      });
      return;
    }

    const now = new Date();
    const expiry = new Date(now.getTime() + inviteData.expiryDays * 24 * 60 * 60 * 1000);
    const newInvites: Invitation[] = entries.map((email, index) => ({
      id: `${Date.now()}-${index}`,
      email,
      role: inviteData.role,
      status: "pending",
      invitedBy: "Admin User",
      invitedAt: now.toISOString().slice(0, 16).replace("T", " "),
      expiresAt: expiry.toISOString().slice(0, 16).replace("T", " "),
    }));

    setInvitations((prev) => [...newInvites, ...prev]);
    setShowInviteDialog(false);
    setInviteData({
      email: "",
      emails: "",
      role: "",
      customExpiry: false,
      expiryDays: 7,
      requireApproval: false,
      customMessage: "",
    });
    toast({
      title: "Invitations Sent",
      description: `${newInvites.length} invitation(s) queued successfully.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter("pending")}>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-warning" />
              Pending
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-warning">{pendingCount}</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter("accepted")}>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
              Accepted
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-success">{acceptedCount}</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter("expired")}>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
              Expired
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-muted-foreground">{expiredCount}</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter("failed")}>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-destructive" />
              Failed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-destructive">{failedCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setShowInviteDialog(true)} className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Invite User
        </Button>
      </div>

      {/* Invitations Table */}
      <div className="border rounded-lg overflow-auto bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="font-semibold">Email</TableHead>
              <TableHead className="font-semibold">Role</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Invited By</TableHead>
              <TableHead className="font-semibold">Invited At</TableHead>
              <TableHead className="font-semibold">Expires</TableHead>
              <TableHead className="text-right font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedInvitations.map((invitation) => (
              <TableRow key={invitation.id} className="hover:bg-muted/30">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{invitation.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{invitation.role}</Badge>
                </TableCell>
                <TableCell>{getStatusBadge(invitation.status)}</TableCell>
                <TableCell className="text-muted-foreground">{invitation.invitedBy}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{invitation.invitedAt}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{invitation.expiresAt}</TableCell>
                <TableCell className="text-right">
                  {invitation.status === "pending" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={() => handleResend(invitation.id)}
                    >
                      <RefreshCw className="h-3 w-3" />
                      Resend
                    </Button>
                  )}
                  {invitation.status === "expired" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={() => handleResend(invitation.id)}
                    >
                      <RefreshCw className="h-3 w-3" />
                      Reinvite
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex-1 text-sm text-muted-foreground">
          {filteredInvitations.length > 0 ? (
            <>
              Showing <span className="font-medium text-foreground">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
              <span className="font-medium text-foreground">{Math.min(currentPage * itemsPerPage, filteredInvitations.length)}</span> of{" "}
              <span className="font-medium text-foreground">{filteredInvitations.length}</span> results
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
            disabled={currentPage === totalPages || filteredInvitations.length <= itemsPerPage}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Invite Users
            </DialogTitle>
            <DialogDescription>
              Send invitations to new users. They will receive an email with a link to set up their account.
            </DialogDescription>
          </DialogHeader>

          <Tabs value={inviteMode} onValueChange={(v) => setInviteMode(v as "single" | "bulk")} className="mt-4">
            <TabsList className="grid w-full grid-cols-2 p-2 h-auto bg-muted">
              <TabsTrigger value="single" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Single Invite
              </TabsTrigger>
              <TabsTrigger value="bulk" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Bulk Invite
              </TabsTrigger>
            </TabsList>

            <TabsContent value="single" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@company.com"
                  value={inviteData.email}
                  onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                />
              </div>
            </TabsContent>

            <TabsContent value="bulk" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="emails">Email Addresses (one per line)</Label>
                <Textarea
                  id="emails"
                  placeholder="user1@company.com&#10;user2@company.com&#10;user3@company.com"
                  value={inviteData.emails}
                  onChange={(e) => setInviteData({ ...inviteData, emails: e.target.value })}
                  rows={4}
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="role">Assign Role</Label>
              <Select
                value={inviteData.role}
                onValueChange={(value) => setInviteData({ ...inviteData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium text-sm">Custom Expiry</p>
                <p className="text-xs text-muted-foreground">Set custom invite link expiry</p>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={inviteData.customExpiry}
                  onCheckedChange={(checked) =>
                    setInviteData({ ...inviteData, customExpiry: checked })
                  }
                />
                {inviteData.customExpiry && (
                  <Select
                    value={inviteData.expiryDays.toString()}
                    onValueChange={(value) =>
                      setInviteData({ ...inviteData, expiryDays: parseInt(value) })
                    }
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 day</SelectItem>
                      <SelectItem value="3">3 days</SelectItem>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="14">14 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium text-sm">Require Approval</p>
                <p className="text-xs text-muted-foreground">Admin approval before activation</p>
              </div>
              <Switch
                checked={inviteData.requireApproval}
                onCheckedChange={(checked) =>
                  setInviteData({ ...inviteData, requireApproval: checked })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customMessage">Custom Message (Optional)</Label>
              <Textarea
                id="customMessage"
                placeholder="Add a personal message to the invitation email..."
                value={inviteData.customMessage}
                onChange={(e) => setInviteData({ ...inviteData, customMessage: e.target.value })}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendInvitation} className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
