// ============================================
// IMAGE TYPES
// ============================================

export interface ImageDimensions {
  w: number;
  h: number;
}

export interface ProcessedImage {
  file: File | Blob;
  url: string;
}

// ============================================
// COMPRESSION TYPES
// ============================================

export interface CompressionSettings {
  maxSizeMB: number;
  maxWidthOrHeight: number;
  useWebWorker: boolean;
  fileType: string;
  initialQuality: number;
}

// ============================================
// PREVIEW TYPES
// ============================================

export type PreviewBackground = 'transparent' | 'white' | 'black';

// ============================================
// BATCH PROCESSING TYPES
// ============================================

export type BatchItemStatus = 'pending' | 'processing' | 'done' | 'error';

export interface BatchQueueItem {
  id: string;
  originalFile: File;
  compressedFile: File | null;
  compressedUrl: string | null;
  status: BatchItemStatus;
  originalSize: number;
  compressedSize: number | null;
  error?: string;
}

// ============================================
// TOOL CARD (Home page)
// ============================================

export interface ToolCardProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  accentColor: 'indigo' | 'orange' | 'emerald' | 'pink';
}
