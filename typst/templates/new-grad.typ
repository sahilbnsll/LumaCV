// ============================================================
// LumaCV template: Graduate
// Purpose: Education/project-forward one-page resume for students and early-career candidates.
// ============================================================
#import "/support/resume-core.typ": render-resume

#let render-grad(data, variant: "default", theme: "grad") = render-resume(data, mode: "grad")
#let render = render-grad
