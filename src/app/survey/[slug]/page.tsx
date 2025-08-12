import { notFound, redirect } from "next/navigation";
import { getDb, ensureIndexes } from "@/lib/mongodb";
import PublishedSurveyPage from "@/components/PublishedSurveyPage";

export default async function DynamicSurveyPage({ params }: { params: Promise<{ slug: string }> }) {
  try {
    await ensureIndexes();
    const db = await getDb();
    const { slug } = await params;
    
    // Find the published survey
    const publishedSurvey = await db.collection("published_surveys").findOne({ 
      urlSlug: slug,
      status: 'active' 
    });
    
    if (!publishedSurvey) {
      notFound();
    }

    // Increment view count
    await db.collection("published_surveys").updateOne(
      { urlSlug: slug },
      { 
        $inc: { views: 1 },
        $set: { lastViewedAt: new Date().toISOString() }
      }
    );
    
    // Serialize MongoDB objects to plain objects and include required fields
    const ps = publishedSurvey as any;
    const serializedSurvey = {
      _id: ps._id?.toString(),
      surveyId: ps.surveyId || ps.survey?._id?.toString() || ps.survey?.id,
      urlSlug: ps.urlSlug,
      title: ps.title || ps.survey?.title || "",
      description: ps.description || ps.survey?.description || "",
      survey: ps.survey
        ? {
            ...ps.survey,
            _id: ps.survey._id?.toString(),
            id: ps.survey._id?.toString() || ps.survey.id,
            createdAt: ps.survey.createdAt ? new Date(ps.survey.createdAt).toISOString() : undefined,
            updatedAt: ps.survey.updatedAt ? new Date(ps.survey.updatedAt).toISOString() : undefined,
          }
        : undefined,
      publishedAt: ps.publishedAt ? new Date(ps.publishedAt).toISOString() : undefined,
      status: ps.status,
      views: typeof ps.views === 'number' ? ps.views : 0,
      responses: typeof ps.responses === 'number' ? ps.responses : 0,
      settings: ps.settings ? { ...ps.settings } : undefined,
      scheduling: ps.scheduling ? { ...ps.scheduling } : undefined,
      lastViewedAt: ps.lastViewedAt ? new Date(ps.lastViewedAt).toISOString() : undefined,
    } as any;

    return <PublishedSurveyPage publishedSurvey={serializedSurvey} />;
  } catch (error) {
    console.error("Dynamic survey page error:", error);
    notFound();
  }
}
