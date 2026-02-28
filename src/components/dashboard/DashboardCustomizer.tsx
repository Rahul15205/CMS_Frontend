import { useState } from "react";
import { Settings2, GripVertical, Eye, EyeOff, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDashboard, WidgetConfig } from "@/contexts/DashboardContext";
import { cn } from "@/lib/utils";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableWidgetItemProps {
  widget: WidgetConfig;
  onToggle: () => void;
}

function SortableWidgetItem({ widget, onToggle }: SortableWidgetItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const sizeLabels = {
    small: "SM",
    medium: "MD",
    large: "LG",
    full: "FULL",
  };

  const typeLabels = {
    kpi: "KPI",
    chart: "Chart",
    compliance: "Compliance",
    actions: "Actions",
    activity: "Activity",
    alerts: "Alerts",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 p-3 bg-card border border-border rounded-lg transition-all",
        isDragging && "shadow-lg ring-2 ring-primary/20 z-50",
        !widget.enabled && "opacity-60"
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">{widget.title}</span>
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <Badge variant="outline" className="text-[10px] px-1.5">
            {typeLabels[widget.type as keyof typeof typeLabels] || widget.type}
          </Badge>
          <Badge variant="secondary" className="text-[10px] px-1.5">
            {sizeLabels[widget.size]}
          </Badge>
        </div>
      </div>

      <Switch
        checked={widget.enabled}
        onCheckedChange={onToggle}
        aria-label={`Toggle ${widget.title}`}
      />
    </div>
  );
}

export function DashboardCustomizer() {
  const { config, toggleWidget, reorderWidgets, resetToDefault, roleLabels } = useDashboard();
  const [open, setOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = config.widgets.findIndex((w) => w.id === active.id);
      const newIndex = config.widgets.findIndex((w) => w.id === over.id);

      const newWidgets = arrayMove(config.widgets, oldIndex, newIndex).map(
        (w, index) => ({ ...w, order: index })
      );
      reorderWidgets(newWidgets);
    }
  };

  const enabledCount = config.widgets.filter((w) => w.enabled).length;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings2 className="h-4 w-4" />
          <span className="hidden sm:inline">Customize</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Customize Dashboard
          </SheetTitle>
          <SheetDescription>
            Configure widgets for {roleLabels[config.role]} view. Drag to reorder, toggle to show/hide.
          </SheetDescription>
        </SheetHeader>

        <div className="py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {enabledCount} of {config.widgets.length} widgets enabled
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetToDefault}
              className="gap-1 text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
          </div>

          <ScrollArea className="h-[calc(100vh-280px)]">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={config.widgets.map((w) => w.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2 pr-4">
                  {config.widgets
                    .sort((a, b) => a.order - b.order)
                    .map((widget) => (
                      <SortableWidgetItem
                        key={widget.id}
                        widget={widget}
                        onToggle={() => toggleWidget(widget.id)}
                      />
                    ))}
                </div>
              </SortableContext>
            </DndContext>
          </ScrollArea>
        </div>

        <SheetFooter>
          <Button onClick={() => setOpen(false)} className="w-full">
            Done
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
