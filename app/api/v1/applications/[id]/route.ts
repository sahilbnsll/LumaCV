import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { updateApplicationInputSchema } from "@/lib/application-schema";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const user = auth.user!;
  const { id } = await params;

  try {
    const rawBody = await req.json();
    const validated = updateApplicationInputSchema.safeParse(rawBody);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validated.error.format() },
        { status: 400 }
      );
    }
    const body = validated.data;
    const supabase = createSupabaseServerClient();
    const now = new Date().toISOString();

    const dbUpdates: Record<string, any> = {
      updated_at: now,
    };

    if (body.company !== undefined) dbUpdates.company = body.company;
    if (body.position !== undefined) dbUpdates.position = body.position;
    if (body.location !== undefined) dbUpdates.location = body.location;
    if (body.remoteType !== undefined) dbUpdates.remote_type = body.remoteType;
    if (body.status !== undefined) dbUpdates.status = body.status;
    if (body.appliedDate !== undefined) dbUpdates.applied_date = body.appliedDate;
    if (body.deadline !== undefined) dbUpdates.deadline = body.deadline;
    if (body.salary !== undefined) dbUpdates.salary = body.salary;
    if (body.url !== undefined) dbUpdates.url = body.url;
    if (body.jobDescription !== undefined) dbUpdates.job_description = body.jobDescription;
    if (body.notes !== undefined) dbUpdates.notes = body.notes;
    if (body.contacts !== undefined) dbUpdates.contacts = body.contacts;
    if (body.resumeId !== undefined) dbUpdates.resume_id = body.resumeId || null;
    if (body.tags !== undefined) dbUpdates.tags = body.tags;

    const { data, error } = await supabase
      .from("user_applications")
      .update(dbUpdates)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .maybeSingle();

    if (error) {
      console.warn("[ApplicationsAPI] Supabase PATCH error:", error.message);
    }

    return NextResponse.json({ success: true, updated: data || dbUpdates });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to update application",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const user = auth.user!;
  const { id } = await params;

  try {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase
      .from("user_applications")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.warn("[ApplicationsAPI] Supabase DELETE error:", error.message);
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to delete application",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
