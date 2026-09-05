// ============================================================
// Template: Analyst — Dense Tabular Layout for Data/Finance Roles
// ============================================================
// Design principles:
//  - Metrics-first, boxed skill groups, tight tabular experience rows
//  - Small type, high information density, right-aligned date columns

#import "/lib/utils.typ": parse-bold, clean-link, resolve-variant-field
#import "/lib/theme.typ": font-sans, colors, typo, gap, pg, render-skills-adaptive, render-footer

#let render-analyst(data, variant: "default", theme: "analyst") = {
  let default-palette = (
    ink: rgb("#111827"),
    accent: rgb("#0e7490"),
    muted: rgb("#6b7280"),
    marker: rgb("#0e7490"),
    link: rgb("#0e7490"),
    name-fill: rgb("#111827"),
    headline-fill: rgb("#0e7490"),
    company-fill: rgb("#0e7490"),
  )
  let t = if type(theme) == dictionary { theme } else if type(theme) == str { colors.at(theme, default: default-palette) } else { default-palette }

  let name = data.personal.name
  let headline = resolve-variant-field(data.personal.headline, variant, fallback: "")
  let summary = resolve-variant-field(data.summary, variant, fallback: "")
  let skills = resolve-variant-field(data.skills, variant, fallback: ())
  let projects = resolve-variant-field(data.projects, variant, fallback: ())

  set document(title: if headline != "" { name + " — " + headline } else { name + " — Resume" }, author: name, date: none)
  set page(paper: pg.paper, margin: (x: 1.15cm, y: 1cm), footer: render-footer(t, name))
  set text(font: font-sans, size: 8.2pt, fill: t.ink, hyphenate: false, fallback: true)
  set par(leading: 0.5em, spacing: 0.42em, justify: false, linebreaks: "optimized")
  set list(tight: true, spacing: 0.36em, indent: 0.8em, body-indent: 0.3em, marker: (text(fill: t.marker)[▪], text(fill: t.marker)[–]))
  show link: set text(fill: t.link)
  show heading: it => it.body

  grid(
    columns: (1fr, auto), column-gutter: 0.8em,
    [
      #text(size: 17pt, weight: "bold", fill: t.name-fill)[#name]
      #if headline != "" [ #text(size: 8.4pt, fill: t.headline-fill)[ · #headline]]
    ],
    align(right)[
      #set text(size: 7.4pt, fill: t.muted)
      #{
        let c = data.personal.contact
        let items = ()
        if "email" in c and c.email != "" { items.push(link("mailto:" + c.email)[#c.email]) }
        if "phone" in c and c.phone != "" { items.push(link("tel:" + c.phone.replace(" ", ""))[#c.phone]) }
        if "location" in c and c.location != "" { items.push(c.location) }
        if "linkedin" in c and c.linkedin != "" { items.push(link("https://" + clean-link(c.linkedin))[#clean-link(c.linkedin)]) }
        items.join(" · ")
      }
    ],
  )
  v(0.15em)
  line(length: 100%, stroke: 1.4pt + t.accent)

  let section(title, body) = {
    v(0.85em)
    block(above: 0pt, below: 0.1em, breakable: false, sticky: true, width: 100%, {
      text(size: 8.2pt, weight: "bold", fill: t.accent, tracking: 0.08em)[#heading(level: 2, outlined: true, bookmarked: true, upper(title))]
      v(0.06em)
      line(length: 100%, stroke: 0.4pt + rgb("#d1d5db"))
    })
    v(0.2em)
    body
  }

  if summary != "" { section("Summary", parse-bold(summary)) }

  if skills != () and skills.len() > 0 {
    section("Core Skills", {
      let rows = ()
      for cat in skills {
        let items-text = if "items" in cat { if type(cat.items) == array { cat.items.join(", ") } else { str(cat.items) } } else if "skills" in cat { if type(cat.skills) == array { cat.skills.join(", ") } else { str(cat.skills) } } else { "" }
        rows.push(box(fill: rgb("#f0f9ff"), stroke: 0.4pt + rgb("#bae6fd"), radius: 2pt, inset: (x: 5pt, y: 2.5pt), text(size: 7.2pt)[
          #text(weight: "bold", fill: t.company-fill)[#cat.category:] #items-text
        ]))
      }
      rows.join(v(3pt))
    })
  }

  if "experience" in data and data.experience.len() > 0 {
    section("Experience", {
      for (i, exp) in data.experience.enumerate() {
        if i > 0 { v(0.55em) }
        block(width: 100%, breakable: false, {
          grid(
            columns: (2.2fr, 1fr, auto), column-gutter: 0.5em, align: (left + top, left + top, right + top),
            text(size: 8.6pt, weight: "bold", fill: t.ink)[#exp.role],
            text(size: 8pt, fill: t.company-fill)[#exp.company],
            text(size: 7.6pt, fill: t.muted)[#exp.dates],
          )
          v(0.1em)
          list(..exp.bullets.map(parse-bold))
        })
      }
    })
  }

  if projects != () and projects.len() > 0 {
    section("Projects", {
      set list(spacing: 0.36em)
      list(..projects.map(proj => [
        #text(weight: "bold", fill: t.company-fill)[#proj.name]#if "stack" in proj and proj.stack != "" [ #text(size: 7.6pt, fill: t.muted)[(#proj.stack)]] — #if "description" in proj [#parse-bold(proj.description)]
      ]))
    })
  }

  if "education" in data and data.education.len() > 0 {
    section("Education", {
      for (i, edu) in data.education.enumerate() {
        if i > 0 { v(0.3em) }
        grid(
          columns: (1fr, auto), column-gutter: 0.6em, align: (left + top, right + top),
          text(weight: "bold", fill: t.ink)[#edu.degree#if "institution" in edu and edu.institution != "" [ · #edu.institution]],
          text(size: 7.6pt, fill: t.muted)[#edu.dates],
        )
      }
    })
  }

  if "certifications" in data and data.certifications.len() > 0 {
    section("Certifications", {
      for (i, cert) in data.certifications.enumerate() {
        block(above: if i == 0 { 0pt } else { 0.2em }, below: 0pt, width: 100%, {
          text(weight: "bold")[#cert.name]
          if "issuer" in cert and cert.issuer != "" [#text(fill: t.muted)[ · #cert.issuer]]
          if "date" in cert and cert.date != "" [#h(1fr) #text(size: 7.4pt, fill: t.muted)[#cert.date]]
        })
      }
    })
  }
}

#let render = render-analyst
