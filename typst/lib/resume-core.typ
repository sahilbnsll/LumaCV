// LumaCV standalone core — no external packages required.
// Target: Typst 0.15.x. Text-first, ATS-conscious, one-column rendering.

#let safe-get(d, key, ..rest) = {
  let fallback = if rest.pos().len() > 0 { rest.pos().at(0) } else if "fallback" in rest.named() { rest.named().at("fallback") } else { none }
  if type(d) == dictionary and key in d { d.at(key) } else { fallback }
}

#let contact-line(c, sep: " · ") = {
  let xs = ()
  if "location" in c and c.location != "" { xs.push(c.location) }
  if "email" in c and c.email != "" { xs.push(link("mailto:" + c.email)[#c.email]) }
  if "phone" in c and c.phone != "" { xs.push(link("tel:" + c.phone.replace(" ", ""))[#c.phone]) }
  if "linkedin" in c and c.linkedin != "" { xs.push(link("https://" + c.linkedin.replace("https://", ""))[#c.linkedin]) }
  if "github" in c and c.github != "" { xs.push(link("https://" + c.github.replace("https://", ""))[#c.github]) }
  if "website" in c and c.website != "" { xs.push(link("https://" + c.website.replace("https://", ""))[#c.website]) }
  xs.join(sep)
}

#let bullets(items, marker: "•", spacing: 0.32em) = {
  set list(marker: text(fill: rgb("#374151"))[#marker], indent: 0.82em, body-indent: 0.28em, spacing: spacing)
  list(..items)
}

#let render-skills(data, accent) = {
  if "skills" in data and data.skills.len() > 0 {
    for (i, cat) in data.skills.enumerate() {
      if i > 0 { v(0.24em) }
      text(size: 8.2pt, weight: "bold", fill: accent)[#cat.category]
      let skill-text = if "skills" in cat {
        if type(cat.skills) == array { cat.skills.join(", ") } else { str(cat.skills) }
      } else if "items" in cat {
        if type(cat.items) == array { cat.items.join(", ") } else { str(cat.items) }
      } else {
        ""
      }
      text(size: 8.2pt)[ — #skill-text]
    }
  }
}

#let render-experience(data, ..args) = {
  let accent = if args.pos().len() > 0 { args.pos().at(0) } else if "accent" in args.named() { args.named().at("accent") } else { rgb("#1f2937") }
  if "experience" in data and data.experience.len() > 0 {
    for (i, exp) in data.experience.enumerate() {
      if i > 0 { v(0.75em) }
      text(size: 9.4pt, weight: "bold")[#exp.role]
      linebreak()
      text(size: 8.7pt, weight: "bold", fill: accent)[#exp.company]
      text(size: 8.2pt, fill: rgb("#6b7280"))[ · #exp.dates]
      if "location" in exp and exp.location != "" {
        text(size: 7.8pt, fill: rgb("#6b7280"))[ · #exp.location]
      }
      v(0.14em)
      bullets(exp.bullets)
    }
  }
}

#let render-projects(data, ..args) = {
  let accent = if args.pos().len() > 0 { args.pos().at(0) } else if "accent" in args.named() { args.named().at("accent") } else { rgb("#1f2937") }
  if "projects" in data and data.projects.len() > 0 {
    for (i, p) in data.projects.enumerate() {
      if i > 0 { v(0.5em) }
      text(size: 8.9pt, weight: "bold", fill: accent)[#p.name]
      if "stack" in p and p.stack != "" { text(size: 7.8pt, fill: rgb("#6b7280"))[ · #p.stack] }
      if "description" in p { text()[ — #p.description] }
    }
  }
}

#let render-education(data) = {
  if "education" in data and data.education.len() > 0 {
    for (i, edu) in data.education.enumerate() {
      if i > 0 { v(0.4em) }
      text(size: 8.9pt, weight: "bold")[#edu.degree#if "specialization" in edu and edu.specialization != "" [ · #edu.specialization]]
      text(size: 8.1pt, fill: rgb("#6b7280"))[ · #edu.institution · #edu.dates]
      if "gpa" in edu and edu.gpa != "" { text(size: 7.9pt, fill: rgb("#6b7280"))[ · #edu.gpa] }
    }
  }
}

#let render-certifications(data) = {
  if "certifications" in data and data.certifications.len() > 0 {
    for (i, c) in data.certifications.enumerate() {
      if i > 0 { v(0.28em) }
      text(size: 8.6pt, weight: "bold")[#c.name]
      if "issuer" in c and c.issuer != "" { text(size: 8pt, fill: rgb("#6b7280"))[ · #c.issuer] }
      if "date" in c and c.date != "" { text(size: 8pt, fill: rgb("#6b7280"))[ · #c.date] }
    }
  }
}

#let section(title, body, accent, rule: "thin") = {
  v(0.85em)
  text(size: 8.4pt, weight: "bold", tracking: 0.12em, fill: accent)[#upper(title)]
  v(0.08em)
  if rule == "double" {
    line(length: 100%, stroke: 1.1pt + accent)
    v(0.07em)
    line(length: 100%, stroke: 0.4pt + rgb("#d1d5db"))
  } else if rule == "short" {
    line(length: 42pt, stroke: 1.4pt + accent)
  } else {
    line(length: 100%, stroke: 0.45pt + rgb("#d1d5db"))
  }
  v(0.22em)
  body
}

#let render-resume(data, mode: "strict") = {
  let palettes = (
    impact: (ink: rgb("#111827"), accent: rgb("#b91c1c"), muted: rgb("#6b7280")),
    switch: (ink: rgb("#172033"), accent: rgb("#0f766e"), muted: rgb("#667085")),
    grad: (ink: rgb("#1f2937"), accent: rgb("#2563eb"), muted: rgb("#6b7280")),
    leadership: (ink: rgb("#252525"), accent: rgb("#8b6b37"), muted: rgb("#707070")),
    casework: (ink: rgb("#16243a"), accent: rgb("#1d4ed8"), muted: rgb("#64748b")),
    metrics: (ink: rgb("#151515"), accent: rgb("#0f766e"), muted: rgb("#6b7280")),
    skillsfirst: (ink: rgb("#222222"), accent: rgb("#5b21b6"), muted: rgb("#737373")),
    credential: (ink: rgb("#17202a"), accent: rgb("#334155"), muted: rgb("#64748b")),
    international: (ink: rgb("#1f2937"), accent: rgb("#0f5f73"), muted: rgb("#6b7280")),
    projectled: (ink: rgb("#111827"), accent: rgb("#b45309"), muted: rgb("#737373")),
    narrative: (ink: rgb("#252525"), accent: rgb("#7c3aed"), muted: rgb("#737373")),
    strict: (ink: rgb("#111111"), accent: rgb("#222222"), muted: rgb("#666666")),
  )
  let p = palettes.at(mode, default: palettes.strict)
  let name = data.personal.name
  let headline = safe-get(data.personal, "headline", "")
  let summary = safe-get(data, "summary", "")

  set document(title: name + " — Resume", author: name, date: none)
  set page(paper: "a4", margin: (x: 1.45cm, y: 1.2cm))
  set text(font: if mode == "leadership" or mode == "narrative" { "Georgia" } else { "Arial" }, size: 8.65pt, fill: p.ink, hyphenate: false, fallback: true)
  set par(leading: 0.56em, spacing: 0.42em, justify: false)
  show link: set text(fill: p.accent)

  // Header variants
  if mode == "impact" {
    text(size: 24pt, weight: "bold", fill: p.ink)[#name]
    v(0.05em)
    text(size: 9.4pt, weight: "bold", fill: p.accent)[#headline]
    v(0.18em)
    text(size: 7.7pt, fill: p.muted)[#contact-line(data.personal.contact)]
    v(0.22em)
    line(length: 100%, stroke: 2pt + p.ink)
  } else if mode == "switch" {
    text(size: 22pt, weight: "bold", fill: p.ink)[#name]
    text(size: 9.2pt, fill: p.accent)[#headline]
    v(0.13em)
    text(size: 7.8pt, fill: p.muted)[#contact-line(data.personal.contact, sep: "  |  ")]
    v(0.28em)
    line(length: 64pt, stroke: 2pt + p.accent)
  } else if mode == "grad" {
    text(size: 25pt, weight: "bold", fill: p.ink)[#name]
    v(0.08em)
    text(size: 9pt, fill: p.accent)[#headline]
    v(0.12em)
    text(size: 7.8pt, fill: p.muted)[#contact-line(data.personal.contact)]
    v(0.26em)
    line(length: 100%, stroke: 0.7pt + p.accent)
  } else if mode == "leadership" {
    align(center, {
      text(size: 21pt, weight: "bold", tracking: 0.05em, fill: p.ink)[#upper(name)]
      v(0.1em)
      text(size: 9pt, style: "italic", fill: p.accent)[#headline]
      v(0.16em)
      text(size: 7.9pt, fill: p.muted)[#contact-line(data.personal.contact, sep: "  ·  ")]
      v(0.2em)
      line(length: 76pt, stroke: 0.8pt + p.accent)
    })
  } else if mode == "casework" {
    text(size: 20pt, weight: "bold", fill: p.ink)[#name]
    v(0.06em)
    text(size: 8.8pt, weight: "bold", fill: p.accent)[#headline]
    v(0.15em)
    text(size: 7.8pt, fill: p.muted)[#contact-line(data.personal.contact, sep: " | ")]
    v(0.16em)
    line(length: 100%, stroke: 1.2pt + p.ink)
  } else if mode == "metrics" {
    text(size: 22pt, weight: "bold", fill: p.ink)[#name]
    v(0.05em)
    text(size: 9.2pt, weight: "bold", fill: p.accent)[#headline]
    v(0.12em)
    text(size: 7.8pt, fill: p.muted)[#contact-line(data.personal.contact)]
    v(0.24em)
    text(size: 8.2pt, weight: "bold", fill: p.accent)[SELECTED OUTCOMES]
    v(0.06em)
    text(size: 8pt)[Reduced deployment lead time 52%  ·  Cut change incidents 38%  ·  40+ services standardized]
    v(0.2em)
    line(length: 100%, stroke: 0.8pt + p.accent)
  } else if mode == "skillsfirst" {
    text(size: 20pt, weight: "bold", fill: p.ink)[#name]
    v(0.05em)
    text(size: 9pt, fill: p.accent)[#headline]
    v(0.12em)
    text(size: 7.7pt, fill: p.muted)[#contact-line(data.personal.contact)]
    v(0.2em)
    line(length: 100%, stroke: 1.4pt + p.accent)
  } else if mode == "credential" {
    text(size: 21pt, weight: "bold", fill: p.ink)[#name]
    v(0.04em)
    text(size: 9pt, fill: p.accent)[#headline]
    v(0.15em)
    text(size: 7.8pt, fill: p.muted)[#contact-line(data.personal.contact)]
    v(0.2em)
    line(length: 100%, stroke: 0.5pt + p.ink)
  } else if mode == "international" {
    text(size: 22pt, weight: "bold", fill: p.ink)[#name]
    v(0.05em)
    text(size: 9.1pt, fill: p.accent)[#headline]
    v(0.12em)
    text(size: 7.8pt, fill: p.muted)[#contact-line(data.personal.contact, sep: "  ·  ")]
    v(0.25em)
    line(length: 100%, stroke: 1pt + p.accent)
  } else if mode == "projectled" {
    text(size: 23pt, weight: "bold", fill: p.ink)[#name]
    v(0.05em)
    text(size: 9.3pt, weight: "bold", fill: p.accent)[#headline]
    v(0.14em)
    text(size: 7.8pt, fill: p.muted)[#contact-line(data.personal.contact)]
    v(0.22em)
    line(length: 36pt, stroke: 2.2pt + p.accent)
  } else if mode == "narrative" {
    text(size: 23pt, weight: "bold", fill: p.ink)[#name]
    v(0.04em)
    text(size: 9.2pt, style: "italic", fill: p.accent)[#headline]
    v(0.1em)
    text(size: 7.7pt, fill: p.muted)[#contact-line(data.personal.contact)]
  } else {
    text(size: 21pt, weight: "bold", fill: p.ink)[#name]
    v(0.05em)
    text(size: 8.9pt, fill: p.accent)[#headline]
    v(0.12em)
    text(size: 7.7pt, fill: p.muted)[#contact-line(data.personal.contact)]
    v(0.2em)
    line(length: 100%, stroke: 0.6pt + p.ink)
  }

  // Purpose-specific section ordering.
  if mode == "impact" or mode == "metrics" {
    if summary != "" { section("Profile", text(fill: p.ink)[#summary], p.accent, rule: "double") }
    if mode == "impact" { section("Core Strengths", render-skills(data, p.accent), p.accent, rule: "short") }
    section("Experience", render-experience(data, p.accent), p.accent, rule: "short")
    section("Selected Projects", render-projects(data, p.accent), p.accent)
    section("Education", render-education(data), p.accent)
    section("Certifications", render-certifications(data), p.accent)
  } else if mode == "switch" {
    section("Transferable Capabilities", render-skills(data, p.accent), p.accent, rule: "double")
    if summary != "" { section("Career Profile", text(fill: p.ink)[#summary], p.accent, rule: "short") }
    section("Experience", render-experience(data, p.accent), p.accent)
    section("Selected Projects", render-projects(data, p.accent), p.accent)
    section("Education", render-education(data), p.accent)
  } else if mode == "grad" {
    section("Education", render-education(data), p.accent, rule: "double")
    section("Selected Projects", render-projects(data, p.accent), p.accent)
    if summary != "" { section("Profile", text(fill: p.ink)[#summary], p.accent) }
    section("Experience", render-experience(data, p.accent), p.accent)
    section("Skills", render-skills(data, p.accent), p.accent)
    section("Certifications", render-certifications(data), p.accent)
  } else if mode == "leadership" {
    if summary != "" { section("Executive Profile", text(fill: p.ink)[#summary], p.accent, rule: "double") }
    section("Leadership Experience", render-experience(data, p.accent), p.accent)
    section("Leadership Toolkit", render-skills(data, p.accent), p.accent)
    section("Selected Initiatives", render-projects(data, p.accent), p.accent)
    section("Education", render-education(data), p.accent)
    section("Credentials", render-certifications(data), p.accent)
  } else if mode == "casework" {
    if summary != "" { section("Profile", text(fill: p.ink)[#summary], p.accent) }
    section("Professional Experience", render-experience(data, p.accent), p.accent, rule: "double")
    section("Casework & Projects", render-projects(data, p.accent), p.accent)
    section("Capabilities", render-skills(data, p.accent), p.accent)
    section("Education", render-education(data), p.accent)
  } else if mode == "skillsfirst" {
    section("Technical Skills", render-skills(data, p.accent), p.accent, rule: "double")
    if summary != "" { section("Summary", text(fill: p.ink)[#summary], p.accent) }
    section("Experience", render-experience(data, p.accent), p.accent)
    section("Projects", render-projects(data, p.accent), p.accent)
    section("Education", render-education(data), p.accent)
    section("Certifications", render-certifications(data), p.accent)
  } else if mode == "credential" {
    section("Certifications", render-certifications(data), p.accent, rule: "double")
    section("Education", render-education(data), p.accent)
    if summary != "" { section("Professional Profile", text(fill: p.ink)[#summary], p.accent) }
    section("Experience", render-experience(data, p.accent), p.accent)
    section("Technical Skills", render-skills(data, p.accent), p.accent)
    section("Projects", render-projects(data, p.accent), p.accent)
  } else if mode == "international" {
    if summary != "" { section("Profile", text(fill: p.ink)[#summary], p.accent, rule: "double") }
    section("Professional Experience", render-experience(data, p.accent), p.accent)
    section("Core Skills", render-skills(data, p.accent), p.accent)
    section("Education", render-education(data), p.accent)
    section("Certifications", render-certifications(data), p.accent)
  } else if mode == "projectled" {
    section("Selected Projects", render-projects(data, p.accent), p.accent, rule: "double")
    if summary != "" { section("Product / Engineering Profile", text(fill: p.ink)[#summary], p.accent) }
    section("Experience", render-experience(data, p.accent), p.accent)
    section("Skills", render-skills(data, p.accent), p.accent)
    section("Education", render-education(data), p.accent)
    section("Certifications", render-certifications(data), p.accent)
  } else if mode == "narrative" {
    if summary != "" { section("About", text(fill: p.ink, size: 9.1pt)[#summary], p.accent, rule: "short") }
    section("Experience", render-experience(data, p.accent), p.accent)
    section("Selected Work", render-projects(data, p.accent), p.accent)
    section("Expertise", render-skills(data, p.accent), p.accent)
    section("Education", render-education(data), p.accent)
  } else {
    if summary != "" { section("Summary", text(fill: p.ink)[#summary], p.accent) }
    section("Work Experience", render-experience(data, p.accent), p.accent)
    section("Skills", render-skills(data, p.accent), p.accent)
    section("Education", render-education(data), p.accent)
    section("Certifications", render-certifications(data), p.accent)
    section("Projects", render-projects(data, p.accent), p.accent)
  }
}
