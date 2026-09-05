// ============================================================
// Template: Academic — Formal CV with Publications
// ============================================================
// Design principles:
//  - Serif, formal, research-oriented section ordering
//  - Optional "Publications" section (guarded — only renders if present)
//  - Understated, no color decoration beyond a single hairline accent

#import "/lib/utils.typ": parse-bold, clean-link, resolve-variant-field
#import "/lib/theme.typ": font-serif, colors, typo, gap, pg, render-skills-adaptive, render-footer

#let render-academic(data, variant: "default", theme: "academic") = {
  let default-palette = (
    ink: rgb("#1c1c1c"),
    accent: rgb("#374151"),
    muted: rgb("#6b7280"),
    marker: rgb("#374151"),
    link: rgb("#1c1c1c"),
    name-fill: rgb("#1c1c1c"),
    headline-fill: rgb("#374151"),
    company-fill: rgb("#1c1c1c"),
  )
  let t = if type(theme) == dictionary { theme } else if type(theme) == str { colors.at(theme, default: default-palette) } else { default-palette }

  let name = data.personal.name
  let headline = resolve-variant-field(data.personal.headline, variant, fallback: "")
  let summary = resolve-variant-field(data.summary, variant, fallback: "")
  let skills = resolve-variant-field(data.skills, variant, fallback: ())
  let projects = resolve-variant-field(data.projects, variant, fallback: ())

  set document(title: name + " — Curriculum Vitae", author: name, date: none)
  set page(paper: pg.paper, margin: (x: 1.6cm, y: 1.3cm), footer: render-footer(t, name))
  set text(font: font-serif, size: 9.2pt, fill: t.ink, hyphenate: false, fallback: true)
  set par(leading: 0.6em, spacing: 0.5em, justify: true, linebreaks: "optimized")
  set list(tight: false, spacing: gap.bullet, indent: 0.9em, body-indent: 0.35em, marker: (text(fill: t.marker)[•], text(fill: t.marker)[–]))
  show link: set text(fill: t.link)
  show heading: it => it.body

  align(center)[
    #text(size: 18pt, weight: "bold", fill: t.name-fill)[#name]
    #if headline != "" [
      #v(0.15em)
      #text(size: 9.4pt, style: "italic", fill: t.headline-fill)[#headline]
    ]
    #v(0.25em)
    #set text(size: 8.4pt, fill: t.ink)
    #{
      let c = data.personal.contact
      let items = ()
      if "email" in c and c.email != "" { items.push(link("mailto:" + c.email)[#c.email]) }
      if "phone" in c and c.phone != "" { items.push(link("tel:" + c.phone.replace(" ", ""))[#c.phone]) }
      if "location" in c and c.location != "" { items.push(c.location) }
      if "website" in c and c.website != "" { items.push(link("https://" + clean-link(c.website))[#clean-link(c.website)]) }
      if "linkedin" in c and c.linkedin != "" { items.push(link("https://" + clean-link(c.linkedin))[#clean-link(c.linkedin)]) }
      items.join(h(0.35em) + text(fill: t.muted)[|] + h(0.35em))
    }
  ]

  let section(title, body) = {
    v(1.1em)
    block(above: 0pt, below: 0.12em, breakable: false, sticky: true, width: 100%, {
      set text(size: 10pt, weight: "bold", fill: t.accent)
      heading(level: 2, outlined: true, bookmarked: true, upper(title))
      v(0.1em)
      line(length: 100%, stroke: 0.6pt + t.accent)
    })
    v(0.28em)
    body
  }

  if summary != "" { section("Research Summary", parse-bold(summary)) }

  if "education" in data and data.education.len() > 0 {
    section("Education", {
      for (i, edu) in data.education.enumerate() {
        if i > 0 { v(0.45em) }
        grid(
          columns: (1fr, auto), column-gutter: 0.8em, align: (left + top, right + top),
          text(weight: "bold", fill: t.ink)[#edu.degree#if "specialization" in edu and edu.specialization != "" [, #edu.specialization]],
          text(size: 8.4pt, fill: t.muted)[#edu.dates],
        )
        if "institution" in edu and edu.institution != "" {
          text(size: 8.8pt, style: "italic", fill: t.muted)[#edu.institution#if "gpa" in edu and edu.gpa != "" [ · #edu.gpa]]
        }
      }
    })
  }

  if "experience" in data and data.experience.len() > 0 {
    section("Academic & Professional Experience", {
      for (i, exp) in data.experience.enumerate() {
        if i > 0 { v(0.75em) }
        block(width: 100%, breakable: false, {
          grid(
            columns: (1fr, auto), column-gutter: 0.8em, align: (left + top, right + top),
            text(weight: "bold", fill: t.ink)[#exp.role, #text(style: "italic")[#exp.company]],
            text(size: 8.4pt, fill: t.muted)[#exp.dates],
          )
          v(0.15em)
          list(..exp.bullets.map(parse-bold))
        })
      }
    })
  }

  if "publications" in data and data.publications.len() > 0 {
    section("Publications", {
      for (i, pub) in data.publications.enumerate() {
        let cit = if "citation" in pub and pub.citation != "" { pub.citation } else if "title" in pub { pub.title + if "publisher" in pub and pub.publisher != "" { ", " + pub.publisher } else { "" } + if "date" in pub and pub.date != "" { " (" + pub.date + ")" } else { "" } } else { "" }
        block(above: if i == 0 { 0pt } else { 0.4em }, below: 0pt, width: 100%, [
          #parse-bold(cit)
        ])
      }
    })
  }

  if skills != () and skills.len() > 0 { section("Technical Skills", render-skills-adaptive(t, skills, max-categories-for-grid: 4)) }

  if projects != () and projects.len() > 0 {
    section("Projects", {
      set list(spacing: 0.44em)
      list(..projects.map(proj => [
        #text(weight: "bold", fill: t.ink)[#proj.name]#if "stack" in proj and proj.stack != "" [ #text(size: 8pt, fill: t.muted)[(#proj.stack)]] — #if "description" in proj [#parse-bold(proj.description)]
      ]))
    })
  }

  if "certifications" in data and data.certifications.len() > 0 {
    section("Certifications & Awards", {
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

#let render = render-academic
