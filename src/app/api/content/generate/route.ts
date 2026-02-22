import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { keyword, title, outline, language = "en" } = await request.json();
    if (!keyword?.trim() || !title?.trim() || !outline) {
      return NextResponse.json({ error: "keyword, title, and outline are required" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OPENAI_API_KEY not configured" }, { status: 500 });
    }

    const langInstruction = language === "zh" ? "用中文写作。" : "Write in English.";

    const outlineText = outline
      .map((s: { tag: string; text: string; points: string[]; suggestedWordCount: number }) =>
        `${s.tag === "h2" ? "##" : "###"} ${s.text}\nKey points: ${s.points.join("; ")}\nTarget: ~${s.suggestedWordCount} words`
      )
      .join("\n\n");

    const prompt = `You are an expert SEO content writer. Write a complete article based on the following:

Title: ${title}
Target keyword: ${keyword}
${langInstruction}

Outline:
${outlineText}

Requirements:
- Write the full article in Markdown format
- Start with the title as # heading
- Use the keyword naturally throughout (aim for 1-2% density)
- Do NOT stuff keywords unnaturally
- Write engaging, informative content
- Include a brief introduction and conclusion
- Each section should roughly match the suggested word count
- Use short paragraphs (3-5 sentences max) for readability
- Return ONLY the markdown article, no extra commentary`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: `OpenAI API error: ${err}` }, { status: 502 });
    }

    const data = await res.json();
    const article = data.choices?.[0]?.message?.content?.trim();
    if (!article) {
      return NextResponse.json({ error: "Empty response from AI" }, { status: 502 });
    }

    // Compute SEO score
    const score = computeSeoScore(article, keyword, title);

    return NextResponse.json({ article, score });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

interface SeoCheck {
  name: string;
  status: "pass" | "warn" | "fail";
  detail: string;
}

interface SeoScore {
  overall: number;
  checks: SeoCheck[];
}

function computeSeoScore(article: string, keyword: string, title: string): SeoScore {
  const checks: SeoCheck[] = [];
  const lowerArticle = article.toLowerCase();
  const lowerKeyword = keyword.toLowerCase().trim();

  // 1. Keyword in title
  const titleHasKeyword = title.toLowerCase().includes(lowerKeyword);
  checks.push({
    name: "Keyword in Title",
    status: titleHasKeyword ? "pass" : "fail",
    detail: titleHasKeyword ? "Title contains target keyword" : "Title missing target keyword",
  });

  // 2. Keyword density
  const plainText = article.replace(/[#*_\[\]()>`~-]/g, " ");
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;
  const kwRegex = new RegExp(lowerKeyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
  const kwMatches = plainText.match(kwRegex);
  const kwCount = kwMatches ? kwMatches.length : 0;
  const density = wordCount > 0 ? (kwCount / wordCount) * 100 : 0;

  let densityStatus: "pass" | "warn" | "fail" = "pass";
  if (density < 0.5) densityStatus = "warn";
  else if (density > 3) densityStatus = "warn";
  if (density === 0) densityStatus = "fail";

  checks.push({
    name: "Keyword Density",
    status: densityStatus,
    detail: `${density.toFixed(2)}% (${kwCount} times in ${wordCount} words). Ideal: 0.5-2.5%`,
  });

  // 3. Word count
  let wcStatus: "pass" | "warn" | "fail" = "pass";
  if (wordCount < 600) wcStatus = "fail";
  else if (wordCount < 1000) wcStatus = "warn";

  checks.push({
    name: "Article Length",
    status: wcStatus,
    detail: `${wordCount} words. ${wordCount < 600 ? "Too short" : wordCount < 1000 ? "Consider adding more" : "Good length"}`,
  });

  // 4. Keyword in headings
  const headings = article.match(/^#{2,3}\s.+$/gm) || [];
  const headingsWithKw = headings.filter((h) => h.toLowerCase().includes(lowerKeyword));
  const headingStatus: "pass" | "warn" | "fail" = headingsWithKw.length > 0 ? "pass" : "warn";
  checks.push({
    name: "Keyword in Headings",
    status: headingStatus,
    detail: `${headingsWithKw.length}/${headings.length} headings contain keyword`,
  });

  // 5. Paragraph length (readability)
  const paragraphs = article.split(/\n\n+/).filter((p) => p.trim() && !p.trim().startsWith("#"));
  const longParas = paragraphs.filter((p) => p.split(/\s+/).length > 100);
  const paraStatus: "pass" | "warn" | "fail" = longParas.length === 0 ? "pass" : longParas.length <= 2 ? "warn" : "fail";
  checks.push({
    name: "Paragraph Length",
    status: paraStatus,
    detail: `${longParas.length} paragraphs over 100 words. Short paragraphs improve readability.`,
  });

  // 6. Has introduction (first paragraph before first heading)
  const firstH2 = lowerArticle.indexOf("\n## ");
  const hasIntro = firstH2 > 50;
  checks.push({
    name: "Introduction",
    status: hasIntro ? "pass" : "warn",
    detail: hasIntro ? "Article has an introduction" : "Consider adding a longer introduction",
  });

  // Overall score
  const scoreMap = { pass: 100, warn: 50, fail: 0 };
  const overall = Math.round(checks.reduce((sum, c) => sum + scoreMap[c.status], 0) / checks.length);

  return { overall, checks };
}
