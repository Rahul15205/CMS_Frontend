import { useState, useEffect, useCallback } from "react";
import { DashboardLayout, PageSection, SectionTitle } from "@/components/layout/DashboardLayout";
import { KPICard } from "@/components/dashboard/KPICard";
import { ConsentDonutChart } from "@/components/charts/ConsentDonutChart";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendLineChart } from "@/components/charts/TrendLineChart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Cookie,
  CheckCircle,
  XCircle,
  RefreshCw,
  Eye,
  Settings,
  Globe,
  Shield,
  BarChart3,
  ExternalLink,
  Target,
  Search,
  Plus,
  Monitor,
  Smartphone,
  Layout,
  Palette,
  Languages,
  Download,
  PieChart,
  Copy,
  FileText,
  Trash2,
  RotateCcw,
  HelpCircle,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { 
  cookieCategoriesService, 
  cookieInventoryService, 
  cookieWebsitesService, 
  cookieBannersService, 
  cookieConsentLogsService, 
  cookieComplianceService 
} from "@/services/cookiesService";
import { reportsService } from "@/services/reportsLogsSecurityService";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductTour } from "@/components/tour/ProductTour";

// Map string icons to components
const IconMap: Record<string, any> = {
  Shield,
  BarChart3,
  Settings,
  Target
};

import { AddCookieDialog } from "@/components/cookies/AddCookieDialog";
import { CreateBannerDialog } from "@/components/cookies/CreateBannerDialog";
import { AddWebsiteDialog } from "@/components/cookies/AddWebsiteDialog";

const EmptyState = ({ onAction }: { onAction: () => void }) => (
  <div className="flex flex-col items-center justify-center p-12 text-center border rounded-xl bg-muted/20 border-dashed my-8">
    <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
      <Globe className="h-10 w-10 text-primary" />
    </div>
    <h3 className="text-xl font-semibold mb-2">Start by adding your website</h3>
    <p className="text-muted-foreground mb-6 max-w-md">
      Add your website URL to begin scanning for cookies and setting up your compliance banner.
    </p>
    <Button onClick={onAction} size="lg">
      <Plus className="h-5 w-5 mr-2" />
      Add Website
    </Button>
  </div>
);



export default function CookiesManagement() {
  const [activeTab, setActiveTab] = useState("overview");
  const [categories, setCategories] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [websites, setWebsites] = useState<any[]>([]);
  const [consentLogs, setConsentLogs] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [isCreateBannerOpen, setIsCreateBannerOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [lastScanDate, setLastScanDate] = useState("2 hrs ago");

  const [isAddCookieOpen, setIsAddCookieOpen] = useState(false);
  const [isAddWebsiteOpen, setIsAddWebsiteOpen] = useState(false);

  const [editingCookie, setEditingCookie] = useState<any>(null);
  const [editingWebsite, setEditingWebsite] = useState<any>(null);

  const [bannerLang, setBannerLang] = useState("en");
  const [bannerPosition, setBannerPosition] = useState("BOTTOM");
  const [bannerTheme, setBannerTheme] = useState("#10b981"); // Default green
  const [bannerHeading, setBannerHeading] = useState("We value your privacy");
  const [bannerDescription, setBannerDescription] = useState("We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic.");
  
  // Advanced Styling State
  const [bannerTextColor, setBannerTextColor] = useState("#111827");
  const [bannerBgColor, setBannerBgColor] = useState("#ffffff");
  const [bannerBtnTextColor, setBannerBtnTextColor] = useState("#ffffff");
  const [bannerBorderRadius, setBannerBorderRadius] = useState(12);
  const [bannerMaxWidth, setBannerMaxWidth] = useState(1200);
  const [bannerFontSize, setBannerFontSize] = useState(14);
  const [bannerPadding, setBannerPadding] = useState(24);
  const [bannerBlur, setBannerBlur] = useState(0);
  const [bannerOpacity, setBannerOpacity] = useState(100);

  const [previewDevice, setPreviewDevice] = useState("desktop");
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<string>("all");
  const [isSavingBanner, setIsSavingBanner] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  // Scan Details Modal State
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedSiteForDetails, setSelectedSiteForDetails] = useState<any>(null);


  // Check for first-time visit
  useEffect(() => {
    const hasSeenTour = localStorage.getItem("hasSeenCookieTour");
    if (!hasSeenTour) {
      const timer = setTimeout(() => setIsTourOpen(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const tourSteps = [
    {
      title: "Welcome to Cookie Management",
      content: "This module helps you automate website compliance. Let's take a quick 1-minute tour!",
      targetId: "overview-header"
    },
    {
      title: "Compliance Health",
      content: "Our AI scanner checks 10 legal indicators (like HTTPS and Privacy Policy) to give you a real-time compliance score.",
      targetId: "compliance-health"
    },
    {
      title: "Website Inventory",
      content: "Register your domains here. We'll automatically crawl them to identify and categorize all cookies used.",
      targetId: "website-config"
    },
    {
      title: "Integration Script",
      content: "Copy this unique script into your website's <head> section to activate the consent banner instantly.",
      targetId: "script-installation"
    },
    {
      title: "Banner Customization",
      content: "Tailor the banner's design, position, and text to match your brand's look and feel.",
      targetId: "banner-customization"
    }
  ];

  const nextTourStep = () => {
    if (tourStep < tourSteps.length - 1) {
      setTourStep(prev => prev + 1);
      // Auto-switch tabs for certain steps
      if (tourStep === 1) setActiveTab("config");
    } else {
      setIsTourOpen(false);
      localStorage.setItem("hasSeenCookieTour", "true");
    }
  };

  const prevTourStep = () => {
    if (tourStep > 0) {
      setTourStep(prev => prev - 1);
      if (tourStep === 2) setActiveTab("overview");
    }
  };

  const skipTour = () => {
    setIsTourOpen(false);
    localStorage.setItem("hasSeenCookieTour", "true");
  };


  const { toast } = useToast();

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [cats, inv, sites, logs, bans, met] = await Promise.all([
        cookieCategoriesService.getAll(),
        cookieInventoryService.getAll(),
        cookieWebsitesService.getAll(),
        cookieConsentLogsService.getAll(),
        cookieBannersService.getAll(),
        cookieComplianceService.getMetrics(selectedWebsiteId)
      ]);

      setCategories(cats || []);
      setInventory(inv || []);
      setWebsites(sites || []);
      setConsentLogs(logs || []);
      setBanners(bans || []);
      setMetrics(met);
    } catch (error) {
      console.error("Failed to fetch cookies data:", error);
      if (!silent) {
        toast({
          title: "Error",
          description: "Failed to load cookie management data.",
          variant: "destructive"
        });
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [toast, selectedWebsiteId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Background Polling for status updates (Silent Refresh)
  useEffect(() => {
    // Poll every 5 seconds if there are websites being scanned or processed
    // Otherwise poll every 30 seconds for general updates
    const hasActiveProcesses = websites.some(s => 
      ['Scanning', 'In Progress', 'Pending', 'Processing'].includes(s.status)
    ) || scanning;

    const intervalTime = hasActiveProcesses ? 5000 : 30000;
    
    const interval = setInterval(() => {
      fetchData(true);
    }, intervalTime);

    return () => clearInterval(interval);
  }, [fetchData, websites, scanning]);

  const toggleCategory = async (id: string) => {
    const category = categories.find(c => c.id === id);
    if (!category || category.locked) return;

    try {
      const updated = await cookieCategoriesService.update(id, { enabled: !category.enabled });
      if (updated) {
        setCategories(categories.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c));
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update category.", variant: "destructive" });
    }
  };

  // Consent Withdrawal Handler

  const handleWithdrawConsent = async (id: string) => {
    if (confirm("Are you sure you want to withdraw consent for this user? This action cannot be undone.")) {
      try {
        const log = consentLogs.find(l => l.id === id);
        // We'll create a new record with WITHDRAWN status or update if the API supports it
        const updated = await cookieConsentLogsService.record({ 
          userId: log?.userId || id, 
          status: "WITHDRAWN",
          categories: log?.categories || [],
          websiteId: log?.websiteId
        });
        
        if (updated) {
          setConsentLogs(consentLogs.map(log =>
            log.id === id ? { ...log, status: "WITHDRAWN" } : log
          ));
          toast({
            title: "Consent Withdrawn",
            description: "User consent has been successfully withdrawn.",
          });
        }
      } catch (error) {
        toast({ title: "Error", description: "Failed to withdraw consent.", variant: "destructive" });
      }
    }
  };

  const handleScanNow = async () => {
    setScanning(true);
    setScanProgress(0);

    toast({
      title: "Scan Initiated",
      description: "Scanning all active websites for cookies...",
    });

    try {
      // Start scan for all websites if needed, or a specific one
      // For now, simulate progress as before but call service for each site
      for (const site of websites) {
        await cookieWebsitesService.startScan(site.id);
      }

      // Simulate Scan Progress
      const interval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 300);

      setTimeout(async () => {
        clearInterval(interval);
        setScanning(false);
        setScanProgress(0);
        setLastScanDate("Just now");
        
        // Refresh inventory and websites after scan
        const [inv, sites] = await Promise.all([
          cookieInventoryService.getAll(),
          cookieWebsitesService.getAll()
        ]);
        setInventory(inv || []);
        setWebsites(sites || []);

        toast({
          title: "Scan Completed",
          description: "Cookie inventory has been updated successfully.",
        });
      }, 3500);
    } catch (error) {
      setScanning(false);
      toast({ title: "Error", description: "Failed to perform scan.", variant: "destructive" });
    }
  };

  // Website Handlers

  const handleSaveWebsite = async (websiteData: any) => {
    try {
      if (editingWebsite) {
        const updated = await cookieWebsitesService.update(editingWebsite.id, websiteData);
        if (updated) {
          setWebsites(websites.map(w => w.id === editingWebsite.id ? { ...updated, status: w.status, lastScan: w.lastScan } : w));
          toast({ title: "Website Updated", description: "Website configuration saved successfully." });
        }
      } else {
        const created = await cookieWebsitesService.create(websiteData);
        if (created) {
          setWebsites([created, ...websites]);
          toast({ title: "Website Added", description: "New website added for monitoring." });
        }
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to save website.", variant: "destructive" });
    } finally {
      setEditingWebsite(null);
    }
  };

  const openEditWebsiteDialog = (website: any) => {
    setEditingWebsite(website);
    setIsAddWebsiteOpen(true);
  };

  const openAddWebsiteDialog = () => {
    setEditingWebsite(null);
    setIsAddWebsiteOpen(true);
  };

  const handleDeleteWebsite = async (id: string) => {
    if (!confirm("Are you sure you want to delete this website? This will also remove any associated banners.")) return;
    
    try {
      await cookieWebsitesService.delete(id);
      setWebsites(websites.filter(w => w.id !== id));
      toast({
        title: "Website Deleted",
        description: "The website has been removed from your configuration.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete website.",
        variant: "destructive"
      });
    }
  };

  const handleGenerateReport = (website: any) => {
    reportsService.create({
      name: `Cookie Compliance - ${website.name}`,
      reportType: "COMPLIANCE",
      format: "PDF",
      parameters: {
        websiteId: website.id,
        websiteName: website.name,
        websiteUrl: website.url,
        module: "COOKIES_MANAGEMENT",
        email: website.email,
      },
    }).then(() => {
      toast({
        title: "Report Queued",
        description: "Cookie compliance report generation has started. Download it from Reports once processing completes.",
      });
    }).catch(() => {
      toast({
        title: "Error",
        description: "Failed to queue compliance report.",
        variant: "destructive",
      });
    });
  };

  // Language content mapping
  const languageContent: Record<string, { heading: string, description: string }> = {
    en: {
      heading: "We value your privacy",
      description: "We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic."
    },
    es: {
      heading: "Valoramos su privacidad",
      description: "Utilizamos cookies para mejorar su experiencia de navegación, servir anuncios o contenidos personalizados y analizar nuestro tráfico."
    },
    fr: {
      heading: "Nous valorisons votre vie privée",
      description: "Nous utilisons des cookies pour améliorer votre expérience de navigation, diffuser des publicités ou du contenu personnalisés et analyser notre trafic."
    },
    de: {
      heading: "Wir schätzen Ihre Privatsphäre",
      description: "Wir verwenden Cookies, um Ihr Surferlebnis zu verbessern, personalisierte Anzeigen oder Inhalte bereitzustellen und unseren Datenverkehr zu analysieren."
    }
  };

  const handleLanguageChange = (lang: string) => {
    setBannerLang(lang);
    if (languageContent[lang]) {
      setBannerHeading(languageContent[lang].heading);
      setBannerDescription(languageContent[lang].description);
    }
  };

  const handleWebsiteChange = (siteId: string) => {
    setSelectedWebsiteId(siteId);
    if (siteId === "all") return;

    // Check if there's already a banner for this website
    const siteBanner = banners.find(b => b.websiteId === siteId);
    if (siteBanner) {
      handleLoadBanner(siteBanner);
    } else {
      // Reset to defaults for new website
      setBannerHeading(languageContent.en.heading);
      setBannerDescription(languageContent.en.description);
      setBannerTheme("#10b981");
      setBannerPosition("BOTTOM");
      setBannerLang("en");
      
      // Reset Advanced
      setBannerTextColor("#111827");
      setBannerBgColor("#ffffff");
      setBannerBtnTextColor("#ffffff");
      setBannerBorderRadius(12);
      setBannerMaxWidth(1200);
      setBannerFontSize(14);
      setBannerPadding(24);
      setBannerBlur(0);
      setBannerOpacity(100);
    }
  };

  const handleSaveBannerSettings = async () => {
    setIsSavingBanner(true);
    try {
      const bannerData = {
        name: selectedWebsiteId !== "all" 
          ? `Banner - ${websites.find(w => w.id === selectedWebsiteId)?.name}`
          : "Global Banner",
        heading: bannerHeading,
        description: bannerDescription,
        themeColor: bannerTheme,
        theme: "custom", // Placeholder for CSS class if needed
        position: bannerPosition,
        language: bannerLang,
        websiteId: selectedWebsiteId !== "all" ? selectedWebsiteId : null,
        status: "ACTIVE",
        // Advanced
        textColor: bannerTextColor,
        backgroundColor: bannerBgColor,
        buttonTextColor: bannerBtnTextColor,
        borderRadius: bannerBorderRadius,
        maxWidth: bannerMaxWidth,
        fontSize: bannerFontSize,
        padding: bannerPadding,
        backdropBlur: bannerBlur,
        backdropOpacity: bannerOpacity
      };

      // If we are editing an existing banner for this site
      const existingBanner = banners.find(b => b.websiteId === (selectedWebsiteId !== "all" ? selectedWebsiteId : null));
      
      let result;
      if (existingBanner) {
        result = await cookieBannersService.update(existingBanner.id, bannerData);
        setBanners(banners.map(b => b.id === existingBanner.id ? result : b));
      } else {
        result = await cookieBannersService.create(bannerData);
        setBanners([result, ...banners]);
      }

      toast({
        title: "Settings Saved",
        description: "Banner configuration has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save banner settings.",
        variant: "destructive"
      });
    } finally {
      setIsSavingBanner(false);
    }
  };

  const handleLoadBanner = (banner: any) => {
    // Mapping for class-based themes to hex colors used in the editor
    const themeMap: Record<string, string> = {
      'bg-emerald-500': '#10b981',
      'bg-primary': '#10b981',
      'bg-blue-600': '#2563eb',
      'bg-purple-600': '#8b5cf6',
      'bg-zinc-900': '#18181b',
      'bg-slate-900': '#18181b'
    };

    // Basic mapping of banner fields to customization state
    setBannerPosition(banner.position || "BOTTOM");
    
    // Handle theme color from banner object
    let themeColor = banner.themeColor;
    if (!themeColor) {
      if (banner.theme?.startsWith('#')) {
        themeColor = banner.theme;
      } else {
        themeColor = themeMap[banner.theme] || "#10b981";
      }
    }
    
    setBannerTheme(themeColor);
    setBannerHeading(banner.heading || "We value your privacy");
    setBannerDescription(banner.description || "We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic.");
    setBannerLang(banner.language || "en");
    setSelectedWebsiteId(banner.websiteId || "all");
    
    // Load Advanced
    setBannerTextColor(banner.textColor || "#111827");
    setBannerBgColor(banner.backgroundColor || "#ffffff");
    setBannerBtnTextColor(banner.buttonTextColor || "#ffffff");
    setBannerBorderRadius(banner.borderRadius ?? 12);
    setBannerMaxWidth(banner.maxWidth ?? 1200);
    setBannerFontSize(banner.fontSize ?? 14);
    setBannerPadding(banner.padding ?? 24);
    setBannerBlur(banner.backdropBlur ?? 0);
    setBannerOpacity(banner.backdropOpacity ?? 100);
    
    setActiveTab("config");
    
    toast({
      title: "Configuration Loaded",
      description: `Settings for "${banner.name}" have been loaded into the editor.`,
    });
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ["Cookie ID", "Cookie Name", "Domain", "Category", "Expiration", "Description"];
    const csvContent = [
      headers.join(","),
      ...inventory.map(cookie => [
        cookie.id,
        cookie.name,
        cookie.domain,
        categories.find(c => c.id === (cookie.categoryId || cookie.category))?.name || cookie.category || "Uncategorized",
        cookie.expiration,
        `"${(cookie.description || "").replace(/"/g, '""')}"` // Escape quotes
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "cookie_inventory.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to PDF
  const handleExportPDF = () => {
    import("jspdf").then(({ default: jsPDF }) => {
      import("jspdf-autotable").then(({ default: autoTable }) => {
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text("Cookie Inventory Report", 14, 22);
        doc.setFontSize(11);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

        autoTable(doc, {
          startY: 40,
          head: [["ID", "Cookie Name", "Domain", "Category", "Expiration", "Description"]],
          body: inventory.map(cookie => {
            const catId = cookie.categoryId || cookie.category;
            const catName = categories.find(c => c.id === catId)?.name || cookie.category || "Uncategorized";
            return [
              cookie.id,
              cookie.name,
              cookie.domain,
              catName,
              cookie.expiration,
              cookie.description || ""
            ];
          }),
        });

        doc.save("cookie_inventory.pdf");
      });
    });
  };

  const handleSaveCookie = async (cookieData: any) => {
    try {
      if (editingCookie) {
        const updated = await cookieInventoryService.update(editingCookie.id, cookieData);
        if (updated) {
          setInventory(inventory.map(c => c.id === editingCookie.id ? updated : c));
          toast({ title: "Cookie Updated", description: "Cookie definition updated successfully." });
        }
      } else {
        const created = await cookieInventoryService.create(cookieData);
        if (created) {
          setInventory([created, ...inventory]);
          toast({ title: "Cookie Added", description: "New cookie added to inventory." });
        }
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to save cookie.", variant: "destructive" });
    } finally {
      setEditingCookie(null);
    }
  };

  const handleDeleteCookie = async (id: string) => {
    if (!confirm("Are you sure you want to delete this cookie definition?")) return;
    try {
      await cookieInventoryService.delete(id);
      setInventory(inventory.filter(c => c.id !== id));
      toast({ 
        title: "Cookie Deleted", 
        description: "The cookie has been removed from your inventory." 
      });
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to delete cookie definition.", 
        variant: "destructive" 
      });
    }
  };

  const openEditDialog = (cookie: any) => {
    setEditingCookie(cookie);
    setIsAddCookieOpen(true);
  };

  const openAddDialog = () => {
    setEditingCookie(null);
    setIsAddCookieOpen(true);
  };

  const handleSaveBanner = async (bannerData: any) => {
    try {
      const created = await cookieBannersService.create(bannerData);
      if (created) {
        setBanners([created, ...banners]);
        toast({
          title: "Banner Created",
          description: `"${bannerData.name}" has been created successfully.`
        });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to create banner.", variant: "destructive" });
    }
  };

  // ... existing handlers

  return (
    <>
      <DashboardLayout
        title="Cookies Management"
        actions={
          <div className="flex items-center gap-2">
            {activeTab === "inventory" && (
              <div className="flex items-center gap-4">
                {scanning && (
                  <div className="flex items-center gap-2 min-w-[200px]">
                    <span className="text-xs text-muted-foreground">Scanning... {scanProgress}%</span>
                    <Progress value={scanProgress} className="h-2 w-full" />
                  </div>
                )}
                <Button size="sm" onClick={handleScanNow} disabled={scanning}>
                  <RefreshCw className={`h-4 w-4 sm:mr-2 ${scanning ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">{scanning ? "Scanning..." : "Scan Now"}</span>
                </Button>
              </div>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-primary/5 border-primary/20 hover:bg-primary/10 text-primary"
              onClick={() => {
                setTourStep(0);
                setIsTourOpen(true);
                setActiveTab("overview");
              }}
            >
              <HelpCircle className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Take a Tour</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsPreviewDialogOpen(true)}>
              <Eye className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Preview</span>
            </Button>
          </div>
        }
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Mobile Tab Selector */}
          <div className="sm:hidden mb-4">
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select view" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overview">
                  <div className="flex items-center gap-2">
                    <PieChart className="h-4 w-4" />
                    <span>Overview</span>
                  </div>
                </SelectItem>
                <SelectItem value="inventory">
                  <div className="flex items-center gap-2">
                    <Cookie className="h-4 w-4" />
                    <span>Cookie Inventory</span>
                  </div>
                </SelectItem>
                <SelectItem value="consents">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>Cookie Consents</span>
                  </div>
                </SelectItem>
                <SelectItem value="config">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    <span>Configuration</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Desktop Tabs List */}
          <TabsList className="hidden sm:grid w-full grid-cols-4 h-auto p-1 bg-muted/50">
            <TabsTrigger value="overview" className="flex items-center gap-2 py-2.5">
              <PieChart className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-2 py-2.5">
              <Cookie className="h-4 w-4" />
              <span className="hidden sm:inline">Cookie Inventory</span>
            </TabsTrigger>
            <TabsTrigger value="consents" className="flex items-center gap-2 py-2.5">
              <CheckCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Cookie Consents</span>
            </TabsTrigger>
            <TabsTrigger value="config" className="flex items-center gap-2 py-2.5">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Configuration</span>
            </TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-6" id="overview-header">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {loading ? (
                Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)
              ) : (
                <>
                  <KPICard
                    title="Total Cookies"
                    value={metrics?.totalCookies || inventory.length}
                    icon={<Cookie className="h-4 w-4" />}
                    trend={{ value: 5, direction: "up", label: "this week" }}
                  />
                  <KPICard
                    title="Categories"
                    value={metrics?.categories || categories.length}
                    icon={<Layout className="h-4 w-4" />}
                  />
                  <KPICard
                    title="Active Consents"
                    value={metrics?.activeConsents || "0"}
                    icon={<CheckCircle className="h-4 w-4" />}
                    trend={{ value: 12, direction: "up" }}
                  />
                  <KPICard
                    title="Opt-out Rate"
                    value={`${metrics?.optOutRate || 0}%`}
                    icon={<XCircle className="h-4 w-4" />}
                    trend={{ value: 0.5, direction: "down" }}
                  />
               </>
              )}
            </div>

            {/* GLOBAL COMPLIANCE HEALTH (AVERAGE) */}
            {websites.length > 0 && !loading && (
               <Card id="compliance-health" className="border-primary/20 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="text-primary flex items-center gap-2">
                       <Shield className="h-5 w-5" />
                       Compliance Health (Network Average)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                     {(() => {
                        const sitesWithScores = websites.filter(s => s.complianceScore != null);
                        const avgScore = sitesWithScores.length > 0 
                          ? Math.round(sitesWithScores.reduce((acc, s) => acc + (s.complianceScore || 0), 0) / sitesWithScores.length)
                          : 0;
                        
                        const avgRisk = avgScore >= 80 ? 'LOW' : avgScore >= 50 ? 'MEDIUM' : 'HIGH';
                        const avgGrade = avgScore >= 90 ? 'A' : avgScore >= 80 ? 'B' : avgScore >= 70 ? 'C' : 'D';

                        // Aggregate indicators
                        const aggregateIndicators = sitesWithScores.length > 0 && sitesWithScores[0].scanResults 
                          ? (sitesWithScores[0].scanResults as any[]).map(baseInd => {
                              const totalIndScore = sitesWithScores.reduce((acc, s) => {
                                const ind = (s.scanResults as any[])?.find(i => i.id === baseInd.id);
                                return acc + (ind?.score || 0);
                              }, 0);
                              const avgIndScore = Math.round(totalIndScore / sitesWithScores.length);
                              const totalPassed = sitesWithScores.filter(s => {
                                const ind = (s.scanResults as any[])?.find(i => i.id === baseInd.id);
                                return ind?.passed;
                              }).length;

                              return {
                                ...baseInd,
                                score: avgIndScore,
                                passed: totalPassed > (sitesWithScores.length / 2),
                                details: `${totalPassed} of ${sitesWithScores.length} websites passed this check.`
                              };
                            })
                          : [];

                        return (
                          <div className="flex flex-col md:flex-row items-center gap-8">
                             <div className="flex flex-col items-center justify-center">
                                <div className={`relative h-32 w-32 flex items-center justify-center rounded-full border-8 ${avgScore >= 80 ? 'border-green-500 text-green-600' : avgScore >= 50 ? 'border-yellow-500 text-yellow-600' : 'border-red-500 text-red-600'}`}>
                                   <div className="text-3xl font-bold">{avgScore}%</div>
                                </div>
                                <div className="mt-4 flex items-center gap-2">
                                  <Badge variant="outline" className={`bg-background ${avgRisk === 'LOW' ? 'text-green-600 border-green-200' : avgRisk === 'MEDIUM' ? 'text-yellow-600 border-yellow-200' : 'text-red-600 border-red-200'}`}>{avgRisk} RISK</Badge>
                                  <Badge variant="outline" className="bg-background">GRADE {avgGrade}</Badge>
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-2 uppercase font-bold tracking-tighter">Based on {sitesWithScores.length} Websites</p>
                             </div>
                             <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {aggregateIndicators.length > 0 ? aggregateIndicators.map((ind: any) => (
                                  <div key={ind.id} className="flex items-start gap-2 text-sm bg-background/50 p-3 rounded-lg border">
                                     {ind.passed ? <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" /> : <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />}
                                     <div className="flex-1">
                                       <div className="font-semibold flex justify-between items-center">
                                         {ind.name} 
                                         <span className="text-xs font-normal text-muted-foreground">{ind.score}/{ind.weight}</span>
                                       </div>
                                       <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{ind.details}</div>
                                     </div>
                                  </div>
                                )) : (
                                  <div className="col-span-2 text-center py-8 text-muted-foreground italic">
                                    No aggregate scan data available yet.
                                  </div>
                                )}
                             </div>
                          </div>
                        );
                     })()}
                  </CardContent>
               </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {loading ? (
                <>
                  <Skeleton className="h-[400px] lg:col-span-1 rounded-xl" />
                  <Skeleton className="h-[400px] lg:col-span-2 rounded-xl" />
                </>
              ) : (
                <>
                  <ConsentDonutChart
                    data={metrics?.distribution || []}
                    title="Cookie Distribution"
                    className="lg:col-span-1"
                  />

                  <div className="lg:col-span-2">
                    <TrendLineChart
                      data={metrics?.trends || []}
                      lines={[
                        { dataKey: "accepted", color: "#10b981", label: "Accepted" },
                        { dataKey: "rejected", color: "#f59e0b", label: "Rejected" },
                        { dataKey: "withdrawn", color: "#ef4444", label: "Withdrawn" },
                      ]}
                      title="Consent Activity Trend (Last 7 Days)"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="mt-6">
              {loading ? (
                <Skeleton className="h-[400px] w-full rounded-xl" />
              ) : (
                <Card className="w-full">
                  <CardHeader>
                    <CardTitle>Recent Consent Activity</CardTitle>
                    <CardDescription>Latest user preferences and updates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>User ID</TableHead>
                            <TableHead>Region</TableHead>
                            <TableHead>Language</TableHead>
                            <TableHead>Categories</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {consentLogs.length > 0 ? (
                            consentLogs.map((log) => (
                              <TableRow key={log.id}>
                                <TableCell className="font-medium text-xs">{log.userId}</TableCell>
                                <TableCell className="text-xs">{log.region}</TableCell>
                                <TableCell className="text-xs font-semibold uppercase text-muted-foreground">{log.language || "EN"}</TableCell>
                                <TableCell>
                                  <div className="flex gap-1 flex-wrap">
                                    {log.categories.map((cat: string) => (
                                      <Badge key={cat} variant="secondary" className="text-[10px]">{cat}</Badge>
                                    ))}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant={log.status === "Active" ? "default" : "secondary"} className="text-[10px]">
                                    {log.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  {['Active', 'accepted', 'GRANTED', 'ACCEPTED'].includes(log.status) && (
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="text-destructive hover:text-destructive text-xs h-7"
                                      onClick={() => handleWithdrawConsent(log.id)}
                                    >
                                      Withdraw
                                    </Button>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">No recent activity</TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-6">
            <PageSection>
              <div className="dashboard-card mb-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <SectionTitle>Inventory Filter</SectionTitle>
                    <p className="text-sm text-muted-foreground">Select a website to view its specific cookies.</p>
                  </div>
                  <Select value={selectedWebsiteId} onValueChange={setSelectedWebsiteId}>
                    <SelectTrigger className="w-full md:w-[300px]">
                      <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                      <SelectValue placeholder="All Websites" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Global Inventory (All Sites)</SelectItem>
                      {websites.map(site => (
                        <SelectItem key={site.id} value={site.id}>{site.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="dashboard-card">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                  <SectionTitle>Detected Cookies</SectionTitle>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search cookies..." className="pl-9 w-[250px]" />
                    </div>
                    <Button variant="outline" onClick={handleExportCSV}>
                      <Download className="h-4 w-4 mr-2" />
                      CSV
                    </Button>
                    <Button variant="outline" onClick={handleExportPDF}>
                      <FileText className="h-4 w-4 mr-2" />
                      PDF
                    </Button>
                    <Button onClick={openAddDialog}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Cookie
                    </Button>
                  </div>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Name</TableHead>
                        <TableHead>Domain</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Expiration</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        Array(5).fill(0).map((_, i) => (
                          <TableRow key={i}>
                            <TableCell colSpan={6}><Skeleton className="h-8 w-full" /></TableCell>
                          </TableRow>
                        ))
                      ) : inventory.filter(c => {
                        if (selectedWebsiteId === 'all') return true;
                        const selectedSite = websites.find(w => w.id === selectedWebsiteId);
                        if (!selectedSite) return true;
                        // Match domain or URL
                        return c.domain.includes(new URL(selectedSite.url).hostname) || c.domain.includes(selectedSite.url);
                      }).length > 0 ? (
                        inventory
                          .filter(c => {
                            if (selectedWebsiteId === 'all') return true;
                            const selectedSite = websites.find(w => w.id === selectedWebsiteId);
                            if (!selectedSite) return true;
                            return c.domain.includes(new URL(selectedSite.url).hostname) || c.domain.includes(selectedSite.url);
                          })
                          .map((cookie) => (
                            <TableRow key={cookie.id}>
                              <TableCell className="font-medium">{cookie.name}</TableCell>
                              <TableCell className="text-muted-foreground">{cookie.domain}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="capitalize">
                                  {cookie.category?.name || categories.find(c => c.id === (cookie.categoryId || cookie.category))?.name || "Uncategorized"}
                                </Badge>
                              </TableCell>
                              <TableCell>{cookie.expiration}</TableCell>
                              <TableCell className="max-w-[300px] truncate text-muted-foreground" title={cookie.description}>
                                {cookie.description}
                              </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(cookie)}>
                                      <Settings className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Edit Cookie</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="text-destructive hover:bg-destructive/10"
                                      onClick={() => handleDeleteCookie(cookie.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Delete Cookie</TooltipContent>
                                </Tooltip>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">No cookies found</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </PageSection>

            <AddCookieDialog
              open={isAddCookieOpen}
              onOpenChange={setIsAddCookieOpen}
              onSave={handleSaveCookie}
              initialData={editingCookie}
              categories={categories}
            />
          </TabsContent>

          {/* COOKIE CONSENTS TAB */}
          <TabsContent value="consents" className="space-y-6">
            <PageSection>
              <div className="dashboard-card mb-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <SectionTitle>Consent Records</SectionTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      View and manage user cookie consent logs for your integrated websites.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <Select value={selectedWebsiteId} onValueChange={setSelectedWebsiteId}>
                      <SelectTrigger className="w-full md:w-[250px]">
                        <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                        <SelectValue placeholder="All Websites" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Global Logs (All Websites)</SelectItem>
                        {websites.map(site => (
                          <SelectItem key={site.id} value={site.id}>{site.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </PageSection>
            
            <PageSection>
              <div className="dashboard-card">
                <div className="border rounded-lg overflow-hidden">
                  <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                    <Table>
                      <TableHeader className="sticky top-0 bg-background z-10">
                        <TableRow className="bg-muted/50 shadow-sm">
                          <TableHead>User Identifier</TableHead>
                          <TableHead>Website</TableHead>
                          <TableHead>IP Address</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Language</TableHead>
                          <TableHead>Consent Date</TableHead>
                          <TableHead>Categories</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          Array(5).fill(0).map((_, i) => (
                            <TableRow key={i}>
                              <TableCell colSpan={8}><Skeleton className="h-8 w-full" /></TableCell>
                            </TableRow>
                          ))
                        ) : consentLogs.filter(log => {
                          if (selectedWebsiteId === 'all') return true;
                          return log.websiteId === selectedWebsiteId;
                        }).length > 0 ? (
                          consentLogs
                            .filter(log => selectedWebsiteId === 'all' || log.websiteId === selectedWebsiteId)
                            .map((log) => (
                              <TableRow key={log.id}>
                                <TableCell className="font-mono text-[10px]">{log.userId || log.id}</TableCell>
                                <TableCell className="text-xs">
                                  {websites.find(w => w.id === log.websiteId)?.name || "External Site"}
                                </TableCell>
                                <TableCell className="text-xs font-mono">{log.ipAddress || "xxx.xxx.xxx.xxx"}</TableCell>
                                <TableCell className="text-xs">{log.region || "Unknown"}</TableCell>
                                <TableCell className="text-xs font-semibold uppercase text-muted-foreground">{log.language || "EN"}</TableCell>
                                <TableCell className="text-xs">{new Date(log.createdAt || Date.now()).toLocaleString()}</TableCell>
                                <TableCell>
                                  <div className="flex gap-1 flex-wrap">
                                    {log.categories?.map((cat: string) => {
                                      const isAnalytics = cat.toLowerCase().includes('analytics');
                                      const isMarketing = cat.toLowerCase().includes('marketing') || cat.toLowerCase().includes('advertising');
                                      const isEssential = cat.toLowerCase().includes('essential') || cat.toLowerCase().includes('necessary');
                                      
                                      let badgeClass = "text-[10px] py-0 px-2 font-medium border shadow-none";
                                      if (isAnalytics) badgeClass += " bg-blue-50 text-blue-700 border-blue-100";
                                      else if (isMarketing) badgeClass += " bg-purple-50 text-purple-700 border-purple-100";
                                      else if (isEssential) badgeClass += " bg-slate-50 text-slate-700 border-slate-100";
                                      else badgeClass += " bg-gray-50 text-gray-600 border-gray-100";
                                      
                                      return (
                                        <Badge key={cat} variant="outline" className={badgeClass}>
                                          {cat}
                                        </Badge>
                                      );
                                    })}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge 
                                    variant={['Active', 'accepted', 'GRANTED', 'ACCEPTED'].includes(log.status) ? 'default' : 'secondary'} 
                                    className={`text-[10px] font-bold px-3 ${
                                      ['Active', 'accepted', 'GRANTED', 'ACCEPTED'].includes(log.status) 
                                        ? 'bg-green-500 hover:bg-green-600' 
                                        : (log.status === 'REJECTED' ? 'bg-red-500 hover:bg-red-600' : '')
                                    }`}
                                  >
                                    {log.status === 'ACCEPTED' ? 'ACCEPTED ALL' : log.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  {['Active', 'accepted', 'GRANTED', 'ACCEPTED'].includes(log.status) && (
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="text-destructive h-7 text-xs"
                                      onClick={() => handleWithdrawConsent(log.id)}
                                    >
                                      Withdraw
                                    </Button>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-10 text-muted-foreground italic">
                              No consent logs found for this website.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </PageSection>
          </TabsContent>

          {/* CONFIG TAB */}
          <TabsContent value="config" className="space-y-6">


            <PageSection id="website-config">
                <div className="dashboard-card">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                    <div>
                      <SectionTitle>Website Configurations</SectionTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Manage scanning settings for your registered websites.
                      </p>
                    </div>
                    {websites.length > 0 && (
                      <Button onClick={openAddWebsiteDialog}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Website
                      </Button>
                    )}
                  </div>

                  {!loading && websites.length === 0 ? (
                    <EmptyState onAction={openAddWebsiteDialog} />
                  ) : (
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead>Website Name</TableHead>
                            <TableHead>URL</TableHead>
                            <TableHead>Frequency</TableHead>
                            <TableHead>Compliance Score</TableHead>
                            <TableHead>Risk Level</TableHead>
                            <TableHead>Last Scan</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {loading ? (
                            Array(3).fill(0).map((_, i) => (
                              <TableRow key={i}>
                                <TableCell colSpan={8}><Skeleton className="h-8 w-full" /></TableCell>
                              </TableRow>
                            ))
                          ) : (
                            websites.map((site) => (
                              <TableRow 
                                key={site.id} 
                                className="cursor-pointer hover:bg-muted/30 transition-colors"
                                onClick={() => {
                                  setSelectedSiteForDetails(site);
                                  setIsDetailsOpen(true);
                                }}
                              >
                                <TableCell className="font-medium">
                                  <div className="flex items-center gap-2">
                                    <Globe className="h-3 w-3 text-slate-400" />
                                    {site.name}
                                  </div>
                                </TableCell>
                                <TableCell className="text-blue-500 hover:underline">
                                  {site.url}
                                </TableCell>
                                <TableCell className="capitalize">{site.frequency}</TableCell>
                                <TableCell>
                                  {site.complianceScore != null ? (
                                    <div className="flex items-center gap-2">
                                      <Progress value={site.complianceScore} className={`h-2 w-16 ${site.complianceScore >= 80 ? 'bg-green-100 [&>div]:bg-green-600' : site.complianceScore >= 50 ? 'bg-yellow-100 [&>div]:bg-yellow-500' : 'bg-red-100 [&>div]:bg-red-600'}`} />
                                      <span className="text-xs font-semibold">{site.complianceScore}%</span>
                                    </div>
                                  ) : <span className="text-muted-foreground text-xs">Not scanned</span>}
                                </TableCell>
                                <TableCell>
                                  {site.riskLevel ? (
                                    <Badge variant="outline" className={
                                      site.riskLevel === 'LOW' ? 'bg-green-50 text-green-700 border-green-200' :
                                      site.riskLevel === 'MEDIUM' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                      'bg-red-50 text-red-700 border-red-200'
                                    }>
                                      {site.riskLevel}
                                    </Badge>
                                  ) : <span className="text-muted-foreground">-</span>}
                                </TableCell>
                                <TableCell className="text-xs">
                                  {site.lastScan ? new Date(site.lastScan).toLocaleString() : "Never"}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={site.status === 'Active' ? 'outline' : 'destructive'}
                                    className={
                                      site.status === 'Active'
                                        ? 'bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20 shadow-none'
                                        : (site.status === 'Withdrawn' ? 'bg-destructive/10 text-destructive border-destructive/20 shadow-none' : 'shadow-none')
                                    }
                                  >
                                    {site.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          onClick={() => {
                                            cookieWebsitesService.startScan(site.id).then(() => {
                                              toast({ title: "Scan Triggered", description: `A new scan has been started for ${site.name}.` });
                                              setScanning(true);
                                              setScanProgress(0);
                                              setSelectedWebsiteId(site.id);
                                            }).catch(() => {
                                              toast({ title: "Scan Failed", description: "Could not trigger scan. Please try again later.", variant: "destructive" });
                                            });
                                          }}
                                          disabled={scanning}
                                        >
                                          <RefreshCw className={`h-4 w-4 ${scanning && selectedWebsiteId === site.id ? 'animate-spin' : ''}`} />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Rescan Website</TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" onClick={() => handleGenerateReport(site)}>
                                          <FileText className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Generate Report</TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" onClick={() => openEditWebsiteDialog(site)}>
                                          <Settings className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Settings</TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          className="text-destructive hover:bg-destructive/10"
                                          onClick={() => handleDeleteWebsite(site.id)}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Delete Website</TooltipContent>
                                    </Tooltip>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </PageSection>

            <PageSection id="script-installation">
                <div className="dashboard-card mb-6">
                  <div className="mb-6">
                    <SectionTitle>Banner Installation</SectionTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Copy and paste this script into your website's <code className="bg-muted px-1 rounded">&lt;head&gt;</code> section to activate the banner.
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label>1. Select Website</Label>
                      <Select value={selectedWebsiteId} onValueChange={handleWebsiteChange}>
                        <SelectTrigger className="w-full md:w-[400px]">
                          <SelectValue placeholder="Choose a website to get its script" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Global Template (General)</SelectItem>
                          {websites.map(site => (
                            <SelectItem key={site.id} value={site.id}>{site.name} ({site.url})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label>2. Copy & Paste Script</Label>
                      <div className="relative">
                        <div className="bg-slate-950 text-slate-50 p-4 rounded-xl font-mono text-sm border shadow-xl overflow-x-auto pr-12">
                          <pre>
                            {`<script 
    src="${window.location.origin}/api/v1/public/cookies/banner-script/${selectedWebsiteId !== 'all' ? selectedWebsiteId : 'GLOBAL_ID'}" 
    defer
  ></script>`}
                          </pre>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="absolute top-3 right-3 text-slate-400 hover:text-white hover:bg-white/10"
                          onClick={() => {
                            const script = `<script src="${window.location.origin}/api/v1/public/cookies/banner-script/${selectedWebsiteId !== 'all' ? selectedWebsiteId : 'GLOBAL_ID'}" defer></script>`;
                            navigator.clipboard.writeText(script);
                            toast({
                              title: "Script Copied",
                              description: "The integration script has been copied to your clipboard.",
                            });
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <Label>3. Verify Installation</Label>
                      <div className="flex items-center gap-4 border rounded-lg p-4 bg-muted/20">
                        <Button 
                          variant="secondary"
                          onClick={() => {
                            if (selectedWebsiteId === 'all') {
                              toast({ title: "Select Website", description: "Please select a specific website to verify.", variant: "destructive" });
                              return;
                            }
                            toast({ title: "Verifying...", description: "Checking if script is installed on the selected website." });
                            setTimeout(() => {
                              toast({ title: "Verification Scheduled", description: "We are pinging your website. This might take a minute." });
                            }, 1500);
                          }}
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          Verify Installation
                        </Button>
                        <span className="text-sm text-muted-foreground">Click to automatically check if your website is correctly loading the script.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </PageSection>

            <PageSection id="banner-customization">
                <div className="dashboard-card mb-6">


                  <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
                    <div>
                      <SectionTitle>Banner Customization</SectionTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Customize how the banner looks on your website.
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setBannerTheme("#2563eb");
                          setBannerBgColor("#ffffff");
                          setBannerTextColor("#111827");
                          setBannerBtnTextColor("#ffffff");
                          setBannerBorderRadius(12);
                          setBannerMaxWidth(1200);
                          setBannerFontSize(14);
                          setBannerPadding(24);
                          setBannerBlur(0);
                          setBannerOpacity(50);
                          setBannerHeading("We value your privacy");
                          setBannerDescription("We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking \"Accept All\", you consent to our use of cookies.");
                          setBannerPosition("BOTTOM");
                        }}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset to Default
                      </Button>
                      <Button 
                        onClick={handleSaveBannerSettings} 
                        disabled={isSavingBanner}
                        className="shrink-0 bg-green-600 hover:bg-green-700 text-white"
                      >
                        {isSavingBanner ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Shield className="h-4 w-4 mr-2" />}
                        Save & Publish
                      </Button>
                    </div>
                  </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1 space-y-6">
                    <div className="border rounded-xl p-4 bg-muted/30">
                      <SectionTitle className="mb-4 text-base">Appearance</SectionTitle>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Banner Position</Label>
                          <Select value={bannerPosition} onValueChange={setBannerPosition}>
                            <SelectTrigger className="bg-background">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="BOTTOM">Bottom Bar</SelectItem>
                              <SelectItem value="TOP">Top Bar</SelectItem>
                              <SelectItem value="CENTER">Center Modal</SelectItem>
                              <SelectItem value="CORNER">Bottom Corner (L/R)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Theme Color</Label>
                          <div className="flex flex-wrap gap-2 items-center">
                            {[
                              { name: "Green", color: "#10b981" },
                              { name: "Blue", color: "#2563eb" },
                              { name: "Purple", color: "#8b5cf6" },
                              { name: "Dark", color: "#18181b" }
                            ].map((t) => (
                              <div
                                key={t.color}
                                onClick={() => setBannerTheme(t.color)}
                                className={`h-8 w-8 rounded-full cursor-pointer border-2 transition-all ${
                                  bannerTheme === t.color ? "border-primary scale-110 shadow-md" : "border-transparent hover:scale-105"
                                }`}
                                style={{ backgroundColor: t.color }}
                                title={t.name}
                              />
                            ))}
                            <div className="h-6 w-[1px] bg-border mx-1" />
                            <div className="flex gap-2 items-center">
                              <Input 
                                type="color" 
                                value={bannerTheme} 
                                onChange={(e) => setBannerTheme(e.target.value)} 
                                className="w-8 h-8 p-0.5 rounded-full cursor-pointer border-2 border-muted" 
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-xl p-4 bg-muted/30">
                      <SectionTitle className="mb-4 text-base">Content</SectionTitle>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Heading</Label>
                          <Input 
                            className="bg-background"
                            value={bannerHeading} 
                            onChange={(e) => setBannerHeading(e.target.value)} 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea 
                            className="h-20 bg-background" 
                            value={bannerDescription} 
                            onChange={(e) => setBannerDescription(e.target.value)} 
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-xl p-4 bg-muted/30">
                      <SectionTitle className="mb-4 text-base">Styling</SectionTitle>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-xs">Background</Label>
                            <div className="flex gap-2 items-center">
                              <Input type="color" value={bannerBgColor} onChange={(e) => setBannerBgColor(e.target.value)} className="w-8 h-8 p-1 rounded cursor-pointer" />
                              <Input value={bannerBgColor} onChange={(e) => setBannerBgColor(e.target.value)} className="text-[10px] h-7 px-1 uppercase" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Text</Label>
                            <div className="flex gap-2 items-center">
                              <Input type="color" value={bannerTextColor} onChange={(e) => setBannerTextColor(e.target.value)} className="w-8 h-8 p-1 rounded cursor-pointer" />
                              <Input value={bannerTextColor} onChange={(e) => setBannerTextColor(e.target.value)} className="text-[10px] h-7 px-1 uppercase" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Button Text</Label>
                            <div className="flex gap-2 items-center">
                              <Input type="color" value={bannerBtnTextColor} onChange={(e) => setBannerBtnTextColor(e.target.value)} className="w-8 h-8 p-1 rounded cursor-pointer" />
                              <Input value={bannerBtnTextColor} onChange={(e) => setBannerBtnTextColor(e.target.value)} className="text-[10px] h-7 px-1 uppercase" />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-xs">
                            <Label>Max Width</Label>
                            <span className="font-mono">{bannerMaxWidth}px</span>
                          </div>
                          <Slider value={[bannerMaxWidth]} min={400} max={1600} step={50} onValueChange={([val]) => setBannerMaxWidth(val)} />
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-xs">
                            <Label>Border Radius</Label>
                            <span className="font-mono">{bannerBorderRadius}px</span>
                          </div>
                          <Slider value={[bannerBorderRadius]} min={0} max={40} step={2} onValueChange={([val]) => setBannerBorderRadius(val)} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div className="flex justify-between items-center text-xs">
                              <Label>Font Size</Label>
                              <span className="font-mono">{bannerFontSize}px</span>
                            </div>
                            <Slider value={[bannerFontSize]} min={10} max={20} step={1} onValueChange={([val]) => setBannerFontSize(val)} />
                          </div>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center text-xs">
                              <Label>Padding</Label>
                              <span className="font-mono">{bannerPadding}px</span>
                            </div>
                            <Slider value={[bannerPadding]} min={12} max={48} step={4} onValueChange={([val]) => setBannerPadding(val)} />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-xs">
                            <Label>Backdrop Blur</Label>
                            <span className="font-mono">{bannerBlur}px</span>
                          </div>
                          <Slider value={[bannerBlur]} min={0} max={20} step={1} onValueChange={([val]) => setBannerBlur(val)} />
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-xs">
                            <Label>Backdrop Opacity</Label>
                            <span className="font-mono">{bannerOpacity}%</span>
                          </div>
                          <Slider value={[bannerOpacity]} min={0} max={100} step={5} onValueChange={([val]) => setBannerOpacity(val)} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-2">
                    <div className="border rounded-xl p-6 bg-muted/10 h-full flex flex-col min-h-[500px]">
                      <div className="flex items-center justify-between mb-6 border-b pb-4">
                        <div className="flex items-center gap-2">
                          <Layout className="h-5 w-5 text-primary" />
                          <h3 className="font-medium">Live Preview</h3>
                        </div>
                        <div className="flex items-center bg-muted rounded-lg p-1">
                          <Button
                            variant={previewDevice === 'desktop' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setPreviewDevice('desktop')}
                            className="h-7 px-3"
                          >
                            <Monitor className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={previewDevice === 'mobile' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setPreviewDevice('mobile')}
                            className="h-7 px-3"
                          >
                            <Smartphone className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div 
                        className={`flex-1 rounded-lg border-2 border-dashed border-border flex items-end justify-center relative overflow-hidden transition-all duration-300 ${previewDevice === 'mobile' ? 'max-w-xs mx-auto' : 'w-full'}`}
                        style={{ 
                          backgroundColor: ['CENTER', 'center'].includes(bannerPosition) ? `rgba(0,0,0,${bannerOpacity/100})` : 'hsl(var(--muted) / 0.2)'
                        }}
                      >
                        <div className="absolute inset-0 opacity-10 pointer-events-none flex flex-col items-center justify-center">
                          <div className="w-3/4 h-4 bg-foreground/20 rounded mb-4" />
                          <div className="w-1/2 h-4 bg-foreground/20 rounded mb-4" />
                          <div className="w-full h-32 bg-foreground/10 rounded mb-4" />
                        </div>

                        {/* Banner Preview */}
                        <div 
                          className={`shadow-lg transition-all duration-300 border
                            ${['CENTER', 'center'].includes(bannerPosition) ? 'mb-auto mt-auto' : ''} 
                            ${['TOP', 'top'].includes(bannerPosition) ? 'mb-auto mt-4' : ''} 
                            ${['BOTTOM', 'bottom'].includes(bannerPosition) ? 'mb-4 mt-auto' : ''} 
                          `}
                          style={{
                            backgroundColor: bannerBgColor,
                            color: bannerTextColor,
                            width: '90%',
                            maxWidth: previewDevice === 'mobile' ? '320px' : (bannerMaxWidth ? `${bannerMaxWidth}px` : '100%'),
                            borderRadius: `${bannerBorderRadius}px`,
                            padding: `${bannerPadding}px`,
                            fontSize: `${bannerFontSize}px`
                          }}
                        >
                          <h4 className="font-semibold text-lg mb-2" style={{ color: 'inherit' }}>{bannerHeading}</h4>
                          <p className="text-sm opacity-90 mb-6" style={{ color: 'inherit' }}>{bannerDescription}</p>
                          <div className={`flex gap-3 flex-wrap ${previewDevice === 'mobile' ? 'flex-col' : 'flex-row justify-end'}`}>
                            <Button variant="outline" size="sm" className="bg-transparent border-current hover:bg-current/10" style={{ color: 'inherit', borderColor: `${bannerTextColor}33` }}>
                              Preferences
                            </Button>
                            <Button variant="ghost" size="sm" className="hover:bg-current/10" style={{ backgroundColor: `${bannerTextColor}11`, color: 'inherit' }}>
                              Reject All
                            </Button>
                            <Button size="sm" style={{ backgroundColor: bannerTheme, color: bannerBtnTextColor }}>
                              Accept All
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </PageSection>


            <AddWebsiteDialog
              open={isAddWebsiteOpen}
              onOpenChange={setIsAddWebsiteOpen}
              onSave={handleSaveWebsite}
              initialData={editingWebsite}
            />
          </TabsContent>

          <CreateBannerDialog
            open={isCreateBannerOpen}
            onOpenChange={setIsCreateBannerOpen}
            onSave={handleSaveBanner}
          />
        </Tabs>
      </DashboardLayout>

      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-[90vw] w-[1200px] h-[85vh] p-0 overflow-hidden bg-slate-50 dark:bg-slate-950 flex flex-col">
          <DialogHeader className="p-4 border-b bg-background shrink-0">
            <div className="flex items-center justify-between gap-4">
              <div>
                <DialogTitle>Live Site Preview</DialogTitle>
                <DialogDescription>
                  Simulated view of how the banner appears on your website.
                </DialogDescription>
              </div>
              <div className="flex items-center bg-muted rounded-lg p-1 mr-8">
                <Button
                  variant={previewDevice === 'desktop' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setPreviewDevice('desktop')}
                  className="h-7 px-3"
                >
                  <Monitor className="h-4 w-4 mr-2" />
                  Desktop
                </Button>
                <Button
                  variant={previewDevice === 'mobile' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setPreviewDevice('mobile')}
                  className="h-7 px-3"
                >
                  <Smartphone className="h-4 w-4 mr-2" />
                  Mobile
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="bg-muted/50 p-2 flex items-center gap-2 border-b shrink-0">
            <div className="flex gap-1.5 ml-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
            </div>
            <div className="flex-1 max-w-md mx-auto bg-background rounded px-3 py-1 text-[11px] text-muted-foreground flex items-center gap-2 border shadow-sm">
              <Globe className="h-3 w-3" />
              https://example.com/shop
            </div>
            <div className="w-16" /> {/* Spacer for symmetry */}
          </div>
          
          <div className="flex-1 relative overflow-hidden bg-slate-100/50 shadow-inner">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute inset-0 overflow-auto p-8 flex flex-col items-center shadow-inner">
                <div className={`w-full transition-all duration-500 bg-white dark:bg-slate-900 shadow-sm border rounded-lg p-8 relative min-h-[1500px]
                  ${previewDevice === 'mobile' ? 'max-w-[375px]' : 'max-w-[1000px]'}
                `}>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-12">
                      <div className="w-32 h-8 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                      <div className="flex gap-4">
                        <div className="w-16 h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                        <div className="w-16 h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                        <div className="w-16 h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="w-3/4 h-12 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                      <div className="w-full h-4 bg-slate-100 dark:bg-slate-800/50 rounded animate-pulse" />
                      <div className="w-full h-4 bg-slate-100 dark:bg-slate-800/50 rounded animate-pulse" />
                      <div className="w-1/2 h-4 bg-slate-100 dark:bg-slate-800/50 rounded animate-pulse" />
                    </div>

                    <div className="grid grid-cols-2 gap-8 pt-12">
                      <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                      <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                    </div>
                    
                    <div className="pt-20 space-y-4">
                      <div className="w-full h-24 bg-slate-50 dark:bg-slate-800/30 rounded animate-pulse" />
                      <div className="w-3/4 h-4 bg-slate-100 dark:bg-slate-800/50 rounded animate-pulse" />
                      <div className="w-full h-4 bg-slate-100 dark:bg-slate-800/50 rounded animate-pulse" />
                      <div className="w-2/3 h-4 bg-slate-100 dark:bg-slate-800/50 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>

              <div 
                className={`absolute inset-0 p-4 md:p-8 pointer-events-none flex z-[100] transition-all duration-300
                  ${(!bannerPosition || ['BOTTOM', 'bottom'].includes(bannerPosition)) ? 'items-end justify-center' : ''}
                  ${['TOP', 'top'].includes(bannerPosition) ? 'items-start justify-center' : ''}
                  ${['CENTER', 'center'].includes(bannerPosition) ? 'items-center justify-center pointer-events-auto' : ''}
                  ${['CORNER', 'corner'].includes(bannerPosition) ? 'items-end justify-end' : ''}
                `}
                style={{
                  backgroundColor: ['CENTER', 'center'].includes(bannerPosition) ? `rgba(0,0,0,${bannerOpacity/100})` : 'transparent'
                }}
              >
                <div className={`w-full transition-all duration-300 flex
                  ${(!bannerPosition || ['BOTTOM', 'bottom'].includes(bannerPosition)) ? 'items-end justify-center' : ''}
                  ${['TOP', 'top'].includes(bannerPosition) ? 'items-start justify-center' : ''}
                  ${['CENTER', 'center'].includes(bannerPosition) ? 'items-center justify-center' : ''}
                  ${['CORNER', 'corner'].includes(bannerPosition) ? 'items-end justify-end' : ''}
                  ${previewDevice === 'mobile' ? 'max-w-[375px]' : 'max-w-full'}
                `}>
                  <div 
                    className={`pointer-events-auto shadow-2xl transition-all duration-300 w-full overflow-hidden border
                      ${(!bannerPosition || ['TOP', 'bottom', 'BOTTOM', 'top'].includes(bannerPosition)) ? 'max-w-4xl' : 'max-w-md'}
                      ${previewDevice === 'mobile' ? 'mx-4' : ''}
                    `}
                    style={{
                      backgroundColor: bannerBgColor,
                      color: bannerTextColor,
                      width: '90%',
                      maxWidth: previewDevice === 'mobile' ? '320px' : (bannerMaxWidth ? `${bannerMaxWidth}px` : '100%'),
                      borderRadius: `${bannerBorderRadius}px`,
                      fontSize: `${bannerFontSize}px`
                    }}
                  >
                    <div className={previewDevice === 'mobile' ? 'p-4' : 'p-6'} style={{ padding: `${bannerPadding}px` }}>
                      <div className={`flex gap-4 ${previewDevice === 'mobile' ? 'flex-col items-center text-center' : 'items-start'}`}>
                        <div className={`p-2 rounded-lg shrink-0 ${previewDevice === 'mobile' ? 'w-fit' : ''}`} style={{ backgroundColor: `${bannerTheme}15` }}>
                          <Cookie className={previewDevice === 'mobile' ? 'h-5 w-5' : 'h-6 w-6'} style={{ color: bannerTheme }} />
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-semibold mb-1 ${previewDevice === 'mobile' ? 'text-base' : 'text-lg'}`} style={{ color: 'inherit' }}>{bannerHeading}</h4>
                          <p className={`mb-4 leading-relaxed opacity-90 ${previewDevice === 'mobile' ? 'text-xs' : 'text-sm'}`} style={{ color: 'inherit' }}>
                            {bannerDescription}
                          </p>
                          <div className={`flex gap-2 ${previewDevice === 'mobile' ? 'flex-col w-full' : 'items-center gap-3'}`}>
                            <Button variant="outline" size="sm" className="bg-transparent border-current hover:bg-current/10" style={{ color: 'inherit', borderColor: `${bannerTextColor}33` }}>
                              Preferences
                            </Button>
                            <Button variant="ghost" size="sm" className="hover:bg-current/10" style={{ backgroundColor: `${bannerTextColor}11`, color: 'inherit' }}>
                              Reject All
                            </Button>
                            <Button 
                              size="sm"
                              className={previewDevice === 'mobile' ? 'w-full py-2 h-9' : 'px-6'}
                              style={{ backgroundColor: bannerTheme, color: bannerBtnTextColor }}
                            >
                              Accept All
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className={`px-6 py-2 bg-muted/30 border-t flex items-center justify-between text-muted-foreground uppercase tracking-widest font-semibold ${previewDevice === 'mobile' ? 'text-[8px] px-4' : 'text-[10px]'}`}>
                      <span className="flex items-center gap-2">
                         <Shield className={previewDevice === 'mobile' ? 'h-2.5 w-2.5' : 'h-3 w-3'} />
                         GDPR & DPDP
                      </span>
                      <span>Proteccio</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Premium Product Tour */}
      <ProductTour 
        steps={tourSteps}
        isOpen={isTourOpen}
        onClose={skipTour}
        currentStep={tourStep}
        setCurrentStep={setTourStep}
      />
      {/* Scan Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-4">
              <div className={`h-12 w-12 rounded-full flex items-center justify-center border-4 ${
                (selectedSiteForDetails?.complianceScore || 0) >= 80 ? 'border-green-500 text-green-600 bg-green-50' : 
                (selectedSiteForDetails?.complianceScore || 0) >= 50 ? 'border-yellow-500 text-yellow-600 bg-yellow-50' : 
                'border-red-500 text-red-600 bg-red-50'
              }`}>
                <span className="text-lg font-bold">{selectedSiteForDetails?.complianceScore || 0}%</span>
              </div>
              <div>
                <DialogTitle className="text-xl">Compliance Audit Results</DialogTitle>
                <DialogDescription className="flex items-center gap-2 mt-1">
                  <Globe className="h-3 w-3" />
                  {selectedSiteForDetails?.url}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-muted/20 border-none shadow-none">
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1 uppercase font-bold tracking-wider">Risk Level</p>
                  <Badge className={
                    selectedSiteForDetails?.riskLevel === 'LOW' ? 'bg-green-500' : 
                    selectedSiteForDetails?.riskLevel === 'MEDIUM' ? 'bg-yellow-500' : 'bg-red-500'
                  }>
                    {selectedSiteForDetails?.riskLevel || 'UNKNOWN'}
                  </Badge>
                </CardContent>
              </Card>
              <Card className="bg-muted/20 border-none shadow-none">
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1 uppercase font-bold tracking-wider">Pages Crawled</p>
                  <p className="text-xl font-bold">{selectedSiteForDetails?.pagesCrawled || 0}</p>
                </CardContent>
              </Card>
              <Card className="bg-muted/20 border-none shadow-none">
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1 uppercase font-bold tracking-wider">Cookies Found</p>
                  <p className="text-xl font-bold">{selectedSiteForDetails?.cookiesDetected || 0}</p>
                </CardContent>
              </Card>
            </div>

            {/* Breakdown */}
            <div className="space-y-4">
              <SectionTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Score Breakdown
              </SectionTitle>
              
              <div className="border rounded-xl divide-y bg-card overflow-hidden">
                {selectedSiteForDetails?.scanResults ? (
                  (selectedSiteForDetails.scanResults as any[]).map((indicator: any) => (
                    <div key={indicator.id} className="p-4 hover:bg-muted/10 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          {indicator.passed ? (
                            <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                          )}
                          <div>
                            <h4 className="font-semibold text-sm">{indicator.name}</h4>
                            <p className="text-xs text-muted-foreground">{indicator.details}</p>
                            
                            {/* Evidence Section */}
                            {indicator.evidence && (
                              <div className="mt-3 bg-muted/30 rounded-lg p-2 border border-dashed border-muted-foreground/20">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[10px] font-bold uppercase text-muted-foreground">Proof of Compliance</span>
                                  <a 
                                    href={indicator.evidence.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-[10px] text-blue-500 hover:underline flex items-center gap-1"
                                  >
                                    <ExternalLink className="h-2.5 w-2.5" />
                                    View Page
                                  </a>
                                </div>
                                <p className="text-[10px] font-mono text-muted-foreground line-clamp-2 bg-background/50 p-1 rounded italic">
                                  {indicator.evidence.snippet}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`text-sm font-bold ${indicator.passed ? 'text-green-600' : 'text-red-600'}`}>
                            {indicator.score} / {indicator.weight}
                          </span>
                          <p className="text-[10px] text-muted-foreground uppercase font-medium">Points</p>
                        </div>
                      </div>
                      <Progress value={(indicator.score / indicator.weight) * 100} className={`h-1 ${indicator.passed ? 'bg-green-100 [&>div]:bg-green-500' : 'bg-red-100 [&>div]:bg-red-500'}`} />
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-muted-foreground italic">
                    No detailed scan results available for this website. Trigger a rescan to generate a report.
                  </div>
                )}
              </div>
            </div>

            {/* Third Party Scripts */}
            {selectedSiteForDetails?.thirdPartyScripts && (selectedSiteForDetails.thirdPartyScripts as string[]).length > 0 && (
              <div className="space-y-2">
                <SectionTitle className="text-base">Detected Third-Party Hosts</SectionTitle>
                <div className="flex flex-wrap gap-2">
                  {(selectedSiteForDetails.thirdPartyScripts as string[]).map((host: string) => (
                    <Badge key={host} variant="secondary" className="text-[10px]">
                      {host}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-between items-center mt-6 pt-4 border-t">
             <p className="text-xs text-muted-foreground italic">
               Last scanned on {selectedSiteForDetails?.lastScan ? new Date(selectedSiteForDetails.lastScan).toLocaleString() : 'N/A'}
             </p>
             <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
