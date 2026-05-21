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
    MapPin,
    Sun,
    Moon,
    Cookie,
    Eye,
    EyeOff
} from "lucide-react";
import { useDashboard } from "@/contexts/DashboardContext";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/authService";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useNavigate, useLocation } from "react-router-dom";

interface SimpleAuthProps {
    children: React.ReactNode;
}

const SimpleAuth: React.FC<SimpleAuthProps> = ({ children }) => {
    const { isAuthenticated, isLoading: authLoading, login, user, setMustResetPassword } = useAuth();
    const { config, setTheme } = useDashboard();
    const theme = config.theme;
    const navigate = useNavigate();
    const location = useLocation();
    const [submitting, setSubmitting] = useState(false);
    const [inputUsername, setInputUsername] = useState("");
    const [inputPassword, setInputPassword] = useState("");
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [showHelpDialog, setShowHelpDialog] = useState(false);

    // Password reset state
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [resetSubmitting, setResetSubmitting] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await login(inputUsername, inputPassword);
            toast.success("Authentication successful");
        } catch {
            // Error toast is handled by the auth service / context
        } finally {
            setSubmitting(false);
        }
    };

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }
        if (newPassword.length < 8) {
            toast.error("New password must be at least 8 characters long");
            return;
        }
        
        setResetSubmitting(true);
        try {
            await authService.changePassword(currentPassword, newPassword);
            toast.success("Password updated successfully!");
            setMustResetPassword(false);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error: any) {
            const errorMsg = error?.response?.data?.message || "Failed to update password. Please try again.";
            toast.error(errorMsg);
        } finally {
            setResetSubmitting(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated && !user?.mustResetPassword && (location.pathname === '/login' || location.pathname === '/logout')) {
            navigate('/');
        }
    }, [isAuthenticated, user?.mustResetPassword, location.pathname, navigate]);

    // Show loading while auth state is being restored
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (isAuthenticated) {
        if (user?.mustResetPassword) {
            return (
                <div className="h-screen overflow-hidden flex font-['Inter'] bg-background text-foreground transition-colors duration-300">
                    {/* Left Panel - Hero Section */}
                    <div className="hidden lg:flex lg:w-[45%] bg-[#1a2e1f] login-grid-pattern flex-col p-12 text-white relative overflow-hidden">
                        <div className="mb-12 animate-fade-in">
                            <img 
                                src="https://res.cloudinary.com/dlfzzfdx0/image/upload/v1777286182/Brand_title_with_tagline-removebg-preview_jpjpet.png" 
                                alt="Proteccio Data" 
                                className="h-12 w-auto"
                            />
                        </div>
                        <div className="relative z-10 flex-1 flex flex-col justify-center">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 mb-8 w-fit animate-slide-in">
                                <Shield className="w-4 h-4 text-[#22c55e]" />
                                <span className="text-[10px] font-bold tracking-widest uppercase text-[#22c55e]">Security Hardening</span>
                            </div>
                            <h1 className="text-4xl font-extrabold font-['Plus_Jakarta_Sans'] leading-[1.2] mb-6">
                                Protect Your Account.
                            </h1>
                            <p className="text-gray-400 text-lg max-w-md mb-8">
                                To complete your account activation, you are required to change your temporary password to a secure new password.
                            </p>
                        </div>
                        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#16a34a]/10 blur-[100px] rounded-full"></div>
                    </div>

                    {/* Right Panel - Force Reset Card */}
                    <div className="w-full lg:w-[55%] flex items-center justify-center p-6 relative overflow-y-auto scrollbar-hide">
                        <div className="absolute top-8 right-8 animate-fade-in">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                                className="rounded-full w-12 h-12 bg-card border-border shadow-sm hover:bg-accent transition-all"
                            >
                                {theme === "dark" ? (
                                    <Sun className="h-5 w-5 text-yellow-400" />
                                ) : (
                                    <Moon className="h-5 w-5 text-slate-700" />
                                )}
                            </Button>
                        </div>

                        <div className="w-full max-w-md animate-fade-in">
                            <Card className="border-none shadow-xl dark:shadow-none dark:bg-card/50 bg-white rounded-3xl overflow-hidden">
                                <CardContent className="p-8 sm:p-10">
                                    <div className="mb-6">
                                        <p className="text-[10px] font-bold tracking-[0.2em] text-primary uppercase mb-3">Security Requirement</p>
                                        <h2 className="text-3xl font-extrabold font-['Plus_Jakarta_Sans'] text-card-foreground mb-2">Reset Password 🔒</h2>
                                        <p className="text-muted-foreground">Please update your temporary password to proceed to your dashboard.</p>
                                    </div>

                                    <form onSubmit={handlePasswordReset} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="currentPassword" className="text-xs font-bold text-card-foreground/60 uppercase tracking-widest ml-1">Temporary Password</Label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <Lock className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                                </div>
                                                <Input
                                                    id="currentPassword"
                                                    type={showCurrentPassword ? "text" : "password"}
                                                    placeholder="Enter temporary password"
                                                    className="h-14 pl-12 pr-12 bg-secondary/50 border-border focus:border-primary focus:ring-primary/10 rounded-2xl transition-all"
                                                    value={currentPassword}
                                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                                    disabled={resetSubmitting}
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                                                    disabled={resetSubmitting}
                                                >
                                                    {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="newPassword" className="text-xs font-bold text-card-foreground/60 uppercase tracking-widest ml-1">New Password</Label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <Lock className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                                </div>
                                                <Input
                                                    id="newPassword"
                                                    type={showNewPassword ? "text" : "password"}
                                                    placeholder="Minimum 8 characters"
                                                    className="h-14 pl-12 pr-12 bg-secondary/50 border-border focus:border-primary focus:ring-primary/10 rounded-2xl transition-all"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    disabled={resetSubmitting}
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                                                    disabled={resetSubmitting}
                                                >
                                                    {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="confirmPassword" className="text-xs font-bold text-card-foreground/60 uppercase tracking-widest ml-1">Confirm New Password</Label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <Lock className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                                </div>
                                                <Input
                                                    id="confirmPassword"
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    placeholder="Re-enter new password"
                                                    className="h-14 pl-12 pr-12 bg-secondary/50 border-border focus:border-primary focus:ring-primary/10 rounded-2xl transition-all"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    disabled={resetSubmitting}
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                                                    disabled={resetSubmitting}
                                                >
                                                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                </button>
                                            </div>
                                        </div>

                                        <Button 
                                            type="submit" 
                                            className="w-full h-14 bg-[#16a34a] hover:bg-[#15803d] text-white font-bold rounded-2xl shadow-lg shadow-green-200 transition-all hover:scale-[1.01] active:scale-[0.98] shimmer-btn glow-green" 
                                            disabled={resetSubmitting}
                                        >
                                            {resetSubmitting ? (
                                                <div className="flex items-center gap-2">
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    <span>Updating Password...</span>
                                                </div>
                                            ) : (
                                                <span className="flex items-center gap-2">
                                                    Change Password & Proceed
                                                    <ChevronRight className="w-5 h-5" />
                                                </span>
                                            )}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            );
        }
        return <>{children}</>;
    }

    return (
        <div className="h-screen overflow-hidden flex font-['Inter'] bg-background text-foreground transition-colors duration-300">
            {/* Left Panel - Hero Section */}
            <div className="hidden lg:flex lg:w-[45%] bg-[#1a2e1f] login-grid-pattern flex-col p-12 text-white relative overflow-hidden">
                {/* Brand Logo */}
                <div className="mb-12 animate-fade-in">
                    <img 
                        src="https://res.cloudinary.com/dlfzzfdx0/image/upload/v1777286182/Brand_title_with_tagline-removebg-preview_jpjpet.png" 
                        alt="Proteccio Data" 
                        className="h-12 w-auto"
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
                    <div className="space-y-4 mb-10 animate-fade-in" style={{ animationDelay: '0.3s' }}>
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
                                <h4 className="font-semibold text-white mb-1">Rights & Grievance Management</h4>
                                <p className="text-sm text-gray-500">Automate DSARs and resolve privacy grievances with seamless tracking.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 group cursor-default">
                            <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-[#16a34a]/20 group-hover:border-[#16a34a]/30 transition-all">
                                <Cookie className="w-5 h-5 text-gray-400 group-hover:text-[#22c55e]" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-white mb-1">Cookies Management</h4>
                                <p className="text-sm text-gray-500">Smart cookie scanning, categorization, and compliant consent banners.</p>
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
            <div className="w-full lg:w-[55%] flex items-center justify-center p-6 relative overflow-y-auto scrollbar-hide">
                {/* Theme Toggle */}
                <div className="absolute top-8 right-8 animate-fade-in">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="rounded-full w-12 h-12 bg-card border-border shadow-sm hover:bg-accent transition-all"
                    >
                        {theme === "dark" ? (
                            <Sun className="h-5 w-5 text-yellow-400" />
                        ) : (
                            <Moon className="h-5 w-5 text-slate-700" />
                        )}
                    </Button>
                </div>

                <div className="w-full max-w-md animate-fade-in">
                    <Card className="border-none shadow-xl dark:shadow-none dark:bg-card/50 bg-white rounded-3xl overflow-hidden">
                        <CardContent className="p-8 sm:p-10">
                            <div className="mb-6">
                                <p className="text-[10px] font-bold tracking-[0.2em] text-primary uppercase mb-3">Consent Management System</p>
                                <h2 className="text-3xl font-extrabold font-['Plus_Jakarta_Sans'] text-card-foreground mb-2">Welcome back 👋</h2>
                                <p className="text-muted-foreground">Sign in to access your dashboard</p>
                            </div>

                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="username" className="text-xs font-bold text-card-foreground/60 uppercase tracking-widest ml-1">Email Address</Label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        </div>
                                        <Input
                                            id="username"
                                            type="text"
                                            placeholder="Enter your email"
                                            className="h-14 pl-12 bg-secondary/50 border-border focus:border-primary focus:ring-primary/10 rounded-2xl transition-all"
                                            value={inputUsername}
                                            onChange={(e) => setInputUsername(e.target.value)}
                                            disabled={submitting}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center ml-1">
                                        <Label htmlFor="password" className="text-xs font-bold text-card-foreground/60 uppercase tracking-widest">Password</Label>
                                        <button type="button" className="text-xs font-bold text-primary hover:text-primary/80 transition-colors">Forgot password?</button>
                                    </div>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        </div>
                                        <Input
                                            id="password"
                                            type={showLoginPassword ? "text" : "password"}
                                            placeholder="Enter your password"
                                            className="h-14 pl-12 pr-12 bg-secondary/50 border-border focus:border-primary focus:ring-primary/10 rounded-2xl transition-all"
                                            value={inputPassword}
                                            onChange={(e) => setInputPassword(e.target.value)}
                                            disabled={submitting}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowLoginPassword(!showLoginPassword)}
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                                            disabled={submitting}
                                        >
                                            {showLoginPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
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

                            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                                <button 
                                    type="button"
                                    onClick={() => setShowHelpDialog(true)}
                                    className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                                >
                                    <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                                    Help
                                </button>
                                <a 
                                    href="https://protecciodata.com/privacy-notice" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                                >
                                    <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                                    Privacy Notice
                                </a>
                                <a 
                                    href="https://protecciodata.com/terms" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                                >
                                    <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                                    Terms of Service
                                </a>
                            </div>

                            <div className="mt-8 text-center space-y-3">
                                <p className="text-sm text-muted-foreground">
                                    No access? Contact us at{' '}
                                    <a href="mailto:hello@protecciodata.com" className="text-primary font-bold hover:underline">hello@protecciodata.com</a>
                                </p>
                                <div className="flex items-center justify-center gap-2 text-[10px] font-bold tracking-widest text-muted-foreground uppercase pt-4 border-t border-border">
                                    <Lock className="w-3 h-3" />
                                    <span>256-bit SSL Encrypted · Secure Login</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Dialog open={showHelpDialog} onOpenChange={setShowHelpDialog}>
                <DialogContent className="sm:max-w-md rounded-3xl border-none shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-extrabold font-['Plus_Jakarta_Sans'] mb-2">Technical Support</DialogTitle>
                        <DialogDescription className="text-base text-muted-foreground leading-relaxed">
                            If you're experiencing any technical errors or need assistance with your account, please reach out to our support team.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 p-6 bg-secondary/50 rounded-2xl border border-border group hover:border-primary/30 transition-all text-center">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Support Email</p>
                        <a 
                            href="mailto:contact@protecciodata.com" 
                            className="text-xl font-extrabold text-primary hover:underline underline-offset-4 flex items-center justify-center gap-2"
                        >
                            <Mail className="w-5 h-5" />
                            contact@protecciodata.com
                        </a>
                    </div>
                    <div className="mt-2 text-center">
                        <Button 
                            onClick={() => setShowHelpDialog(false)}
                            className="mt-4 w-full h-12 rounded-xl font-bold bg-primary hover:bg-primary/90"
                        >
                            Got it, thanks!
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default SimpleAuth;
