// ============================================================
// Template: Chikorita (Verdant)
// ============================================================
// Design principles:
//  - Organic editorial minimalism with warm sage, forest & stone tones
//  - Balanced white space and elegant typographic hierarchy
//  - Soft pill tags for contact and skills
//  - Verbatim fidelity with dates, links, and multi-bullet support

#import "/lib/utils.typ": parse-bold, clean-link, resolve-variant-field
#import "/lib/theme.typ": font-sans, colors, typo, gap, pg, render-skills-adaptive, render-footer
#import "/support/resume-core.typ": render-publications, render-leadership, render-volunteering, render-conferences, render-interests

#let render-chikorita(data, variant: "default", theme: "chikorita") = {
  let t = if type(theme) == dictionary { theme } else if type(theme) == str { colors.at(theme, default: colors.chikorita) } else { colors.chikorita }

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
    margin: (x: 1.35cm, top: 1.35cm, bottom: 1.60cm),
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
    leading: 0.58em,
    spacing: 0.48em,
    justify: false,
    linebreaks: "optimized",
  )

  set list(
    tight: false,
    spacing: 0.38em,
    indent: 0.85em,
    body-indent: 0.35em,
    marker: (text(fill: t.marker)[•], text(fill: t.muted)[–]),
  )

  show link: set text(fill: t.link)
  show heading: it => it.body

  // -------------------------------------------------------------------------
  // Header: Elegant Left
  // -------------------------------------------------------------------------
  block(width: 100%, below: 0.80em, {
    text(size: 21pt, weight: "bold", fill: t.ink)[#name]
    if headline != "" [
      #v(0.16em)
      #text(size: 9.6pt, weight: "medium", fill: t.accent)[#headline]
    ]

    v(0.35em)
    let c = data.personal.contact
    let items = ()
    if "email" in c and c.email != "" { items.push(link("mailto:" + c.email)[#c.email]) }
    if "phone" in c and c.phone != "" { items.push(link("tel:" + c.phone.replace(" ", ""))[#c.phone]) }
    if "location" in c and c.location != "" { items.push(c.location) }
    if "website" in c and c.website != "" {
      let web = clean-link(c.website)
      items.push(link("https://" + web)[#web])
    }
    if "linkedin" in c and c.linkedin != "" {
      let li = clean-link(c.linkedin)
      items.push(link("https://" + li)[#li])
    }
    if "github" in c and c.github != "" {
      let gh = clean-link(c.github)
      items.push(link("https://" + gh)[#gh])
    }

    if items.len() > 0 {
      text(size: 8.2pt, fill: t.muted)[#items.join(text(fill: rgb("#A8A29E"))[   ·   ])]
    }
  })

  line(length: 100%, stroke: 1.0pt + rgb("#D6D3D1"))
  v(0.50em)

  // -------------------------------------------------------------------------
  // Section Component
  // -------------------------------------------------------------------------
  let section(title, body, breakable: false) = {
    v(1.35em)
    block(width: 100%, breakable: false, sticky: true, {
      stack(
        spacing: 0.35em,
        text(size: 9.2pt, weight: "bold", fill: t.accent, tracking: 0.08em)[#upper(title)],
        line(length: 100%, stroke: 0.65pt + rgb("#E7E5E4"))
      )
    })
    v(0.50em)
    block(width: 100%, breakable: breakable, body)
  }

  let entry-title(title-content, date-content) = {
    grid(
      columns: (1fr, auto),
      align: (left + bottom, right + bottom),
      title-content,
      [#if date-content != none and date-content != "" [#text(size: 8.0pt, fill: t.muted)[#date-content]]]
    )
  }

  // -------------------------------------------------------------------------
  // Order Dispatcher
  // -------------------------------------------------------------------------
  let order = if "sectionOrder" in data and data.sectionOrder.len() > 0 {
    data.sectionOrder
  } else {
    ("summary", "techStackSummary", "skills", "keyMetrics", "experience", "internships", "education", "projects", "certifications", "achievements", "openSource", "publications", "leadership", "volunteering", "conferences", "languages", "interests", "patents", "products", "devopsContributions", "securityContributions", "additionalInfo", "customSections")
  }

  for sec in order {
    if sec == "summary" {
      if summary != "" {
        section("Summary", {
          parse-bold(summary)
        })
      }
    } else if sec == "techStackSummary" {
      if "techStackSummary" in data and data.techStackSummary != "" {
        section("Tech Stack", parse-bold(data.techStackSummary))
      }
    } else if sec == "experience" {
      if "experience" in data and data.experience.len() > 0 {
        section("Experience", breakable: true, {
          for (i, exp) in data.experience.enumerate() {
            if i > 0 { v(0.58em) }
            block(width: 100%, breakable: false, {
              entry-title(
                [#text(weight: "bold", size: 9.0pt)[#exp.role] #text(size: 8.6pt, fill: t.company-fill)[· #exp.company]#if "location" in exp and exp.location != "" [#text(size: 7.8pt, fill: t.muted)[ · #exp.location]]],
                exp.dates
              )
              if "summary" in exp and exp.summary != "" {
                v(0.06em)
                text(size: 8.3pt, style: "italic", fill: t.muted)[#parse-bold(exp.summary)]
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
            if i > 0 { v(0.58em) }
            block(width: 100%, breakable: false, {
              entry-title(
                [#text(weight: "bold", size: 9.0pt)[#exp.role] #text(size: 8.6pt, fill: t.company-fill)[· #exp.company]],
                exp.dates
              )
              if "summary" in exp and exp.summary != "" {
                v(0.06em)
                text(size: 8.3pt, style: "italic", fill: t.muted)[#parse-bold(exp.summary)]
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
            if i > 0 { v(0.48em) }
            block(width: 100%, breakable: false, {
              let deg = edu.degree + if "specialization" in edu and edu.specialization != "" [ in #edu.specialization] else []
              entry-title(
                [#text(weight: "bold")[#deg] #text(fill: t.company-fill)[· #edu.institution]],
                edu.dates
              )
              let details = ()
              if "gpa" in edu and edu.gpa != "" { details.push("GPA: " + edu.gpa) }
              if "honors" in edu and edu.honors != "" { details.push(edu.honors) }
              if details.len() > 0 {
                v(0.08em)
                text(size: 7.8pt, fill: t.muted)[#details.join(" · ")]
              }
            })
          }
        })
      }
    } else if sec == "projects" {
      if projects != () and projects.len() > 0 {
        section("Projects", breakable: false, {
          for (i, proj) in projects.enumerate() {
            if i > 0 { v(0.55em) }
            block(width: 100%, breakable: false, {
              entry-title(
                {
                  if "url" in proj and proj.url != "" {
                    link(proj.url)[#text(weight: "bold")[#proj.name] #text(size: 7.0pt)[↗]]
                  } else {
                    text(weight: "bold")[#proj.name]
                  }
                  if "role" in proj and proj.role != "" {
                    text(size: 8.0pt, fill: t.muted)[ · #proj.role]
                  }
                  if "stack" in proj and proj.stack != "" {
                    text(size: 7.8pt, fill: t.muted)[ (#proj.stack)]
                  }
                },
                if "dates" in proj and proj.dates != "" { proj.dates } else { none }
              )
              if "description" in proj and proj.description != "" {
                v(0.08em)
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
                v(0.22em)
                list(..allBullets.map(parse-bold))
              }
            })
          }
        })
      }
    } else if sec == "skills" {
      if skills != () and skills.len() > 0 {
        section("Skills", {
          render-skills-adaptive(t, skills)
        })
      }
    } else if sec == "keyMetrics" {
      if "keyMetrics" in data and data.keyMetrics.len() > 0 {
        section("Key Metrics", breakable: false, {
          let cols = calc.min(data.keyMetrics.len(), 4)
          grid(
            columns: range(cols).map(_ => 1fr),
            gutter: 0.6em,
            ..data.keyMetrics.map(m => block(
              width: 100%,
              fill: rgb("#F7FDF9"),
              stroke: 0.5pt + rgb("#BBF7D0"),
              inset: (x: 0.6em, y: 0.45em),
              radius: 2.5pt,
              align(center)[
                #text(size: 10.5pt, weight: "bold", fill: t.accent)[#m.value] \
                #v(0.06em)
                #text(size: 7.6pt, weight: "bold", fill: t.ink)[#m.label]
                #if "context" in m and m.context != "" [
                  \ #v(0.06em)
                  #text(size: 7.0pt, fill: t.muted)[#m.context]
                ]
              ]
            ))
          )
        })
      }
    } else if sec == "certifications" {
      if "certifications" in data and data.certifications.len() > 0 {
        section("Certifications", {
          for (i, cert) in data.certifications.enumerate() {
            if i > 0 { v(0.30em) }
            block(width: 100%, breakable: false, {
              let title = if "url" in cert and cert.url != "" {
                link(cert.url)[#text(weight: "bold")[#cert.name] #text(size: 7.0pt)[↗]]
              } else {
                text(weight: "bold")[#cert.name]
              }
              entry-title(
                [#title#if "issuer" in cert and cert.issuer != "" [ · #text(fill: t.muted)[#cert.issuer]]],
                if "date" in cert { cert.date } else { none }
              )
            })
          }
        })
      }
    } else if sec == "achievements" or sec == "awards" {
      let achs = if "achievements" in data and data.achievements.len() > 0 {
        data.achievements
      } else if "awards" in data and data.awards.len() > 0 {
        data.awards
      } else { () }

      if achs.len() > 0 {
        section("Achievements", {
          for (i, a) in achs.enumerate() {
            if i > 0 { v(0.30em) }
            block(width: 100%, breakable: false, {
              entry-title(
                [#text(weight: "bold")[#a.title]#if "awarder" in a and a.awarder != "" [ · #text(fill: t.muted)[#a.awarder]]],
                if "date" in a { a.date } else { none }
              )
              if "description" in a and a.description != "" {
                v(0.06em)
                text(size: 8.2pt)[#parse-bold(a.description)]
              }
            })
          }
        })
      }
    } else if sec == "openSource" {
      if "openSource" in data and data.openSource.len() > 0 {
        section("Open Source", {
          for (i, os) in data.openSource.enumerate() {
            if i > 0 { v(0.30em) }
            block(width: 100%, breakable: false, {
              let proj-name = if "url" in os and os.url != "" {
                link(os.url)[#text(weight: "bold")[#os.project] #text(size: 7.0pt)[↗]]
              } else {
                text(weight: "bold")[#os.project]
              }
              entry-title(
                [#proj-name#if "contribution" in os and os.contribution != "" [ — #text(size: 8.0pt)[#os.contribution]]],
                if "dates" in os { os.dates } else { none }
              )
            })
          }
        })
      }
    } else if sec == "publications" {
      if "publications" in data and data.publications.len() > 0 {
        section("Publications", render-publications(data, t.accent))
      }
    } else if sec == "leadership" {
      if "leadership" in data and data.leadership.len() > 0 {
        section("Leadership", render-leadership(data))
      }
    } else if sec == "volunteering" {
      if "volunteering" in data and data.volunteering.len() > 0 {
        section("Volunteering", render-volunteering(data))
      }
    } else if sec == "conferences" {
      if "conferences" in data and data.conferences.len() > 0 {
        section("Conferences & Speaking", render-conferences(data))
      }
    } else if sec == "languages" {
      if "languages" in data and data.languages.len() > 0 {
        section("Languages", {
          block(width: 100%, breakable: false, {
            let items = data.languages.map(l => l.language + if "proficiency" in l and l.proficiency != "" [ (#l.proficiency)] else [])
            text(size: 8.2pt)[#items.join("   ·   ")]
          })
        })
      }
    } else if sec == "interests" {
      if "interests" in data and data.interests.len() > 0 {
        section("Interests", render-interests(data))
      }
    } else if sec == "patents" {
      if "patents" in data and data.patents.len() > 0 {
        section("Patents & IP", {
          for (i, pat) in data.patents.enumerate() {
            if i > 0 { v(0.35em) }
            block(width: 100%, breakable: false, {
              entry-title(
                [#text(weight: "bold")[#pat.title]#if "number" in pat and pat.number != "" [ (#pat.number)]#if "issuer" in pat and pat.issuer != "" [ · #text(fill: t.muted)[#pat.issuer]]],
                if "date" in pat and pat.date != "" { pat.date } else { none }
              )
            })
          }
        })
      }
    } else if sec == "products" {
      if "products" in data and data.products.len() > 0 {
        section("Products Released", {
          for (i, prod) in data.products.enumerate() {
            if i > 0 { v(0.35em) }
            block(width: 100%, breakable: false, {
              entry-title(
                [#text(weight: "bold")[#prod.name]#if "role" in prod and prod.role != "" [ · #text(fill: t.muted)[#prod.role]]],
                if "dates" in prod and prod.dates != "" { prod.dates } else { none }
              )
              if "description" in prod and prod.description != "" {
                v(0.08em)
                text(size: 8.2pt)[#parse-bold(prod.description)]
              }
            })
          }
        })
      }
    } else if sec == "devopsContributions" {
      if "devopsContributions" in data and data.devopsContributions.len() > 0 {
        section("Infrastructure Contributions", {
          for (i, dev) in data.devopsContributions.enumerate() {
            if i > 0 { v(0.35em) }
            block(width: 100%, breakable: false, {
              text(weight: "bold", size: 8.8pt)[#dev.title]
              if "technology" in dev and dev.technology != "" [
                #text(size: 8.0pt, fill: t.muted)[ · #dev.technology]
              ]
              if "impact" in dev and dev.impact != "" [
                \ #text(size: 8.2pt)[#parse-bold(dev.impact)]
              ]
            })
          }
        })
      }
    } else if sec == "securityContributions" {
      if "securityContributions" in data and data.securityContributions.len() > 0 {
        section("Security Contributions", {
          for (i, sec-item) in data.securityContributions.enumerate() {
            if i > 0 { v(0.35em) }
            block(width: 100%, breakable: false, {
              text(weight: "bold", size: 8.8pt)[#sec-item.title]
              if "scope" in sec-item and sec-item.scope != "" [
                #text(size: 8.0pt, fill: t.muted)[ · #sec-item.scope]
              ]
              if "impact" in sec-item and sec-item.impact != "" [
                \ #text(size: 8.2pt)[#parse-bold(sec-item.impact)]
              ]
            })
          }
        })
      }
    } else if sec == "additionalInfo" {
      if "additionalInfo" in data and data.additionalInfo != none {
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
            block(width: 100%, breakable: false, {
              if type(ai) == dictionary {
                let rows = ()
                if "availability" in ai and ai.availability != "" { rows.push([*Availability:* #ai.availability]) }
                if "workAuthorization" in ai and ai.workAuthorization != "" { rows.push([*Work Auth:* #ai.workAuthorization]) }
                if "clearance" in ai and ai.clearance != "" { rows.push([*Clearance:* #ai.clearance]) }
                if "relocation" in ai and ai.relocation != "" { rows.push([*Relocation:* #ai.relocation]) }
                if "travel" in ai and ai.travel != "" { rows.push([*Travel:* #ai.travel]) }
                if "notes" in ai and ai.notes != "" { rows.push([*Notes:* #ai.notes]) }
                if rows.len() > 0 {
                  rows.join(linebreak() + v(0.10em))
                }
              } else if type(ai) == array {
                ai.map(item => parse-bold(str(item))).join(linebreak() + v(0.10em))
              }
            })
          })
        }
      }
    } else if sec == "customSections" {
      if "customSections" in data and data.customSections.len() > 0 {
        for cs in data.customSections {
          section(cs.title, {
            block(width: 100%, breakable: false, {
              list(..cs.items.map(parse-bold))
            })
          })
        }
      }
    }
  }
}

#let render = render-chikorita
