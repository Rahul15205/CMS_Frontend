import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Info, Shield, Clock, Globe, X, Building2, Key, GitBranch, Smartphone, Database } from "lucide-react";
import { User as UserType, ApplicationAccess, WorkflowRole, DataAccessScope } from "./types";

interface UserEditDialogProps {
  user: UserType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const availableRoles = ["Admin", "DPO", "Operator", "Viewer", "Compliance", "Auditor"];
const departments = ["IT", "Legal", "Operations", "Compliance", "HR", "Finance", "Partner"];
const timezones = ["UTC", "America/New_York", "Europe/London", "Asia/Kolkata", "Asia/Tokyo"];
const workflowRoles: WorkflowRole[] = ["reviewer", "approver", "escalation", "backup"];
const dataAccessScopes: DataAccessScope[] = ["consent", "rights", "grievances", "reports", "cookies", "notices", "all"];

const availableApplications: ApplicationAccess[] = [
  { id: "1", name: "Salesforce CRM", type: "salesforce", enabled: false },
  { id: "2", name: "HRMS Portal", type: "hrms", enabled: false },
  { id: "3", name: "Main Website", type: "website", enabled: false },
  { id: "4", name: "Mobile App", type: "mobile", enabled: false },
  { id: "5", name: "ERP System", type: "erp", enabled: false },
  { id: "6", name: "Partner Portal", type: "api", enabled: false },
  { id: "7", name: "Internal Tools", type: "internal", enabled: false },
];

const availableTenants = [
  { id: "1", name: "Acme Corporation" },
  { id: "2", name: "GlobalTech Inc." },
  { id: "3", name: "FinServ Solutions" },
];

export function UserEditDialog({ user, open, onOpenChange }: UserEditDialogProps) {
  const isCreationMode = !user || !user.id;
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    roles: user?.roles || [],
    department: user?.department || "",
    mfaEnabled: user?.mfaEnabled || false,
    validFrom: user?.validFrom || "",
    validUntil: user?.validUntil || "",
    ipRestrictions: user?.ipRestrictions || [],
    timeRestrictions: user?.timeRestrictions || {
      enabled: false,
      startHour: 9,
      endHour: 18,
      timezone: "UTC",
    },
    // Enterprise fields
    tenantId: user?.tenantId || "1",
    applications: user?.applications || [],
    workflowParticipation: user?.workflowParticipation || {
      rightsWorkflow: false,
      grievanceWorkflow: false,
      role: undefined,
      isEscalationContact: false,
      isBackupApprover: false,
    },
    apiAccess: user?.apiAccess || { enabled: false, scopes: [] },
    dataAccessScope: user?.dataAccessScope || [],
    geoRestrictions: user?.geoRestrictions || [],
    deviceRestrictions: user?.deviceRestrictions || { enabled: false, registeredDevices: [] },
  });
  const [newIp, setNewIp] = useState("");
  const [newGeo, setNewGeo] = useState("");

  const handleAddRole = (role: string) => {
    if (!formData.roles.includes(role)) {
      setFormData({ ...formData, roles: [...formData.roles, role] });
    }
  };

  const handleRemoveRole = (role: string) => {
    setFormData({ ...formData, roles: formData.roles.filter((r) => r !== role) });
  };

  const handleAddIp = () => {
    if (newIp && !formData.ipRestrictions.includes(newIp)) {
      setFormData({ ...formData, ipRestrictions: [...formData.ipRestrictions, newIp] });
      setNewIp("");
    }
  };

  const handleRemoveIp = (ip: string) => {
    setFormData({
      ...formData,
      ipRestrictions: formData.ipRestrictions.filter((i) => i !== ip),
    });
  };

  const handleToggleApplication = (appId: string) => {
    const existingApp = formData.applications.find(a => a.id === appId);
    if (existingApp) {
      setFormData({
        ...formData,
        applications: formData.applications.map(a =>
          a.id === appId ? { ...a, enabled: !a.enabled } : a
        ),
      });
    } else {
      const app = availableApplications.find(a => a.id === appId);
      if (app) {
        setFormData({
          ...formData,
          applications: [...formData.applications, { ...app, enabled: true }],
        });
      }
    }
  };

  const handleToggleScope = (scope: DataAccessScope) => {
    if (formData.dataAccessScope.includes(scope)) {
      setFormData({
        ...formData,
        dataAccessScope: formData.dataAccessScope.filter(s => s !== scope),
      });
    } else {
      setFormData({
        ...formData,
        dataAccessScope: [...formData.dataAccessScope, scope],
      });
    }
  };

  const handleToggleApiScope = (scope: string) => {
    const currentScopes = formData.apiAccess.scopes;
    if (currentScopes.includes(scope)) {
      setFormData({
        ...formData,
        apiAccess: {
          ...formData.apiAccess,
          scopes: currentScopes.filter(s => s !== scope),
        },
      });
    } else {
      setFormData({
        ...formData,
        apiAccess: {
          ...formData.apiAccess,
          scopes: [...currentScopes, scope],
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            {isCreationMode ? "Create New User" : "Edit User Details"}
          </DialogTitle>
          <DialogDescription>
            {isCreationMode
              ? "Add a new user to the system. Configure profile, roles, and access settings."
              : "Update user profile, roles, enterprise access, and security settings. All changes are logged."}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="profile" className="mt-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="profile" className="flex items-center gap-2 text-xs">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="tenant" className="flex items-center gap-2 text-xs">
              <Building2 className="h-4 w-4" />
              Tenant
            </TabsTrigger>
            <TabsTrigger value="apps" className="flex items-center gap-2 text-xs">
              <Smartphone className="h-4 w-4" />
              Apps
            </TabsTrigger>
            <TabsTrigger value="workflow" className="flex items-center gap-2 text-xs">
              <GitBranch className="h-4 w-4" />
              Workflow
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center gap-2 text-xs">
              <Key className="h-4 w-4" />
              API
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2 text-xs">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => setFormData({ ...formData, department: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label>Assigned Roles</Label>
              <div className="flex flex-wrap gap-2 min-h-[36px] p-2 border rounded-md bg-muted/30">
                {formData.roles.map((role) => (
                  <Badge key={role} variant="secondary" className="flex items-center gap-1">
                    {role}
                    <button
                      onClick={() => handleRemoveRole(role)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {formData.roles.length === 0 && (
                  <span className="text-sm text-muted-foreground">No roles assigned</span>
                )}
              </div>
              <Select onValueChange={handleAddRole}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Add role..." />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles
                    .filter((r) => !formData.roles.includes(r))
                    .map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          {/* Tenant Tab */}
          <TabsContent value="tenant" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Tenant Assignment</Label>
              <Select
                value={formData.tenantId}
                onValueChange={(value) => setFormData({ ...formData, tenantId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select tenant" />
                </SelectTrigger>
                <SelectContent>
                  {availableTenants.map((tenant) => (
                    <SelectItem key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Changing tenant assignment will affect user's access to resources.
              </p>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label>Data Access Scope</Label>
              <p className="text-xs text-muted-foreground">
                Define which data categories this user can access.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {dataAccessScopes.map((scope) => (
                  <div key={scope} className="flex items-center space-x-2">
                    <Checkbox
                      id={`scope-${scope}`}
                      checked={formData.dataAccessScope.includes(scope)}
                      onCheckedChange={() => handleToggleScope(scope)}
                    />
                    <label
                      htmlFor={`scope-${scope}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                    >
                      {scope === "all" ? "All Data (Admin)" : scope}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="apps" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Application Access Mapping</Label>
              <p className="text-xs text-muted-foreground">
                Select which applications this user can access.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {availableApplications.map((app) => {
                const userApp = formData.applications.find(a => a.id === app.id);
                const isEnabled = userApp?.enabled || false;
                return (
                  <div
                    key={app.id}
                    className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${isEnabled ? 'bg-primary/5 border-primary/20' : 'bg-muted/30'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${isEnabled ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        <Smartphone className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{app.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{app.type}</p>
                      </div>
                    </div>
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={() => handleToggleApplication(app.id)}
                    />
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* Workflow Tab */}
          <TabsContent value="workflow" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <GitBranch className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Rights Workflow Participation</p>
                    <p className="text-sm text-muted-foreground">
                      Allow user to participate in rights request processing
                    </p>
                  </div>
                </div>
                <Switch
                  checked={formData.workflowParticipation.rightsWorkflow}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      workflowParticipation: {
                        ...formData.workflowParticipation,
                        rightsWorkflow: checked,
                      },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                    <GitBranch className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <p className="font-medium">Grievance Workflow Participation</p>
                    <p className="text-sm text-muted-foreground">
                      Allow user to participate in grievance handling
                    </p>
                  </div>
                </div>
                <Switch
                  checked={formData.workflowParticipation.grievanceWorkflow}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      workflowParticipation: {
                        ...formData.workflowParticipation,
                        grievanceWorkflow: checked,
                      },
                    })
                  }
                />
              </div>

              {(formData.workflowParticipation.rightsWorkflow || formData.workflowParticipation.grievanceWorkflow) && (
                <div className="p-4 border rounded-lg bg-muted/30 space-y-4 animate-fade-in">
                  <div className="space-y-2">
                    <Label>Workflow Role</Label>
                    <Select
                      value={formData.workflowParticipation.role}
                      onValueChange={(value: WorkflowRole) =>
                        setFormData({
                          ...formData,
                          workflowParticipation: {
                            ...formData.workflowParticipation,
                            role: value,
                          },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select workflow role" />
                      </SelectTrigger>
                      <SelectContent>
                        {workflowRoles.map((role) => (
                          <SelectItem key={role} value={role} className="capitalize">
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="escalation"
                      checked={formData.workflowParticipation.isEscalationContact}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          workflowParticipation: {
                            ...formData.workflowParticipation,
                            isEscalationContact: !!checked,
                          },
                        })
                      }
                    />
                    <label htmlFor="escalation" className="text-sm font-medium">
                      Escalation Contact
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="backup"
                      checked={formData.workflowParticipation.isBackupApprover}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          workflowParticipation: {
                            ...formData.workflowParticipation,
                            isBackupApprover: !!checked,
                          },
                        })
                      }
                    />
                    <label htmlFor="backup" className="text-sm font-medium">
                      Backup Approver
                    </label>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* API Access Tab */}
          <TabsContent value="api" className="space-y-4 mt-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Key className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">API Access</p>
                  <p className="text-sm text-muted-foreground">
                    Enable API token access for this user
                  </p>
                </div>
              </div>
              <Switch
                checked={formData.apiAccess.enabled}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    apiAccess: { ...formData.apiAccess, enabled: checked },
                  })
                }
              />
            </div>

            {formData.apiAccess.enabled && (
              <div className="p-4 border rounded-lg bg-muted/30 space-y-4 animate-fade-in">
                <div className="space-y-2">
                  <Label>API Token Scopes</Label>
                  <div className="flex flex-wrap gap-2">
                    {["read", "write", "delete", "admin"].map((scope) => (
                      <Badge
                        key={scope}
                        variant={formData.apiAccess.scopes.includes(scope) ? "default" : "outline"}
                        className="cursor-pointer capitalize"
                        onClick={() => handleToggleApiScope(scope)}
                      >
                        {scope}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Token Expiry</Label>
                    <Input
                      type="date"
                      value={formData.apiAccess.expiresAt || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          apiAccess: { ...formData.apiAccess, expiresAt: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Rate Limit (req/min)</Label>
                    <Input
                      type="number"
                      value={formData.apiAccess.rateLimit || 100}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          apiAccess: { ...formData.apiAccess, rateLimit: parseInt(e.target.value) },
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4 mt-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Multi-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">
                    Require MFA for enhanced account security
                  </p>
                </div>
              </div>
              <Switch
                checked={formData.mfaEnabled}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, mfaEnabled: checked })
                }
              />
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="validFrom">Account Valid From</Label>
                <Input
                  id="validFrom"
                  type="date"
                  value={formData.validFrom}
                  onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="validUntil">Account Valid Until</Label>
                <Input
                  id="validUntil"
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Label>Time-Based Access Restrictions</Label>
                </div>
                <Switch
                  checked={formData.timeRestrictions.enabled}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      timeRestrictions: { ...formData.timeRestrictions, enabled: checked },
                    })
                  }
                />
              </div>

              {formData.timeRestrictions.enabled && (
                <div className="grid grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/30 animate-fade-in">
                  <div className="space-y-2">
                    <Label>Start Hour</Label>
                    <Select
                      value={formData.timeRestrictions.startHour.toString()}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          timeRestrictions: {
                            ...formData.timeRestrictions,
                            startHour: parseInt(value),
                          },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => (
                          <SelectItem key={i} value={i.toString()}>
                            {i.toString().padStart(2, "0")}:00
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>End Hour</Label>
                    <Select
                      value={formData.timeRestrictions.endHour.toString()}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          timeRestrictions: {
                            ...formData.timeRestrictions,
                            endHour: parseInt(value),
                          },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => (
                          <SelectItem key={i} value={i.toString()}>
                            {i.toString().padStart(2, "0")}:00
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select
                      value={formData.timeRestrictions.timezone}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          timeRestrictions: { ...formData.timeRestrictions, timezone: value },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timezones.map((tz) => (
                          <SelectItem key={tz} value={tz}>
                            {tz}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <Label>IP Address Restrictions</Label>
              </div>
              <div className="flex flex-wrap gap-2 min-h-[36px] p-2 border rounded-md bg-muted/30">
                {formData.ipRestrictions.map((ip) => (
                  <Badge key={ip} variant="secondary" className="flex items-center gap-1">
                    {ip}
                    <button onClick={() => handleRemoveIp(ip)} className="ml-1 hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {formData.ipRestrictions.length === 0 && (
                  <span className="text-sm text-muted-foreground">No IP restrictions</span>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter IP address (e.g., 192.168.1.0/24)"
                  value={newIp}
                  onChange={(e) => setNewIp(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleAddIp} variant="outline">
                  Add
                </Button>
              </div>
            </div>

            <div className="p-4 border rounded-lg bg-info/5 border-info/20">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-info mt-0.5" />
                <div>
                  <p className="font-medium text-info">Security Note</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    All security changes are logged and the user will be notified via email.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onOpenChange(false)}>{isCreationMode ? "Create User" : "Save Changes"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}