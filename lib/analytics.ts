/**
 * Privacy-conscious product analytics for LumaCV.
 * Measures workflow drop-offs, latency, and feature usage without logging any PII or resume text.
 */

export type AnalyticsEventType =
    | 'landing_viewed'
    | 'builder_started'
    | 'resume_uploaded'
    | 'jd_submitted'
    | 'tailoring_started'
    | 'tailoring_completed'
    | 'tailoring_failed'
    | 'review_reached'
    | 'step_changed'

    | 'template_selected'
    | 'theme_selected'
    | 'pdf_downloaded'
    | 'source_exported'
    | 'project_saved'
    | 'bullet_diff_toggled'
    | 'compile_error';

export interface AnalyticsEventPayload {
    event: AnalyticsEventType;
    properties?: Record<string, string | number | boolean | undefined>;
    timestamp?: string;
}

export function trackEvent(
    event: AnalyticsEventType,
    properties: Record<string, string | number | boolean | undefined> = {}
): void {
    if (typeof window === 'undefined') return;

    const payload: AnalyticsEventPayload = {
        event,
        properties: {
            ...properties,
            url: window.location.pathname,
            screenWidth: window.innerWidth,
        },
        timestamp: new Date().toISOString(),
    };

    // Log cleanly in development
    if (process.env.NODE_ENV !== 'production') {
        console.log(`[Telemetry] ${event}`, payload.properties);
    }

    // Persist event metrics locally for session stats
    try {
        const key = 'lumacv_analytics_events';
        const raw = sessionStorage.getItem(key);
        const events: AnalyticsEventPayload[] = raw ? JSON.parse(raw) : [];
        events.push(payload);
        // Retain last 50 events per session to stay light
        if (events.length > 50) events.shift();
        sessionStorage.setItem(key, JSON.stringify(events));
    } catch {
        // Silent failure for storage quota
    }
}
