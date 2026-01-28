import { NextResponse } from "next/server";
import { updateCompletion } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { id, completionPercent } = await request.json();
    if (!id || completionPercent === undefined) {
      return NextResponse.json({ error: "Missing id or completionPercent" }, { status: 400 });
    }

    const video = await updateCompletion(id, Number(completionPercent));
    if (!video) return NextResponse.json({ error: "Video not found" }, { status: 404 });
    return NextResponse.json({ video });
  } catch (error) {
    console.error("Completion analytics error", error);
    return NextResponse.json({ error: "Failed to record completion" }, { status: 500 });
  }
}
