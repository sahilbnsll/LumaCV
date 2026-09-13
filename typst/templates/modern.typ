// ============================================================
// Template: Modern — Clean Tech Aesthetics (Flagship)
// ============================================================
// Design principles:
//  - Sans-serif body (Inter / DejaVu Sans)
//  - Crisp blue accent with subtle category badges
//  - Centered header with inline SVG icons
//  - Thin accent rule under section headings
//  - Tight, consistent vertical rhythm

#import "/lib/utils.typ": parse-bold, clean-link, resolve-variant-field
#import "/lib/icons.typ": icon-phone, icon-email, icon-linkedin, icon-github, icon-globe, icon-location
#import "/lib/theme.typ": font-sans, colors, typo, gap, pg, render-section-title, render-skills-adaptive, render-contact-inline, render-footer

#let render-modern(data, variant: "default", theme: "modern") = {
  let t = if type(theme) == dictionary { theme } else if type(theme) == str { colors.at(theme, default: colors.modern) } else { colors.modern }

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
    margin: (x: pg.margin-x, top: 1.08cm, bottom: 1.08cm),
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

  show link: set text(fill: t.link)
  show heading: it => it.body

  // ----------------------------------------------------------
  // =========================================================================
  // 👤 SECTION 1: Header (Name, Headline, Shaded Contact Strip)
  // =========================================================================
  align(center)[
    #text(size: 19pt, weight: "bold", tracking: 0.22em, fill: t.name-fill)[
      #upper(name)
    ]
    #if headline != "" [
      #v(0.16em)
      #text(size: 8.8pt, weight: "regular", tracking: 0.06em, fill: t.headline-fill)[
        #headline
      ]
    ]
    #v(0.30em)
    #rect(
      fill: rgb("#f3f4f6"),
      radius: 2.5pt,
      inset: (x: 6pt, y: 4.2pt),
      width: 100%,
      stroke: none,
      [
        #set text(size: 7.3pt, fill: rgb("#374151"))
        #{
          let c = data.personal.contact
          let items = ()

          if "location" in c and c.location != "" {
            items.push(c.location)
          }
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

          items.join(h(0.35em) + text(fill: rgb("#9ca3af"))[|] + h(0.35em))
        }
      ]
    )
  ]

  // =========================================================================
  // 📐 Section Header Component (Tracked Uppercase & Hairline Rule)
  // =========================================================================
  let section(title, body) = {
    v(0.85em)
    block(above: 0pt, below: 0.12em, breakable: false, sticky: true, width: 100%, {
      align(center)[
        #set text(size: 8.5pt, weight: "bold", fill: t.accent, tracking: 0.20em)
        #heading(level: 2, outlined: true, bookmarked: true, upper(title))
      ]
      v(0.10em)
      line(length: 100%, stroke: 0.50pt + rgb("#d1d5db"))
    })
    v(0.20em)
    body
  }

  // =========================================================================
  // 🏷️ Entry Header Helpers
  // =========================================================================
  let entry-heading(company, role, dates, location) = {
    grid(
      columns: (1fr, auto),
      column-gutter: 0.8em,
      align: (left + top, right + top),
      text(size: 9.3pt, weight: "bold", fill: t.ink)[#company],
      text(size: 8.4pt, weight: "bold", fill: t.ink)[#dates],
    )
    v(0.08em)
    grid(
      columns: (1fr, auto),
      column-gutter: 0.8em,
      align: (left + top, right + top),
      text(size: 8.6pt, weight: "bold", fill: t.accent)[#role],
      if location != "" { text(size: 8.0pt, fill: t.muted)[#location] } else { none },
    )
  }

  let entry-title(lead, trail) = {
    grid(
      columns: (1fr, auto),
      column-gutter: 0.8em,
      align: (left + top, right + top),
      text(size: typo.entry-size, weight: typo.entry-weight)[#lead],
      text(size: typo.meta-size, fill: t.muted)[#trail],
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
          render-skills-adaptive(t, skills, max-categories-for-grid: 4)
        })
      }
    } else if sec == "keyMetrics" {
      if "keyMetrics" in data and data.keyMetrics.len() > 0 {
        section("Key Metrics", {
          for (i, m) in data.keyMetrics.enumerate() {
            if i > 0 { v(0.25em) }
            [#text(weight: "bold")[#m.label]: #text(fill: t.accent)[#m.value]#if "context" in m and m.context != "" [ — #text(size: typo.meta-size, fill: t.muted)[#m.context]]]
          }
        })
      }
    } else if sec == "experience" {
      if "experience" in data and data.experience.len() > 0 {
        section("Work Experience", {
          for (i, exp) in data.experience.enumerate() {
            if i > 0 { v(0.82em) }
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
                  v(0.18em)
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
            if i > 0 { v(0.82em) }
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
                v(0.18em)
                list(..exp.bullets.map(parse-bold))
              },
            )
          }
        })
      }
    } else if sec == "projects" {
      if projects != () and projects.len() > 0 {
        section("Projects", {
          for (i, proj) in projects.enumerate() {
            if i > 0 { v(0.60em) }
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
                    text(size: typo.meta-size, fill: t.accent)[ · #proj.role]
                  }
                  if "stack" in proj and proj.stack != "" {
                    text(size: typo.meta-size, fill: t.muted)[ (#proj.stack)]
                  }
                },
                if "dates" in proj and proj.dates != "" {
                  text(size: 8.4pt, weight: "bold", fill: t.ink)[#proj.dates]
                } else { none }
              )
              if "description" in proj and proj.description != "" {
                v(0.10em)
                text(size: typo.meta-size, fill: t.muted)[#parse-bold(proj.description)]
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
                v(0.12em)
                list(..allBullets.map(parse-bold))
              }
            })
          }
        })
      }
    } else if sec == "education" {
      if "education" in data and data.education.len() > 0 {
        section("Education", {
          block(width: 100%, breakable: false, {
            for (i, edu) in data.education.enumerate() {
              if i > 0 { v(0.40em) }
              entry-title(
                [#text(weight: "bold", fill: t.ink)[#edu.degree] #if "specialization" in edu and edu.specialization != "" [#text(size: typo.meta-size, fill: t.muted)[· #edu.specialization]]],
                edu.dates,
              )
              let details = ()
              if "institution" in edu and edu.institution != "" {
                details.push(edu.institution)
              }
              if "gpa" in edu and edu.gpa != "" {
                details.push(edu.gpa)
              }
              if details.len() > 0 {
                v(0.12em)
                text(size: typo.meta-size, fill: t.muted)[#details.join(text(fill: t.muted)[ · ])]
              }
            }
          })
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
                if "url" in cert and cert.url != "" {
                  link(cert.url)[#text(weight: "bold", fill: t.ink)[#cert.name] #text(size: 7.5pt, fill: t.accent)[↗]]
                } else {
                  text(weight: "bold", fill: t.ink)[#cert.name]
                }
                if "issuer" in cert and cert.issuer != "" [#text(fill: t.muted)[ · #cert.issuer]]
                if "date" in cert and cert.date != "" [#h(1fr) #text(size: typo.meta-size, fill: t.muted)[#cert.date]]
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
                if "url" in a and a.url != "" {
                  link(a.url)[#text(weight: "bold", fill: t.ink)[#a.title] #text(size: 7.5pt, fill: t.accent)[↗]]
                } else {
                  text(weight: "bold", fill: t.ink)[#a.title]
                }
                if "awarder" in a and a.awarder != "" [#text(fill: t.muted)[ · #a.awarder]]
                if "date" in a and a.date != "" [#h(1fr) #text(size: typo.meta-size, fill: t.muted)[#a.date]]
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
            block(width: 100%, breakable: false, {
              grid(
                columns: (1fr, auto),
                column-gutter: 0.8em,
                align: (left + top, right + top),
                {
                  if "url" in os and os.url != "" {
                    link(os.url)[#text(weight: "bold", fill: t.ink)[#os.project] #text(size: 7.5pt, fill: t.accent)[↗]]
                  } else {
                    text(weight: "bold", fill: t.ink)[#os.project]
                  }
                  if "contribution" in os and os.contribution != "" {
                    text(size: typo.meta-size, fill: t.muted)[ · #os.contribution]
                  }
                },
                if "dates" in os and os.dates != "" {
                  text(size: 8.4pt, weight: "bold", fill: t.ink)[#os.dates]
                } else { none }
              )
              if "bullets" in os and os.bullets.len() > 0 {
                v(0.12em)
                list(..os.bullets.map(parse-bold))
              }
            })
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
              if "url" in pub and pub.url != "" {
                link(pub.url)[#text(weight: "bold", fill: t.ink)[#pubTitle] #text(size: 7.5pt, fill: t.accent)[↗]]
              } else {
                text(weight: "bold", fill: t.ink)[#pubTitle]
              }
              if "publisher" in pub and pub.publisher != "" [ · #text(size: typo.meta-size, fill: t.muted)[#pub.publisher]]
              if "date" in pub and pub.date != "" [ #h(1fr) #text(size: typo.meta-size, fill: t.muted)[#pub.date]]
            })
          }
        })
      }
    } else if sec == "leadership" {
      if "leadership" in data and data.leadership.len() > 0 {
        section("Leadership", {
          for (i, l) in data.leadership.enumerate() {
            if i > 0 { v(0.35em) }
            [#text(weight: "bold", fill: t.ink)[#l.role], #text(style: "italic")[#l.organization]#if "dates" in l and l.dates != "" [ #h(1fr) #text(size: typo.meta-size, fill: t.muted)[#l.dates]]]
          }
        })
      }
    } else if sec == "volunteering" {
      if "volunteering" in data and data.volunteering.len() > 0 {
        section("Volunteering", {
          for (i, vol) in data.volunteering.enumerate() {
            if i > 0 { v(0.35em) }
            block(width: 100%, breakable: false, {
              grid(
                columns: (1fr, auto),
                column-gutter: 0.8em,
                align: (left + top, right + top),
                {
                  text(weight: "bold", fill: t.ink)[#vol.role]
                  if "organization" in vol and vol.organization != "" {
                    text(size: typo.meta-size, fill: t.muted)[ · #vol.organization]
                  }
                },
                if "dates" in vol and vol.dates != "" {
                  text(size: 8.4pt, weight: "bold", fill: t.ink)[#vol.dates]
                } else { none }
              )
              let bullets = ()
              if "highlights" in vol and vol.highlights.len() > 0 { bullets += vol.highlights }
              if "bullets" in vol and vol.bullets.len() > 0 { bullets += vol.bullets }
              if bullets.len() > 0 {
                v(0.12em)
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
              if "role" in conf and conf.role != "" [ · #text(size: typo.meta-size, fill: t.muted)[#conf.role]]
              if "date" in conf and conf.date != "" [ #h(1fr) #text(size: typo.meta-size, fill: t.muted)[#conf.date]]
            })
          }
        })
      }
    } else if sec == "languages" {
      if "languages" in data and data.languages.len() > 0 {
        section("Languages", {
          let lang-items = data.languages.map(l => l.language + if "proficiency" in l and l.proficiency != "" [ (#l.proficiency)] else [])
          text(size: typo.meta-size)[#lang-items.join(" · ")]
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
          text(size: typo.meta-size)[#items.join(" · ")]
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

#let render = render-modern
