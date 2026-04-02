"use client";

export function VideoEmbed({ url }: { url: string }) {
  const src = url.trim();
  if (!src) return null;

  const ytMatch = src.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  if (ytMatch) {
    return (
      <div className="relative aspect-[9/16] max-h-[70vh] w-full overflow-hidden rounded-[11px] bg-black sm:aspect-video">
        <iframe
          src={`https://www.youtube.com/embed/${ytMatch[1]}?rel=0`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
          title="video"
        />
      </div>
    );
  }

  return (
    <video
      src={src}
      controls
      playsInline
      preload="metadata"
      className="w-full rounded-[11px] bg-black"
      style={{ maxHeight: "70vh" }}
    />
  );
}
