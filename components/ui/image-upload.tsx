"use client";

import * as React from "react";
import { useDropzone } from "react-dropzone";
import { Image as ImageIcon, X, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value?: string;
  onChange: (value: string) => void;
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [isOptimizing, setIsOptimizing] = React.useState(false);

  const optimizeImage = async (base64Image: string) => {
    setIsOptimizing(true);
    try {
      const response = await fetch("/api/optimize-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Image }),
      });
      
      if (response.ok) {
        const data = await response.json();
        onChange(data.optimizedImage);
      } else {
        // Fallback to original if optimization fails
        onChange(base64Image);
      }
    } catch (error) {
      console.error("Optimization failed:", error);
      onChange(base64Image);
    } finally {
      setIsOptimizing(false);
    }
  };

  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        optimizeImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxFiles: 1
  });

  const handlePaste = React.useCallback((e: React.ClipboardEvent | ClipboardEvent) => {
    const clipboardData = (e as React.ClipboardEvent).clipboardData || (e as ClipboardEvent).clipboardData;
    if (!clipboardData) return;

    const items = clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            optimizeImage(reader.result as string);
          };
          reader.readAsDataURL(blob);
        }
      }
    }
  }, [onChange]);

  return (
    <div className="space-y-4">
      {!value ? (
        <div
          {...getRootProps()}
          tabIndex={0}
          onPaste={handlePaste}
          className={cn(
            "border border-dashed border-border bg-muted/30 p-6 flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-muted/50 hover:border-border outline-none focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent",
            isDragActive && "bg-muted/50 border-border border-solid",
            isOptimizing && "opacity-50 cursor-wait"
          )}
        >
          <input {...getInputProps()} />
          <UploadCloud size={28} className={cn("text-muted-foreground mb-3 transition-colors", isDragActive && "text-foreground", isOptimizing && "animate-bounce")} />
          <p className="text-xs font-medium text-center text-muted-foreground leading-tight">
            {isOptimizing ? "Optimizing Chart..." : isDragActive ? "Drop the chart here" : "Click or Drag & Drop"}
          </p>
          <p className="text-[9px] font-medium uppercase text-muted-foreground/70 mt-1.5 opacity-60">
            {isOptimizing ? "Converting to WebP" : "Paste (Cmd+V)"}
          </p>
        </div>
      ) : (
        <div className="relative group">
          <div className="border border-border bg-card overflow-hidden rounded-lg shadow-sm">
            <img 
              src={value} 
              alt="Uploaded chart" 
              className="w-full h-auto block max-h-[300px] object-contain" 
            />
          </div>
          <button
            onClick={() => onChange("")}
            className="absolute -top-2 -right-2 bg-card text-muted-foreground border border-border p-1.5 rounded-full shadow-md hover:bg-danger/10 hover:text-danger hover:border-danger/20 transition-all"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
