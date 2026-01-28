import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Video as VideoIcon } from 'lucide-react';

interface VideoPreviewProps {
  stream?: MediaStream | null;
  videoUrl?: string;
  className?: string;
}

export const VideoPreview = ({ stream, videoUrl, className = '' }: VideoPreviewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  if (!stream && !videoUrl) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`video-container flex items-center justify-center aspect-video ${className}`}
      >
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <VideoIcon className="w-16 h-16 opacity-30" />
          <p className="text-sm">No video to preview</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`video-container aspect-video ${className}`}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        autoPlay={!!stream}
        muted={!!stream}
        controls={!!videoUrl}
        playsInline
        className="w-full h-full object-contain bg-black"
      />
    </motion.div>
  );
};
