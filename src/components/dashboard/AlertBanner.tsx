import { cn } from "@/lib/utils";
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AlertBannerProps {
  variant: "success" | "warning" | "error" | "info";
  title: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
  className?: string;
}

const variantConfig = {
  success: {
    icon: CheckCircle,
    className: "alert-banner-success",
  },
  warning: {
    icon: AlertTriangle,
    className: "alert-banner-warning",
  },
  error: {
    icon: AlertCircle,
    className: "alert-banner-error",
  },
  info: {
    icon: Info,
    className: "alert-banner-info",
  },
};

export function AlertBanner({
  variant,
  title,
  message,
  action,
  onDismiss,
  className,
}: AlertBannerProps) {
  const { icon: Icon, className: variantClassName } = variantConfig[variant];

  return (
    <div className={cn("alert-banner items-start", variantClassName, className)}>
      <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0 pt-0.5">
        <p className="font-medium leading-none">{title}</p>
        {message && <p className="text-sm opacity-90 mt-1.5 leading-normal">{message}</p>}
      </div>
      {action && (
        <Button
          size="sm"
          variant="ghost"
          className="flex-shrink-0 hover:bg-current/10"
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
      {onDismiss && (
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6 flex-shrink-0 hover:bg-current/10"
          onClick={onDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
