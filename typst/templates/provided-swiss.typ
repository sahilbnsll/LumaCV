// ============================================================
// Template: Swiss — Editorial Grid, High Type Contrast
// ============================================================
// Design principles:
//  - Huge tracked name vs. tiny meta text — strong type-scale contrast
//  - Thick black rule, mostly black/white with a single accent underline
//  - Asymmetric header (name left, contact stacked tight top-right)

#import "/lib/utils.typ": parse-bold, clean-link, resolve-variant-field
#import "/lib/theme.typ": font-sans, colors, typo, gap, pg, render-skills-adaptive, render-footer

#let render-swiss(data, variant: "default", theme: "swiss") = {
  let default-palette = (
    ink: rgb("#000000"),
    accent: rgb("#dc2626"),
    muted: rgb("#525252"),
    marker: rgb("#000000"),
    link: rgb("#000000"),
    name-fill: rgb("#000000"),
    headline-fill: rgb("#525252"),
    company-fill: rgb("#000000"),
  )
  let t = if type(theme) == dictionary { theme } else if type(theme) == str { colors.at(theme, default: default-palette) } else { default-palette }

  let name = data.personal.name
  let headline = resolve-variant-field(data.personal.headline, variant, fallback: "")
  let summary = resolve-variant-field(data.summary, variant, fallback: "")
  let skills = resolve-variant-field(data.skills, variant, fallback: ())
  let projects = resolve-variant-field(data.projects, variant, fallback: ())

  set document(title: if headline != "" { name + " — " + headline } else { name + " — Resume" }, author: name, date: none)
  set page(paper: pg.paper, margin: (x: 1.3cm, y: 1.15cm), footer: render-footer(t, name))
  set text(font: font-sans, size: 8.6pt, fill: t.ink, hyphenate: false, fallback: true)
  set par(leading: 0.55em, spacing: 0.46em, justify: false, linebreaks: "optimized")
  set list(tight: false, spacing: gap.bullet, indent: 0.85em, body-indent: 0.35em, marker: (text(fill: t.marker)[—], text(fill: t.marker)[–]))
  show link: set text(fill: t.link)
  show heading: it => it.body

  grid(
    columns: (1fr, auto), column-gutter: 1em, align: (left + bottom, right + bottom),
    text(size: 30pt, weight: "black", tracking: -0.01em, fill: t.name-fill)[#name],
    align(right)[
      #set text(size: 7.6pt, fill: t.muted)
      #{
        let c = data.personal.contact
        let items = ()
        if "email" in c and c.email != "" { items.push(link("mailto:" + c.email)[#c.email]) }
        if "phone" in c and c.phone != "" { items.push(link("tel:" + c.phone.replace(" ", ""))[#c.phone]) }
        if "location" in c and c.location != "" { items.push(c.location) }
        if "linkedin" in c and c.linkedin != "" { items.push(link("https://" + clean-link(c.linkedin))[#clean-link(c.linkedin)]) }
        items.join(linebreak())
      }
    ],
  )
  if headline != "" {
    v(0.1em)
    text(size: 10pt, fill: t.headline-fill)[#headline]
  }
  v(0.2em)
  line(length: 100%, stroke: 2.4pt + t.ink)
  v(0.05em)
  line(length: 100%, stroke: 1pt + t.accent)

  let section(title, body) = {
    v(1.1em)
    block(above: 0pt, below: 0.14em, breakable: false, sticky: true, width: 100%, {
      text(size: 8.4pt, weight: "bold", tracking: 0.2em, fill: t.ink)[#heading(level: 2, outlined: true, bookmarked: true, upper(title))]
    })
    v(0.28em)
    body
  }

  if summary != "" { section("Summary", parse-bold(summary)) }
  if skills != () and skills.len() > 0 { section("Skills", render-skills-adaptive(t, skills, max-categories-for-grid: 4)) }

  if "experience" in data and data.experience.len() > 0 {
    section("Experience", {
      for (i, exp) in data.experience.enumerate() {
        if i > 0 { v(0.8em) }
        block(width: 100%, breakable: false, {
          grid(
            columns: (1fr, auto), column-gutter: 0.8em, align: (left + top, right + top),
            text(size: 9.2pt, weight: "bold", fill: t.ink)[#exp.role — #text(fill: t.accent)[#exp.company]],
            text(size: 8pt, fill: t.muted)[#exp.dates],
          )
          v(0.16em)
          list(..exp.bullets.map(parse-bold))
        })
      }
    })
  }

  if projects != () and projects.len() > 0 {
    section("Projects", {
      set list(spacing: 0.44em)
      list(..projects.map(proj => [
        #text(weight: "bold", fill: t.ink)[#proj.name]#if "stack" in proj and proj.stack != "" [ #text(size: 8pt, fill: t.muted)[(#proj.stack)]] — #if "description" in proj [#parse-bold(proj.description)]
      ]))
    })
  }

  if "education" in data and data.education.len() > 0 {
    section("Education", {
      for (i, edu) in data.education.enumerate() {
        if i > 0 { v(0.4em) }
        grid(
          columns: (1fr, auto), column-gutter: 0.8em, align: (left + top, right + top),
          text(weight: "bold", fill: t.ink)[#edu.degree#if "specialization" in edu and edu.specialization != "" [ · #edu.specialization]],
          text(size: 8pt, fill: t.muted)[#edu.dates],
        )
        if "institution" in edu and edu.institution != "" {
          text(size: 8pt, fill: t.muted)[#edu.institution#if "gpa" in edu and edu.gpa != "" [ · #edu.gpa]]
        }
      }
    })
  }

  if "certifications" in data and data.certifications.len() > 0 {
    section("Certifications", {
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

#let render = render-swiss
