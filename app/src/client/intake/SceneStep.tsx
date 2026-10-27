import { ArrowRight } from 'lucide-react';
import { useEffect } from 'react';

import type { RuleEffects } from '../../api.ts';
import { SCENE_LIMITS, limitScene, type Selections } from '../../shared/spec.ts';
import type { Decision, SceneSpec, SurfaceChoice } from '../../shared/types.ts';
import { useAgentTask } from '../lib/useAgentTask.ts';
import { useOnSignedIn } from '../lib/useOnSignedIn.ts';
import { Alert } from '../ui/Alert.tsx';
import { Button } from '../ui/Button.tsx';
import { ChoiceCardGroup, splitSources } from '../ui/ChoiceCard.tsx';
import { SegmentedControl } from '../ui/SegmentedControl.tsx';
import { Select } from '../ui/Select.tsx';
import { Switch } from '../ui/Switch.tsx';
import { TextArea } from '../ui/TextArea.tsx';
import { DEFAULT_POSE, POSES, poseById } from '../../shared/poses.ts';
import { VENUE_TYPES, venueType } from '../../shared/venues.ts';
import { AgentStatus } from './AgentStatus.tsx';
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

const PARTY_OPTIONS: Array<{ value: Scene['party']; label: string }> = [
  { value: '1', label: '1 person' },
  { value: '2', label: '2 people' },
  { value: 'group', label: 'Group' },
  { value: 'family', label: 'Family' },
];

const ANY_PLACE = 'any';

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
  const surfaceTask = useAgentTask('surface');
  const onSignedIn = useOnSignedIn();

  const loadSurface = () => surfaceTask.run({ brief, selections: sel });

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

  useEffect(() => {
    if (scene.venue === 'on-the-go' && !surfaceDecision) loadSurface();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene.venue]);

  useEffect(() => {
    if (surfaceTask.result?.kind === 'surface') onSurfaceDecision(surfaceTask.result.decision);
    // Apply each answer once: the parent passes a new callback on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surfaceTask.result]);

  useEffect(() => {
    if (surfaceDecision?.status === 'resolved' && !scene.surface) {
      const v = surfaceDecision.options[0]!.value;
      update({ surface: v.surface, surfaceText: v.promptText });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surfaceDecision]);

  const needSurface = scene.venue === 'on-the-go' && !scene.surface;

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
          <Switch isSelected={!!scene.seated} onChange={(seated) => update(seated ? { seated, party: '2' } : { seated: false })}>
            {scene.seated ? 'Yes, two people sit at the table' : 'No, the table is set but nobody sits at it'}
          </Switch>
          <div className={styles.hint}>
            {scene.seated
              ? scene.seating === 'across'
                ? 'They face each other across the table, seen over the first person\'s shoulder. Pick their pose below; you describe who they are and what they wear on Review the Sketch.'
                : 'They sit at a corner of the table, at a right angle to each other. Pick their pose below; you describe who they are and what they wear on Review the Sketch.'
              : 'The place settings show who the meal is for; nobody appears at the table.'}
          </div>
        </div>
      )}

      {scene.seated && (
        <div className={styles.field}>
          <SegmentedControl
            label="Seating"
            value={scene.seating ?? 'corner'}
            onChange={(v) => update({ seating: v === 'across' ? 'across' : undefined })}
            options={SEATING_OPTIONS}
          />
        </div>
      )}

      {scene.seated && (
        <div className={`${styles.field} ${styles.poseField}`}>
          <Select
            label="Pose"
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
        <SegmentedControl
          label="People"
          value={scene.party}
          onChange={(v) => update({ party: v as Scene['party'] })}
          options={PARTY_OPTIONS.map((o) => ({
            ...o,
            // Group and family layouts aren't built yet; two people are off on main (SCENE_LIMITS), and seated people come as a pair.
            disabled: o.value === 'group' || o.value === 'family' || (o.value === '2' && !SCENE_LIMITS.twoDiners) || (!!scene.seated && o.value === '1'),
          }))}
        />
        <div className={styles.hint}>
          {scene.seated
            ? 'One seated person, groups and families come in a future build.'
            : SCENE_LIMITS.twoDiners
              ? 'Group and family layouts come in a future build.'
              : 'Every scene is set for one person for now; two people, groups and families come in a future build.'}
        </div>
      </div>

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
        <div className={styles.field}>
          <label className={styles.fieldLabel}>Dining surface</label>
          <AgentStatus
            status={surfaceTask.status}
            timing={surfaceTask.timing}
            agentError={surfaceTask.agentError}
            trpcError={surfaceTask.trpcError}
            workingLabel="The cultural agent is picking a surface"
            overlay
            onSignedIn={() => onSignedIn(loadSurface)}
            onRetry={loadSurface}
            skeletonCards={3}
            skeletonLayout="list"
          />
          {surfaceDecision && (
            <ChoiceCardGroup
              layout="list"
              aria-label="Dining surface"
              // Keyed by option id: several suggestions can share one surface type (a stool and a ledge are both "ledge").
              value={
                surfaceDecision.options.find((x) => x.value.surface === scene.surface && x.value.promptText === scene.surfaceText)?.id ??
                surfaceDecision.options.find((x) => x.value.surface === scene.surface)?.id ??
                null
              }
              onChange={(id) => {
                const o = surfaceDecision.options.find((x) => x.id === id);
                if (o)
                  update({
                    surface: o.value.surface,
                    surfaceText: o.value.promptText,
                  });
              }}
              options={surfaceDecision.options.map((o) => ({
                id: o.id,
                value: o.id,
                label: o.value.label,
                summary: o.value.detail,
                details: {
                  facts: [{ label: 'In the image', value: o.value.promptText }],
                  ...splitSources(o.rationale),
                },
                badge: surfaceDecision.options.length > 1 && o.suggested ? 'Suggested' : undefined,
              }))}
            />
          )}
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
        <Button variant="primary" iconEnd={<ArrowRight size={16} aria-hidden />} disabled={!sel.scene || needSurface} onPress={onNext}>
          Continue
        </Button>
      </StepActions>
    </section>
  );
}
