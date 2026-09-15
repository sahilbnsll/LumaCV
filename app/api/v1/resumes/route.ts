import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUser } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ResumeDataSchema, TemplateTypeSchema } from '@/lib/resume-schema';
import { sanitizeResumeData } from '@/lib/sanitize-resume-data';

// This route previously did no real validation beyond `!resumeData`, letting
// a malformed resumeData shape reach Supabase as an opaque JSON blob (only
// caught later, confusingly, wherever it's next read back out). Reuses the
// same ResumeDataSchema the AI routes already validate against.
const saveResumeSchema = z.object({
    id: z.string().min(1).optional(),
    title: z.string().min(1).optional().default('Untitled Resume'),
    templateId: TemplateTypeSchema.optional().default('modern'),
    resumeData: ResumeDataSchema,
    typstCode: z.string().optional(),
    atsScore: z.number().optional(),
    targetJobTitle: z.string().optional(),
    targetJobCompany: z.string().optional(),
});

export async function GET() {
    const auth = await requireUser();
    if (auth.response) return auth.response;
    const user = auth.user!;

    try {
        const supabase = createSupabaseServerClient();
        const { data, error } = await supabase
            .from('user_resumes')
            .select('*')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false })
            // No pagination UI exists for this list yet (the dashboard grid
            // renders and filters the whole set client-side), so this is a
            // safety cap against pathological row counts rather than real
            // pagination, 300 is comfortably above any realistic per-user count.
            .limit(300);

        if (error) throw error;
        return NextResponse.json({ resumes: data || [] });
    } catch (error) {
        console.error('[ResumesAPI] GET error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch resumes' },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    const auth = await requireUser();
    if (auth.response) return auth.response;
    const user = auth.user!;

    try {
        const body = await req.json();
        // Same reasoning as the compile route: sanitize resumeData before
        // validating it so a malformed field (an AI-tailored field that
        // ended up an array/object instead of a string) gets cleaned up
        // instead of failing this schema and silently dropping the save
        // (the autosave caller here only does a no-op .catch()).
        if (body && typeof body === 'object' && body.resumeData) {
            body.resumeData = sanitizeResumeData(body.resumeData);
        }
        const validated = saveResumeSchema.safeParse(body);
        if (!validated.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: validated.error.format() },
                { status: 400 }
            );
        }

        const {
            id,
            title,
            templateId,
            resumeData,
            typstCode,
            atsScore,
            targetJobTitle,
            targetJobCompany,
        } = validated.data;

        const supabase = createSupabaseServerClient();

        // `id` is client-supplied (used for upserting an existing draft), so
        // without this check a signed-in user could pass another user's
        // resume id and overwrite it (id is the upsert conflict target, not
        // scoped to user_id). Reject up front rather than trusting Supabase
        // RLS alone to catch a cross-user write.
        if (id) {
            const { data: existing } = await supabase
                .from('user_resumes')
                .select('user_id')
                .eq('id', id)
                .maybeSingle();
            if (existing && existing.user_id !== user.id) {
                return NextResponse.json({ error: 'Not found' }, { status: 404 });
            }
        }

        const payload = {
            ...(id ? { id } : {}),
            user_id: user.id,
            title,
            template_id: templateId,
            resume_data: resumeData,
            typst_code: typstCode,
            ats_score: typeof atsScore === 'number' && atsScore > 0 ? atsScore : null,
            target_job_title: targetJobTitle,
            target_job_company: targetJobCompany,
            updated_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
            .from('user_resumes')
            .upsert(payload)
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json({ resume: data });
    } catch (error) {
        console.error('[ResumesAPI] POST error:', error);
        return NextResponse.json(
            { error: 'Failed to save resume' },
            { status: 500 }
        );
    }
}
