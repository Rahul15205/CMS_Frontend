import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Building2, Globe, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConsentTemplate, ThirdParty, ThirdPartyRole } from "../types";

interface WizardStepDataSharingProps {
  data: Partial<ConsentTemplate>;
  onChange: (updates: Partial<ConsentTemplate>) => void;
}

const countries = [
  "India", "United States", "United Kingdom", "Germany", "France",
  "Singapore", "UAE", "Saudi Arabia", "China", "Japan", "Australia", "Other"
];

const roleLabels: Record<ThirdPartyRole, string> = {
  "data-processor": "Data Processor",
  "joint-controller": "Joint Controller",
  "sub-processor": "Sub-Processor",
};

export function WizardStepDataSharing({ data, onChange }: WizardStepDataSharingProps) {
  const [newThirdParty, setNewThirdParty] = useState<Partial<ThirdParty>>({
    name: "",
    role: "data-processor",
    purpose: "",
    country: "",
    crossBorderTransfer: false,
  });

  const thirdParties = data.thirdParties || [];
  const hasTAPA = data.regulations?.includes("TAPA");
  const hasPDPL = data.regulations?.includes("PDPL");

  const addThirdParty = () => {
    if (!newThirdParty.name || !newThirdParty.purpose || !newThirdParty.country) return;

    const party: ThirdParty = {
      id: `tp-${Date.now()}`,
      name: newThirdParty.name,
      role: newThirdParty.role || "data-processor",
      purpose: newThirdParty.purpose,
      country: newThirdParty.country,
      crossBorderTransfer: newThirdParty.crossBorderTransfer || false,
    };

    onChange({ thirdParties: [...thirdParties, party] });
    setNewThirdParty({
      name: "",
      role: "data-processor",
      purpose: "",
      country: "",
      crossBorderTransfer: false,
    });
  };

  const removeThirdParty = (id: string) => {
    onChange({ thirdParties: thirdParties.filter((p) => p.id !== id) });
  };

  return (
    <div className="space-y-8">
      {/* Data Sharing Toggle */}
      <div className="flex items-start justify-between p-4 rounded-lg border bg-card">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <Label htmlFor="dataSharing" className="font-medium cursor-pointer text-base">
              Third-Party Data Sharing
            </Label>
          </div>
          <p className="text-sm text-muted-foreground mt-1 ml-7">
            Will personal data be shared with any third parties?
          </p>
        </div>
        <Switch
          id="dataSharing"
          checked={data.dataSharing}
          onCheckedChange={(checked) => onChange({ dataSharing: checked })}
        />
      </div>

      {data.dataSharing && (
        <>
          {/* PIPL/PDPL Specific Warning */}
          {(hasTAPA || hasPDPL) && (
            <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                <div>
                  <h4 className="font-medium text-warning">Cross-Border Transfer Requirements</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {hasTAPA && "TAPA requires separate, explicit consent for cross-border data transfers. "}
                    {hasPDPL && "PDPL requires specific consent and adequacy assessment for international transfers."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Existing Third Parties */}
          {thirdParties.length > 0 && (
            <div className="space-y-4">
              <Label className="text-sm font-medium">Configured Third Parties ({thirdParties.length})</Label>
              <div className="space-y-3">
                {thirdParties.map((party) => (
                  <div
                    key={party.id}
                    className={cn(
                      "p-4 rounded-lg border bg-card",
                      party.crossBorderTransfer && "border-warning/50"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Building2 className="h-4 w-4 text-primary" />
                          <h4 className="font-medium">{party.name}</h4>
                          <Badge variant="secondary">{roleLabels[party.role]}</Badge>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            {party.country}
                          </Badge>
                          {party.crossBorderTransfer && (
                            <Badge className="bg-warning/10 text-warning border-warning/20">
                              Cross-Border
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          Purpose: {party.purpose}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => removeThirdParty(party.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add New Third Party Form */}
          <div className="space-y-4 p-4 rounded-lg border-2 border-dashed">
            <Label className="text-sm font-medium">Add Third Party</Label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tpName" className="text-xs text-muted-foreground">
                  Third Party Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="tpName"
                  placeholder="e.g., Analytics Corp"
                  value={newThirdParty.name}
                  onChange={(e) => setNewThirdParty({ ...newThirdParty, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Role <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={newThirdParty.role}
                  onValueChange={(v) => setNewThirdParty({ ...newThirdParty, role: v as ThirdPartyRole })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="data-processor">Data Processor</SelectItem>
                    <SelectItem value="joint-controller">Joint Controller</SelectItem>
                    <SelectItem value="sub-processor">Sub-Processor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tpPurpose" className="text-xs text-muted-foreground">
                Purpose of Sharing <span className="text-destructive">*</span>
              </Label>
              <Input
                id="tpPurpose"
                placeholder="e.g., Email delivery, Payment processing"
                value={newThirdParty.purpose}
                onChange={(e) => setNewThirdParty({ ...newThirdParty, purpose: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Country <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={newThirdParty.country}
                  onValueChange={(v) => {
                    const isCrossBorder = v !== "India" && data.regulations?.includes("DPDP");
                    setNewThirdParty({
                      ...newThirdParty,
                      country: v,
                      crossBorderTransfer: isCrossBorder || newThirdParty.crossBorderTransfer
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>{country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-3 pt-6">
                <Switch
                  id="crossBorder"
                  checked={newThirdParty.crossBorderTransfer}
                  onCheckedChange={(checked) => setNewThirdParty({ ...newThirdParty, crossBorderTransfer: checked })}
                />
                <Label htmlFor="crossBorder" className="text-sm cursor-pointer">
                  Cross-Border Transfer
                </Label>
              </div>
            </div>

            {newThirdParty.crossBorderTransfer && (
              <div className="p-3 rounded-lg bg-info/10 border border-info/20">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-info mt-0.5" />
                  <p className="text-xs text-info">
                    Cross-border transfers require additional consent disclosures and may need
                    separate consent checkboxes under TAPA/PDPL regulations.
                  </p>
                </div>
              </div>
            )}

            <Button
              onClick={addThirdParty}
              disabled={!newThirdParty.name || !newThirdParty.purpose || !newThirdParty.country}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Third Party
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
