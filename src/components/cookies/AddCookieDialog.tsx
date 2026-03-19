import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Cookie } from "lucide-react";

interface AddCookieDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (cookie: any) => void;
    initialData?: any;
    categories?: any[];
}

export function AddCookieDialog({ open, onOpenChange, onSave, initialData, categories }: AddCookieDialogProps) {
    const [formData, setFormData] = useState({
        name: "",
        domain: "",
        categoryId: "functional",
        expiration: "",
        description: ""
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || "",
                domain: initialData.domain || "",
                categoryId: initialData.categoryId || initialData.category || "functional",
                expiration: initialData.expiration || "",
                description: initialData.description || ""
            });
        } else {
            setFormData({
                name: "",
                domain: "",
                categoryId: "functional",
                expiration: "",
                description: ""
            });
        }
    }, [initialData, open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...initialData, ...formData });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Cookie className="h-5 w-5" />
                        {initialData ? "Edit Cookie" : "Register New Cookie"}
                    </DialogTitle>
                    <DialogDescription>
                        {initialData ? "Update cookie details and categorization." : "Manually add a cookie to your inventory."}
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
                            placeholder="_ga"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="domain" className="text-right">
                            Domain
                        </Label>
                        <Input
                            id="domain"
                            value={formData.domain}
                            onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                            className="col-span-3"
                            placeholder=".example.com"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="category" className="text-right">
                            Category
                        </Label>
                        <div className="col-span-3">
                            <Select
                                value={formData.categoryId}
                                onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories && categories.length > 0 ? (
                                        categories.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <>
                                            <SelectItem value="necessary">Strictly Necessary</SelectItem>
                                            <SelectItem value="analytics">Analytics & Performance</SelectItem>
                                            <SelectItem value="functional">Functional</SelectItem>
                                            <SelectItem value="marketing">Marketing & Advertising</SelectItem>
                                        </>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="expiration" className="text-right">
                            Expiration
                        </Label>
                        <Input
                            id="expiration"
                            value={formData.expiration}
                            onChange={(e) => setFormData({ ...formData, expiration: e.target.value })}
                            className="col-span-3"
                            placeholder="e.g. 1 year, Session"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="description" className="text-right pt-2">
                            Description
                        </Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="col-span-3"
                            placeholder="Purpose of this cookie..."
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">Save Cookie</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
