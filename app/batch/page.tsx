'use client';

import { useState, useCallback, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import JSZip from 'jszip';
import { 
  Download, 
  Trash2, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  Clock,
  Archive,
  X
} from 'lucide-react';

import { PageHeader, DropZone, SettingsPanel } from '../components/ui';
import { formatFileSize, generateDownloadName } from '../lib/image';
import { CompressionSettings, BatchQueueItem, BatchItemStatus } from '../types';

export default function BatchCompressPage() {
  // Queue state
  const [queue, setQueue] = useState<BatchQueueItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const processingRef = useRef(false);

  // Settings State
  const [quality, setQuality] = useState<number>(0.7);
  const [format, setFormat] = useState<string>('image/webp');
  const [maxWidth, setMaxWidth] = useState<number>(1920);

  // Generate unique ID
  const generateId = () => Math.random().toString(36).substring(2, 9);

  // Add files to queue
  const handleFilesSelected = useCallback((files: File[]) => {
    const newItems: BatchQueueItem[] = files
      .filter(file => file.type.startsWith('image/'))
      .map(file => ({
        id: generateId(),
        originalFile: file,
        compressedFile: null,
        compressedUrl: null,
        status: 'pending' as BatchItemStatus,
        originalSize: file.size,
        compressedSize: null,
      }));

    setQueue(prev => [...prev, ...newItems]);
  }, []);

  // Handle drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    handleFilesSelected(files);
  }, [handleFilesSelected]);

  // Handle file input
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFilesSelected(files);
      // Reset input so same files can be selected again
      e.target.value = '';
    }
  }, [handleFilesSelected]);

  // Compress single file
  const compressFile = async (item: BatchQueueItem): Promise<BatchQueueItem> => {
    const options: CompressionSettings = {
      maxSizeMB: 1,
      maxWidthOrHeight: maxWidth,
      useWebWorker: true,
      fileType: format,
      initialQuality: quality,
    };

    try {
      const compressedBlob = await imageCompression(item.originalFile, options);
      const newFileName = generateDownloadName(item.originalFile.name, 'optimized', format);
      const compressedFile = new File([compressedBlob], newFileName, { type: format });

      return {
        ...item,
        status: 'done',
        compressedFile,
        compressedUrl: URL.createObjectURL(compressedFile),
        compressedSize: compressedFile.size,
      };
    } catch (error) {
      console.error('Compression failed:', error);
      return {
        ...item,
        status: 'error',
        error: 'Compression failed',
      };
    }
  };

  // Process queue
  const processQueue = useCallback(async () => {
    if (processingRef.current) return;
    processingRef.current = true;
    setIsProcessing(true);

    const pendingItems = queue.filter(item => item.status === 'pending');

    for (const item of pendingItems) {
      // Mark as processing
      setQueue(prev => 
        prev.map(q => q.id === item.id ? { ...q, status: 'processing' as BatchItemStatus } : q)
      );

      // Compress
      const result = await compressFile(item);

      // Update with result
      setQueue(prev => 
        prev.map(q => q.id === item.id ? result : q)
      );
    }

    processingRef.current = false;
    setIsProcessing(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queue, format, maxWidth, quality]);

  // Remove item from queue
  const removeItem = (id: string) => {
    setQueue(prev => {
      const item = prev.find(q => q.id === id);
      if (item?.compressedUrl) {
        URL.revokeObjectURL(item.compressedUrl);
      }
      return prev.filter(q => q.id !== id);
    });
  };

  // Clear all
  const clearAll = () => {
    queue.forEach(item => {
      if (item.compressedUrl) {
        URL.revokeObjectURL(item.compressedUrl);
      }
    });
    setQueue([]);
  };

  // Download all as ZIP
  const downloadAll = async () => {
    const completedItems = queue.filter(item => item.status === 'done' && item.compressedFile);
    if (completedItems.length === 0) return;

    const zip = new JSZip();
    
    for (const item of completedItems) {
      if (item.compressedFile) {
        zip.file(item.compressedFile.name, item.compressedFile);
      }
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `optimized_images_${Date.now()}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Stats
  const pendingCount = queue.filter(q => q.status === 'pending').length;
  const processingCount = queue.filter(q => q.status === 'processing').length;
  const doneCount = queue.filter(q => q.status === 'done').length;
  const errorCount = queue.filter(q => q.status === 'error').length;

  const totalOriginalSize = queue.reduce((acc, q) => acc + q.originalSize, 0);
  const totalCompressedSize = queue.reduce((acc, q) => acc + (q.compressedSize || 0), 0);

  // Status icon
  const StatusIcon = ({ status }: { status: BatchItemStatus }) => {
    switch (status) {
      case 'pending':
        return <Clock size={18} className="text-neutral-500" />;
      case 'processing':
        return <Loader2 size={18} className="text-pink-400 animate-spin" />;
      case 'done':
        return <CheckCircle2 size={18} className="text-emerald-400" />;
      case 'error':
        return <AlertCircle size={18} className="text-red-400" />;
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        
        <PageHeader title="Batch Optimizer" accentColor="pink" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Settings */}
          <div className="lg:col-span-4 space-y-6">
            <SettingsPanel title="Configuration" accentColor="pink">
              {/* Format Selector */}
              <div>
                <label className="block text-sm text-neutral-400 mb-2">Output Format</label>
                <select 
                  value={format} 
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-pink-500 outline-none"
                >
                  <option value="image/webp">WebP (Best for Web)</option>
                  <option value="image/jpeg">JPEG (Standard)</option>
                  <option value="image/png">PNG (Lossless/Heavy)</option>
                </select>
              </div>

              {/* Quality Slider */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <label className="text-neutral-400">Quality</label>
                  <span className="text-pink-400">{Math.round(quality * 100)}%</span>
                </div>
                <input 
                  type="range" min="0.1" max="1" step="0.1" 
                  value={quality} 
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  className="w-full accent-pink-500 h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer"
                />
                <p className="text-xs text-neutral-600 mt-2">Lower quality = smaller file size.</p>
              </div>

              {/* Max Width */}
              <div>
                <label className="block text-sm text-neutral-400 mb-2">Max Width (px)</label>
                <input 
                  type="number" 
                  value={maxWidth} 
                  onChange={(e) => setMaxWidth(Number(e.target.value))}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-pink-500 outline-none"
                />
              </div>
            </SettingsPanel>

            {/* Stats Panel */}
            {queue.length > 0 && (
              <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl">
                <h3 className="text-sm font-semibold text-neutral-400 mb-4">Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Total Files</span>
                    <span className="text-white">{queue.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Completed</span>
                    <span className="text-emerald-400">{doneCount}</span>
                  </div>
                  {errorCount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Failed</span>
                      <span className="text-red-400">{errorCount}</span>
                    </div>
                  )}
                  <div className="border-t border-neutral-800 pt-3 mt-3">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Original</span>
                      <span className="text-neutral-400">{formatFileSize(totalOriginalSize)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Compressed</span>
                      <span className="text-pink-400 font-bold">{formatFileSize(totalCompressedSize)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Queue */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Drop Zone (always visible when queue is small) */}
            {queue.length < 50 && (
              <DropZone
                onDrop={handleDrop}
                onFileSelect={handleFileSelect}
                label="Drop Multiple Images"
                sublabel="Select or drop up to 50 images at once"
                accentColor="pink"
                inputId="batch-upload"
                multiple={true}
              />
            )}

            {/* Action Buttons */}
            {queue.length > 0 && (
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={processQueue}
                  disabled={isProcessing || pendingCount === 0}
                  className="flex items-center gap-2 bg-pink-600 hover:bg-pink-500 disabled:bg-neutral-700 disabled:text-neutral-500 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Processing ({processingCount}/{pendingCount + processingCount})
                    </>
                  ) : (
                    <>
                      <Loader2 size={18} />
                      Start Processing ({pendingCount})
                    </>
                  )}
                </button>

                {doneCount > 0 && (
                  <button
                    onClick={downloadAll}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    <Archive size={18} />
                    Download All ({doneCount})
                  </button>
                )}

                <button
                  onClick={clearAll}
                  className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white px-4 py-2 rounded-lg transition-colors ml-auto"
                >
                  <Trash2 size={18} />
                  Clear All
                </button>
              </div>
            )}

            {/* Queue List */}
            {queue.length > 0 && (
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
                <div className="max-h-[500px] overflow-y-auto">
                  {queue.map((item) => (
                    <div 
                      key={item.id}
                      className="flex items-center gap-4 p-4 border-b border-neutral-800 last:border-b-0 hover:bg-neutral-800/50"
                    >
                      {/* Status Icon */}
                      <StatusIcon status={item.status} />

                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{item.originalFile.name}</p>
                        <div className="flex items-center gap-2 text-xs text-neutral-500">
                          <span>{formatFileSize(item.originalSize)}</span>
                          {item.compressedSize && (
                            <>
                              <span>→</span>
                              <span className="text-pink-400 font-medium">
                                {formatFileSize(item.compressedSize)}
                              </span>
                              <span className="text-emerald-400">
                                (-{Math.round((1 - item.compressedSize / item.originalSize) * 100)}%)
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {item.status === 'done' && item.compressedUrl && (
                          <a
                            href={item.compressedUrl}
                            download={item.compressedFile?.name}
                            className="p-2 text-neutral-400 hover:text-pink-400 hover:bg-neutral-800 rounded-lg transition-colors"
                            title="Download"
                          >
                            <Download size={18} />
                          </a>
                        )}
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded-lg transition-colors"
                          title="Remove"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </main>
  );
}
