import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { keyword, language = "en" } = await request.json();
    if (!keyword?.trim()) {
      return NextResponse.json({ error: "keyword is required" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OPENAI_API_KEY not configured" }, { status: 500 });
    }

    const langInstruction = language === "zh" ? "用中文回复。" : "Reply in English.";

    const prompt = `You are an SEO content strategist. Given the target keyword "${keyword.trim()}", generate an SEO-optimized article outline.

${langInstruction}

Return a JSON object with this exact structure:
{
  "keyword": "${keyword.trim()}",
  "suggestedTitles": ["title1", "title2", "title3"],
  "outline": [
    {
      "tag": "h2",
      "text": "Section heading",
      "points": ["key point 1", "key point 2"],
      "suggestedWordCount": 200
    },
    {
      "tag": "h3",
      "text": "Subsection heading",
      "points": ["key point"],
      "suggestedWordCount": 150
    }
  ],
  "totalSuggestedWordCount": 1500
}

Requirements:
- 3 compelling title suggestions that include the keyword naturally
- 5-8 sections (mix of h2 and h3)
- Each section has 2-3 key points to cover
- Suggested word count per section
- Structure should be logical and SEO-friendly
- Only return valid JSON, no markdown fences.`;

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
        max_tokens: 2000,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: `OpenAI API error: ${err}` }, { status: 502 });
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) {
      return NextResponse.json({ error: "Empty response from AI" }, { status: 502 });
    }

    // Parse JSON, stripping markdown fences if present
    const jsonStr = content.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    const outline = JSON.parse(jsonStr);

    return NextResponse.json(outline);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
