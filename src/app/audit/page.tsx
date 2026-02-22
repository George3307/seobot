"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, AlertTriangle, Activity, Globe, FileText, Shield, Smartphone, Zap } from "lucide-react";

interface Check {
  name: string;
  status: "pass" | "fail" | "warn";
  message: string;
  category: string;
}

interface AuditResult {
  url: string;
  title: string | null;
  metaDescription: string | null;
  h1Tags: string[];
  checks: Check[];
  score: number;
  loadTimeMs: number;
  contentLength: number;
  wordCount: number;
  imageCount: number;
  linkCount: { internal: number; external: number };
  headingStructure: { tag: string; text: string }[];
}

export default function AuditPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState("");

  async function handleAudit() {
    if (!url) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const fullUrl = url.startsWith("http") ? url : `https://${url}`;
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: fullUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Audit failed");
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  const statusIcon = {
    pass: <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />,
    fail: <XCircle className="h-4 w-4 text-red-500 shrink-0" />,
    warn: <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0" />,
  };

  const categoryIcon: Record<string, React.ReactNode> = {
    "Meta Tags": <FileText className="h-4 w-4" />,
    "Security": <Shield className="h-4 w-4" />,
    "Mobile": <Smartphone className="h-4 w-4" />,
    "Performance": <Zap className="h-4 w-4" />,
    "Content": <Globe className="h-4 w-4" />,
  };

  const scoreColor = (s: number) =>
    s >= 80 ? "text-green-500" : s >= 50 ? "text-yellow-500" : "text-red-500";

  // Group checks by category
  const groupedChecks = result?.checks.reduce((acc, check) => {
    if (!acc[check.category]) acc[check.category] = [];
    acc[check.category].push(check);
    return acc;
  }, {} as Record<string, Check[]>);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Activity className="h-6 w-6" /> Technical SEO Audit
        </h2>
        <p className="text-muted-foreground">Comprehensive analysis of on-page SEO factors</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <Input
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAudit()}
            />
            <Button onClick={handleAudit} disabled={loading || !url}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Activity className="h-4 w-4 mr-2" />}
              {loading ? "Auditing..." : "Run Audit"}
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
          {/* Score Card */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="col-span-2 md:col-span-1">
              <CardContent className="pt-6 text-center">
                <div className={`text-4xl font-bold ${scoreColor(result.score)}`}>{result.score}</div>
                <p className="text-xs text-muted-foreground mt-1">SEO Score</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold">{result.loadTimeMs}ms</div>
                <p className="text-xs text-muted-foreground mt-1">Load Time</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold">{result.wordCount}</div>
                <p className="text-xs text-muted-foreground mt-1">Words</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold">{result.imageCount}</div>
                <p className="text-xs text-muted-foreground mt-1">Images</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold">{result.linkCount.internal + result.linkCount.external}</div>
                <p className="text-xs text-muted-foreground mt-1">Links</p>
              </CardContent>
            </Card>
          </div>

          {/* Page Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Page Info</CardTitle>
              <CardDescription className="break-all">{result.url}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Title</p>
                <p className="text-sm">{result.title || <span className="text-red-500">Missing</span>}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Meta Description</p>
                <p className="text-sm">{result.metaDescription || <span className="text-red-500">Missing</span>}</p>
              </div>
              {result.headingStructure.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Heading Structure</p>
                  <div className="space-y-1 max-h-48 overflow-auto">
                    {result.headingStructure.map((h, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm" style={{ paddingLeft: `${(parseInt(h.tag[1]) - 1) * 16}px` }}>
                        <Badge variant="outline" className="text-xs font-mono">{h.tag.toUpperCase()}</Badge>
                        <span className="truncate">{h.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Checks by Category */}
          {groupedChecks && Object.entries(groupedChecks).map(([category, checks]) => (
            <Card key={category}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  {categoryIcon[category] || <Globe className="h-4 w-4" />}
                  {category}
                  <Badge variant="secondary" className="ml-auto">
                    {checks.filter(c => c.status === "pass").length}/{checks.length} passed
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {checks.map((check, i) => (
                    <div key={i} className="flex items-start gap-3 py-1">
                      {statusIcon[check.status]}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{check.name}</span>
                          <Badge variant={check.status === "pass" ? "default" : check.status === "fail" ? "destructive" : "secondary"} className="text-xs">
                            {check.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{check.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </>
      )}
    </div>
  );
}
