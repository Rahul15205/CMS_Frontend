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
import { Settings, LogOut, User, Building2, Clock, Activity, Shield, Key } from "lucide-react";
import { useDashboard } from "@/contexts/DashboardContext";
import { useNavigate } from "react-router-dom";
import { badgeVariants } from "@/components/ui/badge";

export function UserProfile() {
    const { config, roleLabels } = useDashboard();
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate("/logout");
    };

    const handleSettings = () => {
        navigate("/settings");
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-9 w-9 border border-border">
                        <AvatarImage src="/avatars/01.png" alt="User" />
                        <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                            {config.role.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 p-0" align="end" forceMount>
                <div className="p-4 bg-muted/30 border-b">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 border-2 border-primary/20">
                            <AvatarImage src="/avatars/01.png" alt="User" />
                            <AvatarFallback className="bg-primary text-primary-foreground text-lg font-medium">
                                {config.role.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col space-y-1">
                            <p className="font-semibold leading-none">Sarah Johnson</p>
                            <p className="text-xs text-muted-foreground">sarah.johnson@example.com</p>
                            <div className={`text-[10px] px-2 py-0.5 rounded-full w-fit mt-1 bg-muted text-muted-foreground border border-border font-medium`}>
                                {roleLabels[config.role]}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-b">
                    <div className="flex items-center gap-2 text-sm text-foreground mb-3 font-medium">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        Acme Corporation
                    </div>

                    <div className="space-y-2 mt-4">
                        <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="h-3.5 w-3.5" />
                                Last Login
                            </div>
                            <span className="font-medium">2024-01-22 09:30</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Activity className="h-3.5 w-3.5" />
                                Session Expires
                            </div>
                            <span className="font-medium">4 hours</span>
                        </div>
                    </div>
                </div>

                <div className="p-2">
                    <DropdownMenuItem onClick={handleSettings} className="cursor-pointer py-2.5">
                        <User className="mr-2 h-4 w-4 text-muted-foreground" />
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
        </DropdownMenu>
    );
}
