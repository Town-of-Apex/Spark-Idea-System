---
name: apex-modern-design
description: Implements the 'Apex Modern' design system—a premium, professional, traditionalist-modern aesthetic for government and institutional tools. Use when building new UI components, pages, or layout structures to ensure visual consistency.
---

# Apex Modern Design

This skill codifies the specific visual laws of the Apex Modern design system. It prioritizes structure, intentionality, and a zero-clutter professional tone.

## When to use this skill

- **New Page Creation**: When building a new top-level view or dashboard.
- **Component Design**: When creating interactive elements like cards, buttons, or modals.
- **Style Audits**: Use when reviewing existing code to ensure perfect alignment with the signature layering and typography rules.
- **UI Refactoring**: Helpful for stripping out "generic" or "mobile-first" patterns in favor of a sturdy, desktop-class professional aesthetic.

## How to use it

Follow these strict conventions and patterns:

### 1. Surface Layering (The Contrast Rule)

Maintain a stepwise increase in distinction for every nested level. Never place "Level X" on top of itself.

- **L0 (Baseline)**: `bg-canvas` (#f8f9fa) — Use for the root background.
- **L1 (Surface)**: `bg-surface` (#ffffff) — Use for primary containers, cards, and modals.
- **L2 (Inner)**: `bg-inner` (#f1f3f5) — Use for input fields, nested details panels, and recessed sections.

### 2. Layout & Alignment Patterns

- **Traditional Anchor**: Content and titles MUST be left-aligned.
- **Navigation**: Top-row menus only. NO sidebars.
- **Standard Width**: Use `max-w-6xl` as the default container width for headers and primary content to ensure the left-margin anchor remains consistent across all pages.

### 3. Visual "Hardware" (Geometry)

- **Radii**: Use 6px (`rounded-md`) for buttons, 12px (`rounded-xl`) for cards, and 16px+ for large modals.
- **NO Pills**: Pill-shaped buttons (`rounded-full`) are strictly prohibited. Use squirrels/rectangles with soft corners.
- **Passive Shadows**: Strictly prohibited. Shadows should ONLY appear on hover or interaction to indicate "lift." Use `1px border-line` for static separation.

### 4. Zero Emoji Policy

- **Prohibited**: Emojis are banned from the user interface.
- **Replacement**: Use monochrome inline SVGs for clarity or uppercase tracking for metadata importance.

### 5. Interaction & Feedback

- **Elevation**: On hover, use `-translate-y-0.5` and `shadow-md shadow-teal/10`.
- **Tactile Click**: On active press, use `scale-[0.98] transition-all`.
- **Transitions**: Every color/transform change must use `duration-300 ease-out`.

### 6. Technical Constants

- **Teal (#005a70)**: Primary Action/Emphasis.
- **Rosy (#968f8b)**: Metadata/Supportive text.
- **DM Serif Display**: Standard title font (tight tracking).
- **Inter**: Standard UI/Body font.
