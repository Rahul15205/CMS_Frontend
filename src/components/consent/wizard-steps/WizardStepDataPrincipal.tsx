import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { User, Users, Building, Baby, Shield, Info, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConsentTemplate, UserCategory } from "../types";

interface WizardStepDataPrincipalProps {
  data: Partial<ConsentTemplate>;
  onChange: (updates: Partial<ConsentTemplate>) => void;
}

const initialUserCategories: { value: UserCategory; label: string; icon: React.ReactNode; description: string }[] = [
  { value: "customer", label: "Customer", icon: <User className="h-4 w-4" />, description: "End users of your service" },
  { value: "employee", label: "Employee", icon: <Building className="h-4 w-4" />, description: "Staff and contractors" },
  { value: "vendor", label: "Vendor", icon: <Users className="h-4 w-4" />, description: "Third-party suppliers" },
  { value: "minor", label: "Minor", icon: <Baby className="h-4 w-4" />, description: "Users under age threshold" },
  { value: "guardian", label: "Guardian", icon: <Shield className="h-4 w-4" />, description: "Parents or legal guardians" },
];

export function WizardStepDataPrincipal({ data, onChange }: WizardStepDataPrincipalProps) {
  const [availableCategories, setAvailableCategories] = useState(initialUserCategories);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDesc, setNewCategoryDesc] = useState("");

  const toggleUserCategory = (category: UserCategory) => {
    const current = data.targetUserCategory || [];
    const updated = current.includes(category)
      ? current.filter((c) => c !== category)
      : [...current, category];
    onChange({ targetUserCategory: updated });
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;

    const newCategory = {
      value: newCategoryName.toLowerCase().replace(/\s+/g, "-") as UserCategory,
      label: newCategoryName,
      icon: <Users className="h-4 w-4" />, // Default icon
      description: newCategoryDesc || "Custom user category"
    };

    setAvailableCategories([...availableCategories, newCategory]);
    // Auto-select the new category
    toggleUserCategory(newCategory.value);

    // Reset and close
    setNewCategoryName("");
    setNewCategoryDesc("");
    setIsAddCategoryOpen(false);
  };

  const hasMinorSelected = data.targetUserCategory?.includes("minor");

  return (
    <div className="space-y-8">
      {/* Target User Categories */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium">
              Target User Category <span className="text-destructive">*</span>
            </Label>
            <p className="text-xs text-muted-foreground mt-1">
              Select all user types this consent applies to
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setIsAddCategoryOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add User Category
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {availableCategories.map((category) => (
            <Label
              key={category.value}
              className={cn(
                "flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all",
                data.targetUserCategory?.includes(category.value)
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
            >
              <Checkbox
                checked={data.targetUserCategory?.includes(category.value)}
                onCheckedChange={() => toggleUserCategory(category.value)}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-muted">{category.icon}</div>
                  <span className="font-medium">{category.label}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {category.description}
                </p>
              </div>
            </Label>
          ))}
        </div>
      </div>

      {/* Add User Category Sheet */}
      <Sheet open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Add User Category</SheetTitle>
            <SheetDescription>
              Create a new target user category for this consent template.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 py-6">
            <div className="space-y-2">
              <Label htmlFor="catName">
                Name of the User Category <span className="text-destructive">*</span>
              </Label>
              <Input
                id="catName"
                placeholder="e.g. Partner, Affiliate"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="catDesc">
                Short Description of the User Category <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="catDesc"
                placeholder="Briefly describe who falls into this category"
                value={newCategoryDesc}
                onChange={(e) => setNewCategoryDesc(e.target.value)}
              />
            </div>
          </div>

          <SheetFooter>
            <SheetClose asChild>
              <Button variant="outline">Close</Button>
            </SheetClose>
            <Button onClick={handleAddCategory} disabled={!newCategoryName || !newCategoryDesc}>
              Save
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Age Threshold */}
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium">Age Threshold for Minors</Label>
          <p className="text-xs text-muted-foreground mt-1">
            Users below this age require guardian consent
          </p>
        </div>
        <div className="max-w-md space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Age:</span>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {data.ageThreshold || 18} years
            </Badge>
          </div>
          <Slider
            value={[data.ageThreshold || 18]}
            onValueChange={([value]) => onChange({ ageThreshold: value })}
            min={13}
            max={21}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>13 years</span>
            <span>21 years</span>
          </div>
        </div>

        {/* Regulation-specific hints */}
        {data.regulations?.includes("DPDP") && (
          <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5" />
              <div className="text-xs text-orange-800 dark:text-orange-300">
                <strong>DPDP Act Requirement:</strong> For children, consent must be obtained from a verifiable parent or legal guardian.
              </div>
            </div>
          </div>
        )}

        {data.regulations?.includes("GDPR") && (
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="text-xs text-blue-800 dark:text-blue-300">
                <strong>GDPR Requirement:</strong> Parental consent required for children under 16 (or 13-16 depending on member state).
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Consent Given By */}
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium">Consent Given By</Label>
          <p className="text-xs text-muted-foreground mt-1">
            Who provides the consent on behalf of the data principal
          </p>
        </div>
        <RadioGroup
          value={data.consentGivenBy || "self"}
          onValueChange={(value) => onChange({ consentGivenBy: value as ConsentTemplate["consentGivenBy"] })}
          className="grid grid-cols-1 md:grid-cols-3 gap-3"
        >
          <Label
            className={cn(
              "flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all",
              data.consentGivenBy === "self"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            )}
          >
            <RadioGroupItem value="self" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="font-medium">Self</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Data principal provides their own consent
              </p>
            </div>
          </Label>

          <Label
            className={cn(
              "flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all",
              data.consentGivenBy === "guardian"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50",
              !hasMinorSelected && "opacity-50"
            )}
          >
            <RadioGroupItem value="guardian" disabled={!hasMinorSelected} />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="font-medium">Guardian</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Parent or legal guardian provides consent
              </p>
            </div>
          </Label>

          <Label
            className={cn(
              "flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all",
              data.consentGivenBy === "representative"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            )}
          >
            <RadioGroupItem value="representative" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="font-medium">Authorized Rep</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Legally authorized representative
              </p>
            </div>
          </Label>
        </RadioGroup>
      </div>
    </div>
  );
}
