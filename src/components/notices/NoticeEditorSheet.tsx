import { useState, useEffect } from "react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetFooter,
    SheetClose
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Calendar, Save, Trash2 } from "lucide-react";

import { Switch } from "@/components/ui/switch";

interface Notice {
    id: string;
    title: string;
    version: string;
    status: string;
    lastUpdated: string;
    acknowledgements: number;
    pendingAck: number;
    content?: string;
    typeId?: string;
    defaultLanguage?: string;
    enforceAcknowledgement?: boolean;
    autoArchive?: boolean;
    auditLogging?: boolean;
}

interface NoticeEditorSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    notice: Notice | null;
    onSave: (notice: Notice) => void;
    noticeTypes?: { id: string, name: string }[];
    languages?: { code: string, name: string }[];
}

export function NoticeEditorSheet({
    open,
    onOpenChange,
    notice,
    onSave,
    noticeTypes = [],
    languages = []
}: NoticeEditorSheetProps) {
    const [formData, setFormData] = useState<Notice | null>(null);

    useEffect(() => {
        if (notice) {
            setFormData({ 
                ...notice,
                defaultLanguage: notice.defaultLanguage || "en",
                enforceAcknowledgement: notice.enforceAcknowledgement ?? false,
                autoArchive: notice.autoArchive ?? true,
                auditLogging: notice.auditLogging ?? true
            });
        } else {
            setFormData({
                id: "",
                title: "",
                version: "1.0",
                status: "NOTICE_DRAFT",
                lastUpdated: new Date().toISOString().split('T')[0],
                acknowledgements: 0,
                pendingAck: 0,
                content: "",
                defaultLanguage: "en",
                enforceAcknowledgement: false,
                autoArchive: true,
                auditLogging: true
            });
        }
    }, [notice, open]);

    const handleChange = (field: keyof Notice, value: any) => {
        if (formData) {
            setFormData({ ...formData, [field]: value });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData) {
            onSave(formData);
            onOpenChange(false);
        }
    };

    if (!formData) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[400px] sm:w-[600px] flex flex-col h-full overflow-hidden">
                <SheetHeader>
                    <SheetTitle>{notice ? "Edit Notice" : "Create New Notice"}</SheetTitle>
                    <SheetDescription>
                        {notice ? "Make changes to the notice details and settings." : "Fill in the details to create a new notice and configure its behavior."}
                    </SheetDescription>
                </SheetHeader>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-6 space-y-8 pr-2">
                    {/* Basic Information Section */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold uppercase tracking-widest text-primary/70">Basic Information</h4>
                        
                        <div className="space-y-2">
                            <Label htmlFor="title">Notice Title</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => handleChange("title", e.target.value)}
                                placeholder="e.g. Privacy Policy"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="noticeType">Notice Type</Label>
                                <Select
                                    value={formData.typeId}
                                    onValueChange={(val) => handleChange("typeId", val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {noticeTypes.map(type => (
                                            <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="version">Version</Label>
                                <Input
                                    id="version"
                                    value={formData.version}
                                    onChange={(e) => handleChange("version", e.target.value)}
                                    placeholder="e.g. 1.0"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(val) => handleChange("status", val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="NOTICE_ACTIVE">Active</SelectItem>
                                    <SelectItem value="NOTICE_DRAFT">Draft</SelectItem>
                                    <SelectItem value="NOTICE_PENDING_REVIEW">Pending Review</SelectItem>
                                    <SelectItem value="NOTICE_ARCHIVED">Archived</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Separator />

                    {/* Content Section */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold uppercase tracking-widest text-primary/70">Content Management</h4>
                        <div className="space-y-2">
                            <Label htmlFor="content">Content Preview (HTML/Markdown)</Label>
                            <Textarea
                                id="content"
                                className="min-h-[150px] font-mono text-sm bg-muted/30"
                                placeholder="Enter notice content here..."
                                value={formData.content || ""}
                                onChange={(e) => handleChange("content", e.target.value)}
                            />
                        </div>
                    </div>

                    <Separator />

                    {/* General Settings Section (Moved from Settings Tab) */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold uppercase tracking-widest text-primary/70">Notice Behavior & Settings</h4>
                        
                        <div className="space-y-2">
                            <Label htmlFor="defaultLanguage">Default Language</Label>
                            <Select
                                value={formData.defaultLanguage}
                                onValueChange={(val) => handleChange("defaultLanguage", val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select default language" />
                                </SelectTrigger>
                                <SelectContent>
                                    {languages.length > 0 ? (
                                        languages.map(lang => (
                                            <SelectItem key={lang.code} value={lang.code}>{lang.name} ({lang.code.toUpperCase()})</SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem value="en">English (EN)</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-1 gap-4 pt-2">
                            <div className="flex items-center justify-between p-3 border rounded-xl bg-primary/5">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-semibold">Enforce Acknowledgement</Label>
                                    <p className="text-[11px] text-muted-foreground">Block access until notice is accepted</p>
                                </div>
                                <Switch 
                                    checked={formData.enforceAcknowledgement} 
                                    onCheckedChange={(val) => handleChange("enforceAcknowledgement", val)} 
                                />
                            </div>

                            <div className="flex items-center justify-between p-3 border rounded-xl bg-primary/5">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-semibold">Auto-Archive Old Versions</Label>
                                    <p className="text-[11px] text-muted-foreground">Hide previous versions from public API</p>
                                </div>
                                <Switch 
                                    checked={formData.autoArchive} 
                                    onCheckedChange={(val) => handleChange("autoArchive", val)} 
                                />
                            </div>

                            <div className="flex items-center justify-between p-3 border rounded-xl bg-primary/5">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-semibold">Audit Logging</Label>
                                    <p className="text-[11px] text-muted-foreground">Track all administrative changes</p>
                                </div>
                                <Switch 
                                    checked={formData.auditLogging} 
                                    onCheckedChange={(val) => handleChange("auditLogging", val)} 
                                />
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Metadata Section */}
                    <div className="space-y-4 pb-4">
                        <h4 className="text-sm font-bold uppercase tracking-widest text-primary/70">Metadata</h4>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                            <div className="flex flex-col gap-1">
                                <span className="text-muted-foreground uppercase font-black tracking-tighter">System ID</span>
                                <span className="font-mono bg-muted px-2 py-1 rounded w-fit border">{formData.id || "Unassigned"}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-muted-foreground uppercase font-black tracking-tighter">Last Modified</span>
                                <div className="flex items-center gap-2 font-bold">
                                    <Calendar className="h-3 w-3" />
                                    <span>{formData.lastUpdated}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <SheetFooter className="pt-4 border-t mt-auto">
                        <Button variant="outline" onClick={() => onOpenChange(false)} type="button" className="mr-auto">
                            Cancel
                        </Button>
                        <Button type="submit">
                            <Save className="h-4 w-4 mr-2" />
                            {notice ? "Save Changes" : "Create Notice"}
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
