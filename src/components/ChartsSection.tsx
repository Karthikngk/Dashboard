import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area
} from "recharts";
import { PieChart as PieIcon, TrendingUp, HelpCircle } from "lucide-react";
import { StockMovement } from "../types";

interface ChartsSectionProps {
  movements: StockMovement[];
}

export default function ChartsSection({ movements }: ChartsSectionProps) {
  
  // 1. Process Pie Chart Data (IN vs OUT proportion)
  const totalIn = movements
    .filter((m) => m.movementType === "IN")
    .reduce((sum, m) => sum + m.quantity, 0);

  const totalOut = movements
    .filter((m) => m.movementType === "OUT")
    .reduce((sum, m) => sum + m.quantity, 0);

  const pieData = [
    { name: "Incoming (IN)", value: totalIn, color: "#6366f1" }, // Indigo-500
    { name: "Outgoing (OUT)", value: totalOut, color: "#f43f5e" }, // Rose-500
  ];

  const hasData = totalIn > 0 || totalOut > 0;

  // 2. Process Time-Series Chart Data (Daily buckets)
  const getTimeseriesData = () => {
    const dailyMap: { [date: string]: { date: string; IN: number; OUT: number } } = {};

    movements.forEach((m) => {
      // Get chronological date string YYYY-MM-DD
      const dateStr = m.timestamp.split("T")[0];
      if (!dailyMap[dateStr]) {
        dailyMap[dateStr] = { date: dateStr, IN: 0, OUT: 0 };
      }
      if (m.movementType === "IN") {
        dailyMap[dateStr].IN += m.quantity;
      } else {
        dailyMap[dateStr].OUT += m.quantity;
      }
    });

    // Sort chronologically
    return Object.values(dailyMap).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  };

  const timeseriesData = getTimeseriesData();

  const formatDateLabel = (tick: string) => {
    try {
      const date = new Date(tick);
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return tick;
    }
  };

  const formatQuantity = (val: number) => {
    return new Intl.NumberFormat().format(val);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Pie Chart Card */}
      <div id="pie_chart_card" className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col transition-all duration-300 hover:shadow-md lg:col-span-1">
        <h3 className="text-base font-bold text-slate-800 font-display flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
          <PieIcon className="w-5 h-5 text-indigo-600" />
          Proportion (IN vs OUT)
        </h3>
        
        {hasData ? (
          <div className="flex-1 flex flex-col justify-between">
            <div className="relative h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [formatQuantity(value), "Quantity"]}
                    contentStyle={{ borderRadius: "16px", border: "1px solid #e2e8f0" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Absolutes central indicator inside Donut layout */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
                <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400">Total Moved</span>
                <span className="text-xl font-black text-slate-800 font-display">
                  {formatQuantity(totalIn + totalOut)}
                </span>
              </div>
            </div>

            {/* Custom high-contrast label guides for Donut slice breakdown */}
            <div className="space-y-2 mt-2">
              {pieData.map((d) => {
                const total = totalIn + totalOut || 1;
                const pct = ((d.value / total) * 100).toFixed(1);
                return (
                  <div key={d.name} className="flex items-center justify-between text-xs p-3 rounded-2xl border border-slate-150 bg-slate-50/50">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                      <span className="text-slate-600 font-bold">{d.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-slate-800 block">{formatQuantity(d.value)}</span>
                      <span className="text-[10px] text-slate-400 font-bold">{pct}% of total</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 min-h-64">
            <HelpCircle className="w-8 h-8 text-slate-300 stroke-[1.5] mb-2" />
            <p className="text-sm font-medium">No filtered records to report</p>
          </div>
        )}
      </div>

      {/* Time-Series Chart Card */}
      <div id="timeseries_chart_card" className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col transition-all duration-300 hover:shadow-md lg:col-span-2">
        <h3 className="text-base font-bold text-slate-800 font-display flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          Time-Series Movement Trends
        </h3>

        {timeseriesData.length > 0 ? (
          <div className="flex-1 min-h-64">
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={timeseriesData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                   <linearGradient id="gradientIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.01} />
                  </linearGradient>
                  <linearGradient id="gradientOut" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDateLabel} 
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis 
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatQuantity}
                  dx={-10}
                />
                <Tooltip 
                  labelFormatter={(tick) => {
                    try {
                      return new Date(tick).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      });
                    } catch {
                      return tick;
                    }
                  }}
                  formatter={(value: number) => [formatQuantity(value), "Quantity"]}
                  contentStyle={{ borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", paddingTop: "15px" }} />
                <Area 
                  type="monotone" 
                  dataKey="IN" 
                  name="Stock Incoming (IN)" 
                  stroke="#6366f1" 
                  fillOpacity={1}
                  fill="url(#gradientIn)" 
                  strokeWidth={2.5}
                />
                <Area 
                  type="monotone" 
                  dataKey="OUT" 
                  name="Stock Outgoing (OUT)" 
                  stroke="#f43f5e" 
                  fillOpacity={1}
                  fill="url(#gradientOut)" 
                  strokeWidth={2.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 min-h-64">
            <HelpCircle className="w-8 h-8 text-slate-300 stroke-[1.5] mb-2" />
            <p className="text-sm font-medium">No chronological log data present in range</p>
          </div>
        )}
      </div>

    </div>
  );
}
