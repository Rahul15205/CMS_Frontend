import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KPICardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    direction: "up" | "down" | "neutral";
    label?: string;
  };
  variant?: "default" | "success" | "warning" | "destructive" | "info";
  valueClassName?: string;
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

export function KPICard({
  title,
  value,
  icon,
  trend,
  variant = "default",
  className,
  valueClassName,
  ...props
}: KPICardProps) {
  return (
    <div
      className={cn(
        "dashboard-card group",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1 min-w-0 flex-1">
          <p className="text-xs font-medium text-muted-foreground leading-tight pr-1">{title}</p>
          <p className={cn("text-3xl font-bold text-foreground tracking-tight", valueClassName)}>{value}</p>
          {trend && (
            <div
              className={cn(
                "kpi-trend mt-1",
                trend.direction === "up" && "kpi-trend-up",
                trend.direction === "down" && "kpi-trend-down",
                trend.direction === "neutral" && "text-muted-foreground"
              )}
            >
              {trend.direction === "up" && <TrendingUp className="h-3 w-3" />}
              {trend.direction === "down" && <TrendingDown className="h-3 w-3" />}
              {trend.direction === "neutral" && <Minus className="h-3 w-3" />}
              <span className="truncate">
                {trend.direction !== "neutral" && (trend.value > 0 ? "+" : "")}
                {trend.value}% {trend.label || "vs last month"}
              </span>
            </div>
          )}
        </div>
        <div
          className={cn(
            "p-3 rounded-lg transition-transform group-hover:scale-105 flex-shrink-0",
            iconVariantStyles[variant]
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
