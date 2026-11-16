// Prints the full photo prompt for one fixed scene at every camera angle, so wording
// changes can be compared before and after (no model calls). Usage:
//   npx tsx scripts/angle-prompts.ts [outDir]
import { mkdirSync, writeFileSync } from "node:fs";
import { buildSpec } from "../src/shared/spec.ts";
import { solve } from "../src/shared/solver.ts";
import { reframe } from "../src/shared/reframe.ts";
import { storyFacts, assemblePrompt, type Story } from "../src/shared/story.ts";
import { ANGLES } from "../src/shared/rules.ts";

const out = process.argv[2] ?? "angle-prompts";
mkdirSync(out, { recursive: true });

const brief = { operatingUnit: "", country: "argentina", region: "", skuId: "coke-original-355ml-can", heroDish: "Choripán", sideDishRequest: "", occasion: "weekday-lunch", countryLabel: "Argentina" } as const;
const scenes = {
  market: { setting: "outdoor", venue: "on-the-go", party: "1", time: "midday", venueType: "street-market" },
  home: { setting: "indoor", venue: "home", party: "1", time: "midday", venueType: "dining-room" },
} as const;

for (const [name, scene] of Object.entries(scenes)) {
  const sel = {
    prep: { label: "Choripán mariposa", detail: "", promptText: "Exactly one choripán mariposa in a crusty pan francés with chimichurri.", massClass: "wrapped" },
    plating: { label: "Kraft tray", detail: "", vessel: "tray", vesselStyle: "matte brown kraft paper", service: "individual", promptText: "On a kraft paper tray." },
    sides: { label: "Sauces", detail: "", cutlery: [], accompaniments: [
      { name: "Chimichurri", role: "condiment", vessel: "ramekin", vesselStyle: "clear glass jar", service: "individual", pairsWith: "MAIN", promptText: "Chimichurri in a small glass jar." },
      { name: "Salsa criolla", role: "condiment", vessel: "ramekin", vesselStyle: "clear glass jar", service: "individual", pairsWith: "MAIN", promptText: "Salsa criolla in a small glass jar." },
    ] },
    scene,
    camera: { look: "close-hero", angle: "diners-eye" },
    accent: null,
    napkin: true,
  } as any;
  for (const a of ANGLES) {
    const spec = buildSpec(brief as any, { ...sel, camera: { ...sel.camera, angle: a.id } });
    const res = solve(spec);
    let bp = res.options[0]?.blueprint;
    let s = res.spec;
    if (!bp) {
      // Fall back to the diner's-eye layout seen from this angle, as the Tablescape step does.
      const base = solve(buildSpec(brief as any, sel));
      const f: any = base.options[0] && reframe(base.spec, base.options[0].blueprint, a.id);
      if (!f?.ok) { console.error(name, a.id, "can't frame:", f?.reason ?? res.infeasible.map((i) => i.reason).join("; ")); continue; }
      bp = f.blueprint; s = { ...base.spec, camera: { ...base.spec.camera, angle: a.id } };
    }
    const facts = storyFacts(s, bp!);
    const story: Story = {
      sceneSummary: "", briefSummary: "", culturalNotes: [],
      segments: { environmentalOverview: name === "market"
        ? "Table: A worn, rectangular wooden folding counter top, bare with no cloth. Background: An open-air street market in a Buenos Aires park, white folding gazebo stalls and a paved path."
        : "Table: A dark wooden dining table, bare. Background: A lived-in Buenos Aires dining room with a sideboard and a curtained window." } as any,
      labelSegments: facts.labels.map((l: any) => ({ label: l.label, text: `${l.what}.` })),
    };
    writeFileSync(`${out}/${name}-${a.id}.txt`, assemblePrompt(story, facts) + "\n");
  }
}
console.log("wrote", out);
