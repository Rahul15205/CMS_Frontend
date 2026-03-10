import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

interface KPIWidgetProps {
  id: string;
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    direction: "up" | "down" | "neutral";
    label?: string;
    isPositive?: boolean; // Some metrics "down" is good (e.g., grievances)
  };
  variant?: "default" | "success" | "warning" | "destructive" | "info";
  subtitle?: string;
  onClick?: () => void;
  className?: string;
  isLoading?: boolean;
}

const variantStyles = {
  default: "bg-card",
  success: "bg-success/5 border-success/20",
  warning: "bg-warning/5 border-warning/20",
  destructive: "bg-destructive/5 border-destructive/20",
  info: "bg-info/5 border-info/20",
};

const iconVariantStyles = {
  default: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
  info: "bg-info/10 text-info",
};

export function KPIWidget({
  id,
  title,
  value,
  icon,
  trend,
  variant = "default",
  subtitle,
  onClick,
  className,
  isLoading,
}: KPIWidgetProps) {
  const getTrendColor = () => {
    if (!trend) return "";
    if (trend.direction === "neutral") return "text-muted-foreground";

    const isGood = trend.isPositive !== undefined
      ? trend.isPositive
      : trend.direction === "up";

    return isGood ? "text-success" : "text-destructive";
  };

  return (
    <div
      className={cn(
        "p-3 sm:p-4 rounded-lg border transition-all group cursor-pointer hover:shadow-md h-full flex flex-col justify-between",
        variantStyles[variant],
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 sm:space-y-1.5 flex-1 min-w-0">
          <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider truncate">
            {title}
          </p>
          {isLoading ? (
            <Skeleton className="h-8 w-16 mt-1" />
          ) : (
            <p className="text-xl sm:text-2xl font-bold text-foreground">{value}</p>
          )}
          {subtitle && (
            <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2">{subtitle}</p>
          )}
          {trend && (
            <div className={cn("flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-[10px] sm:text-xs font-medium", getTrendColor())}>
              <div className="flex items-center gap-1">
                {trend.direction === "up" && <TrendingUp className="h-3 w-3" />}
                {trend.direction === "down" && <TrendingDown className="h-3 w-3" />}
                {trend.direction === "neutral" && <Minus className="h-3 w-3" />}
                <span>
                  {trend.direction !== "neutral" && (trend.value > 0 ? "+" : "")}
                  {trend.value}%
                </span>
              </div>
              <span className="text-muted-foreground font-normal">
                {trend.label || "vs last period"}
              </span>
            </div>
          )}
        </div>
        <div
          className={cn(
            "p-2 sm:p-2.5 rounded-lg transition-transform group-hover:scale-105 flex-shrink-0",
            iconVariantStyles[variant]
          )}
        >
          {/* Scale down icon on small mobile */}
          <div className="scale-90 sm:scale-100">
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}

// Grid container for KPI widgets
export function KPIGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {children}
    </div>
  );
}
