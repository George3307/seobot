import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { title, content, siteUrl, username, password, status = "draft" } = await req.json();

    if (!siteUrl || !username || !password) {
      return NextResponse.json({ error: "WordPress site URL, username, and application password are required" }, { status: 400 });
    }
    if (!title || !content) return NextResponse.json({ error: "Title and content are required" }, { status: 400 });

    const url = `${siteUrl.replace(/\/$/, "")}/wp-json/wp/v2/posts`;
    const auth = Buffer.from(`${username}:${password}`).toString("base64");

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        title,
        content,
        status, // "draft" or "publish"
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: data.message || "Failed to publish to WordPress" }, { status: res.status });
    }

    return NextResponse.json({ url: data.link, id: data.id, status: data.status });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Unknown error" }, { status: 500 });
  }
}
