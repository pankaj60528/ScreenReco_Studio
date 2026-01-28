import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import path from "path";
import fs from "fs/promises";
import { addVideo } from "@/lib/db";
import { nanoid } from "nanoid";

export const runtime = 'nodejs';

const hasS3Config =
  !!process.env.S3_BUCKET &&
  !!process.env.AWS_REGION &&
  !!process.env.AWS_ACCESS_KEY_ID &&
  !!process.env.AWS_SECRET_ACCESS_KEY;

const s3Client = hasS3Config
  ? new S3Client({
      region: process.env.S3_REGION || process.env.AWS_REGION,
      endpoint: process.env.S3_ENDPOINT,
    })
  : null;

async function uploadToS3(file: File, key: string) {
  if (!s3Client || !process.env.S3_BUCKET) return null;
  
  try {
    const arrayBuffer = await file.arrayBuffer();
    
    // Prepare S3 parameters - remove ACL as it's deprecated in newer S3 versions
    const params: any = {
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: Buffer.from(arrayBuffer),
      ContentType: file.type || "video/webm",
    };

    // Only add ACL if explicitly configured (for older S3 setups)
    if (process.env.S3_USE_ACL === 'true') {
      params.ACL = "public-read";
    }

    await s3Client.send(new PutObjectCommand(params));
    
    // Generate the public URL
    const endpoint = process.env.S3_PUBLIC_URL || `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com`;
    const publicUrl = `${endpoint}/${key}`;
    
    console.log('S3 upload successful:', { key, size: file.size, url: publicUrl });
    return publicUrl;
  } catch (error) {
    console.error('S3 upload error:', error);
    throw error;
  }
}

async function uploadToLocal(file: File, key: string) {
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });
  const arrayBuffer = await file.arrayBuffer();
  const filePath = path.join(uploadsDir, key);
  await fs.writeFile(filePath, Buffer.from(arrayBuffer));
  return `/uploads/${key}`;
}

export async function POST(request: Request) {
  try {
    const origin = new URL(request.url).origin;
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const title = (formData.get("title") as string | null) || "Recording";
    const duration = Number(formData.get("duration")) || undefined;
    const trimStart = formData.get("trimStart");
    const trimEnd = formData.get("trimEnd");

    if (!file) {
      console.error('Upload error: No file provided');
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    console.log('Upload request:', { 
      fileName: file.name, 
      fileSize: file.size, 
      fileType: file.type, 
      title, 
      duration 
    });

    const safeName = (file.name || "recording.webm").replace(/[^a-zA-Z0-9\\.\\-]/g, "-");
    const key = `${nanoid(8)}-${safeName}`;

    let url: string;
    try {
      if (hasS3Config) {
        console.log('Attempting S3 upload...');
        url = await uploadToS3(file, key);
        if (!url) {
          throw new Error('S3 upload returned null');
        }
        console.log('S3 upload successful:', url);
      } else {
        console.log('Using local storage...');
        url = await uploadToLocal(file, key);
        console.log('Local upload successful:', url);
      }
    } catch (uploadError) {
      console.error('Upload failed:', uploadError);
      // Try local fallback if S3 fails
      if (hasS3Config) {
        console.log('S3 failed, trying local fallback...');
        url = await uploadToLocal(file, key);
        console.log('Local fallback successful:', url);
      } else {
        throw uploadError;
      }
    }

    if (!url) {
      console.error('Upload failed: No URL generated');
      return NextResponse.json({ error: "Failed to store file" }, { status: 500 });
    }

    const video = await addVideo({
      title,
      url: url.startsWith("http") ? url : `${origin}${url}`,
      durationSeconds: duration,
      trimStart: trimStart ? Number(trimStart) : undefined,
      trimEnd: trimEnd ? Number(trimEnd) : undefined,
    });

    const shareUrl = `${origin}/watch/${video.shareId}`;
    console.log('Video record created:', { videoId: video.id, shareUrl });

    return NextResponse.json({ video, shareUrl });
  } catch (error) {
    console.error("Upload error:", error);
    const errorMessage = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
