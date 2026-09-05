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
    v(1.10em)
    block(above: 0pt, below: 0.14em, breakable: false, sticky: true, width: 100%, {
      align(center)[
        #set text(size: 8.5pt, weight: "bold", fill: t.accent, tracking: 0.20em)
        #heading(level: 2, outlined: true, bookmarked: true, upper(title))
      ]
      v(0.12em)
      line(length: 100%, stroke: 0.50pt + rgb("#d1d5db"))
    })
    v(0.30em)
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
      render-skills-adaptive(t, skills, max-categories-for-grid: 4)
    })
  }

  // =========================================================================
  // 💼 SECTION 4: Work Experience
  // =========================================================================
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
            v(0.18em)
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
      set list(spacing: 0.44em)
      list(
        ..projects.map(proj => [
          #text(weight: "bold", fill: t.ink)[#proj.name]#if "stack" in proj and proj.stack != "" [ #text(size: typo.meta-size, fill: t.muted)[(#proj.stack)]] — #if "description" in proj [#parse-bold(proj.description)]
        ])
      )
    })
  }

  // =========================================================================
  // 🎓 SECTION 6: Education
  // =========================================================================
  if "education" in data and data.education.len() > 0 {
    section("Education", {
      for (i, edu) in data.education.enumerate() {
        if i > 0 { v(0.50em) }
        block(
          width: 100%,
          breakable: false,
          {
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
              v(0.15em)
              text(size: typo.meta-size, fill: t.muted)[#details.join(text(fill: t.muted)[ · ])]
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
          above: if i == 0 { 0pt } else { gap.bullet },
          below: 0pt,
          width: 100%,
          {
            text(weight: "bold")[#cert.name]
            if "issuer" in cert and cert.issuer != "" [#text(fill: t.muted)[ · #cert.issuer]]
            if "date" in cert and cert.date != "" [#h(1fr) #text(size: typo.meta-size, fill: t.muted)[#cert.date]]
          },
        )
      }
    })
  }
}

#let render = render-modern
