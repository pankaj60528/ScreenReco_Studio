import { useState, useRef, useCallback } from 'react';

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  error: string | null;
}

export interface UseScreenRecorderReturn {
  state: RecordingState;
  startRecording: (includeAudio: boolean) => Promise<void>;
  stopRecording: () => Promise<Blob | null>;
  pauseRecording: () => void;
  resumeRecording: () => void;
  previewStream: MediaStream | null;
}

export const useScreenRecorder = (): UseScreenRecorderReturn => {
  const [state, setState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    error: null,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);

  const startTimer = useCallback(() => {
    timerRef.current = setInterval(() => {
      setState(prev => ({ ...prev, duration: prev.duration + 1 }));
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startRecording = useCallback(async (includeAudio: boolean) => {
    try {
      setState(prev => ({ ...prev, error: null, duration: 0 }));
      chunksRef.current = [];

      // Get screen stream
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        // NOTE: keep constraints broadly compatible across Chrome/Edge/Firefox.
        // `displaySurface` is not a widely-supported constraint and can throw NotSupportedError.
        video: {
          frameRate: { ideal: 30, max: 60 },
        },
        audio: false,
      });

      let combinedStream = screenStream;

      // Get audio stream if requested
      if (includeAudio) {
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
            },
          });

          // Combine video and audio tracks
          const tracks = [
            ...screenStream.getVideoTracks(),
            ...audioStream.getAudioTracks(),
          ];
          combinedStream = new MediaStream(tracks);
        } catch (audioErr) {
          console.warn('Could not get audio stream:', audioErr);
        }
      }

      streamRef.current = combinedStream;
      setPreviewStream(combinedStream);

      // Set up MediaRecorder with maximum compatibility
      const possibleMimeTypes = [
        'video/webm',                   // Basic webm - most compatible
        'video/webm;codecs=vp8',        // VP8 codec
        'video/webm;codecs=vp9',       // VP9 codec
        'video/mp4',                    // MP4 fallback
        'video/webm;codecs=h264'       // H264 in webm
      ];
      
      let selectedMimeType = 'video/webm';
      for (const type of possibleMimeTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          selectedMimeType = type;
          console.log('Using MIME type:', selectedMimeType);
          break;
        }
      }

      // Force basic webm if nothing else works
      if (!MediaRecorder.isTypeSupported(selectedMimeType)) {
        selectedMimeType = 'video/webm';
        console.log('Falling back to basic webm');
      }

      console.log('Final selected MIME type:', selectedMimeType);

      const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType: selectedMimeType,
        videoBitsPerSecond: 1500000, // Lower bitrate for better compatibility
      });

      let totalSize = 0;
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
          totalSize += event.data.size;
          console.log(`Chunk received: ${event.data.size} bytes, total: ${totalSize} bytes, type: ${event.data.type}`);
        }
      };

      // Handle screen share ending
      screenStream.getVideoTracks()[0].onended = () => {
        stopRecording();
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000); // Capture every second

      // Store mimeType for use in onstop callback
      (mediaRecorderRef.current as any)._mimeType = selectedMimeType;

      setState(prev => ({ ...prev, isRecording: true }));
      startTimer();
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to start recording';
      setState(prev => ({ ...prev, error }));
      console.error('Recording error:', err);
    }
  }, [startTimer]);

  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      stopTimer();

      if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
        setState(prev => ({ ...prev, isRecording: false, isPaused: false }));
        resolve(null);
        return;
      }

      mediaRecorderRef.current.onstop = () => {
        console.log(`Recording stopped. Total chunks: ${chunksRef.current.length}`);
        
        if (chunksRef.current.length === 0) {
          console.error('No video data recorded');
          setState(prev => ({ ...prev, error: 'No video data was recorded. Please try again.' }));
          resolve(null);
          return;
        }

        const recordedMimeType = (mediaRecorderRef.current as any)._mimeType || 'video/webm';
        
        // Ensure chunks have actual data
        const validChunks = chunksRef.current.filter(chunk => chunk && chunk.size > 0);
        console.log(`Valid chunks: ${validChunks.length}/${chunksRef.current.length}`);
        
        if (validChunks.length === 0) {
          console.error('No valid video data recorded');
          setState(prev => ({ ...prev, error: 'No video data was recorded. Please try again.' }));
          resolve(null);
          return;
        }

        const blob = new Blob(validChunks, { type: recordedMimeType });
        console.log(`Blob created: ${blob.size} bytes, type: ${blob.type}, chunks: ${validChunks.length}`);
        
        // Validate the blob
        if (blob.size === 0) {
          console.error('Empty blob created despite having chunks');
          setState(prev => ({ ...prev, error: 'Recording failed - empty video file created.' }));
          resolve(null);
          return;
        }
        
        // Additional validation - check if blob is readable
        try {
          const testUrl = URL.createObjectURL(blob);
          console.log('Blob validation: URL created successfully');
          URL.revokeObjectURL(testUrl);
        } catch (blobError) {
          console.error('Blob validation failed:', blobError);
          setState(prev => ({ ...prev, error: 'Recording failed - invalid video file created.' }));
          resolve(null);
          return;
        }
        
        // Stop all tracks
        streamRef.current?.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        setPreviewStream(null);
        
        setState(prev => ({ ...prev, isRecording: false, isPaused: false }));
        resolve(blob);
      };

      mediaRecorderRef.current.stop();
    });
  }, [stopTimer]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.pause();
      stopTimer();
      setState(prev => ({ ...prev, isPaused: true }));
    }
  }, [stopTimer]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'paused') {
      mediaRecorderRef.current.resume();
      startTimer();
      setState(prev => ({ ...prev, isPaused: false }));
    }
  }, [startTimer]);

  return {
    state,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    previewStream,
  };
};
