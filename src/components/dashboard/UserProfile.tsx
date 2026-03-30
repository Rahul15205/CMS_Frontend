import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Settings, LogOut, User as UserIcon, Building2, Clock, Activity, Shield, Key, ShieldCheck } from "lucide-react";
import { useDashboard } from "@/contexts/DashboardContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { AadhaarVerificationModal } from "./AadhaarVerificationModal";
import { useState } from "react";

export function UserProfile() {
    const { config, roleLabels } = useDashboard();
    const { user, currentRole, logout } = useAuth();
    const navigate = useNavigate();
    const [isAadhaarModalOpen, setIsAadhaarModalOpen] = useState(false);
 
    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const getUserInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const displayName = user?.name || user?.username || "User";
    const userRole = currentRole?.name || roleLabels[config.role] || "Member";
    const userEmail = user?.username?.includes("@") ? user.username : `${user?.username || "user"}@proteccio.ai`;
    const lastLogin = user?.lastLogin 
        ? new Date(user.lastLogin).toLocaleString('en-IN', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit', 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          }).replace(/\//g, '-')
        : "N/A";
    const tenantName = user?.tenantName || "Proteccio AI";

    const handleSettings = () => {
        navigate("/settings");
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-9 w-9 border border-border">
                        <AvatarImage src="" alt={displayName} />
                        <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                            {getUserInitials(displayName)}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 p-0" align="end" forceMount>
                <div className="p-4 bg-muted/30 border-b">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 border-2 border-primary/20">
                            <AvatarImage src="" alt={displayName} />
                            <AvatarFallback className="bg-primary text-primary-foreground text-lg font-medium">
                                {getUserInitials(displayName)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col space-y-1">
                            <div className="flex items-center gap-2">
                                <p className="font-semibold leading-none">{displayName}</p>
                                {user?.aadhaarVerified && (
                                    <div className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0.5 rounded-sm font-bold flex items-center gap-0.5">
                                        <ShieldCheck className="h-2.5 w-2.5" />
                                        VERIFIED
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">{userEmail}</p>
                            <div className={`text-[10px] px-2 py-0.5 rounded-full w-fit mt-1 bg-muted text-muted-foreground border border-border font-medium`}>
                                {userRole}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-b">
                    {!user?.aadhaarVerified && (
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full mb-4 border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary h-8 text-xs font-semibold gap-2"
                            onClick={() => setIsAadhaarModalOpen(true)}
                        >
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Verify Aadhaar Identity
                        </Button>
                    )}
                    <div className="flex items-center gap-2 text-sm text-foreground mb-3 font-medium">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        {tenantName}
                    </div>

                    <div className="space-y-2 mt-4">
                        <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="h-3.5 w-3.5" />
                                Last Login
                            </div>
                            <span className="font-medium">{lastLogin}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Activity className="h-3.5 w-3.5" />
                                Session Status
                            </div>
                            <span className="text-success font-bold uppercase tracking-tighter text-[10px]">Active</span>
                        </div>
                    </div>
                </div>

                <div className="p-2">
                    <DropdownMenuItem onClick={handleSettings} className="cursor-pointer py-2.5">
                        <UserIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>My Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSettings} className="cursor-pointer py-2.5">
                        <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>Account Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSettings} className="cursor-pointer py-2.5">
                        <Shield className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>Security & Privacy</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSettings} className="cursor-pointer py-2.5">
                        <Key className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>API Keys</span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="my-2" />

                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer py-2.5 text-destructive focus:text-destructive focus:bg-destructive/10">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sign Out</span>
                    </DropdownMenuItem>
                </div>
            </DropdownMenuContent>

            <AadhaarVerificationModal 
                isOpen={isAadhaarModalOpen} 
                onClose={() => setIsAadhaarModalOpen(false)}
                onSuccess={() => {
                    // Refresh profile via authContext if needed, 
                    // though the user will likely see the change on next refresh 
                    // or if we update the user object locally.
                }}
            />
        </DropdownMenu>
    );
}
