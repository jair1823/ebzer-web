# Header Guidelines — Material-based rules

This document defines header rules to be applied across the app, inspired by Material Design (Google). Use these guidelines when creating or updating page headers so that the UI is consistent, accessible, and responsive.

## Typography
- Title: Material headline6 — 20px, 600 weight. Dense/compact variant: 16px.
- Subtitle (optional): 14px regular.
- Use the project's design tokens mapped to Material semantics (primary, on-primary, surface, on-surface).

## Spacing & Layout
- Follow an 8px baseline grid.
- Header vertical padding: 16px on desktop, 12px on mobile.
- Layout: two regions — leading (title ± subtitle) and trailing (actions). Use flex with center alignment.
- Keep icon spacing at 8px between icon and label.

## Buttons & Actions
- Primary: filled/contained style — main call-to-action (e.g., "New").
- Secondary: outlined or text — less prominent actions like "Filters" or "Clear".
- Touch targets must be at least 44x44 px.

## Filters & Dropdowns
- Use elevation (2dp) for dropdown panels. 16px inner padding and 12px gaps between controls.
- Active filter badge: circular, small (12–20px based on context), high contrast (WCAG AA or better).

## Colors & Tokens
- Map existing repo color classes to Material tokens:
  - primary -> primary
  - bg-accent -> secondary / accent
  - bg-surface -> surface
  - text-primary/text-secondary -> on-surface variants

## Accessibility
- All interactive elements must have aria-labels or visible labels.
- Keyboard focus must be visible and tabbable in a logical order.
- Contrast ratios must meet WCAG AA (4.5:1 for normal text; 3:1 for large text).

## Responsiveness
- On narrow widths (<640px), collapse non-primary actions into an overflow menu.
- Ensure dropdowns and popovers are positioned inside viewport and reachable via keyboard.

## Examples
- See src/pages/orders/OrdersHeader.tsx for a concrete implementation.

## Notes
- Prefer using existing utility classes for spacing and colors. Use a small component-scoped CSS module for tokens and layout refinements when needed.
