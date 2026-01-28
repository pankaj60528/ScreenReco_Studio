'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Eye, Calendar, Copy, Check, ExternalLink, Film, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import type { VideoRecord } from '@/lib/db';
import Link from 'next/link';

export default function VideosPage() {
  const [videos, setVideos] = useState<VideoRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deletingIds, setDeletingIds] = useState<string[]>([]);

  useEffect(() => {
    const loadVideos = async () => {
      try {
        const response = await fetch('/api/videos');
        if (response.ok) {
          const data = await response.json();
          setVideos(data.videos || []);
        }
      } catch (error) {
        console.error('Failed to load videos:', error);
        toast.error('Failed to load videos');
      } finally {
        setLoading(false);
      }
    };

    loadVideos();
  }, []);

  const copyShareLink = async (video: VideoRecord) => {
    const shareUrl = `${window.location.origin}/watch/${video.shareId}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedId(video.id);
      toast.success('Share link copied!');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'Unknown';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const deleteVideo = async (id: string) => {
    setDeletingIds(prev => [...prev, id]);
    try {
      const res = await fetch(`/api/videos/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setVideos(prev => prev.filter(v => v.id !== id));
        toast.success('Video deleted');
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to delete');
      }
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeletingIds(prev => prev.filter(d => d !== id));
    }
  };

  const deleteSelected = async () => {
    if (!selectedIds.length) return;
    setDeletingIds(selectedIds);
    try {
      await Promise.all(selectedIds.map(id => fetch(`/api/videos/${id}`, { method: 'DELETE' })));
      setVideos(prev => prev.filter(v => !selectedIds.includes(v.id)));
      setSelectedIds([]);
      toast.success(`${selectedIds.length} video(s) deleted`);
    } catch {
      toast.error('Failed to delete some videos');
    } finally {
      setDeletingIds([]);
    }
  };

  const toggleSelect = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(v => v !== id));
    }
  };

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(videos.map(v => v.id));
    } else {
      setSelectedIds([]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading videos...</p>
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
              <Button variant="ghost" size="sm">
                Record
              </Button>
            </Link>
            <span className="text-sm text-muted-foreground">My Videos</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold">Your Videos</h1>
            {videos.length > 0 && (
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedIds.length === videos.length}
                  onCheckedChange={toggleSelectAll}
                />
                <span className="text-sm text-muted-foreground">
                  {selectedIds.length > 0 ? `${selectedIds.length} selected` : 'Select all'}
                </span>
                {selectedIds.length > 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={deleteSelected}
                    disabled={deletingIds.length > 0}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Selected
                  </Button>
                )}
              </div>
            )}
          </div>
          <p className="text-muted-foreground">
            Manage and share your screen recordings
          </p>
        </div>

        {videos.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-secondary/50 flex items-center justify-center">
              <Film className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">No videos yet</h2>
            <p className="text-muted-foreground mb-6">
              Start recording to see your videos here
            </p>
            <Link href="/record">
              <Button size="lg">
                Start Recording
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {videos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-6 space-y-4 hover:shadow-lg transition-shadow"
              >
                {/* Video Thumbnail */}
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                  <div className="absolute top-2 left-2">
                    <Checkbox
                      checked={selectedIds.includes(video.id)}
                      onCheckedChange={(checked) => toggleSelect(video.id, checked as boolean)}
                    />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center backdrop-blur-sm">
                      <Play className="w-8 h-8 text-primary ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {formatDuration(video.durationSeconds)}
                  </div>
                </div>

                {/* Video Info */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg truncate" title={video.title}>
                    {video.title}
                  </h3>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {video.viewCount}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(video.createdAt)}
                    </div>
                  </div>

                  {video.completionPercent > 0 && (
                    <div className="text-sm text-muted-foreground">
                      Avg completion: {Math.round(video.completionPercent)}%
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <Link href={`/watch/${video.shareId}`} className="block">
                    <Button variant="outline" className="w-full">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Watch Video
                    </Button>
                  </Link>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => copyShareLink(video)}
                      className="flex-1"
                    >
                      {copiedId === video.id ? (
                        <>
                          <Check className="w-4 h-4 mr-2 text-success" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Link
                        </>
                      )}
                    </Button>
                    
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteVideo(video.id)}
                      disabled={deletingIds.includes(video.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
