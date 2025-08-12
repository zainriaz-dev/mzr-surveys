import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { question, questionType, mode, context } = await req.json();
    
    const enhancementPrompts = {
      improve: `Improve this survey question to be more engaging, clear, and professional. Make it more specific and actionable while maintaining the original intent.`,
      simplify: `Simplify this survey question using basic, easy-to-understand language. Make it accessible to people with different education levels while keeping the meaning clear.`,
      cultural: `Adapt this survey question for Pakistani culture and context. Consider local values, traditions, economic conditions, and communication styles. Include relevant examples or context that Pakistanis would relate to.`
    };

    const ENHANCEMENT_PROMPT = `You are a professional survey designer specializing in Pakistani market research. 

TASK: ${enhancementPrompts[mode as keyof typeof enhancementPrompts]}

ORIGINAL QUESTION: "${question}"
QUESTION TYPE: ${questionType}
CONTEXT: ${context}

REQUIREMENTS:
- Keep the question focused and not too long
- Consider Pakistani cultural sensitivities
- Use language appropriate for diverse educational backgrounds
- For choice questions, suggest 4-6 relevant options
- Ensure questions are mobile-friendly (short text)
- Include Urdu context in parentheses where helpful

Provide response as JSON:
{
  "enhancedQuestion": "improved question text",
  "optionSuggestions": ["option1", "option2", ...] // only for choice-type questions
  "improvements": "brief explanation of changes made"
}

Return ONLY the JSON object.`;

    // Try DeepSeek first, fallback to Gemini
    let response;
    try {
      response = await generateWithDeepSeek(ENHANCEMENT_PROMPT);
    } catch (error) {
      console.log("DeepSeek failed, trying Gemini:", error);
      response = await generateWithGemini(ENHANCEMENT_PROMPT);
    }

    // Parse the JSON response
    let enhancementData;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : response;
      enhancementData = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      return NextResponse.json({ 
        ok: false, 
        error: "Failed to generate valid enhancement" 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      ok: true, 
      enhancedQuestion: enhancementData.enhancedQuestion,
      optionSuggestions: enhancementData.optionSuggestions,
      improvements: enhancementData.improvements
    });
  } catch (error) {
    console.error("AI question enhancement error:", error);
    return NextResponse.json({ 
      ok: false, 
      error: "Failed to enhance question" 
    }, { status: 500 });
  }
}

async function generateWithDeepSeek(prompt: string): Promise<string> {
  const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    throw new Error("DeepSeek API error");
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function generateWithGemini(prompt: string): Promise<string> {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const result = await model.generateContent(prompt);
  return result.response.text();
}
