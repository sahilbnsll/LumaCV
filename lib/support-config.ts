/**
 * Authoritative Centralized Support & Donation Configuration
 *
 * Single source of truth for:
 * - UPI payments (VPA, Payee name, preset amounts, NPCI URI builder)
 * - Buy Me a Coffee (Sanitized URL, username, display link)
 * - GitHub Sponsors (Profile URL, handle)
 */

const DEFAULT_UPI_ID = "sahil.bansal@superyes";
const DEFAULT_UPI_PAYEE = "Sahil Bansal";
const DEFAULT_BUYMEACOFFEE_URL = "https://buymeacoffee.com/sahilbansal";
const DEFAULT_GITHUB_SPONSORS_URL = "https://github.com/sponsors/sahilbnsll";

/**
 * Validates and sanitizes the Buy Me a Coffee URL.
 * Guarantees that any stale typo (e.g. sahilbnsll) is corrected to sahilbansal,
 * and validates that the URL is a proper https URL.
 */
function resolveBuyMeACoffeeUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_BUYMEACOFFEE_URL?.trim();
  let finalUrl = envUrl || DEFAULT_BUYMEACOFFEE_URL;

  // Safeguard against any stale cached environment or typos pointing to sahilbnsll
  if (finalUrl.includes("sahilbnsll")) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[SupportConfig] Detected obsolete Buy Me a Coffee handle 'sahilbnsll' in configuration. Auto-correcting to '${DEFAULT_BUYMEACOFFEE_URL}'.`
      );
    }
    finalUrl = finalUrl.replace("sahilbnsll", "sahilbansal");
  }

  try {
    const parsed = new URL(finalUrl);
    if (!parsed.protocol.startsWith("http")) {
      return DEFAULT_BUYMEACOFFEE_URL;
    }
    return finalUrl;
  } catch {
    return DEFAULT_BUYMEACOFFEE_URL;
  }
}

function resolveGitHubSponsorsUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_GITHUB_SPONSORS_URL?.trim();
  const finalUrl = envUrl || DEFAULT_GITHUB_SPONSORS_URL;
  try {
    const parsed = new URL(finalUrl);
    if (!parsed.protocol.startsWith("http")) {
      return DEFAULT_GITHUB_SPONSORS_URL;
    }
    return finalUrl;
  } catch {
    return DEFAULT_GITHUB_SPONSORS_URL;
  }
}

export const SUPPORT_CONFIG = {
  upi: {
    id: (process.env.NEXT_PUBLIC_UPI_ID || DEFAULT_UPI_ID).trim(),
    payeeName: DEFAULT_UPI_PAYEE,
    defaultPresets: [29, 59, 99, 199, 499] as const,
    defaultAmount: 99,
    defaultNote: "Support LumaCV",
  },
  buyMeACoffee: {
    url: resolveBuyMeACoffeeUrl(),
    handle: "sahilbansal",
    display: "buymeacoffee.com/sahilbansal",
  },
  githubSponsors: {
    url: resolveGitHubSponsorsUrl(),
    handle: "sahilbnsll",
    display: "github.com/sponsors/sahilbnsll",
  },
} as const;

/**
 * Builds an NPCI-compliant UPI payment intent URI (`upi://pay?...`)
 *
 * Parameters:
 * - `pa`: Payee VPA / UPI ID
 * - `pn`: Payee Name
 * - `am`: Amount in INR (optional, formatted to 2 decimal places if number)
 * - `cu`: Currency ("INR")
 * - `tn`: Transaction note / description
 */
export function buildUpiPaymentUri(
  amount?: number | string | null,
  note?: string
): string {
  const upiId = SUPPORT_CONFIG.upi.id;
  const payee = encodeURIComponent(SUPPORT_CONFIG.upi.payeeName);
  const transactionNote = encodeURIComponent(note || SUPPORT_CONFIG.upi.defaultNote);

  let uri = `upi://pay?pa=${upiId}&pn=${payee}&cu=INR&tn=${transactionNote}`;

  if (amount !== undefined && amount !== null && amount !== "") {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    if (!isNaN(numAmount) && numAmount > 0) {
      uri += `&am=${numAmount.toFixed(2)}`;
    }
  }

  return uri;
}
