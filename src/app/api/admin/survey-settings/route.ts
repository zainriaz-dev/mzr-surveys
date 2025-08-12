import { NextRequest, NextResponse } from "next/server";
import { getDb, ensureIndexes } from "@/lib/mongodb";

// Helper function to check if survey is currently active
function isSurveyActive(settings: any): boolean {
  if (!settings.enabled) return false;
  
  const now = new Date();
  const startDate = settings.scheduling?.startDate ? new Date(settings.scheduling.startDate) : null;
  const endDate = settings.scheduling?.endDate ? new Date(settings.scheduling.endDate) : null;
  
  // Check start date
  if (startDate && now < startDate) return false;
  
  // Check end date
  if (endDate && now > endDate) return false;
  
  return true;
}

export async function GET() {
  try {
    await ensureIndexes();
    const db = await getDb();
    
    // Get survey settings from a dedicated collection
    let settings = await db.collection("survey_settings").findOne({ id: "main" });
    
    if (!settings) {
      // Create default settings if none exist
      const defaultSettings = {
        id: "main",
        enabled: true,
        title: "Pakistan Tech & Society Survey 2025",
        description: "Advanced survey about technology, healthcare, and youth issues in Pakistan",
        theme: "ghibli",
        customUrl: null,
        scheduling: {
          startDate: null,
          endDate: null,
          timezone: "Asia/Karachi",
          autoEnable: false,
          autoDisable: false,
          notifyBeforeEnd: true,
          notifyDays: 3
        },
        display: {
          showCountdown: true,
          showParticipantCount: true,
          showProgress: true,
          customMessage: "",
          thankYouMessage: "Thank you for participating in our survey!"
        },
        limits: {
          maxResponses: null,
          dailyLimit: null,
          requireUniqueEmail: false,
          allowAnonymous: true
        },
        shareSettings: {
          enableSharing: true,
          socialPlatforms: ["facebook", "twitter", "whatsapp", "linkedin"],
          copyLinkEnabled: true
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const insertResult = await db.collection("survey_settings").insertOne(defaultSettings);
      settings = { ...defaultSettings, _id: insertResult.insertedId } as any;
    }
    
    // Add computed fields
    const enrichedSettings = {
      ...settings,
      isCurrentlyActive: isSurveyActive(settings),
      status: isSurveyActive(settings) ? 'active' : 'inactive'
    };
    
    return NextResponse.json({ ok: true, settings: enrichedSettings });
  } catch (error) {
    console.error("Survey settings error:", error);
    return NextResponse.json({ ok: false, error: "Failed to get settings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureIndexes();
    const db = await getDb();
    const updates = await req.json();
    
    // Remove MongoDB-specific fields that shouldn't be updated
    const { _id, id, createdAt, ...cleanUpdates } = updates;
    
    const result = await db.collection("survey_settings").updateOne(
      { id: "main" },
      { 
        $set: { 
          ...cleanUpdates, 
          updatedAt: new Date().toISOString() 
        } 
      },
      { upsert: true }
    );
    
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    console.error("Survey settings update error:", error);
    return NextResponse.json({ ok: false, error: "Failed to update settings" }, { status: 500 });
  }
}
