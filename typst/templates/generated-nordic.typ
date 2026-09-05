#import "/lib/utils.typ": parse-bold, clean-link, resolve-variant-field

#let render-nordic(data, variant: "default", theme: "nordic") = {
  let name = data.personal.name
  let headline = resolve-variant-field(data.personal.headline, variant, fallback: "")
  let summary = resolve-variant-field(data.summary, variant, fallback: "")
  let skills = resolve-variant-field(data.skills, variant, fallback: ())
  let projects = resolve-variant-field(data.projects, variant, fallback: ())
  let contact = data.personal.contact

  let ink = rgb("#243038")
  let muted = rgb("#708087")
  let accent = rgb("#486c62")
  let soft = rgb("#eef4f1")
  let stroke-line = rgb("#d7e2de")
  let white = rgb("#ffffff")

  set document(title: name + " — Resume", author: name, date: none)
  set page(paper: "a4", margin: (x: 1.22cm, y: 1.14cm))
  set text(font: "DejaVu Sans", size: 9.0pt, fill: ink, hyphenate: false, fallback: true)
  set par(leading: 0.58em, spacing: 0.44em, justify: false, linebreaks: "optimized")
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
        columns: (1.30fr, 1fr),
        column-gutter: 0.5em,
        text(weight: "bold", fill: accent)[#item.category],
        text(fill: muted)[#item.skills.join(", ")],
      )
      v(0.16em)
    }
  }

  let section(title, body) = {
    v(0.92em)
    block(above: 0pt, below: 0.13em, breakable: false, sticky: true, width: 100%, [
      #text(size: 9pt, weight: "bold", fill: accent, tracking: 0.17em)[#upper(title)]
      #v(0.11em)
      #line(length: 34pt, stroke: 1.4pt + accent)
      #v(0.18em)
    ])
    body
  }

  text(size: 23pt, weight: "bold", fill: ink)[#name]
  if headline != "" {
    v(0.05em)
    text(size: 9.5pt, fill: accent)[#headline]
  }
  v(0.20em)
  text(size: 8pt, fill: muted)[#contact-text]
  v(0.30em)
  line(length: 100%, stroke: 0.8pt + stroke-line)

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
          #grid(columns: (1fr, auto), column-gutter: 0.6em, text(size: 9.2pt, weight: "bold")[#exp.role], text(size: 8pt, fill: muted)[#exp.dates])
          #v(0.03em)
          #text(size: 8.2pt, weight: "bold", fill: accent)[#exp.company#if "location" in exp and exp.location != "" [ #text(fill: muted)[· #exp.location]]]
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
        block(fill: soft, inset: (x: 0.52em, y: 0.34em), radius: 6pt, width: 100%, [
          #text(size: 8.8pt, weight: "bold")[#proj.name]
          #if "stack" in proj and proj.stack != "" [ #text(size: 7.7pt, fill: muted)[· #proj.stack]]
          #if "description" in proj and proj.description != "" [\ #v(0.08em)#parse-bold(proj.description)]
        ])
      }
    })
  }

  if "education" in data and data.education.len() > 0 {
    section("Education", {
      for (i, edu) in data.education.enumerate() {
        if i > 0 { v(0.34em) }
        grid(columns: (1fr, auto), text(weight: "bold")[#edu.degree], text(size: 8pt, fill: muted)[#edu.dates])
        v(0.05em)
        [#text(size: 8.2pt, fill: accent)[#edu.institution]]
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

#let render = render-nordic
