"use client";

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Image as ImageIcon, Upload, X, Clipboard } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  value?: string;
  onChange: (value: string) => void;
  className?: string;
}

export function ImageUpload({ value, onChange, className }: ImageUploadProps) {
  const [isPasting, setIsPasting] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1
  });

  // Handle paste events
  const handlePaste = useCallback((event: React.ClipboardEvent) => {
    const items = event.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          const reader = new FileReader();
          reader.onloadend = () => {
            onChange(reader.result as string);
          };
          reader.readAsDataURL(blob);
        }
      }
    }
  }, [onChange]);

  return (
    <div className={cn("space-y-4", className)} onPaste={handlePaste}>
      {!value ? (
        <div
          {...getRootProps()}
          className={cn(
            "border-4 border-dashed border-black p-8 flex flex-col items-center justify-center gap-4 cursor-pointer transition-colors bg-zinc-50 hover:bg-zinc-100",
            isDragActive && "bg-yellow-50 border-solid"
          )}
        >
          <input {...getInputProps()} />
          <div className="p-4 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <Upload size={32} strokeWidth={3} />
          </div>
          <div className="text-center">
            <p className="text-sm font-black uppercase tracking-tighter">
              Click to upload or drag & drop
            </p>
            <p className="text-[10px] font-bold uppercase text-zinc-400 mt-1 flex items-center justify-center gap-1">
              <Clipboard size={10} /> Tip: You can also paste (Cmd+V) images here
            </p>
          </div>
        </div>
      ) : (
        <div className="relative group border-4 border-black overflow-hidden bg-zinc-100">
          <img 
            src={value} 
            alt="Preview" 
            className="w-full h-auto block max-h-[400px] object-contain" 
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => onChange("")}
              className="bg-red-500 text-white p-3 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
            >
              <X size={24} strokeWidth={3} />
            </button>
          </div>
          <div className="absolute bottom-2 left-2 bg-black text-white px-2 py-1 text-[10px] font-black uppercase tracking-widest">
            Preview
          </div>
        </div>
      )}
    </div>
  );
}
