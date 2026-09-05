#import "/lib/utils.typ": parse-bold, clean-link, resolve-variant-field

#let render-executive(data, variant: "default", theme: "executive") = {
  let name = data.personal.name
  let headline = resolve-variant-field(data.personal.headline, variant, fallback: "")
  let summary = resolve-variant-field(data.summary, variant, fallback: "")
  let skills = resolve-variant-field(data.skills, variant, fallback: ())
  let projects = resolve-variant-field(data.projects, variant, fallback: ())
  let contact = data.personal.contact

  let ink = rgb("#203042")
  let muted = rgb("#6b7280")
  let accent = rgb("#b28b4b")
  let soft = rgb("#f4f1eb")
  let stroke-line = rgb("#d8d2c5")
  let white = rgb("#ffffff")

  set document(title: name + " — Resume", author: name, date: none)
  set page(paper: "a4", margin: (x: 1.12cm, y: 1.0cm))
  set text(font: "DejaVu Sans", size: 8.8pt, fill: ink, hyphenate: false, fallback: true)
  set par(leading: 0.55em, spacing: 0.42em, justify: false, linebreaks: "optimized")
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
        columns: (1.18fr, 1fr),
        column-gutter: 0.5em,
        text(weight: "bold", fill: ink)[#item.category],
        text(fill: muted)[#item.skills.join(", ")],
      )
      v(0.16em)
    }
  }

  let section(title, body) = {
    v(0.82em)
    block(above: 0pt, below: 0.13em, breakable: false, sticky: true, width: 100%, [
      #text(size: 9.5pt, weight: "bold", fill: ink, tracking: 0.12em)[#upper(title)]
      #v(0.08em)
      #line(length: 100%, stroke: 0.65pt + accent)
    ])
    body
  }

  block(fill: accent, width: 100%, inset: (x: 0.55em, y: 0.48em), radius: 3pt, [
    #text(size: 22pt, weight: "bold", fill: white)[#name]
    #if headline != "" [\ #v(0.08em)#text(size: 9.5pt, fill: white)[#headline]]
    #v(0.10em)
    #text(size: 7.8pt, fill: white)[#contact-text]
  ])
  v(0.12em)
  line(length: 100%, stroke: 0.7pt + stroke-line)

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
        block(width: 100%, breakable: false, [
          #grid(columns: (1fr, auto), column-gutter: 0.7em, text(size: 9.3pt, weight: "bold")[#exp.company], text(size: 8pt, weight: "bold", fill: accent)[#exp.dates])
          #v(0.04em)
          #text(size: 8.5pt, style: "italic", fill: muted)[#exp.role#if "location" in exp and exp.location != "" [ · #exp.location]]
          #v(0.16em)
          #list(..exp.bullets.map(parse-bold))
        ])
      }
    })
  }

  if projects != () and projects.len() > 0 {
    section("Projects", {
      for (i, proj) in projects.enumerate() {
        if i > 0 { v(0.42em) }
        grid(columns: (auto, 1fr), column-gutter: 0.45em, circle(fill: accent, radius: 3pt), [
          #text(weight: "bold")[#proj.name]
          #if "description" in proj and proj.description != "" [ — #parse-bold(proj.description)]
        ])
      }
    })
  }

  if "education" in data and data.education.len() > 0 {
    section("Education", {
      for (i, edu) in data.education.enumerate() {
        if i > 0 { v(0.34em) }
        grid(columns: (1fr, auto), text(weight: "bold")[#edu.institution], text(size: 8pt, fill: muted)[#edu.dates])
        v(0.04em)
        [#text(size: 8.2pt)[#edu.degree#if "specialization" in edu and edu.specialization != "" [ · #edu.specialization]]]
      }
    })
  }

  if "certifications" in data and data.certifications.len() > 0 {
    section("Certifications", {
      for (i, cert) in data.certifications.enumerate() {
        if i > 0 { v(0.22em) }
        [
          #text(weight: "bold")[#cert.name]
          #if "issuer" in cert and cert.issuer != "" [ #text(fill: muted)[· #cert.issuer]]
        ]
      }
    })
  }
}

#let render = render-executive
