import { redirect } from "next/navigation";
import { getDb, ensureIndexes } from "@/lib/mongodb";

export default async function ShortUrlRedirect({ params }: { params: Promise<{ slug: string }> }) {
  try {
    await ensureIndexes();
    const db = await getDb();
    const { slug } = await params;
    
    const shortUrl = await db.collection("short_urls").findOne({ 
      shortId: slug,
      active: true 
    });
    
    if (!shortUrl) {
      redirect("/");
    }
    
    // Increment click count
    await db.collection("short_urls").updateOne(
      { shortId: slug },
      { 
        $inc: { clicks: 1 },
        $set: { lastClickedAt: new Date().toISOString() }
      }
    );
    
    redirect(shortUrl.originalUrl);
  } catch (error) {
    console.error("Short URL redirect error:", error);
    redirect("/");
  }
}
