#import "/lib/utils.typ": parse-bold, clean-link, resolve-variant-field

#let render-matrix(data, variant: "default", theme: "matrix") = {
  let name = data.personal.name
  let headline = resolve-variant-field(data.personal.headline, variant, fallback: "")
  let summary = resolve-variant-field(data.summary, variant, fallback: "")
  let skills = resolve-variant-field(data.skills, variant, fallback: ())
  let projects = resolve-variant-field(data.projects, variant, fallback: ())
  let contact = data.personal.contact

  let ink = rgb("#26354a")
  let muted = rgb("#718096")
  let accent = rgb("#3267c8")
  let soft = rgb("#eef4ff")
  let stroke-line = rgb("#d4def0")
  let white = rgb("#ffffff")

  set document(title: name + " — Resume", author: name, date: none)
  set page(paper: "a4", margin: (x: 1.05cm, y: 0.98cm))
  set text(font: "DejaVu Sans", size: 8.6pt, fill: ink, hyphenate: false, fallback: true)
  set par(leading: 0.54em, spacing: 0.38em, justify: false, linebreaks: "optimized")
  set list(indent: 0.86em, body-indent: 0.32em, spacing: 0.24em, marker: (text(fill: accent)[•], text(fill: accent)[–]))
  show link: set text(fill: accent)
  show heading: it => it.body

  let contact-text = {
    let items = ()
    if "location" in contact and contact.location != "" { items.push(contact.location) }
    if "email" in contact and contact.email != "" { items.push(link("mailto:" + contact.email)[#contact.email]) }
    if "phone" in contact and contact.phone != "" { items.push(link("tel:" + contact.phone.replace(" ", ""))[#contact.phone]) }
    if "linkedin" in contact and contact.linkedin != "" { items.push(link("https://" + clean-link(contact.linkedin))[#clean-link(contact.linkedin)]) }
    if "github" in contact and contact.github != "" { items.push(link("https://" + clean-link(contact.github))[#clean-link(contact.github)]) }
    if "website" in contact and contact.website != "" { items.push(link("https://" + clean-link(contact.website))[#clean-link(contact.website)]) }
    items.join(text(fill: muted)[ · ])
  }

  let skill-lines = {
    for item in skills {
      grid(
        columns: (1.10fr, 1fr),
        column-gutter: 0.5em,
        text(weight: "bold", fill: accent)[#item.category],
        text(fill: muted)[#item.skills.join(", ")],
      )
      v(0.16em)
    }
  }

  let section(title, body) = {
    v(0.76em)
    block(above: 0pt, below: 0.13em, breakable: false, sticky: true, width: 100%, {
      text(size: 8.9pt, weight: "bold", fill: accent)[#upper(title)]; v(0.08em); line(length: 100%, stroke: 0.55pt + stroke-line)
    })
    body
  }
  grid(columns: (2fr, 3fr), column-gutter: 1.0em, [#text(size: 21pt, weight: "bold", fill: ink)[#name]
  v(0.05em)#if headline != "" [#text(size: 8.5pt, fill: accent)[#headline]]], [#align(right)[text(size: 7.4pt, fill: muted)[#contact-text]]]); v(0.13em); line(length: 100%, stroke: 1.5pt + accent)

  if summary != "" {
    section("Summary", parse-bold(summary))
  }

  if skills != () and skills.len() > 0 {
    section("Skills", skill-lines)
  }

  if "experience" in data and data.experience.len() > 0 {
    section("Experience", {
      for (i, exp) in data.experience.enumerate() {
        if i > 0 { v(0.68em) }
        block(width: 100%, breakable: false, {
          grid(columns: (1fr, auto), text(size: 8.9pt, weight: "bold")[#exp.role] #text(fill: accent)[·] #exp.company, text(size: 7.8pt, fill: muted)[#exp.dates]); v(0.03em); text(size: 7.9pt, fill: muted)[#if "location" in exp { exp.location } else { "" }]
          v(0.16em)
          list(..exp.bullets.map(parse-bold))
        })
      }
    })
  }

  if projects != () and projects.len() > 0 {
    section("Projects", {
      for (i, proj) in projects.enumerate() {
        if i > 0 { v(0.42em) }
        block(fill: soft, inset: 0.36em, radius: 3pt, [#text(weight: "bold", fill: accent)[#proj.name] #if "description" in proj [— #parse-bold(proj.description)]])
      }
    })
  }

  if "education" in data and data.education.len() > 0 {
    section("Education", {
      for (i, edu) in data.education.enumerate() {
        if i > 0 { v(0.34em) }
        grid(columns: (1fr, auto), text(weight: "bold")[#edu.institution], text(size: 7.8pt, fill: muted)[#edu.dates]); v(0.03em); text(size: 8pt)[#edu.degree#if "specialization" in edu [ · #edu.specialization]]
      }
    })
  }

  if "certifications" in data and data.certifications.len() > 0 {
    section("Certifications", {
      for (i, cert) in data.certifications.enumerate() {
        if i > 0 { v(0.22em) }
        block(fill: soft, inset: 0.28em, radius: 2pt, [#text(weight: "bold")[#cert.name]#if "issuer" in cert [#text(fill: muted)[ · #cert.issuer]]])
      }
    })
  }
}

#let render = render-matrix
