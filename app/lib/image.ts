import { ImageDimensions } from '../types';

/**
 * Format bytes to human-readable MB string
 */
export const formatFileSize = (bytes: number): string => {
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
};

/**
 * Get the file extension from a MIME type
 */
export const getExtensionFromMime = (mimeType: string): string => {
  return mimeType.split('/')[1] || 'png';
};

/**
 * Generate a download filename with prefix
 */
export const generateDownloadName = (
  originalName: string,
  prefix: string,
  format: string
): string => {
  const baseName = originalName.split('.')[0];
  const extension = getExtensionFromMime(format);
  return `${prefix}_${baseName}.${extension}`;
};

/**
 * Validate if file is an image
 */
export const isValidImage = (file: File): boolean => {
  return file.type.startsWith('image/');
};

/**
 * Get image dimensions from a File
 */
export const getImageDimensions = (file: File): Promise<ImageDimensions> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      resolve({ w: img.width, h: img.height });
    };
  });
};

/**
 * Calculate new dimensions maintaining aspect ratio
 */
export const calculateAspectRatioDimensions = (
  original: ImageDimensions,
  newValue: number,
  dimension: 'width' | 'height'
): ImageDimensions => {
  if (dimension === 'width') {
    const ratio = original.h / original.w;
    return { w: newValue, h: Math.round(newValue * ratio) };
  } else {
    const ratio = original.w / original.h;
    return { w: Math.round(newValue * ratio), h: newValue };
  }
};
