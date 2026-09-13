#import "/lib/utils.typ": parse-bold, clean-link, resolve-variant-field

#let render-terminal(data, variant: "default", theme: "terminal") = {
  let name = data.personal.name
  let headline = resolve-variant-field(data.personal.headline, variant, fallback: "")
  let summary = resolve-variant-field(data.summary, variant, fallback: "")
  let skills = resolve-variant-field(data.skills, variant, fallback: ())
  let projects = resolve-variant-field(data.projects, variant, fallback: ())
  let contact = data.personal.contact

  let ink = rgb("#1a2420")
  let muted = rgb("#526359")
  let accent = rgb("#1e7e4e")
  let soft = rgb("#edf7f0")
  let stroke-line = rgb("#cfe4d7")
  let white = rgb("#ffffff")

  set document(title: name + " — Resume", author: name, date: none)
  set page(
    paper: "a4",
    margin: (x: 1.25cm, y: 1.25cm),
    footer: context {
      let page-num = counter(page).get().first()
      let total-pages = counter(page).final().first()
      if total-pages > 1 {
        set text(font: "DejaVu Sans Mono", size: 7.4pt, fill: muted)
        grid(
          columns: (1fr, 1fr),
          align: (left, right),
          [#name — Resume],
          [Page #page-num of #total-pages],
        )
      }
    },
  )
  set text(font: "DejaVu Sans Mono", size: 8.8pt, fill: ink, hyphenate: false, fallback: true)
  set par(leading: 0.62em, spacing: 0.52em, justify: false, linebreaks: "optimized")
  set list(indent: 1.05em, body-indent: 0.42em, spacing: 0.44em, marker: (text(fill: accent)[•], text(fill: accent)[–]))
  show link: set text(fill: accent)
  show heading: it => it.body

  let contact-text = {
    let items = ()
    if "location" in contact and contact.location != "" { items.push(contact.location) }
    if "email" in contact and contact.email != "" { items.push(link("mailto:" + contact.email)[#contact.email]) }
    if "phone" in contact and contact.phone != "" { items.push(link("tel:" + contact.phone.replace(" ", ""))[#contact.phone]) }
    if "linkedin" in contact and contact.linkedin != "" { items.push(link("https://" + clean-link(contact.linkedin))[#clean-link(contact.linkedin)]) }
    if "github" in contact and contact.github != "" { items.push(link("https://" + clean-link(contact.github))[#clean-link(contact.github)]) }
    if "website" in contact and contact.website != "" { items.push(link("https://" + clean-link(contact.website))[#clean-link(contact.website)]) }
    items.join(text(fill: muted)[ · ])
  }

  let skill-lines = {
    for item in skills {
      let skillList = if "skills" in item {
        item.skills
      } else if "items" in item {
        if type(item.items) == array { item.items } else { str(item.items).split(",").map(s => s.trim()) }
      } else { () }
      grid(
        columns: (1.20fr, 1fr),
        column-gutter: 1.0em,
        text(weight: "bold", fill: accent)[#item.category],
        text(fill: muted)[#skillList.join(", ")],
      )
      v(0.34em)
    }
  }

  let section(title, body, breakable: true) = {
    v(1.25em)
    block(width: 100%, breakable: breakable, [
      #block(above: 0pt, below: 0.28em, breakable: false, sticky: true, width: 100%, [
        #text(size: 9.4pt, weight: "bold", fill: accent)[\$ #title]
        #v(0.12em)
        #line(length: 100%, stroke: 0.75pt + stroke-line)
      ])
      #v(0.12em)
      #body
    ])
  }

  block(fill: soft, inset: (x: 1.0em, y: 0.80em), radius: 4pt, stroke: 0.5pt + stroke-line, width: 100%, [
    #text(size: 19pt, weight: "bold", fill: accent)[#name]
    #if headline != "" [\ #v(0.10em)#text(size: 9.4pt, fill: ink)[#headline]]
    #v(0.18em)
    #text(size: 8.0pt, fill: muted)[#contact-text]
  ])
  v(0.15em)

  let default-order = (
    "summary", "techStackSummary", "skills", "experience",
    "internships", "education", "projects", "certifications", "achievements",
    "openSource", "publications", "leadership", "volunteering", "conferences",
    "languages", "interests", "patents", "products", "customSections"
  )

  let active-order = ()
  if "sectionOrder" in data and type(data.sectionOrder) == array {
    for raw-k in data.sectionOrder {
      let k = if raw-k == "speaking" { "conferences" } else if raw-k == "awards" { "achievements" } else { raw-k }
      if default-order.contains(k) and not active-order.contains(k) { active-order.push(k) }
    }
  }
  for k in default-order {
    if not active-order.contains(k) { active-order.push(k) }
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
        section("Skills", skill-lines)
      }
    } else if sec == "experience" {
      if "experience" in data and data.experience.len() > 0 {
        section("Experience", {
          for (i, exp) in data.experience.enumerate() {
            if i > 0 { v(0.95em) }
            block(width: 100%, breakable: false, [
              #grid(
                columns: (1fr, auto),
                text(size: 9.0pt, weight: "bold", fill: ink)[#exp.role \@ #exp.company],
                text(size: 8.0pt, fill: muted)[#exp.dates]
              )
              #if "location" in exp and exp.location != "" {
                v(0.06em)
                text(size: 7.8pt, fill: muted)[#exp.location]
              }
              #{
                let expBullets = ()
                if "highlights" in exp and exp.highlights.len() > 0 { expBullets += exp.highlights }
                if "impactBullets" in exp and exp.impactBullets.len() > 0 { expBullets += exp.impactBullets }
                if "bullets" in exp and exp.bullets.len() > 0 { expBullets += exp.bullets }
                if expBullets.len() > 0 {
                  v(0.20em)
                  list(..expBullets.map(parse-bold))
                }
              }
            ])
          }
        })
      }
    } else if sec == "internships" {
      if "internships" in data and data.internships.len() > 0 {
        section("Internships", {
          for (i, exp) in data.internships.enumerate() {
            if i > 0 { v(0.95em) }
            block(width: 100%, breakable: false, [
              #grid(
                columns: (1fr, auto),
                text(size: 9.0pt, weight: "bold", fill: ink)[#exp.role \@ #exp.company],
                text(size: 8.0pt, fill: muted)[#exp.dates]
              )
              #if "location" in exp and exp.location != "" {
                v(0.06em)
                text(size: 7.8pt, fill: muted)[#exp.location]
              }
              #{
                let internBullets = ()
                if "highlights" in exp and exp.highlights.len() > 0 { internBullets += exp.highlights }
                if "impactBullets" in exp and exp.impactBullets.len() > 0 { internBullets += exp.impactBullets }
                if "bullets" in exp and exp.bullets.len() > 0 { internBullets += exp.bullets }
                if internBullets.len() > 0 {
                  v(0.20em)
                  list(..internBullets.map(parse-bold))
                }
              }
            ])
          }
        })
      }
    } else if sec == "education" {
      if "education" in data and data.education.len() > 0 {
        section("Education", {
          for (i, edu) in data.education.enumerate() {
            if i > 0 { v(0.55em) }
            block(width: 100%, breakable: false, [
              #grid(
                columns: (1fr, auto),
                align: (left + top, right + top),
                [
                  #text(size: 9.0pt, weight: "bold", fill: ink)[#edu.degree]
                  #if "specialization" in edu and edu.specialization != "" [ \ #text(size: 7.8pt, fill: muted)[#edu.specialization]]
                  \ #v(0.06em)#text(size: 8.0pt, fill: ink)[#edu.institution]
                ],
                [
                  #text(size: 8.0pt, fill: muted)[#edu.dates]
                  #if "gpa" in edu and edu.gpa != "" [ \ #v(0.06em)#text(size: 7.8pt, fill: muted)[GPA: #edu.gpa]]
                ]
              )
            ])
          }
        })
      }
    } else if sec == "projects" {
      if projects != () and projects.len() > 0 {
        section("Projects", breakable: false, {
          for (i, proj) in projects.enumerate() {
            if i > 0 { v(0.85em) }
            block(width: 100%, breakable: false, [
              #grid(
                columns: (1fr, auto),
                column-gutter: 0.6em,
                align: (left + top, right + top),
                [
                  #text(fill: accent, ">")
                  #h(0.3em)
                  #if "url" in proj and proj.url != "" {
                    link(proj.url)[#text(size: 9.0pt, weight: "bold", fill: ink)[#proj.name] #text(size: 7.4pt)[↗]]
                  } else {
                    text(size: 9.0pt, weight: "bold", fill: ink)[#proj.name]
                  }
                  #if "role" in proj and proj.role != "" [ #text(size: 8.0pt, fill: muted)[· #proj.role]]
                  #if "stack" in proj and proj.stack != "" [ #text(size: 8.0pt, fill: muted)[(#proj.stack)]]
                ],
                if "dates" in proj and proj.dates != "" {
                  text(size: 8.0pt, fill: muted)[#proj.dates]
                } else { none }
              )
              #if "description" in proj and proj.description != "" {
                v(0.10em)
                text(size: 8.2pt)[#parse-bold(proj.description)]
              }
              #{
                let allBullets = ()
                if "highlights" in proj and proj.highlights.len() > 0 { allBullets += proj.highlights }
                if "impactBullets" in proj and proj.impactBullets.len() > 0 { allBullets += proj.impactBullets }
                if "bullets" in proj and proj.bullets.len() > 0 { allBullets += proj.bullets }
                if allBullets.len() > 0 {
                  v(0.18em)
                  list(..allBullets.map(parse-bold))
                }
              }
            ])
          }
        })
      }
    } else if sec == "certifications" {
      if "certifications" in data and data.certifications.len() > 0 {
        section("Certifications", breakable: false, {
          for (i, cert) in data.certifications.enumerate() {
            if i > 0 { v(0.45em) }
            block(width: 100%, breakable: false, [
              #grid(
                columns: (1fr, auto),
                align: (left + top, right + top),
                [
                  #text(fill: accent, "+")
                  #h(0.3em)
                  #if "url" in cert and cert.url != "" {
                    link(cert.url)[#text(size: 8.8pt, weight: "bold", fill: ink)[#cert.name] #text(size: 7.2pt)[↗]]
                  } else {
                    text(size: 8.8pt, weight: "bold", fill: ink)[#cert.name]
                  }
                  #if "issuer" in cert and cert.issuer != "" [ #text(size: 8.0pt, fill: muted)[— #cert.issuer]]
                ],
                if "date" in cert and cert.date != "" {
                  text(size: 8.0pt, fill: muted)[#cert.date]
                } else { none }
              )
            ])
          }
        })
      }
    } else if sec == "achievements" {
      let achs = if "achievements" in data and data.achievements.len() > 0 {
        data.achievements
      } else if "awards" in data and data.awards.len() > 0 {
        data.awards
      } else { () }
      if achs.len() > 0 {
        section("Honors & Awards", breakable: false, {
          for (i, ach) in achs.enumerate() {
            if i > 0 { v(0.50em) }
            block(width: 100%, breakable: false, [
              #grid(
                columns: (1fr, auto),
                align: (left + top, right + top),
                [
                  #text(fill: accent, "*")
                  #h(0.3em)
                  #text(size: 8.8pt, weight: "bold", fill: ink)[#ach.title]
                  #if "awarder" in ach and ach.awarder != "" [ #text(size: 8.0pt, fill: muted)[— #ach.awarder]]
                ],
                if "date" in ach and ach.date != "" {
                  text(size: 8.0pt, fill: muted)[#ach.date]
                } else { none }
              )
              #if "description" in ach and ach.description != "" {
                v(0.06em)
                text(size: 8.2pt)[#parse-bold(ach.description)]
              }
            ])
          }
        })
      }
    } else if sec == "openSource" {
      if "openSource" in data and data.openSource.len() > 0 {
        section("Open Source", breakable: false, {
          for (i, os) in data.openSource.enumerate() {
            if i > 0 { v(0.50em) }
            block(width: 100%, breakable: false, [
              #grid(
                columns: (1fr, auto),
                align: (left + top, right + top),
                [
                  #text(fill: accent, "~")
                  #h(0.3em)
                  #if "url" in os and os.url != "" {
                    link(os.url)[#text(size: 8.8pt, weight: "bold", fill: ink)[#os.project] #text(size: 7.2pt)[↗]]
                  } else {
                    text(size: 8.8pt, weight: "bold", fill: ink)[#os.project]
                  }
                  #if "role" in os and os.role != "" [ #text(size: 8.0pt, fill: muted)[— #os.role]]
                  #if "contribution" in os and os.contribution != "" [ #text(size: 8.0pt, fill: muted)[— #os.contribution]]
                ],
                if "dates" in os and os.dates != "" {
                  text(size: 8.0pt, fill: muted)[#os.dates]
                } else { none }
              )
              #if "description" in os and os.description != "" {
                v(0.06em)
                text(size: 8.2pt)[#parse-bold(os.description)]
              }
              #if "bullets" in os and os.bullets.len() > 0 {
                v(0.10em)
                list(..os.bullets.map(parse-bold))
              }
            ])
          }
        })
      }
    } else if sec == "publications" {
      if "publications" in data and data.publications.len() > 0 {
        section("Publications", breakable: false, {
          for (i, pub) in data.publications.enumerate() {
            if i > 0 { v(0.45em) }
            block(width: 100%, breakable: false, [
              #grid(
                columns: (1fr, auto),
                align: (left + top, right + top),
                [
                  #text(fill: accent, "#")
                  #h(0.3em)
                  #if "url" in pub and pub.url != "" {
                    link(pub.url)[#text(size: 8.8pt, weight: "bold", fill: ink)[#pub.title] #text(size: 7.2pt)[↗]]
                  } else {
                    text(size: 8.8pt, weight: "bold", fill: ink)[#pub.title]
                  }
                  #if "venue" in pub and pub.venue != "" [ #text(size: 8.0pt, fill: muted)[— #pub.venue]]
                ],
                if "date" in pub and pub.date != "" {
                  text(size: 8.0pt, fill: muted)[#pub.date]
                } else { none }
              )
              #if "summary" in pub and pub.summary != "" {
                v(0.06em)
                text(size: 8.2pt, fill: muted)[#parse-bold(pub.summary)]
              }
            ])
          }
        })
      }
    } else if sec == "leadership" {
      if "leadership" in data and data.leadership.len() > 0 {
        section("Leadership & Activities", breakable: false, {
          for (i, item) in data.leadership.enumerate() {
            if i > 0 { v(0.50em) }
            block(width: 100%, breakable: false, [
              #grid(
                columns: (1fr, auto),
                align: (left + top, right + top),
                [
                  #text(fill: accent, "^")
                  #h(0.3em)
                  #text(size: 8.8pt, weight: "bold", fill: ink)[#item.role]
                  #if "organization" in item and item.organization != "" [ #text(size: 8.0pt, fill: muted)[@ #item.organization]]
                ],
                if "dates" in item and item.dates != "" {
                  text(size: 8.0pt, fill: muted)[#item.dates]
                } else { none }
              )
              #{
                let lbullets = ()
                if "highlights" in item and item.highlights.len() > 0 { lbullets += item.highlights }
                if "bullets" in item and item.bullets.len() > 0 { lbullets += item.bullets }
                if lbullets.len() > 0 {
                  v(0.10em)
                  list(..lbullets.map(parse-bold))
                }
              }
            ])
          }
        })
      }
    } else if sec == "volunteering" {
      if "volunteering" in data and data.volunteering.len() > 0 {
        section("Volunteering", breakable: false, {
          for (i, item) in data.volunteering.enumerate() {
            if i > 0 { v(0.50em) }
            block(width: 100%, breakable: false, [
              #grid(
                columns: (1fr, auto),
                align: (left + top, right + top),
                [
                  #text(fill: accent, "^")
                  #h(0.3em)
                  #text(size: 8.8pt, weight: "bold", fill: ink)[#item.role]
                  #if "organization" in item and item.organization != "" [ #text(size: 8.0pt, fill: muted)[@ #item.organization]]
                ],
                if "dates" in item and item.dates != "" {
                  text(size: 8.0pt, fill: muted)[#item.dates]
                } else { none }
              )
              #{
                let vbullets = ()
                if "highlights" in item and item.highlights.len() > 0 { vbullets += item.highlights }
                if "bullets" in item and item.bullets.len() > 0 { vbullets += item.bullets }
                if vbullets.len() > 0 {
                  v(0.10em)
                  list(..vbullets.map(parse-bold))
                }
              }
            ])
          }
        })
      }
    } else if sec == "conferences" {
      let items = if "conferences" in data and data.conferences.len() > 0 {
        data.conferences
      } else if "speaking" in data and data.speaking.len() > 0 {
        data.speaking
      } else { () }
      if items.len() > 0 {
        section("Conferences & Speaking", breakable: false, {
          for (i, item) in items.enumerate() {
            if i > 0 { v(0.45em) }
            block(width: 100%, breakable: false, [
              #grid(
                columns: (1fr, auto),
                align: (left + top, right + top),
                [
                  #text(fill: accent, ">")
                  #h(0.3em)
                  #let title = if "title" in item { item.title } else if "name" in item { item.name } else { "" }
                  #text(size: 8.8pt, weight: "bold", fill: ink)[#title]
                  #if "event" in item and item.event != "" [ #text(size: 8.0pt, fill: muted)[@ #item.event]]
                  #if "conference" in item and item.conference != "" [ #text(size: 8.0pt, fill: muted)[@ #item.conference]]
                ],
                if "date" in item and item.date != "" {
                  text(size: 8.0pt, fill: muted)[#item.date]
                } else { none }
              )
              #if "description" in item and item.description != "" {
                v(0.06em)
                text(size: 8.2pt, fill: muted)[#parse-bold(item.description)]
              }
            ])
          }
        })
      }
    } else if sec == "patents" {
      if "patents" in data and data.patents.len() > 0 {
        section("Patents", breakable: false, {
          for (i, pat) in data.patents.enumerate() {
            if i > 0 { v(0.45em) }
            block(width: 100%, breakable: false, [
              #grid(
                columns: (1fr, auto),
                align: (left + top, right + top),
                [
                  #text(fill: accent, "#")
                  #h(0.3em)
                  #text(size: 8.8pt, weight: "bold", fill: ink)[#pat.title]
                  #if "patentNumber" in pat and pat.patentNumber != "" [ #text(size: 8.0pt, fill: muted)[(#pat.patentNumber)]]
                ],
                if "date" in pat and pat.date != "" {
                  text(size: 8.0pt, fill: muted)[#pat.date]
                } else { none }
              )
              #if "description" in pat and pat.description != "" {
                v(0.06em)
                text(size: 8.2pt, fill: muted)[#parse-bold(pat.description)]
              }
            ])
          }
        })
      }
    } else if sec == "products" {
      if "products" in data and data.products.len() > 0 {
        section("Products", breakable: false, {
          for (i, prod) in data.products.enumerate() {
            if i > 0 { v(0.50em) }
            block(width: 100%, breakable: false, [
              #grid(
                columns: (1fr, auto),
                align: (left + top, right + top),
                [
                  #text(fill: accent, ">")
                  #h(0.3em)
                  #text(size: 8.8pt, weight: "bold", fill: ink)[#prod.name]
                  #if "role" in prod and prod.role != "" [ #text(size: 8.0pt, fill: muted)[· #prod.role]]
                ],
                if "dates" in prod and prod.dates != "" {
                  text(size: 8.0pt, fill: muted)[#prod.dates]
                } else { none }
              )
              #if "description" in prod and prod.description != "" {
                v(0.06em)
                text(size: 8.2pt)[#parse-bold(prod.description)]
              }
            ])
          }
        })
      }
    } else if sec == "languages" {
      if "languages" in data and data.languages.len() > 0 {
        section("Languages", breakable: false, {
          let items = data.languages.map(l => text(size: 8.8pt, weight: "bold", fill: ink)[#l.language] + if "proficiency" in l and l.proficiency != "" [ #text(size: 8.2pt, fill: muted)[(#l.proficiency)]] else [])
          items.join(text(fill: accent)[ · ])
        })
      }
    } else if sec == "interests" {
      if "interests" in data and data.interests.len() > 0 {
        section("Interests", breakable: false, {
          let items = if type(data.interests) == array {
            data.interests.map(it => if type(it) == dictionary and "name" in it { text(size: 8.8pt)[#it.name] } else if type(it) == str { text(size: 8.8pt)[#it] } else { text(size: 8.8pt)[#str(it)] })
          } else { () }
          items.join(text(fill: accent)[ · ])
        })
      }
    } else if sec == "customSections" {
      if "customSections" in data and data.customSections.len() > 0 {
        for cs in data.customSections {
          section(cs.title, breakable: false, {
            list(..cs.items.map(parse-bold))
          })
        }
      }
    }
  }
}

#let render = render-terminal
