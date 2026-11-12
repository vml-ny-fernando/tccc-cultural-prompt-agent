// "Did you know?" lines shown while the app waits on a step. Each one explains,
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
  sides: [
    'People rarely eat a dish on its own. Sides and condiments come from what people in that country actually put on the table with it.',
    'Cutlery follows the dish and the culture. Food eaten by hand gets none, so the table never looks staged.',
  ],
  prep: [
    'The same dish can look very different from one region to the next. How it is prepared decides the colour, height and texture the camera sees.',
  ],
  plating: [
    'The vessel sets the tone before the food does. A paper-lined basket says street food, a round entree plate says sit-down.',
    'Side bowls and ramekins are never plain white. A little colour or texture in the dishware makes the food feel made, not shot in a studio.',
  ],
  story: [
    'Stylists brief the shot before they shoot it. The scene story lists every item and why it is there, so you can spot what is off before any image is made.',
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
