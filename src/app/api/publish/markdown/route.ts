import { NextRequest, NextResponse } from "next/server";
import { writeFileSync, mkdirSync } from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const { title, content, outputDir } = await req.json();
    if (!title || !content) return NextResponse.json({ error: "Title and content are required" }, { status: 400 });

    const dir = outputDir || path.join(process.env.HOME || "~", "seobot-exports");
    mkdirSync(dir, { recursive: true });

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
      .replace(/^-|-$/g, "");
    const filename = `${slug}.md`;
    const filePath = path.join(dir, filename);

    // Add frontmatter
    const frontmatter = `---\ntitle: "${title.replace(/"/g, '\\"')}"\ndate: "${new Date().toISOString()}"\n---\n\n`;
    writeFileSync(filePath, frontmatter + content, "utf8");

    return NextResponse.json({ path: filePath, filename });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Unknown error" }, { status: 500 });
  }
}
