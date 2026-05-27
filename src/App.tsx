import React, { useState, useEffect } from "react";
import { 
  Package, 
  RefreshCw, 
  HelpCircle, 
  Layers, 
  FileCheck, 
  CheckCircle, 
  Sparkles,
  Search,
  Filter
} from "lucide-react";
import { StockMovement, Filters } from "./types";
import FiltersPanel from "./components/FiltersPanel";
import MetricCards from "./components/MetricCards";
import MovementsTable from "./components/MovementsTable";
import ChartsSection from "./components/ChartsSection";
import UploadZone from "./components/UploadZone";

export default function App() {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [warehouses, setWarehouses] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Default filters spanning the entire year of 2026 records
  const [filters, setFilters] = useState<Filters>({
    from: "2026-01-01",
    to: "2026-12-31",
    type: "ALL",
    warehouse: "ALL"
  });

  // Fetch movements from Express API based on selected filters
  const fetchMovements = async (currentFilters: Filters) => {
    setIsLoading(true);
    setError(null);
    try {
      const url = new URL("/api/movements", window.location.origin);
      if (currentFilters.from) url.searchParams.append("from", currentFilters.from);
      if (currentFilters.to) url.searchParams.append("to", currentFilters.to);
      if (currentFilters.type && currentFilters.type !== "ALL") {
        url.searchParams.append("type", currentFilters.type);
      }
      if (currentFilters.warehouse && currentFilters.warehouse !== "ALL") {
        url.searchParams.append("warehouse", currentFilters.warehouse);
      }

      const res = await fetch(url.toString());
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setMovements(data);
    } catch (e: any) {
      console.error("Error fetching filtered movements:", e);
      setError("Failed to load records. Make sure the backend server is running.");
    } finally {
      setIsLoading(false);
    }
  };

  // Run once on mount to establish the unique warehouses list across the whole year
  const discoverWarehouses = async () => {
    try {
      const res = await fetch("/api/movements?from=2026-01-01&to=2026-12-31");
      if (res.ok) {
        const data = await res.json();
        const uniqueWhs = Array.from(new Set(data.map((m: any) => m.warehouse))) as string[];
        setWarehouses(uniqueWhs.sort());
      }
    } catch (e) {
      console.error("Error discovering warehouses:", e);
    }
  };

  // Re-fetch when any filter changes
  useEffect(() => {
    fetchMovements(filters);
  }, [filters]);

  // Initial load
  useEffect(() => {
    discoverWarehouses();
  }, []);

  // Callback triggered after successful file upload and digest validation
  const handleUploadedDataset = (newMovements: any[]) => {
    // Rediscover unique warehouses from the newly uploaded dataset
    const uniqueWhs = Array.from(new Set(newMovements.map((m: any) => m.warehouse))) as string[];
    setWarehouses(uniqueWhs.sort());
    
    // Reset filters to default year view so user sees total uploaded data
    setFilters({
      from: "2026-01-01",
      to: "2026-12-31",
      type: "ALL",
      warehouse: "ALL"
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-700 antialiased font-sans">
      {/* Upper Brand Decorative Bar */}
      <div className="h-1.5 w-full bg-indigo-600" />
      
      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header Hero Layout */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-205 pb-5">
          <div className="gap-2 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-indigo-600 rounded-2xl text-white shadow-md shadow-indigo-600/10">
                <Package className="w-6 h-6 stroke-[2]" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-slate-900 font-display">
                  Inventory Movement Dashboard
                </h1>
                <p className="text-xs text-slate-400 font-semibold">
                  Verify stock JSON verification keys & analyze multi-warehouse balances
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                fetchMovements(filters);
                discoverWarehouses();
              }}
              className="px-4 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-full flex items-center gap-2 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <span className="inline-flex items-center gap-1.5 px-3 py-2 border border-emerald-100 bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase tracking-wider rounded-full">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              Secure Link Active
            </span>
          </div>
        </header>

        {/* Top Section Layout: Upload Gate + Filters Panel inside a 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* File Upload Zone - Takes 1 column on large screens */}
          <div className="lg:col-span-1">
            <UploadZone onUploadSuccess={handleUploadedDataset} />
          </div>

          {/* Filters & Control Deck - Takes 2 columns on large screens */}
          <div className="lg:col-span-2 space-y-6">
            <FiltersPanel 
              filters={filters} 
              onFilterChange={setFilters} 
              warehouses={warehouses} 
            />
            
            {/* Quick Metrics display */}
            <MetricCards movements={movements} />
          </div>
        </div>

        {/* Charts & Analytics Visualizers */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Data Analytics Visualizations
            </h2>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Dynamic query feedback loop</span>
          </div>
          <ChartsSection movements={movements} />
        </section>

        {/* Data Log Audit Table */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
              <Search className="w-4 h-4 text-indigo-600" />
              Detailed Exploration
            </h2>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Auditable database logs</span>
          </div>
          
          {isLoading ? (
            <div className="bg-white rounded-[2rem] border border-slate-200 p-12 text-center flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
              <p className="text-sm text-slate-500 font-bold">Querying warehouse log datasets...</p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-[2rem] border border-slate-200 p-12 text-center text-rose-600 font-black flex flex-col items-center gap-2">
              <span>{error}</span>
              <button 
                onClick={() => fetchMovements(filters)}
                className="mt-2 text-xs text-indigo-600 hover:text-indigo-700 font-bold underline"
              >
                Retry Request
              </button>
            </div>
          ) : (
            <MovementsTable movements={movements} />
          )}
        </section>
      </div>
      
      {/* Standard Footer */}
      <footer className="bg-white border-t border-slate-100 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-[10px] text-slate-400 font-bold uppercase tracking-wider space-y-1">
          <p>© 2026 Stock Inventory Movement Dashboard • Hashed JSON Integrity Verification gate.</p>
          <p>Handcrafted using React 19, Recharts & Express server.</p>
        </div>
      </footer>
    </div>
  );
}
