import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { prompt, surveyType, targetAudience, questionCount = 10 } = await req.json();
    
    const SURVEY_GENERATION_PROMPT = `You are an expert survey designer. Create a comprehensive survey based on the following requirements:

SURVEY TYPE: ${surveyType}
TARGET AUDIENCE: ${targetAudience} 
QUESTION COUNT: ${questionCount}
SPECIFIC REQUIREMENTS: ${prompt}

CONTEXT: This is for Pakistani users (villages, cities, youth). Consider local context including:
- Data costs and mobile-first design
- Cultural sensitivity and language preferences
- Economic constraints and digital literacy levels
- Local challenges in technology, healthcare, education, and career development

Create a survey with the following structure:
{
  "title": "Survey Title",
  "description": "Brief description",
  "sections": [
    {
      "id": "section_1",
      "title": "Section Title",
      "description": "Section description",
      "questions": [
        {
          "id": "q1",
          "type": "multiple_choice|single_choice|text|number|rating|yes_no|dropdown",
          "question": "Question text",
          "required": true/false,
          "options": ["Option 1", "Option 2"] // for choice questions
          "placeholder": "Enter your answer..." // for text questions
          "min": 1, "max": 10 // for rating/number questions
        }
      ]
    }
  ],
  "estimatedTime": "5-10 minutes",
  "tags": ["technology", "healthcare", "education"]
}

Ensure questions are:
- Culturally appropriate for Pakistan
- Clear and easy to understand
- Mobile-friendly (short options)
- Include both Urdu and English context where helpful
- Progressive from general to specific topics

Return ONLY the JSON object, no other text.`;

    // Try DeepSeek first, fallback to Gemini
    let response;
    try {
      response = await generateWithDeepSeek(SURVEY_GENERATION_PROMPT);
    } catch (error) {
      console.log("DeepSeek failed, trying Gemini:", error);
      response = await generateWithGemini(SURVEY_GENERATION_PROMPT);
    }

    // Parse the JSON response
    let surveyData;
    try {
      // Extract JSON from response if it's wrapped in other text
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : response;
      surveyData = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      return NextResponse.json({ 
        ok: false, 
        error: "Failed to generate valid survey format" 
      }, { status: 500 });
    }

    return NextResponse.json({ ok: true, survey: surveyData });
  } catch (error) {
    console.error("AI survey generation error:", error);
    return NextResponse.json({ 
      ok: false, 
      error: "Failed to generate survey" 
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
      max_tokens: 2000,
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
