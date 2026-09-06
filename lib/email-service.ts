/**
 * Transactional Email & Feedback Notification Service.
 * Securely dispatches user feedback directly to the administrator.
 */

interface FeedbackEmailPayload {
    name?: string;
    email?: string;
    company?: string;
    rating?: number;
    type?: string;
    message: string;
    page?: string;
    userAgent?: string;
    timestamp?: string;
}

export async function sendFeedbackEmail(payload: FeedbackEmailPayload): Promise<{ success: boolean; delivered: boolean; error?: string }> {
    const recipient = process.env.FEEDBACK_NOTIFICATION_EMAIL || process.env.FEEDBACK_RECIPIENT_EMAIL || 'connect@sahilbansal.net';
    const sender = process.env.FEEDBACK_FROM_EMAIL || process.env.RESEND_FROM_EMAIL || 'LumaCV <connect@sahilbansal.net>';
    const timestamp = payload.timestamp || new Date().toISOString();
    const ratingStars = payload.rating ? '★'.repeat(payload.rating) + '☆'.repeat(5 - payload.rating) : 'N/A';

    const subject = `[LumaCV Feedback] ${payload.type?.toUpperCase() || 'GENERAL'} - from ${payload.name || 'Anonymous'}`;

    const textContent = `
LumaCV User Feedback Received
=============================
Date & Time: ${new Date(timestamp).toUTCString()}
Rating: ${payload.rating || 5}/5 (${ratingStars})
Category: ${payload.type || 'general'}
Page Context: ${payload.page || 'N/A'}

User Details:
-------------
Name: ${payload.name || 'Anonymous User'}
Email: ${payload.email || 'Not provided'}
Company: ${payload.company || 'Not provided'}
User Agent: ${payload.userAgent || 'Unknown'}

User Message:
-------------
${payload.message}

=============================
Sent automatically by LumaCV Platform
`.trim();

    const htmlContent = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b;">
    <div style="border-bottom: 2px solid #0071e3; padding-bottom: 12px; margin-bottom: 20px;">
        <h2 style="margin: 0; color: #0f172a; font-size: 20px;">🌟 New LumaCV Feedback</h2>
        <p style="margin: 4px 0 0 0; color: #64748b; font-size: 13px;">${new Date(timestamp).toUTCString()}</p>
    </div>

    <div style="background-color: #f8fafc; border-radius: 8px; padding: 16px; margin-bottom: 20px; border-left: 4px solid #0071e3;">
        <div style="font-size: 16px; font-weight: 600; color: #0f172a; margin-bottom: 4px;">
            Rating: <span style="color: #f59e0b;">${ratingStars}</span> (${payload.rating || 5}/5)
        </div>
        <div style="font-size: 13px; color: #64748b;">
            Type: <strong style="color: #334155;">${payload.type || 'general'}</strong> | Page: <strong style="color: #334155;">${payload.page || 'N/A'}</strong>
        </div>
    </div>

    <div style="margin-bottom: 20px;">
        <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 8px;">Feedback Message</h3>
        <div style="background-color: #f1f5f9; padding: 16px; border-radius: 8px; font-size: 15px; line-height: 1.6; color: #0f172a; white-space: pre-wrap;">${payload.message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
    </div>

    <div style="margin-bottom: 24px;">
        <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 8px;">Submitter Details</h3>
        <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
            <tr>
                <td style="padding: 6px 0; color: #64748b; width: 120px;">Name:</td>
                <td style="padding: 6px 0; font-weight: 500; color: #0f172a;">${payload.name || 'Anonymous User'}</td>
            </tr>
            <tr>
                <td style="padding: 6px 0; color: #64748b;">Email:</td>
                <td style="padding: 6px 0; font-weight: 500; color: #0f172a;">${payload.email ? `<a href="mailto:${payload.email}" style="color: #0071e3;">${payload.email}</a>` : 'Not provided'}</td>
            </tr>
            ${payload.company ? `<tr><td style="padding: 6px 0; color: #64748b;">Company:</td><td style="padding: 6px 0; font-weight: 500; color: #0f172a;">${payload.company}</td></tr>` : ''}
            <tr>
                <td style="padding: 6px 0; color: #64748b;">User Agent:</td>
                <td style="padding: 6px 0; color: #94a3b8; font-size: 11px; word-break: break-all;">${payload.userAgent || 'Unknown'}</td>
            </tr>
        </table>
    </div>

    <div style="border-top: 1px solid #e2e8f0; padding-top: 12px; text-align: center; font-size: 11px; color: #94a3b8;">
        Dispatched securely from LumaCV Platform Backend
    </div>
</div>
`.trim();

    // 1. Resend API Dispatch
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
        try {
            const res = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${resendKey}`,
                },
                body: JSON.stringify({
                    from: sender,
                    to: [recipient],
                    subject,
                    text: textContent,
                    html: htmlContent,
                    reply_to: payload.email || undefined,
                }),
            });

            if (res.ok) {
                console.log(`[feedback-email] Successfully sent feedback email to ${recipient} via Resend`);
                return { success: true, delivered: true };
            } else {
                const errData = await res.text();
                console.warn('[feedback-email] Resend API notice:', errData);

                // If unverified domain restriction (Resend sandbox only allows sending to account email)
                if (res.status === 403 && errData.includes('sahilbansal.sb24@gmail.com')) {
                    console.log('[feedback-email] Retrying dispatch to verified account email (sahilbansal.sb24@gmail.com)...');
                    const retryRes = await fetch('https://api.resend.com/emails', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${resendKey}`,
                        },
                        body: JSON.stringify({
                            from: process.env.FEEDBACK_FROM_EMAIL || 'LumaCV <onboarding@resend.dev>',
                            to: ['sahilbansal.sb24@gmail.com'],
                            subject: `[LumaCV Feedback - Pending Domain Verification] ${payload.type?.toUpperCase() || 'GENERAL'}`,
                            text: `[Delivered to sahilbansal.sb24@gmail.com because sahilbansal.net domain is pending verification at resend.com/domains]\n\nTarget Inbox: ${recipient}\n\n${textContent}`,
                            html: `<div style="background:#fef3c7;padding:10px;border-radius:6px;margin-bottom:15px;font-size:12px;color:#92400e;"><strong>Resend Testing Notice:</strong> Delivered to your registered account email because <code>sahilbansal.net</code> is pending DNS verification at <a href="https://resend.com/domains">resend.com/domains</a>. Once verified, emails will go to <code>connect@sahilbansal.net</code>.</div>${htmlContent}`,
                            reply_to: payload.email || undefined,
                        }),
                    });
                    if (retryRes.ok) {
                        console.log('[feedback-email] Successfully delivered feedback to sahilbansal.sb24@gmail.com via Resend fallback');
                        return { success: true, delivered: true };
                    }
                }
            }
        } catch (resendErr) {
            console.error('[feedback-email] Resend dispatch failed:', resendErr);
        }
    }

    // 2. Custom Webhook Dispatch (e.g. Zapier, Make, Slack, Discord)
    const webhookUrl = process.env.FEEDBACK_WEBHOOK_URL;
    if (webhookUrl) {
        try {
            const res = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: `**New LumaCV Feedback from ${payload.name || 'Anonymous'}** (${ratingStars}):\n> ${payload.message}`,
                    embeds: [{
                        title: subject,
                        description: payload.message,
                        fields: [
                            { name: 'Rating', value: `${payload.rating || 5}/5`, inline: true },
                            { name: 'Email', value: payload.email || 'None', inline: true },
                            { name: 'Page', value: payload.page || 'N/A', inline: true },
                        ],
                        timestamp,
                    }],
                    ...payload,
                }),
            });
            if (res.ok) {
                console.log('[feedback-email] Successfully delivered feedback to webhook');
                return { success: true, delivered: true };
            }
        } catch (webhookErr) {
            console.warn('[feedback-email] Webhook delivery notice:', webhookErr);
        }
    }

    // 3. Fallback log for development/preview environments
    console.log(`[feedback-email] Feedback logged (No email provider configured yet). Recipient: ${recipient}`);
    console.log(textContent);

    return {
        success: true,
        delivered: false,
        error: 'No transactional email provider (RESEND_API_KEY or FEEDBACK_WEBHOOK_URL) configured in environment.',
    };
}
