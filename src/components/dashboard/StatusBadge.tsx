import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "active" | "pending" | "action" | "info" | "success" | "warning" | "error";
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

const statusStyles = {
  active: "status-active",
  success: "status-active",
  pending: "status-pending",
  warning: "status-pending",
  action: "status-action",
  error: "status-action",
  info: "status-info",
};

export function StatusBadge({ status, children, className, dot = true }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border",
        statusStyles[status],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            (status === "active" || status === "success") && "bg-success",
            (status === "pending" || status === "warning") && "bg-warning",
            (status === "action" || status === "error") && "bg-destructive",
            status === "info" && "bg-info"
          )}
        />
      )}
      {children}
    </span>
  );
}
