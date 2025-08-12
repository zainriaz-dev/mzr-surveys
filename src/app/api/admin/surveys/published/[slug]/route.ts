import { NextRequest, NextResponse } from "next/server";
import { getDb, ensureIndexes } from "@/lib/mongodb";

// GET - Fetch published survey details
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await ensureIndexes();
    const db = await getDb();
    const { slug } = await params;
    
    const publishedSurvey = await db.collection("published_surveys").findOne({ 
      urlSlug: slug, 
      status: 'active' 
    });
    
    if (!publishedSurvey) {
      return NextResponse.json({ ok: false, error: "Survey not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      ok: true, 
      survey: {
        surveyId: publishedSurvey.surveyId,
        urlSlug: publishedSurvey.urlSlug,
        title: publishedSurvey.title,
        description: publishedSurvey.description,
        scheduling: publishedSurvey.scheduling || {
          enabled: true,
          startDate: null,
          endDate: null,
          timezone: "Asia/Karachi",
          inheritGlobal: true
        },
        settings: publishedSurvey.settings || {},
        views: publishedSurvey.views || 0,
        responses: publishedSurvey.responses || 0,
        publishedAt: publishedSurvey.publishedAt,
        survey: publishedSurvey.survey
      }
    });
  } catch (error) {
    console.error("Get published survey error:", error);
    return NextResponse.json({ 
      ok: false, 
      error: "Failed to fetch survey" 
    }, { status: 500 });
  }
}
