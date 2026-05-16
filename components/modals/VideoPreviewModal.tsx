'use client';

import { X } from 'lucide-react';
import { toEmbedUrl } from '@/lib/youtube';

interface VideoPreviewModalProps {
  videoUrl: string;
  exercicioName: string;
  onClose: () => void;
}

export default function VideoPreviewModal({ videoUrl, exercicioName, onClose }: VideoPreviewModalProps) {
  const embedUrl = toEmbedUrl(videoUrl, { clean: true });

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface-elevated rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-neutral-900 text-white p-4 flex justify-between items-start flex-shrink-0">
          <div className="min-w-0">
            <h3 className="font-bold text-base truncate">{exercicioName}</h3>
            <p className="text-xs text-neutral-300 mt-0.5">Preview do vídeo</p>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors flex-shrink-0 ml-3"
            aria-label="Fechar"
          >
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div className="bg-black aspect-video w-full flex-shrink-0">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allow="autoplay; encrypted-media"
              allowFullScreen
              title={`Vídeo — ${exercicioName}`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white text-sm">
              URL do vídeo inválida.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
