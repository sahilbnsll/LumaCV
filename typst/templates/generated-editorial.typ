// ============================================================
// Template: Editorial — Sophisticated Print-Magazine Serif Layout
// ============================================================
// Design principles:
//  - Classic editorial broadsheet aesthetics with double-rule header masthead
//  - Rich crimson accent (#8b3a3a), deep charcoal ink, newsprint hairline rules
//  - High-contrast typography: bold accent section titles, dark ink item titles, muted metadata
//  - Full support for all 22+ Golden Resume fields

#import "/lib/utils.typ": parse-bold, clean-link, resolve-variant-field
#import "/lib/theme.typ": font-sans, font-serif, colors, typo, gap, pg, render-skills-adaptive, render-footer

#let render-editorial(data, variant: "default", theme: "editorial") = {
  let default-palette = (
    ink: rgb("#1f2937"),
    accent: rgb("#8b3a3a"),
    muted: rgb("#5d6470"),
    soft: rgb("#faf6f5"),
    stroke-line: rgb("#e2d6d4"),
    marker: rgb("#8b3a3a"),
    link: rgb("#8b3a3a"),
    name-fill: rgb("#8b3a3a"),
    headline-fill: rgb("#5d6470"),
    company-fill: rgb("#8b3a3a"),
  )
  let t = if type(theme) == dictionary { theme } else if type(theme) == str { colors.at(theme, default: default-palette) } else { default-palette }

  let name = data.personal.name
  let headline = resolve-variant-field(data.personal.headline, variant, fallback: "")
  let summary = resolve-variant-field(data.summary, variant, fallback: "")
  let skills = resolve-variant-field(data.skills, variant, fallback: ())
  let projects = resolve-variant-field(data.projects, variant, fallback: ())
  let contact = data.personal.contact

  let ink = if "ink" in t { t.ink } else { default-palette.ink }
  let accent = if "accent" in t { t.accent } else { default-palette.accent }
  let muted = if "muted" in t { t.muted } else { default-palette.muted }
  let soft = if "soft" in t { t.soft } else { default-palette.soft }
  let stroke-line = if "stroke-line" in t { t.stroke-line } else { default-palette.stroke-line }

  set document(title: if headline != "" { name + " — " + headline } else { name + " — Resume" }, author: name, date: none)
  set page(paper: pg.paper, margin: (x: 1.25cm, top: 1.35cm, bottom: 3.20cm), footer: render-footer(t, name))
  set text(font: font-serif, size: 8.9pt, fill: ink, hyphenate: false, fallback: true)
  set par(leading: 0.58em, spacing: 0.48em, justify: false, linebreaks: "optimized")
  set list(indent: 0.85em, body-indent: 0.32em, spacing: 0.36em, marker: (text(fill: accent)[•], text(fill: accent)[–]))
  show link: set text(fill: accent)
  show heading: it => it.body

  let contact-items = ()
  if "location" in contact and contact.location != "" { contact-items.push(contact.location) }
  if "email" in contact and contact.email != "" { contact-items.push(link("mailto:" + contact.email)[#contact.email]) }
  if "phone" in contact and contact.phone != "" { contact-items.push(link("tel:" + contact.phone.replace(" ", ""))[#contact.phone]) }
  if "linkedin" in contact and contact.linkedin != "" { contact-items.push(link("https://" + clean-link(contact.linkedin))[#clean-link(contact.linkedin)]) }
  if "github" in contact and contact.github != "" { contact-items.push(link("https://" + clean-link(contact.github))[#clean-link(contact.github)]) }
  if "website" in contact and contact.website != "" { contact-items.push(link("https://" + clean-link(contact.website))[#clean-link(contact.website)]) }

  // Header Block (Editorial Broadsheet Masthead)
  align(left)[
    #text(size: 23pt, weight: "bold", fill: accent)[#name]
    #if headline != "" [
      #v(0.06em)
      #text(size: 9.6pt, style: "italic", fill: muted)[#headline]
    ]
    #v(0.12em)
    #text(size: 7.8pt, fill: muted)[#contact-items.join(text(fill: muted)[ · ])]
  ]
  v(0.18em)
  line(length: 100%, stroke: 1.5pt + accent)
  v(0.04em)
  line(length: 100%, stroke: 0.5pt + accent)

  let section(title, body, breakable: true) = {
    v(1.35em)
    block(width: 100%, breakable: breakable, {
      block(above: 0pt, below: 0.12em, breakable: false, sticky: true, width: 100%, {
        text(size: 9.2pt, weight: "bold", fill: accent, tracking: 0.08em)[#heading(level: 2, outlined: true, bookmarked: true, upper(title))]
        v(0.06em)
        line(length: 100%, stroke: 0.6pt + stroke-line)
      })
      v(0.16em)
      body
    })
  }

  let default-order = (
    "summary", "techStackSummary", "keyMetrics", "skills", "experience",
    "internships", "education", "projects", "certifications", "achievements",
    "openSource", "publications", "leadership", "volunteering", "conferences",
    "languages", "interests", "patents", "products", "devopsContributions", "securityContributions",
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

  let awards-rendered = false

  for sec in active-order {
    if sec == "summary" {
      if summary != "" { section("Editorial Profile", parse-bold(summary)) }
    } else if sec == "techStackSummary" {
      if "techStackSummary" in data and data.techStackSummary != none and data.techStackSummary != "" {
        section("Core Architecture & Stack", breakable: false, block(
          fill: soft,
          stroke: 0.4pt + stroke-line,
          inset: (x: 6pt, y: 3.5pt),
          radius: 2pt,
          width: 100%,
          text(size: 8.2pt)[#text(weight: "bold", fill: ink)[Technical Summary:] #parse-bold(data.techStackSummary)]
        ))
      }
    } else if sec == "keyMetrics" {
      if "keyMetrics" in data and data.keyMetrics != none and data.keyMetrics.len() > 0 {
        section("Scale & Key Metrics", breakable: false, {
          let cols = calc.min(data.keyMetrics.len(), 4)
          grid(
            columns: (1fr,) * cols,
            column-gutter: 0.5em,
            row-gutter: 0.5em,
            ..data.keyMetrics.map(km => block(
              fill: soft,
              stroke: 0.4pt + stroke-line,
              inset: 0.4em,
              radius: 2pt,
              width: 100%,
              align(center)[
                #text(size: 9.4pt, weight: "bold", fill: accent)[#km.value] \
                #v(0.04em)
                #text(size: 7.3pt, weight: "bold", fill: ink)[#km.label]
                #if "context" in km and km.context != "" [
                  \ #v(0.02em)
                  #text(size: 6.7pt, fill: muted)[#km.context]
                ]
              ]
            ))
          )
        })
      }
    } else if sec == "skills" {
      if skills != () and skills.len() > 0 {
        section("Technical Competencies", breakable: false, {
          for (i, item) in skills.enumerate() {
            if i > 0 { v(0.16em) }
            grid(
              columns: (135pt, 1fr),
              column-gutter: 0.8em,
              text(weight: "bold", fill: ink)[#item.category],
              text(fill: ink)[#item.skills.join(", ")],
            )
          }
        })
      }
    } else if sec == "experience" {
      if "experience" in data and data.experience.len() > 0 {
        section("Professional Experience", {
          for (i, exp) in data.experience.enumerate() {
            if i > 0 { v(0.55em) }
            block(width: 100%, breakable: false, {
              grid(
                columns: (1fr, auto), column-gutter: 0.8em,
                align: (left + top, right + top),
                text(size: 9.2pt, weight: "bold", fill: ink)[#exp.role],
                text(size: 8.0pt, style: "italic", fill: muted)[#exp.dates],
              )
              v(0.02em)
              text(size: 8.3pt, weight: "bold", fill: accent)[#exp.company]
              if "location" in exp and exp.location != "" [#text(size: 7.8pt, style: "italic", fill: muted)[ · #exp.location]]
              let all-bullets = ()
              if "highlights" in exp and exp.highlights != () { all-bullets += exp.highlights }
              if "impactBullets" in exp and exp.impactBullets != () { all-bullets += exp.impactBullets }
              if "bullets" in exp and exp.bullets != () { all-bullets += exp.bullets }
              if all-bullets.len() > 0 {
                v(0.12em)
                list(..all-bullets.map(parse-bold))
              }
            })
          }
        })
      }
    } else if sec == "internships" {
      if "internships" in data and data.internships.len() > 0 {
        section("Internships & Fellowships", breakable: false, {
          for (i, exp) in data.internships.enumerate() {
            if i > 0 { v(0.50em) }
            block(width: 100%, breakable: false, {
              grid(
                columns: (1fr, auto), column-gutter: 0.8em,
                align: (left + top, right + top),
                text(size: 9.2pt, weight: "bold", fill: ink)[#exp.role],
                text(size: 8.0pt, style: "italic", fill: muted)[#exp.dates],
              )
              v(0.02em)
              text(size: 8.3pt, weight: "bold", fill: accent)[#exp.company]
              if "location" in exp and exp.location != "" [#text(size: 7.8pt, style: "italic", fill: muted)[ · #exp.location]]
              let all-bullets = ()
              if "highlights" in exp and exp.highlights != () { all-bullets += exp.highlights }
              if "impactBullets" in exp and exp.impactBullets != () { all-bullets += exp.impactBullets }
              if "bullets" in exp and exp.bullets != () { all-bullets += exp.bullets }
              if all-bullets.len() > 0 {
                v(0.12em)
                list(..all-bullets.map(parse-bold))
              }
            })
          }
        })
      }
    } else if sec == "projects" {
      if projects != () and projects.len() > 0 {
        section("Key Projects & Editorial Initiatives", breakable: false, {
          for (i, proj) in projects.enumerate() {
            if i > 0 { v(0.40em) }
            block(width: 100%, breakable: false, {
              grid(
                columns: (1fr, auto),
                [
                  #text(weight: "bold", fill: ink)[#proj.name]
                  #if "role" in proj and proj.role != "" [ #text(fill: muted)[·] #text(size: 8pt, style: "italic", fill: muted)[#proj.role] ]
                  #if "url" in proj and proj.url != "" [ #link(proj.url)[#text(fill: accent)[ ↗]] ]
                ],
                if "dates" in proj and proj.dates != "" { text(size: 8pt, style: "italic", fill: muted)[#proj.dates] }
              )
              if "stack" in proj and proj.stack != "" {
                v(0.03em)
                text(size: 7.8pt, fill: accent)[Tech Stack: #proj.stack]
              }
              if "description" in proj and proj.description != "" {
                v(0.04em)
                parse-bold(proj.description)
              }
              let all-p-bullets = ()
              if "highlights" in proj and proj.highlights != () { all-p-bullets += proj.highlights }
              if "impactBullets" in proj and proj.impactBullets != () { all-p-bullets += proj.impactBullets }
              if "bullets" in proj and proj.bullets != () { all-p-bullets += proj.bullets }
              if all-p-bullets.len() > 0 {
                v(0.06em)
                list(..all-p-bullets.map(parse-bold))
              }
            })
          }
        })
      }
    } else if sec == "education" {
      if "education" in data and data.education.len() > 0 {
        section("Education & Academic Background", breakable: false, {
          for (i, edu) in data.education.enumerate() {
            if i > 0 { v(0.32em) }
            block(width: 100%, breakable: false, {
              grid(
                columns: (1fr, auto), column-gutter: 0.8em,
                text(weight: "bold", fill: ink)[#edu.institution#if "location" in edu and edu.location != "" [ · #text(weight: "regular", fill: muted)[#edu.location]]],
                text(size: 8.0pt, style: "italic", fill: muted)[#edu.dates],
              )
              v(0.02em)
              grid(
                columns: (1fr, auto),
                [#text(size: 8.2pt, fill: accent)[#edu.degree#if "specialization" in edu and edu.specialization != "" [ · #edu.specialization]]],
                if "gpa" in edu and edu.gpa != "" { text(size: 7.8pt, fill: muted)[GPA: #edu.gpa] }
              )
            })
          }
        })
      }
    } else if sec == "certifications" {
      if "certifications" in data and data.certifications.len() > 0 {
        section("Certifications & Accreditations", breakable: false, {
          for (i, cert) in data.certifications.enumerate() {
            if i > 0 { v(0.20em) }
            block(width: 100%, breakable: false, {
              grid(
                columns: (1fr, auto),
                [
                  #text(weight: "bold", fill: ink)[#cert.name]
                  #if "url" in cert and cert.url != "" [ #link(cert.url)[#text(fill: accent)[ ↗]] ]
                  #if "issuer" in cert and cert.issuer != "" [ #text(fill: muted)[ · #cert.issuer] ]
                ],
                text(size: 7.9pt, style: "italic", fill: muted)[#if "date" in cert { cert.date }]
              )
            })
          }
        })
      }
    } else if sec == "achievements" or sec == "awards" {
      if not awards-rendered {
        let items = if "achievements" in data and data.achievements.len() > 0 { data.achievements } else if "awards" in data and data.awards.len() > 0 { data.awards } else { () }
        if items.len() > 0 {
          section("Honors & Distinctions", breakable: false, {
            for (i, ach) in items.enumerate() {
              if i > 0 { v(0.24em) }
              block(width: 100%, breakable: false, {
                grid(
                  columns: (1fr, auto),
                  [
                    #text(weight: "bold", fill: ink)[#ach.title]
                    #if "awarder" in ach and ach.awarder != "" [ #text(fill: muted)[ · #ach.awarder] ]
                    #if "url" in ach and ach.url != "" [ #link(ach.url)[#text(fill: accent)[ ↗]] ]
                  ],
                  text(size: 7.9pt, style: "italic", fill: muted)[#if "date" in ach { ach.date }]
                )
                if "description" in ach and ach.description != "" {
                  v(0.03em)
                  text(size: 7.9pt, fill: ink)[#parse-bold(ach.description)]
                }
              })
            }
          })
        }
        awards-rendered = true
      }
    } else if sec == "openSource" {
      if "openSource" in data and data.openSource.len() > 0 {
        section("Open Source Contributions", breakable: false, {
          for (i, item) in data.openSource.enumerate() {
            if i > 0 { v(0.26em) }
            block(width: 100%, breakable: false, {
              grid(
                columns: (1fr, auto),
                [
                  #text(weight: "bold", fill: ink)[#item.project]
                  #if "url" in item and item.url != "" [ #link(item.url)[#text(fill: accent)[ ↗]] ]
                  #if "contribution" in item and item.contribution != "" [ #text(fill: muted)[ · #item.contribution] ]
                ],
                text(size: 7.9pt, style: "italic", fill: muted)[#if "dates" in item { item.dates }]
              )
              if "bullets" in item and item.bullets.len() > 0 {
                v(0.04em)
                list(..item.bullets.map(parse-bold))
              } else if "impact" in item and item.impact != "" {
                v(0.03em)
                text(size: 7.9pt, fill: ink)[#parse-bold(item.impact)]
              }
            })
          }
        })
      }
    } else if sec == "publications" {
      if "publications" in data and data.publications.len() > 0 {
        section("Publications & Research", breakable: false, {
          for (i, pub) in data.publications.enumerate() {
            if i > 0 { v(0.24em) }
            block(width: 100%, breakable: false, {
              grid(
                columns: (1fr, auto),
                [
                  #text(weight: "bold", fill: ink)[#pub.title]
                  #if "url" in pub and pub.url != "" [ #link(pub.url)[#text(fill: accent)[ ↗]] ]
                  #if "publisher" in pub and pub.publisher != "" [ · #text(style: "italic", fill: muted)[#pub.publisher] ]
                ],
                text(size: 7.9pt, style: "italic", fill: muted)[#if "date" in pub { pub.date }]
              )
              if "description" in pub and pub.description != "" {
                v(0.03em)
                text(size: 7.9pt, fill: ink)[#parse-bold(pub.description)]
              }
            })
          }
        })
      }
    } else if sec == "leadership" {
      if "leadership" in data and data.leadership.len() > 0 {
        section("Advisory & Leadership", breakable: false, {
          for (i, lead) in data.leadership.enumerate() {
            if i > 0 { v(0.26em) }
            block(width: 100%, breakable: false, {
              grid(
                columns: (1fr, auto),
                [
                  #text(weight: "bold", fill: ink)[#lead.role]
                  #if "organization" in lead and lead.organization != "" [ #text(fill: muted)[ @ #lead.organization] ]
                ],
                text(size: 7.9pt, style: "italic", fill: muted)[#if "dates" in lead { lead.dates }]
              )
              if "bullets" in lead and lead.bullets.len() > 0 {
                v(0.04em)
                list(..lead.bullets.map(parse-bold))
              }
            })
          }
        })
      }
    } else if sec == "volunteering" {
      if "volunteering" in data and data.volunteering.len() > 0 {
        section("Community & Mentorship", breakable: false, {
          for (i, vol) in data.volunteering.enumerate() {
            if i > 0 { v(0.26em) }
            block(width: 100%, breakable: false, {
              grid(
                columns: (1fr, auto),
                [
                  #text(weight: "bold", fill: ink)[#vol.role]
                  #if "organization" in vol and vol.organization != "" [ #text(fill: muted)[ @ #vol.organization] ]
                ],
                text(size: 7.9pt, style: "italic", fill: muted)[#if "dates" in vol { vol.dates }]
              )
              if "bullets" in vol and vol.bullets.len() > 0 {
                v(0.04em)
                list(..vol.bullets.map(parse-bold))
              }
            })
          }
        })
      }
    } else if sec == "conferences" {
      if "conferences" in data and data.conferences.len() > 0 {
        section("Conferences & Presentations", breakable: false, {
          for (i, conf) in data.conferences.enumerate() {
            if i > 0 { v(0.24em) }
            block(width: 100%, breakable: false, {
              grid(
                columns: (1fr, auto),
                [
                  #text(weight: "bold", fill: ink)[#conf.name]
                  #if "role" in conf and conf.role != "" [ · #text(fill: muted)[#conf.role] ]
                ],
                text(size: 7.9pt, style: "italic", fill: muted)[#if "date" in conf { conf.date }]
              )
              if "description" in conf and conf.description != "" {
                v(0.03em)
                text(size: 7.9pt, fill: ink)[#parse-bold(conf.description)]
              }
            })
          }
        })
      }
    } else if sec == "languages" {
      if "languages" in data and data.languages.len() > 0 {
        section("Languages", breakable: false, {
          let items = data.languages.map(lang => [#text(weight: "bold", fill: ink)[#lang.language] #text(fill: muted)[(#lang.proficiency)]])
          items.join(text(fill: muted)[ · ])
        })
      }
    } else if sec == "interests" {
      if "interests" in data and data.interests.len() > 0 {
        section("Interests", breakable: false, {
          let items = ()
          for item in data.interests {
            if type(item) == str {
              items.push(item)
            } else if type(item) == dictionary and "name" in item {
              items.push(item.name)
            }
          }
          items.join(text(fill: muted)[ · ])
        })
      }
    } else if sec == "patents" {
      if "patents" in data and data.patents.len() > 0 {
        section("Patents & Intellectual Property", breakable: false, {
          for (i, pat) in data.patents.enumerate() {
            if i > 0 { v(0.22em) }
            block(width: 100%, breakable: false, {
              grid(
                columns: (1fr, auto),
                [
                  #text(weight: "bold", fill: ink)[#pat.title]
                  #let meta = ()
                  #if "number" in pat and pat.number != "" { meta.push("No. " + pat.number) }
                  #if "status" in pat and pat.status != "" { meta.push(pat.status) }
                  #if meta.len() > 0 [ #text(size: 7.8pt, fill: muted)[· #meta.join(", ")] ]
                ],
                text(size: 7.8pt, style: "italic", fill: muted)[#if "date" in pat { pat.date }]
              )
              if "description" in pat and pat.description != "" {
                v(0.03em)
                text(size: 7.8pt, fill: ink)[#parse-bold(pat.description)]
              }
            })
          }
        })
      }
    } else if sec == "products" {
      if "products" in data and data.products.len() > 0 {
        section("Products", breakable: false, {
          for (i, prod) in data.products.enumerate() {
            if i > 0 { v(0.24em) }
            block(width: 100%, breakable: false, {
              grid(
                columns: (1fr, auto),
                [
                  #text(weight: "bold", fill: ink)[#prod.name]
                  #if "url" in prod and prod.url != "" [ #link(prod.url)[#text(fill: accent)[ ↗]] ]
                  #if "role" in prod and prod.role != "" [ · #text(style: "italic", fill: muted)[#prod.role] ]
                ],
                text(size: 7.9pt, style: "italic", fill: muted)[#if "dates" in prod { prod.dates }]
              )
              if "description" in prod and prod.description != "" {
                v(0.03em)
                text(size: 7.8pt, fill: ink)[#parse-bold(prod.description)]
              }
            })
          }
        })
      }
    } else if sec == "devopsContributions" {
      if "devopsContributions" in data and data.devopsContributions.len() > 0 {
        section("DevOps & Infrastructure", breakable: false, {
          list(..data.devopsContributions.map(parse-bold))
        })
      }
    } else if sec == "securityContributions" {
      if "securityContributions" in data and data.securityContributions.len() > 0 {
        section("Security & Governance", breakable: false, {
          list(..data.securityContributions.map(parse-bold))
        })
      }
    } else if sec == "additionalInfo" {
      if "additionalInfo" in data and data.additionalInfo != none {
        let items = ()
        let ai = data.additionalInfo
        if "availability" in ai and ai.availability != "" { items.push([#text(weight: "bold", fill: ink)[Availability: ] #ai.availability]) }
        if "workAuthorization" in ai and ai.workAuthorization != "" { items.push([#text(weight: "bold", fill: ink)[Work Authorization: ] #ai.workAuthorization]) }
        if "relocation" in ai and ai.relocation != "" { items.push([#text(weight: "bold", fill: ink)[Relocation: ] #ai.relocation]) }
        if "travel" in ai and ai.travel != "" { items.push([#text(weight: "bold", fill: ink)[Travel: ] #ai.travel]) }
        if "notes" in ai and ai.notes != "" { items.push([#text(weight: "bold", fill: ink)[Notes: ] #ai.notes]) }
        if items.len() > 0 {
          section("Additional Information", breakable: false, items.join(text(fill: muted)[ · ]))
        }
      }
    } else if sec == "customSections" {
      if "customSections" in data and data.customSections.len() > 0 {
        for cs in data.customSections {
          if cs.items.len() > 0 {
            section(cs.title, breakable: false, {
              list(..cs.items.map(parse-bold))
            })
          }
        }
      }
    }
  }
}

#let render = render-editorial
