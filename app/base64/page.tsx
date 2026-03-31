'use client';

import { useState, useCallback } from 'react';
import { Copy, Check, Code } from 'lucide-react';

import { PageHeader, DropZone, SettingsPanel } from '../components/ui';
import { useImageUpload } from '../hooks/useImageUpload';
import { formatFileSize } from '../lib/image';

export default function Base64Page() {
  const [base64, setBase64] = useState<string>('');
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<'base64' | 'dataurl' | 'img' | 'css' | null>(null);
  const [outputType, setOutputType] = useState<'dataurl' | 'raw'>('dataurl');

  const convertToBase64 = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setDataUrl(result);
      // Extract base64 part (remove data:image/xxx;base64, prefix)
      const base64Part = result.split(',')[1];
      setBase64(base64Part);
    };
    reader.readAsDataURL(file);
  }, []);

  const { file, handleDrop, handleFileSelect, clearFile } = useImageUpload(convertToBase64);

  const copyToClipboard = async (text: string, type: 'base64' | 'dataurl' | 'img' | 'css') => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDiscard = () => {
    clearFile();
    setBase64('');
    setDataUrl('');
  };

  const imgTag = `<img src="${dataUrl}" alt="Image" />`;
  const cssBackground = `background-image: url('${dataUrl}');`;

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        
        <PageHeader title="Image to Base64" accentColor="sky" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Info Panel */}
          <div className="lg:col-span-4 space-y-6">
            <SettingsPanel title="Output Options" accentColor="sky">
              <div>
                <label className="block text-sm text-neutral-400 mb-2">Output Type</label>
                <select 
                  value={outputType} 
                  onChange={(e) => setOutputType(e.target.value as 'dataurl' | 'raw')}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                >
                  <option value="dataurl">Data URL (with prefix)</option>
                  <option value="raw">Raw Base64 (no prefix)</option>
                </select>
              </div>
            </SettingsPanel>

            {file && (
              <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl">
                <h3 className="text-sm font-medium text-neutral-400 mb-3">File Info</h3>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Name</span>
                    <span className="text-white truncate ml-2 max-w-[150px]">{file.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Size</span>
                    <span className="text-white">{formatFileSize(file.size)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Base64 Length</span>
                    <span className="text-sky-400">{base64.length.toLocaleString()} chars</span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-sky-500/10 border border-sky-500/20 p-4 rounded-xl text-sm text-sky-400">
              <strong>Use Cases:</strong>
              <ul className="mt-2 text-sky-300/80 space-y-1">
                <li>• Embed small images in HTML/CSS</li>
                <li>• Email templates (no external files)</li>
                <li>• Single-file HTML documents</li>
                <li>• API payloads with image data</li>
              </ul>
            </div>
          </div>

          {/* Workspace */}
          <div className="lg:col-span-8">
            {!file ? (
              <DropZone
                onDrop={handleDrop}
                onFileSelect={handleFileSelect}
                label="Drop Image to Convert"
                sublabel="Best for small images (icons, logos)"
                accentColor="sky"
              />
            ) : (
              <div className="space-y-4">
                {/* Preview */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                  <div className="flex items-center justify-center">
                    {dataUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img 
                        src={dataUrl} 
                        alt="Preview" 
                        className="max-h-[150px] object-contain"
                      />
                    ) : (
                      <div className="h-[150px] flex items-center justify-center text-neutral-500">
                        Converting...
                      </div>
                    )}
                  </div>
                </div>

                {/* Base64 Output */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-neutral-400 flex items-center gap-2">
                      <Code size={16} />
                      {outputType === 'dataurl' ? 'Data URL' : 'Raw Base64'}
                    </h3>
                    <button
                      onClick={() => copyToClipboard(outputType === 'dataurl' ? dataUrl : base64, outputType === 'dataurl' ? 'dataurl' : 'base64')}
                      className="flex items-center gap-1 text-sm text-sky-400 hover:text-sky-300"
                    >
                      {copied === 'dataurl' || copied === 'base64' ? <Check size={14} /> : <Copy size={14} />}
                      {copied === 'dataurl' || copied === 'base64' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <div className="bg-neutral-800 rounded-lg p-3 max-h-[120px] overflow-auto">
                    <code className="text-xs text-neutral-300 break-all">
                      {outputType === 'dataurl' ? dataUrl : base64}
                    </code>
                  </div>
                </div>

                {/* HTML img tag */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-neutral-400">HTML &lt;img&gt; Tag</h3>
                    <button
                      onClick={() => copyToClipboard(imgTag, 'img')}
                      className="flex items-center gap-1 text-sm text-sky-400 hover:text-sky-300"
                    >
                      {copied === 'img' ? <Check size={14} /> : <Copy size={14} />}
                      {copied === 'img' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <div className="bg-neutral-800 rounded-lg p-3 max-h-[80px] overflow-auto">
                    <code className="text-xs text-emerald-400 break-all">
                      {imgTag}
                    </code>
                  </div>
                </div>

                {/* CSS Background */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-neutral-400">CSS Background</h3>
                    <button
                      onClick={() => copyToClipboard(cssBackground, 'css')}
                      className="flex items-center gap-1 text-sm text-sky-400 hover:text-sky-300"
                    >
                      {copied === 'css' ? <Check size={14} /> : <Copy size={14} />}
                      {copied === 'css' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <div className="bg-neutral-800 rounded-lg p-3 max-h-[80px] overflow-auto">
                    <code className="text-xs text-violet-400 break-all">
                      {cssBackground}
                    </code>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-start bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
                  <button
                    onClick={handleDiscard}
                    className="px-4 py-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                  >
                    New Image
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
