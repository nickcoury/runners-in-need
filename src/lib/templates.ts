/**
 * Need templates — injected into the free-text body when an organizer
 * clicks a category button. They can edit freely after insertion.
 */

export const needTemplates = {
  shoes: {
    label: "Running Shoes",
    icon: "👟",
    example: `We need running shoes for our team:

- 3 pairs men's size 9-9.5
- 1 pair men's size 10-10.5
- 2 pairs women's size 7-8

New or lightly used preferred. Any brand welcome.`,
  },
  apparel: {
    label: "Apparel",
    icon: "👕",
    example: `We need running apparel for our athletes:

- 5 men's shorts (M/L)
- 3 women's tops (S/M)
- 4 pairs running socks (any size)

Moisture-wicking preferred. New or gently used.`,
  },
  accessories: {
    label: "Accessories",
    icon: "🎽",
    example: `We're looking for running accessories:

- Water bottles (any size)
- Race bibs/medals for motivation
- Reflective gear for safety
- Running belts or armbands

Any condition welcome.`,
  },
  other: {
    label: "Other Gear",
    icon: "📦",
    example: `We need the following for our running program:

[Describe what you need, including quantities and any size/condition preferences]`,
  },
} as const;

export type CategoryTag = keyof typeof needTemplates;
export const categoryTags = Object.keys(needTemplates) as CategoryTag[];
