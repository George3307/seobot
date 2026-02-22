import { NextRequest, NextResponse } from "next/server";

interface KeywordGroup {
  label: string;
  keywords: string[];
}

interface KeywordResult {
  seed: string;
  allKeywords: string[];
  clusters: KeywordGroup[];
}

async function fetchGoogleSuggestions(query: string): Promise<string[]> {
  try {
    const url = `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    // Firefox client returns [query, [suggestions]]
    return Array.isArray(data[1]) ? data[1].filter((s: string) => s !== query) : [];
  } catch {
    return [];
  }
}

async function expandKeywords(seed: string, maxDepth: number = 2): Promise<string[]> {
  const seen = new Set<string>();
  seen.add(seed.toLowerCase());

  const queue: { keyword: string; depth: number }[] = [{ keyword: seed, depth: 0 }];
  const results: string[] = [];

  while (queue.length > 0) {
    // Process in batches of 5 to avoid hammering the API
    const batch = queue.splice(0, 5);
    const promises = batch.map(async ({ keyword, depth }) => {
      const suggestions = await fetchGoogleSuggestions(keyword);
      for (const s of suggestions) {
        const lower = s.toLowerCase().trim();
        if (!seen.has(lower)) {
          seen.add(lower);
          results.push(s.trim());
          if (depth < maxDepth - 1) {
            queue.push({ keyword: s, depth: depth + 1 });
          }
        }
      }
    });
    await Promise.all(promises);
  }

  return results;
}

// Simple string similarity (Jaccard on word bigrams)
function bigrams(str: string): Set<string> {
  const words = str.toLowerCase().split(/\s+/);
  const bg = new Set<string>();
  for (let i = 0; i < words.length - 1; i++) {
    bg.add(words[i] + " " + words[i + 1]);
  }
  // Also add individual words for short strings
  for (const w of words) bg.add(w);
  return bg;
}

function similarity(a: string, b: string): number {
  const ba = bigrams(a);
  const bb = bigrams(b);
  let intersection = 0;
  ba.forEach((x) => { if (bb.has(x)) intersection++; });
  const union = ba.size + bb.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function clusterKeywords(keywords: string[], threshold = 0.3): KeywordGroup[] {
  const clusters: string[][] = [];
  const assigned = new Set<number>();

  for (let i = 0; i < keywords.length; i++) {
    if (assigned.has(i)) continue;
    const cluster = [keywords[i]];
    assigned.add(i);

    for (let j = i + 1; j < keywords.length; j++) {
      if (assigned.has(j)) continue;
      if (similarity(keywords[i], keywords[j]) >= threshold) {
        cluster.push(keywords[j]);
        assigned.add(j);
      }
    }
    clusters.push(cluster);
  }

  // Sort clusters by size desc
  clusters.sort((a, b) => b.length - a.length);

  return clusters.map((kws) => {
    // Use the shortest keyword as label (often the most generic)
    const label = kws.reduce((a, b) => (a.length <= b.length ? a : b));
    return { label, keywords: kws };
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const seed = body.seed?.trim();
    if (!seed) {
      return NextResponse.json({ error: "seed keyword is required" }, { status: 400 });
    }

    const depth = Math.min(body.depth || 2, 2);
    const allKeywords = await expandKeywords(seed, depth);
    const clusters = clusterKeywords(allKeywords);

    const result: KeywordResult = { seed, allKeywords, clusters };
    return NextResponse.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
