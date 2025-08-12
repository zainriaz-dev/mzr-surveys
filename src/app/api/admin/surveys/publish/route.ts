import { NextRequest, NextResponse } from "next/server";
import { getDb, ensureIndexes } from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    await ensureIndexes();
    const db = await getDb();
    const { surveyId, customUrl, aiEnabled = true, scheduleSettings } = await req.json();
    
    if (!surveyId) {
      return NextResponse.json({ ok: false, error: "Survey ID is required" }, { status: 400 });
    }

    // Get the survey
    const survey = await db.collection("surveys").findOne({ id: surveyId });
    if (!survey) {
      return NextResponse.json({ ok: false, error: "Survey not found" }, { status: 404 });
    }

    // Generate unique URL slug
    const urlSlug = customUrl || generateUrlSlug(survey.title);
    
    // Check if URL already exists
    const existingUrl = await db.collection("published_surveys").findOne({ urlSlug });
    if (existingUrl) {
      return NextResponse.json({ 
        ok: false, 
        error: "URL already exists. Please choose a different custom URL." 
      }, { status: 400 });
    }

    // Get global survey settings as fallback
    let globalSettings = null;
    try {
      globalSettings = await db.collection("survey_settings").findOne({ id: "main" });
    } catch (error) {
      console.warn("Could not fetch global settings for published survey");
    }

    // Create published survey record
    const publishedSurvey = {
      surveyId: survey.id,
      urlSlug,
      title: survey.title,
      description: survey.description,
      survey: survey, // Store the full survey data
      publishedAt: new Date().toISOString(),
      status: 'active',
      views: 0,
      responses: 0,
      settings: {
        allowAnonymous: true,
        requireLogin: false,
        collectEmails: false,
        maxResponses: null,
        expiresAt: null,
        aiEnabled: aiEnabled
      },
      // Store scheduling settings for this specific survey
      scheduling: scheduleSettings || (globalSettings ? {
        enabled: globalSettings.enabled || true,
        startDate: globalSettings.scheduling?.startDate || null,
        endDate: globalSettings.scheduling?.endDate || null,
        timezone: globalSettings.scheduling?.timezone || "Asia/Karachi",
        inheritGlobal: true // Flag to indicate using global settings
      } : {
        enabled: true,
        startDate: null,
        endDate: null,
        timezone: "Asia/Karachi",
        inheritGlobal: false
      })
    };

    await db.collection("published_surveys").insertOne(publishedSurvey);

    // Update survey status
    await db.collection("surveys").updateOne(
      { id: surveyId },
      { 
        $set: { 
          status: 'published',
          publishedAt: new Date().toISOString(),
          urlSlug: urlSlug,
          updatedAt: new Date().toISOString()
        } 
      }
    );

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${req.nextUrl.protocol}//${req.nextUrl.host}`;
    const surveyUrl = `${baseUrl}/survey/${urlSlug}`;

    return NextResponse.json({ 
      ok: true, 
      message: "Survey published successfully",
      surveyUrl,
      urlSlug,
      publishedSurvey
    });
  } catch (error) {
    console.error("Survey publish error:", error);
    return NextResponse.json({ 
      ok: false, 
      error: "Failed to publish survey" 
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    await ensureIndexes();
    const db = await getDb();
    
    const publishedSurveys = await db.collection("published_surveys")
      .find({ status: 'active' })
      .sort({ publishedAt: -1 })
      .toArray();
    
    return NextResponse.json({ ok: true, surveys: publishedSurveys });
  } catch (error) {
    console.error("Published surveys fetch error:", error);
    return NextResponse.json({ 
      ok: false, 
      error: "Failed to fetch published surveys" 
    }, { status: 500 });
  }
}

function generateUrlSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .trim()
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .substring(0, 50) // Limit length
    + '-' + Date.now().toString(36); // Add timestamp for uniqueness
}
