// ============================================================
// LumaCV template: Strict ATS
// Purpose: Ultra-conservative, black-first one-column format for maximum parsing simplicity.
// ============================================================
#import "/support/resume-core.typ": render-resume

#let render-strict(data, variant: "default", theme: "strict") = render-resume(data, mode: "strict")
#let render = render-strict
