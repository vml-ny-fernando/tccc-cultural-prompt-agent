// SceneSpec → the list of labeled items the solver places.

import { BELL_GLASS, MASS_HEIGHT, VESSELS, napkinDef, skuProxy, type ProxyDef } from "./registry";
import { isLargeSku } from "./rules";
import { FAMILY_SIZE, isFamily } from "./spec";
import type { Layer, SceneSpec } from "./types";

export type ItemKind =
  | "main"
  | "shared-hero"
  | "sku"
  | "glass"
  | "side"
  | "shared-side"
  | "bread"
  | "condiment"
  | "accent"
  | "napkin-set"
  | "partner-main"
  | "partner-napkin"
  | "partner-sku"
  | "partner-glass"
  | "plate-stack";

export interface ItemSpec {
  label: string; // role label shown on the proxy and used as the prompt segment key
  kind: ItemKind;
  layer: Layer;
  name: string; // human description of what it is
  proxyKey: string;
  def: ProxyDef;
  extraHeight: number; // food mass on top of the vessel
  pairsWith?: string;
  injected?: boolean;
  footprint?: "rect" | "triangle";
  /** Material, color and finish of the vessel, for the prompt. */
  style?: string;
  /** For a second-setting item (party "2"): the single-setting label it copies (MAIN, NAPKIN_SET_1, SKU, GLASS). */
  sameAs?: string;
}

const L1: Layer = "Layer_1_Primary_CoHero";
const L2: Layer = "Layer_2_Secondary_Side";
const L3: Layer = "Layer_3_Tertiary_Accent";

export function sceneItems(spec: SceneSpec): ItemSpec[] {
  const items: ItemSpec[] = [];
  const shared = spec.entree.plating.service === "shared";
  const mass = MASS_HEIGHT[spec.entree.prep.massClass];
  const family = isFamily(spec.scene.party);

  if (family) {
    // Family style (Fernando, 2026-11-14): the whole dish on its serving vessel is the hero, in the
    // middle of the table; nobody has a plated portion or a laid place.
    const v = spec.entree.plating.vessel;
    items.push({
      label: "MAIN",
      kind: "main",
      layer: L1,
      name: `${spec.entree.name}, the whole dish served family-style for about ${FAMILY_SIZE} people to help themselves (${v})`,
      proxyKey: v,
      def: VESSELS[v],
      extraHeight: mass,
      style: spec.entree.plating.vesselStyle,
    });
  } else if (shared) {
    const v = spec.entree.plating.vessel;
    items.push({
      label: "SHARED_HERO",
      kind: "shared-hero",
      layer: L2,
      name: `${spec.entree.name}, served family-style (${v})`,
      proxyKey: v,
      def: VESSELS[v],
      extraHeight: mass,
      style: spec.entree.plating.vesselStyle,
    });
    items.push({
      label: "MAIN",
      kind: "main",
      layer: L1,
      name: `a plated portion of ${spec.entree.name}`,
      proxyKey: "plate",
      def: VESSELS.plate,
      extraHeight: Math.min(mass, 0.04),
    });
  } else {
    items.push({
      label: "MAIN",
      kind: "main",
      layer: L1,
      name: spec.entree.name,
      proxyKey: spec.entree.plating.vessel,
      def: VESSELS[spec.entree.plating.vessel],
      extraHeight: mass,
      style: spec.entree.plating.vesselStyle,
    });
  }

  items.push({ label: "SKU", kind: "sku", layer: L1, name: spec.sku.displayName, proxyKey: `sku:${spec.sku.id}`, def: skuProxy(spec.sku), extraHeight: 0 });
  if (spec.sku.glass) {
    items.push({ label: "GLASS", kind: "glass", layer: L1, name: "branded bell-shaped Coca-Cola glass, filled to the top", proxyKey: "bell-glass", def: BELL_GLASS, extraHeight: 0 });
  }

  let sideN = 0,
    sharedN = 0,
    breadN = 0,
    condN = 0;
  for (const a of spec.accompaniments) {
    const def = VESSELS[a.vessel];
    if (a.role === "condiment" || a.role === "sauce" || a.role === "garnish") {
      condN++;
      items.push({ label: `SAUCE_${condN}`, kind: "condiment", layer: L3, name: a.name, proxyKey: a.vessel, def, extraHeight: 0.005, pairsWith: a.pairsWith || "MAIN", style: a.vesselStyle });
    } else if (a.role === "bread") {
      breadN++;
      items.push({ label: `BREAD_${breadN}`, kind: "bread", layer: L2, name: a.name, proxyKey: a.vessel, def, extraHeight: 0.04, style: a.vesselStyle });
    } else if (a.service === "shared") {
      sharedN++;
      items.push({ label: `SHARED_${sharedN}`, kind: "shared-side", layer: L2, name: a.name, proxyKey: a.vessel, def, extraHeight: 0.03, style: a.vesselStyle });
    } else {
      sideN++;
      items.push({ label: `SIDE_${sideN}`, kind: "side", layer: L2, name: a.name, proxyKey: a.vessel, def, extraHeight: 0.03, style: a.vesselStyle });
    }
  }

  if (spec.napkinSet) {
    items.push({
      label: "NAPKIN_SET_1",
      kind: "napkin-set",
      layer: L3,
      name: spec.napkinSet.cutlery.length ? `folded napkin with ${spec.napkinSet.cutlery.join(" and ")} on top` : `folded ${spec.napkinSet.material ?? "cotton"} napkin`,
      proxyKey: `napkin-${spec.napkinSet.napkinShape}-${spec.napkinSet.size ?? "luncheon"}${spec.napkinSet.cutlery.length ? "" : "-plain"}`,
      def: napkinDef(spec.napkinSet.napkinShape, spec.napkinSet.size),
      extraHeight: 0.006,
      footprint: spec.napkinSet.napkinShape,
    });
  }

  if (spec.accent) {
    items.push({
      label: "ACCENT_1",
      kind: "accent",
      layer: L3,
      name: spec.accent.name,
      proxyKey: spec.accent.vessel,
      def: VESSELS[spec.accent.vessel],
      style: spec.accent.vesselStyle,
      extraHeight: 0.005,
      pairsWith: "MAIN",
      injected: true,
    });
  }

  // Second place setting (party "2"): the partner's plate always mirrors MAIN (even when the
  // table has a family-style SHARED_HERO centerpiece). Drinks follow the brief's SKU: single-serve
  // gets its own SKU_2 (+GLASS_2 if the hero has a glass); multi-serve shares the one bottle and
  // only adds a second filled glass. All second-setting items sit in the background layer.
  if (family) {
    // Loose small plates for people to serve themselves, stacked, not laid at places.
    items.push({
      label: "PLATES",
      kind: "plate-stack",
      layer: L3,
      name: `a loose stack of ${FAMILY_SIZE} empty small plates for people to serve themselves`,
      proxyKey: "side-plate",
      def: VESSELS["side-plate"],
      extraHeight: 0.03,
    });
    // One drink per person: a shared multi-serve bottle pours into more glasses; a single-serve
    // pack repeats once per person (Fernando, 2026-11-14), with its glass when the hero has one.
    for (let k = 2; k <= FAMILY_SIZE; k++) {
      if (!isMultiServe(spec)) {
        items.push({ label: `SKU_${k}`, kind: "partner-sku", layer: L3, name: `${spec.sku.displayName} (another person's)`, proxyKey: `sku:${spec.sku.id}`, def: skuProxy(spec.sku), extraHeight: 0, sameAs: "SKU" });
      }
      if (spec.sku.glass) {
        items.push({ label: `GLASS_${k}`, kind: "partner-glass", layer: L3, name: "branded bell-shaped Coca-Cola glass, filled to the top (another person's)", proxyKey: "bell-glass", def: BELL_GLASS, extraHeight: 0, sameAs: "GLASS" });
      }
    }
  }

  if (spec.scene.party === "2") {
    const hero = items.find((i) => i.label === "MAIN")!;
    items.push({
      label: "MAIN_2",
      kind: "partner-main",
      layer: L3,
      name: `a plated portion of ${spec.entree.name}, matching MAIN`,
      proxyKey: hero.proxyKey,
      def: hero.def,
      extraHeight: hero.extraHeight,
      style: hero.style,
      sameAs: "MAIN",
    });
    if (spec.napkinSet) {
      const napkin = items.find((i) => i.kind === "napkin-set")!;
      items.push({
        label: "NAPKIN_SET_2",
        kind: "partner-napkin",
        layer: L3,
        name: napkin.name,
        proxyKey: napkin.proxyKey,
        def: napkin.def,
        extraHeight: napkin.extraHeight,
        footprint: napkin.footprint,
        sameAs: "NAPKIN_SET_1",
      });
    }
    if (!isMultiServe(spec)) {
      items.push({
        label: "SKU_2",
        kind: "partner-sku",
        layer: L3,
        name: `${spec.sku.displayName} (the second diner's)`,
        proxyKey: `sku:${spec.sku.id}`,
        def: skuProxy(spec.sku),
        extraHeight: 0,
        sameAs: "SKU",
      });
    }
    if (spec.sku.glass) {
      items.push({
        label: "GLASS_2",
        kind: "partner-glass",
        layer: L3,
        name: "branded bell-shaped Coca-Cola glass, filled to the top (the second diner's)",
        proxyKey: "bell-glass",
        def: BELL_GLASS,
        extraHeight: 0,
        sameAs: "GLASS",
      });
    }
  }

  return items;
}

/**
 * Odd/even rule: count the table items (the napkin set counts once, cutlery
 * included). An even count needs one injected accent.
 */
export function itemCount(spec: SceneSpec): number {
  return sceneItems({ ...spec, accent: null }).length;
}

export function needsAccent(spec: SceneSpec): boolean {
  return itemCount(spec) % 2 === 0;
}

export function isMultiServe(spec: SceneSpec): boolean {
  return isLargeSku(spec.sku);
}
