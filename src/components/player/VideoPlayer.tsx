import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Play, Pause, Volume2, VolumeX, 
  Maximize, SkipForward, SkipBack 
} from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  title?: string;
  poster?: string;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
}

export const VideoPlayer = ({ 
  src, 
  title, 
  poster,
  onProgress,
  onComplete
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // Initialize player
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleDurationChange = () => {
      setDuration(video.duration);
    };

    const handleTimeUpdate = () => {
      const current = video.currentTime;
      const percentage = (current / video.duration) * 100;
      setCurrentTime(current);
      setProgress(percentage);
      
      if (onProgress) {
        onProgress(percentage);
      }
      
      // Check if video is completed (with 1 second buffer for network latency)
      if (percentage > 98 && onComplete) {
        onComplete();
      }
    };

    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [onProgress, onComplete]);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const value = parseFloat(e.target.value);
    video.volume = value;
    setVolume(value);
    setIsMuted(value === 0);
  };

  const handleProgressChange = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    video.currentTime = pos * duration;
  };

  const skipForward = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.min(video.currentTime + 10, duration);
  };

  const skipBackward = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(video.currentTime - 10, 0);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Determine video source type
  const getVideoSource = () => {
    if (src.includes('youtube.com') || src.includes('youtu.be')) {
      // Convert YouTube URL to embed format
      const videoId = src.includes('youtu.be')
        ? src.split('/').pop()
        : src.includes('v=')
          ? new URLSearchParams(new URL(src).search).get('v')
          : '';
          
      return (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`}
          title={title || 'Lesson Video'}
          className="w-full aspect-video rounded-lg"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        ></iframe>
      );
    } else {
      // Regular video file
      return (
        <>
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            className="w-full rounded-t-lg"
            onClick={togglePlayPause}
          />
          <div className="bg-gray-900 text-white p-2 rounded-b-lg">
            <div 
              className="h-2 bg-gray-700 rounded-full mb-2 cursor-pointer"
              onClick={handleProgressChange}
            >
              <Progress value={progress} className="h-full" />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost" 
                  size="icon" 
                  onClick={togglePlayPause}
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={skipBackward}
                >
                  <SkipBack size={20} />
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={skipForward}
                >
                  <SkipForward size={20} />
                </Button>
                
                <span className="text-xs text-gray-300">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={toggleMute}
                >
                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </Button>
                
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-20"
                />
                
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => videoRef.current?.requestFullscreen()}
                >
                  <Maximize size={20} />
                </Button>
              </div>
            </div>
          </div>
        </>
      );
    }
  };

  return (
    <div className="overflow-hidden rounded-lg shadow-lg">
      {title && (
        <div className="bg-gray-800 text-white py-2 px-4">
          <h3 className="text-md font-medium">{title}</h3>
        </div>
      )}
      {getVideoSource()}
    </div>
  );
};
