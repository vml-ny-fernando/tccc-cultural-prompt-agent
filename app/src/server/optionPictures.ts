// Pictures beside the options on Preparation and Plating (Fernando, 2026-11-11). Each is made
// once and saved for everyone; later sessions reuse the saved file, nothing is generated twice.
// They don't count toward a user's monthly image limit: they are shared reference pictures.
// - Preparation: a realistic photo of the dish as prepared, per country + dish + option, made
//   with the higher-quality image model.
// - Plating: a pen-and-ink drawing in Review the Sketch's style of that preparation on the
//   serving vessel, per country + dish + preparation + plating option.

import { createHash } from 'node:crypto';

import { generateImages } from './gemini.ts';
import { mediaUrl, putFile, signedFileUrl } from './store.ts';

export interface PrepPhotoInput {
  kind: 'prep' | 'plating';
  country: string;
  countryLabel: string;
  heroDish: string;
  /** The option's name: the preparation, or the plating. */
  label: string;
  promptText: string;
  /** Plating only: the preparation already chosen, so the drawing shows that food on the vessel. */
  prep?: { label: string; promptText: string } | undefined;
}

const known = new Set<string>();
const inflight = new Map<string, Promise<string>>();

const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');

/** The storage path for this country, dish and preparation (the option's name, not its wording). */
export function prepPhotoPath(i: Pick<PrepPhotoInput, 'kind' | 'country' | 'heroDish' | 'label' | 'prep'>): string {
  const parts = [i.country, i.heroDish, ...(i.kind === 'plating' ? [i.prep?.label ?? ''] : []), i.label].map(norm).join('|');
  const key = createHash('sha256').update(parts).digest('hex').slice(0, 32);
  // v2 (2026-11-12): every plating drawing on the same plain white paper, no table (Fernando); new folder so older drawings with tabletops aren't reused.
  return `thumbnails/${i.kind === 'plating' ? 'plating-v2' : i.kind}/${key}`;
}

function prompt(i: PrepPhotoInput): string {
  if (i.kind === 'plating')
    return [
      `A detailed black-and-white pen-and-ink drawing of one serving of ${i.heroDish} as served in ${i.countryLabel}: ${i.label}.`,
      `How it is served: ${i.promptText}`,
      i.prep ? `The food on it: ${i.prep.label}. ${i.prep.promptText}` : '',
      'The serving vessel and the food on it sit in the middle of the picture and fill most of it, seen from about 35 degrees above, so the vessel\'s shape, size and material and how the food sits on it are easy to read.',
      'Background: the vessel stands alone on plain white paper. No table, no tabletop, no wood grain, no cloth, no backdrop, no room and no other objects; only a soft pencil shadow directly under the vessel.',
      'Style: graphite pencil and fine ink line on plain white paper, confident contour lines with light hatching and cross-hatching for shadow and volume, like a storyboard or food-styling concept drawing.',
      'Strictly monochrome: black and grey on pure white. No color anywhere, not even on sauces, garnishes or glazes: draw them in grey tones. No people, no hands, no text, no labels, no logos, no drinks.',
    ]
      .filter(Boolean)
      .join(' ');
  return [
    `A realistic, appetizing food photograph of ${i.heroDish}, prepared as "${i.label}" the way it is made and served in ${i.countryLabel}.`,
    `The dish: ${i.promptText}`,
    'Seen from about 30 degrees above, the food fills most of the frame so its bread, fillings, cut and texture are easy to read. Soft natural daylight, a plain neutral surface, shallow depth of field.',
    'No people, no hands, no text, no logos, no branded packaging, no drinks.',
  ].join(' ');
}

async function exists(path: string): Promise<boolean> {
  if (known.has(path)) return true;
  try {
    await signedFileUrl(path, { expiresIn: 60 });
    known.add(path);
    return true;
  } catch {
    return false;
  }
}

const failed = new Map<string, { at: number; message: string }>();
const RETRY_AFTER_MS = 5 * 60_000;

/**
 * The saved photo's URL, or `pending` while it is being made. The first ask starts the job in
 * the background and returns at once (a request can't wait the 20-40 s a photo takes behind the
 * host's 30 s router timeout); the browser asks again every few seconds.
 */
export async function prepPhoto(i: PrepPhotoInput): Promise<{ url: string } | { pending: true } | { error: string }> {
  const path = prepPhotoPath(i);
  if (await exists(path)) return { url: mediaUrl(path) };
  if (inflight.has(path)) return { pending: true };
  const fail = failed.get(path);
  if (fail && Date.now() - fail.at < RETRY_AFTER_MS) return { error: fail.message };
  const job = (async () => {
    const [image] = await generateImages({ model: i.kind === 'prep' ? 'pro' : 'fast', prompt: prompt(i), aspectRatio: '4:3', imageSize: '1K', numImages: 1, references: [] });
    await putFile(path, image!.bytes, image!.mimeType);
    known.add(path);
    failed.delete(path);
    return mediaUrl(path);
  })();
  job
    .catch((err) => failed.set(path, { at: Date.now(), message: err instanceof Error ? err.message : String(err) }))
    .finally(() => inflight.delete(path));
  inflight.set(path, job);
  return { pending: true };
}
