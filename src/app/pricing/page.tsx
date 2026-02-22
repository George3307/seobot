"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Server, Crown } from "lucide-react";

const plans = [
  {
    name: "Self-Hosted",
    icon: Server,
    price: "Free",
    period: "forever",
    description: "Run on your own server with your own API keys",
    features: [
      "Unlimited keyword research",
      "Unlimited SEO audits",
      "AI content generation (your OpenAI key)",
      "Publish to Dev.to, WordPress, Twitter",
      "Export to Markdown",
      "Full source code access",
      "Community support",
    ],
    cta: "Get Started",
    href: "https://github.com/George3307/seobot",
    highlight: false,
  },
  {
    name: "Cloud Pro",
    icon: Zap,
    price: "$9",
    period: "/month",
    description: "No setup required. We handle everything.",
    features: [
      "Everything in Self-Hosted",
      "No API key needed",
      "50 AI articles/month",
      "Unlimited audits & keyword research",
      "Priority support",
      "Auto-updates",
      "Custom domain support",
    ],
    cta: "Join Waitlist",
    href: "#waitlist",
    highlight: true,
    badge: "Coming Soon",
  },
  {
    name: "Cloud Team",
    icon: Crown,
    price: "$29",
    period: "/month",
    description: "For agencies and content teams",
    features: [
      "Everything in Cloud Pro",
      "200 AI articles/month",
      "Team collaboration (5 seats)",
      "Rank tracking (coming soon)",
      "White-label reports",
      "API access",
      "Priority support",
    ],
    cta: "Join Waitlist",
    href: "#waitlist",
    highlight: false,
    badge: "Coming Soon",
  },
];

export default function PricingPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleWaitlist(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    try {
      // Using Formspree for simple form collection
      await fetch("https://formspree.io/f/xwpkgqjl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "seobot-pricing", timestamp: new Date().toISOString() }),
      });
      setSubmitted(true);
    } catch {
      // Still show success (email might have been sent)
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Simple, Transparent Pricing</h2>
        <p className="text-muted-foreground text-lg">
          Self-host for free, or let us handle everything.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={plan.highlight ? "border-primary shadow-lg relative" : "relative"}
          >
            {plan.badge && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2" variant="default">
                {plan.badge}
              </Badge>
            )}
            <CardHeader className="text-center">
              <plan.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="pt-2">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              {plan.href === "#waitlist" ? (
                <Button
                  className="w-full"
                  variant={plan.highlight ? "default" : "outline"}
                  onClick={() => document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" })}
                >
                  {plan.cta}
                </Button>
              ) : (
                <a href={plan.href} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full" variant="outline">
                    {plan.cta}
                  </Button>
                </a>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Waitlist Section */}
      <Card id="waitlist" className="max-w-lg mx-auto">
        <CardHeader className="text-center">
          <CardTitle>🚀 Join the Cloud Waitlist</CardTitle>
          <CardDescription>
            Be the first to know when SEOBot Cloud launches. Early subscribers get 50% off for life.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="text-center py-4">
              <p className="text-green-600 font-medium">✅ You&apos;re on the list!</p>
              <p className="text-sm text-muted-foreground mt-1">We&apos;ll email you when Cloud Pro launches.</p>
            </div>
          ) : (
            <form onSubmit={handleWaitlist} className="flex gap-2">
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1"
              />
              <Button type="submit" disabled={submitting}>
                {submitting ? "..." : "Join"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
