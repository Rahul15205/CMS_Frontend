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

const cookieStats = [
  { name: "Necessary", value: 100, color: "hsl(142, 76%, 36%)" },
  { name: "Analytics", value: 72, color: "hsl(217, 91%, 50%)" },
  { name: "Marketing", value: 45, color: "hsl(262, 83%, 58%)" },
  { name: "Functional", value: 68, color: "hsl(199, 89%, 48%)" },
];

const cookieCategories = [
  {
    id: "necessary",
    name: "Strictly Necessary",
    description: "Essential cookies required for the website to function properly. These cannot be disabled.",
    icon: Shield,
    count: 8,
    enabled: true,
    locked: true,
  },
  {
    id: "analytics",
    name: "Analytics & Performance",
    description: "Cookies that help us understand how visitors interact with our website.",
    icon: BarChart3,
    count: 12,
    enabled: true,
    locked: false,
  },
  {
    id: "functional",
    name: "Functional",
    description: "Cookies that enable personalized features and enhanced functionality.",
    icon: Settings,
    count: 6,
    enabled: true,
    locked: false,
  },
  {
    id: "marketing",
    name: "Marketing & Advertising",
    description: "Cookies used to deliver relevant advertisements and track campaign effectiveness.",
    icon: Target,
    count: 15,
    enabled: false,
    locked: false,
  },
];

// Mock Data for Inventory
const mockInventory = [
  { id: 1, name: "session_id", domain: ".example.com", category: "necessary", expiration: "Session", description: "Maintains user session state" },
  { id: 2, name: "_ga", domain: ".example.com", category: "analytics", expiration: "2 years", description: "Google Analytics unique user ID" },
  { id: 3, name: "theme_pref", domain: ".example.com", category: "functional", expiration: "1 year", description: "Stores user theme preference" },
  { id: 4, name: "ads_uuid", domain: ".ad-network.com", category: "marketing", expiration: "30 days", description: "Ad tracking identifier" },
  { id: 5, name: "cart_items", domain: ".example.com", category: "necessary", expiration: "Session", description: "Stores temporary cart data" },
];

import { AddCookieDialog } from "@/components/cookies/AddCookieDialog";

import { CreateBannerDialog } from "@/components/cookies/CreateBannerDialog";

import { AddWebsiteDialog } from "@/components/cookies/AddWebsiteDialog";
import { FileText } from "lucide-react";

// Mock Data for websites
const mockWebsites = [
  { id: 1, name: "Main Corporate Site", url: "https://example.com", frequency: "weekly", lastScan: "2024-03-20", status: "Active", depth: "standard", email: "admin@example.com", autoCategorize: true, scanBehindLogin: false },
  { id: 2, name: "E-commerce Store", url: "https://shop.example.com", frequency: "daily", lastScan: "2024-03-21", status: "Active", depth: "deep", email: "shop@example.com", autoCategorize: true, scanBehindLogin: true },
];

// Mock Data for Consent Logs
const mockConsentLogs = [
  { id: 1, userId: "USR-001", date: "2024-03-22 10:30 AM", region: "India", categories: ["Necessary", "Analytics"], status: "Active" },
  { id: 2, userId: "USR-002", date: "2024-03-22 11:15 AM", region: "Europe (GDPR)", categories: ["Necessary", "Marketing", "Functional"], status: "Active" },
  { id: 3, userId: "USR-003", date: "2024-03-21 04:45 PM", region: "USA", categories: ["Necessary"], status: "Withdrawn" },
];

export default function CookiesManagement() {
  const [activeTab, setActiveTab] = useState("overview");
  const [cookies, setCookies] = useState(cookieCategories);
  const [inventory, setInventory] = useState(mockInventory);
  const [websites, setWebsites] = useState(mockWebsites);
  const [consentLogs, setConsentLogs] = useState(mockConsentLogs);

  // Banner State
  const [banners, setBanners] = useState([
    { id: 1, name: "Default GDPR Banner", lastModified: "2 days ago", status: "Active", theme: "bg-primary" },
    { id: 2, name: "Dark Mode Variant", lastModified: "1 week ago", status: "Draft", theme: "bg-zinc-900" },
    { id: 3, name: "Marketing Campaign", lastModified: "3 weeks ago", status: "Inactive", theme: "bg-blue-600" },
  ]);
  const [isCreateBannerOpen, setIsCreateBannerOpen] = useState(false);

  // Scanning State
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

  const toggleCookie = (id: string) => {
    setCookies(cookies.map(cookie =>
      cookie.id === id && !cookie.locked
        ? { ...cookie, enabled: !cookie.enabled }
        : cookie
    ));
  };

  // Consent Withdrawal Handler

  const handleWithdrawConsent = (id: number) => {
    if (confirm("Are you sure you want to withdraw consent for this user? This action cannot be undone.")) {
      setConsentLogs(consentLogs.map(log =>
        log.id === id ? { ...log, status: "Withdrawn" } : log
      ));
      toast({
        title: "Consent Withdrawn",
        description: "User consent has been successfully withdrawn.",
      });
    }
  };

  const handleScanNow = () => {
    setScanning(true);
    setScanProgress(0);

    toast({
      title: "Scan Initiated",
      description: "Scanning all active websites for cookies...",
    });

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

    setTimeout(() => {
      clearInterval(interval);
      setScanning(false);
      setScanProgress(0);
      setLastScanDate("Just now");
      toast({
        title: "Scan Completed",
        description: "Cookie inventory has been updated successfully.",
        variant: "default", // or success if available
      });
    }, 3500);
  };

  // Website Handlers

  const handleSaveWebsite = (websiteData: any) => {
    if (editingWebsite) {
      setWebsites(websites.map(w => w.id === websiteData.id ? { ...websiteData, status: w.status, lastScan: w.lastScan } : w));
    } else {
      setWebsites([...websites, { id: Date.now(), ...websiteData, status: "Active", lastScan: "Pending" }]);
    }
    setEditingWebsite(null);
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
            cookieCategories.find(c => c.id === cookie.category)?.name || cookie.category,
            cookie.expiration,
            cookie.description
          ]),
        });

        doc.save("cookie_inventory.pdf");
      });
    });
  };

  const handleSaveCookie = (cookieData: any) => {
    if (editingCookie) {
      setInventory(inventory.map(c => c.id === cookieData.id ? cookieData : c));
    } else {
      setInventory([...inventory, { id: Date.now(), ...cookieData }]);
    }
    setEditingCookie(null);
  };

  const openEditDialog = (cookie: any) => {
    setEditingCookie(cookie);
    setIsAddCookieOpen(true);
  };

  const openAddDialog = () => {
    setEditingCookie(null);
    setIsAddCookieOpen(true);
  };

  const handleSaveBanner = (bannerData: any) => {
    const newBanner = {
      id: Date.now(),
      ...bannerData
    };
    setBanners([newBanner, ...banners]);

    toast({
      title: "Banner Created",
      description: `"${bannerData.name}" has been created successfully.`
    });
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
            <KPICard
              title="Total Cookies"
              value={inventory.length}
              icon={<Cookie className="h-4 w-4" />}
              trend={{ value: 5, direction: "up", label: "this week" }}
            />
            <KPICard
              title="Categories"
              value={cookieCategories.length}
              icon={<Layout className="h-4 w-4" />}
            />
            <KPICard
              title="Active Consents"
              value="1,234"
              icon={<CheckCircle className="h-4 w-4" />}
              trend={{ value: 12, direction: "up" }}
            />
            <KPICard
              title="Opt-out Rate"
              value="4.2%"
              icon={<XCircle className="h-4 w-4" />}
              trend={{ value: 0.5, direction: "down" }}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ConsentDonutChart
              data={cookieStats}
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
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {consentLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">{log.userId}</TableCell>
                        <TableCell>{log.region}</TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {log.categories.map(cat => (
                              <Badge key={cat} variant="secondary" className="text-[10px]">{cat}</Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={log.status === "Active" ? "default" : "secondary"}>
                            {log.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">{log.date}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
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
                    {inventory.map((cookie) => (
                      <TableRow key={cookie.id}>
                        <TableCell className="font-medium">{cookie.name}</TableCell>
                        <TableCell className="text-muted-foreground">{cookie.domain}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {cookie.category}
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
                    ))}
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
                {banners.map((banner) => (
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
                ))}
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
                      // ${bannerPosition === 'bottom' ? 'mb-4' : ''}
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
                    {websites.map((site) => (
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
                    ))}
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

