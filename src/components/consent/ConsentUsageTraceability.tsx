import { useState } from "react";
import {
  Search,
  Filter,
  Download,
  Database,
  Users,
  CheckCircle,
  XCircle,
  TrendingDown,
  Activity,
  Calendar,
  Clock,
  Server,
  Eye,
  FileText,
  RefreshCw,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { consentService } from "@/services/consentService";
import type { ConsentUsageRecord, SystemConfig } from "./types";
import { useToast } from "@/hooks/use-toast";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";

function SystemConfigurationDialog({
  open,
  onOpenChange,
  onSave,
  isLoading
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (config: SystemConfig) => void;
  isLoading?: boolean;
}) {
  const [config, setConfig] = useState<SystemConfig>({
    name: "",
    type: "marketing",
    integrationMode: "api_pull",
    authMethod: "api_key",
    endpoint: "",
    description: ""
  });

  const handleSubmit = () => {
    onSave(config);
    // Reset form
    setConfig({
      name: "",
      type: "marketing",
      integrationMode: "api_pull",
      authMethod: "api_key",
      endpoint: "",
      description: ""
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Configure System</DialogTitle>
          <DialogDescription>
            Register an external system that consumes consent data.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">System Name</Label>
            <Input
              id="name"
              value={config.name}
              onChange={(e) => setConfig({ ...config, name: e.target.value })}
              placeholder="e.g. HubSpot CRM"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="type">System Type</Label>
            <Select
              value={config.type}
              onValueChange={(v) => setConfig({ ...config, type: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="marketing">Marketing Platform</SelectItem>
                <SelectItem value="crm">CRM System</SelectItem>
                <SelectItem value="analytics">Analytics Dashboard</SelectItem>
                <SelectItem value="core">Core Application</SelectItem>
                <SelectItem value="partner">Partner Portal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="integration">Integration Mode</Label>
            <Select
              value={config.integrationMode}
              onValueChange={(v) => setConfig({ ...config, integrationMode: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select integration mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="api_pull">API Pull</SelectItem>
                <SelectItem value="webhook_push">Webhook Push</SelectItem>
                <SelectItem value="event_streaming">Event Streaming</SelectItem>
                <SelectItem value="shared_storage">Shared Storage</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="auth">Authentication Method</Label>
            <Select
              value={config.authMethod}
              onValueChange={(v) => setConfig({ ...config, authMethod: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select authentication" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="api_key">API Key</SelectItem>
                <SelectItem value="oauth2">OAuth 2.0</SelectItem>
                <SelectItem value="mtls">Mutual TLS</SelectItem>
                <SelectItem value="basic">Basic Auth</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="endpoint">Endpoint URL / Topic</Label>
            <Input
              id="endpoint"
              value={config.endpoint}
              onChange={(e) => setConfig({ ...config, endpoint: e.target.value })}
              placeholder="https://api.example.com/v1/consent"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!config.name || isLoading}>
            {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : null}
            Register System
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const getStatusBadge = (status: ConsentUsageRecord["consentStatus"]) => {
  switch (status) {
    case "active":
      return <Badge className="bg-success/10 text-success border-success/20">Active</Badge>;
    case "withdrawn":
      return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Withdrawn</Badge>;
    default:
      return <Badge variant="secondary">Expired</Badge>;
  }
};

export function ConsentUsageTraceability() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [systemFilter, setSystemFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("all");
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ConsentUsageRecord | null>(null);

  // Queries
  const { data: usageData, isLoading: isLoadingUsage } = useQuery({
    queryKey: ["consent-usage", searchQuery, statusFilter, systemFilter],
    queryFn: () => consentService.getUsageRecords({
      search: searchQuery,
      status: statusFilter === "all" ? undefined : statusFilter,
    }),
  });

  const { data: systemsData } = useQuery({
    queryKey: ["system-configs"],
    queryFn: () => consentService.getSystemConfigs(),
  });

  // Mutation
  const registerMutation = useMutation({
    mutationFn: (config: SystemConfig) => consentService.createSystemConfig(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system-configs"] });
      toast({
        title: "System Registered",
        description: "The consuming system has been successfully registered.",
      });
      setShowConfigDialog(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to register the system. Please try again.",
        variant: "destructive",
      });
    },
  });

  const records = usageData?.data || [];
  const totalRecordsCount = usageData?.total || 0;
  
  const systems = [...new Set(records.map((r) => r.systemApp))];

  // Calculate metrics from live data
  const activeConsents = records.filter((r) => r.consentStatus === "active").length;
  const withdrawnConsents = records.filter((r) => r.consentStatus === "withdrawn").length;
  const consentCoverage = totalRecordsCount > 0 ? Math.round((activeConsents / records.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Admin Dashboard Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalRecordsCount.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Consents</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10 text-success">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeConsents.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Active Consents</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
                <XCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{withdrawnConsents.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Withdrawals</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-info/10 text-info">
                <TrendingDown className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{consentCoverage}%</p>
                <p className="text-xs text-muted-foreground">Consent Coverage</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10 text-warning">
                <Server className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{systemsData?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Systems Using</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Systems Overview */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Systems Consuming Consent Data
            </CardTitle>
            <Button size="sm" onClick={() => setShowConfigDialog(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Configure System
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {systemsData?.map((system) => (
              <div
                key={system.id || system.name}
                className="p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Server className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{system.name}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{system.type}</span>
                  <span>{system.createdAt ? new Date(system.createdAt).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
            ))}
            {!systemsData?.length && (
              <div className="col-span-full py-4 text-center text-sm text-muted-foreground">
                No consuming systems registered yet.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <SystemConfigurationDialog
        open={showConfigDialog}
        onOpenChange={setShowConfigDialog}
        isLoading={registerMutation.isPending}
        onSave={(newSystem) => {
          registerMutation.mutate(newSystem);
        }}
      />

      {/* Filters */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3 w-full lg:w-auto flex-wrap">
          <div className="relative flex-1 lg:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by user ID, template, purpose..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="withdrawn">Withdrawn</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
          <Select value={systemFilter} onValueChange={setSystemFilter}>
            <SelectTrigger className="w-44">
              <Server className="h-4 w-4 mr-2" />
              <SelectValue placeholder="System" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Systems</SelectItem>
              {systems.map((system) => (
                <SelectItem key={system} value={system}>
                  {system}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-36">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Traceability Table */}
      <div className="border rounded-lg overflow-auto bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>User Identifier</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Consent Template</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead>System/App</TableHead>
              <TableHead>Consent Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Validation</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingUsage ? (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                  Loading records...
                </TableCell>
              </TableRow>
            ) : records.map((record) => (
              <TableRow key={record.id} className="hover:bg-muted/30">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono text-sm">{record.userIdentifier}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-xs text-muted-foreground">{record.ipAddress || "192.168.1.xxx"}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="text-sm">{record.templateName}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-sm">v{record.version}</span>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{record.purposeMapped}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <Server className="h-3 w-3 text-muted-foreground" />
                    {record.systemApp}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(record.consentDateTime).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(record.consentStatus)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {new Date(record.lastValidation).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-emerald-50 text-emerald-600 hover:text-emerald-700 dark:hover:bg-emerald-950/30"
                    onClick={() => setSelectedRecord(record)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Results summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>Showing {records.length} of {totalRecordsCount} records</p>
        <p className="text-xs">User identifiers are pseudonymized for privacy</p>
      </div>

      {/* Details Receipt Dialog */}
      <Dialog open={!!selectedRecord} onOpenChange={(open) => !open && setSelectedRecord(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-600">
              <Eye className="h-5 w-5" />
              Consent Usage Receipt
            </DialogTitle>
            <DialogDescription>
              Detailed cryptographic audit receipt for the recorded consent event.
            </DialogDescription>
          </DialogHeader>
          {selectedRecord && (
            <div className="grid gap-4 py-4 text-sm">
              <div className="grid grid-cols-3 items-center gap-4 border-b pb-2">
                <span className="font-semibold text-muted-foreground">User Identifier</span>
                <span className="col-span-2 font-mono break-all text-foreground">{selectedRecord.userIdentifier}</span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4 border-b pb-2">
                <span className="font-semibold text-muted-foreground">IP Address</span>
                <span className="col-span-2 font-mono text-foreground">{selectedRecord.ipAddress || "192.168.1.xxx"}</span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4 border-b pb-2">
                <span className="font-semibold text-muted-foreground">Consent Template</span>
                <span className="col-span-2 text-foreground font-medium">{selectedRecord.templateName || "Website Signin"}</span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4 border-b pb-2">
                <span className="font-semibold text-muted-foreground">Version</span>
                <span className="col-span-2 font-mono text-foreground">v{selectedRecord.version}</span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4 border-b pb-2">
                <span className="font-semibold text-muted-foreground">System / App</span>
                <span className="col-span-2 text-foreground">{selectedRecord.systemApp}</span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4 border-b pb-2">
                <span className="font-semibold text-muted-foreground">Purpose Mapped</span>
                <div className="col-span-2">
                  <Badge variant="outline" className="text-xs bg-muted/50 font-normal">
                    {selectedRecord.purposeMapped}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4 border-b pb-2">
                <span className="font-semibold text-muted-foreground">Consent Date</span>
                <span className="col-span-2 text-foreground">
                  {new Date(selectedRecord.consentDateTime).toLocaleString()}
                </span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4 border-b pb-2">
                <span className="font-semibold text-muted-foreground">Status</span>
                <span className="col-span-2">{getStatusBadge(selectedRecord.consentStatus)}</span>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="font-semibold text-muted-foreground">Last Audited</span>
                <span className="col-span-2 text-foreground">
                  {new Date(selectedRecord.lastValidation).toLocaleString()}
                </span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedRecord(null)}>Close Receipt</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
