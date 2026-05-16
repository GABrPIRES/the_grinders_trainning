/**
 * Converte URLs comuns do YouTube (watch, youtu.be, shorts) em URL de embed.
 * Retorna null se a URL não bater com nenhum padrão conhecido.
 *
 * @param url URL original (string)
 * @param opts Opções: `clean` (sem autoplay/controls hidden) — útil para modais
 */
export function toEmbedUrl(url: string, opts?: { clean?: boolean }): string | null {
  try {
    const u = new URL(url);
    let videoId: string | null = null;
    if (u.hostname === 'youtu.be') {
      videoId = u.pathname.slice(1).split('?')[0];
    } else if (u.pathname.startsWith('/shorts/')) {
      videoId = u.pathname.split('/shorts/')[1]?.split('?')[0] ?? null;
    } else {
      videoId = u.searchParams.get('v');
    }
    if (!videoId) return null;

    const params = opts?.clean
      ? 'rel=0&modestbranding=1'
      : 'enablejsapi=1&autoplay=1&controls=0&rel=0&modestbranding=1';

    return `https://www.youtube.com/embed/${videoId}?${params}`;
  } catch {
    return null;
  }
}
