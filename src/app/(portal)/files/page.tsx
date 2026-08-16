"use client";

import * as React from "react";
import {
  Folder,
  FileText,
  Download,
  Eye,
  Layers,
  ChevronDown,
  FolderLock,
  X,
  ShieldCheck,
  Trash2,
  Edit,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/src/components/providers/auth-provider";
import { usePortalData } from "@/src/components/providers/portal-data-provider";
import { Card, CardHeader, CardContent } from "@/src/components/ui/card";
import { Skeleton } from "@/src/components/ui/skeleton";
import { FileUpload } from "@/src/components/ui/file-upload";
import toast from "react-hot-toast";

interface FileDoc {
  id: string;
  name: string;
  phase: string;
  uploadedByName: string;
  size: string;
  version: number;
  versions: Array<{ version: number; url: string; uploadedAt: string; uploadedByName: string }>;
  url: string;
  type: string;
}

const FOLDERS = [
  "Discover",
  "Design",
  "Build",
  "Test",
  "Launch",
  "Support",
  "Contracts",
  "References",
] as const;

export default function FileManagerPage() {
  const { user } = useUser();
  const { loading: dataLoading, files, uploadFile, deleteFile, updateFile } = usePortalData();
  const [selectedFolder, setSelectedFolder] = React.useState<typeof FOLDERS[number]>("Discover");
  const [previewFile, setPreviewFile] = React.useState<FileDoc | null>(null);
  const [openVersionsId, setOpenVersionsId] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);
  
  const [fileToDelete, setFileToDelete] = React.useState<FileDoc | null>(null);
  const [fileToEdit, setFileToEdit] = React.useState<FileDoc | null>(null);
  const [editName, setEditName] = React.useState("");
  const [editPhase, setEditPhase] = React.useState<string>("Discover");

  const handleDeleteConfirm = () => {
    if (fileToDelete) {
      deleteFile(fileToDelete.id);
      toast.success(`Removed file: ${fileToDelete.name}`);
      setFileToDelete(null);
    }
  };

  const handleEditSubmit = () => {
    if (fileToEdit && editName.trim()) {
      updateFile(fileToEdit.id, { name: editName, phase: editPhase });
      toast.success("File metadata updated successfully");
      setFileToEdit(null);
    }
  };

  const loading = dataLoading;

  const filteredFiles = files.filter((f) => f.phase === selectedFolder);

  const handleFileSelect = async (selectedFiles: File[]) => {
    if (selectedFiles.length === 0) return;
    const file = selectedFiles[0];

    setUploading(true);
    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const extension = file.name.split(".").pop()?.toUpperCase() || "PDF";
    const sizeMB = file.size / (1024 * 1024);

    const newFile: FileDoc = {
      id: `file-${Date.now()}`,
      name: file.name,
      phase: selectedFolder,
      uploadedByName: user?.name || "Client User",
      size: `${sizeMB.toFixed(1)} MB`,
      version: 1,
      versions: [],
      url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      type: extension,
    };

    uploadFile(newFile);
    setUploading(false);
    toast.success(`Encrypted upload secured: ${file.name}`);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse">
        <Skeleton className="h-64" />
        <Skeleton className="h-64 md:col-span-3" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* LEFT: Folders List */}
      <Card className="bg-bg-card border-border-custom self-start">
        <CardHeader className="flex flex-row items-center space-y-0 pb-2 border-b border-border-custom/50">
          <Folder className="h-4 w-4 text-accent-primary mr-2" />
          <span className="font-mono text-[10px] text-text-secondary uppercase tracking-widest">
            // SECURE VAULTS
          </span>
        </CardHeader>
        <CardContent className="pt-4 space-y-1.5">
          {FOLDERS.map((folder) => {
            const isActive = selectedFolder === folder;
            const folderCount = files.filter((f) => f.phase === folder).length;

            return (
              <button
                key={folder}
                onClick={() => {
                  setSelectedFolder(folder);
                  setOpenVersionsId(null);
                }}
                className={`w-full py-2.5 px-3 rounded-input text-left font-sans text-xs font-medium transition-all flex items-center justify-between group cursor-pointer ${
                  isActive
                    ? "bg-accent-primary/10 border-l-[3px] border-accent-primary text-accent-primary"
                    : "text-text-secondary hover:bg-bg-secondary hover:text-white"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Folder
                    className={`h-4 w-4 ${
                      isActive
                        ? "text-accent-primary"
                        : "text-text-muted group-hover:text-accent-primary"
                    } transition-colors`}
                  />
                  {folder}
                </span>
                <span className="font-mono text-[10px] bg-bg-primary/60 border border-border-custom/80 px-1.5 py-0.5 rounded text-text-muted group-hover:text-white">
                  {folderCount}
                </span>
              </button>
            );
          })}
        </CardContent>
      </Card>

      {/* RIGHT: Main document manager content */}
      <div className="md:col-span-3 space-y-6">
        {/* Upload Zone */}
        <Card className="bg-bg-card border-border-custom p-6">
          <FileUpload onFileSelect={handleFileSelect} maxSizeMB={100} multiple={false} />
          {uploading && (
            <div className="mt-3 text-center text-xs font-mono text-accent-primary animate-pulse">
              ENCRYPTING & UPLOADING PAYLOAD TO [{selectedFolder}]...
            </div>
          )}
        </Card>

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
              <p className="font-mono text-[9px] text-text-muted uppercase mt-0.5">
                // NO DOCUMENTATION UPLOADED
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border-custom/60">
              {filteredFiles.map((file) => {
                const areVersionsOpen = openVersionsId === file.id;

                return (
                  <div key={file.id} className="p-4 hover:bg-bg-secondary/20 transition-colors">
                    <div className="flex items-center justify-between gap-4">
                      {/* File Info */}
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="h-9 w-9 rounded bg-bg-secondary border border-border-custom flex items-center justify-center text-accent-primary">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <span
                            className="block font-sans text-xs font-semibold text-white truncate hover:text-accent-primary transition-colors cursor-pointer"
                            onClick={() => setPreviewFile(file)}
                          >
                            {file.name}
                          </span>
                          <p className="font-mono text-[9px] text-text-muted">
                            Size: <span className="text-text-secondary">{file.size}</span>
                            <span className="mx-2">//</span>
                            Uploaded by:{" "}
                            <span className="text-text-secondary">{file.uploadedByName}</span>
                            <span className="mx-2">//</span>
                            Ver: <span className="text-accent-primary">v{file.version}</span>
                          </p>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-2">
                        {file.versions && file.versions.length > 0 && (
                          <button
                            onClick={() => setOpenVersionsId(areVersionsOpen ? null : file.id)}
                            className="p-1.5 bg-bg-secondary border border-border-custom text-text-secondary hover:text-accent-primary rounded hover:border-accent-primary/40 transition-all flex items-center gap-1 font-mono text-[10px] cursor-pointer"
                          >
                            <Layers className="h-3.5 w-3.5" />
                            History ({file.versions.length})
                            <ChevronDown
                              className={`h-3 w-3 transition-transform ${
                                areVersionsOpen ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setFileToEdit(file);
                            setEditName(file.name);
                            setEditPhase(file.phase);
                          }}
                          className="p-1.5 bg-bg-secondary border border-border-custom text-text-secondary hover:text-accent-primary rounded hover:border-accent-primary/40 transition-all cursor-pointer"
                          title="Rename / Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>

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

                        <button
                          onClick={() => setFileToDelete(file)}
                          className="p-1.5 bg-bg-secondary border border-border-custom text-text-secondary hover:text-red-400 rounded hover:border-red-500/40 transition-all cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Version History Dropdown */}
                    <AnimatePresence>
                      {areVersionsOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-3.5 pl-12 border-t border-border-custom/40 pt-3 space-y-2 overflow-hidden"
                        >
                          <span className="block font-mono text-[9px] text-accent-primary uppercase tracking-wider">
                            // VERSIONING RECONCILIATION HISTORIES
                          </span>
                          {file.versions.map((oldVer, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 bg-bg-secondary/40 border border-border-custom rounded-input"
                            >
                              <div className="flex items-center gap-2 font-mono text-[10px] text-text-secondary">
                                <Layers className="h-3 w-3 text-text-muted" />
                                <span>Version v{oldVer.version}</span>
                                <span className="text-text-muted">•</span>
                                <span>
                                  Uploaded {new Date(oldVer.uploadedAt).toLocaleDateString()} by{" "}
                                  {oldVer.uploadedByName}
                                </span>
                              </div>
                              <a
                                href={oldVer.url}
                                download={`${file.name}_v${oldVer.version}`}
                                className="font-mono text-[9px] text-accent-primary hover:underline flex items-center gap-1 cursor-pointer"
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

      {/* FULL SCREEN PREVIEW MODAL */}
      <AnimatePresence>
        {previewFile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewFile(null)}
              className="absolute inset-0 bg-black cursor-pointer"
            />

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
                  <span className="font-mono text-xs font-semibold text-white truncate max-w-md">
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
                {previewFile.type === "PNG" ||
                previewFile.type === "JPG" ||
                previewFile.type === "WEBP" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewFile.url}
                    alt={previewFile.name}
                    className="max-h-full max-w-full object-contain rounded border border-border-custom shadow-lg"
                  />
                ) : previewFile.type === "PDF" ? (
                  <iframe
                    src={`${previewFile.url}#toolbar=0`}
                    title="PDF Viewer"
                    className="w-full h-full border-none rounded"
                  />
                ) : (
                  <div className="text-center space-y-4 max-w-sm">
                    <FileText className="h-12 w-12 text-accent-primary mx-auto animate-bounce" />
                    <h3 className="font-sans text-sm font-semibold text-white">
                      Inline rendering unavailable
                    </h3>
                    <p className="font-mono text-[10px] text-text-secondary leading-relaxed uppercase">
                      THIS FILE ENCRYPTION ({previewFile.type}) IS OPTIMIZED FOR EXTERNAL SANDBOXES.
                      DOWNLOAD TO VIEW CORE DATA STRUCTURES.
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

      {/* RENAME / EDIT METADATA MODAL */}
      <AnimatePresence>
        {fileToEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              onClick={() => setFileToEdit(null)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-bg-card border border-border-custom rounded-card p-6 shadow-glow"
            >
              <h3 className="font-mono text-xs uppercase tracking-wider text-accent-primary font-bold mb-4">
                // EDIT METADATA
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block font-mono text-[10px] text-text-secondary uppercase">
                    FILENAME
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-bg-secondary border border-border-custom focus:border-accent-primary text-text-primary px-3.5 py-2 text-xs rounded-input outline-none font-sans"
                    placeholder="Enter new filename"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block font-mono text-[10px] text-text-secondary uppercase">
                    PHASE FOLDER
                  </label>
                  <select
                    value={editPhase}
                    onChange={(e) => setEditPhase(e.target.value)}
                    className="w-full bg-bg-secondary border border-border-custom focus:border-accent-primary text-text-primary px-3.5 py-2 text-xs rounded-input outline-none font-sans"
                  >
                    {FOLDERS.map((folder) => (
                      <option key={folder} value={folder}>
                        {folder}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  onClick={() => setFileToEdit(null)}
                  className="text-[9px] font-mono font-bold px-2.5 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer bg-bg-secondary hover:bg-slate-800 text-text-muted hover:text-white border border-border-custom"
                >
                  [CANCEL]
                </button>
                <button
                  onClick={handleEditSubmit}
                  className="bg-accent-primary hover:bg-accent-hover text-bg-primary font-mono text-xs uppercase font-bold rounded-input shadow-glow px-4 py-1.5"
                >
                  SAVE CHANGES
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {fileToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              onClick={() => setFileToDelete(null)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-bg-card border border-border-custom rounded-card p-6 shadow-glow"
            >
              <div className="flex items-center gap-3 mb-4">
                <Trash2 className="h-5 w-5 text-red-500" />
                <h3 className="font-mono text-xs uppercase tracking-wider text-red-400 font-bold">
                  // CONFIRM DELETION
                </h3>
              </div>
              <p className="text-sm text-text-secondary font-sans mb-6">
                Are you sure you want to permanently delete{" "}
                <span className="font-bold text-white">{fileToDelete.name}</span>? This action cannot be
                undone.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setFileToDelete(null)}
                  className="text-[9px] font-mono font-bold px-2.5 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer bg-bg-secondary hover:bg-slate-800 text-text-muted hover:text-white border border-border-custom"
                >
                  [CANCEL]
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="text-[9px] font-mono font-bold px-2.5 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer bg-red-500/10 hover:bg-red-500/25 text-red-400 border border-red-500/30"
                >
                  DELETE FILE
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
