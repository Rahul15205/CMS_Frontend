import { useState } from "react";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface CreateTemplateDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreate: (data: { title: string; type: string; description: string }) => void;
}

export function CreateTemplateDialog({
    open,
    onOpenChange,
    onCreate,
}: CreateTemplateDialogProps) {
    const [title, setTitle] = useState("");
    const [type, setType] = useState("EXPLICIT");
    const [description, setDescription] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onCreate({ title, type, description });
        onOpenChange(false);
        setTitle("");
        setType("EXPLICIT");
        setDescription("");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Consent Template</DialogTitle>
                    <DialogDescription>
                        Create a reusable template for consent collections or rights requests.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="title">Template Title</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Global Standard Consent"
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Input
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Briefly describe the template purpose"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="type">Consent Type</Label>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="EXPLICIT">Explicit</SelectItem>
                                <SelectItem value="IMPLICIT">Implicit</SelectItem>
                                <SelectItem value="OPTIONAL">Optional</SelectItem>
                                <SelectItem value="MANDATORY">Mandatory</SelectItem>
                                <SelectItem value="GRANULAR">Granular</SelectItem>
                                <SelectItem value="PARENTAL">Parental</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={!title}>
                            Create Template
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
