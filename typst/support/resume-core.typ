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
      if i > 0 { v(0.55em) }
      block(width: 100%, breakable: false, [
        #text(size: 8.9pt, weight: "bold")[#p.name]
        #if "stack" in p and p.stack != "" { text(size: 7.8pt, fill: rgb("#6b7280"))[ · #p.stack] }
        #if "dates" in p and p.dates != "" { text(size: 7.8pt, fill: rgb("#6b7280"))[ · #p.dates] }
        #if "description" in p and p.description != "" { text()[ — #p.description] }
        #let bullets = if "bullets" in p and p.bullets.len() > 0 { p.bullets } else { () }
        #let impactBullets = if "impactBullets" in p and p.impactBullets.len() > 0 { p.impactBullets } else { () }
        #let allBullets = bullets + impactBullets
        #if allBullets.len() > 0 {
          v(0.18em)
          list(..allBullets)
        }
      ])
    }
  }
}

#let render-education(data) = {
  if "education" in data and data.education.len() > 0 {
    for (i, edu) in data.education.enumerate() {
      if i > 0 { v(0.4em) }
      grid(
        columns: (1fr, auto),
        column-gutter: 0.8em,
        [
          #text(size: 8.9pt, weight: "bold")[#edu.degree]
          #if "specialization" in edu and edu.specialization != "" [ · #text(size: 8.4pt, style: "italic", fill: rgb("#4b5563"))[#edu.specialization]]
          #linebreak()
          #text(size: 8.2pt, fill: rgb("#374151"))[#edu.institution]
        ],
        align(right)[
          #text(size: 8.1pt, fill: rgb("#6b7280"))[#edu.dates]
          #if "gpa" in edu and edu.gpa != "" [ \ #text(size: 7.8pt, fill: rgb("#6b7280"))[GPA: #edu.gpa]]
        ]
      )
    }
  }
}

#let render-certifications(data, ..args) = {
  if "certifications" in data and data.certifications.len() > 0 {
    for (i, c) in data.certifications.enumerate() {
      if i > 0 { v(0.28em) }
      text(size: 8.6pt, weight: "bold")[#c.name]
      if "issuer" in c and c.issuer != "" { text(size: 8pt, fill: rgb("#4b5563"))[ · #c.issuer] }
      if "date" in c and c.date != "" { text(size: 8pt, fill: rgb("#6b7280"))[ · #c.date] }
    }
  }
}

#let render-languages(data) = {
  if "languages" in data and data.languages.len() > 0 {
    let items = ()
    for lang in data.languages {
      let l-name = if type(lang) == dictionary { lang.name } else { str(lang) }
      let l-prof = if type(lang) == dictionary and "proficiency" in lang and lang.proficiency != "" { " (" + lang.proficiency + ")" } else { "" }
      items.push(l-name + l-prof)
    }
    text(size: 8.4pt)[#items.join("  ·  ")]
  }
}

#let render-publications(data, ..args) = {
  let accent = if args.pos().len() > 0 { args.pos().at(0) } else if "accent" in args.named() { args.named().at("accent") } else { rgb("#2563eb") }
  if "publications" in data and data.publications.len() > 0 {
    for (i, pub) in data.publications.enumerate() {
      if i > 0 { v(0.28em) }
      let pubTitle = if "title" in pub and pub.title != "" { pub.title } else if "name" in pub { pub.name } else { "" }
      text(size: 8.6pt, weight: "bold")[#pubTitle]
      if "publisher" in pub and pub.publisher != "" { text(size: 8pt, fill: rgb("#4b5563"))[ · #pub.publisher] }
      if "date" in pub and pub.date != "" { text(size: 8pt, fill: rgb("#6b7280"))[ · #pub.date] }
      if "url" in pub and pub.url != "" { text(size: 8pt, fill: accent)[ · #link(pub.url)[#pub.url]] }
    }
  }
}

#let render-open-source(data, ..args) = {
  if "openSource" in data and data.openSource.len() > 0 {
    for (i, os) in data.openSource.enumerate() {
      if i > 0 { v(0.35em) }
      text(size: 8.8pt, weight: "bold")[#os.project]
      if "role" in os and os.role != "" { text(size: 8.2pt, fill: rgb("#4b5563"))[ · #os.role] }
      if "stars" in os and os.stars != "" { text(size: 8pt, fill: rgb("#6b7280"))[ · ★ #os.stars] }
      if "description" in os and os.description != "" { linebreak(); text(size: 8.2pt)[#os.description] }
      if "bullets" in os and os.bullets.len() > 0 {
        v(0.12em)
        bullets(os.bullets)
      }
    }
  }
}

#let render-leadership(data, ..args) = {
  if "leadership" in data and data.leadership.len() > 0 {
    for (i, lead) in data.leadership.enumerate() {
      if i > 0 { v(0.35em) }
      text(size: 8.8pt, weight: "bold")[#lead.role]
      if "organization" in lead and lead.organization != "" { text(size: 8.2pt, fill: rgb("#4b5563"))[ · #lead.organization] }
      if "dates" in lead and lead.dates != "" { text(size: 8pt, fill: rgb("#6b7280"))[ · #lead.dates] }
      if "description" in lead and lead.description != "" { linebreak(); text(size: 8.2pt)[#lead.description] }
      if "bullets" in lead and lead.bullets.len() > 0 {
        v(0.12em)
        bullets(lead.bullets)
      }
    }
  }
}

#let render-volunteering(data, ..args) = {
  if "volunteering" in data and data.volunteering.len() > 0 {
    for (i, vol) in data.volunteering.enumerate() {
      if i > 0 { v(0.35em) }
      text(size: 8.8pt, weight: "bold")[#vol.role]
      if "organization" in vol and vol.organization != "" { text(size: 8.2pt, fill: rgb("#4b5563"))[ · #vol.organization] }
      if "dates" in vol and vol.dates != "" { text(size: 8pt, fill: rgb("#6b7280"))[ · #vol.dates] }
      if "bullets" in vol and vol.bullets.len() > 0 {
        v(0.12em)
        bullets(vol.bullets)
      }
    }
  }
}

#let render-conferences(data, ..args) = {
  if "conferences" in data and data.conferences.len() > 0 {
    for (i, conf) in data.conferences.enumerate() {
      if i > 0 { v(0.28em) }
      text(size: 8.6pt, weight: "bold")[#conf.name]
      if "role" in conf and conf.role != "" { text(size: 8pt, fill: rgb("#4b5563"))[ · #conf.role] }
      if "date" in conf and conf.date != "" { text(size: 8pt, fill: rgb("#6b7280"))[ · #conf.date] }
    }
  }
}

#let render-interests(data) = {
  if "interests" in data and data.interests.len() > 0 {
    let items = ()
    for item in data.interests {
      let t = if type(item) == dictionary and "name" in item { item.name } else { str(item) }
      items.push(t)
    }
    text(size: 8.2pt)[#items.join("  ·  ")]
  }
}

#let section(title, body, accent, rule: "thin") = {
  v(0.85em)
  block(width: 100%, breakable: false, sticky: true, [
    #text(size: 8.4pt, weight: "bold", tracking: 0.12em, fill: accent)[#upper(title)]
    #v(0.08em)
    #if rule == "double" {
      line(length: 100%, stroke: 1.1pt + accent)
      v(0.07em)
      line(length: 100%, stroke: 0.4pt + rgb("#d1d5db"))
    } else if rule == "short" {
      line(length: 42pt, stroke: 1.4pt + accent)
    } else {
      line(length: 100%, stroke: 0.45pt + rgb("#d1d5db"))
    }
  ])
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
    v(0.06em)
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
    if "keyMetrics" in data and data.keyMetrics.len() > 0 {
      v(0.24em)
      text(size: 8.2pt, weight: "bold", fill: p.accent)[SELECTED OUTCOMES]
      v(0.06em)
      let metric-parts = ()
      for m in data.keyMetrics {
        metric-parts.push(m.label + ": " + m.value)
      }
      text(size: 8pt)[#metric-parts.join("  ·  ")]
    }
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

  // Section ordering: honors user's custom sectionOrder if provided; otherwise falls back to mode-specific ordering.
  let has-custom-order = "sectionOrder" in data and type(data.sectionOrder) == array and data.sectionOrder.len() > 0

  if has-custom-order {
    let default-order = (
      "summary", "techStackSummary", "skills", "keyMetrics", "experience",
      "internships", "education", "projects", "certifications", "achievements",
      "openSource", "publications", "leadership", "volunteering", "conferences",
      "languages", "interests", "products", "devopsContributions", "securityContributions",
      "additionalInfo", "customSections"
    )
    let active-order = ()
    for k in data.sectionOrder {
      if not active-order.contains(k) { active-order.push(k) }
    }
    for k in default-order {
      if not active-order.contains(k) { active-order.push(k) }
    }

    for sec in active-order {
      if sec == "summary" and summary != "" {
        section("Profile", text(fill: p.ink)[#summary], p.accent)
      } else if sec == "techStackSummary" and "techStackSummary" in data and data.techStackSummary != "" {
        section("Tech Stack", text(fill: p.ink)[#data.techStackSummary], p.accent)
      } else if sec == "skills" and "skills" in data and data.skills.len() > 0 {
        section("Core Skills", render-skills(data, p.accent), p.accent)
      } else if sec == "keyMetrics" and "keyMetrics" in data and data.keyMetrics.len() > 0 {
        section("Key Metrics", {
          for (i, m) in data.keyMetrics.enumerate() {
            if i > 0 { v(0.25em) }
            [#text(weight: "bold")[#m.label]: #text(fill: p.accent)[#m.value]#if "context" in m and m.context != "" [ — #text(size: 8.2pt, fill: p.muted)[#m.context]]]
          }
        }, p.accent)
      } else if sec == "experience" and "experience" in data and data.experience.len() > 0 {
        section("Experience", render-experience(data, p.accent), p.accent)
      } else if sec == "internships" and "internships" in data and data.internships.len() > 0 {
        section("Internships", render-experience((experience: data.internships), p.accent), p.accent)
      } else if sec == "projects" and "projects" in data and data.projects.len() > 0 {
        section("Selected Projects", render-projects(data, p.accent), p.accent)
      } else if sec == "education" and "education" in data and data.education.len() > 0 {
        section("Education", render-education(data), p.accent)
      } else if sec == "certifications" and "certifications" in data and data.certifications.len() > 0 {
        section("Certifications", render-certifications(data, accent: p.accent), p.accent)
      } else if sec == "achievements" and "achievements" in data and data.achievements.len() > 0 {
        section("Achievements", {
          for (i, a) in data.achievements.enumerate() {
            if i > 0 { v(0.25em) }
            let aTitle = if "title" in a and a.title != "" { a.title } else if "name" in a { a.name } else { "" }
            text(size: 8.6pt, weight: "bold")[#aTitle]
            if "awarder" in a and a.awarder != "" { text(size: 8pt, fill: rgb("#4b5563"))[ · #a.awarder] }
            if "date" in a and a.date != "" { text(size: 8pt, fill: rgb("#6b7280"))[ · #a.date] }
          }
        }, p.accent)
      } else if sec == "openSource" and "openSource" in data and data.openSource.len() > 0 {
        section("Open Source", render-open-source(data, p.accent), p.accent)
      } else if sec == "publications" and "publications" in data and data.publications.len() > 0 {
        section("Publications", render-publications(data, p.accent), p.accent)
      } else if sec == "leadership" and "leadership" in data and data.leadership.len() > 0 {
        section("Leadership", render-leadership(data, p.accent), p.accent)
      } else if sec == "volunteering" and "volunteering" in data and data.volunteering.len() > 0 {
        section("Volunteering", render-volunteering(data, p.accent), p.accent)
      } else if sec == "conferences" and "conferences" in data and data.conferences.len() > 0 {
        section("Conferences & Speaking", render-conferences(data, accent: p.accent), p.accent)
      } else if sec == "languages" and "languages" in data and data.languages.len() > 0 {
        section("Languages", render-languages(data), p.accent)
      } else if sec == "interests" and "interests" in data and data.interests.len() > 0 {
        section("Interests", render-interests(data), p.accent)
      } else if sec == "customSections" and "customSections" in data and data.customSections.len() > 0 {
        for cs in data.customSections {
          section(cs.title, bullets(cs.items), p.accent)
        }
      }
    }
  } else {
    // Mode-specific base layout
    if mode == "impact" or mode == "metrics" {
      if summary != "" { section("Profile", text(fill: p.ink)[#summary], p.accent, rule: "double") }
      if mode == "impact" { section("Core Strengths", render-skills(data, p.accent), p.accent, rule: "short") }
      section("Experience", render-experience(data, p.accent), p.accent, rule: "short")
      section("Selected Projects", render-projects(data, p.accent), p.accent)
      section("Education", render-education(data), p.accent)
      section("Certifications", render-certifications(data, accent: p.accent), p.accent)
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
      section("Certifications", render-certifications(data, accent: p.accent), p.accent)
    } else if mode == "leadership" {
      if summary != "" { section("Executive Profile", text(fill: p.ink)[#summary], p.accent, rule: "double") }
      section("Leadership Experience", render-experience(data, p.accent), p.accent)
      section("Leadership Toolkit", render-skills(data, p.accent), p.accent)
      section("Selected Initiatives", render-projects(data, p.accent), p.accent)
      section("Education", render-education(data), p.accent)
      section("Credentials", render-certifications(data, accent: p.accent), p.accent)
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
      section("Certifications", render-certifications(data, accent: p.accent), p.accent)
    } else if mode == "credential" {
      section("Certifications", render-certifications(data, accent: p.accent), p.accent, rule: "double")
      section("Education", render-education(data), p.accent)
      if summary != "" { section("Professional Profile", text(fill: p.ink)[#summary], p.accent) }
      section("Experience", render-experience(data, p.accent), p.accent)
      section("Technical Skills", render-skills(data, p.accent), p.accent)
      section("Projects", render-projects(data, p.accent), p.accent)
    } else if mode == "international" {
      if summary != "" { section("Profile", text(fill: p.ink)[#summary], p.accent, rule: "double") }
      section("Professional Experience", render-experience(data, p.accent), p.accent)
      section("Projects", render-projects(data, p.accent), p.accent)
      section("Core Skills", render-skills(data, p.accent), p.accent)
      section("Education", render-education(data), p.accent)
      section("Certifications", render-certifications(data, accent: p.accent), p.accent)
    } else if mode == "projectled" {
      section("Selected Projects", render-projects(data, p.accent), p.accent, rule: "double")
      if summary != "" { section("Product / Engineering Profile", text(fill: p.ink)[#summary], p.accent) }
      section("Experience", render-experience(data, p.accent), p.accent)
      section("Skills", render-skills(data, p.accent), p.accent)
      section("Education", render-education(data), p.accent)
      section("Certifications", render-certifications(data, accent: p.accent), p.accent)
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
      section("Certifications", render-certifications(data, accent: p.accent), p.accent)
      section("Projects", render-projects(data, p.accent), p.accent)
    }

    // Extended sections appended if present
    if "achievements" in data and data.achievements.len() > 0 {
      section("Achievements", {
        for (i, a) in data.achievements.enumerate() {
          if i > 0 { v(0.25em) }
          let aTitle = if "title" in a and a.title != "" { a.title } else if "name" in a { a.name } else { "" }
          text(size: 8.6pt, weight: "bold")[#aTitle]
          if "awarder" in a and a.awarder != "" { text(size: 8pt, fill: rgb("#4b5563"))[ · #a.awarder] }
          if "date" in a and a.date != "" { text(size: 8pt, fill: rgb("#6b7280"))[ · #a.date] }
        }
      }, p.accent)
    }
    if "openSource" in data and data.openSource.len() > 0 { section("Open Source", render-open-source(data, p.accent), p.accent) }
    if "publications" in data and data.publications.len() > 0 { section("Publications", render-publications(data, p.accent), p.accent) }
    if "leadership" in data and data.leadership.len() > 0 { section("Leadership", render-leadership(data, p.accent), p.accent) }
    if "volunteering" in data and data.volunteering.len() > 0 { section("Volunteering", render-volunteering(data, p.accent), p.accent) }
    if "conferences" in data and data.conferences.len() > 0 { section("Conferences & Speaking", render-conferences(data, accent: p.accent), p.accent) }
    if "languages" in data and data.languages.len() > 0 { section("Languages", render-languages(data), p.accent) }
    if "interests" in data and data.interests.len() > 0 { section("Interests", render-interests(data), p.accent) }
    if "customSections" in data and data.customSections.len() > 0 {
      for cs in data.customSections {
        section(cs.title, bullets(cs.items), p.accent)
      }
    }
  }
}
