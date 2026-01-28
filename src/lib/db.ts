import fs from 'fs/promises';
import path from 'path';
import { nanoid } from 'nanoid';

export interface VideoRecord {
  id: string;
  title: string;
  sourceUrl: string;
  trimmedUrl: string;
  durationSeconds: number | null;
  trimStart?: number;
  trimEnd?: number;
  shareId: string;
  viewCount: number;
  completionPercent: number;
  createdAt: string;
}

interface StoreShape {
  videos: VideoRecord[];
}

const dataDir = path.join(process.cwd(), 'data');
const dataFile = path.join(dataDir, 'videos.json');
const tmpDataFile = path.join(dataDir, 'videos.json.tmp');

async function ensureStore(): Promise<StoreShape> {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    const content = await fs.readFile(dataFile, 'utf-8');
    return JSON.parse(content) as StoreShape;
  } catch (err: any) {
    if (err?.code === 'ENOENT') {
      const initial: StoreShape = { videos: [] };
      await fs.writeFile(dataFile, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    throw err;
  }
}

async function saveStore(store: StoreShape) {
  const payload = JSON.stringify(store, null, 2);
  await fs.writeFile(tmpDataFile, payload, 'utf-8');
  await fs.rename(tmpDataFile, dataFile);
}

export async function addVideo(params: {
  title: string;
  url: string;
  durationSeconds?: number;
  trimStart?: number;
  trimEnd?: number;
}): Promise<VideoRecord> {
  const store = await ensureStore();
  const id = nanoid(10);
  const shareId = nanoid(8);
  const record: VideoRecord = {
    id,
    title: params.title,
    sourceUrl: params.url,
    trimmedUrl: params.url,
    durationSeconds: params.durationSeconds ?? null,
    trimStart: params.trimStart,
    trimEnd: params.trimEnd,
    shareId,
    viewCount: 0,
    completionPercent: 0,
    createdAt: new Date().toISOString(),
  };
  store.videos.push(record);
  await saveStore(store);
  return record;
}

export async function getVideo(idOrShare: string): Promise<VideoRecord | undefined> {
  const store = await ensureStore();
  return store.videos.find((v) => v.id === idOrShare || v.shareId === idOrShare);
}

// FIX FOR ERROR 2: We name this 'getVideos'
export async function getVideos(): Promise<VideoRecord[]> {
  const store = await ensureStore();
  return store.videos;
}

// FIX FOR ERROR 1: This function was missing
export async function deleteVideo(idOrShare: string): Promise<VideoRecord | undefined> {
  const store = await ensureStore();
  const index = store.videos.findIndex((v) => v.id === idOrShare || v.shareId === idOrShare);
  if (index === -1) return undefined;
  const [removed] = store.videos.splice(index, 1);
  await saveStore(store);
  return removed;
}

export async function incrementView(id: string): Promise<VideoRecord | undefined> {
  const store = await ensureStore();
  const video = store.videos.find((v) => v.id === id || v.shareId === id);
  if (video) {
    video.viewCount += 1;
    await saveStore(store);
  }
  return video;
}

export async function updateCompletion(id: string, completionPercent: number): Promise<VideoRecord | undefined> {
  const store = await ensureStore();
  const video = store.videos.find((v) => v.id === id || v.shareId === id);
  if (video) {
    video.completionPercent = Math.max(video.completionPercent, completionPercent);
    await saveStore(store);
  }
  return video;
}