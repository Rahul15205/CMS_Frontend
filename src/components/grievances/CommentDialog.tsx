
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface CommentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (comment: string) => void;
    caseId: string;
}

export function CommentDialog({ open, onOpenChange, onSubmit, caseId }: CommentDialogProps) {
    const [comment, setComment] = useState("");

    const handleSubmit = () => {
        if (comment.trim()) {
            onSubmit(comment);
            setComment("");
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Comment</DialogTitle>
                    <DialogDescription>
                        Add a note to case {caseId}. This will be visible to other agents.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="comment">Comment</Label>
                        <Textarea
                            id="comment"
                            placeholder="Enter your observations..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={4}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={!comment.trim()}>
                        Add Comment
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
