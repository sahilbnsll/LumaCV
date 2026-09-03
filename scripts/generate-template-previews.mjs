import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Import DEMO_RESUME_DATA
const demoData = {
    personalInfo: {
        name: 'Alex Morgan',
        title: 'Staff Full Stack Engineer',
        email: 'alex.morgan@example.com',
        phone: '+1 (415) 890-2341',
        location: 'San Francisco, CA',
        linkedin: 'linkedin.com/in/alexmorgan',
        github: 'github.com/alexmorgan',
        portfolio: 'https://alexmorgan.dev',
    },
    summary: 'Staff Full Stack Engineer with 8+ years of experience designing, scaling, and maintaining distributed web applications and cloud infrastructure. Proven track record leading core platform migrations, reducing p99 latency by 38%, and mentoring engineering teams.',
    skills: [
        { category: 'Languages & Core', items: 'TypeScript, JavaScript (ESNext), Python, Go, SQL, HTML5/CSS3' },
        { category: 'Frontend Architecture', items: 'React 19, Next.js 14/15, Tailwind CSS, Redux Toolkit, WebSockets, a11y' },
        { category: 'Backend & Cloud', items: 'Node.js, Express, PostgreSQL, Redis, Docker, Kubernetes, AWS, GraphQL' },
        { category: 'DevOps & Tooling', items: 'CI/CD (GitHub Actions), Terraform, Jest/Playwright, Prometheus/Grafana, Kafka' }
    ],
    experience: [
        {
            role: 'Staff Full Stack Engineer',
            company: 'Vercel Inc.',
            location: 'San Francisco, CA',
            dates: '2022 – Present',
            bullets: [
                'Architected edge data delivery layer using Next.js App Router and TypeScript, reducing p99 API response latencies by 38% for 4M+ daily active sessions.',
                'Led frontend performance task force cutting total JavaScript bundle sizes across flagship web console by 310KB and improving Core Web Vitals to 99+.',
                'Spearheaded migration of legacy monolith billing workflows to event-driven microservices processing over $120M in annualized payments.',
                'Mentored 8 senior and mid-level engineers across product teams, driving architectural RFC review processes and design system standards.'
            ]
        },
        {
            role: 'Senior Software Engineer',
            company: 'Cloudflare',
            location: 'San Francisco, CA',
            dates: '2019 – 2022',
            bullets: [
                'Engineered high-throughput caching and proxy orchestration services handling 180k+ requests/sec with a 99.99% uptime availability SLA.',
                'Designed intuitive real-time security dashboard using React, WebSockets, and Canvas API utilized by 50,000+ enterprise customers.',
                'Decreased continuous integration build and deployment pipeline execution times by 52% via parallel test runners and artifact caching.'
            ]
        },
        {
            role: 'Full Stack Engineer',
            company: 'Stripe',
            location: 'Seattle, WA',
            dates: '2017 – 2019',
            bullets: [
                'Built developer dashboard components and payment onboarding workflows with React, TypeScript, and internal design tokens.',
                'Collaborated with compliance and fraud teams to implement automated risk verification reducing chargeback incident rates by 18%.'
            ]
        }
    ],
    education: [
        {
            degree: 'Bachelor of Science in Computer Science',
            specialization: 'Software Engineering & Distributed Systems',
            institution: 'University of Washington',
            dates: '2013 – 2017',
            gpa: '3.89 / 4.0'
        }
    ],
    projects: [
        {
            name: 'VectorPulse — Real-Time Analytics Engine',
            stack: 'Go, TypeScript, Redis',
            description: 'Open-source time-series streaming engine built with Go, TypeScript, and Redis pub/sub. Starred by 2.4k+ developers on GitHub.',
            url: 'https://github.com/alexmorgan/vectorpulse'
        },
        {
            name: 'React FastVirtual — Virtualization Hook',
            stack: 'React, TypeScript',
            description: 'Ultra-lightweight windowing library for rendering 100,000+ tabular records at consistent 60 FPS.',
            url: 'https://github.com/alexmorgan/react-fastvirtual'
        }
    ],
    certifications: [
        {
            name: 'AWS Certified Solutions Architect – Professional',
            issuer: 'Amazon Web Services',
            date: '2023',
            url: ''
        }
    ],
    awards: [],
    customSections: []
};

const typstData = {
    personal: {
        name: demoData.personalInfo.name,
        headline: demoData.personalInfo.title,
        contact: {
            phone: demoData.personalInfo.phone,
            email: demoData.personalInfo.email,
            linkedin: demoData.personalInfo.linkedin,
            github: demoData.personalInfo.github,
            website: demoData.personalInfo.portfolio,
            location: demoData.personalInfo.location
        }
    },
    summary: demoData.summary,
    skills: demoData.skills,
    experience: demoData.experience,
    education: demoData.education,
    projects: demoData.projects,
    certifications: demoData.certifications,
    awards: demoData.awards,
    customSections: demoData.customSections
};

const templates = [
    { id: 'modern', file: 'modern.typ', fn: 'render-modern', theme: 'modern' },
    { id: 'classic', file: 'classic.typ', fn: 'render-classic', theme: 'classic' },
    { id: 'engineering', file: 'engineering.typ', fn: 'render-engineering', theme: 'engineering' },
    { id: 'compact', file: 'compact.typ', fn: 'render-compact', theme: 'compact' },
    { id: 'two_column', file: 'two_column.typ', fn: 'render-two-column', theme: 'two-column' },
    { id: 'ats_safe', file: 'ats_safe.typ', fn: 'render-ats-safe', theme: 'ats-safe' }
];

async function run() {
    const outDir = path.join(rootDir, 'public', 'templates');
    await fs.mkdir(outDir, { recursive: true });

    const typstBin = path.join(rootDir, 'bin', 'typst.exe');
    const typstRoot = path.join(rootDir, 'typst');

    console.log(`Compiling 6 template previews using ${typstBin}...`);

    for (const t of templates) {
        const typstCode = `
#import "/templates/${t.file}": ${t.fn}

#let data = json(bytes(\`\`\`json
${JSON.stringify(typstData, null, 2)}
\`\`\`.text))

#${t.fn}(data, theme: "${t.theme}")
`;

        const outPng = path.join(outDir, `${t.id}.png`);

        const args = [
            'compile',
            '--root', typstRoot,
            '--font-path', 'C:\\Windows\\Fonts',
            '-f', 'png',
            '--pages', '1',
            '--ppi', '144',
            '-',
            outPng
        ];

        await new Promise((resolve, reject) => {
            const child = spawn(typstBin, args);
            let stderr = '';
            child.stderr.on('data', chunk => { stderr += chunk; });
            child.on('close', code => {
                if (code === 0) {
                    console.log(`✓ Generated ${t.id}.png`);
                    resolve();
                } else {
                    console.error(`✗ Error on ${t.id}:`, stderr);
                    reject(new Error(stderr));
                }
            });
            child.stdin.write(typstCode);
            child.stdin.end();
        });
    }

    console.log('All 6 template previews generated successfully in public/templates/!');
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
