import { NextRequest, NextResponse } from "next/server";
import { aiService } from "@/lib/ai-service";

const SYSTEM_PROMPT = `You are a helpful AI assistant supporting Pakistani youth and residents completing a comprehensive life survey. You understand the unique challenges of Pakistani society:

🇵🇰 PAKISTANI CONTEXT:
- Internet/data costs and reliability issues
- Device sharing in families, limited personal devices
- Language barriers (English vs Urdu/local languages)
- Rural vs urban digital divide
- Gender-specific technology access challenges
- Economic constraints affecting education/career choices
- Family/social pressures on career decisions
- Limited access to quality education and mentorship
- Freelancing challenges (payment issues, skill gaps, client communication)
- Youth unemployment and underemployment

💡 YOUR ROLE:
- Help users articulate their challenges clearly
- Suggest practical, context-aware solutions
- Provide examples in both Urdu/Roman Urdu and English when helpful
- Recommend realistic AI tools and services they might benefit from
- Be encouraging about their potential and opportunities
- Understand local constraints (load shedding, poor internet, cost sensitivity)

🎯 RESPONSE STYLE:
- Keep responses concise but comprehensive
- Use simple, clear language
- Include relevant emojis for better engagement
- Be culturally sensitive and respectful
- Focus on practical, actionable advice
- Acknowledge their struggles while highlighting opportunities

OUTPUT RULES (STRICT):
- Do not use Markdown formatting like bold (**), code fences (three backticks), or numbered headings
- Do not wrap text in quotes
- Ensure normal spaces between words (do not merge words)
- Keep lines reasonably short (~120 characters)
- If the user asks for bilingual help, respond in exactly two short lines in this order:
  Urdu/Roman Urdu (one short line)
  English (one short line)
- Do not add labels unless the user explicitly asks. Keep it clean and plain.
`;

function sanitize(text: string): string {
  if (!text) return "";
  return text
    // remove markdown asterisks and code fences
    .replace(/\*{1,}/g, "")
    .replace(/```[\s\S]*?```/g, "")
    // ensure a space after punctuation when missing
    .replace(/([,.!?])(\S)/g, "$1 $2")
    // collapse multiple spaces
    .replace(/\s{2,}/g, " ")
    // remove stray quotes at ends
    .replace(/^\s*["']|["']\s*$/g, "")
    .trim();
}

function buildAssistantPrompt(userMessage: string): string {
  return `Follow the system guidelines above.

TASK: Respond helpfully to the user's message for a Pakistani audience.
Return STRICT JSON only with this shape and nothing else:
{"english": string, "urdu": string}

Constraints:
- Keep each field 1 short friendly line (<= 120 chars)
- Simple wording, warm tone, include just one emoji total (place it in English line)
- Urdu should be standard Urdu (not Roman) unless user explicitly asks for Roman Urdu

User message: ${JSON.stringify(userMessage)}`;
}

function extractJson<T = any>(text: string): T | null {
  try {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end === -1 || end <= start) return null;
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}

function formatBilingual(json: { english?: string; urdu?: string } | null, fallback: string): string {
  if (!json) return sanitize(fallback);
  const en = (json.english || '').replace(/\s+/g, ' ').trim();
  const ur = (json.urdu || '').replace(/\s+/g, ' ').trim();
  if (en && ur) return `${en}\n${ur}`;
  if (en) return en;
  if (ur) return ur;
  return sanitize(fallback);
}


export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const stream = url.searchParams.get("stream") === "1";
    const body = await req.json();
    const { message, history } = body as { 
      message: string; 
      history?: Array<{ role: string; content: string }> 
    };

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { ok: false, error: "Message is required" }, 
        { status: 400 }
      );
    }

    // Resolve deterministic defaults from env
    const DEFAULT_TEMP = Number(process.env.AI_TEMPERATURE ?? '0.2');
    const DEFAULT_TOP_P = Number(process.env.AI_TOP_P ?? '0.9');
    const DEFAULT_MAX = Number(process.env.AI_MAX_TOKENS ?? '800');

    // For non-streaming requests
    if (!stream) {
      try {
        const result = await aiService.generateResponse(buildAssistantPrompt(message), {
          systemPrompt: SYSTEM_PROMPT,
          temperature: DEFAULT_TEMP,
          topP: DEFAULT_TOP_P,
          maxTokens: DEFAULT_MAX
        });

        const parsed = extractJson<{ english?: string; urdu?: string }>(result.response);
        const pretty = formatBilingual(parsed, result.response);

        return NextResponse.json({ 
          ok: true, 
          text: sanitize(pretty),
          provider: result.provider
        });
      } catch (error) {
        console.error("AI Service Error:", error);
        return NextResponse.json(
          { 
            ok: false, 
            error: "Our AI service is temporarily unavailable. Please try again in a moment."
          }, 
          { status: 503 }
        );
      }
    }

    // For streaming requests (SSE style)
    const streamResponse = new ReadableStream<Uint8Array>({
      start: async (controller) => {
        const encoder = new TextEncoder();
        const send = (chunk: string) => {
          controller.enqueue(encoder.encode(`data: ${chunk}\n\n`));
        };

        try {
          // For streaming, we'll get the full response and stream it word by word
          const result = await aiService.generateResponse(buildAssistantPrompt(message), {
            systemPrompt: SYSTEM_PROMPT,
            temperature: DEFAULT_TEMP,
            topP: DEFAULT_TOP_P,
            maxTokens: DEFAULT_MAX
          });

          // Parse JSON and send as a single chunk to preserve spacing
          const parsed = extractJson<{ english?: string; urdu?: string }>(result.response);
          const pretty = formatBilingual(parsed, result.response);
          const formatted = sanitize(pretty);
          send(formatted);
          send("[DONE]");
          controller.close();
        } catch (error) {
          console.error("Streaming AI Error:", error);
          // Send a plain-text friendly error instead of JSON-looking payload
          send("Our AI service is temporarily unavailable. Please try again later.");
          controller.close();
        }
      },
    });

    return new Response(streamResponse, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error("Assistant API Error:", error);
    return NextResponse.json(
      { 
        ok: false, 
        error: error instanceof Error ? error.message : "Server error" 
      }, 
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  try {
    const status = await aiService.getProviderStatus();
    
    return NextResponse.json({
      ok: true,
      providers: status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { 
        ok: false, 
        error: error instanceof Error ? error.message : "Health check failed" 
      }, 
      { status: 500 }
    );
  }
}