import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 });

    const response = await fetch(url, {
      headers: { "User-Agent": "SEOBot/1.0" },
      signal: AbortSignal.timeout(10000),
    });

    const html = await response.text();

    // Extract SEO elements
    const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() || null;
    const metaDescription =
      html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([\s\S]*?)["'][^>]*>/i)?.[2] ||
      html.match(/<meta[^>]*content=["']([\s\S]*?)["'][^>]*name=["']description["'][^>]*>/i)?.[1] ||
      null;
    const h1Matches = Array.from(html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi));
    const h1Tags = h1Matches.map((m) => m[1].replace(/<[^>]*>/g, "").trim()).filter(Boolean);

    // Run checks
    const checks = [];

    if (!title) {
      checks.push({ name: "Title Tag", status: "fail" as const, message: "No title tag found" });
    } else if (title.length < 30) {
      checks.push({ name: "Title Tag", status: "warn" as const, message: `Title is short (${title.length} chars). Aim for 50-60.` });
    } else if (title.length > 60) {
      checks.push({ name: "Title Tag", status: "warn" as const, message: `Title is long (${title.length} chars). May be truncated in SERPs.` });
    } else {
      checks.push({ name: "Title Tag", status: "pass" as const, message: `Good length (${title.length} chars)` });
    }

    if (!metaDescription) {
      checks.push({ name: "Meta Description", status: "fail" as const, message: "No meta description found" });
    } else if (metaDescription.length < 120) {
      checks.push({ name: "Meta Description", status: "warn" as const, message: `Description is short (${metaDescription.length} chars). Aim for 150-160.` });
    } else if (metaDescription.length > 160) {
      checks.push({ name: "Meta Description", status: "warn" as const, message: `Description is long (${metaDescription.length} chars). May be truncated.` });
    } else {
      checks.push({ name: "Meta Description", status: "pass" as const, message: `Good length (${metaDescription.length} chars)` });
    }

    if (h1Tags.length === 0) {
      checks.push({ name: "H1 Tag", status: "fail" as const, message: "No H1 tag found" });
    } else if (h1Tags.length > 1) {
      checks.push({ name: "H1 Tag", status: "warn" as const, message: `Multiple H1 tags found (${h1Tags.length}). Consider using only one.` });
    } else {
      checks.push({ name: "H1 Tag", status: "pass" as const, message: "Single H1 tag found" });
    }

    checks.push(
      url.startsWith("https://")
        ? { name: "HTTPS", status: "pass" as const, message: "Site uses HTTPS" }
        : { name: "HTTPS", status: "fail" as const, message: "Site does not use HTTPS" }
    );

    const hasViewport = /<meta[^>]*name=["']viewport["']/i.test(html);
    checks.push(
      hasViewport
        ? { name: "Viewport Meta", status: "pass" as const, message: "Viewport meta tag found" }
        : { name: "Viewport Meta", status: "warn" as const, message: "No viewport meta tag — may not be mobile-friendly" }
    );

    const hasLang = /<html[^>]*lang=["'][^"']+["']/i.test(html);
    checks.push(
      hasLang
        ? { name: "Language", status: "pass" as const, message: "HTML lang attribute set" }
        : { name: "Language", status: "warn" as const, message: "No lang attribute on <html> tag" }
    );

    return NextResponse.json({ url, title, metaDescription, h1Tags, checks });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to analyze URL";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
