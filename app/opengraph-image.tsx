import { ImageResponse } from 'next/og';

// Generates the site's default social-share preview at request time instead
// of shipping a static asset. The previous static image
// (/templates/renders/modern-cobalt.png) was a 1191x1684 portrait resume
// render mislabeled as 1200x630 in metadata, so it rendered cropped/broken
// on Slack, X, LinkedIn, and iMessage link previews. This always matches the
// dimensions it declares and needs no external asset to keep in sync with
// the brand.
export const runtime = 'edge';
export const alt = 'LumaCV, open-source, factual, Typst-typeset resumes';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px',
          background: '#0a0a0b',
          backgroundImage:
            'radial-gradient(circle at 78% 30%, rgba(99,102,241,0.22), transparent 55%), radial-gradient(circle at 15% 85%, rgba(56,189,248,0.14), transparent 50%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          <svg width="64" height="64" viewBox="0 0 200 200" fill="none">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M 100,8 L 108.78,55.86 L 130.61,26.09 L 125,62.58 L 165.05,34.95 L 137.42,75 L 173.91,69.39 L 144.14,91.22 L 192,100 L 144.14,108.78 L 173.91,130.61 L 137.42,125 L 165.05,165.05 L 125,137.42 L 130.61,173.91 L 108.78,144.14 L 100,192 L 91.22,144.14 L 69.39,173.91 L 75,137.42 L 34.95,165.05 L 62.58,125 L 26.09,130.61 L 55.86,108.78 L 8,100 L 55.86,91.22 L 26.09,69.39 L 62.58,75 L 34.95,34.95 L 75,62.58 L 69.39,26.09 L 91.22,55.86 Z M 100,51 L 106.12,85.22 L 134.65,65.35 L 114.78,93.88 L 149,100 L 114.78,106.12 L 134.65,134.65 L 106.12,114.78 L 100,149 L 93.88,114.78 L 65.35,134.65 L 85.22,106.12 L 51,100 L 85.22,93.88 L 65.35,65.35 L 93.88,85.22 Z"
              fill="#ffffff"
            />
          </svg>
          <span style={{ fontSize: 46, fontWeight: 700, color: '#ffffff', letterSpacing: '-0.03em' }}>
            Luma<span style={{ color: '#818cf8' }}>CV</span>
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            marginTop: 48,
            fontSize: 58,
            fontWeight: 700,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            color: '#ffffff',
            maxWidth: 920,
          }}
        >
          Open-source resumes, typeset by Typst, not guesswork.
        </div>

        <div
          style={{
            display: 'flex',
            marginTop: 28,
            fontSize: 26,
            color: '#a1a1aa',
            maxWidth: 820,
          }}
        >
          Vector PDF typesetting, zero-hallucination AI tailoring, deterministic ATS scoring.
        </div>
      </div>
    ),
    { ...size }
  );
}
