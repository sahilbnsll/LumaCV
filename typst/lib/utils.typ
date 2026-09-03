// ============================================================
// Shared Utilities for Resume Templates
// ============================================================

// ------------------------------------------------------------
// Inline markup: **bold** inside YAML strings
// ------------------------------------------------------------

#let parse-bold(raw-str) = {
  if type(raw-str) != str {
    return raw-str
  }
  let parts = raw-str.split("**")
  let result = []
  for (i, part) in parts.enumerate() {
    if part == "" {
      continue
    }
    if calc.rem(i, 2) == 0 {
      result += part
    } else {
      result += text(weight: "bold", part)
    }
  }
  result
}

// ------------------------------------------------------------
// Small data helpers
// ------------------------------------------------------------

// Read `key` from a dictionary as a trimmed string ("" when absent/empty).
#let field(dict, key) = {
  if type(dict) != dictionary {
    return ""
  }
  let value = dict.at(key, default: none)
  if value == none {
    return ""
  }
  if type(value) == str {
    return value.trim()
  }
  str(value)
}

#let has(dict, key) = field(dict, key) != ""

// Is this a non-empty array / string?
#let filled(value) = {
  if value == none {
    false
  } else if type(value) == array or type(value) == str {
    value.len() > 0
  } else if type(value) == dictionary {
    value.len() > 0
  } else {
    true
  }
}

#let clean-link(url) = {
  if url == none or url == "" {
    return ""
  }
  url.replace("https://", "").replace("http://", "").replace("www.", "").trim("/")
}

// Pick the variant-specific value of a field, falling back to `default`.
#let resolve-variant-field(field-val, variant, fallback: "") = {
  if type(field-val) == dictionary {
    if variant in field-val {
      field-val.at(variant)
    } else if "default" in field-val {
      field-val.at("default")
    } else {
      fallback
    }
  } else if field-val == none {
    fallback
  } else {
    field-val
  }
}

// "CGPA: 7.86/10" stays as-is, "3.9/4.0" becomes "GPA: 3.9/4.0".
#let label-gpa(gpa) = {
  let value = if type(gpa) == str { gpa.trim() } else { "" }
  if value == "" {
    ""
  } else if lower(value).contains("gpa") or lower(value).contains("grade") {
    value
  } else {
    "GPA: " + value
  }
}

// ------------------------------------------------------------
// Contact details
// ------------------------------------------------------------
// Built in code mode (never inside markup blocks) so no stray whitespace can
// leak into the rendered header.

#let contact-entries(personal) = {
  let contact = if type(personal) == dictionary {
    personal.at("contact", default: (:))
  } else {
    (:)
  }
  let entries = ()

  let phone = field(contact, "phone")
  if phone != "" {
    entries.push((kind: "phone", label: phone, url: "tel:" + phone.replace(" ", "")))
  }

  let email = field(contact, "email")
  if email != "" {
    entries.push((kind: "email", label: email, url: "mailto:" + email))
  }

  for key in ("linkedin", "github", "website") {
    let raw = field(contact, key)
    if raw != "" {
      let shown = clean-link(raw)
      entries.push((kind: key, label: shown, url: "https://" + shown))
    }
  }

  let location = field(contact, "location")
  if location != "" {
    entries.push((kind: "location", label: location, url: none))
  }

  entries
}

// ------------------------------------------------------------
// PDF metadata
// ------------------------------------------------------------
// Recruiters search PDF metadata and some ATS index it, so we fill it from the
// resume data instead of leaving it empty.

#let metadata-keywords(data, variant) = {
  let words = ()

  let skills = resolve-variant-field(data.at("skills", default: ()), variant, fallback: ())
  if type(skills) == array {
    for group in skills {
      if type(group) != dictionary {
        continue
      }
      let category = field(group, "category")
      if category != "" {
        words.push(category)
      }
      for item in field(group, "items").split(",") {
        let word = item.trim()
        if word != "" {
          words.push(word)
        }
      }
    }
  }

  for job in data.at("experience", default: ()) {
    let role = field(job, "role")
    if role != "" {
      words.push(role)
    }
  }

  // de-duplicate while preserving order, then cap the list
  let seen = ()
  for word in words {
    if word not in seen {
      seen.push(word)
    }
  }
  seen.slice(0, calc.min(seen.len(), 48))
}
