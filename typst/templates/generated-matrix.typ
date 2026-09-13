#import "/lib/utils.typ": parse-bold, clean-link, resolve-variant-field

#let render-matrix(data, variant: "default", theme: "matrix") = {
  let name = data.personal.name
  let headline = resolve-variant-field(data.personal.headline, variant, fallback: "")
  let summary = resolve-variant-field(data.summary, variant, fallback: "")
  let skills = resolve-variant-field(data.skills, variant, fallback: ())
  let projects = resolve-variant-field(data.projects, variant, fallback: ())
  let contact = data.personal.contact

  let ink = rgb("#1e293b")
  let muted = rgb("#64748b")
  let accent = rgb("#2563eb")
  let soft = rgb("#f8fafc")
  let card-bg = rgb("#f1f5f9")
  let stroke-line = rgb("#cbd5e1")
  let stroke-subtle = rgb("#e2e8f0")
  let white = rgb("#ffffff")

  set document(title: name + " — Resume", author: name, date: none)
  set page(
    paper: "a4",
    margin: (x: 1.20cm, y: 1.20cm),
    footer: context {
      let i = counter(page).get().first()
      let n = counter(page).final().first()
      if n > 1 {
        text(size: 7.4pt, fill: muted)[
          #grid(
            columns: (1fr, 1fr),
            align: (left, right),
            [#name · Resume],
            [Page #i of #n]
          )
        ]
      }
    }
  )
  set text(font: ("Inter", "Segoe UI", "Arial", "Liberation Sans", "DejaVu Sans"), size: 8.7pt, fill: ink, hyphenate: false, fallback: true)
  set par(leading: 0.56em, spacing: 0.44em, justify: false, linebreaks: "optimized")
  set list(indent: 0.85em, body-indent: 0.35em, spacing: 0.34em, marker: (text(fill: accent, "•"), text(fill: muted, "–")))
  show link: set text(fill: accent)
  show heading: it => it.body

  let contact-items = ()
  if "location" in contact and contact.location != "" { contact-items.push(contact.location) }
  if "email" in contact and contact.email != "" { contact-items.push(link("mailto:" + contact.email)[#contact.email]) }
  if "phone" in contact and contact.phone != "" { contact-items.push(link("tel:" + contact.phone.replace(" ", ""))[#contact.phone]) }
  if "linkedin" in contact and contact.linkedin != "" { contact-items.push(link("https://" + clean-link(contact.linkedin))[#clean-link(contact.linkedin)]) }
  if "github" in contact and contact.github != "" { contact-items.push(link("https://" + clean-link(contact.github))[#clean-link(contact.github)]) }
  if "website" in contact and contact.website != "" { contact-items.push(link("https://" + clean-link(contact.website))[#clean-link(contact.website)]) }
  let contact-text = contact-items.join(text(fill: muted)[ · ])

  let section(title, body, breakable: true) = {
    v(1.05em)
    block(width: 100%, breakable: breakable, [
      #block(above: 0pt, below: 0.18em, breakable: false, sticky: true, width: 100%, [
        #text(size: 8.9pt, weight: "bold", fill: accent)[#upper(title)]
        #v(0.06em)
        #line(length: 100%, stroke: 0.65pt + stroke-line)
      ])
      #body
    ])
  }

  // Header
  grid(
    columns: (1.35fr, 1fr),
    column-gutter: 1.0em,
    [
      #text(size: 19pt, weight: "bold", fill: ink)[#name]
      #if headline != "" [\ #v(0.06em)#text(size: 8.8pt, weight: "medium", fill: accent)[#headline]]
    ],
    [
      #align(right + top)[#text(size: 7.6pt, fill: muted)[#contact-text]]
    ]
  )
  v(0.14em)
  line(length: 100%, stroke: 1.5pt + accent)

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
      if summary != "" {
        section("Summary", parse-bold(summary))
      }
    } else if sec == "techStackSummary" {
      if "techStackSummary" in data and data.techStackSummary != none and data.techStackSummary != "" {
        section("Core Tech Stack", block(
          fill: card-bg,
          inset: (x: 0.65em, y: 0.45em),
          radius: 3pt,
          stroke: 0.5pt + stroke-subtle,
          width: 100%,
          text(size: 8.2pt)[#text(weight: "bold", fill: ink)[Specialized Technologies: ] #parse-bold(data.techStackSummary)]
        ))
      }
    } else if sec == "keyMetrics" {
      if "keyMetrics" in data and data.keyMetrics != none and data.keyMetrics.len() > 0 {
        section("Key Highlights & Performance Metrics", {
          let cols = calc.min(data.keyMetrics.len(), 4)
          grid(
            columns: (1fr,) * cols,
            column-gutter: 0.5em,
            row-gutter: 0.5em,
            ..data.keyMetrics.map(km => block(
              fill: card-bg,
              stroke: 0.5pt + stroke-line,
              inset: 0.45em,
              radius: 3pt,
              width: 100%,
              align(center)[
                #text(size: 10pt, weight: "bold", fill: accent)[#km.value] \
                #v(0.08em)
                #text(size: 7.4pt, weight: "bold", fill: ink)[#km.label]
                #if "context" in km and km.context != "" [
                  \ #v(0.04em)
                  #text(size: 6.8pt, fill: muted)[#km.context]
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
            if i > 0 { v(0.18em) }
            grid(
              columns: (140pt, 1fr),
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
            block(width: 100%, breakable: false, [
              #grid(
                columns: (1fr, auto),
                [#text(size: 8.9pt, weight: "bold", fill: ink)[#exp.role] #text(fill: accent)[·] #text(weight: "bold", fill: ink)[#exp.company]],
                text(size: 7.8pt, fill: muted)[#exp.dates]
              )
              #if ("location" in exp and exp.location != "") or ("technologies" in exp and exp.technologies != "") {
                v(0.03em)
                grid(
                  columns: (1fr, auto),
                  if "location" in exp and exp.location != "" { text(size: 7.8pt, fill: muted)[#exp.location] },
                  if "technologies" in exp and exp.technologies != "" { text(size: 7.5pt, fill: muted)[Stack: #exp.technologies] }
                )
              }
              #let all-bullets = ()
              #if "highlights" in exp and exp.highlights != () { all-bullets += exp.highlights }
              #if "impactBullets" in exp and exp.impactBullets != () { all-bullets += exp.impactBullets }
              #if "bullets" in exp and exp.bullets != () { all-bullets += exp.bullets }
              #if all-bullets.len() > 0 {
                v(0.12em)
                list(..all-bullets.map(parse-bold))
              }
            ])
          }
        })
      }
    } else if sec == "internships" {
      if "internships" in data and data.internships.len() > 0 {
        section("Engineering Internships", {
          for (i, exp) in data.internships.enumerate() {
            if i > 0 { v(0.52em) }
            block(width: 100%, breakable: false, [
              #grid(
                columns: (1fr, auto),
                [#text(size: 8.9pt, weight: "bold", fill: ink)[#exp.role] #text(fill: accent)[·] #text(weight: "bold", fill: ink)[#exp.company]],
                text(size: 7.8pt, fill: muted)[#exp.dates]
              )
              #if "location" in exp and exp.location != "" {
                v(0.03em)
                text(size: 7.8pt, fill: muted)[#exp.location]
              }
              #let all-bullets = ()
              #if "highlights" in exp and exp.highlights != () { all-bullets += exp.highlights }
              #if "impactBullets" in exp and exp.impactBullets != () { all-bullets += exp.impactBullets }
              #if "bullets" in exp and exp.bullets != () { all-bullets += exp.bullets }
              #if all-bullets.len() > 0 {
                v(0.12em)
                list(..all-bullets.map(parse-bold))
              }
            ])
          }
        })
      }
    } else if sec == "projects" {
      if projects != () and projects.len() > 0 {
        section("Key Projects & Systems", {
          for (i, proj) in projects.enumerate() {
            if i > 0 { v(0.40em) }
            block(
              fill: card-bg,
              stroke: 0.5pt + stroke-line,
              inset: 0.5em,
              radius: 3pt,
              width: 100%,
              breakable: false,
              [
                #grid(
                  columns: (1fr, auto),
                  [
                    #text(weight: "bold", fill: ink)[#proj.name]
                    #if "role" in proj and proj.role != "" [ #text(fill: muted)[·] #text(size: 8pt, fill: muted)[#proj.role] ]
                    #if "url" in proj and proj.url != "" [ #link(proj.url)[#text(fill: accent)[ ↗]] ]
                  ],
                  if "dates" in proj and proj.dates != "" { text(size: 7.8pt, fill: muted)[#proj.dates] }
                )
                #if "stack" in proj and proj.stack != "" {
                  v(0.04em)
                  text(size: 7.6pt, weight: "medium", fill: accent)[Stack: #proj.stack]
                }
                #if "description" in proj and proj.description != "" {
                  v(0.08em)
                  parse-bold(proj.description)
                }
                #let all-p-bullets = ()
                #if "highlights" in proj and proj.highlights != () { all-p-bullets += proj.highlights }
                #if "impactBullets" in proj and proj.impactBullets != () { all-p-bullets += proj.impactBullets }
                #if "bullets" in proj and proj.bullets != () { all-p-bullets += proj.bullets }
                #if all-p-bullets.len() > 0 {
                  v(0.12em)
                  list(..all-p-bullets.map(parse-bold))
                }
              ]
            )
          }
        })
      }
    } else if sec == "education" {
      if "education" in data and data.education.len() > 0 {
        section("Education", {
          for (i, edu) in data.education.enumerate() {
            if i > 0 { v(0.36em) }
            grid(
              columns: (1fr, auto),
              text(weight: "bold", fill: ink)[#edu.institution],
              text(size: 7.8pt, fill: muted)[#edu.dates]
            )
            v(0.02em)
            grid(
              columns: (1fr, auto),
              [#text(size: 8.2pt, fill: ink)[#edu.degree#if "specialization" in edu and edu.specialization != "" [ · #edu.specialization]]],
              if "gpa" in edu and edu.gpa != "" { text(size: 7.8pt, fill: muted)[GPA: #edu.gpa] }
            )
          }
        })
      }
    } else if sec == "certifications" {
      if "certifications" in data and data.certifications.len() > 0 {
        section("Certifications", {
          for (i, cert) in data.certifications.enumerate() {
            if i > 0 { v(0.24em) }
            grid(
              columns: (1fr, auto),
              [
                #text(weight: "bold", fill: ink)[#cert.name]
                #if "url" in cert and cert.url != "" [ #link(cert.url)[#text(fill: accent)[ ↗]] ]
                #if "issuer" in cert and cert.issuer != "" [ #text(fill: muted)[ · #cert.issuer] ]
              ],
              text(size: 7.8pt, fill: muted)[#if "date" in cert { cert.date }]
            )
          }
        })
      }
    } else if sec == "achievements" or sec == "awards" {
      if not awards-rendered {
        let items = if "achievements" in data and data.achievements.len() > 0 { data.achievements } else if "awards" in data and data.awards.len() > 0 { data.awards } else { () }
        if items.len() > 0 {
          section("Honors & Awards", {
            for (i, ach) in items.enumerate() {
              if i > 0 { v(0.25em) }
              grid(
                columns: (1fr, auto),
                [
                  #text(weight: "bold", fill: ink)[#ach.title]
                  #if "awarder" in ach and ach.awarder != "" [ #text(fill: muted)[ · #ach.awarder] ]
                  #if "url" in ach and ach.url != "" [ #link(ach.url)[#text(fill: accent)[ ↗]] ]
                ],
                text(size: 7.8pt, fill: muted)[#if "date" in ach { ach.date }]
              )
              if "description" in ach and ach.description != "" {
                v(0.04em)
                text(size: 7.8pt, fill: ink)[#parse-bold(ach.description)]
              }
            }
          })
        }
        awards-rendered = true
      }
    } else if sec == "openSource" {
      if "openSource" in data and data.openSource.len() > 0 {
        section("Open Source Contributions", {
          for (i, item) in data.openSource.enumerate() {
            if i > 0 { v(0.28em) }
            grid(
              columns: (1fr, auto),
              [
                #text(weight: "bold", fill: ink)[#item.project]
                #if "url" in item and item.url != "" [ #link(item.url)[#text(fill: accent)[ ↗]] ]
                #if "contribution" in item and item.contribution != "" [ #text(fill: muted)[ · #item.contribution] ]
              ],
              text(size: 7.8pt, fill: muted)[#if "dates" in item { item.dates }]
            )
            if "bullets" in item and item.bullets.len() > 0 {
              v(0.06em)
              list(..item.bullets.map(parse-bold))
            } else if "impact" in item and item.impact != "" {
              v(0.04em)
              text(size: 7.8pt, fill: ink)[#parse-bold(item.impact)]
            }
          }
        })
      }
    } else if sec == "publications" {
      if "publications" in data and data.publications.len() > 0 {
        section("Publications", {
          for (i, pub) in data.publications.enumerate() {
            if i > 0 { v(0.24em) }
            grid(
              columns: (1fr, auto),
              [
                #text(weight: "bold", fill: ink)[#pub.title]
                #if "url" in pub and pub.url != "" [ #link(pub.url)[#text(fill: accent)[ ↗]] ]
                #if "publisher" in pub and pub.publisher != "" [ #text(fill: muted)[ · #pub.publisher] ]
              ],
              text(size: 7.8pt, fill: muted)[#if "date" in pub { pub.date }]
            )
            if "description" in pub and pub.description != "" {
              v(0.04em)
              text(size: 7.8pt, fill: ink)[#parse-bold(pub.description)]
            }
          }
        })
      }
    } else if sec == "leadership" {
      if "leadership" in data and data.leadership.len() > 0 {
        section("Leadership & Activities", {
          for (i, lead) in data.leadership.enumerate() {
            if i > 0 { v(0.28em) }
            grid(
              columns: (1fr, auto),
              [
                #text(weight: "bold", fill: ink)[#lead.role]
                #if "organization" in lead and lead.organization != "" [ #text(fill: muted)[ @ #lead.organization] ]
              ],
              text(size: 7.8pt, fill: muted)[#if "dates" in lead { lead.dates }]
            )
            if "bullets" in lead and lead.bullets.len() > 0 {
              v(0.06em)
              list(..lead.bullets.map(parse-bold))
            }
          }
        })
      }
    } else if sec == "volunteering" {
      if "volunteering" in data and data.volunteering.len() > 0 {
        section("Volunteering & Community", {
          for (i, vol) in data.volunteering.enumerate() {
            if i > 0 { v(0.28em) }
            grid(
              columns: (1fr, auto),
              [
                #text(weight: "bold", fill: ink)[#vol.role]
                #if "organization" in vol and vol.organization != "" [ #text(fill: muted)[ @ #vol.organization] ]
              ],
              text(size: 7.8pt, fill: muted)[#if "dates" in vol { vol.dates }]
            )
            if "bullets" in vol and vol.bullets.len() > 0 {
              v(0.06em)
              list(..vol.bullets.map(parse-bold))
            }
          }
        })
      }
    } else if sec == "conferences" {
      if "conferences" in data and data.conferences.len() > 0 {
        section("Conferences & Speaking", {
          for (i, conf) in data.conferences.enumerate() {
            if i > 0 { v(0.24em) }
            grid(
              columns: (1fr, auto),
              [
                #text(weight: "bold", fill: ink)[#conf.name]
                #if "role" in conf and conf.role != "" [ #text(fill: muted)[ · #conf.role] ]
              ],
              text(size: 7.8pt, fill: muted)[#if "date" in conf { conf.date }]
            )
            if "description" in conf and conf.description != "" {
              v(0.04em)
              text(size: 7.8pt, fill: ink)[#parse-bold(conf.description)]
            }
          }
        })
      }
    } else if sec == "languages" {
      if "languages" in data and data.languages.len() > 0 {
        section("Languages", {
          let items = data.languages.map(lang => [#text(weight: "bold", fill: ink)[#lang.language] #text(fill: muted)[(#lang.proficiency)]])
          items.join(text(fill: muted)[ · ])
        })
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
          items.join(text(fill: muted)[ · ])
        })
      }
    } else if sec == "patents" {
      if "patents" in data and data.patents.len() > 0 {
        section("Patents & Intellectual Property", {
          for (i, pat) in data.patents.enumerate() {
            if i > 0 { v(0.18em) }
            let title-line = text(weight: "bold", fill: ink)[#pat.title]
            let meta = ()
            if "number" in pat and pat.number != "" { meta.push("US " + pat.number) }
            if "status" in pat and pat.status != "" { meta.push(pat.status) }
            if "date" in pat and pat.date != "" { meta.push(pat.date) }
            [• #title-line #if meta.len() > 0 [ #text(fill: muted)[— #meta.join(", ")] ]]
            if "description" in pat and pat.description != "" {
              v(0.04em)
              text(size: 7.8pt, fill: ink)[#parse-bold(pat.description)]
            }
          }
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
          section("Additional Information", items.join(text(fill: muted)[ · ]))
        }
      }
    } else if sec == "customSections" {
      if "customSections" in data and data.customSections.len() > 0 {
        for cs in data.customSections {
          if cs.items.len() > 0 {
            section(cs.title, {
              list(..cs.items.map(parse-bold))
            })
          }
        }
      }
    }
  }
}

#let render = render-matrix
