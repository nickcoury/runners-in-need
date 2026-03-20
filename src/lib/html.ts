/** Escape user-provided strings for safe interpolation into HTML. */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Trim user input. Named explicitly — this does NOT strip HTML or sanitize for XSS. */
export function trimInput(s: string): string {
  return s.trim();
}

/** @deprecated Use trimInput() instead. */
export const sanitize = trimInput;
