 'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Link2, Copy, Check, Loader2, Share2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import type { VideoRecord } from '@/lib/db';

interface UploadShareProps {
  videoBlob: Blob;
  format: 'webm' | 'mp4';
  duration: number;
  trimStart?: number;
  trimEnd?: number;
  onComplete: (video: VideoRecord) => void;
}

export const UploadShare = ({
  videoBlob,
  format,
  duration,
  trimStart,
  trimEnd,
  onComplete,
}: UploadShareProps) => {
  const [title, setTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleUpload = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title for your video');
      return;
    }

    setIsUploading(true);
    setUploadProgress(20);

    try {
      const filename = `${title.replace(/[^a-zA-Z0-9]/g, '-') || 'recording'}.${format}`;
      const formData = new FormData();
      formData.append('file', videoBlob, filename);
      formData.append('title', title);
      formData.append('duration', duration.toString());
      if (trimStart !== undefined) formData.append('trimStart', trimStart.toString());
      if (trimEnd !== undefined) formData.append('trimEnd', trimEnd.toString());

      setUploadProgress(50);
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `Upload failed (${response.status})`;
        throw new Error(errorMessage);
      }

      const data = await response.json() as { video: VideoRecord; shareUrl: string };
      setUploadProgress(100);
      const computedShareUrl = data?.video?.shareId
        ? `${window.location.origin}/watch/${data.video.shareId}`
        : data.shareUrl;
      setShareUrl(computedShareUrl);
      toast.success('Video uploaded successfully!');
      onComplete(data.video);
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Failed to upload video. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!shareUrl) return;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const openShareUrl = () => {
    if (shareUrl) {
      window.open(shareUrl, '_blank');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 space-y-6"
    >
      <div className="flex items-center gap-2">
        <Upload className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold">Upload & Share</h2>
      </div>

      {!shareUrl ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="title">Video Title</Label>
            <Input
              id="title"
              placeholder="Give your recording a name..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isUploading}
              className="bg-secondary/50 border-border"
            />
          </div>

          <div className="text-sm text-muted-foreground space-y-1">
            <p>Format: {format.toUpperCase()}</p>
            <p>Size: {(videoBlob.size / (1024 * 1024)).toFixed(2)} MB</p>
            <p>Duration: {Math.round(duration)}s</p>
          </div>

          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}

          <Button
            onClick={handleUpload}
            disabled={isUploading || !title.trim()}
            className="w-full bg-primary hover:bg-primary/90"
            size="lg"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload Video
              </>
            )}
          </Button>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <div className="p-4 rounded-lg bg-success/10 border border-success/20">
            <div className="flex items-center gap-2 text-success mb-2">
              <Check className="w-5 h-5" />
              <span className="font-medium">Video uploaded successfully!</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your video is now available at the link below
            </p>
          </div>

          <div className="space-y-2">
            <Label>Share Link</Label>
            <div className="flex gap-2">
              <Input
                value={shareUrl}
                readOnly
                className="bg-secondary/50 border-border font-mono text-sm"
              />
              <Button
                variant="secondary"
                size="icon"
                onClick={copyToClipboard}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-success" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={copyToClipboard}
              className="flex-1"
            >
              <Link2 className="w-4 h-4 mr-2" />
              Copy Link
            </Button>
            <Button
              onClick={openShareUrl}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Video
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
