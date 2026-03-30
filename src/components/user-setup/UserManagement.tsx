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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Lock,
  Unlock,
  Power,
  PowerOff,
  LogOut,
  Shield,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User as UserIcon,
  Building2,
  Key,
  GitBranch,
  AlertTriangle,
  PauseCircle,
  ArrowLeftRight,
  Smartphone,
  Zap,
} from "lucide-react";
import { User, UserStatus } from "./types";
import { ConfirmationDialog } from "./ConfirmationDialog";
import { useToast } from "@/hooks/use-toast";
import { auditLogsService, usersService } from "@/services/userSetupService";
import { Skeleton } from "@/components/ui/skeleton";

const getStatusIcon = (status: UserStatus) => {
  switch (status) {
    case "active":
      return <CheckCircle2 className="h-4 w-4 text-success" />;
    case "disabled":
      return <PowerOff className="h-4 w-4 text-muted-foreground" />;
    case "locked":
      return <Lock className="h-4 w-4 text-destructive" />;
    case "pending":
      return <Clock className="h-4 w-4 text-warning" />;
    case "suspended":
      return <PauseCircle className="h-4 w-4 text-orange-500" />;
    default:
      return <AlertCircle className="h-4 w-4" />;
  }
};

const getStatusBadge = (status: UserStatus) => {
  const variants: Record<UserStatus, { variant: "default" | "secondary" | "destructive" | "outline"; className: string }> = {
    active: { variant: "default", className: "bg-success/10 text-success border-success/20 hover:bg-success/20" },
    disabled: { variant: "secondary", className: "bg-muted text-muted-foreground" },
    locked: { variant: "destructive", className: "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20" },
    pending: { variant: "outline", className: "bg-warning/10 text-warning border-warning/20 hover:bg-warning/20" },
    suspended: { variant: "outline", className: "bg-orange-500/10 text-orange-500 border-orange-500/20 hover:bg-orange-500/20" },
  };
  const config = variants[status];
  return (
    <Badge variant={config.variant} className={`${config.className} capitalize flex items-center gap-1.5 font-medium`}>
      {getStatusIcon(status)}
      {status}
    </Badge>
  );
};

const getRoleBadge = (role: string) => {
  const colors: Record<string, string> = {
    Admin: "bg-destructive/10 text-destructive border-destructive/20",
    DPO: "bg-primary/10 text-primary border-primary/20",
    Operator: "bg-success/10 text-success border-success/20",
    Viewer: "bg-info/10 text-info border-info/20",
    Compliance: "bg-warning/10 text-warning border-warning/20",
  };
  return (
    <Badge variant="outline" className={`${colors[role] || "bg-muted"} font-medium`}>
      {role}
    </Badge>
  );
};

interface UserManagementProps {
  onEditUser: (user: User) => void;
}

export function UserManagement({ onEditUser }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [mfaFilter, setMfaFilter] = useState<string>("all");
  const [accountTypeFilter, setAccountTypeFilter] = useState<string>("all");
  const [tenantFilter, setTenantFilter] = useState<string>("all");
  const [apiAccessFilter, setApiAccessFilter] = useState<string>("all");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  // const [editingUser, setEditingUser] = useState<User | null>(null); // State lifted up
  const [confirmAction, setConfirmAction] = useState<{
    type: string;
    user: User;
    title: string;
    description: string;
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { toast } = useToast();

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      (user.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.email || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    const matchesRole = roleFilter === "all" || (user.roles || []).includes(roleFilter);
    const matchesMfa =
      mfaFilter === "all" ||
      (mfaFilter === "enabled" && user.mfaEnabled) ||
      (mfaFilter === "disabled" && !user.mfaEnabled);
    const matchesAccountType = accountTypeFilter === "all" || user.accountType === accountTypeFilter;
    const matchesTenant = tenantFilter === "all" || user.tenantId === tenantFilter;
    const matchesApiAccess =
      apiAccessFilter === "all" ||
      (apiAccessFilter === "enabled" && user.apiAccess?.enabled) ||
      (apiAccessFilter === "disabled" && !user.apiAccess?.enabled);
    const matchesRisk =
      riskFilter === "all" ||
      (riskFilter === "high" && user.isHighRisk) ||
      (riskFilter === "dormant" && user.isDormant);

    return matchesSearch && matchesStatus && matchesRole && matchesMfa && matchesAccountType && matchesTenant && matchesApiAccess && matchesRisk;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, roleFilter, mfaFilter, accountTypeFilter, tenantFilter, apiAccessFilter, riskFilter]);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await usersService.getAll();
        if (response && response.data) {
          const mappedUsers: User[] = response.data.map((user: any) => ({
            ...user,
            roles: user.roles?.map((r: any) => r.role?.name || r.name || r) || [],
            status: user.status?.toLowerCase() || 'pending',
            accountType: user.accountType?.toLowerCase() || 'internal',
          }));
          setUsers(mappedUsers);
        }
      } catch (error) {
        console.error("Failed to fetch users", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleAction = (type: string, user: User) => {
    const actions: Record<string, { title: string; description: string }> = {
      lock: {
        title: "Lock User Account",
        description: `Are you sure you want to lock ${user.name}'s account? They will not be able to log in until unlocked.`,
      },
      unlock: {
        title: "Unlock User Account",
        description: `Are you sure you want to unlock ${user.name}'s account? They will be able to log in again.`,
      },
      disable: {
        title: "Disable User Account",
        description: `Are you sure you want to disable ${user.name}'s account? This will revoke all active sessions.`,
      },
      enable: {
        title: "Enable User Account",
        description: `Are you sure you want to enable ${user.name}'s account?`,
      },
      suspend: {
        title: "Temporarily Suspend Access",
        description: `Are you sure you want to temporarily suspend ${user.name}'s access? This is a temporary measure that can be reversed.`,
      },
      endSession: {
        title: "End All Sessions",
        description: `Are you sure you want to terminate all active sessions for ${user.name}? They will need to log in again.`,
      },
      resetMfa: {
        title: "Reset MFA",
        description: `Are you sure you want to reset MFA for ${user.name}? They will need to set up MFA again on next login.`,
      },
      resetPassword: {
        title: "Reset Password",
        description: `A password reset link will be sent to ${user.email}.`,
      },
      resendInvite: {
        title: "Resend Invitation",
        description: `A new invitation will be sent to ${user.email}.`,
      },
      revokeApi: {
        title: "Revoke API Access",
        description: `Are you sure you want to revoke API access for ${user.name}? All API tokens will be invalidated.`,
      },
      transferTenant: {
        title: "Transfer User to Another Tenant",
        description: `This will transfer ${user.name} to a different tenant. They will lose access to current tenant resources.`,
      },
    };

    setConfirmAction({
      type,
      user,
      ...actions[type],
    });
  };

  const uniqueRoles = [...new Set(users.flatMap((u) => u.roles))];
  const uniqueTenants = [...new Map(users.map((u) => [u.tenantId, { id: u.tenantId, name: u.tenantName }])).values()];

  return (
    <div className="space-y-6" >
      {/* Search and Filters */}
      < div className="flex flex-col gap-4" >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative flex-1 w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
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
            {(statusFilter !== "all" || roleFilter !== "all" || mfaFilter !== "all" || accountTypeFilter !== "all" || tenantFilter !== "all" || apiAccessFilter !== "all" || riskFilter !== "all") && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {[statusFilter, roleFilter, mfaFilter, accountTypeFilter, tenantFilter, apiAccessFilter, riskFilter].filter((f) => f !== "all").length}
              </Badge>
            )}
          </Button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 p-4 bg-muted/30 rounded-lg border border-border animate-fade-in">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                  <SelectItem value="locked">Locked</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Role</label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {uniqueRoles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Tenant</label>
              <Select value={tenantFilter} onValueChange={setTenantFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tenants</SelectItem>
                  {uniqueTenants.map((tenant) => (
                    <SelectItem key={tenant.id} value={tenant.id || ""}>
                      {tenant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">API Access</label>
              <Select value={apiAccessFilter} onValueChange={setApiAccessFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="enabled">API Enabled</SelectItem>
                  <SelectItem value="disabled">API Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Risk</label>
              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                  <SelectItem value="dormant">Dormant</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">MFA Status</label>
              <Select value={mfaFilter} onValueChange={setMfaFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="enabled">MFA Enabled</SelectItem>
                  <SelectItem value="disabled">MFA Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Account Type</label>
              <Select value={accountTypeFilter} onValueChange={setAccountTypeFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="internal">Internal</SelectItem>
                  <SelectItem value="external">External</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )
        }
      </div >
      {/* Users Table */}
      < div className="border rounded-lg overflow-hidden bg-card" >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="font-semibold">User</TableHead>
                <TableHead className="font-semibold">Tenant</TableHead>
                <TableHead className="font-semibold">Role(s)</TableHead>
                <TableHead className="font-semibold">Applications</TableHead>
                <TableHead className="font-semibold">Workflow</TableHead>
                <TableHead className="font-semibold">API</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Last Login</TableHead>
                <TableHead className="text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={9}>
                      <Skeleton className="h-12 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                paginatedUsers.map((user) => (
                <TableRow key={user.id} className={`hover:bg-muted/30 ${user.isHighRisk ? 'bg-destructive/5' : user.isDormant ? 'bg-warning/5' : ''}`}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        {user.isHighRisk && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive flex items-center justify-center">
                                <AlertTriangle className="h-2.5 w-2.5 text-destructive-foreground" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>High Risk User</TooltipContent>
                          </Tooltip>
                        )}
                        {user.isDormant && !user.isHighRisk && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-warning flex items-center justify-center">
                                <Clock className="h-2.5 w-2.5 text-warning-foreground" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>Dormant Account</TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{user.tenantName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.roles.slice(0, 2).map((role) => (
                        <span key={role}>{getRoleBadge(role)}</span>
                      ))}
                      {user.roles.length > 2 && (
                        <Badge variant="outline" className="text-xs">+{user.roles.length - 2}</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {user.applications && user.applications.length > 0 ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1.5">
                              <Smartphone className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{user.applications.filter(a => a.enabled).length} apps</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="space-y-1">
                              {user.applications.filter(a => a.enabled).map(app => (
                                <div key={app.id} className="text-xs">{app.name}</div>
                              ))}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <span className="text-xs text-muted-foreground">None</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {user.workflowParticipation && (user.workflowParticipation.rightsWorkflow || user.workflowParticipation.grievanceWorkflow) ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1.5">
                              <GitBranch className="h-4 w-4 text-primary" />
                              <Badge variant="outline" className="text-xs capitalize">
                                {user.workflowParticipation.role || 'Participant'}
                              </Badge>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="space-y-1 text-xs">
                              {user.workflowParticipation.rightsWorkflow && <div>✓ Rights Workflow</div>}
                              {user.workflowParticipation.grievanceWorkflow && <div>✓ Grievance Workflow</div>}
                              {user.workflowParticipation.isEscalationContact && <div>★ Escalation Contact</div>}
                              {user.workflowParticipation.isBackupApprover && <div>↺ Backup Approver</div>}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <span className="text-xs text-muted-foreground">None</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.apiAccess?.enabled ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="cursor-help w-fit">
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 flex items-center gap-1 w-fit">
                              <Key className="h-3 w-3" />
                              Enabled
                            </Badge>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-xs">
                            <div>Scopes: {user.apiAccess.scopes.join(', ')}</div>
                            {user.apiAccess.lastUsed && <div>Last used: {user.apiAccess.lastUsed}</div>}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <Badge variant="outline" className="bg-muted text-muted-foreground flex items-center gap-1 w-fit">
                        <XCircle className="h-3 w-3" />
                        Disabled
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {user.lastLogin || "Never"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>User Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onEditUser(user)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Account Status</DropdownMenuLabel>
                        {user.status === "locked" ? (
                          <DropdownMenuItem onClick={() => handleAction("unlock", user)}>
                            <Unlock className="h-4 w-4 mr-2" />
                            Unlock Account
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleAction("lock", user)}>
                            <Lock className="h-4 w-4 mr-2" />
                            Lock Account
                          </DropdownMenuItem>
                        )}
                        {user.status === "disabled" ? (
                          <DropdownMenuItem onClick={() => handleAction("enable", user)}>
                            <Power className="h-4 w-4 mr-2" />
                            Enable User
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleAction("disable", user)}>
                            <PowerOff className="h-4 w-4 mr-2" />
                            Disable User
                          </DropdownMenuItem>
                        )}
                        {user.status !== "suspended" && (
                          <DropdownMenuItem onClick={() => handleAction("suspend", user)}>
                            <PauseCircle className="h-4 w-4 mr-2" />
                            Temporarily Suspend
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Session & Security</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleAction("endSession", user)}>
                          <LogOut className="h-4 w-4 mr-2" />
                          End All Sessions
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction("resetMfa", user)}>
                          <Shield className="h-4 w-4 mr-2" />
                          Reset MFA
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction("resetPassword", user)}>
                          <Zap className="h-4 w-4 mr-2" />
                          Reset Password
                        </DropdownMenuItem>
                        {user.apiAccess?.enabled && (
                          <DropdownMenuItem onClick={() => handleAction("revokeApi", user)} className="text-destructive">
                            <Key className="h-4 w-4 mr-2" />
                            Revoke API Access
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Enterprise</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleAction("transferTenant", user)}>
                          <ArrowLeftRight className="h-4 w-4 mr-2" />
                          Transfer Tenant
                        </DropdownMenuItem>
                        {user.status === "pending" && (
                          <DropdownMenuItem onClick={() => handleAction("resendInvite", user)}>
                            <Zap className="h-4 w-4 mr-2" />
                            Resend Invitation
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )))}
            </TableBody>
          </Table>
        </div>
      </div >




      {/* Pagination */}
      < div className="flex items-center justify-between" >
        <div className="flex-1 text-sm text-muted-foreground">
          {filteredUsers.length > 0 ? (
            <>
              Showing <span className="font-medium text-foreground">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
              <span className="font-medium text-foreground">{Math.min(currentPage * itemsPerPage, filteredUsers.length)}</span> of{" "}
              <span className="font-medium text-foreground">{filteredUsers.length}</span> results
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
            disabled={currentPage === totalPages || filteredUsers.length <= itemsPerPage}
          >
            Next
          </Button>
        </div>
      </div >

      {/* Edit User Dialog - Lifted to parent */}

      {/* Confirmation Dialog */}
      {
        confirmAction && (
          <ConfirmationDialog
            open={!!confirmAction}
            onOpenChange={() => setConfirmAction(null)}
            title={confirmAction.title}
            description={confirmAction.description}
            onConfirm={async () => {
              if (!confirmAction) return;
              const { type, user } = confirmAction;
              try {
                let modifications = {};
                if (type === "lock") modifications = { status: "locked" };
                if (type === "unlock") modifications = { status: "active" };
                if (type === "disable") modifications = { status: "disabled" };
                if (type === "enable") modifications = { status: "active" };
                if (type === "suspend") modifications = { status: "suspended" };
                if (type === "revokeApi") modifications = { apiAccess: { ...user.apiAccess, enabled: false, scopes: [] } };
                if (type === "resetMfa") modifications = { mfaEnabled: false };
                if (type === "transferTenant") modifications = { tenantId: "4", tenantName: "Transferred Tenant" };

                if (Object.keys(modifications).length > 0) {
                  await usersService.update(user.id, modifications);
                }

                setUsers((prev) =>
                  prev.map((u) => {
                    if (u.id !== user.id) return u;
                    return { ...u, ...modifications };
                  })
                );
                toast({
                  title: "Action Completed",
                  description: `${type} applied for ${user.name}.`,
                });
              } catch (error) {
                 toast({ title: "Error", description: "Failed to apply user action.", variant: "destructive" });
              }
              setConfirmAction(null);
            }}
          />
        )
      }
    </div >
  );
}


