"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, FileText, Globe, MessageCircle, ChevronDown, ChevronUp, Loader2, CheckCircle, XCircle, ExternalLink } from "lucide-react";

interface PublishPanelProps {
  title: string;
  content: string;
  keyword: string;
}

type PublishStatus = "idle" | "loading" | "success" | "error";

interface ChannelState {
  status: PublishStatus;
  message: string;
  url?: string;
}

export default function PublishPanel({ title, content, keyword }: PublishPanelProps) {
  const [expanded, setExpanded] = useState(false);

  // Dev.to
  const [devtoKey, setDevtoKey] = useState("");
  const [devtoPublished, setDevtoPublished] = useState(false);
  const [devto, setDevto] = useState<ChannelState>({ status: "idle", message: "" });

  // WordPress
  const [wpUrl, setWpUrl] = useState("");
  const [wpUser, setWpUser] = useState("");
  const [wpPass, setWpPass] = useState("");
  const [wpStatus, setWpStatus] = useState<"draft" | "publish">("draft");
  const [wp, setWp] = useState<ChannelState>({ status: "idle", message: "" });

  // Twitter
  const [tweetText, setTweetText] = useState("");
  const [twitter, setTwitter] = useState<ChannelState>({ status: "idle", message: "" });

  // Markdown export
  const [md, setMd] = useState<ChannelState>({ status: "idle", message: "" });

  // Load saved credentials from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("seobot-publish-creds");
      if (saved) {
        const c = JSON.parse(saved);
        if (c.devtoKey) setDevtoKey(c.devtoKey);
        if (c.wpUrl) setWpUrl(c.wpUrl);
        if (c.wpUser) setWpUser(c.wpUser);
        if (c.wpPass) setWpPass(c.wpPass);
      }
    } catch { /* ignore */ }
  }, []);

  // Save credentials to localStorage
  function saveCreds() {
    localStorage.setItem("seobot-publish-creds", JSON.stringify({ devtoKey, wpUrl, wpUser, wpPass }));
  }

  // Generate tweet summary
  useEffect(() => {
    if (expanded && !tweetText && title) {
      const summary = `📝 ${title}\n\n#${keyword.replace(/\s+/g, "")} #SEO`;
      setTweetText(summary.slice(0, 280));
    }
  }, [expanded, title, keyword, tweetText]);

  async function publishDevto() {
    saveCreds();
    setDevto({ status: "loading", message: "Publishing to Dev.to..." });
    try {
      const tags = keyword.split(/\s+/).slice(0, 4).map(t => t.toLowerCase().replace(/[^a-z0-9]/g, "")).filter(Boolean);
      const res = await fetch("/api/publish/devto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, tags, apiKey: devtoKey, published: devtoPublished }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDevto({ status: "success", message: devtoPublished ? "Published!" : "Saved as draft!", url: data.url });
    } catch (e: unknown) {
      setDevto({ status: "error", message: e instanceof Error ? e.message : "Failed" });
    }
  }

  async function publishWordPress() {
    saveCreds();
    setWp({ status: "loading", message: "Publishing to WordPress..." });
    try {
      const res = await fetch("/api/publish/wordpress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, siteUrl: wpUrl, username: wpUser, password: wpPass, status: wpStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setWp({ status: "success", message: `${wpStatus === "publish" ? "Published" : "Saved as draft"}!`, url: data.url });
    } catch (e: unknown) {
      setWp({ status: "error", message: e instanceof Error ? e.message : "Failed" });
    }
  }

  async function publishTwitter() {
    setTwitter({ status: "loading", message: "Tweeting..." });
    try {
      const res = await fetch("/api/publish/twitter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: tweetText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTwitter({ status: "success", message: "Tweeted!", url: data.url });
    } catch (e: unknown) {
      setTwitter({ status: "error", message: e instanceof Error ? e.message : "Failed" });
    }
  }

  async function exportMarkdown() {
    setMd({ status: "loading", message: "Exporting..." });
    try {
      const res = await fetch("/api/publish/markdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMd({ status: "success", message: `Saved to ${data.path}` });
    } catch (e: unknown) {
      setMd({ status: "error", message: e instanceof Error ? e.message : "Failed" });
    }
  }

  const statusIcon = (s: PublishStatus) => {
    if (s === "loading") return <Loader2 className="h-4 w-4 animate-spin" />;
    if (s === "success") return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (s === "error") return <XCircle className="h-4 w-4 text-red-500" />;
    return null;
  };

  return (
    <Card>
      <CardHeader className="cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Send className="h-5 w-5" /> Publish & Share
          </span>
          {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </CardTitle>
      </CardHeader>
      {expanded && (
        <CardContent className="space-y-6">
          {/* Markdown Export */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-medium text-sm">
              <FileText className="h-4 w-4" /> Export as Markdown
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={exportMarkdown} disabled={md.status === "loading"}>
                {md.status === "loading" ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
                Save to ~/seobot-exports/
              </Button>
              {statusIcon(md.status)}
              {md.message && <span className="text-xs text-muted-foreground">{md.message}</span>}
            </div>
          </div>

          {/* Dev.to */}
          <div className="space-y-2 border-t pt-4">
            <div className="flex items-center gap-2 font-medium text-sm">
              <Globe className="h-4 w-4" /> Publish to Dev.to
            </div>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Dev.to API Key"
                type="password"
                value={devtoKey}
                onChange={(e) => setDevtoKey(e.target.value)}
                className="max-w-[250px] text-sm"
              />
              <label className="flex items-center gap-1 text-xs">
                <input type="checkbox" checked={devtoPublished} onChange={(e) => setDevtoPublished(e.target.checked)} />
                Publish now
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={publishDevto} disabled={!devtoKey || devto.status === "loading"}>
                {devto.status === "loading" ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
                {devtoPublished ? "Publish" : "Save Draft"}
              </Button>
              {statusIcon(devto.status)}
              {devto.message && <span className="text-xs text-muted-foreground">{devto.message}</span>}
              {devto.url && (
                <a href={devto.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" /> View
                </a>
              )}
            </div>
          </div>

          {/* WordPress */}
          <div className="space-y-2 border-t pt-4">
            <div className="flex items-center gap-2 font-medium text-sm">
              <Globe className="h-4 w-4" /> Publish to WordPress
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Input placeholder="Site URL (https://...)" value={wpUrl} onChange={(e) => setWpUrl(e.target.value)} className="text-sm" />
              <Input placeholder="Username" value={wpUser} onChange={(e) => setWpUser(e.target.value)} className="text-sm" />
              <Input placeholder="App Password" type="password" value={wpPass} onChange={(e) => setWpPass(e.target.value)} className="text-sm" />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={wpStatus}
                onChange={(e) => setWpStatus(e.target.value as "draft" | "publish")}
                className="border rounded px-2 py-1 text-sm bg-background"
              >
                <option value="draft">Draft</option>
                <option value="publish">Publish</option>
              </select>
              <Button size="sm" onClick={publishWordPress} disabled={!wpUrl || !wpUser || !wpPass || wp.status === "loading"}>
                {wp.status === "loading" ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
                {wpStatus === "publish" ? "Publish" : "Save Draft"}
              </Button>
              {statusIcon(wp.status)}
              {wp.message && <span className="text-xs text-muted-foreground">{wp.message}</span>}
              {wp.url && (
                <a href={wp.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" /> View
                </a>
              )}
            </div>
          </div>

          {/* Twitter */}
          <div className="space-y-2 border-t pt-4">
            <div className="flex items-center gap-2 font-medium text-sm">
              <MessageCircle className="h-4 w-4" /> Share on Twitter
            </div>
            <textarea
              value={tweetText}
              onChange={(e) => setTweetText(e.target.value.slice(0, 280))}
              className="w-full border rounded p-2 text-sm bg-background resize-none"
              rows={3}
            />
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{tweetText.length}/280</span>
              <Button size="sm" onClick={publishTwitter} disabled={!tweetText || twitter.status === "loading"}>
                {twitter.status === "loading" ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
                Tweet
              </Button>
              {statusIcon(twitter.status)}
              {twitter.message && <span className="text-xs text-muted-foreground">{twitter.message}</span>}
              {twitter.url && (
                <a href={twitter.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" /> View
                </a>
              )}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
