// ============================================================
// Template: Consultant — MBB-Style, Right-Ruled Dates
// ============================================================
// Design principles:
//  - Bold role/company line, dates boxed hard-right, impact-first bullets
//  - Serif/sans hybrid: sans body, subtle serif section labels

#import "/lib/utils.typ": parse-bold, clean-link, resolve-variant-field
#import "/lib/theme.typ": font-sans, font-serif, colors, typo, gap, pg, render-skills-adaptive, render-footer

#let render-consultant(data, variant: "default", theme: "consultant") = {
  let default-palette = (
    ink: rgb("#14213d"),
    accent: rgb("#14213d"),
    muted: rgb("#6b7280"),
    marker: rgb("#14213d"),
    link: rgb("#14213d"),
    name-fill: rgb("#14213d"),
    headline-fill: rgb("#6b7280"),
    company-fill: rgb("#14213d"),
  )
  let t = if type(theme) == dictionary { theme } else if type(theme) == str { colors.at(theme, default: default-palette) } else { default-palette }

  let name = data.personal.name
  let headline = resolve-variant-field(data.personal.headline, variant, fallback: "")
  let summary = resolve-variant-field(data.summary, variant, fallback: "")
  let skills = resolve-variant-field(data.skills, variant, fallback: ())
  let projects = resolve-variant-field(data.projects, variant, fallback: ())

  set document(title: if headline != "" { name + " — " + headline } else { name + " — Resume" }, author: name, date: none)
  set page(paper: pg.paper, margin: (x: 1.3cm, y: 1.1cm), footer: render-footer(t, name))
  set text(font: font-sans, size: 8.7pt, fill: t.ink, hyphenate: false, fallback: true)
  set par(leading: 0.56em, spacing: 0.48em, justify: false, linebreaks: "optimized")
  set list(tight: false, spacing: gap.bullet, indent: 0.85em, body-indent: 0.35em, marker: (text(fill: t.marker)[•], text(fill: t.marker)[–]))
  show link: set text(fill: t.link)
  show heading: it => it.body

  grid(
    columns: (1fr, auto), column-gutter: 1em, align: (left + bottom, right + bottom),
    [
      #text(font: font-serif, size: 19pt, weight: "bold", fill: t.name-fill)[#name]
      #if headline != "" [
        #v(0.1em)
        #text(size: 9pt, fill: t.headline-fill)[#headline]
      ]
    ],
    align(right)[
      #set text(size: 7.8pt, fill: t.muted)
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
  v(0.2em)
  line(length: 100%, stroke: 1.6pt + t.accent)

  let section(title, body) = {
    v(1.05em)
    block(above: 0pt, below: 0.14em, breakable: false, sticky: true, width: 100%, {
      text(font: font-serif, size: 9.6pt, weight: "bold", fill: t.accent)[#heading(level: 2, outlined: true, bookmarked: true, title)]
      v(0.1em)
      line(length: 100%, stroke: 0.4pt + rgb("#d1d5db"))
    })
    v(0.26em)
    body
  }

  if summary != "" { section("Profile", parse-bold(summary)) }
  if skills != () and skills.len() > 0 { section("Skills", render-skills-adaptive(t, skills, max-categories-for-grid: 4)) }

  if "experience" in data and data.experience.len() > 0 {
    section("Professional Experience", {
      for (i, exp) in data.experience.enumerate() {
        if i > 0 { v(0.8em) }
        block(width: 100%, breakable: false, {
          grid(
            columns: (1fr, auto), column-gutter: 0.6em, align: (left + top, right + top),
            [
              #text(size: 9.2pt, weight: "bold", fill: t.ink)[#exp.company]
              #text(size: 8.4pt, fill: t.muted)[ — #exp.role]
            ],
            box(fill: rgb("#eef2ff"), radius: 2pt, inset: (x: 6pt, y: 2.5pt), text(size: 7.6pt, weight: "bold", fill: t.accent)[#exp.dates]),
          )
          if "location" in exp and exp.location != "" {
            text(size: 7.6pt, fill: t.muted)[#exp.location]
          }
          v(0.16em)
          list(..exp.bullets.map(parse-bold))
        })
      }
    })
  }

  if projects != () and projects.len() > 0 {
    section("Selected Projects", {
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

#let render = render-consultant
