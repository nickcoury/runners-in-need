# UI Design Mockup Prompts

Use these prompts with image generation tools (Midjourney, DALL-E, etc.) to explore visual directions for Runners In Need. Try several and iterate on what resonates.

## Inspiration Sites

These sites aren't functionally similar to RIN, but they nail the aesthetic and user sentiment we're targeting:

| Site | Why It's Inspiring | Key Aesthetic |
|------|-------------------|---------------|
| **parkrun** (parkrun.com) | Community running, green identity, grassroots warmth, "everyone welcome" vibe | Forest green palette, friendly lowercase branding, real participant photography, accessible type |
| **GiveDirectly** (givedirectly.org) | Radical simplicity signals trust — "we spend on recipients, not websites" | Muted earth tones, generous whitespace, data-forward, minimal navigation |
| **charity:water** (charitywater.org) | Gold standard for nonprofit storytelling + transparency. Interactive maps showing impact | Full-bleed photography, minimal text overlays, cool blue/white, progress-tracking UI |
| **Buy Nothing Project** (buynothingproject.org) | Hyper-local gift economy, peer-to-peer directness with intentional warmth | Handmade feel, community photography, soft colors, conversational tone |
| **Freecycle / Trash Nothing** | Pure utility classifieds — the "Craigslist spirit" done right | Text-forward, minimal imagery, high info density, zero decoration, fast-loading |
| **Ocean Conservancy** (oceanconservancy.org) | Nature palette + emotional imagery without being pushy | Blue-green nature colors, documentary photography, layered content sections |

## Color Direction

- **Primary**: Forest green (#2D6A4F or similar) — trust, nature, calm
- **Accent**: Emerald (#50C878) — energy, CTAs, interactive elements
- **Soft green**: Mint (#3EB489) — backgrounds, hover states, cards
- **Pair with**: White (primary), warm gray (#6B7280), occasional gold for emphasis
- **Avoid**: Red (Christmas effect with green), bright orange (visual clash)

## Prompt Tips

- Use UI/UX vocabulary: "interface", "layout", "Figma mockup", "design system"
- Name every section: "hero, mission statement, need cards, map, footer"
- Add `--no text` to avoid garbled AI text
- Use `--ar 3:2` for desktop, `--ar 9:16` for mobile
- "Dribbble style" or "Behance style" signals high-quality UI output
- Lower `--stylize` values (50-100) produce more functional/literal results

---

## Prompt Variants

### 1. Functional Simplicity (Craigslist Spirit)

> UI design, community donation matching website, clean functional layout, forest green and white color scheme, simple card-based need listings with category tags, search bar and map sidebar, minimal decoration, generous whitespace, sans-serif typography, utilitarian but warm, like Craigslist meets a modern nonprofit, Figma mockup style --ar 3:2 --no text

**Vibe**: Direct, trustworthy, no-nonsense. The design says "we're here to connect you, not impress you." Inspired by GiveDirectly and Freecycle — simplicity IS the brand message.

### 2. Modern Clean Nonprofit

> UI design, nonprofit landing page for a running gear donation platform, modern minimal aesthetic, hero section with community running photography, forest green (#2D6A4F) and white palette with emerald accents, card grid showing donation needs with progress indicators, trust badges, clean navigation with 3-4 items, generous whitespace, Inter or similar sans-serif font, subtle shadows, Dribbble quality --ar 3:2 --no text

**Vibe**: Polished but approachable. Feels like a well-funded nonprofit that still cares about every dollar. Inspired by charity:water and Obama Foundation — bold but accessible.

### 3. Warm Community Platform

> UI design, peer-to-peer community giving platform, warm inviting design, soft green and cream color palette, real photography of runners and community events, card-based listings with location badges and category icons, friendly rounded typography, subtle texture or grain, feels grassroots and genuine not corporate, community bulletin board energy, Behance style mockup --ar 3:2 --no text

**Vibe**: Neighborhood bulletin board meets modern web. Inspired by parkrun and Buy Nothing — the warmth of a community that knows each other. Trust built through genuine feeling, not polish.

### 4. Nature-Forward Athletic

> UI design, outdoor athletic community website, hero with trail running or cross country photography, deep forest green header fading to white content area, bold sans-serif headings, card grid with running shoe icons and location pins, integrated map view with green markers, progress bars showing fulfillment status, clean footer with mission statement, sporty but not aggressive, energetic but calm, Figma design system style --ar 3:2 --no text

**Vibe**: Athletic energy grounded in nature. Inspired by parkrun's brand refresh and Ocean Conservancy's nature palette — the outdoors IS the design language. Feels like a trail, not a gym.

---

## Mobile Variants

Re-run any of the above with these modifications:

> [same prompt as above], mobile responsive design, single column layout, bottom navigation bar, thumb-friendly touch targets, iPhone mockup --ar 9:16 --no text

## Iteration Tips

1. Start with Prompt 1 or 2 — they're the safest starting points
2. If too sterile → add "warm", "community photography", "handmade touches"
3. If too generic → add specific sections: "donation matching cards with size tags", "map with green pins"
4. If too corporate → add "grassroots", "genuine", "bulletin board energy"
5. If too plain → try Prompt 4's athletic direction for more visual energy
6. Mix and match elements from different outputs — use the best hero from one, card layout from another

## Beyond Mockups

Once you have a direction you like, these are useful follow-up prompts:

- **Component detail**: "UI design, donation need card component, shows category icon, title, location, sizes needed, progress bar, pledge button, forest green accent, Figma style"
- **Empty states**: "UI design, empty state illustration for 'no needs found', runner looking at horizon, minimal line art, green monochrome"
- **Icons**: "icon set for running gear donation site, running shoe, shirt, medal, location pin, package, line art style, consistent stroke width, forest green"
