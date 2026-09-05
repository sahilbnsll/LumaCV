#import "/lib/utils.typ": parse-bold, clean-link, resolve-variant-field

// ============================================================
// 🎨 RESUME DESIGN SYSTEM & THEME CUSTOMIZATION GUIDE
// ============================================================
//
// 💡 WELCOME TO THE THEME FILE! (No coding knowledge needed)
//
// Here you can customize the visual look of your resume:
//  1. COLORS: Pick from our pre-made color swatches below, or type your own HEX code!
//  2. FONTS: Choose between modern Sans-Serif or elegant Serif.
//  3. SPACING: Easily increase or decrease breathing room between sections and bullets.
//
// Every resume template automatically reads its settings from here.
// ============================================================

// ------------------------------------------------------------
// 🔤 Font Stacks — System Fonts (First available on your computer will be used)
// ------------------------------------------------------------
// Tip: "font-sans" is modern & clean (used by Modern, Compact, Two-Column, ATS-Safe).
//      "font-serif" is traditional & academic (used by Classic, Engineering).

#let font-sans = (
  "Inter",
  "SF Pro Display",
  "Segoe UI",
  "Helvetica Neue",
  "Arial",
  "DejaVu Sans",
  "Liberation Sans",
)

#let font-serif = (
  "Libertinus Serif",
  "New Computer Modern",
  "Linux Libertine",
  "Georgia",
  "Times New Roman",
  "DejaVu Serif",
  "Liberation Serif",
)

// ------------------------------------------------------------
// 🎨 Pre-Curated Color Swatches (Pick any for your accent!)
// ------------------------------------------------------------
// You can use any of these names directly, or type your own hex code (e.g. rgb("#1E40AF"))
#let swatches = (
  navy: rgb("#1E3A8A"),      // 🏛️ Oxford Navy — distinguished, executive, traditional
  cobalt: rgb("#1E40AF"),    // 💻 Royal Cobalt — modern tech, vibrant, professional
  emerald: rgb("#047857"),   // 🌲 Deep Emerald — clean, distinguished, nature/finance
  burgundy: rgb("#881337"),  // 🍷 Wine / Burgundy — warm, academic, premium
  teal: rgb("#0E7490"),      // 🌊 Ocean Teal / Petrol — modern, creative, sleek
  slate: rgb("#334155"),     // ⚙️ Graphite Slate — minimal, neutral, modern monochrome
  black: rgb("#000000"),     // 📄 High-contrast Pure Black — 100% ATS safe
)

// Helper to quickly build a complete color palette from a single accent color
#let create-palette(
  accent-color,
  ink-color: rgb("#0F172A"),
  muted-color: rgb("#475569"),
  rule-color: rgb("#CBD5E1"),
) = (
  ink: ink-color,
  muted: muted-color,
  accent: accent-color,
  rule: rule-color,
  rule-dark: accent-color,
  rule-light: rgb("#A9A9A9"),
  link: accent-color,
  marker: accent-color,
  name-fill: ink-color,
  company-fill: accent-color,
  headline-fill: muted-color,
  skill-label: accent-color,
  skill-bg: none,
  skill-border: none,
)

// ------------------------------------------------------------
// 🎨 Built-in Color Palettes
// ------------------------------------------------------------

#let colors = (
  // Modern — royal cobalt & deep slate
  modern: (
    ink: rgb("#0F172A"),
    muted: rgb("#475569"),
    accent: rgb("#1E40AF"),
    rule: rgb("#E2E8F0"),
    link: rgb("#1D4ED8"),
    marker: rgb("#2563EB"),
    name-fill: rgb("#0F172A"),
    company-fill: rgb("#1E40AF"),
    headline-fill: rgb("#2563EB"),
    skill-label: rgb("#1E40AF"),
    skill-bg: rgb("#F1F5F9"),
    skill-border: rgb("#E2E8F0"),
  ),
  // Classic — distinguished Oxford navy
  classic: (
    ink: rgb("#0F172A"),
    muted: rgb("#475569"),
    accent: rgb("#1E3A8A"),
    rule: rgb("#CBD5E1"),
    link: rgb("#1E3A8A"),
    marker: rgb("#1E3A8A"),
    name-fill: rgb("#0F172A"),
    company-fill: rgb("#1E3A8A"),
    headline-fill: rgb("#475569"),
    skill-label: rgb("#1E3A8A"),
    skill-bg: none,
    skill-border: none,
  ),
  // ATS-safe — high-contrast pure black & slate
  "ats-safe": (
    ink: rgb("#000000"),
    muted: rgb("#262626"),
    accent: rgb("#000000"),
    rule: rgb("#737373"),
    link: rgb("#000000"),
    marker: rgb("#000000"),
    name-fill: rgb("#000000"),
    company-fill: rgb("#000000"),
    headline-fill: rgb("#404040"),
    skill-label: rgb("#000000"),
    skill-bg: none,
    skill-border: none,
  ),
  // Compact — sophisticated steel slate
  compact: (
    ink: rgb("#0F172A"),
    muted: rgb("#475569"),
    accent: rgb("#1E293B"),
    rule: rgb("#CBD5E1"),
    link: rgb("#0F766E"),
    marker: rgb("#334155"),
    name-fill: rgb("#0F172A"),
    company-fill: rgb("#1E293B"),
    headline-fill: rgb("#475569"),
    skill-label: rgb("#1E293B"),
    skill-bg: none,
    skill-border: none,
  ),
  // Two-column — deep ocean teal / slate
  "two-column": (
    ink: rgb("#0F172A"),
    muted: rgb("#475569"),
    accent: rgb("#0E7490"),
    rule: rgb("#E2E8F0"),
    link: rgb("#0E7490"),
    marker: rgb("#0891B2"),
    name-fill: rgb("#0E7490"),
    company-fill: rgb("#0E7490"),
    headline-fill: rgb("#475569"),
    skill-label: rgb("#0E7490"),
    skill-bg: none,
    skill-border: none,
  ),
  // Engineering — high-density technical dual-tone layout
  engineering: (
    ink: rgb("#0F172A"),
    muted: rgb("#475569"),
    accent: rgb("#006699"),
    rule-dark: rgb("#4B5563"),
    rule-light: rgb("#9CA3AF"),
    rule: rgb("#CBD5E1"),
    link: rgb("#006699"),
    marker: rgb("#475569"),
    name-fill: rgb("#0F172A"),
    company-fill: rgb("#0F172A"),
    headline-fill: rgb("#475569"),
    skill-label: rgb("#0F172A"),
    skill-bg: none,
    skill-border: none,
  ),
  // Custom Swatch Palettes ready to use
  emerald: create-palette(swatches.emerald),
  burgundy: create-palette(swatches.burgundy),
  navy: create-palette(swatches.navy),
  cobalt: create-palette(swatches.cobalt),
  teal: create-palette(swatches.teal),
  slate: create-palette(swatches.slate),
  black: create-palette(
    swatches.black,
    ink-color: rgb("#000000"),
    muted-color: rgb("#262626"),
    rule-color: rgb("#525252"),
  ),
)


// ------------------------------------------------------------
// Typography tokens
// ------------------------------------------------------------

// ------------------------------------------------------------
// 📏 Typography Tokens (Font sizes & line spacing)
// ------------------------------------------------------------
// 💡 Tip: If you want to make text slightly smaller to fit more content,
// adjust "body-size" to 8.8pt or 8.5pt.
#let typo = (
  body-size: 9pt,        // Main body text size (descriptions, bullets)
  body-leading: 0.62em,  // Line spacing within paragraphs
  // Section headings (e.g. "EXPERIENCE", "SKILLS")
  section-size: 8.8pt,
  section-weight: "bold",
  section-tracking: 0.06em,
  // Entry headings (role title, project name)
  entry-size: 9.4pt,
  entry-weight: "bold",
  // Meta text (location, dates, tech stack)
  meta-size: 8.2pt,
  // Contact bar
  contact-size: 8.2pt,
  // Name
  name-size: 21pt,
  name-weight: "bold",
  name-tracking: 0.01em,
  // Headline
  headline-size: 9.2pt,
  headline-weight: "regular",
)

// ------------------------------------------------------------
// 📐 Spacing Tokens (Breathing room between elements)
// ------------------------------------------------------------
// 💡 Tip: Increase "bullet" for more space between bullet points.
//        Increase "entry" for more space between distinct jobs.
#let gap = (
  bullet: 0.52em,     // Space between consecutive bullet points
  block: 0.50em,      // Space between text blocks
  entry: 1.05em,      // Space between distinct jobs / projects / degrees
  entry-head: 0.28em, // Space between job title and first bullet
  section: 1.05em,    // Space above each section title
  title-rule: 0.14em, // Space between section title and underline
  rule-body: 0.38em,  // Space between underline and first item
)

// ------------------------------------------------------------
// 📄 Page Setup (Margins & Paper Size)
// ------------------------------------------------------------
// 💡 Tip: You can switch between "a4" (international) and "us-letter" (North America).
// If your resume is spilling onto page 2 by just 1-2 lines, decrease "margin-y" to 1.0cm!
#let pg = (
  paper: "a4",        // "a4" or "us-letter"
  margin-x: 1.45cm,   // Left and right margins
  margin-y: 1.18cm,   // Top and bottom margins
)

// ------------------------------------------------------------
// Section title helper
// ------------------------------------------------------------

#let render-section-title(t, title) = {
  set text(
    size: t.section-size,
    weight: t.section-weight,
    fill: t.accent,
    tracking: t.section-tracking,
  )
  upper(title)
}

// ------------------------------------------------------------
// Skills rendering — three styles
// ------------------------------------------------------------

#let get-skill-label-fill(t) = {
  if "skill-label" in t { t.skill-label }
  else if "accent" in t { t.accent }
  else if "ink" in t { t.ink }
  else { rgb("#1f2937") }
}

#let render-skills-grid(t, skills) = {
  let label-fill = get-skill-label-fill(t)
  layout(size => {
    let label-w(group) = measure(
      text(weight: "bold", fill: label-fill, group.category)
    ).width
    let widest = calc.max(..skills.map(label-w))
    let col-w = calc.min(widest + 4pt, size.width * 0.26)

    grid(
      columns: (col-w, 1fr),
      row-gutter: gap.bullet,
      column-gutter: 0.6em,
      ..skills.map(group => (
        text(weight: "bold", fill: label-fill, group.category + " "),
        parse-bold(group.items),
      )).flatten(),
    )
  })
}

#let render-skills-inline(t, skills) = {
  let label-fill = get-skill-label-fill(t)
  skills.enumerate().map(((i, group)) => {
    block(above: if i == 0 { 0pt } else { gap.bullet }, below: 0pt, width: 100%, {
      text(weight: "bold", fill: label-fill, group.category + ": ")
      parse-bold(group.items)
    })
  }).join()
}

#let render-skills-stacked(t, skills) = {
  let label-fill = get-skill-label-fill(t)
  skills.enumerate().map(((i, group)) => {
    block(above: if i == 0 { 0pt } else { 0.68em }, below: 0pt, width: 100%, {
      text(weight: "bold", size: 8pt, fill: label-fill, group.category)
      linebreak()
      parse-bold(group.items)
    })
  }).join()
}

// Adaptive skills renderer — automatically selects best representation
#let render-skills-adaptive(t, skills, max-categories-for-grid: 3) = {
  if skills == () or skills.len() == 0 { return none }
  
  let label-fill = get-skill-label-fill(t)
  let is-flat = if type(skills.first()) == str { true } else if type(skills.first()) == dictionary and "category" in skills.first() { false } else { true }
  
  if is-flat {
    let items = skills.map(s => if type(s) == str { s } else { str(s) })
    items.join(h(0.35em) + text(fill: t.muted)[·] + h(0.35em))
  } else if skills.len() <= max-categories-for-grid {
    render-skills-grid(t, skills)
  } else {
    for (i, group) in skills.enumerate() {
      if i > 0 { v(0.28em) }
      let items-text = if type(group.items) == array { group.items.join(", ") } else { str(group.items) }
      [#text(weight: "bold", fill: label-fill)[#group.category:] #text(size: typo.body-size)[#items-text]]
    }
  }
}

// Dynamic gap calculator for variable-length content
#let calc-dynamic-gap(total-entries, base-gap: 0.80em, min-gap: 0.48em) = {
  if total-entries > 6 {
    min-gap
  } else if total-entries > 4 {
    0.65em
  } else {
    base-gap
  }
}

// ------------------------------------------------------------
// Contact rendering helpers
// ------------------------------------------------------------

#let render-contact-inline(t, data, sep: none) = {
  let actual-sep = if sep != none { sep } else { h(0.3em) + text(fill: t.muted)[·] + h(0.3em) }
  let c = data.personal.contact
  let items = ()

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
  if "location" in c and c.location != "" {
    items.push(c.location)
  }

  items.join(actual-sep)
}

// ------------------------------------------------------------
// Footer helper — Multi-Page Resumes
// ------------------------------------------------------------
// 💡 Automatically displays "Name — Page X of Y" when a resume
// spans across multiple pages, while remaining completely hidden
// on standard 1-page resumes for maximum vertical space.

#let render-footer(t, name) = context {
  let page-num = counter(page).get().first()
  let total-pages = counter(page).final().first()
  if total-pages > 1 {
    set text(size: 7.5pt, fill: t.muted)
    grid(
      columns: (1fr, auto),
      align: (left + horizon, right + horizon),
      text(weight: "medium")[#name — Resume],
      [Page #page-num of #total-pages],
    )
  }
}
