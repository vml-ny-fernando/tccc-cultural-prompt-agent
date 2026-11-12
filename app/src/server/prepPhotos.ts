// Preparation photos (Fernando, 2026-11-11): one realistic photo per country, dish and
// preparation, made once with the higher-quality image model and saved for everyone. Later
// sessions reuse the saved file; nothing is generated twice. These don't count toward a
// user's monthly image limit, since they are shared reference pictures, not their scenes.

import { createHash } from 'node:crypto';

import { generateImages } from './gemini.ts';
import { mediaUrl, putFile, signedFileUrl } from './store.ts';

export interface PrepPhotoInput {
  country: string;
  countryLabel: string;
  heroDish: string;
  label: string;
  promptText: string;
}

const known = new Set<string>();
const inflight = new Map<string, Promise<string>>();

const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');

/** The storage path for this country, dish and preparation (the option's name, not its wording). */
export function prepPhotoPath(i: Pick<PrepPhotoInput, 'country' | 'heroDish' | 'label'>): string {
  const key = createHash('sha256').update(`${norm(i.country)}|${norm(i.heroDish)}|${norm(i.label)}`).digest('hex').slice(0, 32);
  return `thumbnails/prep/${key}`;
}

function prompt(i: PrepPhotoInput): string {
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
    const [image] = await generateImages({ model: 'pro', prompt: prompt(i), aspectRatio: '4:3', imageSize: '1K', numImages: 1, references: [] });
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
