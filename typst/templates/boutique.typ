#import "/lib/utils.typ": parse-bold, clean-link, resolve-variant-field

#let render-boutique(data, variant: "default", theme: "boutique") = {
  let name = data.personal.name
  let headline = resolve-variant-field(data.personal.headline, variant, fallback: "")
  let summary = resolve-variant-field(data.summary, variant, fallback: "")
  let skills = resolve-variant-field(data.skills, variant, fallback: ())
  let projects = resolve-variant-field(data.projects, variant, fallback: ())
  let contact = data.personal.contact

  let ink = rgb("#30263a")
  let muted = rgb("#7d7182")
  let accent = rgb("#6f4c78")
  let soft = rgb("#f6f1f7")
  let stroke-line = rgb("#ded2e0")
  let white = rgb("#ffffff")

  set document(title: name + " — Resume", author: name, date: none)
  set page(paper: "a4", margin: (x: 1.18cm, y: 1.08cm))
  set text(font: "Libertinus Serif", size: 9.1pt, fill: ink, hyphenate: false, fallback: true)
  set par(leading: 0.57em, spacing: 0.44em, justify: false, linebreaks: "optimized")
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
        columns: (1.25fr, 1fr),
        column-gutter: 0.5em,
        text(weight: "bold", fill: accent)[#item.category],
        text(fill: muted)[#item.skills.join(", ")],
      )
      v(0.16em)
    }
  }

  let section(title, body) = {
    v(0.94em)
    block(above: 0pt, below: 0.13em, breakable: false, sticky: true, width: 100%, {
      align(center)[#text(size: 9.7pt, weight: "bold", fill: accent, tracking: 0.10em)[#upper(title)]]; v(0.09em); line(length: 34pt, stroke: 0.9pt + accent); v(0.16em)
    })
    body
  }
  align(center)[
    #text(size: 24pt, weight: "bold", fill: ink)[#name]
    #v(0.06em)
    #if headline != "" { text(size: 9.5pt, style: "italic", fill: accent)[#headline] }
    #v(0.16em)
    #text(size: 7.8pt, fill: muted)[#contact-text]
  ]
  v(0.18em)
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
        block(width: 100%, breakable: false, {
          grid(columns: (1fr, auto), text(size: 9.4pt, weight: "bold")[#exp.company], text(size: 8pt, fill: muted)[#exp.dates]); v(0.04em); text(size: 8.8pt, style: "italic", fill: accent)[#exp.role#if "location" in exp and exp.location != "" [ · #exp.location]]
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
        block(fill: soft, inset: (x: 0.45em, y: 0.32em), width: 100%, radius: 7pt, [#align(center)[#text(weight: "bold", fill: accent)[#proj.name]]
  v(0.06em)#if "description" in proj [#align(center)[#parse-bold(proj.description)]]])
      }
    })
  }

  if "education" in data and data.education.len() > 0 {
    section("Education", {
      for (i, edu) in data.education.enumerate() {
        if i > 0 { v(0.34em) }
        align(center)[#text(weight: "bold")[#edu.degree] · #edu.institution]
  v(0.03em) #align(center)[#text(size: 8pt, fill: muted)[#edu.dates]]
      }
    })
  }

  if "certifications" in data and data.certifications.len() > 0 {
    section("Certifications", {
      for (i, cert) in data.certifications.enumerate() {
        if i > 0 { v(0.22em) }
        align(center)[#text(weight: "bold")[#cert.name]#if "issuer" in cert [#text(fill: muted)[ · #cert.issuer]]]
      }
    })
  }
}

#let render = render-boutique
