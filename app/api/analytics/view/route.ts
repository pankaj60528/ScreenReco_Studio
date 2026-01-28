import { NextResponse } from "next/server";
import { incrementView } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const video = await incrementView(id);
    if (!video) return NextResponse.json({ error: "Video not found" }, { status: 404 });
    return NextResponse.json({ video });
  } catch (error) {
    console.error("View analytics error", error);
    return NextResponse.json({ error: "Failed to record view" }, { status: 500 });
  }
}
