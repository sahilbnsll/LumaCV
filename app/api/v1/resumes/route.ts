import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';

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
            .order('updated_at', { ascending: false });

        if (error) throw error;
        return NextResponse.json({ resumes: data || [] });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch resumes', details: error instanceof Error ? error.message : 'Unknown error' },
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
        const {
            id,
            title = 'Untitled Resume',
            templateId = 'modern',
            resumeData,
            typstCode,
            atsScore = 0,
            targetJobTitle,
            targetJobCompany,
        } = body;

        if (!resumeData) {
            return NextResponse.json({ error: 'resumeData is required' }, { status: 400 });
        }

        const supabase = createSupabaseServerClient();
        const payload = {
            ...(id ? { id } : {}),
            user_id: user.id,
            title,
            template_id: templateId,
            resume_data: resumeData,
            typst_code: typstCode,
            ats_score: atsScore,
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
        return NextResponse.json(
            { error: 'Failed to save resume', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
