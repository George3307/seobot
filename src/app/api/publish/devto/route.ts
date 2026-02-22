import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { title, content, tags, apiKey, published = false } = await req.json();

    if (!apiKey) return NextResponse.json({ error: "Dev.to API key is required" }, { status: 400 });
    if (!title || !content) return NextResponse.json({ error: "Title and content are required" }, { status: 400 });

    const res = await fetch("https://dev.to/api/articles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        article: {
          title,
          body_markdown: content,
          published,
          tags: tags || [],
        },
      }),
    });

    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data.error || "Failed to publish to Dev.to" }, { status: res.status });

    return NextResponse.json({ url: data.url, id: data.id, published: data.published });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Unknown error" }, { status: 500 });
  }
}
