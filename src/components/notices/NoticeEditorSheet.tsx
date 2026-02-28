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

interface Notice {
    id: string;
    title: string;
    version: string;
    status: string;
    lastUpdated: string;
    acknowledgements: number;
    pendingAck: number;
    content?: string;
}

interface NoticeEditorSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    notice: Notice | null;
    onSave: (notice: Notice) => void;
}

export function NoticeEditorSheet({
    open,
    onOpenChange,
    notice,
    onSave,
}: NoticeEditorSheetProps) {
    const [formData, setFormData] = useState<Notice | null>(null);

    useEffect(() => {
        if (notice) {
            setFormData({ ...notice });
        } else {
            // Default state for creating a new notice
            setFormData({
                id: "",
                title: "",
                version: "1.0",
                status: "draft",
                lastUpdated: new Date().toISOString().split('T')[0],
                acknowledgements: 0,
                pendingAck: 0,
                content: ""
            });
        }
    }, [notice, open]);

    const handleChange = (field: keyof Notice, value: string) => {
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
            <SheetContent className="w-[400px] sm:w-[540px] flex flex-col h-full">
                <SheetHeader>
                    <SheetTitle>{notice ? "Edit Notice" : "Create New Notice"}</SheetTitle>
                    <SheetDescription>
                        {notice ? "Make changes to the notice details. Click save when you're done." : "Fill in the details to create a new notice."}
                    </SheetDescription>
                </SheetHeader>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-6 space-y-6">
                    <div className="space-y-4">
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
                                <Label htmlFor="version">Version</Label>
                                <Input
                                    id="version"
                                    value={formData.version}
                                    onChange={(e) => handleChange("version", e.target.value)}
                                    placeholder="e.g. 1.0"
                                />
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
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="pending_review">Pending Review</SelectItem>
                                        <SelectItem value="archived">Archived</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="content">Content Preview (Snippet)</Label>
                            <Textarea
                                id="content"
                                className="min-h-[200px] font-mono text-sm"
                                placeholder="Enter notice content here..."
                                value={formData.content || ""}
                                onChange={(e) => handleChange("content", e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                This is a simplified editor. For full document editing, please use the CMS integration.
                            </p>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                            <h4 className="text-sm font-medium">Metadata</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex flex-col gap-1">
                                    <span className="text-muted-foreground">ID</span>
                                    <span className="font-mono bg-muted px-2 py-1 rounded w-fit">{formData.id || "Auto-generated"}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-muted-foreground">Last Updated</span>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-3 w-3" />
                                        <span>{formData.lastUpdated}</span>
                                    </div>
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
