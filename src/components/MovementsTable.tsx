import React, { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, Clipboard, ShieldCheck, Database, Calendar } from "lucide-react";
import { StockMovement } from "../types";

interface MovementsTableProps {
  movements: StockMovement[];
}

export default function MovementsTable({ movements }: MovementsTableProps) {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Reset to first page when filtering results change
  useEffect(() => {
    setCurrentPage(1);
  }, [movements]);

  // Pagination logic
  const totalPages = Math.ceil(movements.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMovements = movements.slice(startIndex, startIndex + itemsPerPage);

  const formatDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div id="movements_table_container" className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden transition-all duration-300">
      <div className="flex flex-col sm:flex-row items-center justify-between p-5 border-b border-slate-100 gap-4 bg-slate-50/40">
        <div>
          <h3 className="text-base font-bold text-slate-800 font-display flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-600" />
            Stock Movements Log
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Audit logs of parsed warehouse stock operations
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-600 bg-white border border-slate-205 px-3 py-1.5 rounded-full shadow-xs">
          <span>Total Records: <strong className="text-indigo-600">{movements.length}</strong></span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider border-b border-slate-100">
              <th className="py-4 px-6">ID</th>
              <th className="py-4 px-6">Date & Time</th>
              <th className="py-4 px-6">SKU</th>
              <th className="py-4 px-6">Movement Type</th>
              <th className="py-4 px-6 text-right">Quantity</th>
              <th className="py-4 px-6">Warehouse</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {paginatedMovements.length > 0 ? (
              paginatedMovements.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-4 px-6 font-mono text-xs text-slate-400 font-semibold">{m.id}</td>
                  <td className="py-4 px-6 text-slate-600">
                    <div className="flex items-center gap-1.5 font-medium text-xs">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {formatDate(m.timestamp)}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-mono text-xs font-bold text-indigo-800 bg-indigo-50/50 px-2.5 py-1 rounded-lg border border-indigo-100 shadow-3xs">
                      {m.sku}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-bold leading-relaxed border ${
                        m.movementType === "IN"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-100"
                          : "bg-rose-50 text-rose-800 border-rose-100"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                        m.movementType === "IN" ? "bg-emerald-500" : "bg-rose-500"
                      }`} />
                      {m.movementType}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right font-bold font-mono text-slate-800">
                    {new Intl.NumberFormat().format(m.quantity)}
                  </td>
                  <td className="py-4 px-6 text-slate-600 font-bold">{m.warehouse}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400 font-semibold text-sm">
                  No stock movements found within the filtered range.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between p-5 border-t border-slate-100 bg-slate-50/40 text-sm">
        <div className="text-xs text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-700">{movements.length > 0 ? startIndex + 1 : 0}</span> to{" "}
          <span className="font-bold text-slate-700">
            {Math.min(startIndex + itemsPerPage, movements.length)}
          </span>{" "}
          of <span className="font-bold text-slate-700">{movements.length}</span> results
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors duration-200 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          <span className="text-xs text-slate-600 font-bold font-mono bg-white border border-slate-100 px-3 py-1.5 rounded-full shadow-3xs">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors duration-200 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
