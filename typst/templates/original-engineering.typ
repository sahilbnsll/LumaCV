// =============================================================================
// Engineering Template
// Dedicated template faithful to resume temp/resume-engineering.typ
// Characterized by:
// - Left-column section header layout: grid(columns: (2fr, 10fr))
// - Dual-tone split accent rules (dark gray 2.5pt left, light gray 2.5pt right)
// - High-density engineering typesetting with par(leading: 0.43em)
// - En-dash [-] list markers with high information density
// - Clean technical categorization for skills, experience, and architecture projects
// =============================================================================

#import "/lib/utils.typ": parse-bold, clean-link, resolve-variant-field
#import "/lib/theme.typ": colors, font-serif, typo, gap, render-skills-adaptive, calc-dynamic-gap, render-footer

#let render-engineering(
  data,
  variant: "default",
  theme: "engineering",
) = {
  let t = if type(theme) == dictionary { theme } else if type(theme) == str { colors.at(theme, default: colors.engineering) } else { colors.engineering }


  let name = data.personal.name
  let headline = resolve-variant-field(data.personal.headline, variant, fallback: "")
  let summary = resolve-variant-field(data.summary, variant, fallback: "")
  let skills = resolve-variant-field(data.skills, variant, fallback: ())
  let projects = resolve-variant-field(data.projects, variant, fallback: ())

  // ----------------------------------------------------------
  // Document setup — matching resume-engineering.typ
  // ----------------------------------------------------------
  set document(
    title: name + " - Resume",
    author: name,
  )

  set page(
    paper: "a4",
    margin: (
      left: 0.48in,
      right: 0.48in,
      top: 0.35in,
      bottom: 0.35in,
    ),
    footer: render-footer(t, name),
  )

  set text(
    font: font-serif,
    size: 9.1pt,
    fill: t.ink,
    lang: "en",
    spacing: 100%,
  )

  set par(
    leading: 0.42em,
    justify: true,
    linebreaks: "optimized",
  )

  set list(
    tight: true,
    spacing: 0.38em,
    indent: 0.15in,
    body-indent: 0.30em,
    marker: (text(fill: t.marker)[–], text(fill: t.marker)[·]),
  )

  show link: set text(fill: t.link)
  show heading: it => it.body

  // =========================================================================
  // 👤 SECTION 1: Header (Left-aligned Name & Right-aligned Contact Stack)
  // =========================================================================
  let c = data.personal.contact
  let contact-items = ()

  if "location" in c and c.location != "" {
    contact-items.push(c.location)
  }
  if "email" in c and c.email != "" {
    contact-items.push(link("mailto:" + c.email)[#c.email])
  }
  if "linkedin" in c and c.linkedin != "" {
    let li = clean-link(c.linkedin)
    contact-items.push(link("https://" + li)[#li])
  }
  if "github" in c and c.github != "" {
    let gh = clean-link(c.github)
    contact-items.push(link("https://" + gh)[#gh])
  }
  if "website" in c and c.website != "" {
    let web = clean-link(c.website)
    contact-items.push(link("https://" + web)[#web])
  }
  if "phone" in c and c.phone != "" {
    contact-items.push(link("tel:" + c.phone.replace(" ", ""))[#c.phone])
  }

  grid(
    columns: (1fr, auto),
    align: (left + bottom, right + bottom),
    {
      text(size: 21.5pt, weight: "bold", fill: t.name-fill)[#name]
      if headline != "" [
        #v(0.12em)
        #text(size: 9.4pt, fill: t.muted)[#headline]
      ]
    },
    [
      #set text(size: 8.0pt)
      #grid(
        columns: (auto),
        align: (right),
        row-gutter: 0.28em,
        ..contact-items
      )
    ]
  )

  v(0.35em)

  // =========================================================================
  // 📐 Split-Rule Section Component: grid(columns: (1.8fr, 10fr))
  // =========================================================================
  let resume-section(section-name, section-contents) = {
    v(0.65em)
    block(width: 100%, breakable: true, {
      grid(
        columns: (1.8fr, 10fr),
        column-gutter: 0.6em,
        row-gutter: 0.48em,
        line(length: 100%, stroke: 2.2pt + t.rule-dark),
        line(length: 100%, stroke: 2.2pt + t.rule-light),
        text(size: 8.8pt, weight: "bold")[#smallcaps(section-name)],
        section-contents,
      )
    })
  }

  // =========================================================================
  // 🎯 SECTION 2: Professional Summary
  // =========================================================================
  if summary != "" {
    resume-section(
      "Summary",
      parse-bold(summary),
    )
  }

  // =========================================================================
  // 🛠️ SECTION 3: Technical Skills
  // =========================================================================
  if skills != () and skills.len() > 0 {
    resume-section(
      "Skills",
      render-skills-adaptive(t, skills, max-categories-for-grid: 0),
    )
  }

  // =========================================================================
  // 💼 SECTION 4: Professional Experience
  // =========================================================================
  if "experience" in data and data.experience.len() > 0 {
    resume-section(
      "Experience",
      {
        for (i, exp) in data.experience.enumerate() {
          if i > 0 { v(0.50em) }
          block(width: 100%, breakable: false, {
            grid(
              columns: (1fr, auto),
              column-gutter: 0.5em,
              align: (left + top, right + top),
              [
                #text(weight: "bold", fill: t.ink)[#exp.role], #text(fill: t.company-fill)[#exp.company]
                #if "location" in exp and exp.location != "" [
                  \ #text(size: 8.0pt, style: "italic", fill: t.muted)[#exp.location]
                ]
              ],
              text(size: 8.4pt, style: "italic", fill: t.muted)[#exp.dates],
            )
            block(
              above: 0.35em,
              below: 0pt,
              list(..exp.bullets.map(parse-bold)),
            )
          })
        }
      },
    )
  }

  // =========================================================================
  // 🚀 SECTION 5: Projects
  // =========================================================================
  if projects != () and projects.len() > 0 {
    resume-section(
      "Projects",
      {
        set list(tight: true, spacing: 0.38em)
        list(
          ..projects.map(proj => [
            #text(weight: "bold", fill: t.ink)[#proj.name]#if "stack" in proj and proj.stack != "" [ #text(size: 8.2pt, fill: t.muted)[(#proj.stack)]] — #if "description" in proj [#parse-bold(proj.description)]
          ])
        )
      },
    )
  }

  // =========================================================================
  // 🎓 SECTION 6: Education
  // =========================================================================
  if "education" in data and data.education.len() > 0 {
    resume-section(
      "Education",
      {
        for (i, edu) in data.education.enumerate() {
          if i > 0 { v(0.35em) }
          block(width: 100%, breakable: false, {
            grid(
              columns: (1fr, auto),
              column-gutter: 0.5em,
              align: (left, right),
              [#text(weight: "bold", fill: t.ink)[#edu.institution]#if "location" in edu and edu.location != "" [ · #text(size: 8.2pt, fill: t.muted)[#edu.location]]],
              text(size: 8.4pt, style: "italic", fill: t.muted)[#edu.dates],
            )
            v(0.04em)
            let deg-line = edu.degree
            if "specialization" in edu and edu.specialization != "" {
              deg-line += " (" + edu.specialization + ")"
            }
            if "gpa" in edu and edu.gpa != "" {
              deg-line += " · CGPA: " + edu.gpa
            }
            text(size: 8.5pt, style: "italic", fill: t.ink)[#deg-line]
          })
        }
      },
    )
  }

  // =========================================================================
  // 🏆 SECTION 7: Certifications & Awards
  // =========================================================================
  if "certifications" in data and data.certifications.len() > 0 {
    resume-section(
      "Awards & Certs",
      {
        for (i, cert) in data.certifications.enumerate() {
          if i > 0 { v(0.28em) }
          [
            #text(weight: "bold")[#cert.name]
            #if "issuer" in cert and cert.issuer != "" [ · #text(fill: t.muted)[#cert.issuer]]
            #if "date" in cert and cert.date != "" [ #h(1fr) #text(size: 8.2pt, fill: t.muted)[#cert.date]]
          ]
        }
      },
    )
  }
}

#let render = render-engineering
