import { ReactNode, useState } from "react";
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

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;

  actions?: ReactNode;
  showCustomizer?: boolean;
  showUserProfile?: boolean;
}

export function DashboardLayout({
  children,
  title,

  actions,
  showCustomizer = true,
  showUserProfile = true,
}: DashboardLayoutProps) {
  const { sidebarCollapsed } = useDashboard();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
                placeholder="Search consents, requests, users..."
                className="pl-10 h-9 bg-muted/50 border-2 border-border/60 focus-visible:ring-1"
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

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-9 w-9">
                  <Bell className="h-4 w-4" />
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-destructive">
                    3
                  </Badge>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Notifications</TooltipContent>
            </Tooltip>

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
