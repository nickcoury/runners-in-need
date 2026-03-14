/** Escape user-provided strings for safe interpolation into HTML. */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Trim and escape user input for safe storage/display. */
export function sanitize(s: string): string {
  return escapeHtml(s.trim());
}
