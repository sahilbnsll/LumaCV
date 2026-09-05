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
    columns: (1fr, auto),
    column-gutter: 1em,
    [
      #text(size: 20pt, weight: "bold", fill: t.name-fill)[#name]
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

  // =========================================================================
  // 🎯 SECTION 2: Professional Summary
  // =========================================================================
  if summary != "" {
    section("Summary", parse-bold(summary))
  }

  // =========================================================================
  // 🛠️ SECTION 3: Technical Skills
  // =========================================================================
  if skills != () and skills.len() > 0 {
    section("Skills", {
      render-skills-adaptive(t, skills, max-categories-for-grid: 0)
    })
  }

  // =========================================================================
  // 💼 SECTION 4: Work Experience
  // =========================================================================
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
            v(0.20em)
            list(..exp.bullets.map(parse-bold))
          },
        )
      }
    })
  }

  // =========================================================================
  // 🚀 SECTION 5: Projects
  // =========================================================================
  if projects != () and projects.len() > 0 {
    section("Projects", {
      for (i, proj) in projects.enumerate() {
        if i > 0 { v(0.50em) }
        block(
          width: 100%,
          breakable: false,
          {
            text(weight: "bold")[#proj.name]
            if "stack" in proj and proj.stack != "" {
              text(size: 7.6pt, fill: t.muted)[ · #proj.stack]
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

  // =========================================================================
  // 🎓 SECTION 6: Education
  // =========================================================================
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

  // =========================================================================
  // 🏆 SECTION 7: Certifications & Awards
  // =========================================================================
  if "certifications" in data and data.certifications.len() > 0 {
    section("Certifications", {
      for (i, cert) in data.certifications.enumerate() {
        block(
          above: if i == 0 { 0pt } else { 0.25em },
          below: 0pt,
          width: 100%,
          {
            text(weight: "bold")[#cert.name]
            if "issuer" in cert and cert.issuer != "" [#text(fill: t.muted)[ · #cert.issuer]]
            if "date" in cert and cert.date != "" [#h(1fr) #text(size: 7.6pt, fill: t.muted)[#cert.date]]
          },
        )
      }
    })
  }
}

#let render = render-compact
