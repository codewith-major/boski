/**
 * Generates design tokens from DESIGN.md frontmatter.
 * DESIGN.md is the visual source of truth — run `npm run tokens:generate` after updates.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");
const designPath = path.join(rootDir, "DESIGN.md");
const cssOutputPath = path.join(rootDir, "src", "styles", "tokens.css");
const tsOutputPath = path.join(rootDir, "src", "lib", "design-tokens.ts");

const designContent = fs.readFileSync(designPath, "utf8");
const frontmatterMatch = designContent.match(/^---\r?\n([\s\S]*?)\r?\n---/);

if (!frontmatterMatch) {
  throw new Error("DESIGN.md frontmatter not found.");
}

const design = parseYaml(frontmatterMatch[1]);
const { colors, typography, spacing, rounded } = design;

const css = `/**
 * AUTO-GENERATED — do not edit manually.
 * Source: DESIGN.md
 * Regenerate: npm run tokens:generate
 */

:root {
  /* Brand */
  --boski-ink: ${colors["boski-ink"]};
  --boski-cream: ${colors["boski-cream"]};
  --boski-lime: ${colors["boski-lime"]};

  /* Surface (from design system) */
  --surface-primary: ${colors.surface.primary};
  --surface-secondary: ${colors.surface.secondary};
  --surface-muted: ${colors.surface.muted};
  --surface-elevated: ${colors.surface.elevated};

  /* Semantic: Background */
  --background-primary: ${colors.surface.primary};
  --background-secondary: ${colors.surface.secondary};
  --background-muted: ${colors.surface.muted};

  /* Semantic: Text */
  --text-primary: ${colors.text.primary};
  --text-secondary: ${colors.text.secondary};
  --text-muted: ${colors.text.muted};
  --text-inverse: ${colors.text.inverse};

  /* Semantic: Action */
  --action-primary: ${colors["boski-lime"]};
  --action-primary-foreground: ${colors["boski-ink"]};
  --action-secondary: ${colors["boski-ink"]};
  --action-secondary-foreground: ${colors["boski-cream"]};
  --action-accent: ${colors["boski-lime"]};

  /* Semantic: Border */
  --border-subtle: ${colors.border.subtle};
  --border-default: ${colors.border.default};
  --border-strong: ${colors.border.strong};

  /* Semantic: Status */
  --status-success: ${colors.functional.success};
  --status-warning: ${colors.functional.warning};
  --status-error: ${colors.functional.error};
  --status-info: ${colors.functional.info};

  /* Elevation */
  --shadow-elevated: 4px 4px 0 var(--boski-ink);

  /* Spacing */
  --space-2xs: ${spacing["space-2xs"]};
  --space-xs: ${spacing["space-xs"]};
  --space-sm: ${spacing["space-sm"]};
  --space-md: ${spacing["space-md"]};
  --space-lg: ${spacing["space-lg"]};
  --space-xl: ${spacing["space-xl"]};
  --space-2xl: ${spacing["space-2xl"]};
  --space-3xl: ${spacing["space-3xl"]};
  --space-4xl: ${spacing["space-4xl"]};
  --gutter-mobile: ${spacing["gutter-mobile"]};
  --gutter-tablet: ${spacing["gutter-tablet"]};
  --gutter-desktop: ${spacing["gutter-desktop"]};
  --margin-mobile: ${spacing["margin-mobile"]};
  --margin-tablet: ${spacing["margin-tablet"]};
  --margin-desktop: ${spacing["margin-desktop"]};

  /* Radius */
  --radius-sm: ${rounded.sm};
  --radius-md: ${rounded.md};
  --radius-lg: ${rounded.lg};
  --radius-xl: ${rounded.xl};
  --radius-full: ${rounded.full};

  /* Typography scale */
${Object.entries(typography)
  .map(([name, style]) => {
    const varName = name.replace(/-/g, "-");
    return [
      `  --font-size-${varName}: ${style.fontSize};`,
      `  --line-height-${varName}: ${style.lineHeight};`,
      `  --font-weight-${varName}: ${style.fontWeight};`,
      `  --letter-spacing-${varName}: ${style.letterSpacing};`,
    ].join("\n");
  })
  .join("\n")}
}
`;

const ts = `/**
 * AUTO-GENERATED — do not edit manually.
 * Source: DESIGN.md
 * Regenerate: npm run tokens:generate
 */

export const brandColors = {
  ink: "${colors["boski-ink"]}",
  cream: "${colors["boski-cream"]}",
  lime: "${colors["boski-lime"]}",
} as const;

export const backgroundColors = {
  primary: "${colors.surface.primary}",
  secondary: "${colors.surface.secondary}",
  muted: "${colors.surface.muted}",
} as const;

export const textColors = {
  primary: "${colors.text.primary}",
  secondary: "${colors.text.secondary}",
  muted: "${colors.text.muted}",
  inverse: "${colors.text.inverse}",
} as const;

export const actionColors = {
  primary: "${colors["boski-lime"]}",
  primaryForeground: "${colors["boski-ink"]}",
  secondary: "${colors["boski-ink"]}",
  secondaryForeground: "${colors["boski-cream"]}",
  accent: "${colors["boski-lime"]}",
} as const;

export const borderColors = {
  subtle: "${colors.border.subtle}",
  default: "${colors.border.default}",
  strong: "${colors.border.strong}",
} as const;

export const statusColors = {
  success: "${colors.functional.success}",
  warning: "${colors.functional.warning}",
  error: "${colors.functional.error}",
  info: "${colors.functional.info}",
} as const;

export const typography = ${JSON.stringify(typography, null, 2)} as const;

export const spacing = ${JSON.stringify(spacing, null, 2)} as const;

export const rounded = ${JSON.stringify(rounded, null, 2)} as const;
`;

fs.mkdirSync(path.dirname(cssOutputPath), { recursive: true });
fs.mkdirSync(path.dirname(tsOutputPath), { recursive: true });
fs.writeFileSync(cssOutputPath, css);
fs.writeFileSync(tsOutputPath, ts);

console.log("Generated src/styles/tokens.css");
console.log("Generated src/lib/design-tokens.ts");
