// ============================================================
// LumaCV Typst Main Dispatcher — 48 Architectural Templates
// ============================================================

#import "/templates/impact.typ": render as render_impact
#import "/templates/switch.typ": render as render_switch
#import "/templates/grad.typ": render as render_grad
#import "/templates/leadership.typ": render as render_leadership
#import "/templates/casework.typ": render as render_casework
#import "/templates/metrics.typ": render as render_metrics
#import "/templates/skillsfirst.typ": render as render_skillsfirst
#import "/templates/credential.typ": render as render_credential
#import "/templates/international.typ": render as render_international
#import "/templates/projectled.typ": render as render_projectled
#import "/templates/narrative.typ": render as render_narrative
#import "/templates/strict.typ": render as render_strict
#import "/templates/ats_safe.typ": render as render_ats_safe
#import "/templates/modern.typ": render as render_modern
#import "/templates/engineering.typ": render as render_engineering
#import "/templates/compact.typ": render as render_compact
#import "/templates/two_column.typ": render as render_two_column
#import "/templates/generated-terminal.typ": render as render_terminal
#import "/templates/generated-matrix.typ": render as render_matrix
#import "/templates/new-product.typ": render as render_product
#import "/templates/provided-startup.typ": render as render_startup
#import "/templates/provided-mono.typ": render as render_mono
#import "/templates/new-cadence.typ": render as render_cadence
#import "/templates/classic.typ": render as render_classic
#import "/templates/provided-executive.typ": render as render_executive
#import "/templates/provided-consultant.typ": render as render_consultant
#import "/templates/provided-analyst.typ": render as render_analyst
#import "/templates/new-meridian.typ": render as render_meridian
#import "/templates/new-ledger.typ": render as render_ledger
#import "/templates/new-harbor.typ": render as render_harbor
#import "/templates/generated-statement.typ": render as render_statement
#import "/templates/new-forma.typ": render as render_forma
#import "/templates/new-focus.typ": render as render_focus
#import "/templates/generated-boutique.typ": render as render_boutique
#import "/templates/generated-editorial.typ": render as render_editorial
#import "/templates/generated-portfolio.typ": render as render_portfolio
#import "/templates/new-atelier.typ": render as render_atelier
#import "/templates/provided-swiss.typ": render as render_swiss
#import "/templates/generated-nordic.typ": render as render_nordic
#import "/templates/generated-neo.typ": render as render_neo
#import "/templates/generated-monochrome.typ": render as render_monochrome
#import "/templates/new-slate.typ": render as render_slate
#import "/templates/provided-timeline.typ": render as render_timeline
#import "/templates/provided-academic.typ": render as render_academic
#import "/templates/new-research_modern.typ": render as render_research_modern
#import "/templates/generated-executive.typ": render as render_generated_executive
#import "/templates/generated-swiss.typ": render as render_swiss_alt
#import "/templates/generated-timeline.typ": render as render_timeline_alt

#let data-source = sys.inputs.at("data", default: "/resume.json")
#let template = sys.inputs.at("template", default: "modern")
#let theme = sys.inputs.at("theme", default: none)

#let raw-json = sys.inputs.at("data_json", default: none)
#let data = if raw-json != none and raw-json != "" {
  json(bytes(raw-json))
} else {
  json(data-source)
}

#let tmpl-key = lower(template)

#let chosen-theme = if theme != none and theme != "none" { 
  theme 
} else {
  if tmpl-key == "ats_safe" or tmpl-key == "ats-safe" { "ats-safe" }
  else if tmpl-key == "two_column" or tmpl-key == "two-column" { "two-column" }
  else { tmpl-key }
}

if tmpl-key == "impact" or tmpl-key == "impact" {
  render_impact(data, theme: chosen-theme)
} else if tmpl-key == "switch" or tmpl-key == "switch" {
  render_switch(data, theme: chosen-theme)
} else if tmpl-key == "grad" or tmpl-key == "grad" {
  render_grad(data, theme: chosen-theme)
} else if tmpl-key == "leadership" or tmpl-key == "leadership" {
  render_leadership(data, theme: chosen-theme)
} else if tmpl-key == "casework" or tmpl-key == "casework" {
  render_casework(data, theme: chosen-theme)
} else if tmpl-key == "metrics" or tmpl-key == "metrics" {
  render_metrics(data, theme: chosen-theme)
} else if tmpl-key == "skillsfirst" or tmpl-key == "skillsfirst" {
  render_skillsfirst(data, theme: chosen-theme)
} else if tmpl-key == "credential" or tmpl-key == "credential" {
  render_credential(data, theme: chosen-theme)
} else if tmpl-key == "international" or tmpl-key == "international" {
  render_international(data, theme: chosen-theme)
} else if tmpl-key == "projectled" or tmpl-key == "projectled" {
  render_projectled(data, theme: chosen-theme)
} else if tmpl-key == "narrative" or tmpl-key == "narrative" {
  render_narrative(data, theme: chosen-theme)
} else if tmpl-key == "strict" or tmpl-key == "strict" {
  render_strict(data, theme: chosen-theme)
} else if tmpl-key == "ats_safe" or tmpl-key == "ats-safe" {
  render_ats_safe(data, theme: chosen-theme)
} else if tmpl-key == "modern" or tmpl-key == "modern" {
  render_modern(data, theme: chosen-theme)
} else if tmpl-key == "engineering" or tmpl-key == "engineering" {
  render_engineering(data, theme: chosen-theme)
} else if tmpl-key == "compact" or tmpl-key == "compact" {
  render_compact(data, theme: chosen-theme)
} else if tmpl-key == "two_column" or tmpl-key == "two-column" {
  render_two_column(data, theme: chosen-theme)
} else if tmpl-key == "terminal" or tmpl-key == "terminal" {
  render_terminal(data, theme: chosen-theme)
} else if tmpl-key == "matrix" or tmpl-key == "matrix" {
  render_matrix(data, theme: chosen-theme)
} else if tmpl-key == "product" or tmpl-key == "product" {
  render_product(data, theme: chosen-theme)
} else if tmpl-key == "startup" or tmpl-key == "startup" {
  render_startup(data, theme: chosen-theme)
} else if tmpl-key == "mono" or tmpl-key == "mono" {
  render_mono(data, theme: chosen-theme)
} else if tmpl-key == "cadence" or tmpl-key == "cadence" {
  render_cadence(data, theme: chosen-theme)
} else if tmpl-key == "classic" or tmpl-key == "classic" {
  render_classic(data, theme: chosen-theme)
} else if tmpl-key == "executive" or tmpl-key == "executive" {
  render_executive(data, theme: chosen-theme)
} else if tmpl-key == "consultant" or tmpl-key == "consultant" {
  render_consultant(data, theme: chosen-theme)
} else if tmpl-key == "analyst" or tmpl-key == "analyst" {
  render_analyst(data, theme: chosen-theme)
} else if tmpl-key == "meridian" or tmpl-key == "meridian" {
  render_meridian(data, theme: chosen-theme)
} else if tmpl-key == "ledger" or tmpl-key == "ledger" {
  render_ledger(data, theme: chosen-theme)
} else if tmpl-key == "harbor" or tmpl-key == "harbor" {
  render_harbor(data, theme: chosen-theme)
} else if tmpl-key == "statement" or tmpl-key == "statement" {
  render_statement(data, theme: chosen-theme)
} else if tmpl-key == "forma" or tmpl-key == "forma" {
  render_forma(data, theme: chosen-theme)
} else if tmpl-key == "focus" or tmpl-key == "focus" {
  render_focus(data, theme: chosen-theme)
} else if tmpl-key == "boutique" or tmpl-key == "boutique" {
  render_boutique(data, theme: chosen-theme)
} else if tmpl-key == "editorial" or tmpl-key == "editorial" {
  render_editorial(data, theme: chosen-theme)
} else if tmpl-key == "portfolio" or tmpl-key == "portfolio" {
  render_portfolio(data, theme: chosen-theme)
} else if tmpl-key == "atelier" or tmpl-key == "atelier" {
  render_atelier(data, theme: chosen-theme)
} else if tmpl-key == "swiss" or tmpl-key == "swiss" {
  render_swiss(data, theme: chosen-theme)
} else if tmpl-key == "nordic" or tmpl-key == "nordic" {
  render_nordic(data, theme: chosen-theme)
} else if tmpl-key == "neo" or tmpl-key == "neo" {
  render_neo(data, theme: chosen-theme)
} else if tmpl-key == "monochrome" or tmpl-key == "monochrome" {
  render_monochrome(data, theme: chosen-theme)
} else if tmpl-key == "slate" or tmpl-key == "slate" {
  render_slate(data, theme: chosen-theme)
} else if tmpl-key == "timeline" or tmpl-key == "timeline" {
  render_timeline(data, theme: chosen-theme)
} else if tmpl-key == "academic" or tmpl-key == "academic" {
  render_academic(data, theme: chosen-theme)
} else if tmpl-key == "research_modern" or tmpl-key == "research-modern" {
  render_research_modern(data, theme: chosen-theme)
} else if tmpl-key == "generated_executive" or tmpl-key == "generated-executive" {
  render_generated_executive(data, theme: chosen-theme)
} else if tmpl-key == "swiss_alt" or tmpl-key == "swiss-alt" {
  render_swiss_alt(data, theme: chosen-theme)
} else if tmpl-key == "timeline_alt" or tmpl-key == "timeline-alt" {
  render_timeline_alt(data, theme: chosen-theme)
} else {
  render_modern(data, theme: chosen-theme)
}
