import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: "class",
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                display: ["var(--font-display)", "var(--font-geist-sans)", "system-ui", "sans-serif"],
                sans: ["var(--font-ui)", "var(--font-geist-sans)", "system-ui", "sans-serif"],
                mono: ["var(--font-mono)", "var(--font-geist-mono)", "monospace"],
            },
            fontSize: {
                // Fluid display scale extracted from the homepage's actual hero/section
                // headings (components/landing/*) so every section shares one source
                // instead of hand-rolled clamp() values.
                "display-hero": ["clamp(3.25rem, 5.85vw, 5.125rem)", { lineHeight: "1.035", letterSpacing: "-0.064em" }],
                "display-2xl": ["clamp(2.5rem, 5.2vw, 4.375rem)", { lineHeight: "1.06", letterSpacing: "-0.055em" }],
                "display-xl": ["clamp(2.375rem, 4.5vw, 3.75rem)", { lineHeight: "1.08", letterSpacing: "-0.04em" }],
                "display-lg": ["clamp(2.125rem, 4vw, 3.375rem)", { lineHeight: "1.12", letterSpacing: "-0.04em" }],
                "heading-md": ["1.5rem", { lineHeight: "1.25", letterSpacing: "-0.02em" }],
                "heading-sm": ["1.125rem", { lineHeight: "1.35", letterSpacing: "-0.015em" }],
                "body-lg": ["1rem", { lineHeight: "1.55", letterSpacing: "-0.005em" }],
                "body-sm": ["0.875rem", { lineHeight: "1.50", letterSpacing: "0em" }],
                "caption": ["0.75rem", { lineHeight: "1.40", letterSpacing: "+0.01em" }],
                "micro": ["0.625rem", { lineHeight: "1.30", letterSpacing: "+0.03em" }],
            },
            maxWidth: {
                "reading": "48rem",    // 768px (Legal, Settings, Single-Column Forms)
                "marketing": "74rem",  // 1184px — matches the homepage's actual editorial container width
                "dashboard": "80rem",  // 1280px (Dashboard project matrices)
                "studio": "100rem",    // 1600px (Split-screen review workspace)
            },
            minHeight: {
                // Apple HIG minimum tap target — the homepage already used this value
                // ad hoc (`min-h-[44px]`) in several places; this makes it a real token.
                "touch": "44px",
            },
            minWidth: {
                "touch": "44px",
            },
            boxShadow: {
                "card": "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.03)",
                "elevated": "0 8px 24px -4px rgba(0, 0, 0, 0.12), 0 2px 6px -1px rgba(0, 0, 0, 0.04)",
                "modal": "0 24px 48px -12px rgba(0, 0, 0, 0.28), 0 0 0 1px rgba(255, 255, 255, 0.08)",
                "glow-brand": "0 0 30px rgba(102, 126, 234, 0.15)",
                "glow-emerald": "0 0 24px rgba(16, 185, 129, 0.15)",
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
                "dot-pattern": "radial-gradient(circle, #e5e7eb 1px, transparent 1px)",
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                card: {
                    DEFAULT: "var(--card)",
                    foreground: "var(--card-foreground)",
                },
                popover: {
                    DEFAULT: "var(--popover)",
                    foreground: "var(--popover-foreground)",
                },
                primary: {
                    DEFAULT: "var(--primary)",
                    foreground: "var(--primary-foreground)",
                },
                secondary: {
                    DEFAULT: "var(--secondary)",
                    foreground: "var(--secondary-foreground)",
                },
                muted: {
                    DEFAULT: "var(--muted)",
                    foreground: "var(--muted-foreground)",
                },
                accent: {
                    DEFAULT: "var(--accent)",
                    foreground: "var(--accent-foreground)",
                },
                destructive: {
                    DEFAULT: "var(--destructive)",
                    foreground: "var(--destructive-foreground)",
                },
                success: {
                    DEFAULT: "var(--success)",
                    foreground: "var(--success-foreground)",
                },
                warning: {
                    DEFAULT: "var(--warning)",
                    foreground: "var(--warning-foreground)",
                },
                border: "var(--border)",
                input: "var(--input)",
                ring: "var(--ring)",
                chart: {
                    "1": "var(--chart-1)",
                    "2": "var(--chart-2)",
                    "3": "var(--chart-3)",
                    "4": "var(--chart-4)",
                    "5": "var(--chart-5)",
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
            },
        },
    },
    plugins: [
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        require("tailwindcss-animate"),
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        require("@tailwindcss/typography"),
    ],
};
export default config;
