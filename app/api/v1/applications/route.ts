import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { JobApplication } from "@/lib/application-schema";

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
      .order("updated_at", { ascending: false });

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
    const {
      id,
      company,
      position,
      location = "",
      remoteType = "unspecified",
      status = "applied",
      appliedDate,
      deadline,
      salary = "",
      url = "",
      jobDescription = "",
      notes = "",
      contacts = [],
      resumeId = "",
      tags = [],
    } = body;

    if (!company || !position) {
      return NextResponse.json(
        { error: "company and position are required fields" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServerClient();
    const now = new Date().toISOString();

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
    return NextResponse.json(
      {
        error: "Failed to save application",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
