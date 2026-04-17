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
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({
                url: "",
                name: "",
                frequency: "WEEKLY",
                depth: "STANDARD",
                email: "",
                autoCategorize: true,
                scanBehindLogin: false,
            });
        }
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
                                <Label htmlFor="frequency">Scan Frequency</Label>
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
                                <Label htmlFor="depth">Scan Depth</Label>
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
                                    <Label className="text-base">Automatic Categorization</Label>
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
                                    <Label className="text-base">Scan Behind Login</Label>
                                    <div className="text-xs text-muted-foreground">
                                        Allow scanner to access protected pages (requires credentials).
                                    </div>
                                </div>
                                <Switch
                                    checked={formData.scanBehindLogin}
                                    onCheckedChange={(checked) => setFormData({ ...formData, scanBehindLogin: checked })}
                                />
                            </div>
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
