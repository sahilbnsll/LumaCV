#import "/lib/utils.typ": parse-bold, clean-link, resolve-variant-field
#import "/lib/theme.typ": font-sans, colors, typo, gap, pg, render-skills-adaptive, render-footer
#import "/support/resume-core.typ": render-languages, render-publications, render-open-source, render-leadership, render-volunteering, render-conferences, render-interests

#let render-timeline(data, variant: "default", theme: "timeline") = {
  let name = data.personal.name
  let headline = resolve-variant-field(data.personal.headline, variant, fallback: "")
  let summary = resolve-variant-field(data.summary, variant, fallback: "")
  let skills = resolve-variant-field(data.skills, variant, fallback: ())
  let projects = resolve-variant-field(data.projects, variant, fallback: ())
  let contact = data.personal.contact

  let t = (
    ink: rgb("#192434"),          // Deep charcoal slate
    muted: rgb("#5c6c7f"),        // Muted slate
    accent: rgb("#4457d5"),       // Vibrant timeline indigo
    accent-light: rgb("#eef1fd"), // Soft indigo wash
    soft: rgb("#f6f8fc"),
    stroke-line: rgb("#d4dbee"),
    tag-bg: rgb("#f4f6fc"),
    tag-border: rgb("#d5ddf5"),
    white: rgb("#ffffff"),
  )

  set document(title: name + " — Trajectory CV", author: name, date: none)
  set page(
    paper: "a4",
    margin: (x: 1.40cm, top: 1.35cm, bottom: 1.60cm),
    footer: render-footer(t, name)
  )
  set text(font: font-sans, size: 8.8pt, fill: t.ink, hyphenate: false, fallback: true)
  set par(leading: 0.56em, spacing: 0.44em, justify: false, linebreaks: "optimized")
  set list(
    indent: 0.85em,
    body-indent: 0.35em,
    spacing: 0.38em,
    marker: (text(fill: t.accent, size: 0.85em)[▶], text(fill: t.accent, size: 0.85em)[•])
  )
  show link: set text(fill: t.accent)
  show heading: it => it.body

  let contact-items = {
    let items = ()
    if "location" in contact and contact.location != "" { items.push(contact.location) }
    if "email" in contact and contact.email != "" { items.push(link("mailto:" + contact.email)[#contact.email]) }
    if "phone" in contact and contact.phone != "" { items.push(link("tel:" + contact.phone.replace(" ", ""))[#contact.phone]) }
    if "linkedin" in contact and contact.linkedin != "" { items.push(link("https://" + clean-link(contact.linkedin))[#clean-link(contact.linkedin)]) }
    if "github" in contact and contact.github != "" { items.push(link("https://" + clean-link(contact.github))[#clean-link(contact.github)]) }
    if "website" in contact and contact.website != "" { items.push(link("https://" + clean-link(contact.website))[#clean-link(contact.website)]) }
    items
  }

  // -------------------------------------------------------------
  // HEADER
  // -------------------------------------------------------------
  grid(
    columns: (1fr, auto),
    align: (left + bottom, right + bottom),
    [
      #text(size: 22pt, weight: "bold", fill: t.ink)[#name]
      #if headline != "" [
        #v(0.12em)
        #text(size: 9.6pt, weight: "medium", fill: t.accent)[#headline]
      ]
    ],
    align(right)[
      #text(size: 7.8pt, fill: t.muted)[
        #contact-items.join(text(fill: t.accent)[ · \ ])
      ]
    ]
  )
  v(0.35em)
  line(length: 100%, stroke: 1.5pt + t.accent)

  // -------------------------------------------------------------
  // SECTION HELPER
  // -------------------------------------------------------------
  let section(title, body, breakable: true) = {
    v(1.35em)
    block(width: 100%, breakable: breakable, {
      block(above: 0pt, below: 0.50em, breakable: false, sticky: true, width: 100%, {
        stack(
          spacing: 0.28em,
          text(size: 9.5pt, weight: "bold", fill: t.accent, tracking: 0.08em)[#upper(title)],
          line(length: 100%, stroke: 0.65pt + t.stroke-line)
        )
      })
      body
    })
  }

  let default-order = (
    "summary", "techStackSummary", "skills", "keyMetrics", "experience",
    "internships", "education", "projects", "certifications", "achievements",
    "openSource", "publications", "leadership", "volunteering", "conferences",
    "languages", "interests", "patents", "products", "devopsContributions",
    "securityContributions", "additionalInfo", "customSections"
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
        section("Career Profile & Milestones", [
          #set text(size: 8.8pt)
          #parse-bold(summary)
        ])
      }
    } else if sec == "techStackSummary" {
      if "techStackSummary" in data and data.techStackSummary != "" {
        section("Technology Stack & Architecture", [
          #rect(
            width: 100%,
            fill: t.tag-bg,
            stroke: 0.5pt + t.tag-border,
            inset: (x: 0.8em, y: 0.5em),
            radius: 2pt
          )[
            #set text(size: 8.5pt)
            #text(weight: "bold", fill: t.accent)[Core Competencies:] #parse-bold(data.techStackSummary)
          ]
        ])
      }
    } else if sec == "skills" {
      if skills != () and skills.len() > 0 {
        section("Skills & Specializations", render-skills-adaptive(t, skills, max-categories-for-grid: 4))
      }
    } else if sec == "keyMetrics" {
      if "keyMetrics" in data and data.keyMetrics.len() > 0 {
        section("Key Career Metrics & Trajectory", {
          let cols = calc.min(data.keyMetrics.len(), 4)
          grid(
            columns: range(cols).map(_ => 1fr),
            gutter: 0.6em,
            ..data.keyMetrics.map(m => block(
              width: 100%,
              fill: t.accent-light,
              stroke: 0.5pt + t.accent.lighten(60%),
              inset: (x: 0.7em, y: 0.55em),
              radius: 3pt,
              align(center)[
                #text(size: 11.5pt, weight: "bold", fill: t.accent)[#m.value] \
                #v(0.12em)
                #text(size: 8pt, weight: "bold", fill: t.ink)[#m.label]
                #if "context" in m and m.context != "" [
                  \ #v(0.08em)
                  #text(size: 7.2pt, fill: t.muted)[#m.context]
                ]
              ]
            ))
          )
        })
      }
    } else if sec == "experience" {
      if "experience" in data and data.experience.len() > 0 {
        section("Experience & Career Trajectory", breakable: true, {
          for exp in data.experience {
            block(width: 100%, breakable: false)[
              #grid(
                columns: (1.20fr, 0.12fr, 4.80fr),
                column-gutter: 0.55em,
                text(size: 8pt, weight: "bold", fill: t.muted)[#exp.dates],
                line(length: 100%, stroke: 1.2pt + t.accent),
                [
                  #text(weight: "bold", size: 9.3pt, fill: t.ink)[#exp.role]
                  #v(0.03em)
                  #text(size: 8.5pt, weight: "bold", fill: t.accent)[#exp.company#if "location" in exp and exp.location != "" [ · #text(fill: t.muted, weight: "regular")[#exp.location]]]
                ]
              )
              #if "summary" in exp and exp.summary != "" [
                #v(0.10em)
                #text(size: 8.4pt, style: "italic", fill: t.muted)[#parse-bold(exp.summary)]
              ]
              #if "bullets" in exp and exp.bullets.len() > 0 [
                #v(0.24em)
                #list(..exp.bullets.map(parse-bold))
              ]
              #v(0.55em)
            ]
          }
        })
      }
    } else if sec == "internships" {
      if "internships" in data and data.internships.len() > 0 {
        section("Early Career & Internships", breakable: false, {
          for exp in data.internships {
            block(width: 100%, breakable: false)[
              #grid(
                columns: (1.20fr, 0.12fr, 4.80fr),
                column-gutter: 0.55em,
                text(size: 8pt, weight: "bold", fill: t.muted)[#exp.dates],
                line(length: 100%, stroke: 1.2pt + t.accent),
                [
                  #text(weight: "bold", size: 9.2pt, fill: t.ink)[#exp.role]
                  #v(0.03em)
                  #text(size: 8.5pt, weight: "bold", fill: t.accent)[#exp.company#if "location" in exp and exp.location != "" [ · #text(fill: t.muted, weight: "regular")[#exp.location]]]
                ]
              )
              #if "summary" in exp and exp.summary != "" [
                #v(0.10em)
                #text(size: 8.4pt, style: "italic", fill: t.muted)[#parse-bold(exp.summary)]
              ]
              #if "bullets" in exp and exp.bullets.len() > 0 [
                #v(0.24em)
                #list(..exp.bullets.map(parse-bold))
              ]
              #v(0.55em)
            ]
          }
        })
      }
    } else if sec == "education" {
      if "education" in data and data.education.len() > 0 {
        section("Education & Academic Foundation", breakable: false, {
          for edu in data.education {
            block(width: 100%, breakable: false)[
              #grid(
                columns: (1.20fr, 0.12fr, 4.80fr),
                column-gutter: 0.55em,
                text(size: 8pt, weight: "bold", fill: t.muted)[#edu.dates],
                line(length: 100%, stroke: 1.2pt + t.accent),
                [
                  #text(weight: "bold", size: 9.2pt, fill: t.ink)[#edu.degree]
                  #if "specialization" in edu and edu.specialization != "" [
                    #text(style: "italic", fill: t.accent)[ · #edu.specialization]
                  ]
                  #if "institution" in edu and edu.institution != "" [
                    \ #text(size: 8.3pt, fill: t.muted)[#edu.institution]
                  ]
                  #if "location" in edu and edu.location != "" [
                    #text(size: 8pt, fill: t.muted)[ · #edu.location]
                  ]
                  #if "gpa" in edu and edu.gpa != "" [
                    · #text(size: 8pt, weight: "bold", fill: t.accent)[GPA: #edu.gpa]
                  ]
                ]
              )
              #if "highlights" in edu and edu.highlights.len() > 0 [
                #v(0.24em)
                #list(..edu.highlights.map(parse-bold))
              ]
              #v(0.40em)
            ]
          }
        })
      }
    } else if sec == "projects" {
      if projects != () and projects.len() > 0 {
        section("Projects & Key Deliverables", breakable: false, {
          for proj in projects {
            block(width: 100%, breakable: false, fill: t.tag-bg, stroke: 0.5pt + t.tag-border, inset: (x: 0.8em, y: 0.55em), radius: 2.5pt)[
              #grid(
                columns: (1fr, auto),
                [
                  #text(weight: "bold", size: 9pt, fill: t.ink)[#proj.name]
                  #if "role" in proj and proj.role != "" [
                    #text(size: 8pt, style: "italic", fill: t.muted)[ · #proj.role]
                  ]
                  #if "link" in proj and proj.link != "" [
                    #text(size: 8pt)[ #link("https://" + clean-link(proj.link))[↗]]
                  ]
                ],
                if "dates" in proj and proj.dates != "" { text(size: 8pt, fill: t.muted)[#proj.dates] }
              )
              #if "stack" in proj and proj.stack != "" [
                #v(0.12em)
                #text(size: 7.8pt, fill: t.muted)[#text(weight: "bold", fill: t.accent)[Stack:] #proj.stack]
              ]
              #if "description" in proj and proj.description != "" [
                #v(0.15em)
                #text(size: 8.4pt)[#parse-bold(proj.description)]
              ]
              #if "bullets" in proj and proj.bullets.len() > 0 [
                #v(0.24em)
                #list(..proj.bullets.map(parse-bold))
              ]
            ]
            v(0.55em)
          }
        })
      }
    } else if sec == "certifications" {
      if "certifications" in data and data.certifications.len() > 0 {
        section("Certifications & Accreditations", {
          for cert in data.certifications {
            block(width: 100%, breakable: false)[
              #grid(
                columns: (1fr, auto),
                [
                  #text(weight: "bold", size: 8.8pt, fill: t.ink)[#cert.name]
                  #if "issuer" in cert and cert.issuer != "" [
                    #text(size: 8pt, fill: t.muted)[ · #cert.issuer]
                  ]
                ],
                if "date" in cert and cert.date != "" { text(size: 8pt, fill: t.muted)[#cert.date] }
              )
              #v(0.20em)
            ]
          }
        })
      }
    } else if sec == "achievements" or sec == "awards" {
      if not awards-rendered {
        let awards-data = if "achievements" in data and data.achievements.len() > 0 {
          data.achievements
        } else if "awards" in data and data.awards.len() > 0 {
          data.awards
        } else { () }

        if awards-data.len() > 0 {
          awards-rendered = true
          section("Honors & Milestones", {
            for a in awards-data {
              block(width: 100%, breakable: false)[
                #let aTitle = if "title" in a and a.title != "" { a.title } else if "name" in a { a.name } else { "" }
                #grid(
                  columns: (1fr, auto),
                  [
                    #text(weight: "bold", size: 8.8pt, fill: t.ink)[#aTitle]
                    #if "awarder" in a and a.awarder != "" [
                      #text(size: 8pt, fill: t.muted)[ · #a.awarder]
                    ]
                    #if "summary" in a and a.summary != "" [
                      \ #text(size: 8.2pt, fill: t.muted)[#parse-bold(a.summary)]
                    ]
                  ],
                  if "date" in a and a.date != "" { text(size: 8pt, fill: t.muted)[#a.date] }
                )
                #v(0.22em)
              ]
            }
          })
        }
      }
    } else if sec == "openSource" {
      if "openSource" in data and data.openSource.len() > 0 {
        section("Open Source & Ecosystem", render-open-source(data, t.accent))
      }
    } else if sec == "publications" {
      if "publications" in data and data.publications.len() > 0 {
        section("Publications & Writing", render-publications(data, t.accent))
      }
    } else if sec == "leadership" {
      if "leadership" in data and data.leadership.len() > 0 {
        section("Leadership & Initiative", render-leadership(data, t.accent))
      }
    } else if sec == "volunteering" {
      if "volunteering" in data and data.volunteering.len() > 0 {
        section("Community & Volunteering", render-volunteering(data, t.accent))
      }
    } else if sec == "conferences" {
      if "conferences" in data and data.conferences.len() > 0 {
        section("Conferences & Speaking", render-conferences(data, accent: t.accent))
      }
    } else if sec == "languages" {
      if "languages" in data and data.languages.len() > 0 {
        section("Languages", render-languages(data))
      }
    } else if sec == "interests" {
      if "interests" in data and data.interests.len() > 0 {
        section("Interests & Pursuits", render-interests(data))
      }
    } else if sec == "patents" {
      if "patents" in data and data.patents.len() > 0 {
        section("Patents & IP", {
          for pat in data.patents {
            block(width: 100%, breakable: false)[
              #grid(
                columns: (1fr, auto),
                [
                  #text(weight: "bold", size: 8.8pt, fill: t.ink)[#pat.title]
                  #if "number" in pat and pat.number != "" [
                    #text(size: 8pt, fill: t.muted)[ (#pat.number)]
                  ]
                  #if "issuer" in pat and pat.issuer != "" [
                    #text(size: 8pt, fill: t.muted)[ · #pat.issuer]
                  ]
                ],
                if "date" in pat and pat.date != "" { text(size: 8pt, fill: t.muted)[#pat.date] }
              )
              #v(0.20em)
            ]
          }
        })
      }
    } else if sec == "products" {
      if "products" in data and data.products.len() > 0 {
        section("Products Released", {
          for prod in data.products {
            block(width: 100%, breakable: false)[
              #grid(
                columns: (1fr, auto),
                [
                  #text(weight: "bold", size: 8.8pt, fill: t.ink)[#prod.name]
                  #if "role" in prod and prod.role != "" [
                    #text(size: 8pt, fill: t.muted)[ · #prod.role]
                  ]
                ],
                if "dates" in prod and prod.dates != "" { text(size: 8pt, fill: t.muted)[#prod.dates] }
              )
              #if "description" in prod and prod.description != "" [
                #v(0.10em)
                #text(size: 8.2pt)[#parse-bold(prod.description)]
              ]
              #v(0.25em)
            ]
          }
        })
      }
    } else if sec == "devopsContributions" {
      if "devopsContributions" in data and data.devopsContributions.len() > 0 {
        section("Infrastructure Contributions", {
          for dev in data.devopsContributions {
            block(width: 100%, breakable: false)[
              #text(weight: "bold", size: 8.8pt, fill: t.ink)[#dev.title]
              #if "technology" in dev and dev.technology != "" [
                #text(size: 8pt, fill: t.muted)[ · #dev.technology]
              ]
              #if "impact" in dev and dev.impact != "" [
                \ #text(size: 8.2pt)[#parse-bold(dev.impact)]
              ]
              #v(0.22em)
            ]
          }
        })
      }
    } else if sec == "securityContributions" {
      if "securityContributions" in data and data.securityContributions.len() > 0 {
        section("Security Contributions", {
          for sec-item in data.securityContributions {
            block(width: 100%, breakable: false)[
              #text(weight: "bold", size: 8.8pt, fill: t.ink)[#sec-item.title]
              #if "scope" in sec-item and sec-item.scope != "" [
                #text(size: 8pt, fill: t.muted)[ · #sec-item.scope]
              ]
              #if "impact" in sec-item and sec-item.impact != "" [
                \ #text(size: 8.2pt)[#parse-bold(sec-item.impact)]
              ]
              #v(0.22em)
            ]
          }
        })
      }
    } else if sec == "additionalInfo" {
      if "additionalInfo" in data {
        let ai = data.additionalInfo
        let has-info = false
        if type(ai) == dictionary {
          for (k, v) in ai {
            if v != "" and v != () { has-info = true }
          }
        } else if type(ai) == array and ai.len() > 0 {
          has-info = true
        }

        if has-info {
          section("Additional Information", {
            if type(ai) == dictionary {
              let rows = ()
              if "availability" in ai and ai.availability != "" { rows.push([*Availability:* #ai.availability]) }
              if "workAuthorization" in ai and ai.workAuthorization != "" { rows.push([*Work Authorization:* #ai.workAuthorization]) }
              if "clearance" in ai and ai.clearance != "" { rows.push([*Clearance:* #ai.clearance]) }
              if "relocation" in ai and ai.relocation != "" { rows.push([*Relocation:* #ai.relocation]) }
              if "travel" in ai and ai.travel != "" { rows.push([*Travel:* #ai.travel]) }
              if "notes" in ai and ai.notes != "" { rows.push([*Notes:* #ai.notes]) }
              if rows.len() > 0 {
                list(..rows)
              }
            } else if type(ai) == array {
              list(..ai.map(item => parse-bold(str(item))))
            }
          })
        }
      }
    } else if sec == "customSections" {
      if "customSections" in data and data.customSections.len() > 0 {
        for cs in data.customSections {
          section(cs.title, list(..cs.items.map(parse-bold)))
        }
      }
    }
  }
}

#let render = render-timeline
