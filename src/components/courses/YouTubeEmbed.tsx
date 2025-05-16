
import { useState } from 'react';
import { ExternalLink } from 'lucide-react';

type YouTubeEmbedProps = {
  url: string;
  title: string;
};

export function YouTubeEmbed({ url, title }: YouTubeEmbedProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Extract YouTube video ID from URL
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };
  
  const videoId = getYouTubeId(url);
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=${isPlaying ? 1 : 0}`;
  
  // If the video can't be embedded, show a link instead
  if (!videoId) {
    return (
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center text-blue-600 hover:underline"
      >
        {title} <ExternalLink size={16} className="ml-1" />
      </a>
    );
  }
  
  return (
    <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted mb-4">
      {isPlaying ? (
        <iframe
          src={embedUrl}
          title={title}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <div 
          className="relative w-full h-full cursor-pointer"
          onClick={() => setIsPlaying(true)}
        >
          <img 
            src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`} 
            alt={title}
            className="w-full h-full object-cover"
            onError={(e) => {
              // If maxresdefault thumbnail is not found, try the default one
              e.currentTarget.src = `https://img.youtube.com/vi/${videoId}/0.jpg`;
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
              <div className="w-0 h-0 border-t-8 border-b-8 border-l-12 border-transparent border-l-white ml-1"></div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 text-sm">
            {title}
          </div>
        </div>
      )}
    </div>
  );
}
