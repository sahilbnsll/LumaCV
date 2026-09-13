import { ResumeData, ResumeDataSchema } from './resume-schema';

// Shared demo/golden resume — used by the Dashboard demo account, ATS Checker
// sample, /demo page, and the Editor's "start from example" entry point, and
// by the template QA scripts (scripts/audit-all-templates.mjs and friends).
// Populates every schema field so template QA exercises the full layout, but
// the content itself is written as a natural, realistic senior engineer's
// resume — not an exaggerated "does everything" persona.
export const DEMO_RESUME_DATA: ResumeData = ResumeDataSchema.parse({
    personalInfo: {
        name: 'Alex Morgan',
        title: 'Senior Platform Engineer',
        tagline: 'Cloud infrastructure, Kubernetes platforms, and developer tooling',
        location: 'Bengaluru, India',
        phone: '+91 98765 43210',
        email: 'alex@example.com',
        linkedin: 'linkedin.com/in/alex',
        github: 'github.com/alexm',
        portfolio: 'https://alexmorgan.dev',
    },
    summary: 'Platform engineer with 8+ years building and operating cloud infrastructure at scale. Focused on Kubernetes platforms, developer experience, and making deployments boring — reliable, observable, and fast to roll back. Comfortable owning a system from design through on-call.',
    techStackSummary: 'AWS, Kubernetes, Terraform, Python, Go, Argo CD, GitHub Actions, Prometheus, Grafana',
    skills: [
        { category: 'Cloud & Infra', items: 'AWS (EKS, RDS, S3, CloudFront), Terraform, VPC, IAM' },
        { category: 'Containers & Orchestration', items: 'Kubernetes, Helm, Docker, Argo CD' },
        { category: 'CI/CD & Delivery', items: 'GitHub Actions, GitLab CI, Jenkins, Argo Rollouts' },
        { category: 'Observability', items: 'Prometheus, Grafana, OpenTelemetry, Loki' },
        { category: 'Languages & Scripting', items: 'Python, Go, Bash, SQL' },
        { category: 'Databases & Messaging', items: 'PostgreSQL, Redis, Kafka' },
    ],
    keyMetrics: [
        { label: 'Deployment lead time', value: '52% faster', context: 'After moving to trunk-based CI/CD with automated rollback' },
        { label: 'Platform uptime', value: '99.95%', context: 'Across 40+ production services over 12 months' },
        { label: 'Infra cost', value: '30% reduction', context: 'Right-sizing EKS node pools and adopting spot capacity' },
        { label: 'On-call load', value: 'Halved', context: 'After introducing SLO-based alerting and runbook automation' },
    ],
    experience: [
        {
            id: 'exp-1',
            title: 'Senior Platform Engineer',
            company: 'Nebula Systems',
            location: 'Bengaluru, India',
            dates: 'Jan 2023 – Present',
            technologies: 'AWS, Kubernetes, Terraform, Argo CD, Prometheus',
            bullets: [
                'Redesigned the EKS platform around reusable Terraform modules, cutting new-environment bootstrap time from days to under an hour.',
                'Built GitOps delivery with Argo CD and progressive rollouts, cutting failed-deploy incidents by 38%.',
                'Introduced OpenTelemetry tracing and Prometheus/Grafana dashboards across 40+ services, giving on-call engineers a single place to diagnose incidents.',
                'Led migration of stateful workloads to EKS with zero customer-facing downtime.',
            ],
        },
        {
            id: 'exp-2',
            title: 'DevOps Engineer',
            company: 'Northstar Cloud',
            location: 'Pune, India',
            dates: 'Jul 2020 – Dec 2022',
            technologies: 'AWS, Terraform, Jenkins, Ansible',
            bullets: [
                'Migrated legacy on-prem workloads to AWS with Terraform, including automated account provisioning for new teams.',
                'Built CI/CD pipelines with policy checks, artifact promotion, and automated rollback paths, reducing median deployment lead time by 52%.',
                'Wrote the incident runbook library and on-call onboarding docs still used by the team today.',
            ],
        },
        {
            id: 'exp-3',
            title: 'Software Engineer',
            company: 'Orbit Labs',
            location: 'Hyderabad, India',
            dates: 'Jul 2018 – Jun 2020',
            technologies: 'Python, Linux, Bash',
            bullets: [
                'Built internal automation tooling in Python that replaced a set of manual weekly ops tasks.',
                'Improved Linux service reliability through structured logging and health checks, cutting mean time to diagnosis for common failures.',
            ],
        },
    ],
    internships: [
        {
            id: 'intern-1',
            title: 'Systems Engineering Intern',
            company: 'Orbit Labs',
            location: 'Hyderabad, India',
            dates: 'Jan 2018 – Jun 2018',
            bullets: [
                'Wrote monitoring scripts to catch disk and memory pressure before they caused incidents.',
            ],
        },
    ],
    education: [
        {
            id: 'edu-1',
            institution: 'National Institute of Technology',
            degree: 'B.Tech in Computer Science',
            location: 'India',
            dates: '2014 – 2018',
            gpa: '8.4 / 10',
            coursework: 'Operating Systems, Computer Networks, Distributed Systems',
        },
    ],
    projects: [
        {
            id: 'proj-1',
            name: 'LumaCV Platform',
            techStack: 'Typst, AI, AWS',
            description: 'Resume generation platform that parses resumes and job descriptions, then tailors content against a target role.',
            link: 'https://github.com/alexm/lumacv-platform',
            role: 'Contributor',
            dates: '2024 – Present',
            bullets: [
                'Built the AI provider failover layer so a single request tries several models in order until one succeeds.',
            ],
        },
        {
            id: 'proj-2',
            name: 'Platform Golden Path',
            techStack: 'EKS, Terraform, Argo CD',
            description: 'Reusable platform foundation template with observability and security guardrails built in, adopted by four product teams.',
            link: 'https://github.com/alexm/golden-path',
            role: 'Author',
            dates: '2023',
            bullets: [
                'Cut new-service setup time from two weeks to a single afternoon.',
            ],
        },
    ],
    certifications: [
        {
            id: 'cert-1',
            name: 'AWS Certified DevOps Engineer – Professional',
            issuer: 'Amazon Web Services',
            date: '2023',
            link: 'https://aws.amazon.com/verification',
        },
        {
            id: 'cert-2',
            name: 'Certified Kubernetes Administrator (CKA)',
            issuer: 'Linux Foundation / CNCF',
            date: '2022',
            link: 'https://cncf.io/verify',
        },
    ],
    achievements: [
        {
            id: 'ach-1',
            name: 'Internal Engineering Excellence Award',
            context: 'Nebula Systems',
            date: '2024',
            description: 'Recognized for leading the EKS platform migration with zero customer-facing incidents.',
        },
    ],
    publications: [
        {
            title: 'Cutting Deployment Lead Time with GitOps',
            platform: 'Company Engineering Blog',
            date: '2023',
            authors: 'Alex Morgan',
            link: 'https://example.com/blog/gitops-deployment-lead-time',
        },
    ],
    languages: [
        { language: 'English', proficiency: 'Professional working' },
        { language: 'Hindi', proficiency: 'Native' },
    ],
    openSource: [
        {
            project: 'Argo CD',
            contribution: 'Occasional contributor',
            dates: '2022 – Present',
            impact: 'Fixed a handful of docs and small bugs encountered while running Argo CD in production.',
            link: 'https://github.com/argoproj/argo-cd',
            bullets: ['Contributed documentation fixes and minor bug reports.'],
        },
    ],
    leadership: [
        {
            role: 'Platform Guild Lead',
            organization: 'Nebula Systems',
            location: 'Bengaluru, India',
            dates: '2023 – Present',
            bullets: ['Runs a monthly cross-team sync on infrastructure standards and shared tooling.'],
        },
    ],
    volunteering: [
        {
            role: 'Mentor',
            organization: 'Local DevOps meetup',
            location: 'Bengaluru, India',
            dates: '2022 – Present',
            bullets: ['Mentors early-career engineers on Kubernetes and CI/CD fundamentals.'],
        },
    ],
    conferences: [
        {
            name: 'KubeCon + CloudNativeCon India',
            topic: 'GitOps in practice: lessons from a platform migration',
            role: 'Speaker',
            date: '2024',
            location: 'Bengaluru, India',
            description: 'Talk on the practical tradeoffs of moving a mid-size platform to Argo CD.',
            link: 'https://kubecon.io',
        },
    ],
    interests: [
        { name: 'Trail running', details: 'Weekend long runs in the Western Ghats' },
        { name: 'Home automation', details: 'Self-hosted Kubernetes cluster on a Raspberry Pi rack' },
    ],
    customSections: [
        {
            title: 'Additional Information',
            items: [
                'Comfortable presenting to both engineering and non-technical stakeholders.',
                'Open to relocation for the right role.',
            ],
        },
    ],
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
