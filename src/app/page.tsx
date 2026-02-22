"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

interface SeoResult {
  url: string;
  title: string | null;
  metaDescription: string | null;
  h1Tags: string[];
  checks: Check[];
}

interface Check {
  name: string;
  status: "pass" | "fail" | "warn";
  message: string;
}

export default function Dashboard() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SeoResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze() {
    if (!url) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.startsWith("http") ? url : `https://${url}` }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Analysis failed");
      }
      setResult(await res.json());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  const statusIcon = {
    pass: <CheckCircle className="h-4 w-4 text-green-500" />,
    fail: <XCircle className="h-4 w-4 text-red-500" />,
    warn: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Quick SEO Check</h2>
        <p className="text-muted-foreground">Enter a URL to analyze basic SEO elements</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <Input
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
            />
            <Button onClick={handleAnalyze} disabled={loading || !url}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Analyze"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6 text-destructive">{error}</CardContent>
        </Card>
      )}

      {result && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Page Info</CardTitle>
              <CardDescription className="break-all">{result.url}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Title</p>
                <p className="text-sm">{result.title || <span className="text-red-500">Missing</span>}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Meta Description</p>
                <p className="text-sm">{result.metaDescription || <span className="text-red-500">Missing</span>}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">H1 Tags ({result.h1Tags.length})</p>
                {result.h1Tags.length > 0 ? (
                  <ul className="text-sm list-disc list-inside">
                    {result.h1Tags.map((h1, i) => <li key={i}>{h1}</li>)}
                  </ul>
                ) : (
                  <p className="text-sm text-red-500">No H1 tags found</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">SEO Checks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {result.checks.map((check, i) => (
                  <div key={i} className="flex items-start gap-3">
                    {statusIcon[check.status]}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{check.name}</span>
                        <Badge variant={check.status === "pass" ? "default" : check.status === "fail" ? "destructive" : "secondary"}>
                          {check.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{check.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
