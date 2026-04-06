#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT_DIR="$ROOT/.artifacts/latex-validation"
BUILD_DIR="$OUT_DIR/js"
RESUME_JSON="${1:-$ROOT/scripts/sample-resume.json}"
RUN_NAME="${2:-$(basename "$RESUME_JSON" .json)}"
OUT_DIR="$OUT_DIR/$RUN_NAME"
TEMPLATES=(modern classic ats executive minimal compact creative tech)

mkdir -p "$OUT_DIR"
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"
mkdir -p "$OUT_DIR/texmf-var" "$OUT_DIR/texmf-config"

export PATH="/Library/TeX/texbin:$PATH"
export PATH="/opt/homebrew/bin:$PATH"
export TEXMFVAR="$OUT_DIR/texmf-var"
export TEXMFCONFIG="$OUT_DIR/texmf-config"

if ! command -v pdflatex >/dev/null 2>&1; then
  echo "pdflatex not found on PATH"
  exit 1
fi

npx tsc \
  --outDir "$BUILD_DIR" \
  --module commonjs \
  --target ES2021 \
  --lib ES2021,DOM \
  --moduleResolution node \
  --esModuleInterop \
  --skipLibCheck \
  --resolveJsonModule \
  "$ROOT/lib/resume-schema.ts" \
  "$ROOT/lib/latex-escape.ts" \
  "$ROOT/lib/latex-layout.ts" \
  "$ROOT/lib/latex-generator.ts"

SUMMARY_FILE="$OUT_DIR/summary.txt"
: > "$SUMMARY_FILE"

for template in "${TEMPLATES[@]}"; do
  TEMPLATE_DIR="$OUT_DIR/$template"
  rm -rf "$TEMPLATE_DIR"
  mkdir -p "$TEMPLATE_DIR"

  node - <<'NODE' "$BUILD_DIR" "$RESUME_JSON" "$template" "$TEMPLATE_DIR/resume.tex"
const fs = require('fs');
const path = require('path');
const buildDir = process.argv[2];
const jsonPath = process.argv[3];
const template = process.argv[4];
const outPath = process.argv[5];
const { generateLatex } = require(path.join(buildDir, 'latex-generator.js'));
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
fs.writeFileSync(outPath, generateLatex(data, template));
NODE

  (
    cd "$TEMPLATE_DIR"
    pdflatex -interaction=nonstopmode -halt-on-error resume.tex >/tmp/latex-${template}-1.log 2>&1
    pdflatex -interaction=nonstopmode -halt-on-error resume.tex >/tmp/latex-${template}-2.log 2>&1
  )

  PAGES="unknown"
  if [[ -f "$TEMPLATE_DIR/resume.pdf" ]]; then
    PAGES="$(pdfinfo "$TEMPLATE_DIR/resume.pdf" | awk -F: '/^Pages:/ {gsub(/ /, "", $2); print $2}')"
  fi

  LOG_ISSUES="clean"
  if rg -n "Overfull|Underfull|Undefined control sequence|LaTeX Error|Emergency stop" /tmp/latex-${template}-1.log /tmp/latex-${template}-2.log >/dev/null 2>&1; then
    LOG_ISSUES="warnings"
  fi

  printf '%s | pages=%s | log=%s\n' "$template" "$PAGES" "$LOG_ISSUES" | tee -a "$SUMMARY_FILE"
done

echo "\nValidation summary written to $SUMMARY_FILE"
