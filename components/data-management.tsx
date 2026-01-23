"use client";

import { useTrades } from "@/context/trade-context";
import { Button } from "@/components/ui/button";
import { Download, Upload, AlertTriangle } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";

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
    const file = event.target.files?.[0];

    if (!file) return;

    fileReader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedData = JSON.parse(content);

        // Basic validation
        if (Array.isArray(importedData)) {
          const isValid = importedData.every(item => item.id && item.pair && item.status);
          
          if (isValid) {
            if (window.confirm("This will overwrite your current trades. Are you sure you want to proceed?")) {
              importTrades(importedData);
              toast.success("BACKUP RESTORED", {
                description: `Imported ${importedData.length} trades successfully.`
              });
            }
          } else {
            toast.error("IMPORT FAILED", {
              description: "Invalid data format. Please check the backup file."
            });
          }
        }
      } catch (err) {
        toast.error("IMPORT ERROR", {
          description: "Could not read file. Make sure it's a valid JSON."
        });
      }
    };

    fileReader.readAsText(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-6 text-black">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 brutalist-card space-y-4">
          <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
            <Download size={20} /> Export Journal
          </h3>
          <p className="text-sm font-bold text-zinc-500">
            Save a backup of your entire trading journal. All screenshots and notes are included in the JSON file.
          </p>
          <Button onClick={handleExport} variant="outline" className="w-full">
            Download Backup
          </Button>
        </div>

        <div className="flex-1 brutalist-card space-y-4 bg-zinc-50">
          <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
            <Upload size={20} /> Restore Backup
          </h3>
          <p className="text-sm font-bold text-zinc-500">
            Import a previously exported journal. <span className="text-red-600 italic font-black">WARNING:</span> This will replace all current data.
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
            className="w-full bg-black text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(239,68,68,1)]"
          >
            Restore Backup
          </Button>
        </div>
      </div>
    </div>
  );
}
