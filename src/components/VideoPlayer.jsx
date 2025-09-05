import React, { useState } from 'react';
import { parseVideoUrl } from '@/lib/video';

/**
 * Props: { url?: string, className?: string }
 * Intenta renderizar un iframe embebido multi-plataforma.
 * Fallback: link externo o mensaje.
 */
export const VideoPlayer = ({ url, className = '', autoPlay = false }) => {
  const info = parseVideoUrl(url);
  const [active, setActive] = useState(autoPlay);

  if (!url) {
    return <div className={`flex items-center justify-center w-full h-full bg-muted text-muted-foreground ${className}`}>Sin video</div>;
  }
  if (!info) {
    return <div className={`flex flex-col items-center justify-center w-full h-full gap-2 bg-muted text-muted-foreground p-4 ${className}`}>
      <p>No se pudo interpretar la URL del video.</p>
      <a className="underline" href={url} target="_blank" rel="noopener noreferrer">Abrir enlace</a>
    </div>;
  }

  const allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
  const common = {
    className: 'w-full h-full',
    allow,
    allowFullScreen: true,
    loading: 'lazy',
    referrerPolicy: 'strict-origin-when-cross-origin'
  };

  // Si es YouTube y no está activo todavía, mostramos thumbnail (lazy-load)
  if (!active && info.provider === 'youtube' && info.thumbnail) {
    return (
      <button type="button" onClick={() => setActive(true)} className={`group relative w-full h-full ${className} overflow-hidden rounded bg-black`}> 
        <img src={info.thumbnail} alt="Thumbnail" className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105" />
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <div className="px-4 py-2 text-sm font-semibold tracking-wide text-white rounded-full bg-primary/80 backdrop-blur">▶ Reproducir</div>
        </div>
      </button>
    );
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      <iframe
        src={info.embedUrl + (active && info.provider === 'youtube' ? '?autoplay=1&rel=0' : '')}
        title="Video"
        {...common}
        onError={(e) => {
          // Reemplaza por fallback de enlace
          const parent = e.currentTarget.parentElement;
          if (parent) {
            parent.innerHTML = `<div class='flex flex-col items-center justify-center w-full h-full gap-2 bg-muted text-muted-foreground p-4'>\n<p>No se pudo cargar el reproductor embebido.</p>\n<a class='underline' href='${info.original}' target='_blank' rel='noopener noreferrer'>Abrir en nueva pestaña</a></div>`;
          }
        }}
      />
    </div>
  );
};

export default VideoPlayer;
