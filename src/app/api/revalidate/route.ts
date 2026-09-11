import { NextRequest, NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
import { env } from "@/config/env";

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");
    const tag = searchParams.get("tag");
    const path = searchParams.get("path");

    if (secret !== env.REVALIDATION_SECRET) {
      return NextResponse.json({ message: "Invalid revalidation authorization secret" }, { status: 401 });
    }

    if (tag) {
      revalidateTag(tag, "max");
      return NextResponse.json({ revalidated: true, tag, now: Date.now() });
    }

    if (path) {
      revalidatePath(path);
      return NextResponse.json({ revalidated: true, path, now: Date.now() });
    }

    return NextResponse.json(
      { message: "Must provide either 'tag' or 'path' query parameter" },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error executing cache revalidation", error: String(error) },
      { status: 500 }
    );
  }
}
