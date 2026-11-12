// "Did you know?" lines shown under the progress ring while the app waits on a step
// (never in the full-page loading modal with the pan, per Fernando 2026-11-12). Each one explains,
// in a food stylist's terms, a rule the app is applying at that moment, so the
// person learns why the table comes out the way it does. Keep every line true to
// what the code actually does (shared/scene.ts, shared/solver.ts, agent prompts).

export const STYLING_TIPS = {
  oddCount: [
    'Food stylists group items in odd numbers, like three or five. An even count splits into pairs and the eye stops travelling around the table, so when yours lands on an even number we add one small accent that belongs with the meal.',
  ],
  layout: [
    'Food stylists group items in odd numbers, like three or five. Odd groups keep the eye moving around the table instead of settling on pairs.',
    'The table is built in three layers: the dish and the drink up front as co-heroes, sides just behind, and small accents filling the gaps.',
    'Every plate, bowl and bottle is placed at its real size, so the drink never looks like a toy or a tower next to the food.',
    'Each diner’s drink stands at 3 o’clock from their plate, on their right, where a real diner would reach for it.',
    'Stylists leave breathing room between items so each one reads clearly. When the table gets crowded, the smallest accent goes first.',
  ],
  sketch: [
    'A sketch is the stylist’s rough before the shoot. Moving a bowl here costs seconds, moving it in a finished photo means making the photo again.',
  ],
  scene: [
    'The 3D layout goes to the image model with the prompt, so every item lands where the layout put it.',
    'Every plate, bowl and bottle was placed at its real size, so the drink stays in true proportion to the food.',
    'Stylists shoot the table at the height a diner sees it. The camera angle you picked sets both the table and the room behind it.',
  ],
} satisfies Record<string, string[]>;
