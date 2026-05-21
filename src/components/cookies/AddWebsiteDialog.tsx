import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info, Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";

interface AddWebsiteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (websiteData: any) => void;
    initialData?: any;
}

export function AddWebsiteDialog({
    open,
    onOpenChange,
    onSave,
    initialData,
}: AddWebsiteDialogProps) {
    const [formData, setFormData] = useState({
        url: "",
        name: "",
        frequency: "WEEKLY",
        depth: "STANDARD",
        email: "",
        autoCategorize: true,
        scanBehindLogin: false,
        loginUrl: "",
        loginUsername: "",
        loginPassword: "",
    });
    const [showLoginPassword, setShowLoginPassword] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                loginUrl: initialData.loginUrl || "",
                loginUsername: initialData.loginUsername || "",
                loginPassword: initialData.loginPassword || "",
            });
        } else {
            setFormData({
                url: "",
                name: "",
                frequency: "WEEKLY",
                depth: "STANDARD",
                email: "",
                autoCategorize: true,
                scanBehindLogin: false,
                loginUrl: "",
                loginUsername: "",
                loginPassword: "",
            });
        }
        setShowLoginPassword(false);
    }, [initialData, open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...formData, id: initialData?.id });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Edit Website Configuration" : "Add New Website"}</DialogTitle>
                    <DialogDescription>
                        Configure scanning settings for your website.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Website Name</Label>
                                <Input
                                    id="name"
                                    placeholder="My E-commerce Site"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="url">Website URL</Label>
                                <Input
                                    id="url"
                                    placeholder="https://example.com"
                                    value={formData.url}
                                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-1.5">
                                    <Label htmlFor="frequency">Scan Frequency</Label>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="max-w-[220px] text-xs">
                                            How often we automatically check your website for new or changed cookies.
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                <Select
                                    value={formData.frequency}
                                    onValueChange={(value) => setFormData({ ...formData, frequency: value })}
                                >
                                    <SelectTrigger id="frequency">
                                        <SelectValue placeholder="Select frequency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="DAILY">Daily</SelectItem>
                                        <SelectItem value="WEEKLY">Weekly</SelectItem>
                                        <SelectItem value="MONTHLY">Monthly</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-1.5">
                                    <Label htmlFor="depth">Scan Depth</Label>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="max-w-[220px] text-xs">
                                            Defines how many pages we scan on your website. Standard covers up to 100 pages; Deep scans the entire site.
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                <Select
                                    value={formData.depth}
                                    onValueChange={(value) => setFormData({ ...formData, depth: value })}
                                >
                                    <SelectTrigger id="depth">
                                        <SelectValue placeholder="Select depth" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="STANDARD">Standard (Up to 100 pages)</SelectItem>
                                        <SelectItem value="DEEP">Deep (Unlimited)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Notification Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="admin@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <div className="flex flex-col gap-4 mt-2">
                            <div className="flex items-center justify-between border rounded-lg p-3">
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-1.5">
                                        <Label className="text-base">Automatic Categorization</Label>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                                            </TooltipTrigger>
                                            <TooltipContent side="top" className="max-w-[240px] text-xs">
                                                When enabled, our system will automatically sort cookies into categories like Necessary, Analytics, and Marketing using our built-in cookie database.
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        Automatically categorize known cookies from our database.
                                    </div>
                                </div>
                                <Switch
                                    checked={formData.autoCategorize}
                                    onCheckedChange={(checked) => setFormData({ ...formData, autoCategorize: checked })}
                                />
                            </div>
                            <div className="flex items-center justify-between border rounded-lg p-3">
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-1.5">
                                        <Label className="text-base">Scan Behind Login</Label>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                                            </TooltipTrigger>
                                            <TooltipContent side="top" className="max-w-[240px] text-xs">
                                                Enable this if your website has pages behind a login wall that also use cookies. Our scanner will log in with the credentials you provide to scan those pages too.
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        Allow scanner to access protected pages (requires credentials).
                                    </div>
                                </div>
                                <Switch
                                    checked={formData.scanBehindLogin}
                                    onCheckedChange={(checked) => setFormData({ ...formData, scanBehindLogin: checked })}
                                />
                            </div>

                            {formData.scanBehindLogin && (
                                <div className="space-y-4 p-4 border rounded-lg bg-muted/30 animate-in fade-in slide-in-from-top-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="loginUrl">Login URL</Label>
                                        <Input
                                            id="loginUrl"
                                            placeholder="https://example.com/login"
                                            value={formData.loginUrl}
                                            onChange={(e) => setFormData({ ...formData, loginUrl: e.target.value })}
                                            required={formData.scanBehindLogin}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="loginUsername">Username / Email</Label>
                                            <Input
                                                id="loginUsername"
                                                placeholder="admin@example.com"
                                                value={formData.loginUsername}
                                                onChange={(e) => setFormData({ ...formData, loginUsername: e.target.value })}
                                                required={formData.scanBehindLogin}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="loginPassword">Password</Label>
                                            <div className="relative">
                                                <Input
                                                    id="loginPassword"
                                                    type={showLoginPassword ? "text" : "password"}
                                                    placeholder="••••••••"
                                                    value={formData.loginPassword}
                                                    className="pr-10"
                                                    onChange={(e) => setFormData({ ...formData, loginPassword: e.target.value })}
                                                    required={formData.scanBehindLogin}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
                                                >
                                                    {showLoginPassword ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">Save Configuration</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
