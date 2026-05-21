import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardProvider } from "@/contexts/DashboardContext";
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

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
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
                  <Route path="/" element={<ProtectedRoute permissionKey="DASHBOARD"><Dashboard /></ProtectedRoute>} />
                  <Route path="/consent" element={<ProtectedRoute permissionKey="CONSENT_MANAGEMENT"><ConsentManagement /></ProtectedRoute>} />
                  <Route path="/rights" element={<ProtectedRoute permissionKey="RIGHTS_MANAGEMENT"><RightsManagement /></ProtectedRoute>} />
                  <Route path="/grievances" element={<ProtectedRoute permissionKey="GRIEVANCES"><Grievances /></ProtectedRoute>} />
                  <Route path="/cookies" element={<ProtectedRoute permissionKey="COOKIES_MANAGEMENT"><CookiesManagement /></ProtectedRoute>} />
                  <Route path="/notices" element={<ProtectedRoute permissionKey="NOTICES"><Notices /></ProtectedRoute>} />
                  <Route path="/configurations" element={<ProtectedRoute permissionKey="CONFIGURATIONS"><Configurations /></ProtectedRoute>} />
                  <Route path="/integrations" element={<ProtectedRoute permissionKey="INTEGRATIONS"><Integrations /></ProtectedRoute>} />
                  <Route path="/security" element={<ProtectedRoute permissionKey="SECURITY"><Security /></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute permissionKey="SETTINGS"><SettingsPage /></ProtectedRoute>} />
                  <Route path="/users" element={<ProtectedRoute permissionKey="USER_SETUP"><UserSetup /></ProtectedRoute>} />
                  <Route path="/reports" element={<ProtectedRoute permissionKey="REPORTS"><Reports /></ProtectedRoute>} />
                  <Route path="/logs" element={<ProtectedRoute permissionKey="LOGS"><Logs /></ProtectedRoute>} />
                  <Route path="/help" element={<Help />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </SimpleAuth>
          </BrowserRouter>
        </DashboardProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
