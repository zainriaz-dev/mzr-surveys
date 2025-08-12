import { NextRequest, NextResponse } from "next/server";
import { getDb, ensureIndexes } from "@/lib/mongodb";

// Simple URL shortener for surveys
export async function POST(req: NextRequest) {
  try {
    await ensureIndexes();
    const db = await getDb();
    const { originalUrl, customSlug } = await req.json();
    
    // Generate short ID if no custom slug provided
    const shortId = customSlug || generateShortId();
    
    // Check if slug already exists
    const existing = await db.collection("short_urls").findOne({ shortId });
    if (existing) {
      return NextResponse.json({ ok: false, error: "Slug already exists" }, { status: 400 });
    }
    
    const shortUrl = {
      shortId,
      originalUrl,
      clicks: 0,
      createdAt: new Date().toISOString(),
      createdBy: "admin",
      active: true
    };
    
    await db.collection("short_urls").insertOne(shortUrl);
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${req.nextUrl.protocol}//${req.nextUrl.host}`;
    const fullShortUrl = `${baseUrl}/s/${shortId}`;
    
    return NextResponse.json({ 
      ok: true, 
      shortUrl: fullShortUrl,
      shortId,
      originalUrl 
    });
  } catch (error) {
    console.error("Short URL creation error:", error);
    return NextResponse.json({ ok: false, error: "Failed to create short URL" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await ensureIndexes();
    const db = await getDb();
    
    const urls = await db.collection("short_urls")
      .find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();
    
    return NextResponse.json({ ok: true, urls });
  } catch (error) {
    console.error("Short URLs fetch error:", error);
    return NextResponse.json({ ok: false, error: "Failed to fetch URLs" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await ensureIndexes();
    const db = await getDb();
    const { shortId } = await req.json();
    
    const result = await db.collection("short_urls").deleteOne({ shortId });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ ok: false, error: "URL not found" }, { status: 404 });
    }
    
    return NextResponse.json({ ok: true, message: "URL deleted successfully" });
  } catch (error) {
    console.error("Short URL deletion error:", error);
    return NextResponse.json({ ok: false, error: "Failed to delete URL" }, { status: 500 });
  }
}

function generateShortId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
