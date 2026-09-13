// ============================================================
// Template: Compact — High Information Density
// ============================================================
// Design principles:
//  - Sans-serif body, tight spacing
//  - Left-aligned header with name + contact on same line
//  - Bold accent rule under header
//  - Minimal gaps, maximum content per page
//  - Ideal for 10+ years of experience

#import "/lib/utils.typ": parse-bold, clean-link, resolve-variant-field
#import "/lib/theme.typ": font-sans, colors, typo, gap, pg, render-skills-adaptive, render-footer

#let render-compact(data, variant: "default", theme: "compact") = {
  let t = if type(theme) == dictionary { theme } else if type(theme) == str { colors.at(theme, default: colors.compact) } else { colors.compact }

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
    margin: (x: 1.25cm, y: 0.95cm),
    footer: render-footer(t, name),
  )

  set text(
    font: font-sans,
    size: 8.85pt,
    fill: t.ink,
    hyphenate: false,
    fallback: true,
  )

  set par(
    leading: 0.60em,
    spacing: 0.48em,
    justify: false,
    linebreaks: "optimized",
  )

  set list(
    tight: false,
    spacing: 0.48em,
    indent: 0.85em,
    body-indent: 0.35em,
    marker: (text(fill: t.marker)[•], text(fill: t.marker)[–]),
  )

  show link: set text(fill: t.link)
  show heading: it => it.body

  // =========================================================================
  // 👤 SECTION 1: Header (Left-aligned Name & Contact Info)
  // =========================================================================
  grid(
    columns: (auto, 1fr),
    column-gutter: 1.2em,
    [
      #text(size: 19pt, weight: "bold", fill: t.name-fill)[#name]
      #if headline != "" [
        #v(0.15em)
        #text(size: 8.8pt, weight: "bold", fill: t.headline-fill)[#headline]
      ]
    ],
    align(right + top)[
      #set text(size: 8.0pt, fill: t.ink)
      #{
        let c = data.personal.contact
        let lines = ()

        // Line 1: phone · email · location
        let line1 = ()
        if "phone" in c and c.phone != "" {
          line1.push(link("tel:" + c.phone.replace(" ", ""))[#c.phone])
        }
        if "email" in c and c.email != "" {
          line1.push(link("mailto:" + c.email)[#c.email])
        }
        if "location" in c and c.location != "" {
          line1.push(c.location)
        }
        if line1.len() > 0 {
          lines.push(line1.join(text(fill: t.muted)[ · ]))
        }

        // Line 2: linkedin · github · website
        let line2 = ()
        if "linkedin" in c and c.linkedin != "" {
          let li = clean-link(c.linkedin)
          line2.push(link("https://" + li)[#li])
        }
        if "github" in c and c.github != "" {
          let gh = clean-link(c.github)
          line2.push(link("https://" + gh)[#gh])
        }
        if "website" in c and c.website != "" {
          let web = clean-link(c.website)
          line2.push(link("https://" + web)[#web])
        }
        if line2.len() > 0 {
          lines.push(line2.join(text(fill: t.muted)[ · ]))
        }

        lines.join(linebreak())
      }
    ],
  )

  v(0.18em)
  line(length: 100%, stroke: 0.7pt + t.accent)
  v(0.25em)

  // =========================================================================
  // 📐 Section Header Component
  // =========================================================================
  let section(title, body) = {
    v(1.05em)
    block(above: 0pt, below: 0.12em, breakable: false, sticky: true, width: 100%, {
      set text(size: 8.6pt, weight: "bold", fill: t.accent, tracking: 0.08em)
      heading(level: 2, outlined: true, bookmarked: true, upper(title))
      v(0.10em)
      line(length: 100%, stroke: 0.5pt + t.accent)
    })
    v(0.28em)
    body
  }

  // =========================================================================
  // 🏷️ Entry Header Helper
  // =========================================================================
  let entry-title(lead, trail) = {
    grid(
      columns: (1fr, auto),
      column-gutter: 0.8em,
      align: (left + top, right + top),
      text(size: 8.6pt)[#lead],
      text(size: 8.0pt, fill: t.muted)[#trail],
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
          render-skills-adaptive(t, skills, max-categories-for-grid: 0)
        })
      }
    } else if sec == "keyMetrics" {
      if "keyMetrics" in data and data.keyMetrics.len() > 0 {
        section("Key Metrics", {
          for (i, m) in data.keyMetrics.enumerate() {
            if i > 0 { v(0.25em) }
            [#text(weight: "bold")[#m.label]: #text(fill: t.accent)[#m.value]#if "context" in m and m.context != "" [ — #text(size: 7.6pt, fill: t.muted)[#m.context]]]
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
                entry-title(
                  [#text(weight: "bold")[#exp.role] #text(fill: t.company-fill)[· #exp.company] #if "location" in exp and exp.location != "" [#text(size: 7.6pt, fill: t.muted)[· #exp.location]]],
                  exp.dates,
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
                  v(0.20em)
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
                entry-title(
                  [#text(weight: "bold")[#exp.role] #text(fill: t.company-fill)[· #exp.company] #if "location" in exp and exp.location != "" [#text(size: 7.6pt, fill: t.muted)[· #exp.location]]],
                  exp.dates,
                )
                let internBullets = ()
                if "highlights" in exp and exp.highlights.len() > 0 {
                  internBullets += exp.highlights
                }
                if "bullets" in exp and exp.bullets.len() > 0 {
                  internBullets += exp.bullets
                }
                if internBullets.len() > 0 {
                  v(0.20em)
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
            block(
              width: 100%,
              breakable: false,
              {
                entry-title(
                  {
                    if "url" in proj and proj.url != "" {
                      link(proj.url)[#text(weight: "bold")[#proj.name] #text(size: 7.0pt)[↗]]
                    } else {
                      text(weight: "bold")[#proj.name]
                    }
                    if "role" in proj and proj.role != "" {
                      text(size: 7.8pt, fill: t.muted)[ · #proj.role]
                    }
                    if "stack" in proj and proj.stack != "" {
                      text(size: 7.6pt, fill: t.muted)[ (#proj.stack)]
                    }
                  },
                  if "dates" in proj and proj.dates != "" {
                    text(size: 7.8pt, fill: t.muted)[#proj.dates]
                  } else { none }
                )
                if "description" in proj and proj.description != "" {
                  v(0.12em)
                  text(size: 8.4pt)[#parse-bold(proj.description)]
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
              },
            )
          }
        })
      }
    } else if sec == "education" {
      if "education" in data and data.education.len() > 0 {
        section("Education", {
          for (i, edu) in data.education.enumerate() {
            if i > 0 { v(0.45em) }
            block(
              width: 100%,
              breakable: false,
              {
                entry-title(
                  [#text(weight: "bold", size: 8.8pt)[#edu.degree] #if "specialization" in edu and edu.specialization != "" [#text(size: 8pt, fill: t.muted)[· #edu.specialization]]],
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
                  v(0.15em)
                  text(size: 7.6pt, fill: t.muted)[#details.join(text(fill: t.muted)[ · ])]
                }
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
              above: if i == 0 { 0pt } else { 0.25em },
              below: 0pt,
              width: 100%,
              {
                text(weight: "bold", fill: t.ink)[#cert.name]
                if "issuer" in cert and cert.issuer != "" [#text(fill: t.muted)[ · #cert.issuer]]
                if "date" in cert and cert.date != "" [#h(1fr) #text(size: 7.6pt, fill: t.muted)[#cert.date]]
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
              above: if i == 0 { 0pt } else { 0.25em },
              below: 0pt,
              width: 100%,
              {
                text(weight: "bold", fill: t.ink)[#a.title]
                if "awarder" in a and a.awarder != "" [#text(fill: t.muted)[ · #a.awarder]]
                if "date" in a and a.date != "" [#h(1fr) #text(size: 7.6pt, fill: t.muted)[#a.date]]
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
            [#text(weight: "bold", fill: t.ink)[#os.project]#if "contribution" in os and os.contribution != "" [ — #text(size: 7.6pt)[#os.contribution]]#if "dates" in os and os.dates != "" [ #h(1fr) #text(size: 7.6pt, fill: t.muted)[#os.dates]]]
          }
        })
      }
    } else if sec == "publications" {
      if "publications" in data and data.publications.len() > 0 {
        section("Publications", {
          for (i, pub) in data.publications.enumerate() {
            if i > 0 { v(0.25em) }
            block(width: 100%, breakable: false, {
              let pubTitle = if "title" in pub and pub.title != "" { pub.title } else if "name" in pub { pub.name } else { "" }
              if "url" in pub and pub.url != "" {
                link(pub.url)[#text(weight: "bold", fill: t.ink)[#pubTitle] #text(size: 7.2pt, fill: t.accent)[↗]]
              } else {
                text(weight: "bold", fill: t.ink)[#pubTitle]
              }
              if "publisher" in pub and pub.publisher != "" [ · #text(fill: t.muted)[#pub.publisher]]
              if "date" in pub and pub.date != "" [ #h(1fr) #text(size: 7.6pt, fill: t.muted)[#pub.date]]
            })
          }
        })
      }
    } else if sec == "leadership" {
      if "leadership" in data and data.leadership.len() > 0 {
        section("Leadership", {
          for (i, l) in data.leadership.enumerate() {
            if i > 0 { v(0.35em) }
            [#text(weight: "bold", fill: t.ink)[#l.role], #text(style: "italic")[#l.organization]#if "dates" in l and l.dates != "" [ #h(1fr) #text(size: 7.6pt, fill: t.muted)[#l.dates]]]
          }
        })
      }
    } else if sec == "volunteering" {
      if "volunteering" in data and data.volunteering.len() > 0 {
        section("Volunteering", {
          for (i, vol) in data.volunteering.enumerate() {
            if i > 0 { v(0.30em) }
            block(width: 100%, breakable: false, {
              text(weight: "bold", fill: t.ink)[#vol.role]
              if "organization" in vol and vol.organization != "" [ · #text(style: "italic")[#vol.organization]]
              if "dates" in vol and vol.dates != "" [ #h(1fr) #text(size: 7.6pt, fill: t.muted)[#vol.dates]]
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
            if i > 0 { v(0.25em) }
            block(width: 100%, breakable: false, {
              text(weight: "bold", fill: t.ink)[#conf.name]
              if "role" in conf and conf.role != "" [ · #text(fill: t.muted)[#conf.role]]
              if "date" in conf and conf.date != "" [ #h(1fr) #text(size: 7.6pt, fill: t.muted)[#conf.date]]
            })
          }
        })
      }
    } else if sec == "languages" {
      if "languages" in data and data.languages.len() > 0 {
        section("Languages", {
          let lang-items = data.languages.map(l => l.language + if "proficiency" in l and l.proficiency != "" [ (#l.proficiency)] else [])
          text(size: 7.6pt)[#lang-items.join(" · ")]
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
          text(size: 7.6pt)[#items.join(" · ")]
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

#let render = render-compact
