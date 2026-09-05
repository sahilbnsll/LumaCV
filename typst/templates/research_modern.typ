#import "/lib/utils.typ": parse-bold, clean-link, resolve-variant-field
#import "/lib/theme.typ": font-sans, font-serif, colors, typo, gap, pg, render-skills-adaptive, render-footer

#let render-research_modern(data, variant: "default", theme: "research_modern") = {
  let t = (ink: rgb("#222426"), accent: rgb("#3e5077"), muted: rgb("#6c7480"), marker: rgb("#3e5077"), link: rgb("#3e5077"), name-fill: rgb("#222426"), headline-fill: rgb("#3e5077"), company-fill: rgb("#3e5077"))
  let name = data.personal.name
  let headline = resolve-variant-field(data.personal.headline, variant, fallback: "")
  let summary = resolve-variant-field(data.summary, variant, fallback: "")
  let skills = resolve-variant-field(data.skills, variant, fallback: ())
  let projects = resolve-variant-field(data.projects, variant, fallback: ())

  set document(title: name + " — Resume", author: name, date: none)
  set page(paper: "a4", margin: (x: 1.62cm, y: 1.28cm), footer: render-footer(t, name))
  set text(font: font-serif, size: 9pt, fill: t.ink, hyphenate: false, fallback: true)
  set par(leading: 0.56em, spacing: 0.46em, justify: false, linebreaks: "optimized")
  set list(indent: 0.85em, body-indent: 0.33em, spacing: gap.bullet, marker: (text(fill: t.marker)[•], text(fill: t.marker)[–]))
  show link: set text(fill: t.link)
  show heading: it => it.body

  align(left)[#text(size: 20pt, weight: "bold", fill: t.name-fill)[#name]
    #if headline != "" [#v(0.07em)#text(size: 9pt, style: "italic", fill: t.headline-fill)[#headline]]]
  v(0.18em); text(size: 7.7pt, fill: t.muted)[#{
    let c = data.personal.contact
    let items = ()
    if "location" in c and c.location != "" { items.push(c.location) }
    if "email" in c and c.email != "" { items.push(link("mailto:" + c.email)[#c.email]) }
    if "phone" in c and c.phone != "" { items.push(link("tel:" + c.phone.replace(" ", ""))[#c.phone]) }
    if "linkedin" in c and c.linkedin != "" { items.push(link("https://" + clean-link(c.linkedin))[#clean-link(c.linkedin)]) }
    if "github" in c and c.github != "" { items.push(link("https://" + clean-link(c.github))[#clean-link(c.github)]) }
    if "website" in c and c.website != "" { items.push(link("https://" + clean-link(c.website))[#clean-link(c.website)]) }
    items.join(text(fill: t.muted)[ · ])
  }]
  v(0.20em); line(length: 100%, stroke: 0.7pt + t.accent)

  let section(title, body) = {
    v(0.96em); text(size: 9.1pt, weight: "bold", fill: t.accent)[#upper(title)]
    v(0.07em); line(length: 100%, stroke: 0.35pt + t.accent); v(0.24em); body
  }

  if summary != "" { section("Research Profile", parse-bold(summary)) }
  if "education" in data and data.education.len() > 0 { 
    section("Education", for edu in data.education [
      #grid(columns: (1fr, auto), text(weight: "bold")[#edu.degree#if "specialization" in edu and edu.specialization != "" [ · #edu.specialization]], text(size: 8pt, fill: t.muted)[#edu.dates])
      #text(size: 8pt, style: "italic", fill: t.muted)[#edu.institution]
      #v(0.30em)
    ]) 
  }
  if "experience" in data and data.experience.len() > 0 { 
    section("Experience", for exp in data.experience [
      #grid(columns: (1fr, auto), text(weight: "bold")[#exp.role, #text(style: "italic")[#exp.company]], text(size: 8pt, fill: t.muted)[#exp.dates])
      #v(0.12em)
      #list(..exp.bullets.map(parse-bold))
      #v(0.52em)
    ]) 
  }
  if "publications" in data and data.publications.len() > 0 { 
    section("Publications", for pub in data.publications [
      #if "citation" in pub { parse-bold(pub.citation) } else { parse-bold(pub.title) }
      #v(0.26em)
    ]) 
  }
  if skills != () and skills.len() > 0 { section("Technical Skills", render-skills-adaptive(t, skills, max-categories-for-grid: 4)) }
  if projects != () and projects.len() > 0 { 
    section("Projects", for proj in projects [
      #text(weight: "bold")[#proj.name]#if "stack" in proj and proj.stack != "" [#text(size: 7.8pt, fill: t.muted)[ · #proj.stack]]#if "description" in proj [#text()[ — #parse-bold(proj.description)]]
      #v(0.28em)
    ]) 
  }

  if "certifications" in data and data.certifications.len() > 0 {
    section("Certifications", for cert in data.certifications [
      #text(weight: "bold")[#cert.name]#if "issuer" in cert and cert.issuer != "" [#text(fill: t.muted)[ · #cert.issuer]]
      #v(0.22em)
    ])
  }
}

#let render = render-research_modern
