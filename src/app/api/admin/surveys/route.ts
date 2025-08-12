import { NextRequest, NextResponse } from "next/server";
import { getDb, ensureIndexes } from "@/lib/mongodb";

// Get all surveys
export async function GET() {
  try {
    await ensureIndexes();
    const db = await getDb();
    
    const surveys = await db.collection("surveys")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    // Also get published survey info to show URLs
    const publishedSurveys = await db.collection("published_surveys")
      .find({})
      .toArray();
    
    // Merge published info into surveys
    const surveysWithPublishInfo = surveys.map(survey => {
      const publishedInfo = publishedSurveys.find(ps => ps.surveyId === survey.id);
      return {
        ...survey,
        isPublished: !!publishedInfo,
        urlSlug: publishedInfo?.urlSlug,
        publishedAt: publishedInfo?.publishedAt,
        views: publishedInfo?.views || 0,
        responses: publishedInfo?.responses || 0
      };
    });
    
    return NextResponse.json({ ok: true, surveys: surveysWithPublishInfo });
  } catch (error) {
    console.error("Surveys fetch error:", error);
    return NextResponse.json({ ok: false, error: "Failed to fetch surveys" }, { status: 500 });
  }
}

// Create new survey
export async function POST(req: NextRequest) {
  try {
    await ensureIndexes();
    const db = await getDb();
    const surveyData = await req.json();
    
    // Validate required fields
    if (!surveyData.title || !surveyData.title.trim()) {
      return NextResponse.json({ ok: false, error: "Survey title is required" }, { status: 400 });
    }
    
    console.log("Creating new survey:", surveyData.title);
    
    const newSurvey = {
      ...surveyData,
      id: generateSurveyId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft',
      responses: 0
    };
    
    await db.collection("surveys").insertOne(newSurvey);
    
    return NextResponse.json({ ok: true, survey: newSurvey });
  } catch (error) {
    console.error("Survey creation error:", error);
    return NextResponse.json({ 
      ok: false, 
      error: `Failed to create survey: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
}

// Update survey
export async function PUT(req: NextRequest) {
  try {
    await ensureIndexes();
    const db = await getDb();
    const { id, ...updates } = await req.json();
    
    // Validate required fields
    if (!id) {
      return NextResponse.json({ ok: false, error: "Survey ID is required for updates" }, { status: 400 });
    }
    
    if (!updates.title || !updates.title.trim()) {
      return NextResponse.json({ ok: false, error: "Survey title is required" }, { status: 400 });
    }
    
    // Log the update operation for debugging
    console.log("Updating survey with ID:", id);
    console.log("Update data:", JSON.stringify(updates, null, 2));
    
    const result = await db.collection("surveys").updateOne(
      { id },
      { 
        $set: { 
          ...updates, 
          updatedAt: new Date().toISOString() 
        } 
      }
    );
    
    console.log("Update result:", result);
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ ok: false, error: "Survey not found" }, { status: 404 });
    }
    
    return NextResponse.json({ ok: true, message: "Survey updated successfully" });
  } catch (error) {
    console.error("Survey update error:", error);
    return NextResponse.json({ 
      ok: false, 
      error: `Failed to update survey: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
}

// Delete survey
export async function DELETE(req: NextRequest) {
  try {
    await ensureIndexes();
    const db = await getDb();
    const { id } = await req.json();
    
    const result = await db.collection("surveys").deleteOne({ id });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ ok: false, error: "Survey not found" }, { status: 404 });
    }
    
    return NextResponse.json({ ok: true, message: "Survey deleted successfully" });
  } catch (error) {
    console.error("Survey deletion error:", error);
    return NextResponse.json({ ok: false, error: "Failed to delete survey" }, { status: 500 });
  }
}

function generateSurveyId(): string {
  return 'survey_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}
