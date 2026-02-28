import { cn } from "@/lib/utils";
import { CheckCircle, AlertTriangle, AlertCircle } from "lucide-react";

interface ComplianceScoreProps {
  score: number;
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ComplianceScore({
  score,
  label = "Compliance Score",
  size = "md",
  className,
}: ComplianceScoreProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return { color: "text-success", bg: "bg-success", icon: CheckCircle };
    if (score >= 60) return { color: "text-warning", bg: "bg-warning", icon: AlertTriangle };
    return { color: "text-destructive", bg: "bg-destructive", icon: AlertCircle };
  };

  const { color, bg, icon: Icon } = getScoreColor(score);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const sizeStyles = {
    sm: { container: "h-24 w-24", text: "text-xl", label: "text-[10px]" },
    md: { container: "h-32 w-32", text: "text-2xl", label: "text-xs" },
    lg: { container: "h-64 w-64", text: "text-5xl", label: "text-lg" },
  };

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div className={cn("relative", sizeStyles[size].container)}>
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-muted"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={cn(color, "transition-all duration-1000 ease-out")}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("font-bold", sizeStyles[size].text, color)}>
            {score}%
          </span>
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 mt-1">
        <Icon className={cn("h-4 w-4", color)} />
        <span className={cn("font-medium text-muted-foreground", sizeStyles[size].label)}>
          {label}
        </span>
      </div>
    </div>
  );
}
