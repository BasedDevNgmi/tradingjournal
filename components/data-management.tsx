"use client";

import * as React from "react";
import { useTradesData } from "@/context/trade-context";
import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";
import { Trade } from "@/types";
import { format } from "date-fns";

function escapeCsvCell (val: unknown): string {
  if (val == null) return "";
  const s = String(val);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

type ImportConfirmState = {
  count: number;
  range: string;
  data: Trade[];
} | null;

export function DataManagement() {
  const { trades, importTrades } = useTradesData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importConfirm, setImportConfirm] = React.useState<ImportConfirmState>(null);
  const cancelImportRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (importConfirm && cancelImportRef.current) {
      cancelImportRef.current.focus();
    }
  }, [importConfirm]);

  const handleExport = () => {
    const dataStr = JSON.stringify(trades, null, 2);
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const name = `trading-journal-${new Date().toISOString().split("T")[0]}.json`;
    const link = document.createElement("a");
    link.setAttribute("href", dataUri);
    link.setAttribute("download", name);
    link.click();
  };

  const handleExportCsv = () => {
    const cols = ["date", "pair", "direction", "status", "entryPrice", "stopLoss", "takeProfit", "exitPrice", "rrPredicted", "rrRealized", "pnlAmount", "currency", "session", "notes", "lessonLearned", "confluences", "psychoTags", "followedPlan"];
    const header = cols.join(",");
    const rows = trades.map((t: Trade) =>
      cols.map((c) => {
        const v = (t as Record<string, unknown>)[c];
        if (c === "confluences" || c === "psychoTags") return escapeCsvCell(Array.isArray(v) ? v.join("; ") : v);
        return escapeCsvCell(v);
      }).join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const name = `trading-journal-${new Date().toISOString().split("T")[0]}.csv`;
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedData = JSON.parse(content);

        if (!Array.isArray(importedData)) {
          toast.error("Import failed", { description: "File must be a JSON array of trades." });
          return;
        }
        const isValid = importedData.every((item: unknown) => item && typeof item === "object" && "id" in item && "pair" in item && "status" in item);
        if (!isValid) {
          toast.error("Import failed", { description: "Invalid data format. Each trade needs id, pair, and status." });
          return;
        }

        const dates = importedData.map((t: { date?: string }) => t.date).filter(Boolean) as string[];
        const range =
          dates.length === 0
            ? "unknown dates"
            : dates.length === 1
              ? format(new Date(dates[0]), "d MMM yyyy")
              : `${format(new Date(Math.min(...dates.map((d) => new Date(d).getTime()))), "d MMM yyyy")} – ${format(new Date(Math.max(...dates.map((d) => new Date(d).getTime()))), "d MMM yyyy")}`;
        setImportConfirm({ count: importedData.length, range, data: importedData });
      } catch {
        toast.error("Import error", { description: "Could not read file. Use a valid JSON backup." });
      }
    };
    fileReader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (!importConfirm) return;
    importTrades(importConfirm.data);
    toast.success("Backup restored", { description: `Imported ${importConfirm.count} trades.` });
    setImportConfirm(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCancelImport = () => {
    setImportConfirm(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-6 relative">
      {importConfirm && (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-background/90 backdrop-blur-sm rounded-2xl"
          role="alertdialog"
          aria-labelledby="import-dialog-title"
          aria-describedby="import-dialog-desc"
        >
          <div className="bg-card border border-border rounded-xl shadow-xl p-6 max-w-sm w-full space-y-4">
            <h3 id="import-dialog-title" className="text-lg font-semibold text-foreground">
              Import backup?
            </h3>
            <p id="import-dialog-desc" className="text-sm text-muted-foreground">
              Import {importConfirm.count} trades ({importConfirm.range}). This will replace your
              current journal data.
            </p>
            <div className="flex gap-3 pt-2">
              <Button
                ref={cancelImportRef}
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleCancelImport}
              >
                Cancel
              </Button>
              <Button type="button" className="flex-1" onClick={handleConfirmImport}>
                Import
              </Button>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col gap-4">
        <div className="p-5 rounded-2xl border border-border bg-muted/30 space-y-4">
          <div className="flex items-center gap-2">
            <Download size={14} className="text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Export Journal</h3>
          </div>
          <p className="text-sm font-medium text-muted-foreground/60 leading-relaxed">
            Download your entire history as JSON or CSV.
          </p>
          <div className="flex gap-2">
            <Button onClick={handleExport} variant="outline" className="flex-1 h-10 text-sm font-semibold rounded-xl border-2 hover:bg-card transition-all">
              JSON
            </Button>
            <Button onClick={handleExportCsv} variant="outline" className="flex-1 h-10 text-sm font-semibold rounded-xl border-2 hover:bg-card transition-all">
              CSV
            </Button>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-muted/30 space-y-4">
          <div className="flex items-center gap-2">
            <Upload size={14} className="text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Restore Backup</h3>
          </div>
          <p className="text-sm font-medium text-muted-foreground/60 leading-relaxed">
            Upload a JSON backup. You’ll see trade count and date range before confirming.
          </p>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImport} 
            accept=".json" 
            className="hidden" 
          />
          <Button 
            onClick={() => fileInputRef.current?.click()} 
            variant="outline"
            className="w-full h-10 text-sm font-semibold rounded-xl border-2 hover:bg-card transition-all"
          >
            Upload JSON
          </Button>
        </div>
      </div>
    </div>
  );
}
