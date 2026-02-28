import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type UserRole = "admin" | "dpo" | "data_principal" | string;

export interface WidgetConfig {
  id: string;
  type: string;
  title: string;
  enabled: boolean;
  order: number;
  size: "small" | "medium" | "large" | "full";
  roles: UserRole[];
}

export interface DashboardConfig {
  role: UserRole;
  widgets: WidgetConfig[];
  theme: "light" | "dark" | "system";
  compactMode: boolean;
  sidebarCollapsed: boolean;
}

// Default widget configurations for each role
const mainWidgets: Record<UserRole, WidgetConfig[]> = {
  admin: [
    { id: "kpi-consents", type: "kpi", title: "Total Active Consents", enabled: true, order: 0, size: "small", roles: ["admin", "dpo"] },
    { id: "kpi-expired", type: "kpi", title: "Expired & Withdrawn", enabled: true, order: 1, size: "small", roles: ["admin", "dpo"] },
    { id: "kpi-rights", type: "kpi", title: "Pending Rights Requests", enabled: true, order: 2, size: "small", roles: ["admin", "dpo"] },
    { id: "kpi-grievances", type: "kpi", title: "Open Grievances", enabled: true, order: 3, size: "small", roles: ["admin", "dpo"] },
    { id: "kpi-sla", type: "kpi", title: "SLA Breaches", enabled: true, order: 4, size: "small", roles: ["admin"] },
    { id: "kpi-risk", type: "kpi", title: "Risk Exposure", enabled: true, order: 5, size: "small", roles: ["admin"] },
    { id: "chart-donut", type: "chart", title: "Consent Status Distribution", enabled: true, order: 6, size: "medium", roles: ["admin", "dpo"] },
    { id: "chart-trend", type: "chart", title: "Consent Trends", enabled: true, order: 7, size: "large", roles: ["admin", "dpo"] },
    { id: "compliance-score", type: "compliance", title: "Compliance Health", enabled: true, order: 8, size: "medium", roles: ["admin", "dpo"] },
    { id: "quick-actions", type: "actions", title: "Quick Actions", enabled: true, order: 9, size: "medium", roles: ["admin", "dpo"] },
    { id: "recent-activity", type: "activity", title: "Recent Activity", enabled: true, order: 10, size: "medium", roles: ["admin", "dpo"] },
    { id: "alerts", type: "alerts", title: "Alerts & Notifications", enabled: true, order: 11, size: "full", roles: ["admin"] },
    { id: "kpi-users", type: "kpi", title: "Total Users", enabled: true, order: 12, size: "small", roles: ["admin"] },
    { id: "kpi-roles", type: "kpi", title: "User Roles", enabled: true, order: 13, size: "small", roles: ["admin"] },
  ],
  dpo: [
    { id: "kpi-consents", type: "kpi", title: "Total Active Consents", enabled: true, order: 0, size: "small", roles: ["admin", "dpo"] },
    { id: "kpi-rights", type: "kpi", title: "Pending Rights Requests", enabled: true, order: 1, size: "small", roles: ["admin", "dpo"] },
    { id: "kpi-grievances", type: "kpi", title: "Open Grievances", enabled: true, order: 2, size: "small", roles: ["admin", "dpo"] },
    { id: "kpi-compliance", type: "kpi", title: "Compliance Score", enabled: true, order: 3, size: "small", roles: ["dpo"] },
    { id: "chart-donut", type: "chart", title: "Consent Status Distribution", enabled: true, order: 4, size: "medium", roles: ["admin", "dpo"] },
    { id: "chart-rights", type: "chart", title: "Rights Requests Overview", enabled: true, order: 5, size: "medium", roles: ["dpo"] },
    { id: "compliance-score", type: "compliance", title: "Compliance Health", enabled: true, order: 6, size: "medium", roles: ["admin", "dpo"] },
    { id: "quick-actions", type: "actions", title: "Quick Actions", enabled: true, order: 7, size: "medium", roles: ["admin", "dpo"] },
    { id: "recent-activity", type: "activity", title: "Recent Activity", enabled: true, order: 8, size: "medium", roles: ["admin", "dpo"] },
  ],
  data_principal: [
    { id: "kpi-my-consents", type: "kpi", title: "My Active Consents", enabled: true, order: 0, size: "small", roles: ["data_principal"] },
    { id: "kpi-my-requests", type: "kpi", title: "My Pending Requests", enabled: true, order: 1, size: "small", roles: ["data_principal"] },
    { id: "kpi-my-grievances", type: "kpi", title: "My Grievances", enabled: true, order: 2, size: "small", roles: ["data_principal"] },
    { id: "chart-my-consents", type: "chart", title: "My Consents by Purpose", enabled: true, order: 3, size: "large", roles: ["data_principal"] },
    { id: "quick-actions-dp", type: "actions", title: "Quick Actions", enabled: true, order: 4, size: "medium", roles: ["data_principal"] },
    { id: "my-activity", type: "activity", title: "My Activity", enabled: true, order: 5, size: "medium", roles: ["data_principal"] },
  ],
};

const analyticsWidgets: WidgetConfig[] = [
  { id: "ca-kpi-active", type: "kpi", title: "Total Active", enabled: true, order: 0, size: "small", roles: ["admin", "dpo"] },
  { id: "ca-kpi-rejected", type: "kpi", title: "Total Rejected", enabled: true, order: 1, size: "small", roles: ["admin", "dpo"] },
  { id: "ca-kpi-withdrawn", type: "kpi", title: "Total Withdrawn", enabled: true, order: 2, size: "small", roles: ["admin", "dpo"] },
  { id: "ca-kpi-rate", type: "kpi", title: "Acceptance Rate", enabled: true, order: 3, size: "small", roles: ["admin", "dpo"] },
  { id: "ca-chart-trend", type: "chart", title: "Consent Trend Over Time", enabled: true, order: 4, size: "medium", roles: ["admin", "dpo"] },
  { id: "ca-chart-type", type: "chart", title: "Consent by Type", enabled: true, order: 5, size: "medium", roles: ["admin", "dpo"] },
  { id: "ca-list-reconsent", type: "list", title: "Re-consent Success Rate", enabled: true, order: 6, size: "large", roles: ["admin", "dpo"] },
  { id: "ca-list-fatigue", type: "list", title: "Consent Fatigue Indicators", enabled: true, order: 7, size: "large", roles: ["admin", "dpo"] },
  { id: "ca-chart-withdrawal", type: "chart", title: "Withdrawal Trend Analysis", enabled: true, order: 8, size: "large", roles: ["admin", "dpo"] },
];

const defaultWidgets: Record<UserRole, Record<string, WidgetConfig[]>> = {
  admin: {
    main: mainWidgets.admin,
    analytics: analyticsWidgets,
  },
  dpo: {
    main: mainWidgets.dpo,
    analytics: analyticsWidgets,
  },
  data_principal: {
    main: mainWidgets.data_principal,
    analytics: [], // No access
  },
};

const roleLabels: Record<UserRole, string> = {
  admin: "Administrator",
  dpo: "Data Protection Officer",
  data_principal: "Data Principal",
};

interface DashboardContextType {
  config: DashboardConfig;
  currentView: string;
  setView: (view: string) => void;
  setRole: (role: UserRole) => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
  toggleWidget: (widgetId: string) => void;
  reorderWidgets: (widgets: WidgetConfig[]) => void;
  resetToDefault: () => void;
  isCustomizing: boolean;
  setIsCustomizing: (value: boolean) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (value: boolean) => void;
  roleLabels: Record<string, string>;
  addRole: (name: string, description: string, baseRole: UserRole) => void;
  availableRoles: string[];
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

const STORAGE_KEY = "cms_dashboard_config_v2"; // Changed version to reset

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole>("admin");
  const [theme, setThemeState] = useState<"light" | "dark" | "system">("light");
  const [compactMode, setCompactMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsedState] = useState(false);
  const [currentView, setCurrentView] = useState("main");

  // Stores mapping of View -> WidgetConfig[]
  const [viewConfigs, setViewConfigs] = useState<Record<string, WidgetConfig[]>>(() => {
    // Initial Load or Default
    return defaultWidgets["admin"];
  });

  // State for dynamic role configurations
  const [roleConfigs, setRoleConfigs] = useState<Record<string, Record<string, WidgetConfig[]>>>(defaultWidgets);
  const [customRoleLabels, setCustomRoleLabels] = useState<Record<string, string>>({});

  // Helper to merge default and custom roles for labels
  const currentRoleLabels = { ...roleLabels, ...customRoleLabels };

  // Load from local storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setRoleState(parsed.role || "admin");
          setThemeState(parsed.theme || "light");
          setSidebarCollapsedState(parsed.sidebarCollapsed || false);

          // Load custom roles if any
          if (parsed.customRoles) {
            setRoleConfigs(prev => ({ ...prev, ...parsed.customRoles }));
          }
          if (parsed.customLabels) {
            setCustomRoleLabels(parsed.customLabels);
          }

          // Load stored configs if valid, else default
          if (parsed.viewConfigs) {
            setViewConfigs(parsed.viewConfigs);
          } else {
            // Check if role exists in dynamic configs, else fallback to admin
            const targetConfig = parsed.customRoles?.[parsed.role] || defaultWidgets[parsed.role] || defaultWidgets["admin"];
            setViewConfigs(targetConfig);
          }
        } catch { }
      } else {
        setViewConfigs(defaultWidgets["admin"]);
      }
    }
  }, []);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      role,
      theme,
      sidebarCollapsed,
      viewConfigs,
      customRoles: roleConfigs, // Persist all roles including new ones
      customLabels: customRoleLabels
    }));
  }, [role, theme, sidebarCollapsed, viewConfigs, roleConfigs, customRoleLabels]);

  const [isCustomizing, setIsCustomizing] = useState(false);

  const setSidebarCollapsed = (collapsed: boolean) => {
    setSidebarCollapsedState(collapsed);
  };

  const setTheme = (t: "light" | "dark" | "system") => {
    setThemeState(t);
  };

  const setRole = (r: UserRole) => {
    setRoleState(r);
    // Reset configs to defaults for that role (from dynamic storage)
    const newConfig = roleConfigs[r] || defaultWidgets["admin"]; // Fallback safety
    setViewConfigs(newConfig);
    setCurrentView("main");
  };

  const addRole = (name: string, description: string, baseRole: UserRole) => {
    const roleId = name.toLowerCase().replace(/\s+/g, "_");

    // Copy configuration from base role
    const baseConfig = roleConfigs[baseRole] || defaultWidgets["admin"];

    setRoleConfigs(prev => ({
      ...prev,
      [roleId]: baseConfig
    }));

    setCustomRoleLabels(prev => ({
      ...prev,
      [roleId]: name
    }));
  };

  const setView = (view: string) => {
    setCurrentView(view);
    // Ensure we have configs for this view, if not copy default or empty
    setViewConfigs(prev => {
      if (prev[view]) return prev;
      // If no config for this view exists yet, fetch from default or empty
      // If no config for this view exists yet, fetch from dynamic config
      const def = roleConfigs[role]?.[view] || [];
      return { ...prev, [view]: def };
    });
  };

  const toggleWidget = (widgetId: string) => {
    setViewConfigs((prev) => ({
      ...prev,
      [currentView]: prev[currentView].map((w) =>
        w.id === widgetId ? { ...w, enabled: !w.enabled } : w
      ),
    }));
  };

  const reorderWidgets = (widgets: WidgetConfig[]) => {
    setViewConfigs((prev) => ({
      ...prev,
      [currentView]: widgets,
    }));
  };

  const resetToDefault = () => {
    setViewConfigs((prev) => ({
      ...prev,
      [currentView]: roleConfigs[role]?.[currentView] || [],
    }));
  };

  // apply theme to DOM
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  // Construct legacy-compatible config object for consumers
  const config: DashboardConfig = {
    role,
    theme,
    compactMode,
    sidebarCollapsed,
    widgets: viewConfigs[currentView] || [],
  };

  return (
    <DashboardContext.Provider
      value={{
        config,
        currentView,
        setView,
        setRole,
        setTheme,
        toggleWidget,
        reorderWidgets,
        resetToDefault,
        isCustomizing,
        setIsCustomizing,
        sidebarCollapsed,
        setSidebarCollapsed,

        roleLabels: currentRoleLabels,
        addRole,
        availableRoles: Object.keys(roleConfigs),
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}
