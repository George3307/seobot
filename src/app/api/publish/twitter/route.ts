import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { readFileSync } from "fs";

function percentEncode(str: string) {
  return encodeURIComponent(str).replace(/[!'()*]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase());
}

function generateOAuthSignature(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerSecret: string,
  tokenSecret: string
) {
  const sortedParams = Object.keys(params)
    .sort()
    .map((k) => `${percentEncode(k)}=${percentEncode(params[k])}`)
    .join("&");
  const baseString = `${method}&${percentEncode(url)}&${percentEncode(sortedParams)}`;
  const signingKey = `${percentEncode(consumerSecret)}&${percentEncode(tokenSecret)}`;
  return crypto.createHmac("sha1", signingKey).update(baseString).digest("base64");
}

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text) return NextResponse.json({ error: "Tweet text is required" }, { status: 400 });
    if (text.length > 280) return NextResponse.json({ error: "Tweet exceeds 280 characters" }, { status: 400 });

    let creds: { consumer_key: string; consumer_secret: string; access_token: string; access_token_secret: string };
    try {
      creds = JSON.parse(readFileSync(process.env.HOME + "/.config/credentials/twitter-api.json", "utf8"));
    } catch {
      return NextResponse.json({ error: "Twitter credentials not found on server" }, { status: 500 });
    }

    const url = "https://api.x.com/2/tweets";
    const oauthParams: Record<string, string> = {
      oauth_consumer_key: creds.consumer_key,
      oauth_nonce: crypto.randomBytes(16).toString("hex"),
      oauth_signature_method: "HMAC-SHA1",
      oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
      oauth_token: creds.access_token,
      oauth_version: "1.0",
    };

    oauthParams.oauth_signature = generateOAuthSignature("POST", url, oauthParams, creds.consumer_secret, creds.access_token_secret);

    const authHeader =
      "OAuth " +
      Object.keys(oauthParams)
        .sort()
        .map((k) => `${percentEncode(k)}="${percentEncode(oauthParams[k])}"`)
        .join(", ");

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: data.detail || data.title || "Failed to tweet" }, { status: res.status });
    }

    return NextResponse.json({ id: data.data?.id, url: `https://x.com/i/status/${data.data?.id}` });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Unknown error" }, { status: 500 });
  }
}
