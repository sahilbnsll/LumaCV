#import "/lib/utils.typ": parse-bold, clean-link, resolve-variant-field

#let render-neo(data, variant: "default", theme: "neo") = {
  let name = data.personal.name
  let headline = resolve-variant-field(data.personal.headline, variant, fallback: "")
  let summary = resolve-variant-field(data.summary, variant, fallback: "")
  let skills = resolve-variant-field(data.skills, variant, fallback: ())
  let projects = resolve-variant-field(data.projects, variant, fallback: ())
  let contact = data.personal.contact

  let ink = rgb("#24233a")
  let muted = rgb("#6d6b7c")
  let accent = rgb("#7158d8")
  let soft = rgb("#f0edff")
  let stroke-line = rgb("#dbd5f8")
  let white = rgb("#ffffff")

  set document(title: name + " — Resume", author: name, date: none)
  set page(paper: "a4", margin: (x: 1.08cm, y: 0.98cm))
  set text(font: "DejaVu Sans", size: 8.7pt, fill: ink, hyphenate: false, fallback: true)
  set par(leading: 0.54em, spacing: 0.39em, justify: false, linebreaks: "optimized")
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
        text(weight: "bold", fill: accent)[#item.category],
        text(fill: muted)[#item.skills.join(", ")],
      )
      v(0.16em)
    }
  }

  let section(title, body) = {
    v(0.76em)
    block(above: 0pt, below: 0.13em, breakable: false, sticky: true, width: 100%, {
      block(fill: soft, inset: (x: 0.32em, y: 0.15em), radius: 3pt, width: 100%, [#text(size: 8.5pt, weight: "bold", fill: accent, tracking: 0.10em)[#upper(title)]])
    })
    body
  }
  grid(columns: (1fr, auto), column-gutter: 0.6em, block(fill: accent, inset: (x: 0.45em, y: 0.38em), radius: 5pt, [#text(size: 20pt, weight: "bold", fill: white)[#name]#if headline != "" [#v(0.05em)#text(size: 8.5pt, fill: white)[#headline]]]), [#align(right)[#text(size: 7.3pt, fill: muted)[#contact-text]]]); v(0.10em)

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
          grid(columns: (1fr, auto), text(size: 9pt, weight: "bold")[#exp.role], text(size: 7.9pt, fill: muted)[#exp.dates]); v(0.02em); text(size: 8.1pt, weight: "bold", fill: accent)[#exp.company#if "location" in exp and exp.location != "" [ · #text(fill: muted)[#exp.location]]]
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
        block(fill: soft, inset: (x: 0.42em, y: 0.31em), radius: 6pt, width: 100%, [#grid(columns: (1fr, auto), text(weight: "bold")[#proj.name], if "stack" in proj { text(size: 7.7pt, fill: accent)[#proj.stack] } else { none })#v(0.05em)#if "description" in proj [#parse-bold(proj.description)]])
      }
    })
  }

  if "education" in data and data.education.len() > 0 {
    section("Education", {
      for (i, edu) in data.education.enumerate() {
        if i > 0 { v(0.34em) }
        grid(columns: (1fr, auto), text(weight: "bold")[#edu.degree], text(size: 7.8pt, fill: muted)[#edu.dates]); v(0.03em); text(size: 8pt, fill: accent)[#edu.institution]
      }
    })
  }

  if "certifications" in data and data.certifications.len() > 0 {
    section("Certifications", {
      for (i, cert) in data.certifications.enumerate() {
        if i > 0 { v(0.22em) }
        block(fill: soft, inset: 0.28em, radius: 4pt, [#text(weight: "bold")[#cert.name]#if "issuer" in cert [#text(fill: muted)[ · #cert.issuer]]])
      }
    })
  }
}

#let render = render-neo
