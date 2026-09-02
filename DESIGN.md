# Masroof design system

Operate-mode product UI. Calm, precise, "private banking": warm neutral paper, one ink-navy accent, money direction as the only semantic colour, tabular numerals everywhere money appears. Both themes and both directions (LTR/RTL) are first-class. Nothing on screen is a library default.

## Tokens (`src/styles/index.css`)

All tokens are CSS custom properties on `:root`, overridden under `[data-theme="dark"]`, and exposed to Tailwind via `@theme inline`.

### Colour

| Role | Utility | Light | Dark | Use |
|---|---|---|---|---|
| Canvas | `bg-canvas` | `#F4F1EB` warm linen | `#151412` | page ground |
| Surface | `bg-surface` | `#FCFBF8` | `#1D1B18` | cards, sidebar, top bar |
| Surface 2 | `bg-surface-2` | `#F6F3EE` | `#242119` | panels inside cards, table header |
| Surface 3 | `bg-surface-3` | `#EDE9E1` | `#2C2823` | tracks, hover rows, keypad keys |
| Line | `border-line` | `#E5E0D6` | `#2F2B25` | 1px hairlines |
| Line strong | `border-line-strong` | `#D2CBBC` | `#3E3931` | input borders, dividers that must read |
| Ink | `text-ink` | `#1C1B18` | `#EDE9E1` | primary text |
| Ink 2 | `text-ink-2` | `#5B574F` | `#A9A398` | secondary text |
| Ink 3 | `text-ink-3` | `#736E64` | `#767067` | captions, placeholders (AA on surface) |
| Accent | `bg-accent` | `#1E2F52` ink navy | `#3F5B93` | primary buttons, selected nav |
| Accent hover | `bg-accent-hover` | `#172541` | `#4B6AA6` | |
| Accent ink | `text-accent-ink` | `#1E2F52` | `#AFC2E6` | links, active icons, focus ring |
| Accent soft | `bg-accent-soft` | `#E6EBF4` | `#222B3E` | selected backgrounds, info pills |
| Positive | `text-positive` | `#1E7A4B` | `#5FC48A` | income, inflow, "under pace" |
| Positive soft | `bg-positive-soft` | `#E2F1E8` | `#1A2F23` | |
| Negative | `text-negative` | `#B4352A` | `#E8806F` | expenses, outflow, over budget, destructive |
| Negative soft | `bg-negative-soft` | `#F8E4E1` | `#3B211D` | |
| Warning | `text-warning` | `#8F5E00` | `#E3AD4F` | near limit, due soon |
| Warning soft | `bg-warning-soft` | `#F7ECD2` | `#372B16` | |

Rules: accent is for primary action, current selection and focus only. Green/red mean money direction or budget status, never decoration. Colored surfaces tint their text from the same hue.

Category colours live in `src/lib/categories.js` (muted, distinguishable in both themes): terracotta, plum, steel, ochre, jade, teal, rose, mauve, moss, brick, stone. They appear as a 3px leading bar in lists or as an icon tint, never as a filled chip.

### Typography

Latin: **Inter Variable**. Arabic (`[dir="rtl"]`): **IBM Plex Sans Arabic** with Inter as fallback for Latin glyphs. Global `font-feature-settings: "ss01", "cv11"`; every money or count value uses `.num` (`font-variant-numeric: tabular-nums`).

| Step | Class | Size / line | Weight | Tracking |
|---|---|---|---|---|
| Display | `.t-display` | 36 / 40 | 600 | -0.02em |
| H1 | `.t-h1` | 22 / 28 | 600 | -0.01em |
| H2 | `.t-h2` | 17 / 24 | 600 | -0.005em |
| Body | default | 14 / 21 | 400 | 0 |
| Small | `.t-small` | 13 / 18 | 400 | 0 |
| Caption | `.t-caption` | 12 / 16 | 500 | 0.01em |
| Number | `.num` | inherits | 600 | tnum |

Headings in product UI are H2 (card titles) and H1 (page title in the top bar). Display is reserved for the dashboard hero figure and the lock screen.

### Shape, depth, spacing

- Radius: `--radius-sm: 6px` (controls, chips), `--radius-md: 10px` (cards, popovers), `--radius-lg: 16px` (sheets, hero card, dialogs).
- Shadows, exactly two: `shadow-card` (`0 1px 2px rgba(28,27,24,.06), 0 1px 1px rgba(28,27,24,.04)`) and `shadow-float` (`0 12px 32px -8px rgba(28,27,24,.22), 0 2px 6px rgba(28,27,24,.08)`) for popovers, dialogs, sheets.
- Spacing on a 4px grid. Card padding 20px (16 on mobile). Card gap 16px. Section gap 24px. Rows 40px.
- Focus: `focus-visible` shows a 2px `accent-ink` ring offset 2px on the canvas (`.focus-ring`). Never the browser default.

## Layout

- Sidebar 240px, collapsible to a 64px icon rail (tooltips carry labels). Fixed, `inset-inline-start: 0`, mirrors in RTL.
- Top bar 56px, sticky: page title + greeting, month picker where the page is monthly, sync status, language, theme, lock, Clerk user button.
- Content max-width 1240px, padding 24/32px.
- Mobile (< 900px): sidebar hidden; bottom tab bar with Dashboard, Expenses, Income, Ledger, Budgets; top-bar menu opens a Sheet with the rest. Forms on data pages collapse behind a primary button.

## Components (`src/components/ui/`)

Built on Radix primitives (`radix-ui`), styled only through tokens. Each has default, hover, focus, active, disabled and, where relevant, loading/error/empty states.

- **Clerk** (sign-in, sign-up, user button and its popover) is styled once through `src/lib/clerkAppearance.js`, passed to `ClerkProvider` in `src/app/main.jsx` together with the Arabic locale pack (`@clerk/localizations/ar-SA`, loaded on demand). Element styles use the CSS variables so they follow the theme; `variables` carry concrete colours per theme because Clerk derives shades from them.
- **Button** variants: `primary`, `secondary` (outlined), `ghost`, `destructive`, `success`; sizes `sm` (32) `md` (36) `lg` (40) and `icon`.
- **Card** with `CardTitle` (H2 + optional icon + trailing hint).
- **Input / Field**: 36px, `line-strong` border, `accent-ink` ring on focus, inline error text under the field.
- **Select**, **Popover**, **MonthField** (year stepper + 4×3 month grid), **Switch**, **RadioGroup** (segmented), **Tooltip**, **Info** (i badge with tooltip), **Badge** (`neutral`, `positive`, `negative`, `warning`, `accent`, all soft), **Progress** (status coloured), **RingGauge** (arc with animated draw), **Table** (40px rows, `num` amounts end-aligned, category bar via `.cat-row` background on `<tr>` because a pseudo-element on a row becomes an anonymous cell, hover row actions; Date folds into the description subtitle below `sm`), **Dialog** and **Sheet**, **Toast** via Sonner, **Skeleton**, **EmptyState** (line SVG + one action), **CommandPalette** (⌘K quick add / navigate / search).

## Motion

150–250ms, `cubic-bezier(.2,.8,.2,1)`, all CSS-driven (no animation library on the main bundle). Page enters with a 6px rise + fade (`.page-enter`); sections reveal in view via `Reveal` (IntersectionObserver + `.reveal.is-in`); lists stagger 30ms per row (max 12, `.stagger`); KPI numbers count up 700ms (`useCountUp`). Ring arc draws once on mount. `prefers-reduced-motion` disables all of it. No bouncing, no parallax.

## Charts (Recharts)

Grid: 1px `line`, horizontal only, no axis lines, no tick lines. Ticks: `ink-3`, 11–12px, tabular. Series: income `positive`, expenses `negative`, net worth `accent-ink` with a 20→0% fill. Category donut uses category colours. Tooltip is a surface card with `shadow-float`. Legends are text with 8px dots.

## Copy and i18n

Every visible string comes from `t()`. Number formatting stays Latin digits in both locales; `Money` renders inside `<bdi>` and `.num` uses `unicode-bidi: plaintext` so sign and unit keep their order in RTL. Chart containers are `dir="ltr"` (only labels localise). Logical CSS properties throughout; `rtl:` variants only for glyphs that must mirror (chevrons, trend arrows do not mirror). Error messages name the problem and the recovery; toasts confirm the outcome, never repeat the button label.
