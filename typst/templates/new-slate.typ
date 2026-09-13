// ============================================================
// Template: Slate — Architectural Graphite & Accent Left Bar
// ============================================================

#import "/lib/utils.typ": parse-bold, clean-link, resolve-variant-field
#import "/lib/theme.typ": font-sans, font-serif, colors, typo, gap, pg, render-skills-adaptive, render-footer

#let render-slate(data, variant: "default", theme: "slate") = {
  let default-palette = (
    ink: rgb("#17222c"),
    muted: rgb("#617382"),
    accent: rgb("#2b5c77"),
    soft: rgb("#f2f5f7"),
    stroke-line: rgb("#d3dde3"),
    marker: rgb("#2b5c77"),
    link: rgb("#2b5c77"),
    name-fill: rgb("#17222c"),
    headline-fill: rgb("#2b5c77"),
    company-fill: rgb("#2b5c77"),
  )
  let t = if type(theme) == dictionary { theme } else if type(theme) == str { colors.at(theme, default: default-palette) } else { default-palette }

  let name = data.personal.name
  let headline = resolve-variant-field(data.personal.headline, variant, fallback: "")
  let summary = resolve-variant-field(data.summary, variant, fallback: "")
  let skills = resolve-variant-field(data.skills, variant, fallback: ())
  let projects = resolve-variant-field(data.projects, variant, fallback: ())
  let contact = data.personal.contact

  let ink = if "ink" in t { t.ink } else { default-palette.ink }
  let muted = if "muted" in t { t.muted } else { default-palette.muted }
  let accent = if "accent" in t { t.accent } else { default-palette.accent }
  let soft = if "soft" in t { t.soft } else { default-palette.soft }
  let stroke-line = if "stroke-line" in t { t.stroke-line } else { default-palette.stroke-line }
  let white = rgb("#ffffff")

  set document(title: if headline != "" { name + " — " + headline } else { name + " — Resume" }, author: name, date: none)
  set page(
    paper: pg.paper,
    margin: (x: 1.25cm, top: 1.35cm, bottom: 1.65cm),
    footer: render-footer(t, name)
  )
  set text(font: font-sans, size: 8.9pt, fill: ink, hyphenate: false, fallback: true)
  set par(leading: 0.58em, spacing: 0.48em, justify: false, linebreaks: "optimized")
  set list(indent: 0.90em, body-indent: 0.35em, spacing: 0.38em, marker: (text(fill: accent, size: 7.5pt)[●], text(fill: accent, size: 7.5pt)[–]))
  show link: set text(fill: accent)
  show heading: it => it.body

  let contact-items = ()
  if "location" in contact and contact.location != "" { contact-items.push(contact.location) }
  if "email" in contact and contact.email != "" { contact-items.push(link("mailto:" + contact.email)[#contact.email]) }
  if "phone" in contact and contact.phone != "" { contact-items.push(link("tel:" + contact.phone.replace(" ", ""))[#contact.phone]) }
  if "linkedin" in contact and contact.linkedin != "" { contact-items.push(link("https://" + clean-link(contact.linkedin))[#clean-link(contact.linkedin)]) }
  if "github" in contact and contact.github != "" { contact-items.push(link("https://" + clean-link(contact.github))[#clean-link(contact.github)]) }
  if "website" in contact and contact.website != "" { contact-items.push(link("https://" + clean-link(contact.website))[#clean-link(contact.website)]) }

  // Header Block (Slate Accent Left Bar Architecture)
  block(width: 100%, breakable: false, {
    grid(
      columns: (6pt, 1fr),
      column-gutter: 0.9em,
      align: (left + top, left + top),
      box(width: 6pt, height: 44pt, fill: accent, radius: 2pt),
      [
        #grid(
          columns: (1.5fr, 1fr),
          column-gutter: 1.2em,
          align: (left + horizon, right + horizon),
          [
            #text(size: 21pt, weight: "bold", fill: ink)[#name]
            #if headline != "" [
              \ #v(0.04em)
              #text(size: 9.2pt, weight: "medium", fill: accent)[#headline]
            ]
          ],
          align(right)[
            #set text(size: 7.6pt, fill: muted)
            #contact-items.join(linebreak())
          ]
        )
      ]
    )
    v(0.32em)
    line(length: 100%, stroke: 0.8pt + stroke-line)
  })

  let section(title, body, breakable: true) = {
    v(1.40em)
    block(width: 100%, breakable: breakable, {
      block(above: 0pt, below: 0.50em, breakable: false, sticky: true, width: 100%, {
        stack(
          spacing: 0.28em,
          text(size: 8.6pt, weight: "bold", fill: accent, tracking: 0.14em)[#heading(level: 2, outlined: true, bookmarked: true, upper(title))],
          line(length: 42pt, stroke: 1.4pt + accent)
        )
      })
      body
    })
  }

  let default-order = (
    "summary", "techStackSummary", "skills", "keyMetrics", "experience",
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
      if summary != "" {
        section("Profile Summary", parse-bold(summary))
      }
    } else if sec == "techStackSummary" {
      if "techStackSummary" in data and data.techStackSummary != none and data.techStackSummary != "" {
        section("Technical Stack", breakable: false, block(
          fill: soft,
          stroke: 0.5pt + stroke-line,
          inset: (x: 7pt, y: 4.5pt),
          radius: 2pt,
          width: 100%,
          text(size: 8.3pt)[#text(weight: "bold", fill: ink)[Core Stack:] #parse-bold(data.techStackSummary)]
        ))
      }
    } else if sec == "skills" {
      if skills != () and skills.len() > 0 {
        section("Core Competencies", breakable: false, {
          for (i, item) in skills.enumerate() {
            if i > 0 { v(0.18em) }
            grid(
              columns: (135pt, 1fr),
              column-gutter: 0.8em,
              text(weight: "bold", fill: ink)[#item.category],
              text(fill: muted)[#item.skills.join(", ")],
            )
          }
        })
      }
    } else if sec == "keyMetrics" {
      if "keyMetrics" in data and data.keyMetrics != none and data.keyMetrics.len() > 0 {
        section("Key Performance Metrics", breakable: false, {
          let cols = calc.min(data.keyMetrics.len(), 4)
          grid(
            columns: (1fr,) * cols,
            column-gutter: 0.55em,
            row-gutter: 0.55em,
            ..data.keyMetrics.map(km => block(
              fill: soft,
              stroke: 0.5pt + stroke-line,
              inset: (x: 5pt, y: 5.5pt),
              radius: 2pt,
              width: 100%,
              align(center)[
                #text(size: 9.6pt, weight: "bold", fill: accent)[#km.value] \
                #v(0.04em)
                #text(size: 7.4pt, weight: "bold", fill: ink)[#km.label]
                #if "context" in km and km.context != "" [
                  \ #v(0.02em)
                  #text(size: 6.8pt, fill: muted)[#km.context]
                ]
              ]
            ))
          )
        })
      }
    } else if sec == "experience" {
      if "experience" in data and data.experience.len() > 0 {
        section("Professional Experience", {
          for (i, exp) in data.experience.enumerate() {
            if i > 0 { v(0.55em) }
            block(width: 100%, breakable: false, [
              #grid(
                columns: (1fr, auto),
                column-gutter: 0.6em,
                text(size: 9.2pt, weight: "bold", fill: ink)[#exp.role],
                text(size: 8.0pt, fill: muted)[#exp.dates]
              )
              #v(0.08em)
              #text(size: 8.3pt, weight: "bold", fill: accent)[#exp.company#if "location" in exp and exp.location != "" [ #text(weight: "regular", fill: muted)[· #exp.location]]]
              #v(0.26em)
              #list(..exp.bullets.map(parse-bold))
            ])
          }
        })
      }
    } else if sec == "internships" {
      if "internships" in data and data.internships.len() > 0 {
        section("Internships", breakable: false, {
          for (i, exp) in data.internships.enumerate() {
            if i > 0 { v(0.50em) }
            block(width: 100%, breakable: false, [
              #grid(
                columns: (1fr, auto),
                column-gutter: 0.6em,
                text(size: 9.2pt, weight: "bold", fill: ink)[#exp.role],
                text(size: 8.0pt, fill: muted)[#exp.dates]
              )
              #v(0.08em)
              #text(size: 8.3pt, weight: "bold", fill: accent)[#exp.company#if "location" in exp and exp.location != "" [ #text(weight: "regular", fill: muted)[· #exp.location]]]
              #v(0.26em)
              #list(..exp.bullets.map(parse-bold))
            ])
          }
        })
      }
    } else if sec == "education" {
      if "education" in data and data.education.len() > 0 {
        section("Education", breakable: false, {
          for (i, edu) in data.education.enumerate() {
            if i > 0 { v(0.32em) }
            block(width: 100%, breakable: false, {
              grid(
                columns: (1fr, auto),
                column-gutter: 0.6em,
                text(weight: "bold", fill: ink)[#edu.degree#if "specialization" in edu and edu.specialization != "" [ · #text(weight: "regular", fill: muted)[#edu.specialization]]],
                text(size: 8.0pt, fill: muted)[#edu.dates]
              )
              v(0.04em)
              grid(
                columns: (1fr, auto),
                [#text(size: 8.3pt, weight: "medium", fill: accent)[#edu.institution#if "location" in edu and edu.location != "" [ #text(fill: muted)[· #edu.location]]]],
                if "gpa" in edu and edu.gpa != "" { text(size: 7.9pt, fill: muted)[GPA: #edu.gpa] }
              )
            })
          }
        })
      }
    } else if sec == "projects" {
      if projects != () and projects.len() > 0 {
        section("Key Projects", breakable: false, {
          for (i, proj) in projects.enumerate() {
            if i > 0 { v(0.42em) }
            block(
              fill: soft,
              stroke: 0.5pt + stroke-line,
              inset: (x: 8pt, y: 6pt),
              radius: 2pt,
              width: 100%,
              breakable: false,
              [
                #grid(
                  columns: (1fr, auto),
                  [
                    #text(size: 8.8pt, weight: "bold", fill: ink)[#proj.name]
                    #if "role" in proj and proj.role != "" [ #text(size: 7.8pt, fill: muted)[· #proj.role]]
                    #if "url" in proj and proj.url != "" [ #link(proj.url)[#text(size: 7.8pt, fill: accent)[ ↗]]]
                  ],
                  if "dates" in proj and proj.dates != "" { text(size: 7.9pt, fill: muted)[#proj.dates] }
                )
                #if "stack" in proj and proj.stack != "" [
                  #v(0.06em)
                  #text(size: 7.6pt, weight: "medium", fill: accent)[Stack: #proj.stack]
                ]
                #if "description" in proj and proj.description != "" [
                  #v(0.06em)
                  #text(size: 8.0pt, fill: ink)[#parse-bold(proj.description)]
                ]
                #if "bullets" in proj and proj.bullets.len() > 0 [
                  #v(0.24em)
                  #list(..proj.bullets.map(parse-bold))
                ]
              ]
            )
          }
        })
      }
    } else if sec == "certifications" {
      if "certifications" in data and data.certifications.len() > 0 {
        section("Certifications", breakable: false, {
          for (i, cert) in data.certifications.enumerate() {
            if i > 0 { v(0.22em) }
            block(width: 100%, breakable: false, {
              grid(
                columns: (1fr, auto),
                [
                  #text(weight: "bold", fill: ink)[#cert.name]
                  #if "url" in cert and cert.url != "" [ #link(cert.url)[#text(fill: accent)[ ↗]] ]
                  #if "issuer" in cert and cert.issuer != "" [ #text(fill: muted)[ · #cert.issuer] ]
                ],
                text(size: 7.9pt, fill: muted)[#if "date" in cert { cert.date }]
              )
            })
          }
        })
      }
    } else if sec == "achievements" or sec == "awards" {
      if not awards-rendered {
        let items = if "achievements" in data and data.achievements.len() > 0 { data.achievements } else if "awards" in data and data.awards.len() > 0 { data.awards } else { () }
        if items.len() > 0 {
          section("Honors & Awards", breakable: false, {
            for (i, ach) in items.enumerate() {
              if i > 0 { v(0.24em) }
              block(width: 100%, breakable: false, {
                grid(
                  columns: (1fr, auto),
                  [
                    #text(weight: "bold", fill: ink)[#if "title" in ach { ach.title } else if "name" in ach { ach.name } else { "" }]
                    #if "awarder" in ach and ach.awarder != "" [ #text(fill: muted)[ · #ach.awarder] ]
                    #if "url" in ach and ach.url != "" [ #link(ach.url)[#text(fill: accent)[ ↗]] ]
                  ],
                  text(size: 7.9pt, fill: muted)[#if "date" in ach { ach.date }]
                )
                if "description" in ach and ach.description != "" {
                  v(0.04em)
                  text(size: 8.0pt, fill: ink)[#parse-bold(ach.description)]
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
                text(size: 7.9pt, fill: muted)[#if "dates" in item { item.dates }]
              )
              if "bullets" in item and item.bullets.len() > 0 {
                v(0.22em)
                list(..item.bullets.map(parse-bold))
              } else if "impact" in item and item.impact != "" {
                v(0.06em)
                text(size: 8.0pt, fill: ink)[#parse-bold(item.impact)]
              }
            })
          }
        })
      }
    } else if sec == "publications" {
      if "publications" in data and data.publications.len() > 0 {
        section("Publications", breakable: false, {
          for (i, pub) in data.publications.enumerate() {
            if i > 0 { v(0.24em) }
            block(width: 100%, breakable: false, {
              grid(
                columns: (1fr, auto),
                [
                  #text(weight: "bold", fill: ink)[#pub.title]
                  #if "url" in pub and pub.url != "" [ #link(pub.url)[#text(fill: accent)[ ↗]] ]
                  #if "publisher" in pub and pub.publisher != "" [ #text(fill: muted)[ · #pub.publisher] ]
                ],
                text(size: 7.9pt, fill: muted)[#if "date" in pub { pub.date }]
              )
            })
          }
        })
      }
    } else if sec == "leadership" {
      if "leadership" in data and data.leadership.len() > 0 {
        section("Leadership & Direction", breakable: false, {
          for (i, item) in data.leadership.enumerate() {
            if i > 0 { v(0.30em) }
            block(width: 100%, breakable: false, {
              grid(
                columns: (1fr, auto),
                [
                  #text(weight: "bold", fill: ink)[#item.role]
                  #if "organization" in item and item.organization != "" [ #text(weight: "medium", fill: accent)[ @ #item.organization] ]
                ],
                text(size: 7.9pt, fill: muted)[#if "dates" in item { item.dates }]
              )
              if "bullets" in item and item.bullets.len() > 0 {
                v(0.22em)
                list(..item.bullets.map(parse-bold))
              } else if "impact" in item and item.impact != "" {
                v(0.06em)
                text(size: 8.0pt, fill: ink)[#parse-bold(item.impact)]
              }
            })
          }
        })
      }
    } else if sec == "volunteering" {
      if "volunteering" in data and data.volunteering.len() > 0 {
        section("Volunteering & Community", breakable: false, {
          for (i, vol) in data.volunteering.enumerate() {
            if i > 0 { v(0.26em) }
            block(width: 100%, breakable: false, {
              grid(
                columns: (1fr, auto),
                [
                  #text(weight: "bold", fill: ink)[#vol.role]
                  #if "organization" in vol and vol.organization != "" [ #text(fill: muted)[ @ #vol.organization] ]
                ],
                text(size: 7.9pt, fill: muted)[#if "dates" in vol { vol.dates }]
              )
              if "bullets" in vol and vol.bullets.len() > 0 {
                v(0.22em)
                list(..vol.bullets.map(parse-bold))
              }
            })
          }
        })
      }
    } else if sec == "conferences" {
      if "conferences" in data and data.conferences.len() > 0 {
        section("Conferences & Speaking", breakable: false, {
          for (i, conf) in data.conferences.enumerate() {
            if i > 0 { v(0.24em) }
            block(width: 100%, breakable: false, {
              grid(
                columns: (1fr, auto),
                [
                  #text(weight: "bold", fill: ink)[#conf.name]
                  #if "role" in conf and conf.role != "" [ #text(fill: muted)[ · #conf.role] ]
                ],
                text(size: 7.9pt, fill: muted)[#if "date" in conf { conf.date }]
              )
              if "details" in conf and conf.details != "" {
                v(0.04em)
                text(size: 8.0pt, fill: ink)[#parse-bold(conf.details)]
              }
            })
          }
        })
      }
    } else if sec == "languages" {
      if "languages" in data and data.languages.len() > 0 {
        section("Languages", breakable: false, {
          let items = data.languages.map(l => [
            #text(weight: "bold", fill: ink)[#l.language]
            #if "fluency" in l and l.fluency != "" [ (#text(fill: muted)[#l.fluency])]
          ])
          items.join([ #text(fill: stroke-line)[·] ])
        })
      }
    } else if sec == "interests" {
      if "interests" in data and data.interests.len() > 0 {
        section("Interests", breakable: false, {
          let items = data.interests.map(it => if type(it) == str { it } else if "name" in it { it.name } else { "" })
          text(size: 8.2pt, fill: ink)[#items.filter(x => x != "").join([ #text(fill: stroke-line)[·] ])]
        })
      }
    } else if sec == "patents" {
      if "patents" in data and data.patents.len() > 0 {
        section("Patents", breakable: false, {
          for (i, pat) in data.patents.enumerate() {
            if i > 0 { v(0.24em) }
            block(width: 100%, breakable: false, {
              grid(
                columns: (1fr, auto),
                [
                  #text(weight: "bold", fill: ink)[#pat.title]
                  #if "number" in pat and pat.number != "" [ #text(fill: muted)[ · #pat.number] ]
                ],
                text(size: 7.9pt, fill: muted)[#if "date" in pat { pat.date }]
              )
            })
          }
        })
      }
    } else if sec == "products" {
      if "products" in data and data.products.len() > 0 {
        section("Products Built", breakable: false, {
          for (i, prod) in data.products.enumerate() {
            if i > 0 { v(0.26em) }
            block(width: 100%, breakable: false, {
              grid(
                columns: (1fr, auto),
                [
                  #text(weight: "bold", fill: ink)[#prod.name]
                  #if "url" in prod and prod.url != "" [ #link(prod.url)[#text(fill: accent)[ ↗]] ]
                ],
                text(size: 7.9pt, fill: muted)[#if "dates" in prod { prod.dates }]
              )
              if "description" in prod and prod.description != "" {
                v(0.04em)
                text(size: 8.0pt, fill: ink)[#parse-bold(prod.description)]
              }
            })
          }
        })
      }
    } else if sec == "devopsContributions" {
      if "devopsContributions" in data and data.devopsContributions.len() > 0 {
        section("DevOps Contributions", breakable: false, {
          for (i, item) in data.devopsContributions.enumerate() {
            if i > 0 { v(0.24em) }
            block(width: 100%, breakable: false, {
              text(weight: "bold", fill: ink)[#item.project]
              if "impact" in item and item.impact != "" [ #text(fill: muted)[ · #item.impact] ]
            })
          }
        })
      }
    } else if sec == "securityContributions" {
      if "securityContributions" in data and data.securityContributions.len() > 0 {
        section("Security Contributions", breakable: false, {
          for (i, item) in data.securityContributions.enumerate() {
            if i > 0 { v(0.24em) }
            block(width: 100%, breakable: false, {
              text(weight: "bold", fill: ink)[#item.project]
              if "impact" in item and item.impact != "" [ #text(fill: muted)[ · #item.impact] ]
            })
          }
        })
      }
    } else if sec == "additionalInfo" {
      if "additionalInfo" in data and data.additionalInfo != none {
        let ai = data.additionalInfo
        if type(ai) == dictionary {
          let items = ()
          if "availability" in ai and ai.availability != "" { items.push([#text(weight: "bold", fill: ink)[Availability: ] #ai.availability]) }
          if "workAuthorization" in ai and ai.workAuthorization != "" { items.push([#text(weight: "bold", fill: ink)[Work Authorization: ] #ai.workAuthorization]) }
          if "relocation" in ai and ai.relocation != "" { items.push([#text(weight: "bold", fill: ink)[Relocation: ] #ai.relocation]) }
          if "travel" in ai and ai.travel != "" { items.push([#text(weight: "bold", fill: ink)[Travel: ] #ai.travel]) }
          if "clearance" in ai and ai.clearance != "" { items.push([#text(weight: "bold", fill: ink)[Security Clearance: ] #ai.clearance]) }
          if "notes" in ai and ai.notes != "" { items.push([#text(weight: "bold", fill: ink)[Notes: ] #ai.notes]) }
          if items.len() > 0 {
            section("Additional Information", breakable: false, items.join(text(fill: muted)[ · ]))
          }
        } else if type(ai) == array and ai.len() > 0 {
          section("Additional Information", breakable: false, list(..ai.map(parse-bold)))
        } else if type(ai) == str and ai != "" {
          section("Additional Information", breakable: false, parse-bold(ai))
        }
      }
    } else if sec == "customSections" {
      if "customSections" in data and data.customSections.len() > 0 {
        for cs in data.customSections {
          section(cs.title, breakable: false, list(..cs.items.map(parse-bold)))
        }
      }
    }
  }
}

#let render = render-slate
