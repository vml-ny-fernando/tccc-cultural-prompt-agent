// The feedback dialog: rate one generated scene image. An overall verdict, then a
// 1–5 rating of each element, named by what it is ("White rice", not SIDE_1) and
// marked with what it was generated from (prompt only, a preview, the product photo
// or the operator's own image). An element rated 3 or lower opens its own issue tags and a short note,
// so the learning agent knows exactly which item went wrong and how. Optional
// strengths and a note close it. The automatic check's findings show under the
// element they name and can be kept with the rating.

import { SignInPrompt, signInRequiredFrom } from '../lib/signIn.tsx';
import { Check, ChevronDown, Download, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Dialog, Heading, Modal } from 'react-aria-components';
import { Button } from '../ui/Button.tsx';

import {
  ELEMENT_ISSUE_TAGS,
  QUALITIES,
  RATING_LABELS,
  RATING_WORKING_MIN,
  SCENE_ELEMENT,
  SOURCE_LABELS,
  TAG_LABELS,
  VERDICT_LABELS,
  Verdict,
  WORKING_TAGS,
  elementSource,
  type FeedbackInput,
  type RatedElement,
} from '../../shared/feedback.ts';
import type { SceneSpec } from '../../shared/types.ts';
import { venueType } from '../../shared/venues.ts';
import type { WsResult } from '../../shared/workspace.ts';
import type { Brief } from '../intake/types.ts';
import { vesselLine } from '../intake/optionText.ts';
import { useOnSignedIn } from '../lib/useOnSignedIn.ts';
import { trpc } from '../trpc.ts';
import styles from './FeedbackDialog.module.css';

const NOTE_MAX = 2000;
const ELEMENT_NOTE_MAX = 300;

const RATINGS = [1, 2, 3, 4, 5] as const;
const HAS_SOURCE = new Set<RatedElement['kind']>(['food', 'product', 'table', 'environment']);

const VERDICT_HELP: Record<Verdict, string> = {
  usable: 'Ready to use as is',
  fixes: 'Close; needs edits',
  unusable: 'Start again',
};

function toggle<T>(set: Set<T>, value: T): Set<T> {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

async function downloadImage(url: string, name: string) {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = name;
    a.click();
    URL.revokeObjectURL(blobUrl);
  } catch {
    window.open(url, '_blank', 'noreferrer');
  }
}

/** Plain-language choice summary for the feedback record; built straight from the spec, not a selections object. */
function summarizeChoices(spec: SceneSpec): FeedbackInput['choices'] {
  const place = venueType(spec.scene.venue, spec.scene.venueType);
  return {
    prep: spec.entree.prep.label,
    plating: `${spec.entree.plating.label} — ${vesselLine(spec.entree.plating.vessel, spec.entree.plating.vesselStyle)}`,
    sides: spec.accompaniments.map((a) => a.name).join(', ') || undefined,
    scene: `${place?.label ?? spec.scene.venue}, ${spec.scene.setting}${spec.scene.time ? `, ${spec.scene.time}` : ''}`,
  };
}

/** A 1–5 scale; picking the chosen number again clears it. */
function Scale({ label, value, onPick, small }: { label: string; value: number | undefined; onPick: (n: number) => void; small?: boolean }) {
  return (
    <div className={styles.scale} data-small={small || undefined} role="radiogroup" aria-label={`${label}, 1 to 5`}>
      {RATINGS.map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n}, ${RATING_LABELS[n]}`}
          title={RATING_LABELS[n]}
          className={styles.scaleBtn}
          data-low={n < RATING_WORKING_MIN || undefined}
          onClick={() => onPick(n)}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

const GROUPS: Array<{ title: string; kinds: RatedElement['kind'][] }> = [
  { title: 'On the table', kinds: ['food', 'product', 'table'] },
  { title: 'Scene', kinds: ['environment', 'camera', 'lighting', 'color', 'scene'] },
];

export function FeedbackDialog({
  result,
  imageIndex,
  elements,
  brief,
  spec,
  model,
  sceneSummary,
  onClose,
  onSaved,
}: {
  /** The result being rated; null when the dialog is closed. */
  result: WsResult | null;
  /** 1-based image number within the result. */
  imageIndex: number;
  /** The elements to rate, named by what they are (workspace.ts ratedElements), the whole image last. */
  elements: RatedElement[];
  brief: Brief;
  spec: SceneSpec;
  model: string;
  sceneSummary: string;
  onClose: () => void;
  onSaved: (imageIndex: number, record: { id: string; verdict: Verdict; at: number }) => void;
}) {
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [strengths, setStrengths] = useState<Set<string>>(new Set());
  // One 1–5 rating per element; absent until rated.
  const [ratings, setRatings] = useState<Map<string, number>>(new Map());
  // Per element, the 1–5 score of each quality; and which item modules are open.
  const [qualities, setQualities] = useState<Map<string, Map<string, number>>>(new Map());
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [issueTags, setIssueTags] = useState<Map<string, Set<string>>>(new Map());
  const [elementNotes, setElementNotes] = useState<Map<string, string>>(new Map());
  const [note, setNote] = useState('');
  const [includeCheck, setIncludeCheck] = useState(true);
  const prevKeyRef = useRef<string | null>(null);

  const imageUrl = result?.urls[imageIndex - 1] ?? '';
  const existing = result?.feedback?.[imageIndex];
  const checkForImage = result?.check?.images.find((img) => img.image === imageIndex);
  const key = result ? `${result.id}:${imageIndex}` : null;

  const allElements = useMemo(
    () => (elements.some((e) => e.id === SCENE_ELEMENT) ? elements : [...elements, { id: SCENE_ELEMENT, name: 'Whole image', role: 'Anything not tied to one item', kind: 'scene' as const }]),
    [elements],
  );
  const checkIssuesFor = (id: string) => checkForImage?.issues.filter((i) => i.element === id) ?? [];

  useEffect(() => {
    if (!key || key === prevKeyRef.current) return;
    prevKeyRef.current = key;
    setVerdict(checkForImage?.pass === false ? 'unusable' : null);
    setStrengths(new Set());
    // The check's major issues start their element at 2 (Poor), so the issue tags are already open.
    setRatings(new Map(checkForImage?.issues.filter((i) => i.severity === 'major').map((i) => [i.element, 2]) ?? []));
    setQualities(new Map());
    setOpen(new Set(checkForImage?.issues.filter((i) => i.severity === 'major').map((i) => i.element) ?? []));
    setIssueTags(new Map());
    setElementNotes(new Map());
    setNote('');
    setIncludeCheck(!!checkForImage);
    // Resetting the form is tied to a new (result, image) target, not to every change of the check itself.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const rate = (el: string, n: number) => {
    setRatings((prev) => {
      const next = new Map(prev);
      if (next.get(el) === n) next.delete(el);
      else next.set(el, n);
      return next;
    });
    // A low score opens the item so its issues and qualities are in view.
    if (n < RATING_WORKING_MIN) setOpen((prev) => new Set(prev).add(el));
  };
  const rateQuality = (el: string, q: string, n: number) =>
    setQualities((prev) => {
      const next = new Map(prev);
      const mine = new Map(next.get(el));
      if (mine.get(q) === n) mine.delete(q);
      else mine.set(q, n);
      next.set(el, mine);
      return next;
    });
  const needsWork = (id: string) => (ratings.get(id) ?? 5) < RATING_WORKING_MIN;
  const rateRestFive = () =>
    setRatings((prev) => {
      const next = new Map(prev);
      for (const el of allElements) if (!next.has(el.id)) next.set(el.id, 5);
      return next;
    });
  const rated = allElements.filter((el) => ratings.has(el.id)).length;
  const sourceOf = (id: string) => elementSource(result?.references ?? [], id);

  const submit = trpc.feedbackSubmit.useMutation({
    onSuccess: (res, variables) => {
      onSaved(variables.imageIndex, { id: res.id, verdict: variables.verdict, at: Date.now() });
    },
  });
  const onSignedIn = useOnSignedIn();

  const buildInput = (): FeedbackInput | null => {
    if (!result || !verdict) return null;
    const ratedIds = allElements.filter((el) => ratings.has(el.id)).map((el) => el.id);
    const low = ratedIds.filter(needsWork);
    const elTags: Record<string, string[]> = {};
    const elNotes: Record<string, string> = {};
    for (const id of low) {
      const t = [...(issueTags.get(id) ?? [])];
      if (t.length) elTags[id] = t;
      const n = (elementNotes.get(id) ?? '').trim();
      if (n) elNotes[id] = n;
    }
    const issueUnion = new Set(Object.values(elTags).flat());
    return {
      resultId: result.id,
      imageIndex,
      imageUrl,
      verdict,
      // Strengths plus every element's issue tags, so older readers of `tags` still see them.
      tags: [...strengths, ...issueUnion].slice(0, 30),
      elements: low,
      working: ratedIds.filter((id) => !needsWork(id)),
      elementRatings: Object.fromEntries(ratedIds.map((id) => [id, ratings.get(id)!])),
      elementSources: Object.fromEntries(
        allElements.filter((el) => ratings.has(el.id) && HAS_SOURCE.has(el.kind)).map((el) => [el.id, sourceOf(el.id)]),
      ),
      elementNames: Object.fromEntries(allElements.filter((el) => ratings.has(el.id)).map((el) => [el.id, el.name.slice(0, 200)])),
      elementQualities: (() => {
        const out: Record<string, Record<string, number>> = {};
        for (const [id, m] of qualities) if (m.size) out[id] = Object.fromEntries(m);
        return Object.keys(out).length ? out : undefined;
      })(),
      elementTags: Object.keys(elTags).length ? elTags : undefined,
      elementNotes: Object.keys(elNotes).length ? elNotes : undefined,
      note: note.trim(),
      prompt: result.prompt,
      model,
      brief: {
        country: brief.country,
        countryLabel: brief.countryLabel,
        region: brief.region ?? '',
        heroDish: brief.heroDish,
        occasion: brief.occasion,
        skuId: brief.skuId,
      },
      choices: summarizeChoices(spec),
      sceneSummary,
      check: includeCheck && checkForImage ? { pass: checkForImage.pass, issues: checkForImage.issues } : undefined,
    };
  };

  const handleSubmit = () => {
    const input = buildInput();
    if (!input) return;
    submit.mutate(input);
  };

  const signIn = signInRequiredFrom(submit.error);
  const slug = `${brief.heroDish}-${brief.country}`.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'scene';
  const choices = summarizeChoices(spec);
  const context: Array<[string, string | undefined]> = [
    ['Preparation', choices.prep],
    ['Plating', choices.plating],
    ['Sides', choices.sides],
    ['Setting', choices.scene],
  ];

  return (
    <Modal
      isOpen={result !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      isDismissable
      className={styles.overlay}
    >
      <Dialog className={styles.dialog}>
        {result && (
          <>
            <header className={styles.head}>
              <div>
                <Heading slot="title" className={styles.title}>
                  Rate image {imageIndex}
                </Heading>
                <p className={styles.subtitle}>
                  {[brief.heroDish, brief.countryLabel].filter(Boolean).join(' · ')}
                </p>
              </div>
              <button type="button" className={styles.iconBtn} aria-label="Close" onClick={onClose}>
                <X size={18} aria-hidden />
              </button>
            </header>

            <div className={styles.body}>
              <aside className={styles.side}>
                <img className={styles.thumb} src={imageUrl} alt={`Scene image ${imageIndex}`} />
                <button type="button" className={styles.linkBtn} onClick={() => downloadImage(imageUrl, `${slug}-scene-${imageIndex}.png`)}>
                  <Download size={14} aria-hidden /> Download image
                </button>
                <dl className={styles.context}>
                  {context
                    .filter(([, v]) => v)
                    .map(([k, v]) => (
                      <div key={k}>
                        <dt>{k}</dt>
                        <dd>{v}</dd>
                      </div>
                    ))}
                </dl>
                {checkForImage && (
                  <div className={styles.checkBox} data-pass={checkForImage.pass || undefined}>
                    <strong>
                      Automatic check: {checkForImage.pass ? 'passed' : `${checkForImage.issues.length} issue${checkForImage.issues.length === 1 ? '' : 's'}`}
                    </strong>
                    {!checkForImage.pass && <span>Its findings show under each item below.</span>}
                    <label className={styles.checkToggle}>
                      <input type="checkbox" checked={includeCheck} onChange={(e) => setIncludeCheck(e.target.checked)} />
                      Save its findings with my rating
                    </label>
                  </div>
                )}
              </aside>

              <div className={styles.form}>
                {existing && (
                  <p className={styles.notice}>
                    You rated this {VERDICT_LABELS[existing.verdict]} on {new Date(existing.at).toLocaleDateString()}. Sending again adds a new rating.
                  </p>
                )}

                <section className={styles.section} aria-labelledby="fb-overall">
                  <h3 id="fb-overall" className={styles.sectionTitle}>
                    <span className={styles.step}>1</span> Overall
                  </h3>
                  <div className={styles.verdicts} role="radiogroup" aria-labelledby="fb-overall">
                    {Verdict.options.map((v) => (
                      <button
                        key={v}
                        type="button"
                        role="radio"
                        aria-checked={verdict === v}
                        className={styles.verdict}
                        data-verdict={v}
                        onClick={() => setVerdict(v)}
                      >
                        <span className={styles.verdictLabel}>{VERDICT_LABELS[v]}</span>
                        <span className={styles.verdictHelp}>{VERDICT_HELP[v]}</span>
                      </button>
                    ))}
                  </div>
                </section>

                <section className={styles.section} aria-labelledby="fb-items">
                  <div className={styles.sectionHead}>
                    <h3 id="fb-items" className={styles.sectionTitle}>
                      <span className={styles.step}>2</span> Each item
                    </h3>
                    <span className={styles.progress}>
                      {rated} of {allElements.length} rated
                    </span>
                    <button type="button" className={styles.linkBtn} disabled={rated === allElements.length} onClick={rateRestFive}>
                      <Check size={14} aria-hidden /> {rated === 0 ? 'Rate all 5' : 'Rate the rest 5'}
                    </button>
                  </div>
                  <p className={styles.hint}>
                    Score each item 1 (wrong) to 5 (great). Open an item to score the same qualities for every item, so its strengths
                    can be carried to weaker ones. A 3 or lower also opens its issues. The tag shows whether it came from the prompt or a
                    reference image.
                  </p>
                  {GROUPS.map((g) => {
                    const items = allElements.filter((el) => g.kinds.includes(el.kind));
                    if (!items.length) return null;
                    return (
                      <div key={g.title} className={styles.group}>
                        <h4 className={styles.groupTitle}>{g.title}</h4>
                        <ul className={styles.rows}>
                          {items.map((el) => {
                            const r = ratings.get(el.id);
                            const low = r !== undefined && r < RATING_WORKING_MIN;
                            const issues = checkIssuesFor(el.id);
                            const picked = issueTags.get(el.id) ?? new Set<string>();
                            // Only items and the background can carry a reference image; camera, light and color are always prompt text.
                            const source = HAS_SOURCE.has(el.kind) ? sourceOf(el.id) : null;
                            const isOpen = open.has(el.id);
                            const qs = qualities.get(el.id) ?? new Map<string, number>();
                            const scored = qs.size;
                            return (
                              <li key={el.id} className={styles.row} data-low={low || undefined} data-open={isOpen || undefined}>
                                <div className={styles.rowMain}>
                                  <button
                                    type="button"
                                    className={styles.rowToggle}
                                    aria-expanded={isOpen}
                                    aria-controls={`fb-item-${el.id}`}
                                    onClick={() => setOpen((prev) => toggle(prev, el.id))}
                                  >
                                    <ChevronDown size={16} aria-hidden className={styles.chevron} />
                                    <span className={styles.rowText}>
                                      <span className={styles.rowName}>{el.name}</span>
                                      <span className={styles.rowRole}>
                                        {el.role}
                                        {source && (
                                          <span className={styles.source} data-source={source} title="What this item was generated from">
                                            {SOURCE_LABELS[source]}
                                          </span>
                                        )}
                                        {scored > 0 && !isOpen && <span className={styles.scored}>{scored} qualities scored</span>}
                                      </span>
                                    </span>
                                  </button>
                                  <Scale label={`Overall rating for ${el.name}`} value={r} onPick={(n) => rate(el.id, n)} />
                                </div>
                                {isOpen && (
                                  <div id={`fb-item-${el.id}`} className={styles.itemBody}>
                                    <ul className={styles.qualities} aria-label={`Qualities of ${el.name}`}>
                                      {QUALITIES.map((q) => (
                                        <li key={q.id} className={styles.quality}>
                                          <span>{q.label}</span>
                                          <Scale small label={`${q.label} for ${el.name}`} value={qs.get(q.id)} onPick={(n) => rateQuality(el.id, q.id, n)} />
                                        </li>
                                      ))}
                                    </ul>
                                {issues.length > 0 && (
                                  <ul className={styles.checkIssues}>
                                    {issues.map((i, n) => (
                                      <li key={n}>
                                        <span className={styles.severity} data-severity={i.severity}>
                                          {i.severity}
                                        </span>
                                        Expected {i.expected}; saw {i.seen}.
                                      </li>
                                    ))}
                                  </ul>
                                )}
                                {low && (
                                  <div className={styles.detail}>
                                    <span className={styles.detailTitle}>What&rsquo;s wrong</span>
                                    <div className={styles.tags}>
                                      {ELEMENT_ISSUE_TAGS[el.kind].map((t) => (
                                        <button
                                          key={t}
                                          type="button"
                                          className={styles.tag}
                                          aria-pressed={picked.has(t)}
                                          onClick={() => setIssueTags((prev) => new Map(prev).set(el.id, toggle(picked, t)))}
                                        >
                                          {TAG_LABELS[t] ?? t}
                                        </button>
                                      ))}
                                    </div>
                                    <input
                                      className={styles.input}
                                      type="text"
                                      aria-label={`What's wrong with ${el.name}`}
                                      placeholder={`What's wrong with ${el.name.toLowerCase()}? (optional)`}
                                      maxLength={ELEMENT_NOTE_MAX}
                                      value={elementNotes.get(el.id) ?? ''}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        setElementNotes((prev) => new Map(prev).set(el.id, value));
                                      }}
                                    />
                                  </div>
                                )}
                                  </div>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    );
                  })}
                </section>

                <section className={styles.section} aria-labelledby="fb-strengths">
                  <h3 id="fb-strengths" className={styles.sectionTitle}>
                    <span className={styles.step}>3</span> Strengths <span className={styles.optional}>optional</span>
                  </h3>
                  <div className={styles.tags}>
                    {WORKING_TAGS.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        className={styles.tag}
                        data-tone="good"
                        aria-pressed={strengths.has(t.id)}
                        onClick={() => setStrengths((prev) => toggle(prev, t.id))}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </section>

                <section className={styles.section}>
                  <label className={styles.sectionTitle} htmlFor="fb-note">
                    <span className={styles.step}>4</span> Note <span className={styles.optional}>optional</span>
                  </label>
                  <textarea
                    id="fb-note"
                    className={styles.textarea}
                    value={note}
                    onChange={(e) => setNote(e.target.value.slice(0, NOTE_MAX))}
                    rows={3}
                    placeholder="Anything else worth recording about this image"
                  />
                  <span className={styles.counter}>
                    {note.length}/{NOTE_MAX}
                  </span>
                </section>

                {signIn ? (
                  <SignInPrompt onSignedIn={() => onSignedIn(handleSubmit)} description="Feedback is saved under your own sign-in." />
                ) : (
                  submit.isError && (
                    <p className={styles.error} role="alert">
                      Couldn&rsquo;t save this rating. {submit.error.message}
                    </p>
                  )
                )}
              </div>
            </div>

            <footer className={styles.actions}>
              <span className={styles.status}>{verdict ? `${VERDICT_LABELS[verdict]} · ${rated} of ${allElements.length} items rated` : 'Choose an overall rating to submit'}</span>
              <Button onPress={onClose}>Cancel</Button>
              <Button variant="primary" disabled={!verdict} loading={submit.isPending} onPress={handleSubmit}>
                {submit.isPending ? 'Saving…' : 'Submit rating'}
              </Button>
            </footer>
          </>
        )}
      </Dialog>
    </Modal>
  );
}
