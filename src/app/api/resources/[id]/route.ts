import { NextResponse } from "next/server";
import { getResourceById, incrementDownload } from "@/lib/repositories/resources";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  const item = getResourceById(params.id);
  if (!item) {
    return NextResponse.json({ error: "Resource not found" }, { status: 404 });
  }
  incrementDownload(params.id);
  return NextResponse.redirect(new URL(item.fileUrl, request.url));
}
