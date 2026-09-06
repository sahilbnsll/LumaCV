import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { sendFeedbackEmail } from '@/lib/email-service';

const FEEDBACK_FILE = path.join(process.cwd(), 'data', 'feedback.json');

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, email, company, rating, type, message, page } = body;

        if (!message || typeof message !== 'string' || !message.trim()) {
            return NextResponse.json({ error: 'Feedback message is required.' }, { status: 400 });
        }

        const userAgent = req.headers.get('user-agent') || 'Unknown';
        const referer = page || req.headers.get('referer') || '/';
        const timestamp = new Date().toISOString();

        const newFeedback = {
            id: `fb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            name: name?.trim() || 'Anonymous User',
            email: email?.trim() || '',
            company: company?.trim() || '',
            rating: typeof rating === 'number' ? Math.max(1, Math.min(5, rating)) : 5,
            type: type || 'general',
            message: message.trim(),
            page: referer,
            userAgent,
            createdAt: timestamp,
        };

        // 1. Try Supabase if configured
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (supabaseUrl && supabaseKey) {
            try {
                const supabase = createClient(supabaseUrl, supabaseKey);
                await supabase.from('feedback').insert({
                    name: newFeedback.name,
                    email: newFeedback.email,
                    company: newFeedback.company,
                    rating: newFeedback.rating,
                    type: newFeedback.type,
                    message: newFeedback.message,
                    created_at: newFeedback.createdAt,
                });
            } catch (dbErr) {
                console.warn('[feedback] Could not insert to Supabase feedback table:', dbErr);
            }
        }

        // 2. Local JSON backup
        try {
            const dir = path.dirname(FEEDBACK_FILE);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            let list: unknown[] = [];
            if (fs.existsSync(FEEDBACK_FILE)) {
                try {
                    list = JSON.parse(fs.readFileSync(FEEDBACK_FILE, 'utf8'));
                } catch {
                    list = [];
                }
            }
            list.unshift(newFeedback);
            fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(list, null, 2));
        } catch {
            // Ignore file write errors on serverless read-only filesystems
        }

        // 3. Dispatch Email Directly to Administrator
        const emailResult = await sendFeedbackEmail({
            name: newFeedback.name,
            email: newFeedback.email,
            company: newFeedback.company,
            rating: newFeedback.rating,
            type: newFeedback.type,
            message: newFeedback.message,
            page: newFeedback.page,
            userAgent: newFeedback.userAgent,
            timestamp: newFeedback.createdAt,
        }).catch((emailErr) => {
            console.error('[feedback] Failed email delivery:', emailErr);
            return { success: false, delivered: false, error: String(emailErr) };
        });

        console.log(`[FEEDBACK] Logged feedback from ${newFeedback.name} (${newFeedback.type}): ${newFeedback.message}`);

        return NextResponse.json({
            success: true,
            delivered: emailResult.delivered,
            message: 'Thank you! Your feedback has been received.',
        });
    } catch (err: unknown) {
        console.error('Feedback submission error:', err);
        return NextResponse.json(
            { error: 'Failed to process feedback.' },
            { status: 500 }
        );
    }
}
