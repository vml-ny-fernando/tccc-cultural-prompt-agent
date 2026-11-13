// Product reference photos for image generation: the real package shots of
// each catalog SKU (references/sku/<gtin>/front|side|top.jpg) and the poured
// bell glass (references/glass/poured.jpg). They live in the repo, so every
// user draws from the same inventory; the Gemini call reads them from disk
// (`asset:` URLs, see gemini.ts).

import { existsSync } from 'node:fs';
import path from 'node:path';

import { SKU_CATALOG } from '../shared/registry.ts';
import { assetUrl } from './gemini.ts';

const ROOT = path.resolve(process.cwd(), 'references');

export type SkuShot = 'front' | 'side' | 'top';

function asset(rel: string): string | null {
  return existsSync(path.join(ROOT, rel)) ? assetUrl(rel) : null;
}

/** The GTIN whose photos show this catalog SKU, if it has any. */
function skuGtin(skuId: string): string | undefined {
  return SKU_CATALOG.find((s) => s.id === skuId)?.gtin;
}

/** The requested shots of one SKU, in the order asked; missing shots are skipped. */
export function skuShots(skuId: string, shots: SkuShot[]): Array<{ shot: SkuShot; url: string }> {
  const gtin = skuGtin(skuId);
  if (!gtin) return [];
  return shots.flatMap((shot) => {
    const url = asset(`sku/${gtin}/${shot}.jpg`);
    return url ? [{ shot, url }] : [];
  });
}

/** The poured bell-glass reference. */
export function pouredGlass(): string | null {
  return asset('glass/poured.jpg');
}

/** Element labels the photos apply to: SKU / SKU_2 and GLASS / GLASS_2. */
export function productElement(label: string): 'sku' | 'glass' | null {
  if (/^SKU(_\d+)?$/i.test(label)) return 'sku';
  if (/^GLASS(_\d+)?$/i.test(label)) return 'glass';
  return null;
}

const SHOT_WORDS: Record<SkuShot, string> = {
  front: 'from the front',
  side: 'from the side (this is the back of the package; use it only for the shape and proportions, never show its barcode or panel text)',
  top: 'from directly above (the cap or lid)',
};

/** Prompt lines naming each product photo by its image number. */
export function skuReferenceLines(refs: Array<{ shot: SkuShot; n: number }>, skuId?: string): string {
  if (!refs.length) return '';
  const list = refs.map((r) => `image ${r.n} shows it ${SHOT_WORDS[r.shot]}`).join('; ');
  if (skuId && SKU_CATALOG.find((s) => s.id === skuId)?.unbranded) {
    return [
      `Product photographs of the real cup: ${list}.`,
      'These are close-ups: they show how the cup looks, not how big it is in the scene, so keep it at the real size given in this prompt. Match the cup exactly to these photographs: the same tapered shape and proportions, the flat lid, the straight straw and the printed stripes and colors.',
      'The cup carries no logo, brand name or text of any kind; never add one, and never turn it into a branded Coca-Cola cup.',
    ].join(' ');
  }
  return [
    `Product photographs of the real package: ${list}.`,
    'These are close-ups: they show how the package looks, not how big it is in the scene, so keep it at the real size given in this prompt. Match the package exactly to these photographs: the same shape and proportions, cap or lid, label artwork, logo lettering and colors. Do not redraw, restyle or re-letter the label, and do not invent any text.',
    'Its printed label is part of the product and stays on it. Turn it so the Coca-Cola logo faces the camera; no barcode, nutrition panel or back-label text shows.',
  ].join(' ');
}

export function glassReferenceLine(n: number): string {
  return `Image ${n} shows a correctly poured glass of Coca-Cola: match its glass shape (not its size: keep the real size given in this prompt), the liquid color, the height and texture of the foam head, and the amount and size of the ice.`;
}
