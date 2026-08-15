import React, { useState, useEffect } from "react";
import { FileDoc, Project } from "../types";
import { api } from "../lib/api";
import { Folder, FileText, UploadCloud, Download, Eye, Layers, ChevronDown, Calendar, ShieldCheck, X, Trash2, FolderLock, Plus, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface FileManagerProps {
  project: Project;
  user: any;
}

const FOLDERS: Array<"Discover" | "Design" | "Build" | "Test" | "Launch" | "Support" | "Contracts" | "References"> = [
  "Discover",
  "Design",
  "Build",
  "Test",
  "Launch",
  "Support",
  "Contracts",
  "References"
];

export default function FileManager({ project, user }: FileManagerProps) {
  const [files, setFiles] = useState<FileDoc[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<typeof FOLDERS[number]>("Discover");
  const [loading, setLoading] = useState(true);
  
  // Interaction states
  const [previewFile, setPreviewFile] = useState<FileDoc | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Expanded version histories
  const [openVersionsId, setOpenVersionsId] = useState<string | null>(null);

  const loadFiles = async () => {
    try {
      const data = await api.getFiles(project.id);
      setFiles(data);
    } catch (err) {
      console.error("Failed loading repository files:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
    const interval = setInterval(loadFiles, 15000);
    return () => clearInterval(interval);
  }, [project]);

  // Folder filtered list
  const filteredFiles = files.filter((f) => f.phase === selectedFolder);

  // Mock upload logic (simulates Supabase storage and version increments)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement> | any, fromDrag = false) => {
    let fileObj;
    if (fromDrag) {
      fileObj = e.dataTransfer.files?.[0];
    } else {
      fileObj = e.target.files?.[0];
    }
    if (!fileObj) return;

    // Strict 100MB check as required
    const sizeMB = fileObj.size / (1024 * 1024);
    if (sizeMB > 100) {
      setUploadError("Strict security constraint: File size exceeds 100MB limit.");
      return;
    }

    setUploading(true);
    setUploadError(null);

    // Read file to base64 to allow high fidelity preview simulation
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64String = reader.result as string;
        const extension = fileObj.name.split(".").pop()?.toUpperCase() || "PDF";
        
        await api.uploadFile({
          projectId: project.id,
          name: fileObj.name,
          phase: selectedFolder,
          size: `${sizeMB.toFixed(1)} MB`,
          base64Data: base64String,
          type: extension
        });
        
        await loadFiles();
      } catch (err: any) {
        setUploadError(err.message || "Failed uploading file artifact.");
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(fileObj);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 animate-pulse">
        <div className="h-64 bg-bg-card rounded-card border border-border-custom"></div>
        <div className="h-64 md:col-span-3 bg-bg-card rounded-card border border-border-custom"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* LEFT: Folder Selector Navigation */}
      <div className="bg-bg-card border border-border-custom p-4 rounded-card space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-border-custom/50">
          <Folder className="h-4 w-4 text-accent-primary" />
          <span className="font-mono text-[10px] text-text-secondary uppercase tracking-widest">// SECURE VAULTS</span>
        </div>

        <div className="space-y-1.5">
          {FOLDERS.map((folder) => {
            const isActive = selectedFolder === folder;
            const folderCount = files.filter((f) => f.phase === folder).length;
            
            return (
              <button
                key={folder}
                onClick={() => { setSelectedFolder(folder); setOpenVersionsId(null); }}
                className={`w-full py-2.5 px-3 rounded-input text-left font-sans text-xs font-medium transition-all flex items-center justify-between group cursor-pointer ${
                  isActive ? "bg-accent-primary/10 border-l-[3px] border-accent-primary text-accent-primary" : "text-text-secondary hover:bg-bg-secondary hover:text-text-primary"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Folder className={`h-4 w-4 ${isActive ? "text-accent-primary" : "text-text-muted group-hover:text-accent-primary"} transition-colors`} />
                  {folder}
                </span>
                <span className="font-mono text-[10px] bg-bg-primary/60 border border-border-custom/80 px-1.5 py-0.5 rounded text-text-muted group-hover:text-text-primary">
                  {folderCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT: Document explorer view */}
      <div className="md:col-span-3 space-y-6">
        {/* Upload Drop Zone */}
        <div 
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFileUpload(e, true); }}
          className={`border border-dashed p-6 rounded-card text-center bg-bg-card/40 transition-all flex flex-col items-center justify-center gap-2 relative ${
            dragOver ? "border-accent-primary bg-accent-primary/5 scale-[0.99]" : "border-border-custom hover:border-accent-primary/40"
          }`}
        >
          {uploading ? (
            <div className="py-4 space-y-3">
              <Loader2 className="h-8 w-8 text-accent-primary animate-spin mx-auto" />
              <p className="font-mono text-xs text-accent-primary">ENCRYPTING & UPLOADING ARTIFACT...</p>
            </div>
          ) : (
            <label className="cursor-pointer py-4 flex flex-col items-center gap-2 group w-full">
              <input 
                type="file" 
                multiple={false} 
                onChange={handleFileUpload} 
                className="hidden" 
                accept=".pdf,.png,.jpg,.webp,.zip,.mp4" 
              />
              <UploadCloud className="h-10 w-10 text-accent-primary animate-pulse" />
              <p className="font-sans text-xs font-semibold text-text-primary">
                Drag or select a payload file to upload to <span className="text-accent-primary">[{selectedFolder}]</span>
              </p>
              <p className="font-mono text-[10px] text-text-muted uppercase">
                MAX PAYLOAD SIZE: 100MB // SECURE TRANSMISSION CHANNEL
              </p>
            </label>
          )}

          {uploadError && (
            <div className="mt-2 text-xs font-mono text-brand-error p-2 bg-brand-error/10 border border-brand-error/20 rounded">
              [ALERT] {uploadError}
            </div>
          )}
        </div>

        {/* Files inventory table */}
        <div className="bg-bg-card border border-border-custom rounded-card overflow-hidden">
          <div className="p-4 border-b border-border-custom/50 bg-bg-secondary/40 flex justify-between items-center">
            <span className="font-mono text-[10px] text-text-secondary uppercase tracking-widest">
              // REPOSITORY INVENTORY: {selectedFolder}
            </span>
            <span className="font-mono text-[10px] text-text-muted">
              {filteredFiles.length} item(s) found
            </span>
          </div>

          {filteredFiles.length === 0 ? (
            <div className="text-center py-16 text-text-secondary">
              <FolderLock className="h-8 w-8 text-text-muted mx-auto mb-3" />
              <p className="font-sans text-xs font-medium">This folder is currently vacant.</p>
              <p className="font-mono text-[9px] text-text-muted uppercase mt-0.5">// NO DOCUMENTATION UPLOADED</p>
            </div>
          ) : (
            <div className="divide-y divide-border-custom/60">
              {filteredFiles.map((file) => {
                const areVersionsOpen = openVersionsId === file.id;
                
                return (
                  <div key={file.id} className="p-4 hover:bg-bg-secondary/20 transition-colors">
                    <div className="flex items-center justify-between gap-4">
                      {/* Name & metadata */}
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="h-9 w-9 rounded bg-bg-secondary border border-border-custom flex items-center justify-center text-accent-primary">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <span className="block font-sans text-xs font-semibold text-text-primary truncate hover:text-accent-primary transition-colors cursor-pointer" onClick={() => setPreviewFile(file)}>
                            {file.name}
                          </span>
                          <p className="font-mono text-[9px] text-text-muted">
                            Size: <span className="text-text-secondary">{file.size}</span>
                            <span className="mx-2">//</span>
                            Uploaded by: <span className="text-text-secondary">{file.uploadedByName}</span>
                            <span className="mx-2">//</span>
                            Ver: <span className="text-accent-primary">v{file.version}</span>
                          </p>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-2">
                        {/* Versions button if histories exist */}
                        {file.versions && file.versions.length > 0 && (
                          <button
                            onClick={() => setOpenVersionsId(areVersionsOpen ? null : file.id)}
                            className="p-1.5 bg-bg-secondary border border-border-custom text-text-secondary hover:text-accent-primary rounded hover:border-accent-primary/40 transition-all flex items-center gap-1 font-mono text-[10px] cursor-pointer"
                          >
                            <Layers className="h-3.5 w-3.5" />
                            History ({file.versions.length})
                            <ChevronDown className={`h-3 w-3 transition-transform ${areVersionsOpen ? "rotate-180" : ""}`} />
                          </button>
                        )}

                        <button
                          onClick={() => setPreviewFile(file)}
                          className="p-1.5 bg-bg-secondary border border-border-custom text-text-secondary hover:text-accent-primary rounded hover:border-accent-primary/40 transition-all cursor-pointer"
                          title="Preview"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        <a
                          href={file.url}
                          download={file.name}
                          className="p-1.5 bg-bg-secondary border border-border-custom text-text-secondary hover:text-accent-primary rounded hover:border-accent-primary/40 transition-all cursor-pointer"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      </div>
                    </div>

                    {/* Versions drop list */}
                    <AnimatePresence>
                      {areVersionsOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-3.5 pl-12 border-t border-border-custom/40 pt-3 space-y-2 overflow-hidden"
                        >
                          <span className="block font-mono text-[9px] text-accent-primary uppercase tracking-wider">// VERSIONING RECONCILIATION HISTORIES</span>
                          {file.versions.map((oldVer, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-bg-secondary/40 border border-border-custom rounded-input">
                              <div className="flex items-center gap-2 font-mono text-[10px] text-text-secondary">
                                <Layers className="h-3 w-3 text-text-muted" />
                                <span>Version v{oldVer.version}</span>
                                <span className="text-text-muted">•</span>
                                <span>Uploaded {new Date(oldVer.uploadedAt).toLocaleDateString()} by {oldVer.uploadedByName}</span>
                              </div>
                              <a
                                href={oldVer.url}
                                download={`${file.name}_v${oldVer.version}`}
                                className="font-mono text-[9px] text-accent-primary hover:underline flex items-center gap-1"
                              >
                                <Download className="h-3 w-3" /> [DOWNLOAD]
                              </a>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* INLINE PREVIEW MODAL */}
      <AnimatePresence>
        {previewFile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewFile(null)}
              className="absolute inset-0 bg-black"
            ></motion.div>

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-4xl bg-bg-card border border-border-custom h-[80vh] flex flex-col rounded-card overflow-hidden shadow-glow"
            >
              {/* Header */}
              <div className="p-4 bg-bg-secondary border-b border-border-custom/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4.5 w-4.5 text-accent-primary" />
                  <span className="font-mono text-xs font-semibold text-text-primary truncate max-w-md">
                    PREVIEWING COMMAND SOURCE: {previewFile.name} (v{previewFile.version})
                  </span>
                </div>
                <button
                  onClick={() => setPreviewFile(null)}
                  className="p-1 rounded-full bg-bg-primary hover:text-accent-primary cursor-pointer border border-border-custom"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Main Frame content */}
              <div className="flex-grow bg-bg-primary flex items-center justify-center p-4 overflow-auto">
                {previewFile.type === "PNG" || previewFile.type === "JPG" || previewFile.type === "WEBP" ? (
                  <img
                    src={previewFile.url}
                    alt={previewFile.name}
                    referrerPolicy="no-referrer"
                    className="max-h-full max-w-full object-contain rounded border border-border-custom shadow-lg"
                  />
                ) : previewFile.type === "PDF" ? (
                  // PDF Simulator / embed frame
                  <iframe
                    src={`${previewFile.url}#toolbar=0`}
                    title="PDF Viewer"
                    className="w-full h-full border-none rounded"
                  />
                ) : (
                  <div className="text-center space-y-4 max-w-sm">
                    <FileText className="h-12 w-12 text-accent-primary mx-auto animate-bounce" />
                    <h3 className="font-sans text-sm font-semibold text-text-primary">Inline rendering unavailable</h3>
                    <p className="font-mono text-[10px] text-text-secondary leading-relaxed uppercase">
                      THIS FILE ENCRYPTION ({previewFile.type}) IS OPTIMIZED FOR EXTERNAL SANDBOXES. DOWNLOAD TO VIEW CORE DATA STRUCTURES.
                    </p>
                    <a
                      href={previewFile.url}
                      download={previewFile.name}
                      className="px-6 py-2 bg-accent-primary text-bg-primary hover:bg-accent-hover font-mono text-xs font-bold rounded-input inline-flex items-center gap-2 cursor-pointer shadow-glow-strong uppercase"
                    >
                      <Download className="h-4 w-4" /> Download payload
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
