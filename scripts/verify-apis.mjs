import fs from 'fs';
import path from 'path';

// Read .env.local for test keys
let groqKey = '';
let geminiKey = '';
try {
    const envContent = fs.readFileSync(path.resolve('.env.local'), 'utf-8');
    for (const line of envContent.split('\n')) {
        if (line.startsWith('GROQ_API_KEY=')) groqKey = line.split('=')[1].trim();
        if (line.startsWith('GEMINI_API_KEY=')) geminiKey = line.split('=')[1].trim();
    }
} catch {}

async function testApis(baseUrl) {
    console.log(`\n======================================================`);
    console.log(`Testing API Endpoints on ${baseUrl}`);
    console.log(`======================================================`);

    // 1. Stats endpoint
    try {
        const statsRes = await fetch(`${baseUrl}/api/v1/stats`);
        const statsData = await statsRes.json();
        console.log(`✓ GET /api/v1/stats: ${statsRes.status} OK (engineVersion: ${statsData.engineVersion || statsData.activeTemplates + ' templates'})`);
    } catch (e) {
        console.error(`✗ GET /api/v1/stats:`, e.message);
    }

    // 2. Score endpoint (Edge runtime)
    try {
        const scoreRes = await fetch(`${baseUrl}/api/v1/resume/score`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                resumeText: 'Senior Full Stack Engineer with 8 years of experience in React, TypeScript, Go, and building high-performance web applications and scalable microservices.',
                jdKeywords: {
                    required_skills: ['React', 'TypeScript', 'Go'],
                    preferred_skills: ['Kubernetes'],
                    responsibilities: ['Build high-performance web applications and scalable microservices'],
                    buzzwords: ['scalable', 'high performance']
                }
            })
        });
        const scoreData = await scoreRes.json();
        console.log(`✓ POST /api/v1/resume/score: ${scoreRes.status} (score: ${scoreData.overallScore ?? scoreData.score} ATS, categoryScores: ${JSON.stringify(scoreData.categoryScores)})`);
    } catch (e) {
        console.error(`✗ POST /api/v1/resume/score:`, e.message);
    }

    // 3. JD Analysis endpoint with BYOK key
    try {
        const headers = { 'Content-Type': 'application/json' };
        if (groqKey) headers['x-groq-api-key'] = groqKey;
        if (geminiKey) headers['x-gemini-api-key'] = geminiKey;

        const jdRes = await fetch(`${baseUrl}/api/v1/resume/analyze-jd`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                jobDescription: 'Seeking Senior Full Stack Engineer with React, TypeScript, and Go experience.'
            })
        });
        const jdData = await jdRes.json();
        console.log(`✓ POST /api/v1/resume/analyze-jd: ${jdRes.status} (roleTitle: ${jdData.analysis?.roleTitle || (jdRes.status === 401 ? 'BYOK required' : 'ok')})`);
    } catch (e) {
        console.error(`✗ POST /api/v1/resume/analyze-jd:`, e.message);
    }

    // 4. JD analyze legacy alias
    try {
        const headers = { 'Content-Type': 'application/json' };
        if (groqKey) headers['x-groq-api-key'] = groqKey;
        if (geminiKey) headers['x-gemini-api-key'] = geminiKey;

        const jdLegacyRes = await fetch(`${baseUrl}/api/v1/jd/analyze`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                jobDescription: 'Seeking Senior Full Stack Engineer with React, TypeScript, and Go experience.'
            })
        });
        const jdLegacyData = await jdLegacyRes.json();
        console.log(`✓ POST /api/v1/jd/analyze: ${jdLegacyRes.status} (roleTitle: ${jdLegacyData.analysis?.roleTitle || (jdLegacyRes.status === 401 ? 'BYOK required' : 'ok')})`);
    } catch (e) {
        console.error(`✗ POST /api/v1/jd/analyze:`, e.message);
    }

    // 5. Auth / Resumes endpoint (checks 401 when unauthenticated)
    try {
        const authRes = await fetch(`${baseUrl}/api/v1/resumes`);
        console.log(`✓ GET /api/v1/resumes (unauthenticated check): ${authRes.status} (expected 401: ${authRes.status === 401})`);
    } catch (e) {
        console.error(`✗ GET /api/v1/resumes:`, e.message);
    }

    // 6. Feedback endpoint (validation check with 400 on empty message)
    try {
        const fbRes = await fetch(`${baseUrl}/api/v1/feedback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: '' })
        });
        console.log(`✓ POST /api/v1/feedback (empty message validation): ${fbRes.status} (expected 400: ${fbRes.status === 400})`);
    } catch (e) {
        console.error(`✗ POST /api/v1/feedback:`, e.message);
    }
}

async function run() {
    await testApis('http://localhost:3000');
    await testApis('https://lumacv.sahilbansal.net');
}

run();
