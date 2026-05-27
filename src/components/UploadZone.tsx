import React, { useState, useRef } from "react";
import { Upload, FileCode, CheckCircle2, AlertCircle, Fingerprint, RefreshCw } from "lucide-react";

interface UploadZoneProps {
  onUploadSuccess: (movements: any[]) => void;
}

export default function UploadZone({ onUploadSuccess }: UploadZoneProps) {
  const [file, setFile] = useState<File | null>(null);
  const [computedHash, setComputedHash] = useState<string>("");
  const [userHash, setUserHash] = useState<string>("");
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate SHA-256 digest using built-in Crypto Web API
  const calculateSHA256 = async (selectedFile: File): Promise<string> => {
    setIsCalculating(true);
    setStatusMessage({ type: "info", text: "Computing SHA-256 digest in frontend..." });
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
      return hashHex;
    } catch (e: any) {
      console.error(e);
      setStatusMessage({ type: "error", text: "Error computing file hash: " + e.message });
      return "";
    } finally {
      setIsCalculating(false);
    }
  };

  const handleFileChange = async (selectedFile: File | null) => {
    if (!selectedFile) return;
    if (selectedFile.type !== "application/json" && !selectedFile.name.endsWith(".json")) {
      setStatusMessage({ type: "error", text: "Only JSON files are supported" });
      return;
    }

    setFile(selectedFile);
    setStatusMessage(null);

    const hash = await calculateSHA256(selectedFile);
    if (hash) {
      setComputedHash(hash);
      setUserHash(hash); // Populate input with calculated hash by default
      setStatusMessage({
        type: "success",
        text: `Frontend successfully computed SHA-256 digest: ${hash.substring(0, 10)}...`
      });
    }
  };

  const onDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleManualUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    setStatusMessage({ type: "info", text: "Uploading file and hash to backend for verification..." });

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("sha256", userHash.trim()); // Send client-provided hash (could be modified for testing)

      const response = await fetch("/api/verify-file", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Verification failed");
      }

      setStatusMessage({
        type: "success",
        text: `Verification Succeeded! Backend recomputed same SHA hash. Saved ${result.count} records.`
      });
      
      // Trigger success callback to reload dashboard with new dataset
      onUploadSuccess(result.data);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: "error", text: err.message || "An unexpected error occurred." });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div id="upload_zone_card" className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm transition-all duration-300">
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
        <h3 className="text-base font-bold text-slate-800 font-display flex items-center gap-2">
          <Upload className="w-5 h-5 text-indigo-600" />
          JSON + SHA-256 Validation
        </h3>
        <span className="text-[10px] text-slate-500 bg-slate-100 uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full">
          Secure Gate
        </span>
      </div>

      <div
        className={`relative flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition-all duration-300 ${
          dragActive
            ? "border-indigo-500 bg-indigo-50/50"
            : file
            ? "border-emerald-500 bg-emerald-50/10"
            : "border-slate-200 hover:border-indigo-400 bg-slate-50/50 cursor-pointer"
        }`}
        onDragEnter={onDrag}
        onDragOver={onDrag}
        onDragLeave={onDrag}
        onDrop={onDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
          className="hidden"
        />

        {file ? (
          <div className="flex flex-col items-center text-center">
            <div className="p-3 bg-emerald-100 rounded-full text-emerald-600 mb-3">
              <FileCode className="w-8 h-8" />
            </div>
            <p className="text-sm font-medium text-slate-800">{file.name}</p>
            <p className="text-xs text-slate-500 mt-1">
              {(file.size / 1024).toFixed(2)} KB • JSON Dataset
            </p>
          </div>
        ) : (
          <div 
            onClick={() => fileInputRef.current?.click()} 
            className="flex flex-col items-center cursor-pointer text-center group"
          >
            <div className="p-3 bg-slate-100 rounded-full text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors duration-300 mb-3">
              <Upload className="w-8 h-8" />
            </div>
            <p className="text-sm font-medium text-slate-700">
              Drag & drop your JSON file, or{" "}
              <span className="text-indigo-600 font-semibold group-hover:underline">browse</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Only authentic stock movements schema JSON files are supported
            </p>
          </div>
        )}
      </div>

      {/* Hash computation stats / editable field */}
      {file && (
        <form onSubmit={handleManualUpload} className="mt-5 space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 font-mono">
                <Fingerprint className="w-3.5 h-3.5 text-indigo-600" />
                SHA-256 HASH (calculated in frontend)
              </span>
              <button
                type="button"
                onClick={() => handleFileChange(file)}
                disabled={isCalculating}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isCalculating ? "animate-spin" : ""}`} />
                Recalculate
              </button>
            </div>
            
            <input
              type="text"
              value={userHash}
              onChange={(e) => setUserHash(e.target.value)}
              placeholder="SHA-256 hash output"
              className="w-full text-xs font-mono bg-white border border-slate-200 rounded-lg p-2.5 text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              disabled={isCalculating}
            />
            <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">
              * Note: We automatically calculated this hash using browser web-crypto. You can modify it manually to trigger and test hash certification failures in the Spring Boot equivalent backend!
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setFile(null);
                setComputedHash("");
                setUserHash("");
                setStatusMessage(null);
              }}
              className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Reset File
            </button>
            <button
              type="submit"
              disabled={isUploading || isCalculating || !userHash}
              className="flex-1 px-4 py-2.5 rounded-lg bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center gap-1 cursor-pointer"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify and Apply"
              )}
            </button>
          </div>
        </form>
      )}

      {/* Validation status feedback banner */}
      {statusMessage && (
        <div
          className={`mt-4 p-3.5 rounded-xl flex items-start gap-2.5 text-xs transition-opacity duration-300 ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-100"
              : statusMessage.type === "error"
              ? "bg-rose-50 text-rose-800 border border-rose-100"
              : "bg-indigo-50 text-indigo-800 border border-indigo-100"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          )}
          <span className="break-all">{statusMessage.text}</span>
        </div>
      )}
    </div>
  );
}
