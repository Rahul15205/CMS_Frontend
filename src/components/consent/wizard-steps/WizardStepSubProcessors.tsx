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
import { Plus, Trash2, Server, Globe, Bell, Info } from "lucide-react";
import { ConsentTemplate, SubProcessor } from "../types";

interface WizardStepSubProcessorsProps {
  data: Partial<ConsentTemplate>;
  onChange: (updates: Partial<ConsentTemplate>) => void;
}

const countries = [
  "India", "United States", "United Kingdom", "Germany", "France", 
  "Singapore", "UAE", "Saudi Arabia", "China", "Japan", "Australia", "Other"
];

export function WizardStepSubProcessors({ data, onChange }: WizardStepSubProcessorsProps) {
  const [newSubProcessor, setNewSubProcessor] = useState<Partial<SubProcessor>>({
    name: "",
    purpose: "",
    country: "",
    changeNotification: true,
  });

  const subProcessors = data.subProcessors || [];

  const addSubProcessor = () => {
    if (!newSubProcessor.name || !newSubProcessor.purpose || !newSubProcessor.country) return;
    
    const processor: SubProcessor = {
      id: `sp-${Date.now()}`,
      name: newSubProcessor.name,
      purpose: newSubProcessor.purpose,
      country: newSubProcessor.country,
      changeNotification: newSubProcessor.changeNotification ?? true,
    };
    
    onChange({ subProcessors: [...subProcessors, processor] });
    setNewSubProcessor({
      name: "",
      purpose: "",
      country: "",
      changeNotification: true,
    });
  };

  const removeSubProcessor = (id: string) => {
    onChange({ subProcessors: subProcessors.filter((p) => p.id !== id) });
  };

  const updateSubProcessor = (id: string, updates: Partial<SubProcessor>) => {
    onChange({
      subProcessors: subProcessors.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    });
  };

  return (
    <div className="space-y-8">
      {/* Info Banner */}
      <div className="p-4 rounded-lg bg-info/10 border border-info/20">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-info mt-0.5" />
          <div>
            <h4 className="font-medium text-info">Sub-Processor Transparency</h4>
            <p className="text-sm text-muted-foreground mt-1">
              List all sub-processors who will process data on behalf of your third parties. 
              This is required for GDPR compliance and recommended under DPDP Act.
            </p>
          </div>
        </div>
      </div>

      {/* Skip if no data sharing */}
      {!data.dataSharing && (
        <div className="p-8 text-center text-muted-foreground rounded-lg border border-dashed">
          <Server className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No Third-Party Sharing Configured</p>
          <p className="text-sm mt-1">
            Sub-processors are typically used when you share data with third parties.
            You can skip this section or go back to enable data sharing.
          </p>
        </div>
      )}

      {data.dataSharing && (
        <>
          {/* Existing Sub-Processors */}
          {subProcessors.length > 0 && (
            <div className="space-y-4">
              <Label className="text-sm font-medium">Configured Sub-Processors ({subProcessors.length})</Label>
              <div className="space-y-3">
                {subProcessors.map((processor) => (
                  <div key={processor.id} className="p-4 rounded-lg border bg-card">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Server className="h-4 w-4 text-primary" />
                          <h4 className="font-medium">{processor.name}</h4>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            {processor.country}
                          </Badge>
                          {processor.changeNotification && (
                            <Badge className="bg-success/10 text-success border-success/20 flex items-center gap-1">
                              <Bell className="h-3 w-3" />
                              Notifications On
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          Purpose: {processor.purpose}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={processor.changeNotification}
                          onCheckedChange={(checked) => updateSubProcessor(processor.id, { changeNotification: checked })}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeSubProcessor(processor.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add New Sub-Processor Form */}
          <div className="space-y-4 p-4 rounded-lg border-2 border-dashed">
            <Label className="text-sm font-medium">Add Sub-Processor</Label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="spName" className="text-xs text-muted-foreground">
                  Sub-Processor Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="spName"
                  placeholder="e.g., AWS, Google Cloud"
                  value={newSubProcessor.name}
                  onChange={(e) => setNewSubProcessor({ ...newSubProcessor, name: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Country Location <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={newSubProcessor.country}
                  onValueChange={(v) => setNewSubProcessor({ ...newSubProcessor, country: v })}
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="spPurpose" className="text-xs text-muted-foreground">
                Processing Purpose <span className="text-destructive">*</span>
              </Label>
              <Input
                id="spPurpose"
                placeholder="e.g., Cloud hosting, Data storage"
                value={newSubProcessor.purpose}
                onChange={(e) => setNewSubProcessor({ ...newSubProcessor, purpose: e.target.value })}
              />
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="changeNotif"
                checked={newSubProcessor.changeNotification}
                onCheckedChange={(checked) => setNewSubProcessor({ ...newSubProcessor, changeNotification: checked })}
              />
              <Label htmlFor="changeNotif" className="text-sm cursor-pointer">
                Notify users of sub-processor changes
              </Label>
            </div>

            <Button
              onClick={addSubProcessor}
              disabled={!newSubProcessor.name || !newSubProcessor.purpose || !newSubProcessor.country}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Sub-Processor
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
