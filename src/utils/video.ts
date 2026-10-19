// Video helper utilities for YouTube, web video links, and uploaded video files

export function getYouTubeId(url?: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  // Pattern matches:
  // - youtube.com/watch?v=ID
  // - youtu.be/ID
  // - youtube.com/embed/ID
  // - youtube.com/shorts/ID
  // - m.youtube.com/...
  const regExp = /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/;
  const match = trimmed.match(regExp);
  return match ? match[1] : null;
}

export function isYouTubeUrl(url?: string): boolean {
  return !!getYouTubeId(url);
}

export function getYouTubeEmbedUrl(url?: string, autoplay = false): string | null {
  const id = getYouTubeId(url);
  if (!id) return null;
  return `https://www.youtube-nocookie.com/embed/${id}?rel=0${autoplay ? '&autoplay=1' : ''}`;
}

export function isDirectVideoUrl(url?: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const lower = url.toLowerCase();
  return (
    lower.startsWith('data:video/') ||
    lower.startsWith('/uploads/') ||
    lower.endsWith('.mp4') ||
    lower.endsWith('.webm') ||
    lower.endsWith('.ogg') ||
    lower.endsWith('.mov')
  );
}
