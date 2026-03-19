import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Shield,
  Plus,
  Search,
  Users,
  Edit,
  Copy,
  Archive,
  MoreHorizontal,
  Check,
  Lock,
  Filter,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Role, ModulePermissions } from "./types";

import { defaultPermissions, permissionTypes, modules } from "@/data/mockRoles";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { rolesService, usersService } from "@/services/userSetupService";
import { useToast } from "@/hooks/use-toast";

export function RoleManagement() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [roleUsers, setRoleUsers] = useState<any[]>([]);
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [cloneFrom, setCloneFrom] = useState<Role | null>(null);
  const [newRole, setNewRole] = useState({
    name: "",
    description: "",
    permissions: defaultPermissions,
    hasExpiry: false,
    expiresAt: "",
  });
  // Users assigned to the viewing role
  const fetchUsersForRole = async (roleName: string) => {
    setLoadingUsers(true);
    try {
      const resp = await usersService.getAll();
      if (resp) {
        const userList = Array.isArray(resp) ? resp : resp.data || [];
        const filtered = userList.filter((u: any) => 
          u.roles?.some((r: any) => r.role?.name === roleName || r.name === roleName || r === roleName)
        );
        setRoleUsers(filtered.map((u: any) => ({
          ...u,
          status: u.status?.toLowerCase() || 'pending'
        })));
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [showViewUsersDialog, setShowViewUsersDialog] = useState(false);
  const [selectedRoleForView, setSelectedRoleForView] = useState<Role | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Mock users replaced by live fetchUsersForRole state trigger

  const filteredRoles = roles.filter(
    (role) => {
      const matchesSearch = role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        role.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || role.status?.toLowerCase() === statusFilter.toLowerCase();
      const matchesType = typeFilter === "all" ||
        (typeFilter === "system" && role.isSystemRole) ||
        (typeFilter === "custom" && !role.isSystemRole);

      return matchesSearch && matchesStatus && matchesType;
    }
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, typeFilter, roles.length]);

  useEffect(() => {
    const fetchRoles = async () => {
      setLoading(true);
      try {
        const response = await rolesService.getAll();
        if (response && Array.isArray(response)) {
          setRoles(response);
        } else if (response && response.data) {
          setRoles(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch roles", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRoles();
  }, []);

  const totalPages = Math.max(1, Math.ceil(filteredRoles.length / itemsPerPage));
  const paginatedRoles = useMemo(
    () => filteredRoles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [filteredRoles, currentPage]
  );
  const activeRoles = paginatedRoles.filter((r) => r.status?.toLowerCase() === "active");
  const archivedRoles = paginatedRoles.filter((r) => r.status?.toLowerCase() === "archived");
  const totalActiveRoles = filteredRoles.filter((r) => r.status?.toLowerCase() === "active").length;
  const totalArchivedRoles = filteredRoles.filter((r) => r.status?.toLowerCase() === "archived").length;

  const handleCloneRole = (role: Role) => {
    setCloneFrom(role);
    setEditingRoleId(null);
    setNewRole({
      name: `${role.name} (Copy)`,
      description: role.description,
      permissions: { ...role.permissions },
      hasExpiry: false,
      expiresAt: "",
    });
    setShowCreateDialog(true);
  };

  const handleCreateNew = () => {
    setCloneFrom(null);
    setEditingRoleId(null);
    setNewRole({
      name: "",
      description: "",
      permissions: defaultPermissions,
      hasExpiry: false,
      expiresAt: "",
    });
    setShowCreateDialog(true);
  };

  const handleEditRole = (role: Role) => {
    setCloneFrom(null);
    setEditingRoleId(role.id);
    setNewRole({
      name: role.name,
      description: role.description,
      permissions: { ...role.permissions },
      hasExpiry: !!role.expiresAt,
      expiresAt: role.expiresAt || "",
    });
    setShowCreateDialog(true);
  };

  const handleArchiveRole = async (roleId: string) => {
    try {
      await rolesService.update(roleId, { status: "archived" });
      setRoles(roles.map((role) => (role.id === roleId ? { ...role, status: "archived" } : role)));
      toast({ title: "Role Archived", description: "Role moved to archived list." });
    } catch {
      toast({ title: "Error", description: "Failed to archive role.", variant: "destructive" });
    }
  };

  const handleViewUsers = (role: Role) => {
    setSelectedRoleForView(role);
    fetchUsersForRole(role.name);
    setShowViewUsersDialog(true);
  };

  const handleSaveRole = async () => {
    if (!newRole.name.trim()) {
      toast({ title: "Role name required", description: "Please enter a role name before saving." });
      return;
    }

    try {
      if (editingRoleId) {
        const payload = {
          name: newRole.name,
          description: newRole.description,
          permissions: newRole.permissions,
          expiresAt: newRole.hasExpiry ? newRole.expiresAt : undefined,
        };
        await rolesService.update(editingRoleId, payload);
        
        setRoles(
          roles.map((role) =>
            role.id === editingRoleId
              ? { ...role, ...payload }
              : role
          )
        );
        toast({ title: "Role Updated", description: `${newRole.name} has been updated.` });
      } else {
        const payload = {
          name: newRole.name,
          description: newRole.description,
          permissions: newRole.permissions,
          status: "active",
          isSystemRole: false,
          isTemporary: newRole.hasExpiry,
          expiresAt: newRole.hasExpiry ? newRole.expiresAt : undefined,
          clonedFrom: cloneFrom?.id,
        };
        const createdData = await rolesService.create(payload);
        const createdRole: Role = createdData?.id ? createdData : {
          ...payload,
          id: `role-${Date.now()}`,
          usersCount: 0,
          createdAt: new Date().toISOString().split("T")[0],
        };
        setRoles([createdRole, ...roles]);
        toast({ title: "Role Created", description: `${createdRole.name} has been created.` });
      }
      setShowCreateDialog(false);
      setEditingRoleId(null);
      setCloneFrom(null);
    } catch (error) {
       toast({ title: "Error", description: "Failed to save role.", variant: "destructive" });
    }
  };

  const togglePermission = (module: string, permission: string) => {
    setNewRole({
      ...newRole,
      permissions: {
        ...newRole.permissions,
        [module]: {
          ...newRole.permissions[module],
          [permission]: !newRole.permissions[module][permission as keyof typeof newRole.permissions[typeof module]],
        },
      },
    });
  };

  const toggleAllModule = (module: string, enabled: boolean) => {
    setNewRole({
      ...newRole,
      permissions: {
        ...newRole.permissions,
        [module]: permissionTypes.reduce((acc, perm) => {
          acc[perm as keyof typeof acc] = enabled;
          return acc;
        }, {} as typeof newRole.permissions[typeof module]),
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search roles..."
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
            {(statusFilter !== "all" || typeFilter !== "all") && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {[statusFilter, typeFilter].filter((f) => f !== "all").length}
              </Badge>
            )}
          </Button>
        </div>
        <Button onClick={handleCreateNew} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Role
        </Button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg border border-border animate-fade-in">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Type</label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="system">System Role</SelectItem>
                <SelectItem value="custom">Custom Role</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Active Roles */}
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          Active Roles ({totalActiveRoles})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
             Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-xl" />)
          ) : activeRoles.map((role) => (
              <Card key={role.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {role.name}
                        {role.isSystemRole && (
                          <Badge variant="outline" className="text-xs">
                            <Lock className="h-3 w-3 mr-1" />
                            System
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="text-xs mt-0.5">
                        {role.usersCount} users assigned
                      </CardDescription>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditRole(role)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Role
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleCloneRole(role)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Clone Role
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleViewUsers(role)}>
                        <Users className="h-4 w-4 mr-2" />
                        View Users
                      </DropdownMenuItem>
                      {!role.isSystemRole && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-warning"
                            onClick={() => handleArchiveRole(role.id)}
                          >
                            <Archive className="h-4 w-4 mr-2" />
                            Archive Role
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{role.description}</p>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(role.permissions).slice(0, 3).map(([module, perms]) => {
                    const enabledCount = Object.values(perms).filter(Boolean).length;
                    if (enabledCount === 0) return null;
                    return (
                      <Badge key={module} variant="secondary" className="text-xs">
                        {module.split(" ")[0]}
                      </Badge>
                    );
                  })}
                  <Badge variant="outline" className="text-xs">
                    +{modules.length - 3} more
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Archived Roles */}
      {archivedRoles.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-muted-foreground flex items-center gap-2">
            <Archive className="h-4 w-4" />
            Archived Roles ({totalArchivedRoles})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-75">
            {archivedRoles.map((role) => (
              <Card key={role.id} className="border-dashed">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                        <Shield className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-base text-muted-foreground">{role.name}</CardTitle>
                        <CardDescription className="text-xs mt-0.5">Archived</CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setRoles(roles.map((r) => (r.id === role.id ? { ...r, status: "active" } : r)));
                        toast({ title: "Role Restored", description: `${role.name} restored to active roles.` });
                      }}
                    >
                      Restore
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex-1 text-sm text-muted-foreground">
          {filteredRoles.length > 0 ? (
            <>
              Showing <span className="font-medium text-foreground">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
              <span className="font-medium text-foreground">{Math.min(currentPage * itemsPerPage, filteredRoles.length)}</span> of{" "}
              <span className="font-medium text-foreground">{filteredRoles.length}</span> results
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
            disabled={currentPage === totalPages || filteredRoles.length <= itemsPerPage}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Create/Edit Role Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              {editingRoleId ? "Edit Role" : (cloneFrom ? "Clone Role" : "Create New Role")}
            </DialogTitle>
            <DialogDescription>
              {cloneFrom
                ? `Creating a new role based on "${cloneFrom.name}"`
                : "Define a new role with custom permissions"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="roleName">Role Name</Label>
                <Input
                  id="roleName"
                  value={newRole.name}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  placeholder="e.g., Compliance Manager"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="roleExpiry">Role Expiry (Optional)</Label>
                <div className="flex items-center gap-4">
                  <Switch
                    checked={newRole.hasExpiry}
                    onCheckedChange={(checked) => setNewRole({ ...newRole, hasExpiry: checked })}
                  />
                  {newRole.hasExpiry && (
                    <Input
                      id="roleExpiry"
                      type="date"
                      value={newRole.expiresAt}
                      onChange={(e) => setNewRole({ ...newRole, expiresAt: e.target.value })}
                      className="flex-1"
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="roleDescription">Description</Label>
              <Textarea
                id="roleDescription"
                value={newRole.description}
                onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                placeholder="Describe the purpose and responsibilities of this role..."
                rows={2}
              />
            </div>

            <Separator />

            {/* Permissions Matrix */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Module Permissions</Label>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>V = View</span>
                  <span>C = Create</span>
                  <span>E = Edit</span>
                  <span>A = Approve</span>
                  <span>X = Export</span>
                  <span>G = Configure</span>
                  <span>D = Admin</span>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="grid grid-cols-[200px_repeat(7,1fr)_80px] bg-muted/50 p-3 text-xs font-medium text-muted-foreground border-b">
                  <div>Module</div>
                  <div className="text-center">V</div>
                  <div className="text-center">C</div>
                  <div className="text-center">E</div>
                  <div className="text-center">A</div>
                  <div className="text-center">X</div>
                  <div className="text-center">G</div>
                  <div className="text-center">D</div>
                  <div className="text-center">All</div>
                </div>

                {modules.map((module) => {
                  const perms = newRole.permissions[module];
                  const allEnabled = Object.values(perms).every(Boolean);

                  return (
                    <div
                      key={module}
                      className="grid grid-cols-[200px_repeat(7,1fr)_80px] p-3 border-b last:border-0 hover:bg-muted/30 items-center"
                    >
                      <div className="font-medium text-sm">{module}</div>
                      {permissionTypes.map((perm) => (
                        <div key={perm} className="flex justify-center">
                          <Checkbox
                            checked={perms[perm as keyof typeof perms]}
                            onCheckedChange={() => togglePermission(module, perm)}
                          />
                        </div>
                      ))}
                      <div className="flex justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2"
                          onClick={() => toggleAllModule(module, !allEnabled)}
                        >
                          {allEnabled ? (
                            <Check className="h-4 w-4 text-success" />
                          ) : (
                            <span className="text-xs">All</span>
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveRole}>
              {editingRoleId ? "Save Changes" : "Create Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Users Dialog */}
      <Dialog open={showViewUsersDialog} onOpenChange={setShowViewUsersDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Users with Role: {selectedRoleForView?.name}</DialogTitle>
            <DialogDescription>
              List of users currently assigned to this role.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {loadingUsers ? (
              <div className="text-center py-4 text-sm text-muted-foreground">Loading users...</div>
            ) : roleUsers.length > 0 ? (
              <div className="border rounded-md divide-y">
                {roleUsers.map(user => (
                  <div key={user.id} className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <Badge variant={user.status === 'active' ? 'default' : 'secondary'} className="text-[10px]">
                      {user.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No users assigned to this role.
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewUsersDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


