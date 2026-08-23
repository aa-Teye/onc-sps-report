---
name: Generations Chapel Identity
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#41493e'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#717a6d'
  outline-variant: '#c0c9bb'
  surface-tint: '#2a6b2c'
  primary: '#00450d'
  on-primary: '#ffffff'
  primary-container: '#1b5e20'
  on-primary-container: '#90d689'
  inverse-primary: '#91d78a'
  secondary: '#7c572d'
  on-secondary: '#ffffff'
  secondary-container: '#fecb97'
  on-secondary-container: '#79542a'
  tertiary: '#314000'
  on-tertiary: '#ffffff'
  tertiary-container: '#455900'
  on-tertiary-container: '#afd345'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#acf4a4'
  primary-fixed-dim: '#91d78a'
  on-primary-fixed: '#002203'
  on-primary-fixed-variant: '#0c5216'
  secondary-fixed: '#ffdcbc'
  secondary-fixed-dim: '#efbd8a'
  on-secondary-fixed: '#2c1700'
  on-secondary-fixed-variant: '#614018'
  tertiary-fixed: '#cbf160'
  tertiary-fixed-dim: '#b0d446'
  on-tertiary-fixed: '#161f00'
  on-tertiary-fixed-variant: '#3b4d00'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  h1:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  h2:
    fontFamily: Plus Jakarta Sans
    fontSize: 23px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  body:
    fontFamily: Work Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  small:
    fontFamily: Work Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label:
    fontFamily: Work Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
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
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 24px
  margin: 16px
---

## Brand & Style

The design system is built for a community-focused religious organization, emphasizing growth, tradition, and welcoming warmth. The personality is grounded and trustworthy, bridging the gap between historical reverence and modern accessibility.

The visual style is **Corporate / Modern** with a touch of **Tactile** warmth. It utilizes a structured grid, clear information hierarchy, and a sophisticated color palette to evoke feelings of peace and stability. The interface avoids unnecessary clutter, prioritizing legibility and ease of navigation for a multi-generational audience. High-quality imagery of the community and nature should be used to complement the organic green and gold tones.

## Colors

This design system utilizes a palette inspired by nature and refinement. 

- **Primary Dark Green** represents growth and the sanctuary environment. It is the dominant color for headers, active states, and primary actions.
- **Accent Gold** adds a sense of quality and sacredness. It is used sparingly for decorative borders, highlights, and hover states.
- **Accent Lime** provides a fresh, modern energy and is reserved for specific "Success" or call-to-action highlights to keep the UI vibrant.
- **Neutral Backgrounds** use a clean, off-white to reduce eye strain and provide a soft canvas for the deep greens.
- **Typography** uses absolute black for maximum readability on headers, while a muted slate gray is used for secondary metadata.

## Typography

The typography strategy pairs **Plus Jakarta Sans** for headlines to provide a friendly, open feel with **Work Sans** for body and labels to ensure professional, neutral legibility.

- **Headlines:** Use Bold weights to establish a clear information hierarchy.
- **Body Text:** Standard weight for maximum readability across long-form content or community updates.
- **Small Text:** Used for captions, footer links, and secondary metadata.
- **Labels:** Set in uppercase with slight letter spacing to differentiate functional UI text from content text.

## Layout & Spacing

The design system employs a **Fixed Grid** model for desktop to maintain a composed, editorial feel, transitioning to a **Fluid Grid** for mobile devices.

- **Grid:** 12-column grid on desktop (max-width 1200px) with 24px gutters.
- **Rhythm:** An 8px base unit drives all padding and margin decisions. 
- **Mobile:** Margins reduce to 16px. Typography scales down slightly where noted, and all multi-column layouts stack vertically.
- **Content Density:** High whitespace is encouraged to maintain a "peaceful" and uncluttered user experience.

## Elevation & Depth

Hierarchy is achieved through **Tonal Layers** and subtle **Low-contrast outlines**. 

- **Surfaces:** Use the Light Background (#F8F9FA) for the page body and pure white (#FFFFFF) for elevated containers like cards or the sidebar.
- **Outlines:** Instead of heavy shadows, use 1px borders in #E0E0E0 to define boundaries.
- **Interactive Depth:** Only the primary buttons may use a very soft, diffused shadow to indicate clickability. Otherwise, the design remains flat and structured to emphasize the content.

## Shapes

The shape language is **Rounded**, reflecting an approachable and gentle community atmosphere.

- **Standard Radius:** 8px (0.5rem) is the default for buttons, cards, and input fields.
- **Large Radius:** 16px (1rem) for decorative containers or image masks.
- **Icons:** Should follow a "Soft" aesthetic—avoiding needle-sharp points in favor of rounded caps and corners.

## Components

### Buttons
- **Primary:** Dark-green (#1B5E20) background, white text. Hover state shifts background to Gold (#D4A574).
- **Secondary:** Light-bg (#F8F9FA) with Dark-green text and a 1px Dark-green border.
- **Success:** Lime-green (#B4D84A) background with Dark-green text for high-visibility celebratory actions.

### Tables
- **Header:** Solid Dark-green background with Bold White text.
- **Rows:** Alternating "Zebra" stripes using the Light-bg (#F8F9FA). 
- **Borders:** Subtle horizontal borders in #E0E0E0 only.

### Sidebar & Navigation
- **Sidebar:** Clean white background. Active items use the Primary Dark-green as a solid background with white text. Hover states use a light tint of green.
- **Header:** White background with a distinct 2px bottom border in Accent Gold (#D4A574).

### Cards
- White background, 8px border radius, and a 1px border in #E0E0E0. Use for community events, blog posts, and ministry spotlights.

### Input Fields
- White background, 1px border (#E0E0E0), 8px border-radius. Focus state should use a 2px Primary Dark-green border.