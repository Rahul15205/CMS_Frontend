import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Shield, LogOut } from "lucide-react";

export default function Logout() {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();

  const handleLogout = () => {
    // In a real app, this would clear session, tokens, etc.
    setOpen(false);
    // Show a brief message then redirect
    setTimeout(() => {
      navigate("/");
    }, 500);
  };

  const handleCancel = () => {
    setOpen(false);
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <LogOut className="h-6 w-6 text-destructive" />
            </div>
            <DialogTitle className="text-center">Confirm Logout</DialogTitle>
            <DialogDescription className="text-center">
              Are you sure you want to log out of the Consent Management System? 
              Your session will be ended and you'll need to sign in again to access the dashboard.
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-4 rounded-lg bg-muted/50 border border-border mt-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-foreground">Security Notice</p>
                <p className="text-muted-foreground mt-1">
                  For security purposes, your session will be completely terminated. 
                  All unsaved changes will be lost.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6 flex gap-3 sm:gap-3">
            <Button variant="outline" onClick={handleCancel} className="flex-1">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleLogout} className="flex-1">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
