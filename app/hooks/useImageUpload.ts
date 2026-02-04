'use client';

import { useState, useCallback } from 'react';
import { isValidImage } from '../lib/image';

interface UseImageUploadReturn {
  file: File | null;
  setFile: (file: File | null) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  clearFile: () => void;
}

/**
 * Custom hook to handle image upload via drag & drop or file input
 */
export const useImageUpload = (
  onFileSelected?: (file: File) => void
): UseImageUploadReturn => {
  const [file, setFile] = useState<File | null>(null);

  const handleFile = useCallback((selectedFile: File) => {
    if (isValidImage(selectedFile)) {
      setFile(selectedFile);
      onFileSelected?.(selectedFile);
    }
  }, [onFileSelected]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFile(droppedFile);
    }
  }, [handleFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFile(selectedFile);
    }
  }, [handleFile]);

  const clearFile = useCallback(() => {
    setFile(null);
  }, []);

  return {
    file,
    setFile,
    handleDrop,
    handleFileSelect,
    clearFile,
  };
};
