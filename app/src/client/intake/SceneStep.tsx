import { ArrowRight } from 'lucide-react';
import { useEffect } from 'react';

import type { RuleEffects } from '../../api.ts';
import { SCENE_LIMITS, limitScene, type Selections } from '../../shared/spec.ts';
import type { Decision, SceneSpec, SurfaceChoice } from '../../shared/types.ts';
import { Alert } from '../ui/Alert.tsx';
import { Button } from '../ui/Button.tsx';
import { SegmentedControl } from '../ui/SegmentedControl.tsx';
import { Select } from '../ui/Select.tsx';
import { Switch } from '../ui/Switch.tsx';
import { TextArea } from '../ui/TextArea.tsx';
import { DEFAULT_POSE, POSES, poseById } from '../../shared/poses.ts';
import { VENUE_TYPES, venueType } from '../../shared/venues.ts';
import { TIME_LABELS, type Brief } from './types.ts';
import noteStyles from './DecisionStep.module.css';
import styles from './SceneStep.module.css';
import { StepActions } from './StepActions.tsx';

type Scene = NonNullable<Selections['scene']>;

const VENUE_OPTIONS: Array<{ value: Scene['venue']; label: string }> = [
  { value: 'home', label: 'At home' },
  { value: 'restaurant', label: 'At a restaurant' },
  { value: 'on-the-go', label: 'On the go' },
];

const SETTING_OPTIONS: Array<{ value: Scene['setting']; label: string }> = [
  { value: 'indoor', label: 'Indoor' },
  { value: 'outdoor', label: 'Outdoor' },
];

// Where the two seated people sit (Fernando, 2026-10-27): the corner, or facing each other over a shoulder.
const SEATING_OPTIONS: Array<{ value: 'corner' | 'across'; label: string }> = [
  { value: 'corner', label: 'Around a corner' },
  { value: 'across', label: 'Over the shoulder' },
];

// One person at the table (Fernando, 2026-10-27): across the table, face cropped, or only their hands.
const SOLO_OPTIONS: Array<{ value: 'facing' | 'hands'; label: string }> = [
  { value: 'facing', label: 'Across the table' },
  { value: 'hands', label: 'Hands only' },
];

// Place settings, not people: nobody sits at the table unless People at the table is on.
// Group and family layouts aren't built yet, so they stay hidden (UX review, 2026-11-11).
const PARTY_OPTIONS: Array<{ value: Scene['party']; label: string }> = [
  { value: '1', label: 'For one' },
  { value: '2', label: 'For two' },
];

const ANY_PLACE = 'any';

const ON_THE_GO_SURFACES: Array<{ id: string; label: string }> = [
  { id: 'picnic-table', label: 'Picnic table' },
  { id: 'park-table', label: 'Small outdoor table' },
  { id: 'counter-top', label: 'Counter or high table' },
  { id: 'food-truck-counter', label: 'Food-truck counter' },
  { id: 'street-ledge', label: 'Wide street ledge' },
];

const ENVIRONMENT_EXAMPLES: Record<Scene['venue'], string> = {
  home: 'e.g. Sunlit tiled kitchen, plants on the windowsill, open shelves with mismatched mugs',
  restaurant: 'e.g. Neighborhood spot with painted blue walls, metal chairs and string lights',
  'on-the-go': 'e.g. Shaded park table beside a fountain, low city buildings behind',
};

const TIME_OPTIONS: Array<NonNullable<Scene['time']>> = ['morning', 'midday', 'golden-hour', 'evening'];

export function SceneStep({
  brief,
  sel,
  rules,
  clearsNote,
  surfaceDecision,
  onSurfaceDecision,
  onScene,
  onPlace,
  onGlass,
  onNext,
}: {
  brief: Brief;
  sel: Selections;
  rules: RuleEffects | null;
  clearsNote: string | null;
  surfaceDecision: Decision<SurfaceChoice> | null;
  onSurfaceDecision: (d: Decision<SurfaceChoice>) => void;
  onScene: (s: Scene) => void;
  onPlace: (patch: { venueType?: string | undefined; environmentNote?: string | undefined }) => void;
  onGlass: (g: boolean) => void;
  onNext: () => void;
}) {
  // Held to what this build offers, so a saved project that picked two people opens as one.
  const scene: Scene = limitScene(
    sel.scene ?? {
      setting: 'indoor',
      venue: 'home',
      party: '1',
    }
  );
  const time: SceneSpec['scene']['time'] | undefined = scene.time ?? rules?.timeFromOccasion ?? undefined;
  const venueRule = rules?.venues.find((v) => v.venue === scene.venue);
  const update = (patch: Partial<Scene>) => {
    const next: Scene = { ...scene, ...patch };
    if (next.venue === 'on-the-go') next.setting = 'outdoor';
    if (patch.venue && patch.venue !== 'on-the-go') {
      delete next.surface;
      delete next.surfaceText;
    }
    // Kinds of place belong to one venue.
    if (patch.venue && patch.venue !== scene.venue) delete next.venueType;
    onScene(next);
  };

  useEffect(() => {
    if (!sel.scene) onScene({ ...scene, time: rules?.timeFromOccasion ?? undefined });
    // Only seed once, when the step is first reached.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const solo = scene.party === '1';

  return (
    <section className={clearsNote ? noteStyles.withNote : undefined}>
      <h1>Time &amp; Place</h1>
      <p>
        Let&rsquo;s set the scene.
        <br />
        Define time of day, and whether we are at home, dining out or on the go.
      </p>
      {clearsNote && (
        <Alert tone="warning" title="Changing this clears later choices" className={noteStyles.sideNote}>
          Changing the venue, kind of place or party clears {clearsNote} you already chose. The time, setting and surface only
          redo the layout.
        </Alert>
      )}

      <div className={styles.field}>
        <SegmentedControl
          label="Venue"
          value={scene.venue}
          onChange={(v) => update({ venue: v as Scene['venue'] })}
          options={VENUE_OPTIONS.map((o) => ({
            ...o,
            disabled: rules?.venues.find((x) => x.venue === o.value)?.allowed === false,
          }))}
        />
        {rules?.venues.some((v) => !v.allowed) && (
          <div className={styles.hint}>1 L and up SKUs are shared bottles and appear only at home.</div>
        )}
      </div>

      <div className={styles.placeRow}>
        <Select
          label="Kind of place"
          value={venueType(scene.venue, scene.venueType)?.id ?? ANY_PLACE}
          onChange={(v) => onPlace({ venueType: v === ANY_PLACE ? undefined : v })}
          options={[
            { id: ANY_PLACE, label: 'Any — the agent decides' },
            ...VENUE_TYPES[scene.venue].map((t) => ({
              id: t.id,
              label: t.label,
            })),
          ]}
          disabled={!sel.scene}
        />
        <TextArea
          label="Describe the environment (optional)"
          value={scene.environmentNote ?? ''}
          onChange={(v) => onPlace({ environmentNote: v })}
          placeholder={ENVIRONMENT_EXAMPLES[scene.venue]}
          rows={2}
          disabled={!sel.scene}
        />
        <div className={styles.hint}>
          The story builds the background from these. Leave both empty to let the agent pick a typical place.
        </div>
      </div>

      <div className={styles.field}>
        <SegmentedControl
          label="Setting"
          value={scene.setting}
          onChange={(v) => update({ setting: v as Scene['setting'] })}
          options={SETTING_OPTIONS.map((o) => ({
            ...o,
            disabled: scene.venue === 'on-the-go' && o.value === 'indoor',
          }))}
        />
      </div>

      {SCENE_LIMITS.seatedPeople && (
        <div className={styles.field}>
          <span className={styles.fieldLabel}>People at the table</span>
          <Switch isSelected={!!scene.seated} onChange={(seated) => update(seated ? { seated } : { seated: false })}>
            {scene.seated
              ? solo
                ? 'Yes, one person sits at the table'
                : 'Yes, two people sit at the table'
              : 'No, the table is set but nobody sits at it'}
          </Switch>
          <div className={styles.hint}>
            {scene.seated
              ? solo
                ? scene.solo === 'hands'
                  ? 'Only their hand and forearm reach into the frame for their drink; the rest of them stays out of the picture. You describe who they are and what they wear on Review the Sketch.'
                  : 'They sit across the table facing the camera, their face cropped by the top of the frame. You describe who they are and what they wear on Review the Sketch.'
                : scene.seating === 'across'
                  ? 'They face each other across the table, seen over the first person\'s shoulder. Pick their moment below; you describe who they are and what they wear on Review the Sketch.'
                  : 'They sit at a corner of the table, at a right angle to each other. Pick their moment below; you describe who they are and what they wear on Review the Sketch.'
              : 'The place settings show who the meal is for; nobody appears at the table.'}
          </div>
        </div>
      )}

      <div className={styles.field}>
        <SegmentedControl
          label="Place settings"
          value={scene.party === '2' ? '2' : '1'}
          onChange={(v) => update({ party: v as Scene['party'] })}
          options={PARTY_OPTIONS.map((o) => ({
            ...o,
            disabled: o.value === '2' && !SCENE_LIMITS.twoDiners,
          }))}
        />
        <div className={styles.hint}>How many places are set at the table. Nobody sits at it; the place settings show who the meal is for.</div>
      </div>

      {scene.seated && solo && (
        <div className={`${styles.field} ${styles.poseField}`}>
          <SegmentedControl
            label="View"
            value={scene.solo ?? 'facing'}
            onChange={(v) => update({ solo: v === 'hands' ? 'hands' : undefined })}
            options={SOLO_OPTIONS}
          />
          <figure className={styles.pose}>
            <img src={`/poses/solo/${scene.solo === 'hands' ? 'hands' : 'facing'}.png`} alt="Layout preview: one person at the table" width={480} height={270} />
            <figcaption className={styles.hint}>
              {scene.solo === 'hands'
                ? 'A hand reaches in to set their Coca-Cola down beside the plate, label to the camera.'
                : 'Reaching into their food with one hand, the other around their Coca-Cola: a glass for a large bottle, the bottle or can itself for a small one.'}
            </figcaption>
          </figure>
        </div>
      )}

      {scene.seated && !solo && (
        <div className={styles.field}>
          <SegmentedControl
            label="Seating"
            value={scene.seating ?? 'corner'}
            onChange={(v) => update({ seating: v === 'across' ? 'across' : undefined })}
            options={SEATING_OPTIONS}
          />
        </div>
      )}

      {scene.seated && !solo && (
        <div className={`${styles.field} ${styles.poseField}`}>
          <Select
            label="Moment"
            value={poseById(scene.pose).id}
            onChange={(pose) => update({ pose })}
            options={POSES.map((p) => ({ id: p.id, label: p.label }))}
          />
          <figure className={styles.pose}>
            <img src={`/poses/${scene.seating === 'across' ? 'across/' : ''}${poseById(scene.pose ?? DEFAULT_POSE).id}.png`} alt={`Layout preview: ${poseById(scene.pose).label}`} width={480} height={270} />
            <figcaption className={styles.hint}>{poseById(scene.pose).detail} At least one person always holds their Coca-Cola: a glass for a large bottle, the bottle or can itself for a small one.</figcaption>
          </figure>
        </div>
      )}

      <div className={styles.field}>
        <label className={styles.fieldLabel}>
          Time of day
        </label>
        <SegmentedControl
          aria-label="Time of day"
          value={time ?? null}
          onChange={(v) => update({ time: v as Scene['time'] })}
          options={TIME_OPTIONS.map((t) => ({
            value: t,
            label: TIME_LABELS[t] ?? t,
          }))}
        />
      </div>

      {scene.venue === 'on-the-go' && (
        // A fixed list, set from the kind of place: picking On the go no longer waits on the
        // cultural agent, the same as home and restaurant (Fernando, 2026-11-11).
        <div className={styles.field}>
          <Select
            label="Dining surface"
            value={scene.surface ?? venueType('on-the-go', scene.venueType)?.surface ?? 'picnic-table'}
            onChange={(surface) => update({ surface: surface as Scene['surface'], surfaceText: undefined })}
            options={ON_THE_GO_SURFACES}
          />
          <div className={styles.hint}>The food always sits on a table-like surface, never in a hand.</div>
        </div>
      )}

      <div className={styles.field}>
        <label className={styles.fieldLabel}>Branded glass</label>
        {venueRule?.glass === 'never' && <div className={styles.hint}>No glass on the go.</div>}
        {venueRule?.glass === 'required' && (
          <div className={styles.hint}>
            This SKU is a shared bottle (1 L and up), so every place setting gets a branded bell-shaped glass.
          </div>
        )}
        {venueRule?.glass === 'optional' && (
          <SegmentedControl
            aria-label="Branded glass"
            value={sel.glass ? 'yes' : 'no'}
            onChange={(v) => onGlass(v === 'yes')}
            options={[
              { value: 'yes', label: 'Yes, add a glass' },
              { value: 'no', label: 'No glass' },
            ]}
          />
        )}
      </div>

      <StepActions>
        <Button variant="primary" iconEnd={<ArrowRight size={16} aria-hidden />} disabled={!sel.scene} onPress={onNext}>
          Continue
        </Button>
      </StepActions>
    </section>
  );
}
