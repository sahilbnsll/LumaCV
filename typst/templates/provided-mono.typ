// ============================================================
// Template: Mono — Terminal / Developer Aesthetic
// ============================================================
// Design principles:
//  - Monospace body, black-on-white, single green/amber accent
//  - Header styled like a shell prompt ($ whoami)
//  - Section titles prefixed with "# " (markdown-comment style)
//  - Bullet markers as "- " instead of dots
//  - Zero decoration beyond hairline rules — reads like a config file

#import "/lib/utils.typ": parse-bold, clean-link, resolve-variant-field
#import "/lib/theme.typ": colors, typo, gap, pg, render-skills-adaptive, render-contact-inline, render-footer

#let render-mono(data, variant: "default", theme: "mono") = {
  let default-palette = (
    ink: rgb("#0d0d0d"),
    accent: rgb("#16a34a"),
    muted: rgb("#6b7280"),
    marker: rgb("#16a34a"),
    link: rgb("#16a34a"),
    name-fill: rgb("#0d0d0d"),
    headline-fill: rgb("#16a34a"),
    company-fill: rgb("#16a34a"),
  )
  let t = if type(theme) == dictionary { theme } else if type(theme) == str { colors.at(theme, default: default-palette) } else { default-palette }

  let name = data.personal.name
  let headline = resolve-variant-field(data.personal.headline, variant, fallback: "")
  let summary = resolve-variant-field(data.summary, variant, fallback: "")
  let skills = resolve-variant-field(data.skills, variant, fallback: ())
  let projects = resolve-variant-field(data.projects, variant, fallback: ())

  set document(
    title: if headline != "" { name + " — " + headline } else { name + " — Resume" },
    author: name,
    date: none,
  )

  set page(
    paper: pg.paper,
    margin: (x: 1.35cm, y: 1.1cm),
    footer: render-footer(t, name),
  )

  set text(
    font: ("JetBrains Mono", "Fira Code", "DejaVu Sans Mono", "Consolas"),
    size: 8.3pt,
    fill: t.ink,
    hyphenate: false,
    fallback: true,
  )

  set par(leading: 0.60em, spacing: 0.5em, justify: false, linebreaks: "optimized")

  set list(
    tight: false,
    spacing: gap.bullet,
    indent: 0.9em,
    body-indent: 0.4em,
    marker: (text(fill: t.marker)[-], text(fill: t.marker)[--]),
  )

  show link: set text(fill: t.link)
  show heading: it => it.body

  block(width: 100%, [
    #text(size: 9pt, fill: t.accent)[> whoami]
    #linebreak()
    #text(size: 18pt, weight: "bold", fill: t.name-fill)[#name]
    #if headline != "" [
      #linebreak()
      #text(size: 9pt, fill: t.headline-fill)[#("// " + headline)]
    ]
    #v(0.35em)
    #text(size: 7.6pt, fill: t.muted)[
      #render-contact-inline(t, data, sep: "  ·  ")
    ]
  ])

  v(0.4em)
  line(length: 100%, stroke: 0.5pt + rgb("#d1d5db"))

  let section(title, body) = {
    v(1.0em)
    block(above: 0pt, below: 0.16em, breakable: false, sticky: true, width: 100%, {
      text(size: 8.6pt, weight: "bold", fill: t.accent)[
        #heading(level: 2, outlined: true, bookmarked: true, "# " + lower(title))
      ]
      v(0.1em)
      line(length: 100%, stroke: 0.4pt + rgb("#d1d5db"))
    })
    v(0.28em)
    body
  }

  let entry-heading(company, role, dates, location) = {
    grid(
      columns: (1fr, auto),
      column-gutter: 0.8em,
      align: (left + top, right + top),
      text(size: 9pt, weight: "bold", fill: t.ink)[#role #text(fill: t.company-fill)[\@#company]],
      text(size: 8pt, fill: t.muted)[#dates],
    )
    if location != "" {
      v(0.05em)
      text(size: 7.6pt, fill: t.muted)[#location]
    }
  }

  if summary != "" { section("summary", parse-bold(summary)) }

  if skills != () and skills.len() > 0 {
    section("skills", render-skills-adaptive(t, skills, max-categories-for-grid: 0))
  }

  if "experience" in data and data.experience.len() > 0 {
    section("experience", {
      for (i, exp) in data.experience.enumerate() {
        if i > 0 { v(0.75em) }
        block(width: 100%, breakable: false, {
          entry-heading(exp.company, exp.role, exp.dates, if "location" in exp { exp.location } else { "" })
          v(0.16em)
          list(..exp.bullets.map(parse-bold))
        })
      }
    })
  }

  if projects != () and projects.len() > 0 {
    section("projects", {
      set list(spacing: 0.4em)
      list(..projects.map(proj => [
        #text(weight: "bold", fill: t.company-fill)[#proj.name]#if "stack" in proj and proj.stack != "" [ #text(size: 7.8pt, fill: t.muted)[(#proj.stack)]] — #if "description" in proj [#parse-bold(proj.description)]
      ]))
    })
  }

  if "education" in data and data.education.len() > 0 {
    section("education", {
      for (i, edu) in data.education.enumerate() {
        if i > 0 { v(0.45em) }
        grid(
          columns: (1fr, auto),
          column-gutter: 0.8em,
          align: (left + top, right + top),
          text(size: 8.6pt, weight: "bold")[#edu.degree#if "specialization" in edu and edu.specialization != "" [ · #edu.specialization]],
          text(size: 7.8pt, fill: t.muted)[#edu.dates],
        )
        if "institution" in edu and edu.institution != "" {
          text(size: 7.8pt, fill: t.muted)[#edu.institution#if "gpa" in edu and edu.gpa != "" [ · #edu.gpa]]
        }
      }
    })
  }

  if "certifications" in data and data.certifications.len() > 0 {
    section("certifications", {
      for (i, cert) in data.certifications.enumerate() {
        block(above: if i == 0 { 0pt } else { gap.bullet }, below: 0pt, width: 100%, {
          text(weight: "bold")[#cert.name]
          if "issuer" in cert and cert.issuer != "" [#text(fill: t.muted)[ · #cert.issuer]]
          if "date" in cert and cert.date != "" [#h(1fr) #text(size: 7.8pt, fill: t.muted)[#cert.date]]
        })
      }
    })
  }
}

#let render = render-mono
