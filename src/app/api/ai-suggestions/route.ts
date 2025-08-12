import { NextRequest, NextResponse } from "next/server";
import { aiService } from "@/lib/ai-service";

export async function POST(req: NextRequest) {
  try {
    const { answer, question, questionType } = await req.json();
    
    const SUGGESTIONS_PROMPT = `You are an AI assistant helping Pakistani survey participants improve their answers.

QUESTION: "${question}"
CURRENT ANSWER: "${answer}"
QUESTION TYPE: ${questionType}

Generate 3 helpful, actionable suggestions to improve this answer. Focus on:
1. Making it more complete and thoughtful
2. Adding relevant Pakistani context or perspective
3. Improving clarity and structure

Guidelines:
- Keep suggestions practical and specific
- Respect the original intent and voice
- Make them relevant to Pakistani culture and context
- Each suggestion should be 1-2 sentences max
- Don't suggest changing the fundamental meaning
- Focus on enhancement, not replacement

Return as a JSON array of strings, for example:
["Add specific examples from your daily life", "Mention how this relates to Pakistani culture", "Explain the impact this has on your community"]

Return only the JSON array, nothing else.`;

    // Use the new AI service with automatic fallback and caching
    const result = await aiService.generateResponse(SUGGESTIONS_PROMPT, {
      temperature: 0.7,
      maxTokens: 500
    });

    // Parse the JSON response
    let suggestions: string[] = [];
    try {
      // Clean the response and parse JSON
      const cleanedResponse = result.response.trim().replace(/^```json\s*/, '').replace(/\s*```$/, '');
      suggestions = JSON.parse(cleanedResponse);
      
      // Validate it's an array of strings
      if (!Array.isArray(suggestions) || !suggestions.every(s => typeof s === 'string')) {
        throw new Error("Invalid suggestions format");
      }
    } catch (parseError) {
      console.error("Failed to parse suggestions JSON:", parseError);
      // Fallback suggestions
      suggestions = [
        "Add more specific examples from your experience",
        "Explain how this affects your daily life in Pakistan",
        "Include your personal perspective on the topic"
      ];
    }

    return NextResponse.json({ 
      ok: true, 
      suggestions: suggestions.slice(0, 3), // Ensure max 3 suggestions
      provider: result.provider
    });
  } catch (error) {
    console.error("AI suggestions error:", error);
    return NextResponse.json({ 
      ok: false, 
      error: error instanceof Error ? error.message : "Failed to generate suggestions",
      suggestions: [] 
    }, { status: 500 });
  }
}
