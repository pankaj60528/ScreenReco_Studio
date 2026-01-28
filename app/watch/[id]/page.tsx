'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, AlertCircle, ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';
import type { VideoRecord } from '@/lib/db';
import { Button } from '@/components/ui/button';

export default function WatchPage() {
  const params = useParams<{ id: string }>();
  const [video, setVideo] = useState<VideoRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completionReported, setCompletionReported] = useState(false);
  const [shareLink, setShareLink] = useState<string>('');
  const [videoError, setVideoError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!params?.id) return;
      try {
        let lastErrText: string | null = null;
        for (let attempt = 0; attempt < 3; attempt++) {
          const res = await fetch(`/api/videos/${params.id}`);
          if (res.ok) {
            const data = await res.json() as { video: VideoRecord };
            setVideo(data.video);
            setShareLink(`${window.location.origin}/watch/${data.video.shareId}`);
            // fire view analytics
            fetch('/api/analytics/view', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: data.video.id }),
            }).catch(() => {});
            return;
          }

          let serverMessage = '';
          try {
            const payload = await res.json() as any;
            serverMessage = payload?.error ? String(payload.error) : '';
          } catch {
            serverMessage = '';
          }

          lastErrText = serverMessage || `Request failed (${res.status})`;

          // Retry only on transient server errors
          if (res.status >= 500 && attempt < 2) {
            await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
            continue;
          }

          if (res.status === 404) {
            try {
              const listRes = await fetch('/api/videos');
              if (listRes.ok) {
                const listData = await listRes.json() as { videos?: VideoRecord[] };
                const found = (listData.videos || []).find((v) => v.id === params.id || v.shareId === params.id);
                if (found) {
                  setVideo(found);
                  setShareLink(`${window.location.origin}/watch/${found.shareId}`);
                  fetch('/api/analytics/view', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: found.id }),
                  }).catch(() => {});
                  return;
                }
              }
            } catch {}

            setError('Video not found');
          } else {
            setError(lastErrText);
          }
          return;
        }

        setError(lastErrText || 'Failed to load video');
        return;
      } catch (err) {
        console.error(err);
        setError('Failed to load video');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params?.id]);

  const reportCompletion = async (percent: number) => {
    if (!video) return;
    fetch('/api/analytics/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: video.id, completionPercent: percent }),
    }).catch(() => {});
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current || !video) return;
    const duration = videoRef.current.duration || video.durationSeconds || 0;
    if (!duration) return;
    const percent = (videoRef.current.currentTime / duration) * 100;
    if (percent > 90 && !completionReported) {
      setCompletionReported(true);
      reportCompletion(Math.round(percent));
    }
  };

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    const error = video.error;
    let errorMessage = 'Video failed to load';
    
    if (error) {
      switch (error.code) {
        case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
          errorMessage = 'Video format not supported';
          break;
        case error.MEDIA_ERR_NETWORK:
          errorMessage = 'Network error - please check your connection';
          break;
        default:
          errorMessage = `Video error: ${error.message || 'Unknown error'}`;
      }
    }
    
    setVideoError(errorMessage);
    console.error('Watch page video error:', error);
  };

  const handleEnded = () => {
    if (!completionReported) {
      setCompletionReported(true);
      reportCompletion(100);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading video...</p>
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-6 text-center space-y-4 max-w-md">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
          <p className="text-lg font-semibold">{error || 'Video unavailable'}</p>
          <Link href="/record">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              New Recording
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/record" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold">
              🎥
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">Screen Studio</h1>
              <p className="text-xs text-muted-foreground">Record • Trim • Share</p>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/record">
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Record New
              </Button>
            </Link>
            <Link href="/videos">
              <Button variant="ghost" size="sm">
                My Videos
              </Button>
            </Link>
            <div className="text-sm text-muted-foreground">
              Views: {video.viewCount} • Completion: {Math.round(video.completionPercent)}%
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        <div className="glass-card p-4">
          {videoError ? (
            <div className="w-full aspect-video rounded-lg bg-destructive/10 flex items-center justify-center text-destructive">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 mx-auto mb-2" />
                <p className="text-sm">{videoError}</p>
                <p className="text-xs mt-1">Video URL: {video.trimmedUrl}</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={() => window.open(video.trimmedUrl, '_blank')}>
                  Open Direct Link
                </Button>
              </div>
            </div>
          ) : (
            <video
              ref={videoRef}
              src={video.trimmedUrl}
              controls
              className="w-full aspect-video bg-black rounded-lg"
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleEnded}
              onError={handleVideoError}
              controlsList="nodownload"
            />
          )}
        </div>

        <div className="glass-card p-6 space-y-2">
          <h1 className="text-2xl font-bold">{video.title}</h1>
          <p className="text-sm text-muted-foreground">
            Duration: {video.durationSeconds ? `${Math.round(video.durationSeconds)}s` : 'Unknown'} •
            Created: {new Date(video.createdAt).toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">
            Share link: <span className="font-mono break-all">{shareLink}</span>
          </p>
        </div>
      </main>
    </div>
  );
}
