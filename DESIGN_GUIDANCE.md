# Apex Modern Design System: Visual Identity & Implementation Guidance

This document is the definitive source of truth for the **Apex Modern** design system—a "Traditionalist-Modern" aesthetic designed for the Town of Apex. It prioritizes professional structure, visual clarity, and a premium "government-but-dynamic" feel.

---

## 1. Design Philosophy: "The Modern Professional"

Apex Modern rejects the "generic startup" look (pill buttons, excessive centering, extreme roundness) in favor of a sturdy, intentional architecture.

*   **Left-Aligned Authority**: Content should almost always be left-aligned. Centering is perceived as "AI-generated" or "mobile-first" and should be avoided for desktop-class operational tools.
*   **Structural Depth**: Depth is achieved through **Surface Layering** and subtle borders rather than passive drop shadows.
*   **Purposeful Motion**: Animations should feel like physically moving elements (lifts, slides) rather than simple fades.
*   **Zero Emoji Policy**: Emojis are strictly prohibited. Use text or clean monochrome SVGs to maintain a high-trust, professional tone.

---

## 2. Color Palette & Surface Layering

The system utilizes a stepped hierarchy where each subsequent "layer" is incrementally distinct from its parent container.

### Core Branding
| Token | Hex | Usage |
| :--- | :--- | :--- |
| `teal` | `#005a70` | **Primary.** Headings, active buttons, positive states. |
| `forest` | `#44883e` | Secondary accents, success states. |
| `gold` | `#f1be48` | Strategic highlights, trending indicators. |
| `copper` | `#d75742` | Alerts, destructive actions, attention-grabbers. |
| `rosy` | `#968f8b` | Muted text, secondary labels, metadata. |

### The Layering Stack (Essential for Contrast)
| Level | Token | Hex | Usage |
| :--- | :--- | :--- | :--- |
| **L0: Baseline** | `bg-canvas` | `#f8f9fa` | Page background. |
| **L1: Surface** | `bg-surface` | `#ffffff` | Cards, Modals, primary sections. |
| **L2: Inner** | `bg-inner` | `#f1f3f5` | Form fields, nested textareas, sidebars. |

---

## 3. Typography Standards

The system pairs a classic, high-contrast Serif with a high-performance functional Sans-Serif.

*   **Headings**: `DM Serif Display`
    *   *Usage*: Page titles, hero text.
    *   *Classes*: `font-serif text-teal tracking-tight leading-tight`
*   **Interface**: `Inter` (or Modern Sans)
    *   *Usage*: Navigation, labels, body text, inputs.
    *   *Classes*: `font-sans text-stone-800`
*   **Metadata**: `Inter` (Small/Bold/Tracked)
    *   *Classes*: `text-[10px] font-bold uppercase tracking-[0.2em] text-rosy`

---

## 4. Geometry & Spacing Rules

Avoid "perfect circles." Stick to intentional squircular geometry.

### Radii (Corner Roundness)
*   **Interactive (Buttons/Inputs)**: `rounded-md` (6px) or `rounded-lg` (8px). 
*   **Primary Containers (Cards)**: `rounded-xl` (12px).
*   **Large Components (Modals/Heros)**: `rounded-2xl` (16px) or `rounded-[32px]`.
*   **Rule**: NO pill shapes (`rounded-full`).

### Standard Spacing Constants
*   **Page Gutter**: `px-6 sm:px-8`.
*   **Vertical Padding**: `py-12` (standard), `pb-32` (allow room for fixed headers/footers).
*   **Section Gaps**: `gap-6` or `gap-8`.
*   **Inner Card Padding**: `p-6` or `p-8`.

---

## 5. Structural Layout: The Page Template

Every view MUST follow the `PageTemplate` structure to ensure the "anchor point" for titles is identical across the system.

### Header Standards
*   **Max Width**: Standardized to `max-w-6xl` (1152px) for desktop clarity.
*   **Left Margin**: `mx-auto` on the container ensures consistent centering of the left-aligned content.
*   **Title Color**: Always `text-teal`.
*   **Separator**: A `1px border-b border-line` with `pb-8` should separate the header from the content.

### Components
1. **Header Navigation**: Top-aligned row. Active items use `bg-teal/10 text-teal`.
2. **Cards**: `bg-surface` + `border-line` + `rounded-xl`. No shadow until hover.
3. **Fields**: `bg-inner` + `border-line` + `focus:ring-teal`.

---

## 6. Interaction & Motion

Interaction should feel tactile and responsive.

### Active/Hover States
*   **Passive State**: No shadows. Flat border only.
*   **Hover State**: `-translate-y-0.5`, `shadow-md`, `shadow-teal/10`, and `border-teal/30`.
*   **Click State**: `scale-[0.98]` (a brief "press" effect).
*   **Transitions**: `transition-all duration-300 ease-out`.

### Tooltips
*   Required for all non-text buttons or complex labels.
*   **Style**: Dark background (`bg-stone-800`), small text, subtle entrance animation.

---

## 7. Iconography Code

*   **NO Emojis**: Strictly prohibited.
*   **Icons**: Monochrome inline SVGs.
*   **States**: Icons should change color (e.g., `text-rosy` to `text-teal`) or fill (`fill-transparent` to `fill-teal`) on interaction.

---

## 8. Development Implementation (Tailwind v4 / CSS)

```css
@theme {
  --color-teal: #005a70;
  --color-canvas: #f8f9fa;
  --color-surface: #ffffff;
  --color-inner: #f1f3f5;
  --color-line: #e9ecef;
}

body {
  @apply bg-canvas text-stone-800 antialiased font-sans;
}
```

_Final Directive: If a component looks "too simple," increase density via Metadata labels and check that the Surface Layering (L0 vs L1 vs L2) is distinct._
