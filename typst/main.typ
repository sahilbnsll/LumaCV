// ============================================================
// LumaCV Typst Main Dispatcher (No variants, pure templates)
// ============================================================

#import "/templates/classic.typ": render-classic
#import "/templates/modern.typ": render-modern
#import "/templates/ats_safe.typ": render-ats-safe
#import "/templates/compact.typ": render-compact
#import "/templates/two_column.typ": render-two-column
#import "/templates/engineering.typ": render-engineering

#let data-source = sys.inputs.at("data", default: "/resume.json")
#let template = sys.inputs.at("template", default: "modern")
#let theme = sys.inputs.at("theme", default: none)

#let raw-json = sys.inputs.at("data_json", default: none)
#let data = if raw-json != none and raw-json != "" {
  json(bytes(raw-json))
} else {
  json(data-source)
}

#let chosen-theme = if theme != none and theme != "none" { theme } else {
  if template == "ats_safe" or template == "ats-safe" { "ats-safe" }
  else if template == "two_column" or template == "two-column" { "two-column" }
  else { template }
}

#if template == "modern" {
  render-modern(data, theme: chosen-theme)
} else if template == "ats_safe" or template == "ats-safe" {
  render-ats-safe(data, theme: chosen-theme)
} else if template == "compact" {
  render-compact(data, theme: chosen-theme)
} else if template == "two_column" or template == "two-column" {
  render-two-column(data, theme: chosen-theme)
} else if template == "engineering" {
  render-engineering(data, theme: chosen-theme)
} else {
  render-classic(data, theme: chosen-theme)
}
