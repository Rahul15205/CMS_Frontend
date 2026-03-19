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
import { NoticeLanguage } from "@/data/mockNotices";
import { AlertCircle, Trash2 } from "lucide-react";
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert";

interface LanguageSettingsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    language: NoticeLanguage | null;
    onUpdate: (code: string, data: { isDefault: boolean }) => void;
    onDelete: (code: string) => void;
}

export function LanguageSettingsDialog({
    open,
    onOpenChange,
    language,
    onUpdate,
    onDelete,
}: LanguageSettingsDialogProps) {
    if (!language) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{language.name} Settings</DialogTitle>
                    <DialogDescription>
                        Manage settings for {language.name} ({language.code}).
                    </DialogDescription>
                </DialogHeader>
                <div className="py-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Default Language</Label>
                            <p className="text-sm text-muted-foreground">
                                Set this as the main language for all notices.
                            </p>
                        </div>
                        <Switch
                            checked={language.isDefault}
                            onCheckedChange={(checked) => onUpdate(language.code, { isDefault: checked })}
                            disabled={language.isDefault}
                        />
                    </div>

                    <div className="pt-4 border-t border-border">
                        <Label className="text-destructive mb-3 block">Danger Zone</Label>
                        {language.isDefault ? (
                            <Alert variant="destructive" className="bg-destructive/5 border-destructive/20">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Default Language</AlertTitle>
                                <AlertDescription>
                                    You cannot remove the default language. Change another language to default first.
                                </AlertDescription>
                            </Alert>
                        ) : (
                            <Button 
                                variant="destructive" 
                                className="w-full flex items-center justify-center gap-2"
                                onClick={() => {
                                    if (confirm(`Are you sure you want to remove ${language.name}?`)) {
                                        onDelete(language.code);
                                        onOpenChange(false);
                                    }
                                }}
                            >
                                <Trash2 className="h-4 w-4" />
                                Remove Language
                            </Button>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
