// ============================================================
// Template: ATS-Safe — Zero Decoration / Pure Text Extraction
// ============================================================
// Design principles:
//  - Sans-serif body, pure black text
//  - No icons, no colour accents, no decoration
//  - Single-column layout for maximum parser compatibility
//  - Plain pipe separators for contact info
//  - Everything extractable as literal text

#import "/lib/utils.typ": parse-bold, clean-link, resolve-variant-field
#import "/lib/theme.typ": font-sans, colors, typo, gap, pg, render-skills-adaptive, render-footer

#let render-ats-safe(data, variant: "default", theme: "ats-safe") = {
  let t = if type(theme) == dictionary { theme } else if type(theme) == str { colors.at(theme, default: colors.at("ats-safe")) } else { colors.at("ats-safe") }

  let name = data.personal.name
  let headline = resolve-variant-field(data.personal.headline, variant, fallback: "")
  let summary = resolve-variant-field(data.summary, variant, fallback: "")
  let skills = resolve-variant-field(data.skills, variant, fallback: ())
  let projects = resolve-variant-field(data.projects, variant, fallback: ())

  // ----------------------------------------------------------
  // Document setup
  // ----------------------------------------------------------
  set document(
    title: if headline != "" { name + " — " + headline } else { name + " — Resume" },
    author: name,
    date: none,
  )

  set page(
    paper: pg.paper,
    margin: (x: 1.50cm, y: 1.30cm),
    footer: render-footer(t, name),
  )

  set text(
    font: font-sans,
    size: 8.8pt,
    fill: t.ink,
    ligatures: false,
    hyphenate: false,
    fallback: true,
  )

  set par(
    leading: 0.56em,
    spacing: 0.48em,
    justify: false,
    linebreaks: "optimized",
  )

  set list(
    tight: false,
    spacing: gap.bullet,
    indent: 0.85em,
    body-indent: 0.35em,
    marker: (text(fill: t.marker)[•], text(fill: t.marker)[–]),
  )

  show heading: it => it.body
  show link: set text(fill: t.link)

  // =========================================================================
  // 👤 SECTION 1: Header (Centered Clean Text for ATS Scanners)
  // =========================================================================
  align(center)[
    #text(size: 20pt, weight: "bold", tracking: 0.02em, fill: t.name-fill)[
      #name
    ]
    #if headline != "" [
      #v(0.18em)
      #text(size: 9.2pt, weight: "bold", fill: t.accent)[
        #headline
      ]
    ]
    #v(0.25em)
    #set text(size: 8pt)
    #{
      let c = data.personal.contact
      let items = ()

      if "phone" in c and c.phone != "" {
        items.push(c.phone)
      }
      if "email" in c and c.email != "" {
        items.push(c.email)
      }
      if "linkedin" in c and c.linkedin != "" {
        items.push(clean-link(c.linkedin))
      }
      if "github" in c and c.github != "" {
        items.push(clean-link(c.github))
      }
      if "website" in c and c.website != "" {
        items.push(clean-link(c.website))
      }
      if "location" in c and c.location != "" {
        items.push(c.location)
      }

      items.join(" | ")
    }
  ]

  // =========================================================================
  // 📐 Section Header Component (100% Linear Single Column for ATS)
  // =========================================================================
  let section(title, body) = {
    v(1.10em)
    block(above: 0pt, below: 0.14em, breakable: false, sticky: true, width: 100%, {
      set text(size: 9pt, weight: "bold", tracking: 0.06em, fill: t.accent)
      heading(level: 2, outlined: true, bookmarked: true, upper(title))
      v(0.14em)
      line(length: 100%, stroke: 0.75pt + t.accent)
    })
    v(0.40em)
    body
  }

  // =========================================================================
  // 🎯 SECTION 2: Professional Summary
  // =========================================================================
  if summary != "" {
    section("Summary", parse-bold(summary))
  }

  // =========================================================================
  // 🛠️ SECTION 3: Technical Skills
  // =========================================================================
  if skills != () and skills.len() > 0 {
    section("Skills", {
      render-skills-adaptive(t, skills, max-categories-for-grid: 0)
    })
  }

  // =========================================================================
  // 💼 SECTION 4: Work Experience
  // =========================================================================
  if "experience" in data and data.experience.len() > 0 {
    section("Work Experience", {
      for (i, exp) in data.experience.enumerate() {
        if i > 0 { v(0.80em) }
        block(
          width: 100%,
          breakable: false,
          {
            grid(
              columns: (1fr, auto),
              column-gutter: 0.8em,
              align: (left + top, right + top),
              {
                text(size: 9.2pt, weight: "bold", fill: t.ink)[#exp.role]
                text(size: 9.2pt, weight: "bold", fill: t.company-fill)[ – #exp.company]
                if "location" in exp and exp.location != "" {
                  text(size: 8pt, fill: t.muted)[ · #exp.location]
                }
              },
              text(size: 8.4pt, fill: t.muted)[#exp.dates],
            )
            v(0.22em)
            list(..exp.bullets.map(parse-bold))
          },
        )
      }
    })
  }

  // =========================================================================
  // 🚀 SECTION 5: Projects
  // =========================================================================
  if projects != () and projects.len() > 0 {
    section("Projects", {
      set list(spacing: 0.44em)
      list(
        ..projects.map(proj => [
          #text(weight: "bold", fill: t.company-fill)[#proj.name]#if "stack" in proj and proj.stack != "" [ (#proj.stack)] — #if "description" in proj [#parse-bold(proj.description)]
        ])
      )
    })
  }

  // =========================================================================
  // 🎓 SECTION 6: Education
  // =========================================================================
  if "education" in data and data.education.len() > 0 {
    section("Education", {
      for (i, edu) in data.education.enumerate() {
        block(
          above: if i == 0 { 0pt } else { 0.55em },
          below: 0pt,
          breakable: false,
          width: 100%,
          {
            grid(
              columns: (1fr, auto),
              column-gutter: 0.8em,
              align: (left + top, right + top),
              {
                text(weight: "bold", size: 9pt, fill: t.ink)[#edu.degree]
                if "specialization" in edu and edu.specialization != "" {
                  text(size: 8.4pt, fill: t.muted)[ – #edu.specialization]
                }
                linebreak()
                v(0.06em)
                text(size: 8.4pt, weight: "medium", fill: t.company-fill)[#edu.institution#if "gpa" in edu and edu.gpa != "" [ (#edu.gpa)]]
              },
              text(size: 8.4pt, fill: t.muted)[#edu.dates],
            )
          },
        )
      }
    })
  }

  // =========================================================================
  // 🏆 SECTION 7: Certifications & Awards
  // =========================================================================
  if "certifications" in data and data.certifications.len() > 0 {
    section("Certifications", {
      for (i, cert) in data.certifications.enumerate() {
        block(
          above: if i == 0 { 0pt } else { gap.bullet },
          below: 0pt,
          width: 100%,
          {
            text(weight: "bold", fill: t.company-fill)[#cert.name]
            if "issuer" in cert and cert.issuer != "" [#text(fill: t.muted)[ – ]#cert.issuer]
            if "date" in cert and cert.date != "" [#h(1fr) #text(size: 8.2pt, fill: t.muted)[#cert.date]]
          },
        )
      }
    })
  }
}


#let render = render-ats-safe
