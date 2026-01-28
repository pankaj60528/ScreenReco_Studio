 'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Scissors, Download, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useVideoTrimmer } from '@/hooks/useVideoTrimmer';

interface VideoTrimmerProps {
  videoBlob: Blob;
  onTrimComplete: (trimmedBlob: Blob, format: 'webm' | 'mp4', trimStart: number, trimEnd: number) => void;
  onSkip: () => void;
}

const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || !isFinite(seconds)) {
    return '00:00.0';
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 10);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`;
};

export const VideoTrimmer = ({ videoBlob, onTrimComplete, onSkip }: VideoTrimmerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [trimRange, setTrimRange] = useState<[number, number]>([0, 10]); // Default 10 seconds
  const [currentTime, setCurrentTime] = useState(0);
  const [format, setFormat] = useState<'webm' | 'mp4'>('webm');
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [videoDuration, setVideoDuration] = useState(0); // Added this back
  const [isDurationReady, setIsDurationReady] = useState(false);
  const [hasInitializedRange, setHasInitializedRange] = useState(false);
  const { state, loadFFmpeg, trimVideo, isLoaded } = useVideoTrimmer();

  // Simple approach - create video URL and set trim range
  useEffect(() => {
    if (videoBlob && videoBlob.size > 0) {
      const url = URL.createObjectURL(videoBlob);
      setVideoUrl(url);

      setCurrentTime(0);
      setTrimRange([0, 0]);
      setVideoDuration(0);
      setIsDurationReady(false);
      setHasInitializedRange(false);

      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [videoBlob]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;

    const d = v.duration;
    if (!isFinite(d) || isNaN(d) || d <= 0) {
      return;
    }

    setVideoDuration(d);
    setIsDurationReady(true);

    if (!hasInitializedRange) {
      setTrimRange([0, d]);
      setHasInitializedRange(true);
    }
  }, [hasInitializedRange]);

  const handleDurationChange = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;

    const d = v.duration;
    if (!isFinite(d) || isNaN(d) || d <= 0) {
      return;
    }

    setVideoDuration(d);
    setIsDurationReady(true);

    if (!hasInitializedRange) {
      setTrimRange([0, d]);
      setHasInitializedRange(true);
    }
  }, [hasInitializedRange]);

  const handleRangeChange = useCallback((values: number[]) => {
    if (!isDurationReady || videoDuration <= 0) return;

    const start = Math.max(0, Math.min(values[0], videoDuration));
    const end = Math.max(start, Math.min(values[1], videoDuration));
    setTrimRange([start, end]);

    // Only set currentTime if video is ready and value is valid
    if (videoRef.current && isFinite(start) && start >= 0) {
      try {
        videoRef.current.currentTime = start;
      } catch (error) {
        console.warn('Failed to set currentTime:', error);
      }
    }
  }, [isDurationReady, videoDuration]);

  const handleTrim = async () => {
    // Try FFmpeg first
    if (!isLoaded) {
      const loaded = await loadFFmpeg();
      if (!loaded) {
        // If FFmpeg fails, offer to use original video
        if (confirm('Video processor failed to load. Would you like to use the original video without trimming?')) {
          onTrimComplete(videoBlob, 'webm', 0, videoDuration || trimRange[1] || 0);
        }
        return;
      }
    }

    const trimmedBlob = await trimVideo(
      videoBlob,
      trimRange[0],
      trimRange[1],
      format
    );

    if (trimmedBlob) {
      onTrimComplete(trimmedBlob, format, trimRange[0], trimRange[1]);
    } else {
      // If trimming fails, offer to use original video
      if (confirm('Video trimming failed. Would you like to use the original video without trimming?')) {
        onTrimComplete(videoBlob, 'webm', 0, videoDuration || trimRange[1] || 0);
      }
    }
  };

  const handleDownloadOriginal = () => {
    const url = URL.createObjectURL(videoBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recording-${Date.now()}.webm`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Scissors className="w-5 h-5 text-primary" />
          Trim Video
        </h2>
        <Button variant="ghost" size="sm" onClick={onSkip}>
          Skip Trimming
        </Button>
      </div>

      {/* Video Preview */}
      <div className="video-container">
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            preload="metadata"
            onLoadedMetadata={handleLoadedMetadata}
            onDurationChange={handleDurationChange}
            onTimeUpdate={handleTimeUpdate}
            className="w-full aspect-video object-contain bg-black rounded-lg"
          />
        ) : (
          <div className="w-full aspect-video rounded-lg bg-secondary flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-12 h-12 mx-auto mb-2 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading video...</p>
            </div>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {!isDurationReady || videoDuration <= 0 ? (
          <div className="flex items-center justify-center text-sm text-muted-foreground font-mono">
            Loading duration...
          </div>
        ) : (
          <>
            <div className="text-center text-sm text-muted-foreground font-mono">
              Time Range: {formatTime(trimRange[0])} - {formatTime(trimRange[1])}
              <div className="text-xs mt-1">
                Video Length: {formatTime(videoDuration)}
              </div>
            </div>

            <div className="px-2">
              <Slider
                value={trimRange}
                min={0}
                max={videoDuration}
                step={0.1}
                onValueChange={handleRangeChange}
                className="cursor-pointer"
              />
            </div>
          </>
        )}

        {/* Current playhead indicator */}
        <div className="relative h-1 bg-secondary rounded-full overflow-hidden">
          <div
            className="absolute h-full bg-primary/50 transition-all duration-100"
            style={{
              left: `${(trimRange[0] / (isDurationReady && videoDuration > 0 ? videoDuration : 1)) * 100}%`,
              width: `${((trimRange[1] - trimRange[0]) / (isDurationReady && videoDuration > 0 ? videoDuration : 1)) * 100}%`,
            }}
          />
          <div
            className="absolute w-1 h-full bg-primary"
            style={{ left: `${(currentTime / (isDurationReady && videoDuration > 0 ? videoDuration : 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Export Options */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Label htmlFor="format" className="text-sm text-muted-foreground mb-2 block">
            Export Format
          </Label>
          <Select value={format} onValueChange={(v) => setFormat(v as 'webm' | 'mp4')}>
            <SelectTrigger id="format">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="webm">WebM (Fast)</SelectItem>
              <SelectItem value="mp4">MP4 (Universal)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Error Display */}
      {state.error && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            <AlertCircle className="w-4 h-4" />
            {state.error}
          </div>
          <Button 
            onClick={() => loadFFmpeg()} 
            variant="outline" 
            size="sm" 
            className="w-full"
          >
            <Loader2 className="w-4 h-4 mr-2" />
            Retry Loading Video Processor
          </Button>
        </div>
      )}

      {/* Progress */}
      {(state.isLoading || state.isProcessing) && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            {state.isLoading ? 'Loading video processor...' : `Processing... ${state.progress}%`}
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${state.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <Button
          variant="secondary"
          onClick={handleDownloadOriginal}
          className="flex-1"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Original
        </Button>
        <Button 
          onClick={handleTrim} 
          disabled={state.isProcessing}
          className="w-full"
        >
          {state.isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing {state.progress}%
            </>
          ) : (
            <>
              <Scissors className="w-4 h-4 mr-2" />
              Trim & Export
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
};
