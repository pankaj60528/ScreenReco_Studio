import { useState, useCallback } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

export interface TrimState {
  isLoading: boolean;
  isProcessing: boolean;
  progress: number;
  error: string | null;
}

export interface UseVideoTrimmerReturn {
  state: TrimState;
  loadFFmpeg: () => Promise<boolean>;
  trimVideo: (
    videoBlob: Blob,
    startTime: number,
    endTime: number,
    format: 'webm' | 'mp4'
  ) => Promise<Blob | null>;
  isLoaded: boolean;
}

let ffmpegInstance: FFmpeg | null = null;

export const useVideoTrimmer = (): UseVideoTrimmerReturn => {
  const [state, setState] = useState<TrimState>({
    isLoading: false,
    isProcessing: false,
    progress: 0,
    error: null,
  });
  const [isLoaded, setIsLoaded] = useState(false);

  const loadFFmpeg = useCallback(async (): Promise<boolean> => {
    if (isLoaded && ffmpegInstance) return true;

    setState(prev => ({ ...prev, isLoading: true, error: null, progress: 0 }));

    try {
      const ffmpeg = new FFmpeg();

      ffmpeg.on('progress', ({ progress }) => {
        const progressPercent = Math.max(1, Math.min(100, Math.round(progress * 100)));
        console.log('FFmpeg progress:', progressPercent + '%');
        setState(prev => ({ ...prev, progress: progressPercent }));
      });

      // Load ffmpeg with CDN URLs - try multiple CDNs for reliability
      const baseUrls = [
        'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd',
        'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd',
        'https://cdnjs.cloudflare.com/ajax/libs/ffmpeg-core/0.12.6/dist/umd'
      ];
      
      let loaded = false;
      let lastError: Error | null = null;
      
      for (const baseURL of baseUrls) {
        try {
          console.log(`Trying to load FFmpeg from: ${baseURL}`);
          setState(prev => ({ ...prev, progress: 10 }));
          
          await ffmpeg.load({
            coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
            wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
          });
          
          loaded = true;
          setState(prev => ({ ...prev, progress: 100 }));
          console.log('FFmpeg loaded successfully from:', baseURL);
          break;
        } catch (err) {
          lastError = err instanceof Error ? err : new Error('Unknown FFmpeg load error');
          console.warn(`Failed to load FFmpeg from ${baseURL}:`, lastError);
          setState(prev => ({ ...prev, progress: 0 }));
          continue;
        }
      }
      
      if (!loaded) {
        throw lastError || new Error('Failed to load FFmpeg from any CDN');
      }

      ffmpegInstance = ffmpeg;
      setIsLoaded(true);
      setState(prev => ({ ...prev, isLoading: false, progress: 0 }));
      return true;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to load video processor';
      setState(prev => ({ ...prev, isLoading: false, progress: 0, error }));
      console.error('FFmpeg load error:', err);
      return false;
    }
  }, [isLoaded]);

  const trimVideo = useCallback(async (
    videoBlob: Blob,
    startTime: number,
    endTime: number,
    format: 'webm' | 'mp4'
  ): Promise<Blob | null> => {
    if (!ffmpegInstance) {
      setState(prev => ({ ...prev, error: 'Video processor not loaded' }));
      return null;
    }

    if (!videoBlob || videoBlob.size === 0) {
      setState(prev => ({ ...prev, error: 'Invalid video input' }));
      return null;
    }

    const safeStart = Math.max(0, startTime || 0);
    const safeEnd = Math.max(safeStart, endTime || 0);
    const duration = safeEnd - safeStart;

    if (!isFinite(duration) || isNaN(duration) || duration <= 0.05) {
      setState(prev => ({ ...prev, error: 'Invalid trim range' }));
      return null;
    }

    setState(prev => ({ ...prev, isProcessing: true, progress: 0, error: null }));

    try {
      const inputFile = 'input.webm';
      const outputFile = format === 'mp4' ? 'output.mp4' : 'output.webm';

      console.log('Starting video trim:', { startTime: safeStart, endTime: safeEnd, duration, format, videoBlobSize: videoBlob.size });

      try { await ffmpegInstance.deleteFile(inputFile); } catch {}
      try { await ffmpegInstance.deleteFile(outputFile); } catch {}

      await ffmpegInstance.writeFile(inputFile, await fetchFile(videoBlob));

      const startStr = safeStart.toFixed(3);
      const durStr = duration.toFixed(3);

      let args: string[];

      if (format === 'webm') {
        args = [
          '-ss', startStr,
          '-t', durStr,
          '-i', inputFile,
          '-map', '0',
          '-c', 'copy',
          '-fflags', '+genpts',
          '-avoid_negative_ts', 'make_zero',
          '-reset_timestamps', '1',
          outputFile,
        ];

        try {
          console.log('FFmpeg command:', args.join(' '));
          await ffmpegInstance.exec(args);
        } catch (copyErr) {
          console.warn('Copy trim failed, falling back to re-encode:', copyErr);
          args = [
            '-ss', startStr,
            '-t', durStr,
            '-i', inputFile,
            '-c:v', 'libvpx',
            '-b:v', '1M',
            '-c:a', 'libopus',
            '-b:a', '128k',
            '-deadline', 'realtime',
            '-cpu-used', '4',
            '-avoid_negative_ts', 'make_zero',
            outputFile,
          ];
          console.log('FFmpeg command:', args.join(' '));
          await ffmpegInstance.exec(args);
        }
      } else {
        args = [
          '-ss', startStr,
          '-t', durStr,
          '-i', inputFile,
          '-c:v', 'libx264',
          '-preset', 'veryfast',
          '-crf', '28',
          '-pix_fmt', 'yuv420p',
          '-c:a', 'aac',
          '-b:a', '128k',
          '-movflags', '+faststart',
          '-avoid_negative_ts', 'make_zero',
          outputFile,
        ];

        try {
          console.log('FFmpeg command:', args.join(' '));
          await ffmpegInstance.exec(args);
        } catch (mp4Err) {
          console.warn('MP4 encode failed, falling back to mpeg4:', mp4Err);
          args = [
            '-ss', startStr,
            '-t', durStr,
            '-i', inputFile,
            '-c:v', 'mpeg4',
            '-q:v', '5',
            '-c:a', 'aac',
            '-b:a', '128k',
            '-movflags', '+faststart',
            '-avoid_negative_ts', 'make_zero',
            outputFile,
          ];
          console.log('FFmpeg command:', args.join(' '));
          await ffmpegInstance.exec(args);
        }
      }

      console.log('FFmpeg processing completed');

      // Read output file
      const data = await ffmpegInstance.readFile(outputFile);
      const mimeType = format === 'mp4' ? 'video/mp4' : 'video/webm';
      
      // Create blob from the file data - handle both Uint8Array and string returns
      let blobData: Uint8Array;
      if (typeof data === 'string') {
        // Convert base64 string to Uint8Array if needed
        const binaryString = atob(data);
        blobData = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          blobData[i] = binaryString.charCodeAt(i);
        }
      } else {
        blobData = new Uint8Array(data);
      }
      
      const trimmedBlob = new Blob([blobData as BlobPart], { type: mimeType });
      console.log('Trimmed blob created:', { size: trimmedBlob.size, type: trimmedBlob.type });

      setState(prev => ({ ...prev, isProcessing: false, progress: 100 }));
      return trimmedBlob;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to process video';
      setState(prev => ({ ...prev, isProcessing: false, error }));
      console.error('Trim error:', err);
      return null;
    } finally {
      try { await ffmpegInstance.deleteFile('input.webm'); } catch {}
      try { await ffmpegInstance.deleteFile('output.webm'); } catch {}
      try { await ffmpegInstance.deleteFile('output.mp4'); } catch {}
    }
  }, []);

  return {
    state,
    loadFFmpeg,
    trimVideo,
    isLoaded,
  };
};
