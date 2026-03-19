import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { consentTemplatesService } from "@/services/configurationsService";
import { Loader2 } from "lucide-react";

interface AddPurposeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAdd: (data: { 
        name: string; 
        description: string; 
        active: boolean;
        necessity: "ESSENTIAL" | "NON_ESSENTIAL";
        templateId: string;
    }) => void;
}

export function AddPurposeDialog({
    open,
    onOpenChange,
    onAdd,
}: AddPurposeDialogProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [necessity, setNecessity] = useState<"ESSENTIAL" | "NON_ESSENTIAL">("ESSENTIAL");
    const [templateId, setTemplateId] = useState("");
    const [templates, setTemplates] = useState<any[]>([]);
    const [loadingTemplates, setLoadingTemplates] = useState(false);

    useEffect(() => {
        if (open) {
            loadTemplates();
        }
    }, [open]);

    const loadTemplates = async () => {
        setLoadingTemplates(true);
        try {
            const data = await consentTemplatesService.getAll();
            // Data might be paginated or a direct array
            const templatesList = Array.isArray(data) ? data : (data.data || []);
            setTemplates(templatesList);
            if (templatesList.length > 0) {
                setTemplateId(templatesList[0].id);
            }
        } catch (error) {
            console.error("Failed to load templates:", error);
        } finally {
            setLoadingTemplates(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd({ 
            name, 
            description, 
            active: true,
            necessity,
            templateId
        });
        onOpenChange(false);
        setName("");
        setDescription("");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Data Processing Purpose</DialogTitle>
                    <DialogDescription>
                        Define a new purpose for collecting and processing user data.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Purpose Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Marketing Analytics"
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe how this data will be used..."
                            className="min-h-[80px]"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="necessity">Necessity</Label>
                            <Select value={necessity} onValueChange={(v: any) => setNecessity(v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ESSENTIAL">Essential</SelectItem>
                                    <SelectItem value="NON_ESSENTIAL">Non-Essential</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="template">Template</Label>
                            <Select value={templateId} onValueChange={setTemplateId} disabled={loadingTemplates || templates.length === 0}>
                                <SelectTrigger>
                                    {loadingTemplates ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <SelectValue placeholder="Select Template" />
                                    )}
                                </SelectTrigger>
                                <SelectContent>
                                    {templates.map((t) => (
                                        <SelectItem key={t.id} value={t.id}>
                                            {t.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter className="mt-2">
                        <Button type="submit" disabled={!name || !templateId || loadingTemplates}>
                            Add Purpose
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
