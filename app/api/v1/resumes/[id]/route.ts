import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(
    _req: NextRequest,
    { params }: { params: { id: string } }
) {
    const auth = await requireUser();
    if (auth.response) return auth.response;
    const user = auth.user!;

    try {
        const supabase = createSupabaseServerClient();
        const { data, error } = await supabase
            .from('user_resumes')
            .select('*')
            .eq('id', params.id)
            .eq('user_id', user.id)
            .single();

        if (error) throw error;
        if (!data) return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
        return NextResponse.json({ resume: data });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch resume', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    _req: NextRequest,
    { params }: { params: { id: string } }
) {
    const auth = await requireUser();
    if (auth.response) return auth.response;
    const user = auth.user!;

    try {
        const supabase = createSupabaseServerClient();
        const { error } = await supabase
            .from('user_resumes')
            .delete()
            .eq('id', params.id)
            .eq('user_id', user.id);

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to delete resume', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
