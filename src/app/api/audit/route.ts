import { NextRequest, NextResponse } from "next/server";

interface Check {
  name: string;
  status: "pass" | "fail" | "warn";
  message: string;
  category: string;
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 });

    const start = Date.now();
    const response = await fetch(url, {
      headers: {
        "User-Agent": "SEOBot/1.0 (https://github.com/George3307/seobot)",
        Accept: "text/html",
      },
      signal: AbortSignal.timeout(15000),
      redirect: "follow",
    });
    const loadTimeMs = Date.now() - start;
    const html = await response.text();
    const contentLength = html.length;

    // Extract elements
    const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() || null;
    const metaDescription =
      html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([\s\S]*?)["'][^>]*>/i)?.[2] ||
      html.match(/<meta[^>]*content=["']([\s\S]*?)["'][^>]*name=["']description["'][^>]*>/i)?.[1] ||
      null;

    // Headings
    const headingMatches = Array.from(html.matchAll(/<(h[1-6])[^>]*>([\s\S]*?)<\/\1>/gi));
    const headingStructure = headingMatches.map(m => ({
      tag: m[1].toLowerCase(),
      text: m[2].replace(/<[^>]*>/g, "").trim(),
    })).filter(h => h.text);

    const h1Tags = headingStructure.filter(h => h.tag === "h1").map(h => h.text);

    // Word count (strip tags)
    const textContent = html.replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const wordCount = textContent.split(/\s+/).filter(Boolean).length;

    // Images
    const images = Array.from(html.matchAll(/<img[^>]*>/gi));
    const imageCount = images.length;
    const imagesWithoutAlt = images.filter(m => !/ alt=["'][^"']+["']/i.test(m[0]));

    // Links
    const links = Array.from(html.matchAll(/<a[^>]*href=["']([^"']+)["'][^>]*>/gi));
    const urlObj = new URL(url);
    let internalLinks = 0, externalLinks = 0;
    for (const m of links) {
      try {
        const href = new URL(m[1], url);
        if (href.hostname === urlObj.hostname) internalLinks++;
        else externalLinks++;
      } catch { externalLinks++; }
    }

    // Checks
    const checks: Check[] = [];

    // Meta Tags
    if (!title) {
      checks.push({ name: "Title Tag", status: "fail", message: "No title tag found", category: "Meta Tags" });
    } else if (title.length < 30) {
      checks.push({ name: "Title Tag", status: "warn", message: `Title is short (${title.length} chars). Aim for 50-60.`, category: "Meta Tags" });
    } else if (title.length > 60) {
      checks.push({ name: "Title Tag", status: "warn", message: `Title is long (${title.length} chars). May be truncated in SERPs.`, category: "Meta Tags" });
    } else {
      checks.push({ name: "Title Tag", status: "pass", message: `Good length (${title.length} chars)`, category: "Meta Tags" });
    }

    if (!metaDescription) {
      checks.push({ name: "Meta Description", status: "fail", message: "No meta description found", category: "Meta Tags" });
    } else if (metaDescription.length < 120) {
      checks.push({ name: "Meta Description", status: "warn", message: `Short (${metaDescription.length} chars). Aim for 150-160.`, category: "Meta Tags" });
    } else if (metaDescription.length > 160) {
      checks.push({ name: "Meta Description", status: "warn", message: `Long (${metaDescription.length} chars). May be truncated.`, category: "Meta Tags" });
    } else {
      checks.push({ name: "Meta Description", status: "pass", message: `Good length (${metaDescription.length} chars)`, category: "Meta Tags" });
    }

    // OG tags
    const hasOgTitle = /<meta[^>]*property=["']og:title["']/i.test(html);
    const hasOgDesc = /<meta[^>]*property=["']og:description["']/i.test(html);
    const hasOgImage = /<meta[^>]*property=["']og:image["']/i.test(html);
    checks.push({
      name: "Open Graph Tags",
      status: hasOgTitle && hasOgDesc && hasOgImage ? "pass" : hasOgTitle || hasOgDesc ? "warn" : "fail",
      message: hasOgTitle && hasOgDesc && hasOgImage
        ? "og:title, og:description, og:image all present"
        : `Missing: ${[!hasOgTitle && "og:title", !hasOgDesc && "og:description", !hasOgImage && "og:image"].filter(Boolean).join(", ")}`,
      category: "Meta Tags",
    });

    // Twitter Card
    const hasTwitterCard = /<meta[^>]*name=["']twitter:card["']/i.test(html);
    checks.push({
      name: "Twitter Card",
      status: hasTwitterCard ? "pass" : "warn",
      message: hasTwitterCard ? "Twitter card meta tag found" : "No twitter:card meta tag",
      category: "Meta Tags",
    });

    // Canonical
    const hasCanonical = /<link[^>]*rel=["']canonical["']/i.test(html);
    checks.push({
      name: "Canonical URL",
      status: hasCanonical ? "pass" : "warn",
      message: hasCanonical ? "Canonical link tag found" : "No canonical URL set — may cause duplicate content issues",
      category: "Meta Tags",
    });

    // Content
    if (h1Tags.length === 0) {
      checks.push({ name: "H1 Tag", status: "fail", message: "No H1 tag found", category: "Content" });
    } else if (h1Tags.length > 1) {
      checks.push({ name: "H1 Tag", status: "warn", message: `Multiple H1 tags (${h1Tags.length}). Consider using only one.`, category: "Content" });
    } else {
      checks.push({ name: "H1 Tag", status: "pass", message: "Single H1 tag found", category: "Content" });
    }

    checks.push({
      name: "Word Count",
      status: wordCount >= 300 ? "pass" : wordCount >= 100 ? "warn" : "fail",
      message: wordCount >= 300
        ? `${wordCount} words — good content length`
        : `${wordCount} words — thin content, aim for 300+`,
      category: "Content",
    });

    checks.push({
      name: "Heading Hierarchy",
      status: headingStructure.length >= 3 ? "pass" : headingStructure.length >= 1 ? "warn" : "fail",
      message: `${headingStructure.length} headings found (${Array.from(new Set(headingStructure.map(h => h.tag))).join(", ")})`,
      category: "Content",
    });

    // Images
    checks.push({
      name: "Image Alt Text",
      status: imagesWithoutAlt.length === 0 && imageCount > 0 ? "pass"
        : imagesWithoutAlt.length > 0 ? "warn" : imageCount === 0 ? "warn" : "pass",
      message: imageCount === 0
        ? "No images found — consider adding visual content"
        : imagesWithoutAlt.length === 0
          ? `All ${imageCount} images have alt text`
          : `${imagesWithoutAlt.length}/${imageCount} images missing alt text`,
      category: "Content",
    });

    // Internal links
    checks.push({
      name: "Internal Links",
      status: internalLinks >= 3 ? "pass" : internalLinks >= 1 ? "warn" : "fail",
      message: `${internalLinks} internal links, ${externalLinks} external links`,
      category: "Content",
    });

    // Security
    checks.push({
      name: "HTTPS",
      status: url.startsWith("https://") ? "pass" : "fail",
      message: url.startsWith("https://") ? "Site uses HTTPS" : "Not using HTTPS — critical for SEO and trust",
      category: "Security",
    });

    // Check for mixed content hints
    const mixedContent = html.match(/http:\/\/[^"'\s]+\.(js|css|jpg|png|gif|svg)/gi);
    checks.push({
      name: "Mixed Content",
      status: !mixedContent ? "pass" : "warn",
      message: !mixedContent
        ? "No obvious mixed content detected"
        : `Found ${mixedContent.length} potential mixed content resources`,
      category: "Security",
    });

    // Mobile
    const hasViewport = /<meta[^>]*name=["']viewport["']/i.test(html);
    checks.push({
      name: "Viewport Meta",
      status: hasViewport ? "pass" : "fail",
      message: hasViewport ? "Viewport meta tag found" : "No viewport meta — not mobile-friendly",
      category: "Mobile",
    });

    const hasLang = /<html[^>]*lang=["'][^"']+["']/i.test(html);
    checks.push({
      name: "Language Attribute",
      status: hasLang ? "pass" : "warn",
      message: hasLang ? "HTML lang attribute set" : "No lang attribute on <html>",
      category: "Mobile",
    });

    // Performance
    checks.push({
      name: "Page Load Time",
      status: loadTimeMs < 2000 ? "pass" : loadTimeMs < 5000 ? "warn" : "fail",
      message: `${loadTimeMs}ms (server response time)`,
      category: "Performance",
    });

    checks.push({
      name: "Page Size",
      status: contentLength < 100000 ? "pass" : contentLength < 500000 ? "warn" : "fail",
      message: `${(contentLength / 1024).toFixed(0)} KB HTML`,
      category: "Performance",
    });

    // Robots
    const robotsMeta = html.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']*)["']/i)?.[1];
    const noindex = robotsMeta?.toLowerCase().includes("noindex");
    checks.push({
      name: "Robots Meta",
      status: noindex ? "fail" : "pass",
      message: noindex ? "Page is set to noindex!" : robotsMeta ? `robots: ${robotsMeta}` : "No robots meta tag (defaults to index, follow)",
      category: "Meta Tags",
    });

    // Schema.org / Structured Data
    const hasJsonLd = /<script[^>]*type=["']application\/ld\+json["']/i.test(html);
    checks.push({
      name: "Structured Data",
      status: hasJsonLd ? "pass" : "warn",
      message: hasJsonLd ? "JSON-LD structured data found" : "No structured data — consider adding Schema.org markup",
      category: "Meta Tags",
    });

    // Calculate score
    const total = checks.length;
    const passed = checks.filter(c => c.status === "pass").length;
    const warned = checks.filter(c => c.status === "warn").length;
    const score = Math.round(((passed + warned * 0.5) / total) * 100);

    return NextResponse.json({
      url,
      title,
      metaDescription,
      h1Tags,
      checks,
      score,
      loadTimeMs,
      contentLength,
      wordCount,
      imageCount,
      linkCount: { internal: internalLinks, external: externalLinks },
      headingStructure: headingStructure.slice(0, 30),
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to audit URL";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
