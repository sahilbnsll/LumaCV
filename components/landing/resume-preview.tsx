"use client";

import React from "react";

interface ResumePreviewProps {
  templateId: "modern" | "matrix" | "boutique";
  name: string;
  accent: string;
  typeface: "sans" | "serif";
}

// ─── Shared sample data ───────────────────────────────────────────────────────

const SAMPLE = {
  title: "Senior Platform Engineer",
  contact: "alex@example.com · linkedin.com/in/alex · github.com/alexm",
  location: "Bengaluru, India",
  summary:
    "Platform engineer with 8+ years building reliable cloud platforms, Kubernetes foundations, and delivery systems. Strong focus on AWS, infrastructure as code, observability, and pragmatic automation.",
  skills: "AWS, Kubernetes, Terraform, Python, Go, Argo CD, GitHub Actions, Prometheus, Grafana",
  experience: [
    {
      role: "Senior Platform Engineer",
      company: "Nebula Systems",
      location: "Bengaluru",
      dates: "Jan 2023, Present",
      bullets: [
        "Redesigned the EKS platform around reusable Terraform modules, reducing bootstrap time from days to under an hour.",
        "Built GitOps delivery with Argo CD and progressive rollouts, cutting change incidents by 38%.",
        "Introduced OpenTelemetry, Prometheus, Grafana across 40+ services.",
      ],
    },
    {
      role: "DevOps Engineer",
      company: "Northstar Cloud",
      location: "Pune",
      dates: "Jul 2020, Dec 2022",
      bullets: [
        "Migrated legacy workloads to AWS with Terraform and automated account provisioning.",
        "Built CI/CD pipelines with policy checks, artifact promotion, and automated rollback paths.",
        "Reduced median deployment lead time by 52%.",
      ],
    },
    {
      role: "Software Engineer",
      company: "Orbit Labs",
      location: "Hyderabad",
      dates: "Jul 2018, Jun 2020",
      bullets: [
        "Developed Python services and automation for internal engineering workflows.",
        "Improved Linux service reliability through structured logging and health checks.",
      ],
    },
  ],
  projects: [
    { name: "LumaCV Platform", tech: "Typst · AI · AWS", desc: "Resume generation platform that parses CVs and job descriptions." },
    { name: "Platform Golden Path", tech: "EKS · Terraform · Argo CD", desc: "Reusable platform foundation with observability and security guardrails." },
  ],
  education: "B.Tech in Computer Science",
  school: "National Institute of Technology",
  dates: "2014, 2018",
  certs: ["AWS Certified DevOps Engineer – Professional", "Certified Kubernetes Administrator"],
};

// ─── Modern Tech template ─────────────────────────────────────────────────────

function ModernTech({ name, accent }: { name: string; accent: string }) {
  const s: React.CSSProperties = {
    fontFamily: "system-ui, 'Inter', sans-serif",
    fontSize: 16,
    lineHeight: 1.55,
    color: "#1a1a1a",
    padding: "32px 36px",
    width: "100%",
  };
  // This mockup renders at 794px then gets scaled down ~0.44x to fit the hero's
  // 3D paper-stack composition, so source sizes here need to run well above what
  // would look right at 1:1, a ~10pt body / ~14pt heading (1.4x) ratio is what
  // reads correctly at print resolution; these numbers preserve that pre-scale.
  const sectionLabel: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.10em",
    textTransform: "uppercase",
    color: accent,
    marginBottom: 6,
    marginTop: 22,
    paddingBottom: 5,
    borderBottom: `1.5px solid ${accent}`,
  };
  const ruleLine: React.CSSProperties = {
    borderTop: "1px solid #e0ddd8",
    marginBottom: 12,
  };
  return (
    <div style={s}>
      {/* Header */}
      <div style={{ marginBottom: 3 }}>
        <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.1 }}>{name}</div>
        <div style={{ fontSize: 16, color: accent, fontWeight: 500, marginTop: 5 }}>{SAMPLE.title}</div>
        <div style={{ fontSize: 12, color: "#6b6b6b", marginTop: 6, borderTop: "1px solid #e0ddd8", paddingTop: 8 }}>
          {SAMPLE.location} · {SAMPLE.contact}
        </div>
      </div>

      {/* Summary */}
      <div style={sectionLabel}>Summary</div>
      <div style={{ fontSize: 13.5, color: "#444", lineHeight: 1.65, marginBottom: 2 }}>{SAMPLE.summary}</div>

      {/* Skills */}
      <div style={sectionLabel}>Skills</div>
      <div style={{ fontSize: 13.5, color: "#444" }}>{SAMPLE.skills}</div>

      {/* Experience */}
      <div style={sectionLabel}>Experience</div>
      {SAMPLE.experience.map((exp) => (
        <div key={exp.role} style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 14.5, fontWeight: 700 }}>{exp.role}</span>
            <span style={{ fontSize: 12, color: "#888" }}>{exp.dates}</span>
          </div>
          <div style={{ fontSize: 13, color: accent, fontWeight: 500 }}>{exp.company} · {exp.location}</div>
          {exp.bullets.map((b, i) => (
            <div key={i} style={{ fontSize: 13, color: "#444", paddingLeft: 12, marginTop: 3 }}>• {b}</div>
          ))}
        </div>
      ))}

      {/* Projects */}
      <div style={sectionLabel}>Projects</div>
      {SAMPLE.projects.map((p) => (
        <div key={p.name} style={{ marginBottom: 9 }}>
          <span style={{ fontSize: 13.5, fontWeight: 700 }}>{p.name}</span>
          <span style={{ fontSize: 12, color: "#888", marginLeft: 7 }}>{p.tech}</span>
          <div style={{ fontSize: 13, color: "#555" }}>{p.desc}</div>
        </div>
      ))}

      {/* Education */}
      <div style={sectionLabel}>Education</div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{SAMPLE.education}</div>
          <div style={{ fontSize: 13, color: accent, fontWeight: 500 }}>{SAMPLE.school}</div>
        </div>
        <span style={{ fontSize: 12, color: "#888" }}>{SAMPLE.dates}</span>
      </div>

      {/* Certs */}
      <div style={sectionLabel}>Certifications</div>
      <div style={{ fontSize: 13, color: "#444" }}>{SAMPLE.certs.join(" · ")}</div>

      <div style={ruleLine} />
    </div>
  );
}

// ─── Matrix (two-column sidebar) template ─────────────────────────────────────

const MATRIX_SKILLS = [
  { label: "Cloud & Infra", value: "AWS · EKS · Terraform · VPC · IAM · CloudFront" },
  { label: "Containers", value: "Kubernetes · Helm · Docker · Argo CD" },
  { label: "Delivery", value: "GitHub Actions · GitLab CI · Jenkins · Argo Rollouts" },
  { label: "Observability", value: "Prometheus · Grafana · OpenTelemetry · Loki" },
  { label: "Engineering", value: "Python · Go · Linux · Bash · PostgreSQL" },
];

function MatrixResume({ name, accent }: { name: string; accent: string }) {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", fontSize: 11, color: "#1a1a1a", width: "100%" }}>
      {/* Header row */}
      <div style={{ padding: "28px 28px 12px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.1 }}>{name}</div>
          <div style={{ fontSize: 12, color: accent, fontWeight: 600, marginTop: 3 }}>{SAMPLE.title}</div>
        </div>
        <div style={{ textAlign: "right", fontSize: 9, color: "#666", lineHeight: 1.8 }}>
          <div>{SAMPLE.location}</div>
          <div>alex@example.com</div>
          <div>+91 98765 43210</div>
          <div>linkedin.com/in/alex</div>
          <div>github.com/alexm</div>
        </div>
      </div>
      <div style={{ height: 1.5, background: accent, margin: "0 28px 0" }} />

      {/* Two-column body */}
      <div style={{ display: "flex", padding: "0" }}>
        {/* Left sidebar */}
        <div style={{ width: "30%", borderRight: "1px solid #e8e6e2", padding: "16px 16px 16px 28px", flexShrink: 0 }}>
          <div style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: accent, marginBottom: 8 }}>Capabilities</div>
          {MATRIX_SKILLS.map((sk) => (
            <div key={sk.label} style={{ marginBottom: 9 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: accent }}>{sk.label}</div>
              <div style={{ fontSize: 9.5, color: "#555", lineHeight: 1.5 }}>{sk.value}</div>
            </div>
          ))}

          <div style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: accent, marginTop: 16, marginBottom: 8 }}>Education</div>
          <div style={{ fontSize: 10, fontWeight: 700 }}>{SAMPLE.education}</div>
          <div style={{ fontSize: 9.5, color: "#666" }}>{SAMPLE.school}</div>
          <div style={{ fontSize: 9.5, color: "#888" }}>{SAMPLE.dates}</div>

          <div style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: accent, marginTop: 16, marginBottom: 8 }}>Certifications</div>
          {SAMPLE.certs.map((c) => (
            <div key={c} style={{ fontSize: 9.5, color: "#555", marginBottom: 6, background: "#f6f5f3", padding: "4px 6px", borderRadius: 3 }}>{c}</div>
          ))}
        </div>

        {/* Right main */}
        <div style={{ flex: 1, padding: "16px 28px 16px 20px" }}>
          <div style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: accent, marginBottom: 6 }}>Summary</div>
          <div style={{ fontSize: 10, color: "#444", lineHeight: 1.65, marginBottom: 14 }}>{SAMPLE.summary}</div>

          <div style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: accent, marginBottom: 8 }}>Experience</div>
          {SAMPLE.experience.map((exp) => (
            <div key={exp.role} style={{ marginBottom: 13 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, fontWeight: 700 }}>{exp.role}</span>
                <span style={{ fontSize: 9, color: "#888" }}>{exp.dates}</span>
              </div>
              <div style={{ fontSize: 10, color: accent, fontWeight: 600 }}>{exp.company} · {exp.location}</div>
              {exp.bullets.map((b, i) => (
                <div key={i} style={{ fontSize: 9.5, color: "#444", paddingLeft: 10, marginTop: 2 }}>• {b}</div>
              ))}
            </div>
          ))}

          <div style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: accent, marginBottom: 6 }}>Projects</div>
          {SAMPLE.projects.map((p) => (
            <div key={p.name} style={{ marginBottom: 7 }}>
              <span style={{ fontSize: 10.5, fontWeight: 700 }}>{p.name}</span>
              <span style={{ fontSize: 9, color: "#888", marginLeft: 6 }}>{p.tech}</span>
              <div style={{ fontSize: 9.5, color: "#555" }}>{p.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Boutique (centred serif editorial) template ───────────────────────────────

const BOUTIQUE_SKILLS = [
  { label: "Cloud & Infra", value: "AWS · EKS · Terraform · VPC · IAM · CloudFront" },
  { label: "Containers", value: "Kubernetes · Helm · Docker · Argo CD" },
  { label: "Delivery", value: "GitHub Actions · GitLab CI · Jenkins · Argo Rollouts" },
  { label: "Observability", value: "Prometheus · Grafana · OpenTelemetry · Loki" },
  { label: "Engineering", value: "Python · Go · Linux · Bash · PostgreSQL" },
];

function BoutiqueResume({ name, accent, typeface }: { name: string; accent: string; typeface: "sans" | "serif" }) {
  const serifFont = "'Georgia', 'Times New Roman', serif";
  const mainFont = typeface === "serif" ? serifFont : "system-ui, sans-serif";
  const centeredHeading: React.CSSProperties = {
    textAlign: "center",
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: accent,
    marginBottom: 6,
    marginTop: 14,
  };
  const centerRule = (
    <div style={{ textAlign: "center", marginBottom: 8 }}>
      <span style={{ display: "inline-block", width: 32, height: 2, background: accent }} />
    </div>
  );
  return (
    <div style={{ fontFamily: mainFont, fontSize: 11, color: "#1a1a1a", padding: "28px 36px", width: "100%" }}>
      {/* Centered header */}
      <div style={{ textAlign: "center", borderBottom: "1px solid #d6d3ce", paddingBottom: 14, marginBottom: 6 }}>
        <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1 }}>{name}</div>
        <div style={{ fontSize: 12.5, fontStyle: "italic", color: accent, marginTop: 4 }}>{SAMPLE.title}</div>
        <div style={{ fontSize: 9, color: "#777", marginTop: 6, lineHeight: 1.8 }}>
          {SAMPLE.location} &nbsp;·&nbsp; alex@example.com &nbsp;·&nbsp; +91 98765 43210 &nbsp;·&nbsp; linkedin.com/in/alex &nbsp;·&nbsp; github.com/alexm
        </div>
      </div>

      {/* Profile */}
      <div style={centeredHeading}>Profile</div>
      {centerRule}
      <div style={{ textAlign: "center", fontSize: 10.5, color: "#444", lineHeight: 1.7, marginBottom: 4 }}>{SAMPLE.summary}</div>

      {/* Expertise */}
      <div style={centeredHeading}>Expertise</div>
      {centerRule}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 4 }}>
        <tbody>
          {BOUTIQUE_SKILLS.map((sk) => (
            <tr key={sk.label}>
              <td style={{ fontSize: 10, fontWeight: 700, color: accent, padding: "3px 12px 3px 0", whiteSpace: "nowrap", verticalAlign: "top" }}>{sk.label}</td>
              <td style={{ fontSize: 10, color: "#444", lineHeight: 1.5 }}>{sk.value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Experience */}
      <div style={centeredHeading}>Experience</div>
      {centerRule}
      {SAMPLE.experience.map((exp) => (
        <div key={exp.role} style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, fontWeight: 700 }}>{exp.role}</span>
            <span style={{ fontSize: 9, color: "#888" }}>{exp.dates}</span>
          </div>
          <div style={{ fontSize: 10.5, color: accent, fontWeight: 600 }}>{exp.company} · {exp.location}</div>
          {exp.bullets.map((b, i) => (
            <div key={i} style={{ fontSize: 10.5, color: "#444", paddingLeft: 12, marginTop: 2 }}>• {b}</div>
          ))}
        </div>
      ))}

      {/* Selected Projects */}
      <div style={centeredHeading}>Selected Projects</div>
      {centerRule}
      {SAMPLE.projects.map((p) => (
        <div key={p.name} style={{ textAlign: "center", marginBottom: 10, background: "#f8f7f5", padding: "8px 16px", borderRadius: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 700 }}>{p.name}</span>
          <span style={{ fontSize: 9, color: "#888", marginLeft: 8 }}>{p.tech}</span>
          <div style={{ fontSize: 10.5, color: "#555", marginTop: 2 }}>{p.desc}</div>
        </div>
      ))}

      {/* Education */}
      <div style={centeredHeading}>Education</div>
      {centerRule}
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 11.5, fontWeight: 700 }}>{SAMPLE.education}</div>
        <div style={{ fontSize: 10.5, color: "#666" }}>{SAMPLE.school} · {SAMPLE.dates}</div>
      </div>

      {/* Credentials */}
      <div style={centeredHeading}>Credentials</div>
      {centerRule}
      {SAMPLE.certs.map((c) => (
        <div key={c} style={{ textAlign: "center", fontSize: 10.5, fontWeight: 700, marginBottom: 4 }}>{c}</div>
      ))}
    </div>
  );
}

// ─── Public export ────────────────────────────────────────────────────────────

export function ResumePreview({ templateId, name, accent, typeface }: ResumePreviewProps) {
  const displayName = name.trim() || "Your Name";

  if (templateId === "modern") return <ModernTech name={displayName} accent={accent} />;
  if (templateId === "matrix") return <MatrixResume name={displayName} accent={accent} />;
  if (templateId === "boutique") return <BoutiqueResume name={displayName} accent={accent} typeface={typeface} />;
  return null;
}
