// ============================================================
// Template: Onyx
// ============================================================
// Design principles:
//  - Minimalist, high-contrast monochrome aesthetic
//  - Crisp hairline divider rules across major sections
//  - Modern sans-serif typography with generous vertical pacing
//  - Full support for dates, URLs, roles, and quantified bullets

#import "/lib/utils.typ": parse-bold, clean-link, resolve-variant-field
#import "/lib/theme.typ": font-sans, colors, typo, gap, pg, render-skills-adaptive, render-footer
#import "/support/resume-core.typ": render-publications, render-volunteering, render-conferences, render-interests

#let render-onyx(data, variant: "default", theme: "onyx") = {
  let t = if type(theme) == dictionary { theme } else if type(theme) == str { colors.at(theme, default: colors.onyx) } else { colors.onyx }

  let name = data.personal.name
  let headline = resolve-variant-field(data.personal.headline, variant, fallback: "")
  let summary = resolve-variant-field(data.summary, variant, fallback: "")
  let skills = resolve-variant-field(data.skills, variant, fallback: ())
  let projects = resolve-variant-field(data.projects, variant, fallback: ())

  set document(
    title: if headline != "" { name + " — " + headline } else { name + " — Resume" },
    author: name,
    date: none,
  )

  set page(
    paper: pg.paper,
    margin: (x: 1.40cm, top: 1.35cm, bottom: 1.60cm),
    footer: render-footer(t, name),
  )

  set text(
    font: font-sans,
    size: 8.8pt,
    fill: t.ink,
    hyphenate: false,
    fallback: true,
  )

  set par(
    leading: 0.58em,
    spacing: 0.48em,
    justify: false,
    linebreaks: "optimized",
  )

  set list(
    tight: false,
    spacing: 0.40em,
    indent: 0.85em,
    body-indent: 0.35em,
    marker: (text(fill: t.marker)[•], text(fill: t.muted)[–]),
  )

  show link: set text(fill: t.link)
  show heading: it => it.body

  // -------------------------------------------------------------------------
  // Header
  // -------------------------------------------------------------------------
  block(width: 100%, below: 0.60em, {
    text(size: 22pt, weight: "bold", fill: t.name-fill)[#name]
    if headline != "" [
      #v(0.18em)
      #text(size: 10pt, weight: "medium", fill: t.headline-fill)[#headline]
    ]

    v(0.35em)
    let c = data.personal.contact
    let items = ()
    if "location" in c and c.location != "" {
      items.push(c.location)
    }
    if "email" in c and c.email != "" {
      items.push(link("mailto:" + c.email)[#c.email])
    }
    if "phone" in c and c.phone != "" {
      items.push(link("tel:" + c.phone.replace(" ", ""))[#c.phone])
    }
    if "linkedin" in c and c.linkedin != "" {
      let li = clean-link(c.linkedin)
      items.push(link("https://" + li)[#li])
    }
    if "github" in c and c.github != "" {
      let gh = clean-link(c.github)
      items.push(link("https://" + gh)[#gh])
    }
    if "website" in c and c.website != "" {
      let web = clean-link(c.website)
      items.push(link("https://" + web)[#web])
    }

    if items.len() > 0 {
      text(size: 8.2pt, fill: t.muted)[#items.join(text(fill: rgb("#A1A1AA"))[   ·   ])]
    }
  })

  line(length: 100%, stroke: 1.2pt + t.ink)
  v(0.20em)

  // -------------------------------------------------------------------------
  // Section Builder
  // -------------------------------------------------------------------------
  let section(title, body, breakable: true) = {
    v(1.35em)
    block(width: 100%, breakable: breakable, {
      block(above: 0pt, below: 0.50em, breakable: false, sticky: true, width: 100%, {
        stack(
          spacing: 0.28em,
          text(size: 9.6pt, weight: "bold", fill: t.ink, tracking: 0.08em)[#upper(title)],
          line(length: 100%, stroke: 0.5pt + t.rule)
        )
      })
      body
    })
  }

  let entry-header(left-primary, left-secondary, right-info) = {
    grid(
      columns: (1fr, auto),
      align: (left + bottom, right + bottom),
      [
        #text(weight: "bold", size: 9.2pt, fill: t.ink)[#left-primary]
        #if left-secondary != none and left-secondary != "" [
          #text(size: 8.6pt, fill: t.company-fill)[ · #left-secondary]
        ]
      ],
      [
        #if right-info != none and right-info != "" [
          #text(size: 8.2pt, fill: t.muted)[#right-info]
        ]
      ]
    )
  }

  // -------------------------------------------------------------------------
  // Sections Dispatcher
  // -------------------------------------------------------------------------
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
        section("Summary", [
          #set text(size: 8.8pt)
          #parse-bold(summary)
        ])
      }
    } else if sec == "techStackSummary" {
      if "techStackSummary" in data and data.techStackSummary != "" {
        section("Tech Stack", [
          #rect(
            width: 100%,
            fill: t.skill-bg,
            stroke: 0.5pt + t.skill-border,
            inset: (x: 0.8em, y: 0.5em),
            radius: 2pt
          )[
            #set text(size: 8.5pt)
            #text(weight: "bold", fill: t.ink)[Core Disciplines:] #parse-bold(data.techStackSummary)
          ]
        ])
      }
    } else if sec == "skills" {
      if skills != () and skills.len() > 0 {
        section("Skills & Competencies", render-skills-adaptive(t, skills, max-categories-for-grid: 4))
      }
    } else if sec == "keyMetrics" {
      if "keyMetrics" in data and data.keyMetrics.len() > 0 {
        section("Key Metrics & Performance", {
          let cols = calc.min(data.keyMetrics.len(), 4)
          grid(
            columns: range(cols).map(_ => 1fr),
            gutter: 0.6em,
            ..data.keyMetrics.map(m => block(
              width: 100%,
              fill: t.skill-bg,
              stroke: 0.5pt + t.skill-border,
              inset: (x: 0.7em, y: 0.55em),
              radius: 3pt,
              align(center)[
                #text(size: 11.5pt, weight: "bold", fill: t.ink)[#m.value] \
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
        section("Experience", breakable: true, {
          for (i, exp) in data.experience.enumerate() {
            if i > 0 { v(0.65em) }
            block(width: 100%, breakable: false, {
              entry-header(
                exp.role,
                [#exp.company#if "location" in exp and exp.location != "" [ (#exp.location)]],
                exp.dates
              )
              if "summary" in exp and exp.summary != "" {
                v(0.10em)
                text(size: 8.4pt, style: "italic", fill: t.muted)[#parse-bold(exp.summary)]
              }
              let expBullets = ()
              if "highlights" in exp and exp.highlights.len() > 0 {
                expBullets += exp.highlights
              }
              if "impactBullets" in exp and exp.impactBullets.len() > 0 {
                expBullets += exp.impactBullets
              }
              if "bullets" in exp and exp.bullets.len() > 0 {
                expBullets += exp.bullets
              }
              if expBullets.len() > 0 {
                v(0.24em)
                list(..expBullets.map(parse-bold))
              }
            })
          }
        })
      }
    } else if sec == "internships" {
      if "internships" in data and data.internships.len() > 0 {
        section("Internships", breakable: false, {
          for (i, exp) in data.internships.enumerate() {
            if i > 0 { v(0.65em) }
            block(width: 100%, breakable: false, {
              entry-header(
                exp.role,
                [#exp.company#if "location" in exp and exp.location != "" [ (#exp.location)]],
                exp.dates
              )
              if "summary" in exp and exp.summary != "" {
                v(0.10em)
                text(size: 8.4pt, style: "italic", fill: t.muted)[#parse-bold(exp.summary)]
              }
              let internBullets = ()
              if "highlights" in exp and exp.highlights.len() > 0 {
                internBullets += exp.highlights
              }
              if "bullets" in exp and exp.bullets.len() > 0 {
                internBullets += exp.bullets
              }
              if internBullets.len() > 0 {
                v(0.24em)
                list(..internBullets.map(parse-bold))
              }
            })
          }
        })
      }
    } else if sec == "education" {
      if "education" in data and data.education.len() > 0 {
        section("Education", breakable: false, {
          for (i, edu) in data.education.enumerate() {
            if i > 0 { v(0.45em) }
            block(width: 100%, breakable: false, {
              let deg = edu.degree + if "specialization" in edu and edu.specialization != "" [ in #edu.specialization] else []
              entry-header(deg, edu.institution, edu.dates)
              let details = ()
              if "gpa" in edu and edu.gpa != "" { details.push("GPA: " + edu.gpa) }
              if "honors" in edu and edu.honors != "" { details.push(edu.honors) }
              if "coursework" in edu and edu.coursework != "" { details.push("Coursework: " + edu.coursework) }
              if details.len() > 0 {
                v(0.08em)
                text(size: 8.0pt, fill: t.muted)[#details.join(" · ")]
              }
              if "highlights" in edu and edu.highlights.len() > 0 {
                v(0.24em)
                list(..edu.highlights.map(parse-bold))
              }
            })
          }
        })
      }
    } else if sec == "projects" {
      if projects != () and projects.len() > 0 {
        section("Projects", breakable: false, {
          for (i, proj) in projects.enumerate() {
            block(width: 100%, breakable: false, fill: t.skill-bg, stroke: 0.5pt + t.skill-border, inset: (x: 0.8em, y: 0.55em), radius: 2.5pt)[
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
                #text(size: 7.8pt, fill: t.muted)[#text(weight: "bold", fill: t.ink)[Stack:] #proj.stack]
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
        section("Certifications", {
          for (i, cert) in data.certifications.enumerate() {
            block(width: 100%, breakable: false, {
              let title = if "url" in cert and cert.url != "" {
                link(cert.url)[#text(weight: "bold")[#cert.name] #text(size: 7.2pt)[↗]]
              } else {
                text(weight: "bold")[#cert.name]
              }
              let issuer = if "issuer" in cert and cert.issuer != "" { cert.issuer } else { none }
              let d = if "date" in cert and cert.date != "" { cert.date } else { none }
              entry-header(title, issuer, d)
            })
          }
        })
      }
    } else if sec == "achievements" or sec == "awards" {
      if not awards-rendered {
        let achs = if "achievements" in data and data.achievements.len() > 0 {
          data.achievements
        } else if "awards" in data and data.awards.len() > 0 {
          data.awards
        } else { () }

        if achs.len() > 0 {
          awards-rendered = true
          section("Achievements & Awards", {
            for (i, a) in achs.enumerate() {
              block(width: 100%, breakable: false, {
                let aTitle = if "title" in a and a.title != "" { a.title } else if "name" in a { a.name } else { "" }
                let title = text(weight: "bold")[#aTitle]
                let awarder = if "awarder" in a and a.awarder != "" { a.awarder } else { none }
                let d = if "date" in a and a.date != "" { a.date } else { none }
                entry-header(title, awarder, d)
                if "summary" in a and a.summary != "" {
                  v(0.06em)
                  text(size: 8.4pt)[#parse-bold(a.summary)]
                }
              })
            }
          })
        }
      }
    } else if sec == "openSource" {
      if "openSource" in data and data.openSource.len() > 0 {
        section("Open Source Contributions", {
          for (i, os) in data.openSource.enumerate() {
            if i > 0 { v(0.35em) }
            block(width: 100%, breakable: false)[
              #let proj-name = if "url" in os and os.url != "" {
                link(os.url)[#text(weight: "bold")[#os.project] #text(size: 7.2pt)[↗]]
              } else {
                text(weight: "bold")[#os.project]
              }
              #let contrib = if "contribution" in os and os.contribution != "" { os.contribution } else { none }
              #let d = if "dates" in os and os.dates != "" { os.dates } else { none }
              #entry-header(proj-name, contrib, d)
            ]
          }
        })
      }
    } else if sec == "leadership" {
      if "leadership" in data and data.leadership.len() > 0 {
        section("Leadership & Activities", {
          for (i, l) in data.leadership.enumerate() {
            if i > 0 { v(0.35em) }
            block(width: 100%, breakable: false)[
              #entry-header(l.role, l.organization, if "dates" in l { l.dates } else { none })
            ]
          }
        })
      }
    } else if sec == "publications" {
      if "publications" in data and data.publications.len() > 0 {
        section("Publications", render-publications(data, t.accent))
      }
    } else if sec == "volunteering" {
      if "volunteering" in data and data.volunteering.len() > 0 {
        section("Volunteering", render-volunteering(data))
      }
    } else if sec == "conferences" {
      if "conferences" in data and data.conferences.len() > 0 {
        section("Conferences & Speaking", render-conferences(data))
      }
    } else if sec == "interests" {
      if "interests" in data and data.interests.len() > 0 {
        section("Interests", render-interests(data))
      }
    } else if sec == "languages" {
      if "languages" in data and data.languages.len() > 0 {
        section("Languages", {
          let items = data.languages.map(l => l.language + if "proficiency" in l and l.proficiency != "" [ (#l.proficiency)] else [])
          text(size: 8.5pt)[#items.join("   ·   ")]
        })
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
          section(cs.title, {
            list(..cs.items.map(parse-bold))
          })
        }
      }
    }
  }
}

#let render = render-onyx
