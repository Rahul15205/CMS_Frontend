import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Layout } from "lucide-react";

interface CreateBannerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (banner: any) => void;
}

export function CreateBannerDialog({ open, onOpenChange, onSave }: CreateBannerDialogProps) {
    const [formData, setFormData] = useState({
        name: "",
        theme: "bg-primary",
        language: "en",
        position: "BOTTOM"
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...formData,
            status: "DRAFT",
            lastModified: "Just now"
        });
        onOpenChange(false);
        // Reset form
        setFormData({
            name: "",
            theme: "bg-primary",
            language: "en",
            position: "BOTTOM"
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Layout className="h-5 w-5" />
                        Create New Banner
                    </DialogTitle>
                    <DialogDescription>
                        Configure the initial settings for your new cookie consent banner.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Name
                        </Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="col-span-3"
                            placeholder="e.g. Summer Campaign"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="theme" className="text-right">
                            Theme
                        </Label>
                        <div className="col-span-3">
                            <Select
                                value={formData.theme}
                                onValueChange={(value) => setFormData({ ...formData, theme: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select theme" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="bg-primary">Default Primary</SelectItem>
                                    <SelectItem value="bg-zinc-900">Dark Mode</SelectItem>
                                    <SelectItem value="bg-blue-600">Blue Corporate</SelectItem>
                                    <SelectItem value="bg-purple-600">Purple Vibrant</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="position" className="text-right">
                            Position
                        </Label>
                        <div className="col-span-3">
                            <Select
                                value={formData.position}
                                onValueChange={(value) => setFormData({ ...formData, position: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select position" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="BOTTOM">Bottom Bar</SelectItem>
                                    <SelectItem value="TOP">Top Bar</SelectItem>
                                    <SelectItem value="CENTER">Center Modal</SelectItem>
                                    <SelectItem value="CORNER">Bottom Corner</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="language" className="text-right">
                            Language
                        </Label>
                        <div className="col-span-3">
                            <Select
                                value={formData.language}
                                onValueChange={(value) => setFormData({ ...formData, language: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="en">English (Default)</SelectItem>
                                    <SelectItem value="es">Spanish</SelectItem>
                                    <SelectItem value="fr">French</SelectItem>
                                    <SelectItem value="de">German</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">Create Banner</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
