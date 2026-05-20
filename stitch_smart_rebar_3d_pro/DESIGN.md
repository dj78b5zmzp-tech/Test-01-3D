---
name: Precision Engineering Interface
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#bdc8d1'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#87929a'
  outline-variant: '#3e484f'
  surface-tint: '#7bd0ff'
  primary: '#8ed5ff'
  on-primary: '#00354a'
  primary-container: '#38bdf8'
  on-primary-container: '#004965'
  inverse-primary: '#00668a'
  secondary: '#4de082'
  on-secondary: '#003919'
  secondary-container: '#00b55d'
  on-secondary-container: '#003e1c'
  tertiary: '#ffc42f'
  on-tertiary: '#402d00'
  tertiary-container: '#e1a800'
  on-tertiary-container: '#584000'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#c4e7ff'
  primary-fixed-dim: '#7bd0ff'
  on-primary-fixed: '#001e2c'
  on-primary-fixed-variant: '#004c69'
  secondary-fixed: '#6dfe9c'
  secondary-fixed-dim: '#4de082'
  on-secondary-fixed: '#00210c'
  on-secondary-fixed-variant: '#005227'
  tertiary-fixed: '#ffdf9f'
  tertiary-fixed-dim: '#f9bd22'
  on-tertiary-fixed: '#261a00'
  on-tertiary-fixed-variant: '#5c4300'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-mono:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 12px
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 16px
  margin: 24px
  sidebar-width: 320px
  header-height: 56px
---

## Brand & Style

This design system is engineered for the high-stakes environment of BIM management and structural engineering. The visual language conveys absolute precision, technical authority, and industrial sophistication. It utilizes a **Corporate Modern** foundation infused with **Glassmorphism** and **High-Contrast** data visualization to ensure critical information remains legible against complex 3D environments.

The emotional response is one of "Technical Mastery"—the user should feel like they are operating a sophisticated piece of industrial machinery. The interface remains subordinate to the 3D model, using translucent surfaces to maintain spatial awareness while providing the robust control required for rebar detailing.

## Colors

The palette is optimized for a low-light "mission control" environment. The foundation is built on **Deep Navy (#0F172A)** and **Slate (#1E293B)** to minimize eye fatigue during long sessions of model review. 

Rebar types and structural statuses are identified via high-chroma accent colors:
- **Electric Blue (Primary):** Standard rebar, primary selection, and active states.
- **Neon Green (Secondary):** Passed inspections or specific material grades (e.g., HRB400).
- **Amber (Tertiary):** Warnings or specialized rebar (e.g., HPB300).
- **Crimson:** Critical errors, clashes, or structural failures.

Text uses a high-contrast scale from **Pure White** for headlines to **Slate 400** for secondary metadata.

## Typography

The system utilizes **Inter** for its exceptional legibility in dense data environments and high-contrast dark modes. For technical specifications, dimensions, and coordinate data, **JetBrains Mono** is employed to provide a clear, "code-like" distinction between narrative UI and raw engineering data.

- **Display & Headlines:** Used for project titles and major panel headers.
- **Body:** Used for descriptions and tooltips.
- **Mono Labels:** Reserved for 3D callouts, measurements, and rebar schedules.
- **Small Caps:** Used for metadata headers in sidebars to maintain hierarchy without increasing font size.

## Layout & Spacing

The layout follows a **Fixed-Fluid Hybrid** model. Navigation and toolbars are fixed to the viewport edges, while the 3D canvas occupies the fluid center.

- **The Control Rail:** A 320px right-hand sidebar for BIM parameters, utilizing a vertical stack with 16px padding.
- **HUD Overlays:** Top-left and bottom-right floating panels for legends and schedules, using 12px internal padding.
- **Spacing Rhythm:** Based on a strict 4px grid. Components typically use 8px (2 units) or 16px (4 units) gaps to maintain a dense, professional "dashboard" feel.

## Elevation & Depth

Depth is established through **Backdrop Blurs** rather than traditional shadows. This maintains the "Glassmorphism" aesthetic which is essential for seeing the 3D model through the UI.

- **Level 0 (Canvas):** The 3D viewport.
- **Level 1 (Panels):** Semi-transparent Slate backgrounds (80% opacity) with a 12px backdrop blur and a 1px "inner-glow" border (#FFFFFF10).
- **Level 2 (Modals/Active Callouts):** Higher opacity (95%) with a subtle outer glow using the primary color to indicate focus.
- **3D Labels:** These exist in world-space or as screen-space overlays with high-contrast background plates and colored "leading lines" connecting to the geometry.

## Shapes

The design system uses a **Soft (0.25rem)** roundedness approach. This maintains an industrial, precise feel while avoiding the harshness of sharp corners.

- **Buttons & Inputs:** 4px radius.
- **Panels & Cards:** 8px (rounded-lg) for outer containers to create a distinct frame.
- **Status Indicators:** Pills (full rounded) are used for "Rebar Grades" or "Status Tags" to differentiate them from functional UI buttons.

## Components

### Buttons & Controls
- **Primary:** Filled with Electric Blue, white text.
- **Secondary:** Outlined with 1px Slate-700, providing a "ghost" effect.
- **Sliders:** High-contrast tracks with a "glow" on the active portion to facilitate precise engineering adjustments.

### Engineering Labels (3D)
- Labels should have a semi-transparent background with a left-accent border matching the rebar color code. Text must be JetBrains Mono for technical clarity.

### Sidebars & Lists
- Use "Zebra-striping" with subtle tonal shifts (Slate-800 to Slate-900) for long schedules.
- Hover states should trigger a 1px border highlight rather than a large color shift.

### Input Fields
- Dark backgrounds (#0F172A) with a bottom-only 1px border that illuminates when focused. Units (mm, m, deg) are right-aligned as mono-labels.

### Cards & HUDs
- Utilize "Frosted Glass" effects (Backdrop Filter: blur(10px)) to prevent the UI from feeling like a heavy "box" over the 3D model.