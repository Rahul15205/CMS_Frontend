
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileCheck,
  Scale,
  MessageSquareWarning,
  Cookie,
  FileText,
  Settings2,
  Plug,
  Shield,
  Settings,
  Users,
  BarChart3,
  ScrollText,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useDashboard } from "@/contexts/DashboardContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavItem {
  title: string;
  icon: React.ElementType;
  path: string;
  group: "main" | "operations" | "system" | "admin";
  permissionKey?: string;
}

const navItems: NavItem[] = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/", group: "main", permissionKey: "DASHBOARD" },
  { title: "Consent Management", icon: FileCheck, path: "/consent", group: "main", permissionKey: "CONSENT_MANAGEMENT" },
  { title: "Rights Management", icon: Scale, path: "/rights", group: "main", permissionKey: "RIGHTS_MANAGEMENT" },
  { title: "Grievances", icon: MessageSquareWarning, path: "/grievances", group: "main", permissionKey: "GRIEVANCES" },
  { title: "Cookies Management", icon: Cookie, path: "/cookies", group: "operations", permissionKey: "COOKIES_MANAGEMENT" },
  { title: "Notices", icon: FileText, path: "/notices", group: "operations", permissionKey: "NOTICES" },
  { title: "Configurations", icon: Settings2, path: "/configurations", group: "system", permissionKey: "CONFIGURATIONS" },
  { title: "Integrations", icon: Plug, path: "/integrations", group: "system", permissionKey: "INTEGRATIONS" },
  { title: "Security", icon: Shield, path: "/security", group: "system", permissionKey: "SECURITY" },
  { title: "Settings", icon: Settings, path: "/settings", group: "admin", permissionKey: "SETTINGS" },
  { title: "User Setup", icon: Users, path: "/users", group: "admin", permissionKey: "USER_SETUP" },
  { title: "Reports", icon: BarChart3, path: "/reports", group: "admin", permissionKey: "REPORTS" },
  { title: "Logs", icon: ScrollText, path: "/logs", group: "admin", permissionKey: "LOGS" },
];

const groupLabels: Record<string, string> = {
  main: "Core",
  operations: "Operations",
  system: "System",
  admin: "Administration",
  account: "Account"
};


function NavItemComponent({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const location = useLocation();
  const isActive = location.pathname === item.path;

  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <NavLink
          to={item.path}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
            isActive
              ? "bg-white/20 text-white shadow-sm"
              : "text-white/70 hover:bg-white/10 hover:text-white",
            collapsed && "justify-center px-2"
          )}
        >
          <item.icon className={cn(
            "flex-shrink-0 transition-all duration-200",
            collapsed ? "h-6 w-6" : "h-4 w-4",
            isActive ? "text-[#1dd05e]" : "text-white/70"
          )} />
          {!collapsed && <span>{item.title}</span>}
        </NavLink>
      </TooltipTrigger>
      {collapsed && (
        <TooltipContent side="right" className="font-medium">
          {item.title}
        </TooltipContent>
      )}
    </Tooltip>
  );
}

export function SidebarContent({ collapsed, onNavItemClick }: { collapsed?: boolean, onNavItemClick?: () => void }) {
  const { canAccess, user, currentRole, logout } = useAuth();
  const groupOrder = ["main", "operations", "system", "admin"];

  // Filter items based on permissions
  const visibleItems = navItems.filter(item => {
    if (!item.permissionKey) return true;
    return canAccess(item.permissionKey, 'view');
  });

  const groupedItems = visibleItems.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {} as Record<string, NavItem[]>);

  return (
    <div className="flex flex-col h-full">
      {/* Logo Section */}
      <div className={cn(
        "flex items-center h-16 px-4 border-b border-white/10",
        collapsed ? "justify-center" : "justify-start"
      )}>
        {!collapsed && (
          <img
            src="https://res.cloudinary.com/dlfzzfdx0/image/upload/v1777286182/Brand_title_with_tagline-removebg-preview_jpjpet.png"
            alt="Proteccio"
            className="h-10 w-auto object-contain"
          />
        )}
        {collapsed && (
          <div className="h-10 w-10 flex items-center justify-center">
            <img
              src="/proteccio_logo_new-removebg-preview1.png"
              alt="Proteccio"
              className="h-8 w-8 object-contain"
            />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col overflow-y-auto py-4 px-2 scrollbar-thin overflow-x-hidden">
        {groupOrder.map((group, index) => {
          const items = groupedItems[group];
          if (!items || items.length === 0) return null;

          return (
            <div key={group} className="space-y-1 mb-4">
              {!collapsed && (
                <span className="sidebar-group-label block mb-2 px-3 text-[10px] items-center text-white/50 uppercase tracking-wider font-semibold">{groupLabels[group]}</span>
              )}
              {collapsed && index > 0 && (
                <Separator className="my-2 bg-white/10 hidden" />
              )}
              <div className="space-y-1">
                {items.map((item) => (
                  <div key={item.path} onClick={onNavItemClick}>
                    <NavItemComponent item={item} collapsed={!!collapsed} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      {/* User & Logout Footer */}
      <div className="border-t border-white/10 p-2">
        {user && !collapsed && (
          <div className="px-3 py-2 mb-2 flex items-center gap-3 bg-white/5 rounded-lg border border-white/5 shadow-sm">
            <div className="h-8 w-8 rounded-full bg-[#1dd05e]/20 flex items-center justify-center text-[#1dd05e] font-bold border border-[#1dd05e]/30 flex-shrink-0">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-medium text-white text-sm truncate" title={user.username}>
                {user.username}
              </span>
              <span className="text-[10px] text-white/50 uppercase tracking-widest truncate">
                {currentRole?.name}
              </span>
            </div>
          </div>
        )}
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              onClick={() => {
                logout();
                if (onNavItemClick) onNavItemClick();
              }}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 justify-start",
                "hover:bg-white/10 text-white/70 hover:text-white",
                collapsed && "justify-center px-0"
              )}
            >
              <LogOut className="h-4 w-4 flex-shrink-0" />
              {!collapsed && <span>Logout</span>}
            </Button>
          </TooltipTrigger>
          {collapsed && (
            <TooltipContent side="right" className="font-medium">
              Logout
            </TooltipContent>
          )}
        </Tooltip>
      </div>
    </div>
  );
}

export function AppSidebar() {
  const { sidebarCollapsed: collapsed, setSidebarCollapsed: setCollapsed } = useDashboard();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-gradient-to-b from-[#0a331b] to-[#010b05] border-r border-white/10 transition-all duration-300 flex flex-col shadow-xl",
        collapsed ? "w-16" : "w-64",
        "hidden lg:flex" // Hide on small screens to prevent overlap
      )}
    >
      <SidebarContent collapsed={collapsed} />

      {/* Collapse Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          "absolute -right-3 top-20 h-6 w-6 rounded-full border border-border bg-background shadow-sm",
          "hover:bg-accent"
        )}
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </Button>
    </aside>
  );
}
