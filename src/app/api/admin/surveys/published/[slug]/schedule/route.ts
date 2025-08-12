import { NextRequest, NextResponse } from "next/server";
import { getDb, ensureIndexes } from "@/lib/mongodb";

// GET - Fetch published survey scheduling details
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
        views: publishedSurvey.views || 0,
        responses: publishedSurvey.responses || 0,
        publishedAt: publishedSurvey.publishedAt
      }
    });
  } catch (error) {
    console.error("Get published survey schedule error:", error);
    return NextResponse.json({ 
      ok: false, 
      error: "Failed to fetch survey schedule" 
    }, { status: 500 });
  }
}

// PUT - Update published survey scheduling
export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await ensureIndexes();
    const db = await getDb();
    const { slug } = await params;
    const { scheduling } = await req.json();
    
    if (!scheduling) {
      return NextResponse.json({ 
        ok: false, 
        error: "Scheduling data is required" 
      }, { status: 400 });
    }

    // Find the published survey
    const publishedSurvey = await db.collection("published_surveys").findOne({ 
      urlSlug: slug, 
      status: 'active' 
    });
    
    if (!publishedSurvey) {
      return NextResponse.json({ ok: false, error: "Survey not found" }, { status: 404 });
    }

    // Update the scheduling settings
    const result = await db.collection("published_surveys").updateOne(
      { urlSlug: slug },
      { 
        $set: { 
          scheduling: {
            enabled: scheduling.enabled,
            startDate: scheduling.startDate,
            endDate: scheduling.endDate,
            timezone: scheduling.timezone || "Asia/Karachi",
            inheritGlobal: scheduling.inheritGlobal || false
          },
          updatedAt: new Date().toISOString()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ ok: false, error: "Survey not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      ok: true, 
      message: "Survey scheduling updated successfully",
      scheduling: {
        enabled: scheduling.enabled,
        startDate: scheduling.startDate,
        endDate: scheduling.endDate,
        timezone: scheduling.timezone || "Asia/Karachi",
        inheritGlobal: scheduling.inheritGlobal || false
      }
    });
  } catch (error) {
    console.error("Update published survey schedule error:", error);
    return NextResponse.json({ 
      ok: false, 
      error: "Failed to update survey schedule" 
    }, { status: 500 });
  }
}
