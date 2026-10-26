// Loads the markdown knowledge base shipped in /knowledge-base. Country files
// carry `country:` front matter; regional files carry `region:` and
// `parent_file:`. The brand and tableware references apply to every market.
//
// A single country file is 80-190k characters, and sending it whole on every
// agent call would be slow and costly. So each call gets a budgeted excerpt
// (48,000 characters by default): the files are split at their headings and the sections
// most relevant to the dish and the step are kept, in document order, with
// their heading path so the agent can still cite "spain.md › DISH CATALOG › …".

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, join, relative, sep } from 'node:path';

export const KNOWLEDGE_DIR = process.env.KNOWLEDGE_DIR || 'knowledge-base';

export interface KbFile {
  path: string;
  file: string;
  text: string;
}

export interface CountryEntry {
  id: string;
  label: string;
  ou: string;
  file: KbFile;
  regions: Array<{ id: string; label: string; file: KbFile }>;
}

export interface KnowledgeBase {
  available: boolean;
  source: string;
  countries: CountryEntry[];
  references: KbFile[];
}

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (name.endsWith('.md')) out.push(p);
  }
  return out;
}

export function frontMatter(text: string): Record<string, string> {
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  const fm: Record<string, string> = {};
  if (!m?.[1]) return fm;
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([a-z_]+):\s*(.*)$/);
    if (kv?.[1]) fm[kv[1]] = (kv[2] ?? '').trim();
  }
  return fm;
}

const LABELS: Record<string, string> = {
  united_states: 'United States',
  uk: 'United Kingdom',
  united_kingdom: 'United Kingdom',
  south_africa: 'South Africa',
  turkey: 'Türkiye',
};

function titleCase(s: string): string {
  return s.replace(/[_-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// ---------------------------------------------------------------------------
// KB overlay — approved knowledge-base edits from the learning loop, applied
// on top of the files on disk so an agent reads them as part of the source
// knowledge base without anyone touching the knowledge-base repo itself.
// ---------------------------------------------------------------------------

/** One approved edit: `text` is appended to the end of `file`'s `heading` section. */
export interface KbOverlayEdit {
  file: string;
  heading: string;
  text: string;
}

let overlayEdits: KbOverlayEdit[] = [];

const foldText = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Replaces the overlay and drops the cached knowledge base so the next
 * `loadKnowledge()` rebuilds it with these edits applied. Call after any
 * change to an approved edit's status, text or heading.
 */
export function setKbOverlay(edits: KbOverlayEdit[]): void {
  overlayEdits = edits;
  cached = null;
}

/**
 * Appends each edit's text to the end of the section whose heading matches
 * (by file basename + heading text, tolerant of whitespace/case/accents); an
 * edit whose heading isn't found gets a new "## Approved additions" section
 * at the end of the file instead. Appended text is marked with a
 * "> Approved team note:" line so an agent reading the excerpt treats it as
 * authoritative, not a stray quote.
 */
function applyOverlayToFile(file: KbFile, edits: KbOverlayEdit[]): string {
  let text = file.text;
  for (const edit of edits) {
    const targetFold = foldText(edit.heading);
    const lines = text.split('\n');
    let headingIdx = -1;
    let headingLevel = 0;
    for (let i = 0; i < lines.length; i++) {
      const m = lines[i]!.match(/^(#{1,6})\s+(.*)$/);
      if (m?.[1] && m[2] !== undefined && foldText(m[2]) === targetFold) {
        headingIdx = i;
        headingLevel = m[1].length;
        break;
      }
    }
    const block = `\n> Approved team note:\n${edit.text.trim()}\n`;
    if (headingIdx === -1) {
      text = `${text.replace(/\n+$/, '')}\n\n## Approved additions\n\n### ${edit.heading}\n${block}\n`;
      continue;
    }
    let insertAt = lines.length;
    for (let i = headingIdx + 1; i < lines.length; i++) {
      const m = lines[i]!.match(/^(#{1,6})\s+/);
      if (m?.[1] && m[1].length <= headingLevel) {
        insertAt = i;
        break;
      }
    }
    lines.splice(insertAt, 0, block);
    text = lines.join('\n');
  }
  return text;
}

let cached: KnowledgeBase | null = null;

/** Every markdown file on disk with the approved-edit overlay applied — exactly what the agents read. */
function readKnowledgeFiles(): KbFile[] {
  const files = walk(KNOWLEDGE_DIR).map((p) => ({
    path: p,
    file: basename(p),
    text: readFileSync(p, 'utf8'),
  }));
  if (overlayEdits.length) {
    for (const f of files) {
      const edits = overlayEdits.filter((e) => foldText(e.file) === foldText(f.file));
      if (edits.length) f.text = applyOverlayToFile(f, edits);
    }
  }
  return files;
}

/** The whole knowledge base for download: paths relative to the knowledge-base folder, overlay applied. */
export function knowledgeExport(): Array<{ path: string; text: string }> {
  if (!existsSync(KNOWLEDGE_DIR)) return [];
  return readKnowledgeFiles()
    .map((f) => ({ path: relative(KNOWLEDGE_DIR, f.path).split(sep).join('/'), text: f.text }))
    .sort((a, b) => a.path.localeCompare(b.path));
}

export function loadKnowledge(): KnowledgeBase {
  if (cached) return cached;
  if (!existsSync(KNOWLEDGE_DIR)) {
    cached = { available: false, source: '', countries: [], references: [] };
    return cached;
  }
  const files = readKnowledgeFiles();
  const countries: CountryEntry[] = [];
  const regional: Array<{ fm: Record<string, string>; f: KbFile }> = [];
  for (const f of files) {
    if (!f.path.includes('02-culture')) continue;
    const fm = frontMatter(f.text);
    if (fm.country) {
      // Some files add a note after the id, e.g. "china (mainland — …)".
      const id = fm.country.split(/[\s(]/)[0]!;
      countries.push({
        id,
        label: LABELS[id] ?? titleCase(id),
        ou: /^not confirmed/i.test(fm.ou ?? '')
          ? 'not confirmed'
          : (fm.ou ?? '').split(/[\s(—]/)[0] || 'not confirmed',
        file: f,
        regions: [],
      });
    } else if (fm.region) {
      regional.push({ fm, f });
    }
  }
  for (const { fm, f } of regional) {
    const parent = (fm.parent_file ?? '').replace(/[`'"]/g, '').split(/\s/)[0];
    const c = countries.find((c) => c.file.file === parent);
    if (!c || !fm.region) continue;
    const prefix = c.file.file.replace(/\.md$/, '') + '-';
    c.regions.push({
      id: fm.region,
      label: titleCase(fm.region.replace(prefix, '')),
      file: f,
    });
  }
  for (const c of countries) c.regions.sort((a, b) => a.label.localeCompare(b.label));
  countries.sort((a, b) => a.label.localeCompare(b.label));

  const references = files.filter(
    (f) =>
      f.file === 'coca-cola-guidelines.md' ||
      f.file === 'tableware-composition-reference.md'
  );
  const sourcePath = join(KNOWLEDGE_DIR, '.source');
  cached = {
    available: countries.length > 0,
    source: existsSync(sourcePath)
      ? readFileSync(sourcePath, 'utf8').split('\n').slice(0, 2).join(' · ')
      : KNOWLEDGE_DIR,
    countries,
    references,
  };
  return cached;
}

// ---------------------------------------------------------------------------
// Section excerpts
// ---------------------------------------------------------------------------

interface Section {
  path: string[]; // heading trail, outermost first
  heading: string;
  body: string;
  order: number;
}

function sections(text: string): Section[] {
  const out: Section[] = [];
  const body = text.replace(/^---\n[\s\S]*?\n---\n?/, '');
  const trail: string[] = [];
  let cur: Section = { path: [], heading: '', body: '', order: 0 };
  let order = 0;
  for (const line of body.split('\n')) {
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h?.[1] && h[2] !== undefined) {
      if (cur.body.trim() || cur.heading) out.push(cur);
      const level = h[1].length;
      trail.length = level - 1;
      trail[level - 1] = h[2].trim();
      cur = {
        path: trail.filter(Boolean),
        heading: h[2].trim(),
        body: '',
        order: ++order,
      };
    } else {
      cur.body += line + '\n';
    }
  }
  if (cur.body.trim() || cur.heading) out.push(cur);
  return out;
}

const fold = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const STOP = new Set(
  'with from that this their there have they into your about style served dish food meal the and for'.split(
    ' '
  )
);

/** Distinct, accent-folded words (4+ letters) from the given phrases. */
export function keywords(...phrases: Array<string | undefined>): string[] {
  const out = new Set<string>();
  for (const p of phrases) {
    if (!p) continue;
    for (const w of fold(p).split(/[^a-z0-9]+/)) {
      if (w.length >= 4 && !STOP.has(w)) out.add(w);
    }
  }
  return [...out];
}

const SKIP =
  /research log|gap log|candidate queue|file role|research method|changelog|open questions|sources consulted|citations?$/i;

export type ContextFocus =
  | 'prep'
  | 'plating'
  | 'sides'
  | 'surface'
  | 'accent'
  | 'story'
  | 'validate'
  | 'imageCheck';

/** Headings that matter for a step even when they don't name the dish. */
const FOCUS: Record<ContextFocus, RegExp> = {
  prep: /dish catalog|variant|preparation|regional/i,
  plating: /vessel|scale|plating|serv|tableware|visual/i,
  sides: /side|accompan|condiment|bread|vessel|plating|serv|tableware/i,
  surface: /on the go|street|outdoor|environment|staging|picnic|scenario/i,
  accent: /condiment|garnish|accompan|side|avoid|never/i,
  story: /environment|staging|scenario|visual|plating|texture|prompt|model failure|wording|avoid|never/i,
  validate: /avoid|never|rule|norm|brand|unconfirmed|model failure/i,
  imageCheck: /dish catalog|variant|preparation|visual|texture|plating|model failure|avoid|never/i,
};

const ALWAYS = /never|avoid|taboo|file-wide rules|do not|don'?t/i;

/** A country's hard staging rules go into every excerpt, ahead of everything else. */
const HARD_RULES = /hard staging rules/i;

/** Useful to every step; fills whatever budget the dish-specific sections leave. */
const GENERAL =
  /general norms|visual|plating|vessel|scale|environment|staging|quick-reference|texture|model failure|wording|zone characterization/i;

function scoreSection(s: Section, words: string[], focus: RegExp): number {
  const head = fold(s.path.join(' › '));
  const body = fold(s.body);
  let score = 0;
  for (const w of words) {
    if (head.includes(w)) score += 12;
    const hits = body.split(w).length - 1;
    score += Math.min(hits, 6);
  }
  if (focus.test(head)) score += 5;
  if (ALWAYS.test(s.heading)) score += 4;
  if (HARD_RULES.test(s.heading)) score += 1000;
  if (GENERAL.test(head)) score += 2;
  return score;
}

export function excerpt(
  f: KbFile,
  words: string[],
  focus: RegExp,
  budget: number
): string {
  if (f.text.length <= budget) return f.text;
  const secs = sections(f.text).filter((s) => !SKIP.test(s.path.join(' ')));
  const ranked = secs
    .map((s) => ({ s, score: scoreSection(s, words, focus) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.s.order - b.s.order);
  const MAX_SECTION = Math.max(2500, Math.floor(budget * 0.45));
  const picked: Array<{ s: Section; text: string }> = [];
  let used = 0;
  for (const { s } of ranked) {
    const head = `### ${s.path.join(' › ')}\n`;
    const room = Math.min(MAX_SECTION, budget - used - head.length - 30);
    if (room < 500) break;
    let text = s.body.trim();
    if (text.length > room) text = text.slice(0, room) + '\n…(section truncated)';
    const block = `${head}${text}\n`;
    picked.push({ s, text: block });
    used += block.length;
  }
  picked.sort((a, b) => a.s.order - b.s.order);
  return `(Excerpt: the sections of ${f.file} most relevant to this step.)\n\n${picked
    .map((p) => p.text)
    .join('\n')}`;
}

export interface ContextRequest {
  country: string;
  region?: string | undefined;
  focus: ContextFocus;
  words: string[];
  /** Total characters available for the knowledge-base block. */
  budget: number;
}

/**
 * The knowledge the agent reads for one call: the country file, the regional
 * file (when picked), then the brand and tableware references, each cut to its
 * share of the budget.
 */
export function knowledgeBlock(req: ContextRequest): {
  text: string;
  files: string[];
} {
  const kb = loadKnowledge();
  const c = kb.countries.find((c) => c.id === req.country);
  const r = req.region ? c?.regions.find((r) => r.id === req.region) : undefined;
  const focus = FOCUS[req.focus];
  // References first, then the regional file, then the country file, so any
  // budget a smaller file leaves unused passes on to the country file.
  const plan: Array<{ f: KbFile; share: number; order: number }> = [];
  kb.references.forEach((ref, i) =>
    plan.push({ f: ref, share: c ? 0.14 : 0.5, order: 2 + i })
  );
  if (r) plan.push({ f: r.file, share: 0.3, order: 1 });
  if (c) plan.push({ f: c.file, share: 1, order: 0 });
  let left = req.budget;
  const done: Array<{ f: KbFile; text: string; order: number }> = [];
  for (const p of plan) {
    const own = p.share >= 1 ? left : Math.floor(req.budget * p.share);
    const text = excerpt(p.f, req.words, focus, Math.max(0, own));
    left -= text.length;
    done.push({ f: p.f, text, order: p.order });
  }
  done.sort((a, b) => a.order - b.order);
  const parts = done.map((d) => `<file name="${d.f.file}">\n${d.text}\n</file>`);
  return {
    text: `<knowledge_base>\n${parts.join('\n\n')}\n</knowledge_base>`,
    files: done.map((d) => d.f.file),
  };
}
