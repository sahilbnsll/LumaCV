// ============================================================
// Template: Classic — Refined Serif / Executive / Academic
// ============================================================
// Design principles:
//  - Serif body (Libertinus Serif / New Computer Modern)
//  - Muted navy accent, elegant and restrained
//  - Centered header with generous breathing room
//  - Thin hairline rules under section headings
//  - Professional, timeless aesthetic

#import "/lib/utils.typ": parse-bold, clean-link, resolve-variant-field
#import "/lib/theme.typ": font-serif, colors, typo, gap, pg, render-section-title, render-skills-adaptive, render-footer

#let render-classic(data, variant: "default", theme: "classic") = {
  let t = if type(theme) == dictionary { theme } else if type(theme) == str { colors.at(theme, default: colors.classic) } else { colors.classic }

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
    margin: (x: 1.30cm, y: 1.05cm),
    footer: render-footer(t, name),
  )

  set text(
    font: font-serif,
    size: 9.1pt,
    fill: t.ink,
    hyphenate: false,
    fallback: true,
  )

  set par(
    leading: typo.body-leading,
    spacing: gap.block,
    justify: false,
    linebreaks: "optimized",
  )

  set list(
    tight: false,
    spacing: gap.bullet,
    indent: 0.9em,
    body-indent: 0.35em,
    marker: (text(fill: t.marker)[•], text(fill: t.marker)[–]),
  )

  show link: set text(fill: t.link)
  show heading: it => it.body

  // =========================================================================
  // 👤 SECTION 1: Header (Centered Name, Headline, Contact Links)
  // =========================================================================
  align(center)[
    #text(size: 22pt, weight: "bold", tracking: 0.015em, fill: t.name-fill)[
      #name
    ]
    #if headline != "" [
      #v(0.22em)
      #text(size: 9.6pt, fill: t.headline-fill)[
        #headline
      ]
    ]
    #v(0.30em)
    #set text(size: 8.6pt, fill: t.ink)
    #{
      let c = data.personal.contact
      let items = ()

      if "phone" in c and c.phone != "" {
        items.push(link("tel:" + c.phone.replace(" ", ""))[#c.phone])
      }
      if "email" in c and c.email != "" {
        items.push(link("mailto:" + c.email)[#c.email])
      }
      if "linkedin" in c and c.linkedin != "" {
        let li = clean-link(c.linkedin)
        items.push(link("https://" + li)[#li])
      }
      if "github" in c and c.github != "" {
        let gh = clean-link(c.github)
        items.push(link("https://" + gh)[#gh])
      }
      if "website" in c and c.website != "" {
        let web = clean-link(c.website)
        items.push(link("https://" + web)[#web])
      }
      if "location" in c and c.location != "" {
        items.push(c.location)
      }

      items.join(h(0.40em) + text(fill: t.muted)[|] + h(0.40em))
    }
  ]

  // =========================================================================
  // 📐 Section Header Component (Underlined with thin accent rule)
  // =========================================================================
  let section(title, body) = {
    v(1.05em)
    block(above: 0pt, below: 0.12em, breakable: false, sticky: true, width: 100%, {
      set text(size: 10.5pt, weight: "bold", fill: t.accent)
      heading(level: 2, outlined: true, bookmarked: true, title)
      v(0.12em)
      line(length: 100%, stroke: 0.60pt + t.accent)
    })
    v(0.30em)
    body
  }

  // ----------------------------------------------------------
  // Entry helpers — LaTeX resumeSubheading style
  // ----------------------------------------------------------
  let entry-heading(company, role, dates, location) = {
    grid(
      columns: (1fr, auto),
      column-gutter: 0.8em,
      align: (left + top, right + top),
      text(size: 9.8pt, weight: "bold", fill: t.ink)[#company],
      text(size: 8.6pt, fill: t.muted)[#dates],
    )
    v(0.04em)
    grid(
      columns: (1fr, auto),
      column-gutter: 0.8em,
      align: (left + top, right + top),
      text(size: 9.0pt, weight: "bold", style: "italic", fill: t.accent)[#role],
      if location != "" { text(size: 8.6pt, style: "italic", fill: t.muted)[#location] } else { none },
    )
  }

  // =========================================================================
  // 🎯 SECTION 2: Professional Summary
  // =========================================================================
  if summary != "" {
    section("Professional Summary", parse-bold(summary))
  }

  // =========================================================================
  // 🛠️ SECTION 3: Technical Skills (Adaptive grid or flat list)
  // =========================================================================
  if skills != () and skills.len() > 0 {
    section("Technical Skills", {
      render-skills-adaptive(t, skills)
    })
  }

  // =========================================================================
  // 💼 SECTION 4: Professional Experience (Jobs, Companies, Dates, Bullets)
  // =========================================================================
  if "experience" in data and data.experience.len() > 0 {
    section("Professional Experience", {
      for (i, exp) in data.experience.enumerate() {
        if i > 0 { v(0.80em) }
        block(
          width: 100%,
          breakable: false,
          {
            entry-heading(
              exp.company,
              exp.role,
              exp.dates,
              if "location" in exp { exp.location } else { "" },
            )
            v(0.20em)
            list(..exp.bullets.map(parse-bold))
          },
        )
      }
    })
  }

  // =========================================================================
  // 🚀 SECTION 5: Projects (Standout Initiatives & Tech Stacks)
  // =========================================================================
  if projects != () and projects.len() > 0 {
    section("Projects", {
      set list(spacing: 0.44em)
      list(
        ..projects.map(proj => [
          #text(weight: "bold", fill: t.ink)[#proj.name]#if "stack" in proj and proj.stack != "" [ #text(size: 8.2pt, fill: t.muted)[(#proj.stack)]] — #if "description" in proj [#parse-bold(proj.description)]
        ])
      )
    })
  }

  // =========================================================================
  // 🎓 SECTION 6: Education (Degrees, Institutions, Dates)
  // =========================================================================
  if "education" in data and data.education.len() > 0 {
    section("Education", {
      for (i, edu) in data.education.enumerate() {
        if i > 0 { v(0.40em) }
        block(
          width: 100%,
          breakable: false,
          {
            grid(
              columns: (1fr, auto),
              column-gutter: 0.8em,
              align: (left + top, right + top),
              text(size: 9.6pt, weight: "bold", fill: t.ink)[#if "institution" in edu { edu.institution } else { "" }],
              text(size: 8.8pt, fill: t.muted)[#edu.dates],
            )
            v(0.04em)
            grid(
              columns: (1fr, auto),
              column-gutter: 0.8em,
              align: (left + top, right + top),
              text(size: 9.0pt, fill: t.ink)[#edu.degree#if "specialization" in edu and edu.specialization != "" [ (#edu.specialization)]],
              if "gpa" in edu and edu.gpa != "" { text(size: 8.8pt, fill: t.muted)[CGPA: #edu.gpa] } else { none },
            )
          },
        )
      }
    })
  }

  // =========================================================================
  // 🏆 SECTION 7: Certifications & Awards (Optional)
  // =========================================================================
  if "certifications" in data and data.certifications.len() > 0 {
    section("Certifications", {
      for (i, cert) in data.certifications.enumerate() {
        block(
          above: if i == 0 { 0pt } else { gap.bullet },
          below: 0pt,
          width: 100%,
          {
            text(weight: "bold")[#cert.name]
            if "issuer" in cert and cert.issuer != "" [#text(fill: t.muted)[ · #cert.issuer]]
            if "date" in cert and cert.date != "" [#h(1fr) #text(size: 8.2pt, fill: t.muted)[#cert.date]]
          },
        )
      }
    })
  }
}

#let render = render-classic
