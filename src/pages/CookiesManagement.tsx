import { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { useEffect, useCallback } from "react";
import { 
  cookieCategoriesService, 
  cookieInventoryService, 
  cookieWebsitesService, 
  cookieBannersService, 
  cookieConsentLogsService, 
  cookieComplianceService 
} from "@/services/cookiesService";
import { Skeleton } from "@/components/ui/skeleton";

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
import { FileText } from "lucide-react";

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
  const [bannerPosition, setBannerPosition] = useState("bottom");
  const [previewDevice, setPreviewDevice] = useState("desktop");

  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [cats, inv, sites, logs, bans, met] = await Promise.all([
        cookieCategoriesService.getAll(),
        cookieInventoryService.getAll(),
        cookieWebsitesService.getAll(),
        cookieConsentLogsService.getAll(),
        cookieBannersService.getAll(),
        cookieComplianceService.getMetrics()
      ]);

      setCategories(cats || []);
      setInventory(inv || []);
      setWebsites(sites || []);
      setConsentLogs(logs || []);
      setBanners(bans || []);
      setMetrics(met);
    } catch (error) {
      console.error("Failed to fetch cookies data:", error);
      toast({
        title: "Error",
        description: "Failed to load cookie management data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
        // In a real scenario, we'd have a specific withdrawal endpoint
        const updated = await cookieConsentLogsService.record({ id, userId: id, status: "Withdrawn" });
        if (updated) {
          setConsentLogs(consentLogs.map(log =>
            log.id === id ? { ...log, status: "Withdrawn" } : log
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

  const handleGenerateReport = (website: any) => {
    // Mock report generation
    import("jspdf").then(({ default: jsPDF }) => {
      const doc = new jsPDF();
      doc.text(`Screening Report for ${website.name}`, 10, 10);
      doc.text(`URL: ${website.url}`, 10, 20);
      doc.text(`Date: ${new Date().toLocaleString()}`, 10, 30);
      doc.text("Status: Clean - No critical issues found.", 10, 40);
      doc.save(`${website.name}_report.pdf`);
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
        cookie.category,
        cookie.expiration,
        `"${cookie.description.replace(/"/g, '""')}"` // Escape quotes
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
          body: inventory.map(cookie => [
            cookie.id,
            cookie.name,
            cookie.domain,
            categories.find(c => c.id === cookie.category)?.name || cookie.category,
            cookie.expiration,
            cookie.description
          ]),
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
          {activeTab === "banner" && (
            <Button size="sm">
              <Eye className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Live Preview</span>
            </Button>
          )}
          {activeTab !== "banner" && (
            <Button size="sm" onClick={() => setActiveTab("banner")}>
              <Eye className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Live Preview</span>
            </Button>
          )}
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
              <SelectItem value="banner">
                <div className="flex items-center gap-2">
                  <Layout className="h-4 w-4" />
                  <span>Banner Customization</span>
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
          <TabsTrigger value="banner" className="flex items-center gap-2 py-2.5">
            <Layout className="h-4 w-4" />
            <span className="hidden sm:inline">Banner Customization</span>
          </TabsTrigger>
          <TabsTrigger value="config" className="flex items-center gap-2 py-2.5">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Configuration</span>
          </TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6">
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

                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Recent Consent Activity</CardTitle>
                    <CardDescription>Latest user preferences and updates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User ID</TableHead>
                          <TableHead>Region</TableHead>
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
                                {log.status === "Active" && (
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
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>

        {/* INVENTORY TAB */}
        <TabsContent value="inventory" className="space-y-6">
          <PageSection>
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
                    ) : inventory.length > 0 ? (
                      inventory.map((cookie) => (
                        <TableRow key={cookie.id}>
                          <TableCell className="font-medium">{cookie.name}</TableCell>
                          <TableCell className="text-muted-foreground">{cookie.domain}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {categories.find(c => c.id === cookie.category)?.name || cookie.category}
                            </Badge>
                          </TableCell>
                          <TableCell>{cookie.expiration}</TableCell>
                          <TableCell className="max-w-[300px] truncate text-muted-foreground" title={cookie.description}>
                            {cookie.description}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => openEditDialog(cookie)}>
                              <Settings className="h-4 w-4" />
                            </Button>
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

        {/* BANNER TAB */}
        <TabsContent value="banner" className="space-y-6">
          {/* Saved Banners List */}
          <PageSection>
            <div className="dashboard-card mb-6">
              <div className="flex items-center justify-between mb-4">
                <SectionTitle>Customized Banners</SectionTitle>
                <Button size="sm" onClick={() => setIsCreateBannerOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {loading ? (
                  Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)
                ) : banners.length > 0 ? (
                  banners.map((banner) => (
                    <div key={banner.id} className="border rounded-lg p-4 hover:border-primary cursor-pointer transition-colors relative group">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`h-3 w-3 rounded-full ${banner.theme}`} />
                          <span className="font-medium text-sm">{banner.name}</span>
                        </div>
                        <Badge variant={banner.status === 'Active' ? 'default' : 'secondary'} className="text-xs">
                          {banner.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">Last modified: {banner.lastModified}</p>
  
                      <div className="absolute inset-0 bg-background/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-lg backdrop-blur-[2px]">
                        <Button size="sm" variant="secondary" className="shadow-sm">Load Configuration</Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-4 text-muted-foreground">No banners created yet</div>
                )}
              </div>
            </div>
          </PageSection>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <div className="dashboard-card">
                <SectionTitle className="mb-4">Appearance</SectionTitle>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Banner Position</Label>
                    <Select value={bannerPosition} onValueChange={setBannerPosition}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bottom">Bottom Bar</SelectItem>
                        <SelectItem value="top">Top Bar</SelectItem>
                        <SelectItem value="center">Center Modal</SelectItem>
                        <SelectItem value="corner">Botom Corner (L/R)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Theme Color</Label>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary cursor-pointer ring-2 ring-offset-2 ring-primary" />
                      <div className="h-8 w-8 rounded-full bg-blue-600 cursor-pointer" />
                      <div className="h-8 w-8 rounded-full bg-purple-600 cursor-pointer" />
                      <div className="h-8 w-8 rounded-full bg-zinc-900 cursor-pointer" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="dashboard-card">
                <SectionTitle className="mb-4">Content & Language</SectionTitle>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select value={bannerLang} onValueChange={setBannerLang}>
                      <SelectTrigger>
                        <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English (Default)</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Heading</Label>
                    <Input defaultValue="We value your privacy" />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea className="h-20" defaultValue="We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic." />
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="dashboard-card h-full flex flex-col">
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

                <div className="flex-1 bg-muted/20 rounded-lg border-2 border-dashed border-border flex items-end justify-center relative overflow-hidden min-h-[400px]">
                  {/* Mock Website Background */}
                  <div className="absolute inset-0 opacity-10 pointer-events-none flex flex-col items-center justify-center">
                    <div className="w-3/4 h-4 bg-foreground/20 rounded mb-4" />
                    <div className="w-1/2 h-4 bg-foreground/20 rounded mb-4" />
                    <div className="w-full h-32 bg-foreground/10 rounded mb-4" />
                  </div>

                  {/* Banner Preview */}
                  <div className={`p-6 bg-card border shadow-lg transition-all duration-300 w-full max-w-lg m-4 rounded-lg 
                      ${bannerPosition === 'center' ? 'mb-auto mt-auto' : ''} 
                      ${bannerPosition === 'top' ? 'mb-auto mt-4' : ''} 
                      ${bannerPosition === 'bottom' ? 'mb-4 mt-auto' : ''} 
                   `}>
                    <h4 className="font-semibold text-lg mb-2">We value your privacy</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                       <Button className="flex-1">Accept All</Button>
                       <Button variant="outline" className="flex-1">Reject All</Button>
                       <Button variant="ghost" className="flex-1">Preferences</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* CONFIG TAB */}
        <TabsContent value="config" className="space-y-6">
          <PageSection>
            <div className="dashboard-card">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                <div>
                  <SectionTitle>Website Configurations</SectionTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage scanning settings for your registered websites.
                  </p>
                </div>
                <Button onClick={openAddWebsiteDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Website
                </Button>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Website Name</TableHead>
                      <TableHead>URL</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead>Last Scan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array(3).fill(0).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell colSpan={6}><Skeleton className="h-8 w-full" /></TableCell>
                        </TableRow>
                      ))
                    ) : websites.length > 0 ? (
                      websites.map((site) => (
                        <TableRow key={site.id}>
                          <TableCell className="font-medium">{site.name}</TableCell>
                          <TableCell className="text-blue-500 hover:underline cursor-pointer">
                            <a href={site.url} target="_blank" rel="noopener noreferrer">{site.url}</a>
                          </TableCell>
                          <TableCell className="capitalize">{site.frequency}</TableCell>
                          <TableCell>{site.lastScan}</TableCell>
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
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">No websites configured</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
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
  );
}

