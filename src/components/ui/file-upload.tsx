"use client";

import * as React from "react";
import { UploadCloud, File, X } from "lucide-react";
import { cn, formatBytes } from "@/src/lib/utils";

export interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  maxSizeMB?: number;
  acceptedTypes?: string[]; // e.g. ['application/pdf', 'image/*']
  multiple?: boolean;
  className?: string;
}

export function FileUpload({
  onFileSelect,
  maxSizeMB = 100,
  acceptedTypes = [],
  multiple = false,
  className,
}: FileUploadProps) {
  const [dragActive, setDragActive] = React.useState(false);
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFiles = (files: File[]): File[] => {
    const valid: File[] = [];
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    files.forEach((file) => {
      // Validate file size
      if (file.size > maxSizeBytes) {
        alert(`File "${file.name}" exceeds the maximum limit of ${maxSizeMB}MB.`);
        return;
      }

      // Validate file type (basic glob support like 'image/*')
      if (acceptedTypes.length > 0) {
        const fileType = file.type;
        const isAccepted = acceptedTypes.some((type) => {
          if (type.endsWith("/*")) {
            const prefix = type.split("/")[0];
            return fileType.startsWith(prefix + "/");
          }
          return fileType === type;
        });

        if (!isAccepted) {
          alert(`File "${file.name}" has an unsupported file type.`);
          return;
        }
      }

      valid.push(file);
    });

    return valid;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const filesArray = Array.from(e.dataTransfer.files);
      const validFiles = validateFiles(multiple ? filesArray : [filesArray[0]]);
      if (validFiles.length > 0) {
        const newFiles = multiple ? [...selectedFiles, ...validFiles] : validFiles;
        setSelectedFiles(newFiles);
        onFileSelect(newFiles);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const filesArray = Array.from(e.target.files);
      const validFiles = validateFiles(multiple ? filesArray : [filesArray[0]]);
      if (validFiles.length > 0) {
        const newFiles = multiple ? [...selectedFiles, ...validFiles] : validFiles;
        setSelectedFiles(newFiles);
        onFileSelect(newFiles);
      }
    }
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onFileSelect(newFiles);
  };

  return (
    <div className={cn("w-full space-y-4", className)}>
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative flex flex-col items-center justify-center p-8 border-2 border-dashed border-border-custom rounded-card bg-bg-secondary/30 hover:bg-bg-secondary/60 hover:border-accent-primary transition-all duration-200 cursor-pointer select-none group",
          {
            "border-accent-primary bg-bg-secondary/60 shadow-glow": dragActive,
          }
        )}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          multiple={multiple}
          onChange={handleFileChange}
          accept={acceptedTypes.join(",")}
        />

        <UploadCloud
          className={cn(
            "w-10 h-10 mb-3 text-text-muted transition-colors group-hover:text-accent-primary",
            {
              "text-accent-primary": dragActive,
            }
          )}
        />

        <p className="text-sm font-semibold text-white">
          Drag & drop your files here, or <span className="text-accent-primary">browse</span>
        </p>
        <p className="mt-1 text-xs font-mono text-text-muted">
          Supports up to {maxSizeMB}MB (PDF, PNG, JPG, ZIP, MP4 etc.)
        </p>
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-mono font-medium text-text-secondary uppercase tracking-wider">
            Selected Files ({selectedFiles.length})
          </p>
          <div className="grid gap-2">
            {selectedFiles.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-bg-card border border-border-custom rounded-input"
              >
                <div className="flex items-center space-x-3 overflow-hidden">
                  <File className="w-5 h-5 text-accent-primary shrink-0" />
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium text-white truncate">{file.name}</p>
                    <p className="text-xs font-mono text-text-muted">{formatBytes(file.size)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  className="p-1 rounded text-text-muted hover:text-brand-error hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
