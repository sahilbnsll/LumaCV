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

  let default-order = (
    "summary", "techStackSummary", "skills", "keyMetrics", "experience",
    "internships", "education", "projects", "certifications", "achievements",
    "openSource", "publications", "leadership", "volunteering", "conferences",
    "languages", "interests", "products", "devopsContributions", "securityContributions",
    "additionalInfo", "customSections"
  )

  let active-order = if "sectionOrder" in data and type(data.sectionOrder) == array and data.sectionOrder.len() > 0 {
    let res = ()
    for k in data.sectionOrder {
      if not res.contains(k) { res.push(k) }
    }
    for k in default-order {
      if not res.contains(k) { res.push(k) }
    }
    res
  } else {
    default-order
  }

  for sec in active-order {
    if sec == "summary" {
      if summary != "" {
        resume-section(
          "Summary",
          parse-bold(summary),
        )
      }
    } else if sec == "techStackSummary" {
      if "techStackSummary" in data and data.techStackSummary != "" {
        resume-section(
          "Tech Stack",
          parse-bold(data.techStackSummary),
        )
      }
    } else if sec == "skills" {
      if skills != () and skills.len() > 0 {
        resume-section(
          "Skills",
          render-skills-adaptive(t, skills, max-categories-for-grid: 0),
        )
      }
    } else if sec == "keyMetrics" {
      if "keyMetrics" in data and data.keyMetrics.len() > 0 {
        resume-section(
          "Key Metrics",
          {
            for (i, m) in data.keyMetrics.enumerate() {
              if i > 0 { v(0.25em) }
              [#text(weight: "bold")[#m.label]: #text(fill: t.accent)[#m.value]#if "context" in m and m.context != "" [ — #text(size: 8.2pt, fill: t.muted)[#m.context]]]
            }
          },
        )
      }
    } else if sec == "experience" {
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
    } else if sec == "internships" {
      if "internships" in data and data.internships.len() > 0 {
        resume-section(
          "Internships",
          {
            for (i, exp) in data.internships.enumerate() {
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
    } else if sec == "projects" {
      if projects != () and projects.len() > 0 {
        resume-section(
          "Projects",
          {
            for (i, proj) in projects.enumerate() {
              if i > 0 { v(0.50em) }
              block(width: 100%, breakable: false, {
                grid(
                  columns: (1fr, auto),
                  column-gutter: 0.5em,
                  align: (left, right),
                  {
                    if "url" in proj and proj.url != "" {
                      link(proj.url)[#text(weight: "bold", fill: t.ink)[#proj.name] #text(size: 7.5pt, fill: t.accent)[↗]]
                    } else {
                      text(weight: "bold", fill: t.ink)[#proj.name]
                    }
                    if "role" in proj and proj.role != "" {
                      text(size: 8.2pt, fill: t.accent)[ · #proj.role]
                    }
                    if "stack" in proj and proj.stack != "" {
                      text(size: 8.2pt, fill: t.muted)[ (#proj.stack)]
                    }
                  },
                  if "dates" in proj and proj.dates != "" {
                    text(size: 8.4pt, style: "italic", fill: t.muted)[#proj.dates]
                  } else { none }
                )
                if "description" in proj and proj.description != "" {
                  v(0.08em)
                  text(size: 8.4pt, fill: t.muted)[#parse-bold(proj.description)]
                }
                let allBullets = ()
                if "impactBullets" in proj and proj.impactBullets.len() > 0 {
                  allBullets += proj.impactBullets
                }
                if "bullets" in proj and proj.bullets.len() > 0 {
                  allBullets += proj.bullets
                }
                if allBullets.len() > 0 {
                  v(0.10em)
                  list(..allBullets.map(parse-bold))
                }
              })
            }
          },
        )
      }
    } else if sec == "education" {
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
    } else if sec == "certifications" {
      if "certifications" in data and data.certifications.len() > 0 {
        resume-section(
          "Awards & Certs",
          {
            for (i, cert) in data.certifications.enumerate() {
              if i > 0 { v(0.28em) }
              [
                #text(weight: "bold", fill: t.ink)[#cert.name]
                #if "issuer" in cert and cert.issuer != "" [ · #text(fill: t.muted)[#cert.issuer]]
                #if "date" in cert and cert.date != "" [ #h(1fr) #text(size: 8.2pt, fill: t.muted)[#cert.date]]
              ]
            }
          },
        )
      }
    } else if sec == "achievements" {
      if "achievements" in data and data.achievements.len() > 0 {
        resume-section(
          "Achievements",
          {
            for (i, a) in data.achievements.enumerate() {
              if i > 0 { v(0.28em) }
              [
                #text(weight: "bold", fill: t.ink)[#a.title]
                #if "awarder" in a and a.awarder != "" [ · #text(fill: t.muted)[#a.awarder]]
                #if "date" in a and a.date != "" [ #h(1fr) #text(size: 8.2pt, fill: t.muted)[#a.date]]
                #if "description" in a and a.description != "" [ \ #text(size: 8.2pt)[#a.description] ]
              ]
            }
          },
        )
      }
    } else if sec == "openSource" {
      if "openSource" in data and data.openSource.len() > 0 {
        resume-section(
          "Open Source",
          {
            for (i, os) in data.openSource.enumerate() {
              if i > 0 { v(0.35em) }
              [
                #text(weight: "bold", fill: t.ink)[#os.project]
                #if "contribution" in os and os.contribution != "" [ — #text(size: 8.2pt)[#os.contribution]]
                #if "dates" in os and os.dates != "" [ #h(1fr) #text(size: 8.2pt, fill: t.muted)[#os.dates]]
              ]
            }
          },
        )
      }
    } else if sec == "publications" {
      if "publications" in data and data.publications.len() > 0 {
        resume-section(
          "Publications",
          {
            for (i, pub) in data.publications.enumerate() {
              if i > 0 { v(0.35em) }
              block(width: 100%, breakable: false, {
                let pubTitle = if "title" in pub and pub.title != "" { pub.title } else if "name" in pub { pub.name } else { "" }
                if "url" in pub and pub.url != "" {
                  link(pub.url)[#text(weight: "bold", fill: t.ink)[#pubTitle] #text(size: 7.5pt, fill: t.accent)[↗]]
                } else {
                  text(weight: "bold", fill: t.ink)[#pubTitle]
                }
                if "publisher" in pub and pub.publisher != "" [ · #text(size: 8.2pt, fill: t.muted)[#pub.publisher]]
                if "date" in pub and pub.date != "" [ #h(1fr) #text(size: 8.2pt, fill: t.muted)[#pub.date]]
              })
            }
          },
        )
      }
    } else if sec == "leadership" {
      if "leadership" in data and data.leadership.len() > 0 {
        resume-section(
          "Leadership",
          {
            for (i, l) in data.leadership.enumerate() {
              if i > 0 { v(0.35em) }
              [
                #text(weight: "bold", fill: t.ink)[#l.role], #text(style: "italic")[#l.organization]
                #if "dates" in l and l.dates != "" [ #h(1fr) #text(size: 8.2pt, fill: t.muted)[#l.dates]]
              ]
            }
          },
        )
      }
    } else if sec == "volunteering" {
      if "volunteering" in data and data.volunteering.len() > 0 {
        resume-section(
          "Volunteering",
          {
            for (i, vol) in data.volunteering.enumerate() {
              if i > 0 { v(0.35em) }
              block(width: 100%, breakable: false, {
                grid(
                  columns: (1fr, auto),
                  column-gutter: 0.5em,
                  align: (left + top, right + top),
                  [
                    #text(weight: "bold", fill: t.ink)[#vol.role], #text(style: "italic")[#vol.organization]
                  ],
                  if "dates" in vol and vol.dates != "" { text(size: 8.4pt, style: "italic", fill: t.muted)[#vol.dates] } else { none },
                )
                let bullets = ()
                if "highlights" in vol and vol.highlights.len() > 0 { bullets += vol.highlights }
                if "bullets" in vol and vol.bullets.len() > 0 { bullets += vol.bullets }
                if bullets.len() > 0 {
                  block(
                    above: 0.25em,
                    below: 0pt,
                    list(..bullets.map(parse-bold)),
                  )
                }
              })
            }
          },
        )
      }
    } else if sec == "conferences" {
      if "conferences" in data and data.conferences.len() > 0 {
        resume-section(
          "Conferences & Speaking",
          {
            for (i, conf) in data.conferences.enumerate() {
              if i > 0 { v(0.35em) }
              [
                #text(weight: "bold", fill: t.ink)[#conf.name]
                #if "role" in conf and conf.role != "" [ · #text(size: 8.2pt, fill: t.muted)[#conf.role]]
                #if "date" in conf and conf.date != "" [ #h(1fr) #text(size: 8.2pt, fill: t.muted)[#conf.date]]
              ]
            }
          },
        )
      }
    } else if sec == "languages" {
      if "languages" in data and data.languages.len() > 0 {
        resume-section(
          "Languages",
          {
            let lang-items = data.languages.map(l => l.language + if "proficiency" in l and l.proficiency != "" [ (#l.proficiency)] else [])
            text(size: 8.5pt)[#lang-items.join(" · ")]
          },
        )
      }
    } else if sec == "interests" {
      if "interests" in data and data.interests.len() > 0 {
        resume-section(
          "Interests",
          {
            let items = ()
            for item in data.interests {
              let t-val = if type(item) == dictionary and "name" in item { item.name } else { str(item) }
              items.push(t-val)
            }
            text(size: 8.5pt)[#items.join(" · ")]
          },
        )
      }
    } else if sec == "customSections" {
      if "customSections" in data and data.customSections.len() > 0 {
        for cs in data.customSections {
          resume-section(
            cs.title,
            {
              set list(tight: true, spacing: 0.35em)
              list(..cs.items.map(parse-bold))
            },
          )
        }
      }
    }
  }
}

#let render = render-engineering
