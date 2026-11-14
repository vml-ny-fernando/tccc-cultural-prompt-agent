---
country: germany
ou: EOU (from the TCCC ProdX Easter brunch brief, 12 Nov 2026)
status: DRAFT — NEEDS SME/HUMAN REVIEW, PENDING NATIVE-REVIEWER SIGN-OFF —
  third country file built with full WebSearch verification (after the
  Uruguay pilot and the UK build)
research_method: Claude web research (WebSearch only — WebFetch/direct page
  reads were blocked by network egress for every domain attempted, consistent
  with every prior research round on this project). Built as a verification-
  and-merge pass over `knowledge-base/scratch-germany-model-knowledge-draft.md`,
  a model-knowledge-only scaffold produced by a separate, tool-less Claude
  session (branch `claude/nations-batch-1`) — every claim in that scaffold
  was independently checked here, not carried over on trust. See RESEARCH
  LOG for what was confirmed, corrected, or left flagged.
date_drafted: 2026-09-24
---

# Germany

## HARD STAGING RULES — GERMANY (read before any scene)

- **No alcohol, ever.** No beer, wine, Apfelwein, schnapps or Glühwein in any
  part of the frame, and no alcohol-coded vessel even when empty: litre
  steins, wheat-beer or Kölsch glasses, wine glasses, stoneware jugs,
  Christmas-market mugs, shot glasses. No brewery signs, beer umbrellas,
  taps, bar backs or beer crates. Coca-Cola is never shown as a mixer. In
  beer gardens, inns, festivals and Christmas markets, frame on the food,
  the hero SKU and non-drinking details; other tables show no drinks.
- **One hero SKU, chosen by the brief.** No other drinks are staged:
  coffee, tea and juice cups stay out of the hero zone (Kaffee und Kuchen
  shows cake only). No competitor colas or cola-orange mixes.
- **EU caps are tethered.** Since July 2024 every EU single-use PET bottle
  has its cap tethered to the neck. An open bottle keeps its cap hanging
  from the neck, never set beside it. Multi-serve packs (1.25 L) go with
  several glasses (clear tumblers, ice and a lemon slice) and a meal for
  several people. Single-serve packs (330 mL can or glass) go with one
  portion.
- **Not Bavaria by default.** No Lederhosen, Dirndl, Alpine chalet,
  cuckoo clocks or Oktoberfest look unless the brief names Bavaria. The
  default home is a rented city flat in a mid-sized western German city.
- **Nothing legible, no marks.** No readable signs, menus, labels or
  prices; no brand marks except the hero SKU; the deposit (Pfand) logo
  generic or absent. No named landmarks.
- **People.** At most two adults in a standard scene, faces cropped or
  soft; never a full flag. Children: none identifiable. A client brief
  may allow children aged 6–12 with faces hidden (Easter brunch brief,
  approved by Fernando, 13 Nov 2026).
- **No religious symbols as subjects** (crucifix, church blessing), even
  at Easter and Christmas. This is brand policy, not a claim that German
  homes are secular: Catholic homes in Bavaria often have a corner
  crucifix (*Herrgottswinkel*); keep it out of frame or soft.
- **Banned names.** Never use these in captions, menus or labels:
  *Zigeunerschnitzel* / *Zigeunersauce* (say "paprika schnitzel" or
  "paprika sauce"; "Zigeuner" is a slur against Sinti and Roma),
  *Mohrenkopf* and *Negerkuss* (say *Schokokuss*, chocolate marshmallow
  kiss; both old names are racist).
- **Bavarian dishes only on a Bavarian brief.** When the app suggests
  sides, accents or a second dish, use national dishes; Weißwurst,
  Haxe, Obatzda, Leberkäse and Knödel only when the brief names Bavaria
  or the hero dish is Bavarian.

### Occasion map (app occasion → what to stage)

| App occasion | German register | Where in this file |
|---|---|---|
| Brunch | Weekend or holiday late breakfast at home: rolls, eggs, cold cuts, cheese, jam; Easter brunch (Osterfrühstück) | CELEBRATIONS › Easter brunch; DISH CATALOG › Brötchen |
| Lunch | Weekday warm lunch (Mittagessen): canteen, Imbiss, bakery roll, Döner | ENVIRONMENT & STAGING SCENES; Street food & Imbiss |
| Sunday Lunch | The Sunday roast family table: Schnitzel, Rouladen, Sauerbraten, Schweinsbraten, Knödel, red cabbage | Schnitzel & pan-German classics; Traditional inn |
| Afternoon | Kaffee und Kuchen (15:00–16:30): cake slices, cake forks, whipped cream, no coffee cups in frame | Kaffee und Kuchen & sweets |
| Dinner | Abendbrot (cold bread board, 18:00–19:00) or a warm dinner; offer both | Abendbrot spread; Rented-apartment kitchen-dining corner |
| Late Night | Imbiss after 22:00, Döner shop, Späti stoop: paper trays, foil, neon | Imbiss stand; Döner shop; Currywurst |

## FILE ROLE & METHOD

This is Germany's single national file. Per the orchestrating session's
decision (see `DECISIONS.md`, not re-litigated by this research pass), it
holds full, authoritative depth for the whole country, organized around an
internal **regional map** (below) rather than a national-index-plus-regional-
files split. This is a different resolution from the UK's (index +
`uk-scotland.md`) and is justified on different evidence — see ZONE
CHARACTERIZATION for why Germany's regional variation, real and heavy as it
is, resolves at the **dish and vocabulary level** rather than the
food+vocabulary+architecture triple-axis break that earned Scotland its own
file.

### Structural decision (already made, not re-litigated by this pass)

**One file, `germany.md`**, carrying a heavy schema §4.6 variant load (far
more coexisting-variant disclosure than any single dish in the UK file) and
an internal regional map spanning Bavaria, Baden-Württemberg, Rhineland/NRW,
Hesse/Frankfurt, the Palatinate, the North, Berlin/Brandenburg, and
Saxony/Thuringia/the former East. **A documented future-trigger, not an
action item for this pass**: if Bavarian-specific prompt usage ever exceeds
roughly 30% of Germany's total prompt volume, a future `germany-bavaria.md`
regional file may be split out, the same way Scotland was split from the UK
index once its distinctness was confirmed. Nothing in this pass's research
overturns that plan — if anything, Bavaria's dish density (Schweinsbraten,
Haxe, Weißwurst, Leberkäse, Obatzda, the Brezel, multiple Knödel types,
Steckerlfisch, Schäufele, Dampfnudel) is the single densest regional cluster
in this file, which is exactly the kind of volume the spinout trigger
anticipates.

### Scope (inherited from the task brief, not re-litigated)

Brunch, lunch, afternoon, dinner, late night and snacks (the app's occasions; see the OCCASION MAP at the top). **A plain weekday breakfast is out of scope**; weekend and holiday brunch is in (added 2026-11-13). No beverages other
than Coca-Cola are documented as prompt subjects — coffee, beer, wine,
Apfelwein, and Glühwein are all real and constantly present in German food
scenes (see the alcohol-exclusion rule below and the Kaffee-und-Kuchen entry)
but are not catalogued here as things to depict.

### Alcohol exclusion: accepted as a hard rule, not re-litigated by this pass

**This is a structural/policy decision made by the orchestrating session**,
based on the draft's own resolution, and this pass's job was to verify it
against `coca-cola-guidelines.md`, not to second-guess whether the rule is
needed. Beer, wine, Apfelwein, and Glühwein genuinely dominate many of this
file's real settings — beer gardens, the Munich autumn folk festival (see
FESTIVAL & OCCASION CALENDAR), wine festivals, Christmas markets. That market
reality is recorded honestly throughout this file so a prompt-writer
understands what a scene is really compensating for. **But no image built
from this file may show alcohol, an alcohol-coded vessel (even empty), or
alcohol branding, and Coca-Cola may never appear as a mixer** — every
alcohol-heavy real setting gets a food/Coca-Cola/people framing instruction
instead. Full rule: see COCA-COLA MARKET INTEGRATION §"Alcohol exclusion"
below.

**Cross-check against `coca-cola-guidelines.md` (what this pass actually
verified, per the task brief).** `coca-cola-guidelines.md` as it stands
today documents the Coca-Cola *product's* representation (can/bottle
dimensions, logo-fidelity findings, hero-zone/depth-hierarchy composition
rules) — it does **not** currently contain any responsible-marketing,
alcohol-adjacency, or children's-marketing language of its own. That is not
a gap this pass is asked to fill (the task scoped this file, not a rewrite
of the brand file), but it is worth recording precisely rather than assuming
either way: **a real, current TCCC policy exists and was found via
WebSearch** — The Coca-Cola Company's public Responsible Marketing Policy
states it will not market directly to children under 13 (defined as media
where 30%+ of the audience is under 13) and will not advertise in primary
schools, and its separate Responsible Alcohol Marketing Policy (RAMP)
commits to marketing only to those above the legal purchase age and never
implying Coca-Cola is consumed as or with alcohol in a way that normalizes
underage or irresponsible drinking. [CONFIDENCE: HIGH — the policies are
published directly by The Coca-Cola Company] [S1, S2]
This file's own alcohol-exclusion rule and children/schools caution (below)
are **consistent with and independently corroborated by** that real policy
— this pass did not have to invent a rationale, it found one. **Flagged as
a candidate queue item, not done in this pass**: `coca-cola-guidelines.md`
itself could usefully cite these two policies directly for every future
country file to reference, rather than each country file re-discovering
them; this file does not make that edit, since it's outside this task's
scope and risks colliding with the parallel Spain-file session's own edits
to shared files.

### Regional map

| Culinary region | Signature in-scope dishes (→ this file's DISH CATALOG) | Setting cues | Confidence |
|---|---|---|---|
| **Bavaria** (Altbayern, Franconia, Swabian Bavaria) | Schweinsbraten, Schweinshaxe, Weißwurst, Leberkäse, Obatzda, Brezel, Knödel, Wurstsalat, Steckerlfisch, Hendl, Nürnberger sausages, Schäufele (Franconia), Dampfnudel | Beer garden under chestnut trees, gravel; dark-wood inns; onion-dome churches; Alpine foothills in the south only | MEDIUM-HIGH — dish set and setting cues corroborated across multiple independent food-history/tourism sources this pass, though not each cross-checked individually against a single regional-boundary source the way the UK's Scotland split was |
| **Baden-Württemberg** | Maultaschen, Käsespätzle, Linsen mit Spätzle, Schupfnudeln, Flammkuchen (Baden), Zwiebelkuchen, Black Forest cake | Half-timbered villages, Black Forest wood interiors, vineyard slopes, Swabian-Alemannic carnival masks | MEDIUM-HIGH — Käsespätzle and Flammkuchen's regional homes confirmed this pass |
| **Rhineland / NRW** | Sauerbraten, Himmel un Ääd, Reibekuchen, Halve Hahn, Currywurst (Ruhr claim), Mettbrötchen | Brauhaus long tables (no glasses in frame), Cologne/Düsseldorf corner kiosks (*Büdchen*), Ruhr industrial heritage, Rhine meadows | MEDIUM — carried largely from the draft, spot-checked rather than exhaustively verified |
| **Hesse / Frankfurt** | Grüne Soße, Handkäs mit Musik, Frankfurter sausages | Apfelwein taverns (vessels excluded from frame), sandstone old town | MEDIUM-HIGH — Grüne Soße and Handkäs mit Musik both confirmed this pass |
| **Palatinate (Pfalz)** | Saumagen, Flammkuchen, Leberknödel, Zwiebelkuchen | Wine-village courtyards, vineyards | MEDIUM — not independently re-verified this pass beyond Flammkuchen |
| **North** (Hamburg, Bremen, Lower Saxony, Schleswig-Holstein, Mecklenburg-Western Pomerania) | Fischbrötchen, Labskaus, Grünkohl mit Pinkel, Matjes, Rote Grütze, Franzbrötchen | Harbour kiosks, red brick, dykes with sheep, hooded wicker beach chairs, flat light, big skies | MEDIUM-HIGH — Labskaus confirmed and corrected this pass (see DISH CATALOG) |
| **Berlin / Brandenburg** | Currywurst, Döner, Eisbein, Königsberger Klopse, Buletten, Spreewald pickles | Imbiss under S-Bahn arches, late-night corner shops (*Späti*), grand old-building courtyards, the former airfield park | HIGH — currywurst's Berlin claim and the Späti's Berlin-specific culture both independently confirmed this pass |
| **Saxony / Thuringia / former East** | Thüringer Rostbratwurst, Thüringer Klöße, Rouladen, Soljanka, Leipziger Allerlei, East-style Jägerschnitzel, rotisserie "Broiler" chicken, Quarkkeulchen | Market-square charcoal grills, Baroque old towns, prefabricated housing estates for modern everyday realism | MEDIUM-HIGH — East-style Jägerschnitzel's GDR-canteen origin confirmed this pass; Thüringer Rostbratwurst's PGI dimensions confirmed |

**East/West note, corroborated this pass**: some dishes genuinely differ in
identity, not just prevalence, across the former inner-German border.
Jägerschnitzel is the clearest case — see the DISH CATALOG entry — and this
pass found real, sourced confirmation that the East German "Jägerschnitzel"
(breaded Jagdwurst sausage with tomato sauce and noodles) was a specific,
lower-cost wartime/GDR-era substitution, commonly served in school and work
canteens, genuinely distinct from and not merely a regional variant on the
West's mushroom-sauce dish. [CONFIDENCE: HIGH] [S3]

---

## QUICK-REFERENCE: GENERIC SCENE REGISTERS

| Generic scene type | What to draw on |
|---|---|
| **Imbiss (street-food stand)** | A stainless-steel or white counter, a backlit photo menu board in German, standing-height tables (~110cm), squeeze-bottle condiments, a small awning. The default currywurst/Bratwurst/Pommes register. |
| **Döner/kebab shop** | A vertical rotisserie spit behind glass, steel salad trays, stacked flatbread, tile or neon finishes, a German-language menu board. |
| **Beer garden / traditional inn (*Wirtshaus*, *Gasthaus*, *Brauhaus*)** | Gravel ground and horse-chestnut canopy (beer garden) or dark wood panelling, tiled stoves, and heavy tables (inn/Brauhaus). **Alcohol-excluded framing applies** — see COCA-COLA MARKET INTEGRATION. |
| **Bakery counter (*Bäckerei*)** | A glass case of rolls and cakes, a high standing ledge, paper bags, a basket of mixed Brötchen. |
| **Christmas market** | Wooden huts with fir garlands, warm string lights, steam off giant pans, early winter dusk. **Alcohol-excluded framing applies** (mulled-wine mugs are the dominant real-world vessel and may never appear). |
| **Späti (Berlin late-night corner shop)** | A narrow, cluttered, owner-operated shopfront (Berlin has roughly 1,000 of them), glass-door drink coolers, a sweets rack, people sitting on the kerb, a bench, or old-building stone steps at dusk. A genuinely Berlin-specific register, not a generic "corner shop." [HIGH] [S4, S5] |
| **Weekly market (*Wochenmarkt*)** | A square with striped awnings, produce crates, a grill truck, a cheese van. |
| **Canteen / Mensa** | A tray line, plastic trays, white ceramic, a cutlery bin, a daily menu board — the everyday warm-lunch register for students and office workers. |
| **Harbour kiosk (North)** | A fish-roll counter with a glass display case, gulls, container cranes in haze. |

Full background-first profiles for the main venues: see VENUE PROFILES below.

---

## VENUE PROFILES

Schema §5.9 applies: the default camera is a close-up hero (sharp table,
soft room), so each profile leads with what reads in the soft background.
Wave 1 (2026-10-01) covers the six most-used German staging venues: the
rented-apartment kitchen-dining corner, the apartment balcony (with the
allotment as a variant), the traditional inn (*Wirtshaus* / *Gasthaus*),
the Imbiss stand, the Döner shop and the Public Viewing fan mile.
National default zone: this file has no single default region (see ZONE
CHARACTERIZATION); when a brief names none, use a rented apartment in a
mid-sized western German city and a non-Bavarian inn, and add Bavarian
or northern detail only when a brief names the region (the Anti-Patterns
caution). File-wide rules hold: the alcohol-exclusion rule (no beer, wine,
alcohol-coded vessels even empty, beer crates, beer-garden mugs or
mulled-wine mugs), nothing legible, no brand marks, never a full flag, no
identifiable children, no more than about 2.5 background faces and none
sharp; the brief dictates the SKU.

**App options (Kind of place, 2026-10-18).** Each profile heading ends with
"· app:" and the Scene-step options it serves, so the app pulls the right
profile. Coverage:

| App option | Germany profile |
|---|---|
| Dining room | Rented-apartment kitchen-dining corner (outdoor: Apartment balcony, with the allotment variant) |
| Gen Z apartment | Shared flat (WG) or first rental, young renters |
| Kitchen island | New-build or house kitchen with island (owner-built houses only; rare in rentals, where the peninsula variant is the honest fit) |
| Sit-down | Traditional inn (Wirtshaus, Gasthaus) |
| Counter service | Imbiss stand; Döner shop |
| Café | Neighbourhood café (Kiezcafé), with the bakery-café variant |
| Modern bistro | Modern neighbourhood restaurant, new German cooking |
| Street market | Weekly market (Wochenmarkt) |
| Food truck | Imbiss stand (its trailer form, the *Imbisswagen*, is Germany's real food truck); hot-food trailers also in Weekly market |
| Park | City park lawn (Volkspark, Liegewiese) |
| Beach or waterfront | Baltic beach and promenade (river and lake fronts as variants) |
| Stadium or event | Public Viewing fan mile (no stadium-forecourt profile yet; the Bundesliga stadium sausage stand is a candidate) |

#### Venue: Rented-apartment kitchen-dining corner (*Wohnküche* / *Essecke*) (home, indoor) · app: Dining room
- Prompt-ready line: "A German rented-apartment kitchen at Abendbrot: the
  wooden table sharp under a low warm pendant, behind it a softly blurred
  white fitted kitchen with a tiled splashback strip, a white radiator
  under a tilt-and-turn window and the pale façade of the building
  opposite in blue dusk."
- Use for: home indoor; casual lunch (1, 2, 3), Abendbrot or warm dinner,
  Kaffee und Kuchen, Christmas Eve, Silvester raclette, Spieleabend; the
  national default home interior. Apartments in multi-family buildings
  are 54.8% of the housing stock and about 55% of households rent
  [HIGH — Destatis, see GENERAL NORMS].
- Soft background (the core): a fitted kitchen (*Einbauküche*) in an
  L or a single run along one wall: matt white, light grey, beige or
  wood-effect fronts with long bar handles, a laminate worktop, and above
  it a strip of wall tiles (*Fliesenspiegel*) in white or pale squares
  between worktop and wall cabinets [MEDIUM — kitchen-planning forums and
  rental listings]. On the worktop: a kettle, a coffee machine (kept soft,
  no cups in hero zone per the beverage scope), a bread bin or a wooden
  bread board, a fruit bowl. A white panel radiator with a thermostat
  knob under a large white uPVC tilt-and-turn window (*Dreh-Kipp-Fenster*),
  often tilted open, with a pleated blind or a short sheer curtain; through
  it, the façade of the building opposite (rendered in pale yellow,
  white or grey with rows of identical windows and balconies) or a
  courtyard tree [MEDIUM-HIGH for tilt-turn windows and radiators as
  standard; EDITORIAL for the view]. In the dining corner: a pendant lamp
  hung low over the table, a wall calendar or a framed print, a shelf
  with a few plants and jars; in many homes a corner bench (*Eckbank*)
  with cushions along two walls, more common in the south and in
  older or rural households [LOW — not verified]. Light: cool, even
  daylight from the big window by day; at Abendbrot (18:00 to 19:00) the
  warm pool of the low pendant over the table with the window going blue,
  dark by mid-afternoon in December. Palette: white and light grey, pale
  wood (beech or oak veneer), green houseplants, warm pendant light.
  Signature shapes: the tilt-turn window with its single central handle,
  the white tile strip, the low pendant shade, the radiator with its
  thermostat knob, the wooden bread board. Density: tidy and orderly but
  lived-in; less clutter than a UK or US kitchen [EDITORIAL]. People cues:
  one blurred figure at the counter at most.
- Shell: either an *Altbau* flat (pre-1918: ceilings around 3 m or more,
  stucco cornice, wooden floorboards, tall double casement windows, tiled
  stove remnants) or, more often, a 1950s to 1970s post-war block (lower
  ceilings, plain plaster, laminate or tiled floors); in the East, a
  *Plattenbau* flat with a narrow kitchen [MEDIUM — ZONE
  CHARACTERIZATION; EDITORIAL for proportions].
- The table as set here: a wooden or white rectangular table for four;
  for Abendbrot, wooden boards (*Frühstücksbrettchen*) at each place with
  a knife, a bread basket, butter dish, cold cuts and cheese on a platter;
  for lunch, plain white plates; a table runner or placemats; an oilcloth
  (*Wachstuch*) only in older or rural kitchens; wooden chairs or the
  Eckbank at the edge [MEDIUM — Abendbrot entry; EDITORIAL].
- Subregional variants and the national default: Berlin, Hamburg, Leipzig
  Altbau (high ceilings, floorboards, stucco, a tall double casement
  window); East German Plattenbau (a narrow galley kitchen, sometimes a
  hatch to the living room); Bavaria and the rural south (Eckbank, wood
  panelling or a pine corner, a small crucifix corner kept out of frame);
  North (red-brick building opposite). National default: a post-war or
  Altbau rented flat, fitted kitchen with a tile strip, tilt-turn window
  and a low pendant over the table.
- Hallucination traps: an American open-plan kitchen with an island and
  double-door fridge; Bavarian chalet pine and Dirndl-check everywhere;
  a beer crate in the corner or bottles of beer on the table (the
  returnable-crate realism cue must read as water or soft-drink bottles
  only, or be left out); cuckoo clocks; a British kettle-and-washing-machine
  layout (in Germany the washing machine more often sits in the bathroom).
- Never stage: beer, wine or schnapps in any form; the DPG deposit symbol
  legible; legible calendar or labels; a crucifix as a subject.
- Confidence and sources: MEDIUM; one search (practitioner forums) plus GENERAL NORMS (Destatis); LOW for the Eckbank prevalence and the washing-machine location (model knowledge); S45, S46

#### Venue: Apartment balcony (*Balkonien*), with the allotment variant (home, outdoor) · app: Dining room, outdoor
- Prompt-ready line: "A German apartment balcony on a summer evening:
  the small folding table sharp in front, behind it red geraniums in
  railing boxes, a bamboo privacy screen and the softly blurred grid of
  balconies on the pale block opposite."
- Use for: home outdoor; summer lunch or evening meal, a small Grillfest
  (electric grill on a balcony where the lease allows; charcoal more often
  in a garden or allotment), tournament game outdoors; 1, 2 or small
  group (the allotment for larger groups). At least as representative as
  a private garden, given tenure [MEDIUM, see ENVIRONMENT].
- Soft background (the core): balcony boxes on the railing with red or
  pink geraniums or petunias as bright soft blobs; a privacy screen of
  bamboo matting, fabric panel, rattan-effect strip or frosted glass along
  the railing or the side wall; the railing itself (steel bars, a concrete
  parapet or frosted-glass panels); beyond, the courtyard trees and the
  balconies and windows of the next block (a repeating grid of balconies
  with their own plants and screens, pale render) [MEDIUM — Mieterverein
  München, Mieterbund and DIY-chain balcony guides]. A clothes-drying rack
  folded against the wall, a herb pot, solar string lights or a lantern
  for evening. Light: summer evening light lasts past 21:00 in June; a
  warm low sun on the façade opposite, or flat overcast light. Palette:
  geranium red, green, pale render, grey concrete, natural wood. Signature
  shapes: the flower box line along the railing, the bamboo screen, the
  grid of neighbouring balconies, the folding bistro chair.
- Shell: a 3 to 8 m² concrete balcony with tiles or wooden click tiles
  and sometimes an outdoor rug [EDITORIAL].
- The table as set here: a folding bistro table in wood or metal (or a
  table hooked to the railing), two folding chairs; a wipe-clean or
  cotton tablecloth; everyday plates, a bowl of potato or pasta salad
  [MEDIUM].
- Subregional variants and the national default: the allotment
  (*Schrebergarten*): a neat hedged plot, lawn and vegetable beds, a small
  wooden summer house (*Laube*) with a veranda, a patio table with an
  oilcloth, a kettle grill, neighbouring plots' hedges and huts soft
  behind (see the meal-outdoors scenario). Single-family house in the
  suburbs or countryside: a paved terrace with a lawn and hedge. National
  default: a city apartment balcony with geraniums and a bamboo screen.
- Hallucination traps: an Alpine chalet balcony with carved wooden
  balustrades and mountain views outside Bavaria; Mediterranean terracotta
  and bougainvillea; a US deck with a huge gas grill; a beer bottle or
  crate on the balcony floor.
- Never stage: beer, wine, a beer crate; legible screens or labels;
  a full flag on the railing (a cropped black-red-gold pattern at most in
  tournament summers).
- Confidence and sources: MEDIUM; one search (retail tier); S47, S48, S49

#### Venue: Traditional inn (*Wirtshaus*, *Gasthaus*, *Gasthof*) · app: Sit-down
- Prompt-ready line: "A traditional German Gasthaus at Sunday lunch: a
  heavy wooden table with a white cloth sharp in front, behind it
  honey-oak panelling with a row of softly glowing brass wall lamps, a
  built-in corner bench, net-curtained windows and a green tiled stove
  blurred in the far corner."
- Use for: restaurant, indoor; weekend and Sunday lunch, a family
  celebration in the side room (confirmation, communion, round birthday),
  group dinner; 1 to small group. With the beer garden, the default German
  group-meal venue [HIGH, register and scenario above]; the
  alcohol-exclusion framing applies.
- Soft background (the core): wood panelling to shoulder height or full
  height in honey to dark-brown oak or pine, often also on the ceiling
  in the south; a built-in bench running round the walls; brass or
  wrought-iron wall lamps with small cloth or glass shades as warm round
  glows along the panelling; framed old photographs and prints, a few
  pewter plates or a shelf of jugs (no beer steins in focus); a large
  tiled stove (*Kachelofen*) in green or cream glazed tiles in older or
  southern inns as a soft bulky shape with a bench round it; the regulars'
  table (*Stammtisch*) in the corner, sometimes marked by a wrought-iron
  stand (illegible) [MEDIUM — Falstaff on the real Wirtshaus; erlebe.bayern
  historic inns; Alps Magazine on the Tyrolean Stube]. The bar counter
  (*Schanktisch*) as a dark wood block in the middle distance, with its
  taps and glass racks fully out of frame or blurred to an abstract dark
  band. In Bavaria and the Alps, antlers or a carved crucifix corner
  (*Herrgottswinkel*) above the corner table; keep the crucifix out of
  frame or so soft it cannot be read (religious imagery is never the
  subject). Light: small leaded or plain windows with net curtains giving
  soft daylight; warm low wall-lamp light and the stove glow in the
  evening. Palette: honey and dark wood, cream plaster, green tile, red
  or blue checks, brass. Signature shapes: the panelling line with its
  row of lamp glows, the bulky tiled stove, the corner bench, the net
  curtains in small windows, heavy square tables in rows.
  Density: well-worn, clean, orderly, generations of use. People cues:
  service staff in a white shirt and long dark apron (Dirndl only in a
  Bavarian brief), blurred; families at other tables within the limit.
- Shell: an old village or town-centre inn, often half-timbered or
  rendered outside; plank or tiled floors; a beamed or panelled ceiling
  [MEDIUM].
- The table as set here: heavy square or rectangular solid-wood table,
  bare scrubbed top in the south, or a white cloth with a coloured
  runner, or blue or red check (*Bauernkaro*) in the Bavarian and rural
  register; a cruet set, salt and pepper, a small flower vase or a menu
  holder (illegible); cutlery in a napkin; thick white plates and oval
  platters for roasts; wooden chairs with cut-out heart or pierced backs,
  or the wall bench [MEDIUM — Bauernkaro and Wirtshaustisch sources;
  catalog dish entries].
- Subregional variants and the national default: Bavaria and Alpine
  south (pine panelling, tiled stove, antlers, blue-white check,
  Herrgottswinkel); Swabia and Baden (half-timber, green tiled stove,
  red-white check); Rhineland Brauhaus (scrubbed long tables, dark wood,
  big halls; the beer service must be entirely out of frame); North
  (a brick *Gasthof* with white walls, dark wood, nautical prints near the
  coast); East (a plain *Gaststätte* with wood and wall lamps). National
  default: a town Gasthaus with honey-oak panelling, a wall bench, brass
  lamps and white or check linen.
- Hallucination traps: an Oktoberfest beer tent; Lederhosen and Dirndl
  everywhere; giant beer steins and pretzels as decor; Alpine chalet views
  through the window in a northern town; a cuckoo clock; American
  "German restaurant" kitsch with flags.
- Never stage: beer, steins, glasses, taps, beer mats, the bar's glass
  racks, brewery signs or umbrellas; schnapps; legible menus or the
  Stammtisch sign; a crucifix as subject.
- Confidence and sources: MEDIUM; two searches (retail tier); LOW for the northern and eastern variants; S50, S51, S52, S53

#### Venue: Imbiss stand (*Imbissbude*, *Pommesbude*) (street, on the go) · app: Counter service, Food truck
- Prompt-ready line: "A German Imbiss stand at lunchtime: a paper tray of
  sliced Currywurst and fries with a small wooden fork sharp on a round
  high table, behind it a softly blurred stainless-steel service hatch
  with sausages on the grill, a glowing illegible menu board and a plain
  awning."
- Use for: meal on the go and standing meal; Currywurst, Bratwurst im
  Brötchen, Pommes; lunch, late night; 1 or 2. The default German street
  venue [MEDIUM-HIGH, scenario above].
- Soft background (the core): a small kiosk or stand (often around 8 m²
  inside) with a wide service window or counter; behind it, the working
  wall in stainless steel: a flat-top grill with sausages in rows, one or
  two deep fryers, sauce pumps and squeeze bottles, a slicing machine
  for Currywurst, steel extractor hood [MEDIUM — Ruhr Imbiss guides
  describing grill, fryer, sauces and service window in about 8 m²]. Above
  the window, a backlit menu board with photos (a bright rectangle, always
  illegible) and a small awning or canopy in a plain colour. In front:
  round stand-up high tables (*Stehtische*) at about 110 cm, sometimes a
  beer-garden-style bench set (with nothing on it), under a covered
  area; a bin, a napkin dispenser, a tray of disposable wooden forks.
  Middle distance: the street, a tram or parking spaces, blurred
  passers-by in jackets. Light: daylight under the awning for lunch; after
  dark, the warm-white strip light inside the hatch and the backlit menu
  glowing, street lamps as bokeh. Palette: stainless steel, white, the
  red and yellow of ketchup, curry sauce and fries, a plain-coloured
  awning. Signature shapes: the service hatch with a steel counter, the
  sausages in rows on the grill, the round high table, the paper tray
  with a small wooden fork, the lit menu rectangle.
  Density: compact, busy at lunch and late night, well-used.
- Shell: a freestanding kiosk, a trailer stand at a market, or a small
  shopfront with a counter onto the pavement [MEDIUM].
- The table as set here: a round high table, often with a small
  cloth-free laminate top; a paper or cardboard tray with Currywurst cut
  in slices under sauce and curry powder, Pommes with a stripe of
  ketchup or mayonnaise, a small two-pronged wooden or plastic fork
  (*Pommesgabel*), a paper napkin [HIGH — catalog: Currywurst, Pommes].
- Subregional variants and the national default: Ruhr and Rhineland
  (*Pommesbude*, the *Büdchen* kiosk, Pommes "rot-weiß" with mayo and
  ketchup); Berlin (Currywurst with or without casing; skinless is the classic East Berlin style; an S-Bahn arch stand);
  Bavaria (Leberkäse in a roll at a butcher's counter is the stronger
  on-the-go register); North (Fischbrötchen at a harbour kiosk, see the
  register). National default: a city Imbiss stand at lunchtime, steel
  hatch and high tables.
- Hallucination traps: an American food truck with graffiti and
  craft-beer branding; a beer bottle on the high table (the strongest
  prior); a Christmas market hut out of season; Bavarian decor at a
  Ruhr stand.
- Never stage: beer bottles, beer cups or beer signs; legible menu boards,
  prices or stand names; branded sauce bottles or fridges.
- Confidence and sources: MEDIUM; one search (a business's own page) plus the catalog entries; S54, S55, S56

#### Venue: Döner shop (*Dönerladen*, *Kebabladen*) · app: Counter service
- Prompt-ready line: "A German Döner shop at night: a paper-wrapped Döner
  sharp on a small counter, behind it the glowing browned meat cone on its
  vertical spit, a softly blurred glass counter of salad trays and a
  bright illegible backlit menu panel."
- Use for: meal on the go (a Döner in flatbread half-wrapped in paper) or
  a quick sit-in; lunch, late night; 1 to small group; the strongest
  young and urban street register [MEDIUM-HIGH, scenario above; catalog:
  Döner Kebab].
- Soft background (the core): the vertical rotisserie spit (*Drehspieß*)
  behind the counter as a tall, glowing, browned cone in front of the
  orange-red heating panel, the strongest single shape; a long glass
  salad counter (*Salatvitrine*) with steel trays of shredded lettuce,
  red cabbage, tomato, onion, white sauces in rows; stacked flatbreads
  and a contact grill to one side; a steel extractor hood; behind or
  above, a large backlit photo menu (a bright illegible rectangle) and
  wall tiles or panels in white, grey or a warm colour; a drinks cooler
  with its glass door as a cool glow (contents blurred, no brands)
  [MEDIUM for the equipment — business-setup and catering-supplier
  sources; LOW for the decor palette, not described in sources found].
  The sit-in area: a few small tables with laminate tops, chairs in
  plastic or bentwood style, plain tiled or painted walls. (Turkish
  landscape photos and an evil-eye ornament are LOW-confidence clichés:
  use them only when a brief asks for them.)
  Light: bright cool LED panels or fluorescent tubes; the warm glow of
  the spit's heating element; at night, the shop window glowing onto the
  street. Palette: steel, glass, white tile, the browned spit, the
  green-red-white of the salad trays. Signature shapes: the meat cone
  on its spit, the row of salad trays under curved glass, the stacked
  flatbreads, the backlit menu panel.
- Shell: a narrow ground-floor shop in a mixed-use street, glazed front,
  tiled floor [EDITORIAL].
- The table as set here: a small laminate table; the Döner in a paper
  wrap on a paper square or a white plate, a Döner box in foil, napkins
  from a steel dispenser, chilli flakes in a shaker [MEDIUM — catalog].
- Subregional variants and the national default: Berlin (Kreuzberg-style
  late-night shop, a queue, also Gemüsekebap); the same register runs
  nationwide with little variation [EDITORIAL]. See `turkey.md` for the
  different Turkish döner counter; do not mix them.
- Hallucination traps: a Turkish-style restaurant with copper trays,
  carpets and lanterns (an "Oriental" cliché); a Greek gyros taverna
  look; Istanbul skyline murals as the default; the German Döner is a
  German-Turkish fast-food register, not a Turkish restaurant.
- Never stage: beer (some shops sell it); legible menu, prices or shop
  name; branded drinks in the cooler; a full flag of any country.
- Confidence and sources: MEDIUM-LOW; one search, business and supplier sources only (commercial tier). Mirror walls, nazar and landscape photos are LOW; S57, S58

#### Venue: Public Viewing fan mile (other) · app: Stadium or event
- Prompt-ready line: "A German Public Viewing fan zone at night: a paper
  tray with a Bratwurst roll sharp on a round high table, behind it a sea
  of blurred heads, warm-lit food stalls under string lights and a giant
  screen glowing as a soft green rectangle far away."
- Use for: other (fan zone); tournament summers (Euro, World Cup); 1 to 4
  at a high table as a snapshot of tens of thousands (see GAME NIGHT:
  Public Viewing fan mile). The signature German watch-party venue.
- Soft background (the core): a giant LED wall far behind as a bright
  out-of-focus rectangle of green (no picture detail); between, a sea of
  blurred backs of heads and raised arms, within the people limit for
  faces; white or grey food-stall tents and wooden huts with awnings
  along the sides, their lit counters as warm rectangles; string lights or
  festoon lights overhead; a city square's façades, a park's trees or the
  Olympiapark roof line beyond; crowd barriers and stand-up tables.
  Light: golden-hour for a 15:00 or 18:00 kick-off, full night for 21:00
  (LED glow on faces from the front, warm stall lights at the sides).
  Palette: screen green, night blue, warm stall amber, flashes of
  black-red-gold as scarves or face paint on adults (cropped, never a full
  flag). Signature shapes: the screen rectangle, the crowd silhouette
  line, the stall tents, round high tables [EDITORIAL, consistent with
  GAME NIGHT; HIGH for fan-zone scale].
- Shell: open air; paving stones, asphalt or trampled grass underfoot.
- The table as set here: a round stand-up high table, sometimes with a
  stretch cover; paper trays with Bratwurst in a roll, Pommes in a cone,
  Currywurst with a wooden fork; paper napkins.
- Subregional variants and the national default: Berlin (the fan mile
  before the Brandenburg Gate; keep the landmark generic and soft per the
  TRADEMARK & LANDMARK section), Munich (Olympiapark), Hamburg (Heiligengeistfeld) [LOW — not verified],
  and smaller town squares with a screen at the town hall. National
  default: a town square with a big screen and food stalls.
- Hallucination traps: a beer-tent interior; tall beer cups on every
  table; an American tailgate; stadium seating; legible sponsor banners.
- Never stage: beer cups, beer stands, stacked deposit cups; kits with
  crests or sponsor marks; a legible screen or banner; flares; face paint
  on children; a full flag; identifiable children.
- Confidence and sources: HIGH for scale, EDITORIAL for the background (GAME NIGHT sources); no new search this pass

#### Venue: Shared flat (*WG*) or first rental, young renters (*WG-Küche*, *WG-Zimmer*) (home, indoor) · app: Gen Z apartment
- Prompt-ready line: "A shared-flat kitchen in a German Altbau: a
  second-hand wooden table sharp in front, behind it softly blurred white
  walls, worn floorboards, a tall double casement window with plants on
  the sill, a white cube shelf with books and a string of fairy lights."
- Use for: home indoor; students and young workers in a shared flat
  (*Wohngemeinschaft*) or a first one-room flat; a small table, friends
  round for dinner or a Spieleabend; 1 to 3. Wave 2 (2026-10-18). Young
  Germans leave home earlier than the EU average, so a WG or solo rental
  is at least as plausible as a parental home [MEDIUM-HIGH — Eurostat, see
  GENERAL NORMS]. In a WG the shared kitchen, not a living room, is the
  social room.
- Soft background (the core): in a city *Altbau* WG: high ceilings (about
  3 m and more), white walls, worn wooden floorboards (*Dielen*), a tall
  double casement window with a white frame and a plant on the sill, an
  old white radiator; the kitchen is a mismatched fitted run inherited from
  previous tenants (white or beech-effect fronts, a tile strip), a
  second-hand table, a gas or electric cooker, a kettle, a shelf of jars
  and spice tins, a cleaning rota and postcards on the fridge (illegible),
  sometimes a second fridge in the hall [MEDIUM — WG-Gesucht and
  studium.at listings: fully equipped shared kitchens, high ceilings,
  floorboards, large windows, furniture handed on between tenants]. The
  personal layer: a white cube shelf unit (the most handed-on piece in
  listings) with books, records and plants; posters and prints taped or
  in simple frames; fairy lights; a houseplant jungle; a bicycle in the
  hall glimpsed through a door. In a post-war block or *Plattenbau* room:
  lower ceiling, laminate floor, a tilt-and-turn window onto a courtyard
  or a grid of balconies. Light: cool daylight from the big window; at
  night, a paper lantern or a clamp lamp and fairy lights. Palette: white
  walls, honey floorboards, beech or white furniture, plant green, warm
  lamp light. Signature shapes: the tall double casement, the floorboards,
  the cube shelf grid, the mismatched chairs, the plant on the sill.
  Density: lived-in, a little chaotic, cheap and second-hand rather than
  styled [EDITORIAL].
- Shell: an Altbau flat in a five-storey courtyard building (Berlin,
  Leipzig, Hamburg) or a 1960s–70s block in a university town.
- The table as set here: a second-hand wooden table with mismatched
  chairs, a candle in a holder, everyday plates, a pot or a
  baking dish in the middle, kitchen roll.
- Subregional variants and the national default: Berlin and Leipzig
  (cheap, large Altbau WGs, more raw); Munich and Hamburg (smaller rooms,
  higher rents, a newer block); university towns (student WGs in houses).
  National default: a city Altbau WG kitchen.
- Hallucination traps: the global Pinterest/Scandinavian showroom; a US
  loft; a Bavarian chalet corner; the beer crate in the corner and empty
  bottles on the windowsill (a strong real-life WG cue that must not
  appear); graffiti everywhere as Berlin shorthand.
- Never stage: beer, crates, wine or spirits, the deposit symbol; legible
  rotas, posters or book spines; brand logos.
- Confidence and sources: MEDIUM-LOW; one search, individual listings ; EDITORIAL for staging; S59, S60, S61

#### Venue: New-build or house kitchen with island (*Kochinsel*) (home, indoor) · app: Kitchen island
- Prompt-ready line: "A new German house kitchen: the grey quartz island
  top sharp in front, behind it softly blurred matt white handleless
  units, a row of pendants and tall anthracite-framed windows with roller
  shutters half down onto a terrace and hedge."
- Use for: home indoor; a seat at the island counter for lunch or a quick
  dinner; 1 to 3. Wave 2 (2026-10-18). Honest fit: islands belong to
  owner-built single-family houses (*Einfamilienhaus*) and some new-build
  owner flats with an open *Wohnküche*; they are rare in the rented flats
  most Germans live in, where the fitted run stays the default [MEDIUM-LOW
  — house-building forums plan islands routinely for new houses; no
  national share found].
- Soft background (the core): an open-plan ground floor in a newer house:
  a tall bank of handleless units in matt white, light grey, anthracite or
  oak-effect with built-in oven and fridge at eye level; the island's
  hob and a ceiling or downdraft extractor; a run of worktop with a coffee
  machine, a bread bin and a fruit bowl. Large floor-to-ceiling triple-
  glazed windows or a sliding door in anthracite frames, external roller
  shutters (*Rollläden*) half down in their boxes, onto a paved terrace,
  a lawn, a hedge and the next detached house with a red-tiled or
  anthracite roof [LOW — not verified; consistent with house-building
  forum plans]. Two or three pendants over the island, or a linear LED
  bar. Middle distance: the dining table and a sofa corner of the same
  open room. Light: cool even daylight; warm pendant pools by evening.
  Palette: matt white or grey, anthracite, light oak, white tile or
  large-format grey floor tiles. Signature shapes: the anthracite window
  frames, the roller-shutter box, the tall unit wall, the pendants, the
  bar stools. Density: very tidy and new [EDITORIAL].
- Shell: a 2010s–2020s detached or semi-detached house in a suburban
  *Neubaugebiet*; large-format tiles or oak parquet; underfloor heating
  (no radiators).
- The table as set here: the island top (white or grey quartz, laminate
  or oak), an overhang with two or three bar stools; a wooden board,
  everyday plates.
- Subregional variants and the national default: rented-flat version: a
  short peninsula or breakfast bar off a fitted L, the honest fit when a
  brief needs a counter in a city flat; Bavaria and Swabia: more oak.
  National default: a new-build suburban house with an open kitchen and
  island.
- Hallucination traps: an American show kitchen (vast room, double-door
  fridge, marble, six-burner range); an island in a city Altbau rental;
  Bavarian rustic pine; a beer crate by the pantry.
- Never stage: beer, wine, crates; legible appliance displays or labels;
  brand logos.
- Confidence and sources: LOW-MEDIUM; one search, practitioner forums only ; no prevalence figure found; S62, S63

#### Venue: Neighbourhood café (*Kiezcafé*), with the bakery-café variant (restaurant, indoor) · app: Café
- Prompt-ready line: "A German neighbourhood café in an old corner
  building: a slice of cake sharp on a small wooden table, behind it a
  softly blurred glass cake counter, a steel espresso machine, enamel
  pendants and a tall shop window onto a tree-lined cobbled street."
- Use for: café; a solo lunch or a Kaffee-und-Kuchen afternoon with a
  friend; 1 or 2. Wave 2 (2026-10-18). Two real versions: the city
  neighbourhood café (Berlin, Hamburg, Leipzig, Cologne) and, everywhere,
  the bakery with a seating corner (see the Bäckerei register).
- Soft background (the core): a corner shop in an Altbau: tall shop
  windows, a door with a transom, a few window seats; a counter with a
  steel espresso machine and grinder, a cake counter (*Kuchentheke*) as a
  glass case of round cakes and tray bakes (cheesecake, crumble cake,
  fruit tarts) [MEDIUM — Berlin café guides: wood-heavy Altbau corner
  cafés with window seats, a cake counter as the centrepiece, industrial
  lamps, vintage wood; a café sale listing with an espresso machine,
  grinder and steel counters]. Walls: white, a muted teal or green, or
  bare plaster; vintage wooden chairs and tables; industrial enamel
  pendants; shelves with bags of beans and plants; a menu board
  (illegible). Middle distance: a few small tables, a bench along the
  wall, the cobbled pavement and a tree outside the window, bicycles
  locked to the railing. Light: big window light; warm pendant glow on
  a grey day. Palette: white or teal, honey wood, steel, cake colours.
  Signature shapes: the cake counter, the espresso machine, the tall shop
  window, a bentwood chair. Density: relaxed, a laptop or two, well-used.
- Shell: the ground-floor corner unit of a five-storey Altbau; old tiles,
  floorboards or painted concrete.
- The table as set here: a small wooden table, no cloth; a slice of cake
  or a filled roll on a plain plate, a fork, a paper napkin; cups out of
  the hero zone (intruder drinks) unless the brief allows.
- Subregional variants and the national default: bakery-café (a long
  glass counter of Brötchen and cakes, a few high tables and a bench by
  the window, bright and practical); small-town Konditorei-Café (older,
  upholstered chairs, cake-led); Berlin specialty café (minimal,
  Scandinavian-industrial). National default: a city Kiezcafé with a cake
  counter.
- Hallucination traps: a Viennese coffee house with marble and chandeliers
  (Austria); a Parisian café with wicker chairs; a chain-café palette;
  Bavarian rustic décor; latte art in the hero zone.
- Never stage: alcohol (many cafés also serve beer and wine; keep it
  out); legible menus and cups; chain logos.
- Confidence and sources: MEDIUM-LOW; one search, café guides and a sale listing ; EDITORIAL for staging; S64, S65, S66

#### Venue: Modern neighbourhood restaurant, new German cooking (restaurant, indoor) · app: Modern bistro
- Prompt-ready line: "A modern Berlin neighbourhood restaurant: small
  plates on a bare dark-oak table sharp in front, behind it softly
  blurred raw brick and concrete, large glass pendants, a shelf of glowing
  pickle jars and the lit steel pass of an open kitchen."
- Use for: restaurant indoor; a design-led dinner or weekend lunch for a
  younger group or couple; 1 to 4. Wave 2 (2026-10-18). The real Modern
  bistro in Germany: the city restaurant with modern regional cooking in
  a converted industrial or Altbau space with an open kitchen (Berlin
  Neukölln and Kreuzberg, Hamburg, Leipzig, Munich), never the Wirtshaus.
- Soft background (the core): a converted courtyard workshop, distillery
  or Altbau ground floor: exposed brick or rough plaster, raw concrete or
  terrazzo floor, steel columns, tall steel-framed windows onto a
  cobbled backyard (*Hinterhof*) [MEDIUM — a Neukölln modern German
  restaurant in a listed former distillery with fine materials, warm
  lighting and an open kitchen; counter seats facing an open kitchen in
  another]. The open kitchen as a lit steel pass in the middle distance,
  chefs in dark aprons blurred, a short counter of stools facing it (food
  counter only). Dark oak or walnut tables, black steel chairs, a long
  bench with grey felt or leather cushions; statement pendants (large
  glass globes, black enamel, or one long linear light); shelves of
  ceramics, jars of ferments and pickles as small glowing shapes, dried
  herbs; no bottles. Light: low and warm on the tables against a cool,
  dark room; the kitchen glow behind. Palette: concrete grey, dark oak,
  brick, black steel, the amber of pickle jars. Signature shapes: the
  steel pass, the pendant row, the steel window grid, the jar shelf, the
  felt bench line. Density: calm, spaced, design-led but relaxed
  [EDITORIAL].
- Shell: a backyard industrial building or an Altbau shop unit; concrete
  or old parquet floor.
- The table as set here: bare dark wood, no cloth; handmade stoneware in
  grey, sand or black, small plates of modern regional food, linen
  napkins, cutlery in a ceramic pot; water tumblers at most.
- Subregional variants and the national default: Berlin (raw, backyard
  industrial); Hamburg (brick warehouse, harbour light); Munich (more
  polished, pale oak). National default: a Berlin-style backyard
  restaurant with concrete, dark oak and an open kitchen.
- Hallucination traps: the Wirtshaus (panelling, tiled stove, check
  cloths); white-cloth fine dining; a natural-wine bar backdrop with
  lit bottle walls (very common in this real register: keep it out);
  Berlin graffiti and techno-club cliché.
- Never stage: a bar, bottle walls, taps, wine glasses, carafes of wine;
  legible menus; white tablecloths.
- Confidence and sources: MEDIUM-LOW; one search ; concrete and pickle jars are LOW (not in the sources found); S67, S68, S69

#### Venue: City park lawn (*Volkspark*, *Stadtpark*, *Liegewiese*) (on the go, outdoor) · app: Park
- Prompt-ready line: "A German city park on a summer evening: a picnic
  blanket with Brötchen and a bowl of salad sharp in front, behind it a
  softly blurred wide lawn with small groups, old lime trees, a pale
  gravel path and the façades of apartment blocks in low golden light."
- Use for: meal on the go; a lunch break on a bench, a summer picnic on
  the lawn, an evening on a former airfield in Berlin; 1 to 4. Wave 2
  (2026-10-18). The *Liegewiese* (lawn for lying on) is the German park's
  centre.
- Soft background (the core): wide open lawns with groups on blankets far
  back (within the face limit), old lime, plane, chestnut and oak trees
  as large soft masses, a pond with ducks or swans, gravel or sand paths
  (*wassergebundene Decke*) in pale beige, simple wooden-slat benches on
  concrete or iron legs, cyclists and joggers blurred, a kiosk or
  beer-garden-style café kept as a soft shape with no cups; beyond the
  trees, the façades of five-storey blocks [MEDIUM — Berlin park guides:
  lawns, swan pond, fountain, sports areas, picnic and grilling zones in
  Volkspark Friedrichshain; lawns at Humboldthain, Lietzensee and
  Gleisdreieck]. Berlin's former-airfield park: wide concrete runways and
  grass under a huge sky. Grilling is allowed only in marked zones; thin
  smoke there. Light: long summer evenings (light past 21:30 in June),
  golden low sun; otherwise flat grey. Palette: lawn green, pale gravel,
  tree shadows, block façades. Signature shapes: the lawn with blankets,
  the slatted bench, the pond edge, a gravel path curve, the tree line.
- Shell: open air; gravel path, lawn, a bin and a lamp.
- The table as set here: a picnic blanket with a basket, plates and a
  bowl of salad, a bench slat, or a low wall; Brötchen, a Döner or a
  bakery bag resting on paper, never in a hand.
- Subregional variants and the national default: Munich (English Garden
  meadows, river), Hamburg (Stadtpark lawn, Alster), Cologne (Rhine
  meadows), Leipzig (Clara-Zetkin-Park). National default: a city
  Volkspark lawn with old trees and a pond.
- Hallucination traps: a French formal garden; Central Park; a Bavarian
  beer garden with steins; Alpine views in a northern city; disposable
  grills everywhere.
- Never stage: beer bottles on the blanket (the strongest prior),
  Späti bottles, beer-garden mugs; legible signs; identifiable children.
- Confidence and sources: MEDIUM; one search ; regional variants LOW; S70, S71, S72

#### Venue: Weekly market (*Wochenmarkt*) (on the go, outdoor) · app: Street market
- Prompt-ready line: "A German weekly market on a cobbled town square: a
  Bratwurst roll on a paper napkin sharp on a stall ledge, behind it
  softly blurred rows of striped awnings, crates of vegetables, a lit
  cheese trailer and a gabled town hall under morning light."
- Use for: meal on the go; a Saturday or weekday market lunch; 1 to 3.
  Wave 2 (2026-10-18). The real German street market: a municipal weekly
  market on the town square, mostly produce with a few hot-food vans.
- Soft background (the core): a cobbled market square framed by the town
  hall and gabled or rendered façades, a church tower; rows of stalls
  under striped or plain canvas awnings and parasols at a regulated
  height (about 2.1 m minimum) [HIGH — municipal market ordinances];
  wooden crates and tiered displays of vegetables, fruit, flowers and
  bunches of herbs as soft colour blocks; refrigerated sales trailers
  (cheese, fish, butcher) with a fold-up side panel and a lit glass
  counter; a rotisserie-chicken trailer (*Hähnchenwagen*) with turning
  spits as a warm glow and a Bratwurst stand; shoppers with wicker baskets
  and cotton bags blurred, within the limit [MEDIUM — ordinances admit
  stalls, sales vans and trailers, including hot-food trucks; EDITORIAL
  for the stall mix]. Light: clear morning light or flat grey; markets
  close by early afternoon. Palette: produce greens and reds, white or
  striped canvas, cobble grey, trailer steel. Signature shapes: the
  awning rows, the crate tiers, the trailer side hatch, the chicken spits,
  the town-hall gable.
- Shell: open air on cobbles or paving.
- The table as set here: a standing ledge at the Bratwurst or chicken
  trailer, a stall counter edge; a roll with Bratwurst on a paper napkin,
  half a chicken in a card tray, a Fischbrötchen in the north.
- Subregional variants and the national default: Munich (permanent
  market stalls in a city-centre square, keep any beer garden out),
  North (fish trailer and Fischbrötchen), Berlin (Turkish market by a
  canal, more textiles). National default: a mid-sized town's weekly
  market on the square.
- Hallucination traps: a Christmas market with wooden huts and lights out
  of season; a French marché with baguettes; a beer garden; a souvenir
  market.
- Never stage: beer, wine stalls, Federweißer; legible price cards and
  stall signs; brand logos.
- Confidence and sources: MEDIUM; one search ; the regional variants are LOW; S73, S74, S75

#### Venue: Baltic beach and promenade (*Strandkorb*, *Strandpromenade*) (on the go, outdoor) · app: Beach or waterfront
- Prompt-ready line: "A German Baltic beach in summer: a Fischbrötchen on
  paper sharp on the fold-out table of a beach chair, behind it softly
  blurred rows of white hooded wicker Strandkörbe with striped canvas,
  pale dunes and a long pier running into a grey-blue sea."
- Use for: meal on the go; a summer day at the Baltic or North Sea, a
  Fischbrötchen on the promenade; 1 to 4. Wave 2 (2026-10-18). Inland,
  river and lake fronts serve the same option (see variants).
- Soft background (the core): a wide pale-sand beach with rows of hooded
  wicker beach chairs (*Strandkörbe*) in white with striped canvas
  (blue, green, red) as the signature shape; a pier (*Seebrücke*) on
  piles running out into a grey-blue sea; dunes with marram grass and a
  wooden walkway; behind, the promenade with white resort villas in
  *Bäderarchitektur* (balconies with white wooden or iron fretwork) and a
  few kiosks and cafés [MEDIUM — Baltic resort guides for Ahlbeck,
  Boltenhagen, Travemünde and Kühlungsborn: piers, villas, beach chairs,
  fish and ice cream along the promenade]. Gulls; a lifeguard tower far
  off. Light: bright, breezy, high clouds; low golden light in the
  evening; flat grey on cooler days. Palette: pale sand, white wicker,
  stripe colours, grey-blue sea, white villas. Signature shapes: the
  hooded beach chair, the pier on piles, the villa balcony fretwork, the
  dune grass.
- Shell: open air; sand or the promenade's paving.
- The table as set here: the fold-out side table of a beach chair, a
  promenade bench or a kiosk ledge; a Fischbrötchen on paper, a paper
  tray of fries, never in a hand.
- Subregional variants and the national default: North Sea (wider beach,
  dykes, mudflats at low tide, a harbour kiosk; see Fischbrötchen);
  inland: Rhine promenade (Düsseldorf, Cologne) with steps to the river,
  Elbe beach in Hamburg with container cranes in haze, a lake jetty with a
  kiosk shack (*Badesee*). National default: a Baltic resort beach with
  beach chairs and a pier.
- Hallucination traps: a Mediterranean beach with umbrellas and turquoise
  water; palm trees; a beach bar with cocktails; tropical sun as default.
- Never stage: beach-bar beer, cocktails, wine; legible kiosk signs or
  beach-chair numbers; identifiable children; a full flag.
- Confidence and sources: MEDIUM; one search (travel-marketing tier); the Strandkorb is HIGH (also in the regional map above); S76, S77, S78

---

## ZONE CHARACTERIZATION

Germany's regional variation is real and heavy — heavier, in raw dish count,
than anything documented in the UK file — but it resolves at the **dish and
vocabulary level**, not at the food+vocabulary+architecture triple-axis
break that earned Scotland its own file within the UK structure. This is
the concrete reasoning behind the "one file, heavy §4.6 load" structural
decision, not just an assertion of it:

- **Meal structure and rhythm are genuinely national.** Mittagessen as the
  traditional main hot meal, Kaffee und Kuchen as the mid-afternoon ritual,
  and Abendbrot as the traditional cold evening bread-and-cold-cuts meal are
  documented the same way from Hamburg to Munich — the *names*, *timing*,
  and *table logic* don't change by region the way, say, a Scottish "fish
  supper" versus an English chippy visit changes both vocabulary and the
  underlying order. What varies is which **dishes** fill those slots, and
  what they're **called**.
- **No single German region has a housing/architecture type as
  categorically distinct from the national default as Scotland's sandstone
  tenement-and-close was from an English terrace.** Regional architecture
  does vary — half-timbered Baden villages, Hanseatic red-brick in the
  North, Baroque old towns in Saxony, prefabricated (*Plattenbau*) estates
  across the former East — but this is a *palette of regional textures
  within one national vernacular*, not a structurally unrelated building
  type the way a Glasgow tenement's shared "close" stairwell has no English
  equivalent at all. This file treats regional architecture as scene-setting
  detail within the general environmental norms below, not as grounds for a
  split.
- **The dish-level variation is real and extensive, and is handled the way
  this project's schema is designed to handle it**: through schema §4.6's
  coexisting-variant disclosure (Kartoffelsalat vinegar-vs-mayo, Haxe-vs-
  Eisbein, Jägerschnitzel West-vs-East, currywurst with/without casing,
  Sauerbraten's regional sauce variants, Brezel's Swabian-vs-Bavarian
  shape) rather than through separate regional files. This is closer to how
  `uk.md` handles England's internal North/South condiment and naming
  variation (a "zones within one file" pattern) than to how Scotland was
  split out — Germany's regions each clear the "would depicting the wrong
  variant look visibly wrong" test at the **dish** level repeatedly, but
  none of them clears it at the **whole-culture** level the way Scotland
  did. [MEDIUM-HIGH]

**What this zone characterization is not claiming.** Bavaria is not
"generic Germany," and defaulting every German scene to Lederhosen, Dirndl,
and Alpine backdrops is exactly the caricature this file's own Anti-Patterns
list (below) flags as the single most common failure mode for this market.
**Caricature-avoidance note (editorial judgment, not a sourced claim):** do
not default every German scene to Bavarian folk-costume/Alpine dressing,
and do not default every festive or communal scene to a beer-tent interior
— see the alcohol-exclusion rule and the Munich-only Oktoberfest note in the
FESTIVAL & OCCASION CALENDAR for why both defaults are specifically wrong.

---

## TRUSTED CONTENT

### GENERAL NORMS

- **Population**: Germany is the EU's largest member state by population,
  at roughly 83.4–83.6 million as of the most recent official count (31
  December 2025) and mid-2026 estimates. Germany's 2025 birth count (~654,300)
  was its lowest since 1946, with immigration (net ~320,000/year) the
  primary factor keeping the population from contracting. [HIGH]
  [S6, S7]
  This corrects the draft's own unverified "~83–84M" to a sourced figure in
  the same range — nothing to correct in substance, only in confidence tier.
- **Meal structure (in-scope slots)** — corrected and re-sourced from the
  draft's own unverified table:

  | Slot | Local term | Typical time | What the table looks like | Confidence |
  |---|---|---|---|---|
  | Lunch | *Mittagessen* | 12:00–14:00 | Traditionally the day's main hot meal: meat, potatoes/dumplings/noodles, sauce, vegetable. Canteen trays on weekdays; fuller spreads on Sundays. Office workers often eat lighter (a bakery roll, Döner, or salad). | MEDIUM-HIGH |
  | Afternoon snack | *Kaffee und Kuchen* | 15:00–16:30 | Cake slices on small plates, cake forks, a whipped-cream bowl, often a tablecloth. **No coffee cups/pots in frame** (beverage scope). | MEDIUM-HIGH — a well-documented national ritual |
  | Dinner | *Abendbrot* / *Abendessen* | 18:00–19:00 | Traditionally **cold**: a bread board with cold cuts, cheese, pickles, raw vegetables. **Genuinely shifting, not a stable default — offer as a real coexisting choice, not a silent one.** A 2019 survey found 38% of Germans named dinner (not lunch) their day's main meal, up from about a third a decade earlier — a real, measured move toward a warm evening meal, especially in urban and younger households, alongside (not yet replacing) the traditional cold Abendbrot. Restaurant dinners are warm by default regardless of home habits. | MEDIUM-HIGH for the traditional cold-Abendbrot pattern and its documented decline [S8, S9] |
  | Brotzeit / Vesper | *Brotzeit* (Bavaria), *Vesper* (Swabia) | Late morning to afternoon | A wooden board: cold meats, cheese, a pretzel, radish. | MEDIUM |
  | Street / late night | *Imbiss* | Anytime, especially after 22:00 | Paper trays, foil, standing tables, neon. | MEDIUM |

  **Photorealism implication, carried from the draft and not contradicted by
  anything found this pass**: a cold Abendbrot bread-board spread reads as
  at least as authentically German as a hot plated dinner for an evening
  scene — offer both as coexisting registers per §4.6, not one silent
  default. [EDITORIAL, grounded in the sourced decline data above]
- **Housing stock**, replacing the draft's own unverified assumptions with
  Destatis's actual 2024 figures: apartments in multi-family buildings are
  the single largest category at **54.8%** of Germany's housing stock (23.5
  million units), single-family houses **31.4%** (13.5 million units), and
  two-family houses **12.8%** (5.5 million units). [HIGH — a
  named, current national statistical office figure] [S10]
  **A genuine, sharp cross-country contrast worth stating directly per
  `country-file-schema.md` §5.2**: roughly 55% of German households rent
  rather than own — one of the highest rental rates in Europe, and a real
  contrast with both the UK and US's homeownership-leaning housing
  narratives. [MEDIUM-HIGH] [S11]
  This makes a rented apartment at least as representative a "German home"
  default as a single-family house — do not default every home scene to a
  detached house.
- **Balcony access is common; private-garden access is comparatively rare
  and apartment-typical, not house-typical** — a genuine finding, not
  assumed. Roughly 67% of German households have a balcony or terrace (a
  2020 German Garden Industry Association study), noticeably more than have
  a private garden; balcony share varies by city (71% of listed Berlin
  apartments have one, versus 47% in Essen). [MEDIUM] [S12]
  This directly supports the draft's own "Balkonien" (the balcony-staycation
  joke) as a genuine, representative outdoor-meal setting for an apartment-
  dwelling household, not a novelty.
- **Young adults leave the parental home early.** Roughly 14% of German
  25–29-year-olds still live with their parents (Eurostat). An EU or UK
  comparison needs matched age bands and is left out until recomputed.
  [MEDIUM] [S13]
  A young-adult German household scene is therefore at least as plausibly a
  shared-flat (*Wohngemeinschaft*/WG) or a solo rental as a parental home —
  do not default a Gen-Z-lens scene to a family kitchen.
- **Trademark-genericization list for this file (schema §7.5).** Real
  brands/businesses cited as evidence for a claim elsewhere in this file —
  name them in citations only, never as literal prompt subjects.

  | Real entity (evidence only) | Prompt substitute |
  |---|---|
  | Named Berlin currywurst stands (e.g., a specific East Berlin Imbiss famous for skinless sausage) | "a Berlin street-food stand" |
  | Named döner/kebab shops | "a busy döner kebab stand" |
  | Named Munich beer halls and beer-garden operators | "a traditional Munich inn" |
  | Named folk/wine/carnival festivals (see FESTIVAL & OCCASION CALENDAR) | Generic descriptions, e.g. "a large Munich autumn folk festival," never the trademarked festival name |
  | The specific brown liquid-seasoning bottle used to season currywurst sauce and other dishes | "a small brown seasoning bottle" or omit entirely |
  | Named mustard and curry-ketchup brands | "a squeeze bottle of German mustard" / "curry-spiced ketchup" |
  | Named seafood and bakery chains | "a harbour fish kiosk" / "a neighbourhood bakery" |
  | The DPG deposit-return logo (the blue bottle-can-arrow symbol; legally sized 14×16mm, a real trademarked mark) | "a small blue recycling/deposit symbol, rendered generic and not legible" or omit [HIGH for the logo's legal size and trademarked status] [S14] |
  | Hooded-beach-chair (*Strandkorb*) manufacturers | "a hooded wicker beach chair" |
  | Landmarks (Brandenburg Gate, Cologne Cathedral, Neuschwanstein Castle, the Elbphilharmonie, Munich's towers) | Per `country-file-schema.md` §7.5's standing landmark rule: **never** a named, recognizable landmark as a literal prompt subject — describe the generic category of setting instead ("a grand Baroque old-town square," "a Gothic cathedral silhouette in soft focus") the same way this project genericized Coney Island's Wonder Wheel |

### VISUAL & PLATING NORMS

- **Palette.** The comfort-food core runs deep amber-brown and gold (roast
  gravy, crackling, breadcrumb crusts, lye-pretzel crust) against pale ivory
  starches (dumplings, Spätzle, potatoes) — a browner, less golden-fry-
  dominated palette than the UK's chip-shop register. Color relief comes
  from burgundy-violet red cabbage, olive-green stewed kale or sauerkraut,
  and — regionally — the vivid spring-green of Grüne Soße or the magenta of
  Labskaus's beetroot mash. Spring and summer food is light and fresh:
  white asparagus, radishes, herb quark, Grüne Soße, strawberries and red
  berries, so don't push every scene toward brown. [EDITORIAL, grounded in
  the dish entries below]
- **Texture lexicon** — this file's own visual/texture synthesis, aggregated
  across recipe, food-history, and food-photography sourcing consulted this
  pass rather than independently footnoted line by line (the same treatment
  `uk-scotland.md` gave haggis's and neeps-and-tatties' texture description).
  Treat each row as MEDIUM confidence unless a dish entry below cites a
  stronger source for the specific claim.

  | Surface | What it looks like | Common failure to avoid |
  |---|---|---|
  | **Pork crackling (*Kruste*)** | Puffed, blistered, glassy amber-to-chestnut skin with popcorn-like bubbles; hard and brittle, cracking rather than bending when cut; dry and matte-glossy, never wet. | Soft, rubbery, uniformly brown skin; a wet glaze. |
  | **Breadcrumb crust (Schnitzel)** | Fine, even golden-to-amber crumb that puffs into loose waves and blisters, lifting away from the meat; faint oil sheen, matte overall. | Thick, craggy fried-chicken-style batter; a uniform flat coating stuck to the meat. |
  | **Lye crust (*Laugengebäck*)** | Deep mahogany-to-chestnut, lacquered satin shine, fine crackle pattern; coarse opaque white salt crystals (2–4mm), irregular. | Pale tan color, uniform shine, fine table salt, cinnamon sugar. |
  | **Brötchen crust** | A thin, crackly crust that shatters into flakes; golden, with a lighter split ridge (*Schnitt*) on top and airy, irregular-holed off-white crumb. | A soft enriched bun; a burger bun's glossy dome. |
  | **Rye/mixed bread** | Thick, dark-brown, rustic crust, often cracked and flour-dusted; dense, moist, fine-grained crumb in grey-brown to near-black. | A fluffy white sandwich loaf. |
  | **Brown gravy (*Bratensoße*)** | Glossy, dark mahogany, medium-thick; coats the back of a spoon and pools with a clean edge. | Thin brown water; a grey opaque paste. |
  | **Potato dumpling** | Smooth, pale ivory-to-greige surface with a soft satin sheen; the cut face is fine-grained and slightly gummy-glossy. | A mashed-potato ball; a bready texture. |
  | **Sauerkraut** | Pale straw-to-ivory translucent strands, moist, loosely heaped, with a faint fat sheen when braised. | Green cabbage; bright yellow color; dry shreds. |
  | **Red cabbage (*Rotkohl*)** | Deep burgundy-violet, glossy, soft braised shreds, sometimes with apple pieces; color bleeds magenta into adjacent sauce. | Raw, crunchy purple slaw. |
  | **Grilled sausage casing** | Taut, slightly wrinkled where cooled, dark charcoal grill stripes, small split points where fat escaped, a glistening surface. | A uniform tan hot-dog finish. |
  | **Emulsified sausage interior** (Leberkäse, Weißwurst, currywurst) | Uniform fine grain, no visible chunks; rosy-pink (cured) or pale grey-white (uncured veal); a smooth, springy cut face. | A coarse, crumbly interior. |
  | **Mustards** | *Mittelscharf*: smooth, bright yellow-ochre. Bavarian sweet mustard (*Süßer Senf*): dark tan-brown, glossy, with visible coarse mustard-seed grains. | The neon-bright yellow of US ballpark mustard. |

### ENVIRONMENT & STAGING SCENES

#### General environmental norms

- **Climate and light**: temperate overall, but genuinely more continental
  toward the east and interior (colder, harsher winters; hotter, more humid
  summers) than the maritime-moderated North and Rhineland — a real,
  well-documented general climate fact, not independently re-sourced this
  pass. Long, light summer evenings support outdoor/beer-garden/allotment
  scenes May–September; short, dark winter days (dusk by mid-afternoon in
  December) suit Christmas-market and indoor-Abendbrot scenes. [HIGH — general, well-documented geography]
- **Housing and tenure — see GENERAL NORMS above for the sourced figures.**
  A rented apartment (54.8% multi-family stock, ~55% renting overall) is at
  least as representative a default as a single-family house; a balcony is
  a more representative outdoor-meal setting than a private garden for an
  apartment-dwelling household.
- **Returnable-crate storage** (stacked plastic crates of glass bottles in a
  hallway, cellar, or kitchen corner) is a genuine, checkable German
  domestic-realism cue tied to the deposit (*Pfand*) system — see COCA-COLA
  MARKET INTEGRATION for the deposit system itself. [MEDIUM]
- **Caricature-avoidance guidance (editorial judgment, not a sourced
  claim).** Do not default every German home/leisure scene to Bavarian
  Alpine dressing (Lederhosen, Dirndl, chalet architecture) outside a
  Bavaria-specific brief — Lederhosen and Dirndl are themselves situational
  (festivals, some rural Sundays in Bavaria specifically), not everyday
  wear anywhere in the country. Do not default every communal/festive scene
  to a beer-tent interior — see the alcohol-exclusion rule.

#### Scenario: Casual lunch at home, indoors — 1 person

Two plausible, co-equal registers, not one default: a warm, simple plated
meal reheated from a larger batch (a hallmark of the traditional hot-lunch
pattern), or — increasingly common, especially for an office worker — a
cold, light lunch: a bakery *belegtes Brötchen* (a filled roll), a Döner, or
a salad, eaten at a kitchen table or a desk. [MEDIUM-HIGH for the general
pattern; the office-worker framing is this file's own reasonable synthesis]

#### Scenario: Casual lunch at home, indoors — 2 people

A small kitchen or kitchen-diner table, two individually plated warm
lunches, or a shared Abendbrot-style cold spread moved earlier in the day —
co-equal registers: a couple, a parent and a child home from school
(breakfast/school hours are out of this file's scope, but a midday meal
together is not), two flatmates.

#### Scenario: Casual lunch at home, indoors — 3 people

The same register scaled up, or a family Sunday lunch specifically: a warm
roast-style meal (Schweinsbraten or Rouladen — see DISH CATALOG) served
family-style from a shared platter and gravy boat, with each diner still on
an individual plate. [MEDIUM-HIGH for the Sunday-lunch register as a genuine
national pattern, not independently re-verified with dedicated new sourcing
this pass beyond what the individual dish entries below carry]

#### Scenario: Dinner at home, indoors

**Two genuinely coexisting registers, offered as an explicit choice per
schema §4.6, not a silent default**: the traditional cold Abendbrot spread
(see GENERAL NORMS and the Abendbrot dish entry) under a warm pendant lamp
with early-evening window light; or an increasingly common warm dinner —
pasta, a stir-fry, a warm plated main — especially in urban and younger
households, per the sourced 38%-vs-a-third shift documented above. **New
Year's Eve tabletop raclette is a specific, well-documented, and distinct
register** (see the dedicated dish entry) — a genuinely common German home
dinner on 31 December specifically, not an everyday occurrence.

#### Scenario: Meal outdoors at home

**The allotment garden (*Schrebergarten*) and the balcony (*"Balkonien"* —
literally a pun on staying home for a "balcony vacation") are both
genuinely representative, not just plausible-sounding**, given how common
renting and apartment-dwelling are (see GENERAL NORMS). An allotment scene:
a neat hedged plot, a small wooden summer house, a patio table with an
oilcloth cover, a grill. A balcony scene: geraniums in planter boxes, a
folding bistro table, an old-building façade. Park grilling (a kettle or
disposable grill in a public park, sausages and marinated neck steaks,
pasta salad and potato salad on the side) is a third, equally plausible
summer register. [MEDIUM — carried from the draft; the tenure/balcony-access
statistics above independently support treating the balcony as at least as
representative as a private garden]

#### Scenario: Meal on the go — 1 person

The Imbiss stand (currywurst, a Bratwurst im Brötchen, Pommes) and a bakery-
counter *belegtes Brötchen* are the two default registers, eaten standing at
a high table, on a park bench, or walking. A Döner in flatbread, half-
wrapped in paper, is the other strong default, especially for a younger or
urban cast. [MEDIUM-HIGH — well-corroborated as everyday, high-frequency
registers across street-food sourcing this pass]

#### Scenario: Away from home — 1 person at a restaurant/café

A Mensa/canteen tray-line lunch (a genuine, high-frequency student/office
register) or a solo Imbiss-counter meal are both unremarkable. A café table
(for a Kaffee-und-Kuchen-register snack, not a full meal, per this file's
scope) is the other default.

#### Scenario: Away from home — 2–3 people at a restaurant/café

**The traditional inn (*Wirtshaus*/*Gasthaus*) and the beer garden are the
default German group-meal venues** — both carry the alcohol-exclusion
framing requirement (see COCA-COLA MARKET INTEGRATION): dark wood, tiled
stoves, heavy tables and checked linen for the inn; gravel, chestnut-tree
canopy, and long folding tables for the beer garden, framed on food, Coca-
Cola, and people, with other guests' tables empty of drinks rather than
showing blurred alcohol. A Döner shop, a Greek-German or Italian-German
restaurant, or an Asia-Imbiss are equally plausible, more casual,
Gen-Z-relevant alternatives for this scenario, per §4.11's "contemporary
everyday food" note below.

#### Settings & environments register (supplementary detail)

The draft's own settings breakdown is genuinely richer than the eight
mandatory scenarios above and is preserved here as supplementary staging
detail, the same way `uk.md` keeps its Quick-Reference table alongside its
per-scenario prose.

**Urban everyday**: the Imbiss, the Döner shop, the Späti (Berlin-specific —
see QUICK-REFERENCE), the *Büdchen*/*Trinkhalle* (a tiny Cologne/Ruhr corner
kiosk with a sales hatch), a bakery standing counter, a butcher's hot
counter (*Metzgerei*, selling warm Leberkäse and meatballs from a tiled
glass case), the weekly market (*Wochenmarkt*), the canteen/Mensa, and a
petrol-station shop with a bistro corner and roller-grill sausages.

**Outdoor leisure**: an outdoor public pool (*Freibad*) with a snack kiosk
hatch; lakes and quarry lakes (*Badesee*, *Baggersee*) with a jetty and a
kiosk shack; the Baltic/North Sea beach with hooded wicker *Strandkorb* beach
chairs among dunes and marram grass; the North Sea dyke (grazing sheep, a
bike path, a huge sky); city riverbanks and meadows (Rhine meadows, Munich's
river gravel banks, Elbe beaches) with disposable grills in designated
zones; a former-airfield park (Berlin-specific); the allotment garden and
balcony (see the home-outdoors scenario above); park grilling; a university
lawn; the Spreewald canals (punts, alder trees, pickle stalls at landing
stages); and a river bike-tour rest stop.

**Travel & transit**: a high-speed train seat-back tray with landscape
blurring past; an S-Bahn/U-Bahn station kiosk; a motorway service area; a
harbour kiosk and ferry deck (Hamburg); a rest-area picnic table.

**Sport**: a football stadium concourse kiosk; a public-viewing screen on a
square; an amateur football clubhouse kiosk; an Alpine ski-slope hut terrace
(Bavarian Alps only — do not generalize this register beyond Bavaria); a
summer hiking hut.

**Traditional dining**: the beer garden and the traditional inn (see the
away-from-home scenario above); a seasonal wine tavern or Apfelwein tavern —
both are alcohol-dominant registers in reality and should be used only for
strict food-only framing, or avoided, per the alcohol-exclusion rule.

**Home**: the Abendbrot table; a Sunday-lunch table; the Kaffee-und-Kuchen
table (cake on a stand, a cream bowl, patterned china, no coffee cups in
frame); the New Year's Eve raclette table; returnable-crate storage as a
realism cue.

#### Coca-Cola alone (no bite): strongest moments

Carried from the draft largely as-is — these are plausible, well-composed
scene concepts rather than sourced factual claims, and none required
correction this pass:

1. A hooded beach chair on the Baltic coast, wind in the marram grass.
2. The kerb outside a Berlin Späti at dusk.
3. A Freibad lawn in midsummer glare, condensation beading on the can.
4. A city river meadow at sunset.
5. A North Sea dyke rest stop mid-bike-ride.
6. A high-speed train window seat, landscape blurring past.
7. A football terrace or public-viewing crowd.
8. An allotment-garden deckchair.
9. A festival campground in the morning haze.
10. A Christmas market: a mittened hand holding a cold bottle under string lights.

### FESTIVAL & OCCASION CALENDAR

**General rule, unchanged from the draft and independently supported by
this pass's Munich-only-Oktoberfest finding below**: folk festivals and wine
festivals are genuinely, heavily alcohol-centred in reality. Frame every
such scene on food stalls, rides, sweets, lights, parades, and crowds
outside the tents — never inside a beer tent, never with steins, wine
glasses, or mugs in frame. Genericize festival names in prompts per schema
§7.5, e.g. "a large Munich autumn folk festival," never the trademarked
festival name.

**The "Oktoberfest is Munich-only" framing is correct and worth stating
firmly** — this was a specific spot-check this pass ran. The original,
largest Oktoberfest is Munich's own two-week festival on its traditional
festival ground, drawing roughly 7 million visitors a year (a record 7.2
million in 2023); the name and format have since been widely imitated by
smaller local "Oktoberfest"-branded events elsewhere in Germany and
internationally, but these are imitations of Munich's festival, not evidence
that "Oktoberfest" is a generic, nationwide German autumn tradition the way
Christmas markets are. [HIGH] [S15; general Oktoberfest-history sourcing corroborating the 7M+ annual attendance figure]
Do not use "Oktoberfest" imagery (tents, dirndl-and-lederhosen crowds,
festival grounds) as generic shorthand for "German food culture" outside a
Munich-specific brief — this is this file's single most important anti-
pattern (see ANTI-PATTERNS below).

| Period | Occasion | Food cues | Visual cues | Confidence |
|---|---|---|---|---|
| Nov–Feb | Kale season, group kale walks (North) | Grünkohl mit Pinkel | Frost, grey light, groups in winter coats | MEDIUM |
| 11 Nov → Feb/Mar | Rhineland Carnival (street carnival, Thursday to Rose Monday parades) | Berliner doughnuts, Imbiss food, sausages | Elaborate costumes, floats, sweets thrown into crowds, confetti; avoid culturally appropriative costumes | MEDIUM-HIGH — a well-documented national tradition |
| Pre-Lent | Swabian-Alemannic Fasnet (Baden-Württemberg) | Doughnuts, fried pastries | Carved wooden masks, shaggy/patchwork costumes, bells, old-town parades | MEDIUM |
| 31 Dec | New Year's Eve (*Silvester*) | Raclette or fondue is one of the most commonly cited German NYE dinner choices — a real, widely corroborated tradition, not just plausible-sounding | Fireworks, balconies, streets | MEDIUM-HIGH |
| Maundy Thursday | *Gründonnerstag* (Green Thursday) | **Grüne Soße** as a real, specific Maundy Thursday food tradition, not a loose association: the "eat something green on Green Thursday" custom is well documented, and Frankfurt's own seven-herb Grüne Soße mix has been EU-protected (a geographical-indication-style registration) since 2016 | Spring green | HIGH [S16, S17] |
| Apr–24 Jun | Asparagus season (*Spargelzeit*) — **end date corrected from the draft's vague framing to a specific, sourced date** | Spargel | Farm stands, white tents. **Traditionally ends on 24 June (Johannistag, St. John's Day)**, after which fields rest for the year — a specific, real, checkable date, not a loose "spring/early summer" window. | HIGH [aggregated German food-culture sourcing consistently citing 24 June/Johannistag as the traditional close] |
| ~11 Nov | St. Martin lantern processions | Weckmann bread figure, roast goose | Children carrying glowing paper lanterns at dusk, a rider on a horse, a bonfire. **Children-policy caution applies** — see below. | MEDIUM |
| Late Sep–early Oct | **Munich autumn folk festival (evidence name: Oktoberfest). Munich only — never generalize nationally.** See the dedicated note above. | Haxe, Hendl, Brezel, Steckerlfisch, gingerbread hearts | Rides, stalls; tents avoided entirely per the alcohol-exclusion rule | HIGH for the Munich-only framing |
| Sep–Oct | Wine festivals (Palatinate sausage-and-wine-market festivals, etc.) | Zwiebelkuchen, Saumagen, sausages | **Alcohol-dominant; food-only framing** | MEDIUM |
| Late Nov–23 Dec | Christmas markets | Bratwurst, Reibekuchen, Schupfnudeln, garlic mushrooms, candied almonds, gingerbread hearts, crêpes | Wooden huts with fir garlands, warm string lights, breath vapour, early dusk (~16:30), steam off giant pans. **Mulled-wine mugs dominate reality; none may appear in frame.** | HIGH for the market format and food items as a well-documented national tradition |
| 24–26 Dec | Christmas Eve and the Christmas feast | Potato salad + sausages (24th); roast goose, red cabbage, dumplings (25th–26th) | Christmas tree, candles; a festive table | MEDIUM-HIGH |

**Children & schools policy caution, now grounded in a real, confirmed TCCC
policy rather than left as an internal flag** — see the Alcohol Exclusion
section above for the full sourced policy citation. Applied here: do not
place Coca-Cola in a school setting, and do not show a young child (under
roughly 13, per TCCC's own stated threshold) as the drinker in a St.
Martin-procession or children's-birthday scene; frame family scenes on
adults with the product. [HIGH — grounded in TCCC's own public
Responsible Marketing Policy, cited above]

Full staging for each celebration: see CELEBRATIONS & LARGE GATHERINGS below.

---

## CELEBRATIONS & LARGE GATHERINGS

The FESTIVAL & OCCASION CALENDAR above stays the calendar index; this
section is the staging layer for each celebration, per schema §5.7. The
alcohol-exclusion rule and the children and schools caution (both in FILE
ROLE & METHOD) apply to every entry: German celebrations very often carry
beer, wine or Sekt on the table in reality, and none may appear in frame.
The beverage-scope rule also keeps coffee cups and pots out of every
Kaffeetafel scene.

### How large gatherings work here

- **Who gathers.** Family celebrations are mostly the extended family plus
  godparents and close friends: about 6 to 10 for Christmas, about 10 to
  25 for a confirmation, communion or round-number birthday, and
  roughly 40 to 80 for a wedding (survey figures vary, see the wedding
  entry). Summer grilling gathers friends and neighbours, about 6 to 15.
  [MEDIUM for wedding figures; EDITORIAL for the rest]
- **Where (intake venues).** *Home indoor*: Christmas Eve, the Christmas
  feast, Silvester raclette and the birthday Kaffeetafel, usually in the
  living-dining room of a rented apartment (see ENVIRONMENT). *Restaurant*:
  confirmations and communions very often book a family restaurant's
  side room for lunch, and round-number birthdays do too. *Home outdoor*:
  the summer Grillfest in a garden, allotment (*Schrebergarten*) or on a
  balcony; park grilling is the public variant. *Other*: weddings in a
  rented hall, country inn or estate. [MEDIUM — Känguru and restaurant
  sources for communion venues; EDITORIAL elsewhere]
- **Table form and serving style.** One long table, often two tables
  pushed together with a white or seasonal tablecloth, everyone seated.
  Home festive meals are served family-style from bowls and platters
  (dumplings in a bowl, red cabbage in a bowl, the goose carved on a
  platter). Restaurant celebrations are either a set plated menu or a
  buffet. The **Kaffeetafel** (afternoon coffee-and-cake table) is the
  signature German celebration format: several whole cakes (*Torten* and
  sheet-cake squares) on cake stands and platters down the middle, cake
  plates and cake forks at each seat, a bowl of whipped cream. Many
  celebrations run in two parts: a midday meal, then the Kaffeetafel at
  about 15:00. [MEDIUM-HIGH — Kaffee und Kuchen block above; Känguru;
  deutschland-feiert.de]
- **Plate and cutlery norms that differ from everyday.** The "good"
  china and cloth napkins come out; cake forks and 19 to 20cm cake
  plates for the Kaffeetafel; candles on the table at Christmas and
  birthdays. At a Grillfest, plates are often everyday melamine or
  paper, with a bread basket and bowls of salads. [EDITORIAL]
- **Snapshot-staging default for this market.** The three most authentic
  German cues for an implied crowd are: (1) a long table with a white
  cloth running out of frame, with a row of identical cake plates or
  dinner plates continuing beyond the visible settings; (2) more whole
  cakes or salad bowls than the visible diners could eat (two or three
  Torten on stands for a Kaffeetafel; four or five salad bowls at a
  Grillfest); (3) occasion-specific table decor at the frame edge (an
  Advent wreath or candle arch, a birthday candle ring, a table-centre
  flower arrangement). Blurred relatives in the background stay within
  the 2.5-face limit. [EDITORIAL]

#### Celebration: Christmas Eve dinner (Heiligabend, 24 December)
- Type: calendar holiday.
- When: 24 December, evening, after the Bescherung (gift-giving) or
  before it; intake time evening (dark by about 16:30).
- Gathering: the nuclear family, often with grandparents, about 4 to 8;
  home indoor, at the dining table near the tree. [EDITORIAL]
- The spread: the most common Christmas Eve dish is deliberately simple:
  **Kartoffelsalat mit Würstchen** (potato salad with Wiener or
  Frankfurter sausages), named by about a third of Germans in Statista's
  2024 survey (36%) and in YouGov's (32%). [HIGH — Statista and YouGov
  Deutschland, both 2024] See catalog: Kartoffelsalat (match the region:
  vinegar style in the South, mayonnaise style further north; the East is mixed, so check with a native reviewer).
  Sausages are heated whole, pale pink, about 15 to 20cm, in a pot or a
  bowl; mustard on the table. Fish (carp, salmon) and raclette or fondue
  are real alternatives. A real table carries 2 to 4 shared vessels: a
  large bowl of potato salad, a dish or pot of sausages, mustard, a
  bread basket. [EDITORIAL for counts]
- Snapshot staging: **1 setting**: one plate with a heap of potato salad
  and two sausages, a dab of mustard, the big potato-salad bowl and the
  sausage dish just behind, a lit candle and a fir sprig. **2 settings**:
  two identical plates, the potato-salad bowl between them, the sausage
  dish and mustard jar, the tree's lights soft behind. **Small group**:
  three or four plates at one end, both bowls central, a candle arch or
  Advent wreath at the far edge. Cues: the decorated tree with warm
  lights blurred in the background; wrapped gifts under it; extra
  chairs. [EDITORIAL]
- Decor and cues: real candles, straw stars, a wooden candle arch
  (*Schwibbogen*, Erzgebirge style) on a windowsill. Avoid: an
  American-style "Christmas dinner" with turkey; snow-globe kitsch.
- Never stage: beer bottles or Sekt beside the potato salad (a strong
  prior); church service or nativity scenes as the subject; a child as
  the drinker.
- Confidence and sources: HIGH for the dish ; EDITORIAL for staging; S79, S80

#### Celebration: Christmas feast (1. und 2. Weihnachtsfeiertag, 25–26 December)
- Type: calendar holiday.
- When: 25 and/or 26 December, midday meal (about 12:00 to 14:00);
  intake time midday. Families often split the two days between the two
  sets of grandparents.
- Gathering: extended family, about 6 to 12; home indoor (often the
  grandparents' home). [EDITORIAL]
- The spread: **roast goose** with red cabbage and potato dumplings is
  the classic (see catalog: Roast goose (Christmas / St. Martin)), with
  duck, Rinderrouladen (see catalog: Rinderrouladen) or Sauerbraten (see
  catalog: Sauerbraten) as common alternatives; dumplings per catalog:
  Knödel (dumplings). Dessert or the Kaffeetafel follows with Stollen and
  Christmas biscuits. Shared vessels: the goose on a platter (carved,
  legs separated), a bowl of dumplings, a bowl of red cabbage, a gravy
  boat; about 4 to 6. [MEDIUM-HIGH — calendar row above; catalog entries]
- Snapshot staging: **1 setting**: one plate with a goose leg, a dumpling
  in gravy and red cabbage (per the catalog's prompt-ready line), the
  goose platter cropped behind, the red-cabbage bowl in the midground.
  **2 settings**: two identical plates, the carved goose between them,
  dumpling bowl and gravy boat. **Small group**: three or four plates at
  one end of the white-clothed table, all bowls central. Cues: a long
  table leaving frame with more place settings; an Advent wreath or
  candles; the tree blurred behind; winter window light at midday.
  [EDITORIAL]
- Decor and cues: white or red tablecloth, fir sprigs, candles, the good
  china. Avoid: orange slices on the goose (an anti-pattern in the
  catalog), an overly baroque banquet.
- Never stage: red wine (the most common prior beside goose); church or
  nativity imagery as the subject.
- Confidence and sources: MEDIUM-HIGH (calendar sources and catalog entries); EDITORIAL for staging

#### Celebration: New Year's Eve raclette (Silvester, 31 December)
- Type: calendar holiday.
- When: 31 December, a long evening meal from about 19:00, eaten slowly
  until midnight; intake time evening.
- Gathering: friends or family, about 4 to 8 around one table (a
  raclette grill serves about 8); home indoor. [MEDIUM — the grill's
  ~8 pans, catalog entry]
- The spread: see catalog: New Year's Eve raclette (*Silvester*) for the
  grill, pans, potatoes and bowls; fondue is the alternative. The table
  carries the grill plus about 6 to 10 small bowls (potatoes, pickles,
  sliced meats, peppers, mushrooms, onions, corn), more than any other
  German occasion. [MEDIUM-HIGH — catalog entry]
- Snapshot staging: **1 setting**: one small plate with two potatoes
  under scraped cheese and a pan in hand-off position, the grill's
  corner in frame, three small bowls behind. **2 settings**: two
  identical plates either side of the grill's end, pans slid in at
  angles. **Small group**: three or four plates around the grill, the
  far side of the table and its bowls soft. Cues: more raclette pans
  than visible diners (eight pans, four people visible); the grill's
  cable running off the table; fireworks through the window, soft and
  distant. [EDITORIAL]
- Decor and cues: streamers, small table confetti, lucky-charm
  decorations (four-leaf clover, chimney sweep, pig figures, a German
  Silvester custom). Avoid: indoor fireworks, legible "2027" banners.
- Never stage: Sekt glasses and the midnight toast; Feuerzangenbowle
  (a rum-based punch); the lead-pouring custom is fine only without
  any drink.
- Confidence and sources: MEDIUM-HIGH (catalog entry); EDITORIAL for staging and the lucky-charm cue [MEDIUM.

#### Celebration: Easter brunch (Osterfrühstück) · app: Brunch, Dining room
- Prompt-ready line: "A German family Easter brunch for four at late
  morning: a warm wooden dining table by a side window in a bright, lived-in
  home, a sliced golden Hefezopf braid with flaked almonds, a bowl of four
  naturally dyed hard-boiled eggs, a platter of sliced Easter ham, smoked
  salmon with lemon, cold cuts and mild cheese, a bowl of herb quark with
  chives, radishes, cucumber and tomato, small bowls of butter, berry jam and
  honey, a small lamb-shaped sponge cake dusted with icing sugar, a glass vase
  of daffodils and tulips, four white plates with linen napkins, clear
  tumblers with ice and lemon, soft spring daylight."
- Type: holiday family gathering, the most common Easter activity (40% of
  Germans planned a shared Easter meal in 2025, per the brief citing YouGov).
- When: Easter Sunday or Monday, late morning to early afternoon. Easter
  falls in March or April.
- Where: a parent's or grandparent's home, often a house; a dining room
  open to a bright kitchen. The garden or terrace when the weather allows.
- Gathering: 4 place settings, portions for 4 and no more.
- The spread (savoury): sliced Osterschinken (about 8 slices), smoked
  salmon, cold cuts and a mild spring cheese, herb quark, radishes,
  cucumber and tomato, painted eggs (4), a few slices of Falscher Hase
  (meatloaf baked around hard-boiled eggs). A warm lunch, if any, is roast
  lamb (see Easter Sunday lunch).
- The spread (sweet): Hefezopf (1 small, sweet braided yeast bread with
  flaked almonds or pearl sugar), Osterlamm (1 small lamb-shaped sponge
  cake with icing sugar), a few chocolate eggs or bunnies, butter, jam and
  honey, fresh rolls.
- Tableware: white or warm-neutral ceramic plates and platters, small
  bowls, linen napkins, one modest glass vase, stainless-steel cutlery, a
  bread knife; clear glass tumblers for the hero drink.
- Mood: relaxed and unhurried, less formal than Christmas; spring shows in
  the food and the small flowers.
- Product: with a multi-serve bottle (1.25 L PET), the bottle stands open in
  the front third, tethered cap hanging from the neck, water droplets on
  it, beside several glasses with ice and lemon (see HARD STAGING RULES).
- People (when the brief allows): a family of four, two adults aged about
  30–45 and two children aged about 6–12, faces never recognizable (cropped
  above the mouth or below the eyes, backs, side angles, soft focus).
  Relaxed spring clothes in warm neutrals: cotton shirts, knitwear, simple
  blouses, light overshirts. Simple watch or subtle jewellery. Natural
  actions: slicing the Hefezopf, passing a platter, pouring, reaching for
  food, tapping eggs.
- Never stage: a tapas or Mediterranean sharing-board look, Eastern
  European feast cues, a Christmas or dinner mood, heavy pastel styling,
  gourmet plating, religious symbols, an empty table, raw meat. Chocolate
  bunnies stay generic: no gold foil, no red ribbon or bell, nothing that
  reads as a known brand.
- Confidence and sources: MEDIUM. From the TCCC ProdX Easter brunch brief
  (12 Nov 2026, citing YouGov 2025 and Lebensmittelverband Deutschland
  2023) [S-BRIEF]; not image-tested.

#### Celebration: Easter Sunday lunch (Ostersonntag)
- Type: calendar holiday.
- When: Easter Sunday, midday (intake time midday); the Easter breakfast
  or brunch earlier in the day has its own entry (Easter brunch, below).
- Gathering: extended family, about 6 to 12; home indoor, or a
  restaurant lunch. [EDITORIAL]
- The spread: **roast lamb** (leg or shoulder) is the traditional Easter
  Sunday main, served with bread dumplings, potatoes or fried potatoes
  and green beans; regional variants and other roasts are common. The
  **Osterlamm** cake (a sponge cake baked in a lamb-shaped mould,
  dusted with powdered sugar, about 20 to 25cm long, roughly twice the
  can's height when standing) and a sweet yeast braid (*Osterzopf*)
  belong to the afternoon Kaffeetafel. [MEDIUM — Hessen consumer portal
  and German food sources] No roast-lamb or Osterlamm catalog entry
  exists; added to CANDIDATE QUEUE. Roast lamb reads as a browned
  joint, pink when sliced, on a carving board; see catalog: Knödel
  (dumplings) for the sides. Shared vessels: 4 to 6.
- Snapshot staging: **1 setting**: one plate with two lamb slices, a
  dumpling, green beans and gravy, the carved joint on its board cropped
  behind, a bowl of potatoes. **2 settings**: two identical plates, the
  lamb board and a vegetable bowl between them, a small vase of spring
  flowers. **Small group**: plates at one end, the Osterlamm cake on a
  stand at the far end, partly cropped. Cues: a vase of branches hung
  with painted eggs (*Osterstrauch*); a bowl of dyed eggs; bright spring
  light. [EDITORIAL]
- Decor and cues: the Easter-egg branch, pastel napkins. Avoid: US-style
  Easter-bunny props in a cartoon or branded style. A generic chocolate
  Easter hare (*Osterhase*) is a German motif (documented in German-speaking
  lands since the 1600s) and is fine: no gold foil, red ribbon or bell.
- Never stage: the church blessing of the Osterlamm cake; wine.
- Confidence and sources: MEDIUM ; EDITORIAL for staging; S81, S82

#### Celebration: Birthday Kaffeetafel and children's party (Geburtstag)
- Type: life event.
- When: the family birthday is an afternoon Kaffee und Kuchen at about
  15:00, often moved to the weekend (intake time midday to golden-hour);
  round-number adult birthdays (30, 50, 60) add an evening meal or a
  restaurant booking (evening). [MEDIUM — deutschland-feiert.de]
- Gathering: grandparents, parents, siblings and close friends, about 6
  to 15 at home; children's parties are 6 to 12 children at home or a
  play venue. Home indoor, home outdoor in summer. [MEDIUM]
- The spread: the **Kaffeetafel**: two to four cakes chosen from the
  catalog's Kaffee und Kuchen block (Black Forest cake, Käsekuchen,
  plum cake, Streuselkuchen, Bienenstich), a whipped-cream bowl, the
  birthday cake with candles. For a children's party, savoury basics
  first (sausages, mini pizzas, hot dogs) then cake, muffins and waffles.
  [MEDIUM — familie.de and lecker.de party-food articles; catalog block]
- Snapshot staging: **1 setting**: one cake plate with a slice of Black
  Forest cake and a cake fork, the whole Torte on a stand partly cropped
  behind, a bowl of whipped cream; no coffee cup (beverage scope).
  **2 settings**: two identical cake plates (same cake), a second cake
  (plum cake squares) on a platter between them. **Small group**: three
  or four settings, two or three cakes down the middle, the birthday
  cake with a candle ring at the far end. Cues: a wooden birthday ring
  with candles (*Geburtstagskranz*) in front of the honoree's seat;
  flowers in a vase; a gift table soft at the edge. [EDITORIAL]
- Decor and cues: patterned or lace tablecloth, the good cake service,
  a garland. Avoid: legible name banners.
- Never stage: coffee cups or pots (beverage scope); Sekt for the
  toast; a child under about 13 as the drinker.
- Confidence and sources: MEDIUM ; EDITORIAL for staging; S83, S84

#### Celebration: Confirmation and First Communion (Konfirmation, Erstkommunion)
- Type: life event (religious milestone; staging is the family meal only). Konfirmation is Protestant (strongest in the North and centre); Erstkommunion is Catholic (South and West). In the former East, where church membership is low, the secular **Jugendweihe** is the common coming-of-age (see the entry below).
- When: spring, from the Sunday after Easter through mid-May; a
  restaurant lunch after the church service (intake time midday), then
  Kaffee und Kuchen in the afternoon. [MEDIUM — Känguru]
- Gathering: godparents, grandparents, aunts and uncles, about 10 to 25;
  a family restaurant's side room (restaurant) or at home (home indoor),
  sometimes catered. Restaurants book up months ahead in this season.
  [MEDIUM — Känguru; restaurant event pages]
- The spread: a set restaurant menu with a choice of pork, poultry or
  fish mains (see catalog: Schweinsbraten, Rinderrouladen, Schnitzel
  Wiener Art) or a hot buffet; afterwards the family's own cake buffet,
  which some restaurants allow. [MEDIUM — Känguru; restaurant event
  pages] Shared vessels at a buffet: chafing dishes in a row; at a set
  menu, only bread baskets and the flower centrepiece.
- Snapshot staging: **1 setting**: one plated main (Schweinsbraten with
  a dumpling and gravy) on a white-clothed restaurant table, a small
  spring-flower arrangement and a folded napkin, the table running on
  out of frame with identical settings. **2 settings**: two identical
  plates side by side on the long table, the bread basket between.
  **Small group**: three or four settings on one stretch of the long
  table; a second laid table soft behind. Cues: identical place settings
  continuing beyond the frame; a white-and-green table runner or small
  candles; blurred relatives in their best clothes. The honoree (aged
  about 9 for communion, about 14 for confirmation) is never shown with
  the product. [EDITORIAL]
- Decor and cues: spring flowers, white table linen, a restaurant side
  room with wood panelling. Avoid: the church interior, the baptismal
  or communion candle as a prop next to the product.
- Never stage: the service, crosses, chalices or the communion wafer;
  wine at the table; the child honoree as the drinker.
- Confidence and sources: MEDIUM (restaurant event pages, lower tier); EDITORIAL for staging; S85

#### Celebration: Jugendweihe (secular coming-of-age, mainly the East)
- Prompt-ready line: "A family lunch for a Jugendweihe in eastern Germany:
  a restaurant side room with a long white-clothed table, plated roast with
  dumplings and red cabbage, a small flower arrangement and a gift envelope
  at one place, spring light."
- Type: secular life event for 14-year-olds, introduced in the GDR in 1954
  and still widely held in the former East. A ceremony in a hall, then a
  family lunch and Kaffee und Kuchen, the same pattern as Konfirmation.
- When: spring (March to June), midday.
- Staging: as for Konfirmation, a family restaurant lunch or a meal at
  home; the teenager is never identifiable.
- Never stage: alcohol toasts, GDR symbols or flags.
- Confidence: MEDIUM (general knowledge; needs a native reviewer).

#### Celebration: Wedding (Hochzeit)
- Type: life event.
- When: May to September, Saturdays; the meal after the ceremony runs
  from late afternoon into evening (golden-hour, then evening); the
  Kaffeetafel with the wedding cake often comes first, in the afternoon.
- Gathering: survey figures differ: about 65 to 82 guests in two
  consumer surveys, while caterer enquiries average about 38 in a 2026
  report; smaller weddings are clearly rising. A rented hall, country
  inn or estate; long tables or round tables (venue: other). [MEDIUM —
  Hochzeitsreport 2026 (Appinio survey, via gastgewerbe-magazin) and
  wedding-industry pages, flagged per §6]
- The spread: a hot **buffet** or a plated three-course menu, with roasts
  (see catalog: Schweinsbraten, Sauerbraten), Spätzle (see catalog:
  Käsespätzle), salads and a dessert buffet; the tiered wedding cake;
  a late-night snack (Currywurst or Gulaschsuppe; see catalog: Currywurst)
  is a common German wedding custom. [MEDIUM for buffet and cake;
  LOW for the late-night snack, general knowledge]
- Snapshot staging: **1 setting**: one plate from the buffet (roast
  slices, Spätzle, salad) at a white-clothed long table, a flower
  centrepiece partly cropped, a blank name card. **2 settings**: two
  identical plates, the centrepiece between them, the row of settings
  continuing. **Small group**: three or four settings, the buffet line
  with chafing dishes soft in the background. Cues: long table out of
  frame; buffet station soft behind; fairy lights or a barn interior.
  [EDITORIAL]
- Decor and cues: white linen, greenery runners, candles. Avoid: the
  couple as identifiable subjects; legible seating plans.
- Never stage: Sekt reception, wine, beer, the toast; drinks at the
  Polterabend (the eve-of-wedding party where old porcelain is smashed for
  luck; stage the shards and the sweeping, not the drinks).
- Confidence and sources: MEDIUM ; EDITORIAL for staging; S86, S87

#### Celebration: Summer Grillfest (Grillen with friends and neighbours)
- Type: community or family gathering (recurring, May to September).
- When: weekend afternoon into evening (golden-hour is the strongest
  intake time; long light evenings to about 21:30 in June).
- Gathering: friends, neighbours or the extended family, about 6 to 15;
  home outdoor (garden, allotment, balcony) or a park (other). Grilling
  is mass behaviour: about seven in ten Germans grilled in 2026 per
  YouGov. [HIGH for prevalence — YouGov Deutschland Grillsaison-Bilanz
  2026; MEDIUM for headcount, EDITORIAL]
- The spread: bratwurst (see catalog: Bratwurst im Brötchen; Thüringer
  or Nürnberger forms), marinated pork neck steaks (*Nackensteak*, the
  most-searched grill cut), chicken, halloumi or vegetarian sausages;
  shared salads that guests bring (see catalog: Kartoffelsalat; pasta
  salad), a bread basket or baguette, ketchup, mustard, herb butter.
  [MEDIUM-HIGH — YouGov; Statista; ENVIRONMENT outdoor scenario] Shared
  vessels: 4 to 7 salad bowls plus a platter of grilled meat; a
  Grillfest table carries more salads than any other occasion.
- Snapshot staging: **1 setting**: one plate with a bratwurst, a spoon of
  potato salad and pasta salad, a slice of baguette, on an oilcloth-
  covered garden table; the grilled-meat platter and two salad bowls in
  frame, cropped. **2 settings**: two identical plates, the salad bowls
  and bread basket between them. **Small group**: three or four plates
  at one end of a long garden table, the grill smoking soft in the
  background. Cues: the grill and its smoke soft behind; a row of salad
  bowls with cling film just lifted; a returnable crate at the edge
  (empty or with the hero product only); hedged allotment plot or
  balcony geraniums. [EDITORIAL]
- Decor and cues: oilcloth tablecloth, folding chairs, string lights at
  dusk. Avoid: beer garden settings, Oktoberfest dress.
- Never stage: beer bottles or crates of beer (the strongest prior in
  this scene; prompt "no beer, no bottles other than the hero product");
  grill-master-with-beer clichés.
- Confidence and sources: HIGH for prevalence ; MEDIUM for menu; EDITORIAL for staging; S88

---

## GAME NIGHT

Schema §5.8 applies throughout: screens, cards, boards and tiles are
never legible; no crests, kits, sponsor marks or league logos; no
betting slips, odds screens, betting apps or money on the table; party
size is the place settings in frame, the crowd implied (§5.7); no
identifiable children; a late kick-off is a night scene. The
alcohol-exclusion rule (FILE ROLE & METHOD) and the children and schools
caution apply to every entry: beer is the default at every German
football setting in reality, and none may appear in frame. The brief
dictates the SKU (§5.4); the pairing matrix in COCA-COLA MARKET
INTEGRATION already rates stadium and public viewing a strong fit (can
or 0.5L PET). Existing lines this section builds on rather than repeats:
the Sport settings line in ENVIRONMENT & STAGING SCENES (stadium
concourse kiosk, public-viewing screen, amateur clubhouse kiosk), the
"football terrace or public-viewing crowd" Coca-Cola-alone moment, and
Gulaschsuppe as a stadium staple (catalog: Soups & Eintopf).

### Watch parties

Football is the viewing occasion: the Bundesliga weekend at home or in
the Kneipe, and in tournament summers the national team at Public
Viewing fan miles and at home with the grill. Euro 2024 fan zones held
about 40,000 in Berlin and 25,000 in Munich [HIGH — The Local,
muenchen.de, UEFA]. Signature viewing foods are Bratwurst in a roll with
mustard, Pommes and Currywurst at the fan mile, and Knabberzeug (crisps,
peanut puffs, salt sticks) in bowls plus Frikadellen at home. The
stadium-concourse kiosk is already covered by the existing Sport line
and needs no separate entry.

#### Watch party: Public Viewing fan mile (Euro and World Cup summers)
- When: June to July in tournament years. For a European-hosted
  tournament, games kick off around 15:00, 18:00 and 21:00 local time
  [LOW — not verified, model knowledge for Euro 2024 slots], so the
  intake time is golden-hour or evening; a 21:00 kick-off ends in full
  darkness, so the scene carries the LED wall's glow and string lights,
  not golden hour. World Cup 2026 games from North America landed in the
  German evening or late night [LOW — arithmetic].
- Gathering: tens of thousands on a closed-off square, park or fan mile
  (Berlin about 40,000; Munich Olympiapark about 25,000 for Euro 2024)
  [HIGH]. The operator's party is 1 to 4 friends at a stand-up table.
  Venue: other (fan zone).
- The spread: Bratwurst in a roll with a stripe of mustard on a paper
  tray (see catalog: Bratwurst im Brötchen), Pommes in a paper cone or
  tray (see catalog: Pommes), Currywurst cut into slices with a wooden
  fork (see catalog: Currywurst); fan-zone food stands are documented
  [LOW-MEDIUM — fan-zone food noted by The Local; the specific dish mix
  is not verified].
- Surface and environment: a round stand-up high table (*Stehtisch*),
  paper trays and napkins; a giant LED wall far behind as an
  out-of-focus green field; string lights, food-stall awnings and the
  backs of a crowd soft in the background; a plain black-red-gold scarf
  or a cropped tricolour pattern at most, never a full flag (reviewer
  ruling, §5.7).
- Snapshot staging: **1 setting**: one paper tray with a Bratwurst roll
  on the high table, the screen glow far behind. **2 settings**: two
  identical trays side by side, a shared Pommes cone between them.
  **Small group**: three or four trays round the high table, a second
  high table soft behind, blurred backs of heads toward the screen (no
  more than about 2.5 faces, none sharp).
- Never stage: beer cups, beer stands, deposit beer cups stacked on the
  table (the strongest prior in this scene; prompt "no beer, no cups
  other than the hero product"); national or club kits with crests or
  sponsor marks; face paint on children; a legible screen or sponsor
  banner; flares or crowd crush.
- Confidence and sources: HIGH for fan-zone scale ; LOW-MEDIUM for food; LOW for kick-off times; EDITORIAL for staging; S89, S90

#### Watch party: tournament game at home with the garden grill
- When: tournament summers, an 18:00 or 21:00 kick-off with the grill lit
  beforehand; intake time golden-hour for the grilling, evening for the
  game itself [LOW — not verified; the notes rank it Germany's second
  stageable scene].
- Gathering: friends, neighbours or family, 4 to 10; home outdoor
  (garden, allotment, balcony) with the TV carried out or seen through
  the patio door, or a projector on a wall. Follows the summer
  Grillfest pattern (see CELEBRATIONS: Summer Grillfest).
- The spread: Grillwurst and Bratwurst (see catalog: Bratwurst im
  Brötchen), potato salad (see catalog: Kartoffelsalat), Brezeln (see
  catalog: Brezel), a bread basket, mustard and ketchup [LOW — not
  verified for the viewing pairing; the grill menu is MEDIUM-HIGH per
  the Grillfest entry].
- Surface and environment: an oilcloth-covered garden table, folding
  chairs, the grill smoking soft behind; a TV glow through the patio
  door or a projector image on a white wall, unreadable; string lights at
  dusk.
- Snapshot staging: **1 setting**: one plate with a Bratwurst, a spoon of
  potato salad and half a Brezel, the TV glow through the door behind.
  **2 settings**: two identical plates, the sausage platter and salad
  bowl between them. **Small group**: three or four plates at one end of
  the garden table, extra salad bowls cropped, blurred figures facing
  the screen.
- Never stage: beer bottles or crates of beer (prompt "no beer, no
  bottles other than the hero product"); kits with crests; a legible
  screen.
- Confidence and sources: LOW for the viewing-specific pairing; see the Grillfest entry for the grill menu; EDITORIAL for staging

#### Watch party: Bundesliga Saturday on the sofa
- When: August to May. The main Saturday kick-off is about 15:30, with
  the top game about 18:30 [LOW — not verified, model knowledge];
  intake time golden-hour for 15:30 (midday light in summer, near dusk
  in winter) and evening for 18:30.
- Gathering: 2 to 6 friends or family; home indoor, typically the
  living room of a rented apartment (see ENVIRONMENT). The Kneipe
  (neighbourhood pub) showing the game is the main public form and is
  beer-led: stage the home version instead.
- The spread: Knabberzeug in bowls: crisps (*Chips*), peanut puffs
  (*Erdnussflips*), salt sticks; Frikadellen on a plate with mustard
  (see catalog: Frikadelle); a pizza delivery box (see catalog:
  Contemporary everyday food, Pizza) [LOW — not verified; the notes list
  Chips, Flips and Frikadellen].
- Surface and environment: a coffee table in front of the sofa; a
  modest apartment living room; the TV a soft green blur with no score
  bug or broadcaster mark; a plain scarf in club-neutral colours over
  the sofa arm at most.
- Snapshot staging: **1 setting**: one small plate with two Frikadellen
  and mustard on the coffee table, a bowl of Flips beside it. **2
  settings**: two identical plates, the snack bowls and an open pizza box
  between them. **Small group**: plates round the coffee table, more snack
  bowls than needed, blurred figures on the sofa running out of frame.
- Never stage: beer bottles or crates; club crests, kits or sponsor
  marks; a legible screen; betting apps.
- Confidence and sources: LOW for timing and spread; EDITORIAL for staging

### Social game nights

Popularity as an occasion to gather and eat around: **high**. Germany
has the highest board-game purchases per capita and SPIEL Essen drew
about 220,000 visitors in 2025 [MEDIUM — Wikipedia, SPIEL]. The home
*Spieleabend* (games evening) with Euro-style board games is the core
format; Skat and Doppelkopf card games are traditional, often in the
Kneipe [LOW — not verified]. The Kneipe card table is beer-led, so it is
staged only as a home table.

#### Game night: Spieleabend at home (board or card games)
- When: weekend evening; intake time evening; winter is the strongest
  season [EDITORIAL].
- Gathering: 3 to 6 friends or a family across generations at the
  dining table or coffee table; home indoor.
- The spread: Knabberzeug in bowls (salt sticks, crisps, pretzel snacks),
  a cheese and cold-cuts board with bread (see catalog: Abendbrot spread,
  Obatzda & Brotzeit board); food on side plates and a separate board so
  it does not cover the game [LOW — not verified; the notes' editorial
  spread].
- Surface and environment: a wooden dining table under a pendant lamp;
  a generic board with abstract tiles, wooden meeples and dice, or a
  fanned hand of plain cards for Skat or Doppelkopf; a shelf of game
  boxes blurred behind with unreadable spines; candles or a lamp in
  winter.
- Snapshot staging: **1 setting**: one side plate with bread and cheese
  at the table edge, a bowl of salt sticks, the board partly in frame.
  **2 settings**: two identical side plates, the shared board between
  them, dice and meeples on the game. **Small group**: four side plates
  round the table, the cold-cuts board cropped at one end, blurred
  players leaning in.
- Never stage: licensed or branded games (Catan or other recognisable
  boxes and boards, branded decks); legible cards or score pads; money
  or stakes on the table (Skat is sometimes played for small stakes)
  [LOW]; beer or wine glasses.
- Confidence and sources: MEDIUM for popularity (market-research tier, flagged); LOW for the spread; EDITORIAL for staging; S91, S92

#### Game night: holiday games (Advent, Christmas and Silvester)
- When: Advent and Christmas afternoons (golden-hour, dark by about
  16:30 in December, so lamp and candle light) and New Year's Eve
  (evening, through to midnight) [LOW — not verified for the pairing].
- Gathering: the family from the Christmas and Silvester entries (see
  CELEBRATIONS: Christmas feast; New Year's Eve raclette), 4 to 10;
  home indoor.
- The spread: Advent and Christmas: a tin of Plätzchen (Christmas
  biscuits) and sliced Stollen (no catalog entry yet; see CANDIDATE
  QUEUE item 7). Silvester: games played around or after the raclette
  (see catalog: New Year's Eve raclette) [LOW — the notes flag the
  raclette-and-games pairing as not verified].
- Surface and environment: dining table with a seasonal cloth, an
  Advent wreath or candle arch soft at the edge, a generic board game or
  plain cards pushed to one end; for Silvester, the raclette grill in the
  middle with the game beside it.
- Snapshot staging: **1 setting**: one plate with two biscuits and a
  slice of Stollen beside the board. **2 settings**: two identical plates,
  the biscuit tin open between them. **Small group**: plates round one
  end of the table, the raclette grill or the Stollen board cropped,
  blurred relatives behind.
- Never stage: Sekt, mulled wine or wine (strong priors at both
  occasions); fireworks as the focus; branded games; money on the table;
  identifiable children.
- Confidence and sources: LOW for the pairings; EDITORIAL for staging

---

## DISH CATALOG

**Scale note for every entry.** Per `coca-cola-guidelines.md` §3/§4.3, the
non-US-market default single-serve can is **330mL, 115.2mm (11.52cm) tall,
66.1mm (6.61cm) diameter** — this is the figure to use for Germany's can-
based scale anchors, replacing the draft's own rougher "~11.5cm × ~6.6cm"
placeholder with the already-verified precise figure (the UK build did the
same correction; see `DECISIONS.md`). **This pass could not independently
confirm a Germany-specific can dimension beyond the general non-US default,
and could not confirm whether Germany uses a "slim" 330mL can variant
alongside or instead of the standard-diameter can** — flagged honestly as a
remaining gap for this market specifically (see GAP LOG), not papered over.
Entree plate fallback: 26–28cm diameter, per
`tableware-composition-reference.md` §2 — this matches the draft's own
"dinner plate: 26–28cm" figure exactly, so no correction was needed there.
Oval-platter fallback (32–36cm in the draft) sits within
`tableware-composition-reference.md`'s own 32–38cm communal-platter range —
consistent, not contradicted.

**A note on this catalog's depth, an explicit proportionality choice.** The
draft documents roughly 50 dishes/snacks at real staging-relevance. Giving
every one of them the full per-dish schema (§4.5's complete field list)
would make this file unusably long relative to the actual likely prompt
volume per dish. This pass gives **full schema treatment to the dishes this
project's own Priority A/B verification queue flagged, and to every dish
with a genuine coexisting-variant (§4.6) or naming-sensitivity issue**, and
keeps the remaining, lower-priority catalog items as **compact but still
schema-conformant tables** (each still carrying a real-world scale anchor
and a confidence tag) — the same "compact index entry, not a bare list"
standard `country-file-schema.md` §4.3 sets for a style-map pointer. This is
a proportionality judgment call, not a shortcut around the schema's
requirements; flagged explicitly here rather than left implicit.

### Bread & Abendbrot

#### Dish: Brötchen (bread rolls)

- Prompt-ready line: "A cloth-lined bread basket loosely filled with six
  crusty German bread rolls, each a little shorter than the can is tall
  and wider than it: plain split-top rolls with a paler ridge, one
  densely seeded, one dark rye. Crust thin, dry and crackly, flaking onto
  the table; a few loose seeds. One roll split on a small plate beside a
  curl of butter. No soft buns, no glaze."
- Cuisine lineage: see RESEARCH LOG › DISH LINEAGE NOTES.
- Category: Everyday, all in-scope meal slots.
- Serving format: A bakery basket or paper bag of mixed rolls (plain white
  split-top, poppy-seed, sesame, pumpkin-seed, multigrain, dark rye); as a
  *belegtes Brötchen* (a filled sandwich roll — salami, cheese, or ham, plus
  a lettuce leaf and a cucumber or egg slice) for a grab-and-go lunch.
- Serving vessel: Bakery basket or paper bag; a bread/side plate (19–20cm)
  at the table.
- Visual/plating characteristics: A thin, crackly crust that shatters into
  flakes, golden with a lighter split ridge on top; airy, irregular-holed
  off-white crumb. Seeded rolls are densely coated, with seeds scattering
  onto the board. A Kaiser roll shows a five-arm pinwheel pattern.
- Real-world scale (§4.5): Roughly 9–11cm diameter, 5–6cm tall — clearly
  smaller than the 330mL can's 11.52cm height. [MEDIUM]
- Common confusion: A soft, glossy US-style burger bun or brioche roll —
  ruled out by the crackly, flake-shattering crust and airy, irregular
  crumb, neither of which a soft enriched dough produces.
- Confidence: MEDIUM-HIGH overall.
- Sources: general German-bakery sourcing aggregated across multiple food- culture references; not independently re-verified with a dedicated search this pass beyond general confirmation of the naming variation
- **Composition & proportions (§4.7)** — a basket at the table, and one
  belegtes Brötchen.
  - What dominates: the rolls themselves — crust ~80% of what is seen in a
    basket; seeds and flour dust are surface accents. In a belegtes
    Brötchen, bread ~70% of the silhouette, the filling a 1–2 cm band with
    one lettuce frill showing at the edge. [EDITORIAL]
  - Components: rolls ~9–11 cm across, 5–6 cm tall (per the entry) — a
    little narrower than the can is tall; 5–8 rolls in a basket, 1–2 per
    person on the side plate; a filled roll holds 2–3 folded slices of one
    cold cut or cheese, one lettuce leaf, 2–3 cucumber or egg slices.
    [EDITORIAL]
  - Arrangement: basket loosely heaped, mixed types; on the plate one roll
    split, butter in a small curl beside it.
  - State cues: dry, matte, crackly crust; a few crust flakes and loose
    seeds on the board or plate; no gloss.
  - Absent on purpose: soft glossy burger buns, sesame-bun uniformity,
    overstuffed deli layers, toothpicks, sauces dripping.

#### Dish: Rye and mixed loaves (incl. Pumpernickel)

- Prompt-ready line: "Five thick slices of dark German rye bread fanned
  in an overlapping row on a wooden board, each slice a little longer
  than the can is tall and about a finger thick, with dense, moist,
  fine-grained brown crumb and a thick dark cracked crust dusted with
  flour. Two small near-black square pumpernickel slices beside them.
  The cut loaf heel behind. A few crumbs; nothing spread on the bread."
- Category: Everyday, Abendbrot staple.
- Visual/plating characteristics: Thick slices fanned on a board. A dark
  rye or mixed-grain loaf (*Mischbrot*) shows a thick, dark-brown, rustic,
  often cracked and flour-dusted crust with a dense, moist, fine-grained
  crumb. Pumpernickel is near-black-brown, crustless-looking, very fine and
  moist, with a slight whole-grain speckle.
- Real-world scale (§4.5): Slices roughly 1–1.5cm thick, 12–15cm across;
  Pumpernickel slices roughly 9×9cm, ~0.7cm thick. [MEDIUM]
- Common confusion: A white sliced sandwich loaf — ruled out by the dark
  color and dense, moist crumb.
- Confidence: MEDIUM.
- **Composition & proportions (§4.7)** — slices on a board.
  - What dominates: cut faces of crumb (~70% of the visible bread) over a
    thin dark crust rim; the loaf end, if shown, is a secondary element.
    [EDITORIAL]
  - Components: slices 1–1.5 cm thick, 12–15 cm across (just longer than
    the can is tall); Pumpernickel squares ~9 cm, ~0.7 cm thick (per the
    entry); 4–6 slices fanned on a board, 1–2 per person. [EDITORIAL]
  - Arrangement: slices fanned in an overlapping row beside the loaf heel;
    a bread knife flat on the board; a few crumbs.
  - State cues: moist, dense, matte crumb; flour dust on the crust; no
    butter melt (cold bread).
  - Absent on purpose: white sandwich bread, open airy holes, seeds piled
    on top, spreads already applied unless an Abendbrot scene.

#### Dish: Abendbrot spread

- Prompt-ready line: "A German cold-supper table: small wooden boards,
  one per person, each with a single open slice of dark rye bread topped
  with one layer of salami. At the centre, a plate of fanned salami, ham
  and pale Emmental slices with round holes, a basket of sliced bread, a
  butter dish, a small bowl of red radishes each about a third of the
  can's width, and glossy gherkins a little shorter than the can. Cold, orderly,
  no steam."
- Category: Everyday, the defining cold-dinner register (see GENERAL NORMS
  for its documented, genuine decline alongside a rise in warm dinners —
  offer both as coexisting choices, not a silent default).
- Serving format: One wooden board (*Brettchen*) per person, laid with a
  butter dish, sliced cold cuts (salami, cooked ham, liver sausage), sliced
  cheese (Gouda, or Emmental showing its characteristic round holes),
  pickled gherkins, radishes, tomato and cucumber slices, chives; sometimes
  cold Frikadellen or egg halves.
- Serving vessel: Individual wooden board (*Brettchen*), roughly 22×14cm.
- Visual/plating characteristics: Salami shows a visible fat-marbling
  mosaic and a matte red-brown cut face; Emmental shows round, glossy
  holes; liver sausage is a soft pinkish-beige spread with a visible knife
  trail; gherkins are glossy and bumpy with dill fronds clinging.
- Real-world scale (§4.5): Brettchen ~22×14cm; gherkins ~8–10cm; radishes
  ~2.5cm.
- Confidence: MEDIUM.
- Sources: S8
- **Composition & proportions (§4.7)** — one person's Brettchen within a
  shared table.
  - What dominates: bread and the table-centre plates of cold cuts and
    cheese; on each person's board, one slice of bread takes ~50% of the
    board, the topping a single layer on it. Vegetables are small accents.
    [EDITORIAL]
  - Component table:

    | Component | Real size | Count (table / one board) | Look | Where it sits |
    |---|---|---|---|---|
    | Rye/mixed bread slices | 12–15 cm, 1–1.5 cm thick | 6–10 in a basket / 1–2 | Dense brown crumb | Basket centre; one slice on each board |
    | Cold cuts (salami, ham, liver sausage) | Salami rounds ~6–8 cm; ham slices ~10 cm | ~15–25 slices on one plate / 2–3 | Fanned, one layer | Shared plate centre; one layer on the bread |
    | Cheese (Gouda, Emmental) | Slices ~8–10 cm | ~8–12 / 1–2 | Pale yellow; Emmental with round holes | Shared plate |
    | Gherkins | 8–10 cm (per entry) — a little shorter than the can | 4–6 in a small dish / 0–1 | Glossy, bumpy green | Small dish; halved on a board |
    | Radishes | ~2.5 cm — about a third of the can's width | 6–10 / 2–3 | Red, white cut face | Small bowl |
    | Tomato/cucumber slices | ~5–6 cm rounds | a small plateful / 2–4 | Wet cut faces | Side plate |
    | Butter | block or dish | 1 | Pale, knife-marked | Butter dish centre |

  - Arrangement: shared plates clustered at the table centre, each diner
    with their own Brettchen and knife; everything cold, flat, orderly.
  - Served portion: one open slice of bread with one topping on the board,
    a radish and a gherkin half beside it — not a stacked sandwich.
    [EDITORIAL]
  - State cues: cold, no steam; a light sheen on the cut meats; fresh
    moisture on the vegetable cuts.
  - Absent on purpose: closed stacked sandwiches, hot dishes, garnish
    piles, candles-and-wine dinner staging, coffee cups.

#### Dish: Mettbrötchen (raw seasoned pork roll)

- Prompt-ready line: "Two halves of a crusty white bread roll, each a
  little narrower than the can is tall, side by side on a small white
  plate, each spread to the edge with a finger-thick layer of bright
  rose-pink finely minced seasoned pork, its surface marked with fork
  ridges. A light scatter of crisp white onion dice and black pepper
  specks on top. Bright, clean daylight; nothing else on the plate."
- Category: Everyday snack/party food; North and West-coded.
- Serving format: A halved roll spread thickly with seasoned raw minced
  pork (*Mett*), topped with diced or ringed raw onion and black pepper.
- Visual/plating characteristics: Bright rose-pink, finely minced, slightly
  glossy, often with fork-ridged or piped wavy lines on the surface; crisp,
  translucent-white onion.
- Real-world scale (§4.5): Half roll ~10cm; Mett layer ~1–1.5cm thick.
- **Handling note**: raw meat reads as unsafe or
  unappetizing to many non-German viewers; use only on explicit request,
  lit cleanly and brightly rather than moodily, to avoid an accidental
  "spoiled food" read.
- Confidence: MEDIUM.
- **Composition & proportions (§4.7)** — two roll halves on a plate.
  - What dominates: the pink Mett layer — ~70% of the visible top surface;
    the roll's crust edge a thin golden ring; onion a scatter over ~20% of
    the Mett. [EDITORIAL]
  - Components: half rolls ~10 cm across (per entry), a little narrower
    than the can is tall; Mett 1–1.5 cm deep, spread to the edge; onion
    dice ~0.5 cm or 2–4 thin rings per half; a few black-pepper specks.
    2 halves per serving. [EDITORIAL]
  - Arrangement: two halves side by side on a small plate or board, the
    Mett surface fork-ridged.
  - State cues: fresh, cool, faint gloss on the Mett; crisp translucent
    onion; bright clean light.
  - Absent on purpose: any browning or cooking on the meat, lettuce, sauces,
    cheese; dim moody light.

### Street food & Imbiss

#### Dish: Currywurst

- Prompt-ready line: "A white paper tray about one and a half cans long,
  filled: on one half, sliced grilled sausage coins, each about half the
  can's width, drenched in glossy red-brown curry-ketchup sauce pooling
  in the tray corners, dusted with patches of dry ochre curry powder, a
  small two-pronged wooden fork standing in one piece. On the other half,
  golden fries with a ribbon of thick pale mayonnaise. Grease spots on
  the paper; faint steam."
- Cuisine lineage: see RESEARCH LOG › DISH LINEAGE NOTES.
- Category: Everyday. Lunch, snack, and late-night register.
- Regional form variation (§4.2/§4.3, form-changing) — **offer as an
  explicit choice per §4.6, not a silent default**:
  - **With casing (*mit Darm*)**: a seared bratwurst-style sausage with a
    firmer, crispier exterior — the historical West Berlin and Ruhr default.
  - **Skinless (*ohne Darm*)**: a smoother, paler-surfaced sausage with no
    casing at all: it developed in **East Berlin**
    specifically, tracing to Max Brückner (originally of
    Johanngeorgenstadt, Saxony), who began experimenting with a casing-free
    sausage from 1947 amid natural-casing shortages and brought the method
    to Berlin in the early 1950s; a well-known East Berlin Imbiss (cite as
    evidence only, genericize in any prompt) became particularly associated
    with this skinless style. [HIGH for the East Berlin/casing-
    shortage origin] [S21, S22]
  - **Default when unspecified**: with casing — this reads more clearly as
    a sausage on camera and is the more widespread West German/Ruhr form.
    [EDITORIAL fallback, not a sourced claim — the skinless form should
    still be offered whenever an East Berlin/GDR-heritage setting is named]
- Serving format: Sliced into coins in a paper tray, doused in red-brown
  curry-ketchup sauce, dusted with curry powder; fries and/or a roll
  alongside.
- Serving vessel: Paper tray (~17×11cm).
- Utensils: A small two-pronged wooden or plastic fork (~8cm), stood
  upright in the tray.
- Visual/plating characteristics: Sauce is glossy, semi-thick, and clings to
  each slice, pooling in the tray's corners; curry powder sits as a dry,
  ochre-yellow dust on top in uneven patches, not dissolved; cut faces show
  a fine, uniform pink interior (per the emulsified-sausage texture entry
  above); a grilled (cased) version shows char stripes and slightly curled
  cut edges; translucent grease spots bloom on the paper tray.
- Real-world scale (§4.5): Tray ~17×11cm; sausage slices ~1.5–2cm thick,
  ~3cm diameter — each slice roughly half the 330mL can's diameter.
  [MEDIUM]
- Common confusion: A generic grilled hot dog (ruled out by the sliced-into-
  coins presentation and the curry-ketchup dusting); do not confuse with a
  whole, unsliced sausage on a roll (a different dish/register entirely).
- Confidence: HIGH for the origin dispute and the casing/skinless variant
  distinction; MEDIUM for exact portion dimensions.
- Sources: S18, S19, S20, S21, S22
- **Composition & proportions (§4.7)** — one Imbiss portion with fries.
  - What dominates: sauce-coated sausage coins and fries share the tray
    roughly half and half by area; sauce covers ~80% of the sausage coins;
    curry dust is a patchy accent on top. [EDITORIAL]
  - Component table:

    | Component | Real size | Count (one portion) | Look | Where it sits |
    |---|---|---|---|---|
    | Sausage | ~170 g per portion [MEDIUM — cc-recke Mengenkalkulation (via search)]; coins ~1.5–2 cm thick, ~3 cm across (per entry) — about half the can's width | 8–12 coins | Pink cut faces, cased edges curled and grill-marked | One half of the tray, touching, slightly overlapping |
    | Curry-ketchup sauce | ~3–5 tablespoons | 1 pour | Glossy red-brown, semi-thick | Over the coins, pooling in the corners |
    | Curry powder | a dusting | — | Dry ochre patches | On top of the sauce |
    | Fries | ~250 g portion [MEDIUM — cc-recke (via search)]; ~7–9 cm × ~1 cm (per entry) | ~30–40 | Golden, blistered | The other half of the tray, or a second tray |
    | Mayonnaise (optional) | a piped ribbon | 1 | Thick pale ivory | On the fries only |
    | Wooden fork | ~8 cm | 1 | Pale wood, two prongs | Standing upright in a coin |

  - Vessel fill: the ~17×11 cm paper tray (250–400 mL Imbiss trays are the
    standard size [MEDIUM — verpackungonline (via search)]) is full to the
    rim with a slight heap; no food overflowing onto the table.
  - Served portion: one tray per person; eaten from the tray on a standing
    table. With a roll instead of fries: one plain roll beside the tray.
  - State cues: faint steam; translucent grease spots on the paper; sauce
    glossy, not dried.
  - Absent on purpose: a whole unsliced sausage, a hot-dog bun, onions,
    relish, sauerkraut, parsley, a plate with cutlery.

#### Dish: Döner Kebab (Turkish-German)

- Prompt-ready line: "One Turkish-German döner kebab standing upright on
  its paper wrapper on a small tray: a toasted quarter-wedge of dimpled
  flatbread speckled with sesame and black seeds, a little taller
  than the can, split open and packed with thin curled ribbons of shaved
  meat with crisp brown edges, crowned by shredded lettuce, violet red
  cabbage and tomato. Glossy white garlic sauce drips down one side,
  tinted violet. Steam rising."
- Cuisine lineage: see RESEARCH LOG › DISH LINEAGE NOTES.
- Category: Everyday. Lunch, dinner, and late-night register — one of
  Germany's most-eaten fast foods nationwide.
- Serving format: A quarter-wedge of toasted flatbread, split and stuffed
  with shaved meat (veal, chicken, or turkey), lettuce, red cabbage,
  tomato, onion, and white garlic-yogurt sauce, sometimes a red chili
  sauce; the bottom half wrapped in paper or foil. **Dürüm** (a rolled wrap,
  grill-pressed) and a **Döner plate** (meat over rice or fries with salad)
  are genuine, coexisting serving-format siblings per schema §4.4, not
  variants of the same visual presentation — give each its own read: the
  flatbread wedge is the default, the Dürüm is a longer, narrower rolled
  cylinder with toasted grill-press spots, and the plate is a fully
  different, knife-and-fork presentation.
- Visual/plating characteristics: Meat shavings are thin, curled ribbons
  with caramelized, crisp brown edges and juicier, lighter interiors;
  flatbread is toasted with a dimpled golden crust, speckled with sesame
  and/or black nigella seeds, with a soft pale inner crumb; finely shredded
  violet red cabbage bleeds color into the white sauce; sauce drips down
  the paper.
- Real-world scale (§4.5): The flatbread wedge reads roughly 20–25cm across
  the arc and 12–15cm tall — clearly larger than the 330mL can is tall, and
  clearly larger than the hand holding it. The Dürüm reads roughly 25–30cm
  long, ~6cm diameter. [MEDIUM]
- Common confusion: A Greek gyro in pita bread — a genuinely different,
  confusable dish; the flatbread's shape (a folded wedge, not a rolled
  pita) and the red-cabbage/white-garlic-sauce combination are the
  checkable differences that rule out gyro.
- Confidence: MEDIUM-HIGH for the dish's everyday-German status and form;
  MEDIUM for exact dimensions.
- Sources: general Turkish-German food-culture sourcing; not independently re-verified with a dedicated new search this pass beyond confirming its everyday, nationwide status is consistent with widely available reporting
- **Composition & proportions (§4.7)** — one flatbread-wedge Döner.
  - What dominates: bread and meat. From the side, bread ~40% of the
    silhouette, meat ~30%, salad ~20%, sauce ~10% — the meat is a thick
    layer of thin ribbons, not chunks. [EDITORIAL]
  - Component table:

    | Component | Real size | Count (one Döner) | Look | Where it sits |
    |---|---|---|---|---|
    | Flatbread wedge | ~20–25 cm across the arc, 12–15 cm tall (per entry) — a little taller than the can, the arc about twice its height | 1 | Toasted, dimpled, sesame/nigella | Outer shell, split open at top |
    | Shaved meat | ~145–250 g per standard Döner [MEDIUM — hot-doener-worms.de, pastaweb.de (via search)]; ribbons ~4–8 cm long, 1–3 mm thin | dozens of ribbons | Crisp brown edges, juicy paler centres | Lower half of the pocket, spilling to the opening |
    | Lettuce, red cabbage, tomato, onion | Shreds 3–6 mm; tomato half-moons ~5 cm | a loose handful | Green, violet, red, white | Upper half, poking out of the opening |
    | Garlic-yogurt sauce | ~2–3 tablespoons | 1–2 drizzles | Glossy white, streaked violet by the cabbage | Over the salad, dripping down one side |
    | Chili sauce (optional) | a thin drizzle | 0–1 | Red | Over the white sauce |

  - Arrangement: stuffed so the fillings crown the opening; the lower half
    wrapped in paper or foil.
  - Served portion: one Döner per person, standing on its paper on a tray
    or small plate — not held.
  - State cues: steam from the meat; sauce drips on the paper; toasted
    bread still crisp at the corners.
  - Absent on purpose: hands, a rolled pita (gyro), fries inside, cheese,
    guacamole, lettuce heaped taller than the bread.

#### Dish: Bratwurst im Brötchen

- Prompt-ready line: "One grilled bratwurst laid in a split crusty white
  bread roll on a small paper plate. The roll is about the can's height;
  the sausage is much longer, sticking out a thumb's width or more at
  each end, its taut casing glistening with dark charcoal grill stripes.
  A single stripe of mustard runs along the top. Crisp, matte roll crust
  with airy crumb at the split. Nothing else in the roll."
- Category: Everyday snack; market-grill, stadium, and Christmas-market
  staple.
- Regional form variation (§4.6, coexisting variants, offer as a choice):
  - **Thüringer Rostbratwurst**: long and thin, visibly flecked with herbs
    (caraway, marjoram, garlic). **EU-protected geographical indication**
    (PGI), specific and sourced dimensions: **15–20cm long**, a thin sausage
    from Thuringia. [HIGH] [S23, S24]
  - **Nürnberger Rostbratwurst**: finger-sized, **EU-protected PGI**, may
    legally only be produced in the city of Nuremberg, specific and sourced
    dimensions: **7–9cm long, 20–25g**, pork-based, seasoned with fresh
    marjoram, traditionally grilled over a beechwood fire and sold **three
    to a roll**, or 6–12 on a plate with sauerkraut. [HIGH] [S25, S26]
  - **Generic grill Bratwurst**: thicker, pale-to-browned, no PGI
    protection or regional exclusivity.
  - **Default when unspecified**: match the named region if one is given;
    otherwise a generic grill Bratwurst is the safest non-region-committing
    default. [EDITORIAL fallback]
- Serving format: A grilled sausage in a crusty white roll, overhanging both
  ends, with a mustard stripe.
- Visual/plating characteristics: Per the grilled-sausage-casing texture
  entry above (taut, wrinkled, charcoal grill stripes, glistening
  surface); the roll is torn-crusty outside with airy crumb inside;
  charcoal smoke is often visible in an outdoor-grill setting.
- Real-world scale (§4.5): Roll ~10–12cm; a Thüringer sausage overhangs the
  roll by roughly 3–5cm per side given its 15–20cm length; Nürnberger
  sausages (7–9cm each) sit fully within the roll when served three-to-a-
  roll, with visible overlap.
- Common confusion: A soft, split-top US hot-dog bun with relish — ruled
  out by the crusty white-roll texture and the mustard-not-relish default.
- Confidence: HIGH for both PGI sausages' protected status and dimensions;
  MEDIUM for the generic-Bratwurst register.
- Sources: S23, S24, S25, S26
- **Composition & proportions (§4.7)** — one sausage in a roll (and the
  Nürnberger plate).
  - What dominates: the sausage — it is the longest element and the
    visual centre; the roll frames its middle; mustard a single stripe.
    [EDITORIAL]
  - Components: roll 10–12 cm (per entry), about the can's height;
    Thüringer 15–20 cm, overhanging each end by 3–5 cm; generic Bratwurst
    ~2.5–3 cm thick; Nürnberger three 7–9 cm sausages inside one roll.
    Plated Nürnberger: six on a pewter plate with sauerkraut [MEDIUM —
    Wikipedia: Nürnberger Rostbratwurst (via search)]. Mustard: one stripe
    ~1 cm wide along the sausage. [EDITORIAL]
  - Arrangement: roll split along one side, sausage laid in, ends
    protruding; on a paper napkin or small paper plate.
  - State cues: glistening casing with dark grill stripes; faint charcoal
    smoke in outdoor scenes; roll crust dry and matte.
  - Absent on purpose: soft hot-dog bun, ketchup zigzag, relish, onions,
    cheese, sauerkraut in the roll (sauerkraut only on the Nürnberger
    plate), hands.

#### Dish: Pommes (fries)

- Prompt-ready line: "A white paper tray about one and a half cans long,
  heaped with medium-cut golden fries, each a little shorter than the
  can, lightly blistered and salted. Across the top, one thick ribbon of
  pale ivory German mayonnaise that holds its piped shape and one ribbon
  of glossy red ketchup. A small wooden fork stuck in the pile. Faint
  steam; grease spots on the paper."
- Category: Everyday side/snack.
- Visual/plating characteristics: Medium-cut fries in a paper tray or cone,
  golden with a lightly blistered surface and a fluffy pale interior where
  broken; German mayonnaise is thick, pale ivory, and glossy, piped in
  ribbons that hold their shape (a genuinely different visual convention
  from a thin, runny US-style mayo squeeze); ketchup is darker and glossier.
- Real-world scale (§4.5): Tray ~17×11cm; fries ~7–9cm × ~1cm.
- Common confusion: Do not add malt vinegar — that is a UK-specific
  condiment cue and would read as a UK, not German, chip register.
- Confidence: MEDIUM.
- **Composition & proportions (§4.7)** — one Imbiss portion.
  - What dominates: fries ~85% of the tray surface; the condiment ribbon
    ~10–15%, on top, not beside. [EDITORIAL]
  - Components: ~250 g per portion [MEDIUM — cc-recke (via search)]; fries
    ~7–9 cm × ~1 cm (per entry), a little shorter than the can; ~40–50
    fries; mayonnaise and/or ketchup piped in 1–2 ribbons ("rot-weiß");
    one small wooden fork.
  - Arrangement: loosely heaped in the paper tray or cone, a few ends
    standing up; condiment ribbons laid across the top.
  - Vessel fill: tray filled to the rim with a low heap; cone filled to
    the top.
  - State cues: faint steam, salt grains visible, light gloss; mayo holds
    its piped shape.
  - Absent on purpose: malt vinegar, cheese sauce, gravy, herbs, crinkle
    cut, skin-on wedges, a plate and cutlery.

#### Dish: Fischbrötchen

- Prompt-ready line: "A crusty white bread roll a little longer than the
  can is tall, split and filled with one whole pickled herring fillet,
  silver-skinned with a blue-green sheen and firm ivory flesh, sticking
  out past both ends of the roll. Thin translucent raw onion rings over
  the fish, a frill of green lettuce and two pickle slices underneath.
  On white paper at a harbour kiosk counter; cool, fresh, glistening."
- Category: Everyday snack/lunch. Region: the North specifically (harbour
  kiosk register).
- Regional/serving-format variation (§4.4/§4.6, offer as coexisting
  choices): **Bismarck** (silver-skinned pickled herring, the default),
  **Matjes** (softer, darker, rosier young herring with a silky sheen),
  **Backfisch** (golden battered white fish with a crackly, bubbly-surfaced
  batter), **Krabben** (heaped tiny peeled brown shrimp, pale pink-beige,
  curled), and **Lachs** (smoked salmon in translucent coral folds).
- Serving format: A crusty white roll filled with fish, onion rings, pickle
  slices, lettuce, and/or remoulade.
- Visual/plating characteristics: Pickled herring shows a silver-to-steel
  skin with an iridescent blue-green sheen and firm ivory-white flesh;
  onion rings are crisp and translucent; remoulade is pale yellow, thick,
  and flecked with green pickle.
- Real-world scale (§4.5): Roll ~14–16cm; the fillet overhangs the roll's
  ends by roughly 1–3cm.
- Common confusion: A butter-toasted US-style lobster-roll bun — ruled out
  by the plain crusty-roll format and the pickled-fish (not warm-buttered-
  seafood) filling.
- Confidence: MEDIUM-HIGH.
- **Composition & proportions (§4.7)** — one Bismarck Fischbrötchen.
  - What dominates: the roll and the silver fillet — the fillet is the
    visual hero at the opening, overhanging both ends; onion rings the main
    accent. [EDITORIAL]
  - Components: roll 14–16 cm (per entry), about one and a third cans
    long; one Bismarck herring fillet with about half an onion in thin
    rings [MEDIUM — Küchengötter recipe (via search)]; fillet ~2–3 cm wide,
    overhanging 1–3 cm per end; 2–3 thin pickle slices; one lettuce leaf
    edge; remoulade optional, one thin line.
  - Arrangement: roll split from the side; lettuce under, fillet on top
    skin side up, onion rings over the fillet.
  - Served portion: one roll per person on a paper napkin or small paper
    plate at a kiosk counter.
  - State cues: silver skin with blue-green sheen; wet, glistening fillet;
    crisp translucent onion; cool, not steaming.
  - Absent on purpose: toasted buttered bun, warm seafood, heaped salad,
    lemon wedge, hands.

#### Dish: Leberkäse / Fleischkäse

- Prompt-ready line: "A crusty white bread roll, a little narrower than
  the can is tall, split around a thick warm slice of German meat loaf
  that overhangs the bread on every side: fine, uniform rosy-pink inside
  with a deep-brown baked crust along its edge. A dollop of sweet brown
  mustard on the meat. Steam rising from the cut. Nothing else in the
  roll."
- Category: Everyday snack/lunch. Regional naming: *Leberkäs* (Bavaria),
  *Fleischkäse* (southwest) — same dish, naming-only variation.
- Visual/plating characteristics: A thick slice of baked meat loaf, deep-
  brown baked crust with a slightly crisp edge (sometimes a crosshatch
  top); uniform, rosy, fine-grained interior (per the emulsified-sausage
  texture entry); steam rises when fresh-cut. **Renders as pink meat
  loaf — despite the name, no liver or cheese is visible or present in the
  everyday product.**
- Serving format: In a split roll (*Semmel*) with sweet or medium mustard
  (snack register, the everyday default), or plated warm with a fried egg
  and potato salad (lunch register) — offer both per schema §4.4's
  serving-format-siblings principle.
- Real-world scale (§4.5): Slice ~1.5–2cm thick, ~10cm across; the slice
  visibly overhangs the roll's crumb.
- Confidence: MEDIUM.
- **Composition & proportions (§4.7)** — a Leberkässemmel, and the plate.
  - What dominates: the meat-loaf slice — it is larger than the roll's cut
    face and overhangs it; mustard a small accent. [EDITORIAL]
  - Components: slice ~90–150 g; cut about little-finger thick (~1 cm) for
    a Semmel, thumb thick (1.5–2 cm) when plated [MEDIUM —
    lifehacks-alltag, kalorien-guide (via search)]; ~10 cm across (per
    entry), a little narrower than the can is tall. Roll ~9–10 cm.
    Mustard: one dollop or smear. Plate version: one thick slice, one
    fried egg on top, potato salad covering a third of a 26–28 cm plate.
    [EDITORIAL]
  - Arrangement: slice folded or laid flat in the split roll, edges
    showing all round.
  - State cues: rising steam from a fresh cut; browned crust on the slice
    edge; faint fat gloss.
  - Absent on purpose: lettuce, cheese, ketchup, visible liver or cheese
    in the meat, burger-style stacking.

#### Dish: Brezel (lye pretzel)

- Prompt-ready line: "One German lye pretzel lying flat on a wooden
  board, about one and a half times the can's height across: deep
  mahogany-brown lacquered crust with a satin sheen and fine crackle, thin crisp arms knotted over
  a fat belly split open to show pale crumb. Coarse, opaque white salt
  crystals scattered on the belly and knots, a few fallen on the board.
  No dip, no sugar."
- Category: Everyday snack, Brotzeit staple, beer-garden side.
- Regional form variation (§4.6, coexisting, offer as a choice, confirmed
  and detailed this pass): **Swabian pretzels have thin, crisp arms and a
  fat, softer belly, deliberately slit before baking**; **Bavarian pretzels
  have more evenly thick arms and a thinner belly, left to split on its own
  during baking rather than pre-slit**. Swabian pretzels also run notably
  higher in fat content (roughly 3–10%) than Bavarian ones (roughly 3%).
  [HIGH] [S27, S28]
  **KB default**: match the named region; do not mix Swabian and Bavarian
  pretzel shapes within one scene.
- Visual/plating characteristics: Per the lye-crust texture entry (deep
  mahogany-to-chestnut, lacquered satin shine, fine crackle pattern, coarse
  opaque white salt crystals). A **Butterbrezel** is split horizontally with
  a thick, cold, pale-yellow butter layer showing visible knife marks, and
  optional chives.
- Real-world scale (§4.5): A bakery pretzel reads roughly 15–20cm wide; a
  beer-garden "giant" pretzel runs 30cm or more, often hung on a hook or
  peg stand — clearly larger than the can. [MEDIUM — a
  reasonable retail estimate]
- Common confusion: A pale, soft, US mall-style pretzel with cinnamon sugar
  or a cheese dip — ruled out by the dark lacquered lye crust and coarse
  salt (never fine table salt or cinnamon sugar).
- Confidence: HIGH for the Swabian/Bavarian shape distinction; MEDIUM for
  exact dimensions.
- Sources: S27, S28
- **Composition & proportions (§4.7)** — one bakery pretzel (and a
  Butterbrezel).
  - What dominates: the lacquered brown crust — ~85% of the visible
    surface; the pale split belly and salt crystals are accents.
    [EDITORIAL]
  - Components: bakery pretzel ~70–95 g, giant beer-garden pretzel up to
    ~250 g [MEDIUM — personenwaage-online, fettrechner (via search)];
    15–20 cm wide (per entry), about one and a half times the can's
    height across; salt crystals 2–4 mm, ~20–40 scattered, mostly on the belly and arm joins;
    Butterbrezel: a 3–5 mm butter layer. [EDITORIAL]
  - Arrangement: one pretzel flat on a board or plate, 1–2 per person;
    giant pretzel on a peg stand.
  - State cues: satin sheen, fine crackle; a few loose salt crystals on the
    board.
  - Absent on purpose: cinnamon sugar, cheese dip, fine table salt, pale
    soft crust, mixed Swabian and Bavarian shapes.

#### Dish: Reibekuchen / Kartoffelpuffer (potato pancakes)

- Prompt-ready line: "Three fried grated-potato pancakes, each about the
  can's height across and a finger thick, overlapping like shingles on a
  small paper plate. Lacy, frizzled edges of individual potato shreds
  browned almost dark at the tips; golden, slightly oily centres with
  visible strands. One dollop of pale beige-gold, slightly grainy apple
  sauce beside them. Faint steam; grease spots on the paper."
- Category: Everyday snack. Christmas-market and fair staple; also home
  cooking.
- Visual/plating characteristics: 2–3 fried grated-potato pancakes with
  apple sauce; **lacy, frizzled edges** of individual potato shreds,
  browned to near-dark at the tips; a golden, slightly oily center with
  visible strands. Apple sauce is pale beige-gold, slightly grainy, and
  dolloped, not smooth and uniform.
- Real-world scale (§4.5): Each pancake ~10–12cm × ~1cm; a market paper
  plate ~18cm.
- Common confusion: A uniform, machine-formed US hash-brown patty — ruled
  out by the lacy, irregular, shred-visible edges.
- Confidence: MEDIUM.
- **Composition & proportions (§4.7)** — one market portion.
  - What dominates: the pancakes — ~75% of the plate; apple sauce a single
    dollop, ~15–20%. [EDITORIAL]
  - Components: 3 pancakes is the usual market portion [LOW-MEDIUM — EAT
    SMARTER (via search)]; each ~10–12 cm × ~1 cm (per entry), about the
    can's height across; apple sauce ~3–4 tablespoons.
  - Arrangement: three pancakes overlapping like shingles on an ~18 cm
    paper plate; apple sauce dolloped on or beside the lower one.
  - State cues: glistening oil on the surface, lacy dark tips, faint steam
    in cold air; grease spots on the paper plate.
  - Absent on purpose: uniform hash-brown patties, sour cream, chives,
    smoked salmon (restaurant variant only), ketchup.

#### Dish: Half roast chicken (*Hendl* / *Hähnchen* / East: "Broiler")

- Prompt-ready line: "One half roast chicken, skin side up, filling most
  of a white plate and nearly twice the can's height long: lacquered,
  burnished mahogany-gold skin, taut and crisp, tinted with paprika and
  glistening with spiced fat, a thin fat pool around it. Leg angled out,
  breast in the middle. One crusty white bread roll beside it. Steam
  rising; no garnish."
- Category: Everyday. Lunch, dinner, and fair/market food.
- Regional naming (§4.2, prevalence/naming-only, not form-changing):
  *Hendl* (Bavaria), *Hähnchen* (general/national), *Broiler* (former East
  Germany) — same rotisserie-roasted dish.
- Visual/plating characteristics: Lacquered, burnished mahogany-gold skin,
  taut and crisp, often paprika-tinted, glistening with spiced fat.
  Rotisserie trailers show rows of rotating birds behind glass under warm
  light.
- Real-world scale (§4.5): Half chicken ~20×12cm on a 26cm plate.
- Confidence: MEDIUM.
- **Composition & proportions (§4.7)** — one half chicken.
  - What dominates: the chicken — it takes ~70–80% of the plate; a roll
    or fries is the only accent. [EDITORIAL]
  - Components: half bird ~400–700 g [MEDIUM — beefbandits.de,
    studenten365 (via search)]; ~20×12 cm (per entry), nearly twice the
    can's height long; leg and breast both visible, skin side up. Side:
    one plain roll, or a small heap of fries on a quarter of the plate.
    [EDITORIAL]
  - Arrangement: skin side up, leg angled out, breast towards the centre.
  - State cues: glistening skin, a thin pool of spiced fat on the plate;
    steam from the joint.
  - Absent on purpose: carving on the plate, herb garnish, lemon, salad
    heaps, barbecue sauce; beer mugs in a fair scene.

### Schnitzel & pan-German classics

#### Dish: Schnitzel Wiener Art (breaded pork cutlet, Viennese style)

- Prompt-ready line: "One thin breaded pork cutlet, about twice the
  can's height long and thinner than a finger, laid flat and hanging to
  the rim of a white dinner plate. Its fine golden-to-amber crumb puffs
  up in loose waves and blisters, lifting away from the pale meat. A
  lemon wedge on one end. A loose heap of golden fries fills the other
  third of the plate. Dry, crisp, no sauce."
- Category: Everyday and special-occasion. Lunch, dinner; inn, canteen,
  family-restaurant register.
- **Naming rule.** Under the food-standards guidelines of Germany
  (*Leitsätze* of the German Food Code) and Austria, "Wiener Schnitzel"
  means the **veal** version, and selling pork under that name counts as
  misleading; a pork cutlet prepared the same way must be
  called **"Schnitzel Wiener Art"** ("Viennese-style schnitzel") or "Wiener
  Schnitzel vom Schwein." Germany's everyday, high-frequency version is
  overwhelmingly the pork one. [CONFIDENCE: HIGH — this corrects and
  strengthens the draft's own `[UV→X]`-tagged version of the same claim
  with a confirmed legal basis] [S29, S30]
  **KB default and required prompt language**: "a breaded pork cutlet,
  Viennese style" or "Schnitzel Wiener Art" — never call a pork schnitzel
  "Wiener Schnitzel" outright in a prompt describing the everyday pork
  version.
- Serving format: A thin, pounded, breaded cutlet with a lemon wedge; fries,
  potato salad, or fried potatoes (*Bratkartoffeln*) alongside.
- Visual/plating characteristics: Per the breadcrumb-crust texture entry
  (fine, even golden-to-amber crumb puffing into loose waves and blisters,
  lifting from the meat, matte overall — never a thick, craggy fried-
  chicken-style batter, and never a uniform flat coating stuck to the
  meat). The cut shows a thin, pale cutlet under the crust. Bratkartoffeln
  (if served) are thick coins, browned and crisp-edged, glossy, with
  translucent golden onion and bacon bits.
- Real-world scale (§4.5): The cutlet reads roughly 20–25cm long, 0.5–0.8cm
  thick — often **overhanging a 28cm plate**, or served on a 32cm oval
  platter. [MEDIUM]
- Common confusion: US chicken-fried steak with white gravy (a thicker,
  darker-battered dish with a completely different sauce); Japanese tonkatsu
  (a thicker cutlet with a coarser panko crust, usually sliced into strips
  before serving) — neither is the same visual presentation.
- Confidence: HIGH for the naming rule; MEDIUM for exact dimensions.
- Sources: S29, S30
- **Composition & proportions (§4.7)** — one plated inn portion.
  - What dominates: the cutlet — ~55–65% of a 28 cm plate, often reaching
    or passing the rim; the side ~30–40%; the lemon wedge a small accent.
    [EDITORIAL]
  - Component table:

    | Component | Real size | Count (one plate) | Look | Where it sits |
    |---|---|---|---|---|
    | Breaded pork cutlet | 20–25 cm long, 0.5–0.8 cm thick (per entry) — about twice the can's height, thinner than a finger; a ~180 g portion is a common gastronomy size [LOW-MEDIUM — studenten365, FVZ product listing (via search)] | 1 (sometimes 2 smaller) | Wavy, blistered golden crumb lifting from the meat | Flat, covering one side and centre of the plate |
    | Fries or Bratkartoffeln | Fries ~7–9 cm; potato coins ~4–5 cm, ~0.5 cm thick | a loose heap ~150–200 g [EDITORIAL] | Golden; coins browned with onion and bacon bits | The remaining third of the plate |
    | Potato salad (alternative) | Slices 3–4 cm | a mound ~10 cm across | Glossy, vinegar-style | In a small side bowl or on the plate |
    | Lemon wedge | ~5–6 cm | 1 | Bright yellow | On top of the cutlet, one end |

  - Arrangement: cutlet laid flat, slightly off-centre; side heaped beside
    it, not under it.
  - Served portion: one cutlet per person; no sharing.
  - State cues: dry, crisp crust with no sauce; a faint oil sheen on the
    plate; very light steam.
  - Absent on purpose: sauce or gravy (that is the sauced family), thick
    craggy batter, panko, parsley piles, lingonberry jam unless an Austrian
    scene, sauerkraut.

#### Dish: Sauced Schnitzel family (Jägerschnitzel, Rahmschnitzel, paprika schnitzel)

- Prompt-ready line: "A breaded pork cutlet about twice the can's height
  long on a white dinner plate, the middle two-thirds covered by a
  ladleful of creamy beige mushroom sauce with thin sliced brown
  mushrooms, pooling onto the plate; one end of the golden crust left
  exposed and crisp. A heap of golden fries fills the other third of the
  plate. Steam rising; glossy sauce."
- Category: Everyday and canteen lunch staple.
- Serving format: A cutlet (breaded or plain) with sauce ladled over part
  of it, leaving some crust exposed; sauce partly soaks the crust while the
  edge crumb stays crisp.
- Regional form variation (§4.6, a genuinely coexisting, non-hierarchical
  East/West split, not a superseded-vs-current pair — **confirmed and
  strengthened this pass, not just carried forward as an unverified
  claim**):
  - **Jägerschnitzel (West)**: a creamy, beige mushroom sauce with sliced
    brown mushrooms over a breaded or plain cutlet. **KB default when no
    East/West context is given.**
  - **Jägerschnitzel (East/GDR-heritage)**: a genuinely different dish
    under the same name — a breaded slice of **Jagdwurst** (a bologna-type
    sausage, used as a lower-cost meat substitute) with a bright tomato
    sauce and macaroni, historically served in GDR-era school and work
    canteens and still a recognized, nostalgia-coded East German dish
    today. **Confirmed this pass as a real, specific historical
    substitution, not a loose regional-variant guess** — use only when an
    East German/GDR-heritage context is explicit, per the draft's own
    instruction, which this pass found no reason to overturn.
    [HIGH] [S3, S31]
  - **Rahmschnitzel**: a pale cream sauce, no mushrooms.
  - **Paprikaschnitzel**: a red-orange sauce with bell-pepper strips.
- **Naming sensitivity — carried from the draft, treated as a standing
  prompt-language rule rather than independently re-verified this pass**:
  the paprika schnitzel was historically sold in Germany under a name now
  widely considered an ethnic slur; **always say "paprika schnitzel," never
  the old name.** This pass did not independently verify the historical
  naming claim with a dedicated new source, but treats the caution itself
  as the safer default regardless — the cost of following it when
  unnecessary is near zero, while the cost of reproducing a slur in a
  generated caption or prompt is not.
- Real-world scale (§4.5): As the base Schnitzel Wiener Art entry above; a
  sauce boat or ladle-pour portion of roughly 250mL.
- Confidence: HIGH for the East/West Jägerschnitzel distinction; not
  independently verified for the paprika-schnitzel naming-sensitivity claim
  specifically (flagged in GAP LOG).
- **Composition & proportions (§4.7)** — one plated Jägerschnitzel (West).
  - What dominates: cutlet and sauce together ~60% of the plate, with the
    sauce covering about half to two-thirds of the cutlet; side ~35%.
    Mushrooms are an accent within the sauce. [EDITORIAL]
  - Components: cutlet as the base entry (20–25 cm); sauce ~250 mL (per
    entry) — about three-quarters of the can's volume; mushroom slices
    ~3–4 cm, ~0.5 cm thick, ~10–15 in the sauce; paprika version: pepper
    strips ~5 cm × 0.5 cm; side of fries, Spätzle or rice on a third of
    the plate. East version: one breaded Jagdwurst slice ~9–10 cm across,
    ~1 cm thick, tomato sauce, a heap of elbow macaroni. [EDITORIAL]
  - Arrangement: sauce ladled over the middle of the cutlet, one end of the
    crust left exposed and crisp; sauce pooling onto the plate.
  - State cues: steam; sauce glossy; soaked crust soft where covered, crisp
    at the free end.
  - Absent on purpose: the old slur name in any caption; the cutlet fully
    drowned; parsley piles; the East version outside an East context.

#### Dish: Rinderrouladen

- Prompt-ready line: "One braised beef roll about the can's height long,
  tied with gravy-darkened string, cut in half to show a spiral of beef
  around a yellow mustard smear, bacon, onion and pale-green pickle,
  lying in glossy dark-brown gravy on a white plate. Beside it one smooth
  pale potato dumpling about the can's width and a smaller heap of
  glossy purple-red cabbage. Steam rising."
- Category: Sunday lunch, festive/special-occasion register, also everyday.
- Serving format: Beef rolls tied with kitchen string or pinned with a
  wooden skewer, braised in gravy, served with red cabbage and a potato
  dumpling.
- Visual/plating characteristics: Dark, glossy gravy (per the Bratensoße
  texture entry). A sliced roll shows a spiral cross-section of beef around
  a mustard-yellow smear, pink-brown bacon, translucent onion, and pale-
  green pickle; the string is darkened by gravy.
- Real-world scale (§4.5): Roll ~10–14cm × ~4–5cm; dumpling ~7–8cm.
- Common confusion: Italian braciole in tomato sauce — ruled out by the
  brown-gravy (not tomato-based) sauce and the mustard/pickle/bacon filling.
- Confidence: MEDIUM.
- **Composition & proportions (§4.7)** — one Sunday plate.
  - What dominates: the beef roll and its gravy — ~40% of the plate; red
    cabbage ~25%; dumpling ~20%; gravy pool ties them together.
    [EDITORIAL]
  - Components: one roll per person, ~150–200 g raw [MEDIUM — Fleisch ist
    Kultur, Ludewig (via search)]; 10–14 cm × 4–5 cm (per entry), about
    the can's height long and a little thinner than it; one potato
    dumpling ~7–8 cm (per entry); red cabbage ~2 heaped tablespoons;
    gravy ~4–6 tablespoons.
  - Arrangement: roll whole, string or skewer still on, or cut in half
    showing the spiral; dumpling and cabbage beside it; gravy over the
    roll and pooling.
  - State cues: glossy dark gravy; steam; cabbage glossy purple-red.
  - Absent on purpose: tomato sauce, herb garnish, more than one roll per
    person, mashed potato in place of the dumpling unless specified.

#### Dish: Sauerbraten

- Prompt-ready line: "Three overlapping slices of fork-tender braised
  beef, each about the can's height long, fanned on a white plate under
  a thick, dark, matte-velvety sweet-sour sauce with plump dark raisins
  suspended in it. One smooth pale potato dumpling, a little wider than
  the can, and a small heap of glossy red cabbage beside. The meat grain
  frays slightly. Steam rising; no garnish."
- Category: Special-occasion/Sunday lunch, also served in everyday inns.
- Regional form variation (§4.6, genuinely coexisting variants — confirmed
  and detailed this pass):
  - **Rhenish (Rhineland)**: marinated in vinegar and red wine; the sauce
    is sweetened with raisins and often beet syrup as well. **KB default.**
  - **Franconian**: prepared **without** raisins; the sauce is thickened
    with soaked, lightly sweetened gingerbread (Lebkuchen) instead — a
    genuinely different sauce construction, not just "less sweet."
  - **Swabian**: less sweet, a little spicier (garlic, a very dry wine),
    traditionally served with Spätzle and red cabbage rather than potato
    dumplings.
  [HIGH for all three variants existing and being genuinely
  distinct in preparation, not just regional flavor preference] [S32; general Sauerbraten regional sourcing corroborating the same three-way split]
- Visual/plating characteristics: Fork-tender slices with a visible grain
  that frays slightly. Gravy is darker, thicker, and more matte-velvety
  than a standard Bratensoße. The Rhenish version shows plump, dark raisins
  suspended in the sauce.
- Real-world scale (§4.5): Slices ~1cm × ~10–12cm on a 28cm plate.
- Confidence: HIGH for the three regional variants; MEDIUM for exact
  dimensions.
- Sources: S32
- **Composition & proportions (§4.7)** — one plate, Rhenish default.
  - What dominates: meat slices under sauce ~45% of the plate; dumplings
    ~25%; red cabbage ~20%; raisins small dark accents in the sauce.
    [EDITORIAL]
  - Components: 2–3 slices ~1 cm × 10–12 cm (per entry), about the can's
    height long; sauce ~5–6 tablespoons; 8–15 raisins visible; 1–2 potato
    dumplings ~7 cm; red cabbage ~2 heaped tablespoons. Swabian: Spätzle
    heap instead of dumplings. [EDITORIAL]
  - Arrangement: slices overlapping in a fan, sauce spooned over them and
    pooling; sides beside, not under.
  - State cues: matte-velvety dark sauce; slight fraying on the meat grain;
    steam.
  - Absent on purpose: raisins in the Franconian version; pink medium-rare
    meat; herb garnish.

#### Dish: Frikadelle / Bulette / Fleischpflanzerl / Fleischküchle

- Prompt-ready line: "Two pan-fried meat patties, each a little wider
  than the can and about a third of its width thick, at one side of a
  white plate: craggy, uneven browning with darker crisp high points and
  irregular edges; one cut open to show a coarse grey-brown interior
  with onion bits. A mound of potato salad fills the rest of the plate;
  a dab of mustard. No bun."
- Category: Everyday. Warm with potato salad, or cold in a roll with
  mustard.
- Regional naming (§4.2, prevalence/naming-only — same dish, different
  names, not form-changing): *Frikadelle* (North/West), *Bulette* (Berlin),
  *Fleischpflanzerl* (Bavaria), *Fleischküchle* (Swabia). **KB default**:
  descriptive English in any prompt ("a pan-fried meat patty") rather than
  any single regional name, to avoid implying a false regional specificity.
- Visual/plating characteristics: Craggy, uneven browning with darker,
  crisp high points and an irregular edge; the cut shows a coarse
  grey-brown interior with visible onion bits and breadcrumb.
- Real-world scale (§4.5): ~8–10cm × ~2.5cm.
- Common confusion: A uniform, flat, machine-formed US burger patty — ruled
  out by the craggy, irregular browning and the visible onion/breadcrumb
  interior.
- Confidence: MEDIUM.
- **Composition & proportions (§4.7)** — warm plate with potato salad, and
  cold in a roll.
  - What dominates: the patty on the plate ~35%, potato salad ~50%; mustard
    a dab. In a roll, the patty fills the roll's cut face. [EDITORIAL]
  - Components: 500 g mince makes about 8 patties [MEDIUM — mamas-rezepte
    (via search)] — so ~80–100 g each with bread and egg; ~8–10 cm ×
    ~2.5 cm (per entry), a little wider than the can; 1–2 per plate;
    mustard one dab ~2 cm.
  - Arrangement: patties side by side at the plate edge, potato salad
    heaped next to them; one patty cut to show the coarse interior.
  - State cues: warm version with a thin fat sheen and faint steam; cold
    version matte, no steam.
  - Absent on purpose: a burger bun, cheese, lettuce, flat uniform
    machine-formed discs, ketchup.

#### Dish: Königsberger Klopse

- Prompt-ready line: "Three pale, soft, matte grey-beige poached
  meatballs, each a little narrower than the can, sitting half-sunk in
  a velvety ivory cream sauce dotted with small olive-green capers, on a
  white plate. Three boiled potatoes beside them and a few glossy
  magenta beetroot slices. The meatballs are not browned at all. Steam
  rising."
- Category: Everyday/home-cooking classic. Origin: East Prussia (Königsberg, now Kaliningrad); it came west with postwar expellee families and is now national, strongest in Berlin and the East. Don't present it as a Berlin dish.
- Visual/plating characteristics: 3–4 poached meatballs in a white caper
  sauce, with boiled potatoes and sometimes beetroot. Pale, soft, matte
  grey-beige meatballs — **not browned**, a genuinely distinctive,
  checkable feature versus most other German meatball preparations; the
  sauce is velvety ivory, dotted with olive-green capers; beetroot (if
  served) is deep magenta and glossy.
- Real-world scale (§4.5): Meatballs ~5–6cm; capers ~0.5cm.
- Common confusion: Browned Swedish meatballs with lingonberry sauce —
  ruled out by the pale, unbrowned surface and the white caper sauce
  (rather than a brown cream gravy).
- Confidence: MEDIUM.
- **Composition & proportions (§4.7)** — one plate.
  - What dominates: pale meatballs and white sauce ~50% of the plate,
    potatoes ~35%, beetroot ~10%; capers are small dark-green dots.
    [EDITORIAL]
  - Components: 2–3 Klopse per person (3–4 for hearty eaters), 30–80 g
    each [MEDIUM — emmikochteinfach, tastybits (via search)]; ~5–6 cm
    (per entry), a little narrower than the can; capers ~0.5 cm, ~10–20 in
    the sauce; 3–4 boiled potatoes ~4–5 cm; beetroot a few slices or a
    small dish.
  - Arrangement: meatballs grouped, half-submerged in sauce that coats
    them and pools; potatoes to one side.
  - State cues: velvety ivory sauce; steam; matte unbrowned meatball
    surfaces.
  - Absent on purpose: any browning, brown gravy, lingonberry, herbs piled
    on top, pasta.

#### Dish: Kassler

- Prompt-ready line: "One thick smoked-cured pork chop, about the can's
  height long, uniform deep rose-pink with a thin smoky-bronze fat rim
  and a glossy cut face, leaning against a smooth mound of mashed potato
  on a white plate, with a heap of pale golden sauerkraut strands beside
  it. Steam rising from the mash and sauerkraut. No garnish."
- Category: Everyday.
- Visual/plating characteristics: A thick, smoked-cured pork chop with
  sauerkraut and mashed potato; uniform deep rose-pink cured meat, a thin
  smoky-bronze fat rim, a glossy cut face.
- Real-world scale (§4.5): ~1.5–2cm × ~12cm.
- Confidence: MEDIUM.
- **Composition & proportions (§4.7)** — one plate.
  - What dominates: the chop ~35%, mashed potato ~30%, sauerkraut ~30%.
    [EDITORIAL]
  - Components: one chop ~1.5–2 cm × ~12 cm (per entry), about the can's
    height long; sauerkraut ~3 heaped tablespoons, strands ~0.3 cm; mash a
    smooth mound ~8–10 cm across. [EDITORIAL]
  - Arrangement: chop leaning on the mash, sauerkraut heaped beside it.
  - State cues: glossy cut face; steam from mash and sauerkraut.
  - Absent on purpose: grill marks, gravy piles, herb garnish.

### Bavaria

#### Dish: Schweinsbraten

- Prompt-ready line: "Two thick slices of roast pork, each about the
  can's height long, overlapping on a white plate, each crowned with a
  rim of crisp, blistered, diamond-scored crackling kept dry above a
  pool of glossy dark gravy. One smooth pale dumpling about the can's
  width sits in the gravy beside them. Steam rising; no garnish."
- Category: Sunday lunch, everyday inn fare.
- Visual/plating characteristics: 2 slices of roast pork with crackling in
  dark gravy, a dumpling, sometimes a warm cabbage salad. Crackling per the
  texture entry above, with a ~0.5–1cm rim cut into diamonds; meat is pale,
  juicy, and slightly fibrous; gravy pools around the dumpling.
- Real-world scale (§4.5): Slices ~1.5cm thick; dumpling ~8cm.
- Confidence: MEDIUM.
- **Composition & proportions (§4.7)** — one plate.
  - What dominates: roast slices ~40%, dumpling ~25%, gravy pool ~25%;
    cabbage salad (if any) an accent. [EDITORIAL]
  - Components: 2 slices ~1.5 cm thick (per entry), ~10–12 cm long, each
    with a crackling rim; 1 dumpling ~7–8 cm, 70–80 g large size [MEDIUM
    — pastapalast (via search)]; gravy ~5–6 tablespoons.
  - Arrangement: slices overlapping, crackling side up and dry; gravy
    poured around, not over the crackling; dumpling in the gravy.
  - State cues: crackling crisp and dry; gravy glossy; steam.
  - Absent on purpose: gravy over the crackling, parsley piles, fries.

#### Dish: Schweinshaxe (roasted pork knuckle) — and its coexisting sibling, Eisbein

- Prompt-ready line: "One whole roasted pork knuckle, nearly twice the
  can's height, standing on a white oval platter with its bone jutting
  up, the whole surface covered in glassy, blistered amber crackling
  bubbled like popcorn. A smooth pale potato dumpling about the can's
  width sits in a pool of glossy dark gravy beside it. A knife stands
  upright in the meat. Steam rising."
- Category: Special-occasion/hearty everyday inn fare.
- **Regional/preparation variant (§4.6) — genuinely coexisting, never
  conflate**: **Haxe** (Bavarian, **roasted**, crackling-crisp) versus
  **Eisbein** (Berlin/North German, **boiled**, soft skin, no crackling at
  all). These are visually opposite treatments of a similar cut and must
  never be substituted for each other — see the dedicated Eisbein entry
  under North Germany below.
- Visual/plating characteristics (Haxe specifically): A whole roasted
  knuckle with the bone protruding, often with a knife stabbed in
  vertically; fully blistered, glassy amber crackling over the whole
  surface, bubbled like popcorn; tender meat underneath pulls from the bone
  in shreds. Dumpling and gravy alongside.
- Real-world scale (§4.5): ~18–22cm long, dominating a 32cm oval platter —
  clearly larger than the 330mL can is tall.
- Confidence: MEDIUM.
- **Composition & proportions (§4.7)** — one knuckle on a platter.
  - What dominates: the knuckle — ~60% of a 32 cm oval platter; dumpling
    and gravy the rest. [EDITORIAL]
  - Components: one knuckle ~700–1000 g, about 600 g raw per portion
    [MEDIUM — bayerische-spezialitaeten.net, Der Pfaröller (via search)];
    18–22 cm long (per entry), nearly twice the can's height; bone
    protruding 3–5 cm; 1–2 dumplings ~7–8 cm; gravy ~6–8 tablespoons;
    optional small cabbage salad in a side bowl. [EDITORIAL]
  - Arrangement: knuckle upright or on its side, bone end up; a knife
    stabbed in vertically (optional); dumpling in the gravy pool.
  - State cues: glassy, bubbled crackling; gravy glossy; steam.
  - Absent on purpose: soft pale boiled skin (that is Eisbein), sauerkraut
    by default, beer steins anywhere in frame.

#### Dish: Knödel (dumplings)

- Prompt-ready line: "One smooth, round, pale ivory potato dumpling about
  the can's width, with a soft satin sheen, sitting in a pool of glossy
  dark gravy at the side of a white plate, its top dry and unsauced.
  Faint steam. It is a side, clearly smaller than the slice of roast
  meat beside it, and there is only one."
- Category: Everyday/Sunday-lunch side, national but especially Bavarian/
  Southern.
- Regional form variation (§4.6, coexisting choices): **Potato dumpling**
  (*Kartoffelknödel*/*Kloß* — the Thüringer regional version shows a
  toasted crouton center when cut) versus **bread dumpling**
  (*Semmelknödel* — knobby, rough surface with visible bread cubes, pale
  golden with green parsley flecks, often sliced and served in a mushroom
  cream sauce). **KB default**: potato dumplings with Rouladen and
  Sauerbraten; either type with roast pork.
- Visual/plating characteristics: Potato dumpling — smooth, pale ivory-to-
  greige surface, soft satin sheen, dense and faintly translucent-looking,
  fine-grained and slightly gummy-glossy at the cut. Bread dumpling —
  knobby surface, visible bread-cube mosaic at the cut.
- Real-world scale (§4.5): ~7–9cm spheres — roughly the diameter of a
  330mL can.
- Confidence: MEDIUM.
- **Composition & proportions (§4.7)** — as a side on a main-course plate.
  - What dominates: on its plate a dumpling is ~20–25% of the surface —
    a side, never the centre of a meat dish; with mushroom sauce
    (Semmelknödel main), 2 dumplings are ~50% with sauce around them.
    [EDITORIAL]
  - Components: large dumplings ~70–80 g; Bavarian dumplings ~5–7 cm
    across [MEDIUM — pastapalast, Wikipedia: Semmelknödel (via search)]
    — about the can's width (see notable corrections: this entry's own
    7–9 cm is larger than the can); 1–2 per plate. [EDITORIAL for count]
  - Arrangement: seated in the gravy pool, top dry; Semmelknödel for a
    main may be sliced into 1.5 cm rounds.
  - State cues: satin sheen, faint steam; gravy glossy around the base.
  - Absent on purpose: fried or browned dumplings, dumplings piled three
    and more beside a roast, sauce poured over the whole top.

#### Dish: Weißwurst

- Prompt-ready line: "Two pale grey-white sausages, each about the can's
  height and a bit over half its width, lying in a steaming bowl of hot
  water with its lid tilted. Beside it a small plate with a dollop of
  sweet brown mustard and one sausage peeled open to show pale, fine
  interior with green parsley flecks, and a dark lacquered pretzel with
  coarse salt. Late-morning light."
- Category: **Morning to late morning, eaten before the noon bell**: the
  classic *Weißwurstfrühstück* (a Bavarian second breakfast or Brotzeit).
  Use it for Brunch, never for lunch or dinner. Bavaria-specific.
- Serving format: Two pale sausages in a lidded bowl of hot water, with
  sweet mustard and a Brezel; traditionally peeled or sucked from the
  casing rather than eaten whole, casing and all.
- Visual/plating characteristics: Smooth, slightly glossy grey-white
  casing with green parsley flecks visible through it; steam rises from
  the water. Once peeled, the interior is pale, fine, and soft (per the
  emulsified-sausage texture entry).
- Real-world scale (§4.5): ~12–14cm × ~3cm; bowl ~18cm.
- Confidence: MEDIUM.
- **Composition & proportions (§4.7)** — one pair with Brezel.
  - What dominates: the lidded bowl with two pale sausages ~50% of the
    set; Brezel ~30%; mustard a small dollop. [EDITORIAL]
  - Components: eaten as a pair; each 11–15 cm long, 3.5–4 cm diameter,
    80–90 g [MEDIUM — Wurstakademie, Wikipedia: Weißwurst (via search)] —
    about the can's height and a bit over half its width; bowl ~18 cm (per
    entry), water to ~3/4; sweet mustard ~2 tablespoons on the plate; one
    Brezel.
  - Arrangement: two sausages in the bowl of hot water, lid tilted; a
    small plate with sweet mustard and one sausage peeled open; Brezel
    beside.
  - State cues: steam from the water; slight gloss on the casing; parsley
    flecks show through.
  - Absent on purpose: grill marks, browning, yellow mustard, sauerkraut,
    any afternoon or evening light cue, beer.

#### Dish: Obatzda & Brotzeit board

- Prompt-ready line: "A long wooden board for sharing: at the centre a
  rough-peaked mound of apricot-orange spiced cheese spread about the
  can's width, topped with raw onion rings and chives. At one end a
  salted white radish spiral a bit taller than the can, opened like an
  accordion. Along one side a dark lacquered pretzel and slices of rye
  bread, along the other fanned cold cuts. Cold, matte, rustic."
- Category: Everyday snack, beer-garden and Brotzeit staple. Bavaria-
  specific.
- Visual/plating characteristics: A mound of spiced cheese spread with raw
  onion rings, a spiral-cut white radish (*Radi*), a Brezel, rye bread,
  cold cuts, and chives. Obatzda itself is coarse, rough-peaked, apricot-
  orange from paprika, flecked with onion and chives, matte-creamy. The
  Radi is a translucent white spiral that opens like an accordion, salted
  until it glistens.
- Real-world scale (§4.5): Board ~40×25cm; Radi spiral ~15cm tall.
- Confidence: MEDIUM.
- **Composition & proportions (§4.7)** — one shared board for 2–3.
  - What dominates: bread and Brezel ~35% of the board; Obatzda mound
    ~15%; cold cuts ~20%; Radi spiral ~15%; onion rings and chives small
    accents. [EDITORIAL]
  - Components: board ~40×25 cm (per entry); Obatzda mound ~8–10 cm
    across, ~4 cm high — about the can's width; 1 Brezel; 3–4 rye slices;
    8–12 cold-cut slices; Radi spiral ~15 cm tall (per entry), a bit
    taller than the can; 6–10 raw onion rings; chives scattered.
    [EDITORIAL]
  - Arrangement: Obatzda at the centre, the Radi standing or lying
    accordion-open at one end, bread and Brezel along one long side,
    meats fanned along the other.
  - State cues: cold; salt on the Radi glistening; Obatzda matte with
    rough peaks.
  - Absent on purpose: beer steins, crackers, grapes, crostini styling,
    cheese cubes on picks.

#### Dish: Wurstsalat

- Prompt-ready line: "A deep white plate heaped with thin pale-pink
  sausage strips, each shorter than half the can's height, glossy and
  wet with a clear vinegar dressing that pools at the bottom. Thin
  translucent raw onion rings and pickle strips on top, a scatter of
  chives. A slice of dark bread beside the plate. Cold, glistening."
- Category: Everyday, Bavaria/Southern-coded.
- Visual/plating characteristics: Julienned sausage (Regensburger or
  Lyoner type) with onion rings and pickle in a vinegar dressing, served
  with bread. A "Swiss" version adds cheese strips. Pale-pink, glossy
  strips wet with dressing; translucent onion; chives.
- Real-world scale (§4.5): Deep plate ~22cm; strips ~5cm × 0.5cm.
- Confidence: MEDIUM.
- **Composition & proportions (§4.7)** — one deep plate.
  - What dominates: sausage strips ~65% of the surface; onion rings ~20%;
    pickle and chives accents; a bread slice or roll on the side.
    [EDITORIAL]
  - Components: strips ~5 cm × 0.5 cm (per entry), under half the can's
    height, ~150–200 g per plate [EDITORIAL]; 8–12 thin onion rings;
    pickle strips ~10; chive scatter; Swiss version cheese strips ~30% of
    the strips.
  - Arrangement: loosely tossed, heaped slightly in the centre of a ~22 cm
    deep plate; onion rings on top.
  - Vessel fill: fills the plate's well, dressing pooling at the bottom.
  - State cues: wet, glossy dressing; cold.
  - Absent on purpose: lettuce base, mayonnaise, tomato, egg.

#### Dish: Steckerlfisch (fish on a stick)

- Prompt-ready line: "One whole grilled mackerel, about two and a half
  cans long, lying on white paper on a wooden beer-garden table: its
  skin blistered, crackled and charred bronze with a speckle of spice
  rub, torn open at the thickest part to show flaky white flesh. A
  wooden stick still runs through it lengthwise. Light smoke haze behind;
  no lemon, no garnish."
- Category: Beer-garden and folk-festival grill food. Bavaria/Franconia-
  specific.
- Cuisine/species note — **corrected and sharpened this pass**: originally
  made with trout and freshwater whitefish; refrigeration and improved
  transport made saltwater fish (mackerel) more widely available, and
  **mackerel is now the most commonly prepared Steckerlfisch fish**, though
  trout and char are also still used. [HIGH] [S33, S34]
  The dish is closely associated with the Munich autumn folk festival
  specifically (a local fish merchant is credited with introducing it there
  in the early 20th century), consistent with this file's Munich-only
  festival-framing caution above, though it is also a general Bavarian/
  Franconian beer-garden food, not confined to that one festival.
- Visual/plating characteristics: A whole gutted fish skewered lengthwise
  on a wooden stick, grilled upright in rows around charcoal, served on
  paper. Blistered, crackled, charred-bronze skin with a spice-rub speckle;
  flaky white flesh opens when torn; visible smoke.
- Real-world scale (§4.5): Fish ~25–30cm; the traditional stick (square-
  profile, to hold position over the embers) runs roughly 50–60cm.
- Confidence: HIGH for the fish-species prevalence claim and the Oktoberfest
  connection; MEDIUM for exact dimensions.
- Sources: S33, S34
- **Composition & proportions (§4.7)** — one fish on paper.
  - What dominates: the whole fish — ~80% of the frame's food; paper and
    stick the rest. [EDITORIAL]
  - Components: fish 25–30 cm (per entry), about two and a half cans
    long, one per person; stick 50–60 cm on the grill, usually removed or
    shortened when served; one crusty roll or pretzel optional.
    [EDITORIAL]
  - Arrangement: fish lying on white paper on a wooden beer-garden table,
    skin torn open at the thickest point to show white flesh.
  - State cues: blistered charred-bronze skin; a light smoke haze in the
    grill scene; flesh flaking.
  - Absent on purpose: lemon slices, herbs, plate and cutlery, beer, hands.

#### Dish: Schäufele (Franconia)

- Prompt-ready line: "A roasted pork shoulder piece a little taller than
  the can, with a flat blade bone sticking up out of it, its top a crisp
  blistered crackling and its meat collapsing around the bone, sitting
  in a pool of glossy dark gravy on a white plate, with one smooth pale
  potato dumpling about the can's width beside it. Steam rising."
- Category: Everyday/special-occasion, Franconia-specific.
- Visual/plating characteristics: Roasted pork shoulder blade with the flat
  bone protruding, in gravy, with dumplings; crackling as in the texture
  entry, meat collapsing around the bone.
- Real-world scale (§4.5): ~15cm on a 28cm plate.
- Confidence: MEDIUM.
- **Composition & proportions (§4.7)** — one plate.
  - What dominates: the shoulder piece ~45%, dumpling(s) ~30%, gravy pool
    ~20%. [EDITORIAL]
  - Components: one piece ~15 cm (per entry), about the can's height and
    a third; flat bone protruding 4–6 cm; 1–2 potato dumplings ~7 cm;
    gravy ~6 tablespoons. [EDITORIAL]
  - Arrangement: meat centre with the flat bone pointing up and out;
    dumpling in the gravy; crackling dry on top.
  - State cues: crisp crackling, meat collapsing at the bone; steam.
  - Absent on purpose: sauerkraut by default, fries, garnish.

#### Dish: Dampfnudel

- Prompt-ready line: "One large steamed yeast bun, about the can's height
  across and half as tall, with a pillowy soft white top and a
  caramelised, crisp golden-brown base, sitting in a pool of pale yellow
  pourable vanilla sauce in a shallow white bowl, the sauce reaching a
  third of the way up its sides. Steam rising from the top; no icing,
  no fruit, nothing else."
- Category: Everyday/dessert or savory-adjacent, Bavaria/Southern.
- Visual/plating characteristics: A large steamed yeast bun in a pan,
  served with vanilla sauce (sweet) or savory accompaniments; a pillowy,
  soft white top and a caramelized, crisp, golden-brown salty crust
  underneath from the pan. Vanilla sauce is pale yellow and pourable.
- Real-world scale (§4.5): ~10–12cm.
- Confidence: MEDIUM.
- **Composition & proportions (§4.7)** — one sweet serving.
  - What dominates: the bun ~60% of the deep plate; vanilla sauce pool
    ~40%. [EDITORIAL]
  - Components: one bun ~10–12 cm (per entry), about the can's height
    across and ~6–7 cm tall; vanilla sauce ~150 mL, about half the can's
    volume. [EDITORIAL]
  - Arrangement: bun crust-side down or turned to show the caramelised
    base, sitting in a pool of sauce.
  - State cues: steam from the pillowy top; sauce pourable.
  - Absent on purpose: icing, fruit piles, cream rosettes.

### Baden-Württemberg

#### Dish: Käsespätzle

- Prompt-ready line: "A black cast-iron pan, about three cans across,
  filled level with irregular soft golden egg-noodle squiggles, each
  shorter than half the can, bound in molten pale mountain cheese that
  browns crisp at the pan edge. A loose crown of deep-brown crisp fried
  onion strands on top. A spoon lifts a portion, trailing cheese
  strings. Steam rising; a small green salad bowl beside."
- Cuisine lineage: see RESEARCH LOG › DISH LINEAGE NOTES.
- Category: Everyday, inn/home lunch and dinner staple.
- Regional form variation (§4.6): **hand-scraped Spätzle** (long, irregular
  — **KB default**) versus **pressed, button-shaped Spätzle** (*Knöpfle*);
  the Allgäu style is noted as cheesier than average.
- Serving format: Egg noodles layered with melted cheese (traditionally
  Bergkäse/mountain cheese — Gruyère, Appenzeller, or Emmentaler, alone or
  blended) and topped with fried onions, served in the cast-iron pan, with
  a green salad. [HIGH for the cheese type] [S36]
- Visual/plating characteristics: Spätzle are irregular, soft, matte
  golden-yellow squiggles; the cheese is molten and stretches in strings
  when lifted, with browned crisp patches where it touches the pan; onions
  are deep-brown, crisp, curled strands on top.
- Real-world scale (§4.5): Pan ~18–20cm; individual Spätzle ~3–5cm long.
- Common confusion: US elbow macaroni and cheese with an orange cheddar
  sauce — ruled out by the irregular hand-scraped noodle shape and the
  mountain-cheese (not processed-cheese-sauce) melt.
- Confidence: HIGH for lineage and cheese type; MEDIUM for exact
  dimensions.
- Sources: S35, S36
- **Composition & proportions (§4.7)** — the cast-iron pan, and one
  portion.
  - What dominates: Spätzle bound in cheese ~80% of the pan surface;
    fried onions ~15–20% as a loose crown in the centre; browned cheese
    patches at the pan edge. [EDITORIAL]
  - Components: ~250–350 g cooked Spätzle and 50–100 g cheese per person
    [MEDIUM — Stuttgarter Zeitung, pastapalast (via search)]; individual
    Spätzle 3–5 cm (per entry), under half the can's height, irregular;
    fried onion strands 3–6 cm, a loose handful; pan 18–20 cm (per entry)
    for 1–2 people; green salad in a separate small bowl.
  - Vessel fill: the pan filled level to ~1 cm below the rim, ~4–5 cm deep.
  - Served portion: eaten from the pan or spooned onto a plate as a
    loose heap, cheese strings trailing. [EDITORIAL]
  - State cues: strings of molten cheese when lifted; steam; onions dark
    and crisp, not wet.
  - Absent on purpose: macaroni shapes, orange cheese sauce, breadcrumb
    crust, bacon (unless specified), herbs piled on top.

#### Dish: Maultaschen

- Prompt-ready line: "Three large rectangular pasta pockets, each a
  little shorter than the can, lying half-submerged in clear golden-amber
  broth in a white soup plate. The thin pale-yellow pasta shows a faint
  green-and-pink filling through it; small golden fat droplets float on
  the broth; a light scatter of chopped chives. Steam rising; potato
  salad in a small bowl beside."
- Category: Everyday, Baden-Württemberg-specific.
- Serving format — genuinely coexisting siblings, offer as a choice (§4.4):
  **in clear broth** (soup register) versus **sliced and pan-fried with
  onion and egg** (a completely different visual presentation), with
  potato salad on the side either way.
- Visual/plating characteristics: In broth — pale yellow, semi-translucent
  pasta showing a faint green-and-pink filling through the wrapper, golden
  fat droplets floating on clear amber broth, chives. Pan-fried — golden,
  crisp-edged slices with scrambled-egg bits and browned onion.
- Real-world scale (§4.5): ~8×10cm, 2–3 per portion; soup plate ~22cm.
- Common confusion: Small, crimped Italian ravioli in tomato sauce — ruled
  out by the much larger rectangular size and the broth-or-pan-fried
  (never tomato-sauced) serving.
- Confidence: MEDIUM.
- **Composition & proportions (§4.7)** — in broth (default) and pan-fried.
  - What dominates: in broth, the 2–3 pasta pockets ~60% of the soup
    plate's surface, clear broth ~40%; pan-fried, the slices ~70% with egg
    and onion ~30%. [EDITORIAL]
  - Components: main-course Maultaschen ~10 cm long, 40–100 g; ~3 per
    person; soup Maultaschen smaller, 20–40 g [MEDIUM — pastapalast, REWE
    Lexikon (via search)]; ~8×10 cm (per entry), a little shorter than the
    can; broth ~250 mL, about three-quarters of the can; chives ~1
    teaspoon scattered.
  - Arrangement: in broth, pockets side by side, half-submerged; pan-fried,
    1.5 cm slices tumbled with scrambled-egg bits and onion.
  - Vessel fill: the 22 cm soup plate filled to about 1 cm below the rim.
  - State cues: fat droplets on the broth; steam; pan-fried slices browned
    and crisp-edged.
  - Absent on purpose: tomato sauce, grated parmesan, small crimped
    ravioli, a creamy sauce.

#### Dish: Linsen mit Spätzle und Saitenwürstle

- Prompt-ready line: "A deep white plate half filled with glossy whole
  brown lentils in a thick vinegary sauce, the other half with soft
  golden egg noodles. Two thin smoked sausages, each a little longer than
  the can and about a third its width, with taut pink-bronze skin, lie
  across the top. Steam rising; nothing else."
- Category: Everyday, Baden-Württemberg-specific.
- Visual/plating characteristics: Brown lentils in a vinegary sauce,
  Spätzle, and two thin sausages, in a deep plate. Lentils are glossy,
  earthy brown, and whole, in a thick matte sauce; sausages have a thin,
  taut skin with a smoky pink-bronze color.
- Real-world scale (§4.5): Sausages ~15×2cm.
- Confidence: MEDIUM.
- **Composition & proportions (§4.7)** — one deep plate.
  - What dominates: lentils ~50% of the surface, Spätzle ~30%, the two
    sausages ~20% laid across the top. [EDITORIAL]
  - Components: lentils ~3–4 mm each, a thick layer; Spätzle heap beside;
    2 sausages ~15×2 cm (per entry), a bit longer than the can and about a
    third of its width. [EDITORIAL]
  - Arrangement: lentils and Spätzle side by side in the plate, the two
    thin sausages crossed or parallel over them.
  - State cues: glossy, thick matte sauce; steam.
  - Absent on purpose: bacon cubes, herbs piled on top, bread bowls.

#### Dish: Schupfnudeln

- Prompt-ready line: "A loose heap of finger-shaped potato noodles, each
  about half the can's height with pointed ends, pale and dense with
  golden pan-crisped patches, tangled with glossy pale sauerkraut
  strands and small browned bacon cubes, in a paper bowl at a winter
  market stall. The noodles dominate; the sauerkraut and bacon are
  accents. Steam rising; nothing else."
- Category: Everyday, also a Christmas-market pan dish.
- Visual/plating characteristics: Finger-shaped potato noodles, pan-fried,
  often with sauerkraut and bacon; pointed ends, golden pan-crisped
  patches on pale dense noodles, tangled with glossy sauerkraut.
- Real-world scale (§4.5): ~6–8cm × 1.5cm; a market pan can run
  80–100cm diameter.
- Confidence: MEDIUM.
- **Composition & proportions (§4.7)** — one portion (market or home).
  - What dominates: noodles ~60%, sauerkraut ~30%, bacon ~10%.
    [EDITORIAL]
  - Components: noodles ~6–8 cm × 1.5 cm (per entry), about half the can's
    height; ~15–20 per portion; bacon cubes ~1 cm, ~10–15. [EDITORIAL]
  - Arrangement: tossed together in a loose heap on a plate or paper bowl.
  - State cues: golden pan-crisped patches; glossy sauerkraut; steam.
  - Absent on purpose: cream sauce, cheese, herbs.

#### Dish: Flammkuchen

- Prompt-ready line: "A cracker-thin rectangular flatbread about four
  cans long on a wooden board, spread edge to edge with matte white
  crème fraîche browned in spots, scattered evenly with small pink-bronze
  bacon strips and translucent to caramelised onion half-rings. The bare
  edge is thin with charred black-brown blistered bubbles. Cut into
  squares; no tomato, no cheese pull."
- Cuisine lineage: see RESEARCH LOG › DISH LINEAGE NOTES.
- Category: Everyday, Baden/Palatinate-specific (also Alsace, France).
- Regional form variation (§4.6): classic (crème fraîche, bacon, onion —
  **KB default**), gratinée with cheese, sweet apple-cinnamon.
- Visual/plating characteristics: A very thin (cracker-thin) crust with
  charred, black-brown blistered bubbles on the edge and base; the cream
  is matte white with golden browning spots; bacon is pink-bronze; onions
  are translucent to caramelized. Served on a wooden board.
- Real-world scale (§4.5): Rectangular ~30×40cm or round ~30cm — larger
  than a standard dinner plate, consistent with `tableware-composition-
  reference.md` §2's cutting-board dimension range for rustic bread/cheese
  service.
- Common confusion: A raised-rim pizza with tomato sauce and mozzarella
  pull — explicitly ruled out: no tomato sauce, no mozzarella stretch, no
  raised crust rim — the crust is uniformly cracker-thin edge to edge.
- Confidence: HIGH for origin and form; MEDIUM for exact dimensions.
- Sources: S37
- **Composition & proportions (§4.7)** — one classic Flammkuchen on a
  board.
  - What dominates: the cream-covered base ~70% of the surface; bacon
    ~15%; onion ~15%; the charred bare edge a thin ring. [EDITORIAL]
  - Components: dough rolled 2–3 mm thin; 28–35 cm round or 40×30 cm
    sheet; ~150 g bacon and 2 onions per Flammkuchen; ~1 cm edge left
    bare [MEDIUM — emmikochteinfach, Swissmilk (via search)]; bacon strips
    ~1–2 cm, ~40–60; onion half-rings ~3–4 cm. One Flammkuchen per person
    or shared by two, cut into 8–12 pieces. [EDITORIAL]
  - Arrangement: bacon and onion evenly scattered to within 1 cm of the
    edge, no pile in the centre.
  - State cues: charred black bubbles on the edge; cream matte with brown
    spots; faint steam.
  - Absent on purpose: tomato sauce, mozzarella strings, raised rim,
    herbs piled on top, pineapple.

#### Dish: Zwiebelkuchen (onion tart)

- Prompt-ready line: "One square slice of German onion tart, a little
  shorter than the can is tall across and about a third its height deep,
  on a small plate: golden, set, slightly jiggly custard packed with soft
  layered onions, speckled with caraway and small browned bacon bits,
  over a thin base. Cut edge facing out; faint steam."
- Category: Autumn seasonal, Baden/Palatinate-specific.
- Visual/plating characteristics: A sheet or round tart of onion custard on
  a yeast or shortcrust base, with bacon, served warm; a golden, set,
  slightly jiggly custard speckled with caramelized onion and caraway and
  browned bacon bits; the cut edge shows soft, layered onion.
- Real-world scale (§4.5): Slice ~10×10cm, ~3–4cm tall.
- **Alcohol note**: traditionally paired with new wine
  (*Federweißer*) in real life — never show it; Coca-Cola replaces it in
  frame per the standing rule.
- Confidence: MEDIUM.
- **Composition & proportions (§4.7)** — one slice.
  - What dominates: onion custard ~75% of the slice face; base ~15% as a
    thin layer; bacon bits accents. [EDITORIAL]
  - Components: slice ~10×10 cm, 3–4 cm tall (per entry), a little
    shorter than the can; bacon bits ~0.5–1 cm, ~10–15 on top; caraway
    seeds a scatter. One slice per person on a small plate. [EDITORIAL]
  - Arrangement: slice on a small plate with the cut edge toward camera.
  - State cues: warm; custard set but slightly jiggly; faint steam.
  - Absent on purpose: new wine (Federweißer) or any glass of it, salad
    garnish, cream.

### North Germany

#### Dish: Labskaus

- Prompt-ready line: "A coarse mound of speckled magenta-pink corned-beef
  and potato mash, a little wider than the can is tall, in the centre of
  a white plate, crowned by one fried egg with a glossy domed yolk and
  crisp, lacy browned edges. Beside it a silver rolled pickled herring
  about the can's height, pinned with a wooden pick, and one gherkin.
  Natural daylight; tight framing."
- Cuisine lineage: see RESEARCH LOG › DISH LINEAGE NOTES.
- Category: Everyday, Hamburg/Bremen-specific.
- Serving format: A mash topped with a fried egg, with a rolled pickled
  herring and a gherkin beside it (or, per the Bremen variant, beetroot and
  rollmops served as distinct sides rather than mixed in).
- Visual/plating characteristics: The mash is coarse and speckled magenta-
  pink (when beetroot is mixed in) — neither smooth nor uniform. The egg
  has a glossy domed yolk and crisp, lacy browned white edges. The rolled
  herring is silver, secured with a wooden pick. **This dish looks
  genuinely unfamiliar to non-German viewers** — favor natural daylight, a
  glossy yolk, and tight framing to keep it appetizing rather than
  off-putting.
- Real-world scale (§4.5): Mound ~12–15cm on a 28cm plate; rolled herring
  ~8–10cm.
- Confidence: MEDIUM-HIGH for origin and the genuine Hamburg/Bremen
  presentation variant; MEDIUM for exact dimensions.
- Sources: S38, S39
- **Composition & proportions (§4.7)** — one plate, beetroot-mixed.
  - What dominates: the mash mound ~50% of the plate; fried egg on top
    ~20%; rollmops and gherkin ~20%; beetroot (Bremen side version) ~10%.
    [EDITORIAL]
  - Components: mound ~12–15 cm (per entry), about one and a quarter cans
    across; one fried egg ~10–12 cm on top; one rolled herring ~8–10 cm
    with a wooden pick; one gherkin ~8–10 cm, whole or fanned. [EDITORIAL]
  - Arrangement: mound centre, egg crowning it, herring and gherkin to one
    side.
  - State cues: glossy domed yolk; crisp lacy egg edges; mash coarse.
  - Absent on purpose: smooth purée, herbs, a second egg, dim light.

#### Dish: Grünkohl mit Pinkel

- Prompt-ready line: "A heap of finely chopped dark olive-green stewed
  kale with a fatty gloss filling half a white plate, one long smoked
  grain sausage a little longer than the can laid over it, cut to show a
  crumbly grey-brown oat-textured face. A slice of rose-pink cured pork
  beside, and a cluster of small golden sugar-glazed potatoes. Steam."
- Category: Winter seasonal (roughly November–February, after first frost),
  North-specific.
- Visual/plating characteristics: Stewed kale with a smoked grain sausage
  (*Pinkel*), Kassler, and small potatoes. Kale is dark olive-green, finely
  chopped, and stewed soft, with a fatty gloss and no crisp leaves. The
  Pinkel's cut face is grainy, crumbly, and oat-textured in a grey-brown
  color. Small potatoes are sugar-glazed with a golden lacquer.
- Real-world scale (§4.5): Pinkel ~15–20cm; potatoes ~3–4cm.
- Confidence: MEDIUM.
- **Composition & proportions (§4.7)** — one plate.
  - What dominates: stewed kale ~50% of the plate; sausages and Kassler
    ~30%; potatoes ~20%. [EDITORIAL]
  - Components: one Pinkel ~15–20 cm (per entry), longer than the can;
    optional one Kassler slice; 4–6 small glazed potatoes ~3–4 cm, about
    half the can's width. [EDITORIAL]
  - Arrangement: kale heaped as the base, sausage and Kassler laid over
    it, potatoes clustered at the side.
  - State cues: fatty gloss on the kale; steam; potatoes lacquered.
  - Absent on purpose: crisp kale leaves, kale salad, cream.

#### Dish: Eisbein (Berlin/North Germany)

- Prompt-ready line: "One boiled pork knuckle, about one and a half cans
  long, on a white oval platter: soft, pale-pink, wobbly skin and fat,
  not crisp at all, the moist meat flaking at one side. A thick mound of
  matte ochre-yellow pea purée holding spoon marks on one side, a heap of
  pale sauerkraut on the other. Steam rising."
- Category: Everyday/hearty inn fare, Berlin/North-specific. **The boiled
  sibling of Bavaria's roasted Haxe — see that entry above; never
  conflate the two.**
- Visual/plating characteristics: A boiled pork knuckle with sauerkraut and
  pea purée. Pale-pink, soft, wobbly fat and skin — **explicitly not
  crisp**, the defining visual difference from Haxe; the meat is moist and
  flaking. Pea purée is matte ochre-yellow and thick, holding spoon marks.
- Real-world scale (§4.5): ~15–20cm on a 32cm platter.
- Confidence: MEDIUM.
- **Composition & proportions (§4.7)** — one knuckle on a platter.
  - What dominates: the knuckle ~50% of the 32 cm platter; sauerkraut
    ~25%; pea purée ~25%. [EDITORIAL]
  - Components: knuckle ~15–20 cm (per entry), about one and a half cans
    long; pea purée a mound ~8–10 cm; sauerkraut ~3 heaped tablespoons;
    mustard a dab. [EDITORIAL]
  - Arrangement: knuckle centre, purée and sauerkraut at either side.
  - State cues: soft pale-pink wobbly skin, moist; steam.
  - Absent on purpose: any crisp crackling, gravy, dumplings.

#### Dish: Rote Grütze

- Prompt-ready line: "A small glass bowl about the can's height across,
  two-thirds filled with glossy jewel-red, jelly-thick berry compote with
  whole cherries and currants, pale vanilla sauce poured in the centre
  and swirling into the red, a pale pool spreading toward the glass
  edge. Faint condensation on the cold glass; a small spoon beside the
  bowl. Cold and glossy; no mint, no cream tower, no garnish."
- Category: Dessert/snack, North-specific.
- Visual/plating characteristics: Red berry compote with vanilla sauce or
  cream in a glass bowl; glossy, jewel-red, jelly-thick compote with whole
  berries; pale vanilla sauce swirls and pools on top.
- Real-world scale (§4.5): Glass bowl ~10–12cm.
- Confidence: MEDIUM.
- **Composition & proportions (§4.7)** — one glass bowl.
  - What dominates: red compote ~75% of the visible bowl; vanilla sauce
    ~25% as a pour on top. [EDITORIAL]
  - Components: glass bowl ~10–12 cm (per entry), about the can's height
    across; compote filling ~2/3 of the bowl; whole berries ~1–2 cm,
    ~15–25 visible; vanilla sauce ~3–4 tablespoons. [EDITORIAL]
  - Arrangement: sauce poured in the centre, spreading and swirling.
  - State cues: cold, glossy; faint condensation on the glass.
  - Absent on purpose: mint leaves, whipped-cream towers, cake.

### Rhineland, Hesse, Palatinate

#### Dish: Himmel un Ääd

- Prompt-ready line: "A mound of creamy potato-and-apple mash with soft
  apple chunks on a white plate, topped with three overlapping fried
  slices of near-black-burgundy blood sausage, each about the can's
  width, crisp and browned, showing white fat specks, and a loose tangle
  of golden fried onions over the slices. The mash is the base; the
  sausage sits on top. Steam; nothing else."
- Category: Everyday, Rhineland-specific.
- Visual/plating characteristics: Potato-and-apple mash with fried blood
  sausage and fried onions. Blood-sausage slices are near-black-burgundy
  with a crisp, browned crust, showing white fat specks in the cut face;
  the mash is creamy with soft apple chunks.
- Real-world scale (§4.5): Slices ~7–8cm × 1.5cm.
- Confidence: MEDIUM.
- **Composition & proportions (§4.7)** — one plate.
  - What dominates: potato-apple mash ~55%; blood-sausage slices ~30%;
    fried onions ~15% on top. [EDITORIAL]
  - Components: 3–4 slices ~7–8 cm × 1.5 cm (per entry), about the can's
    width; onions a loose handful; mash mound ~12 cm. [EDITORIAL]
  - Arrangement: mash as the base, sausage slices overlapping over it,
    onions scattered on the slices.
  - State cues: crisp browned slice crusts; steam.
  - Absent on purpose: gravy, herbs, apple slices as garnish.

#### Dish: Halve Hahn (Cologne)

- Prompt-ready line: "One buttered half of a floury rye roll, a little
  narrower than the can is tall, with a thick slab of pale-yellow aged
  Gouda with a crumbly cut edge on it, topped with raw onion rings, on a
  small plate with a dab of mustard and a small gherkin. Cold, plain,
  simple; no chicken, no meat, no lettuce."
- Category: Everyday, Cologne-specific.
- Visual/plating characteristics: A buttered rye roll with a thick slice of
  aged Gouda, mustard, and raw onion rings. **It contains no chicken,
  despite the name** — a genuine, checkable naming trap this project's own
  anti-patterns list (below) flags directly. A thick, pale-yellow Gouda
  block with a slightly crumbly cut edge; a rye roll with a floury crust.
- Real-world scale (§4.5): Half roll ~10cm; cheese ~1.5cm thick.
- Confidence: MEDIUM.
- **Composition & proportions (§4.7)** — one serving.
  - What dominates: the Gouda slab ~45% of the plate's food; rye roll
    halves ~40%; onion and mustard accents. [EDITORIAL]
  - Components: one half roll ~10 cm (per entry) buttered; cheese ~1.5 cm
    thick (per entry), about a quarter of the can's width; 6–10 raw onion
    rings; mustard a dab; often a small gherkin. [EDITORIAL]
  - Arrangement: buttered roll half with the cheese slab on or beside it,
    onion rings on top, mustard on the plate edge.
  - State cues: cold; crumbly cheese edge.
  - Absent on purpose: any chicken, lettuce, tomato, grilling.

#### Dish: Grüne Soße (Frankfurt)

- Prompt-ready line: "A deep white plate with a thick pool of vivid
  spring-green cold herb sauce, matte and finely speckled, with four
  halved boiled eggs yolk-up in it, each a little smaller than the can's
  width, and four small boiled potatoes, each about two-thirds of the can's
  width, at the side. The green sauce dominates the plate. No herb
  sprigs, no meat, no garnish."
- Category: Everyday, also a specific Maundy Thursday tradition — see
  FESTIVAL & OCCASION CALENDAR for the confirmed Gründonnerstag link and
  the 2016 EU protection of Frankfurt's specific seven-herb mix.
- Visual/plating characteristics: A cold herb sauce with halved boiled eggs
  and boiled potatoes; vivid spring-green, thick, finely speckled with herb
  bits, matte-creamy; the eggs show bright yolks.
- Real-world scale (§4.5): Egg halves ~5cm; deep plate ~22cm.
- Confidence: HIGH for the composition and the Maundy Thursday/EU-
  protection facts (see calendar entry); MEDIUM for exact dimensions.
- **Composition & proportions (§4.7)** — one deep plate.
  - What dominates: green sauce ~50% of the plate; potatoes ~30%; egg
    halves ~20%. [EDITORIAL]
  - Components: 2 eggs = 4 halves ~5 cm (per entry), a bit smaller than
    the can's width; 4–6 boiled potatoes ~4–5 cm; sauce ~150–200 mL.
    [EDITORIAL]
  - Arrangement: sauce pooled in the deep plate, egg halves yolk-up in it,
    potatoes at the side.
  - State cues: cold sauce, thick, matte; warm potatoes may steam faintly.
  - Absent on purpose: herb sprigs on top, meat, bread.

#### Dish: Handkäs mit Musik (Hesse)

- Prompt-ready line: "One small round sour-milk cheese about the can's
  width on a plate, its amber, glassy, jelly-like surface glistening
  under a spoonful of raw onion dice in a clear oil-and-vinegar
  marinade that pools around it. A slice of dark rye bread and a pat of
  butter at the plate's edge. No glass, jug or bottle anywhere."
- Cuisine lineage: see RESEARCH LOG › DISH LINEAGE NOTES.
- Category: Everyday, Frankfurt/Hesse-specific.
- Visual/plating characteristics: Small cheese rounds show a translucent,
  amber-glassy, jelly-like rind and surface, with a chalky white core in
  younger cheese; glistening marinade and onion dice on top.
- Real-world scale (§4.5): ~6–8cm × 2cm.
- Confidence: HIGH for composition and cultural context; MEDIUM for exact
  dimensions.
- Sources: S40, S41
- **Composition & proportions (§4.7)** — one plate.
  - What dominates: the cheese round(s) ~40% of the plate; onion
    marinade ~30%; rye bread and butter ~30%. [EDITORIAL]
  - Components: 1–2 cheeses ~6–8 cm × 2 cm (per entry), about the can's
    width; onion dice ~0.5 cm, a heap over each; one rye slice, a butter
    pat. [EDITORIAL]
  - Arrangement: cheese centre, marinade spooned over it and pooling;
    bread at the edge.
  - State cues: glistening marinade; glassy rind.
  - Absent on purpose: apple wine, its ribbed glass or stoneware jug, any
    crackers.

#### Dish: Saumagen (Palatinate)

- Prompt-ready line: "Two thick pan-browned slices of a stuffed pork
  loaf, each about the can's height across, overlapping on a white plate,
  their cut faces a mosaic of pink pork, pale potato cubes and orange
  carrot dice, with a browned crust. A mound of mashed potato and a heap
  of pale sauerkraut beside them. Steam rising; no gravy."
- Category: Everyday/special-occasion, Palatinate-specific.
- Visual/plating characteristics: Thick, pan-browned slices of a stuffed
  pork-stomach loaf, with sauerkraut and mash; a mosaic cut face of pink
  pork, pale potato cubes, and orange carrot dice, with a browned crust.
- Real-world scale (§4.5): ~2cm × ~12cm.
- Confidence: MEDIUM.
- **Composition & proportions (§4.7)** — one plate.
  - What dominates: two slices ~40%; mash ~30%; sauerkraut ~30%.
    [EDITORIAL]
  - Components: 2 slices ~2 cm × ~12 cm (per entry), about the can's
    height across; mash and sauerkraut each ~3 heaped tablespoons.
    [EDITORIAL]
  - Arrangement: slices overlapping, cut face up, sides beside.
  - State cues: browned crust; steam.
  - Absent on purpose: visible stomach casing close-ups, gravy piles, wine.

### East Germany

#### Dish: Soljanka

- Prompt-ready line: "A bowl about two and a half cans across filled
  near the rim with brick-red-to-orange sour soup, red-tinged fat
  droplets on the surface, chunky diced sausage, meat and pickle pieces
  breaking the surface, one thin lemon slice and a white sour-cream
  dollop beginning to melt and streak. Steam rising; no herb pile."
- Category: Everyday, East-German-coded.
- Visual/plating characteristics: A sour-spicy soup with sausage and meat
  pieces, pickles, onion, a lemon slice, and a sour-cream dollop. Brick-red-
  to-orange broth with a slick of red-tinged fat droplets on the surface;
  chunky diced meat; a white sour-cream dollop beginning to melt and
  streak.
- Real-world scale (§4.5): Bowl ~15–16cm.
- Confidence: MEDIUM.
- **Composition & proportions (§4.7)** — one bowl.
  - What dominates: brick-red broth ~55% of the surface; meat and pickle
    pieces ~35%; sour cream and lemon ~10%. [EDITORIAL]
  - Components: bowl ~15–16 cm (per entry); meat and sausage dice ~1–1.5
    cm, ~20–30; pickle dice similar; one lemon slice ~5 cm; sour cream a
    dollop ~3 cm. [EDITORIAL]
  - Vessel fill: to ~1 cm below the rim.
  - State cues: fat droplets; steam; sour cream starting to melt.
  - Absent on purpose: herbs piled, bread bowls, cream swirled in.

#### Dish: Leipziger Allerlei

- Prompt-ready line: "A small heap of spring vegetables in a glossy
  butter sauce, about the can's height across: bright green peas, orange
  carrot coins about a third of the can's width, short pale asparagus
  pieces and a few small cauliflower florets, all glistening and tender,
  in a small white bowl beside a main-course plate. Steam rising; no
  cream swirl, no garnish."
- Category: Everyday, spring/summer, Saxony-specific.
- Visual/plating characteristics: A spring-vegetable medley in butter
  sauce — bright green peas, orange carrot coins, pale asparagus pieces in
  a glossy butter sauce.
- Confidence: MEDIUM.
- **Composition & proportions (§4.7)** — one side portion.
  - What dominates: vegetables ~85%, butter sauce a gloss. Peas ~35%,
    carrot ~30%, asparagus ~25%, other ~10%. [EDITORIAL]
  - Components: peas ~0.8 cm; carrot coins ~2 cm; asparagus pieces ~3–4
    cm. A heap ~10 cm across in a bowl or beside a main. [EDITORIAL]
  - State cues: glossy butter sauce; steam.
  - Absent on purpose: crayfish/morels unless specified, cream swirls,
    herbs piled.

#### Dish: Quarkkeulchen (Saxony)

- Prompt-ready line: "Four small pan-fried quark pancakes, each a little
  wider than the can, overlapping in a row on a small plate: golden-brown lightly
  crisp faces, soft pale insides, dusted with sugar, with a dollop of
  pale beige-gold, slightly grainy apple sauce beside them. Warm, homely,
  faint steam; no syrup, no cream, no berries."
- Category: Everyday/snack.
- Visual/plating characteristics: Small pan-fried quark-potato pancakes
  with sugar or apple sauce; golden-brown, lightly crisp faces with a soft
  pale interior, dusted with sugar.
- Real-world scale (§4.5): ~7–8cm.
- Confidence: MEDIUM.
- **Composition & proportions (§4.7)** — one plate.
  - What dominates: pancakes ~75%; apple sauce or sugar ~25%.
    [EDITORIAL]
  - Components: 3–5 pancakes ~7–8 cm (per entry), a little wider than the
    can, ~1.5 cm thick; apple sauce ~3 tablespoons. [EDITORIAL]
  - Arrangement: overlapping in a row on a small plate.
  - State cues: sugar dusting; faint steam.
  - Absent on purpose: syrup, cream, berries.

#### Dish: Ketwurst (East Berlin nostalgia, niche)

- Prompt-ready line: "One long white bread roll, nearly twice the can's
  height, hollowed out down the middle and standing in a paper napkin,
  the end of a sausage and glossy red ketchup sauce showing at its open
  top, on a small paper plate at an Imbiss counter. Pale, soft crust;
  not split lengthwise like a hot-dog bun. No toppings, no hands."
- Category: Niche/nostalgia register. A long roll with a hollowed-out
  center, filled with a sausage and ketchup sauce.
- **Use only on explicit request** — this is a specifically East-German-
  nostalgia item, not an everyday-relevance dish for most briefs.
- Confidence: LOW-MEDIUM.
- **Composition & proportions (§4.7)** — one Ketwurst.
  - What dominates: the long roll ~75%; the sausage end and ketchup sauce
    at the opening ~25%. [EDITORIAL]
  - Components: one long roll ~20 cm, nearly twice the can's height;
    sausage inside, top end visible; sauce at the mouth. [EDITORIAL, LOW]
  - State cues: warm; sauce glossy.
  - Absent on purpose: a split hot-dog bun, toppings, hands.

### Seasonal specialities

#### Dish: Spargel (white asparagus)

- Prompt-ready line: "Nine thick white asparagus spears, each nearly
  twice the can's height, laid parallel across a large white plate,
  ivory and faintly translucent with closed tips, a ribbon of glossy
  pale-yellow hollandaise across their middles. Small new potatoes on
  one side, translucent ruby folds of cured ham on the other. Faint
  steam."
- Category: Seasonal (see FESTIVAL & OCCASION CALENDAR for the confirmed
  24 June/Johannistag end date), everyday during season.
- Visual/plating characteristics: Thick white spears laid parallel with
  boiled new potatoes, Hollandaise or melted butter, and cooked or cured
  ham (sometimes a small schnitzel). Ivory, smooth, slightly translucent
  spears with a faint moist sheen; tightly closed tips with a faint violet
  or yellow blush; Hollandaise is glossy, pale butter-yellow, and flowing
  in a ribbon; cured ham falls in translucent ruby folds.
- Real-world scale (§4.5): Spears ~18–22cm × ~1.5–2cm; 8–10 spears on a
  28–30cm plate.
- Common confusion: Default green asparagus — white is the German default
  during Spargelzeit; green should not be substituted as the everyday norm.
- Confidence: HIGH for the seasonal framing (see calendar entry); MEDIUM
  for exact dimensions.
- **Composition & proportions (§4.7)** — one plate.
  - What dominates: white spears ~50% of the plate; potatoes ~20%; ham
    ~20%; sauce a ribbon over the spears' middles. [EDITORIAL]
  - Component table:

    | Component | Real size | Count (one plate) | Look | Where it sits |
    |---|---|---|---|---|
    | White asparagus | ~500 g raw per person as a main, ~300–350 g after peeling; 8–10 spears as a main [MEDIUM — thomy.de, gaumenfreundin.de (via search)]; 18–22 cm × 1.5–2 cm (per entry) — nearly twice the can's height | 8–10 | Ivory, satin, closed tips | Laid parallel across the plate |
    | New potatoes | ~4–5 cm | 4–6 | Pale yellow, parsley flecks optional | One side |
    | Cured or cooked ham | folded slices ~10 cm | 3–4 | Ruby translucent folds (cured) or pale pink | The other side |
    | Hollandaise or melted butter | ~4 tablespoons | 1 ribbon | Glossy pale butter-yellow | Across the middle of the spears; tips left clear |

  - Arrangement: spears parallel, tips aligned one way; sauce ribbon across
    the middle.
  - State cues: moist sheen, faint steam.
  - Absent on purpose: green asparagus as default, lemon slices, herb
    piles, sauce drowning the tips.

#### Dish: Kartoffelsalat (potato salad) — major regional variant

- Prompt-ready line (South): "A white bowl about two cans across filled
  to the rim with thin sliced waxy potatoes, each about half the can's
  width, glossy and slightly translucent in a clear vinegar-broth
  dressing, edges softened and broken, flecked with chopped chives and
  fine onion, a serving spoon resting in it. Wet and glistening; no
  mayonnaise, no cubes, no mustard-yellow colour."
- Category: Everyday and Christmas Eve tradition (widespread, paired with
  sausages).
- Regional form variation (§4.6, genuinely coexisting, offer as a choice,
  not a silent default): **South Germany**: a vinegar-broth-oil-onion
  dressing, no mayonnaise — glossy, slightly translucent potato slices with
  softened, broken edges, glistening wet, flecked with chives. **North/
  West Germany**: a creamy, opaque ivory mayonnaise coating, with pickle
  dice and sometimes egg or apple. **KB default**: match the region; in a
  neutral scene, pair the vinegar style beside Schnitzel or Maultaschen and
  the mayonnaise style beside Frikadellen or sausages, per the draft's own
  reasonable pairing logic.
- Real-world scale (§4.5): Slices ~3–4cm × 0.3–0.5cm; bowl ~14–16cm.
- Common confusion: US-style potato salad (cubed, mustard-yellow, celery,
  paprika dusting) — explicitly ruled out; neither German variant uses
  mustard-yellow coloring or a celery/paprika finish.
- Confidence: MEDIUM-HIGH.
- **Composition & proportions (§4.7)** — one bowl, either variant.
  - What dominates: potato slices ~85–90%; onion, chives, pickle accents
    ~10–15%. [EDITORIAL]
  - Components: slices 3–4 cm × 0.3–0.5 cm (per entry), about half the
    can's width; bowl 14–16 cm, filled to the rim with a low mound;
    side portion on a plate ~150–200 g. [EDITORIAL]
  - Arrangement: loose mound; a serving spoon in the bowl.
  - State cues: South — wet, glistening, broken edges; North — opaque
    creamy coating. Cold or room temperature.
  - Absent on purpose: potato cubes, mustard-yellow colour, celery,
    paprika dust, hard-boiled egg halves on top (South).

#### Soups & Eintopf (compact catalog)

| Dish | Look & texture | Scale | Confidence |
|---|---|---|---|
| Erbsensuppe (pea soup) | Thick, matte olive-ochre soup with sausage coins and bacon cubes; served from a field-kitchen kettle at events | Deep plate 22cm; sausage slices ~2cm | MEDIUM |
| Kartoffelsuppe | Creamy beige with soft potato and carrot cubes, sausage slices, marjoram flecks | Deep plate 22cm | MEDIUM |
| Gulaschsuppe | Brick-red, paprika-oily surface, beef and pepper chunks; a stadium and market staple | Bowl ~15cm | MEDIUM |

**Composition & proportions (§4.7), compact rows:**

- Erbsensuppe
  - *Composition & proportions (§4.7)*: thick soup ~75% of a 22 cm deep plate's surface; 4–6 sausage coins (~2 cm, under a third of the can's width) and 6–10 bacon cubes (~1 cm) as accents on top; filled to ~1 cm below the rim. Absent: cream swirl, croutons, herbs. [EDITORIAL]
- Kartoffelsuppe
  - *Composition & proportions (§4.7)*: creamy base ~70%; potato and carrot cubes (~1.5 cm) breaking the surface ~20%; 3–5 sausage slices ~10%; marjoram flecks. Absent: bacon bits, chive piles, bread bowl. [EDITORIAL]
- Gulaschsuppe
  - *Composition & proportions (§4.7)*: brick-red broth ~55% of a ~15 cm bowl; beef chunks (~2 cm, about a third of the can's width) 8–12 pieces and pepper pieces ~35%; paprika-oil sheen; one roll beside. Absent: sour cream dollop, noodles, herbs. [EDITORIAL]

#### Dish: Roast goose (Christmas / St. Martin)

- Prompt-ready line: "One roasted goose leg, nearly twice the can's
  height, skin up on a white plate: deep bronze, crisp, lacquered skin
  glossy with rendered fat. A smooth pale potato dumpling in dark gravy
  and a heap of glossy purple-red cabbage beside it. The leg is the
  largest thing on the plate. Steam rising; no orange slices, no
  herbs."
- Category: Special-occasion, seasonal (Christmas and 11 November St.
  Martin).
- Visual/plating characteristics: A whole roasted goose or a leg, with red
  cabbage and potato dumplings; deep bronze, crisp, lacquered skin with
  rendered-fat gloss; dark meat.
- Real-world scale (§4.5): Leg ~20cm on a 28cm plate.
- Confidence: MEDIUM.
- **Composition & proportions (§4.7)** — one plated leg.
  - What dominates: goose leg ~45%; dumplings ~25%; red cabbage ~25%.
    [EDITORIAL]
  - Components: one leg ~20 cm (per entry), almost twice the can's
    height, on a 28 cm plate; 1–2 potato dumplings ~7 cm; red cabbage ~3
    heaped tablespoons; gravy pool. Whole bird on a platter only for a
    table-centre scene. [EDITORIAL]
  - Arrangement: leg skin up, dumplings in gravy, cabbage beside.
  - State cues: lacquered skin with fat gloss; steam.
  - Absent on purpose: wine, orange slices, herb piles.

#### Dish: New Year's Eve raclette (*Silvester*)

- Prompt-ready line: "An electric tabletop raclette grill at the centre
  of a home dinner table, about four cans long, with small nonstick pans
  of bubbling, browned-blistered cheese slid in beneath it and meat and
  vegetables on its top plate. Around it small bowls of boiled potatoes,
  pickles and sliced meats; on a plate in front, two potatoes under
  molten scraped cheese."
- Category: Special-occasion, a specific and well-documented home-dinner
  tradition for 31 December, not just a plausible
  guess.
- Visual/plating characteristics: A tabletop electric raclette grill with
  small pans of bubbling cheese, a hot-stone top with meats and
  vegetables, boiled potatoes, and pickles — a genuinely common German NYE
  home dinner. [MEDIUM-HIGH]
  [general German New Year's Eve tradition sourcing aggregated across multiple independent culture/lifestyle sources] Cheese is
  bubbling, browned-blistered, scraped molten over potatoes; small
  nonstick pans are slightly scorched.
- Real-world scale (§4.5): Raclette grill ~40×25cm, with roughly 8 small
  pans, each ~12×7cm.
- Confidence: MEDIUM-HIGH for prevalence; MEDIUM for exact equipment
  dimensions.
- **Composition & proportions (§4.7)** — the table.
  - What dominates: the grill at the table centre and the shared bowls of
    ingredients around it; each person's plate is small and mostly
    potatoes with cheese. [EDITORIAL]
  - Components: grill ~40×25 cm; ~8 pans ~12×7 cm (per entry); boiled
    potatoes ~4–5 cm in a covered bowl; small bowls of pickles, sliced
    meats, peppers, mushrooms; per plate: 2–3 potatoes, one pan-load of
    cheese scraped over them. [EDITORIAL]
  - Arrangement: grill centre, pans pushed in under it at angles; bowls
    around; plates at each seat.
  - State cues: bubbling, blistered cheese; steam from the potatoes.
  - Absent on purpose: sparkling wine, fireworks indoors, readable text on
    packaging.

### Fair, festival & market snacks (compact catalog)

| Item | Look & texture | Scale anchor | Confidence |
|---|---|---|---|
| Garlic mushrooms (*Champignonpfanne*) | Glossy browned button mushrooms in garlic butter, topped with a thick white herb-garlic sauce, in a paper bowl | Mushrooms ~3–4cm; bowl ~12cm | MEDIUM |
| Spiral potato (*Kartoffelspirale*) | A whole potato cut into a continuous thin spiral on a wooden skewer, fried golden and crisp, paprika-dusted | ~25–30cm long on skewer | MEDIUM |
| Langos | Hungarian fried flatbread with garlic, sour cream, and grated cheese; puffy, blistered, golden, oily | ~20–25cm | MEDIUM — a genuine, common German-fair import food, not native German |
| Candied almonds (*gebrannte Mandeln*) | Rough, crystalline, glossy caramel coat, amber to brown, clumped; paper cone | Cone ~15cm tall; almonds ~2cm | MEDIUM |
| Magenbrot | Small glazed spiced-cake rhombuses with a shiny dark chocolate-brown sugar glaze | ~4cm pieces | MEDIUM |
| Gingerbread hearts (*Lebkuchenherz*) | A matte-brown heart with piped white/pastel icing lettering and frills, hung on a ribbon | 15–30cm | MEDIUM |
| Candy apple (*Paradiesapfel*) | A glassy, deep-red hard-candy shell on an apple, on a stick | ~8cm apple | MEDIUM |
| Chocolate-dipped fruit (*Schokofrüchte*) | Strawberries, grapes, or banana on skewers, glossy chocolate dip with a white-chocolate drizzle | Skewer ~25cm | MEDIUM |
| Crêpes | Thin, lacy-browned, folded into a paper cone, with a melting chocolate spread | Cone ~20cm | MEDIUM |
| Berliner doughnut (Carnival, NYE) | Round, no hole, deep golden with a pale unfried ring around the equator, dusted with sugar or glazed; jam oozes from a side hole | ~8–9cm | MEDIUM |

**Composition & proportions (§4.7), compact rows:**

- Garlic mushrooms (*Champignonpfanne*)
  - *Composition & proportions (§4.7)*: ~12–18 mushrooms (~3–4 cm, about half the can's width) filling a ~12 cm paper bowl; herb-garlic sauce a thick white dollop over the top third, not drowning them; one small wooden fork. Absent: parsley piles, bread bowls. [EDITORIAL]
- Spiral potato (*Kartoffelspirale*)
  - *Composition & proportions (§4.7)*: one continuous spiral ~25–30 cm (over twice the can's height) on one skewer, laid on a paper napkin or standing in a holder; paprika dust even; no dip. Absent: hands, cheese sauce. [EDITORIAL]
- Langos
  - *Composition & proportions (§4.7)*: one flatbread ~20–25 cm on a paper plate, bread ~50% of the visible surface; sour cream spread over the centre ~35%; grated cheese heaped over the cream ~15%; garlic brushed, not visible as pieces. Absent: tomato, ham, hands. [EDITORIAL]
- Candied almonds (*gebrannte Mandeln*)
  - *Composition & proportions (§4.7)*: one paper cone ~15 cm (a bit taller than the can) filled to the top with ~25–40 clumped almonds (~2 cm); a few on the table. Absent: legible stall signs, hands. [EDITORIAL]
- Magenbrot
  - *Composition & proportions (§4.7)*: ~15–25 glazed rhombuses (~4 cm, just over half the can's width) in a paper bag or cone, heaped; glaze glossy dark. Absent: icing drizzle, nuts on top. [EDITORIAL]
- Gingerbread hearts (*Lebkuchenherz*)
  - *Composition & proportions (§4.7)*: one heart 15–30 cm, hanging on its ribbon or laid flat; brown base ~70%, piped icing frills and lettering ~30% — lettering stays illegible. Absent: readable words, hands. [EDITORIAL]
- Candy apple (*Paradiesapfel*)
  - *Composition & proportions (§4.7)*: one apple ~8 cm (a bit wider than the can) fully sealed in glassy red candy, on a stick standing upright or laid on paper; nothing else. Absent: hands, sprinkles. [EDITORIAL]
- Chocolate-dipped fruit (*Schokofrüchte*)
  - *Composition & proportions (§4.7)*: one skewer ~25 cm (over twice the can's height) with 4–6 fruit pieces, chocolate covering ~70% of each with a white drizzle; laid on paper. Absent: hands, cream. [EDITORIAL]
- Crêpes
  - *Composition & proportions (§4.7)*: one crêpe folded into a paper cone ~20 cm; the crêpe edge ~70% of the visible surface, chocolate spread showing at the open top and oozing slightly ~30%. Absent: whipped cream towers, fruit piles, hands. [EDITORIAL]
- Berliner doughnut
  - *Composition & proportions (§4.7)*: 1–3 doughnuts ~8–9 cm (a bit wider than the can) on a plate or paper; one with a small jam ooze at the side hole; pale equator ring visible; sugar dusting or glaze. Absent: a hole in the middle, sprinkles. [EDITORIAL]

**Note per schema §4.1's honesty norm**: Langos is a Hungarian import, not
a native German dish — its inclusion here is honestly disclosed rather than
folded into "German fair food" without context.

### Contemporary everyday food (do not omit)

**This section is genuinely load-bearing, not a lower-priority afterthought
— the draft's own caution (§1.1/§4.11 of the scratch file) is correct and
this pass found nothing to contradict it.** Omitting Döner, pizza, Gyros,
and pan-Asian Imbiss food from a "German food" knowledge base would produce
a folkloric Germany no actual resident would recognize as their own everyday
diet.

| Dish | Context | Look & texture | Scale | Confidence |
|---|---|---|---|---|
| Pizza (Italian-German pizzeria) | Dinner, delivery | Thin crust, lightly leopard-spotted rim, ample cheese; German-market staples include ham-and-pineapple and tuna-onion toppings; on a large white plate or in a delivery box | ~30cm | MEDIUM |
| Spaghetti Bolognese | Canteen, home, kids | Rich red-brown meat sauce over spaghetti, grated cheese snowing on top — a thoroughly naturalized everyday dish, not a "foreign" one in practice | Deep plate 22–26cm | MEDIUM |
| Gyros plate (Greek-German restaurant) | Dinner | Heaped, crisp-edged pork gyros, thick white tzatziki with cucumber flecks, fries or rice, raw onion, lettuce garnish; a neutral restaurant interior (no white-and-blue Greek-island décor unless the brief asks) | 28–30cm plate | MEDIUM |
| Falafel wrap/plate | Lunch, late night | Craggy, deep brown-green-flecked falafel balls, broken to show a green interior; tahini drizzle | Balls ~4cm | MEDIUM |
| Asia box (Asia-Imbiss) | Lunch, takeaway | Glossy wok-fried noodles or rice in a folded paper/plastic box, chopsticks stuck in, sesame seeds, steam. Name the kitchen per dish: Vietnamese (common in Berlin and the East), Chinese or Thai; don't blend them | Box ~10×10×10cm | MEDIUM |
| Lahmacun | Snack | A paper-thin round flatbread with a red spiced-meat smear, rolled with lettuce, parsley, lemon | ~30cm round | MEDIUM |
| Plant-based currywurst/burgers | Canteens, urban | Visually resembles the meat version (see the Currywurst entry); canteen signage in German | As Currywurst entry above | MEDIUM |
| Spaghettieis (Eiscafé snack) | Summer snack | **Invented in 1969 by Dario Fontanella, a then-17-year-old, at his family's ice cream shop in Mannheim** with a specific, sourced inventor and city, correcting the draft's own unsourced entry. [HIGH] [S42] Vanilla ice cream extruded into spaghetti-like strands (originally pushed through a Spätzle press) over whipped cream, topped with red strawberry sauce and white-chocolate shavings mimicking parmesan, in a glass coupe | Coupe ~15cm | HIGH for origin; MEDIUM for exact dimensions |

**Composition & proportions (§4.7), compact rows:**

- Pizza (Italian-German pizzeria)
  - *Composition & proportions (§4.7)*: one ~30 cm pizza per person (about four and a half cans across), topping cover ~85% of the surface to a ~1.5 cm rim; ham pieces and pineapple chunks (~2 cm) scattered evenly, ~20–30 each. Absent: pizza cut into many slices on a board, rocket piles. [EDITORIAL]
- Spaghetti Bolognese
  - *Composition & proportions (§4.7)*: spaghetti nest ~60% of a deep plate, sauce ladled over the centre ~35%, grated cheese a light snow ~5%; no meatballs. Absent: basil sprig pile, meatballs, garlic bread. [EDITORIAL]
- Gyros plate
  - *Composition & proportions (§4.7)*: gyros heap ~40% of the 28–30 cm plate; fries or rice ~30%; tzatziki a large dollop ~10%; raw onion rings, lettuce and tomato garnish ~20%. Absent: pita wrap on the plate, feta blocks. [EDITORIAL]
- Falafel wrap/plate
  - *Composition & proportions (§4.7)*: plate: 4–6 balls (~4 cm, just over half the can's width), one broken open, ~40%; salad and tahini drizzle the rest. Wrap: one rolled wrap in paper, filling at the top. Absent: hands, hummus-bowl styling. [EDITORIAL]
- Asia box
  - *Composition & proportions (§4.7)*: box ~10×10×10 cm (about the can's width, a little shorter than its height), noodles or rice ~70% of the visible top, 5–8 vegetable/meat pieces ~25%, sesame seeds; chopsticks standing in. Absent: legible box print, fortune cookies. [EDITORIAL]
- Lahmacun
  - *Composition & proportions (§4.7)*: one ~30 cm thin round, the red meat smear covering ~90% to the edge; served rolled with a handful of lettuce, parsley and one lemon wedge, or flat with the salad on top. Absent: cheese, thick crust, hands. [EDITORIAL]
- Plant-based currywurst/burgers
  - *Composition & proportions (§4.7)*: as the Currywurst entry's block; canteen tray plate instead of a paper tray where the setting is a canteen; signage illegible. [EDITORIAL]
- Spaghettieis
  - *Composition & proportions (§4.7)*: vanilla "spaghetti" strands ~60% of the ~15 cm coupe's top; red strawberry sauce ~30% over the centre; white-chocolate shavings a light scatter; the cream underneath visible only at the edge. Absent: wafers, extra fruit, sprinkles. [EDITORIAL]

### Kaffee und Kuchen & sweets (compact catalog)

**Origin note**: Apfelstrudel, Kaiserschmarrn and Germknödel are Austrian
in origin and common in southern Germany, especially Bavaria; say so when a
brief asks for "German" sweets.

**Serving norm**: cake plates 19–20cm, cake forks, a whipped-cream bowl,
often a lace or patterned tablecloth. **No coffee cups or pots in frame**
(beverage scope, per the standing rule).

| Item | Look & texture | Scale anchor | Confidence |
|---|---|---|---|
| Black Forest cake (*Schwarzwälder Kirschtorte*) | Dark chocolate sponge layers, white whipped-cream stripes, dark cherries, a chocolate-curl coating, a cream rosette with a cherry on top | Slice ~10cm tall from a 26cm torte | MEDIUM-HIGH |
| Bienenstich | A glossy caramelized flaked-almond top with a crackly sheen, a thick pale vanilla-cream middle, a yeast-cake base | ~8×8cm | MEDIUM |
| Streuselkuchen | A sheet cake with large, craggy, buttery golden crumb nuggets | ~8×10cm | MEDIUM |
| Plum cake (*Zwetschgendatschi*) | Rows of overlapping purple-violet plum halves, glistening jammy juices, a thin base | ~8×10cm | MEDIUM |
| Käsekuchen | A tall, pale-cream quark filling, a lightly cracked golden-brown top, a fine-grained cut face | Slice ~5–6cm tall | MEDIUM |
| Apfelstrudel | Paper-thin, flaky, golden, blistered pastry, powdered sugar; the cut face shows soft apple, raisins, and a cinnamon swirl; with vanilla sauce or ice cream | Slice ~8cm | MEDIUM |
| Franzbrötchen (Hamburg) | A flattened, pressed cinnamon pastry with a shiny caramelized-sugar finish and visible laminated spiral layers | ~10–12cm | MEDIUM |
| Kaiserschmarrn (Alpine hut) | Torn, fluffy, caramelized pancake pieces with golden edges, heavily powdered sugar, raisins, plum compote on the side, served in the pan | Pan ~24cm | MEDIUM |
| Germknödel | A large, smooth, pale steamed yeast dumpling with a hidden plum-jam center, melted butter, and a grey-black poppy-seed-and-sugar snow | ~12cm | MEDIUM |
| St. Martin bread figure (*Weckmann*/*Stutenkerl*) | A sweet yeast-dough figure, glossy egg-washed golden, with raisin eyes and buttons; a West-German lantern-season item | ~20–25cm | MEDIUM |

**Composition & proportions (§4.7), compact rows:**

- Black Forest cake
  - *Composition & proportions (§4.7)*: one wedge per plate; a 26 cm torte is cut into ~16 pieces with a cream rosette and cherry per piece [MEDIUM — Dr. Oetker, lecker.de (via search)]; the cut face shows ~3 dark sponge layers and ~3 cream layers; chocolate curls cover the outside. A 19–20 cm cake plate, fork beside. Absent: coffee cups, extra cherries piled, sauces. [EDITORIAL for layer count]
- Bienenstich
  - *Composition & proportions (§4.7)*: one ~8×8 cm square; cut face ~50% vanilla cream, ~30% cake base, ~20% almond top. Absent: fruit, drizzle. [EDITORIAL]
- Streuselkuchen
  - *Composition & proportions (§4.7)*: one ~8×10 cm piece; crumb nuggets (~1–2 cm) cover ~95% of the top; base a thin layer. Absent: icing, fruit (unless a fruit variant). [EDITORIAL]
- Plum cake (*Zwetschgendatschi*)
  - *Composition & proportions (§4.7)*: one ~8×10 cm piece; 6–9 overlapping plum halves (~3–4 cm) cover the top in rows; thin base; optional whipped-cream dollop beside. Absent: streusel on the Bavarian classic unless specified. [EDITORIAL]
- Käsekuchen
  - *Composition & proportions (§4.7)*: one wedge 5–6 cm tall (half the can's height); filling ~85% of the cut face, thin base ~15%; no topping. Absent: fruit sauce, whipped cream, crumbly graham base. [EDITORIAL]
- Apfelstrudel
  - *Composition & proportions (§4.7)*: one ~8 cm slice laid on its side; apple filling ~70% of the cut face, pastry ~30%; vanilla sauce pool or one ice-cream scoop beside; powdered-sugar dusting. Absent: caramel sauce, mint. [EDITORIAL]
- Franzbrötchen
  - *Composition & proportions (§4.7)*: 1–2 pastries ~10–12 cm (about the can's height) on a plate or paper; visible laminated spiral, caramelised sugar sheen. Absent: icing, filling. [EDITORIAL]
- Kaiserschmarrn
  - *Composition & proportions (§4.7)*: torn pancake pieces (~3–5 cm) fill a ~24 cm pan to a loose heap; powdered sugar covers ~60% of the top; 10–20 raisins; plum compote in a small side bowl. Absent: whipped-cream towers, fresh berries. [EDITORIAL]
- Germknödel
  - *Composition & proportions (§4.7)*: one dumpling ~12 cm (about the can's height) in a deep plate; melted butter pool around it; poppy-seed sugar covers the top ~60%; one side broken to show dark jam. Absent: vanilla sauce by default, fruit. [EDITORIAL]
- Bread figure (*Weckmann*/*Stutenkerl*/*Grittibänz*): for St. Martin (11 Nov) in the Rhineland and Westphalia, for St. Nicholas (6 Dec) in other regions; match the date to the region.
  - *Composition & proportions (§4.7)*: one figure ~20–25 cm (about twice the can's height) lying flat on a plate or paper; 2 raisin eyes, 2–4 raisin buttons. Absent: icing, faces piped in sugar. The small white clay pipe is a traditional part of many versions; it is left out as a brand choice (no smoking cues near the product), not because it is inauthentic. [EDITORIAL]

### Variant summary (schema §4.6 quick reference)

| Dish | Variants | KB default | Confidence |
|---|---|---|---|
| Kartoffelsalat | Vinegar-broth (South) / mayonnaise (North/West) | Match region | MEDIUM-HIGH |
| Schnitzel naming | Wiener (veal, legally protected) / Wiener Art (pork) | "Breaded pork cutlet, Viennese style" | HIGH |
| Jägerschnitzel | Mushroom sauce (West) / breaded Jagdwurst + tomato pasta (East/GDR-heritage) | West, unless East context explicit | HIGH |
| Pork knuckle | Haxe (Bavaria, roasted, crisp) / Eisbein (Berlin/North, boiled, soft) | Match region — never conflate | MEDIUM |
| Brezel shape | Swabian (thin arms, pre-slit fat belly) / Bavarian (even arms, naturally split belly) | Match region | HIGH |
| Currywurst | With casing (West/Ruhr) / skinless (East Berlin origin) | With casing | HIGH |
| Sauerbraten | Rhenish (raisins) / Franconian (gingerbread, no raisins) / Swabian (garlic, dry wine, with Spätzle) | Rhenish | HIGH |
| Dumplings | Potato / bread / Thüringer (crouton center) | Match main dish | MEDIUM |
| Spätzle | Hand-scraped / pressed (Knöpfle) | Hand-scraped | MEDIUM |
| Maultaschen | In broth / pan-fried | In broth (lunch) | MEDIUM |
| Meat patty naming | Frikadelle / Bulette / Fleischpflanzerl / Fleischküchle | Descriptive English | MEDIUM |
| Fischbrötchen | Bismarck / Matjes / Backfisch / Krabben / Lachs | Bismarck | MEDIUM-HIGH |
| Bratwurst | Thüringer (PGI, 15–20cm) / Nürnberger (PGI, 7–9cm) / generic | Match region | HIGH |
| Roll naming | Brötchen / Semmel / Schrippe / Weckle / Rundstück | Descriptive English | MEDIUM |
| Roast chicken naming | Hähnchen / Hendl / Broiler (East) | Descriptive English | MEDIUM |
| Labskaus presentation | Beetroot mixed into mash / beetroot served as a separate side (Bremen-style) | Either, disclosed | MEDIUM-HIGH |
| Döner serving format | In flatbread (default) / Dürüm (rolled) / plate | In flatbread | MEDIUM-HIGH |
| Evening meal | Cold Abendbrot (traditional) / warm dinner (rising, especially urban/younger) | Either, disclosed — not a silent default | MEDIUM-HIGH |

---

## COCA-COLA MARKET INTEGRATION

This section holds market-specific Coca-Cola staging detail that goes
beyond `01-brand/coca-cola-guidelines.md`'s generic, cross-market rules —
pack formats actually sold in Germany, the German-market pairing logic, and
authenticity cues (deposit marks, calibrated glassware) specific to this
market. It defers to `coca-cola-guidelines.md` for every generic rule (hero-
zone/depth-hierarchy composition, logo-fidelity findings, the base 330mL
can dimensions) rather than restating them.

### Brand anchor

**The brief names the hero SKU — never this file, never the region.**
(Standing rule, 2026-09-27 — see `DECISIONS.md`; it replaces this file's
earlier "Classic red Coca-Cola Original only" anchor.) Any TCCC brand,
variant or format the brief names is in scope, including Coca-Cola Zero
Sugar, Light, and **Mezzo Mix** (a real Coca-Cola Germany cola-orange
product, previously excluded here as a scope decision). Write the slot
with `africa/south-africa.md`'s HERO PRODUCT SLOT template: name the variant exactly and negate the closest
lookalike. Competitor beverages and non-TCCC cola-orange "Spezi"-type
drinks are never shown.

### German/EU pack formats (scale anchors)

| Format | Setting fit | Approx. dimensions | Confidence |
|---|---|---|---|
| 330mL can | Imbiss, Späti, beach, picnic, stadium, home | **115.2mm tall × 66.1mm diameter** — use `coca-cola-guidelines.md`'s already-verified non-US-market figure, not the draft's own rougher ~11.5cm×~6.6cm estimate | HIGH for the figure itself (verified for the general non-US-market standard); **not independently confirmed as a Germany-specific bottler figure, and this pass could not confirm whether Germany also uses a narrower "slim" 330mL can variant alongside the standard-diameter can** — flagged honestly as a remaining market-specific gap, not resolved by assumption |
| 0.2L glass contour bottle (returnable) | Restaurants, cafés, Kaffee und Kuchen | Not independently confirmed this pass — carried from the draft as an estimate (~16–17cm) pending a dedicated source | LOW |
| 0.33L glass contour bottle (returnable) | Inns, beer gardens, pizzerias | Not independently confirmed this pass — carried from the draft as an estimate (~19–20cm) pending a dedicated source | LOW |
| 0.5L PET | On the go: kiosk, train, festival, Freibad | Per `coca-cola-guidelines.md` §4.3's general table, a 500mL PET bottle runs ~203mm tall, ~65mm diameter — carried over from the generic brand-file figure, not independently re-confirmed as Germany-specific | MEDIUM |
| 1.0L PET/glass (returnable) | Home table, family meals, allotment | Not independently confirmed this pass — carried from the draft as an estimate (~30cm) pending a dedicated source | LOW |

**Rule, unchanged**: never render US 12 fl oz (355mL/123mm) can proportions
or US labelling for a Germany-set scene.

**Condensation and pour texture**: a
chilled can shows fine, even beading with larger droplets running to the
base ring; glass bottles show frosted beading on the contour; poured
Coca-Cola is dark cola-brown, near-opaque, red-amber at the light-struck
edges, with a thin tan foam head that collapses quickly; ice is modest.

### Alcohol exclusion (hard rule — full text)

**TCCC's real, public policies (see FILE ROLE & METHOD above for the
sourced citations) directly support this rule — it is not an invented
caution.** Market facts about beer, wine, Apfelwein, and Glühwein
documented throughout this file are accurate context only. In every image:

1. **No alcoholic beverages** anywhere in frame, foreground or background.
2. **No alcohol-coded vessels, even empty**: litre steins, tall wheat-beer
   glasses, Cologne-style slim beer glasses and their carrying rings, wine
   glasses, Apfelwein stoneware jugs and ribbed glasses, Christmas-market
   mulled-wine mugs, shot glasses.
3. **No alcohol branding or infrastructure**: brewery signage, beer
   umbrellas, tap handles, bar backs, tent interiors.
4. **Coca-Cola must never appear mixed with alcohol.** Germany has real
   cola-beer and cola-spirit mixed-drink traditions; never imply them.
   (Non-alcoholic TCCC-brand mixes are allowed, schema §5.5.)
5. **Scene compensation**: in beer gardens, inns, folk festivals, wine
   festivals, and Christmas markets, frame on food, Coca-Cola, the people
   eating, and non-drinking details (stalls, lights, rides, the chestnut
   canopy). Other guests' tables should be empty of drinks or out of frame,
   never shown with blurred alcohol.

### German authenticity cues

- **Deposit mark (*Pfand*)**: single-use cans and PET bottles carry the DPG
  deposit logo — a real, legally sized (14×16mm), trademarked blue symbol
  (a bottle, can, and curved arrow). Render it generic and illegible, or
  omit it, per the trademark-genericization table above — never render it
  as sharp, legible brand IP. [HIGH for the logo's legal
  specification] [S14]
- **Calibrated glassware**: German gastronomy glasses genuinely carry a
  printed fill line (colloquially "Eichstrich," more precisely a
  "Füllstrich"/fill mark under Germany's Mess- und Eichgesetz implementing
  an EU measurement directive), typically in comma-decimal format, e.g.
  "0,3 l" or "0,4 l" — a real, legally grounded realism cue, not
  decorative. [MEDIUM-HIGH] [S43, S44]
- **Returnable crates**: stacked plastic crates of glass bottles are a
  plausible, widely-recognized German domestic-realism cue tied to the
  deposit system — see ENVIRONMENT & STAGING SCENES. [MEDIUM]
- **Prices and signage**: German-language signage, euro prices in comma-
  decimal format (e.g. "2,50 €") — well-known, general knowledge, not
  independently re-sourced this pass.

### Pairing matrix

Carried from the draft's own market-fit reasoning; none of these ratings
are independently sourced surveys, and all remain editorial judgment calls
about scene fit rather than measured consumer-preference data. **Reference
for whoever writes the brief only** — the brief chooses the SKU; this
table never overrides it or fills it in.

| Context | Fit | Formats that fit the setting |
|---|---|---|
| Currywurst / fries / Döner / Imbiss | Strong | 330mL can or 0.5L PET |
| Pizza / pasta / Gyros / Asia box | Strong | 0.33L glass or can |
| Späti stoop, beach, Freibad, river meadow (alone) | Strong | 330mL can or 0.5L PET |
| Stadium, public viewing, music festival | Strong | Can or 0.5L PET |
| Canteen lunch | Moderate | 0.5L PET |
| Family inn, kids' Schnitzel | Moderate | 0.2–0.33L glass + calibrated glass |
| Beer garden / folk festival (alcohol-exclusion framing applies) | Moderate | 0.33L glass bottle |
| Fair & market sweets | Moderate | Can or 0.33L glass |
| Abendbrot at home, raclette, allotment grill | Moderate | 1.0L bottle + tumblers |
| Christmas market | Weak-to-moderate | 0.33L glass or can |
| Kaffee und Kuchen | Weak | 0.2L glass |
| Spargel / formal Sunday roast | Weak | 0.2L glass |

**Confidence for the whole table**: EDITORIAL — a scene-fit judgment call,
not a sourced consumer-preference finding.

---

## ANTI-PATTERNS

1. **Bavaria-as-Germany**: Lederhosen, Dirndl, and Alpine backdrops in
   Hamburg or Berlin. The single most important caricature this file
   flags — see ZONE CHARACTERIZATION.
2. **Munich autumn festival as default "German food"** — confirmed this
   pass as a real, checkable misconception, not just a style preference;
   see the FESTIVAL & OCCASION CALENDAR entry.
3. **Any alcohol or alcohol-coded vessel in frame**, including a blurred
   background stein — see the alcohol-exclusion rule.
4. **US-portion inflation.** Portions are generous but not super-sized.
5. **US pretzel look** — pale, soft, cinnamon-sugar-dusted, no lye crust
   (see the Brezel entry).
6. **US potato salad** — cubed, mustard-yellow, celery, paprika dusting
   (see the Kartoffelsalat entry).
7. **Hot-dog buns for Bratwurst** — a crusty white roll is correct.
8. **Sauerkraut on everything.** It belongs with Eisbein, Kassler,
   Nürnberger plates, Saumagen, and Schupfnudeln — not by default beside
   Schnitzel or currywurst.
9. **Halve Hahn with chicken** — it is a Gouda cheese roll; see the entry.
10. **Old slur names** for paprika schnitzel — always say "paprika
    schnitzel." (Not independently re-verified this pass; treated as a
    standing precaution regardless — see the Sauced Schnitzel entry.)
11. **English or US signage; dot-decimal prices** — German-language
    signage and comma-decimal prices are correct.
12. **Wrong can proportions or US labelling** — see the pack-format table
    above.
13. **Folkloric-only Germany**: omitting Döner, pizza, Gyros, and Asia
    boxes — see CONTEMPORARY EVERYDAY FOOD.
14. **Soft or rubbery crackling; batter-style Schnitzel coating; a smooth
    hash-brown-style Reibekuchen** — texture failures; see the VISUAL &
    PLATING NORMS texture lexicon.
15. **Visible branded condiments or props**: the specific brown seasoning-
    sauce bottle, named mustard/curry-ketchup brands, chain logos — see
    the trademark-genericization table.
16. **Coffee cups at Kaffee und Kuchen** — out of this file's beverage
    scope.
17. **Conflating Haxe and Eisbein** — one is roasted and crisp, the other
    boiled and soft; see the dedicated variant note.
18. **A silent single default for a genuinely coexisting variant**
    (Kartoffelsalat, Jägerschnitzel, currywurst casing, Sauerbraten,
    Labskaus presentation) rather than disclosing the choice per schema
    §4.6 — added as its own anti-pattern this pass, since it's the single
    most common way this file's own heavy variant load could be misused.

---

## TRADEMARK & LANDMARK HANDLING (schema §7.5)

See the GENERAL NORMS trademark-genericization table above for the full,
consolidated list (this pass merged the draft's separate §9 table into that
one table rather than keeping two overlapping lists — see the RESEARCH LOG
for this structural note). The core rule, unchanged from schema §7.5 and
from this project's Coney Island precedent: a real business, festival, or
landmark may be cited as **evidence** that a setting or dish is authentic,
but never as a literal, named prompt subject. Landmarks specifically
(Brandenburg Gate, Cologne Cathedral, Neuschwanstein Castle, the
Elbphilharmonie, Munich's towers) get the same treatment this project gave
Coney Island's Wonder Wheel: describe the generic category of structure/
setting instead of the specific, identifiable, potentially trademarked or
copyrighted design.

---

## GAP LOG

- **External cultural review (13 Nov 2026), points for a native reviewer.**
  Steckerlfisch's Oktoberfest origin (rated HIGH here); Brezel fat
  content (Swabian 3–10% vs Bavarian ~3%); Labskaus beetroot mixed in vs
  served separately in Bremen; "highest board-game purchases per capita";
  the 2025 birth count as the lowest since 1946; Sauerbraten's regional
  split (Saxony missing); Kartoffelsalat style in the East; current
  Berlin Currywurst casing practice. Content gaps from the same review:
  the East (Plattenbau home default, Broiler, Soljanka, Ketwurst),
  Einschulung with the Schultüte, Volksfeste outside Munich (Cannstatter
  Wasen, Hamburger Dom, Rhineland Kirmes), Schützenfest, Muttertag (coffee
  and cake), Tag der Deutschen Einheit, Vatertag, Richtfest.
- **Brand decisions raised by the same review, waiting on Fernando:**
  coffee in soft background at Kaffee und Kuchen; a water or Apfelschorle
  glass outside the hero zone; Kinderpunsch at Christmas markets; the ice
  and lemon default (the Easter brunch client brief asks for it); beer
  garden settings dropped for Coca-Cola briefs; children at the table with
  the product (the client brief asks for it; flagged for TCCC compliance).

- **Composition & proportions blocks (added 2026-09-27, `country-file-schema.md` §4.7) are mostly editorial synthesis.** Piece sizes are sourced where tagged; counts and shares are reasoned from recipe quantities and serving norms, tagged [EDITORIAL], and should be checked against image tests before being treated as reliable.
- **PENDING UPDATE — an authoritative TCCC product-dimension/spec drop is
  expected in the coming days**, per the orchestrating session. Hold off on
  further WebSearch effort toward the pack-dimension gaps below until it
  lands; see `coca-cola-guidelines.md`'s own front-matter flag.
- **Germany-specific Coca-Cola pack dimensions beyond the 330mL can remain
  largely unconfirmed** — the 0.2L and 0.33L glass contour bottles and the
  1.0L returnable format are carried from the draft's own estimates, not
  independently verified via WebSearch this pass (search results returned
  general Coca-Cola bottle guides, not Germany-specific technical specs).
  The 0.5L PET figure is inferred from `coca-cola-guidelines.md`'s generic
  table rather than confirmed Germany-specific. **This is the single
  largest remaining Priority-A gap from the draft's own verification
  queue**, flagged honestly rather than papered over with invented
  precision.
- **Whether Germany uses a "slim" 330mL can variant alongside the standard-
  diameter can was not confirmed this pass** — WebSearch results on this
  point were generic can-dimension aggregator content, not Germany-specific
  bottler documentation.
- **No confirmed TCCC OU code for this market** — flagged in the front
  matter; do not guess one, same disclosed gap as `uk.md`.
- **The paprika-schnitzel old-name naming-sensitivity claim was not
  independently re-verified with a dedicated new source this pass** —
  carried forward from the draft as a standing precaution regardless of
  confirmation status, since the cost of over-caution here is negligible.
- **Bavaria's dish-catalog depth and the Bavaria-spinout trigger's ~30%
  threshold were not independently re-derived or tested this pass** — both
  are carried forward as the orchestrating session's own prior decision,
  not re-litigated per the task brief.
- **A large share of individual dish dimensions (most of the compact-
  catalog tables: fair snacks, Kaffee-und-Kuchen items, soups, East
  German dishes) remain this file's own reasonable estimates**, carried
  from the draft without a dedicated new WebSearch per dish, consistent
  with the proportionality choice explained at the top of the DISH
  CATALOG. Confidence is tagged MEDIUM throughout to reflect this honestly
  rather than implying a false uniformity of verification depth across
  ~50 entries.
- **Regional-boundary evidence for the eight-zone regional map was spot-
  checked, not exhaustively validated** the way the UK's Scotland/Wales/
  Northern Ireland split was validated dish-by-dish and axis-by-axis. The
  map is carried forward largely as the draft described it, with individual
  dish claims verified where they intersected this pass's priority queue.
- **The calibrated-glassware fill-line's everyday visual appearance**
  (exact font/placement conventions on a real German gastronomy glass) was
  confirmed as a real legal/cultural convention but not independently
  photographed or visually detailed beyond the general "comma-decimal fill
  line" description.
- **Returnable-crate storage as a domestic realism cue** is carried from
  the draft as a plausible, widely-recognized convention, not independently
  re-verified with a dedicated new source this pass.
- **Celebrations pass (2026-10-01) open items.** Wedding guest numbers
  conflict (about 38 in caterer enquiries vs. 65 to 82 in consumer
  surveys); all are industry or survey-platform figures read only in
  search summaries. Headcounts for Christmas, Easter, birthdays and
  confirmations are editorial. The late-night wedding snack (Currywurst,
  Gulaschsuppe) and the Silvester lucky-charm decor are general knowledge,
  not searched. Easter Sunday lamb is documented by food and consumer-
  portal sources; no survey of how many families actually eat it.
- **Game-night pass (2026-10-01) open items.** Not verified: tournament
  and Bundesliga kick-off slots (model knowledge); the fan-zone dish mix
  beyond "food stands" (The Local); the home viewing snacks (Chips,
  Flips, Frikadellen) and the garden-grill viewing pairing; Skat and
  Doppelkopf in the Kneipe and whether stakes are common; the Silvester
  raclette-plus-games pairing; the Spieleabend food spread. Board-game
  purchase figures come partly from IMARC (market research, flagged).

- **Venue-profile pass, wave 1 (2026-10-01) open items.** Not verified
  (search summaries only, no pages read): Eckbank prevalence and the
  washing machine sitting in the bathroom rather than the kitchen (model
  knowledge, LOW); Döner-shop decor (mirror walls, nazar, landscape
  photos) is LOW, equipment MEDIUM from supplier sources; northern and
  eastern inn variants LOW; balcony furnishing rests on tenant-association
  and DIY-chain guides; the Public Viewing background is editorial with
  no new search; Hamburg's fan-zone site not verified.

- **Venue-profile pass, wave 2 (2026-10-18) open items.** Search
  summaries only, no pages read. Unverified background details: WG décor
  rests on individual WG-Gesucht listings; the island kitchen rests on
  house-building forums with no prevalence figure, and the anthracite
  windows, roller shutters and handleless units are LOW; the café and
  modern-restaurant looks come from Berlin guides and one restaurant's
  listings (concrete, pickle-jar shelves LOW); park, market and beach
  regional variants are LOW; the Wochenmarkt stall mix is EDITORIAL
  beyond what municipal ordinances state. Interior photo review would
  firm these up.

## CANDIDATE QUEUE

1. A dedicated search pass (or SME/bottler-documentation check) on
   Germany-specific Coca-Cola glass-bottle (0.2L/0.33L) and 1.0L PET/glass
   dimensions, and on the slim-vs-standard 330mL can question — the top
   remaining Priority-A gap from the draft's own verification queue.
2. A native-German-reviewer pass, per the draft's own recommendation
   (§11/§"Human review" of the scratch file) — covering the meal-structure
   table, the Weißwurst before-noon custom, the regional settings register,
   the festival calendar, the authenticity cues, and the trademark table.
   **This file's `status:` front matter reflects this as still needed —
   do not treat this file as production-ready until it happens.**
3. Independent §8 audit of this file before it is treated as fully done,
   per the project's standing practice (not yet run as a separate pass in
   this session).
4. A dedicated verification pass on the individual dimension estimates in
   the compact-catalog tables (fair snacks, Kaffee-und-Kuchen items, East
   German dishes, soups), if any of them turn out to be genuinely
   staging-critical in practice.
5. Once `spain.md` exists, revisit Germany's meal-timing (12–14:00 lunch,
   18:00–19:00 dinner) against Spain's own findings per
   `country-file-schema.md` §5.2 — Spain's famously later meal times should
   make for a sharp, worth-stating cross-country contrast, the same way
   this project already contrasts UK/US/Uruguay dinner timing.
6. Consider whether `coca-cola-guidelines.md` should directly cite TCCC's
   public Responsible Marketing Policy and Responsible Alcohol Marketing
   Policy (both found and cited in this file — see FILE ROLE & METHOD),
   so every future country file inherits the citation rather than
   re-discovering it. Not done in this pass, to avoid colliding with the
   parallel Spain-file session's own edits to shared files.
7. Celebration dishes with no catalog entry (celebrations pass
   2026-10-01): roast lamb (Easter); Osterlamm cake and Osterzopf
   (compact sweets rows); Stollen and Christmas biscuits (compact rows);
   Wiener/Frankfurter sausages as the Christmas Eve pairing (compact).
8. Game-night viewing foods with no catalog entry (game-night pass
   2026-10-01): Knabberzeug as a compact block (crisps, Erdnussflips,
   salt sticks in bowls, blank packets); Plätzchen tin (also covered by
   item 7's Christmas biscuits).

## RESEARCH LOG

- **2026-09-24, verification-and-merge pass.** Input:
  `knowledge-base/scratch-germany-model-knowledge-draft.md` (a model-
  knowledge-only scaffold from a separate, tool-less Claude session on
  branch `claude/nations-batch-1` — see that file's own header and
  `DECISIONS.md`'s entry evaluating it for provenance). Method: WebSearch
  only — WebFetch/direct page reads were blocked by network egress for
  every domain attempted, consistent with every prior research round on
  this project (Uruguay, all completed US regional files, the UK build).
  Roughly 30 distinct WebSearch queries were run across this pass,
  prioritized per the draft's own §11 verification queue: Priority A first
  (Coca-Cola pack dimensions, TCCC's actual alcohol/children's-marketing
  policy, the Wiener Schnitzel naming rule, calibrated-glassware
  conventions, the DPG deposit logo), then Priority B (Swabian-vs-Bavarian
  pretzel shape, currywurst casing prevalence and its East Berlin origin,
  East-style Jägerschnitzel, Nürnberger/Thüringer Bratwurst PGI dimensions,
  Spaghettieis and Steckerlfisch, NYE raclette prevalence), then a
  time-boxed spot-check of Priority C and the task's own named dish list
  (currywurst's Berlin/Ruhr origin dispute, Sauerbraten's three regional
  variants, Käsespätzle, Flammkuchen, Handkäs mit Musik, Labskaus, the
  Oktoberfest-Munich-only framing, Abendbrot prevalence and its documented
  decline, German housing stock, population, young-adult living
  arrangements, and balcony/garden access). No subagents were used for this
  pass.
- **Quantified verification outcome.** Of the roughly 50 distinct factual
  claims this pass specifically targeted (the draft's own Priority A/B
  items plus the task's named spot-check list): **roughly 20 were
  confirmed and upgraded from the draft's `[UV→X]` tag to a real HIGH or
  MEDIUM-HIGH sourced confidence tag** (the Wiener Schnitzel naming law;
  the DPG deposit-logo size and trademark status; the Eichstrich/Füllstrich
  legal fill-line convention; Nürnberger and Thüringer Rostbratwurst's
  exact PGI dimensions; the Swabian-vs-Bavarian pretzel-shape mechanism;
  currywurst's Berlin-best-evidenced-but-contested origin and its East
  Berlin skinless-variant origin; East-style Jägerschnitzel's GDR-canteen
  origin; Sauerbraten's three regional sauce variants; Käsespätzle's
  Swabian origin and cheese type; Flammkuchen's Alsace/Baden/Palatinate
  shared origin; Handkäs mit Musik's composition; Labskaus's origin and a
  newly-disclosed Hamburg/Bremen presentation variant; Grüne Soße's
  Maundy Thursday tradition and 2016 EU protection; Spaghettieis's exact
  1969 Mannheim/Dario Fontanella origin; Steckerlfisch's mackerel-
  prevalence correction; the Munich-only Oktoberfest framing; Spargelzeit's
  24 June/Johannistag end date; Germany's population, housing-stock split,
  rental rate, balcony-access rate, and young-adults-at-home rate; and
  TCCC's own real Responsible Marketing/Responsible Alcohol Marketing
  policies). **Roughly a dozen items were carried forward largely as the
  draft described them after a spot-check found no contradiction** (the
  general meal-structure framework, the texture lexicon's individual
  claims, most of the compact-catalog dish dimensions). **A handful of
  specific figures were corrected or sharpened, not just confirmed
  verbatim** — the 330mL can dimension (replaced with `coca-cola-
  guidelines.md`'s already-verified 115.2mm/66.1mm figure rather than the
  draft's own rougher ~11.5cm/~6.6cm estimate); Nürnberger Bratwurst's
  length (corrected from the draft's vaguer estimate to the exact
  EU-registered 7–9cm/20–25g); the Brezel shape mechanism (sharpened from
  "arms joined higher/lower" to the more precise pre-slit-vs-naturally-
  split distinction); and Labskaus (the beetroot-in-mash detail was
  disclosed as a genuine Hamburg-vs-Bremen coexisting variant rather than a
  single unqualified description). **Nothing was found to be flatly wrong
  and removed outright** — consistent with the UK build's own finding, this
  draft's honesty discipline (real, checkable claims with an honest `[UV→X]`
  tag, never a fabricated-sounding citation) meant its leads consistently
  panned out in the direction it expected.
- **What could not be confirmed and is flagged, not papered over**: the
  Germany-specific glass-bottle (0.2L/0.33L) and 1.0L PET/glass dimensions;
  whether Germany uses a slim 330mL can variant; the exact everyday visual
  appearance of a calibrated-glass fill line; the paprika-schnitzel old-
  name naming-sensitivity claim; and a large share of individual dish
  dimensions in the compact-catalog tables (fair snacks, Kaffee-und-Kuchen
  items, East German dishes, soups) — all logged in the GAP LOG above
  rather than left implicit.
- **Structural decisions not re-litigated, per the task brief**: the
  single-file structure with the Bavaria-spinout trigger, and the alcohol-
  exclusion hard rule, were both decisions made by the orchestrating
  session before this pass began. This pass's job on those two points was
  narrower: confirm the alcohol-exclusion rule's consistency with
  `coca-cola-guidelines.md` (found no conflicting language there, and found
  that the rule is independently well-supported by TCCC's own real,
  public Responsible Marketing and Responsible Alcohol Marketing policies —
  see FILE ROLE & METHOD for the full citation) and reorganize the draft's
  own 0–12 section numbering into this project's established FILE ROLE &
  METHOD / QUICK-REFERENCE / ZONE CHARACTERIZATION / TRUSTED CONTENT /
  DISH CATALOG / GAP LOG / CANDIDATE QUEUE / RESEARCH LOG convention,
  actually re-mapping content into those sections rather than just
  relabeling headers.
- **One structural merge made during reorganization, flagged as a judgment
  call**: the draft's separate §9 ("Trademark & Landmark Handling") table
  and its GENERAL-NORMS-equivalent trademark list were merged into a
  single, consolidated trademark-genericization table in TRUSTED CONTENT >
  GENERAL NORMS, with the TRADEMARK & LANDMARK HANDLING section (kept, per
  schema §7.5's naming convention) pointing back to it rather than
  duplicating it — the same "one authoritative location, not two
  overlapping lists" principle schema §4.3 applies to style-map entries.
- **2026-10-01 celebrations pass (schema §5.7):** 6 searches (Christmas
  Eve dish surveys, communion/confirmation venues, wedding guest numbers,
  grilling prevalence, Easter lunch and Osterlamm, birthday Kaffeetafel).
  Added CELEBRATIONS & LARGE GATHERINGS after the FESTIVAL & OCCASION
  CALENDAR with 8 entries: Christmas Eve, Christmas feast, Silvester
  raclette, Easter Sunday lunch, birthday Kaffeetafel and children's
  party, confirmation and First Communion, wedding, summer Grillfest.
  WebSearch only.
- **2026-10-01 game-night pass (schema §5.8):** built from the
  cross-market research notes (45 searches across all markets), 0 new
  searches. Added GAME NIGHT after CELEBRATIONS & LARGE GATHERINGS with
  three watch-party entries (Public Viewing fan mile, tournament game at
  home with the garden grill, Bundesliga Saturday on the sofa) and two
  social game-night entries (Spieleabend at home, holiday games at
  Advent, Christmas and Silvester). Points to the existing Sport settings
  line and the stadium Gulaschsuppe row rather than repeating them. The
  Kneipe (viewing and Skat) is staged only as a home version.
- **2026-10-01 venue-profile pass, wave 1 (schema §5.9): 6 profiles, 6
  searches.** Added VENUE PROFILES after the QUICK-REFERENCE table:
  rented-apartment kitchen-dining corner, balcony with allotment variant,
  traditional inn, Imbiss stand, Döner shop, Public Viewing fan mile.
  WebSearch only; no pages read at source.
- **2026-10-18 venue-profile wave 2 (app-option tags + gap fill): 6
  profiles tagged, 7 new profiles, 7 searches.** Tags: kitchen-dining
  corner (Dining room), balcony (Dining room, outdoor), traditional inn
  (Sit-down), Imbiss stand (Counter service, Food truck), Döner shop
  (Counter service), Public Viewing fan mile (Stadium or event). New: WG
  shared flat (Gen Z apartment), house kitchen with island (Kitchen
  island), Kiezcafé with bakery-café variant (Café), modern neighbourhood
  restaurant (Modern bistro), city park lawn (Park), Wochenmarkt (Street
  market), Baltic beach and promenade (Beach or waterfront). Coverage
  table added. WebSearch only; no pages read at source.

### DISH LINEAGE NOTES (moved from the dish entries, 2026-11-13)

Origin and history notes, kept for reviewers. They describe where a dish comes from, not how it looks, so they sit here, outside the prompt excerpts.

**Dish: Brötchen (bread rolls)**
- Cuisine lineage: Native German; regional naming varies (*Semmel* in
  Bavaria, *Schrippe* in Berlin, *Weckle* in Swabia, *Rundstück* in Hamburg)
  without the roll's actual form changing — a prevalence/naming-only
  variation per schema §4.2, not a style-map case. [CONFIDENCE: MEDIUM —
  naming variation is widely known; not independently re-verified region by
  region this pass]

**Dish: Currywurst**
- Cuisine lineage: Native German, invented dish, with a genuinely contested
  origin — verified and corrected from the draft's own compact framing.
  **Herta Heuwer's Berlin claim is the best-evidenced single account**: on 4
  September 1949, at her food stand in Charlottenburg, West Berlin, she
  mixed ketchup/Worcestershire sauce and curry powder (obtained from
  British occupying soldiers) with other spices and poured it over a
  grilled pork sausage; she patented her sauce under the name "Chillup" in
  1951 (some sources say 1959). A competing claim places a similar dish in
  Hamburg as early as 1947 (recalled by a single writer, Uwe Timm, decades
  later, with no corroborating second source), and the Ruhr area separately
  claims its own currywurst tradition from the 1950s onward, popular among
  miners as an affordable, filling snack. **Disclose the Berlin claim as
  best-evidenced, not as uncontested** — the same honest-dispute treatment
  this project already gives the UK's fish-and-chips Malin-vs-Lees dispute.
  [CONFIDENCE: HIGH that Heuwer's account is the best-documented and most
  widely credited; MEDIUM that it is definitively "first," given the
  uncorroborated Hamburg claim] [S18, S19, S20]

**Dish: Döner Kebab (Turkish-German)**
- Cuisine lineage: Turkish-German — genuinely everyday German food, not a
  niche import; omitting it (along with pizza, Gyros, and pan-Asian Imbiss
  food) would produce a folkloric, locally-unrecognizable Germany. This
  project's own §4.1 spaghetti/meatballs-style honesty norm applies in
  reverse here: Döner is correctly attributed to Turkish-German origin, and
  that lineage should be stated plainly, not folded into "German food"
  without context.

**Dish: Käsespätzle**
- Cuisine lineage — confirmed this pass: a traditional dish of Swabia,
  Baden, and the Allgäu, said to have originated in Swabia specifically and
  carried into Austria (Vorarlberg, Tyrol) by Swabian immigrants in the
  18th century; also found in Switzerland and Liechtenstein. [CONFIDENCE:
  HIGH] [S35]

**Dish: Flammkuchen**
- Cuisine lineage — confirmed this pass: originates from the Alsace region
  of France, with the same tradition carried into the neighboring German
  regions of Baden-Württemberg and the Palatinate. The dish's name in both
  languages ("tarte flambée"/"Flammkuchen," both meaning "tart/cake baked
  in flame") derives from its origin as a thin test-dough used to check a
  wood-fired bread oven's temperature, before crème fraîche, onion, and
  bacon toppings became standard. [CONFIDENCE: HIGH] [S37; general Flammkuchen-history sourcing corroborating the shared Alsace/Baden/ Palatinate origin]

**Dish: Labskaus**
- Cuisine lineage — confirmed and one detail corrected this pass: a
  nautical dish from major North German port cities (Hamburg, Bremen,
  Lübeck), made from ingredients with a long shelf life for sea voyages —
  salted meat/corned beef, potatoes, and onion. **A real, genuinely
  coexisting regional-presentation variant, not previously disclosed as a
  choice in the draft**: some sources describe the mash itself as mixed
  with beetroot (giving the coarse magenta-pink color the draft's texture
  note describes), while a specifically **Bremen-style** presentation keeps
  the beetroot and rollmops (rolled pickled herring) as separate side
  garnishes rather than mixed into the mash itself. **Offer both as a
  choice per §4.6** rather than assuming the beetroot is always mixed in.
  [CONFIDENCE: MEDIUM-HIGH — corroborated across independent recipe/food-
  history sourcing this pass, though not traced to a single named
  Hamburg-vs-Bremen comparative source] [S38, S39]

**Dish: Handkäs mit Musik (Hesse)**
- Cuisine lineage/detail — confirmed this pass: a small, sour-milk cheese
  (*Handkäse*, literally "hand cheese") marinated in a raw-onion vinaigrette
  (vinegar, oil, sometimes mustard); the "music" name is popularly
  explained as a joke about the flatulence the raw onions supposedly
  cause, though at least one food historian argues it more simply refers
  to the "fun" the marinade brings. Traditionally served with rye bread,
  butter, and — in real life — a glass of Hessian apple wine (Apfelwein);
  per this file's alcohol-exclusion rule, the Apfelwein itself and its
  distinctive ribbed glass/stoneware jug are never depicted. [CONFIDENCE:
  HIGH for composition and the apple-wine pairing as real market context]
  [S40, S41]

## SOURCES CONSULTED

The [S#] tags in this file point here. The app leaves this section out of prompts.

- S-BRIEF: TCCC / Studio X, "ProdX Meal Briefing Q4 2026" Easter brunch template for Germany (EOU), 12 Nov 2026, supplied by Fernando.
- S1: The Coca-Cola Company — Responsible Marketing Policy — https://www.coca-colacompany.com/policies-and-practices/responsible-marketing-policy
- S2: The Coca-Cola Company — Responsible Alcohol Marketing Policy — https://www.coca-colacompany.com/policies-and-practices/responsible-alcohol-marketing-policy
- S3: DDR Museum — Hunter's Schnitzel with Tomato Sauce — https://www.ddr-museum.de/en/blog/2016/hunters-schnitzel-with-tomato-sauce
- S4: Berlin.de — Späti: Meeting Point, Supermarket and Regional Treasure — https://www.berlin.de/en/shopping/4971123-2947095-spaeti-meeting-point-and-supermarket.en.html
- S5: Lonely Planet — You'll see this everywhere: Spätis in Berlin — https://www.lonelyplanet.com/articles/spatis-in-berlin
- S6: Federal Statistical Office of Germany (Destatis) — https://www.destatis.de/EN/Home/_node.html
- S7: Worldometer — Germany Population — https://www.worldometers.info/world-population/germany-population/
- S8: The Local — Is Germany falling out of love with Abendbrot? — https://www.thelocal.de/20220310/is-germany-falling-out-of-love-with-abendbrot
- S9: The Local — Abendbrot: what time do Germans eat dinner? — https://www.thelocal.de/20230329/abendbrot-what-time-do-germans-eat-dinner
- S10: Destatis —   Dwelling stock, Germany — https://www.destatis.de/EN/Themes/Society-Environment/Housing/_Graphic/_Interactive/dwelling-stock.html
- S11: SpaceDaily/AFP — More than a   million German households have hung solar panels off their balcony   railings — https://spacedaily.com/b-more-than-a-million-german-households-have-hung-solar-panels-off-their-balcony-railings-and-plugged-them-into-a-wall-socket-and-the-law-caps-each-at-800-watts-a-fridge-and-a-laptop/
- S12: home24 —   Gardens in Germany: Who Still Has Access to a Garden? — https://www.home24.de/garden-study/
- S13: Eurostat   — Young people: housing conditions — https://ec.europa.eu/eurostat/statistics-explained/index.php?title=Young_people_-_housing_conditions
- S14: DPG Deutsche Pfandsystem — About DPG — https://dpg-pfandsystem.de/en/the-one-way-deposit-system/about-dpg.html
- S15: Britannica — Oktoberfest — https://www.britannica.com/topic/Oktoberfest
- S16: germanculture.com.ua — Why Germans Eat Green Food on Maundy Thursday — https://germanculture.com.ua/german-traditions/why-germans-eat-green-food-on-maundy-thursday-grundonnerstag/
- S17: Frankfurt on Foot — Frankfurt Grüne Sosse — https://frankfurt-on-foot.com/2024/01/12/frankfurt-grune-sosse-or-green-sauce/
- S18: Wikipedia: Currywurst — https://en.wikipedia.org/wiki/Currywurst
- S19: Herta Heuwer — https://en.wikipedia.org/wiki/Herta_Heuwer
- S20: Hamburg   Travel — Berlin or Hamburg: Who invented the currywurst? — https://www.hamburg-travel.com/blog/berlin-or-hamburg-who-invented-the-currywurst/
- S21: doeatbetterexperience.com — Currywurst in     Berlin — https://doeatbetterexperience.com/blog/currywurst-berlin/
- S22: Berlin     Food Tour — Berlin Currywurst, More Than Just a Sausage — https://www.berlinfoodtour.de/2025/02/04/berlin-currywurst-more-than-just-a-sausage/
- S23: Wikipedia: Thuringian     sausage — https://en.wikipedia.org/wiki/Thuringian_sausage
- S24: GOV.UK —     protected food name: Thüringer Rostbratwurst — https://www.gov.uk/protected-food-drink-names/thuringer-rostbratwurst
- S25: Wikipedia: Nürnberger Rostbratwurst — https://en.wikipedia.org/wiki/N%C3%BCrnberger_Rostbratwurst
- S26: Find My Seidla — The Nürnberger Rostbratwurst: History, PGI Protection — https://findmyseidla.de/en/blog/nuremberg-bratwurst
- S27: The Daily Meal —   What Makes Bavarian Pretzels Different — https://www.thedailymeal.com/2062505/what-makes-bavarian-pretzels-different/
- S28: My German Table — Swabian Pretzels — https://www.mygermantable.com/swabian-pretzels-schwabische-laugenbrezeln/
- S29: The Daily Meal — Wiener   Schnitzel's Ingredients Are Actually Defined By Law — https://www.thedailymeal.com/1105865/wiener-schnitzels-ingredients-are-actually-defined-by-law/
- S30: Wikipedia: Wiener schnitzel — https://en.wikipedia.org/wiki/Wiener_schnitzel
- S31: Wikipedia: Jagdwurst — https://en.wikipedia.org/wiki/Jagdwurst
- S32: germany-shop.info — Secrets of sauerbraten: a chef reveals the regional   differences — https://www.germany-shop.info/en/why-does-sauerbraten-taste-so-different-in-the-rhineland-compared-to-franconia-or-saxony/
- S33: Craft Beering — Steckerlfisch aka   Bavarian Fish on a Stick — https://www.craftbeering.com/steckerlfisch/
- S34: Wikipedia: Steckerlfisch — https://en.wikipedia.org/wiki/Steckerlfisch
- S35: Wikipedia: Käsespätzle — https://en.wikipedia.org/wiki/K%C3%A4sesp%C3%A4tzle
- S36: The Splendid Table — Käsespätzle — https://www.splendidtable.org/story/2024/11/08/ksesptzle-swabian-noodles-with-mountain-cheese-and-caramelized-onions
- S37: Wikipedia:   Flammekueche — https://en.wikipedia.org/wiki/Flammekueche
- S38: Wikipedia: Labskaus — https://en.wikipedia.org/wiki/Labskaus
- S39: My Dinner — Hamburger Labskaus — https://mydinner.co.uk/labskaus/
- S40: Atlas Obscura — Handkäse Mit Musik — https://www.atlasobscura.com/foods/handkase-mit-musik-handcheese-with-music
- S41: Culture: the word on cheese — Handkäse mit Musik — https://culturecheesemag.com/travel/wheys-less-traveled/handkase-mit-musik/
- S42: Smithsonian Magazine — How Germany's Spaghetti Ice Cream Came to Be — https://www.smithsonianmag.com/travel/how-germanys-spaghetti-ice-cream-came-to-be-180982461/
- S43: Wikipedia (DE): Füllstrich — https://de.wikipedia.org/wiki/F%C3%BCllstrich
- S44: Wikipedia: Fill line — https://en.wikipedia.org/wiki/Fill_line
- S45: Küchen-Forum — kitchen in   an Altbau rental — https://www.kuechen-forum.de/forum/themen/kuechenplanung-in-mietwohnung-altbau.50220/
- S46: Küchen-Forum — L-kitchen with low window and radiator — https://www.kuechen-forum.de/forum/themen/l-kueche-mit-niedrigem-fenster-und-heizkoerper.5525/
- S47: Mieterverein München —   Balkonien and garden — https://www.mieterverein-muenchen.de/balkonien-und-garten-das-ist-erlaubt/
- S48: Deutscher Mieterbund — balconies — https://mieterbund.de/aktuelles/meldungen/balkone-und-terrassen/
- S49: OBI — balcony — https://www.obi.de/magazin/garten/balkon
- S50: Falstaff — what makes a   real Wirtshaus — https://www.falstaff.com/at/news/alles-wirt-gut-was-das-echte-wirtshaus-ausmacht-und-wo-man-es-heute-noch-findet
- S51: erlebe.bayern — historic Bavarian inns — https://erlebe.bayern/listicles/historische-wirtshaeuser-in-bayern/
- S52: Alps Magazine — Tiroler Stube — https://www.alps-magazine.com/tiroler-stube-heimeliges-unterm-hergottswinkel/
- S53: Servus Heimat — blue-check tablecloth — https://www.servusheimat.com/biergarten-tischdecke-blaukariert-klein.html
- S54: coolibri — Imbissbuden im   Pott — https://coolibri.de/magazin/imbissbuden-im-pott/
- S55: ruhr-guide — Kultimbisse — https://www.ruhr-guide.de/category/ausgehen/ausgehen-im-ruhrgebiet/kultimbisse/
- S56: Hähnchen Finke — top Currywurst stands — https://hahnfinke.de/top-currywurstbuden-ruhrgebiet-2025-haehnchen-finke-mehr/
- S57: myPOS — opening a Döner shop — https://www.mypos.com/de-de/blog/geschaftsratgeber/donerladen-eroeffnen-schritte-kosten-und-tipps
- S58: CPGASTRO — Döner salad counters — https://cpgastro.de/collections/salattische-saladetten
- S59: WG-Gesucht — Berlin Oberschöneweide — https://www.wg-gesucht.de/wg-zimmer-in-Berlin-Oberschoeneweide.13599454.html
- S60: WG-Gesucht — Berlin Friedrichsfelde — https://www.wg-gesucht.de/wg-zimmer-in-Berlin-Friedrichsfelde.13964249.html
- S61: WG-Gesucht — Leipzig Zentrum-Nord — https://www.wg-gesucht.de/wg-zimmer-in-Leipzig-Zentrum-Nord.10391567.html
- S62: Hausbau-Forum — Kochinsel threads — https://www.hausbau-forum.de/category/K/kochinsel/
- S63: Hausbau-Forum — kitchen planning for a new detached house — https://www.hausbau-forum.de/posts/629519/
- S64: top10berlin — coffee — https://www.top10berlin.de/de/tags/coffee
- S65: The Way to Coffee — specialty coffee Berlin — https://www.thewaytocoffee.com/specialtycoffeeberlin/
- S66: ohne-makler — café for sale — https://www.ohne-makler.net/immobilie/474531/
- S67: OpenTable — eins44   Kantine — https://www.opentable.hk/eins44-kantine-neukolln
- S68: I Heart Berlin — eins44 — https://www.iheartberlin.de/tag/weserstrasse/
- S69: The Berliner — best restaurants in Neukölln — https://www.the-berliner.com/food/best-restaurants-in-neukolln/
- S70: top10berlin — Volkspark   Friedrichshain — https://www.top10berlin.de/de/cat/freizeit-268/parks-1375/volkspark-friedrichshain
- S71: Berlin.de — best picnic spots — https://www.berlin.de/special/2471225-208-best-picnic-spots-in-berlin.html
- S72: visitBerlin — top picnic spots — https://www.visitberlin.de/de/blog/berlins-top-11-picknickplaetze
- S73: Kurz mal weg — best weekly   markets — https://www.kurz-mal-weg.de/reisemagazin/freizeitaktivitaeten/wochenmarkt-ranking
- S74: Neckargemünd — market statute 2023 — https://neckargemuend.de/site/Neckargemuend_2019/get/params_E702721020/3392945/Wochenmarktsatzung%202023.pdf
- S75: Germersheim — market statute 2025 — https://www.germersheim.eu/kultur-tourismus/feste-maerkte/germersheimer-maerkte/wochenmarkt/wochenmarktsatzung-2025.doc.pdf?cid=ix7
- S76: viel-unterwegs —   Boltenhagen — https://viel-unterwegs.de/ostseebad-boltenhagen
- S77: ab-in-den-urlaub — Ahlbeck — https://www.ab-in-den-urlaub.de/magazin/reisetipps/ahlbeck/
- S78: Deutsche Bahn — Travemünde — https://www.bahn.de/angebot/urlaub/bahnreisen/summerrail/travemuende
- S79: Statista — Umfrage zum   Essen an den Weihnachtsfeiertagen 2024 — https://de.statista.com/statistik/daten/studie/778023/umfrage/umfrage-in-deutschland-zum-essen-an-den-weihnachtsfeiertagen
- S80: YouGov Deutschland — Lieblingsgerichte der Deutschen zu Weihnachten — https://yougov.de/consumer/articles/51178-die-lieblingsgerichte-und-lieblingslebensmittel-der-deutschen-zu-weihnachten
- S81: Verbraucherfenster Hessen — Das   Osterlamm — https://verbraucherfenster.hessen.de/ernaehrung/essen-trinken/das-osterlamm-traditionelle-leckerei-aus-der-backform
- S82: speisekarte.de — Das Osterlamm — https://www.speisekarte.de/blog/2025/04/11/das-osterlamm-bedeutung-brauch-zubereitung/
- S83: deutschland-feiert.de —   Geburtstagstraditionen — https://www.deutschland-feiert.de/geburtstage/geburtstagstraditionen/
- S84: familie.de — Essen zum Kindergeburtstag — https://www.familie.de/diy/rezepte/essen-zum-kindergeburtstag/
- S85: Känguru — Kommunion und Konfirmation   richtig planen — https://www.kaenguru-online.de/themen/familienleben/kommunion-und-konfirmation-richtig-planen
- S86: gastgewerbe-magazin — Hochzeitsreport   2026 — https://gastgewerbe-magazin.de/hochzeitsreport-2026-kleiner-kreis-statt-grosser-show-welche-hochzeiten-die-deutschen-wirklich-moegen-72991
- S87: pureperfect-weddings — Zahlen & Fakten — https://pureperfect-weddings.de/hochzeit/zahlen-fakten-rund-um-das-thema-hochzeit/
- S88: YouGov Deutschland —   Grillsaison-Bilanz 2026 — https://yougov.com/de-de/artikel/55433-grillsaison-bilanz-2026-fast-sieben-von-zehn-deutschen-haben-dieses-jahr-gegrillt
- S89: The Local — Euro   2024 fan zones — https://www.thelocal.de/20240612/where-are-the-fan-zones-for-euro-2024-in-germany
- S90: muenchen.de — Fan Zone Olympiapark — https://www.muenchen.de/en/events/uefaeuro2024/fan-zone-munich-olympic-park-public-viewig-concerts
- S91: Wikipedia — Spiel — https://en.wikipedia.org/wiki/Spiel
- S92: IMARC Germany board games — https://www.imarcgroup.com/germany-board-games-market
