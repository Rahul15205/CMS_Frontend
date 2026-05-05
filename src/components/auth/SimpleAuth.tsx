import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { 
    Lock, 
    Shield, 
    Loader2, 
    Mail, 
    CheckCircle2, 
    Zap, 
    Database, 
    Activity, 
    ChevronRight,
    MapPin
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface SimpleAuthProps {
    children: React.ReactNode;
}

const SimpleAuth: React.FC<SimpleAuthProps> = ({ children }) => {
    const { isAuthenticated, isLoading: authLoading, login, roles } = useAuth();
    const [submitting, setSubmitting] = useState(false);
    const [inputUsername, setInputUsername] = useState("");
    const [inputPassword, setInputPassword] = useState("");
    const [selectedRoleId, setSelectedRoleId] = useState("");

    useEffect(() => {
        // Set default role if available and not set
        if (!selectedRoleId && roles.length > 0) {
            const activeRoles = roles.filter(r => r.status === 'active');
            if (activeRoles.length > 0) {
                setSelectedRoleId(activeRoles[0].id);
            }
        }
    }, [roles, selectedRoleId]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await login(inputUsername, inputPassword, selectedRoleId);
            toast.success("Authentication successful");
        } catch {
            // Error toast is handled by the auth service / context
        } finally {
            setSubmitting(false);
        }
    };

    // Show loading while auth state is being restored
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f5f7f5]">
                <Loader2 className="w-8 h-8 animate-spin text-[#16a34a]" />
            </div>
        );
    }

    if (isAuthenticated) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen flex font-['Inter'] bg-[#f5f7f5]">
            {/* Left Panel - Hero Section */}
            <div className="hidden lg:flex lg:w-[45%] bg-[#1a2e1f] login-grid-pattern flex-col p-16 text-white relative overflow-hidden">
                {/* Brand Logo */}
                <div className="mb-20 animate-fade-in">
                    <img 
                        src="https://res.cloudinary.com/dlfzzfdx0/image/upload/v1777286182/Brand_title_with_tagline-removebg-preview_jpjpet.png" 
                        alt="Proteccio Data" 
                        className="h-12 w-auto brightness-0 invert"
                    />
                </div>

                {/* Content */}
                <div className="relative z-10 flex-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 mb-8 animate-slide-in">
                        <div className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse"></div>
                        <span className="text-[10px] font-bold tracking-widest uppercase text-[#22c55e]">New Gen Privacy Stack</span>
                    </div>

                    <h1 className="text-5xl font-extrabold font-['Plus_Jakarta_Sans'] leading-[1.1] mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                        Build Trust <br />
                        Through <span className="text-[#22c55e]">Data Privacy.</span>
                    </h1>

                    <p className="text-gray-400 text-lg max-w-md mb-12 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                        Privacy software that helps businesses protect data and meet global compliance standards — all in one place.
                    </p>

                    {/* Feature Items */}
                    <div className="space-y-6 mb-16 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                        <div className="flex items-start gap-4 group cursor-default">
                            <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-[#16a34a]/20 group-hover:border-[#16a34a]/30 transition-all">
                                <Database className="w-5 h-5 text-gray-400 group-hover:text-[#22c55e]" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-white mb-1">Consent Management</h4>
                                <p className="text-sm text-gray-500">Collect, store & manage consents with full audit trail.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 group cursor-default">
                            <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-[#16a34a]/20 group-hover:border-[#16a34a]/30 transition-all">
                                <Shield className="w-5 h-5 text-gray-400 group-hover:text-[#22c55e]" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-white mb-1">Rights Management</h4>
                                <p className="text-sm text-gray-500">Handle DSARs, erasure & portability requests fast.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 group cursor-default">
                            <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-[#16a34a]/20 group-hover:border-[#16a34a]/30 transition-all">
                                <Activity className="w-5 h-5 text-gray-400 group-hover:text-[#22c55e]" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-white mb-1">Risk & Compliance</h4>
                                <p className="text-sm text-gray-500">Real-time SLA tracking, breach alerts & risk exposure.</p>
                            </div>
                        </div>
                    </div>

                    {/* Compliance Badges */}
                    <div className="flex flex-wrap gap-3 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                        {['GDPR', 'DPDPA', 'ISO 27001', 'ISO 27701'].map((badge) => (
                            <span key={badge} className="px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                                {badge}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Subtle light effect */}
                <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#16a34a]/10 blur-[100px] rounded-full"></div>
            </div>

            {/* Right Panel - Login Card */}
            <div className="w-full lg:w-[55%] flex items-center justify-center p-6 sm:p-12">
                <div className="w-full max-w-md animate-fade-in">
                    <Card className="border-none shadow-xl shadow-gray-200/50 bg-white rounded-3xl overflow-hidden">
                        <CardContent className="p-8 sm:p-12">
                            <div className="mb-10">
                                <p className="text-[10px] font-bold tracking-[0.2em] text-[#16a34a] uppercase mb-3">Consent Management System</p>
                                <h2 className="text-3xl font-extrabold font-['Plus_Jakarta_Sans'] text-[#1a2e1f] mb-2">Welcome back 👋</h2>
                                <p className="text-gray-400">Sign in to access your dashboard</p>
                            </div>

                            <form onSubmit={handleLogin} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="username" className="text-xs font-bold text-[#1a2e1f]/60 uppercase tracking-widest ml-1">Email Address</Label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-gray-300 group-focus-within:text-[#16a34a] transition-colors" />
                                        </div>
                                        <Input
                                            id="username"
                                            type="text"
                                            placeholder="Enter your email"
                                            className="h-14 pl-12 bg-[#f5f7f5]/50 border-[#dde8dd] focus:border-[#22c55e] focus:ring-[#22c55e]/10 rounded-2xl transition-all"
                                            value={inputUsername}
                                            onChange={(e) => setInputUsername(e.target.value)}
                                            disabled={submitting}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center ml-1">
                                        <Label htmlFor="password" className="text-xs font-bold text-[#1a2e1f]/60 uppercase tracking-widest">Password</Label>
                                        <button type="button" className="text-xs font-bold text-[#16a34a] hover:text-[#22c55e] transition-colors">Forgot password?</button>
                                    </div>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-gray-300 group-focus-within:text-[#16a34a] transition-colors" />
                                        </div>
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="Enter your password"
                                            className="h-14 pl-12 bg-[#f5f7f5]/50 border-[#dde8dd] focus:border-[#22c55e] focus:ring-[#22c55e]/10 rounded-2xl transition-all"
                                            value={inputPassword}
                                            onChange={(e) => setInputPassword(e.target.value)}
                                            disabled={submitting}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="role" className="text-xs font-bold text-[#1a2e1f]/60 uppercase tracking-widest ml-1">Login As (Role)</Label>
                                    <Select value={selectedRoleId} onValueChange={setSelectedRoleId} disabled={submitting}>
                                        <SelectTrigger className="h-14 bg-[#f5f7f5]/50 border-[#dde8dd] focus:border-[#22c55e] focus:ring-[#22c55e]/10 rounded-2xl transition-all">
                                            <div className="flex items-center gap-3">
                                                <Shield className="w-5 h-5 text-gray-300" />
                                                <SelectValue placeholder="Select a role" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-[#dde8dd]">
                                            {roles.filter(r => r.status === 'active').map((role) => (
                                                <SelectItem key={role.id} value={role.id} className="rounded-xl my-1 mx-1 focus:bg-[#16a34a]/10 focus:text-[#16a34a]">
                                                    {role.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <Button 
                                    type="submit" 
                                    className="w-full h-14 bg-[#16a34a] hover:bg-[#15803d] text-white font-bold rounded-2xl shadow-lg shadow-green-200 transition-all hover:scale-[1.01] active:scale-[0.98] shimmer-btn glow-green" 
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Authenticating...</span>
                                        </div>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            Sign In
                                            <ChevronRight className="w-5 h-5" />
                                        </span>
                                    )}
                                </Button>
                            </form>

                            <div className="mt-12 text-center space-y-4">
                                <p className="text-sm text-gray-400">
                                    No access? Contact us at{' '}
                                    <a href="mailto:hello@protecciodata.com" className="text-[#16a34a] font-bold hover:underline">hello@protecciodata.com</a>
                                </p>
                                <div className="flex items-center justify-center gap-2 text-[10px] font-bold tracking-widest text-gray-300 uppercase pt-4 border-t border-gray-100">
                                    <Lock className="w-3 h-3" />
                                    <span>256-bit SSL Encrypted · Secure Login</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default SimpleAuth;
