import { NextResponse } from "next/server";
import { aiService } from "@/lib/ai-service";

export async function GET() {
  try {
    const providerStatus = await aiService.getProviderStatus();

    return NextResponse.json({
      ok: true,
      providers: providerStatus,
      config: {
        primaryProvider: process.env.PRIMARY_AI_PROVIDER || 'azure_openai',
        fallbackProvider: process.env.FALLBACK_AI_PROVIDER || 'gemini',
        azureModel: process.env.AZURE_OPENAI_MODEL || 'gpt-4o-mini',
        azureModel2: process.env.AZURE_OPENAI_MODEL_2 || 'gpt-4o'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("AI Status Error:", error);
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : "Failed to get AI status"
    }, { status: 500 });
  }
}
