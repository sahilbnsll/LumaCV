# LumaCV Production Deployment Guide

This guide covers deploying LumaCV to production across **Vercel**, **Docker**, and **Self-Hosted Linux (VPS)**.

---

## 1. Prerequisites & Environment Secrets

Before deploying, ensure you have provisioned:
1. A **Supabase** instance (Auth & Database tables from `supabase/schema.sql`).
2. Optional default platform API keys (Google Gemini, OpenAI, Claude, or Groq) for fallback usage.

### Required Environment Variables

```env
# Application Host URL
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Supabase Authentication & Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# AI Provider Fallbacks (Optional for public instances; users can provide BYOK in UI)
GEMINI_API_KEY=AIzaSy...
OPENAI_API_KEY=sk-proj-...
ANTHROPIC_API_KEY=sk-ant-...
GROQ_API_KEY=gsk_...

# Typst Engine Path (Optional: defaults to bundled bin/ or system PATH)
TYPST_BIN_PATH=/usr/local/bin/typst
```

---

## 2. Deploying to Vercel (Recommended)

LumaCV is optimized for Vercel deployment with Next.js 14 App Router:

### Step 1: Connect Repository
1. Import your GitHub repository into the [Vercel Dashboard](https://vercel.com/new).
2. Framework Preset: **Next.js**.
3. Root Directory: `./`.

### Step 2: Configure Build Settings
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### Step 3: Add Environment Variables
Add all variables from Section 1 in the Vercel Project Settings $\rightarrow$ Environment Variables.

### Step 4: Edge & Serverless Considerations
- API routes executing Typst compilations (`/api/v1/resume/compile`) run in Node.js Serverless Functions with bundled WASM or Linux binaries.
- The `middleware.ts` runs on the Edge Runtime with strict security headers.

---

## 3. Deploying with Docker

A production Dockerfile for containerized deployments on AWS ECS, Fly.io, Railway, or Google Cloud Run.

### `Dockerfile`
```dockerfile
FROM node:20-alpine AS base

# Install Typst native binary & dependencies
RUN apk add --no-cache libc6-compat curl bash
RUN curl -fsSL https://github.com/typst/typst/releases/download/v0.12.0/typst-x86_64-unknown-linux-musl.tar.gz | tar -xz -C /usr/local/bin --strip-components=1 typst-x86_64-unknown-linux-musl/typst

WORKDIR /app

# Dependencies stage
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# Builder stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# Runner stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/typst ./typst

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
```

---

## 4. Self-Hosted VPS (Ubuntu / Debian / Nginx)

### Step 1: Install Node.js & Typst
```bash
# Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git

# Typst compiler
curl -fsSL https://github.com/typst/typst/releases/download/v0.12.0/typst-x86_64-unknown-linux-musl.tar.gz | sudo tar -xz -C /usr/local/bin --strip-components=1 typst-x86_64-unknown-linux-musl/typst
typst --version
```

### Step 2: Clone & Build
```bash
git clone https://github.com/sahilbnsll/LumaCV.git /var/www/lumacv
cd /var/www/lumacv
npm install
cp .env.example .env.local
# Edit .env.local with your credentials
npm run build
```

### Step 3: Process Management with PM2
```bash
sudo npm install -g pm2
pm2 start npm --name "lumacv" -- start
pm2 save
pm2 startup
```

### Step 4: Nginx Reverse Proxy & SSL
```nginx
server {
    server_name lumacv.com www.lumacv.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
Obtain SSL via Let's Encrypt:
```bash
sudo certbot --nginx -d lumacv.com -d www.lumacv.com
```

---

## 5. Security & Verification Post-Deploy

1. **Verify HTTP Security Headers**:
   ```bash
   curl -I https://your-domain.com
   ```
   Ensure `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, and `Referrer-Policy: strict-origin-when-cross-origin` are present.
2. **Verify Sitemap & Robots**:
   - `https://your-domain.com/sitemap.xml`
   - `https://your-domain.com/robots.txt`
3. **Run Health Check**:
   ```bash
   curl -s https://your-domain.com/api/v1/stats
   ```
