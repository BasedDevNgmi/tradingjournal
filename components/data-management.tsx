"use client";

import { useRef } from "react";
import { useTrades } from "@/context/trade-context";
import { Download, Upload, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DataManagement() {
  const { trades, importTrades } = useTrades();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const dataStr = JSON.stringify(trades, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `trading-journal-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const files = event.target.files;
    
    if (!files || files.length === 0) return;

    fileReader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedData = JSON.parse(content);

        // Basic validation
        if (!Array.isArray(importedData)) {
          throw new Error("Invalid format: Expected an array of trades.");
        }

        const isValid = importedData.every(item => 
          item.id && item.pair && item.status && item.direction
        );

        if (!isValid) {
          throw new Error("Invalid data: Some trades are missing required fields.");
        }

        if (window.confirm("WARNING: This will overwrite ALL your current trades. Are you sure you want to continue?")) {
          importTrades(importedData);
          alert("Backup restored successfully!");
        }
      } catch (err) {
        alert(`Error importing data: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
      
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = "";
    };

    fileReader.readAsText(files[0]);
  };

  return (
    <section className="brutalist-card bg-zinc-50 space-y-6">
      <div className="flex items-center gap-2 border-b-2 border-black pb-2">
        <Download size={20} />
        <h3 className="text-sm font-black uppercase tracking-widest">Data Management</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Export */}
        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase text-zinc-500">
            Keep your data safe by downloading a local backup.
          </p>
          <Button 
            onClick={handleExport}
            variant="outline"
            className="w-full h-14 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
          >
            <Download className="mr-2" size={18} />
            Download Backup
          </Button>
        </div>

        {/* Import */}
        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase text-red-500 flex items-center gap-1">
            <AlertTriangle size={12} />
            Restoring will overwrite current data.
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
            className="w-full h-14 bg-black text-white shadow-[4px_4px_0px_0px_rgba(239,68,68,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
          >
            <Upload className="mr-2" size={18} />
            Restore Backup
          </Button>
        </div>
      </div>
    </section>
  );
}
