// ============================================================
// Template: Focus — Concise High-Accountability Executive Layout
// ============================================================
// Design principles:
//  - Clean, laser-focused single-column layout emphasizing scope & ownership
//  - Strong 2pt ink divider beneath header with amber accent anchors
//  - High-contrast typography: bold accent section headings, dark ink item titles, muted metadata
//  - Full support for all 22+ Golden Resume fields

#import "/lib/utils.typ": parse-bold, clean-link, resolve-variant-field
#import "/lib/theme.typ": font-sans, font-serif, colors, typo, gap, pg, render-skills-adaptive, render-footer

#let render-focus(data, variant: "default", theme: "focus") = {
  let default-palette = (
    ink: rgb("#101418"),
    accent: rgb("#b45309"),
    muted: rgb("#525866"),
    marker: rgb("#b45309"),
    link: rgb("#b45309"),
    name-fill: rgb("#101418"),
    headline-fill: rgb("#b45309"),
    company-fill: rgb("#b45309"),
  )
  let t = if type(theme) == dictionary { theme } else if type(theme) == str { colors.at(theme, default: default-palette) } else { default-palette }

  let name = data.personal.name
  let headline = resolve-variant-field(data.personal.headline, variant, fallback: "")
  let summary = resolve-variant-field(data.summary, variant, fallback: "")
  let skills = resolve-variant-field(data.skills, variant, fallback: ())
  let projects = resolve-variant-field(data.projects, variant, fallback: ())

  let accent-bg = if "accent" in t { t.accent.lighten(94%) } else { rgb("#fffbeb") }
  let accent-border = if "accent" in t { t.accent.lighten(72%) } else { rgb("#fde68a") }

  set document(title: if headline != "" { name + " — " + headline } else { name + " — Resume" }, author: name, date: none)
  set page(paper: pg.paper, margin: (x: 1.30cm, top: 1.30cm, bottom: 1.35cm), footer: render-footer(t, name))
  set text(font: font-sans, size: 8.9pt, fill: t.ink, hyphenate: false, fallback: true)
  set par(leading: 0.58em, spacing: 0.48em, justify: false, linebreaks: "optimized")
  set list(indent: 0.85em, body-indent: 0.35em, spacing: 0.36em, marker: (text(fill: t.marker)[•], text(fill: t.marker)[–]))
  show link: set text(fill: t.link)
  show heading: it => it.body

  // Header Block
  align(left)[
    #text(size: 22pt, weight: "bold", fill: t.name-fill)[#name]
    #if headline != "" [
      #v(0.10em)
      #text(size: 9.4pt, weight: "bold", fill: t.headline-fill)[#headline]
    ]
  ]
  v(0.18em)
  text(size: 7.9pt, fill: t.muted)[#{
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
  v(0.20em)
  line(length: 100%, stroke: 2pt + t.ink)

  let section(title, body, breakable: true) = {
    v(1.25em)
    block(width: 100%, breakable: breakable, {
      block(breakable: false, sticky: true, width: 100%, {
        stack(
          spacing: 0.28em,
          text(font: font-sans, size: 8.6pt, weight: "bold", tracking: 0.12em, fill: t.accent)[#heading(level: 2, outlined: true, bookmarked: true, upper(title))],
          line(length: 28pt, stroke: 1.8pt + t.accent)
        )
        v(0.18em)
      })
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
      if summary != "" { section("Executive Summary", parse-bold(summary)) }
    } else if sec == "techStackSummary" {
      if "techStackSummary" in data and data.techStackSummary != none and data.techStackSummary != "" {
        section("Core Architecture & Stack", block(
          fill: accent-bg,
          stroke: 0.4pt + accent-border,
          inset: (x: 6pt, y: 3.5pt),
          radius: 2pt,
          width: 100%,
          text(size: 8.2pt)[#text(weight: "bold", fill: t.ink)[Technical Summary:] #parse-bold(data.techStackSummary)]
        ))
      }
    } else if sec == "keyMetrics" {
      if "keyMetrics" in data and data.keyMetrics != none and data.keyMetrics.len() > 0 {
        section("Key Metrics & Organizational Impact", {
          let cols = calc.min(data.keyMetrics.len(), 4)
          grid(
            columns: (1fr,) * cols,
            column-gutter: 0.5em,
            row-gutter: 0.5em,
            ..data.keyMetrics.map(km => block(
              fill: accent-bg,
              stroke: 0.4pt + accent-border,
              inset: 0.4em,
              radius: 2pt,
              width: 100%,
              align(center)[
                #text(size: 9.4pt, weight: "bold", fill: t.accent)[#km.value] \
                #v(0.04em)
                #text(size: 7.3pt, weight: "bold", fill: t.ink)[#km.label]
                #if "context" in km and km.context != "" [
                  \ #v(0.02em)
                  #text(size: 6.7pt, fill: t.muted)[#km.context]
                ]
              ]
            ))
          )
        })
      }
    } else if sec == "skills" {
      if skills != () and skills.len() > 0 {
        section("Technical Competencies", {
          for (i, item) in skills.enumerate() {
            if i > 0 { v(0.16em) }
            grid(
              columns: (135pt, 1fr),
              column-gutter: 0.8em,
              text(weight: "bold", fill: t.ink)[#item.category],
              text(fill: t.ink)[#item.skills.join(", ")],
            )
          }
        })
      }
    } else if sec == "experience" {
      if "experience" in data and data.experience.len() > 0 {
        section("Professional Experience", {
          for (i, exp) in data.experience.enumerate() {
            if i > 0 { v(0.65em) }
            block(width: 100%, breakable: false, {
              grid(
                columns: (1fr, auto), column-gutter: 0.8em,
                align: (left + top, right + top),
                text(size: 9.1pt, weight: "bold", fill: t.ink)[#exp.role],
                text(size: 8.0pt, fill: t.muted)[#exp.dates],
              )
              v(0.02em)
              text(size: 8.3pt, weight: "bold", fill: t.company-fill)[#exp.company]
              if "location" in exp and exp.location != "" [#text(size: 7.7pt, fill: t.muted)[ · #exp.location]]
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
        section("Internships", {
          for (i, exp) in data.internships.enumerate() {
            if i > 0 { v(0.60em) }
            block(width: 100%, breakable: false, {
              grid(
                columns: (1fr, auto), column-gutter: 0.8em,
                align: (left + top, right + top),
                text(size: 9.1pt, weight: "bold", fill: t.ink)[#exp.role],
                text(size: 8.0pt, fill: t.muted)[#exp.dates],
              )
              v(0.02em)
              text(size: 8.3pt, weight: "bold", fill: t.company-fill)[#exp.company]
              if "location" in exp and exp.location != "" [#text(size: 7.7pt, fill: t.muted)[ · #exp.location]]
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
        }, breakable: false)
      }
    } else if sec == "education" {
      if "education" in data and data.education.len() > 0 {
        section("Education", {
          for (i, edu) in data.education.enumerate() {
            if i > 0 { v(0.40em) }
            block(width: 100%, breakable: false, {
              grid(
                columns: (1fr, auto), column-gutter: 0.8em,
                text(weight: "bold", fill: t.ink)[#edu.institution#if "location" in edu and edu.location != "" [ · #text(weight: "regular", fill: t.muted)[#edu.location]]],
                text(size: 8.0pt, fill: t.muted)[#edu.dates],
              )
              v(0.02em)
              grid(
                columns: (1fr, auto),
                [#text(size: 8.2pt, fill: t.company-fill)[#edu.degree#if "specialization" in edu and edu.specialization != "" [ · #edu.specialization]]],
                if "gpa" in edu and edu.gpa != "" { text(size: 7.8pt, fill: t.muted)[GPA: #edu.gpa] }
              )
            })
          }
        }, breakable: false)
      }
    } else if sec == "projects" {
      if projects != () and projects.len() > 0 {
        section("Projects & Initiatives", {
          for (i, proj) in projects.enumerate() {
            if i > 0 { v(0.48em) }
            block(width: 100%, breakable: false, {
              grid(
                columns: (1fr, auto),
                [
                  #text(weight: "bold", fill: t.ink)[#proj.name]
                  #if "role" in proj and proj.role != "" [ #text(fill: t.muted)[·] #text(size: 8pt, style: "italic", fill: t.muted)[#proj.role] ]
                  #if "url" in proj and proj.url != "" [ #link(proj.url)[#text(fill: t.accent)[ ↗]] ]
                ],
                if "dates" in proj and proj.dates != "" { text(size: 8pt, fill: t.muted)[#proj.dates] }
              )
              if "stack" in proj and proj.stack != "" {
                v(0.03em)
                text(size: 7.8pt, fill: t.company-fill)[Tech Stack: #proj.stack]
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
        }, breakable: false)
      }
    } else if sec == "certifications" {
      if "certifications" in data and data.certifications.len() > 0 {
        section("Certifications", {
          for (i, cert) in data.certifications.enumerate() {
            if i > 0 { v(0.24em) }
            block(width: 100%, breakable: false, {
              grid(
                columns: (1fr, auto),
                [
                  #text(weight: "bold", fill: t.ink)[#cert.name]
                  #if "url" in cert and cert.url != "" [ #link(cert.url)[#text(fill: t.accent)[ ↗]] ]
                  #if "issuer" in cert and cert.issuer != "" [ #text(fill: t.muted)[ · #cert.issuer] ]
                ],
                text(size: 7.9pt, fill: t.muted)[#if "date" in cert { cert.date }]
              )
            })
          }
        }, breakable: false)
      }
    } else if sec == "achievements" or sec == "awards" {
      if not awards-rendered {
        let items = if "achievements" in data and data.achievements.len() > 0 { data.achievements } else if "awards" in data and data.awards.len() > 0 { data.awards } else { () }
        if items.len() > 0 {
          section("Honors & Awards", {
            for (i, ach) in items.enumerate() {
              if i > 0 { v(0.24em) }
              block(width: 100%, breakable: false, {
                grid(
                  columns: (1fr, auto),
                  [
                    #text(weight: "bold", fill: t.ink)[#ach.title]
                    #if "awarder" in ach and ach.awarder != "" [ #text(fill: t.muted)[ · #ach.awarder] ]
                    #if "url" in ach and ach.url != "" [ #link(ach.url)[#text(fill: t.accent)[ ↗]] ]
                  ],
                  text(size: 7.9pt, fill: t.muted)[#if "date" in ach { ach.date }]
                )
                if "description" in ach and ach.description != "" {
                  v(0.03em)
                  text(size: 7.9pt, fill: t.ink)[#parse-bold(ach.description)]
                }
              })
            }
          }, breakable: false)
        }
        awards-rendered = true
      }
    } else if sec == "openSource" {
      if "openSource" in data and data.openSource.len() > 0 {
        section("Open Source Architecture", {
          for (i, item) in data.openSource.enumerate() {
            if i > 0 { v(0.26em) }
            block(width: 100%, breakable: false, {
              grid(
                columns: (1fr, auto),
                [
                  #text(weight: "bold", fill: t.ink)[#item.project]
                  #if "url" in item and item.url != "" [ #link(item.url)[#text(fill: t.accent)[ ↗]] ]
                  #if "contribution" in item and item.contribution != "" [ #text(fill: t.muted)[ · #item.contribution] ]
                ],
                text(size: 7.9pt, fill: t.muted)[#if "dates" in item { item.dates }]
              )
              if "bullets" in item and item.bullets.len() > 0 {
                v(0.04em)
                list(..item.bullets.map(parse-bold))
              } else if "impact" in item and item.impact != "" {
                v(0.03em)
                text(size: 7.9pt, fill: t.ink)[#parse-bold(item.impact)]
              }
            })
          }
        }, breakable: false)
      }
    } else if sec == "publications" {
      if "publications" in data and data.publications.len() > 0 {
        section("Publications", {
          for (i, pub) in data.publications.enumerate() {
            if i > 0 { v(0.24em) }
            block(width: 100%, breakable: false, {
              grid(
                columns: (1fr, auto),
                [
                  #text(weight: "bold", fill: t.ink)[#pub.title]
                  #if "url" in pub and pub.url != "" [ #link(pub.url)[#text(fill: t.accent)[ ↗]] ]
                  #if "publisher" in pub and pub.publisher != "" [ · #text(style: "italic", fill: t.muted)[#pub.publisher] ]
                ],
                text(size: 7.9pt, fill: t.muted)[#if "date" in pub { pub.date }]
              )
              if "description" in pub and pub.description != "" {
                v(0.03em)
                text(size: 7.9pt, fill: t.ink)[#parse-bold(pub.description)]
              }
            })
          }
        }, breakable: false)
      }
    } else if sec == "leadership" {
      if "leadership" in data and data.leadership.len() > 0 {
        section("Advisory & Leadership", {
          for (i, lead) in data.leadership.enumerate() {
            if i > 0 { v(0.26em) }
            block(width: 100%, breakable: false, {
              grid(
                columns: (1fr, auto),
                [
                  #text(weight: "bold", fill: t.ink)[#lead.role]
                  #if "organization" in lead and lead.organization != "" [ #text(fill: t.muted)[ @ #lead.organization] ]
                ],
                text(size: 7.9pt, fill: t.muted)[#if "dates" in lead { lead.dates }]
              )
              if "bullets" in lead and lead.bullets.len() > 0 {
                v(0.04em)
                list(..lead.bullets.map(parse-bold))
              }
            })
          }
        }, breakable: false)
      }
    } else if sec == "volunteering" {
      if "volunteering" in data and data.volunteering.len() > 0 {
        section("Community & Volunteering", {
          for (i, vol) in data.volunteering.enumerate() {
            if i > 0 { v(0.26em) }
            block(width: 100%, breakable: false, {
              grid(
                columns: (1fr, auto),
                [
                  #text(weight: "bold", fill: t.ink)[#vol.role]
                  #if "organization" in vol and vol.organization != "" [ #text(fill: t.muted)[ @ #vol.organization] ]
                ],
                text(size: 7.9pt, fill: t.muted)[#if "dates" in vol { vol.dates }]
              )
              if "bullets" in vol and vol.bullets.len() > 0 {
                v(0.04em)
                list(..vol.bullets.map(parse-bold))
              }
            })
          }
        }, breakable: false)
      }
    } else if sec == "conferences" {
      if "conferences" in data and data.conferences.len() > 0 {
        section("Conferences & Presentations", {
          for (i, conf) in data.conferences.enumerate() {
            if i > 0 { v(0.24em) }
            block(width: 100%, breakable: false, {
              grid(
                columns: (1fr, auto),
                [
                  #text(weight: "bold", fill: t.ink)[#conf.name]
                  #if "role" in conf and conf.role != "" [ · #text(fill: t.muted)[#conf.role] ]
                ],
                text(size: 7.9pt, fill: t.muted)[#if "date" in conf { conf.date }]
              )
              if "description" in conf and conf.description != "" {
                v(0.03em)
                text(size: 7.9pt, fill: t.ink)[#parse-bold(conf.description)]
              }
            })
          }
        }, breakable: false)
      }
    } else if sec == "languages" {
      if "languages" in data and data.languages.len() > 0 {
        section("Languages", {
          let items = data.languages.map(lang => [#text(weight: "bold", fill: t.ink)[#lang.language] #text(fill: t.muted)[(#lang.proficiency)]])
          items.join(text(fill: t.muted)[ · ])
        }, breakable: false)
      }
    } else if sec == "interests" {
      if "interests" in data and data.interests.len() > 0 {
        section("Interests", {
          let items = ()
          for item in data.interests {
            if type(item) == str {
              items.push(item)
            } else if type(item) == dictionary and "name" in item {
              items.push(item.name)
            }
          }
          items.join(text(fill: t.muted)[ · ])
        }, breakable: false)
      }
    } else if sec == "patents" {
      if "patents" in data and data.patents.len() > 0 {
        section("Patents & IP", {
          for (i, pat) in data.patents.enumerate() {
            if i > 0 { v(0.22em) }
            block(width: 100%, breakable: false, {
              grid(
                columns: (1fr, auto),
                [
                  #text(weight: "bold", fill: t.ink)[#pat.title]
                  #let meta = ()
                  #if "number" in pat and pat.number != "" { meta.push("No. " + pat.number) }
                  #if "status" in pat and pat.status != "" { meta.push(pat.status) }
                  #if meta.len() > 0 [ #text(size: 7.8pt, fill: t.muted)[· #meta.join(", ")] ]
                ],
                text(size: 7.8pt, fill: t.muted)[#if "date" in pat { pat.date }]
              )
              if "description" in pat and pat.description != "" {
                v(0.03em)
                text(size: 7.8pt, fill: t.ink)[#parse-bold(pat.description)]
              }
            })
          }
        }, breakable: false)
      }
    } else if sec == "products" {
      if "products" in data and data.products.len() > 0 {
        section("Products", {
          for (i, prod) in data.products.enumerate() {
            if i > 0 { v(0.24em) }
            block(width: 100%, breakable: false, {
              grid(
                columns: (1fr, auto),
                [
                  #text(weight: "bold", fill: t.ink)[#prod.name]
                  #if "url" in prod and prod.url != "" [ #link(prod.url)[#text(fill: t.accent)[ ↗]] ]
                  #if "role" in prod and prod.role != "" [ · #text(style: "italic", fill: t.muted)[#prod.role] ]
                ],
                text(size: 7.9pt, fill: t.muted)[#if "dates" in prod { prod.dates }]
              )
              if "description" in prod and prod.description != "" {
                v(0.03em)
                text(size: 7.8pt, fill: t.ink)[#parse-bold(prod.description)]
              }
            })
          }
        }, breakable: false)
      }
    } else if sec == "devopsContributions" {
      if "devopsContributions" in data and data.devopsContributions.len() > 0 {
        section("DevOps & Infrastructure", {
          list(..data.devopsContributions.map(parse-bold))
        }, breakable: false)
      }
    } else if sec == "securityContributions" {
      if "securityContributions" in data and data.securityContributions.len() > 0 {
        section("Security & Governance", {
          list(..data.securityContributions.map(parse-bold))
        }, breakable: false)
      }
    } else if sec == "additionalInfo" {
      if "additionalInfo" in data and data.additionalInfo != none {
        let items = ()
        let ai = data.additionalInfo
        if "availability" in ai and ai.availability != "" { items.push([#text(weight: "bold", fill: t.ink)[Availability: ] #ai.availability]) }
        if "workAuthorization" in ai and ai.workAuthorization != "" { items.push([#text(weight: "bold", fill: t.ink)[Work Authorization: ] #ai.workAuthorization]) }
        if "relocation" in ai and ai.relocation != "" { items.push([#text(weight: "bold", fill: t.ink)[Relocation: ] #ai.relocation]) }
        if "travel" in ai and ai.travel != "" { items.push([#text(weight: "bold", fill: t.ink)[Travel: ] #ai.travel]) }
        if "notes" in ai and ai.notes != "" { items.push([#text(weight: "bold", fill: t.ink)[Notes: ] #ai.notes]) }
        if items.len() > 0 {
          section("Additional Information", items.join(text(fill: t.muted)[ · ]), breakable: false)
        }
      }
    } else if sec == "customSections" {
      if "customSections" in data and data.customSections.len() > 0 {
        for cs in data.customSections {
          if cs.items.len() > 0 {
            section(cs.title, {
              list(..cs.items.map(parse-bold))
            }, breakable: false)
          }
        }
      }
    }
  }
}

#let render = render-focus
