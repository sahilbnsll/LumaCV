// ============================================================
// Template: Two-Column — Sidebar + Main Column Split
// ============================================================
// Design principles:
//  - 31% sidebar / 66% main column with 3% gutter
//  - Sidebar: links, skills, education, certifications, honors/awards, publications, languages, interests
//  - Main: summary, tech stack, experience, internships, projects, open source,
//          leadership, volunteering, conferences, custom sections
//  - Teal accent, clean section dividers, dark bold entry titles for contrast
//  - Icons in sidebar for visual hierarchy

#import "/lib/utils.typ": parse-bold, clean-link, resolve-variant-field
#import "/lib/icons.typ": icon-phone, icon-email, icon-linkedin, icon-github, icon-globe, icon-location
#import "/lib/theme.typ": font-sans, colors, typo, gap, pg, render-skills-stacked, render-footer

#let render-two-column(data, variant: "default", theme: "two-column") = {
  let t = if type(theme) == dictionary { theme } else if type(theme) == str { colors.at(theme, default: colors.at("two-column")) } else { colors.at("two-column") }

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
    margin: (x: 1.25cm, top: 0.95cm, bottom: 0.90cm),
    footer: render-footer(t, name),
  )

  set text(
    font: font-sans,
    size: 8.4pt,
    fill: t.ink,
    hyphenate: false,
    fallback: true,
  )

  set par(
    leading: 0.52em,
    spacing: 0.40em,
    justify: false,
    linebreaks: "optimized",
  )

  set list(
    tight: false,
    spacing: 0.28em,
    indent: 0.75em,
    body-indent: 0.28em,
    marker: (text(fill: t.marker)[•], text(fill: t.marker)[–]),
  )

  show link: set text(fill: t.link)
  show heading: it => it.body

  // =========================================================================
  // 👤 SECTION 1: Header (Left Name & Right Contact Stack)
  // =========================================================================
  grid(
    columns: (1fr, auto),
    column-gutter: 1em,
    [
      #text(size: 19pt, weight: "bold", tracking: 0.18em, fill: t.name-fill)[#upper(name)]
      #if headline != "" [
        #v(0.14em)
        #text(size: 8.8pt, weight: "medium", tracking: 0.05em, fill: t.headline-fill)[#headline]
      ]
    ],
    align(right + top)[
      #set text(size: 7.8pt, fill: t.ink)
      #{
        let c = data.personal.contact
        let items = ()

        if "email" in c and c.email != "" {
          items.push(icon-email(color: t.accent, size: 7.5pt) + h(0.12em) + link("mailto:" + c.email)[#c.email])
        }
        if "phone" in c and c.phone != "" {
          items.push(icon-phone(color: t.accent, size: 7.5pt) + h(0.12em) + link("tel:" + c.phone.replace(" ", ""))[#c.phone])
        }
        if "location" in c and c.location != "" {
          items.push(icon-location(color: t.accent, size: 7.5pt) + h(0.12em) + c.location)
        }

        items.join(linebreak() + v(0.08em))
      }
    ],
  )

  v(0.12em)
  line(length: 100%, stroke: 0.6pt + t.accent)
  v(0.20em)

  // =========================================================================
  // 📐 Section Header Helpers
  // =========================================================================
  let side-section(title, body, first: false) = {
    block(width: 100%, breakable: false, {
      if not first { v(0.65em) } else { v(0.12em) }
      block(above: 0pt, below: 0.12em, breakable: false, sticky: true, width: 100%, {
        set text(size: 8.3pt, weight: "bold", fill: t.accent, tracking: 0.12em)
        heading(level: 2, outlined: false, upper(title))
        v(0.10em)
        line(length: 100%, stroke: 0.5pt + t.rule)
      })
      v(0.20em)
      body
    })
  }

  let main-section(title, body, first: false) = {
    if not first { v(0.68em) } else { v(0.12em) }
    block(above: 0pt, below: 0.12em, breakable: false, sticky: true, width: 100%, {
      set text(size: 8.6pt, weight: "bold", fill: t.accent, tracking: 0.12em)
      heading(level: 2, outlined: true, bookmarked: true, upper(title))
      v(0.10em)
      line(length: 100%, stroke: 0.6pt + t.rule)
    })
    v(0.22em)
    body
  }

  // =========================================================================
  // 📑 Two-Column Layout (31% Sidebar + 69% Main Column)
  // =========================================================================
  grid(
    columns: (31%, 69%),
    column-gutter: 0pt,

    // -----------------------------------------------------------------------
    // 👈 SIDEBAR: Links, Skills, Education, Certifications, Honors, Publications, Languages, Interests
    // -----------------------------------------------------------------------
    block(width: 100%, inset: (right: 1.1em))[
      #set text(hyphenate: false)
      #side-section("Links", {
        let items = ()
        if "linkedin" in data.personal.contact and data.personal.contact.linkedin != "" {
          let li = clean-link(data.personal.contact.linkedin)
          items.push(icon-linkedin(color: t.accent, size: 7.5pt) + h(0.2em) + link("https://" + li)[#li])
        }
        if "github" in data.personal.contact and data.personal.contact.github != "" {
          let gh = clean-link(data.personal.contact.github)
          items.push(icon-github(color: t.accent, size: 7.5pt) + h(0.2em) + link("https://" + gh)[#gh])
        }
        if "website" in data.personal.contact and data.personal.contact.website != "" {
          let web = clean-link(data.personal.contact.website)
          items.push(icon-globe(color: t.accent, size: 7.5pt) + h(0.2em) + link("https://" + web)[#web])
        }
        items.join(linebreak() + v(0.14em))
      }, first: true)

      #if skills != () and skills.len() > 0 {
        side-section("Skills", {
          render-skills-stacked(t, skills)
        })
      }

      #if "education" in data and data.education.len() > 0 {
        side-section("Education", {
          for (i, edu) in data.education.enumerate() {
            block(
              above: if i == 0 { 0pt } else { 0.45em },
              below: 0pt,
              width: 100%,
              breakable: false,
              {
                text(weight: "bold", size: 8.2pt, fill: t.ink)[#edu.degree]
                if "specialization" in edu and edu.specialization != "" {
                  linebreak()
                  text(size: 7.5pt, fill: t.muted)[#edu.specialization]
                }
                linebreak()
                text(size: 7.8pt, fill: t.ink)[#edu.institution]
                linebreak()
                text(size: 7.5pt, fill: t.muted)[#edu.dates#if "gpa" in edu and edu.gpa != "" [ · #edu.gpa]]
              },
            )
          }
        })
      }

      #if "certifications" in data and data.certifications.len() > 0 {
        side-section("Certifications", {
          for (i, cert) in data.certifications.enumerate() {
            block(
              above: if i == 0 { 0pt } else { 0.38em },
              below: 0pt,
              width: 100%,
              breakable: false,
              {
                if "url" in cert and cert.url != "" {
                  link(cert.url)[#text(weight: "bold", size: 8.0pt, fill: t.ink)[#cert.name] #text(size: 6.8pt, fill: t.accent)[↗]]
                } else {
                  text(weight: "bold", size: 8.0pt, fill: t.ink)[#cert.name]
                }
                if "issuer" in cert and cert.issuer != "" {
                  linebreak()
                  text(size: 7.5pt, fill: t.muted)[#cert.issuer]
                }
                if "date" in cert and cert.date != "" {
                  text(size: 7.5pt, fill: t.muted)[ (#cert.date)]
                }
              },
            )
          }
        })
      }

      #{
        let achs = if "achievements" in data and data.achievements.len() > 0 {
          data.achievements
        } else if "awards" in data and data.awards.len() > 0 {
          data.awards
        } else { () }

        if achs.len() > 0 {
          side-section("Honors & Awards", {
            for (i, ach) in achs.enumerate() {
              block(
                above: if i == 0 { 0pt } else { 0.40em },
                below: 0pt,
                width: 100%,
                breakable: false,
                {
                  text(weight: "bold", size: 8.0pt, fill: t.ink)[#ach.title]
                  if "awarder" in ach and ach.awarder != "" {
                    linebreak()
                    text(size: 7.5pt, fill: t.muted)[#ach.awarder]
                  }
                  if "date" in ach and ach.date != "" {
                    text(size: 7.5pt, fill: t.muted)[ (#ach.date)]
                  }
                  if "description" in ach and ach.description != "" {
                    linebreak()
                    text(size: 7.4pt, fill: t.ink)[#parse-bold(ach.description)]
                  }
                },
              )
            }
          })
        }
      }

      #if "publications" in data and data.publications.len() > 0 {
        side-section("Publications", {
          for (i, pub) in data.publications.enumerate() {
            block(
              above: if i == 0 { 0pt } else { 0.40em },
              below: 0pt,
              width: 100%,
              breakable: false,
              {
                if "url" in pub and pub.url != "" {
                  link(pub.url)[#text(size: 8.0pt, weight: "bold", fill: t.ink)[#pub.title] #text(size: 6.8pt, fill: t.accent)[↗]]
                } else {
                  text(size: 8.0pt, weight: "bold", fill: t.ink)[#pub.title]
                }
                if "venue" in pub and pub.venue != "" {
                  linebreak()
                  text(size: 7.5pt, fill: t.muted)[#pub.venue]
                }
                if "date" in pub and pub.date != "" {
                  text(size: 7.5pt, fill: t.muted)[ (#pub.date)]
                }
                if "summary" in pub and pub.summary != "" {
                  linebreak()
                  text(size: 7.3pt, fill: t.ink)[#parse-bold(pub.summary)]
                }
              },
            )
          }
        })
      }

      #if "languages" in data and data.languages.len() > 0 {
        side-section("Languages", {
          let items = data.languages.map(l => text(weight: "medium", fill: t.ink)[#l.language] + if "proficiency" in l and l.proficiency != "" [ #text(fill: t.muted)[(#l.proficiency)]] else [])
          items.join(linebreak() + v(0.12em))
        })
      }

      #if "interests" in data and data.interests.len() > 0 {
        side-section("Interests", {
          let items = if type(data.interests) == array {
            data.interests.map(it => if type(it) == dictionary and "name" in it { it.name } else if type(it) == str { it } else { str(it) })
          } else { () }
          text(size: 7.6pt, fill: t.muted)[#items.join(" · ")]
        })
      }
    ],

    // -----------------------------------------------------------------------
    // 👉 MAIN COLUMN: Summary, Work Experience, Projects, etc.
    // -----------------------------------------------------------------------
    grid.cell(stroke: (left: 0.45pt + rgb("#e5e7eb")), inset: (left: 1.2em, y: 0pt))[
      #let main-default-order = (
        "summary",
        "techStackSummary",
        "experience",
        "internships",
        "projects",
        "openSource",
        "leadership",
        "volunteering",
        "conferences",
        "customSections",
      )
      #let main-order = ()
      #if "sectionOrder" in data and type(data.sectionOrder) == array {
        for raw-k in data.sectionOrder {
          let k = if raw-k == "speaking" { "conferences" } else { raw-k }
          if main-default-order.contains(k) and not main-order.contains(k) { main-order.push(k) }
        }
      }
      #for k in main-default-order {
        if not main-order.contains(k) { main-order.push(k) }
      }

      #let rendered-any = false
      #for sec in main-order {
        if sec == "summary" and summary != "" {
          main-section("Summary", parse-bold(summary), first: not rendered-any)
          rendered-any = true
        } else if sec == "techStackSummary" and "techStackSummary" in data and data.techStackSummary != "" {
          main-section("Tech Stack", parse-bold(data.techStackSummary), first: not rendered-any)
          rendered-any = true
        } else if sec == "experience" and "experience" in data and data.experience.len() > 0 {
          main-section("Work Experience", {
            for (i, exp) in data.experience.enumerate() {
              if i > 0 { v(0.50em) }
              block(
                width: 100%,
                breakable: false,
                {
                  grid(
                    columns: (1fr, auto),
                    column-gutter: 0.6em,
                    align: (left + top, right + top),
                    text(size: 8.8pt, weight: "bold", fill: t.ink)[#exp.role],
                    text(size: 7.8pt, fill: t.muted)[#exp.dates],
                  )
                  v(0.04em)
                  grid(
                    columns: (1fr, auto),
                    column-gutter: 0.6em,
                    align: (left + top, right + top),
                    text(size: 8.3pt, weight: "bold", fill: t.company-fill)[#exp.company],
                    if "location" in exp and exp.location != "" {
                      text(size: 7.5pt, fill: t.muted)[#exp.location]
                    } else { none },
                  )
                  let expBullets = ()
                  if "highlights" in exp and exp.highlights.len() > 0 { expBullets += exp.highlights }
                  if "impactBullets" in exp and exp.impactBullets.len() > 0 { expBullets += exp.impactBullets }
                  if "bullets" in exp and exp.bullets.len() > 0 { expBullets += exp.bullets }
                  if expBullets.len() > 0 {
                    v(0.10em)
                    list(..expBullets.map(parse-bold))
                  }
                },
              )
            }
          }, first: not rendered-any)
          rendered-any = true
        } else if sec == "internships" and "internships" in data and data.internships.len() > 0 {
          main-section("Internships", {
            for (i, exp) in data.internships.enumerate() {
              if i > 0 { v(0.50em) }
              block(
                width: 100%,
                breakable: false,
                {
                  grid(
                    columns: (1fr, auto),
                    column-gutter: 0.6em,
                    align: (left + top, right + top),
                    text(size: 8.8pt, weight: "bold", fill: t.ink)[#exp.role],
                    text(size: 7.8pt, fill: t.muted)[#exp.dates],
                  )
                  v(0.04em)
                  grid(
                    columns: (1fr, auto),
                    column-gutter: 0.6em,
                    align: (left + top, right + top),
                    text(size: 8.3pt, weight: "bold", fill: t.company-fill)[#exp.company],
                    if "location" in exp and exp.location != "" {
                      text(size: 7.5pt, fill: t.muted)[#exp.location]
                    } else { none },
                  )
                  let internBullets = ()
                  if "highlights" in exp and exp.highlights.len() > 0 { internBullets += exp.highlights }
                  if "impactBullets" in exp and exp.impactBullets.len() > 0 { internBullets += exp.impactBullets }
                  if "bullets" in exp and exp.bullets.len() > 0 { internBullets += exp.bullets }
                  if internBullets.len() > 0 {
                    v(0.10em)
                    list(..internBullets.map(parse-bold))
                  }
                },
              )
            }
          }, first: not rendered-any)
          rendered-any = true
        } else if sec == "projects" and projects != () and projects.len() > 0 {
          main-section("Projects", {
            for (i, proj) in projects.enumerate() {
              if i > 0 { v(0.42em) }
              block(
                width: 100%,
                breakable: false,
                {
                  grid(
                    columns: (1fr, auto),
                    column-gutter: 0.5em,
                    align: (left + top, right + top),
                    {
                      if "url" in proj and proj.url != "" {
                        link(proj.url)[#text(size: 8.5pt, weight: "bold", fill: t.ink)[#proj.name] #text(size: 7.2pt, fill: t.accent)[↗]]
                      } else {
                        text(size: 8.5pt, weight: "bold", fill: t.ink)[#proj.name]
                      }
                      if "role" in proj and proj.role != "" {
                        text(size: 7.5pt, fill: t.accent)[ · #proj.role]
                      }
                      if "stack" in proj and proj.stack != "" {
                        text(size: 7.5pt, fill: t.muted)[ · #proj.stack]
                      }
                    },
                    if "dates" in proj and proj.dates != "" {
                      text(size: 7.5pt, fill: t.muted)[#proj.dates]
                    } else { none }
                  )
                  if "description" in proj and proj.description != "" {
                    v(0.10em)
                    text(size: 7.8pt, fill: t.ink)[#parse-bold(proj.description)]
                  }
                  let allBullets = ()
                  if "highlights" in proj and proj.highlights.len() > 0 { allBullets += proj.highlights }
                  if "impactBullets" in proj and proj.impactBullets.len() > 0 { allBullets += proj.impactBullets }
                  if "bullets" in proj and proj.bullets.len() > 0 { allBullets += proj.bullets }
                  if allBullets.len() > 0 {
                    v(0.10em)
                    list(..allBullets.map(parse-bold))
                  }
                },
              )
            }
          }, first: not rendered-any)
          rendered-any = true
        } else if sec == "openSource" and "openSource" in data and data.openSource.len() > 0 {
          main-section("Open Source", {
            for (i, os) in data.openSource.enumerate() {
              if i > 0 { v(0.48em) }
              block(width: 100%, breakable: false, {
                grid(
                  columns: (1fr, auto),
                  column-gutter: 0.5em,
                  align: (left + top, right + top),
                  {
                    if "url" in os and os.url != "" {
                      link(os.url)[#text(size: 8.5pt, weight: "bold", fill: t.ink)[#os.project] #text(size: 7.0pt, fill: t.accent)[↗]]
                    } else {
                      text(size: 8.5pt, weight: "bold", fill: t.ink)[#os.project]
                    }
                    if "role" in os and os.role != "" {
                      text(size: 7.8pt, fill: t.muted)[ · #os.role]
                    } else if "contribution" in os and os.contribution != "" {
                      text(size: 7.8pt, fill: t.muted)[ · #os.contribution]
                    }
                  },
                  if "dates" in os and os.dates != "" {
                    text(size: 7.5pt, fill: t.muted)[#os.dates]
                  } else { none }
                )
                if "description" in os and os.description != "" {
                  v(0.08em)
                  text(size: 7.8pt, fill: t.ink)[#parse-bold(os.description)]
                }
                if "bullets" in os and os.bullets.len() > 0 {
                  v(0.08em)
                  list(..os.bullets.map(parse-bold))
                }
              })
            }
          }, first: not rendered-any)
          rendered-any = true
        } else if sec == "leadership" and "leadership" in data and data.leadership.len() > 0 {
          main-section("Leadership & Activities", {
            for (i, item) in data.leadership.enumerate() {
              if i > 0 { v(0.48em) }
              block(width: 100%, breakable: false, {
                grid(
                  columns: (1fr, auto),
                  column-gutter: 0.5em,
                  align: (left + top, right + top),
                  text(size: 8.5pt, weight: "bold", fill: t.ink)[#item.role#if "organization" in item and item.organization != "" [ · #text(fill: t.muted)[#item.organization]]],
                  if "dates" in item and item.dates != "" {
                    text(size: 7.5pt, fill: t.muted)[#item.dates]
                  } else { none }
                )
                let lbullets = ()
                if "highlights" in item and item.highlights.len() > 0 { lbullets += item.highlights }
                if "bullets" in item and item.bullets.len() > 0 { lbullets += item.bullets }
                if lbullets.len() > 0 {
                  v(0.08em)
                  list(..lbullets.map(parse-bold))
                }
              })
            }
          }, first: not rendered-any)
          rendered-any = true
        } else if sec == "volunteering" and "volunteering" in data and data.volunteering.len() > 0 {
          main-section("Volunteering", {
            for (i, item) in data.volunteering.enumerate() {
              if i > 0 { v(0.48em) }
              block(width: 100%, breakable: false, {
                grid(
                  columns: (1fr, auto),
                  column-gutter: 0.5em,
                  align: (left + top, right + top),
                  text(size: 8.5pt, weight: "bold", fill: t.ink)[#item.role#if "organization" in item and item.organization != "" [ · #text(fill: t.muted)[#item.organization]]],
                  if "dates" in item and item.dates != "" {
                    text(size: 7.5pt, fill: t.muted)[#item.dates]
                  } else { none }
                )
                let vbullets = ()
                if "highlights" in item and item.highlights.len() > 0 { vbullets += item.highlights }
                if "bullets" in item and item.bullets.len() > 0 { vbullets += item.bullets }
                if vbullets.len() > 0 {
                  v(0.08em)
                  list(..vbullets.map(parse-bold))
                }
              })
            }
          }, first: not rendered-any)
          rendered-any = true
        } else if (sec == "conferences" or sec == "speaking") and (("conferences" in data and data.conferences.len() > 0) or ("speaking" in data and data.speaking.len() > 0)) {
          let items = if "conferences" in data and data.conferences.len() > 0 { data.conferences } else { data.speaking }
          main-section("Conferences & Speaking", {
            for (i, item) in items.enumerate() {
              if i > 0 { v(0.40em) }
              block(width: 100%, breakable: false, {
                grid(
                  columns: (1fr, auto),
                  column-gutter: 0.5em,
                  align: (left + top, right + top),
                  text(size: 8.5pt, weight: "bold", fill: t.ink)[#if "title" in item { item.title } else if "name" in item { item.name } else { "" }#if "event" in item and item.event != "" [ · #text(fill: t.muted)[#item.event]] else if "conference" in item and item.conference != "" [ · #text(fill: t.muted)[#item.conference]]],
                  if "date" in item and item.date != "" {
                    text(size: 7.5pt, fill: t.muted)[#item.date]
                  } else { none }
                )
                if "description" in item and item.description != "" {
                  v(0.06em)
                  text(size: 7.8pt, fill: t.ink)[#parse-bold(item.description)]
                }
              })
            }
          }, first: not rendered-any)
          rendered-any = true
        } else if sec == "customSections" and "customSections" in data and data.customSections.len() > 0 {
          for cs in data.customSections {
            main-section(cs.title, {
              list(..cs.items.map(parse-bold))
            }, first: not rendered-any)
            rendered-any = true
          }
        }
      }
    ],
  )
}

#let render = render-two-column
