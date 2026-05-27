import React from "react";
import { ArrowUpRight, ArrowDownRight, RefreshCw, Layers, TrendingUp } from "lucide-react";
import { StockMovement } from "../types";

interface MetricCardsProps {
  movements: StockMovement[];
}

export default function MetricCards({ movements }: MetricCardsProps) {
  // Aggregate calculations
  const totalMoves = movements.length;

  const totalInQty = movements
    .filter((m) => m.movementType === "IN")
    .reduce((sum, m) => sum + m.quantity, 0);

  const totalOutQty = movements
    .filter((m) => m.movementType === "OUT")
    .reduce((sum, m) => sum + m.quantity, 0);

  const netChange = totalInQty - totalOutQty;

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* Total Moves Count Card (Indigo Bento Box) */}
      <div 
        id="metric_total_moves"
        className="bg-indigo-50 border border-indigo-100 p-5 rounded-[1.75rem] flex items-center justify-between transition-all duration-300 hover:shadow-md"
      >
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-indigo-900/60 uppercase tracking-widest">Total Operations</p>
          <h4 className="text-2xl font-bold text-indigo-950 font-display">{formatNumber(totalMoves)}</h4>
          <p className="text-[10px] text-indigo-900/50 font-medium">Filtered data movements</p>
        </div>
        <div className="p-3 bg-indigo-600 rounded-xl text-white">
          <Layers className="w-5 h-5" />
        </div>
      </div>

      {/* Aggregate Quantity IN Card */}
      <div 
        id="metric_qty_in"
        className="bg-white p-5 rounded-[1.75rem] border border-slate-200 shadow-sm flex items-center justify-between transition-all duration-300 hover:shadow-md"
      >
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Quantity IN</p>
          <h4 className="text-2xl font-bold text-emerald-600 font-display">+{formatNumber(totalInQty)}</h4>
          <p className="text-[10px] text-slate-500 font-medium">Incoming stock volume</p>
        </div>
        <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
          <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
        </div>
      </div>

      {/* Aggregate Quantity OUT Card */}
      <div 
        id="metric_qty_out"
        className="bg-white p-5 rounded-[1.75rem] border border-slate-200 shadow-sm flex items-center justify-between transition-all duration-300 hover:shadow-md"
      >
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Quantity OUT</p>
          <h4 className="text-2xl font-bold text-rose-600 font-display">-{formatNumber(totalOutQty)}</h4>
          <p className="text-[10px] text-slate-500 font-medium">Outgoing stock volume</p>
        </div>
        <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
          <ArrowDownRight className="w-5 h-5 stroke-[2.5]" />
        </div>
      </div>

      {/* Net Stock Change Card */}
      <div 
        id="metric_net_change"
        className="bg-white p-5 rounded-[1.75rem] border border-slate-200 shadow-sm flex items-center justify-between transition-all duration-300 hover:shadow-md"
      >
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Net Inventory Shift</p>
          <h4 className={`text-2xl font-bold font-display ${netChange >= 0 ? "text-indigo-600" : "text-amber-600"}`}>
            {netChange >= 0 ? "+" : ""}{formatNumber(netChange)}
          </h4>
          <p className="text-[10px] text-slate-500 font-medium">Net store balance (IN-OUT)</p>
        </div>
        <div className={`p-3 rounded-xl ${netChange >= 0 ? "bg-indigo-50 text-indigo-600" : "bg-amber-50 text-amber-600"}`}>
          <TrendingUp className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
