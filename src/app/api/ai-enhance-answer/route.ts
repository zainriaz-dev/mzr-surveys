import { NextRequest, NextResponse } from "next/server";
import { aiService } from "@/lib/ai-service";

export async function POST(req: NextRequest) {
  try {
    const { answer, question, mode, context, questionType } = await req.json();
    
    const enhancementPrompts = {
      improve: `Improve and expand this survey answer to be more detailed, thoughtful, and well-explained. Keep the original meaning but make it more comprehensive and insightful.`,
      shorten: `Make this survey answer more concise and clear while keeping all the important information. Remove unnecessary words but maintain the complete meaning.`,
      urdu: `Enhance this answer by adding relevant Urdu words and Pakistani cultural context where appropriate. Make it more relatable to Pakistani culture while keeping it understandable.`,
      english: `Convert this answer to clear, professional English. Fix any grammar issues and make it sound more polished and articulate.`,
      formal: `Rewrite this answer in a formal, professional tone suitable for official surveys or research. Maintain respect and professionalism.`,
      personal: `Make this answer more personal and storytelling-focused. Add emotional connection and personal experiences while keeping it authentic.`,
      detailed: `Expand this answer with specific details, examples, and deeper explanations. Make it comprehensive and thorough.`,
      creative: `Rewrite this answer with creative expression and engaging language. Make it more interesting and captivating to read.`,
      technical: `Enhance this answer with technical accuracy and precision. Use appropriate terminology and ensure factual correctness.`,
      emotional: `Add emotional depth and human connection to this answer. Express feelings and personal impact authentically.`
    };

    const ENHANCEMENT_PROMPT = `You are helping a Pakistani survey participant improve their answer.

TASK: ${enhancementPrompts[mode as keyof typeof enhancementPrompts]}

QUESTION: "${question}"
ORIGINAL ANSWER: "${answer}"
CONTEXT: ${context}
QUESTION TYPE: ${questionType || 'text'} (adjust length accordingly)

GUIDELINES:
- Maintain the participant's original intent and perspective
- Keep the tone personal and authentic
- For Pakistani context: Include relevant Urdu terms in parentheses where natural
- For professional English: Use clear, grammatically correct language
- Keep the answer appropriate for a survey response
- Don't change the fundamental meaning or add false information
- Make it sound like the same person wrote it, just improved
- For short_text questions: Keep responses concise (1-2 sentences)
- For text questions: Can be more detailed and comprehensive
- Focus on Pakistani cultural context and experiences

Return only the enhanced answer text, nothing else.`;

    // Use the new AI service with automatic fallback and caching
    const result = await aiService.generateResponse(ENHANCEMENT_PROMPT, {
      temperature: 0.7,
      maxTokens: 1000
    });

    // Clean the response (remove quotes if wrapped)
    const enhancedAnswer = result.response
      .replace(/^["']|["']$/g, '') // Remove surrounding quotes
      .trim();

    return NextResponse.json({ 
      ok: true, 
      enhancedAnswer,
      originalAnswer: answer,
      provider: result.provider
    });
  } catch (error) {
    console.error("AI answer enhancement error:", error);
    return NextResponse.json({ 
      ok: false, 
      error: error instanceof Error ? error.message : "Failed to enhance answer" 
    }, { status: 500 });
  }
}
