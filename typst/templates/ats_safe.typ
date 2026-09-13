// ============================================================
// Template: ATS-Safe — Zero Decoration / Pure Text Extraction
// ============================================================
// Design principles:
//  - Sans-serif body, pure black text
//  - No icons, no colour accents, no decoration
//  - Single-column layout for maximum parser compatibility
//  - Plain pipe separators for contact info
//  - Everything extractable as literal text

#import "/lib/utils.typ": parse-bold, clean-link, resolve-variant-field
#import "/lib/theme.typ": font-sans, colors, typo, gap, pg, render-skills-adaptive, render-footer

#let render-ats-safe(data, variant: "default", theme: "ats-safe") = {
  let t = if type(theme) == dictionary { theme } else if type(theme) == str { colors.at(theme, default: colors.at("ats-safe")) } else { colors.at("ats-safe") }

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
    margin: (x: 1.50cm, y: 1.30cm),
    footer: render-footer(t, name),
  )

  set text(
    font: font-sans,
    size: 8.8pt,
    fill: t.ink,
    ligatures: false,
    hyphenate: false,
    fallback: true,
  )

  set par(
    leading: 0.56em,
    spacing: 0.48em,
    justify: false,
    linebreaks: "optimized",
  )

  set list(
    tight: false,
    spacing: gap.bullet,
    indent: 0.85em,
    body-indent: 0.35em,
    marker: (text(fill: t.marker)[•], text(fill: t.marker)[–]),
  )

  show heading: it => it.body
  show link: set text(fill: t.link)

  // =========================================================================
  // 👤 SECTION 1: Header (Centered Clean Text for ATS Scanners)
  // =========================================================================
  align(center)[
    #text(size: 20pt, weight: "bold", tracking: 0.02em, fill: t.name-fill)[
      #name
    ]
    #if headline != "" [
      #v(0.18em)
      #text(size: 9.2pt, weight: "bold", fill: t.accent)[
        #headline
      ]
    ]
    #v(0.25em)
    #set text(size: 8pt)
    #{
      let c = data.personal.contact
      let items = ()

      if "phone" in c and c.phone != "" {
        items.push(c.phone)
      }
      if "email" in c and c.email != "" {
        items.push(c.email)
      }
      if "linkedin" in c and c.linkedin != "" {
        items.push(clean-link(c.linkedin))
      }
      if "github" in c and c.github != "" {
        items.push(clean-link(c.github))
      }
      if "website" in c and c.website != "" {
        items.push(clean-link(c.website))
      }
      if "location" in c and c.location != "" {
        items.push(c.location)
      }

      items.join(" | ")
    }
  ]

  // =========================================================================
  // 📐 Section Header Component (100% Linear Single Column for ATS)
  // =========================================================================
  let section(title, body) = {
    v(1.10em)
    block(above: 0pt, below: 0.14em, breakable: false, sticky: true, width: 100%, {
      set text(size: 9pt, weight: "bold", tracking: 0.06em, fill: t.accent)
      heading(level: 2, outlined: true, bookmarked: true, upper(title))
      v(0.14em)
      line(length: 100%, stroke: 0.75pt + t.accent)
    })
    v(0.40em)
    body
  }

  // =========================================================================
  // 🎯 SECTION 2: Professional Summary
  // =========================================================================
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
        section("Summary", parse-bold(summary))
      }
    } else if sec == "techStackSummary" {
      if "techStackSummary" in data and data.techStackSummary != "" {
        section("Tech Stack", parse-bold(data.techStackSummary))
      }
    } else if sec == "skills" {
      if skills != () and skills.len() > 0 {
        section("Skills", {
          render-skills-adaptive(t, skills, max-categories-for-grid: 0)
        })
      }
    } else if sec == "keyMetrics" {
      if "keyMetrics" in data and data.keyMetrics.len() > 0 {
        section("Key Metrics", {
          for (i, m) in data.keyMetrics.enumerate() {
            if i > 0 { v(0.25em) }
            [#text(weight: "bold")[#m.label]: #text(fill: t.accent)[#m.value]#if "context" in m and m.context != "" [ — #text(size: 8.4pt, fill: t.muted)[#m.context]]]
          }
        })
      }
    } else if sec == "experience" {
      if "experience" in data and data.experience.len() > 0 {
        section("Work Experience", {
          for (i, exp) in data.experience.enumerate() {
            if i > 0 { v(0.80em) }
            block(
              width: 100%,
              breakable: false,
              {
                grid(
                  columns: (1fr, auto),
                  column-gutter: 0.8em,
                  align: (left + top, right + top),
                  {
                    text(size: 9.2pt, weight: "bold", fill: t.ink)[#exp.role]
                    text(size: 9.2pt, weight: "bold", fill: t.company-fill)[ – #exp.company]
                    if "location" in exp and exp.location != "" {
                      text(size: 8pt, fill: t.muted)[ · #exp.location]
                    }
                  },
                  text(size: 8.4pt, fill: t.muted)[#exp.dates],
                )
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
                  v(0.22em)
                  list(..expBullets.map(parse-bold))
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
            if i > 0 { v(0.80em) }
            block(
              width: 100%,
              breakable: false,
              {
                grid(
                  columns: (1fr, auto),
                  column-gutter: 0.8em,
                  align: (left + top, right + top),
                  {
                    text(size: 9.2pt, weight: "bold", fill: t.ink)[#exp.role]
                    text(size: 9.2pt, weight: "bold", fill: t.company-fill)[ – #exp.company]
                    if "location" in exp and exp.location != "" {
                      text(size: 8pt, fill: t.muted)[ · #exp.location]
                    }
                  },
                  text(size: 8.4pt, fill: t.muted)[#exp.dates],
                )
                let internBullets = ()
                if "highlights" in exp and exp.highlights.len() > 0 {
                  internBullets += exp.highlights
                }
                if "bullets" in exp and exp.bullets.len() > 0 {
                  internBullets += exp.bullets
                }
                if internBullets.len() > 0 {
                  v(0.22em)
                  list(..internBullets.map(parse-bold))
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
                    link(proj.url)[#text(weight: "bold", fill: t.company-fill)[#proj.name] #text(size: 7.5pt)[↗]]
                  } else {
                    text(weight: "bold", fill: t.company-fill)[#proj.name]
                  }
                  if "role" in proj and proj.role != "" {
                    text(size: 8.5pt)[ · #proj.role]
                  }
                  if "stack" in proj and proj.stack != "" {
                    text(size: 8.5pt)[ (#proj.stack)]
                  }
                },
                if "dates" in proj and proj.dates != "" {
                  text(size: 8.5pt, weight: "bold")[#proj.dates]
                } else { none }
              )
              if "description" in proj and proj.description != "" {
                v(0.08em)
                text(size: 8.5pt)[#parse-bold(proj.description)]
              }
              let allBullets = ()
              if "highlights" in proj and proj.highlights.len() > 0 {
                allBullets += proj.highlights
              }
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
        })
      }
    } else if sec == "education" {
      if "education" in data and data.education.len() > 0 {
        section("Education", {
          for (i, edu) in data.education.enumerate() {
            block(
              above: if i == 0 { 0pt } else { 0.55em },
              below: 0pt,
              breakable: false,
              width: 100%,
              {
                grid(
                  columns: (1fr, auto),
                  column-gutter: 0.8em,
                  align: (left + top, right + top),
                  {
                    text(weight: "bold", size: 9pt, fill: t.ink)[#edu.degree]
                    if "specialization" in edu and edu.specialization != "" {
                      text(size: 8.4pt, fill: t.muted)[ – #edu.specialization]
                    }
                    linebreak()
                    v(0.06em)
                    text(size: 8.4pt, weight: "medium", fill: t.company-fill)[#edu.institution#if "gpa" in edu and edu.gpa != "" [ (#edu.gpa)]]
                  },
                  text(size: 8.4pt, fill: t.muted)[#edu.dates],
                )
              },
            )
          }
        })
      }
    } else if sec == "certifications" {
      if "certifications" in data and data.certifications.len() > 0 {
        section("Certifications", {
          for (i, cert) in data.certifications.enumerate() {
            block(
              above: if i == 0 { 0pt } else { gap.bullet },
              below: 0pt,
              width: 100%,
              {
                text(weight: "bold", fill: t.ink)[#cert.name]
                if "issuer" in cert and cert.issuer != "" [#text(fill: t.muted)[ – ]#cert.issuer]
                if "date" in cert and cert.date != "" [#h(1fr) #text(size: 8.2pt, fill: t.muted)[#cert.date]]
              },
            )
          }
        })
      }
    } else if sec == "achievements" {
      if "achievements" in data and data.achievements.len() > 0 {
        section("Achievements", {
          for (i, a) in data.achievements.enumerate() {
            block(
              above: if i == 0 { 0pt } else { gap.bullet },
              below: 0pt,
              width: 100%,
              {
                text(weight: "bold", fill: t.ink)[#a.title]
                if "awarder" in a and a.awarder != "" [#text(fill: t.muted)[ – ]#a.awarder]
                if "date" in a and a.date != "" [#h(1fr) #text(size: 8.2pt, fill: t.muted)[#a.date]]
              },
            )
          }
        })
      }
    } else if sec == "openSource" {
      if "openSource" in data and data.openSource.len() > 0 {
        section("Open Source", {
          for (i, os) in data.openSource.enumerate() {
            if i > 0 { v(0.35em) }
            [#text(weight: "bold", fill: t.ink)[#os.project]#if "contribution" in os and os.contribution != "" [ — #text(size: 8.2pt)[#os.contribution]]#if "dates" in os and os.dates != "" [ #h(1fr) #text(size: 8.2pt, fill: t.muted)[#os.dates]]]
          }
        })
      }
    } else if sec == "publications" {
      if "publications" in data and data.publications.len() > 0 {
        section("Publications", {
          for (i, pub) in data.publications.enumerate() {
            if i > 0 { v(0.35em) }
            block(width: 100%, breakable: false, {
              let pubTitle = if "title" in pub and pub.title != "" { pub.title } else if "name" in pub { pub.name } else { "" }
              text(weight: "bold", fill: t.ink)[#pubTitle]
              if "publisher" in pub and pub.publisher != "" [ · #pub.publisher]
              if "date" in pub and pub.date != "" [ · #pub.date]
              if "url" in pub and pub.url != "" [ · #link(pub.url)[#text(fill: t.accent)[#pub.url]]]
            })
          }
        })
      }
    } else if sec == "leadership" {
      if "leadership" in data and data.leadership.len() > 0 {
        section("Leadership", {
          for (i, l) in data.leadership.enumerate() {
            if i > 0 { v(0.35em) }
            [#text(weight: "bold", fill: t.ink)[#l.role], #text(style: "italic")[#l.organization]#if "dates" in l and l.dates != "" [ #h(1fr) #text(size: 8.2pt, fill: t.muted)[#l.dates]]]
          }
        })
      }
    } else if sec == "volunteering" {
      if "volunteering" in data and data.volunteering.len() > 0 {
        section("Volunteering", {
          for (i, vol) in data.volunteering.enumerate() {
            if i > 0 { v(0.35em) }
            block(width: 100%, breakable: false, {
              text(weight: "bold", fill: t.ink)[#vol.role]
              if "organization" in vol and vol.organization != "" [ · #vol.organization]
              if "dates" in vol and vol.dates != "" [ #h(1fr) #text(size: 8.2pt, fill: t.muted)[#vol.dates]]
              let bullets = ()
              if "highlights" in vol and vol.highlights.len() > 0 { bullets += vol.highlights }
              if "bullets" in vol and vol.bullets.len() > 0 { bullets += vol.bullets }
              if bullets.len() > 0 {
                v(0.10em)
                list(..bullets.map(parse-bold))
              }
            })
          }
        })
      }
    } else if sec == "conferences" {
      if "conferences" in data and data.conferences.len() > 0 {
        section("Conferences & Speaking", {
          for (i, conf) in data.conferences.enumerate() {
            if i > 0 { v(0.35em) }
            block(width: 100%, breakable: false, {
              text(weight: "bold", fill: t.ink)[#conf.name]
              if "role" in conf and conf.role != "" [ · #conf.role]
              if "date" in conf and conf.date != "" [ #h(1fr) #text(size: 8.2pt, fill: t.muted)[#conf.date]]
            })
          }
        })
      }
    } else if sec == "languages" {
      if "languages" in data and data.languages.len() > 0 {
        section("Languages", {
          let lang-items = data.languages.map(l => l.language + if "proficiency" in l and l.proficiency != "" [ (#l.proficiency)] else [])
          text(size: 8.4pt)[#lang-items.join(" · ")]
        })
      }
    } else if sec == "interests" {
      if "interests" in data and data.interests.len() > 0 {
        section("Interests", {
          let items = ()
          for item in data.interests {
            let t-val = if type(item) == dictionary and "name" in item { item.name } else { str(item) }
            items.push(t-val)
          }
          text(size: 8.4pt)[#items.join(" · ")]
        })
      }
    } else if sec == "customSections" {
      if "customSections" in data and data.customSections.len() > 0 {
        for cs in data.customSections {
          section(cs.title, {
            set list(spacing: 0.35em)
            list(..cs.items.map(parse-bold))
          })
        }
      }
    }
  }
}


#let render = render-ats-safe
