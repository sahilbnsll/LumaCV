import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { JobApplication, createApplicationInputSchema } from "@/lib/application-schema";

// `createApplicationInputSchema` already existed in lib/application-schema.ts
// but was never wired into this route, this POST handler was doing manual
// field defaults + a single `!company || !position` check instead of real
// validation. `id` and `contacts` are added here rather than in the shared
// schema since `id` is specific to this upsert endpoint (not part of the
// application's own shape) and `createApplicationInputSchema` predates the
// contacts field being added to the route.
const applicationUpsertSchema = createApplicationInputSchema.extend({
  id: z.string().min(1).optional(),
  contacts: z
    .array(
      z.object({
        name: z.string(),
        role: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        linkedin: z.string().optional(),
      })
    )
    .optional()
    .default([]),
});

function mapRowToApplication(row: any): JobApplication {
  return {
    id: row.id,
    userId: row.user_id,
    company: row.company,
    position: row.position,
    location: row.location || "",
    remoteType: row.remote_type || "unspecified",
    status: row.status || "applied",
    appliedDate: row.applied_date || row.created_at,
    deadline: row.deadline || undefined,
    salary: row.salary || "",
    url: row.url || "",
    jobDescription: row.job_description || "",
    notes: row.notes || "",
    contacts: row.contacts || [],
    resumeId: row.resume_id || "",
    tags: row.tags || [],
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

export async function GET() {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const user = auth.user!;

  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("user_applications")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      // The board/table views group and search this list entirely
      // client-side (kanban columns need the full set to render correctly),
      // so this is a safety cap against pathological row counts rather than
      // real pagination, 500 is comfortably above any realistic job search.
      .limit(500);

    if (error) {
      // Table may not exist yet in fresh Supabase environment
      console.warn("[ApplicationsAPI] Supabase select error (using local state fallback):", error.message);
      return NextResponse.json({ applications: [] });
    }

    const applications = (data || []).map(mapRowToApplication);
    return NextResponse.json({ applications });
  } catch (error) {
    console.warn("[ApplicationsAPI] Exception fetching applications:", error);
    return NextResponse.json({ applications: [] });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const user = auth.user!;

  try {
    const body = await req.json();
    const validated = applicationUpsertSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validated.error.format() },
        { status: 400 }
      );
    }

    const {
      id,
      company,
      position,
      location,
      remoteType,
      status,
      appliedDate,
      deadline,
      salary,
      url,
      jobDescription,
      notes,
      contacts,
      resumeId,
      tags,
    } = validated.data;

    const supabase = createSupabaseServerClient();
    const now = new Date().toISOString();

    // `id` is client-supplied (used for upserting an existing draft), so
    // without this check a signed-in user could pass another user's row id
    // and overwrite it (id is the upsert conflict target, not scoped to
    // user_id). Reject up front rather than trusting Supabase RLS alone to
    // catch a cross-user write.
    if (id) {
      const { data: existing } = await supabase
        .from("user_applications")
        .select("user_id")
        .eq("id", id)
        .maybeSingle();
      if (existing && existing.user_id !== user.id) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
    }

    const payload = {
      ...(id ? { id } : {}),
      user_id: user.id,
      company: company.trim(),
      position: position.trim(),
      location: location?.trim() || "",
      remote_type: remoteType,
      status,
      applied_date: appliedDate || now,
      deadline: deadline || null,
      salary: salary?.trim() || "",
      url: url?.trim() || "",
      job_description: jobDescription || "",
      notes: notes || "",
      contacts: contacts || [],
      resume_id: resumeId || null,
      tags: tags || [],
      updated_at: now,
    };

    const { data, error } = await supabase
      .from("user_applications")
      .upsert(payload)
      .select()
      .single();

    if (error) {
      console.warn("[ApplicationsAPI] Supabase upsert error:", error.message);
      // Construct fallback application response
      const fallbackApp: JobApplication = {
        id: id || `app_${Date.now()}`,
        userId: user.id,
        company: company.trim(),
        position: position.trim(),
        location: location?.trim() || "",
        remoteType,
        status,
        appliedDate: appliedDate || now,
        deadline,
        salary: salary?.trim() || "",
        url: url?.trim() || "",
        jobDescription,
        notes,
        contacts,
        resumeId,
        tags,
        createdAt: now,
        updatedAt: now,
      };
      return NextResponse.json({ application: fallbackApp });
    }

    return NextResponse.json({ application: mapRowToApplication(data) });
  } catch (error) {
    console.error("[ApplicationsAPI] POST error:", error);
    return NextResponse.json(
      { error: "Failed to save application" },
      { status: 500 }
    );
  }
}
