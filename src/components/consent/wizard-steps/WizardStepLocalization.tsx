import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe, Plus, X, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConsentTemplate } from "../types";

interface WizardStepLocalizationProps {
  data: Partial<ConsentTemplate>;
  onChange: (updates: Partial<ConsentTemplate>) => void;
}

const availableLanguages = [
  { code: "en", name: "English", region: "Global" },
  { code: "as", name: "Assamese", region: "India" },
  { code: "awa", name: "Awadhi", region: "India" },
  { code: "bn", name: "Bengali", region: "India" },
  { code: "bho", name: "Bhojpuri", region: "India" },
  { code: "brx", name: "Bodo", region: "India" },
  { code: "bra", name: "Braj", region: "India" },
  { code: "doi", name: "Dogri", region: "India" },
  { code: "gom", name: "Goan Konkani", region: "India" },
  { code: "gon", name: "Gondi", region: "India" },
  { code: "gu", name: "Gujarati", region: "India" },
  { code: "hi", name: "Hindi", region: "India" },
  { code: "hoc", name: "Ho", region: "India" },
  { code: "kn", name: "Kannada", region: "India" },
  { code: "ks", name: "Kashmiri", region: "India" },
  { code: "kha", name: "Khasi", region: "India" },
  { code: "mag", name: "Magahi", region: "India" },
  { code: "mai", name: "Maithili", region: "India" },
  { code: "ml", name: "Malayalam", region: "India" },
  { code: "mni", name: "Manipuri", region: "India" },
  { code: "mr", name: "Marathi", region: "India" },
  { code: "lus", name: "Mizo", region: "India" },
  { code: "ne", name: "Nepali", region: "India" },
  { code: "or", name: "Odia", region: "India" },
  { code: "pa", name: "Punjabi", region: "India" },
  { code: "sa", name: "Sanskrit", region: "India" },
  { code: "sat", name: "Santali", region: "India" },
  { code: "sd", name: "Sindhi", region: "India" },
  { code: "si", name: "Sinhala", region: "South Asia" },
  { code: "ta", name: "Tamil", region: "India" },
  { code: "te", name: "Telugu", region: "India" },
  { code: "tcy", name: "Tulu", region: "India" },
  { code: "ur", name: "Urdu", region: "India" },
];

export function WizardStepLocalization({ data, onChange }: WizardStepLocalizationProps) {
  const supportedLanguages = data.supportedLanguages || ["en"];
  const defaultLanguage = data.defaultLanguage || "en";

  const addLanguage = (code: string) => {
    if (!supportedLanguages.includes(code)) {
      onChange({ supportedLanguages: [...supportedLanguages, code] });
    }
  };

  const removeLanguage = (code: string) => {
    if (code === defaultLanguage) return; // Can't remove default language
    onChange({ supportedLanguages: supportedLanguages.filter((l) => l !== code) });
  };

  const setDefaultLanguage = (code: string) => {
    if (!supportedLanguages.includes(code)) {
      onChange({
        defaultLanguage: code,
        supportedLanguages: [...supportedLanguages, code]
      });
    } else {
      onChange({ defaultLanguage: code });
    }
  };

  const handleReset = () => {
    onChange({
      defaultLanguage: "en",
      supportedLanguages: ["en"]
    });
  };

  const getLanguageName = (code: string) =>
    availableLanguages.find((l) => l.code === code)?.name || code;

  const getLanguageRegion = (code: string) =>
    availableLanguages.find((l) => l.code === code)?.region || "";

  // Group languages by region
  const languagesByRegion = availableLanguages.reduce((acc, lang) => {
    if (!acc[lang.region]) acc[lang.region] = [];
    acc[lang.region].push(lang);
    return acc;
  }, {} as Record<string, typeof availableLanguages>);

  return (
    <div className="space-y-8">
      {/* Info Banner */}
      <div className="p-4 rounded-lg bg-info/10 border border-info/20">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-info mt-0.5" />
          <div>
            <h4 className="font-medium text-info">Multi-Language Support</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Consent notices must be provided in a language the data principal understands.
              DPDP Act requires consent to be in English or any scheduled language.
            </p>
          </div>
        </div>
      </div>

      {/* Default Language */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium">
              Default Language <span className="text-destructive">*</span>
            </Label>
            <p className="text-xs text-muted-foreground mt-1">
              Primary language for consent display
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            Reset Settings
          </Button>
        </div>
        <Select value={defaultLanguage} onValueChange={setDefaultLanguage}>
          <SelectTrigger className="max-w-xs">
            <Globe className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(languagesByRegion).map(([region, languages]) => (
              <div key={region}>
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  {region}
                </div>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </div>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Supported Languages */}
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium">Supported Languages</Label>
          <p className="text-xs text-muted-foreground mt-1">
            Add languages this consent template will be available in
          </p>
        </div>

        {/* Selected Languages */}
        <div className="flex flex-wrap gap-2">
          {supportedLanguages.map((code) => (
            <Badge
              key={code}
              variant={code === defaultLanguage ? "default" : "secondary"}
              className="flex items-center gap-1 py-1.5 px-3"
            >
              <Globe className="h-3 w-3" />
              {getLanguageName(code)}
              {code === defaultLanguage && (
                <span className="text-xs opacity-70 ml-1">(Default)</span>
              )}
              {code !== defaultLanguage && (
                <button
                  onClick={() => removeLanguage(code)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}
        </div>

        {/* Add Languages */}
        <div className="p-4 rounded-lg border-2 border-dashed">
          <Label className="text-sm font-medium mb-3 block">Add Language</Label>
          <div className="space-y-4">
            {Object.entries(languagesByRegion).map(([region, languages]) => (
              <div key={region}>
                <p className="text-xs font-medium text-muted-foreground mb-2">{region}</p>
                <div className="flex flex-wrap gap-2">
                  {languages.map((lang) => (
                    <Badge
                      key={lang.code}
                      variant="outline"
                      className={cn(
                        "cursor-pointer transition-colors",
                        supportedLanguages.includes(lang.code)
                          ? "bg-primary/10 border-primary/30"
                          : "hover:bg-muted"
                      )}
                      onClick={() =>
                        supportedLanguages.includes(lang.code)
                          ? removeLanguage(lang.code)
                          : addLanguage(lang.code)
                      }
                    >
                      {supportedLanguages.includes(lang.code) ? "✓ " : "+ "}
                      {lang.name}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="p-4 rounded-lg bg-card border">
        <Label className="text-sm font-medium mb-3 block">Localization Summary</Label>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Default Language:</span>
            <Badge>{getLanguageName(defaultLanguage)}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Total Languages:</span>
            <Badge variant="secondary">{supportedLanguages.length}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Regions Covered:</span>
            <span className="font-medium">
              {[...new Set(supportedLanguages.map(getLanguageRegion))].filter(Boolean).join(", ") || "—"}
            </span>
          </div>
        </div>
      </div>

      {/* DPDP Compliance Note */}
      {data.regulations?.includes("DPDP") && (
        <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5" />
            <div className="text-xs text-orange-800 dark:text-orange-300">
              <strong>DPDP Act:</strong> Consent requests must be provided in English or any of the
              22 scheduled languages of India. Consider adding regional languages based on your user base.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
