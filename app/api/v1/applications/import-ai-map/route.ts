import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { generateStream, collectStream, extractJsonObjectFromAssistantText } from "@/lib/llm-client";
import { extractUserApiKeys, hasCustomKeys } from "@/lib/ai-keys";
import { suggestColumnMapping } from "@/lib/application-import-parser";
import { jsonrepair } from "jsonrepair";
import { ratelimit } from "@/lib/rate-limit";
import { z } from "zod";

export const maxDuration = 45;

// headers/sampleRows were previously read raw from the body with only an
// Array.isArray check, unbounded array length or per-cell size fed straight
// into the LLM prompt below is a token-cost abuse vector even though this
// route is authenticated and rate-limited (rate limiting bounds request
// count, not per-request size). Only the first 3 sampleRows ever reach the
// prompt, but the caps here also stop an oversized body from being parsed
// into memory in the first place.
const ImportAiMapRequestSchema = z.object({
  headers: z.array(z.string().max(200)).max(150),
  sampleRows: z.array(z.record(z.string(), z.unknown())).max(50).optional().default([]),
});

export async function POST(req: NextRequest) {
  const contentLength = req.headers.get('content-length');
  if (contentLength && parseInt(contentLength, 10) > 2 * 1024 * 1024) {
    return NextResponse.json({ error: 'Payload too large. Maximum allowed size is 2MB.' }, { status: 413 });
  }

  const auth = await requireUser();
  if (auth.response) return auth.response;

  // Every other AI-calling route rate-limits; this one didn't, so a signed-in
  // user could spam LLM calls (cost abuse) with no throttle. Skip the limiter
  // only when the caller supplied their own BYOK key, same policy as tailor.
  if (!hasCustomKeys(extractUserApiKeys(req))) {
    const ip = req.ip ?? "127.0.0.1";
    const { success } = await ratelimit.limit(ip);
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later or configure your own AI key." },
        { status: 429 }
      );
    }
  }

  try {
    const body = await req.json();
    const validated = ImportAiMapRequestSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validated.error.format() },
        { status: 400 }
      );
    }
    const { headers, sampleRows } = validated.data;

    if (headers.length === 0) {
      return NextResponse.json(
        { error: "headers array is required" },
        { status: 400 }
      );
    }

    // Default heuristic mapping
    const heuristicMapping = suggestColumnMapping(headers);

    // Most real-world exports (LinkedIn, Notion, a plain "Company/Position/Status"
    // sheet) already resolve cleanly via alias matching alone. Only spend an AI
    // call when the heuristic couldn't confidently resolve the two fields that
    // actually matter for a usable import, skips the AI request entirely for
    // the common case instead of calling it unconditionally on every import.
    if (heuristicMapping.company && heuristicMapping.position) {
      return NextResponse.json({ mapping: heuristicMapping, source: "heuristic" });
    }

    const userKeys = extractUserApiKeys(req);

    const prompt = `You are a data ingestion specialist. You are given table headers and sample rows from a job application spreadsheet.
Map the provided spreadsheet column headers to standard job tracker fields:
- "company": Company or organization name (Required if available)
- "position": Job title, role, or position (Required if available)
- "location": Office location, city, state, or remote status
- "status": Application status/stage (applied, interview, offer, rejected, etc.)
- "appliedDate": Date applied or submission date
- "salary": Compensation, pay, package, or salary
- "url": Job posting link, application URL, or website
- "notes": Extra notes, comments, descriptions, or recruiter feedback

AVAILABLE HEADERS:
${JSON.stringify(headers, null, 2)}

SAMPLE DATA (first 2-3 rows):
${JSON.stringify(sampleRows.slice(0, 3), null, 2)}

OUTPUT FORMAT:
Return ONLY a valid JSON object matching this schema where the values are EXACT string matches of the provided headers (or empty string "" if no column matches):
{
  "company": "string",
  "position": "string",
  "location": "string",
  "status": "string",
  "appliedDate": "string",
  "salary": "string",
  "url": "string",
  "notes": "string"
}`;

    try {
      const { textStream } = await generateStream(prompt, undefined, "light", {
        maxTokens: 500,
        userKeys,
      });

      const raw = await collectStream(textStream);
      const jsonText = extractJsonObjectFromAssistantText(raw);
      let parsed: Record<string, string> = {};
      try {
        parsed = JSON.parse(jsonText);
      } catch {
        parsed = JSON.parse(jsonrepair(jsonText));
      }

      // Merge with heuristics to guarantee that non-empty headers are preserved
      const finalMapping: Record<string, string> = { ...heuristicMapping };
      for (const [k, v] of Object.entries(parsed)) {
        if (typeof v === "string" && headers.includes(v)) {
          finalMapping[k] = v;
        }
      }

      return NextResponse.json({ mapping: finalMapping, source: "ai" });
    } catch (aiErr) {
      console.warn("[ImportAIMap] AI mapping failed, using heuristic mapping:", aiErr);
      return NextResponse.json({ mapping: heuristicMapping, source: "heuristic" });
    }
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to map columns",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
