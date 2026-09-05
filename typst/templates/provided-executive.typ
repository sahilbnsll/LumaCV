// ============================================================
// Template: Executive — Wide-Margin Leadership Serif
// ============================================================
// Design principles:
//  - Generous margins, large centered name in tracked small caps
//  - Charcoal + muted gold accent, double hairline rule
//  - Flowing prose-first sections over dense bullet lists
//  - Restrained, boardroom-appropriate

#import "/lib/utils.typ": parse-bold, clean-link, resolve-variant-field
#import "/lib/theme.typ": font-serif, colors, typo, gap, render-skills-adaptive, render-footer

#let render-executive(data, variant: "default", theme: "executive") = {
  let default-palette = (
    ink: rgb("#1f2328"),
    accent: rgb("#8a6d3b"),
    muted: rgb("#6b7280"),
    marker: rgb("#8a6d3b"),
    link: rgb("#1f2328"),
    name-fill: rgb("#1f2328"),
    headline-fill: rgb("#8a6d3b"),
    company-fill: rgb("#1f2328"),
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

  set page(paper: "a4", margin: (x: 2.1cm, y: 1.6cm), footer: render-footer(t, name))

  set text(font: font-serif, size: 9.2pt, fill: t.ink, hyphenate: false, fallback: true)

  set par(leading: 0.62em, spacing: 0.5em, justify: true, linebreaks: "optimized")

  set list(
    tight: false, spacing: gap.bullet, indent: 0.9em, body-indent: 0.35em,
    marker: (text(fill: t.marker)[—], text(fill: t.marker)[–]),
  )

  show link: set text(fill: t.link)
  show heading: it => it.body

  align(center)[
    #text(size: 21pt, weight: "bold", tracking: 0.06em, fill: t.name-fill)[#upper(name)]
    #if headline != "" [
      #v(0.18em)
      #text(size: 9.6pt, style: "italic", fill: t.headline-fill)[#headline]
    ]
    #v(0.28em)
    #line(length: 42%, stroke: 0.5pt + t.accent)
    #v(0.22em)
    #set text(size: 8.6pt, fill: t.ink)
    #{
      let c = data.personal.contact
      let items = ()
      if "location" in c and c.location != "" { items.push(c.location) }
      if "phone" in c and c.phone != "" { items.push(link("tel:" + c.phone.replace(" ", ""))[#c.phone]) }
      if "email" in c and c.email != "" { items.push(link("mailto:" + c.email)[#c.email]) }
      if "linkedin" in c and c.linkedin != "" { items.push(link("https://" + clean-link(c.linkedin))[#clean-link(c.linkedin)]) }
      if "website" in c and c.website != "" { items.push(link("https://" + clean-link(c.website))[#clean-link(c.website)]) }
      items.join(h(0.4em) + text(fill: t.muted)[|] + h(0.4em))
    }
  ]

  let section(title, body) = {
    v(1.15em)
    block(above: 0pt, below: 0.14em, breakable: false, sticky: true, width: 100%, align(center)[
      #set text(size: 9.5pt, weight: "bold", fill: t.accent, tracking: 0.18em)
      #heading(level: 2, outlined: true, bookmarked: true, upper(title))
      #v(0.1em)
      #line(length: 30%, stroke: 0.5pt + t.accent)
    ])
    v(0.3em)
    body
  }

  let entry-heading(company, role, dates, location) = {
    grid(
      columns: (1fr, auto), column-gutter: 0.8em, align: (left + top, right + top),
      text(size: 9.6pt, weight: "bold", fill: t.ink)[#role], text(size: 8.6pt, style: "italic", fill: t.muted)[#dates],
    )
    v(0.05em)
    grid(
      columns: (1fr, auto), column-gutter: 0.8em, align: (left + top, right + top),
      text(size: 9pt, style: "italic", fill: t.company-fill)[#company],
      if location != "" { text(size: 8.2pt, fill: t.muted)[#location] } else { none },
    )
  }

  if summary != "" { section("Executive Summary", parse-bold(summary)) }
  if skills != () and skills.len() > 0 { section("Core Competencies", render-skills-adaptive(t, skills, max-categories-for-grid: 4)) }

  if "experience" in data and data.experience.len() > 0 {
    section("Leadership Experience", {
      for (i, exp) in data.experience.enumerate() {
        if i > 0 { v(0.85em) }
        block(width: 100%, breakable: false, {
          entry-heading(exp.company, exp.role, exp.dates, if "location" in exp { exp.location } else { "" })
          v(0.2em)
          list(..exp.bullets.map(parse-bold))
        })
      }
    })
  }

  if projects != () and projects.len() > 0 {
    section("Key Initiatives", {
      set list(spacing: 0.44em)
      list(..projects.map(proj => [
        #text(weight: "bold", fill: t.ink)[#proj.name]#if "stack" in proj and proj.stack != "" [ #text(size: 8pt, fill: t.muted)[(#proj.stack)]] — #if "description" in proj [#parse-bold(proj.description)]
      ]))
    })
  }

  if "education" in data and data.education.len() > 0 {
    section("Education", {
      for (i, edu) in data.education.enumerate() {
        if i > 0 { v(0.45em) }
        grid(
          columns: (1fr, auto), column-gutter: 0.8em, align: (left + top, right + top),
          text(size: 9.4pt, weight: "bold", fill: t.ink)[#edu.degree#if "specialization" in edu and edu.specialization != "" [, #edu.specialization]],
          text(size: 8.4pt, style: "italic", fill: t.muted)[#edu.dates],
        )
        if "institution" in edu and edu.institution != "" {
          text(size: 8.6pt, style: "italic", fill: t.muted)[#edu.institution#if "gpa" in edu and edu.gpa != "" [ · #edu.gpa]]
        }
      }
    })
  }

  if "certifications" in data and data.certifications.len() > 0 {
    section("Certifications & Boards", {
      for (i, cert) in data.certifications.enumerate() {
        block(above: if i == 0 { 0pt } else { gap.bullet }, below: 0pt, width: 100%, {
          text(weight: "bold")[#cert.name]
          if "issuer" in cert and cert.issuer != "" [#text(fill: t.muted)[ · #cert.issuer]]
          if "date" in cert and cert.date != "" [#h(1fr) #text(size: 8pt, fill: t.muted)[#cert.date]]
        })
      }
    })
  }
}

#let render = render-executive
