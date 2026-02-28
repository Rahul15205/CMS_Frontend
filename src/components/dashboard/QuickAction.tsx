import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

interface QuickActionProps {
  icon: ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  variant?: "default" | "primary" | "success" | "warning";
  className?: string;
}

const variantStyles = {
  default: "hover:border-primary/30 hover:bg-primary/5",
  primary: "border-primary/20 bg-primary/5 hover:bg-primary/10",
  success: "border-success/20 bg-success/5 hover:bg-success/10",
  warning: "border-warning/20 bg-warning/5 hover:bg-warning/10",
};

const iconVariantStyles = {
  default: "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary",
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
};

export function QuickAction({
  icon,
  title,
  description,
  onClick,
  variant = "default",
  className,
}: QuickActionProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group w-full flex items-center gap-4 p-4 rounded-lg border border-border bg-card text-left transition-all duration-200",
        variantStyles[variant],
        className
      )}
    >
      <div
        className={cn(
          "p-3 rounded-lg transition-colors",
          iconVariantStyles[variant]
        )}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0 text-left">
        <p className="font-medium text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2 whitespace-normal leading-snug">{description}</p>
      </div>
      <ChevronRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-primary transition-colors flex-shrink-0" />
    </button>
  );
}
