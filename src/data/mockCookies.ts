
export const mockCookieCategories = [
  {
    id: "necessary",
    name: "Strictly Necessary",
    description: "Essential cookies required for the website to function properly. These cannot be disabled.",
    icon: "Shield",
    count: 8,
    enabled: true,
    locked: true,
  },
  {
    id: "analytics",
    name: "Analytics & Performance",
    description: "Cookies that help us understand how visitors interact with our website.",
    icon: "BarChart3",
    count: 12,
    enabled: true,
    locked: false,
  },
  {
    id: "functional",
    name: "Functional",
    description: "Cookies that enable personalized features and enhanced functionality.",
    icon: "Settings",
    count: 6,
    enabled: true,
    locked: false,
  },
  {
    id: "marketing",
    name: "Marketing & Advertising",
    description: "Cookies used to deliver relevant advertisements and track campaign effectiveness.",
    icon: "Target",
    count: 15,
    enabled: false,
    locked: false,
  },
];

export const mockCookieInventory = [
  { id: "1", name: "session_id", domain: ".example.com", category: "necessary", expiration: "Session", description: "Maintains user session state" },
  { id: "2", name: "_ga", domain: ".example.com", category: "analytics", expiration: "2 years", description: "Google Analytics unique user ID" },
  { id: "3", name: "theme_pref", domain: ".example.com", category: "functional", expiration: "1 year", description: "Stores user theme preference" },
  { id: "4", name: "ads_uuid", domain: ".ad-network.com", category: "marketing", expiration: "30 days", description: "Ad tracking identifier" },
  { id: "5", name: "cart_items", domain: ".example.com", category: "necessary", expiration: "Session", description: "Stores temporary cart data" },
];

export const mockWebsites = [
  { id: "1", name: "Main Corporate Site", url: "https://example.com", frequency: "weekly", lastScan: "2024-03-20", status: "Active", depth: "standard", email: "admin@example.com", autoCategorize: true, scanBehindLogin: false },
  { id: "2", name: "E-commerce Store", url: "https://shop.example.com", frequency: "daily", lastScan: "2024-03-21", status: "Active", depth: "deep", email: "shop@example.com", autoCategorize: true, scanBehindLogin: true },
];

export const mockConsentLogs = [
  { id: "1", userId: "USR-001", date: "2024-03-22 10:30 AM", region: "India", categories: ["Necessary", "Analytics"], status: "Active" },
  { id: "2", userId: "USR-002", date: "2024-03-22 11:15 AM", region: "Europe (GDPR)", categories: ["Necessary", "Marketing", "Functional"], status: "Active" },
  { id: "3", userId: "USR-003", date: "2024-03-21 04:45 PM", region: "USA", categories: ["Necessary"], status: "Withdrawn" },
];

export const mockBanners = [
  { id: "1", name: "Default GDPR Banner", lastModified: "2 days ago", status: "Active", theme: "bg-primary" },
  { id: "2", name: "Dark Mode Variant", lastModified: "1 week ago", status: "Draft", theme: "bg-zinc-900" },
  { id: "3", name: "Marketing Campaign", lastModified: "3 weeks ago", status: "Inactive", theme: "bg-blue-600" },
];

export const mockCookieComplianceMetrics = {
  totalCookies: 41,
  categories: 4,
  activeConsents: 1234,
  optOutRate: 4.2,
  distribution: [
    { name: "Necessary", value: 100, color: "hsl(142, 76%, 36%)" },
    { name: "Analytics", value: 72, color: "hsl(217, 91%, 50%)" },
    { name: "Marketing", value: 45, color: "hsl(262, 83%, 58%)" },
    { name: "Functional", value: 68, color: "hsl(199, 89%, 48%)" },
  ]
};
