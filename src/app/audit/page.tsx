import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";

export default function AuditPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Technical Audit</h2>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" /> Coming Soon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Comprehensive technical SEO audit for your website. Crawl, analyze, and get actionable recommendations.
          </p>
          <ul className="mt-4 text-sm text-muted-foreground list-disc list-inside space-y-1">
            <li>Core Web Vitals analysis</li>
            <li>Meta tags &amp; structured data check</li>
            <li>Crawlability &amp; indexability</li>
            <li>One-click audit report</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
