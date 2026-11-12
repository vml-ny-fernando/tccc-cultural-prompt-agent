// Storage for the app: JSON documents in Postgres (the `documents` table) and
// image files in a private Supabase Storage bucket. Replaces the Runway/Bay
// storage helpers; `documentStore` keeps the same shape so feedback.ts reads
// the same as before.

import { env } from './env.ts';
import { db } from './supabase.ts';

export interface Stored<T> {
  key: string;
  value: T;
}

export interface DocumentStore<T> {
  get(key: string): Promise<Stored<T> | null>;
  put(key: string, value: T): Promise<void>;
  /** Keys under `prefix` (relative to the store), in no particular order. */
  list(prefix?: string): Promise<string[]>;
  /** Every document under `prefix`, in one query. */
  values(prefix?: string): Promise<T[]>;
  /** Read-modify-write that retries when another write landed in between. */
  update(key: string, fn: (current: T | null) => T): Promise<T>;
}

const TABLE = 'documents';
const MAX_UPDATE_ATTEMPTS = 5;

/** Escapes `%` and `_` so a key prefix matches literally in LIKE. */
function likePrefix(prefix: string): string {
  return `${prefix.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
}

export function documentStore<T>(opts: { prefix: string }): DocumentStore<T> {
  const collection = opts.prefix.replace(/\/$/, '');

  async function readRow(key: string): Promise<{ value: T; version: number } | null> {
    const { data, error } = await db()
      .from(TABLE)
      .select('value, version')
      .eq('collection', collection)
      .eq('key', key)
      .maybeSingle();
    if (error) throw new Error(`Couldn't read ${collection}/${key}: ${error.message}`);
    return data ? { value: data.value as T, version: data.version as number } : null;
  }

  return {
    async get(key) {
      const row = await readRow(key);
      return row ? { key, value: row.value } : null;
    },

    async put(key, value) {
      const { error } = await db()
        .from(TABLE)
        .upsert({ collection, key, value, updated_at: new Date().toISOString() }, { onConflict: 'collection,key' });
      if (error) throw new Error(`Couldn't save ${collection}/${key}: ${error.message}`);
    },

    async list(prefix = '') {
      const { data, error } = await db()
        .from(TABLE)
        .select('key')
        .eq('collection', collection)
        .like('key', likePrefix(prefix));
      if (error) throw new Error(`Couldn't list ${collection}: ${error.message}`);
      return (data ?? []).map((r) => r.key as string);
    },

    async values(prefix = '') {
      const { data, error } = await db()
        .from(TABLE)
        .select('value')
        .eq('collection', collection)
        .like('key', likePrefix(prefix));
      if (error) throw new Error(`Couldn't list ${collection}: ${error.message}`);
      return (data ?? []).map((r) => r.value as T);
    },

    async update(key, fn) {
      for (let attempt = 0; attempt < MAX_UPDATE_ATTEMPTS; attempt++) {
        const current = await readRow(key);
        const next = fn(current?.value ?? null);
        const now = new Date().toISOString();
        if (!current) {
          const { error } = await db().from(TABLE).insert({ collection, key, value: next, version: 1, updated_at: now });
          if (!error) return next;
          if (error.code !== '23505') throw new Error(`Couldn't save ${collection}/${key}: ${error.message}`);
          continue; // someone created it first: re-read and retry
        }
        const { data, error } = await db()
          .from(TABLE)
          .update({ value: next, version: current.version + 1, updated_at: now })
          .eq('collection', collection)
          .eq('key', key)
          .eq('version', current.version)
          .select('key');
        if (error) throw new Error(`Couldn't save ${collection}/${key}: ${error.message}`);
        if (data && data.length) return next;
      }
      throw new Error(`Couldn't save ${collection}/${key}: too many people editing it at once. Try again.`);
    },
  };
}

// ---------------------------------------------------------------------------
// Files (generated images, uploads, rated images)
// ---------------------------------------------------------------------------

/** The browser-facing URL for a stored file; `/media/*` checks the session and redirects. */
export function mediaUrl(path: string): string {
  return `/media/${path}`;
}

const MEDIA_PATH = /^(generations|uploads|feedback-images|thumbnails)\/[A-Za-z0-9._\/-]+$/;

/** The storage path behind a `/media/...` URL (absolute or relative), or null for anything else. */
export function mediaPath(url: string): string | null {
  let pathname = url;
  if (/^https?:\/\//i.test(url)) {
    try {
      pathname = new URL(url).pathname;
    } catch {
      return null;
    }
  }
  if (!pathname.startsWith('/media/')) return null;
  const path = decodeURIComponent(pathname.slice('/media/'.length));
  return MEDIA_PATH.test(path) && !path.includes('..') ? path : null;
}

export async function putFile(path: string, bytes: Uint8Array, contentType: string): Promise<void> {
  const { error } = await db().storage.from(env.storageBucket).upload(path, bytes, { contentType, upsert: true });
  if (error) throw new Error(`Couldn't store the image: ${error.message}`);
}

export async function getFile(path: string): Promise<{ bytes: Uint8Array; contentType: string }> {
  const { data, error } = await db().storage.from(env.storageBucket).download(path);
  if (error || !data) throw new Error(`Couldn't read the stored image: ${error?.message ?? 'not found'}`);
  return { bytes: new Uint8Array(await data.arrayBuffer()), contentType: data.type || 'image/png' };
}

export async function signedFileUrl(path: string, opts: { expiresIn: number; download?: boolean }): Promise<string> {
  const { data, error } = await db()
    .storage.from(env.storageBucket)
    .createSignedUrl(path, opts.expiresIn, opts.download ? { download: true } : undefined);
  if (error || !data) throw new Error(`Couldn't sign the image link: ${error?.message ?? 'not found'}`);
  return data.signedUrl;
}
