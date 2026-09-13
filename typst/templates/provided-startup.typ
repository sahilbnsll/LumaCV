// ============================================================
// Template: Startup (Velocity) — Bold Modern Startup Resume
// ============================================================

#import "/lib/utils.typ": parse-bold, clean-link, resolve-variant-field
#import "/lib/theme.typ": font-sans, render-footer

#let render-startup(data, variant: "default", theme: "startup") = {
  let t = (
    ink: rgb("#111827"),
    accent: rgb("#7c3aed"),
    accent-light: rgb("#ede9fe"),
    chip-bg: rgb("#f5f3ff"),
    chip-border: rgb("#ddd6fe"),
    muted: rgb("#6b7280"),
    marker: rgb("#7c3aed"),
    link: rgb("#7c3aed"),
    name-fill: rgb("#ffffff"),
    headline-fill: rgb("#ede9fe"),
  )

  let name = data.personal.name
  let headline = resolve-variant-field(data.personal.headline, variant, fallback: "")
  let summary = resolve-variant-field(data.summary, variant, fallback: "")
  let skills = resolve-variant-field(data.skills, variant, fallback: ())
  let projects = resolve-variant-field(data.projects, variant, fallback: ())

  set document(title: name + " — Resume", author: name, date: none)
  set page(
    paper: "a4",
    margin: (x: 1.20cm, y: 1.20cm),
    footer: render-footer(t, name)
  )
  set text(font: font-sans, size: 8.6pt, fill: t.ink, hyphenate: false, fallback: true)
  set par(leading: 0.56em, spacing: 0.42em, justify: false, linebreaks: "optimized")
  set list(indent: 0.85em, body-indent: 0.35em, spacing: 0.32em, marker: (text(fill: t.accent, "•"), text(fill: t.muted, "–")))
  show link: set text(fill: t.link)
  show heading: it => it.body

  // Header Banner Card
  block(
    width: 100%,
    fill: t.accent,
    radius: 4pt,
    inset: (x: 1.2em, y: 0.8em),
    {
      show link: set text(fill: t.name-fill)
      grid(
        columns: (1.5fr, 1fr),
        column-gutter: 0.8em,
        align: (left + top, right + top),
        [
          #text(size: 18pt, weight: "bold", fill: t.name-fill)[#name]
          #if headline != "" [
            \ #v(0.08em)
            #text(size: 8.8pt, weight: "medium", fill: t.headline-fill)[#headline]
          ]
        ],
        [
          #align(right + top)[
            #set text(size: 7.6pt, fill: t.headline-fill)
            #show link: set text(fill: t.name-fill)
            #{
              let c = data.personal.contact
              let contact-lines = ()
              let top-line = ()
              if "location" in c and c.location != "" { top-line.push(c.location) }
              if "phone" in c and c.phone != "" { top-line.push(link("tel:" + c.phone.replace(" ", ""))[#c.phone]) }
              if top-line.len() > 0 { contact-lines.push(top-line.join(" · ")) }

              if "email" in c and c.email != "" {
                contact-lines.push(link("mailto:" + c.email)[#c.email])
              }

              let links-line = ()
              if "linkedin" in c and c.linkedin != "" { links-line.push(link("https://" + clean-link(c.linkedin))[#clean-link(c.linkedin)]) }
              if "github" in c and c.github != "" { links-line.push(link("https://" + clean-link(c.github))[#clean-link(c.github)]) }
              if "website" in c and c.website != "" { links-line.push(link("https://" + clean-link(c.website))[#clean-link(c.website)]) }
              if links-line.len() > 0 { contact-lines.push(links-line.join(" · ")) }

              contact-lines.join(linebreak() + v(0.12em))
            }
          ]
        ]
      )
    }
  )

  let section(title, body, breakable: true) = {
    v(0.95em)
    block(width: 100%, breakable: breakable, [
      #block(
        above: 0pt,
        below: 0.20em,
        breakable: false,
        sticky: true,
        width: 100%,
        {
          text(size: 8.7pt, weight: "bold", fill: t.accent, tracking: 0.08em)[#upper(title)]
          v(0.06em)
          line(length: 100%, stroke: 0.6pt + rgb("#e5e7eb"))
        }
      )
      #v(0.18em)
      #body
    ])
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
      if summary != "" {
        section("Summary", parse-bold(summary))
      }
    } else if sec == "techStackSummary" {
      if "techStackSummary" in data and data.techStackSummary != none and data.techStackSummary != "" {
        section("Core Tech Stack", block(
          fill: t.chip-bg,
          stroke: 0.5pt + t.chip-border,
          inset: (x: 0.6em, y: 0.4em),
          radius: 3pt,
          width: 100%,
          text(size: 8.2pt)[#text(weight: "bold", fill: t.ink)[Specialized Tech: ] #parse-bold(data.techStackSummary)]
        ))
      }
    } else if sec == "keyMetrics" {
      if "keyMetrics" in data and data.keyMetrics != none and data.keyMetrics.len() > 0 {
        section("Key Metrics & Scalability", {
          let cols = calc.min(data.keyMetrics.len(), 4)
          grid(
            columns: (1fr,) * cols,
            column-gutter: 0.5em,
            row-gutter: 0.5em,
            ..data.keyMetrics.map(km => block(
              fill: t.chip-bg,
              stroke: 0.5pt + t.chip-border,
              inset: 0.45em,
              radius: 3pt,
              width: 100%,
              align(center)[
                #text(size: 10pt, weight: "bold", fill: t.accent)[#km.value] \
                #v(0.06em)
                #text(size: 7.4pt, weight: "bold", fill: t.ink)[#km.label]
                #if "context" in km and km.context != "" [
                  \ #v(0.04em)
                  #text(size: 6.8pt, fill: t.muted)[#km.context]
                ]
              ]
            ))
          )
        })
      }
    } else if sec == "skills" {
      if skills != () and skills.len() > 0 {
        section("Skills & Core Competencies", {
          for (i, cat) in skills.enumerate() {
            if i > 0 { v(0.20em) }
            let raw-items = if "skills" in cat and type(cat.skills) == array {
              cat.skills
            } else if "items" in cat {
              if type(cat.items) == array { cat.items } else { cat.items.split(",").map(s => s.trim()).filter(s => s != "") }
            } else {
              ()
            }
            // Smart merge parenthetical fragments like AWS (EKS, RDS, S3)
            let skill-items = ()
            let buffer = ""
            for item in raw-items {
              if buffer != "" {
                buffer += ", " + item
                if buffer.contains(")") {
                  skill-items.push(buffer)
                  buffer = ""
                }
              } else if buffer == "" and item.contains("(") and not item.contains(")") {
                buffer = item
              } else {
                skill-items.push(item)
              }
            }
            if buffer != "" { skill-items.push(buffer) }

            grid(
              columns: (135pt, 1fr),
              column-gutter: 0.6em,
              align: (left + horizon, left + horizon),
              text(weight: "bold", fill: t.ink)[#cat.category],
              {
                set par(leading: 0.45em)
                skill-items.map(item => box(
                  fill: t.chip-bg,
                  stroke: 0.4pt + t.chip-border,
                  radius: 2.5pt,
                  inset: (x: 4.5pt, y: 2.2pt),
                  text(size: 7.5pt, weight: "medium", fill: t.ink)[#item]
                )).join(h(3.5pt))
              }
            )
          }
        })
      }
    } else if sec == "experience" {
      if "experience" in data and data.experience.len() > 0 {
        section("Experience", {
          for (i, exp) in data.experience.enumerate() {
            if i > 0 { v(0.55em) }
            block(width: 100%, breakable: false, {
              grid(
                columns: (1fr, auto),
                column-gutter: 0.8em,
                align: (left + top, right + top),
                [#text(size: 8.9pt, weight: "bold", fill: t.ink)[#exp.role] #text(fill: t.accent)[·] #text(weight: "bold", fill: t.ink)[#exp.company]],
                text(size: 7.8pt, fill: t.muted)[#exp.dates],
              )
              if ("location" in exp and exp.location != "") or ("technologies" in exp and exp.technologies != "") {
                v(0.03em)
                grid(
                  columns: (1fr, auto),
                  if "location" in exp and exp.location != "" { text(size: 7.8pt, fill: t.muted)[#exp.location] },
                  if "technologies" in exp and exp.technologies != "" { text(size: 7.5pt, fill: t.muted)[Stack: #exp.technologies] }
                )
              }
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
            if i > 0 { v(0.52em) }
            block(width: 100%, breakable: false, {
              grid(
                columns: (1fr, auto),
                column-gutter: 0.8em,
                align: (left + top, right + top),
                [#text(size: 8.9pt, weight: "bold", fill: t.ink)[#exp.role] #text(fill: t.accent)[·] #text(weight: "bold", fill: t.ink)[#exp.company]],
                text(size: 7.8pt, fill: t.muted)[#exp.dates],
              )
              if "location" in exp and exp.location != "" {
                v(0.03em)
                text(size: 7.8pt, fill: t.muted)[#exp.location]
              }
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
        section("Key Projects & Platforms", {
          for (i, proj) in projects.enumerate() {
            if i > 0 { v(0.42em) }
            block(width: 100%, breakable: false, {
              grid(
                columns: (1fr, auto),
                [
                  #text(weight: "bold", fill: t.ink)[#proj.name]
                  #if "role" in proj and proj.role != "" [ #text(fill: t.muted)[·] #text(size: 8pt, fill: t.muted)[#proj.role] ]
                  #if "url" in proj and proj.url != "" [ #link(proj.url)[#text(fill: t.accent)[ ↗]] ]
                ],
                if "dates" in proj and proj.dates != "" { text(size: 7.8pt, fill: t.muted)[#proj.dates] }
              )
              if "stack" in proj and proj.stack != "" {
                v(0.04em)
                text(size: 7.6pt, weight: "medium", fill: t.accent)[Stack: #proj.stack]
              }
              if "description" in proj and proj.description != "" {
                v(0.06em)
                parse-bold(proj.description)
              }
              let all-p-bullets = ()
              if "highlights" in proj and proj.highlights != () { all-p-bullets += proj.highlights }
              if "impactBullets" in proj and proj.impactBullets != () { all-p-bullets += proj.impactBullets }
              if "bullets" in proj and proj.bullets != () { all-p-bullets += proj.bullets }
              if all-p-bullets.len() > 0 {
                v(0.12em)
                list(..all-p-bullets.map(parse-bold))
              }
            })
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
              column-gutter: 0.8em,
              text(weight: "bold", fill: t.ink)[#edu.institution],
              text(size: 7.8pt, fill: t.muted)[#edu.dates],
            )
            v(0.02em)
            grid(
              columns: (1fr, auto),
              [#text(size: 8.2pt, fill: t.ink)[#edu.degree#if "specialization" in edu and edu.specialization != "" [ · #edu.specialization]]],
              if "gpa" in edu and edu.gpa != "" { text(size: 7.8pt, fill: t.muted)[GPA: #edu.gpa] }
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
                #text(weight: "bold", fill: t.ink)[#cert.name]
                #if "url" in cert and cert.url != "" [ #link(cert.url)[#text(fill: t.accent)[ ↗]] ]
                #if "issuer" in cert and cert.issuer != "" [ #text(fill: t.muted)[ · #cert.issuer] ]
              ],
              text(size: 7.8pt, fill: t.muted)[#if "date" in cert { cert.date }]
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
                  #text(weight: "bold", fill: t.ink)[#ach.title]
                  #if "awarder" in ach and ach.awarder != "" [ #text(fill: t.muted)[ · #ach.awarder] ]
                  #if "url" in ach and ach.url != "" [ #link(ach.url)[#text(fill: t.accent)[ ↗]] ]
                ],
                text(size: 7.8pt, fill: t.muted)[#if "date" in ach { ach.date }]
              )
              if "description" in ach and ach.description != "" {
                v(0.04em)
                text(size: 7.8pt, fill: t.ink)[#parse-bold(ach.description)]
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
                #text(weight: "bold", fill: t.ink)[#item.project]
                #if "url" in item and item.url != "" [ #link(item.url)[#text(fill: t.accent)[ ↗]] ]
                #if "contribution" in item and item.contribution != "" [ #text(fill: t.muted)[ · #item.contribution] ]
              ],
              text(size: 7.8pt, fill: t.muted)[#if "dates" in item { item.dates }]
            )
            if "bullets" in item and item.bullets.len() > 0 {
              v(0.06em)
              list(..item.bullets.map(parse-bold))
            } else if "impact" in item and item.impact != "" {
              v(0.04em)
              text(size: 7.8pt, fill: t.ink)[#parse-bold(item.impact)]
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
                #text(weight: "bold", fill: t.ink)[#pub.title]
                #if "url" in pub and pub.url != "" [ #link(pub.url)[#text(fill: t.accent)[ ↗]] ]
                #if "publisher" in pub and pub.publisher != "" [ #text(fill: t.muted)[ · #pub.publisher] ]
              ],
              text(size: 7.8pt, fill: t.muted)[#if "date" in pub { pub.date }]
            )
            if "description" in pub and pub.description != "" {
              v(0.04em)
              text(size: 7.8pt, fill: t.ink)[#parse-bold(pub.description)]
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
                #text(weight: "bold", fill: t.ink)[#lead.role]
                #if "organization" in lead and lead.organization != "" [ #text(fill: t.muted)[ @ #lead.organization] ]
              ],
              text(size: 7.8pt, fill: t.muted)[#if "dates" in lead { lead.dates }]
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
                #text(weight: "bold", fill: t.ink)[#vol.role]
                #if "organization" in vol and vol.organization != "" [ #text(fill: t.muted)[ @ #vol.organization] ]
              ],
              text(size: 7.8pt, fill: t.muted)[#if "dates" in vol { vol.dates }]
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
                #text(weight: "bold", fill: t.ink)[#conf.name]
                #if "role" in conf and conf.role != "" [ #text(fill: t.muted)[ · #conf.role] ]
              ],
              text(size: 7.8pt, fill: t.muted)[#if "date" in conf { conf.date }]
            )
            if "description" in conf and conf.description != "" {
              v(0.04em)
              text(size: 7.8pt, fill: t.ink)[#parse-bold(conf.description)]
            }
          }
        })
      }
    } else if sec == "languages" {
      if "languages" in data and data.languages.len() > 0 {
        section("Languages", {
          let items = data.languages.map(lang => [#text(weight: "bold", fill: t.ink)[#lang.language] #text(fill: t.muted)[(#lang.proficiency)]])
          items.join(text(fill: t.muted)[ · ])
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
          items.join(text(fill: t.muted)[ · ])
        })
      }
    } else if sec == "patents" {
      if "patents" in data and data.patents.len() > 0 {
        section("Patents & Intellectual Property", {
          for (i, pat) in data.patents.enumerate() {
            if i > 0 { v(0.18em) }
            let title-line = text(weight: "bold", fill: t.ink)[#pat.title]
            let meta = ()
            if "number" in pat and pat.number != "" { meta.push("US " + pat.number) }
            if "status" in pat and pat.status != "" { meta.push(pat.status) }
            if "date" in pat and pat.date != "" { meta.push(pat.date) }
            [• #title-line #if meta.len() > 0 [ #text(fill: t.muted)[— #meta.join(", ")] ]]
            if "description" in pat and pat.description != "" {
              v(0.04em)
              text(size: 7.8pt, fill: t.ink)[#parse-bold(pat.description)]
            }
          }
        })
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
          section("Additional Information", items.join(text(fill: t.muted)[ · ]))
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

#let render = render-startup
