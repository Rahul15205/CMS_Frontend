import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, Trash2, AlertTriangle, Target, Cpu, Brain, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConsentTemplate, Purpose } from "../types";

interface WizardStepPurposeProps {
  data: Partial<ConsentTemplate>;
  onChange: (updates: Partial<ConsentTemplate>) => void;
}

export function WizardStepPurpose({ data, onChange }: WizardStepPurposeProps) {
  const [newPurpose, setNewPurpose] = useState<Partial<Purpose>>({
    name: "",
    description: "",
    isPrimary: true,
    necessity: "essential",
    automatedProcessing: false,
    profilingUsage: false,
  });

  const purposes = data.purposes || [];

  const addPurpose = () => {
    if (!newPurpose.name || !newPurpose.description) return;

    const purpose: Purpose = {
      id: `purpose-${Date.now()}`,
      name: newPurpose.name,
      description: newPurpose.description,
      isPrimary: newPurpose.isPrimary || false,
      necessity: newPurpose.necessity || "essential",
      automatedProcessing: newPurpose.automatedProcessing || false,
      profilingUsage: newPurpose.profilingUsage || false,
    };

    onChange({ purposes: [...purposes, purpose] });
    setNewPurpose({
      name: "",
      description: "",
      isPrimary: false,
      necessity: "essential",
      automatedProcessing: false,
      profilingUsage: false,
    });
  };

  const removePurpose = (id: string) => {
    onChange({ purposes: purposes.filter((p) => p.id !== id) });
  };

  const updatePurpose = (id: string, updates: Partial<Purpose>) => {
    onChange({
      purposes: purposes.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    });
  };

  return (
    <div className="space-y-8">
      {/* DPDP Act Warning */}
      <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
          <div>
            <h4 className="font-medium text-warning">Purpose Specification Requirements</h4>
            <p className="text-sm text-muted-foreground mt-1">
              As per the Data privacy & Protection regulations purpose must be clear, specific, and unambiguous. Bundling multiple purposes or using vague language is not permitted.
            </p>
          </div>
        </div>
      </div>

      {/* Existing Purposes */}
      {purposes.length > 0 && (
        <div className="space-y-4">
          <Label className="text-sm font-medium">Defined Purposes ({purposes.length})</Label>
          <div className="space-y-3">
            {purposes.map((purpose) => (
              <div
                key={purpose.id}
                className="p-4 rounded-lg border bg-card space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" />
                      <h4 className="font-medium">{purpose.name}</h4>
                      {purpose.isPrimary && (
                        <Badge variant="secondary" className="text-xs">Primary</Badge>
                      )}
                      <Badge
                        variant="outline"
                        className={purpose.necessity === "essential"
                          ? "border-success/50 text-success"
                          : "border-muted-foreground/50"
                        }
                      >
                        {purpose.necessity === "essential" ? "Essential" : "Non-Essential"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{purpose.description}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => removePurpose(purpose.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-6 pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <Switch
                      id={`automated-${purpose.id}`}
                      checked={purpose.automatedProcessing}
                      onCheckedChange={(checked) => updatePurpose(purpose.id, { automatedProcessing: checked })}
                    />
                    <Label htmlFor={`automated-${purpose.id}`} className="text-xs flex items-center gap-1 cursor-pointer">
                      <Cpu className="h-3 w-3" />
                      Automated Processing
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id={`profiling-${purpose.id}`}
                      checked={purpose.profilingUsage}
                      onCheckedChange={(checked) => updatePurpose(purpose.id, { profilingUsage: checked })}
                    />
                    <Label htmlFor={`profiling-${purpose.id}`} className="text-xs flex items-center gap-1 cursor-pointer">
                      <Brain className="h-3 w-3" />
                      Profiling / AI Usage
                    </Label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add New Purpose Form */}
      <div className="space-y-4 p-4 rounded-lg border-2 border-dashed">
        <Label className="text-sm font-medium">Add New Purpose</Label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="purposeName" className="text-xs text-muted-foreground">
              Purpose Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="purposeName"
              placeholder="e.g., Marketing Communications"
              value={newPurpose.name}
              onChange={(e) => setNewPurpose({ ...newPurpose, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Purpose Type</Label>
            <RadioGroup
              value={newPurpose.isPrimary ? "primary" : "secondary"}
              onValueChange={(v) => setNewPurpose({ ...newPurpose, isPrimary: v === "primary" })}
              className="flex gap-4"
            >
              <Label className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value="primary" />
                <span className="text-sm">Primary Purpose</span>
              </Label>
              <Label className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value="secondary" />
                <span className="text-sm">Secondary Purpose</span>
              </Label>
            </RadioGroup>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="purposeDesc" className={cn("text-xs text-muted-foreground", !newPurpose.name && "opacity-50")}>
            Purpose Description <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="purposeDesc"
            placeholder={newPurpose.name ? "Clear, specific description of why this data is being collected..." : "Enter purpose name first"}
            value={newPurpose.description}
            onChange={(e) => setNewPurpose({ ...newPurpose, description: e.target.value })}
            disabled={!newPurpose.name}
            className="min-h-[80px]"
          />
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Info className="h-3 w-3" />
            Be specific - vague purposes like "to improve services" are not compliant
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Necessity</Label>
            <RadioGroup
              value={newPurpose.necessity}
              onValueChange={(v) => setNewPurpose({ ...newPurpose, necessity: v as "essential" | "non-essential" })}
              className="flex gap-4"
            >
              <Label className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value="essential" />
                <span className="text-sm">Essential</span>
              </Label>
              <Label className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value="non-essential" />
                <span className="text-sm">Non-Essential</span>
              </Label>
            </RadioGroup>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="newAutomated"
              checked={newPurpose.automatedProcessing}
              onCheckedChange={(checked) => setNewPurpose({ ...newPurpose, automatedProcessing: checked })}
            />
            <Label htmlFor="newAutomated" className="text-sm cursor-pointer">
              Automated Processing
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="newProfiling"
              checked={newPurpose.profilingUsage}
              onCheckedChange={(checked) => setNewPurpose({ ...newPurpose, profilingUsage: checked })}
            />
            <Label htmlFor="newProfiling" className="text-sm cursor-pointer">
              Profiling / AI Usage
            </Label>
          </div>
        </div>

        <Button
          onClick={addPurpose}
          disabled={!newPurpose.name || !newPurpose.description}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Purpose
        </Button>
      </div>
    </div>
  );
}
