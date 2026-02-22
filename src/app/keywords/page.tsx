"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Download, Loader2 } from "lucide-react";

interface KeywordGroup {
  label: string;
  keywords: string[];
}

interface KeywordResult {
  seed: string;
  allKeywords: string[];
  clusters: KeywordGroup[];
}

function exportCSV(result: KeywordResult) {
  const rows = [["Keyword", "Cluster"]];
  for (const group of result.clusters) {
    for (const kw of group.keywords) {
      rows.push([kw, group.label]);
    }
  }
  const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `keywords-${result.seed}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function KeywordsPage() {
  const [seed, setSeed] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<KeywordResult | null>(null);
  const [error, setError] = useState("");

  async function handleSearch() {
    if (!seed.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seed: seed.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Keyword Research</h2>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" /> Google Suggest Expansion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter seed keyword (e.g. 'best coffee maker')"
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !loading && handleSearch()}
              disabled={loading}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={loading || !seed.trim()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              <span className="ml-2">{loading ? "Searching..." : "Search"}</span>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Recursively expands via Google Suggest (2 levels deep), then clusters by similarity.
          </p>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-4 text-destructive text-sm">{error}</CardContent>
        </Card>
      )}

      {result && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Found <strong>{result.allKeywords.length}</strong> keywords in{" "}
              <strong>{result.clusters.length}</strong> clusters for &quot;{result.seed}&quot;
            </p>
            <Button variant="outline" size="sm" onClick={() => exportCSV(result)}>
              <Download className="h-4 w-4 mr-1" /> Export CSV
            </Button>
          </div>

          <div className="space-y-4">
            {result.clusters.map((group, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Badge variant="secondary">{group.keywords.length}</Badge>
                    {group.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {group.keywords.map((kw, j) => (
                      <Badge key={j} variant="outline" className="text-sm font-normal">
                        {kw}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
