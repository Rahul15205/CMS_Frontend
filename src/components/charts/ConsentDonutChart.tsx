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
              innerRadius={65}
              outerRadius={90}
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
              align="center"
              iconType="circle"
              iconSize={8}
              formatter={(value) => (
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Centered Total Label */}
        <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-3xl font-black text-foreground leading-none">{total.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">Total</p>
        </div>
      </div>
    </div>
  );
}
