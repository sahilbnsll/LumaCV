"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ArrowRight, Sparkles, FileText, Layers, ShieldCheck, HelpCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

// Register GSAP Plugins safely
if (typeof window !== "undefined") {
  gsap.registerPlugin(CustomEase);
}

export interface SterlingGateKineticNavigationProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  triggerOnly?: boolean;
}

export function Component({
  isOpen: controlledIsOpen,
  onOpenChange,
  className,
}: SterlingGateKineticNavigationProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  const isControlled = controlledIsOpen !== undefined;
  const isMenuOpen = isControlled ? controlledIsOpen : internalIsOpen;

  const setIsMenuOpen = (value: boolean | ((prev: boolean) => boolean)) => {
    const nextValue = typeof value === "function" ? value(isMenuOpen) : value;
    if (!isControlled) {
      setInternalIsOpen(nextValue);
    }
    onOpenChange?.(nextValue);
  };

  // Initial Setup & Hover Effects
  useEffect(() => {
    if (!containerRef.current) return;

    // Create custom easing safely
    try {
      if (!gsap.parseEase("main")) {
        CustomEase.create("main", "0.65, 0.01, 0.05, 0.99");
        gsap.defaults({ ease: "main", duration: 0.7 });
      }
    } catch (e) {
      console.warn("CustomEase failed to load, falling back to default.", e);
      gsap.defaults({ ease: "power2.out", duration: 0.7 });
    }

    const ctx = gsap.context(() => {
      // 1. Arrow Animation (Safe check)
      const arrowLine = document.querySelector(".arrow-line");
      if (arrowLine) {
        const pathLength = (arrowLine as SVGPathElement).getTotalLength();
        gsap.set(arrowLine, { strokeDasharray: pathLength, strokeDashoffset: pathLength });
        const arrowTl = gsap.timeline({ repeat: -1, repeatDelay: 0.8 });
        arrowTl
          .to(arrowLine, { strokeDashoffset: 0, duration: 1, ease: "power2.out" })
          .to({}, { duration: 1.2 })
          .to(arrowLine, { strokeDashoffset: -pathLength, duration: 0.6, ease: "power2.in" })
          .set(arrowLine, { strokeDashoffset: pathLength });
      }

      // 2. Shape Hover logic
      const menuItems = containerRef.current!.querySelectorAll(".menu-list-item[data-shape]");
      const shapesContainer = containerRef.current!.querySelector(".ambient-background-shapes");

      menuItems.forEach((item) => {
        const shapeIndex = item.getAttribute("data-shape");
        const shape = shapesContainer ? shapesContainer.querySelector(`.bg-shape-${shapeIndex}`) : null;

        if (!shape) return;

        const shapeEls = shape.querySelectorAll(".shape-element");

        const onEnter = () => {
          if (shapesContainer) {
            shapesContainer.querySelectorAll(".bg-shape").forEach((s) => s.classList.remove("active"));
          }
          shape.classList.add("active");

          gsap.fromTo(
            shapeEls,
            { scale: 0.5, opacity: 0, rotation: -10 },
            { scale: 1, opacity: 1, rotation: 0, duration: 0.6, stagger: 0.08, ease: "back.out(1.7)", overwrite: "auto" }
          );
        };

        const onLeave = () => {
          gsap.to(shapeEls, {
            scale: 0.8,
            opacity: 0,
            duration: 0.3,
            ease: "power2.in",
            onComplete: () => shape.classList.remove("active"),
            overwrite: "auto",
          });
        };

        item.addEventListener("mouseenter", onEnter);
        item.addEventListener("mouseleave", onLeave);

        (item as any)._cleanup = () => {
          item.removeEventListener("mouseenter", onEnter);
          item.removeEventListener("mouseleave", onLeave);
        };
      });
    }, containerRef);

    return () => {
      ctx.revert();
      if (containerRef.current) {
        const items = containerRef.current.querySelectorAll(".menu-list-item[data-shape]");
        items.forEach((item: any) => item._cleanup && item._cleanup());
      }
    };
  }, []);

  // Menu Open/Close Animation Effect
  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const navWrap = containerRef.current!.querySelector(".nav-overlay-wrapper");
      const menu = containerRef.current!.querySelector(".menu-content");
      const overlay = containerRef.current!.querySelector(".overlay");
      const bgPanels = containerRef.current!.querySelectorAll(".backdrop-layer");
      const menuLinks = containerRef.current!.querySelectorAll(".nav-link");
      const fadeTargets = containerRef.current!.querySelectorAll("[data-menu-fade]");

      const menuButton = containerRef.current!.querySelector(".nav-close-btn");
      const menuButtonTexts = menuButton?.querySelectorAll("p");
      const menuButtonIcon = menuButton?.querySelector(".menu-button-icon");

      const tl = gsap.timeline();

      if (isMenuOpen) {
        // OPEN
        if (navWrap) {
          navWrap.setAttribute("data-nav", "open");
          (navWrap as HTMLElement).style.pointerEvents = "auto";
          tl.set(navWrap, { display: "block" });
        }

        if (menu) {
          tl.set(menu, { xPercent: 0 }, "<");
        }

        if (menuButtonTexts && menuButtonTexts.length) {
          tl.fromTo(menuButtonTexts, { yPercent: 0 }, { yPercent: -100, stagger: 0.2 }, "<");
        }

        if (menuButtonIcon) {
          tl.fromTo(menuButtonIcon, { rotate: 0 }, { rotate: 315 }, "<");
        }

        if (overlay) {
          tl.fromTo(overlay, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, "<");
        }

        if (bgPanels.length) {
          tl.fromTo(bgPanels, { xPercent: 101 }, { xPercent: 0, stagger: 0.12, duration: 0.575 }, "<");
        }

        if (menuLinks.length) {
          tl.fromTo(menuLinks, { yPercent: 140, rotate: 10 }, { yPercent: 0, rotate: 0, stagger: 0.05, duration: 0.65 }, "<+=0.35");
        }

        if (fadeTargets.length) {
          tl.fromTo(fadeTargets, { autoAlpha: 0, yPercent: 50 }, { autoAlpha: 1, yPercent: 0, stagger: 0.04, clearProps: "all" }, "<+=0.2");
        }
      } else {
        // CLOSE
        if (navWrap) {
          navWrap.setAttribute("data-nav", "closed");
          (navWrap as HTMLElement).style.pointerEvents = "none";
        }

        if (overlay) {
          tl.to(overlay, { autoAlpha: 0, duration: 0.3 });
        }

        if (menu) {
          tl.to(menu, { xPercent: 120, duration: 0.45 }, "<");
        }

        if (menuButtonTexts && menuButtonTexts.length) {
          tl.to(menuButtonTexts, { yPercent: 0 }, "<");
        }

        if (menuButtonIcon) {
          tl.to(menuButtonIcon, { rotate: 0 }, "<");
        }

        if (navWrap) {
          tl.set(navWrap, { display: "none" });
        }
      }
    }, containerRef);

    return () => ctx.revert();
  }, [isMenuOpen]);

  // keydown Escape handling
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isMenuOpen]);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  const handleNavigate = (href: string) => {
    closeMenu();
    router.push(href);
  };

  return (
    <div ref={containerRef} className={cn("sterling-gate-root", className)}>
      <div className="site-header-wrapper">
        <header className="header">
          <div className="container is--full">
            <nav className="nav-row">
              <div className="nav-row__right">
                {/* Interactive Kinetic Menu Button */}
                <button
                  type="button"
                  className="nav-close-btn"
                  onClick={toggleMenu}
                  style={{ pointerEvents: "auto" }}
                  aria-label={isMenuOpen ? "Close navigation" : "Open navigation"}
                >
                  <div className="menu-button-text">
                    <p className="p-large">Menu</p>
                    <p className="p-large">Close</p>
                  </div>
                  <div className="icon-wrap">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="100%"
                      viewBox="0 0 16 16"
                      fill="none"
                      className="menu-button-icon"
                    >
                      <path
                        d="M7.33333 16L7.33333 -3.2055e-07L8.66667 -3.78832e-07L8.66667 16L7.33333 16Z"
                        fill="currentColor"
                      ></path>
                      <path
                        d="M16 8.66667L-2.62269e-07 8.66667L-3.78832e-07 7.33333L16 7.33333L16 8.66667Z"
                        fill="currentColor"
                      ></path>
                      <path
                        d="M6 7.33333L7.33333 7.33333L7.33333 6C7.33333 6.73637 6.73638 7.33333 6 7.33333Z"
                        fill="currentColor"
                      ></path>
                      <path
                        d="M10 7.33333L8.66667 7.33333L8.66667 6C8.66667 6.73638 9.26362 7.33333 10 7.33333Z"
                        fill="currentColor"
                      ></path>
                      <path
                        d="M6 8.66667L7.33333 8.66667L7.33333 10C7.33333 9.26362 6.73638 8.66667 6 8.66667Z"
                        fill="currentColor"
                      ></path>
                      <path
                        d="M10 8.66667L8.66667 8.66667L8.66667 10C8.66667 9.26362 9.26362 8.66667 10 8.66667Z"
                        fill="currentColor"
                      ></path>
                    </svg>
                  </div>
                </button>
              </div>
            </nav>
          </div>
        </header>
      </div>

      <section className="fullscreen-menu-container">
        <div data-nav="closed" className="nav-overlay-wrapper">
          <div className="overlay" onClick={closeMenu}></div>
          <nav className="menu-content">
            <div className="menu-bg">
              <div className="backdrop-layer first"></div>
              <div className="backdrop-layer second"></div>
              <div className="backdrop-layer"></div>

              {/* Abstract shapes container */}
              <div className="ambient-background-shapes">
                {/* Shape 1: Floating circles */}
                <svg className="bg-shape bg-shape-1" viewBox="0 0 400 400" fill="none">
                  <circle className="shape-element" cx="80" cy="120" r="40" fill="rgba(99,102,241,0.15)" />
                  <circle className="shape-element" cx="300" cy="80" r="60" fill="rgba(139,92,246,0.12)" />
                  <circle className="shape-element" cx="200" cy="300" r="80" fill="rgba(236,72,153,0.1)" />
                  <circle className="shape-element" cx="350" cy="280" r="30" fill="rgba(99,102,241,0.15)" />
                </svg>

                {/* Shape 2: Wave pattern */}
                <svg className="bg-shape bg-shape-2" viewBox="0 0 400 400" fill="none">
                  <path
                    className="shape-element"
                    d="M0 200 Q100 100, 200 200 T 400 200"
                    stroke="rgba(99,102,241,0.2)"
                    strokeWidth="60"
                    fill="none"
                  />
                  <path
                    className="shape-element"
                    d="M0 280 Q100 180, 200 280 T 400 280"
                    stroke="rgba(139,92,246,0.15)"
                    strokeWidth="40"
                    fill="none"
                  />
                </svg>

                {/* Shape 3: Grid dots */}
                <svg className="bg-shape bg-shape-3" viewBox="0 0 400 400" fill="none">
                  <circle className="shape-element" cx="50" cy="50" r="8" fill="rgba(99,102,241,0.3)" />
                  <circle className="shape-element" cx="150" cy="50" r="8" fill="rgba(139,92,246,0.3)" />
                  <circle className="shape-element" cx="250" cy="50" r="8" fill="rgba(236,72,153,0.3)" />
                  <circle className="shape-element" cx="350" cy="50" r="8" fill="rgba(99,102,241,0.3)" />
                  <circle className="shape-element" cx="100" cy="150" r="12" fill="rgba(139,92,246,0.25)" />
                  <circle className="shape-element" cx="200" cy="150" r="12" fill="rgba(236,72,153,0.25)" />
                  <circle className="shape-element" cx="300" cy="150" r="12" fill="rgba(99,102,241,0.25)" />
                  <circle className="shape-element" cx="50" cy="250" r="10" fill="rgba(236,72,153,0.3)" />
                  <circle className="shape-element" cx="150" cy="250" r="10" fill="rgba(99,102,241,0.3)" />
                  <circle className="shape-element" cx="250" cy="250" r="10" fill="rgba(139,92,246,0.3)" />
                  <circle className="shape-element" cx="350" cy="250" r="10" fill="rgba(236,72,153,0.3)" />
                  <circle className="shape-element" cx="100" cy="350" r="6" fill="rgba(99,102,241,0.3)" />
                  <circle className="shape-element" cx="200" cy="350" r="6" fill="rgba(139,92,246,0.3)" />
                  <circle className="shape-element" cx="300" cy="350" r="6" fill="rgba(236,72,153,0.3)" />
                </svg>

                {/* Shape 4: Organic blobs */}
                <svg className="bg-shape bg-shape-4" viewBox="0 0 400 400" fill="none">
                  <path
                    className="shape-element"
                    d="M100 100 Q150 50, 200 100 Q250 150, 200 200 Q150 250, 100 200 Q50 150, 100 100"
                    fill="rgba(99,102,241,0.12)"
                  />
                  <path
                    className="shape-element"
                    d="M250 200 Q300 150, 350 200 Q400 250, 350 300 Q400 250, 350 300 Q300 350, 250 300 Q200 250, 250 200"
                    fill="rgba(236,72,153,0.1)"
                  />
                </svg>

                {/* Shape 5: Diagonal lines */}
                <svg className="bg-shape bg-shape-5" viewBox="0 0 400 400" fill="none">
                  <line className="shape-element" x1="0" y1="100" x2="300" y2="400" stroke="rgba(99,102,241,0.15)" strokeWidth="30" />
                  <line className="shape-element" x1="100" y1="0" x2="400" y2="300" stroke="rgba(139,92,246,0.12)" strokeWidth="25" />
                  <line className="shape-element" x1="200" y1="0" x2="400" y2="200" stroke="rgba(236,72,153,0.1)" strokeWidth="20" />
                </svg>
              </div>
            </div>

            <div className="menu-content-wrapper">
              <div className="menu-header-bar flex items-center justify-between pb-6 mb-4 border-b border-border/40">
                <div className="flex items-center gap-2.5">
                  <span className="font-display font-bold tracking-tight text-xl text-foreground">LumaCV</span>
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-medium">
                    Open Source
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="hidden sm:inline-block text-[11px] text-muted-foreground/70 font-mono tracking-wider">
                    ESC
                  </span>
                  <button
                    type="button"
                    onClick={closeMenu}
                    aria-label="Close navigation menu"
                    className="h-9 w-9 rounded-full border border-border/80 bg-card/90 hover:bg-muted text-foreground flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-xs"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <ul className="menu-list">
                <li className="menu-list-item" data-shape="1">
                  <a
                    href="/builder"
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigate("/builder");
                    }}
                    className="nav-link w-inline-block group"
                  >
                    <span className="text-xs font-mono text-primary/70 mr-3">01</span>
                    <p className="nav-link-text">Resume Studio</p>
                    <ArrowRight className="h-6 w-6 opacity-0 -translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
                  </a>
                </li>
                <li className="menu-list-item" data-shape="2">
                  <a
                    href="/#templates"
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigate("/#templates");
                    }}
                    className="nav-link w-inline-block group"
                  >
                    <span className="text-xs font-mono text-primary/70 mr-3">02</span>
                    <p className="nav-link-text">48 Templates</p>
                    <ArrowRight className="h-6 w-6 opacity-0 -translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
                  </a>
                </li>
                <li className="menu-list-item" data-shape="3">
                  <a
                    href="/dashboard"
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigate("/dashboard");
                    }}
                    className="nav-link w-inline-block group"
                  >
                    <span className="text-xs font-mono text-primary/70 mr-3">03</span>
                    <p className="nav-link-text">My Resumes</p>
                    <ArrowRight className="h-6 w-6 opacity-0 -translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
                  </a>
                </li>
                <li className="menu-list-item" data-shape="4">
                  <a
                    href="/#faq"
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigate("/#faq");
                    }}
                    className="nav-link w-inline-block group"
                  >
                    <span className="text-xs font-mono text-primary/70 mr-3">04</span>
                    <p className="nav-link-text">FAQ & Support</p>
                    <ArrowRight className="h-6 w-6 opacity-0 -translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
                  </a>
                </li>
                <li className="menu-list-item" data-shape="5">
                  <a
                    href="/docs"
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigate("/docs");
                    }}
                    className="nav-link w-inline-block group"
                  >
                    <span className="text-xs font-mono text-primary/70 mr-3">05</span>
                    <p className="nav-link-text">Documentation</p>
                    <ArrowRight className="h-6 w-6 opacity-0 -translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
                  </a>
                </li>
              </ul>

              <div className="menu-footer-bar mt-10 pt-6 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-3">
                  <a href="/login" onClick={(e) => { e.preventDefault(); handleNavigate("/login"); }} className="hover:text-foreground transition-colors">
                    Sign in
                  </a>
                  <span>·</span>
                  <a href="/docs" onClick={(e) => { e.preventDefault(); handleNavigate("/docs"); }} className="hover:text-foreground transition-colors">
                    Docs
                  </a>
                  <span>·</span>
                  <a
                    href="https://sahilbansal.net/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground hover:text-primary transition-colors font-medium"
                  >
                    Sahil Bansal
                  </a>
                  <span>·</span>
                  <a href="/#support" onClick={(e) => { e.preventDefault(); handleNavigate("/#support"); }} className="hover:text-foreground transition-colors">
                    Docs & Support
                  </a>
                </div>
                <span className="font-mono text-[11px] text-emerald-500">● Typst Vector Engine</span>
              </div>
            </div>
          </nav>
        </div>
      </section>
    </div>
  );
}

// Export both Component and named alias
export { Component as SterlingGateKineticNavigation };
export default Component;
