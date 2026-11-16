# Scene Composer — style guide

The rules every UI change follows, and when each one applies. This file is the
source of truth for the app's look; the shareable copy is the Claude Doc
"Scene Composer style guide". Where this file and the code disagree, fix one of
them in the same change.

Scene Composer has one look, a neo-brutalist "poster grid": paper canvas, white
cards, black ink, hard offset shadows in dusty rose, and red for whatever is
selected. Desktop only.

## 1. Principles

1. **One look, everywhere.** Every panel, card, button and dialog uses a black
   border and a hard shadow with no blur. No gradients, no soft shadows, no
   translucency except the loading scrim.
2. **Colour has a job.** Grey means choosing, red means chosen, charcoal means
   go, amber with stripes means change. A colour
   never does a second job.
3. **One main action per screen.** Among buttons, only the primary carries a
   shadow. Cards, pill rows and alerts keep theirs; the rule is about buttons.
4. **Say what is happening.** Every wait names what the app is doing; every
   error says what to do next, next to what failed.
5. **Desktop only.** Design and review at desktop widths.
6. **Brand-neutral shell.** Interface copy never names a brand. The brand
   appears only where the user's SKU appears.

## 2. Color

All colours come from `src/client/styles/tokens.css`; components never
hard-code one. The only exception is the staging band (`ui/EnvBand`). Light
only.

| Role | Token | Value | In play |
| --- | --- | --- | --- |
| Canvas | `--neo-paper` | #f4f1ea | Page background; no white window |
| Surface | `--neo-card` | #ffffff | Cards, panels, inputs, dialogs, secondary buttons |
| Ink | `--neo-ink` | #000000 | Text, borders, icons, focus outline |
| Choosing | `--neo-hover` | #e5e5e5 | Hover/press on anything you can pick; open accordion; warning alert |
| Chosen | `--neo-selected` (+ `-hover`, `--neo-on-selected`) | #e7223a, white text | Selected card, chip, segment, item, current step; the camera frame |
| Go | `--neo-cta-button` (+ `-hover`, `--neo-on-cta-button`) | #2b2b2b, white text | Primary buttons only |
| Fill grey | `--neo-cta` | #a7a7a7 | Progress fill, workspace edges |
| Change | `--neo-amber` + `--neo-hatch` | #ffcc33 under black stripes | Items marked to change in Sketch Review, always striped |
| Shadow | `--neo-shadow-color` | #cc9999 | Every hard shadow; loader blush |
| Hairline | `--bay-border-hair` | #c9c4b8 | Dividers, canvas grids |
| Secondary text | `--bay-text-3` / `-4` | #45433f / #77746d | Hints, intro copy / disabled, placeholders |
| Warning text | `--bay-warn-text` | #8a5a00 | Warning words on white |

Status (via `Alert`): success #c8f0d4, error #ffd1cc, info white, warning grey
with an amber triangle.

- Grey and amber are fills behind black text, never text colours.
- Red is for selection, the camera frame and the selected angle tab. As text it is
  allowed for warnings only (the ⚠ fix count) and the "Did you know?"
  kicker.
- White text appears only on red and charcoal.

## 3. Typography

| Face | Token | Weights | Used for |
| --- | --- | --- | --- |
| Tilt Warp | `--app-font-head` | 400 only, never bold | Headlines, section titles, primary button labels, loader title, rail numbers |
| Space Grotesk | `--bay-font-sans` | 400, 500, 700 | Body, card copy, secondary button labels, alerts |
| Space Mono | `--bay-font-mono` | 400, 700 | Field labels, pills, step numbers, IDs, prompts, JSON |

| Element | Size |
| --- | --- |
| Step headline | clamp(32px, 4.2vw, 56px), line-height 1.0 |
| Loader title | 34px |
| Panel and page titles | 20–29px |
| Body | 14.5px (90% of 16px), line-height 1.25 |
| Card titles, alert titles, button labels | 12.5–13.5px bold |
| Labels, pills, hints, segments | 12px (`--app-text-min`) |

- **12px floor.** Nothing smaller than `--app-text-min`.
- **Field labels:** Space Mono 12px bold ALL CAPS, a short name only; any
  explanation goes in a hint under the control.
- **ALL CAPS** is for labels, pills, segments, buttons and the loader kicker.
  Tracking: `--app-label-tracking` (0.06em) for labels and kickers,
  `--app-pill-tracking` (0.08em) for round pills.
- **Names** of steps, nav items and pages are Title Case, with "&" for "and"
  (Time & Place, Story & Scene). Sentences are sentence case.

## 4. Layout, borders & shadows

| Region | Rule |
| --- | --- |
| Header | Gray wordmark at left over the rail; nav and user menu at right |
| Step rail | 240px, sticky. Big Tilt Warp number, name, check when done. Current = red row, white text |
| Step headline | Sticky band, paper background, no rule; intro max 640px |
| Action bar | Sticky bottom, 3px top rule. Back (secondary) left, the one primary action right |
| Image frame | 16:9, at most `--app-frame-max-w` so it fits without scrolling |

- Spacing on a 4px rhythm: 8px inside groups, 12px between related controls,
  16px between cards, 24px between regions.
- Borders: 3px ink (`--neo-border`) for panels, cards, md buttons, dialogs,
  alerts; 2px (`--neo-border-thin`) for rows, inputs, pills, chips, small
  buttons, image frames; hairline only for dividers.
- Corners: 3px, 4px (cards, buttons), 6px (windows). Only pills and circles
  are round. The loader card and overlay close buttons are square.
- Shadows: hard rose offsets, no blur: 6.25px cards and primary buttons,
  3.75px small controls, 1.25px pressed, 8.75px on a hovered choice card.
  Pressing moves the control down-right by the shadow it loses. Inputs, pills,
  secondary buttons and anything inside a node card get none.

## 5. Buttons & actions

| Tier | Look | Use |
| --- | --- | --- |
| Primary | Charcoal, white Tilt Warp caps, 3px border, shadow | The single forward action on a screen |
| Secondary (`default`) | White, outlined, bold caps, no shadow | Back, Ask again, Download, Re-arrange |
| Ghost | No border until hover | Icon-only and low-weight actions in cards and dialogs |

- md: 40px tall, 12.5px label. sm: 32px, 12px. Icon-only buttons are square
  and always labelled.
- Labels are verbs. Disabled = 50% opacity, no shadow, and a reason nearby.
- **Close controls, two kinds only.** Inside a dialog: the shared ghost `sm`
  `Button` with `X` at 16, top right, and no second Close button. Over a
  full-screen overlay (node workspace, enlarged image): a 44px white square,
  3px border, `X` at 24, black focus ring.
- Icons are `lucide-react` with an explicit size: 16 in md buttons and the
  header, 14 in sm buttons and chips, 20 in the rail. No emoji.

## 6. Inputs & choosers

| Control | Use when | In play |
| --- | --- | --- |
| Select (searchable) | A long list known by name | Getting Started: country, region, SKU, occasion |
| Text input / area | Free text the agents read | Hero dish, side request, "Describe what you would like to see" |
| Segmented control | 2–6 short exclusive words | Time & Place: kind of place, time of day, Place settings |
| Choice cards (3 equal columns) | Options needing a sentence or picture | Preparation, Plating, Sides, Accent, layouts |
| Angle tabs (4 equal, spanning the drawing; selected red) | One camera angle; the big drawing shows the table from it | Tablescape & Camera: Low, Diner's eye, Looking down, Overhead |
| Switch | One on/off | Show guides, segment bypass |
| Accordion | Detail the user may skip | Rule checks, prompt segments |
| Code block | Exact prompt or JSON | Story & Scene, Prompt node |

- One recommended option carries a black **Suggested** pill; no A/B/C letters.
- The user's own option is "Describe what you would like to see".
- Longer detail sits behind a "More details" pill that opens a dialog.
- Changing an answer that clears later choices warns first, inline.
- Options that can't work yet are hidden; disabled ones say why.
- Keyboard: Tab between controls, arrows within a group, a 3px black focus
  outline that is never removed.

## 7. Dialogs, loaders & feedback

| Pattern | When |
| --- | --- |
| Full-page loader (`LoadingOverlay`): NOW LOADING kicker, step name, pan toss, what is being prepared, percent to 100; no tips | A whole step waits on a model call |
| Progress ring + "Did you know?" tip | Work inside a step: layout, sketch, scene render |
| Inline agent status + skeleton cards, with elapsed seconds | Any other agent call |
| `Alert` | An outcome the user must read, next to what failed |
| `EmptyState` | Nothing there yet, saying why |

- Errors are one friendly sentence on what happened and how to get out; never
  a raw code. Keep the action armed. Limit and permission errors are terminal.
- An expired session shows `SignInPrompt`, not an error.

## 8. Copy & voice

- No "Coca-Cola" or "ProdX" in interface copy; the SKU's own name only where
  the product appears.
- "&" in headlines and nav. Buttons are verbs. Labels are short nouns.
- Knowledge base size is a page count (about 1,800 pages).
- Loading lines say what is happening now; tips are one food-styling fact tied
  to the step.
- Sentences under about 20 words; stylist's words ("charred lemon"); no emoji;
  no exclamation marks except the home CTA "LET'S MAKE A SCENE!".

## 9. Building blocks

### Controls: `src/client/ui/`

Built on `react-aria-components` and styled with a sibling
`<Component>.module.css`. **This directory is the only place that imports
`react-aria-components`.**

| Component | Use it for | Notes |
| --- | --- | --- |
| `Button` | Every clickable action | `variant` `primary` (charcoal, white Tilt Warp caps, rose shadow) / `default` (white, outlined, no shadow) / `ghost`; `size` `md` (40px, 3px border) / `sm` (32px, 2px); `icon`, `loading`, `onPress`. No `autoFocus` prop |
| `TextInput`, `TextArea` | Single/multi-line text | White, 2px border, no shadow; `onPressEnter` submits |
| `Select` | Country / region / SKU / occasion dropdowns | Popover is a bordered card with the full shadow |
| `ChoiceCardGroup` | Mutually exclusive option cards | White card, 3px border + shadow; hover/press = light grey, selected = red with white text; "More details" is a white Space Mono pill that opens the detail dialog |
| `Accordion` | Collapsible sections | Bordered stack; the open row has a light grey header |
| `SegmentedControl` | Chip-style single-select rows | Bordered pills; hover = light grey, selected = red |
| `Switch` | One on/off toggle | Bordered track |
| `CodeBlock` | Prompts and JSON | White, 2px border, Space Mono, copy button with "Copied" feedback |
| `Alert` | Inline outcome the user must read | `tone` `error`/`warning`/`info`/`success` |
| `ProgressBar` | Long generations | Bordered track, mid grey fill |
| `LoadingOverlay` | A whole step waiting on content | The Coca-Cola bottle filling with cola on a bordered white card |
| `SkeletonText`, `SkeletonBlock` | Loading, shaped like the content | |
| `EmptyState` | A region with nothing in it yet | Heading + hint + optional action |
| `ErrorBoundary` | Around the rail and the step independently | |

`SignInPrompt` (`src/client/lib/signIn.tsx`) is rendered when a call finds
the session expired; its Reconnect button refreshes the magic-link session.
Signing in itself is `src/client/auth/LoginPage.tsx`.

### Icons: `lucide-react`

One icon set; `size` always explicit (20 in the rail, 16 in `md` buttons/the
header, 14 in `sm` buttons and chips). Never emoji. In use here: `ClipboardList`
(Brief), `ChefHat` (Preparation), `UtensilsCrossed` (Plating), `Soup`
(Sides), `Store` (Scene), `Camera` (Camera), `Sparkles` (Accent),
`LayoutGrid` (Layout), `FileText` (Story), `Workflow` (Workspace),
`ArrowRight` (continue), `RotateCcw` (ask again / start over),
`Check`/`CircleCheck` (selected / passed), `Download` (downloads), `Copy`
(copy prompt), `LoaderCircle` (spinning, agent working), `ChevronDown`
(select trigger). The workspace canvas adds `ZoomIn`/`ZoomOut`/`Maximize`
(zoom, fit), `Undo2`/`Redo2`, `GripVertical` (node drag handle), `Wand2`
(generate scene), `Keyboard` (shortcuts popover).


## 10. Code rules

- CSS modules only. Colours, borders, shadows, fonts and caps tracking via
  tokens.
- Inside `src/client/ui/`, interactive states use react-aria data attributes
  (`[data-hovered]`, `[data-selected]`, `[data-focus-visible]`,
  `[data-disabled]`), never `:hover`. Native buttons elsewhere may use `:hover`.
- `src/client/ui/` is the only place that imports `react-aria-components`
  controls (dialogs in `workspace/` use its `Modal`/`Dialog`).

## 11. Checklist for a UI change

- [ ] Built from `src/client/ui/` and `src/client/layouts/`; nothing new installed.
- [ ] No hard-coded colours; no text under 12px; amber only with `--neo-hatch`.
- [ ] Only the primary button has a shadow; one primary per screen.
- [ ] Icons from `lucide-react` with an explicit size; icon-only controls labelled.
- [ ] Loading, empty and error states use `Skeleton*`, `EmptyState`, `Alert`, `AgentStatus`.
- [ ] Works from the keyboard.
- [ ] Copy is brand-neutral, names use "&", buttons are verbs.
- [ ] This file still describes the app.
