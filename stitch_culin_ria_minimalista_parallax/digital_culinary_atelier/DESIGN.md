---
name: Digital Culinary Atelier
colors:
  surface: '#fdf8f8'
  surface-dim: '#ddd9d8'
  surface-bright: '#fdf8f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f7f3f2'
  surface-container: '#f1edec'
  surface-container-high: '#ebe7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#444748'
  inverse-surface: '#313030'
  inverse-on-surface: '#f4f0ef'
  outline: '#747878'
  outline-variant: '#c4c7c7'
  surface-tint: '#5f5e5e'
  primary: '#111111'
  on-primary: '#ffffff'
  primary-container: '#262626'
  on-primary-container: '#8e8d8c'
  inverse-primary: '#c8c6c5'
  secondary: '#5e5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e3e2e2'
  on-secondary-container: '#646464'
  tertiary: '#131111'
  on-tertiary: '#ffffff'
  tertiary-container: '#282625'
  on-tertiary-container: '#918d8b'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e4e2e1'
  primary-fixed-dim: '#c8c6c5'
  on-primary-fixed: '#1b1c1c'
  on-primary-fixed-variant: '#474746'
  secondary-fixed: '#e3e2e2'
  secondary-fixed-dim: '#c7c6c6'
  on-secondary-fixed: '#1b1c1c'
  on-secondary-fixed-variant: '#464747'
  tertiary-fixed: '#e7e1df'
  tertiary-fixed-dim: '#cac5c4'
  on-tertiary-fixed: '#1d1b1a'
  on-tertiary-fixed-variant: '#494645'
  background: '#fdf8f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
typography:
  display-lg:
    fontFamily: EB Garamond
    fontSize: 64px
    fontWeight: '400'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-xl:
    fontFamily: EB Garamond
    fontSize: 48px
    fontWeight: '400'
    lineHeight: '1.2'
  headline-lg:
    fontFamily: EB Garamond
    fontSize: 32px
    fontWeight: '500'
    lineHeight: '1.3'
  headline-sm-mobile:
    fontFamily: EB Garamond
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-caps:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.0'
    letterSpacing: 0.15em
spacing:
  unit: 8px
  container-max: 1200px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
  section-gap: 80px
---

## Brand & Style

The design system is rooted in the "Premium" visual identity, drawing inspiration from high-end European culinary journals. It targets a discerning audience that values the ritual of cooking as much as the result. The brand personality is serene, authoritative, and intellectual.

The aesthetic follows a **Minimalist / Editorial** approach. It utilizes expansive white space to allow high-resolution food photography to act as the primary visual driver. The interface recedes to the background, functioning as a sophisticated gallery frame. By employing hair-line borders (0.5pt to 1pt) and a strictly geometric, non-rounded architecture, the design system evokes a sense of architectural precision and timeless luxury.

## Colors

The palette is intentionally restrained to maintain a "Pure" aesthetic. 

- **Primary (#262626):** A deep charcoal used for headlines, primary actions, and critical iconography. It provides the necessary "ink-on-paper" contrast against white backgrounds.
- **Secondary (#737373):** A muted gray for meta-data, secondary labels, and supporting text.
- **Background (#FFFFFF):** Pure white serves as the canvas, maximizing the impact of negative space.
- **Surface (#F5F5F5):** Used for subtle sectioning or background fills in complex recipe steps to differentiate without adding visual weight.
- **Border (#E5E5E5):** Hair-line strokes that define the grid and separate content modules with surgical precision.

## Typography

Typography is the cornerstone of this design system. It uses **EB Garamond** for all editorial headings to convey heritage and sophistication. **Manrope** is used for functional text, ingredients, and instructions, providing a modern, legible contrast.

The hierarchy prioritizes the recipe title and section headers. Special attention is given to `label-caps`, which is used for categorizing recipes (e.g., "ENTRADAS", "SOBREMESAS") to create a structured, organized feel. Line heights are generous to ensure readability while the user is actively cooking.

## Layout & Spacing

This design system employs a **Fixed Grid** philosophy for desktop (12 columns) to maintain the integrity of an editorial layout, transitioning to a fluid single column for mobile.

- **Negative Space:** Use the `section-gap` (80px) liberally between major content blocks like the "Ingredients" and "Preparation" sections.
- **Rhythm:** All spacing is derived from an 8px base unit. 
- **Alignment:** Content is strictly left-aligned to mirror the reading experience of a book. On desktop, large margins create a "centered" feel that focuses the eye on the recipe content.

## Elevation & Depth

To maintain the "Premium" minimalist aesthetic, this design system avoids traditional drop shadows. Depth is achieved through:

- **Hair-line Borders:** 1px solid lines in `#E5E5E5` delineate cards and sections. 
- **Tonal Layering:** The use of `#F5F5F5` surfaces against the `#FFFFFF` background creates a "stacked paper" effect without the need for blur.
- **Subtle Transparency:** Global navigation bars may use a `backdrop-filter: blur(10px)` with a high-transparency white background (rgba(255, 255, 255, 0.8)) to imply layering and modernity while maintaining the airy feel.

## Shapes

The design system adheres to a **Strict Geometric (0px)** rounding rule. Every element—from buttons and input fields to image containers and recipe cards—must have sharp, 90-degree corners. This evokes a sense of modernism, precision, and high-end print design. No exceptions are made for "softer" elements like chips or badges; they remain rectangular.

## Components

### Buttons
Buttons are large, rectangular, and high-contrast.
- **Primary:** Background `#262626`, Text `#FFFFFF`, 0px border-radius. Padding: 20px 40px. Text is `label-caps`.
- **Secondary:** Transparent background, 1px border `#262626`, Text `#262626`.

### Cards
Recipe cards are defined by their image. The image is a sharp rectangle. Titles are placed below the image in `headline-lg`. Meta-data (time, difficulty) is displayed in `label-caps` separated by hairline vertical pipes.

### Input Fields
Inputs for search or newsletters are simple 1px bottom-borders or full rectangles with no fill. The focus state is indicated by a weight increase of the border (from 1px to 2px).

### Lists (Ingredientes)
Ingredient lists should use 1px horizontal dividers between items. Checkboxes are sharp squares. When checked, the text transitions to `secondary_color` with a simple strike-through.

### Chips / Tags
Tags (e.g., "Vegano", "Sem Glúten") are small rectangles with a `#F5F5F5` fill and `#737373` text in `label-caps`. They are never rounded.