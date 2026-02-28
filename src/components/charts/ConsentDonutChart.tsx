import { cn } from "@/lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface ConsentDonutChartProps {
  data: {
    name: string;
    value: number;
    color: string;
  }[];
  title?: string;
  className?: string;
}

export function ConsentDonutChart({ data, title, className }: ConsentDonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className={cn("dashboard-card flex flex-col", className)}>
      {title && (
        <h3 className="text-sm font-semibold text-foreground mb-4">{title}</h3>
      )}
      <div className="h-80 flex-grow relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={110}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              formatter={(value: number) => [
                `${value.toLocaleString()} (${((value / total) * 100).toFixed(1)}%)`,
                "",
              ]}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => (
                <span className="text-sm text-muted-foreground">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Centered Total Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
          <p className="text-3xl font-bold text-foreground">{total.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Total</p>
        </div>
      </div>
    </div>
  );
}
