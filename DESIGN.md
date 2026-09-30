---
name: Editorial Utility
colors:
  surface: '#fcf9f2'
  surface-dim: '#dcdad3'
  surface-bright: '#fcf9f2'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3ec'
  surface-container: '#f1eee7'
  surface-container-high: '#ebe8e1'
  surface-container-highest: '#e5e2db'
  on-surface: '#1c1c18'
  on-surface-variant: '#46464a'
  inverse-surface: '#31312c'
  inverse-on-surface: '#f3f0e9'
  outline: '#77767b'
  outline-variant: '#c7c6ca'
  surface-tint: '#5f5e60'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1b1b1d'
  on-primary-container: '#858386'
  inverse-primary: '#c8c6c8'
  secondary: '#526600'
  on-secondary: '#ffffff'
  secondary-container: '#c8f31d'
  on-secondary-container: '#576c00'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1d1b18'
  on-tertiary-container: '#87837f'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e4e2e4'
  primary-fixed-dim: '#c8c6c8'
  on-primary-fixed: '#1b1b1d'
  on-primary-fixed-variant: '#474649'
  secondary-fixed: '#c8f31d'
  secondary-fixed-dim: '#aed500'
  on-secondary-fixed: '#171e00'
  on-secondary-fixed-variant: '#3d4d00'
  tertiary-fixed: '#e8e1dc'
  tertiary-fixed-dim: '#cbc5c0'
  on-tertiary-fixed: '#1d1b18'
  on-tertiary-fixed-variant: '#494642'
  background: '#fcf9f2'
  on-background: '#1c1c18'
  surface-variant: '#e5e2db'
typography:
  display-xl:
    fontFamily: Manrope
    fontSize: 64px
    fontWeight: '800'
    lineHeight: 68px
    letterSpacing: -0.04em
  display-xl-mobile:
    fontFamily: Manrope
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 44px
    letterSpacing: -0.03em
  display-lg:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 52px
    letterSpacing: -0.03em
  display-lg-mobile:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 36px
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '800'
    lineHeight: 30px
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: Manrope
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 26px
    letterSpacing: -0.015em
  title-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '700'
    lineHeight: 22px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Manrope
    fontSize: 15px
    fontWeight: '500'
    lineHeight: 24px
    letterSpacing: 0em
  body-sm:
    fontFamily: Manrope
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.005em
  label-md:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.06em
  label-sm:
    fontFamily: Manrope
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.08em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  space-2xs: 0.25rem
  space-xs: 0.5rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
  space-3xl: 4rem
  space-4xl: 6rem
  gutter-mobile: 1rem
  gutter-desktop: 1.5rem
  margin-mobile: 1.25rem
  margin-desktop: 3rem
---

## Brand & Style

This design system embodies "Bold Youthful x Minimal Premium"—an attitude defined by 80% calculated restraint and 20% kinetic, unapologetic youth energy. Built for peer-to-peer campus resource exchange, the brand rejects both corporate marketplace clutter and juvenile startup pastel tropes. It prioritizes *access over ownership*, communicating speed, intelligence, and hyper-local mutual aid.

The visual direction merges high-end editorial clarity with raw utilitarian discipline:
- **Atmosphere:** Warm, tactile, intentional, direct, and unpretentious.
- **Visual Stance:** Crisp architectural lines, vast fields of warm parchment tone, sharp contrast, and decisive, sparing punctuation with high-voltage acid lime.
- **Anti-Patterns:** Avoid soft diffuse gradient meshes, generic SaaS pill floats, glassmorphism, skeuomorphic gloss, or saturated rainbow category badges. The system stays grounded in typographic dominance, tactile framing, and unyielding grid logic.

## Colors

The palette operates with severe discipline. The base canvas is warm, textured, and human, moving away from sterile clinical white. Color hierarchy is strictly enforced:

- **Dominant Base (`#F6F3EC`):** The primary canvas across all viewports. Surfaces, modals, and card interiors rely on this tint or its structural derivatives (`#ECE7DD`).
- **Primary Ink & Structure (`#171719`):** Represents absolute authority, razor-sharp typography, and structural grid borders. It guarantees high-contrast legibility and editorial weight.
- **Signal Lime Accent (`#C8F31D`):** Reserved strictly for 5% of viewport real estate. Used exclusively for high-intent primary calls to action, verified student trust indicators, and active interaction state pings. Never use it for large surface backgrounds or decorative fills.
- **Structural Muted (`#E6E2D8`, `#D8D3C7`):** Hairline borders, structural dividing rules, and disabled surface tones.
- **Secondary Ink (`#6B6964`, `#949089`):** Subheaders, metadata, timestamps, item conditions, and secondary specifications.

## Typography

Typography functions as the primary visual architecture. Powered exclusively by **Manrope**, the typographic personality hinges on high-tension weight contrast: ExtraBold (800) headlines juxtaposed with Medium (500) body copy and dense Bold (700) utilitarian mono-like uppercase labels.

- **Headlines:** Set tightly with negative letter spacing (`-0.02em` to `-0.04em`) and compact line heights to create visual density and editorial impact.
- **Body:** Set in Medium (500) rather than Regular (400) to maintain crisp legibility against warm background fields and offset the intense optical gravity of the headlines.
- **Labels & Tags:** Rendered in small, wide-tracked uppercase (`letter-spacing: 0.06em` to `0.08em`) to mimic dispatch codes, industrial stamps, and campus registry marks.

## Layout & Spacing

The layout is built upon an assertive, publication-style grid with architectural borders acting as explicit content dividers:

- **Desktop (1024px+):** 12-column responsive fluid grid with 1.5rem (`24px`) gutters and a max-width container capped at `1360px`. Sections are partitioned using full-bleed 1px horizontal and vertical hairline borders (`#E6E2D8`), giving the interface a sharp, modular broadsheet feel.
- **Tablet (768px - 1023px):** 8-column layout with 1.25rem (`20px`) gutters and 2rem (`32px`) margins. Sidebar controls reflow into sliding sheet drawers or top horizontal filter rails.
- **Mobile (<768px):** 4-column layout with 1rem (`16px`) gutters and 1.25rem (`20px`) outer margins. Content groups utilize full-width edge-to-edge card rows separated by horizontal hairline borders to maximize screen efficiency.
- **Spacing Rhythm:** Built strictly around a 4px/8px base modular cadence. White space is generous around editorial typography blocks, but dense within data clusters, exchange item matrices, and verification badges.

## Elevation & Depth

This system intentionally rejects blurry drop shadows, heavy blur filters, and multi-stop depth gradients. Depth is achieved via **structural hard planes, surface shifts, and high-contrast lines**:

- **Tier 0 (Canvas Base):** Boski Cream (`#F6F3EC`). The continuous underlying paper sheet.
- **Tier 1 (Panels & Surfaces):** Surface layers shift slightly via tone—either to pure white (`#FFFFFF`) for heightened contrast or tint-shifted cream (`#ECE7DD`) for grouping—contained within a 1px solid border of `#D8D3C7`.
- **Tier 2 (Floating Modals & Flyouts):** When elevated, surfaces employ a crisp 1px solid border (`#171719`) backed by a pure, hard-offset tactile shadow: `box-shadow: 4px 4px 0px #171719`. No blur radii are permitted.
- **Tier 3 (Key Overlays & Toast Notifications):** Solid `#171719` container with `#F6F3EC` text, accented with a 1px solid `#C8F31D` status rim.

## Shapes

The geometric approach balances modern precision with subtle mechanical restraint:

- **Base Form Factor:** Controlled softness with an emphasis on structure. Standard components (cards, text fields, containers) utilize a compact `0.25rem` (4px) to `0.375rem` (6px) corner radius. This prevents the interface from feeling playfully childish while avoiding the clinical severity of raw 90-degree corners.
- **Interactive Badges & Chips:** Small interactive tags and status indicators use a tighter `2px` or `4px` corner to read as utilitarian tickets and campus exchange stubs.
- **Pure Pills:** Reserved strictly for circular avatar crops and live availability indicator pips.

## Components

### Buttons
- **Primary (Key Action):** Solid Boski Lime (`#C8F31D`) background with Boski Ink (`#171719`) text, ExtraBold 800 weight, 1px solid `#171719` border. On hover, translate -1px, -1px with a crisp hard offset shadow `2px 2px 0px #171719`. On active press, translate 0px, 0px with no shadow.
- **Secondary (Structural):** Solid Boski Ink (`#171719`) background, Boski Cream (`#F6F3EC`) text. Hover introduces an inward stroke highlight or 90% opacity.
- **Tertiary (Outline/Ghost):** Transparent background, 1px solid `#171719` border, Ink text. Hover shifts background to `#ECE7DD`.

### Cards (Listings & Exchanges)
- Constructed with a `#FFFFFF` or `#F6F3EC` inner canvas, bounded by a 1px `#E6E2D8` hairline border.
- Media elements maintain a razor-sharp bottom hairline border separating image from text metadata.
- Avoid inner container padding bloat; keep metadata packed and distinct, featuring bold price/term tags against secondary muted descriptions.

### Chips & Filter Tags
- Utilitarian rectangular chips with 4px border radius.
- Inactive: Background transparent, border 1px solid `#D8D3C7`, text `#6B6964`.
- Active: Background `#171719`, border 1px solid `#171719`, text `#F6F3EC`.
- Category counts within chips appear in muted superscript.

### Input Fields
- Background: `#FFFFFF` or `#F0ECE1`. Border: 1px solid `#D8D3C7`. 4px radius.
- Height: 44px (touch/desktop parity). Typography: Medium 500 (`15px`) in Boski Ink.
- Focus state: Replaces border with 1.5px solid `#171719` and an immediate, non-blurred 2px focus ring tinted in `#C8F31D`.

### Checkboxes & Radio Controls
- Sharp 3px rounded checkboxes, 1.5px solid `#171719` frame.
- Selected state fills with `#171719` displaying a sharp `#C8F31D` checkmark icon.

### Verified Student Trust Badges
- Campus verification mark: Compact badge composed of a solid `#171719` pill or rectangular tag housing a glowing `#C8F31D` check pip alongside high-tracking label typography: `VERIFIED STU // .EDU`. Conveys unquestioned safety and peer validation.