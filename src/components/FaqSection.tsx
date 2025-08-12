"use client";
import { GhibliFrame } from "@/components/GhibliFrame";

type QA = { q: string; a: string };

const FAQS: QA[] = [
  {
    q: "What is this survey for?",
    a: "We are collecting real problems faced in Pakistan (tech access, healthcare basics, Gen Z needs) to build small, practical AI tools that actually help daily life.",
  },
  {
    q: "Who can participate?",
    a: "Anyone living in Pakistan: villages, towns, and cities. Youth, elders, students, parents, and workers—everyone is welcome.",
  },
  {
    q: "How is my data used?",
    a: "Responses are stored without public identity, used to understand needs and design solutions. We never sell data.",
  },
  {
    q: "How long will it take?",
    a: "About 3–5 minutes. You can skip non-relevant questions and use the AI assistant for help.",
  },
  {
    q: "Do I need English?",
    a: "No. You can answer in Urdu, Roman Urdu, or English. The assistant can refine your words in your preferred style.",
  },
  {
    q: "Does the AI read my answers?",
    a: "Only if you press the Enhance button or ask the assistant. It improves clarity (no extra facts) and can give a short version.",
  },
  {
    q: "What happens after I submit?",
    a: "We analyze patterns (e.g., screen-time issues, job-skill needs) and publish small tools and guides, many free to use.",
  },
  {
    q: "How can I get updates?",
    a: "Return to this site soon—we’ll add a newsletter/WhatsApp updates option.",
  },
];

export default function FaqSection() {
  return (
    <GhibliFrame title="FAQs">
      <div className="space-y-3">
        {FAQS.map(({ q, a }, idx) => (
          <details key={idx} className="group rounded-xl border border-white/10 bg-black/10 p-3 open:bg-black/20">
            <summary className="cursor-pointer list-none select-none flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-white/90">{q}</span>
              <span className="text-white/60 group-open:rotate-45 transition-transform">+</span>
            </summary>
            <div className="mt-2 text-sm text-white/75 leading-relaxed">{a}</div>
          </details>
        ))}
      </div>
    </GhibliFrame>
  );
}


