import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Globe,
  MapPin,
  Clock,
  Smartphone,
  Shield,
  Plus,
  Edit,
  Power,
  PowerOff,
  AlertTriangle,
  Check,
  X,
} from "lucide-react";
import { AccessRule } from "./types";
import { accessRulesService } from "@/services/userSetupService";
import { useToast } from "@/hooks/use-toast";

const getRuleTypeIcon = (type: string) => {
  switch (type) {
    case "ip":
      return <Globe className="h-5 w-5" />;
    case "geo":
      return <MapPin className="h-5 w-5" />;
    case "time":
      return <Clock className="h-5 w-5" />;
    case "device":
      return <Smartphone className="h-5 w-5" />;
    case "custom":
      return <Shield className="h-5 w-5" />;
    default:
      return <Shield className="h-5 w-5" />;
  }
};

const getRuleTypeColor = (type: string) => {
  switch (type) {
    case "ip":
      return "bg-primary/10 text-primary";
    case "geo":
      return "bg-success/10 text-success";
    case "time":
      return "bg-warning/10 text-warning";
    case "device":
      return "bg-info/10 text-info";
    case "custom":
      return "bg-destructive/10 text-destructive";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export function AccessRestrictions() {
  const [rules, setRules] = useState<AccessRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingRule, setEditingRule] = useState<AccessRule | null>(null);
  const [newRule, setNewRule] = useState({
    name: "",
    type: "ip",
    description: "",
    ips: "",
    countries: [] as string[],
    startHour: 9,
    endHour: 18,
    timezone: "UTC",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { toast } = useToast();
  useEffect(() => {
    const fetchRules = async () => {
      setLoading(true);
      try {
        const resp = await accessRulesService.getAll();
        if (resp && resp.data) {
          setRules(resp.data);
        }
      } catch (error) {
        console.error("Failed to fetch rules", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRules();
  }, []);

  const toggleRuleStatus = async (ruleId: string) => {
    const rule = rules.find(r => r.id === ruleId);
    if (!rule) return;
    const newStatus = rule.status === 'active' ? 'inactive' : 'active';
    try {
      await accessRulesService.update(ruleId, { status: newStatus });
      setRules(rules.map((r) => r.id === ruleId ? { ...r, status: newStatus } : r));
      toast({ title: "Status Updated", description: `${rule.name} set to ${newStatus}.` });
    } catch (err) {
      toast({ title: "Error", description: "Failed to update rule on server", variant: "destructive" });
    }
  };

  const activeRules = rules.filter((r) => r.status === "active");
  const inactiveRules = rules.filter((r) => r.status === "inactive");
  const allRules = useMemo(() => [...activeRules, ...inactiveRules], [activeRules, inactiveRules]);
  const totalPages = Math.max(1, Math.ceil(allRules.length / itemsPerPage));
  const paginatedRules = allRules.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const paginatedActiveRules = paginatedRules.filter((rule) => rule.status === "active");
  const paginatedInactiveRules = paginatedRules.filter((rule) => rule.status === "inactive");

  const countryOptions = [
    { code: "IN", name: "India" },
    { code: "US", name: "United States" },
    { code: "GB", name: "United Kingdom" },
    { code: "SG", name: "Singapore" },
    { code: "AE", name: "UAE" },
  ];

  const dayOptions = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-lg">Access Control Rules</h3>
          <p className="text-sm text-muted-foreground">
            Configure IP, location, time, and device-based access restrictions
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingRule(null);
            setNewRule({
              name: "",
              type: "ip",
              description: "",
              ips: "",
              countries: [],
              startHour: 9,
              endHour: 18,
              timezone: "UTC",
              days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
            });
            setShowCreateDialog(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Rule
        </Button>
      </div>

      {/* Warning Banner */}
      <div className="flex items-start gap-3 p-4 bg-warning/10 border border-warning/20 rounded-lg">
        <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
        <div>
          <p className="font-medium text-warning">Access Rules Affect All Users</p>
          <p className="text-sm text-muted-foreground mt-1">
            Changes to access rules will immediately affect user access. Ensure rules are tested before enabling.
          </p>
        </div>
      </div>

      {/* Active Rules */}
      <div className="space-y-4">
        <h4 className="font-medium flex items-center gap-2">
          <Check className="h-4 w-4 text-success" />
          Active Rules ({activeRules.length})
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paginatedActiveRules.map((rule) => (
            <Card key={rule.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${getRuleTypeColor(rule.type)}`}>
                      {getRuleTypeIcon(rule.type)}
                    </div>
                    <div>
                      <CardTitle className="text-base">{rule.name}</CardTitle>
                      <Badge variant="outline" className="mt-1 capitalize text-xs">
                        {rule.type}
                      </Badge>
                    </div>
                  </div>
                  <Switch
                    checked={rule.status === "active"}
                    onCheckedChange={() => toggleRuleStatus(rule.id)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{rule.description}</CardDescription>
                <div className="flex items-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingRule(rule);
                      setNewRule({
                        name: rule.name,
                        type: rule.type,
                        description: rule.description || "",
                        ips: (rule.conditions?.ips || []).join(", "),
                        countries: rule.conditions?.countries || [],
                        startHour: rule.conditions?.startHour || 9,
                        endHour: rule.conditions?.endHour || 18,
                        timezone: rule.conditions?.timezone || "UTC",
                        days: rule.conditions?.days || ["Mon", "Tue", "Wed", "Thu", "Fri"],
                      });
                      setShowCreateDialog(true);
                    }}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Inactive Rules */}
      {paginatedInactiveRules.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2 text-muted-foreground">
            <X className="h-4 w-4" />
            Inactive Rules ({inactiveRules.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginatedInactiveRules.map((rule) => (
              <Card key={rule.id} className="opacity-60 hover:opacity-100 transition-opacity">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                        {getRuleTypeIcon(rule.type)}
                      </div>
                      <div>
                        <CardTitle className="text-base text-muted-foreground">{rule.name}</CardTitle>
                        <Badge variant="secondary" className="mt-1 capitalize text-xs">
                          {rule.type}
                        </Badge>
                      </div>
                    </div>
                    <Switch
                      checked={rule.status === "active"}
                      onCheckedChange={() => toggleRuleStatus(rule.id)}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{rule.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex-1 text-sm text-muted-foreground">
          {allRules.length > 0 ? (
            <>
              Showing <span className="font-medium text-foreground">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
              <span className="font-medium text-foreground">{Math.min(currentPage * itemsPerPage, allRules.length)}</span> of{" "}
              <span className="font-medium text-foreground">{allRules.length}</span> results
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
            disabled={currentPage === totalPages || allRules.length <= itemsPerPage}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Create Rule Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Create Access Rule
            </DialogTitle>
            <DialogDescription>
              Define a new access restriction rule for your organization
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="ruleName">Rule Name</Label>
              <Input
                id="ruleName"
                placeholder="e.g., Office Hours Access"
                value={newRule.name}
                onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Rule Type</Label>
              <Tabs value={newRule.type} onValueChange={(v) => setNewRule({ ...newRule, type: v })}>
                <TabsList className="grid grid-cols-4 p-2 h-auto bg-muted">
                  <TabsTrigger value="ip" className="text-xs">IP</TabsTrigger>
                  <TabsTrigger value="geo" className="text-xs">Geo</TabsTrigger>
                  <TabsTrigger value="time" className="text-xs">Time</TabsTrigger>
                  <TabsTrigger value="custom" className="text-xs">Custom</TabsTrigger>
                </TabsList>

                <TabsContent value="ip" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>IP Addresses / CIDR Ranges</Label>
                    <Input
                      placeholder="e.g., 192.168.1.0/24, 10.0.0.1"
                      value={newRule.ips}
                      onChange={(e) => setNewRule({ ...newRule, ips: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Separate multiple IPs with commas
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="geo" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Allowed Countries</Label>
                    <Select
                      value={newRule.countries[0] || ""}
                      onValueChange={(value) => setNewRule({ ...newRule, countries: [value] })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select countries" />
                      </SelectTrigger>
                      <SelectContent>
                        {countryOptions.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="time" className="space-y-4 mt-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Start Hour</Label>
                      <Select
                        value={newRule.startHour.toString()}
                        onValueChange={(v) => setNewRule({ ...newRule, startHour: parseInt(v) })}
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
                        value={newRule.endHour.toString()}
                        onValueChange={(v) => setNewRule({ ...newRule, endHour: parseInt(v) })}
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
                        value={newRule.timezone}
                        onValueChange={(v) => setNewRule({ ...newRule, timezone: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UTC">UTC</SelectItem>
                          <SelectItem value="Asia/Kolkata">IST</SelectItem>
                          <SelectItem value="America/New_York">EST</SelectItem>
                          <SelectItem value="Europe/London">GMT</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Active Days</Label>
                    <div className="flex flex-wrap gap-2">
                      {dayOptions.map((day) => (
                        <Badge
                          key={day}
                          variant={newRule.days.includes(day) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => {
                            if (newRule.days.includes(day)) {
                              setNewRule({
                                ...newRule,
                                days: newRule.days.filter((d) => d !== day),
                              });
                            } else {
                              setNewRule({ ...newRule, days: [...newRule.days, day] });
                            }
                          }}
                        >
                          {day}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TabsContent>



                <TabsContent value="custom" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="ruleDescription">Rule Description</Label>
                    <Input
                      id="ruleDescription"
                      placeholder="Describe the custom rule conditions..."
                      value={newRule.description}
                      onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!newRule.name.trim()) {
                  toast({ title: "Rule Name Required", description: "Please enter a rule name." });
                  return;
                }

                const ruleToSave: AccessRule = {
                  id: editingRule?.id || `rule-${Date.now()}`,
                  name: newRule.name,
                  type: newRule.type as AccessRule["type"],
                  status: "active",
                  description: newRule.description,
                  conditions:
                    newRule.type === "ip"
                      ? { ips: newRule.ips.split(",").map((ip) => ip.trim()).filter(Boolean) }
                      : newRule.type === "geo"
                        ? { countries: newRule.countries }
                        : newRule.type === "time"
                          ? {
                            startHour: newRule.startHour,
                            endHour: newRule.endHour,
                            timezone: newRule.timezone,
                            days: newRule.days,
                          }
                          : {},
                };

                setRules((prev) =>
                  editingRule ? prev.map((rule) => (rule.id === editingRule.id ? ruleToSave : rule)) : [ruleToSave, ...prev]
                );
                setShowCreateDialog(false);
                setEditingRule(null);
                setNewRule({
                  name: "",
                  type: "ip",
                  description: "",
                  ips: "",
                  countries: [],
                  startHour: 9,
                  endHour: 18,
                  timezone: "UTC",
                  days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
                });
                toast({
                  title: editingRule ? "Rule Updated" : "Rule Created",
                  description: `${ruleToSave.name} saved successfully.`,
                });
              }}
            >
              {editingRule ? "Save Rule" : "Create Rule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
