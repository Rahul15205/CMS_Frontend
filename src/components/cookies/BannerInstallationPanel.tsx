import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  BANNER_INTEGRATION_METHODS,
  BannerIntegrationMethod,
  getBannerScriptTag,
  getIntegrationSnippet,
} from "@/lib/cookieBannerIntegration";
import {
  CheckCircle,
  Copy,
  Code2,
  RefreshCw,
  Shield,
  ExternalLink,
} from "lucide-react";
import { motion } from "framer-motion";

interface WebsiteOption {
  id: string;
  name: string;
  url: string;
}

interface BannerInstallationPanelProps {
  websites: WebsiteOption[];
  selectedWebsiteId: string;
  onWebsiteChange: (id: string) => void;
  verificationStatus: "idle" | "loading" | "success";
  onVerify: () => void;
  origin?: string;
}

export function BannerInstallationPanel({
  websites,
  selectedWebsiteId,
  onWebsiteChange,
  verificationStatus,
  onVerify,
  origin = typeof window !== "undefined" ? window.location.origin : "",
}: BannerInstallationPanelProps) {
  const { toast } = useToast();
  const [activeMethod, setActiveMethod] = useState<BannerIntegrationMethod>("html");

  const methodMeta = BANNER_INTEGRATION_METHODS.find((m) => m.id === activeMethod);

  const copyCode = (text: string, label = "Code") => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: `${label} copied to clipboard.` });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>1. Select Website</Label>
        <Select value={selectedWebsiteId} onValueChange={onWebsiteChange}>
          <SelectTrigger className="w-full md:w-[400px]">
            <SelectValue placeholder="Choose a website to get its script" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Global Template (General)</SelectItem>
            {websites.map((site) => (
              <SelectItem key={site.id} value={site.id}>
                {site.name} ({site.url})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Label>2. Choose installation method</Label>
          {methodMeta?.platform && (
            <Badge variant="secondary" className="text-xs font-normal">
              {methodMeta.platform}
            </Badge>
          )}
        </div>

        <Tabs
          value={activeMethod}
          onValueChange={(v) => setActiveMethod(v as BannerIntegrationMethod)}
          className="w-full"
        >
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-muted/50 p-1">
            {BANNER_INTEGRATION_METHODS.map((method) => (
              <TabsTrigger
                key={method.id}
                value={method.id}
                className="text-xs sm:text-sm data-[state=active]:bg-background"
              >
                {method.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {BANNER_INTEGRATION_METHODS.map((method) => {
            const snippet = getIntegrationSnippet(method.id, origin, selectedWebsiteId);
            return (
              <TabsContent key={method.id} value={method.id} className="mt-4 space-y-4">
                <p className="text-sm text-muted-foreground">{method.description}</p>

                <ol className="list-decimal list-inside space-y-1.5 text-sm text-muted-foreground border rounded-lg p-4 bg-muted/20">
                  {snippet.steps.map((step, i) => (
                    <li key={i} className="pl-1">
                      {step}
                    </li>
                  ))}
                </ol>

                <div className="relative">
                  <div className="bg-slate-950 text-slate-50 p-4 rounded-xl font-mono text-xs sm:text-sm border shadow-xl overflow-x-auto pr-12 max-h-[320px] overflow-y-auto">
                    <pre className="whitespace-pre-wrap break-all">{snippet.code}</pre>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-3 right-3 text-slate-400 hover:text-white hover:bg-white/10"
                    onClick={() => copyCode(snippet.code, `${method.label} snippet`)}
                    type="button"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                {method.id === "html" && (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        copyCode(
                          getBannerScriptTag(origin, selectedWebsiteId),
                          "Script tag",
                        )
                      }
                    >
                      <Copy className="h-3.5 w-3.5 mr-1.5" />
                      Copy script tag only
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const url = `${origin}/api/v1/public/cookies/banner-script/${
                          selectedWebsiteId === "all" ? "GLOBAL_ID" : selectedWebsiteId
                        }`;
                        copyCode(url, "Script URL");
                      }}
                    >
                      <Code2 className="h-3.5 w-3.5 mr-1.5" />
                      Copy URL only
                    </Button>
                  </div>
                )}

                {method.id === "gtm" && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <ExternalLink className="h-3 w-3" />
                    Tip: Set tag firing priority high so the banner loads before marketing tags.
                  </p>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </div>

      <div className="space-y-3 pt-2" data-tour="verify-installation">
        <Label>3. Verify Installation</Label>
        <div className="flex items-center gap-4 border rounded-lg p-6 bg-muted/10 border-dashed relative overflow-hidden">
          <Button
            variant={verificationStatus === "success" ? "outline" : "secondary"}
            className={
              verificationStatus === "success"
                ? "border-green-500 text-green-600 hover:bg-green-50"
                : ""
            }
            disabled={verificationStatus === "loading"}
            onClick={onVerify}
            type="button"
          >
            {verificationStatus === "loading" ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : verificationStatus === "success" ? (
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
            ) : (
              <Shield className="h-4 w-4 mr-2" />
            )}
            {verificationStatus === "loading"
              ? "Verifying..."
              : verificationStatus === "success"
                ? "Verified"
                : "Verify Installation"}
          </Button>

          <div className="flex flex-col">
            {verificationStatus === "success" ? (
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-green-600 flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                  </span>
                  Connected & Protected
                </span>
                <span className="text-[10px] text-muted-foreground italic">
                  (Script detected on live site)
                </span>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">
                Checks HTML, GTM snippets, WordPress enqueue, and other common install patterns.
              </span>
            )}
          </div>

          {verificationStatus === "success" && (
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-green-500/10 to-transparent skew-x-12"
            />
          )}
        </div>
      </div>
    </div>
  );
}
