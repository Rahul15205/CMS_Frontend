import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Target,
    Languages,
    Workflow,
    Key,
    Database,
    FileText,
    Shield,
    Plus
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NewSettingDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelectAction: (action: string) => void;
}

export function NewSettingDialog({ open, onOpenChange, onSelectAction }: NewSettingDialogProps) {
    const options = [
        {
            id: "purpose",
            title: "New Data Purpose",
            description: "Define a new purpose for data processing.",
            icon: <Target className="h-6 w-6 text-blue-500" />,
            action: "add_purpose"
        },
        {
            id: "template",
            title: "New Consent Template",
            description: "Create a new template for consent collection.",
            icon: <FileText className="h-6 w-6 text-green-500" />,
            action: "create_template"
        },
        {
            id: "workflow",
            title: "New Workflow",
            description: "Set up a new approval workflow.",
            icon: <Workflow className="h-6 w-6 text-purple-500" />,
            action: "create_workflow"
        },
        {
            id: "language",
            title: "Add Language",
            description: "Enable a new language for the platform.",
            icon: <Languages className="h-6 w-6 text-orange-500" />,
            action: "add_language"
        },
        {
            id: "apikey",
            title: "Generate API Key",
            description: "Create a new API key for integration.",
            icon: <Key className="h-6 w-6 text-yellow-500" />,
            action: "generate_api_key"
        },
        {
            id: "retention",
            title: "Retention Rule",
            description: "Configure a new data retention policy.",
            icon: <Database className="h-6 w-6 text-red-500" />,
            action: "add_retention_rule"
        }
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Add New Configuration</DialogTitle>
                    <DialogDescription>
                        Select the type of configuration you want to add to the platform.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                    {options.map((option) => (
                        <div
                            key={option.id}
                            className="flex flex-col p-4 border rounded-xl hover:bg-muted/50 cursor-pointer transition-all hover:border-primary/50 group"
                            onClick={() => {
                                onSelectAction(option.action);
                                onOpenChange(false);
                            }}
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-lg bg-background border shadow-sm group-hover:shadow-md transition-all">
                                    {option.icon}
                                </div>
                                <h3 className="font-semibold text-sm">{option.title}</h3>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                {option.description}
                            </p>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
