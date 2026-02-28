/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import { 
  FileText, 
  Image as ImageIcon, 
  Upload, 
  Trash2, 
  Download, 
  FilePlus, 
  Clock, 
  AlertCircle,
  Loader2,
  CheckCircle2,
  ArrowUpDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FileWithMetadata {
  id: string;
  file: File;
  type: 'pdf' | 'image';
  timestamp: number;
  preview?: string;
}

export default function App() {
  const [files, setFiles] = useState<FileWithMetadata[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [mergedPdfUrl, setMergedPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (newFiles: File[]) => {
    const validFiles: FileWithMetadata[] = newFiles
      .filter(file => {
        const isPdf = file.type === 'application/pdf';
        const isImage = file.type.startsWith('image/');
        return isPdf || isImage;
      })
      .map(file => ({
        id: Math.random().toString(36).substring(7),
        file,
        type: file.type === 'application/pdf' ? 'pdf' : 'image',
        timestamp: file.lastModified,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
      }));

    if (validFiles.length < newFiles.length) {
      setError('Some files were skipped. Only PDF and Image files are supported.');
    } else {
      setError(null);
    }

    setFiles(prev => [...prev, ...validFiles].sort((a, b) => a.timestamp - b.timestamp));
    setMergedPdfUrl(null);
  };

  const removeFile = (id: string) => {
    setFiles(prev => {
      const filtered = prev.filter(f => f.id !== id);
      const removed = prev.find(f => f.id === id);
      if (removed?.preview) URL.revokeObjectURL(removed.preview);
      return filtered;
    });
    setMergedPdfUrl(null);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const mergeFiles = async () => {
    if (files.length === 0) return;
    setIsMerging(true);
    setError(null);

    try {
      const mergedPdf = await PDFDocument.create();

      for (const item of files) {
        const fileBytes = await item.file.arrayBuffer();

        if (item.type === 'pdf') {
          const pdfDoc = await PDFDocument.load(fileBytes);
          const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
          copiedPages.forEach((page) => mergedPdf.addPage(page));
        } else {
          let image;
          if (item.file.type === 'image/jpeg' || item.file.type === 'image/jpg') {
            image = await mergedPdf.embedJpg(fileBytes);
          } else if (item.file.type === 'image/png') {
            image = await mergedPdf.embedPng(fileBytes);
          } else {
            // Try to handle other image types by converting to canvas/blob if needed, 
            // but pdf-lib supports JPG and PNG directly.
            continue;
          }

          const page = mergedPdf.addPage();
          const { width, height } = page.getSize();
          const dims = image.scaleToFit(width - 40, height - 40);
          page.drawImage(image, {
            x: (width - dims.width) / 2,
            y: (height - dims.height) / 2,
            width: dims.width,
            height: dims.height,
          });
        }
      }

      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setMergedPdfUrl(url);
    } catch (err) {
      console.error(err);
      setError('An error occurred while merging the files. Please ensure all files are valid.');
    } finally {
      setIsMerging(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#1A1A1A] font-sans p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-sm mb-4 border border-black/5"
          >
            <FilePlus className="w-8 h-8 text-emerald-600" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-4xl font-light tracking-tight mb-2"
          >
            ChronoMerge <span className="font-medium">PDF</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-neutral-500"
          >
            Combine your documents and images in the order they were created.
          </motion.p>
        </header>

        {/* Upload Area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-sm border border-black/5 p-8 mb-8"
        >
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-neutral-200 rounded-2xl p-12 text-center cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-50/30 transition-all group"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              accept="application/pdf,image/*"
              className="hidden"
            />
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors">
                <Upload className="w-6 h-6 text-neutral-400 group-hover:text-emerald-600" />
              </div>
              <p className="text-lg font-medium mb-1">Drop files here or click to upload</p>
              <p className="text-sm text-neutral-400">Supports PDF, JPG, and PNG</p>
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </motion.div>
          )}
        </motion.div>

        {/* File List */}
        <AnimatePresence mode="popLayout">
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-sm border border-black/5 overflow-hidden mb-8"
            >
              <div className="p-6 border-bottom border-black/5 flex items-center justify-between bg-neutral-50/50">
                <div className="flex items-center gap-2 text-sm font-medium text-neutral-500">
                  <Clock className="w-4 h-4" />
                  Chronological Order
                </div>
                <div className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">
                  {files.length} {files.length === 1 ? 'File' : 'Files'}
                </div>
              </div>

              <div className="divide-y divide-black/5">
                {files.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-4 flex items-center gap-4 hover:bg-neutral-50 transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0 overflow-hidden">
                      {item.type === 'pdf' ? (
                        <FileText className="w-6 h-6 text-neutral-400" />
                      ) : (
                        item.preview ? (
                          <img src={item.preview} alt="preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-neutral-400" />
                        )
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate text-sm">{item.file.name}</p>
                      <p className="text-xs text-neutral-400 flex items-center gap-1">
                        {formatDate(item.timestamp)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFile(item.id)}
                      className="p-2 text-neutral-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </div>

              <div className="p-6 bg-neutral-50/50 border-t border-black/5 flex justify-end gap-4">
                <button
                  onClick={() => setFiles([])}
                  className="px-6 py-2.5 text-sm font-medium text-neutral-500 hover:text-neutral-800 transition-colors"
                >
                  Clear All
                </button>
                <button
                  onClick={mergeFiles}
                  disabled={isMerging}
                  className="px-8 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center gap-2"
                >
                  {isMerging ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Merging...
                    </>
                  ) : (
                    <>
                      Merge to PDF
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result */}
        <AnimatePresence>
          {mergedPdfUrl && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-emerald-600 rounded-3xl p-8 text-white shadow-lg shadow-emerald-200 flex flex-col md:flex-row items-center justify-between gap-6"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-medium">PDF Ready!</h3>
                  <p className="text-emerald-100 text-sm">Your files have been merged successfully.</p>
                </div>
              </div>
              <a
                href={mergedPdfUrl}
                download="merged_chronological.pdf"
                className="w-full md:w-auto px-8 py-3 bg-white text-emerald-700 rounded-xl font-semibold hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download PDF
              </a>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {files.length === 0 && !mergedPdfUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-neutral-100 rounded-full mb-4">
              <ArrowUpDown className="w-8 h-8 text-neutral-300" />
            </div>
            <p className="text-neutral-400">No files uploaded yet.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
