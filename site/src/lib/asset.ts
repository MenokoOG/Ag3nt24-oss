// Plain <img> and CSS url() do not receive Next's basePath automatically.
// Every asset reference goes through here so the GitHub Pages project path
// (/Ag3nt24-oss) is applied once, in one place.
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const asset = (path: string): string => `${BASE}${path.startsWith("/") ? path : `/${path}`}`;

/** Pattern badge for a slot. Index == slot number, zero-padded. */
export const patternBadge = (slot: number): string => asset(`/assets/pattern-${String(slot).padStart(2, "0")}.png`);
