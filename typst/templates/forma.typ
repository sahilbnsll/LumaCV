#import "/lib/utils.typ": parse-bold, clean-link, resolve-variant-field
#import "/lib/theme.typ": font-sans, font-serif, colors, typo, gap, pg, render-skills-adaptive, render-footer

#let render-forma(data, variant: "default", theme: "forma") = {
  let t = (ink: rgb("#15191d"), accent: rgb("#c2410c"), muted: rgb("#6b7379"), marker: rgb("#c2410c"), link: rgb("#c2410c"), name-fill: rgb("#15191d"), headline-fill: rgb("#c2410c"), company-fill: rgb("#c2410c"))
  let name = data.personal.name
  let headline = resolve-variant-field(data.personal.headline, variant, fallback: "")
  let summary = resolve-variant-field(data.summary, variant, fallback: "")
  let skills = resolve-variant-field(data.skills, variant, fallback: ())
  let projects = resolve-variant-field(data.projects, variant, fallback: ())

  set document(title: name + " — Resume", author: name, date: none)
  set page(paper: "a4", margin: (x: 1.24cm, y: 1.06cm), footer: render-footer(t, name))
  set text(font: font-sans, size: 8.6pt, fill: t.ink, hyphenate: false, fallback: true)
  set par(leading: 0.56em, spacing: 0.46em, justify: false, linebreaks: "optimized")
  set list(indent: 0.85em, body-indent: 0.33em, spacing: gap.bullet, marker: (text(fill: t.marker)[•], text(fill: t.marker)[–]))
  show link: set text(fill: t.link)
  show heading: it => it.body

  grid(columns: (1.75fr, 1fr), column-gutter: 1em, align: (left + bottom, right + bottom),
    [#text(size: 28pt, weight: "bold", fill: t.name-fill)[#name]],
    [#if headline != "" [#text(size: 8.9pt, weight: "bold", fill: t.headline-fill)[#headline]] #v(0.12em) #text(size: 7.3pt, fill: t.muted)[#{
    let c = data.personal.contact
    let items = ()
    if "location" in c and c.location != "" { items.push(c.location) }
    if "email" in c and c.email != "" { items.push(link("mailto:" + c.email)[#c.email]) }
    if "phone" in c and c.phone != "" { items.push(link("tel:" + c.phone.replace(" ", ""))[#c.phone]) }
    if "linkedin" in c and c.linkedin != "" { items.push(link("https://" + clean-link(c.linkedin))[#clean-link(c.linkedin)]) }
    if "github" in c and c.github != "" { items.push(link("https://" + clean-link(c.github))[#clean-link(c.github)]) }
    if "website" in c and c.website != "" { items.push(link("https://" + clean-link(c.website))[#clean-link(c.website)]) }
    items.join(text(fill: t.muted)[ · ])
  }]]
  )
  v(0.15em); block(fill: t.accent, width: 100%, height: 3pt)[ ]

  let section(title, body) = {
    v(0.83em)
    grid(columns: (0.95fr, 4.4fr), column-gutter: 0.9em, align: (left + top, left + top),
      text(size: 8.3pt, weight: "bold", tracking: 0.11em, fill: t.accent)[#upper(title)],
      body,
    )
  }

  if summary != "" { section("Summary", parse-bold(summary)) }

  if skills != () and skills.len() > 0 {
    section("Skills", render-skills-adaptive(t, skills, max-categories-for-grid: 4))
  }

  if "experience" in data and data.experience.len() > 0 {
    section("Experience", {
      for (i, exp) in data.experience.enumerate() {
        if i > 0 { v(0.72em) }
        block(width: 100%, breakable: false, {
          grid(
            columns: (1fr, auto), column-gutter: 0.8em,
            align: (left + top, right + top),
            text(size: 9.2pt, weight: "bold", fill: t.ink)[#exp.role],
            text(size: 8pt, fill: t.muted)[#exp.dates],
          )
          text(size: 8.3pt, weight: "bold", fill: t.company-fill)[#exp.company]
          if "location" in exp and exp.location != "" [#text(size: 7.7pt, fill: t.muted)[ · #exp.location]]
          v(0.14em)
          list(..exp.bullets.map(parse-bold))
        })
      }
    })
  }

  if projects != () and projects.len() > 0 {
    section("Projects", {
      for (i, proj) in projects.enumerate() {
        if i > 0 { v(0.38em) }
        block(width: 100%, {
          text(weight: "bold", fill: t.company-fill)[#proj.name]
          if "stack" in proj and proj.stack != "" [#text(size: 7.8pt, fill: t.muted)[ · #proj.stack]]
          if "description" in proj [#text()[ — #parse-bold(proj.description)]]
        })
      }
    })
  }

  if "education" in data and data.education.len() > 0 {
    section("Education", {
      for (i, edu) in data.education.enumerate() {
        if i > 0 { v(0.38em) }
        grid(
          columns: (1fr, auto), column-gutter: 0.8em,
          text(weight: "bold")[#edu.degree#if "specialization" in edu and edu.specialization != "" [ · #edu.specialization]],
          text(size: 8pt, fill: t.muted)[#edu.dates],
        )
        if "institution" in edu and edu.institution != "" [#text(size: 8pt, fill: t.muted)[#edu.institution#if "gpa" in edu and edu.gpa != "" [ · #edu.gpa]]]
      }
    })
  }

  if "certifications" in data and data.certifications.len() > 0 {
    section("Certifications", {
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

#let render = render-forma
