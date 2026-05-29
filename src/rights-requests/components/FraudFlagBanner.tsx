import { useState } from "react"; // PHASE 5 CHANGE
import { AlertTriangle, X } from "lucide-react"; // PHASE 5 CHANGE
import { Button } from "@/components/ui/button"; // PHASE 5 CHANGE

// PHASE 5 CHANGE
export function FraudFlagBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 p-4 rounded-lg flex items-center justify-between gap-3 animate-fade-in">
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
        <p className="text-sm font-medium">
          Fraud flag detected on this case. Review carefully before proceeding.
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setDismissed(true)}
        className="h-8 w-8 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
