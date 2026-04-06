# Vercel Free Architecture

This project runs on Vercel Free, so PDF generation must be designed around:

- short serverless execution windows
- cold starts
- stateless functions
- external LaTeX compilation
- aggressive dedupe and caching

## Recommended flow

```text
Frontend
  -> API validate + generate LaTeX + hash content
  -> cache lookup by content hash
      -> hit: return signed PDF URL or cached metadata
      -> miss: enqueue async compile job
          -> worker tries compiler providers with retries
          -> store PDF in object storage
          -> return job id immediately
Frontend polls job status
  -> receives signed URL
  -> renders cached PDF through CDN
```

## What should stay synchronous

- resume parse request validation
- JD analysis request validation
- LaTeX generation from structured JSON
- cache lookup

## What should move out of synchronous request path

- PDF compilation
- multi-provider retry loops once traffic grows
- PDF storage and distribution

## Storage recommendation

- object storage: Supabase Storage, S3, or Vercel Blob
- key pattern: `pdf/{sha256(latex)}.pdf`
- signed URL TTL: 15 to 60 minutes
- CDN cache: 1 hour to 24 hours depending on update expectations

## Queue recommendation

Use a lightweight queue provider compatible with serverless triggers:

- Upstash QStash
- Inngest
- Trigger.dev

## Compile job payload

```json
{
  "compileHash": "sha256-of-latex",
  "latexCode": "documentclass ...",
  "template": "modern",
  "requestedAt": "2026-04-06T00:00:00.000Z"
}
```

## Job status shape

```json
{
  "status": "queued | compiling | complete | failed",
  "compileHash": "sha256...",
  "provider": "latex.ytotech.com (pdflatex)",
  "attempts": 4,
  "signedUrl": "https://...",
  "error": null
}
```

## Why this architecture fits Vercel Free

- no long blocking compile call in the critical page render path
- compile retries happen outside the user-facing request
- content hashing prevents recompiling identical LaTeX
- CDN-served PDFs reduce repeated serverless invocations

## Near-term fallback without queue infra

Until a queue is added:

- keep compile retries bounded
- dedupe by content hash on the client
- surface retry state clearly in the UI
- return provider metadata for debugging

That is an acceptable bridge, but not the final production architecture.
