import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardProvider } from "@/contexts/DashboardContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
// Pages
import Dashboard from "./pages/Dashboard";
import ConsentManagement from "./pages/ConsentManagement";
import RightsManagement from "./pages/RightsManagement";
import Grievances from "./pages/Grievances";
import CookiesManagement from "./pages/CookiesManagement";
import Notices from "./pages/Notices";
import Configurations from "./pages/Configurations";
import Integrations from "./pages/Integrations";
import Security from "./pages/Security";
import SettingsPage from "./pages/SettingsPage";
import UserSetup from "./pages/UserSetup";
import Reports from "./pages/Reports";
import Logs from "./pages/Logs";
import Logout from "./pages/Logout";
import NotFound from "./pages/NotFound";
import SimpleAuth from "@/components/auth/SimpleAuth";
import { AuthProvider } from "@/contexts/AuthContext";
import Help from "./pages/Help";
import { MainLayout } from "@/components/layout/MainLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <ThemeProvider>
          <DashboardProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <SimpleAuth>
              <Routes>
                {/* Public Routes (if any) can go here without MainLayout */}
                <Route path="/logout" element={<Logout />} />

                {/* Protected Routes wrapped in MainLayout */}
                <Route element={<MainLayout />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/consent" element={<ConsentManagement />} />
                  <Route path="/rights" element={<RightsManagement />} />
                  <Route path="/grievances" element={<Grievances />} />
                  <Route path="/cookies" element={<CookiesManagement />} />
                  <Route path="/notices" element={<Notices />} />
                  <Route path="/configurations" element={<Configurations />} />
                  <Route path="/integrations" element={<Integrations />} />
                  <Route path="/security" element={<Security />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/users" element={<UserSetup />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/logs" element={<Logs />} />
                  <Route path="/help" element={<Help />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </SimpleAuth>
          </BrowserRouter>
        </DashboardProvider>
      </ThemeProvider>
    </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
