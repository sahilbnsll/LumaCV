import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
    ArrowRight,
    BarChart3,
    Shield,
    Zap,
    CheckCircle2,
    Github,
    Linkedin,
    Mail,
    ExternalLink,
    Sparkles,
    Layers,
} from 'lucide-react';

const steps = [
    {
        n: '01',
        title: 'Upload resume',
        desc: 'Drop your PDF. We extract structure and text on your device—nothing stored server-side.',
    },
    {
        n: '02',
        title: 'Add the job description',
        desc: 'Paste the JD. We pull required skills, responsibilities, and language the ATS expects.',
    },
    {
        n: '03',
        title: 'Tailor with AI',
        desc: 'Bullets and skills are rewritten to mirror the role—without inventing experience.',
    },
    {
        n: '04',
        title: 'Preview & export',
        desc: 'Eight LaTeX templates, live PDF preview, and a clear before/after match score.',
    },
];

const features = [
    {
        icon: Layers,
        title: 'Template studio',
        desc: 'Modern, Classic, ATS, Executive, Minimal, Compact, Creative, and Tech—consistent typography and spacing.',
    },
    {
        icon: Zap,
        title: 'Multi-model AI',
        desc: 'Several frontier models with automatic failover so generation keeps working.',
    },
    {
        icon: BarChart3,
        title: 'Match transparency',
        desc: 'See which JD buckets moved your score and which keywords are still missing.',
    },
    {
        icon: Shield,
        title: 'Privacy-first flow',
        desc: 'No accounts required. Parsing runs in your browser; tailoring is ephemeral.',
    },
];

const socialLinks = [
    { icon: Linkedin, label: 'LinkedIn', href: 'https://www.linkedin.com/in/sahilbansal24/' },
    { icon: Github, label: 'GitHub', href: 'https://github.com/sahilbnsll' },
    { icon: Mail, label: 'Email', href: 'mailto:sahilbansal.sb24@gmail.com' },
];

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-background text-foreground antialiased">
            <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md">
                <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
                    <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/80 bg-card">
                            <Sparkles className="h-4 w-4 text-primary" />
                        </span>
                        LumaCV
                    </Link>
                    <nav className="flex items-center gap-6">
                        <Link
                            className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline"
                            href="#product"
                        >
                            Product
                        </Link>
                        <Link
                            className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline"
                            href="#workflow"
                        >
                            Workflow
                        </Link>
                        <Link
                            className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline"
                            href="#about"
                        >
                            About
                        </Link>
                        <Button asChild size="sm" className="h-9 rounded-md px-4 text-sm font-medium shadow-none">
                            <Link href="/builder">Open builder</Link>
                        </Button>
                    </nav>
                </div>
            </header>

            <main>
                <section className="border-b border-border/60" id="product">
                    <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-28">
                        <div className="mx-auto max-w-2xl text-center">
                            <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                                Resume builder
                            </p>
                            <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl sm:leading-[1.1]">
                                A calm, precise way to align your resume with any role
                            </h1>
                            <p className="mx-auto mt-5 max-w-lg text-pretty text-base leading-relaxed text-muted-foreground">
                                Upload once, paste a job description, and get a tailored resume with ATS-aware
                                templates and an honest match breakdown—similar in spirit to polished tools like{' '}
                                <a
                                    href="https://rxresu.me/"
                                    className="underline decoration-border underline-offset-4 hover:text-foreground"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Reactive Resume
                                </a>
                                , focused on clarity and control.
                            </p>
                            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                                <Button asChild size="lg" className="h-11 min-w-[200px] rounded-md px-8 text-base font-medium">
                                    <Link href="/builder">
                                        Start for free
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                                <p className="text-xs text-muted-foreground">No sign-up · LaTeX-quality PDFs</p>
                            </div>
                        </div>

                        <div className="mx-auto mt-16 grid max-w-3xl gap-3 sm:grid-cols-3">
                            {[
                                { k: 'Templates', v: '8' },
                                { k: 'AI models', v: '4+' },
                                { k: 'Your data', v: 'Ephemeral' },
                            ].map((s) => (
                                <div
                                    key={s.k}
                                    className="rounded-xl border border-border/70 bg-card/50 px-4 py-4 text-center"
                                >
                                    <div className="text-2xl font-semibold tabular-nums">{s.v}</div>
                                    <div className="text-xs font-medium text-muted-foreground">{s.k}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="border-b border-border/60 bg-muted/25" id="workflow">
                    <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-24">
                        <div className="mb-12 max-w-xl">
                            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">How it works</h2>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                A linear flow from file to PDF—each step has a single job.
                            </p>
                        </div>
                        <div className="grid gap-6 md:grid-cols-2">
                            {steps.map((step) => (
                                <div
                                    key={step.n}
                                    className="group flex gap-4 rounded-xl border border-border/70 bg-background p-6 transition-colors hover:border-border"
                                >
                                    <span className="font-mono text-xs font-medium text-muted-foreground tabular-nums">
                                        {step.n}
                                    </span>
                                    <div>
                                        <h3 className="font-medium">{step.title}</h3>
                                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="border-b border-border/60">
                    <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-24">
                        <div className="mb-12 max-w-xl">
                            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Built for serious applications</h2>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                Everything is tuned for legibility, ATS parsing, and a professional first impression.
                            </p>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            {features.map(({ icon: Icon, title, desc }) => (
                                <div
                                    key={title}
                                    className="flex gap-4 rounded-xl border border-border/70 bg-card/40 p-6"
                                >
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border/80 bg-background">
                                        <Icon className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium">{title}</h3>
                                        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="border-b border-border/60 bg-muted/20" id="about">
                    <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-24">
                        <div className="mb-10 max-w-xl">
                            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">About the creator</h2>
                            <p className="mt-2 text-sm text-muted-foreground">
                                LumaCV is an independent project—shipping quality over noise.
                            </p>
                        </div>

                        <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
                            <div className="grid gap-0 md:grid-cols-[minmax(0,280px)_1fr]">
                                <div className="relative aspect-[4/5] min-h-[280px] w-full bg-muted md:aspect-auto md:min-h-[360px]">
                                    <Image
                                        src="/sahil-profile.jpeg"
                                        alt="Sahil Bansal"
                                        fill
                                        className="object-cover object-top"
                                        sizes="(max-width: 768px) 100vw, 280px"
                                        priority
                                    />
                                </div>
                                <div className="flex flex-col justify-center p-8 sm:p-10 md:p-12">
                                    <h3 className="text-xl font-semibold tracking-tight">Sahil Bansal</h3>
                                    <p className="mt-1 text-sm font-medium text-muted-foreground">DevOps Engineer</p>
                                    <p className="mt-5 max-w-prose text-sm leading-relaxed text-muted-foreground">
                                        I build reliable cloud platforms and the tooling around them—automation,
                                        observability, and pragmatic delivery. LumaCV came from wanting a resume workflow
                                        that respects both recruiters&apos; parsers and candidates&apos; time.
                                    </p>
                                    <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                                        <li className="flex items-start gap-2">
                                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                            Cloud-native infrastructure &amp; CI/CD
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                            Shipping developer-facing products with care
                                        </li>
                                    </ul>
                                    <div className="mt-8 flex flex-wrap gap-2">
                                        {socialLinks.map(({ icon: Icon, label, href }) => (
                                            <Button key={label} variant="outline" size="sm" className="h-9 rounded-md" asChild>
                                                <a href={href} target="_blank" rel="noopener noreferrer">
                                                    <Icon className="mr-2 h-3.5 w-3.5" />
                                                    {label}
                                                    <ExternalLink className="ml-1.5 h-3 w-3 opacity-50" />
                                                </a>
                                            </Button>
                                        ))}
                                        <Button variant="outline" size="sm" className="h-9 rounded-md" asChild>
                                            <a
                                                href="https://sahilbansal.vercel.app/"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                Portfolio
                                                <ExternalLink className="ml-1.5 h-3 w-3 opacity-50" />
                                            </a>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="border-t border-border/60">
                <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-4 py-10 sm:flex-row sm:px-6">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>© 2026 LumaCV</span>
                    </div>
                    <nav className="flex flex-wrap items-center justify-center gap-6 text-xs">
                        <Link className="text-muted-foreground hover:text-foreground" href="/privacy">
                            Privacy
                        </Link>
                        <a
                            className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                            href="https://sahilbansal.vercel.app/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Creator site
                            <ExternalLink className="h-3 w-3 opacity-60" />
                        </a>
                    </nav>
                </div>
            </footer>
        </div>
    );
}
