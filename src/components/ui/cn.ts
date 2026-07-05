/**
 * Tiny class-name joiner. Kept dependency-free (no clsx) to respect the
 * Architecture Freeze — no new runtime deps in Phase 10.2.
 */
export function cn(...parts: Array<string | number | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}