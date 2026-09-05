// ============================================================
// Template: Startup — Bold Color-Block Header
// ============================================================
// Design principles:
//  - Full-width colored header block, white text, energetic sans
//  - Rounded skill "chips" instead of a plain list
//  - Confident, high-contrast, built for product/growth/startup roles

#import "/lib/utils.typ": parse-bold, clean-link, resolve-variant-field
#import "/lib/theme.typ": font-sans, colors, typo, gap, pg, render-footer

#let render-startup(data, variant: "default", theme: "startup") = {
  let default-palette = (
    ink: rgb("#111827"),
    accent: rgb("#7c3aed"),
    muted: rgb("#6b7280"),
    marker: rgb("#7c3aed"),
    link: rgb("#7c3aed"),
    name-fill: rgb("#ffffff"),
    headline-fill: rgb("#ede9fe"),
    company-fill: rgb("#7c3aed"),
  )
  let t = if type(theme) == dictionary { theme } else if type(theme) == str { colors.at(theme, default: default-palette) } else { default-palette }

  let name = data.personal.name
  let headline = resolve-variant-field(data.personal.headline, variant, fallback: "")
  let summary = resolve-variant-field(data.summary, variant, fallback: "")
  let skills = resolve-variant-field(data.skills, variant, fallback: ())
  let projects = resolve-variant-field(data.projects, variant, fallback: ())

  set document(title: if headline != "" { name + " — " + headline } else { name + " — Resume" }, author: name, date: none)
  set page(paper: pg.paper, margin: (x: 1.2cm, top: 0cm, bottom: 1.1cm), footer: render-footer(t, name))
  set text(font: font-sans, size: 8.7pt, fill: t.ink, hyphenate: false, fallback: true)
  set par(leading: 0.56em, spacing: 0.48em, justify: false, linebreaks: "optimized")
  set list(tight: false, spacing: gap.bullet, indent: 0.85em, body-indent: 0.35em, marker: (text(fill: t.marker)[•], text(fill: t.marker)[–]))
  show link: set text(fill: t.link)
  show heading: it => it.body

  block(width: 100%, fill: t.accent, inset: (x: 1.2cm, y: 0.55cm), {
    text(size: 20pt, weight: "bold", fill: t.name-fill)[#name]
    if headline != "" {
      v(0.14em)
      text(size: 9.4pt, fill: t.headline-fill)[#headline]
    }
    v(0.3em)
    set text(size: 7.8pt, fill: t.headline-fill)
    {
      let c = data.personal.contact
      let items = ()
      if "email" in c and c.email != "" { items.push(link("mailto:" + c.email)[#c.email]) }
      if "phone" in c and c.phone != "" { items.push(link("tel:" + c.phone.replace(" ", ""))[#c.phone]) }
      if "location" in c and c.location != "" { items.push(c.location) }
      if "linkedin" in c and c.linkedin != "" { items.push(link("https://" + clean-link(c.linkedin))[#clean-link(c.linkedin)]) }
      if "website" in c and c.website != "" { items.push(link("https://" + clean-link(c.website))[#clean-link(c.website)]) }
      items.join(h(0.35em) + "·" + h(0.35em))
    }
  })

  v(0.4em)

  let section(title, body) = {
    v(0.9em)
    block(above: 0pt, below: 0.14em, breakable: false, sticky: true, width: 100%, {
      text(size: 9pt, weight: "bold", fill: t.accent, tracking: 0.1em)[#heading(level: 2, outlined: true, bookmarked: true, upper(title))]
      v(0.08em)
      line(length: 100%, stroke: 0.5pt + rgb("#e5e7eb"))
    })
    v(0.26em)
    body
  }

  if summary != "" { section("Summary", parse-bold(summary)) }

  if skills != () and skills.len() > 0 {
    section("Skills", {
      let chips = ()
      for cat in skills {
        for item in cat.items {
          chips.push(box(fill: rgb("#f3f0ff"), radius: 3pt, inset: (x: 6pt, y: 3pt), text(size: 7.6pt, fill: t.company-fill)[#item]))
        }
      }
      chips.join(h(4pt) + v(4pt, weak: true))
    })
  }

  if "experience" in data and data.experience.len() > 0 {
    section("Experience", {
      for (i, exp) in data.experience.enumerate() {
        if i > 0 { v(0.8em) }
        block(width: 100%, breakable: false, {
          grid(
            columns: (1fr, auto), column-gutter: 0.8em, align: (left + top, right + top),
            text(size: 9.2pt, weight: "bold", fill: t.ink)[#exp.role],
            text(size: 8.2pt, fill: t.muted)[#exp.dates],
          )
          text(size: 8.6pt, weight: "bold", fill: t.company-fill)[#exp.company]
          if "location" in exp and exp.location != "" [ #text(size: 7.8pt, fill: t.muted)[· #exp.location]]
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
        #text(weight: "bold", fill: t.company-fill)[#proj.name]#if "stack" in proj and proj.stack != "" [ #text(size: 8pt, fill: t.muted)[(#proj.stack)]] — #if "description" in proj [#parse-bold(proj.description)]
      ]))
    })
  }

  if "education" in data and data.education.len() > 0 {
    section("Education", {
      for (i, edu) in data.education.enumerate() {
        if i > 0 { v(0.4em) }
        grid(
          columns: (1fr, auto), column-gutter: 0.8em, align: (left + top, right + top),
          text(weight: "bold")[#edu.degree#if "specialization" in edu and edu.specialization != "" [ · #edu.specialization]],
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

#let render = render-startup
