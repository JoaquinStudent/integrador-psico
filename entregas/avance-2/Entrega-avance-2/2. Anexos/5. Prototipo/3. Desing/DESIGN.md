---
name: Clinical Precision
colors:
  surface: '#fcf8ff'
  surface-dim: '#dbd6f8'
  surface-bright: '#fcf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f1ff'
  surface-container: '#f0ebff'
  surface-container-high: '#eae5ff'
  surface-container-highest: '#e4dfff'
  on-surface: '#1b1931'
  on-surface-variant: '#484550'
  inverse-surface: '#302d47'
  inverse-on-surface: '#f3eeff'
  outline: '#797581'
  outline-variant: '#c9c4d1'
  surface-tint: '#60559a'
  primary: '#2e2365'
  on-primary: '#ffffff'
  primary-container: '#453a7d'
  on-primary-container: '#b4a8f3'
  inverse-primary: '#c9beff'
  secondary: '#60549c'
  on-secondary: '#ffffff'
  secondary-container: '#bcaefe'
  on-secondary-container: '#4a3e85'
  tertiary: '#2e2755'
  on-tertiary: '#ffffff'
  tertiary-container: '#453d6d'
  on-tertiary-container: '#b4aae1'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e6deff'
  primary-fixed-dim: '#c9beff'
  on-primary-fixed: '#1c0c52'
  on-primary-fixed-variant: '#483d80'
  secondary-fixed: '#e6deff'
  secondary-fixed-dim: '#cabeff'
  on-secondary-fixed: '#1c0a55'
  on-secondary-fixed-variant: '#483c83'
  tertiary-fixed: '#e6deff'
  tertiary-fixed-dim: '#cabff8'
  on-tertiary-fixed: '#1c1442'
  on-tertiary-fixed-variant: '#484070'
  background: '#fcf8ff'
  on-background: '#1b1931'
  surface-variant: '#e4dfff'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  title-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  caption:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  container-margin: 40px
  gutter: 20px
---

## Brand & Style

The design system is engineered for a clinical environment, prioritizing sobriety, clarity, and psychological authority. The interface must facilitate deep focus for psychologists analyzing projective drawing tests, where the UI recedes to allow the patient's work to remain the focal point.

The aesthetic follows a **Corporate / Modern** approach with high-density information architecture. It avoids all decorative flourishes, gradients, or soft "wellness" tropes, instead adopting a rigorous, systematic layout. The emotional response should be one of professional trust, objectivity, and medical reliability.

## Colors

The palette is strictly functional. **Deep Violet (#251D4B)** serves as the primary structural color for sidebars and high-level typography, providing a sense of gravity and permanence.

- **Primary Action:** Use `#453A7D` for primary buttons and essential active states.
- **Semantic Logic:** This design system employs a specific clinical validation logic. Use **Amber (#C97A1F)** exclusively for AI-generated suggestions or data awaiting validation. Use **Green (#2E7D5B)** for psychologist-confirmed entries. Use **Red (#C0523F)** for active recording states or critical errors.
- **Surface Usage:** Use the **Light Blue (#CADFFD)** exclusively for card backgrounds that contain diagnostic tools or avatar placeholders to differentiate them from standard white document surfaces.

## Typography

The design system utilizes **Inter** exclusively to maintain a systematic, utilitarian feel. 

- **Titles:** Use Semibold (`600`) for all headlines and titles to provide a clear hierarchy against the background.
- **Body:** Use Regular (`400`) for all patient notes and diagnostic text to ensure maximum readability during long sessions.
- **Color Application:** All titles must use **Deep Violet (#251D4B)**. Standard body text uses the same color at 90% opacity, while placeholders and secondary captions use **Secondary Text (#6B6885)**.

## Layout & Spacing

The layout is based on a **12-column fixed grid** for desktop, optimized for a center-aligned workspace of 1280px. 

- **Whitespace:** Use generous margins (`40px`) around the main drawing canvas to minimize visual noise.
- **Sidebar:** A fixed left-hand navigation in **Deep Violet** provides a persistent anchor for clinical tools.
- **Rhythm:** Use an 8px spacing scale. Component internal padding should default to `16px` (md) for comfortable interaction, while list items can be condensed to `8px` (sm) for data-heavy views.

## Elevation & Depth

Hierarchy is achieved through **Tonal Layers** and extremely subtle shadows. 

- **Level 0 (Background):** `#F7F8FC` for the application shell.
- **Level 1 (Cards/Paper):** White (`#FFFFFF`) surfaces represent documents and test results. Use a very soft, diffused shadow: `0px 2px 4px rgba(37, 29, 75, 0.05)`.
- **Level 2 (Modals/Popovers):** Higher elevation with a slightly more defined shadow: `0px 8px 16px rgba(37, 29, 75, 0.1)`.
- **Borders:** Use `1px` solid borders in **Secondary (#6B5FA8)** at 20% opacity for inactive card boundaries, increasing to 100% opacity for active/selected states.

## Shapes

The design system uses a consistent **8px (0.5rem)** corner radius for all primary UI elements including buttons, input fields, and cards. This provides a professional but modern feel that is less aggressive than sharp corners but more structured than "bubbly" wellness apps.

- **Small Elements:** Checkboxes and small tags use `4px` (0.25rem).
- **Large Elements:** Use `8px` consistently; do not use pill-shapes or larger radii to maintain the sober medical tone.

## Components

- **Buttons:** Primary buttons use `#453A7D` background with white text. Hover state is `#8B7FC0`. No gradients. Focus rings should use `#6B5FA8` with a 2px offset.
- **Validation Chips:** For AI suggestions, use a chip with `#C97A1F` (Amber) text and a 10% opacity Amber background. Once validated, transition the chip to `#2E7D5B` (Green).
- **Input Fields:** Use a 1px border in `#6B6885` (at 30% opacity). On focus, the border changes to `#453A7D`. Labels are always visible above the field in Semibold.
- **Cards:** Diagnostic cards use the **Light Blue (#CADFFD)** background to distinguish them from standard white text documents.
- **Status Indicators:** A pulsating `#C0523F` (Red) dot is used exclusively during active audio recording of patient sessions.
- **Sidebar Items:** Use **Deep Violet** as the background. Active items use a vertical 4px bar of **Accent Lilac (#CCA9E8)** on the left edge.