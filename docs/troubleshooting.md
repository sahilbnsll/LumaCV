# LumaCV Troubleshooting & Operational Guide

This document provides resolutions for common setup, deployment, and runtime issues encountered in LumaCV.

---

## 1. Typst Compiler & PDF Generation

### Issue: `spawn ./bin/typst ENOENT` or "Command failed: typst"
**Cause**: The native Typst compiler binary is either missing from the `bin/` directory or lacks executable permissions on Linux/macOS.

**Resolution**:
1. Run the automatic platform install script:
   ```bash
   node scripts/install-typst.mjs
   ```
2. Verify binary existence and permissions:
   - **Windows**: Verify `bin/typst.exe` exists.
   - **Linux / macOS**: Ensure execute permissions are set:
     ```bash
     chmod +x bin/typst
     ```
3. Check the binary version:
   ```bash
   ./bin/typst --version
   ```

### Issue: Vercel Serverless Function cannot locate `bin/` or `typst/`
**Cause**: Next.js tree-shaking may exclude external native binaries or template `.typ` files from the deployed serverless bundle.

**Resolution**:
Verify that `next.config.mjs` includes `outputFileTracingIncludes`:
```javascript
outputFileTracingIncludes: {
  '/api/**/*': ['./bin/**/*', './typst/**/*'],
},
```

### Issue: Edge Runtime errors in compile endpoints
**Cause**: The Typst compilation engine spawns child processes (`child_process.spawn`) which requires the Node.js runtime and cannot run in Edge Serverless Functions.

**Resolution**:
Ensure that `/api/v1/resume/compile` and any internal compile workers do **not** declare `export const runtime = 'edge'`. They must run in the standard Node.js runtime:
```typescript
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
```

---

## 2. Resend Email Service & User Feedback

### Issue: `403 Forbidden` error when submitting feedback
**Error Response**:
```json
{
  "statusCode": 403,
  "message": "You can only send testing emails to your own email address..."
}
```
**Cause**: Resend is operating in sandbox mode using the default `onboarding@resend.dev` sender address. In sandbox mode, Resend only permits delivery to the account owner's registration email.

**Resolution**:
1. Add and verify your custom domain (e.g. `sahilbansal.net`) in the [Resend Domains Dashboard](https://resend.com/domains).
2. Configure DNS records on your DNS provider (e.g. Cloudflare, Route 53):
   - **DKIM**: Add the `TXT` or `CNAME` records provided by Resend.
   - **SPF**: Add `v=spf1 include:amazonses.com ~all` (or Resend's recommended SPF record).
   - **DMARC**: Add `v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com`.
3. In `lib/email-service.ts`, ensure `from` is set to your verified domain (e.g., `LumaCV <connect@sahilbansal.net>`).
4. Set your production API key in `.env.local`:
   ```env
   RESEND_API_KEY=re_123456789...
   FEEDBACK_RECIPIENT_EMAIL=connect@sahilbansal.net
   ```

---

## 3. Supabase Authentication & Database

### Issue: `new row violates row-level security policy for table "user_resumes"`
**Cause**: Row Level Security (RLS) is enabled, but the active user session is either missing, expired, or the user's `auth.uid()` does not match the `user_id` column on the insert payload.

**Resolution**:
1. Confirm the user is authenticated prior to calling write endpoints.
2. In client-side components, use `supabase.auth.getUser()`:
   ```typescript
   const { data: { user } } = await supabase.auth.getUser();
   if (!user) throw new Error("Authentication required");
   ```
3. Verify RLS policy definition in `supabase/schema.sql`:
   ```sql
   create policy "Users can manage their own resumes"
     on public.user_resumes for all
     using (auth.uid() = user_id)
     with check (auth.uid() = user_id);
   ```

### Issue: `auth.users` profile record missing after signup
**Cause**: The database trigger syncing new auth registrations to `public.profiles` has not been executed.

**Resolution**:
Run Section 1 of [`supabase/schema.sql`](../supabase/schema.sql) in your Supabase SQL Editor to install the `on_auth_user_created` trigger.

---

## 4. Bring Your Own Key (BYOK) & AI Providers

### Issue: `401 Unauthorized` or `Invalid API Key`
**Cause**: The BYOK key supplied in the UI is invalid, expired, or lacking sufficient quota with the selected provider.

**Resolution**:
1. Test key validity directly via curl:
   ```bash
   # Gemini
   curl -H "Content-Type: application/json" -d "{\"contents\":[{\"parts\":[{\"text\":\"hi\"}]}]}" "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=YOUR_KEY"

   # OpenAI
   curl https://api.openai.com/v1/models -H "Authorization: Bearer YOUR_KEY"

   # Anthropic Claude
   curl https://api.anthropic.com/v1/messages -H "x-api-key: YOUR_KEY" -H "anthropic-version: 2023-06-01"
   ```
2. Clear and re-enter your key in the LumaCV settings modal. Keys are stored locally in `localStorage` under `lumacv_byok_keys`.

### Issue: Model Output Truncation or JSON Parse Errors
**Cause**: The requested resume has extensive experience bullets exceeding standard single-pass token output windows.

**Resolution**:
LumaCV automatically routes responses through `jsonrepair` before Zod schema validation. If parsing persists in failing, switch to a larger context model (e.g. `gemini-2.5-pro` or `gpt-4o`) via the model selector in settings.
