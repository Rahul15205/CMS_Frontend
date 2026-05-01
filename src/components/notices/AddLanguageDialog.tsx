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
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const AVAILABLE_LANGUAGES = [
    { code: "hi", name: "Hindi" },
    { code: "mr", name: "Marathi" },
    { code: "gu", name: "Gujarati" },
    { code: "ta", name: "Tamil" },
    { code: "te", name: "Telugu" },
    { code: "kn", name: "Kannada" },
    { code: "pa", name: "Punjabi" },
    { code: "bn", name: "Bengali" },
    { code: "ml", name: "Malayalam" },
    { code: "or", name: "Odia" },
    { code: "as", name: "Assamese" },
    { code: "en", name: "English" },
];

interface AddLanguageDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAdd: (data: { code: string; name: string; isDefault: boolean }) => void;
    existingCodes: string[];
}

export function AddLanguageDialog({
    open,
    onOpenChange,
    onAdd,
    existingCodes,
}: AddLanguageDialogProps) {
    const [selectedCode, setSelectedCode] = useState("");
    const [isDefault, setIsDefault] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const lang = AVAILABLE_LANGUAGES.find((l) => l.code === selectedCode);
        if (lang) {
            onAdd({ ...lang, isDefault });
            onOpenChange(false);
            setSelectedCode("");
            setIsDefault(false);
        }
    };

    const filteredLanguages = AVAILABLE_LANGUAGES.filter(
        (lang) => !existingCodes.includes(lang.code)
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Language</DialogTitle>
                    <DialogDescription>
                        Select a language to add for notice localization.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="language">Language</Label>
                        <Select
                            value={selectedCode}
                            onValueChange={setSelectedCode}
                            required
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a language" />
                            </SelectTrigger>
                            <SelectContent>
                                {filteredLanguages.map((lang) => (
                                    <SelectItem key={lang.code} value={lang.code}>
                                        {lang.name} ({lang.code})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center space-x-2 pt-2">
                        <Switch
                            id="is-default"
                            checked={isDefault}
                            onCheckedChange={setIsDefault}
                        />
                        <Label htmlFor="is-default">Set as default language</Label>
                    </div>
                    <DialogFooter className="mt-4">
                        <Button type="submit" disabled={!selectedCode}>
                            Add Language
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
