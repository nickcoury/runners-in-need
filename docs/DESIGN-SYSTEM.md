# Runners In Need - Design System

Derived from the reference mockup in `design/reference-mockup.png`.

## Color Palette

| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| Primary | Dark forest green | `#2D4A2D` | Header, footer, primary buttons, strong text |
| Primary hover | Deeper green | `#1F361F` | Button hover states |
| Accent | Emerald green | `#3D7A3D` | Secondary buttons, links, active states |
| Background | Off-white/light gray | `#F5F5F5` | Page background behind cards |
| Surface | White | `#FFFFFF` | Cards, modals, form inputs |
| Text primary | Near-black | `#1A1A1A` | Headings, body text |
| Text secondary | Medium gray | `#6B7280` | Descriptions, metadata |
| Text muted | Light gray | `#9CA3AF` | Timestamps, helper text |
| Urgent/warning | Amber | `#D97706` | Expiring needs, urgent badges |
| Success | Green | `#16A34A` | Fulfillment confirmations |
| Border | Light gray | `#E5E7EB` | Card borders, dividers |

## Typography

- **Font family**: System sans-serif stack (`Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`)
- **Headings**: Bold weight, dark forest green or near-black
- **Body**: Regular weight, gray-700 for descriptions
- **Metadata**: Small text, gray-500
- **Functional density**: Compact line-height for card content, generous for reading pages

| Element | Size | Weight | Color |
|---------|------|--------|-------|
| Site title | 1.25rem (xl) | Bold | White (on green header) |
| Page heading | 1.875rem (3xl) | Bold | Near-black |
| Card title | 1rem (base) | Semibold | Near-black |
| Card description | 0.875rem (sm) | Regular | Gray-600 |
| Category pill | 0.75rem (xs) | Medium | White on colored bg |
| Button text | 0.875rem (sm) | Medium | White (primary) / Green (secondary) |
| Metadata | 0.75rem (xs) | Regular | Gray-400 |

## Layout

### Header
- Full-width dark forest green bar
- Logo left, nav links center-right, sign-in button far right
- Search bar integrated into header (white input on dark bg)
- Sticky on scroll

### Category Filter Bar
- Horizontal row of pill buttons below header
- "All" selected by default (filled green)
- Other pills are outlined/ghost style until selected
- Categories: All, Shoes, Apparel, Accessories, Other
- Scrollable on mobile

### Main Content: Card Grid + Sidebar
- **Desktop**: 3-column card grid with right sidebar (roughly 75/25 split)
- **Tablet**: 2-column grid, sidebar collapses below
- **Mobile**: Single column, sidebar sections between/below cards

### Need Cards
- White background, subtle border (`border-gray-200`), slight rounded corners (`rounded-lg`)
- Category tag as colored badge at top-left
- Title: semibold, 1-2 lines
- Description: gray, truncated to 3 lines (`line-clamp-3`)
- Footer row: pledge count (left), expiry info (right)
- "Match Need" / "Pledge Gear" button at bottom (full-width green)
- Hover: border color shifts to green

### Sidebar
- **Map widget**: Embedded Leaflet map with green pins, ~300px tall
- **Urgent needs**: Compact list of needs expiring soon
- **Recent posts**: Latest 3-5 needs, text-only compact list
- **How it works**: 3-4 step numbered list

## Components

### Buttons
- **Primary**: `bg-[#2D4A2D] text-white rounded-lg px-4 py-2 hover:bg-[#1F361F]`
- **Secondary/outline**: `border border-[#2D4A2D] text-[#2D4A2D] rounded-lg px-4 py-2 hover:bg-green-50`
- **Ghost/pill**: `px-3 py-1 rounded-full text-sm` (for category filters)

### Category Badges
- Small colored pills on cards
- Shoes: `bg-green-700 text-white`
- Apparel: `bg-blue-600 text-white`
- Accessories: `bg-amber-600 text-white`
- Other: `bg-gray-500 text-white`

### Form Inputs
- White background, `border-gray-300`, `rounded-lg`
- Focus: `ring-2 ring-green-700 border-green-700`
- Labels: `text-sm font-medium text-gray-700`

### Search Bar (Header)
- White input on dark green header
- Placeholder: "Search needs, items, locations..."
- Search icon left, full-width on mobile

## Spacing

- Page max-width: `max-w-6xl` (1152px) — slightly wider than current 5xl for the grid+sidebar layout
- Card padding: `p-4`
- Card gap: `gap-4` (desktop), `gap-3` (mobile)
- Section spacing: `py-6` between major sections
- Header height: ~56-64px

## Design Principles (from mockup)

1. **Information density over whitespace**: Cards are compact, showing max info per screen. This is a utility site, not a marketing site.
2. **Green = action**: The forest green is used for interactive elements and brand identity, not decoration.
3. **Functional categorization**: Filter pills, category badges, and sidebar sections all help users find what they need fast.
4. **Map is prominent**: Not buried on a sub-page — visible on the main browse view as a sidebar widget.
5. **Cards are scannable**: Title → description → action. No images on cards (the content IS the UI).
