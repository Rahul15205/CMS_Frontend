import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { WidgetConfig } from "@/contexts/DashboardContext";
import { GripVertical, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface WidgetCardProps {
  widget: WidgetConfig;
  children: ReactNode;
  isCustomizing?: boolean;
  className?: string;
}

const sizeClasses = {
  small: "col-span-1",
  medium: "col-span-1 lg:col-span-1",
  large: "col-span-1 lg:col-span-2",
  full: "col-span-full",
};

export function WidgetCard({
  widget,
  children,
  isCustomizing = false,
  className,
}: WidgetCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id, disabled: !isCustomizing });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (!widget.enabled) return null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "dashboard-card relative group animate-fade-in",
        sizeClasses[widget.size],
        isDragging && "shadow-xl ring-2 ring-primary/20 z-50",
        isCustomizing && "ring-1 ring-dashed ring-border",
        className
      )}
    >
      {isCustomizing && (
        <button
          {...attributes}
          {...listeners}
          className="absolute top-2 left-2 p-1.5 bg-muted rounded cursor-grab active:cursor-grabbing hover:bg-muted/80 transition-colors z-10"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
      )}
      {children}
    </div>
  );
}

// Wrapper for standard non-draggable widget display
export function StaticWidgetCard({
  widget,
  children,
  className,
}: Omit<WidgetCardProps, "isCustomizing">) {
  if (!widget.enabled) return null;

  return (
    <div
      className={cn(
        "dashboard-card animate-fade-in",
        sizeClasses[widget.size],
        className
      )}
    >
      {children}
    </div>
  );
}
