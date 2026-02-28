import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Phone,
  CreditCard,
  Heart,
  Fingerprint,
  Activity,
  MapPin,
  Settings,
  Info,
  Plus,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ConsentTemplate, DataCategory, DataCategoryConfig, DATA_CATEGORY_OPTIONS } from "../types";

interface WizardStepDataCategoriesProps {
  data: Partial<ConsentTemplate>;
  onChange: (updates: Partial<ConsentTemplate>) => void;
}

const categoryIcons: Record<string, React.ReactNode> = {
  identity: <User className="h-5 w-5" />,
  contact: <Phone className="h-5 w-5" />,
  financial: <CreditCard className="h-5 w-5" />,
  health: <Heart className="h-5 w-5" />,
  biometric: <Fingerprint className="h-5 w-5" />,
  behavioral: <Activity className="h-5 w-5" />,
  location: <MapPin className="h-5 w-5" />,
  custom: <Settings className="h-5 w-5" />,
};

const categoryDescriptions: Record<string, string> = {
  identity: "Name, ID numbers, government IDs",
  contact: "Email, phone, address details",
  financial: "Bank accounts, payment info, income",
  health: "Medical records, conditions, treatments",
  biometric: "Fingerprints, facial data, voice patterns",
  behavioral: "Usage patterns, preferences, habits",
  location: "GPS, IP address, travel history",
  custom: "Organization-specific data types",
};

const sensitiveCategories: DataCategory[] = ["health", "biometric", "financial"];

const countryOptions = [
  { value: "US", label: "United States" },
  { value: "IN", label: "India" },
  { value: "EU", label: "European Union" },
  { value: "AU", label: "Australia" },
  { value: "UK", label: "United Kingdom" },
  { value: "CN", label: "China" },
  { value: "SG", label: "Singapore" },
  // Add more as needed
];

export function WizardStepDataCategories({ data, onChange }: WizardStepDataCategoriesProps) {
  const categories = data.dataCategories || [];
  const [isAddAttributeOpen, setIsAddAttributeOpen] = useState(false);
  const [newAttrName, setNewAttrName] = useState("");
  const [newAttrDesc, setNewAttrDesc] = useState("");
  const [newAttrCountry, setNewAttrCountry] = useState("");

  const toggleCategory = (category: DataCategory) => {
    const exists = categories.find((c) => c.category === category);
    if (exists) {
      onChange({
        dataCategories: categories.filter((c) => c.category !== category),
      });
    } else {
      const newCategory: DataCategoryConfig = {
        category,
        label: DATA_CATEGORY_OPTIONS.find((opt) => opt.value === category)?.label || category,
        mandatory: false,
        source: "direct",
      };
      onChange({ dataCategories: [...categories, newCategory] });
    }
  };

  const handleAddAttribute = () => {
    if (!newAttrName.trim()) return;

    const categoryValue = newAttrName.toLowerCase().replace(/\s+/g, "-");

    // Check if already exists
    if (categories.some(c => c.category === categoryValue)) {
      // Logic to handle duplicate if needed, for now just ignore/close
      setIsAddAttributeOpen(false);
      return;
    }

    const newCategory: DataCategoryConfig = {
      category: categoryValue,
      label: newAttrName,
      mandatory: false,
      source: "direct", // Default
      description: newAttrDesc,
      country: newAttrCountry
    };

    onChange({ dataCategories: [...categories, newCategory] });

    // Reset and close
    setNewAttrName("");
    setNewAttrDesc("");
    setNewAttrCountry("");
    setIsAddAttributeOpen(false);
  };

  const updateCategory = (category: DataCategory, updates: Partial<DataCategoryConfig>) => {
    onChange({
      dataCategories: categories.map((c) =>
        c.category === category ? { ...c, ...updates } : c
      ),
    });
  };

  const isSelected = (category: DataCategory) =>
    categories.some((c) => c.category === category);

  const getCategory = (category: DataCategory) =>
    categories.find((c) => c.category === category);

  return (
    <div className="space-y-8">
      {/* Info Banner */}
      <div className="p-4 rounded-lg bg-info/10 border border-info/20">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-info mt-0.5" />
          <div>
            <h4 className="font-medium text-info">Data Minimization Principle</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Only select data attributes that are necessary for the stated purposes.
              Collecting excessive data violates privacy principles.
            </p>
          </div>
        </div>
      </div>

      {/* Data Categories Selection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">
            Data Attributes Collected <span className="text-destructive">*</span>
          </Label>
          <Button variant="outline" size="sm" onClick={() => setIsAddAttributeOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Data Attribute
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DATA_CATEGORY_OPTIONS.map((option) => {
            const selected = isSelected(option.value);
            const categoryData = getCategory(option.value);
            const isSensitive = sensitiveCategories.includes(option.value);

            return (
              <div
                key={option.value}
                className={cn(
                  "rounded-lg border-2 transition-all overflow-hidden",
                  selected
                    ? isSensitive
                      ? "border-warning bg-warning/5"
                      : "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                <Label
                  className="flex items-start gap-3 p-4 cursor-pointer"
                >
                  <Checkbox
                    checked={selected}
                    onCheckedChange={() => toggleCategory(option.value)}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "p-1.5 rounded-md",
                        isSensitive ? "bg-warning/20 text-warning" : "bg-muted"
                      )}>
                        {categoryIcons[option.value] || <Settings className="h-5 w-5" />}
                      </div>
                      <span className="font-medium">{option.label}</span>
                      {isSensitive && (
                        <Badge variant="outline" className="border-warning/50 text-warning text-xs">
                          Sensitive
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {categoryDescriptions[option.value]}
                    </p>
                  </div>
                </Label>

                {/* Configuration options when selected */}
                {selected && (
                  <div className="px-4 pb-4 pt-2 border-t bg-muted/30 space-y-4">
                    <div className="flex items-center gap-6">
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Collection Type</Label>
                        <RadioGroup
                          value={categoryData?.mandatory ? "mandatory" : "optional"}
                          onValueChange={(v) => updateCategory(option.value, { mandatory: v === "mandatory" })}
                          className="flex gap-3"
                        >
                          <Label className="flex items-center gap-1.5 text-sm cursor-pointer">
                            <RadioGroupItem value="mandatory" />
                            Mandatory
                          </Label>
                          <Label className="flex items-center gap-1.5 text-sm cursor-pointer">
                            <RadioGroupItem value="optional" />
                            Optional
                          </Label>
                        </RadioGroup>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Source of Data</Label>
                        <RadioGroup
                          value={categoryData?.source || "direct"}
                          onValueChange={(v) => updateCategory(option.value, { source: v as "direct" | "third-party" })}
                          className="flex gap-3"
                        >
                          <Label className="flex items-center gap-1.5 text-sm cursor-pointer">
                            <RadioGroupItem value="direct" />
                            Direct
                          </Label>
                          <Label className="flex items-center gap-1.5 text-sm cursor-pointer">
                            <RadioGroupItem value="third-party" />
                            Third-Party
                          </Label>
                        </RadioGroup>
                      </div>
                    </div>

                    {isSensitive && (
                      <div className="p-2 rounded bg-warning/10 text-xs text-warning">
                        ⚠️ This is sensitive personal data. Additional safeguards required.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* New Data Attribute Sheet */}
      <Sheet open={isAddAttributeOpen} onOpenChange={setIsAddAttributeOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>New Data Attribute</SheetTitle>
            <SheetDescription>
              Define a custom data attribute to be collected.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 py-6">
            <div className="space-y-2">
              <Label htmlFor="attrName">
                Name of the Data Attribute <span className="text-destructive">*</span>
              </Label>
              <Input
                id="attrName"
                placeholder="e.g. Device ID, IP Address"
                value={newAttrName}
                onChange={(e) => setNewAttrName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="attrDesc">
                Short Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="attrDesc"
                placeholder="Briefly describe this data attribute"
                value={newAttrDesc}
                onChange={(e) => setNewAttrDesc(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="attrCountry">
                Country <span className="text-destructive">*</span>
              </Label>
              <Select value={newAttrCountry} onValueChange={setNewAttrCountry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Country" />
                </SelectTrigger>
                <SelectContent>
                  {countryOptions.map((country) => (
                    <SelectItem key={country.value} value={country.value}>
                      {country.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <SheetFooter>
            <SheetClose asChild>
              <Button variant="outline">Close</Button>
            </SheetClose>
            <Button onClick={handleAddAttribute} disabled={!newAttrName || !newAttrDesc || !newAttrCountry}>
              Save
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Summary */}
      {categories.length > 0 && (
        <div className="p-4 rounded-lg bg-muted/50 border">
          <Label className="text-sm font-medium mb-3 block">Selected Categories Summary</Label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Badge
                key={cat.category}
                variant="secondary"
                className={cn(
                  "pr-1.5",
                  sensitiveCategories.includes(cat.category) && "border-warning/50"
                )}
              >
                {cat.label}
                <span className="ml-1.5 opacity-70">
                  ({cat.mandatory ? "Required" : "Optional"} | {cat.source})
                  {cat.country && ` [${cat.country}]`}
                </span>
                {/* Allow removing custom categories (not in standard options) */}
                {!DATA_CATEGORY_OPTIONS.some(opt => opt.value === cat.category) && (
                  <button
                    onClick={() => toggleCategory(cat.category)}
                    className="ml-2 hover:bg-destructive/10 rounded-full p-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
