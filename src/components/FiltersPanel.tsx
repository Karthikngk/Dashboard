import React from "react";
import { Calendar, Filter, Archive, ArrowUpDown } from "lucide-react";
import { Filters } from "../types";

interface FiltersPanelProps {
  filters: Filters;
  onFilterChange: (newFilters: Filters) => void;
  warehouses: string[];
}

export default function FiltersPanel({ filters, onFilterChange, warehouses }: FiltersPanelProps) {
  const handleChange = (key: keyof Filters, value: string) => {
    onFilterChange({
      ...filters,
      [key]: value
    });
  };

  return (
    <div id="filters_card" className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm transition-all duration-300">
      <h3 className="text-base font-bold text-slate-800 font-display flex items-center gap-2 border-b border-slate-100 pb-3 mb-5">
        <Filter className="w-5 h-5 text-indigo-600" />
        Filter Dataset
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Date From */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            Date From
          </label>
          <input
            type="date"
            value={filters.from}
            onChange={(e) => handleChange("from", e.target.value)}
            className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
        </div>

        {/* Date To */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            Date To
          </label>
          <input
            type="date"
            value={filters.to}
            onChange={(e) => handleChange("to", e.target.value)}
            className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
        </div>

        {/* Movement Type */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            Movement Type
          </label>
          <select
            value={filters.type}
            onChange={(e) => handleChange("type", e.target.value as any)}
            className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors cursor-pointer"
          >
            <option value="ALL">All Movements</option>
            <option value="IN">IN (Stock Incoming)</option>
            <option value="OUT">OUT (Stock Outgoing)</option>
          </select>
        </div>

        {/* Warehouse Dropdown (Bonus) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
            <Archive className="w-3.5 h-3.5 text-slate-400" />
            Warehouse
          </label>
          <select
            value={filters.warehouse}
            onChange={(e) => handleChange("warehouse", e.target.value)}
            className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors cursor-pointer"
          >
            <option value="ALL">All Warehouses</option>
            {warehouses.map((wh) => (
              <option key={wh} value={wh}>
                {wh}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
