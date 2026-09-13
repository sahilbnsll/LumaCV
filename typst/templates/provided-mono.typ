// ============================================================
// Template: Mono (Monocode) — Terminal / Developer Aesthetic
// ============================================================

#import "/lib/utils.typ": parse-bold, clean-link, resolve-variant-field
#import "/lib/theme.typ": render-footer

#let render-mono(data, variant: "default", theme: "mono") = {
  let t = (
    ink: rgb("#0f172a"),
    accent: rgb("#16a34a"),
    muted: rgb("#64748b"),
    marker: rgb("#16a34a"),
    link: rgb("#16a34a"),
    card-bg: rgb("#f8fafc"),
    border-line: rgb("#e2e8f0"),
    name-fill: rgb("#0f172a"),
    headline-fill: rgb("#16a34a"),
  )

  let name = data.personal.name
  let headline = resolve-variant-field(data.personal.headline, variant, fallback: "")
  let summary = resolve-variant-field(data.summary, variant, fallback: "")
  let skills = resolve-variant-field(data.skills, variant, fallback: ())
  let projects = resolve-variant-field(data.projects, variant, fallback: ())
  let contact = data.personal.contact

  set document(
    title: name + " — Resume",
    author: name,
    date: none,
  )

  set page(
    paper: "a4",
    margin: (x: 1.25cm, top: 1.0cm, bottom: 1.15cm),
    footer: render-footer(t, name),
  )

  set text(
    font: ("JetBrains Mono", "Fira Code", "DejaVu Sans Mono", "Consolas"),
    size: 8.2pt,
    fill: t.ink,
    hyphenate: false,
    fallback: true,
  )

  set par(leading: 0.52em, spacing: 0.36em, justify: false, linebreaks: "optimized")

  set list(
    indent: 0.85em,
    body-indent: 0.35em,
    spacing: 0.22em,
    marker: (text(fill: t.accent, "-"), text(fill: t.muted, "--")),
  )

  show link: set text(fill: t.link)
  show heading: it => it.body

  let contact-items = ()
  if "location" in contact and contact.location != "" { contact-items.push(contact.location) }
  if "email" in contact and contact.email != "" { contact-items.push(link("mailto:" + contact.email)[#contact.email]) }
  if "phone" in contact and contact.phone != "" { contact-items.push(link("tel:" + contact.phone.replace(" ", ""))[#contact.phone]) }
  if "linkedin" in contact and contact.linkedin != "" { contact-items.push(link("https://" + clean-link(contact.linkedin))[#clean-link(contact.linkedin)]) }
  if "github" in contact and contact.github != "" { contact-items.push(link("https://" + clean-link(contact.github))[#clean-link(contact.github)]) }
  if "website" in contact and contact.website != "" { contact-items.push(link("https://" + clean-link(contact.website))[#clean-link(contact.website)]) }
  let contact-text = contact-items.join(text(fill: t.muted)[  ·  ])

  // CLI Prompt Header
  block(width: 100%, [
    #text(size: 8.5pt, weight: "bold", fill: t.accent)[> whoami] \
    #v(0.04em)
    #text(size: 19pt, weight: "bold", fill: t.name-fill)[#name]
    #if headline != "" [
      \ #v(0.06em)
      #text(size: 8.6pt, fill: t.headline-fill)[#("// " + headline)]
    ]
    #v(0.18em)
    #text(size: 7.4pt, fill: t.muted)[#contact-text]
  ])

  v(0.20em)
  line(length: 100%, stroke: 0.75pt + rgb("#cbd5e1"))

  let section(title, body) = {
    v(0.72em)
    block(above: 0pt, below: 0.20em, breakable: false, sticky: true, width: 100%, {
      text(size: 8.6pt, weight: "bold", fill: t.accent)[#("# " + lower(title))]
      v(0.06em)
      line(length: 100%, stroke: 0.5pt + rgb("#e2e8f0"))
    })
    v(0.16em)
    body
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
        section("summary", parse-bold(summary))
      }
    } else if sec == "techStackSummary" {
      if "techStackSummary" in data and data.techStackSummary != none and data.techStackSummary != "" {
        section("core_stack", block(
          fill: t.card-bg,
          stroke: 0.5pt + t.border-line,
          inset: (x: 0.6em, y: 0.4em),
          radius: 2.5pt,
          width: 100%,
          text(size: 8pt)[#text(weight: "bold", fill: t.ink)[specialized_tech: ] #parse-bold(data.techStackSummary)]
        ))
      }
    } else if sec == "keyMetrics" {
      if "keyMetrics" in data and data.keyMetrics != none and data.keyMetrics.len() > 0 {
        section("system_metrics", {
          let cols = calc.min(data.keyMetrics.len(), 4)
          grid(
            columns: (1fr,) * cols,
            column-gutter: 0.5em,
            row-gutter: 0.5em,
            ..data.keyMetrics.map(km => block(
              fill: t.card-bg,
              stroke: 0.5pt + t.border-line,
              inset: 0.45em,
              radius: 2.5pt,
              width: 100%,
              align(center)[
                #text(size: 9.6pt, weight: "bold", fill: t.accent)[#km.value] \
                #v(0.06em)
                #text(size: 7.2pt, weight: "bold", fill: t.ink)[#km.label]
                #if "context" in km and km.context != "" [
                  \ #v(0.04em)
                  #text(size: 6.6pt, fill: t.muted)[#km.context]
                ]
              ]
            ))
          )
        })
      }
    } else if sec == "skills" {
      if skills != () and skills.len() > 0 {
        section("technical_skills", {
          for (i, cat) in skills.enumerate() {
            if i > 0 { v(0.18em) }
            grid(
              columns: (140pt, 1fr),
              column-gutter: 0.6em,
              text(weight: "bold", fill: t.ink)[#cat.category:],
              text(fill: t.ink)[#cat.skills.join(", ")]
            )
          }
        })
      }
    } else if sec == "experience" {
      if "experience" in data and data.experience.len() > 0 {
        section("experience", {
          for (i, exp) in data.experience.enumerate() {
            if i > 0 { v(0.55em) }
            block(width: 100%, breakable: false, {
              grid(
                columns: (1fr, auto),
                column-gutter: 0.8em,
                align: (left + top, right + top),
                [#text(size: 8.8pt, weight: "bold", fill: t.ink)[#exp.role] #text(fill: t.accent)[@] #text(weight: "bold", fill: t.ink)[#exp.company]],
                text(size: 7.6pt, fill: t.muted)[#exp.dates],
              )
              if ("location" in exp and exp.location != "") or ("technologies" in exp and exp.technologies != "") {
                v(0.03em)
                grid(
                  columns: (1fr, auto),
                  if "location" in exp and exp.location != "" { text(size: 7.6pt, fill: t.muted)[#exp.location] },
                  if "technologies" in exp and exp.technologies != "" { text(size: 7.4pt, fill: t.muted)[stack: #exp.technologies] }
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
        section("internships", {
          for (i, exp) in data.internships.enumerate() {
            if i > 0 { v(0.52em) }
            block(width: 100%, breakable: false, {
              grid(
                columns: (1fr, auto),
                column-gutter: 0.8em,
                align: (left + top, right + top),
                [#text(size: 8.8pt, weight: "bold", fill: t.ink)[#exp.role] #text(fill: t.accent)[@] #text(weight: "bold", fill: t.ink)[#exp.company]],
                text(size: 7.6pt, fill: t.muted)[#exp.dates],
              )
              if "location" in exp and exp.location != "" {
                v(0.03em)
                text(size: 7.6pt, fill: t.muted)[#exp.location]
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
        section("projects", {
          for (i, proj) in projects.enumerate() {
            if i > 0 { v(0.42em) }
            block(width: 100%, breakable: false, {
              grid(
                columns: (1fr, auto),
                [
                  #text(weight: "bold", fill: t.ink)[#proj.name]
                  #if "role" in proj and proj.role != "" [ #text(fill: t.muted)[·] #text(size: 7.8pt, fill: t.muted)[#proj.role] ]
                  #if "url" in proj and proj.url != "" [ #link(proj.url)[#text(fill: t.accent)[ ↗]] ]
                ],
                if "dates" in proj and proj.dates != "" { text(size: 7.6pt, fill: t.muted)[#proj.dates] }
              )
              if "stack" in proj and proj.stack != "" {
                v(0.03em)
                text(size: 7.4pt, fill: t.accent)[stack: #proj.stack]
              }
              if "description" in proj and proj.description != "" {
                v(0.05em)
                parse-bold(proj.description)
              }
              let all-p-bullets = ()
              if "highlights" in proj and proj.highlights != () { all-p-bullets += proj.highlights }
              if "impactBullets" in proj and proj.impactBullets != () { all-p-bullets += proj.impactBullets }
              if "bullets" in proj and proj.bullets != () { all-p-bullets += proj.bullets }
              if all-p-bullets.len() > 0 {
                v(0.10em)
                list(..all-p-bullets.map(parse-bold))
              }
            })
          }
        })
      }
    } else if sec == "education" {
      if "education" in data and data.education.len() > 0 {
        section("education", {
          for (i, edu) in data.education.enumerate() {
            if i > 0 { v(0.36em) }
            grid(
              columns: (1fr, auto),
              column-gutter: 0.8em,
              text(weight: "bold", fill: t.ink)[#edu.institution],
              text(size: 7.6pt, fill: t.muted)[#edu.dates],
            )
            v(0.02em)
            grid(
              columns: (1fr, auto),
              [#text(size: 8pt, fill: t.ink)[#edu.degree#if "specialization" in edu and edu.specialization != "" [ · #edu.specialization]]],
              if "gpa" in edu and edu.gpa != "" { text(size: 7.6pt, fill: t.muted)[GPA: #edu.gpa] }
            )
          }
        })
      }
    } else if sec == "certifications" {
      if "certifications" in data and data.certifications.len() > 0 {
        section("certifications", {
          for (i, cert) in data.certifications.enumerate() {
            if i > 0 { v(0.24em) }
            grid(
              columns: (1fr, auto),
              [
                #text(weight: "bold", fill: t.ink)[#cert.name]
                #if "url" in cert and cert.url != "" [ #link(cert.url)[#text(fill: t.accent)[ ↗]] ]
                #if "issuer" in cert and cert.issuer != "" [ #text(fill: t.muted)[ · #cert.issuer] ]
              ],
              text(size: 7.6pt, fill: t.muted)[#if "date" in cert { cert.date }]
            )
          }
        })
      }
    } else if sec == "achievements" or sec == "awards" {
      if not awards-rendered {
        let items = if "achievements" in data and data.achievements.len() > 0 { data.achievements } else if "awards" in data and data.awards.len() > 0 { data.awards } else { () }
        if items.len() > 0 {
          section("awards_and_honors", {
            for (i, ach) in items.enumerate() {
              if i > 0 { v(0.25em) }
              grid(
                columns: (1fr, auto),
                [
                  #text(weight: "bold", fill: t.ink)[#ach.title]
                  #if "awarder" in ach and ach.awarder != "" [ #text(fill: t.muted)[ · #ach.awarder] ]
                  #if "url" in ach and ach.url != "" [ #link(ach.url)[#text(fill: t.accent)[ ↗]] ]
                ],
                text(size: 7.6pt, fill: t.muted)[#if "date" in ach { ach.date }]
              )
              if "description" in ach and ach.description != "" {
                v(0.04em)
                text(size: 7.6pt, fill: t.ink)[#parse-bold(ach.description)]
              }
            }
          })
        }
        awards-rendered = true
      }
    } else if sec == "openSource" {
      if "openSource" in data and data.openSource.len() > 0 {
        section("open_source", {
          for (i, item) in data.openSource.enumerate() {
            if i > 0 { v(0.28em) }
            grid(
              columns: (1fr, auto),
              [
                #text(weight: "bold", fill: t.ink)[#item.project]
                #if "url" in item and item.url != "" [ #link(item.url)[#text(fill: t.accent)[ ↗]] ]
                #if "contribution" in item and item.contribution != "" [ #text(fill: t.muted)[ · #item.contribution] ]
              ],
              text(size: 7.6pt, fill: t.muted)[#if "dates" in item { item.dates }]
            )
            if "bullets" in item and item.bullets.len() > 0 {
              v(0.06em)
              list(..item.bullets.map(parse-bold))
            } else if "impact" in item and item.impact != "" {
              v(0.04em)
              text(size: 7.6pt, fill: t.ink)[#parse-bold(item.impact)]
            }
          }
        })
      }
    } else if sec == "publications" {
      if "publications" in data and data.publications.len() > 0 {
        section("publications", {
          for (i, pub) in data.publications.enumerate() {
            if i > 0 { v(0.24em) }
            grid(
              columns: (1fr, auto),
              [
                #text(weight: "bold", fill: t.ink)[#pub.title]
                #if "url" in pub and pub.url != "" [ #link(pub.url)[#text(fill: t.accent)[ ↗]] ]
                #if "publisher" in pub and pub.publisher != "" [ #text(fill: t.muted)[ · #pub.publisher] ]
              ],
              text(size: 7.6pt, fill: t.muted)[#if "date" in pub { pub.date }]
            )
            if "description" in pub and pub.description != "" {
              v(0.04em)
              text(size: 7.6pt, fill: t.ink)[#parse-bold(pub.description)]
            }
          }
        })
      }
    } else if sec == "leadership" {
      if "leadership" in data and data.leadership.len() > 0 {
        section("leadership", {
          for (i, lead) in data.leadership.enumerate() {
            if i > 0 { v(0.28em) }
            grid(
              columns: (1fr, auto),
              [
                #text(weight: "bold", fill: t.ink)[#lead.role]
                #if "organization" in lead and lead.organization != "" [ #text(fill: t.muted)[ @ #lead.organization] ]
              ],
              text(size: 7.6pt, fill: t.muted)[#if "dates" in lead { lead.dates }]
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
        section("volunteering", {
          for (i, vol) in data.volunteering.enumerate() {
            if i > 0 { v(0.28em) }
            grid(
              columns: (1fr, auto),
              [
                #text(weight: "bold", fill: t.ink)[#vol.role]
                #if "organization" in vol and vol.organization != "" [ #text(fill: t.muted)[ @ #vol.organization] ]
              ],
              text(size: 7.6pt, fill: t.muted)[#if "dates" in vol { vol.dates }]
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
        section("conferences", {
          for (i, conf) in data.conferences.enumerate() {
            if i > 0 { v(0.24em) }
            grid(
              columns: (1fr, auto),
              [
                #text(weight: "bold", fill: t.ink)[#conf.name]
                #if "role" in conf and conf.role != "" [ #text(fill: t.muted)[ · #conf.role] ]
              ],
              text(size: 7.6pt, fill: t.muted)[#if "date" in conf { conf.date }]
            )
            if "description" in conf and conf.description != "" {
              v(0.04em)
              text(size: 7.6pt, fill: t.ink)[#parse-bold(conf.description)]
            }
          }
        })
      }
    } else if sec == "languages" {
      if "languages" in data and data.languages.len() > 0 {
        section("languages", {
          let items = data.languages.map(lang => [#text(weight: "bold", fill: t.ink)[#lang.language] #text(fill: t.muted)[(#lang.proficiency)]])
          items.join(text(fill: t.muted)[ · ])
        })
      }
    } else if sec == "interests" {
      if "interests" in data and data.interests.len() > 0 {
        section("interests", {
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
        section("patents", {
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
              text(size: 7.6pt, fill: t.ink)[#parse-bold(pat.description)]
            }
          }
        })
      }
    } else if sec == "additionalInfo" {
      if "additionalInfo" in data and data.additionalInfo != none {
        let items = ()
        let ai = data.additionalInfo
        if "availability" in ai and ai.availability != "" { items.push([#text(weight: "bold", fill: t.ink)[availability: ] #ai.availability]) }
        if "workAuthorization" in ai and ai.workAuthorization != "" { items.push([#text(weight: "bold", fill: t.ink)[work_auth: ] #ai.workAuthorization]) }
        if "relocation" in ai and ai.relocation != "" { items.push([#text(weight: "bold", fill: t.ink)[relocation: ] #ai.relocation]) }
        if "travel" in ai and ai.travel != "" { items.push([#text(weight: "bold", fill: t.ink)[travel: ] #ai.travel]) }
        if "notes" in ai and ai.notes != "" { items.push([#text(weight: "bold", fill: t.ink)[notes: ] #ai.notes]) }
        if items.len() > 0 {
          section("additional_info", items.join(text(fill: t.muted)[ · ]))
        }
      }
    } else if sec == "customSections" {
      if "customSections" in data and data.customSections.len() > 0 {
        for cs in data.customSections {
          if cs.items.len() > 0 {
            section(lower(cs.title), {
              list(..cs.items.map(parse-bold))
            })
          }
        }
      }
    }
  }
}

#let render = render-mono
