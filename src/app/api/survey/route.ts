import { NextRequest, NextResponse } from "next/server";
import { getDb, ensureIndexes } from "@/lib/mongodb";
import { z } from "zod";

const demographicSchema = z.object({
  ageGroup: z.enum(["<18", "18-24", "25-34", "35-44", "45-59", "60+"]),
  gender: z.enum(["female", "male", "non-binary", "prefer-not-to-say"]).optional(),
  regionType: z.enum(["village", "town", "city", "remote"]),
  province: z
    .enum(["Punjab", "Sindh", "Khyber Pakhtunkhwa", "Balochistan", "Gilgit-Baltistan", "AJK", "Islamabad"])
    .optional(),
  education: z
    .enum(["none", "primary", "secondary", "intermediate", "bachelor", "master", "phd"]).optional(),
});

const toArray = (value: unknown): string[] => {
  if (Array.isArray(value)) return value as string[];
  if (typeof value === "string") return value.split(",").map((s) => s.trim()).filter(Boolean);
  return [];
};

const surveySchema = z.object({
  demographics: demographicSchema,
  contact: z
    .object({ name: z.string().min(1).optional(), email: z.string().email().optional(), phone: z.string().optional() })
    .optional(),
  topics: z.object({
    learning: z.object({
      issues: z.union([z.array(z.string()), z.string()]).transform(toArray).default([]),
      details: z.string().optional(),
      interestInTools: z.boolean().default(false),
      desiredTools: z.union([z.array(z.string()), z.string()]).transform(toArray).default([]),
    }).optional(),
    technology: z.object({
      issues: z.union([z.array(z.string()), z.string()]).transform(toArray).default([]),
      details: z.string().optional(),
      interestInTools: z.boolean().default(false),
      desiredTools: z.union([z.array(z.string()), z.string()]).transform(toArray).default([]),
    }).optional(),
    healthcare: z.object({
      issues: z.union([z.array(z.string()), z.string()]).transform(toArray).default([]),
      details: z.string().optional(),
      interestInTools: z.boolean().default(false),
      desiredTools: z.union([z.array(z.string()), z.string()]).transform(toArray).default([]),
    }).optional(),
    genZ: z.object({
      issues: z.union([z.array(z.string()), z.string()]).transform(toArray).default([]),
      details: z.string().optional(),
      interestInTools: z.boolean().default(false),
      desiredTools: z.union([z.array(z.string()), z.string()]).transform(toArray).default([]),
    }).optional(),
  }).optional(),
  aiAssistantFeedback: z.string().optional(),
  // new optional UI/UX feedback fields
  ui: z
    .object({
      theme: z.string().optional(),
      accessibility: z.array(z.string()).optional(),
      animations: z.boolean().optional(),
    })
    .optional(),
  digitalHabits: z
    .object({
      ageAnswer: z.string().nullable().optional(),
      dailyPhoneHours: z.string().nullable().optional(),
      topApps: z.array(z.string()).nullable().optional(),
      topAppsOther: z.string().nullable().optional(),
      usageAffectsProductivity: z.string().nullable().optional(),
      usedAiTools: z.string().nullable().optional(),
      biggestTechProblem: z.string().nullable().optional(),
      helpfulServices: z.array(z.string()).nullable().optional(),
      helpfulServicesOther: z.string().nullable().optional(),
      willingToPay: z.string().nullable().optional(),
      internetAccess: z.string().nullable().optional(),
      dataLimits: z.string().nullable().optional(),
      deviceOwnership: z.array(z.string()).nullable().optional(),
      onlineEarning: z.string().nullable().optional(),
    })
    .optional(),
  techChallenges: z
    .object({
      codingExperience: z.string().nullable().optional(),
      learningBarriers: z.array(z.string()).nullable().optional(),
      resourceAccess: z.string().nullable().optional(),
      mentorshipNeed: z.string().nullable().optional(),
      skillGaps: z.array(z.string()).nullable().optional(),
      techCareerInterest: z.string().nullable().optional(),
    })
    .optional(),
  careerFuture: z
    .object({
      currentStatus: z.string().nullable().optional(),
      freelancingExperience: z.string().nullable().optional(),
      remoteWorkChallenges: z.array(z.string()).nullable().optional(),
      skillDevelopmentPriority: z.array(z.string()).nullable().optional(),
      careerGoals: z.string().nullable().optional(),
      financialStruggles: z.array(z.string()).nullable().optional(),
      entrepreneurshipInterest: z.string().nullable().optional(),
    })
    .optional(),
  consent: z.boolean().refine((v) => v === true, { message: "Consent is required" }),
});

export async function POST(req: NextRequest) {
  try {
    await ensureIndexes();
    const payload = await req.json();
    const parsed = surveySchema.parse(payload);
    const db = await getDb();
    const nowIso = new Date().toISOString();
    const doc = { ...parsed, createdAt: nowIso, updatedAt: nowIso };
    const result = await db.collection("responses").insertOne(doc);
    return NextResponse.json({ ok: true, id: result.insertedId }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: "Internal Error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await ensureIndexes();
    const db = await getDb();
    const responses = await db
      .collection("responses")
      .find({}, { projection: { aiAssistantFeedback: 0 } })
      .sort({ createdAt: -1 })
      .limit(200)
      .toArray();
    return NextResponse.json({ ok: true, data: responses });
  } catch {
    return NextResponse.json({ ok: false, error: "Internal Error" }, { status: 500 });
  }
}


