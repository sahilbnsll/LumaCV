// ============================================================
// Template: Two-Column — Sidebar + Main Column Split
// ============================================================
// Design principles:
//  - 34% sidebar / 63% main column with 3% gutter
//  - Sidebar: links, skills, education, certifications
//  - Main: summary, experience, projects
//  - Teal accent, clean section dividers
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
    margin: (x: 1.25cm, y: 1.20cm),
    footer: render-footer(t, name),
  )

  set text(
    font: font-sans,
    size: 8.7pt,
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
    spacing: gap.bullet,
    indent: 0.80em,
    body-indent: 0.30em,
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
    if not first { v(1.15em) } else { v(0.25em) }
    block(above: 0pt, below: 0.18em, breakable: false, sticky: true, width: 100%, {
      set text(size: 8.4pt, weight: "bold", fill: t.accent, tracking: 0.12em)
      heading(level: 2, outlined: false, upper(title))
      v(0.12em)
      line(length: 100%, stroke: 0.5pt + t.rule)
    })
    v(0.35em)
    body
  }

  let main-section(title, body, first: false) = {
    if not first { v(1.20em) } else { v(0.25em) }
    block(above: 0pt, below: 0.18em, breakable: false, sticky: true, width: 100%, {
      set text(size: 8.8pt, weight: "bold", fill: t.accent, tracking: 0.12em)
      heading(level: 2, outlined: true, bookmarked: true, upper(title))
      v(0.12em)
      line(length: 100%, stroke: 0.6pt + t.rule)
    })
    v(0.35em)
    body
  }

  // =========================================================================
  // 📑 Two-Column Layout (31% Sidebar + 66% Main Column)
  // =========================================================================
  grid(
    columns: (31%, 66%),
    column-gutter: 3%,
    grid.vline(x: 1, stroke: 0.45pt + rgb("#e5e7eb")),

    // -----------------------------------------------------------------------
    // 👈 SIDEBAR: Links, Skills, Education, Certifications
    // -----------------------------------------------------------------------
    [
      #set text(hyphenate: false)
      #side-section("Links", first: true, {
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
      })

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
              {
                text(weight: "bold", size: 8pt)[#edu.degree]
                if "specialization" in edu and edu.specialization != "" {
                  linebreak()
                  text(size: 7.5pt, fill: t.muted)[#edu.specialization]
                }
                linebreak()
                text(size: 7.5pt)[#edu.institution]
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
              above: if i == 0 { 0pt } else { 0.35em },
              below: 0pt,
              width: 100%,
              {
                text(weight: "bold", size: 8pt)[#cert.name]
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
    ],

    // -----------------------------------------------------------------------
    // 👉 MAIN COLUMN: Summary, Work Experience, Projects
    // -----------------------------------------------------------------------
    [
      #if summary != "" {
        main-section("Summary", first: true, parse-bold(summary))
      }

      #if "experience" in data and data.experience.len() > 0 {
        main-section("Work Experience", first: summary == "", {
          for (i, exp) in data.experience.enumerate() {
            if i > 0 { v(0.80em) }
            block(
              width: 100%,
              breakable: false,
              {
                grid(
                  columns: (1fr, auto),
                  column-gutter: 0.6em,
                  align: (left + top, right + top),
                  text(size: 8.9pt, weight: "bold", fill: t.ink)[#exp.role],
                  text(size: 7.8pt, fill: t.muted)[#exp.dates],
                )
                v(0.04em)
                grid(
                  columns: (1fr, auto),
                  column-gutter: 0.6em,
                  align: (left + top, right + top),
                  text(size: 8.4pt, weight: "bold", fill: t.company-fill)[#exp.company],
                  if "location" in exp and exp.location != "" {
                    text(size: 7.5pt, fill: t.muted)[#exp.location]
                  } else { none },
                )
                v(0.20em)
                list(..exp.bullets.map(parse-bold))
              },
            )
          }
        })
      }

      #if projects != () and projects.len() > 0 {
        main-section("Projects", {
          for (i, proj) in projects.enumerate() {
            if i > 0 { v(0.55em) }
            block(
              width: 100%,
              breakable: false,
              {
                text(size: 8.5pt, weight: "bold")[#proj.name]
                if "stack" in proj and proj.stack != "" {
                  text(size: 7.5pt, fill: t.muted)[ · #proj.stack]
                }
                if "description" in proj {
                  v(0.16em)
                  parse-bold(proj.description)
                }
              },
            )
          }
        })
      }
    ],
  )
}
