/**
 * Official ASJ Design System primitives (Phase 10.2).
 *
 * Every component here MUST:
 *   - use only Tailwind utilities;
 *   - consume only semantic tokens declared in `src/styles/globals.css`;
 *   - avoid Bootstrap classes, inline styles and hardcoded colors;
 *   - follow the official typography (Space Grotesk / DM Sans) and scales.
 *
 * Migration policy: legacy CSS Modules and Bootstrap keep working until
 * Phase 10.6. New UI code should import from `@/components/ui`.
 */
export { default as Button } from "./Button";
export type { ButtonVariant, ButtonSize } from "./Button";
export { default as Input, inputBaseClasses } from "./Input";
export { default as Card } from "./Card";
export { default as Badge } from "./Badge";
export type { BadgeVariant } from "./Badge";
export { cn } from "./cn";