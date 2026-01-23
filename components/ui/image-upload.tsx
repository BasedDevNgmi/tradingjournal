"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Image as ImageIcon, X, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value?: string;
  onChange: (value: string) => void;
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [isPasting, setIsPasting] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onChange(e.target?.result as string);
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

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          const reader = new FileReader();
          reader.onload = (e) => {
            onChange(e.target?.result as string);
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
          onPaste={handlePaste}
          className={cn(
            "border-4 border-dashed border-black bg-zinc-50 p-8 flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-zinc-100",
            isDragActive && "bg-yellow-50 border-solid",
            isPasting && "ring-4 ring-black"
          )}
        >
          <input {...getInputProps()} />
          <UploadCloud size={48} className="text-zinc-400 mb-4" />
          <p className="text-sm font-black uppercase tracking-tighter text-center text-black">
            {isDragActive ? "Drop the chart here" : "Drag & Drop or click to upload chart"}
          </p>
          <p className="text-[10px] font-bold uppercase text-zinc-400 mt-2">
            Tip: You can also paste (Cmd+V) directly here
          </p>
        </div>
      ) : (
        <div className="relative group">
          <div className="border-4 border-black bg-white overflow-hidden">
            <img 
              src={value} 
              alt="Uploaded chart" 
              className="w-full h-auto block max-h-[400px] object-contain" 
            />
          </div>
          <button
            onClick={() => onChange("")}
            className="absolute -top-4 -right-4 bg-red-400 text-black border-4 border-black p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
          >
            <X size={20} strokeWidth={4} />
          </button>
        </div>
      )}
    </div>
  );
}
