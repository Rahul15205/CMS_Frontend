import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface ActivityItemProps {
  icon: ReactNode;
  title: string;
  description: string;
  time: string;
  variant?: "default" | "success" | "warning" | "error";
}

const variantStyles = {
  default: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  error: "bg-destructive/10 text-destructive",
};

export function ActivityItem({
  icon,
  title,
  description,
  time,
  variant = "default",
}: ActivityItemProps) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
      <div
        className={cn(
          "p-2 rounded-lg flex-shrink-0",
          variantStyles[variant]
        )}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{title}</p>
        <p className="text-xs text-muted-foreground truncate">{description}</p>
      </div>
      <span className="text-xs text-muted-foreground flex-shrink-0">{time}</span>
    </div>
  );
}
