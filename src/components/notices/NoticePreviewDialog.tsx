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
    content?: string; // Add this if you have content
}

interface NoticePreviewDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    notice: Notice | null;
    onEdit: (notice: Notice) => void;
}

export function NoticePreviewDialog({
    open,
    onOpenChange,
    notice,
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
                                Last updated: {notice.lastUpdated}
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
                                    <p className="text-muted-foreground text-sm">
                                        This is a preview of the notice content. Ideally, this would be fetched from a backend or stored in the notice object.
                                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                                    </p>

                                    <h4 className="font-medium mt-4">1. Introduction</h4>
                                    <p className="text-muted-foreground text-sm">
                                        Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                                    </p>

                                    <h4 className="font-medium mt-4">2. Data Collection</h4>
                                    <p className="text-muted-foreground text-sm">
                                        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                                        Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                                    </p>

                                    <h4 className="font-medium mt-4">3. User Rights</h4>
                                    <p className="text-muted-foreground text-sm">
                                        Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam.
                                    </p>
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
                                    <Badge variant={notice.status === 'active' ? 'default' : 'secondary'}>
                                        {notice.status}
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
                                    <span className="text-success font-medium">{notice.acknowledgements.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Pending</span>
                                    <span className="text-warning font-medium">{notice.pendingAck}</span>
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
                                <Badge variant="outline">English (Default)</Badge>
                                <Badge variant="outline">Spanish</Badge>
                                <Badge variant="outline">French</Badge>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
