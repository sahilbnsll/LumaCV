// ============================================================
// Template: Glalie (Lateral)
// ============================================================
// Design principles:
//  - Asymmetric two-column executive layout (31% sidebar, 66% main)
//  - Sidebar: Contact info, skills, education, certifications, honors/awards, publications, languages, interests, additional info
//  - Main column: Summary, tech stack, key metrics, work experience, internships, projects, open source, leadership, volunteering, conferences, patents, products, devops, security, custom sections
//  - Clean visual divider and high information density
//  - Multi-page balanced sidebar flow

#import "/lib/utils.typ": parse-bold, clean-link, resolve-variant-field
#import "/lib/icons.typ": icon-phone, icon-email, icon-linkedin, icon-github, icon-globe, icon-location
#import "/lib/theme.typ": font-sans, colors, typo, gap, pg, render-skills-stacked, render-footer
#import "/support/resume-core.typ": render-publications, render-leadership, render-volunteering, render-conferences, render-interests

#let render-glalie(data, variant: "default", theme: "glalie") = {
  let t = if type(theme) == dictionary { theme } else if type(theme) == str { colors.at(theme, default: colors.glalie) } else { colors.glalie }

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
    margin: (x: 1.35cm, top: 1.30cm, bottom: 1.45cm),
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
  // Header spanning top
  // -------------------------------------------------------------------------
  grid(
    columns: (1fr, auto),
    align: (left + bottom, right + bottom),
    [
      #text(size: 21pt, weight: "bold", fill: t.name-fill)[#name]
      #if headline != "" [
        #v(0.16em)
        #text(size: 9.6pt, weight: "medium", fill: t.headline-fill)[#headline]
      ]
    ],
    [
      #if "location" in data.personal.contact and data.personal.contact.location != "" [
        #text(size: 8.2pt, fill: t.muted)[#icon-location(color: t.accent, size: 7.5pt) #data.personal.contact.location]
      ]
    ]
  )

  v(0.35em)
  line(length: 100%, stroke: 1.4pt + t.accent)
  v(0.45em)

  // -------------------------------------------------------------------------
  // Section Titles
  // -------------------------------------------------------------------------
  let main-section(title, body, first: false) = {
    if not first { v(1.25em) }
    block(width: 100%, breakable: false)[
      #stack(
        spacing: 0.35em,
        text(size: 9.2pt, weight: "bold", fill: t.accent, tracking: 0.08em)[#upper(title)],
        line(length: 100%, stroke: 0.5pt + t.rule)
      )
      #v(0.48em)
      #body
    ]
  }

  let side-section(title, body, first: false) = {
    if not first { v(1.20em) }
    block(width: 100%, breakable: false)[
      #stack(
        spacing: 0.32em,
        text(size: 8.6pt, weight: "bold", fill: t.accent, tracking: 0.09em)[#upper(title)],
        line(length: 100%, stroke: 0.5pt + t.rule)
      )
      #v(0.44em)
      #body
    ]
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
  // Reusable Sidebar Renderers
  // -------------------------------------------------------------------------
  let render-sidebar-contact(first: true) = {
    side-section("Contact", {
      let c = data.personal.contact
      let items = ()
      if "email" in c and c.email != "" {
        items.push(icon-email(color: t.accent, size: 7.2pt) + h(0.24em) + link("mailto:" + c.email)[#c.email])
      }
      if "phone" in c and c.phone != "" {
        items.push(icon-phone(color: t.accent, size: 7.2pt) + h(0.24em) + link("tel:" + c.phone.replace(" ", ""))[#c.phone])
      }
      if "website" in c and c.website != "" {
        let web = clean-link(c.website)
        items.push(icon-globe(color: t.accent, size: 7.2pt) + h(0.24em) + link("https://" + web)[#web])
      }
      if "linkedin" in c and c.linkedin != "" {
        let li = clean-link(c.linkedin)
        items.push(icon-linkedin(color: t.accent, size: 7.2pt) + h(0.24em) + link("https://" + li)[#li])
      }
      if "github" in c and c.github != "" {
        let gh = clean-link(c.github)
        items.push(icon-github(color: t.accent, size: 7.2pt) + h(0.24em) + link("https://" + gh)[#gh])
      }
      items.join(linebreak() + v(0.22em))
    }, first: first)
  }

  let render-sidebar-skills(first: false) = {
    if skills != () and skills.len() > 0 {
      side-section("Skills", {
        render-skills-stacked(t, skills)
      }, first: first)
    }
  }

  let render-sidebar-education(first: false) = {
    if "education" in data and data.education.len() > 0 {
      side-section("Education", {
        for (i, edu) in data.education.enumerate() {
          if i > 0 { v(0.50em) }
          block(width: 100%, breakable: false, {
            text(weight: "bold", size: 8.4pt, fill: t.ink)[#edu.degree]
            if "specialization" in edu and edu.specialization != "" [
              #linebreak()
              #text(size: 7.8pt, fill: t.muted)[#edu.specialization]
            ]
            linebreak()
            text(size: 8.0pt, fill: t.company-fill)[#edu.institution]
            linebreak()
            text(size: 7.6pt, fill: t.muted)[#edu.dates]
            if "gpa" in edu and edu.gpa != "" [
              #linebreak()
              #text(size: 7.6pt, weight: "bold", fill: t.accent)[GPA: #edu.gpa]
            ]
            if "highlights" in edu and edu.highlights.len() > 0 [
              #v(0.22em)
              #list(..edu.highlights.map(parse-bold))
            ]
          })
        }
      }, first: first)
    }
  }

  let render-sidebar-certifications(first: false) = {
    if "certifications" in data and data.certifications.len() > 0 {
      side-section("Certifications", {
        for (i, cert) in data.certifications.enumerate() {
          if i > 0 { v(0.40em) }
          block(width: 100%, breakable: false, {
            if "url" in cert and cert.url != "" {
              link(cert.url)[#text(weight: "bold", size: 8.2pt)[#cert.name] #text(size: 6.8pt)[↗]]
            } else {
              text(weight: "bold", size: 8.2pt)[#cert.name]
            }
            if "issuer" in cert and cert.issuer != "" [
              #linebreak()
              #text(size: 7.8pt, fill: t.muted)[#cert.issuer]
            ]
            if "date" in cert and cert.date != "" [
              #linebreak()
              #text(size: 7.5pt, fill: t.muted)[#cert.date]
            ]
          })
        }
      }, first: first)
    }
  }

  let render-sidebar-honors(first: false) = {
    let achs = if "achievements" in data and data.achievements.len() > 0 {
      data.achievements
    } else if "awards" in data and data.awards.len() > 0 {
      data.awards
    } else { () }

    if achs.len() > 0 {
      side-section("Honors & Awards", {
        for (i, a) in achs.enumerate() {
          if i > 0 { v(0.40em) }
          block(width: 100%, breakable: false, {
            let aTitle = if "title" in a and a.title != "" { a.title } else if "name" in a { a.name } else { "" }
            text(weight: "bold", size: 8.2pt)[#aTitle]
            if "awarder" in a and a.awarder != "" [
              #linebreak()
              #text(size: 7.6pt, fill: t.muted)[#a.awarder]
            ]
            if "date" in a and a.date != "" [
              #text(size: 7.5pt, fill: t.muted)[ (#a.date)]
            ]
            if "summary" in a and a.summary != "" [
              #linebreak()
              #text(size: 7.5pt, fill: t.muted)[#parse-bold(a.summary)]
            ]
          })
        }
      }, first: first)
    }
  }

  let render-sidebar-publications(first: false) = {
    if "publications" in data and data.publications.len() > 0 {
      side-section("Publications", {
        for (i, pub) in data.publications.enumerate() {
          if i > 0 { v(0.40em) }
          block(width: 100%, breakable: false, {
            if "url" in pub and pub.url != "" {
              link(pub.url)[#text(weight: "bold", size: 8.2pt)[#pub.title] #text(size: 6.8pt)[↗]]
            } else {
              text(weight: "bold", size: 8.2pt)[#pub.title]
            }
            if "venue" in pub and pub.venue != "" [
              #linebreak()
              #text(size: 7.8pt, fill: t.muted)[#pub.venue]
            ]
            if "date" in pub and pub.date != "" [
              #linebreak()
              #text(size: 7.5pt, fill: t.muted)[#pub.date]
            ]
          })
        }
      }, first: first)
    }
  }

  let render-sidebar-languages(first: false) = {
    if "languages" in data and data.languages.len() > 0 {
      side-section("Languages", {
        let items = data.languages.map(l => l.language + if "proficiency" in l and l.proficiency != "" [ (#l.proficiency)] else [])
        text(size: 8.0pt)[#items.join(linebreak() + v(0.18em))]
      }, first: first)
    }
  }

  let render-sidebar-interests(first: false) = {
    if "interests" in data and data.interests.len() > 0 {
      side-section("Interests", render-interests(data), first: first)
    }
  }

  let render-sidebar-additional(first: false) = {
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
        side-section("Additional Info", {
          if type(ai) == dictionary {
            let rows = ()
            if "availability" in ai and ai.availability != "" { rows.push([*Availability:* #ai.availability]) }
            if "workAuthorization" in ai and ai.workAuthorization != "" { rows.push([*Work Auth:* #ai.workAuthorization]) }
            if "clearance" in ai and ai.clearance != "" { rows.push([*Clearance:* #ai.clearance]) }
            if "relocation" in ai and ai.relocation != "" { rows.push([*Relocation:* #ai.relocation]) }
            if "travel" in ai and ai.travel != "" { rows.push([*Travel:* #ai.travel]) }
            if "notes" in ai and ai.notes != "" { rows.push([*Notes:* #ai.notes]) }
            rows.join(linebreak() + v(0.16em))
          } else if type(ai) == array {
            ai.map(item => parse-bold(str(item))).join(linebreak() + v(0.16em))
          }
        }, first: first)
      }
    }
  }

  // -------------------------------------------------------------------------
  // Reusable Main Column Renderers
  // -------------------------------------------------------------------------
  let render-main-summary(first: true) = {
    if summary != "" {
      main-section("Professional Summary", {
        parse-bold(summary)
      }, first: first)
    }
  }

  let render-main-tech-stack(first: false) = {
    if "techStackSummary" in data and data.techStackSummary != "" {
      main-section("Tech Stack", [
        #rect(
          width: 100%,
          fill: rgb("#f8fafc"),
          stroke: 0.5pt + t.rule,
          inset: (x: 0.7em, y: 0.45em),
          radius: 2pt
        )[
          #set text(size: 8.5pt)
          #text(weight: "bold", fill: t.accent)[Core Disciplines:] #parse-bold(data.techStackSummary)
        ]
      ], first: first)
    }
  }

  let render-main-key-metrics(first: false) = {
    if "keyMetrics" in data and data.keyMetrics.len() > 0 {
      main-section("Key Metrics", {
        let cols = calc.min(data.keyMetrics.len(), 4)
        grid(
          columns: range(cols).map(_ => 1fr),
          gutter: 0.55em,
          ..data.keyMetrics.map(m => block(
            width: 100%,
            fill: rgb("#f0f9ff"),
            stroke: 0.5pt + rgb("#bae6fd"),
            inset: (x: 0.6em, y: 0.48em),
            radius: 2.5pt,
            align(center)[
              #text(size: 10.5pt, weight: "bold", fill: t.company-fill)[#m.value] \
              #v(0.08em)
              #text(size: 7.6pt, weight: "bold", fill: t.ink)[#m.label]
              #if "context" in m and m.context != "" [
                \ #v(0.06em)
                #text(size: 7.0pt, fill: t.muted)[#m.context]
              ]
            ]
          ))
        )
      }, first: first)
    }
  }

  let render-main-experience(first: false) = {
    if "experience" in data and data.experience.len() > 0 {
      main-section("Work Experience", {
        for (i, exp) in data.experience.enumerate() {
          if i > 0 { v(0.60em) }
          block(width: 100%, breakable: false, {
            entry-title(
              [#text(weight: "bold", size: 9.0pt, fill: t.ink)[#exp.role] #text(size: 8.6pt, fill: t.company-fill)[· #exp.company]#if "location" in exp and exp.location != "" [#text(size: 8.0pt, fill: t.muted)[ · #exp.location]]],
              exp.dates
            )
            if "summary" in exp and exp.summary != "" {
              v(0.08em)
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
      }, first: first)
    }
  }

  let render-main-internships(first: false) = {
    if "internships" in data and data.internships.len() > 0 {
      main-section("Internships", {
        for (i, exp) in data.internships.enumerate() {
          if i > 0 { v(0.60em) }
          block(width: 100%, breakable: false, {
            entry-title(
              [#text(weight: "bold", size: 9.0pt, fill: t.ink)[#exp.role] #text(size: 8.6pt, fill: t.company-fill)[· #exp.company]],
              exp.dates
            )
            if "summary" in exp and exp.summary != "" {
              v(0.08em)
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
      }, first: first)
    }
  }

  let render-main-projects(first: false) = {
    if projects != () and projects.len() > 0 {
      main-section("Key Projects", {
        for (i, proj) in projects.enumerate() {
          if i > 0 { v(0.55em) }
          block(width: 100%, breakable: false, fill: rgb("#f8fafc"), stroke: 0.5pt + t.rule, inset: (x: 0.75em, y: 0.52em), radius: 2.5pt, {
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
              },
              if "dates" in proj and proj.dates != "" { proj.dates } else { none }
            )
            if "stack" in proj and proj.stack != "" {
              v(0.08em)
              text(size: 7.6pt, fill: t.muted)[#text(weight: "bold", fill: t.accent)[Stack:] #proj.stack]
            }
            if "description" in proj and proj.description != "" {
              v(0.08em)
              text(size: 8.3pt)[#parse-bold(proj.description)]
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
      }, first: first)
    }
  }

  let render-main-open-source(first: false) = {
    if "openSource" in data and data.openSource.len() > 0 {
      main-section("Open Source", {
        for (i, os) in data.openSource.enumerate() {
          if i > 0 { v(0.35em) }
          block(width: 100%, breakable: false)[
            #let proj-name = if "url" in os and os.url != "" {
              link(os.url)[#text(weight: "bold")[#os.project] #text(size: 7.0pt)[↗]]
            } else {
              text(weight: "bold")[#os.project]
            }
            #entry-title(
              [#proj-name#if "contribution" in os and os.contribution != "" [ — #text(size: 8.0pt)[#os.contribution]]],
              if "dates" in os { os.dates } else { none }
            )
          ]
        }
      }, first: first)
    }
  }

  let render-main-leadership(first: false) = {
    if "leadership" in data and data.leadership.len() > 0 {
      main-section("Leadership", render-leadership(data, t.accent), first: first)
    }
  }

  let render-main-volunteering(first: false) = {
    if "volunteering" in data and data.volunteering.len() > 0 {
      main-section("Volunteering", render-volunteering(data, t.accent), first: first)
    }
  }

  let render-main-conferences(first: false) = {
    if "conferences" in data and data.conferences.len() > 0 {
      main-section("Conferences & Speaking", render-conferences(data, accent: t.accent), first: first)
    }
  }

  let render-main-patents(first: false) = {
    if "patents" in data and data.patents.len() > 0 {
      main-section("Patents & IP", {
        for pat in data.patents {
          block(width: 100%, breakable: false)[
            #entry-title(
              [#text(weight: "bold")[#pat.title]#if "number" in pat and pat.number != "" [ (#pat.number)]#if "issuer" in pat and pat.issuer != "" [ · #text(fill: t.muted)[#pat.issuer]]],
              if "date" in pat and pat.date != "" { pat.date } else { none }
            )
          ]
        }
      }, first: first)
    }
  }

  let render-main-products(first: false) = {
    if "products" in data and data.products.len() > 0 {
      main-section("Products Released", {
        for prod in data.products {
          block(width: 100%, breakable: false)[
            #entry-title(
              [#text(weight: "bold")[#prod.name]#if "role" in prod and prod.role != "" [ · #text(fill: t.muted)[#prod.role]]],
              if "dates" in prod and prod.dates != "" { prod.dates } else { none }
            )
            #if "description" in prod and prod.description != "" [
              #v(0.08em)
              #text(size: 8.2pt)[#parse-bold(prod.description)]
            ]
          ]
        }
      }, first: first)
    }
  }

  let render-main-devops(first: false) = {
    if "devopsContributions" in data and data.devopsContributions.len() > 0 {
      main-section("Infrastructure Contributions", {
        for dev in data.devopsContributions {
          block(width: 100%, breakable: false)[
            #text(weight: "bold", size: 8.8pt)[#dev.title]
            #if "technology" in dev and dev.technology != "" [
              #text(size: 8pt, fill: t.muted)[ · #dev.technology]
            ]
            #if "impact" in dev and dev.impact != "" [
              \ #text(size: 8.2pt)[#parse-bold(dev.impact)]
            ]
          ]
        }
      }, first: first)
    }
  }

  let render-main-security(first: false) = {
    if "securityContributions" in data and data.securityContributions.len() > 0 {
      main-section("Security Contributions", {
        for sec-item in data.securityContributions {
          block(width: 100%, breakable: false)[
            #text(weight: "bold", size: 8.8pt)[#sec-item.title]
            #if "scope" in sec-item and sec-item.scope != "" [
              #text(size: 8pt, fill: t.muted)[ · #sec-item.scope]
            ]
            #if "impact" in sec-item and sec-item.impact != "" [
              \ #text(size: 8.2pt)[#parse-bold(sec-item.impact)]
            ]
          ]
        }
      }, first: first)
    }
  }

  let render-main-custom(first: false) = {
    if "customSections" in data and data.customSections.len() > 0 {
      for cs in data.customSections {
        main-section(cs.title, {
          list(..cs.items.map(parse-bold))
        }, first: first)
      }
    }
  }

  // -------------------------------------------------------------------------
  // Page 1: Sidebar (Contact, Skills, Education) + Main (Summary, Stack, Metrics, Exp, Internships)
  // -------------------------------------------------------------------------
  grid(
    columns: (31%, 66%),
    column-gutter: 3%,
    grid.vline(x: 1, stroke: 0.45pt + t.rule),

    [
      #set text(size: 8.2pt)
      #render-sidebar-contact(first: true)
      #render-sidebar-skills(first: false)
      #render-sidebar-education(first: false)
    ],

    [
      #render-main-summary(first: true)
      #render-main-tech-stack(first: false)
      #render-main-key-metrics(first: false)
      #render-main-experience(first: false)
      #render-main-internships(first: false)
    ]
  )

  // -------------------------------------------------------------------------
  // Page 2: Sidebar (Certs, Awards, Pubs, Languages, Interests, Additional) + Main (Projects, OS, Leadership, ...)
  // -------------------------------------------------------------------------
  let has-page2 = (projects != () and projects.len() > 0) or ("openSource" in data and data.openSource.len() > 0) or ("leadership" in data and data.leadership.len() > 0) or ("volunteering" in data and data.volunteering.len() > 0) or ("conferences" in data and data.conferences.len() > 0) or ("certifications" in data and data.certifications.len() > 0) or ("achievements" in data and data.achievements.len() > 0) or ("awards" in data and data.awards.len() > 0) or ("publications" in data and data.publications.len() > 0) or ("languages" in data and data.languages.len() > 0) or ("interests" in data and data.interests.len() > 0) or ("patents" in data and data.patents.len() > 0) or ("products" in data and data.products.len() > 0) or ("devopsContributions" in data and data.devopsContributions.len() > 0) or ("securityContributions" in data and data.securityContributions.len() > 0) or ("customSections" in data and data.customSections.len() > 0)

  if has-page2 {
    pagebreak()

    grid(
      columns: (31%, 66%),
      column-gutter: 3%,
      grid.vline(x: 1, stroke: 0.45pt + t.rule),

      [
        #set text(size: 8.2pt)
        #render-sidebar-certifications(first: true)
        #render-sidebar-honors(first: false)
        #render-sidebar-publications(first: false)
        #render-sidebar-languages(first: false)
        #render-sidebar-interests(first: false)
        #render-sidebar-additional(first: false)
      ],

      [
        #render-main-projects(first: true)
        #render-main-open-source(first: false)
        #render-main-leadership(first: false)
        #render-main-volunteering(first: false)
        #render-main-conferences(first: false)
        #render-main-patents(first: false)
        #render-main-products(first: false)
        #render-main-devops(first: false)
        #render-main-security(first: false)
        #render-main-custom(first: false)
      ]
    )
  }
}

#let render = render-glalie

