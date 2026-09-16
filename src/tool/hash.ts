// Pure, framework-free helpers for deep-linking a status code via the URL
// hash, e.g. `#404`. Tool-specific.

/** Parses a `window.location.hash` value into a 3-digit status code, or null. */
export function parseCodeFromHash(hash: string): number | null {
  const raw = hash.replace(/^#/, '').trim();
  if (!/^\d{3}$/.test(raw)) return null;
  return Number(raw);
}

/** Formats a status code as a URL hash, e.g. `404` -> `"#404"`. */
export function hashForCode(code: number): string {
  return `#${code}`;
}
