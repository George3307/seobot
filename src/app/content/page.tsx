"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FileText, Loader2, Copy, Download, CheckCircle, AlertTriangle, XCircle } from "lucide-react";

interface OutlineSection {
  tag: string;
  text: string;
  points: string[];
  suggestedWordCount: number;
}

interface Outline {
  keyword: string;
  suggestedTitles: string[];
  outline: OutlineSection[];
  totalSuggestedWordCount: number;
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

type Language = "en" | "zh";

export default function ContentPage() {
  const [keyword, setKeyword] = useState("");
  const [language, setLanguage] = useState<Language>("en");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1 result
  const [outline, setOutline] = useState<Outline | null>(null);
  // Step 2 selection
  const [selectedTitle, setSelectedTitle] = useState("");
  // Step 3 result
  const [article, setArticle] = useState("");
  const [score, setScore] = useState<SeoScore | null>(null);
  const [copied, setCopied] = useState(false);

  async function generateOutline() {
    if (!keyword.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/content/outline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: keyword.trim(), language }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate outline");
      setOutline(data);
      setSelectedTitle(data.suggestedTitles[0] || "");
      setStep(2);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function generateArticle() {
    if (!outline || !selectedTitle) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/content/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword: keyword.trim(),
          title: selectedTitle,
          outline: outline.outline,
          language,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate article");
      setArticle(data.article);
      setScore(data.score);
      setStep(3);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(article);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadMarkdown() {
    const blob = new Blob([article], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${keyword.trim().replace(/\s+/g, "-")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function reset() {
    setStep(1);
    setOutline(null);
    setSelectedTitle("");
    setArticle("");
    setScore(null);
    setError("");
  }

  const statusIcon = (s: string) => {
    if (s === "pass") return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (s === "warn") return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const statusColor = (s: string) => {
    if (s === "pass") return "bg-green-500/10 text-green-600 border-green-500/20";
    if (s === "warn") return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
    return "bg-red-500/10 text-red-600 border-red-500/20";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Content Generator</h2>
        {step > 1 && (
          <Button variant="outline" size="sm" onClick={reset}>
            Start Over
          </Button>
        )}
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-2 text-sm">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-1">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {s}
            </div>
            <span className={step >= s ? "font-medium" : "text-muted-foreground"}>
              {s === 1 ? "Keyword" : s === 2 ? "Outline" : "Article"}
            </span>
            {s < 3 && <span className="mx-2 text-muted-foreground">→</span>}
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}

      {/* Step 1: Keyword Input */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" /> Enter Target Keyword
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="e.g. best project management tools"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && generateOutline()}
            />
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm text-muted-foreground">Language:</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className="border rounded px-2 py-1 text-sm bg-background"
                >
                  <option value="en">English</option>
                  <option value="zh">中文</option>
                </select>
              </div>
              <Button onClick={generateOutline} disabled={loading || !keyword.trim()}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Generate Outline
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Review Outline & Select Title */}
      {step === 2 && outline && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Select a Title</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {outline.suggestedTitles.map((t, i) => (
                <label
                  key={i}
                  className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                    selectedTitle === t ? "border-primary bg-primary/5" : "hover:bg-accent"
                  }`}
                >
                  <input
                    type="radio"
                    name="title"
                    checked={selectedTitle === t}
                    onChange={() => setSelectedTitle(t)}
                    className="accent-primary"
                  />
                  <span className="text-sm font-medium">{t}</span>
                </label>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Article Outline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {outline.outline.map((section, i) => (
                  <div key={i} className={section.tag === "h3" ? "ml-6" : ""}>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {section.tag.toUpperCase()}
                      </Badge>
                      <span className="font-medium text-sm">{section.text}</span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        ~{section.suggestedWordCount} words
                      </span>
                    </div>
                    <ul className="mt-1 ml-12 text-xs text-muted-foreground list-disc space-y-0.5">
                      {section.points.map((p, j) => (
                        <li key={j}>{p}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Total suggested: ~{outline.totalSuggestedWordCount} words
                </span>
                <Button onClick={generateArticle} disabled={loading || !selectedTitle}>
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Generate Article
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 3: Article + SEO Score */}
      {step === 3 && article && (
        <div className="space-y-4">
          {/* SEO Score */}
          {score && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>SEO Score</span>
                  <span
                    className={`text-2xl font-bold ${
                      score.overall >= 80 ? "text-green-500" : score.overall >= 50 ? "text-yellow-500" : "text-red-500"
                    }`}
                  >
                    {score.overall}/100
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {score.checks.map((check, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-3 rounded-lg border p-2.5 text-sm ${statusColor(check.status)}`}
                    >
                      {statusIcon(check.status)}
                      <span className="font-medium min-w-[140px]">{check.name}</span>
                      <span className="text-xs opacity-80">{check.detail}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Article */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Generated Article</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copyToClipboard}>
                    <Copy className="h-4 w-4 mr-1" />
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadMarkdown}>
                    <Download className="h-4 w-4 mr-1" />
                    Export .md
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <pre className="whitespace-pre-wrap text-sm font-sans leading-relaxed bg-muted/50 rounded-lg p-4 overflow-auto max-h-[600px]">
                  {article}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
