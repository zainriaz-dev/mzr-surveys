import { NextRequest, NextResponse } from "next/server";
import { getDb, ensureIndexes } from "@/lib/mongodb";

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await ensureIndexes();
    const db = await getDb();
    const { slug } = await params;
    const { surveyId, responses, submittedAt } = await req.json();
    
    // Verify the published survey exists
    const publishedSurvey = await db.collection("published_surveys").findOne({ 
      urlSlug: slug,
      status: 'active' 
    });
    
    if (!publishedSurvey) {
      return NextResponse.json({ ok: false, error: "Survey not found" }, { status: 404 });
    }

    // Create response record
    const responseRecord = {
      surveyId,
      urlSlug: slug,
      responses,
      submittedAt: submittedAt || new Date().toISOString(),
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown',
      source: 'published_survey'
    };

    // Save response
    await db.collection("survey_responses").insertOne(responseRecord);

    // Update response count
    await db.collection("published_surveys").updateOne(
      { urlSlug: slug },
      { 
        $inc: { responses: 1 },
        $set: { lastResponseAt: new Date().toISOString() }
      }
    );

    return NextResponse.json({ 
      ok: true, 
      message: "Response recorded successfully" 
    });
  } catch (error) {
    console.error("Survey response error:", error);
    return NextResponse.json({ 
      ok: false, 
      error: "Failed to save response" 
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await ensureIndexes();
    const db = await getDb();
    const { slug } = await params;
    
    // Get all responses for this survey
    const responses = await db.collection("survey_responses")
      .find({ urlSlug: slug })
      .sort({ submittedAt: -1 })
      .toArray();
    
    // Get survey info
    const publishedSurvey = await db.collection("published_surveys").findOne({ 
      urlSlug: slug 
    });
    
    return NextResponse.json({ 
      ok: true, 
      responses,
      survey: publishedSurvey,
      total: responses.length
    });
  } catch (error) {
    console.error("Survey responses fetch error:", error);
    return NextResponse.json({ 
      ok: false, 
      error: "Failed to fetch responses" 
    }, { status: 500 });
  }
}
