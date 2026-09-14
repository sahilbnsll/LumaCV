"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  GithubLogoIcon,
  LinkedinLogoIcon,
  XLogoIcon,
  DiscordLogoIcon,
  RedditLogoIcon,
  CoffeeIcon,
  GlobeSimpleIcon,
} from "@phosphor-icons/react";
import { LumaLogo } from "@/components/luma-logo";
import { SUPPORT_CONFIG } from "@/lib/support-config";

const githubUrl = "https://github.com/sahilbnsll/LumaCV";
const licenseUrl = `${githubUrl}/blob/master/LICENSE`;
const portfolioUrl = "https://sahilbansal.net/";

// Module-level cache so every page's footer mount shares one fetch instead
// of hitting GitHub's unauthenticated rate limit per navigation.
let cachedReleaseTag: string | null = null;
let releaseFetchPromise: Promise<string | null> | null = null;

function fetchLatestReleaseTag(): Promise<string | null> {
  if (cachedReleaseTag) return Promise.resolve(cachedReleaseTag);
  if (!releaseFetchPromise) {
    releaseFetchPromise = fetch("https://api.github.com/repos/sahilbnsll/LumaCV/releases/latest", {
      headers: { Accept: "application/vnd.github+json" },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const tag = typeof data?.tag_name === "string" ? data.tag_name : null;
        if (tag) cachedReleaseTag = tag;
        return tag;
      })
      .catch(() => null);
  }
  return releaseFetchPromise;
}

type FooterLink = {
  label: string;
  href: string;
  isExternal?: boolean;
};

type FooterColumn = {
  title: string;
  links: FooterLink[];
};

const COLUMNS: FooterColumn[] = [
  {
    title: "Product",
    links: [
      { label: "Live Demo", href: "/demo" },
      { label: "Templates", href: "/templates" },
      { label: "Resume Editor", href: "/editor" },
      { label: "ATS Checker", href: "/ats" },
      { label: "Optimize Resume", href: "/builder" },
      { label: "My Resumes", href: "/dashboard" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "/docs" },
      { label: "Changelog", href: `${githubUrl}/releases`, isExternal: true },
      { label: "Source Code", href: githubUrl, isExternal: true },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Contribute", href: `${githubUrl}/blob/master/CONTRIBUTING.md`, isExternal: true },
      { label: "GitHub Sponsors", href: SUPPORT_CONFIG.githubSponsors.url, isExternal: true },
      { label: "Report an issue", href: `${githubUrl}/issues`, isExternal: true },
      { label: "Billing & Support", href: "/billing" },
      { label: "Buy Me a Coffee", href: SUPPORT_CONFIG.buyMeACoffee.url, isExternal: true },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "MIT License", href: licenseUrl, isExternal: true },
    ],
  },
];

const SOCIAL_LINKS = [
  { url: portfolioUrl, label: "Portfolio", icon: GlobeSimpleIcon },
  { url: githubUrl, label: "GitHub", icon: GithubLogoIcon },
  { url: "https://x.com/sahilbansalll", label: "X", icon: XLogoIcon },
  { url: "https://linkedin.com/in/sahilbansal24", label: "LinkedIn", icon: LinkedinLogoIcon },
  { url: SUPPORT_CONFIG.buyMeACoffee.url, label: "Buy Me a Coffee", icon: CoffeeIcon },
  // Discord and Reddit icons ship with the icon set but stay unlisted here until
  // LumaCV has a real server/subreddit to link to, see DiscordLogoIcon/RedditLogoIcon.
];

void DiscordLogoIcon;
void RedditLogoIcon;

export function EditorialFooter() {
  const [releaseTag, setReleaseTag] = useState<string | null>(cachedReleaseTag);

  useEffect(() => {
    if (releaseTag) return;
    let cancelled = false;
    fetchLatestReleaseTag().then((tag) => {
      if (!cancelled && tag) setReleaseTag(tag);
    });
    return () => {
      cancelled = true;
    };
  }, [releaseTag]);

  // Cursor-following wordmark glow, mutates the glow layer's CSS vars
  // directly via ref instead of setState, so mousemove never re-renders the
  // footer (same rAF-throttle approach as interactive-watermark.tsx, minus
  // the state write). The glow itself is a second copy of the wordmark text,
  // stacked exactly on top with its own background-clip:text + mix-blend
  // screen, so the neon only ever lights up inside the letter strokes,
  // never as a rectangle behind/around them.
  const wordmarkAreaRef = useRef<HTMLDivElement>(null);
  const wordmarkGlowRef = useRef<HTMLParagraphElement>(null);
  const wordmarkRafRef = useRef<number | null>(null);

  const handleWordmarkMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const area = wordmarkAreaRef.current;
    if (!area || wordmarkRafRef.current !== null) return;
    const clientX = e.clientX;
    const clientY = e.clientY;
    wordmarkRafRef.current = window.requestAnimationFrame(() => {
      wordmarkRafRef.current = null;
      const glow = wordmarkGlowRef.current;
      if (!glow) return;
      const rect = area.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * 100;
      const y = ((clientY - rect.top) / rect.height) * 100;
      glow.style.setProperty("--glow-x", `${x}%`);
      glow.style.setProperty("--glow-y", `${y}%`);
    });
  };

  useEffect(() => {
    return () => {
      if (wordmarkRafRef.current !== null) window.cancelAnimationFrame(wordmarkRafRef.current);
    };
  }, []);

  return (
    <footer id="footer" className="relative isolate z-1 overflow-clip bg-transparent text-foreground">
      
      {/* ── Warm light pooling under the wordmark (LumaCV Signature Glow) ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-1 h-[78%] bg-[radial-gradient(125%_100%_at_50%_100%,rgb(196_166_140/13%)_0%,rgb(166_143_184/7%)_36%,transparent_70%)]"
      />

      <div className="container-marketing grid grid-cols-[minmax(0,1.4fr)_repeat(4,minmax(0,1fr))] gap-x-8 gap-y-12 pt-[76px] max-[1100px]:grid-cols-[repeat(3,minmax(0,1fr))] max-[700px]:grid-cols-2 max-[700px]:gap-y-10 max-[540px]:pt-[52px]">
        
        {/* ── Brand Column ── */}
        <div className="max-[1100px]:col-span-full">
          <Link href="/" className="inline-flex items-center gap-[11px] font-semibold text-[17px] tracking-[-0.04em] text-foreground">
            <LumaLogo size={28} />
            <span className="font-display">LumaCV</span>
          </Link>
          
          <p className="mt-[18px] max-w-[300px] text-muted-foreground text-[14px] leading-[1.7]">
            Free and open source. Typst-compiled resumes, scored against real ATS parsing, not guesswork.
          </p>

          {/* Social Links Row */}
          <ul className="mt-6 flex flex-wrap gap-1 text-muted-foreground">
            {SOCIAL_LINKS.map((s) => {
              const Icon = s.icon;
              return (
                <li key={s.label}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-grid size-10 place-items-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                    aria-label={s.label}
                  >
                    <Icon size={19} weight="fill" aria-hidden="true" />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        {/* ── 4 Nav Columns ── */}
        {COLUMNS.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h2 className="font-display font-semibold text-[15px] tracking-[-0.03em] text-foreground">
              {column.title}
            </h2>
            <ul className="mt-[18px] space-y-0.5">
              {column.links.map((link) => (
                <li key={link.label}>
                  {link.isExternal ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/link inline-flex min-h-9 items-center gap-1 text-muted-foreground text-[14px] transition-colors hover:text-foreground"
                    >
                      <span>{link.label}</span>
                      <ArrowUpRight 
                        className="size-3.5 opacity-0 transition-all duration-200 group-hover/link:opacity-60 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" 
                        aria-hidden="true" 
                      />
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="group/link inline-flex min-h-9 items-center gap-1 text-muted-foreground text-[14px] transition-colors hover:text-foreground"
                    >
                      <span>{link.label}</span>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        ))}

      </div>

      {/* ── Sub-Footer Line ── */}
      <div className="container-marketing mt-[68px] flex items-center justify-between gap-x-8 gap-y-3 border-t border-border pt-6 text-muted-foreground text-[12px] max-[540px]:mt-12 max-[700px]:flex-col max-[700px]:items-start">
        <p>
          Open source, start to finish.
          <br />
          Released under the{" "}
          <a
            href={licenseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground underline-offset-[3px] hover:underline"
          >
            MIT License
          </a>
          .
        </p>

        <p>
          A passion project by{" "}
          <a
            href="https://github.com/sahilbnsll"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground underline-offset-[3px] hover:underline"
          >
            Sahil Bansal
          </a>
          {" "}·{" "}
          <a
            href={`${githubUrl}/blob/master/CONTRIBUTING.md`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground underline-offset-[3px] hover:underline"
          >
            contributors welcome
          </a>
          {releaseTag && (
            <>
              <span aria-hidden="true" className="px-2 text-border">
                /
              </span>
              <a
                href={`${githubUrl}/releases/tag/${releaseTag}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono tabular-nums text-muted-foreground hover:text-foreground hover:underline underline-offset-[3px] transition-colors"
              >
                {releaseTag}
              </a>
            </>
          )}
        </p>
      </div>

      {/* ── Oversized Wordmark Watermark (LumaCV Signature Element) ──
          Cursor-revealed gradient, the same technique already proven in
          components/interactive-watermark.tsx (currently unused elsewhere):
          a second copy of the wordmark, filled with the site's vivid
          rose→violet→cyan gradient, confined to the glyphs via
          background-clip:text and revealed only inside a soft circular
          mask-image that follows the cursor (mask-image, not mix-blend,
          same soft falloff their SVG radialGradient used: opaque core,
          ~45% still solid, fading to nothing by 75%). Nothing paints in the
          gaps or outside the wordmark, and it needs no theme variant since
          the mask/gradient combination is identical in light and dark. */}
      <div
        ref={wordmarkAreaRef}
        onMouseMove={handleWordmarkMouseMove}
        className="group container-marketing relative mt-10 max-[540px]:mt-7 select-none overflow-hidden pb-3"
      >
        <p
          aria-hidden="true"
          className="select-none bg-gradient-to-b from-foreground/20 from-30% to-foreground/[0.02] dark:from-[#f1f0eb] dark:from-40% dark:to-[rgb(241_240_235/4%)] bg-clip-text font-display font-bold text-[clamp(64px,14.4vw,175px)] text-transparent leading-[0.78] tracking-[-0.07em]"
        >
          LumaCV
        </p>
        <p
          ref={wordmarkGlowRef}
          aria-hidden="true"
          style={{
            "--glow-x": "20%",
            "--glow-y": "50%",
            backgroundImage: "linear-gradient(90deg, #f43f5e 0%, #fb7185 28%, #c084fc 52%, #818cf8 76%, #38bdf8 100%)",
            WebkitMaskImage: "radial-gradient(200px circle at var(--glow-x) var(--glow-y), #fff, #fff 40%, transparent 75%)",
            maskImage: "radial-gradient(200px circle at var(--glow-x) var(--glow-y), #fff, #fff 40%, transparent 75%)",
          } as React.CSSProperties}
          className="pointer-events-none absolute inset-0 select-none bg-clip-text font-display font-bold text-[clamp(64px,14.4vw,175px)] text-transparent leading-[0.78] tracking-[-0.07em] opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100"
        >
          LumaCV
        </p>
      </div>

    </footer>
  );
}
