export async function hashTextBrowser(input: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(digest))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
}

export async function hashTextServer(input: string): Promise<string> {
    const { createHash } = await import('crypto');
    return createHash('sha256').update(input, 'utf8').digest('hex');
}
