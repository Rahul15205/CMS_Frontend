import { ReactNode, useState, useEffect } from "react";
import { AppSidebar, SidebarContent } from "./AppSidebar";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/dashboard/ThemeToggle";
import { UserProfile } from "@/components/dashboard/UserProfile";
import { Footer } from "@/components/layout/Footer";
// RoleSwitcher removed as per requirement
import { DashboardCustomizer } from "@/components/dashboard/DashboardCustomizer";
import { useDashboard } from "@/contexts/DashboardContext";
import { useNavigate } from "react-router-dom";
import { Bell, Search, HelpCircle, Menu, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { securityService } from "@/services/reportsLogsSecurityService";
import { formatDistanceToNow } from "date-fns";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;

  actions?: ReactNode;
  showCustomizer?: boolean;
  showUserProfile?: boolean;
  onSearch?: (query: string) => void;
}

export function DashboardLayout({
  children,
  title,

  actions,
  showCustomizer = true,
  showUserProfile = true,
  onSearch,
}: DashboardLayoutProps) {
  const { sidebarCollapsed } = useDashboard();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const fetchNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const res = await securityService.getEvents({ limit: 5 });
      setNotifications(res?.data || []);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const getFriendlyActionTitle = (action: string) => {
    if (!action) return "System Activity";
    
    // Exact matches
    const exactMappings: Record<string, string> = {
      "LOGIN": "Account login detected",
      "LOGOUT": "Account logout",
      "CREATE_TENANT": "New tenant registration",
      "UPDATE_TENANT": "Tenant configuration updated",
      "DELETE_TENANT": "Tenant account removed",
    };
    
    if (exactMappings[action]) return exactMappings[action];
    
    // Path matches
    if (action.includes("/api/v1/auth/refresh")) return "Session security check";
    if (action.includes("/api/v1/consent-templates")) return "Consent template activity";
    if (action.includes("/api/v1/rights-requests")) return "New data rights request";
    if (action.includes("/api/v1/grievances")) return "Grievance module activity";
    if (action.includes("/api/v1/reports")) return "System report generated";
    if (action.includes("/api/v1/logs")) return "Log export activity";
    if (action.includes("/api/v1/settings")) return "System settings modified";
    
    // Clean up generic API strings
    if (action.startsWith("/api/")) {
      return action.split("/").pop()?.replace(/-/g, " ") || action;
    }
    
    return action;
  };

  const handleNotificationClick = (item: any) => {
    const action = item.action || "";
    
    if (action.includes("/api/v1/consent-templates")) {
      navigate("/consent/management");
    } else if (action.includes("/api/v1/rights-requests")) {
      navigate("/consent/rights");
    } else if (action.includes("/api/v1/grievances")) {
      navigate("/consent/grievances");
    } else if (action.includes("/api/v1/reports")) {
      navigate("/reports");
    } else if (action.includes("auth") || action === "LOGIN" || action === "LOGOUT") {
      navigate("/security");
    } else {
      navigate("/logs");
    }
  };

  return (
    <main
      className={cn(
        "transition-all duration-300 min-h-screen flex flex-col",
        "ml-0", // Mobile: no margin (sidebar hidden)
        sidebarCollapsed ? "lg:ml-16" : "lg:ml-64" // Desktop: dynamic margin
      )}
    >
      {/*Enhanced Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="flex items-center justify-between min-h-16 h-auto px-3 sm:px-6 py-2 sm:py-0">
          <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
            {/* Mobile Menu */}
            <div className="lg:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-72 bg-sidebar text-sidebar-foreground border-sidebar-border">
                  <SheetHeader className="sr-only">
                    <SheetTitle>Navigation Menu</SheetTitle>
                  </SheetHeader>
                  <SidebarContent onNavItemClick={() => setIsMobileMenuOpen(false)} />
                </SheetContent>
              </Sheet>
            </div>

            <div className="min-w-0">
              <h1 className="text-xl font-semibold text-foreground truncate">{title}</h1>
            </div>
          </div>

          {/* Search Bar - Hidden on small mobile */}
          <div className="hidden lg:flex items-center w-80 mr-2">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-10 h-9 bg-muted/50 border-2 border-border/60 focus-visible:ring-1"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Mobile Search Button */}
            <div className="lg:hidden">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <div className="hidden sm:flex">
              {showCustomizer && <DashboardCustomizer />}
            </div>

            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="hidden sm:flex gap-1 px-2">
                  <Globe className="h-4 w-4" />
                  <span className="text-sm font-medium">EN</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <span className="mr-2">🇺🇸</span> English (US)
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span className="mr-2">🇪🇸</span> Español
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span className="mr-2">🇫🇷</span> Français
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span className="mr-2">🇩🇪</span> Deutsch
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-9 w-9">
                  <Bell className="h-4 w-4" />
                  {notifications.length > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-destructive animate-pulse">
                      {notifications.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="p-3 border-b border-border flex items-center justify-between">
                  <span className="font-semibold text-sm">Notifications</span>
                  <Badge variant="secondary" className="text-xs">{notifications.length} Unread</Badge>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {loadingNotifications ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
                  ) : notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">No new notifications</div>
                  ) : (
                    notifications.map((item) => (
                      <DropdownMenuItem 
                        key={item.id} 
                        className="flex flex-col items-start gap-1 p-3 border-b border-border/50 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleNotificationClick(item)}
                      >
                        <div className="flex items-center gap-2 w-full">
                           <span className={cn(
                             "h-2 w-2 rounded-full shrink-0", 
                             item.severity === 'CRITICAL' ? "bg-destructive" : 
                             item.severity === 'WARNING' ? "bg-warning" : "bg-blue-500"
                           )} />
                           <span className="font-medium text-xs truncate flex-1">
                             {getFriendlyActionTitle(item.action)}
                           </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate w-full pl-4">
                          {item.user?.email || "System"}
                        </p>
                        <div className="flex items-center justify-between w-full pl-4 mt-0.5">
                          <span className="text-[10px] text-muted-foreground">
                            {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                          </span>
                          <span className="text-[9px] font-medium text-primary uppercase">Click to view</span>
                        </div>
                      </DropdownMenuItem>
                    ))
                  )}
                </div>
                <div className="p-2 text-center border-t border-border">
                  <Button variant="ghost" size="sm" className="text-xs w-full h-8" onClick={() => navigate("/logs")}>View All Notifications</Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="hidden sm:block">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => navigate("/help")}>
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Help</TooltipContent>
              </Tooltip>
            </div>

            <div className="hidden sm:block">
              <ThemeToggle />
            </div>

            {/* Page Specific Actions */}
            <div className="flex ml-1 sm:ml-2">
              {actions}
            </div>

            {/* User Profile (Always Last) */}
            {showUserProfile && (
              <div className="ml-1">
                <UserProfile />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-6 animate-fade-in flex-grow">
        {children}
      </div>
      <Footer />
    </main>
  );
}

export function PageSection({
  children,
  className
}: {
  children: ReactNode;
  className?: string
}) {
  return (
    <section className={cn("space-y-4", className)}>
      {children}
    </section>
  );
}

export function SectionTitle({
  children,
  action,
  description,
  className
}: {
  children: ReactNode;
  action?: ReactNode;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div>
        <h2 className="text-lg font-semibold text-foreground">{children}</h2>
        {description && (
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
export function WidgetGrid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", className)}>
      {children}
    </div>
  );
}
