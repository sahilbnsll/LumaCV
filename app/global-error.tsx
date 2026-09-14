"use client";

import { useEffect } from 'react';

// Next.js only renders app/error.tsx for errors thrown beneath the root
// layout. If app/layout.tsx itself throws (a font load failure, a provider
// crash during render), there was previously no fallback at all and users
// would hit Next's unstyled default error screen. global-error.tsx replaces
// the ENTIRE root layout when it activates, so it must ship its own
// <html>/<body> rather than relying on app/layout.tsx.
export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Unhandled Root Layout Error:', error);
    }, [error]);

    return (
        <html lang="en">
            <body style={{ margin: 0, background: '#0a0a0a', color: '#fafafa', fontFamily: 'system-ui, sans-serif' }}>
                <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center' }}>
                    <div style={{ maxWidth: '420px' }}>
                        <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#f43f5e', marginBottom: '8px' }}>
                            System Interruption
                        </p>
                        <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 8px' }}>
                            Something Went Wrong
                        </h1>
                        <p style={{ fontSize: '13px', color: '#a1a1aa', lineHeight: 1.6, margin: '0 0 24px' }}>
                            The application failed to load. This has been logged, please try again.
                        </p>
                        <button
                            onClick={() => reset()}
                            style={{
                                background: '#fafafa',
                                color: '#0a0a0a',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '10px 20px',
                                fontSize: '13px',
                                fontWeight: 500,
                                cursor: 'pointer',
                            }}
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}
