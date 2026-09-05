// ============================================================
// LumaCV template: Narrative
// Purpose: Editorial but restrained serif-led format for communications, strategy, and senior professionals.
// ============================================================
#import "/support/resume-core.typ": render-resume

#let render-narrative(data, variant: "default", theme: "narrative") = render-resume(data, mode: "narrative")
#let render = render-narrative
