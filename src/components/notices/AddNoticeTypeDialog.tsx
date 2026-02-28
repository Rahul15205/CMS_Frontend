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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface AddNoticeTypeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAdd: (type: { name: string; description: string; required: boolean }) => void;
}

export function AddNoticeTypeDialog({
    open,
    onOpenChange,
    onAdd,
}: AddNoticeTypeDialogProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [required, setRequired] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd({ name, description, required });
        onOpenChange(false);
        setName("");
        setDescription("");
        setRequired(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Notice Type</DialogTitle>
                    <DialogDescription>
                        Create a new category for notices (e.g., Privacy Policy, EULA).
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Name
                        </Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Terms of Use"
                            className="col-span-3"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">
                            Description
                        </Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief description of when this notice is used."
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="required" className="text-right">
                            Required
                        </Label>
                        <div className="flex items-center space-x-2 col-span-3">
                            <Switch
                                id="required"
                                checked={required}
                                onCheckedChange={setRequired}
                            />
                            <span className="text-sm text-muted-foreground">
                                Users must accept this notice type.
                            </span>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Add Type</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
