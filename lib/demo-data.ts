import { ResumeData, ResumeDataSchema } from './resume-schema';

export const DEMO_RESUME_DATA: ResumeData = ResumeDataSchema.parse({
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
        {
            category: 'Languages & Core',
            items: 'TypeScript, JavaScript (ESNext), Python, Go, SQL, HTML5/CSS3'
        },
        {
            category: 'Frontend Architecture',
            items: 'React 19, Next.js 14/15, Tailwind CSS, Redux Toolkit, WebSockets, Accessibility (a11y)'
        },
        {
            category: 'Backend & Cloud',
            items: 'Node.js, Express, PostgreSQL, Redis, Docker, Kubernetes, AWS (ECS, S3, RDS), GraphQL'
        },
        {
            category: 'DevOps & Tooling',
            items: 'CI/CD (GitHub Actions), Terraform, Jest/Playwright, Prometheus/Grafana, Kafka'
        }
    ],
    experience: [
        {
            title: 'Staff Full Stack Engineer',
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
            title: 'Senior Software Engineer',
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
            title: 'Full Stack Engineer',
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
            institution: 'University of Washington',
            degree: 'Bachelor of Science in Computer Science',
            fieldOfStudy: 'Software Engineering & Distributed Systems',
            dates: '2013 – 2017',
            gpa: '3.89 / 4.0'
        }
    ],
    projects: [
        {
            name: 'VectorPulse — Real-Time Analytics Engine',
            description: 'Open-source time-series streaming engine built with Go, TypeScript, and Redis pub/sub. Starred by 2.4k+ developers on GitHub.',
            link: 'https://github.com/alexmorgan/vectorpulse',
            bullets: [
                'Architected distributed event streaming engine processing 50k+ metrics/sec with sub-5ms Redis pub/sub throughput.'
            ]
        },
        {
            name: 'React FastVirtual — Virtualization Hook',
            description: 'Ultra-lightweight windowing library for rendering 100,000+ tabular records at consistent 60 FPS.',
            link: 'https://github.com/alexmorgan/react-fastvirtual',
            bullets: [
                'Zero-dependency DOM virtualization hook adopted by 300+ open-source React applications.'
            ]
        }
    ],
    certifications: [
        {
            name: 'AWS Certified Solutions Architect – Professional',
            issuer: 'Amazon Web Services',
            date: '2023'
        }
    ]
});

export const DEMO_SAMPLE_JD = `Role: Senior Full Stack Engineer
Company: Stripe
Location: San Francisco, CA / Remote

About the Role:
We are looking for a Senior Full Stack Engineer to build and scale global payment infrastructure, developer interfaces, and real-time transaction dashboards. You will work across the stack using TypeScript, React/Next.js, Node.js, and PostgreSQL to deliver mission-critical software.

Responsibilities:
• Architect, build, and maintain high-performance web applications using modern React, Next.js App Router, and TypeScript.
• Collaborate with product and design teams to craft intuitive, accessible, and responsive user interfaces.
• Build reliable, secure backend APIs and microservices handling millions of financial events per day.
• Optimize application performance, improving p95 latency and client-side rendering efficiency.
• Participate in design reviews, uphold engineering standards, and mentor junior engineers.

Requirements:
• 4+ years of professional full-stack software engineering experience.
• Strong proficiency in TypeScript, modern JavaScript, React, and CSS architecture.
• Experience building and maintaining scalable REST or GraphQL APIs.
• Solid foundation in SQL, relational databases (PostgreSQL), and data modeling.
• Demonstrated understanding of distributed systems, caching strategies (Redis), and cloud infrastructure (AWS/GCP).
• Excellent communication skills and a user-centric mindset.`;
