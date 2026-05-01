import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Calendar, CheckCircle, Clock, FileText, Globe, History, Shield, Users } from "lucide-react";
import { format } from "date-fns";

interface Notice {
    id: string;
    title: string;
    version: string;
    status: string;
    lastUpdated: string;
    acknowledgements: number;
    pendingAck: number;
    content?: string;
    updatedAt?: string;
}

interface NoticePreviewDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    notice: Notice | null;
    languages: any[];
    onEdit: (notice: Notice) => void;
}

export function NoticePreviewDialog({
    open,
    onOpenChange,
    notice,
    languages,
    onEdit,
}: NoticePreviewDialogProps) {
    if (!notice) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <div className="flex items-start justify-between">
                        <div>
                            <DialogTitle className="text-xl flex items-center gap-2">
                                {notice.title}
                                <Badge variant="outline" className="ml-2">v{notice.version}</Badge>
                            </DialogTitle>
                            <DialogDescription className="mt-1 flex items-center gap-2">
                                <Calendar className="h-3 w-3" />
                                Last updated: {notice.lastUpdated || (notice.updatedAt ? new Date(notice.updatedAt).toLocaleDateString() : 'N/A')}
                            </DialogDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => {
                                onOpenChange(false);
                                onEdit(notice);
                            }}>
                                Edit Notice
                            </Button>
                        </div>
                    </div>
                </DialogHeader>

                <div className="grid grid-cols-3 gap-6 py-4">
                    <div className="col-span-2 space-y-4">
                        <div className="border rounded-md p-4 bg-muted/20 min-h-[300px]">
                            <ScrollArea className="h-[400px] w-full pr-4">
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg">{notice.title}</h3>
                                    {notice.content ? (
                                        <div 
                                            className="prose prose-sm max-w-none text-foreground"
                                            dangerouslySetInnerHTML={{ __html: notice.content }}
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground italic">
                                            <FileText className="h-12 w-12 mb-2 opacity-20" />
                                            <p>No content has been added to this notice yet.</p>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-4">
                            <h4 className="text-sm font-medium flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                Status & Metadata
                            </h4>
                            <Separator />
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Status</span>
                                    <Badge variant={(notice.status === 'NOTICE_ACTIVE' || notice.status === 'active') ? 'default' : 'secondary'}>
                                        {notice.status.replace('NOTICE_', '').replace('_', ' ').toLowerCase()}
                                    </Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Version</span>
                                    <span className="font-mono">{notice.version}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">ID</span>
                                    <span className="font-mono text-xs">{notice.id}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-sm font-medium flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Engagement
                            </h4>
                            <Separator />
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Acknowledged</span>
                                    <span className="text-success font-medium">{(notice.acknowledgements ?? (notice as any)._count?.acknowledgements ?? 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Pending</span>
                                    <span className="text-warning font-medium">{notice.pendingAck ?? 0}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-sm font-medium flex items-center gap-2">
                                <Globe className="h-4 w-4" />
                                Localization
                            </h4>
                            <Separator />
                            <div className="flex flex-wrap gap-2">
                                {languages && languages.length > 0 ? (
                                    languages.map(lang => (
                                        <Badge key={lang.code} variant="outline" className="flex items-center gap-1">
                                            {lang.name} {lang.isDefault && <span className="text-[10px] text-muted-foreground">(Default)</span>}
                                        </Badge>
                                    ))
                                ) : (
                                    <Badge variant="outline">English (Default)</Badge>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
