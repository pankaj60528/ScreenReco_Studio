 'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Circle, Square, Pause, Play, Mic, MicOff, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface RecordingControlsProps {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  onStart: (includeAudio: boolean) => void;
  onStop: () => void;
  onPause: () => void;
  onResume: () => void;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const RecordingControls = ({
  isRecording,
  isPaused,
  duration,
  onStart,
  onStop,
  onPause,
  onResume,
}: RecordingControlsProps) => {
  const [includeAudio, setIncludeAudio] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-8"
    >
      <div className="flex flex-col items-center gap-6">
        {/* Timer Display */}
        <AnimatePresence mode="wait">
          {isRecording && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-3"
            >
              <motion.div
                animate={{ opacity: isPaused ? 0.5 : [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: isPaused ? 0 : Infinity }}
                className="w-3 h-3 rounded-full bg-destructive"
              />
              <span className="font-mono text-4xl font-medium text-foreground">
                {formatTime(duration)}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Audio Toggle - Only show when not recording */}
        {!isRecording && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 p-4 rounded-lg bg-secondary/50"
          >
            {includeAudio ? (
              <Mic className="w-5 h-5 text-primary" />
            ) : (
              <MicOff className="w-5 h-5 text-muted-foreground" />
            )}
            <Label htmlFor="audio-toggle" className="text-sm font-medium">
              Include Microphone
            </Label>
            <Switch
              id="audio-toggle"
              checked={includeAudio}
              onCheckedChange={setIncludeAudio}
            />
          </motion.div>
        )}

        {/* Control Buttons */}
        <div className="flex items-center gap-4">
          {!isRecording ? (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                className="h-16 px-8 text-lg font-semibold bg-destructive hover:bg-destructive/90 glow-effect"
                onClick={() => onStart(includeAudio)}
              >
                <Circle className="w-6 h-6 mr-3 fill-current" />
                Start Recording
              </Button>
            </motion.div>
          ) : (
            <>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  variant="secondary"
                  className="h-14 px-6"
                  onClick={isPaused ? onResume : onPause}
                >
                  {isPaused ? (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Resume
                    </>
                  ) : (
                    <>
                      <Pause className="w-5 h-5 mr-2" />
                      Pause
                    </>
                  )}
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  className="h-14 px-6 bg-primary hover:bg-primary/90"
                  onClick={onStop}
                >
                  <Square className="w-5 h-5 mr-2 fill-current" />
                  Stop Recording
                </Button>
              </motion.div>
            </>
          )}
        </div>

        {/* Instructions */}
        {!isRecording && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <Monitor className="w-4 h-4" />
            Select a screen, window, or tab to record
          </motion.p>
        )}
      </div>
    </motion.div>
  );
};
