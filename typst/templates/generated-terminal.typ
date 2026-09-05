#import "/lib/utils.typ": parse-bold, clean-link, resolve-variant-field

#let render-terminal(data, variant: "default", theme: "terminal") = {
  let name = data.personal.name
  let headline = resolve-variant-field(data.personal.headline, variant, fallback: "")
  let summary = resolve-variant-field(data.summary, variant, fallback: "")
  let skills = resolve-variant-field(data.skills, variant, fallback: ())
  let projects = resolve-variant-field(data.projects, variant, fallback: ())
  let contact = data.personal.contact

  let ink = rgb("#24312b")
  let muted = rgb("#63746a")
  let accent = rgb("#238b5a")
  let soft = rgb("#edf7f0")
  let stroke-line = rgb("#cfe4d7")
  let white = rgb("#ffffff")

  set document(title: name + " — Resume", author: name, date: none)
  set page(paper: "a4", margin: (x: 1.02cm, y: 0.95cm))
  set text(font: "DejaVu Sans Mono", size: 8.2pt, fill: ink, hyphenate: false, fallback: true)
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
        columns: (1.12fr, 1fr),
        column-gutter: 0.5em,
        text(weight: "bold", fill: accent)[#item.category],
        text(fill: muted)[#item.skills.join(", ")],
      )
      v(0.16em)
    }
  }

  let section(title, body) = {
    v(0.72em)
    block(above: 0pt, below: 0.13em, breakable: false, sticky: true, width: 100%, [
      #text(size: 8.3pt, weight: "bold", fill: accent)[\$ #title]
      #v(0.05em)
      #line(length: 100%, stroke: 0.45pt + stroke-line)
    ])
    body
  }
  block(fill: soft, inset: (x: 0.50em, y: 0.42em), radius: 4pt, [
    #text(size: 17pt, weight: "bold", fill: accent)[#name]
    #if headline != "" [\ #v(0.06em)#text(size: 8.3pt, fill: ink)[#headline]]
    #v(0.08em)
    #text(size: 7.2pt, fill: muted)[#contact-text]
  ])
  v(0.16em)

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
          #grid(columns: (1fr, auto), text(size: 8.5pt, weight: "bold")[#exp.role \@ #exp.company], text(size: 7.5pt, fill: muted)[#exp.dates])
          #if "location" in exp and exp.location != "" { v(0.02em); text(size: 7.5pt, fill: muted)[#exp.location] }
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
        grid(columns: (auto, 1fr), column-gutter: 0.35em, text(fill: accent)[>], [
          #text(weight: "bold")[#proj.name]
          #if "stack" in proj and proj.stack != "" [ · #text(fill: muted)[#proj.stack]]
          #if "description" in proj and proj.description != "" [ \ #parse-bold(proj.description)]
        ])
      }
    })
  }

  if "education" in data and data.education.len() > 0 {
    section("Education", {
      for (i, edu) in data.education.enumerate() {
        if i > 0 { v(0.34em) }
        text(weight: "bold")[#edu.degree — #edu.institution]; h(1fr); text(size: 7.6pt, fill: muted)[#edu.dates]
      }
    })
  }

  if "certifications" in data and data.certifications.len() > 0 {
    section("Certifications", {
      for (i, cert) in data.certifications.enumerate() {
        if i > 0 { v(0.22em) }
        text(fill: accent)[+]
        h(0.3em)
        text(weight: "bold")[#cert.name]
        if "issuer" in cert and cert.issuer != "" [ #text(fill: muted)[— #cert.issuer]]
      }
    })
  }
}

#let render = render-terminal
