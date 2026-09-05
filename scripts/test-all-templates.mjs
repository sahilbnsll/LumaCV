import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { ALL_TEMPLATES } from '../lib/templates-data.ts';

const bin = path.resolve('./bin/typst.exe');
const typstDir = path.resolve('./typst');
const outDir = path.resolve('./scratch/template-renders');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Realistic resume data with full sections
const sampleResumeData = {
  personal: {
    name: 'Alex Morgan',
    headline: 'Staff Full Stack Engineer',
    contact: {
      phone: '+1 (415) 890-2341',
      email: 'alex.morgan@example.com',
      linkedin: 'linkedin.com/in/alexmorgan',
      github: 'github.com/alexmorgan',
      website: 'alexmorgan.dev',
      location: 'San Francisco, CA'
    }
  },
  summary: 'Staff Full Stack Engineer with 8+ years of experience designing, scaling, and maintaining distributed web applications and cloud infrastructure. Proven track record leading core platform migrations, reducing p99 latency by 38%, and mentoring engineering teams.',
  skills: [
    { category: 'Languages & Core', items: 'TypeScript, JavaScript (ESNext), Python, Go, SQL, HTML5/CSS3', skills: ['TypeScript', 'JavaScript', 'Python', 'Go', 'SQL'] },
    { category: 'Frontend Architecture', items: 'React 19, Next.js 14/15, Tailwind CSS, Redux Toolkit, WebSockets, a11y', skills: ['React', 'Next.js', 'Tailwind CSS', 'WebSockets'] },
    { category: 'Backend & Cloud', items: 'Node.js, Express, PostgreSQL, Redis, Docker, Kubernetes, AWS, GraphQL', skills: ['Node.js', 'PostgreSQL', 'Redis', 'Docker', 'AWS'] },
    { category: 'DevOps & Tooling', items: 'CI/CD, Terraform, Jest/Playwright, Prometheus/Grafana, Kafka', skills: ['CI/CD', 'Terraform', 'Kafka'] }
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
      name: 'VectorPulse — Real-Time Streaming Analytics',
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
  awards: [
    {
      title: 'Top Contributor Award',
      awarder: 'Vercel Engineering',
      date: '2023',
      description: 'Awarded for exceptional contributions to edge streaming architecture.'
    }
  ],
  publications: [],
  languages: [
    { language: 'English', proficiency: 'Native / Bilingual' },
    { language: 'Spanish', proficiency: 'Professional Working' }
  ]
};

const dataJson = JSON.stringify(sampleResumeData);

async function testTemplate(template) {
  const pngPattern = path.join(outDir, `${template.id}-{n}.png`);
  // Clean old files
  for (const f of fs.readdirSync(outDir)) {
    if (f.startsWith(`${template.id}-`)) {
      try { fs.unlinkSync(path.join(outDir, f)); } catch {}
    }
  }

  const args = [
    'compile',
    '--root', typstDir,
    '--font-path', 'C:\\Windows\\Fonts',
    '--input', `data_json=${dataJson}`,
    '--input', `template=${template.id}`,
    '--ppi', '144',
    path.join(typstDir, 'main.typ'),
    pngPattern
  ];

  return new Promise((resolve) => {
    const proc = spawn(bin, args);
    let stderr = '';
    proc.stderr.on('data', d => { stderr += d.toString(); });
    proc.on('close', code => {
      const files = fs.readdirSync(outDir).filter(f => f.startsWith(`${template.id}-`) && f.endsWith('.png'));
      if (code === 0 && files.length > 0) {
        resolve({ id: template.id, name: template.name, ok: true, pages: files.length, files });
      } else {
        resolve({ id: template.id, name: template.name, ok: false, error: stderr.trim() });
      }
    });
  });
}

async function run() {
  console.log(`Auditing all ${ALL_TEMPLATES.length} templates with sample data...`);
  const results = [];
  for (const t of ALL_TEMPLATES) {
    const res = await testTemplate(t);
    const tag = res.ok ? `✓ [${res.pages} page${res.pages > 1 ? 's' : ''}]` : `✗ FAIL`;
    console.log(`${tag.padEnd(14)} ${t.id.padEnd(22)} (${t.name}) ${res.ok ? '' : res.error}`);
    results.push(res);
  }

  const failed = results.filter(r => !r.ok);
  console.log('\n----------------------------------------');
  console.log(`Audit Summary: ${results.length - failed.length}/${results.length} passed.`);
  if (failed.length > 0) {
    console.log(`Failed templates (${failed.length}):`, failed.map(f => f.id).join(', '));
  }
}

run();
