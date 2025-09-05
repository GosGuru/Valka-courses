// Utilidades para normalizar y extraer datos de URLs de video
// Soporta: YouTube, Vimeo, Loom, enlaces directos (.mp4/.webm), Google Drive básico

const YT_REGEX = /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{6,})/;
const VIMEO_REGEX = /vimeo\.com\/(?:video\/)?(\d+)/;
const LOOM_REGEX = /loom\.com\/share\/([a-f0-9]{32})/;
const DRIVE_REGEX = /drive\.google\.com\/file\/d\/([^/]+)\//;

export function parseVideoUrl(raw) {
  if (!raw) return null;
  const url = raw.trim();
  const lower = url.toLowerCase();

  // Direct file
  if (/(\.mp4|\.webm|\.mkv|\.m4v)(\?.*)?$/i.test(lower)) {
    return { provider: 'file', id: null, embedUrl: url, original: url };
  }

  // YouTube
  const yt = url.match(YT_REGEX);
  if (yt) {
    const id = yt[1];
    return {
      provider: 'youtube',
      id,
      embedUrl: `https://www.youtube.com/embed/${id}`,
      original: url,
      thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
    };
  }

  // Vimeo
  const vm = url.match(VIMEO_REGEX);
  if (vm) {
    const id = vm[1];
    return {
      provider: 'vimeo',
      id,
      embedUrl: `https://player.vimeo.com/video/${id}`,
      original: url
    };
  }

  // Loom
  const loom = url.match(LOOM_REGEX);
  if (loom) {
    const id = loom[1];
    return {
      provider: 'loom',
      id,
      embedUrl: `https://www.loom.com/embed/${id}`,
      original: url
    };
  }

  // Google Drive (básico)
  const drive = url.match(DRIVE_REGEX);
  if (drive) {
    const id = drive[1];
    return {
      provider: 'gdrive',
      id,
      embedUrl: `https://drive.google.com/file/d/${id}/preview`,
      original: url
    };
  }

  // Fallback genérico: intentar usar directamente con iframe
  try {
    const u = new URL(url);
    return { provider: 'unknown', id: null, embedUrl: url, original: url };
  } catch {
    return null;
  }
}
