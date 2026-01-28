'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { RecordingControls } from '@/components/RecordingControls';
import { VideoTrimmer } from '@/components/VideoTrimmer';
import { UploadShare } from '@/components/UploadShare';
import { useScreenRecorder } from '@/hooks/useScreenRecorder';
import { Button } from '@/components/ui/button';
import type { VideoRecord } from '@/lib/db';
import Link from 'next/link';

type Step = 'record' | 'trim' | 'upload' | 'done';

export default function RecordPage() {
  const [step, setStep] = useState<Step>('record');
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [finalBlob, setFinalBlob] = useState<Blob | null>(null);
  const [format, setFormat] = useState<'webm' | 'mp4'>('webm');
  const [duration, setDuration] = useState(0);
  const [trimStart, setTrimStart] = useState<number | undefined>(undefined);
  const [trimEnd, setTrimEnd] = useState<number | undefined>(undefined);
  const [completedVideo, setCompletedVideo] = useState<VideoRecord | null>(null);

  const getBlobDurationSeconds = async (blob: Blob): Promise<number> => {
    return await new Promise((resolve) => {
      const url = URL.createObjectURL(blob);
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.src = url;
      video.onloadedmetadata = () => {
        const d = Number.isFinite(video.duration) ? video.duration : 0;
        URL.revokeObjectURL(url);
        resolve(d > 0 ? d : 0);
      };
      video.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(0);
      };
    });
  };

  const {
    state,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    previewStream,
  } = useScreenRecorder();

  useEffect(() => {
    if (state.isRecording) {
      setDuration(state.duration);
    }
  }, [state.duration, state.isRecording]);

  const handleStop = async () => {
    const blob = await stopRecording();
    if (blob) {
      setRecordedBlob(blob);
      setTrimStart(undefined);
      setTrimEnd(undefined);
      setStep('trim');
    }
  };

  const handleTrimComplete = (
    trimmedBlob: Blob,
    exportFormat: 'webm' | 'mp4',
    start: number,
    end: number
  ) => {
    setFinalBlob(trimmedBlob);
    setFormat(exportFormat);
    setTrimStart(start);
    setTrimEnd(end);
    setDuration(Math.max(0, end - start));
    setStep('upload');
  };

  const handleSkipTrim = () => {
    setFinalBlob(recordedBlob);
    setFormat('webm');
    setTrimStart(undefined);
    setTrimEnd(undefined);
    if (recordedBlob) {
      getBlobDurationSeconds(recordedBlob).then((d) => {
        if (d > 0) setDuration(d);
      });
    }
    setStep('upload');
  };

  const handleUploadComplete = (video: VideoRecord) => {
    setCompletedVideo(video);
    setStep('done');
  };

  const handleNewRecording = () => {
    setStep('record');
    setRecordedBlob(null);
    setFinalBlob(null);
    setCompletedVideo(null);
    setDuration(0);
    setTrimStart(undefined);
    setTrimEnd(undefined);
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold">
              🎥
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">Screen Studio</h1>
              <p className="text-xs text-muted-foreground">Record • Trim • Share</p>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/videos">
              <Button variant="ghost" size="sm">
                My Videos
              </Button>
            </Link>
            <span className="text-sm text-muted-foreground">MVP slice</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {step === 'record' && !state.isRecording && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
            >
              <Sparkles className="w-4 h-4" />
              Screen Recording Made Simple
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Record, <span className="gradient-text">Trim</span> & Share
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Capture your screen with audio, trim to perfection, and share with anyone in seconds.
            </p>
          </motion.div>
        )}

        <div className="flex items-center justify-center gap-2 mb-8">
          {['record', 'trim', 'upload', 'done'].map((s, i) => (
            <motion.div
              key={s}
              className={`flex items-center gap-2 ${i < 3 ? 'flex-1 max-w-[100px]' : ''}`}
            >
              <motion.div
                animate={{
                  scale: step === s ? 1.1 : 1,
                  backgroundColor: ['record', 'trim', 'upload', 'done'].indexOf(step) >= i
                    ? 'hsl(var(--primary))'
                    : 'hsl(var(--secondary))',
                }}
                className="w-3 h-3 rounded-full"
              />
              {i < 3 && (
                <div className={`flex-1 h-0.5 ${
                  ['record', 'trim', 'upload', 'done'].indexOf(step) > i
                    ? 'bg-primary'
                    : 'bg-secondary'
                }`} />
              )}
            </motion.div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 'record' && (
            <motion.div
              key="record"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="video-container">
                {previewStream ? (
                  <video
                    className="w-full aspect-video object-contain bg-black rounded-lg"
                    autoPlay
                    muted
                    playsInline
                    ref={(node) => {
                      if (node && previewStream) {
                        node.srcObject = previewStream;
                      }
                    }}
                  />
                ) : (
                  <div className="w-full aspect-video rounded-lg bg-secondary flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                        <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p>Click "Start Recording" to begin</p>
                    </div>
                  </div>
                )}
              </div>
              <RecordingControls
                isRecording={state.isRecording}
                isPaused={state.isPaused}
                duration={state.duration}
                onStart={startRecording}
                onStop={handleStop}
                onPause={pauseRecording}
                onResume={resumeRecording}
              />
              {state.error && (
                <p className="text-center text-destructive text-sm">{state.error}</p>
              )}
            </motion.div>
          )}

          {step === 'trim' && recordedBlob && (
            <motion.div
              key="trim"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <VideoTrimmer
                videoBlob={recordedBlob}
                onTrimComplete={handleTrimComplete}
                onSkip={handleSkipTrim}
              />
            </motion.div>
          )}

          {step === 'upload' && finalBlob && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <UploadShare
                videoBlob={finalBlob}
                format={format}
                duration={duration}
                trimStart={trimStart}
                trimEnd={trimEnd}
                onComplete={handleUploadComplete}
              />
            </motion.div>
          )}

          {step === 'done' && completedVideo && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6"
              >
                <svg
                  className="w-10 h-10 text-success"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </motion.div>

              <h2 className="text-2xl font-bold mb-2">Video Ready!</h2>
              <p className="text-muted-foreground mb-6">
                Your recording has been uploaded and is ready to share
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="secondary" onClick={handleNewRecording}>
                  New Recording
                </Button>
                <Link href={`/watch/${completedVideo.shareId}`}>
                  <Button className="bg-primary hover:bg-primary/90">
                    View Video
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
