// Tablescape & Camera (Fernando, 2026-11-12): the table is laid out first and the camera is
// picked on the same page. The recommended arrangement is taken for the operator and drawn
// large from the selected angle, beside the Layouts panel and as tall as it. The angle cards
// under it carry no picture (2026-11-13): tapping one shows the table from there in the large
// drawing, so every angle is seen there before Continue. Re-arrange opens the editor.
// Sketch Review then draws it.

import { ArrowRight, Lightbulb, Move } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import type { RuleEffects } from '../../api.ts';
import { reframe, type Reframe } from '../../shared/reframe.ts';
import { recommendAngle } from '../../shared/rules.ts';
import type { Selections } from '../../shared/spec.ts';
import type { AccentChoice, Blueprint, Decision } from '../../shared/types.ts';
import { renderSketch } from '../lib/renderProxy.ts';
import { trpc } from '../trpc.ts';
import { Alert } from '../ui/Alert.tsx';
import { Button } from '../ui/Button.tsx';
import { SkeletonBlock } from '../ui/Skeleton.tsx';
import { AnglePicker, type AngleView } from './AnglePicker.tsx';
import { ArrangementBar } from './ArrangementBar.tsx';
import cameraStyles from './CameraStep.module.css';
import { PrepareLayout } from './LayoutStep.tsx';
import { SketchEditor } from './SketchEditor.tsx';
import { StepActions } from './StepActions.tsx';
import styles from './ReviewStep.module.css';
import tableStyles from './TableStep.module.css';
import type { Brief, ComposeResult } from './types.ts';

/** Share of the editor's picture the camera frame takes, so the table around it shows too. */
export const TABLE_OVERSCAN = 0.6;

type Camera = NonNullable<Selections['camera']>;

export function TableStep({
  brief,
  sel,
  rules,
  accentDecision,
  onAccentDecision,
  onAccent,
  onNapkin,
  compose,
  picked,
  onCompose,
  onPick,
  onBackToSides,
  onWorkingLayout,
  onNext,
}: {
  brief: Brief;
  sel: Selections;
  rules: RuleEffects | null;
  accentDecision: Decision<AccentChoice> | null;
  onAccentDecision: (d: Decision<AccentChoice>) => void;
  onAccent: (v: AccentChoice | null) => void;
  onNapkin: () => void;
  compose: ComposeResult | null;
  picked: number | null;
  onCompose: (c: ComposeResult) => void;
  onPick: (i: number) => void;
  onBackToSides: () => void;
  /** The table as the operator left it, seen from `camera` (moved items, a new angle, or both). */
  onWorkingLayout: (bp: Blueprint, camera: Camera) => void;
  onNext: () => void;
}) {
  const config = trpc.config.useQuery();
  const option = compose && picked !== null ? compose.options[picked] : undefined;
  const bp = option?.blueprint;
  const spec = compose?.spec;
  const lighting = compose?.lighting;
  const [editOpen, setEditOpen] = useState(false);

  const angleIds = config.data?.angles.map((a) => a.id).join(',') ?? '';
  // The same table from every angle: the items stay put, only the camera moves.
  const frames = useMemo(() => {
    if (!bp || !spec || !angleIds) return null;
    return Object.fromEntries(angleIds.split(',').map((id) => [id, reframe(spec, bp, id)])) as Record<string, Reframe>;
  }, [bp, spec, angleIds]);

  const rec = recommendAngle({ dish: brief.heroDish, prep: sel.prep, plating: sel.plating });
  const recAngle = rec && config.data?.angles.find((a) => a.id === rec.angle);
  const fallback = config.data ? { ...config.data.defaults, angle: recAngle ? recAngle.id : config.data.defaults.angle } : null;
  const cam: Camera | null = sel.camera ?? fallback;
  const current = cam ? frames?.[cam.angle] : undefined;
  // The big drawing: the table from the selected angle (the layout itself when it's already seen from there).
  const shown = current?.ok ? current.blueprint : bp;

  const [big, setBig] = useState<string | null>(null);
  useEffect(() => {
    setBig(null);
    if (!shown || !lighting) return;
    const raf = requestAnimationFrame(() => setBig(renderSketch(shown, lighting, { width: 1280 }).url));
    return () => cancelAnimationFrame(raf);
  }, [shown, lighting]);

  if (!compose || !option || !bp || !lighting) {
    return (
      <PrepareLayout
        brief={brief}
        sel={sel}
        rules={rules}
        accentDecision={accentDecision}
        onAccentDecision={onAccentDecision}
        onAccent={onAccent}
        onNapkin={onNapkin}
        compose={compose}
        onCompose={onCompose}
        onPick={onPick}
        onBackToSides={onBackToSides}
        title="Tablescape & Camera"
        lede="Laying out the table with the recommended arrangement. Once it's ready you can see it from each camera angle and re-arrange anything."
      />
    );
  }

  const cfg = config.data;
  const selectedLook = cfg && cam ? cfg.looks.find((l) => l.id === cam.look) : undefined;
  const views: Record<string, AngleView> | undefined = frames
    ? Object.fromEntries(
        Object.entries(frames).map(([id, f]) => [id, f.ok ? { url: null, problems: f.problems.map((p) => p.text) } : { url: null, unavailable: f.reason }]),
      )
    : undefined;

  const pick = (angle: string) => {
    const f = frames?.[angle];
    if (cam && f?.ok) onWorkingLayout(f.blueprint, { ...cam, angle });
  };
  /** The table at the selected angle, if it isn't already seen from there (after a reset, or an older draft). */
  const applyCurrent = () => {
    if (cam && current?.ok && current.blueprint !== bp && current.blueprint.camera.pitchDeg !== bp.camera.pitchDeg) onWorkingLayout(current.blueprint, cam);
  };

  return (
    <section>
      <h1>Tablescape &amp; Camera</h1>
      <p className={styles.lede}>
        The recommended arrangement for your dish, sides and drink, drawn from the selected camera angle. Tap an angle below to see the same table
        from there: only the camera moves. Use Re-arrange to move anything or take it off the table.
      </p>

      <div className={tableStyles.top}>
        <div className={`${styles.frame} ${tableStyles.frame}`}>
          {big ? <img className={styles.sketch} src={big} alt="Line drawing of the table from the selected camera angle" /> : <SkeletonBlock height="100%" />}
          <button type="button" className={tableStyles.rearrange} onClick={() => setEditOpen(true)}>
            <Move size={14} aria-hidden />
            Re-arrange
          </button>
        </div>
        {/* As tall as the drawing: the panel scrolls inside rather than stretching the row. */}
        <div className={tableStyles.barCell}>
          <ArrangementBar
            brief={brief}
            sel={sel}
            rules={rules}
            accentDecision={accentDecision}
            onAccentDecision={onAccentDecision}
            compose={compose}
            picked={picked!}
            onPick={onPick}
            hasSketch={() => false}
            onAccent={onAccent}
            onNapkin={onNapkin}
            drawing={false}
            stage="table"
          />
        </div>
      </div>

      <div className={tableStyles.below}>
        {current?.ok && current.problems.length > 0 && (
          <Alert tone="warning" title="Something needs fixing from this angle">
            <ul className={cameraStyles.problems}>
              {current.problems.map((p, i) => (
                <li key={i}>{p.text}</li>
              ))}
            </ul>
            <p className={cameraStyles.problemsHint}>Re-arrange it, take it off the table, or pick another angle.</p>
          </Alert>
        )}

        {cfg && cam && (
          <div className={tableStyles.angles}>
            <AnglePicker
              aria-label="Camera angle"
              lookId={cam.look}
              lookLabel={selectedLook?.label ?? ''}
              focalMm={selectedLook?.focalMm}
              value={cam.angle}
              onChange={pick}
              options={cfg.angles.map((a) => ({ id: a.id, label: a.label, pitchDeg: a.pitchDeg }))}
              recommendedId={recAngle?.id}
              views={views}
              media={false}
            />
            {rec && recAngle && (
              <p className={`${cameraStyles.recommendation} ${tableStyles.recommendation}`}>
                <Lightbulb size={16} aria-hidden className={cameraStyles.recommendationIcon} />
                <span>
                  <strong>
                    Recommended for {brief.heroDish || 'this dish'}: {recAngle.label.replace(/\s*\(default\)$/, '')}.
                  </strong>{' '}
                  {rec.reason}
                </span>
              </p>
            )}
          </div>
        )}
        {sel.scene?.seated && sel.scene.seating === 'across' && cam?.angle === 'low' && (
          <p className={styles.detailText}>
            Over the shoulder doesn't fit from Low: the food ends up mid-frame above the table's legs. Pick Diner's eye or Looking down.
          </p>
        )}
      </div>

      {shown && cam && (
        <SketchEditor
          isOpen={editOpen}
          onClose={() => setEditOpen(false)}
          blueprint={shown}
          spec={compose.spec}
          lighting={lighting}
          sourceName="the recommended layout"
          overscan={TABLE_OVERSCAN}
          focus={current?.ok ? current.problems.find((p) => p.id)?.id : undefined}
          title="Re-arrange"
          lede="Your table from this angle. The red box is the camera's frame; the dimmed table around it is outside the shot. Drag an item to move it: it lands on the nearest spot with room for it. Select an item and press Delete to take it off the table. Drag the empty table to slide the frame. The Coca-Cola product and the main dish stay in every scene."
          saveLabel="Save"
          note="Nothing is drawn yet, so saving is free."
          onSave={(next) => {
            setEditOpen(false);
            onWorkingLayout(next, cam);
          }}
        />
      )}

      <StepActions>
        <Button
          variant="primary"
          iconEnd={<ArrowRight size={16} aria-hidden />}
          onPress={() => {
            applyCurrent();
            onNext();
          }}
        >
          Continue
        </Button>
      </StepActions>
    </section>
  );
}
