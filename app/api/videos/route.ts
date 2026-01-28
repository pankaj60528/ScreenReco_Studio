import { NextResponse } from "next/server";
// Import 'addVideo' along with 'getVideos'
import { getVideos, addVideo } from "@/lib/db"; 

// 1. YOUR EXISTING GET FUNCTION (Lists videos)
export async function GET() {
  try {
    const videos = await getVideos();

    // Sort by creation date (newest first)
    const sortedVideos = videos.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({ videos: sortedVideos });
  } catch (error) {
    console.error("Failed to fetch videos:", error);
    return NextResponse.json(
      { error: "Failed to fetch videos" }, 
      { status: 500 }
    );
  }
}

// 2. NEW FUNCTION TO ADD (Creates a new video)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.url) {
      return NextResponse.json(
        { error: "Title and URL are required" },
        { status: 400 }
      );
    }

    // Use the addVideo function from your db.ts
    const newVideo = await addVideo({
      title: body.title,
      url: body.url,
      durationSeconds: body.durationSeconds,
      trimStart: body.trimStart,
      trimEnd: body.trimEnd,
    });

    return NextResponse.json(newVideo, { status: 201 });
  } catch (error) {
    console.error("Failed to add video:", error);
    return NextResponse.json(
      { error: "Failed to add video" }, 
      { status: 500 }
    );
  }
}