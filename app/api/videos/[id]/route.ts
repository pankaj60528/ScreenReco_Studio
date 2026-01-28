import { NextResponse } from "next/server";
import { deleteVideo, getVideo } from "@/lib/db";
import fs from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const video = await getVideo(params.id);
    if (!video) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ video });
  } catch (error) {
    console.error('GET /api/videos/[id] failed:', error);
    return NextResponse.json({ error: "Failed to load video" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const video = await deleteVideo(params.id);
    if (!video) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // If the video file is local, try to delete it
    if (video.trimmedUrl.startsWith('/uploads/')) {
      const filePath = path.join(process.cwd(), 'public', video.trimmedUrl);
      try {
        await fs.unlink(filePath);
        console.log('Deleted local file:', filePath);
      } catch (err) {
        console.warn('Failed to delete local file:', filePath, err);
        // Continue even if file deletion fails
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/videos/[id] failed:', error);
    return NextResponse.json({ error: "Failed to delete video" }, { status: 500 });
  }
}
