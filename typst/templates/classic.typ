// ============================================================
// Template: Classic — Refined Serif / Executive / Academic
// ============================================================
// Design principles:
//  - Serif body (Libertinus Serif / New Computer Modern)
//  - Muted navy accent, elegant and restrained
//  - Centered header with generous breathing room
//  - Thin hairline rules under section headings
//  - Professional, timeless aesthetic

#import "/lib/utils.typ": parse-bold, clean-link, resolve-variant-field
#import "/lib/theme.typ": font-serif, colors, typo, gap, pg, render-section-title, render-skills-adaptive, render-footer

#let render-classic(data, variant: "default", theme: "classic") = {
  let t = if type(theme) == dictionary { theme } else if type(theme) == str { colors.at(theme, default: colors.classic) } else { colors.classic }

  let name = data.personal.name
  let headline = resolve-variant-field(data.personal.headline, variant, fallback: "")
  let summary = resolve-variant-field(data.summary, variant, fallback: "")
  let skills = resolve-variant-field(data.skills, variant, fallback: ())
  let projects = resolve-variant-field(data.projects, variant, fallback: ())

  // ----------------------------------------------------------
  // Document setup
  // ----------------------------------------------------------
  set document(
    title: if headline != "" { name + " — " + headline } else { name + " — Resume" },
    author: name,
    date: none,
  )

  set page(
    paper: pg.paper,
    margin: (x: 1.30cm, y: 1.05cm),
    footer: render-footer(t, name),
  )

  set text(
    font: font-serif,
    size: 9.1pt,
    fill: t.ink,
    hyphenate: false,
    fallback: true,
  )

  set par(
    leading: typo.body-leading,
    spacing: gap.block,
    justify: false,
    linebreaks: "optimized",
  )

  set list(
    tight: false,
    spacing: gap.bullet,
    indent: 0.9em,
    body-indent: 0.35em,
    marker: (text(fill: t.marker)[•], text(fill: t.marker)[–]),
  )

  show link: set text(fill: t.link)
  show heading: it => it.body

  // =========================================================================
  // 👤 SECTION 1: Header (Centered Name, Headline, Contact Links)
  // =========================================================================
  align(center)[
    #text(size: 22pt, weight: "bold", tracking: 0.015em, fill: t.name-fill)[
      #name
    ]
    #if headline != "" [
      #v(0.22em)
      #text(size: 9.6pt, fill: t.headline-fill)[
        #headline
      ]
    ]
    #v(0.30em)
    #set text(size: 8.6pt, fill: t.ink)
    #{
      let c = data.personal.contact
      let items = ()

      if "phone" in c and c.phone != "" {
        items.push(link("tel:" + c.phone.replace(" ", ""))[#c.phone])
      }
      if "email" in c and c.email != "" {
        items.push(link("mailto:" + c.email)[#c.email])
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
      if "location" in c and c.location != "" {
        items.push(c.location)
      }

      items.join(h(0.40em) + text(fill: t.muted)[|] + h(0.40em))
    }
  ]

  // =========================================================================
  // 📐 Section Header Component (Underlined with thin accent rule)
  // =========================================================================
  let section(title, body, breakable: true) = {
    v(1.05em)
    block(above: 0pt, below: 0pt, breakable: breakable, width: 100%, {
      block(above: 0pt, below: 0.14em, breakable: false, sticky: true, width: 100%, {
        set text(size: 10.5pt, weight: "bold", fill: t.accent)
        heading(level: 2, outlined: true, bookmarked: true, title)
        v(0.12em)
        line(length: 100%, stroke: 0.60pt + t.accent)
      })
      v(0.30em)
      body
    })
  }

  // ----------------------------------------------------------
  // Entry helpers — LaTeX resumeSubheading style
  // ----------------------------------------------------------
  let entry-heading(company, role, dates, location) = {
    grid(
      columns: (1fr, auto),
      column-gutter: 0.8em,
      align: (left + top, right + top),
      text(size: 9.8pt, weight: "bold", fill: t.ink)[#company],
      text(size: 8.6pt, fill: t.muted)[#dates],
    )
    v(0.04em)
    grid(
      columns: (1fr, auto),
      column-gutter: 0.8em,
      align: (left + top, right + top),
      text(size: 9.0pt, weight: "bold", style: "italic", fill: t.accent)[#role],
      if location != "" { text(size: 8.6pt, style: "italic", fill: t.muted)[#location] } else { none },
    )
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

  let awards-rendered = false

  for sec in active-order {
    if sec == "summary" {
      if summary != "" {
        section("Professional Summary", parse-bold(summary))
      }
    } else if sec == "techStackSummary" {
      if "techStackSummary" in data and data.techStackSummary != "" {
        section("Tech Stack", parse-bold(data.techStackSummary))
      }
    } else if sec == "skills" {
      if skills != () and skills.len() > 0 {
        section("Technical Skills", {
          render-skills-adaptive(t, skills)
        })
      }
    } else if sec == "keyMetrics" {
      if "keyMetrics" in data and data.keyMetrics.len() > 0 {
        section("Key Metrics", {
          for (i, m) in data.keyMetrics.enumerate() {
            if i > 0 { v(0.25em) }
            [#text(weight: "bold")[#m.label]: #text(fill: t.accent)[#m.value]#if "context" in m and m.context != "" [ — #text(size: 8.5pt, fill: t.muted)[#m.context]]]
          }
        })
      }
    } else if sec == "experience" {
      if "experience" in data and data.experience.len() > 0 {
        section("Professional Experience", {
          for (i, exp) in data.experience.enumerate() {
            if i > 0 { v(0.75em) }
            block(
              width: 100%,
              breakable: false,
              {
                entry-heading(
                  exp.company,
                  exp.role,
                  exp.dates,
                  if "location" in exp { exp.location } else { "" },
                )
                let allBullets = ()
                if "highlights" in exp and exp.highlights != () { allBullets += exp.highlights }
                if "impactBullets" in exp and exp.impactBullets != () { allBullets += exp.impactBullets }
                if "bullets" in exp and exp.bullets != () { allBullets += exp.bullets }
                if allBullets.len() > 0 {
                  v(0.16em)
                  list(..allBullets.map(parse-bold))
                }
              },
            )
          }
        })
      }
    } else if sec == "internships" {
      if "internships" in data and data.internships.len() > 0 {
        section("Internships", {
          for (i, exp) in data.internships.enumerate() {
            if i > 0 { v(0.75em) }
            block(
              width: 100%,
              breakable: false,
              {
                entry-heading(
                  exp.company,
                  exp.role,
                  exp.dates,
                  if "location" in exp { exp.location } else { "" },
                )
                let allBullets = ()
                if "highlights" in exp and exp.highlights != () { allBullets += exp.highlights }
                if "impactBullets" in exp and exp.impactBullets != () { allBullets += exp.impactBullets }
                if "bullets" in exp and exp.bullets != () { allBullets += exp.bullets }
                if allBullets.len() > 0 {
                  v(0.16em)
                  list(..allBullets.map(parse-bold))
                }
              },
            )
          }
        })
      }
    } else if sec == "projects" {
      if projects != () and projects.len() > 0 {
        section("Projects", {
          for (i, proj) in projects.enumerate() {
            if i > 0 { v(0.50em) }
            block(width: 100%, breakable: false, {
              grid(
                columns: (1fr, auto),
                column-gutter: 0.8em,
                align: (left + top, right + top),
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
                  text(size: 8.2pt, style: "italic", fill: t.muted)[#proj.dates]
                } else { none }
              )
              if "description" in proj and proj.description != "" {
                v(0.06em)
                text(size: 8.4pt, fill: t.muted)[#parse-bold(proj.description)]
              }
              let allBullets = ()
              if "highlights" in proj and proj.highlights != () { allBullets += proj.highlights }
              if "impactBullets" in proj and proj.impactBullets != () { allBullets += proj.impactBullets }
              if "bullets" in proj and proj.bullets != () { allBullets += proj.bullets }
              if allBullets.len() > 0 {
                v(0.10em)
                list(..allBullets.map(parse-bold))
              }
            })
          }
        })
      }
    } else if sec == "education" {
      if "education" in data and data.education.len() > 0 {
        section("Education", {
          for (i, edu) in data.education.enumerate() {
            if i > 0 { v(0.40em) }
            block(
              width: 100%,
              breakable: false,
              {
                grid(
                  columns: (1fr, auto),
                  column-gutter: 0.8em,
                  align: (left + top, right + top),
                  text(size: 9.6pt, weight: "bold", fill: t.ink)[#if "institution" in edu { edu.institution } else { "" }],
                  text(size: 8.8pt, fill: t.muted)[#edu.dates],
                )
                v(0.04em)
                grid(
                  columns: (1fr, auto),
                  column-gutter: 0.8em,
                  align: (left + top, right + top),
                  text(size: 9.0pt, fill: t.ink)[#edu.degree#if "specialization" in edu and edu.specialization != "" [ (#edu.specialization)]],
                  if "gpa" in edu and edu.gpa != "" { text(size: 8.8pt, fill: t.muted)[GPA: #edu.gpa] } else { none },
                )
              },
            )
          }
        })
      }
    } else if sec == "certifications" {
      if "certifications" in data and data.certifications.len() > 0 {
        section("Certifications", breakable: false, {
          for (i, cert) in data.certifications.enumerate() {
            if i > 0 { v(0.35em) }
            grid(
              columns: (1fr, auto),
              align: (left + top, right + top),
              [
                #text(weight: "bold")[#cert.name]
                #if "issuer" in cert and cert.issuer != "" [#text(fill: t.muted)[ · #cert.issuer]]
              ],
              if "date" in cert and cert.date != "" { text(size: 8.6pt, fill: t.muted)[#cert.date] }
            )
          }
        })
      }
    } else if sec == "achievements" or sec == "awards" {
      if not awards-rendered {
        let items = if "achievements" in data and data.achievements.len() > 0 { data.achievements } else if "awards" in data and data.awards.len() > 0 { data.awards } else { () }
        if items.len() > 0 {
          section("Achievements & Honors", breakable: false, {
            for (i, a) in items.enumerate() {
              if i > 0 { v(0.40em) }
              grid(
                columns: (1fr, auto),
                align: (left + top, right + top),
                [
                  #text(weight: "bold", fill: t.ink)[#a.title]
                  #if "awarder" in a and a.awarder != "" [#text(fill: t.muted)[ · #a.awarder]]
                ],
                if "date" in a and a.date != "" { text(size: 8.6pt, fill: t.muted)[#a.date] }
              )
              if "description" in a and a.description != "" {
                v(0.04em)
                text(size: 8.5pt, fill: t.ink)[#parse-bold(a.description)]
              }
            }
          })
        }
        awards-rendered = true
      }
    } else if sec == "openSource" {
      if "openSource" in data and data.openSource.len() > 0 {
        section("Open Source", breakable: false, {
          for (i, os) in data.openSource.enumerate() {
            if i > 0 { v(0.40em) }
            block(width: 100%, breakable: false, {
              grid(
                columns: (1fr, auto),
                [
                  #text(weight: "bold", fill: t.ink)[#os.project]
                  #if "url" in os and os.url != "" [ #link(os.url)[#text(size: 7.5pt, fill: t.accent)[↗]] ]
                  #if "contribution" in os and os.contribution != "" [ — #text(size: 8.4pt, fill: t.muted)[#os.contribution] ]
                ],
                if "dates" in os and os.dates != "" { text(size: 8.2pt, fill: t.muted)[#os.dates] }
              )
              if "bullets" in os and os.bullets.len() > 0 {
                v(0.08em)
                list(..os.bullets.map(parse-bold))
              } else if "impact" in os and os.impact != "" {
                v(0.04em)
                text(size: 8.2pt, fill: t.ink)[#parse-bold(os.impact)]
              }
            })
          }
        })
      }
    } else if sec == "publications" {
      if "publications" in data and data.publications.len() > 0 {
        section("Publications", breakable: false, {
          for (i, pub) in data.publications.enumerate() {
            if i > 0 { v(0.35em) }
            grid(
              columns: (1fr, auto),
              [
                #text(weight: "bold", fill: t.ink)[#pub.title]
                #if "url" in pub and pub.url != "" [ #link(pub.url)[#text(size: 7.5pt, fill: t.accent)[↗]] ]
                #if "publisher" in pub and pub.publisher != "" [ · #text(style: "italic", fill: t.muted)[#pub.publisher] ]
              ],
              if "date" in pub and pub.date != "" { text(size: 8.2pt, fill: t.muted)[#pub.date] }
            )
            if "description" in pub and pub.description != "" {
              v(0.04em)
              text(size: 8.2pt, fill: t.ink)[#parse-bold(pub.description)]
            }
          }
        })
      }
    } else if sec == "leadership" {
      if "leadership" in data and data.leadership.len() > 0 {
        section("Leadership", breakable: false, {
          for (i, l) in data.leadership.enumerate() {
            if i > 0 { v(0.40em) }
            block(width: 100%, breakable: false, {
              grid(
                columns: (1fr, auto),
                [#text(weight: "bold", fill: t.ink)[#l.role], #text(style: "italic")[#l.organization]],
                if "dates" in l and l.dates != "" { text(size: 8.2pt, fill: t.muted)[#l.dates] }
              )
              if "bullets" in l and l.bullets.len() > 0 {
                v(0.08em)
                list(..l.bullets.map(parse-bold))
              }
            })
          }
        })
      }
    } else if sec == "volunteering" {
      if "volunteering" in data and data.volunteering.len() > 0 {
        section("Volunteering & Community", breakable: false, {
          for (i, vol) in data.volunteering.enumerate() {
            if i > 0 { v(0.40em) }
            block(width: 100%, breakable: false, {
              grid(
                columns: (1fr, auto),
                [#text(weight: "bold", fill: t.ink)[#vol.role], #text(style: "italic")[#vol.organization]],
                if "dates" in vol and vol.dates != "" { text(size: 8.2pt, fill: t.muted)[#vol.dates] }
              )
              if "bullets" in vol and vol.bullets.len() > 0 {
                v(0.08em)
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
            if i > 0 { v(0.35em) }
            grid(
              columns: (1fr, auto),
              [
                #text(weight: "bold", fill: t.ink)[#conf.name]
                #if "role" in conf and conf.role != "" [ · #text(fill: t.muted)[#conf.role] ]
              ],
              if "date" in conf and conf.date != "" { text(size: 8.2pt, fill: t.muted)[#conf.date] }
            )
            if "description" in conf and conf.description != "" {
              v(0.04em)
              text(size: 8.2pt, fill: t.ink)[#parse-bold(conf.description)]
            }
          }
        })
      }
    } else if sec == "languages" {
      if "languages" in data and data.languages.len() > 0 {
        section("Languages", breakable: false, {
          let lang-items = data.languages.map(l => l.language + if "proficiency" in l and l.proficiency != "" [ (#l.proficiency)] else [])
          text(size: 8.5pt)[#lang-items.join(" · ")]
        })
      }
    } else if sec == "interests" {
      if "interests" in data and data.interests.len() > 0 {
        section("Interests", breakable: false, {
          let items = ()
          for item in data.interests {
            if type(item) == str { items.push(item) }
            else if type(item) == dictionary and "name" in item { items.push(item.name) }
          }
          text(size: 8.5pt)[#items.join(" · ")]
        })
      }
    } else if sec == "patents" {
      if "patents" in data and data.patents.len() > 0 {
        section("Patents & Intellectual Property", breakable: false, {
          for (i, pat) in data.patents.enumerate() {
            if i > 0 { v(0.24em) }
            let title-line = text(weight: "bold", fill: t.ink)[#pat.title]
            let meta = ()
            if "number" in pat and pat.number != "" { meta.push("US " + pat.number) }
            if "status" in pat and pat.status != "" { meta.push(pat.status) }
            if "date" in pat and pat.date != "" { meta.push(pat.date) }
            [• #title-line #if meta.len() > 0 [ — #text(size: 8.2pt, fill: t.muted)[#meta.join(", ")] ]]
            if "description" in pat and pat.description != "" {
              v(0.04em)
              text(size: 8.2pt, fill: t.ink)[#parse-bold(pat.description)]
            }
          }
        })
      }
    } else if sec == "additionalInfo" {
      if "additionalInfo" in data and data.additionalInfo != none {
        let items = ()
        let ai = data.additionalInfo
        if "availability" in ai and ai.availability != "" { items.push([#text(weight: "bold")[Availability: ] #ai.availability]) }
        if "workAuthorization" in ai and ai.workAuthorization != "" { items.push([#text(weight: "bold")[Work Authorization: ] #ai.workAuthorization]) }
        if "relocation" in ai and ai.relocation != "" { items.push([#text(weight: "bold")[Relocation: ] #ai.relocation]) }
        if "travel" in ai and ai.travel != "" { items.push([#text(weight: "bold")[Travel: ] #ai.travel]) }
        if "notes" in ai and ai.notes != "" { items.push([#text(weight: "bold")[Notes: ] #ai.notes]) }
        if items.len() > 0 {
          section("Additional Information", breakable: false, items.join(" · "))
        }
      }
    } else if sec == "customSections" {
      if "customSections" in data and data.customSections.len() > 0 {
        for cs in data.customSections {
          section(cs.title, breakable: false, {
            set list(spacing: 0.35em)
            list(..cs.items.map(parse-bold))
          })
        }
      }
    }
  }
}

#let render = render-classic
